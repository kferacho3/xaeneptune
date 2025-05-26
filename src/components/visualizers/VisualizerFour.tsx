/* -----------------------------------------------------------------------
 *  VisualizerFour.tsx  –  Cellular‑Automata + Orbiting‑Shapes visualizer
 *  (updated: added proper clean‑up so the sharedAudioElement is stopped)
 * -------------------------------------------------------------------- */

"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useSharedAudio from "./useSharedAudio"; // your shared‐audio hook
/* ────────────────────────────
 *  Module‑scoped shared audio
 * ──────────────────────────── */

/* ────────────────────────────
 *  Color‑palettes (28 total)
 * ──────────────────────────── */
const colorPalettes = [
  ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"],
  ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  ["#4506CB", "#7A0BC0", "#A20BD1", "#C700B9", "#F900BF"],
  ["#0B666A", "#5CB85C", "#FDE74C", "#FFC857", "#E9724C"],
  ["#1A535C", "#4ECDC4", "#F7FFF7", "#FF6B6B", "#FFE66D"],
  ["#283618", "#606C38", "#B8B8B8", "#DDA15E", "#BC6C25"],
  ["#03045E", "#0077B6", "#00A6FB", "#B4D2E7", "#F1FAEE"],
  ["#6A040F", "#9D0208", "#D7263D", "#F48C06", "#FFBA08"],
  // 20 brand‑new palettes
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

/* ────────────────────────────
 *  CA helper utilities
 * ──────────────────────────── */
function setRules(ruleValue: number): number[] {
  return ruleValue.toString(2).padStart(8, "0").split("").map(Number);
}
function calculateState(ruleSet: number[], l: number, c: number, r: number) {
  return ruleSet[7 - ((l << 2) | (c << 1) | r)];
}

/* ────────────────────────────
 *  TS interfaces
 * ──────────────────────────── */
interface OrbitingShape {
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
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
  orbits: OrbitingShape[];
}
interface CellProps {
  data: CellData;
}

/* ────────────────────────────
 *  Re‑usable Cell component
 * ──────────────────────────── */
function Cell({ data }: CellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainMeshRef = useRef<THREE.Mesh>(null);

  // memoised orbit geometries
  const orbitGeometries = useMemo(() => {
    return {
      sphere: new THREE.SphereGeometry(0.5, 16, 16),
      cone: new THREE.ConeGeometry(0.5, 1, 16),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
      box: new THREE.BoxGeometry(1, 1, 1),
    };
  }, []);

  // per‑frame animation
  useFrame((_, delta) => {
    if (!groupRef.current || !mainMeshRef.current) return;
    const mainMesh = mainMeshRef.current;

    // Lerp colour & scale of main shape
    mainMesh.scale.lerp(data.targetScale, 0.1);
    (mainMesh.material as THREE.MeshStandardMaterial).color.lerp(
      data.color,
      0.1,
    );

    // Animate orbiters
    data.orbits.forEach((orbit, idx) => {
      const child = groupRef.current!.children[idx + 1] as THREE.Mesh;
      orbit.orbitAngle += orbit.orbitSpeed * delta;
      child.position.set(
        Math.cos(orbit.orbitAngle) * orbit.orbitRadius,
        0,
        Math.sin(orbit.orbitAngle) * orbit.orbitRadius,
      );
      (child.material as THREE.MeshStandardMaterial).color.lerp(
        orbit.color,
        0.1,
      );
      child.scale.lerp(orbit.scale, 0.1);
    });
  });

  /* JSX */
  return (
    <group ref={groupRef} position={data.position}>
      {/* central shape */}
      <mesh ref={mainMeshRef}>
        <boxGeometry args={[data.shapeSize, data.shapeSize, data.shapeSize]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* orbiters */}
      {data.orbits.map((o, i) => (
        <mesh key={i} geometry={orbitGeometries[o.shapeGeo]}>
          <meshStandardMaterial color={o.color} />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────
 *  VisualizerFour main component
 * ──────────────────────────── */
interface VisualizerFourProps {
  audioUrl: string;
  isPaused: boolean;
}

const CELL_SIZE     = 5;
const INITIAL_RULE  = 45;
const GRID_W        = 3;
const GRID_H        = 10;

export default function VisualizerFour({ audioUrl, isPaused }: VisualizerFourProps) {
  /* ─────────── CA + palette state ─────────── */
  const [ruleSet] = useState(() => setRules(INITIAL_RULE));
  const [generation, setGeneration] = useState(0);

  const [currentPalette, setCurrentPalette] = useState<THREE.Color[]>(
    colorPalettes[0].map((c) => new THREE.Color(c)),
  );
  const [renderingMode, setRenderingMode] = useState<"solid"|"wireframe"|"rainbow"|"transparent">("solid");
  const [colorMode,    setColorMode   ] = useState<"default"|"audioAmplitude"|"frequencyBased"|"rainbow">("default");
  const [fftIntensity, setFftIntensity] = useState(0.5);

  /* ─────────── shared‐audio analyser ─────────── */
  const analyserRef = useSharedAudio(audioUrl, isPaused);

  /* ─────────── init grid ─────────── */
  const initialCells = useMemo(() => {
    const cells: CellData[] = [];
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const pal = currentPalette;
        const size = 0.5 + Math.random()*3.5;
        const orbits: OrbitingShape[] = Array.from(
          { length: 1 + Math.floor(Math.random()*3) },
          () => {
            const geos = ["sphere","cone","cylinder","box"] as const;
            const g = geos[Math.floor(Math.random()*geos.length)];
            return {
              orbitAngle:  Math.random()*Math.PI*2,
              orbitRadius: size*(0.75+Math.random()),
              orbitSpeed:  0.5 + Math.random()*1.5,
              shapeGeo:    g,
              color:       pal[Math.floor(Math.random()*pal.length)].clone(),
              scale:       new THREE.Vector3(0.3,0.3,0.3),
            };
          },
        );
        cells.push({
          color:       pal[0].clone(),
          state:       Math.random()>0.5?1:0,
          position:    new THREE.Vector3((x-GRID_W/2)*CELL_SIZE*2,0,(y-GRID_H/2)*CELL_SIZE*2),
          targetScale: new THREE.Vector3(size,size,size),
          targetColor: pal[0].clone(),
          shapeSize:   size,
          orbits,
        });
      }
    }
    return cells as CellData[];
  }, [currentPalette]);

  const [cells, setCells] = useState<CellData[]>(initialCells);

  /* ─────────── reset on palette change ─────────── */
  useEffect(() => {
    setCells(initialCells);
    setGeneration(0);
  }, [initialCells]);

  /* ─────────── CA step ─────────── */
  const stepCA = () => {
    setCells(prev =>
      prev.map((cell, idx) => {
        const col = idx % GRID_W, row = Math.floor(idx/GRID_W);
        const L = prev[row*GRID_W + ((col-1+GRID_W)%GRID_W)].state;
        const R = prev[row*GRID_W + ((col+1)%GRID_W)].state;
        const s = calculateState(ruleSet, L, cell.state, R);
        const nc = s===0
          ? new THREE.Color(0x000000)
          : currentPalette[Math.floor(Math.random()*currentPalette.length)].clone();
        return { ...cell, state: s, targetColor: nc };
      }),
    );
    setGeneration(g => g+1);
  };

  /* ─────────── random palette ─────────── */
  const randomPalette = () => {
    const p = colorPalettes[Math.floor(Math.random()*colorPalettes.length)];
    setCurrentPalette(p.map(c => new THREE.Color(c)));
  };

  /* ─────────── FFT buffer ─────────── */
  const fftRef = useRef<Uint8Array|null>(null);
  useEffect(() => {
    const a = analyserRef.current;
    if (a && !fftRef.current) {
      fftRef.current = new Uint8Array(a.frequencyBinCount);
    }
  }, [analyserRef]);

  /* ─────────── per-frame update ─────────── */
  useFrame(() => {
    if (isPaused || !analyserRef.current || !fftRef.current) return;

    if (generation % 10 === 0) stepCA();
    analyserRef.current.getByteFrequencyData(fftRef.current);

    setCells(prev =>
      prev.map((cell, idx) => {
        const amp = fftRef.current![idx % fftRef.current!.length] / 255;
        // color modes
        if (colorMode==="audioAmplitude") {
          cell.targetColor.lerp(new THREE.Color(0xffffff), 1-amp*fftIntensity);
        } else if (colorMode==="frequencyBased") {
          cell.targetColor.setHSL((amp*fftIntensity)%1,0.8,0.5);
        } else if (colorMode==="rainbow") {
          cell.targetColor.setHSL((amp+generation*0.01)%1,0.7,0.5);
        }
        // scale bounce
        const s = 0.5 + amp*3.5*fftIntensity;
        cell.targetScale.set(s,s,s);
        // orbiters
        cell.orbits.forEach(o => {
          o.scale.setScalar(0.2+amp*fftIntensity);
          o.color.setHSL((amp+o.orbitAngle)%1,0.7,0.5);
        });
        // vertical bounce
        cell.position.y = amp*2*fftIntensity;
        return cell;
      })
    );
  });

  return (
    <>
      {cells.map((c,i) => <Cell key={i} data={c} />)}

<Html>
        <div style={{
          position:   "fixed",
          top:        20,
          left:       20,
          background: "rgba(0,0,0,0.6)",
          padding:    "12px",
          borderRadius:"8px",
          color:      "white",
          zIndex:     10,
          userSelect: "none",
        }}>
          <div>
            <label>Rendering:&nbsp;</label>
            <select
              value={renderingMode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setRenderingMode(e.target.value as "solid"|"wireframe"|"rainbow"|"transparent")
              }
            >
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>

          <div style={{ marginTop: 6 }}>
            <label>Color Mode:&nbsp;</label>
            <select
              value={colorMode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setColorMode(e.target.value as "default"|"audioAmplitude"|"frequencyBased"|"rainbow")
              }
            >
              <option value="default">Default</option>
              <option value="audioAmplitude">Audio Amplitude</option>
              <option value="frequencyBased">Frequency Based</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </div>

          <button style={{ marginTop: 8 }} onClick={randomPalette}>
            Random Palette
          </button>

          <div style={{ marginTop: 10 }}>
            <label>FFT Intensity:&nbsp;</label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={fftIntensity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFftIntensity(parseFloat(e.target.value))
              }
            />
            <span style={{ marginLeft: 6 }}>{fftIntensity.toFixed(1)}</span>
          </div>
        </div>
      </Html>
    </>
  );
}