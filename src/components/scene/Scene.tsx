'use client';

import { OrbitControls, Stars } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Route } from '../layout/NavigationMenu';
import AntiHeroLogo from '../models/AntiHeroMain';
import { GalaxySkyboxModel } from '../models/GalaxySkybox';
import { NeptuneModel } from '../models/Neptune';
import AntiHero3D from '../models/text3D/AntiHero3D';

type SceneProps = {
  onLoaded?: () => void;
  isMobile?: boolean;
  onSelectRoute: (route: Route) => void;
  specialEffect?: boolean;
  activeRoute: Route | 'home';
};

function NeptuneModelAnimated(
  props: Omit<React.ComponentProps<typeof NeptuneModel>, 'scale'>
) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);
  useFrame((_, delta) => {
    if (scale < 1 && groupRef.current) {
      const newScale = Math.min(scale + delta, 1);
      setScale(newScale);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });
  return (
    <group ref={groupRef}>
      <NeptuneModel {...props} />
    </group>
  );
}

export default function Scene({
  onLoaded,
  isMobile = false,
  onSelectRoute,
  specialEffect = false,
  activeRoute,
}: SceneProps) {
  const { camera } = useThree();
  const animationFinishedRef = useRef(false);
  const [markersVisible, setMarkersVisible] = useState(false);
  const skyboxRef = useRef<THREE.Group>(null);
  const galaxyRef = useRef<THREE.Group>(null);

  const initialCameraPosition = new THREE.Vector3(1000, 1500, 2500);
  const targetCameraPosition = new THREE.Vector3(0, 20, 30);

  useEffect(() => {
    camera.position.copy(initialCameraPosition);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (!animationFinishedRef.current) {
      camera.position.lerp(targetCameraPosition, delta * 0.15);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(targetCameraPosition) < 10) {
        animationFinishedRef.current = true;
        setMarkersVisible(true);
        if (onLoaded) onLoaded();
      }
    }
    if (!isMobile && galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.02;
    }
    if (skyboxRef.current) {
      skyboxRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.transparent = true;
          if (specialEffect) {
            child.material.opacity = THREE.MathUtils.lerp(
              child.material.opacity ?? 1,
              0,
              delta * 0.5
            );
          } else {
            child.material.opacity = THREE.MathUtils.lerp(
              child.material.opacity ?? 0,
              1,
              delta * 0.5
            );
          }
        }
      });
    }
  });

  const antiHeroConfig = {
    text: 'ANTI-HERO',
    color: '#000000',
    fontSize: 10,
    fontDepth: 1,
    uTwistSpeed: 15,
    uRotateSpeed: 1.5,
    uTwists: 0.5,
    uRadius: 20,
  };

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <group ref={skyboxRef}>
        <GalaxySkyboxModel scale={[500, 500, 500]} />
      </group>
      {!isMobile && <group ref={galaxyRef} />}
      {activeRoute === 'xaeneptunesworld' ? (
        // NeptuneModelAnimated gets onSelectRoute
        <NeptuneModelAnimated onSelectRoute={onSelectRoute} />
      ) : (
        <group>
          {/* Wrap AntiHeroLogo in a Billboard so that it always faces the camera */}
   
            <group>
              {/* Removed blue sprite glow; glow now handled via postprocessing if needed */}
              <group rotation={[0, Math.PI, 0]}>
                {/* Pass showMarkers, specialEffect, onSelectRoute, and position to AntiHeroLogo */}
                <AntiHeroLogo
                  showMarkers={markersVisible}
                  onSelectRoute={onSelectRoute}
                  //position={[0, 0, 0]}
                />
              </group>
            </group>
            
          <AntiHero3D
            config={antiHeroConfig}
            showMarkers={markersVisible}
            specialEffect={specialEffect}
            onSelectRoute={onSelectRoute}
            position={[0, -8, 0]}
          />
        </group>
      )}
      <OrbitControls enableZoom={false} enablePan={false} />
      <Stars
        radius={100}
        depth={50}
        count={isMobile ? 10000 : 5000}
        factor={4}
        saturation={0}
        fade
      />
    </group>
  );
}
