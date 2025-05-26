/* ---------------------------------------------------------------------
 *  SupershapeVisualizer.tsx  –  stable, warning-free, no flicker
 * --------------------------------------------------------------------*/
"use client";

import {
  MakeMeshParams,
  ParametricCode9Params,
  SupershapeConfig,
  SupershapeMeshParams,
  SupershapeParams,
} from "@/types";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { allSupershapeConfigs } from "../../config/supershapeConfigs";
import {
  computeParams,
  createMakeMeshGeometry,
  createSupershapeGeometry,
  createSupershapeMeshGeometry,
} from "./geometryHelpers";

/* ──────────────────────────────────────────────────────────────── */
const SEGMENTS      = 100;
const MORPH_FACTOR  = 0.7;
const BASE_RADIUS   = 12.5;
const precomputed   = computeParams(SEGMENTS);

/* one shared audio chain for every instance */
let sharedAudioElement : HTMLAudioElement | null = null;
let sharedAudioContext : AudioContext      | null = null;
let sharedAnalyser     : AnalyserNode      | null = null;

/* helper types */
type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
type ColorMode     = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";
type ParamUnion =
  | SupershapeParams
  | SupershapeMeshParams
  | ParametricCode9Params
  | MakeMeshParams;
/* ──────────────────────────────────────────────────────────────── */

export default function SupershapeVisualizer({
  audioUrl,
  isPaused = false,
}: {
  audioUrl : string;
  isPaused?: boolean;
}) {
  /* refs */
  const meshRef     = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material>>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fftRef      = useRef<Uint8Array | null>(null);

  /* config & params */
  const [currentConfig, setCurrentConfig] = useState<SupershapeConfig>(
    allSupershapeConfigs[0],
  );
  const [params, setParams] = useState<ParamUnion>(() => allSupershapeConfigs[0].params);

  /* UI state */
  const [renderingMode, setRenderingMode] = useState<RenderingMode>("solid");
  const [colorMode,     setColorMode    ] = useState<ColorMode>("default");

  /* ── handlers ── */
  const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    const cfg = allSupershapeConfigs[idx];
    setCurrentConfig(cfg);
    setParams(cfg.params);
  };

  /* random start config (once) */
  useEffect(() => {
    const idx = Math.floor(Math.random() * allSupershapeConfigs.length);
    const cfg = allSupershapeConfigs[idx];
    setCurrentConfig(cfg);
    setParams(cfg.params);
  }, []);

  /* ── geometry ── */
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
        return createSupershapeMeshGeometry(currentConfig.params as SupershapeMeshParams);
      case "make_mesh":
        return createMakeMeshGeometry(currentConfig.params as MakeMeshParams, 100);
      default:
        return new THREE.BufferGeometry();
    }
  }, [currentConfig]);

  /* permanent colour attribute → prevents WebGL attribute-mismatch flicker */
  useEffect(() => {
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    if (pos && !geometry.getAttribute("color")) {
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3),
      );
    }
  }, [geometry]);

  /* ── material ── */
  const material = useMemo(() => {
    switch (renderingMode) {
      case "wireframe":
        return new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff });
      case "transparent":
        return new THREE.MeshPhysicalMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
          roughness: 0.1,
          transmission: 0.9,
        });
      default: // solid & rainbow
        return new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide,
          vertexColors: renderingMode === "rainbow",
        });
    }
  }, [renderingMode]);

  /* ── shared-audio set-up ── */
  useEffect(() => {
    if (!sharedAudioElement) {
      sharedAudioElement            = new Audio(audioUrl);
      sharedAudioElement.loop       = true;
      sharedAudioElement.crossOrigin = "anonymous";

      sharedAudioContext            = new AudioContext();
      const src = sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser                = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize        = 1024;
      src.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } else if (sharedAudioElement.src !== audioUrl) {
      sharedAudioElement.src = audioUrl;
    }

    analyserRef.current = sharedAnalyser;
    if (!fftRef.current && sharedAnalyser)
      fftRef.current = new Uint8Array(sharedAnalyser.frequencyBinCount);

    const syncPlayState = async () => {
      if (!sharedAudioElement || !sharedAudioContext) return;
      if (isPaused) {
        sharedAudioElement.pause();
      } else {
        if (sharedAudioContext.state === "suspended")
          await sharedAudioContext.resume();
        try { await sharedAudioElement.play(); } catch (err) { console.warn(err); }
      }
    };
    void syncPlayState();

    return () => {
      sharedAudioElement?.pause();
      if (sharedAudioElement) sharedAudioElement.currentTime = 0;
    };
  }, [audioUrl, isPaused]);

  /* ── animation loop ── */
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const analyser = analyserRef.current;
    const fft = fftRef.current;
    if (!mesh || !analyser || !fft) return;

    analyser.getByteFrequencyData(fft);
    const amp = fft.reduce((s, v) => s + v, 0) / (fft.length * 255);

    /* rotate & scale */
    mesh.rotation.y += 0.003;
    mesh.rotation.x += 0.002;
    mesh.scale.setScalar(1 + amp * 0.5);

    /* smooth param morph (only for supershape) */
    setParams(prev => {
      if (currentConfig.type !== "supershape") return prev;
      const p = prev as SupershapeParams;
      const t = currentConfig.params as SupershapeParams;
      if (!p.params1 || !t.params1) return prev;

      return {
        params1: {
          m : THREE.MathUtils.lerp(p.params1.m , t.params1.m , MORPH_FACTOR),
          n1: THREE.MathUtils.lerp(p.params1.n1, t.params1.n1, MORPH_FACTOR),
          n2: THREE.MathUtils.lerp(p.params1.n2, t.params1.n2, MORPH_FACTOR),
          n3: THREE.MathUtils.lerp(p.params1.n3, t.params1.n3, MORPH_FACTOR),
          a : p.params1.a, b: p.params1.b,
        },
        params2: {
          m : THREE.MathUtils.lerp(p.params2.m , t.params2.m , MORPH_FACTOR),
          n1: THREE.MathUtils.lerp(p.params2.n1, t.params2.n1, MORPH_FACTOR),
          n2: THREE.MathUtils.lerp(p.params2.n2, t.params2.n2, MORPH_FACTOR),
          n3: THREE.MathUtils.lerp(p.params2.n3, t.params2.n3, MORPH_FACTOR),
          a : p.params2.a, b: p.params2.b,
        },
        resol: p.resol,
      } as SupershapeParams;
    });

    /* colour modes */
    const stdMat = mesh.material as THREE.MeshStandardMaterial;
    if (colorMode === "audioAmplitude") {
      stdMat.color.setHSL(amp, 0.8, 0.5);
    } else if (colorMode === "frequencyBased") {
      const low  = fft.slice(0, fft.length / 3).reduce((s, v) => s + v, 0) / (fft.length / 3 * 255);
      const high = fft.slice(-fft.length / 3).reduce((s, v) => s + v, 0) / (fft.length / 3 * 255);
      stdMat.color.setRGB(low, 0.5, high);
    } else if (colorMode === "rainbow") {
      stdMat.color.setHSL((clock.elapsedTime * 0.15 + amp * 0.3) % 1, 0.7, 0.6);
    }

    /* per-vertex rainbow */
    if (renderingMode === "rainbow") {
      const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
      const col = geometry.getAttribute("color")    as THREE.BufferAttribute;
      const t   = clock.elapsedTime * 0.15;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        const hue = (Math.atan2(y, x) / (2 * Math.PI) + 0.5 + t) % 1;
        const c = new THREE.Color().setHSL(hue, 0.7 + amp * 0.3, 0.5);
        col.setXYZ(i, c.r, c.g, c.b);
      }
      col.needsUpdate = true;
      stdMat.vertexColors = true;
    } else {
      stdMat.vertexColors = false;
    }
  });

  /* ── JSX ── */
  return (
    <>
      <mesh ref={meshRef} geometry={geometry} material={material} />

      <Html>
        <div style={{
          position:"absolute", top:20, left:20, padding:10,
          background:"rgba(0,0,0,0.55)", color:"#fff",
          borderRadius:8, fontSize:14, zIndex:10,
        }}>
          {/* Supershape picker */}
          <div>
            <label>Supershape:&nbsp;</label>
            <select
              value={allSupershapeConfigs.indexOf(currentConfig)}
              onChange={handleConfigChange}
            >
              {allSupershapeConfigs.map((cfg, idx) => (
                <option key={idx} value={idx}>
                  {(cfg as { name?: string }).name ?? `Config ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Rendering mode */}
          <div style={{ marginTop:6 }}>
            <label>Rendering:&nbsp;</label>
            <select
              value={renderingMode}
              onChange={e => setRenderingMode(e.target.value as RenderingMode)}
            >
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>

          {/* Colour mode */}
          <div style={{ marginTop:6 }}>
            <label>Colour:&nbsp;</label>
            <select
              value={colorMode}
              onChange={e => setColorMode(e.target.value as ColorMode)}
            >
              <option value="default">Default</option>
              <option value="audioAmplitude">Audio Amplitude</option>
              <option value="frequencyBased">Frequency Based</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </div>

          {/* live params read-out (keeps `params` “used”) */}
          <div style={{ marginTop:8, maxHeight:120, overflowY:"auto", fontSize:12 }}>
            <strong>Current&nbsp;Params:</strong>
            <pre style={{ whiteSpace:"pre-wrap" }}>
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>
        </div>
      </Html>
    </>
  );
}
