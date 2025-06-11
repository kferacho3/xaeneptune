// src/components/visualizers/VisualizerTwo.tsx
"use client";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import useSharedAudio from "./useSharedAudio";
import { createFractalGeometry } from "./VisualizerTwoHelpers/fractalGeometryFactory";
import {
  ColorMode,
  FractalType,
  RenderingMode,
  VisualizerTwoProps
} from "./VisualizerTwoHelpers/types";

/* ================================================================
   FRACTAL SHADER COMPONENT
   ================================================================= */
function FractalShader({
  audioData,
  renderingMode,
  colorMode,
  fractalType,
}: {
  audioData: Uint8Array;
  renderingMode: RenderingMode;
  colorMode: ColorMode;
  fractalType: FractalType;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Build the fractal geometry
  const fractalGeometry = useMemo<THREE.BufferGeometry>(() => {
    return createFractalGeometry(fractalType);
  }, [fractalType]);

  // Save original positions
  const originalPositionsRef = useRef<Float32Array | null>(null);
  useEffect(() => {
    const posAttr = fractalGeometry.getAttribute("position");
    if (posAttr) {
      originalPositionsRef.current = new Float32Array(posAttr.array);
    }
  }, [fractalGeometry]);

  // Materials
  const wireframeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        side: THREE.DoubleSide,
      }),
    []
  );

  const solidMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    []
  );

  const transparentMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
    []
  );

  const getMaterial = useCallback(
    (mode: RenderingMode, color: ColorMode): THREE.Material => {
      if (mode === "wireframe") return wireframeMaterial;
      if (mode === "transparent") return transparentMaterial;
      if (color === "audioAmplitude") {
        const amp =
          audioData.length > 0
            ? audioData.reduce((sum, val) => sum + val, 0) /
              (audioData.length * 255)
            : 0;
        return new THREE.MeshPhongMaterial({
          color: new THREE.Color(amp, amp, amp),
          flatShading: true,
          side: THREE.DoubleSide,
        });
      }
      if (color === "frequencyBased") {
        const avgFrequency =
          audioData.length > 0
            ? audioData.reduce((sum, val) => sum + val, 0) / audioData.length
            : 128;
        return new THREE.MeshPhongMaterial({
          color: new THREE.Color(
            avgFrequency / 255,
            1 - avgFrequency / 255,
            0.5,
          ),
          flatShading: true,
          side: THREE.DoubleSide,
        });
      }
      return solidMaterial;
    },
    [wireframeMaterial, transparentMaterial, solidMaterial, audioData]
  );

  const dynamicMaterial = useMemo(
    () => getMaterial(renderingMode, colorMode),
    [renderingMode, colorMode, getMaterial]
  );

  // Set up the fractal mesh
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    
    // Clear previous
    group.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) {
        mat.forEach((m: THREE.Material) => {
          if (typeof m.dispose === "function") m.dispose();
        });
      } else if (mat && typeof mat.dispose === "function") {
        mat.dispose();
      }
    });
    group.clear();

    const mesh = new THREE.Mesh(fractalGeometry, dynamicMaterial);
    group.add(mesh);
    
    return () => {
      group.clear();
    };
  }, [fractalGeometry, dynamicMaterial]);

  // Update vertices based on audio
  useFrame(() => {
    const posAttr = fractalGeometry.getAttribute("position");
    if (
      !groupRef.current ||
      audioData.length === 0 ||
      !posAttr ||
      !originalPositionsRef.current
    )
      return;
      
    const positions = posAttr.array as Float32Array;
    const originalPositions = originalPositionsRef.current;
    const numVertices = positions.length / 3;
    const time = performance.now() * 0.001;
    const globalAmp =
      audioData.reduce((sum, val) => sum + val, 0) / (audioData.length * 255);
    
    for (let i = 0; i < numVertices / 2; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];
      const r = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
      const theta = Math.acos(oz / r);
      let phi = Math.atan2(oy, ox);
      if (phi < 0) phi += 2 * Math.PI;
      
      const indexPhi = Math.floor((phi / (2 * Math.PI)) * audioData.length);
      const ampPhi = audioData[indexPhi] / 255;
      const indexTheta = Math.floor((theta / Math.PI) * audioData.length);
      const ampTheta = audioData[indexTheta] / 255;
      
      const radialDisplacement = ampPhi * 0.2 + globalAmp * 0.05;
      const flowDisplacement = Math.sin(time + 2 * phi) * ampTheta * 0.1;
      const totalDisplacement = radialDisplacement + flowDisplacement;
      
      const newX = ox + (ox / r) * totalDisplacement;
      const newY = oy + (oy / r) * totalDisplacement;
      const newZ = oz + (oz / r) * totalDisplacement;
      
      positions[i * 3] = newX;
      positions[i * 3 + 1] = newY;
      positions[i * 3 + 2] = newZ;
      
      const j = numVertices - i - 1;
      positions[j * 3] = -newX;
      positions[j * 3 + 1] = -newY;
      positions[j * 3 + 2] = -newZ;
    }
    
    posAttr.needsUpdate = true;
    
    const scale = 1 + globalAmp * 0.1;
    groupRef.current.scale.set(scale, scale, scale);
    groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef}>
      {/* Add lights for better visualization */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </group>
  );
}

/* ================================================================
   Exported VisualizerTwo Component
   ================================================================= */
export default function VisualizerTwo({
  audioUrl,
  isPaused,
  renderingMode: propRenderingMode,
  colorMode: propColorMode,
  fractalType: propFractalType,
}: VisualizerTwoProps) {
  // Use props with defaults
  const renderingMode = propRenderingMode || "solid";
  const colorMode = propColorMode || "default";
  const fractalType = propFractalType || "mandelbox";

  // Shared audio
  const analyserRef = useSharedAudio(audioUrl, isPaused);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(0));

  // Update audio data
  useFrame(() => {
    if (!analyserRef.current) return;
    const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(buffer);
    audioDataRef.current = buffer;
  });

  return (
    <FractalShader
      audioData={audioDataRef.current}
      renderingMode={renderingMode}
      colorMode={colorMode}
      fractalType={fractalType}
    />
  );
}