"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface OrbitingShapeProps {
  type: string;
  radius: number;
  speed: number;
  size: number;
  initialAngle: number;
}

function OrbitingShape({
  type,
  radius,
  speed,
  size,
  initialAngle,
}: OrbitingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const angle = initialAngle + t * speed;
    if (meshRef.current) {
      meshRef.current.position.x = radius * Math.cos(angle);
      meshRef.current.position.z = radius * Math.sin(angle);
      // Add a slight vertical oscillation
      meshRef.current.position.y = Math.sin(t * speed) * 0.5;
    }
  });

  let geometry: THREE.BufferGeometry;
  switch (type) {
    case "torusKnot":
      geometry = new THREE.TorusKnotGeometry(size, size * 0.3, 100, 16);
      break;
    case "octahedron":
      geometry = new THREE.OctahedronGeometry(size);
      break;
    case "cone":
      geometry = new THREE.ConeGeometry(size, size * 2, 4);
      break;
    case "sphere":
      geometry = new THREE.SphereGeometry(size, 32, 32);
      break;
    case "box":
      geometry = new THREE.BoxGeometry(size, size, size);
      break;
    case "icosahedron":
      geometry = new THREE.IcosahedronGeometry(size);
      break;
    case "dodecahedron":
      geometry = new THREE.DodecahedronGeometry(size);
      break;
    default:
      geometry = new THREE.SphereGeometry(size, 32, 32);
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial emissive={"#00ffff"} toneMapped={false} />
    </mesh>
  );
}

export function OrbitingShapes() {
  const shapes = [
    { type: "torusKnot", radius: 40, speed: 0.5, size: 1, initialAngle: 0 },
    {
      type: "octahedron",
      radius: 50,
      speed: 0.3,
      size: 1,
      initialAngle: Math.PI / 4,
    },
    {
      type: "cone",
      radius: 60,
      speed: 0.4,
      size: 1,
      initialAngle: Math.PI / 2,
    },
    {
      type: "sphere",
      radius: 45.5,
      speed: 0.6,
      size: 1,
      initialAngle: Math.PI / 3,
    },
    {
      type: "box",
      radius: 55,
      speed: 0.35,
      size: 1,
      initialAngle: Math.PI / 6,
    },
    {
      type: "icosahedron",
      radius: 65,
      speed: 0.45,
      size: 1,
      initialAngle: Math.PI / 2 + Math.PI / 8,
    },
    {
      type: "dodecahedron",
      radius: 48,
      speed: 0.55,
      size: 1,
      initialAngle: Math.PI / 3 + Math.PI / 7,
    },
    {
      type: "torusKnot",
      radius: 52,
      speed: 0.65,
      size: 1,
      initialAngle: Math.PI / 4 + Math.PI / 5,
    },
  ];

  return (
    <group>
      {shapes.map((shape, index) => (
        <OrbitingShape key={index} {...shape} />
      ))}
    </group>
  );
}
