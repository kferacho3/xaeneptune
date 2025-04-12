"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

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

useGLTF.preload("https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHeroMain.glb");

export default function AntiHeroLogo({ ...props }) {
  const group = useRef<THREE.Group>(null);
  // Simplified occluder for NavigationMenu occlusion tests.
  const occluderRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();
  const { nodes, materials } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHeroMain.glb"
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
      const dx = e.clientX + lastPointer.current.x;
      const dy = e.clientY + lastPointer.current.y;
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

  // --- Smooth Look-At Logic with Easing and Pointer Influence ---
  useFrame(() => {
    if (group.current) {
      // Get the current world position of the logo
      const currentPos = new THREE.Vector3();
      group.current.getWorldPosition(currentPos);

      // Compute a pointer offset in world space.
      // Adjust the multiplier values as needed.
      const pointerOffset = new THREE.Vector3(pointer.x * 20, pointer.y * 10, 0);

      // Calculate desired target point to look at:
      const targetPos = new THREE.Vector3().copy(camera.position).add(pointerOffset);

      // Optionally, you can ensure the target is always roughly on the same horizontal plane as the logo:
      targetPos.y = currentPos.y;

      // Create a temporary matrix that will look at the target
      const m = new THREE.Matrix4();
      m.lookAt(currentPos, targetPos, group.current.up);

      // Extract the desired quaternion from the matrix
      const targetQuat = new THREE.Quaternion();
      targetQuat.setFromRotationMatrix(m);

      // Add any accumulated flipOffset around the Y axis
      const flipQuat = new THREE.Quaternion();
      flipQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), flipOffset);
      targetQuat.multiply(flipQuat);

      // Smoothly slerp the group’s current quaternion toward targetQuat.
      group.current.quaternion.slerp(targetQuat, 0.1);
    }
  });

  return (
    <group  rotation={[0, Math.PI/20, 0]} position={[0, 0, -5]}>
      {/* Extra positioning wrapper */}
      <group  />
      {/* The interactive logo, which rotates based on drag, click, and look-at calculations */}
      <group
        ref={group}
        {...props}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        rotation={[0, 0, 0]}
        scale={5}
      >
        <group {...props} dispose={null}>
          <group position={[-0.101, 0, -0.289]} scale={[7.164, 1, 7.164]}>
            <mesh geometry={nodes.ANTIHERO_1.geometry} material={materials.PaletteMaterial001} />
            <mesh geometry={nodes.ANTIHERO_2.geometry} material={materials.ANTIHERO_2?.material} />
          </group>
        </group>
      </group>
      {/* Invisible occluder for NavigationMenu occlusion tests */}
      <mesh
        ref={occluderRef}
        visible={false}
        geometry={new THREE.SphereGeometry(7, 8, 8)}
        position={[0, 0, 0]}
      />
    </group>
  );
}
