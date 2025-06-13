"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import useSharedAudio from "./useSharedAudio";
import { colorPalettes } from "./VisualizerThreeHelpers/colorPalettess";
import { FFTVisualizerMaterial } from "./VisualizerThreeHelpers/shaderMaterials";
import {
  ColorPaletteName,
  EnvironmentMode,
  RenderingMode,
} from "./VisualizerThreeHelpers/types";

/* ───── Environment lookup (16 modes) ──── */
const envIndex: Record<EnvironmentMode, number> = {
  disco: 0,  octagrams: 1,  raymarching: 2,
  cycube: 3,   phantom: 4,      golden: 5,
  undulating: 6,
  mandelbob: 7, plasma: 8, crystal: 9,
  truchet: 10, structural: 11,
  apollonian: 12, binary: 13, solar: 14, pastel: 15,
};

/* ───── Render-mode lookup (unchanged) ──── */
const renderIndex: Record<RenderingMode, number> = {
  solid: 0, wireframe: 1, rainbow: 2, transparent: 3,
};

interface VisualizerThreeProps {
  audioUrl: string;
  isPaused: boolean;
  environmentMode?: EnvironmentMode;
  renderingMode?: RenderingMode;
  colorPalette?: ColorPaletteName;
  fftIntensity?: number;
}

export default function VisualizerThree({
  audioUrl,
  isPaused,
  environmentMode = "disco",
  renderingMode = "solid",
  colorPalette = "default",
  fftIntensity = 0.2,
}: VisualizerThreeProps) {
  /* basic setup */
  const analyserRef = useSharedAudio(audioUrl, isPaused);
  const material    = useMemo(() => new FFTVisualizerMaterial(), []);
  const planeRef    = useRef<THREE.Mesh>(null);
  const fftTexRef   = useRef<THREE.DataTexture | null>(null);

  /* init 1-D FFT texture */
  useEffect(() => {
    if (!analyserRef.current) return;
    const bins = analyserRef.current.frequencyBinCount;

    fftTexRef.current = new THREE.DataTexture(
      new Uint8Array(bins * 4), // RGBA
      bins,
      1,
      THREE.RGBAFormat
    );
    fftTexRef.current.needsUpdate = true;
    material.uniforms.fftTexture.value = fftTexRef.current;

    return () => fftTexRef.current?.dispose();
  }, [analyserRef, material]);

  /* frame loop */
  useFrame(({ clock, gl, camera, mouse }) => {
    planeRef.current?.lookAt(camera.position);

    /* core uniforms */
    material.uniforms.iTime.value          = clock.elapsedTime;
    material.uniforms.iResolution.value.set(gl.domElement.width, gl.domElement.height);
    material.uniforms.iMouse.value.set(
      mouse.x * gl.domElement.width,
      mouse.y * gl.domElement.height,
      0
    );
    material.uniforms.fftIntensity.value   = fftIntensity;
    material.uniforms.uEnvironment.value   = envIndex[environmentMode];
    material.uniforms.uRenderMode.value    = renderIndex[renderingMode];

    /* colours */
    const pal = colorPalettes[colorPalette] ?? colorPalettes.default;
    material.uniforms.colorPalette.value = pal.map(
      (c) => new THREE.Vector3(c.r, c.g, c.b)
    );

    /* upload FFT bins */
    if (analyserRef.current && fftTexRef.current) {
      const bins = analyserRef.current.frequencyBinCount;
      const data = new Uint8Array(bins);
      analyserRef.current.getByteFrequencyData(data);

      const img = fftTexRef.current.image.data as Uint8Array;
      for (let i = 0; i < bins; i++) img.set([data[i], data[i], data[i], 255], i * 4);
      fftTexRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh ref={planeRef} scale={[15, 15, 1]} frustumCulled={false}>
      <planeGeometry args={[20, 20, 60, 60]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
