"use client";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Define rendering and color modes
export type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
export type ColorMode =
  | "default"
  | "audioAmplitude"
  | "frequencyBased"
  | "rainbow";

// Props include audioUrl for audio-reactive features.
interface GeometryVesselProps {
  renderingMode?: RenderingMode;
  colorMode?: ColorMode;
  audioUrl: string;
}

// A branch (or segment) of our vessel tree.
interface Branch {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  length: number;
  thickness: number;
  color: THREE.Color;
}

const GeometryVessel: React.FC<GeometryVesselProps> = ({
  renderingMode = "solid",
  colorMode = "default",
  audioUrl,
}) => {
  // Create and play an audio element so the prop is used and to enable audio reactivity.
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audio.loop = true;
    audio.play().catch((err) => console.error(err));
    const audioContext = new AudioContext();
    const src = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const audioData = new Uint8Array(bufferLength);
    src.connect(analyser);
    analyser.connect(audioContext.destination);

    let rafId: number;
    const update = () => {
      analyser.getByteFrequencyData(audioData);
      const normalized = Array.from(audioData).map((v) => v / 255);
      setFftData(normalized);
      rafId = requestAnimationFrame(update);
    };
    update();

    return () => {
      audio.pause();
      audio.currentTime = 0;
      cancelAnimationFrame(rafId);
      audioContext.close();
    };
  }, [audioUrl]);

  // fftData stores normalized frequency data (an array of numbers)
  const [fftData, setFftData] = useState<number[]>([]);

  // A ref to store our meshes (if you later need to animate them)
  const meshRefs = useRef<THREE.Mesh[]>([]);

  // Generate branches with a recursive function.
  const getTree = useMemo(() => {
    const branches: Branch[] = []; // initialize as an empty array of Branch
    const initialPosition = new THREE.Vector3(0, -50, 0);
    const initialDirection = new THREE.Vector3(0, 1, 0);
    const initialLength = 10;
    const initialThickness = 1;
    const maxDepth = 4;
    const angle = Math.PI / 5;

    const generateBranch = (
      position: THREE.Vector3,
      direction: THREE.Vector3,
      length: number,
      thickness: number,
      depth: number,
    ) => {
      if (depth > maxDepth) return;

      const endPoint = new THREE.Vector3()
        .copy(position)
        .add(new THREE.Vector3().copy(direction).multiplyScalar(length));
      const color = new THREE.Color().setHSL(
        0.3 + (depth / maxDepth) * 0.3,
        0.8,
        0.5,
      );
      branches.push({
        position: position.clone(),
        direction: direction.clone(),
        length,
        thickness,
        color,
      });

      const newLength = length * 0.8;
      const newThickness = thickness * 0.7;
      // Use an FFT value if available to modulate branch angle.
      const fftValue =
        fftData.length > 0 ? fftData[(depth * 10) % fftData.length] : 0;

      if (depth < maxDepth - 2 || Math.random() > 0.5) {
        const rightDirection = new THREE.Vector3()
          .copy(direction)
          .applyAxisAngle(new THREE.Vector3(0, 0, 1), angle + fftValue * 0.5);
        generateBranch(
          endPoint.clone(),
          rightDirection,
          newLength,
          newThickness,
          depth + 1,
        );
      }
      if (depth < maxDepth - 2 || Math.random() > 0.5) {
        const leftDirection = new THREE.Vector3()
          .copy(direction)
          .applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle - fftValue * 0.5);
        generateBranch(
          endPoint.clone(),
          leftDirection,
          newLength,
          newThickness,
          depth + 1,
        );
      }
      if (depth < maxDepth - 3 && Math.random() > 0.7) {
        const straightDirection = direction.clone();
        generateBranch(
          endPoint.clone(),
          straightDirection,
          newLength * 0.9,
          newThickness * 0.8,
          depth + 1,
        );
      }
    };

    generateBranch(
      initialPosition,
      initialDirection,
      initialLength,
      initialThickness,
      0,
    );
    return branches;
  }, [fftData]);

  // Determine material properties based on renderingMode.
  const getMaterialProps = (): THREE.MeshStandardMaterialParameters => {
    const materialProps: THREE.MeshStandardMaterialParameters = {};
    switch (renderingMode) {
      case "solid":
        materialProps.wireframe = false;
        materialProps.transparent = false;
        break;
      case "wireframe":
        materialProps.wireframe = true;
        materialProps.transparent = false;
        break;
      case "rainbow":
        materialProps.wireframe = false;
        materialProps.transparent = false;
        break;
      case "transparent":
        materialProps.wireframe = false;
        materialProps.transparent = true;
        materialProps.opacity = 0.5;
        break;
      default:
        materialProps.wireframe = false;
    }
    return materialProps;
  };
  const materialProps = getMaterialProps();

  // Animate meshes (if needed) on each frame.
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    meshRefs.current.forEach((mesh: THREE.Mesh, i: number) => {
      if (mesh && colorMode === "audioAmplitude") {
        const scale = 1 + 0.2 * Math.sin(time + i);
        mesh.scale.set(scale, scale, scale);
      }
    });
  });

  return (
    <>
      {getTree.map((branch: Branch, index: number) => (
        <mesh
          key={index}
          position={branch.position.toArray()}
          ref={(ref) => {
            if (ref) {
              meshRefs.current[index] = ref;
            }
          }}
        >
          <cylinderGeometry
            args={[
              branch.thickness * 0.5,
              branch.thickness * 0.4,
              branch.length,
              8,
            ]}
          />
          <meshStandardMaterial color={branch.color} {...materialProps} />
          {/* Apply an Euler rotation helper so the branch aligns with its direction */}
          <Euler
            rotation={
              new THREE.Euler(
                Math.PI / 2,
                0,
                Math.atan2(branch.direction.x, branch.direction.y),
              )
            }
          />
        </mesh>
      ))}
    </>
  );
};

// A helper component that returns a primitive object for Euler rotations.
const Euler = ({ rotation }: { rotation: THREE.Euler }) => {
  const obj = useMemo(() => {
    const o = new THREE.Object3D();
    o.rotation.copy(rotation);
    return o;
  }, [rotation]);
  return <primitive object={obj} />;
};

export default GeometryVessel;
