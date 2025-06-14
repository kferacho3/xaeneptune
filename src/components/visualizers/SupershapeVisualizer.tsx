/* ---------------------------------------------------------------------
 *  SupershapeVisualizer.tsx  –  Visualizer Five (render-only module)
 * ------------------------------------------------------------------ */
"use client";

import {
  MakeMeshParams,
  ParametricCode9Params,
  SupershapeConfig,
  SupershapeMeshParams,
  SupershapeParams,
} from "@/types";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { allSupershapeConfigs } from "@/config/supershapeConfigs";
import {
  computeParams,
  createMakeMeshGeometry,
  createSupershapeGeometry,
  createSupershapeMeshGeometry,
} from "./geometryHelpers";
import {
  ColorMode,
  RenderingMode,
} from "./VisualizerFiveHelpers/types";

/* ------------------------------------------------------------------ */
const SEGMENTS     = 100;
const MORPH_FACTOR = 0.7;
const BASE_RADIUS  = 12.5;
const precomputed  = computeParams(SEGMENTS);

/* ------------------------------------------------------------------ */
/*  shared audio chain (singleton)                                    */
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null     = null;
let sharedAnalyser: AnalyserNode | null         = null;

/* ------------------------------------------------------------------ */
type ParamUnion =
  | SupershapeParams
  | SupershapeMeshParams
  | ParametricCode9Params
  | MakeMeshParams;

/* ------------------------------------------------------------------ */
export interface SupershapeVisualizerProps {
  audioUrl: string;
  isPaused?: boolean;

  /* externalised UI state */
  configIndex: number;
  renderingMode?: RenderingMode;  // optional so we can supply a default
  colorMode: ColorMode;
}

/* ------------------------------------------------------------------ */
export default function SupershapeVisualizer({
  audioUrl,
  isPaused = false,
  configIndex,
  renderingMode = "transparent",   // <-- DEFAULT = transparent
  colorMode,
}: SupershapeVisualizerProps) {
  /* refs --------------------------------------------------------- */
  const meshRef     = useRef<THREE.Mesh>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fftRef      = useRef<Uint8Array | null>(null);

  /* current config & params ------------------------------------- */
  const currentConfig: SupershapeConfig = useMemo(
    () => allSupershapeConfigs[configIndex],
    [configIndex],
  );

  const [params, setParams] = useState<ParamUnion>(
    () => currentConfig.params,
  );

  /* geometry ----------------------------------------------------- */
  const geometry = useMemo(() => {
    switch (currentConfig.type) {
      case "supershape":
        return createSupershapeGeometry(
          SEGMENTS,
          currentConfig.params as SupershapeParams,
          BASE_RADIUS,
          precomputed,
        );
      case "supershape_mesh":
        return createSupershapeMeshGeometry(
          currentConfig.params as SupershapeMeshParams,
        );
      case "make_mesh":
        return createMakeMeshGeometry(
          currentConfig.params as MakeMeshParams,
          100,
        );
      default:
        return new THREE.BufferGeometry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConfig, params]);

  /* permanent colour attribute (prevents flicker) --------------- */
  useEffect(() => {
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    if (pos && !geometry.getAttribute("color")) {
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3),
      );
    }
  }, [geometry]);

  /* material ----------------------------------------------------- */
  const material = useMemo(() => {
    switch (renderingMode) {
      case "wireframe":
        return new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xffffff,
        });

      case "transparent":          // (now the default mode)
        return new THREE.MeshPhysicalMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          transmission: 0.9,
        });

      case "rainbow":
        /* falls through to solid branch for base setup;
           vertexColours are enabled later in the animation loop */
       

      default: /* solid */
        return new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide,
          vertexColors: renderingMode === "rainbow",
          // pleasant teal-blue instead of dull grey
          color: new THREE.Color("hsl(200, 70%, 55%)"),
        });
    }
  }, [renderingMode]);

  /* shared-audio chain ------------------------------------------ */
  useEffect(() => {
    if (!sharedAudioElement) {
      sharedAudioElement = new Audio(audioUrl);
      sharedAudioElement.loop = true;
      sharedAudioElement.crossOrigin = "anonymous";

      sharedAudioContext = new AudioContext();
      const src = sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize = 1024;
      src.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } else if (sharedAudioElement.src !== audioUrl) {
      sharedAudioElement.src = audioUrl;
    }

    analyserRef.current = sharedAnalyser;
    if (!fftRef.current && sharedAnalyser)
      fftRef.current = new Uint8Array(sharedAnalyser.frequencyBinCount);

    (async () => {
      if (!sharedAudioElement || !sharedAudioContext) return;
      if (isPaused) {
        sharedAudioElement.pause();
      } else {
        if (sharedAudioContext.state === "suspended")
          await sharedAudioContext.resume();
        try {
          await sharedAudioElement.play();
        } catch (err) {
          console.warn(err);
        }
      }
    })();

    return () => {
      sharedAudioElement?.pause();
      if (sharedAudioElement) sharedAudioElement.currentTime = 0;
    };
  }, [audioUrl, isPaused]);

  /* animation loop ---------------------------------------------- */
  useFrame(({ clock }) => {
    const mesh = meshRef.current,
      analyser = analyserRef.current,
      fft = fftRef.current;
    if (!mesh || !analyser || !fft) return;

    analyser.getByteFrequencyData(fft);
    const amp = fft.reduce((s, v) => s + v, 0) / (fft.length * 255);

    /* rotation + pulsation */
    mesh.rotation.y += 0.003;
    mesh.rotation.x += 0.002;
    mesh.scale.setScalar(1 + amp * 0.5);

    /* morph (supershape-only) */
    setParams(prev => {
      if (currentConfig.type !== "supershape") return prev;
      const p = prev as SupershapeParams;
      const t = currentConfig.params as SupershapeParams;
      if (!p.params1 || !t.params1) return prev;

      return {
        params1: {
          m:  THREE.MathUtils.lerp(p.params1.m,  t.params1.m,  MORPH_FACTOR),
          n1: THREE.MathUtils.lerp(p.params1.n1, t.params1.n1, MORPH_FACTOR),
          n2: THREE.MathUtils.lerp(p.params1.n2, t.params1.n2, MORPH_FACTOR),
          n3: THREE.MathUtils.lerp(p.params1.n3, t.params1.n3, MORPH_FACTOR),
          a:  p.params1.a,
          b:  p.params1.b,
        },
        params2: {
          m:  THREE.MathUtils.lerp(p.params2.m,  t.params2.m,  MORPH_FACTOR),
          n1: THREE.MathUtils.lerp(p.params2.n1, t.params2.n1, MORPH_FACTOR),
          n2: THREE.MathUtils.lerp(p.params2.n2, t.params2.n2, MORPH_FACTOR),
          n3: THREE.MathUtils.lerp(p.params2.n3, t.params2.n3, MORPH_FACTOR),
          a:  p.params2.a,
          b:  p.params2.b,
        },
        resol: p.resol,
      } as SupershapeParams;
    });

    /* colour modes -------------------------------------------- */
    const stdMat = mesh.material as THREE.MeshStandardMaterial;
    if (colorMode === "audioAmplitude") {
      stdMat.color.setHSL(amp, 0.8, 0.5);
    } else if (colorMode === "frequencyBased") {
      const low =
        fft.slice(0, fft.length / 3).reduce((s, v) => s + v, 0) /
        (fft.length / 3 * 255);
      const high =
        fft
          .slice(-fft.length / 3)
          .reduce((s, v) => s + v, 0) /
        (fft.length / 3 * 255);
      stdMat.color.setRGB(low, 0.5, high);
    } else if (colorMode === "rainbow") {
      stdMat.color.setHSL(
        (clock.elapsedTime * 0.15 + amp * 0.3) % 1,
        0.7,
        0.6,
      );
    }

    /* per-vertex rainbow when requested ------------------------ */
    if (renderingMode === "rainbow") {
      const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
      const col = geometry.getAttribute("color")    as THREE.BufferAttribute;

      const t = clock.elapsedTime * 0.15;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        const hue = (Math.atan2(y, x) / (2 * Math.PI) + 0.5 + t) % 1;
        const c   = new THREE.Color().setHSL(hue, 0.7 + amp * 0.3, 0.5);
        col.setXYZ(i, c.r, c.g, c.b);
      }
      col.needsUpdate      = true;
      stdMat.vertexColors  = true;
    } else {
      stdMat.vertexColors = false;
    }
  });

  /* render-only — no UI  --------------------------------------- */
  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
