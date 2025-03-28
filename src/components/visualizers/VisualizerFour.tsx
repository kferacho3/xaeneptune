"use client";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// --- SHARED AUDIO OBJECTS (Global) ---
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;

// 28 total color palettes (8 original + 20 new)
const colorPalettes = [
  ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"],
  ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  ["#4506CB", "#7A0BC0", "#A20BD1", "#C700B9", "#F900BF"],
  ["#0B666A", "#5CB85C", "#FDE74C", "#FFC857", "#E9724C"],
  ["#1A535C", "#4ECDC4", "#F7FFF7", "#FF6B6B", "#FFE66D"],
  ["#283618", "#606C38", "#B8B8B8", "#DDA15E", "#BC6C25"],
  ["#03045E", "#0077B6", "#00A6FB", "#B4D2E7", "#F1FAEE"],
  ["#6A040F", "#9D0208", "#D7263D", "#F48C06", "#FFBA08"],
  // 20 brand-new ones
  ["#2B2D42", "#3A86FF", "#FF006E", "#FB5607", "#FFBE0B"],
  ["#FAF3DD", "#C8D5B9", "#8FC0A9", "#68B0AB", "#4A7C59"],
  ["#0A0908", "#22333B", "#EAE0D5", "#C6AC8F", "#5E503F"],
  ["#DCE8C0", "#F5634A", "#DF2935", "#86BA90", "#CCFF66"],
  ["#7C4FFF", "#651FFF", "#6200EA", "#B385FF", "#4E148C"],
  ["#665191", "#F28482", "#F6BD60", "#F5CAC3", "#84A59D"],
  ["#8AAAE5", "#FFC2CE", "#FFA384", "#FFBF81", "#FFEE93"],
  ["#E7EFC5", "#C4DFAA", "#90C290", "#4F6C50", "#2C3639"],
  ["#BCE6EB", "#FDFA66", "#FFB5C2", "#FF94CC", "#FA5882"],
  ["#3F72AF", "#D3E9FF", "#F3F7FA", "#364F6B", "#FC5185"],
  ["#DFE7FD", "#C2BBF0", "#7E78D2", "#5952C1", "#27296D"],
  ["#34344A", "#883677", "#F7E5F1", "#CFC4E9", "#5E4352"],
  ["#F0EFF4", "#D3CCE3", "#E9E4F0", "#BBA0CA", "#C7B8E1"],
  ["#FAD5A5", "#FFB385", "#FFAAA6", "#DEA2A2", "#F6EAC2"],
  ["#4F000B", "#720026", "#CE4257", "#FF7F51", "#FFB7C3"],
  ["#B8FEF1", "#BAFFB4", "#FFD9DA", "#FFA6C9", "#FF74B1"],
  ["#C6F1D6", "#F3FFBD", "#FFDA9A", "#FFA5A5", "#FF6767"],
  ["#F72585", "#7209B7", "#560BAD", "#480CA8", "#3A0CA3"],
  ["#6D6875", "#B5838D", "#E5989B", "#FFB4A2", "#FFCDB2"],
  ["#110B11", "#2C2A4A", "#801BF2", "#B726FF", "#F5B8FF"],
];

// --- Helper Functions ---
function setRules(ruleValue: number): number[] {
  // Convert "ruleValue" (e.g. 90) to binary => array of bits
  const ruleSet = ruleValue.toString(2).padStart(8, "0");
  return ruleSet.split("").map(Number);
}

function calculateState(
  ruleSet: number[],
  left: number,
  current: number,
  right: number,
): number {
  // Build a 3-bit number from left/current/right bits
  const neighborhood = (left << 2) | (current << 1) | right;
  // 7 - neighborhood indexes into ruleSet
  const index = 7 - neighborhood;
  return ruleSet[index];
}

// --- Interfaces ---
interface OrbitingShape {
  orbitAngle: number; // orbit position
  orbitRadius: number; // distance from main shape
  orbitSpeed: number; // revolve speed
  shapeGeo: "sphere" | "cone" | "cylinder" | "box";
  color: THREE.Color;
  scale: THREE.Vector3;
}

interface CellData {
  color: THREE.Color;
  state: number;
  position: THREE.Vector3;
  targetScale: THREE.Vector3;
  targetColor: THREE.Color;
  shapeSize: number;
  orbits: OrbitingShape[]; // sub-shapes orbiting the main shape
}

interface CellProps {
  data: CellData;
}

function Cell({ data }: CellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainMeshRef = useRef<THREE.Mesh>(null);

  // Memoize each orbit shape’s geometry to avoid re-creating geometry on every frame
  const orbitGeometries = useMemo(() => {
    // For performance, pre-create possible geometry you might use
    const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const coneGeo = new THREE.ConeGeometry(0.5, 1, 16);
    const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    return {
      sphere: sphereGeo,
      cone: coneGeo,
      cylinder: cylinderGeo,
      box: boxGeo,
    };
  }, []);

  // Animate each frame (Three.js style)
  useFrame((_state, delta) => {
    if (!groupRef.current || !mainMeshRef.current) return;
    const group = groupRef.current;
    const mainMesh = mainMeshRef.current;

    // Interpolate color and scale for the main shape
    mainMesh.scale.lerp(data.targetScale, 0.1);
    const mat = mainMesh.material as THREE.MeshStandardMaterial;
    mat.color.lerp(data.color, 0.1);

    // Animate orbiting shapes
    data.orbits.forEach((orbit, idx) => {
      const child = group.children[idx + 1] as THREE.Mesh; // +1 because the first child is the main shape
      if (!child) return;

      orbit.orbitAngle += orbit.orbitSpeed * delta;
      const x = Math.cos(orbit.orbitAngle) * orbit.orbitRadius;
      const z = Math.sin(orbit.orbitAngle) * orbit.orbitRadius;
      child.position.set(x, 0, z);

      // Lerp color & scale
      const childMat = child.material as THREE.MeshStandardMaterial;
      childMat.color.lerp(orbit.color, 0.1);
      child.scale.lerp(orbit.scale, 0.1);
    });
  });

  return (
    <group ref={groupRef} position={data.position}>
      {/* Main shape */}
      <mesh ref={mainMeshRef}>
        <boxGeometry args={[data.shapeSize, data.shapeSize, data.shapeSize]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Orbiting shapes */}
      {data.orbits.map((orbit, idx) => {
        // Switch geometry from the memo
        const geometry = orbitGeometries[orbit.shapeGeo];
        return (
          <mesh key={idx} geometry={geometry}>
            <meshStandardMaterial color={orbit.color} />
          </mesh>
        );
      })}
    </group>
  );
}

interface VisualizerFourProps {
  audioUrl: string;
  isPaused: boolean;
}

const CELL_SIZE = 5;
const INITIAL_RULE = 45;

// Grid sizes for your CA
const MY_GRID_WIDTH = 3;
const MY_GRID_HEIGHT = 10;

export default function VisualizerFour({
  audioUrl,
  isPaused,
}: VisualizerFourProps) {
  // The “Rule 90” or whichever rule you choose
  const [ruleSet] = useState<number[]>(() => setRules(INITIAL_RULE));
  const [generation, setGeneration] = useState(0);

  // Current color palette and rendering settings
  const [currentPalette, setCurrentPalette] = useState<THREE.Color[]>(
    colorPalettes[0].map((c) => new THREE.Color(c)),
  );

  const [renderingMode, setRenderingMode] = useState<
    "solid" | "wireframe" | "rainbow" | "transparent"
  >("solid");

  const [colorMode, setColorMode] = useState<
    "default" | "audioAmplitude" | "frequencyBased" | "rainbow"
  >("default");

  // The “intensity” multiplier for FFT-based effects:
  const [fftIntensity, setFftIntensity] = useState(0.5);

  // Instead of storing audio data in React state, store it in a ref
  // so we don’t re-render the entire component on every frame.
  const audioDataRef = useRef<Uint8Array | null>(null);

  // Keep references to the shared audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);

  // Build initial cells in a memo, so they don’t get re-generated all the time
  const memoizedInitialCells = useMemo<CellData[]>(() => {
    const arr: CellData[] = [];
    for (let row = 0; row < MY_GRID_HEIGHT; row++) {
      for (let col = 0; col < MY_GRID_WIDTH; col++) {
        const randomIndex = Math.floor(Math.random() * currentPalette.length);

        // Size from 0.5..4
        const shapeSize = Math.random() * 3.5 + 0.5;

        // 1..3 orbiting shapes
        const orbitCount = Math.floor(Math.random() * 3) + 1;
        const orbits: OrbitingShape[] = Array.from(
          { length: orbitCount },
          () => {
            const orbitShapeChoice: Array<
              "sphere" | "cone" | "cylinder" | "box"
            > = ["sphere", "cone", "cylinder", "box"];
            const shapeGeo =
              orbitShapeChoice[
                Math.floor(Math.random() * orbitShapeChoice.length)
              ];

            return {
              orbitAngle: Math.random() * Math.PI * 2,
              orbitRadius: shapeSize * (0.75 + Math.random() * 1.5),
              orbitSpeed: 0.5 + Math.random() * 1.5,
              shapeGeo,
              color:
                currentPalette[
                  Math.floor(Math.random() * currentPalette.length)
                ].clone(),
              scale: new THREE.Vector3(
                Math.random() * 1 + 0.3,
                Math.random() * 1 + 0.3,
                Math.random() * 1 + 0.3,
              ),
            };
          },
        );

        arr.push({
          color: currentPalette[randomIndex].clone(),
          state: Math.random() > 0.5 ? 1 : 0,
          position: new THREE.Vector3(
            (col - MY_GRID_WIDTH / 2) * CELL_SIZE * 2,
            0,
            (row - MY_GRID_HEIGHT / 2) * CELL_SIZE * 2,
          ),
          targetScale: new THREE.Vector3(shapeSize, shapeSize, shapeSize),
          targetColor: currentPalette[randomIndex].clone(),
          shapeSize,
          orbits,
        });
      }
    }
    return arr;
  }, [currentPalette]);

  // Our Cells state
  const [cells, setCells] = useState<CellData[]>(memoizedInitialCells);

  // Re-init the grid whenever the palette changes
  useEffect(() => {
    setCells(memoizedInitialCells);
    setGeneration(0);
  }, [memoizedInitialCells]);

  // Basic 1D CA update across each row
  const updateCA = () => {
    setCells((prevCells) => {
      if (!prevCells) return [];
      return prevCells.map((cell, i) => {
        const col = i % MY_GRID_WIDTH;
        const row = Math.floor(i / MY_GRID_WIDTH);

        // Wrap around horizontally
        const leftIndex =
          row * MY_GRID_WIDTH + ((col - 1 + MY_GRID_WIDTH) % MY_GRID_WIDTH);
        const rightIndex = row * MY_GRID_WIDTH + ((col + 1) % MY_GRID_WIDTH);

        const leftState = prevCells[leftIndex].state;
        const rightState = prevCells[rightIndex].state;
        const currentState = cell.state;

        // Determine new state from the ruleSet
        const newState = calculateState(
          ruleSet,
          leftState,
          currentState,
          rightState,
        );

        // If new state is 0, color black; else pick from the palette
        let nextColor: THREE.Color;
        if (newState === 0) {
          nextColor = new THREE.Color(0x000000);
        } else {
          const rIndex = Math.floor(Math.random() * currentPalette.length);
          nextColor = currentPalette[rIndex].clone();
        }

        return {
          ...cell,
          state: newState,
          color: nextColor,
          targetColor: nextColor,
        };
      });
    });

    setGeneration((g) => g + 1);
  };

  // Let the user pick a random palette
  const handleRandomPalette = () => {
    const randomIndex = Math.floor(Math.random() * colorPalettes.length);
    setCurrentPalette(
      colorPalettes[randomIndex].map((c) => new THREE.Color(c)),
    );
  };

  // Audio Setup (Shared)
  useEffect(() => {
    if (!sharedAudioElement) {
      // Create brand-new audio if none is shared yet
      sharedAudioElement = new Audio(audioUrl);
      sharedAudioElement.crossOrigin = "anonymous";
      sharedAudioElement.loop = true;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API not supported in this browser.");
        return;
      }
      sharedAudioContext = new AudioContextClass();
      const src =
        sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize = 32;

      // Connect the chain: Source -> Analyser -> Destination
      src.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } else {
      // If the shared audio already exists, just update its src if needed
      if (sharedAudioElement.src !== audioUrl) {
        sharedAudioElement.src = audioUrl;
      }
    }

    // Keep local references
    audioRef.current = sharedAudioElement;
    audioContextRef.current = sharedAudioContext;
    audioAnalyserRef.current = sharedAnalyser;

    // Store FFT data in a ref to avoid re-renders:
    if (sharedAnalyser) {
      // Initialize the buffer once:
      audioDataRef.current = new Uint8Array(sharedAnalyser.frequencyBinCount);

      // Launch a one-time RA loop that updates the ref but does NOT set state
      const dataArray = audioDataRef.current;
      const animate = () => {
        if (sharedAnalyser && dataArray) {
          sharedAnalyser.getByteFrequencyData(dataArray);
        }
        requestAnimationFrame(animate);
      };
      animate();
    }

    // Start or stop audio
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

    // We do NOT tear down the shared audio in this snippet
    // so multiple visualizers can use it
  }, [audioUrl, isPaused]);

  // Main animation loop using R3F’s useFrame
  useFrame(() => {
    if (isPaused || !cells) return;

    // Update the cellular automaton every 10 frames
    if (generation % 10 === 0) {
      updateCA();
    }

    // Incorporate the FFT data every frame
    const dataArray = audioDataRef.current;
    if (!dataArray) return;

    // We do a single setCells at the end so we only cause 1 state update per frame
    setCells((prevCells) => {
      // If your grid is large, consider updating in place & returning the same array
      // but be careful with React’s immutability patterns. For moderate sizes, this is fine:
      return prevCells.map((cell, i) => {
        const amplitude = dataArray[i % dataArray.length] / 255; // 0..1

        // Some color modes
        if (colorMode === "audioAmplitude") {
          // Lerp to white depending on amplitude
          cell.targetColor.lerp(
            new THREE.Color(0xffffff),
            1 - amplitude * fftIntensity,
          );
        } else if (colorMode === "frequencyBased") {
          // Frequency-based => direct HSL from amplitude
          const h = amplitude * fftIntensity;
          cell.targetColor.setHSL(h % 1, 0.8, 0.5);
        } else if (colorMode === "rainbow") {
          // Rotating hue
          const h = (amplitude + generation * 0.01) % 1;
          cell.targetColor.setHSL(h, 0.7, 0.5);
        }

        // Make the shape scale respond to amplitude
        // (0.5..4) range, plus a multiplier
        const shapeScale = 0.5 + amplitude * 3.5 * fftIntensity;
        cell.targetScale.set(shapeScale, shapeScale, shapeScale);

        // Also scale the orbit shapes
        cell.orbits.forEach((orbit) => {
          const orbitScale = 0.2 + amplitude * fftIntensity;
          orbit.scale.set(orbitScale, orbitScale, orbitScale);

          // Optionally shift color based on orbitAngle + amplitude
          const hueShift = (amplitude + orbit.orbitAngle) % 1;
          orbit.color.setHSL(hueShift, 0.7, 0.5);
        });

        // Make the shape bounce in Y
        const bounceOffset = amplitude * 2 * fftIntensity;
        cell.position.y = bounceOffset;

        return { ...cell };
      });
    });
  });

  return (
    <>
      {cells.map((cell, i) => (
        <Cell key={i} data={cell} />
      ))}

      {/* UI overlay (using @react-three/drei’s <Html>) */}
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
          {/* Rendering mode dropdown */}
          <div>
            <label>Rendering Mode:</label>
            <select
              value={renderingMode}
              onChange={(e) =>
                setRenderingMode(
                  e.target.value as
                    | "solid"
                    | "wireframe"
                    | "rainbow"
                    | "transparent",
                )
              }
            >
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>

          {/* Color mode dropdown */}
          <div>
            <label>Color Mode:</label>
            <select
              value={colorMode}
              onChange={(e) =>
                setColorMode(
                  e.target.value as
                    | "default"
                    | "audioAmplitude"
                    | "frequencyBased"
                    | "rainbow",
                )
              }
            >
              <option value="default">Default</option>
              <option value="audioAmplitude">Audio Amplitude</option>
              <option value="frequencyBased">Frequency Based</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </div>

          {/* Random palette button */}
          <button style={{ marginTop: 8 }} onClick={handleRandomPalette}>
            Random Palette
          </button>

          {/* FFT Intensity slider */}
          <div style={{ marginTop: 10 }}>
            <label>FFT Intensity: </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={fftIntensity}
              onChange={(e) => setFftIntensity(parseFloat(e.target.value))}
            />
            <span style={{ marginLeft: 8 }}>{fftIntensity.toFixed(1)}</span>
          </div>
        </div>
      </Html>
    </>
  );
}
