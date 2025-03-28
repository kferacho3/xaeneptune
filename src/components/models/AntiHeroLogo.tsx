import { useGLTF } from "@react-three/drei";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    DarkBackground: THREE.Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
};

type AntiHeroLogoProps = ThreeElements["group"];

export default function AntiHeroLogo(props: AntiHeroLogoProps) {
  const group = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  // Cast the result from useGLTF first to unknown and then to GLTFResult.
  const { nodes, materials } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHero.glb",
  ) as unknown as GLTFResult;

  // For flicking behavior.
  const velocity = useRef(new THREE.Vector2(0, 0));
  const isDragging = useRef<boolean>(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging.current && lastPointer.current && group.current) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
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

  useFrame(() => {
    if (!isDragging.current && group.current) {
      velocity.current.multiplyScalar(0.95);
      group.current.rotation.y += velocity.current.x * 0.005;
      group.current.rotation.x += velocity.current.y * 0.005;
    }
    if (group.current) {
      // Subtle effect: model rotates slightly based on mouse position.
      const offsetX = mouse.x * 0.2;
      group.current.rotation.z = offsetX;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <mesh
        geometry={nodes.DarkBackground.geometry}
        material={materials.PaletteMaterial001}
      />
    </group>
  );
}

useGLTF.preload(
  "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHero.glb",
);
