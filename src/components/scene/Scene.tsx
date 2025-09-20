/* --------------------------------------------------------------------------
   Scene.tsx – renders either the beat-visualizer OR the home scene,
   never both. Beat view is active only when activeRoute === "beats-visualizer".
--------------------------------------------------------------------------- */
"use client";

import BeatAudioVisualizerScene from "@/components/scene/BeatAudioVisualizerScene";
import { Route, useRouteStore } from "@/store/useRouteStore";
import { a, useSpring } from "@react-spring/three";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import EnvironmentLights from "../effects/EnvironmentLights";
import AntiheroScene from "../models/AntiherosScene";

const AnimatedGroup = a("group");

/* ------------------------- Types ------------------------- */
export type SceneProps = React.ComponentPropsWithoutRef<"group"> & {
  onLoaded?: () => void;
  isMobile?: boolean;
  onSelectRoute: (route: Route) => void;
  activeRoute: Route;
  onBeatGoBack?: () => void;
  onBeatShuffle?: () => void;
  hoveredRoute?: Route | null;
  environmentMode?: "day" | "night";
};

/* ---------------- Helper: scale-in wrapper --------------- */
function AnimatedScale({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) groupRef.current.scale.set(visible ? 0 : 1, visible ? 0 : 1, visible ? 0 : 1);
  }, [visible]);
  useFrame((_, delta) => {
    if (groupRef.current) {
      const cur = groupRef.current.scale.x;
      const tgt = visible ? 1 : 0;
      const lerp = THREE.MathUtils.lerp(cur, tgt, delta * 3);
      groupRef.current.scale.set(lerp, lerp, lerp);
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

/* ----------------- Fancy emissive sphere ----------------- */
type TransmissiveSphereProps = { sphereRef: React.MutableRefObject<THREE.Mesh | null> };
function TransmissiveSphere({ sphereRef }: TransmissiveSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.position.y = 80 + Math.sin(state.clock.elapsedTime) * 2;
  });
  return (
    <group ref={groupRef} position={[0, 150, 200]}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[30, 64, 64]} />
        <meshPhysicalMaterial
          emissive="#ffdd33"
          emissiveIntensity={5}
          transmission={1}
          roughness={0}
          metalness={0}
          clearcoat={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight intensity={6} distance={80} color="#ffdd33" />
      {[...Array(3)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[10 + (i + 1) * 2, 64, 64]} />
          <meshBasicMaterial
            color="#ffdd33"
            opacity={0.2 / (i + 1)}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------- Particles ----------------------- */
function EnvironmentParticles({ isMobile = false }: { isMobile?: boolean }) {
  const s = (m: boolean, full: number) => (m ? full * 0.4 : full);
  return (
    <group>
      <Sparkles count={s(isMobile, 250)} scale={[300, 300, 300]} size={20} speed={0.5} color="#4b0082" />
      <Sparkles count={s(isMobile, 250)} scale={[300, 300, 300]} size={20} speed={0.5} color="yellow" />
      <Sparkles count={s(isMobile, 150)} scale={[300, 300, 300]} size={20} speed={0.5} color="#00008B" />
      <Sparkles count={s(isMobile, 100)} scale={[300, 300, 300]} size={20} speed={0.5} color="red" />
    </group>
  );
}

/* ====================================================================== */
/*                                MAIN                                   */
/* ====================================================================== */
export default function Scene({
  onLoaded,
  onSelectRoute,
  activeRoute,
  onBeatGoBack,
  onBeatShuffle,
  isMobile = false,
  hoveredRoute = null,
  environmentMode = "night",
  ...props
}: SceneProps) {
  const { camera, scene } = useThree();
  const audioUrlForBeat = useRouteStore((s) => s.audioUrlForBeat);

  /* which branch? */
  const showVisualizer = activeRoute === "beats-visualizer";
  const showHomeScene  = !showVisualizer && activeRoute === "home";
  /* base distances */
  const baseMax = isMobile ? 18 : 20;
  const baseMin = isMobile ?  8 : 10;

  /* bump factors when the visualizer is active */
  const maxDistance = showVisualizer ? (isMobile ? baseMax * 10 : baseMax * 5) : baseMax;
  const minDistance = showVisualizer ? (isMobile ? baseMin / 1.5 : baseMin / 3) : baseMin;
  const zoomSpeed   = showVisualizer ? 2 * 3 : 2;    // original 2  →  6

  /* ---------------- Camera intro pan ---------------- */
  const animationDoneRef = useRef(false);
  const elapsedRef       = useRef(0);
  const sphereRef        = useRef<THREE.Mesh | null>(null);

  const [scaleFactor, setScaleFactor] = useState(1);
  const { scale } = useSpring({ scale: scaleFactor, config: { tension: 170, friction: 26 } });

  useEffect(() => {
    const handle = () => setScaleFactor(window.innerWidth < 768 ? 0.65 : window.innerWidth < 1024 ? 0.85 : 1);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* initial/target cam positions */
  const initialPos = useMemo(() => new THREE.Vector3(0, 50, 20), []);
  const targetPos  = useMemo(() => new THREE.Vector3(0, 0, 10), []);
  const panTime    = 2;

  /* reset camera when home scene re-enabled */
  useEffect(() => {
    if (showHomeScene) {
      camera.position.copy(initialPos);
      camera.lookAt(0, 0, 0);
      animationDoneRef.current = false;
      elapsedRef.current = 0;
    }
  }, [camera, showHomeScene, initialPos]);

  useFrame((_, dt) => {
    if (!showHomeScene || animationDoneRef.current) return;
    elapsedRef.current += dt;
    if (elapsedRef.current >= panTime) {
      camera.position.copy(targetPos);
      camera.lookAt(0, 0, 0);
      animationDoneRef.current = true;
      onLoaded?.();
    } else {
      camera.position.lerpVectors(initialPos, targetPos, elapsedRef.current / panTime);
      camera.lookAt(0, 0, 0);
    }
  });

  /* Fog colour per environment */
  scene.fog = new THREE.FogExp2(environmentMode === "day" ? "#ffffff" : "#000000", 0.0015);


  /* ------- put this just above the return so we can reuse the values -------- */


  /* ---------------- JSX ---------------- */
  return (
    <group {...props}>
      {/* Lights & HDRI */}
      <EnvironmentLights />
      <directionalLight position={[50, 80, 60]} intensity={environmentMode === "day" ? 1.6 : 1.0} color="#ffffff" castShadow />
      <directionalLight position={[-60, 40, -40]} intensity={environmentMode === "day" ? 0.8 : 0.5} color="#a0c8ff" />
      <directionalLight position={[-30, 70, 100]} intensity={environmentMode === "day" ? 0.9 : 0.7} color="#ffddb1" />
      <hemisphereLight  color={environmentMode === "day" ? "#ffffe0" : "#222244"}
                        groundColor={environmentMode === "day" ? "#ffffff" : "#000000"}
                        intensity={environmentMode === "day" ? 0.6 : 0.35} />
      <ambientLight intensity={environmentMode === "day" ? 0.6 : 0.4} />

      {/* Decorative sphere & particles (home only) */}
      {showHomeScene && (
        <>
          <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
            <TransmissiveSphere sphereRef={sphereRef} />
          </AnimatedGroup>
          <group position={[0, 100, 0]}>
            <EnvironmentParticles isMobile={isMobile} />
          </group>
        </>
      )}

      {/* ------------- Route-specific content ------------- */}
      {showVisualizer ? (
        <BeatAudioVisualizerScene
          audioUrl={audioUrlForBeat}
          onGoBack={onBeatGoBack || (() => onSelectRoute("beats"))}
          onShuffle={onBeatShuffle || (() => console.log("Shuffle beat"))}
        />
      ) : showHomeScene ? (
        <AnimatedScale visible={true}>
          <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
            <AntiheroScene
              hoveredRoute={
                hoveredRoute === "home" || hoveredRoute === "beats-visualizer"
                  ? null
                  : hoveredRoute
              }
              showVisualizer={false}
            />
          </AnimatedGroup>
        </AnimatedScale>
      ) : null /* nothing extra for other routes */ }

      {/* OrbitControls for debugging / free-look */}
<OrbitControls
  autoRotate
  autoRotateSpeed={0.15}
  zoomSpeed={zoomSpeed}
  maxDistance={maxDistance}
  minDistance={minDistance}
  minPolarAngle={0}
  maxPolarAngle={Math.PI / 2}
/>
    </group>
  );
}
