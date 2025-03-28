import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Object_4: THREE.Mesh;
  };
  materials: {
    material: THREE.MeshStandardMaterial;
  };
};

export function GalaxySkyboxModel(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/galaxySkybox.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_4.geometry} material={materials.material} />
    </group>
  );
}

useGLTF.preload(
  "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/galaxySkybox.glb",
);
