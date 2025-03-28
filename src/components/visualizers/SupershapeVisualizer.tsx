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

const SEGMENTS = 100;
const MORPH_FACTOR = 0.7;
const BASE_RADIUS = 12.5;
// Precompute (u,v) grid for certain shapes:
const precomputedParams = computeParams(SEGMENTS);

// --- SHARED AUDIO OBJECTS (Global) ---
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;

type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
type ColorMode = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";

export default function SupershapeVisualizer({
  audioUrl,
  isPaused = false,
}: {
  audioUrl: string;
  isPaused?: boolean;
}) {
  // References for audio and mesh
  const meshRef = useRef<THREE.Mesh>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Keeping these to avoid removing original lines
  const audioContextRef = useRef<AudioContext | null>(null); //
  const analyserRef = useRef<AnalyserNode | null>(null); //
  const audioDataRef = useRef<Uint8Array | null>(null);

  // Store the user-selected shape config (and its parameters)
  const [currentConfig, setCurrentConfig] = useState<SupershapeConfig>(
    allSupershapeConfigs[0],
  );
  const [_currentParams, setCurrentParams] = useState<
    | SupershapeParams
    | SupershapeMeshParams
    | ParametricCode9Params
    | MakeMeshParams
  >(currentConfig.params);
  const [targetParams, setTargetParams] = useState<typeof currentConfig.params>(
    currentConfig.params,
  );

  // Rendering and color modes
  const [renderingMode, setRenderingMode] = useState<RenderingMode>("solid");
  const [colorMode, setColorMode] = useState<ColorMode>("default");

  /**
   * Allows user to switch the shape config from a <select> dropdown.
   */
  const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    const newConfig = allSupershapeConfigs[selectedIndex];
    setCurrentConfig(newConfig);
    setCurrentParams(newConfig.params);
    setTargetParams(newConfig.params);
  };

  /**
   * On mount, pick a random Supershape config so that each load is different.
   */
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * allSupershapeConfigs.length);
    const randomConfig = allSupershapeConfigs[randomIndex];
    setCurrentConfig(randomConfig);
    setCurrentParams(randomConfig.params);
    setTargetParams(randomConfig.params);
  }, []);

  /**
   * Build the geometry from the current config.
   * If the config changes, we'll re-generate the geometry.
   */
  const geometry = useMemo(() => {
    switch (currentConfig.type) {
      case "supershape":
        return createSupershapeGeometry(
          SEGMENTS,
          currentConfig.params as SupershapeParams,
          BASE_RADIUS,
          precomputedParams,
        );
      case "supershape_mesh":
        return createSupershapeMeshGeometry(
          currentConfig.params as SupershapeMeshParams,
        );
      case "parametric_code9":
        // Provide your own parametric geometry if needed
        return new THREE.BufferGeometry();
      case "make_mesh":
        return createMakeMeshGeometry(
          currentConfig.params as MakeMeshParams,
          100,
        );
      default:
        return new THREE.BufferGeometry();
    }
  }, [currentConfig]);

  /**
   * Build the material based on the renderingMode.
   * If the user selects "rainbow" in renderingMode, we'll do per-vertex coloring below,
   * but we still need a base material.
   */
  const material = useMemo(() => {
    if (renderingMode === "wireframe") {
      return new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xffffff,
      });
    } else if (renderingMode === "transparent") {
      return new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        transmission: 0.9,
        side: THREE.DoubleSide,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      });
    } else {
      // "solid" or "rainbow" share a default standard material
      return new THREE.MeshStandardMaterial({ side: THREE.DoubleSide });
    }
  }, [renderingMode]);

  /**
   * First effect: set up the SHARED audio (or update it), just like VisualizerOne–Four
   * We do NOT create a local audio each time, we rely on sharedAudioElement, etc.
   */
  useEffect(() => {
    if (!sharedAudioElement) {
      // Create new shared audio if it doesn't exist yet
      sharedAudioElement = new Audio(audioUrl);
      sharedAudioElement.crossOrigin = "anonymous";
      sharedAudioElement.loop = true;

      // Create context
      sharedAudioContext = new AudioContext();
      const src =
        sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize = 2048;
      src.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } else {
      // If we already have shared audio, update src if it changed
      if (sharedAudioElement.src !== audioUrl) {
        sharedAudioElement.src = audioUrl;
      }
    }

    // Assign them to local refs so the rest of the code sees them
    audioRef.current = sharedAudioElement;
    audioContextRef.current = sharedAudioContext;
    analyserRef.current = sharedAnalyser;

    // Prepare our audio data array
    if (sharedAnalyser) {
      audioDataRef.current = new Uint8Array(sharedAnalyser.frequencyBinCount);
    }

    // If not paused, attempt to resume & play
    if (
      !isPaused &&
      sharedAudioContext &&
      sharedAudioContext.state === "suspended"
    ) {
      sharedAudioContext.resume();
    }
    if (!isPaused) {
      sharedAudioElement
        .play()
        .catch((err) => console.warn("Audio play error:", err));
    } else {
      sharedAudioElement.pause();
    }

    // Cleanup: we do NOT tear down shared audio so the file persists across modes
    return () => {
      // no cleanup for shared audio
    };
  }, [audioUrl, isPaused]);

  /**
   * Another effect: if isPaused changes, handle it
   */
  useEffect(() => {
    if (!sharedAudioElement || !sharedAudioContext) return;
    if (isPaused) {
      sharedAudioElement.pause();
    } else {
      (async () => {
        if (sharedAudioContext.state === "suspended") {
          await sharedAudioContext.resume();
        }
        try {
          await sharedAudioElement.play();
        } catch (err) {
          console.warn("Audio play error:", err);
        }
      })();
    }
  }, [isPaused]);

  /**
   * In the render loop, we read the shared analyser data, compute new shape morph
   * and color changes, and apply them to the mesh.
   */
  useFrame(() => {
    if (!sharedAnalyser || !audioDataRef.current || !meshRef.current) return;

    // Get frequency data from the shared analyser
    sharedAnalyser.getByteFrequencyData(audioDataRef.current);
    const normData = Array.from(audioDataRef.current).map((val) => val / 255);
    const overallAmplitude =
      normData.reduce((sum, v) => sum + v, 0) / normData.length;

    // Lerp from current to target shape params
    setCurrentParams((prev) => {
      if (currentConfig.type === "supershape") {
        const p = prev as SupershapeParams;
        const t = targetParams as SupershapeParams;
        if (!p.params1 || !t.params1) return prev;

        return {
          params1: {
            m: THREE.MathUtils.lerp(p.params1.m, t.params1.m, MORPH_FACTOR),
            n1: THREE.MathUtils.lerp(p.params1.n1, t.params1.n1, MORPH_FACTOR),
            n2: THREE.MathUtils.lerp(p.params1.n2, t.params1.n2, MORPH_FACTOR),
            n3: THREE.MathUtils.lerp(p.params1.n3, t.params1.n3, MORPH_FACTOR),
            a: p.params1.a,
            b: p.params1.b,
          },
          params2: {
            m: THREE.MathUtils.lerp(p.params2.m, t.params2.m, MORPH_FACTOR),
            n1: THREE.MathUtils.lerp(p.params2.n1, t.params2.n1, MORPH_FACTOR),
            n2: THREE.MathUtils.lerp(p.params2.n2, t.params2.n2, MORPH_FACTOR),
            n3: THREE.MathUtils.lerp(p.params2.n3, t.params2.n3, MORPH_FACTOR),
            a: p.params2.a,
            b: p.params2.b,
          },
          resol: p.resol,
        } as SupershapeParams;
      } else if (
        currentConfig.type === "supershape_mesh" ||
        currentConfig.type === "parametric_code9" ||
        currentConfig.type === "make_mesh"
      ) {
        // Flatten, lerp each numeric key
        const flatPrev = prev as unknown as { [key: string]: number };
        const flatTarget = targetParams as unknown as { [key: string]: number };
        const newParams: { [key: string]: number } = {};
        for (const k in flatPrev) {
          if (Object.prototype.hasOwnProperty.call(flatPrev, k)) {
            newParams[k] = THREE.MathUtils.lerp(
              flatPrev[k],
              flatTarget[k] ?? flatPrev[k],
              MORPH_FACTOR,
            );
          }
        }
        return newParams as unknown as typeof prev;
      }
      return prev;
    });

    // Spin and scale the mesh
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x += 0.002;
    meshRef.current.scale.setScalar(1 + overallAmplitude * 0.5);

    // Simple color responses
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (colorMode === "audioAmplitude") {
      mat.color.setHSL(overallAmplitude, 0.8, 0.5);
    } else if (colorMode === "frequencyBased") {
      const low = normData.slice(0, 80).reduce((a, b) => a + b, 0) / 80;
      const mid = normData.slice(80, 160).reduce((a, b) => a + b, 0) / 80;
      const high = normData.slice(160, 256).reduce((a, b) => a + b, 0) / 96;
      mat.color.setRGB(low, mid, high);
    } else if (colorMode === "rainbow") {
      const t = performance.now() / 3000;
      mat.color.setHSL((t * 0.2 + overallAmplitude * 0.3) % 1, 0.7, 0.6);
    }

    // If "rainbow" rendering mode, we do per-vertex color
    if (renderingMode === "rainbow" && geometry.attributes.position) {
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = new Float32Array(positions.length);
      const time = performance.now() / 3000;

      for (let i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        // A polar color approach
        const hue = (Math.atan2(y, x) / (2 * Math.PI) + 0.5 + time * 0.1) % 1;
        const saturation = 0.7 + overallAmplitude * 0.3;
        const lightness = 0.5;
        const col = new THREE.Color().setHSL(hue, saturation, lightness);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    } else if (geometry.attributes.color) {
      // Remove the color attribute if no longer in rainbow
      geometry.deleteAttribute("color");
    }
  });

  /**
   * As a final step, we render the mesh + UI controls in <Html>.
   */
  return (
    <>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <Html>
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            background: "rgba(0,0,0,0.5)",
            padding: 10,
            color: "white",
            zIndex: 10,
          }}
        >
          {/* Dropdown to switch among allSupershapeConfigs */}
          <div>
            <label
              htmlFor="configSelect"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Supershape Type:
            </label>
            <select
              id="configSelect"
              value={allSupershapeConfigs.indexOf(currentConfig)}
              onChange={handleConfigChange}
              style={{
                padding: "8px",
                borderRadius: "4px",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              {allSupershapeConfigs.map((cfg, idx) => (
                <option key={idx} value={idx}>
                  {`Config ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
          {/* Rendering mode dropdown */}
          <div>
            <label
              htmlFor="renderingMode"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Rendering Mode:
            </label>
            <select
              id="renderingMode"
              value={renderingMode}
              onChange={(e) =>
                setRenderingMode(e.target.value as RenderingMode)
              }
              style={{
                padding: "8px",
                borderRadius: "4px",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
          {/* Color mode dropdown */}
          <div>
            <label
              htmlFor="colorMode"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Color Mode:
            </label>
            <select
              id="colorMode"
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as ColorMode)}
              style={{ padding: "8px", borderRadius: "4px", width: "100%" }}
            >
              <option value="default">Default</option>
              <option value="audioAmplitude">Audio Amplitude</option>
              <option value="frequencyBased">Frequency Based</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </div>
          {/* Display current param values */}
          <div style={{ marginTop: "10px", fontSize: "12px" }}>
            Current Params:
            <pre
              style={{
                maxWidth: "200px",
                maxHeight: "150px",
                overflowY: "auto",
                background: "rgba(0,0,0,0.2)",
                marginTop: "5px",
                padding: "5px",
                borderRadius: "4px",
              }}
            >
              {JSON.stringify(_currentParams, null, 2)}
            </pre>
          </div>
        </div>
      </Html>
    </>
  );
}
