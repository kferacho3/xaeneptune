"use client";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
// Import only the necessary fractal geometry functions.
import {
  createApollonianGasketGeometry,
  createBuddhabrotSpheresGeometry,
  createCantorDustSpheresGeometry,
  createJuliaSetSpheresGeometry,
  createKochSnowflakeSpheresGeometry,
  createMandelSpheresGeometry,
  createMengerSpongeGeometry,
  createNFlakeSpheresGeometry,
  createPythagorasTree3DCubesGeometry,
  createSierpinskiCarpetCubesGeometry,
  createSierpinskiTetrahedronSpheresGeometry,
} from "./fractalHelpers";

// Types for rendering mode, color mode, and fractal type.
export type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
export type ColorMode = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";
export type FractalType =
  | "mandelbulb"
  | "mandelbox"
  | "mengerSponge"
  | "cantorDust"
  | "sierpinskiCarpet"
  | "juliaSet"
  | "pythagorasTree"
  | "kochSnowflake"
  | "nFlake"
  | "sierpinskiTetrahedron"
  | "buddhabrot"
  | "pythagorasTree3D"
  | "apollonianGasket";

const fractalTypes: FractalType[] = [
  "mandelbulb",
  "mandelbox",
  "mengerSponge",
  "cantorDust",
  "sierpinskiCarpet",
  "juliaSet",
  "pythagorasTree",
  "kochSnowflake",
  "nFlake",
  "sierpinskiTetrahedron",
  "buddhabrot",
  "pythagorasTree3D",
  "apollonianGasket",
];

interface FractalShaderProps {
  audioData: Uint8Array;
  renderingMode: RenderingMode;
  colorMode: ColorMode;
  fractalType: FractalType;
  setLocalFractalType: (type: FractalType) => void;
  setLocalRenderingMode: (mode: RenderingMode) => void;
  setLocalColorMode: (mode: ColorMode) => void;
}

// --- Shared Audio Objects ---
// (These module-level variables simulate a shared audio store used by all visualizers.)
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;

function FractalShader({
  audioData,
  renderingMode,
  colorMode,
  fractalType,
  setLocalFractalType,
  setLocalRenderingMode,
  setLocalColorMode,
}: FractalShaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fractalGeometry = useMemo<THREE.BufferGeometry>(() => {
    switch (fractalType) {
      case "mandelbulb":
      case "mandelbox":
        return createMandelSpheresGeometry({
          type: fractalType,
          nPower: 8,
          maxIterations: 80,
          dim: 64,
          sphereRadius: 0.01,
        });
      case "mengerSponge":
        return createMengerSpongeGeometry(3, 20);
      case "cantorDust":
        return createCantorDustSpheresGeometry(5, 2);
      case "sierpinskiCarpet":
        return createSierpinskiCarpetCubesGeometry(3, 10);
      case "juliaSet":
        return createJuliaSetSpheresGeometry(1, 3, new THREE.Vector2(-0.8, 0.1565), 0.1);
      case "pythagorasTree":
        return createPythagorasTree3DCubesGeometry(7, 5, 0.1);
      case "kochSnowflake":
        return createKochSnowflakeSpheresGeometry(3, 5, 0.1);
      case "nFlake":
        return createNFlakeSpheresGeometry(3, 5, "icosahedron", 0.2);
      case "sierpinskiTetrahedron":
        return createSierpinskiTetrahedronSpheresGeometry(4, 5, 0.2);
      case "buddhabrot":
        return createBuddhabrotSpheresGeometry({
          maxIterations: 20000,
          sampleCount: 50000,
          sphereRadius: 0.005,
        });
      case "pythagorasTree3D":
        return createPythagorasTree3DCubesGeometry(20, 5, 0.1);
      case "apollonianGasket":
        return createApollonianGasketGeometry(5);
      default:
        return new THREE.BufferGeometry();
    }
  }, [fractalType]);

  const originalPositionsRef = useRef<Float32Array | null>(null);
  useEffect(() => {
    const posAttr = fractalGeometry.getAttribute("position");
    if (posAttr) {
      originalPositionsRef.current = new Float32Array(posAttr.array);
    }
  }, [fractalGeometry]);

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
  const getMaterial = (mode: RenderingMode, color: ColorMode): THREE.Material => {
    if (mode === "wireframe") return wireframeMaterial;
    if (mode === "transparent") return transparentMaterial;
    if (color === "audioAmplitude") {
      const amp =
        audioData.length > 0
          ? audioData.reduce((sum, val) => sum + val, 0) / (audioData.length * 255)
          : 0;
      return new THREE.MeshPhongMaterial({
        color: new THREE.Color(amp, amp, amp),
        flatShading: true,
        side: THREE.DoubleSide,
      });
    }
    if (color === "frequencyBased") {
      const avgFrequency =
        audioData.length > 0 ? audioData.reduce((sum, val) => sum + val, 0) / audioData.length : 128;
      return new THREE.MeshPhongMaterial({
        color: new THREE.Color(avgFrequency / 255, 1 - avgFrequency / 255, 0.5),
        flatShading: true,
        side: THREE.DoubleSide,
      });
    }
    return solidMaterial;
  };
  const dynamicMaterial = useMemo(() => getMaterial(renderingMode, colorMode), [renderingMode, colorMode, audioData]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
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
    groupRef.current.clear();
    if (dynamicMaterial instanceof THREE.PointsMaterial) {
      const pointsMesh = new THREE.Points(fractalGeometry, dynamicMaterial);
      groupRef.current.add(pointsMesh);
    } else {
      const mesh = new THREE.Mesh(fractalGeometry, dynamicMaterial);
      groupRef.current.add(mesh);
    }
    return () => {
      groupRef.current?.children.forEach((child) => {
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
      groupRef.current?.clear();
    };
  }, [fractalGeometry, dynamicMaterial]);

  useFrame(() => {
    const posAttr = fractalGeometry.getAttribute("position");
    if (!groupRef.current || audioData.length === 0 || !posAttr || !originalPositionsRef.current)
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

  const availableRenderingModes: RenderingMode[] = ["solid", "wireframe", "rainbow", "transparent"];
  const availableColorModes: ColorMode[] = ["default", "audioAmplitude", "frequencyBased", "rainbow"];
  return (
    <group ref={groupRef}>
      <Html>
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 200,
            background: "rgba(0,0,0,0.7)",
            padding: "15px",
            color: "white",
            borderRadius: "8px",
            fontFamily: "sans-serif",
            fontSize: "14px",
          }}
        >
          <div>
            <label htmlFor="fractalType" style={{ display: "block", marginBottom: "5px" }}>
              Fractal:
            </label>
            <select
              id="fractalType"
              value={fractalType}
              onChange={(e) => setLocalFractalType(e.target.value as FractalType)}
              style={{ padding: "8px", borderRadius: "4px", width: "100%", marginBottom: "10px" }}
            >
              {fractalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="renderingMode" style={{ display: "block", marginBottom: "5px" }}>
              Rendering:
            </label>
            <select
              id="renderingMode"
              value={renderingMode}
              onChange={(e) => setLocalRenderingMode(e.target.value as RenderingMode)}
              style={{ padding: "8px", borderRadius: "4px", width: "100%", marginBottom: "10px" }}
            >
              {availableRenderingModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="colorMode" style={{ display: "block", marginBottom: "5px" }}>
              Color Mode:
            </label>
            <select
              id="colorMode"
              value={colorMode}
              onChange={(e) => setLocalColorMode(e.target.value as ColorMode)}
              style={{ padding: "8px", borderRadius: "4px", width: "100%" }}
            >
              {availableColorModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function VisualizerTwo({
  audioUrl,
  renderingMode: propRenderingMode,
  colorMode: propColorMode,
  fractalType: propFractalType,
  isPaused,
}: {
  audioUrl: string;
  isPaused: boolean;
  renderingMode?: RenderingMode;
  colorMode?: ColorMode;
  fractalType?: FractalType;
}) {
  // Parent already provides a Canvas.
  const [currentFractalType, setCurrentFractalType] = useState<FractalType>(
    propFractalType ?? "mandelbox"
  );
  const [localRenderingMode, setLocalRenderingMode] = useState<RenderingMode>(
    propRenderingMode ?? "transparent"
  );
  const [localColorMode, setLocalColorMode] = useState<ColorMode>(
    propColorMode ?? "frequencyBased"
  );
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameIdRef = useRef<number>(0);

  // Use shared audio objects so that the same uploaded file is used across visualizers.
  useEffect(() => {
    if (!sharedAudioElement) {
      sharedAudioElement = new Audio(audioUrl);
      sharedAudioElement.crossOrigin = "anonymous";
      sharedAudioElement.loop = true;
      sharedAudioContext = new AudioContext();
      const src = sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize = 64;
      src.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } else {
      if (sharedAudioElement.src !== audioUrl) {
        sharedAudioElement.src = audioUrl;
      }
    }
    audioElementRef.current = sharedAudioElement;
    audioContextRef.current = sharedAudioContext;
    analyserRef.current = sharedAnalyser;
    // Use audioSourceRef if possible (do not remove it)
    if (!audioSourceRef.current && sharedAudioContext && sharedAudioElement) {
      try {
        audioSourceRef.current = sharedAudioContext.createMediaElementSource(sharedAudioElement);
      } catch {
        // If already created, ignore.
      }
    }
    
    if (sharedAnalyser) {
      const bufferLength = sharedAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setAudioData(dataArray);
      const animate = () => {
        if (sharedAnalyser) {
          sharedAnalyser.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
        }
        animationFrameIdRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
    if (!isPaused) {
      if (sharedAudioContext && sharedAudioContext.state === "suspended") {
        sharedAudioContext.resume();
      }
      sharedAudioElement
        .play()
        .catch((err) =>
          console.warn("Audio play interrupted or blocked:", err)
        );
    } else {
      sharedAudioElement.pause();
    }
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [audioUrl, isPaused]);

  // Handle pause/resume changes.
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

  return (
    <FractalShader
      audioData={audioData}
      renderingMode={localRenderingMode}
      colorMode={localColorMode}
      fractalType={currentFractalType}
      setLocalFractalType={setCurrentFractalType}
      setLocalRenderingMode={setLocalRenderingMode}
      setLocalColorMode={setLocalColorMode}
    />
  );
}
