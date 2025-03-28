import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { JSX } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Route } from "../layout/NavigationMenu"; // adjust as needed
import { OrbitingShapes } from "./OrbitingShapes";

type GLTFResult = GLTF & {
  nodes: {
    Planeta_Planeta_0: THREE.Mesh;
    Atmosfera_Atmosfera_0: THREE.Mesh;
  };
  materials: {
    Planeta: THREE.MeshStandardMaterial;
    Atmosfera: THREE.MeshStandardMaterial;
  };
};

type NeptuneModelProps = JSX.IntrinsicElements["group"] & {
  specialEffect?: boolean;
  onSelectRoute: (route: Route) => void;
};

export function NeptuneModel({ specialEffect, ...props }: NeptuneModelProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/neptune.glb",
  ) as unknown as GLTFResult;

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="RootNode">
          <group name="Planeta" rotation={[-Math.PI / 2, 0, 0]}>
            <mesh
              name="Planeta_Planeta_0"
              geometry={nodes.Planeta_Planeta_0.geometry}
              material={materials.Planeta}
            >
              {specialEffect && <OrbitingShapes />}
            </mesh>
          </group>
          <group name="Atmosfera" rotation={[-Math.PI / 2, 0, 0]} scale={1.005}>
            <mesh
              name="Atmosfera_Atmosfera_0"
              geometry={nodes.Atmosfera_Atmosfera_0.geometry}
              material={materials.Atmosfera}
            />
          </group>
        </group>
      </group>
      {/* Rotating orbiting text "ANTI-HERO" */}
      <OrbitingText text="ANTI-HERO" radius={3} />
    </group>
  );
}

function OrbitingText({ text, radius }: { text: string; radius: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });
  const letters = text.split("");
  const angleStep = (2 * Math.PI) / letters.length;
  return (
    <group ref={groupRef}>
      {letters.map((letter, i) => {
        const angle = i * angleStep;
        const x = (radius + 10) * Math.cos(angle);
        const z = (radius + 10) * Math.sin(angle);
        return (
          <Text
            key={i}
            position={[x, 0, z]}
            rotation={[Math.PI / 8, -angle / 2.5, 0]}
            fontSize={2.5}
            color="#ffffff"
          >
            {letter}
          </Text>
        );
      })}
    </group>
  );
}

useGLTF.preload(
  "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/neptune.glb",
);
