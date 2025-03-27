'use client';
import AntiHeroLogo from '@/components/models/AntiHeroMain';
import { GalaxyModel } from '@/components/models/Galaxy';
import { GalaxySkyboxModel } from '@/components/models/GalaxySkybox';
import { NeptuneModel } from '@/components/models/Neptune';
import AntiHero3D from '@/components/models/text3D/AntiHero3D';
import BeatAudioVisualizerScene from '@/components/scene/BeatAudioVisualizerScene';
import { useVisualizer } from '@/context/VisualizerContext';
import { Route, useRouteStore } from '@/store/useRouteStore';
import { OrbitControls, Reflector, Sparkles } from '@react-three/drei';
import { ThreeElements, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, GodRays } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Import react-spring for smooth animations in three.js
import { a, useSpring } from '@react-spring/three';

// Define an animated group so that the "group" element is correctly typed.
const AnimatedGroup = a('group');

type MeshPhysicalMaterialProps = ThreeElements['meshPhysicalMaterial'];

type SceneProps = {
  onLoaded?: () => void;
  isMobile?: boolean;
  onSelectRoute: (route: Route) => void;
  specialEffect?: boolean;
  activeRoute: Route;
  visualizerMode?: boolean;
  onBeatGoBack?: () => void;
  onBeatShuffle?: () => void;
};

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

function FadingGalaxySkybox({ specialEffect }: { specialEffect?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = specialEffect
            ? THREE.MathUtils.lerp(child.material.opacity ?? 1, 0, delta * 0.2)
            : THREE.MathUtils.lerp(child.material.opacity ?? 0, 1, delta * 0.2);
        }
      });
    }
  });
  return (
    <group ref={groupRef}>
      <GalaxySkyboxModel scale={[500, 500, 500]} />
    </group>
  );
}

function NeptuneModelAnimated(props: Omit<React.ComponentProps<typeof NeptuneModel>, 'scale'>) {
  return (
    <group>
      <NeptuneModel {...props} />
    </group>
  );
}

type TransmissiveSphereProps = {
  sphereRef: React.MutableRefObject<THREE.Mesh | null>;
};

function TransmissiveSphere({ sphereRef }: TransmissiveSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 80 + Math.sin(state.clock.elapsedTime) * 2;
    }
  });
  return (
    <group ref={groupRef} position={[0, 80, -100]}>
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

type CrescentMoonTransmissiveProps = {
  moonRef?: React.MutableRefObject<THREE.Mesh | null>;
};

function CrescentMoonTransmissive({ moonRef }: CrescentMoonTransmissiveProps = {}) {
  const material = new THREE.MeshPhysicalMaterial({
    emissive: '#4b0082',
    emissiveIntensity: 2,
    transmission: 1,
    roughness: 0,
    metalness: 0,
    clearcoat: 1,
    transparent: true,
    opacity: 0.8,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.lightDir = { value: new THREE.Vector3(1, 0, 0) };
    shader.uniforms.threshold = { value: 0.3 };
    shader.fragmentShader =
      `
      uniform vec3 lightDir;
      uniform float threshold;
      ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `
        float illumination = dot(normalize(vNormal), normalize(lightDir));
        if(illumination < threshold) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
        #include <dithering_fragment>
      `
    );
  };

  return (
    <group position={[0, 20, 200]}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[10, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
      <pointLight intensity={3} distance={100} color="#4b0082" />
      {[...Array(3)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[10 + (i + 1) * 2, 64, 64]} />
          <meshBasicMaterial
            color="#4b0082"
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

function EnvironmentParticles() {
  return (
    <group>
      <Sparkles count={250} scale={[300, 300, 300]} size={20} speed={0.5} color="#4b0082" />
      <Sparkles count={250} scale={[300, 300, 300]} size={20} speed={0.5} color="yellow" />
      <Sparkles count={150} scale={[300, 300, 300]} size={20} speed={0.5} color="#00008B" />
      <Sparkles count={100} scale={[300, 300, 300]} size={20} speed={0.5} color="red" />
    </group>
  );
}

export default function Scene({
  onLoaded,
  onSelectRoute,
  specialEffect = false,
  activeRoute,
  visualizerMode = false,
  onBeatGoBack,
  onBeatShuffle,
}: SceneProps) {
  const { camera, scene } = useThree();
  const { isBeatVisualizer } = useVisualizer();
  const audioUrlForBeat = useRouteStore((state) => state.audioUrlForBeat);
  const showVisualizer = visualizerMode || isBeatVisualizer;
  const animationFinishedRef = useRef(false);
  const elapsedTimeRef = useRef(0);
  const [markersVisible, setMarkersVisible] = useState(false);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const crescentMoonRef = useRef<THREE.Mesh | null>(null);

  // Replace the instantaneous scale state with a spring-based scale for smooth transitions.
  const [scaleFactor, setScaleFactor] = useState(1);
  const { scale } = useSpring({
    scale: scaleFactor,
    config: { tension: 170, friction: 26 },
  });

  // Debounced resize handler to reduce flickering
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const width = window.innerWidth;
        if (width < 768) {
          setScaleFactor(0.65);
        } else if (width < 1024) {
          setScaleFactor(0.85);
        } else {
          setScaleFactor(1);
        }
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const initialCameraPosition = new THREE.Vector3(-100, -50, 100);
  const targetCameraPosition = new THREE.Vector3(-5, 0, 40);
  const animationDuration = 1.25;

  useEffect(() => {
    if (!showVisualizer) {
      camera.position.copy(initialCameraPosition);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, showVisualizer]);

  useFrame((_, delta) => {
    if (!showVisualizer && !animationFinishedRef.current) {
      elapsedTimeRef.current += delta;
      if (elapsedTimeRef.current >= animationDuration) {
        camera.position.copy(targetCameraPosition);
        camera.lookAt(0, 0, 0);
        animationFinishedRef.current = true;
        setMarkersVisible(true);
        if (onLoaded) onLoaded();
      } else {
        const t = elapsedTimeRef.current / animationDuration;
        camera.position.lerpVectors(initialCameraPosition, targetCameraPosition, t);
        camera.lookAt(0, 0, 0);
      }
    }
  });

  if (!showVisualizer) {
    scene.fog = new THREE.FogExp2('#000000', 0.0015);
  }

  const antiHeroConfig = {
    text: 'ANTI-HERO',
    color: '#4210ae',
    fontSize: 10,
    fontDepth: 1,
    uTwistSpeed: 15,
    uRotateSpeed: 1.5,
    uTwists: 0.5,
    uRadius: 20,
  };

  return (
    <group>
      {/* Wrap models that need responsive scaling in an animated group */}
      <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
        <TransmissiveSphere sphereRef={sphereRef} />
        <CrescentMoonTransmissive moonRef={crescentMoonRef} />
      </AnimatedGroup>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <group position={[0, 100, 0]}>
        <EnvironmentParticles />
      </group>

      {showVisualizer ? (
        <BeatAudioVisualizerScene
          audioUrl={audioUrlForBeat || '/audio/sample-beat.mp3'}
          onGoBack={onBeatGoBack || (() => onSelectRoute('beats'))}
          onShuffle={onBeatShuffle || (() => console.log('Shuffle beat'))}
        />
      ) : (
        <>
          {activeRoute === 'xaeneptunesworld' ? (
            <group>
              <FadingGalaxySkybox specialEffect={specialEffect} />
              <AnimatedScale visible={activeRoute === 'xaeneptunesworld'}>
                <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
                  <NeptuneModelAnimated onSelectRoute={onSelectRoute} />
                </AnimatedGroup>
              </AnimatedScale>
              <AnimatedScale visible={activeRoute === 'xaeneptunesworld'}>
                <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
                  <GalaxyModel />
                </AnimatedGroup>
              </AnimatedScale>
            </group>
          ) : (
            <AnimatedScale visible={activeRoute === 'home'}>
              <AnimatedGroup scale={scale.to((s) => [s, s, s])}>
                <group rotation={[0, Math.PI, 0]}>
                  <AntiHeroLogo showMarkers={markersVisible} onSelectRoute={onSelectRoute} />
                </group>
                <AntiHero3D
                  config={antiHeroConfig}
                  showMarkers={markersVisible}
                  specialEffect={specialEffect}
                  onSelectRoute={onSelectRoute}
                  position={[0, -8, 0]}
                />
                <directionalLight intensity={0.8} position={[50, 50, 50]} color="#aaaaff" />
                <ambientLight intensity={0.4} color="#5555aa" />
              </AnimatedGroup>
            </AnimatedScale>
          )}
        </>
      )}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.15}
        zoomSpeed={2}
        maxDistance={75}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      {(sphereRef.current || crescentMoonRef.current) && (
        <EffectComposer>
          {sphereRef.current ? (
            <GodRays
              key="sphere"
              sun={sphereRef.current}
              blendFunction={BlendFunction.SCREEN}
              samples={120}
              density={1.25}
              decay={0.93}
              weight={0.8}
              exposure={0.2}
            />
          ) : (
            <></>
          )}
          {crescentMoonRef.current ? (
            <GodRays
              key="crescentMoon"
              sun={crescentMoonRef.current}
              blendFunction={BlendFunction.SCREEN}
              samples={120}
              density={2.25}
              decay={0.93}
              weight={0.8}  // less prominent effect for the crescent moon
              exposure={0.1}
            />
          ) : (
            <></>
          )}
        </EffectComposer>
      )}

      <Reflector
        blur={[512, 512]}
        mixBlur={0.75}
        mixStrength={0.25}
        resolution={1024}
        args={[10000, 10000]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -70, 0]}
        mirror={0.05}
        minDepthThreshold={0.25}
        maxDepthThreshold={1}
        depthScale={50}
        recursion={2}
      >
        {(Material: React.ComponentType<MeshPhysicalMaterialProps>, props: MeshPhysicalMaterialProps): React.ReactElement => (
          <Material metalness={0.99} roughness={0.2} {...props} />
        )}
      </Reflector>
    </group>
  );
}
 