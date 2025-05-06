"use client";

import BeatAudioVisualizerScene from "@/components/scene/BeatAudioVisualizerScene";
import { useVisualizer } from "@/context/VisualizerContext";
import { Route, useRouteStore } from "@/store/useRouteStore";
import { a, useSpring } from "@react-spring/three";
import {
  OrbitControls,
  Sparkles,
} from "@react-three/drei";

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import EnvironmentLights from "../effects/EnvironmentLights";
import AntiheroScene from "../models/AntiherosScene";

const AnimatedGroup = a("group");

export type SceneProps = React.ComponentPropsWithoutRef<"group"> & {
  onLoaded?: () => void;
  isMobile?: boolean;
  onSelectRoute: (route: Route) => void;
  specialEffect?: boolean;
  activeRoute: Route;
  visualizerMode?: boolean;
  onBeatGoBack?: () => void;
  onBeatShuffle?: () => void;
  hoveredRoute?: Route | null;
  environmentMode?: "day" | "night";
};

/* ---------------- helper components (unchanged) ---------------- */
function AnimatedScale({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(visible ? 0 : 1, visible ? 0 : 1, visible ? 0 : 1);
    }
  }, [visible]);
  useFrame((_, delta) => {
    if (groupRef.current) {
      const currentScale = groupRef.current.scale.x;
      const target = visible ? 1 : 0;
      const newScale = THREE.MathUtils.lerp(currentScale, target, delta * 3);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });
  return <group ref={groupRef}>{children}</group>;
}


/* ------------- your emissive/transmissive spheres (unchanged) ------------- */
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



function EnvironmentParticles({ isMobile = false }: { isMobile?: boolean }) {
  const sparkleCount1 = isMobile ? 100 : 250;
  const sparkleCount2 = isMobile ? 100 : 250;
  const sparkleCount3 = isMobile ? 50 : 150;
  const sparkleCount4 = isMobile ? 30 : 100;
  return (
    <group>
      <Sparkles count={sparkleCount1} scale={[300, 300, 300]} size={20} speed={0.5} color="#4b0082" />
      <Sparkles count={sparkleCount2} scale={[300, 300, 300]} size={20} speed={0.5} color="yellow" />
      <Sparkles count={sparkleCount3} scale={[300, 300, 300]} size={20} speed={0.5} color="#00008B" />
      <Sparkles count={sparkleCount4} scale={[300, 300, 300]} size={20} speed={0.5} color="red" />
    </group>
  );
}

/* ======================================================================== */
/*                              MAIN SCENE                                */
/* ======================================================================== */
export default function Scene({
  onLoaded,
  onSelectRoute,
  activeRoute,
  visualizerMode = false,
  onBeatGoBack,
  onBeatShuffle,
  isMobile = false,
  hoveredRoute = null,
  environmentMode = "night",
  ...props
}: SceneProps) {
  const { camera, scene } = useThree();
  const { isBeatVisualizer } = useVisualizer();
  const audioUrlForBeat = useRouteStore((state) => state.audioUrlForBeat);
  const showVisualizer = visualizerMode || isBeatVisualizer;

  /* Camera animation (unchanged) */
  const animationFinishedRef = useRef(false);
  const elapsedTimeRef = useRef(0);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const { scale } = useSpring({ scale: scaleFactor, config: { tension: 170, friction: 26 } });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const width = window.innerWidth;
        if (width < 768) setScaleFactor(0.65);
        else if (width < 1024) setScaleFactor(0.85);
        else setScaleFactor(1);
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const initialCameraPosition = useMemo(() => new THREE.Vector3(0, 50, 20), []);
  const targetCameraPosition = useMemo(() => new THREE.Vector3(0, 0, 10), []);
  const animationDuration = 2;

  useEffect(() => {
    if (!showVisualizer) {
      camera.position.copy(initialCameraPosition);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, showVisualizer, initialCameraPosition]);

  useFrame((_, delta) => {
    if (!showVisualizer && !animationFinishedRef.current) {
      elapsedTimeRef.current += delta;
      if (elapsedTimeRef.current >= animationDuration) {
        camera.position.copy(targetCameraPosition);
        camera.lookAt(0, 0, 0);
        animationFinishedRef.current = true;
        onLoaded?.();
      } else {
        const t = elapsedTimeRef.current / animationDuration;
        camera.position.lerpVectors(initialCameraPosition, targetCameraPosition, t);
        camera.lookAt(0, 0, 0);
      }
    }
  });

  /* Global Fog */
  scene.fog = new THREE.FogExp2(environmentMode === "day" ? "#ffffff" : "#000000", 0.0015);

  /* ====================================================================== */
  /*                           JSX  RETURN                                  */
  /* ====================================================================== */
  return (
    <group {...props}>
      {/* ================= ENVIRONMENT MAP & LIGHTS ================= */}
      <EnvironmentLights />
      <directionalLight
        position={[50, 80, 60]}
        intensity={environmentMode === "day" ? 1.6 : 1.0}
        color="#ffffff"
        castShadow
      />
      <directionalLight
        position={[-60, 40, -40]}
        intensity={environmentMode === "day" ? 0.8 : 0.5}
        color="#a0c8ff"
      />
      <directionalLight
        position={[-30, 70, 100]}
        intensity={environmentMode === "day" ? 0.9 : 0.7}
        color="#ffddb1"
      />
      <hemisphereLight
        color={environmentMode === "day" ? "#ffffe0" : "#222244"}
        groundColor={environmentMode === "day" ? "#ffffff" : "#000000"}
        intensity={environmentMode === "day" ? 0.6 : 0.35}
      />

      {/* ================= ORIGINAL EMISSIVE SPHERE & MOON ================= */}
      <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
        <TransmissiveSphere sphereRef={sphereRef} />
      </AnimatedGroup>

      <ambientLight intensity={environmentMode === "day" ? 0.6 : 0.4} />

      {/* ================= PARTICLES ================= */}
      <group position={[0, 100, 0]}>
        <EnvironmentParticles isMobile={isMobile} />
      </group>

      {/* ===== ROUTE‑SPECIFIC CONTENT ===== */}
      {showVisualizer ? (
        <BeatAudioVisualizerScene
          audioUrl={audioUrlForBeat || "/audio/sample-beat.mp3"}
          onGoBack={onBeatGoBack || (() => onSelectRoute("beats"))}
          onShuffle={onBeatShuffle || (() => console.log("Shuffle beat"))}
        />
      ) : (
        <AnimatedScale visible={activeRoute === "home"}>
          <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
            <AntiheroScene
              hoveredRoute={
                hoveredRoute === "home" || hoveredRoute === "beats-visualizer" ? null : hoveredRoute
              }
              showVisualizer={showVisualizer}
            />
          </AnimatedGroup>
        </AnimatedScale>
      )}

<OrbitControls
        autoRotate
        autoRotateSpeed={0.15}
        zoomSpeed={2}
        maxDistance={isMobile ? 12 : 20}
        minDistance={isMobile ? 5 : 10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </group>
  );
}
