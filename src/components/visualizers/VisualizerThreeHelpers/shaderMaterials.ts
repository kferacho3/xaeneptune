import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { fragmentShader } from "./fragmentShader";
import { vertexShader } from "./vertexShader";

export const FFTVisualizerMaterial = shaderMaterial(
  {
    // Uniforms for environment and render mode
    uEnvironment: 0,
    uRenderMode: 0,

    // Common uniforms
    iTime: 0,
    iResolution: new THREE.Vector2(),
    iMouse: new THREE.Vector3(),
    fftTexture: null as THREE.DataTexture | null,
    fftIntensity: 0.1,

    // Color palette
    colorPalette: [] as THREE.Vector3[],
  },
  vertexShader,
  fragmentShader
);