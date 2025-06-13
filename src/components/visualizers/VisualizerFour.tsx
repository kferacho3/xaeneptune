/* -----------------------------------------------------------------------
 *  VisualizerFour.tsx  –  Cellular‑Automata + Orbiting‑Shapes visualizer
 *  (updated: added proper clean‑up so the sharedAudioElement is stopped)
 * -------------------------------------------------------------------- */

"use client";

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

import { colorPalettes } from "./VisualizerFourHelpers/types";
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

  const [currentPalette, ] = useState<THREE.Color[]>(
    colorPalettes[0].map((c) => new THREE.Color(c)),
  );
  //const [renderingMode, setRenderingMode] = useState<"solid"|"wireframe"|"rainbow"|"transparent">("solid");
  const [colorMode,       ] = useState<"default"|"audioAmplitude"|"frequencyBased"|"rainbow">("default");
  const [fftIntensity, ] = useState(0.5);

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

    </>
  );
}