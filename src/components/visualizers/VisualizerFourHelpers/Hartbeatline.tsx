/* -----------------------------------------------------------------------
 *  HeartbeatLine – simple oscilloscope waveform driven by time-domain data
 * -------------------------------------------------------------------- */
"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* Utility */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface HeartbeatLineProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  /** colour choices for the stroke; one is picked at mount */
  palette: THREE.Color[];
  /** overall vertical scale (default = 1) */
  fftIntensity?: number;
}

const DEFAULT_INTENSITY = 1;

/* -------------------------------------------------------------------- */

export default function HeartbeatLine({
  analyserRef,
  palette,
  fftIntensity = DEFAULT_INTENSITY,
}: HeartbeatLineProps) {
  /** working buffer for analyser */
  const dataRef = useRef<Uint8Array | null>(null);

  /* Build immutable geometry / material / line once ------------------- */
  const { geometry, material, line } = useMemo(() => {
    /* 256 evenly-spaced x-coords */
    const pts = Array.from({ length: 256 }, (_, i) => new THREE.Vector3(i * 0.25, 0, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);

    const material = new THREE.LineBasicMaterial({
      color: pick(palette),
      transparent: true,
      opacity: 0.85,
    });

    const line = new THREE.Line(geometry, material);
    line.scale.setScalar(0.55);      // shrink to fit
    line.position.set(0, -6, 0);     // shift down in world-space

    return { geometry, material, line };
  }, [palette]);

  /* Dispose on unmount */
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  /* Allocate FFT array once analyser becomes available */
  useEffect(() => {
    if (analyserRef.current && !dataRef.current) {
      dataRef.current = new Uint8Array(analyserRef.current.fftSize);
    }
  }, [analyserRef]);

  /* Per-frame waveform update ----------------------------------------- */
  useFrame(() => {
    if (!analyserRef.current || !dataRef.current) return;

    analyserRef.current.getByteTimeDomainData(dataRef.current);
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < 256; i++) {
      const v = (dataRef.current[i] - 128) / 128;          // -1 … 1
      positions[i * 3 + 1] = v * 8 * fftIntensity;         // update Y only
    }
    geometry.attributes.position.needsUpdate = true;
  });

  /* Mount the THREE.Line */
  return <primitive object={line} />;
}
