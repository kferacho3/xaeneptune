// src/components/visualizers/VisualizerTwo.tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import useSharedAudio from "./useSharedAudio";
import {
  createFractalGeometry,
  disposeFractalGeometry,
} from "./VisualizerTwoHelpers/fractalGeometryFactory";
import {
  ColorMode,
  FractalType,
  RenderingMode,
  VisualizerTwoProps,
} from "./VisualizerTwoHelpers/types";

/* ------------------------------------------------------------------ */
/*  FRACTAL-SPECIFIC COLOR PALETTES                                   */
/* ------------------------------------------------------------------ */
const FRACTAL_COLORS: Record<
  FractalType,
  { base: THREE.Color; accent: THREE.Color; glow: THREE.Color }
> = {
  mandelbulb:        { base: new THREE.Color(0x4a90e2), accent: new THREE.Color(0xf39c12), glow: new THREE.Color(0xe74c3c) },
  mandelbox:         { base: new THREE.Color(0x9b59b6), accent: new THREE.Color(0x3498db), glow: new THREE.Color(0xe67e22) },
  mengerSponge:      { base: new THREE.Color(0x27ae60), accent: new THREE.Color(0xf1c40f), glow: new THREE.Color(0xe74c3c) },
  cantorDust:        { base: new THREE.Color(0xecf0f1), accent: new THREE.Color(0x34495e), glow: new THREE.Color(0x9b59b6) },
  sierpinskiCarpet:  { base: new THREE.Color(0xe74c3c), accent: new THREE.Color(0x3498db), glow: new THREE.Color(0xf39c12) },
  juliaSet:          { base: new THREE.Color(0x8e44ad), accent: new THREE.Color(0x2ecc71), glow: new THREE.Color(0xf1c40f) },
  pythagorasTree:    { base: new THREE.Color(0x27ae60), accent: new THREE.Color(0x8b6914), glow: new THREE.Color(0xf39c12) },
  pythagorasTree3D:  { base: new THREE.Color(0x2ecc71), accent: new THREE.Color(0xd35400), glow: new THREE.Color(0xf1c40f) },
  kochSnowflake:     { base: new THREE.Color(0x3498db), accent: new THREE.Color(0xecf0f1), glow: new THREE.Color(0x00d2ff) },
  nFlake:            { base: new THREE.Color(0xe74c3c), accent: new THREE.Color(0xf39c12), glow: new THREE.Color(0xffeb3b) },
  sierpinskiTetrahedron:{ base:new THREE.Color(0x9b59b6), accent:new THREE.Color(0xe91e63), glow:new THREE.Color(0x00bcd4) },
  buddhabrot:        { base: new THREE.Color(0x1a237e), accent: new THREE.Color(0xff6f00), glow: new THREE.Color(0xffeb3b) },
  apollonianGasket:  { base: new THREE.Color(0x00695c), accent: new THREE.Color(0xffd600), glow: new THREE.Color(0xff1744) },
};

/* ------------------------------------------------------------------ */
/*  FRACTAL SHADER COMPONENT                                          */
/* ------------------------------------------------------------------ */
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
  const meshRef  = useRef<THREE.Mesh | null>(null);

  /* ---------- build geometry once per fractal type --------------- */
  const fractalGeometry = useMemo(() => createFractalGeometry(fractalType), [
    fractalType,
  ]);

  /* ---------- cache original positions --------------------------- */
  const originals = useRef<Float32Array | null>(null);
  useEffect(() => {
    const p = fractalGeometry.getAttribute("position");
    originals.current = p ? new Float32Array(p.array) : null;
  }, [fractalGeometry]);

  /* ---------- material factory ----------------------------------- */
  const createMaterial = useCallback(() => {
    const pal = FRACTAL_COLORS[fractalType];

    if (renderingMode === "transparent") {
      /* diamond-like glass */
      return new THREE.MeshPhysicalMaterial({
        color: pal.base,
        roughness: 0,
        metalness: 0,
        transmission: 1,          // full glass
        ior: 2.4,                 // high index for sparkle
        thickness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMapIntensity: 1,
        side: THREE.DoubleSide,
      });
    }

    if (renderingMode === "wireframe") {
      return new THREE.MeshBasicMaterial({
        color: pal.glow,
        wireframe: true,
        side: THREE.DoubleSide,
      });
    }

    /* solid / default */
    return new THREE.MeshPhongMaterial({
      color: pal.base,
      emissive: pal.accent,
      emissiveIntensity: colorMode === "audioAmplitude" ? 0 : 0.1,
      vertexColors: colorMode === "frequencyBased",
      side: THREE.DoubleSide,
      flatShading: true,
    });
  }, [fractalType, renderingMode, colorMode]);

  /* ---------- mount mesh ----------------------------------------- */
  useEffect(() => {
    if (!groupRef.current) return;
    const material = createMaterial();
    const mesh     = new THREE.Mesh(fractalGeometry, material);
    meshRef.current = mesh;
    groupRef.current.add(mesh);
    return () => {
      material.dispose();
      mesh.geometry.dispose();
      groupRef.current?.remove(mesh);
    };
  }, [fractalGeometry, createMaterial]);

  /* ---------- animation loop ------------------------------------- */
  useFrame(() => {
    const posAttr = fractalGeometry.getAttribute("position");
    const basePos = originals.current;
    if (!basePos || !posAttr) return;

    const positions = posAttr.array as Float32Array;
    const len       = positions.length / 3;
    const time      = performance.now() * 0.001;

    const globalAmp =
      audioData.reduce((s, v) => s + v, 0) / (audioData.length * 255 || 1);

    for (let i = 0; i < len; i++) {
      const ox = basePos[i * 3];
      const oy = basePos[i * 3 + 1];
      const oz = basePos[i * 3 + 2];

      const r     = Math.hypot(ox, oy, oz) || 1;
      const theta = Math.acos(oz / r);
      let   phi   = Math.atan2(oy, ox);
      if (phi < 0) phi += 2 * Math.PI;

      const idxPhi   = Math.floor((phi   / (2 * Math.PI)) * audioData.length);
      const idxTheta = Math.floor((theta / Math.PI)       * audioData.length);

      const ampPhi   = (audioData[idxPhi]   || 0) / 255;
      const ampTheta = (audioData[idxTheta] || 0) / 255;

      const displacement =
        ampPhi * 0.15 +
        Math.sin(time * 2 + phi * 2) * ampTheta * 0.08 +
        globalAmp * 0.05;

      const scale = 1 + displacement;

      positions[i * 3    ] = ox * scale;
      positions[i * 3 + 1] = oy * scale;
      positions[i * 3 + 2] = oz * scale;
    }
    posAttr.needsUpdate = true;

    /* group-level transforms */
    if (groupRef.current) {
      const s = 1 + globalAmp * 0.1;
      groupRef.current.scale.set(s, s, s);
      groupRef.current.rotation.y += 0.002 + globalAmp * 0.001;
      groupRef.current.rotation.x  = Math.sin(time * 0.5) * 0.1;
    }

    /* live emissive boost / colour shift */
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshPhongMaterial;
      if ("emissiveIntensity" in mat) {
        mat.emissiveIntensity = 0.1 + globalAmp * 0.4;
      }
      if (colorMode === "audioAmplitude" && "color" in mat) {
        mat.color.lerpColors(
          FRACTAL_COLORS[fractalType].base,
          FRACTAL_COLORS[fractalType].glow,
          globalAmp
        );
      }
    }
  });

  /* ---------- tidy on unmount ------------------------------------ */
  useEffect(() => () => disposeFractalGeometry(), []);

  /* ---------- lights & group wrapper ----------------------------- */
  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight
        position={[10, 10, 10]}
        intensity={0.8}
        color={FRACTAL_COLORS[fractalType].accent}
      />
      <pointLight
        position={[-10, -10, -10]}
        intensity={0.6}
        color={FRACTAL_COLORS[fractalType].glow}
      />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  VISUALIZER TWO WRAPPER                                           */
/* ------------------------------------------------------------------ */
export default function VisualizerTwo({
  audioUrl,
  isPaused,
  /* default to colour+wireframe combo */
  renderingMode = "wireframe",
  colorMode   = "frequencyBased",
  fractalType = "mengerSponge",
}: VisualizerTwoProps) {
  const analyserRef = useSharedAudio(audioUrl, isPaused);
  const audioBins   = useRef<Uint8Array>(new Uint8Array(0));

  useFrame(() => {
    if (!analyserRef.current) return;
    if (audioBins.current.length !== analyserRef.current.frequencyBinCount) {
      audioBins.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
    analyserRef.current.getByteFrequencyData(audioBins.current);
  });

  useEffect(() => () => disposeFractalGeometry(), []);

  return (
    <FractalShader
      key={fractalType}               /* full remount on change */
      audioData={audioBins.current}
      renderingMode={renderingMode}
      colorMode={colorMode}
      fractalType={fractalType}
    />
  );
}
