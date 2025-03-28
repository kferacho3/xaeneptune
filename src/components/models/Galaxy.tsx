import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Object_2: { geometry: THREE.BufferGeometry };
  };
  materials: {
    "Scene_-_Root": THREE.PointsMaterial;
  };
};

export function GalaxyModel(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/galaxy.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <points
        geometry={nodes.Object_2.geometry}
        material={materials["Scene_-_Root"]}
        rotation={[-Math.PI / 4, 0, 0]}
        position={[-6, -8, 0]}
        scale={0.05}
      />
    </group>
  );
}

useGLTF.preload("https://xaeneptune.s3.us-east-2.amazonaws.com/glb/galaxy.glb");
