// src/components/Scene.tsx
'use client';

import { OrbitControls, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type SceneProps = {
  onLoaded?: () => void;
};

function Neptune({ onLoaded }: { onLoaded?: () => void }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
    }
  });

  // Signal that the model is loaded after mounting.
  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#013a63" />
    </mesh>
  );
}

export default function Scene({ onLoaded }: SceneProps) {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Neptune onLoaded={onLoaded} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <OrbitControls enableZoom={false} enablePan={false} />
    </group>
  );
}
