"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { Cloud, Clouds } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useRef } from "react";
import * as THREE from "three";

const SkyEffect: React.FC = () => {
  const nightMode = useRouteStore((state) => state.nightMode);
  const { scene } = useThree();

  // Set scene background and fog based on the global nightMode state.
  scene.background = new THREE.Color(nightMode ? "#20263b" : "#bee0f7");
  scene.fog = new THREE.Fog(nightMode ? "#20263b" : "#bee0f7", 20, 60);

  const groupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Group>(null);

  // Leva controls for cloud parameters.
  const { color, x, y, z, ...config } = useControls("Sky Settings", {
    seed: { value: 1, min: 1, max: 100, step: 1 },
    segments: { value: 40, min: 1, max: 80, step: 1 },
    volume: { value: 25, min: 0, max: 100, step: 0.1 },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    fade: { value: 400, min: 0, max: 400, step: 1 },
    growth: { value: 0, min: 0, max: 20, step: 1 },
    speed: { value: 0.75, min: 0, max: 1, step: 0.01 },
    x: { value: 23, min: 0, max: 100, step: 1 },
    y: { value: 0, min: 0, max: 100, step: 1 },
    z: { value: 22, min: 0, max: 100, step: 1 },
    color: { value: "#4b11de" },
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.085) / 10;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) / 20;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group position={[0, 7, 0]} ref={groupRef}>
      <Clouds material={THREE.MeshBasicMaterial} limit={1000} range={300}>
        <Cloud ref={cloudRef} {...config} bounds={[x, y, z]} color={color} />
      </Clouds>
    </group>
  );
};

export default SkyEffect;
