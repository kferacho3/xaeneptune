// src/components/background/BackgroundGradient.tsx
"use client";

import { ScreenQuad, shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import NoiseShader from "./NoiseShader";

export type BackgroundUniforms = {
  uTime: number;
  uScrollProgress: number;
  uColourPalette: THREE.Vector3[];
  uUvScale: number;
  uUvDistortionIterations: number;
  uUvDistortionIntensity: number;
};

// Define the new color palette.
// Primary color: black
const black = new THREE.Vector3(0, 0, 0);
// Dark blue (using #00008B)
const darkBlue = new THREE.Vector3(0, 0, 139 / 255);
// Smooth indigo (for example, a softer indigo, here using #6A5ACD)
const smoothIndigo = new THREE.Vector3(106 / 255, 90 / 255, 205 / 255);
// Dark navy blue (using #000080)
const darkNavyBlue = new THREE.Vector3(0, 0, 128 / 255);

const INITIAL_UNIFORMS: BackgroundUniforms = {
  uTime: 0,
  uScrollProgress: 0,
  // Order: [primary black, dark blue, smooth indigo, dark navy blue]
  uColourPalette: [black, darkBlue, smoothIndigo, darkNavyBlue],
  uUvScale: 5,
  uUvDistortionIterations: 8,
  uUvDistortionIntensity: 0.002,
};

const NoiseMaterial = shaderMaterial(
  INITIAL_UNIFORMS,
  NoiseShader.vertexShader,
  NoiseShader.fragmentShader,
);

export type NoiseMaterialType = THREE.ShaderMaterial & BackgroundUniforms;

const Background: React.FC = () => {
  // Create the material instance and disable depth testing/writing.
  const material = useMemo(() => {
    const m = new NoiseMaterial() as NoiseMaterialType;
    m.depthTest = false;
    m.depthWrite = false;
    return m;
  }, []);

  // Get a reference to the ScreenQuad's mesh.
  const quadRef = useRef<THREE.Mesh>(null);

  // Update uTime uniform each frame.
  useFrame(({ clock }) => {
    material.uTime = clock.getElapsedTime();
  });

  // After rendering, clear the depth so subsequent objects are drawn on top.
  useEffect(() => {
    if (quadRef.current) {
      quadRef.current.onAfterRender = (renderer: THREE.WebGLRenderer) => {
        renderer.clearDepth();
      };
      // Force the background to render first.
      quadRef.current.renderOrder = -1000;
    }
  }, []);

  return (
    <ScreenQuad ref={quadRef}>
      <primitive object={material} attach="material" />
    </ScreenQuad>
  );
};

export default Background;
