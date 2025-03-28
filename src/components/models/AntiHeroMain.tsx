"use client";

import NavigationMenu, { Route } from "@/components/layout/NavigationMenu";
import { Billboard, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

interface AntiHeroLogoProps extends React.ComponentPropsWithoutRef<"group"> {
  showMarkers: boolean;
  onSelectRoute: (route: Route) => void;
}

export default function AntiHeroLogo({
  showMarkers,
  onSelectRoute,
  ...props
}: AntiHeroLogoProps) {
  const group = useRef<THREE.Group>(null);
  // Simplified occluder for NavigationMenu occlusion tests.
  const occluderRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();
  const { nodes, materials } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHeroMain.glb",
  ) as unknown as GLTFResult;

  // --- Drag & Flick Logic ---
  const velocity = useRef(new THREE.Vector2(0, 0));
  const isDragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging.current && lastPointer.current && group.current) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      // Apply manual rotation from dragging.
      group.current.rotation.y += dx * 0.005;
      group.current.rotation.x += dy * 0.005;
      velocity.current.set(dx, dy);
      lastPointer.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = () => {
    isDragging.current = false;
    lastPointer.current = null;
  };

  // --- Click-to-Flip Logic ---
  // Count clicks and wait 1 second after the last click before applying flips.
  const clickCountRef = useRef(0);
  const flipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [flipOffset, setFlipOffset] = useState(0);

  const onClick = () => {
    if (isDragging.current) return;
    clickCountRef.current += 1;
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      // Each click adds 180° (PI radians) to the flip offset.
      setFlipOffset((prev) => prev + Math.PI * clickCountRef.current);
      clickCountRef.current = 0;
    }, 1000);
  };

  // --- Smooth Facing & Mouse Effects ---
  useFrame(() => {
    if (group.current) {
      // Compute target Y rotation so the logo faces the camera,
      // plus add the accumulated flip offset and a subtle pointer offset.
      const targetY =
        Math.atan2(camera.position.x, camera.position.z) +
        flipOffset +
        pointer.x * 0.2;
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetY,
        0.2,
      );
    }
  });

  return (
    <group>
      <group position={[0, -2, 0]}>
        {showMarkers && (
          <NavigationMenu
            onSelectRoute={onSelectRoute}
            occluder={occluderRef}
          />
        )}
      </group>
      {/* Wrap the interactive section with a Billboard so it always faces the camera.
          Lock X and Z so that only Y rotation (controlled by our mouse and click logic) remains. */}
      <Billboard>
        <group
          ref={group}
          {...props}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={onClick}
          // Do not remove these initial rotation settings.
          rotation={[0, 0, 0]}
          scale={10}
        >
          <group
            rotation={[Math.PI / 2, 0, 0]}
            position={[-0.101, -0.5, -0.289]}
            scale={[7.164, 1, 7.164]}
          >
            <mesh
              geometry={nodes.ANTIHERO_1.geometry}
              material={materials.PaletteMaterial001}
            />
            <mesh
              geometry={nodes.ANTIHERO_2.geometry}
              material={nodes.ANTIHERO_2.material}
            />
          </group>
        </group>
      </Billboard>
      {/* Invisible low-poly occluder for NavigationMenu occlusion tests */}
      <mesh
        ref={occluderRef}
        visible={false}
        geometry={new THREE.SphereGeometry(7, 8, 8)}
        position={[0, 0, 0]}
      />
    </group>
  );
}

type GLTFResult = GLTF & {
  nodes: {
    ANTIHERO_1: THREE.Mesh;
    ANTIHERO_2: THREE.Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
    ANTIHERO_2?: { material: THREE.MeshStandardMaterial };
  };
};

useGLTF.preload(
  "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHeroMain.glb",
);
