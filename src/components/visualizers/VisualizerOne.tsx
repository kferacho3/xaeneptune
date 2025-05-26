/* ────────────────────────────────────────────────────────────────────────────
   VisualizerOne.tsx  —  Perlin-sphere & dual-plane audio visualizer
   Completely refactored to use the shared-audio singleton hook so that
   ONE — and only one — <audio> / AudioContext / AnalyserNode exists
   across the entire application.
──────────────────────────────────────────────────────────────────────────── */
"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { createNoise2D, createNoise3D } from "simplex-noise";
import * as THREE from "three";

import useSharedAudio from "./useSharedAudio"; // ← NEW shared-audio hook

/* =======================================================================
   Type Definitions
======================================================================= */
type VisualizerOneProps = {
  audioUrl : string;
  isPaused : boolean;
};

type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
type ColorMode     = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";

/* =======================================================================
   Noise Generators
======================================================================= */
const noise2D = createNoise2D();
const noise3D = createNoise3D();

/* =======================================================================
   Main Component
======================================================================= */
export default function VisualizerOne({ audioUrl, isPaused }: VisualizerOneProps) {
  /* 🎧  audio analyser -- shared across all visualisers */
  const analyserRef = useSharedAudio(audioUrl, isPaused);

  /* ---------- geometry / material refs ---------- */
  const groupRef  = useRef<THREE.Group>(null!);
  const ballRef   = useRef<THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshLambertMaterial>>(null!);
  const plane1Ref = useRef<THREE.Mesh<THREE.PlaneGeometry,      THREE.MeshLambertMaterial>>(null!);
  const plane2Ref = useRef<THREE.Mesh<THREE.PlaneGeometry,      THREE.MeshLambertMaterial>>(null!);

  /* ---------- UI state ---------- */
  const [renderingMode, setRenderingMode] = useState<RenderingMode>("wireframe");
  const [colorMode,     setColorMode]     = useState<ColorMode>("default");

  /* =====================================================================
     Helper maths
  ==================================================================== */
  const fractionate = (val:number, min:number, max:number) => (val - min) / (max - min);
  const modulate    = (val:number, min:number, max:number, outMin:number, outMax:number) =>
    outMin + fractionate(val, min, max) * (outMax - outMin);
  const avg = (a:Uint8Array) => a.reduce((s,b) => s + b, 0) / a.length;
  const max = (a:Uint8Array) => a.reduce((m,b) => Math.max(m,b), 0);

  /* =====================================================================
     Geometry deformation helpers
  ==================================================================== */
  const makeRoughGround = (mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>,
                           distortionFr:number) => {
    const verts = mesh.geometry.attributes.position.array as Float32Array;
    const amp   = 2;
    const time  = Date.now();
    for (let i=0;i<verts.length;i+=3){
      const x = verts[i];
      const y = verts[i+1];
      const dist = (noise2D(x + time*0.0003, y + time*0.0001)) * distortionFr * amp;
      verts[i+2] = dist;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  };

  const makeRoughBall = (mesh: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshLambertMaterial>,
                         bassFr:number,
                         treFr:number) => {
    const verts = mesh.geometry.attributes.position.array as Float32Array;
    const offset = (mesh.geometry as THREE.IcosahedronGeometry).parameters.radius as number;
    const amp = 7;
    const time = performance.now();
    const rf = 0.00001;
    for (let i=0;i<verts.length;i+=3){
      const v = new THREE.Vector3(verts[i],verts[i+1],verts[i+2]).normalize();
      const dist = offset + bassFr +
        noise3D(v.x + time*rf*7, v.y + time*rf*8, v.z + time*rf*9) * amp * treFr;
      v.multiplyScalar(dist);
      verts[i]   = v.x;
      verts[i+1] = v.y;
      verts[i+2] = v.z;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  };

  /* =====================================================================
     Animation loop
  ==================================================================== */
  useFrame(() => {
    if (!analyserRef.current) return;

    /* -------- FFT data -------- */
    const bufLen = analyserRef.current.frequencyBinCount;
    const data   = new Uint8Array(bufLen);
    analyserRef.current.getByteFrequencyData(data);

    const lower   = data.slice(0, Math.floor(data.length/2));
    const upper   = data.slice(lower.length);

    const overallAvg = avg(data);
    const lowerMaxFr = max(lower)   / lower.length;
    const upperAvgFr = avg(upper)   / upper.length;

    /* -------- deform geometry -------- */
    if (plane1Ref.current && plane2Ref.current && ballRef.current){
      makeRoughGround(plane1Ref.current, modulate(upperAvgFr,0,1,0.5,4));
      makeRoughGround(plane2Ref.current, modulate(lowerMaxFr,0,1,0.5,4));
      makeRoughBall  (ballRef.current,
                      modulate(Math.pow(lowerMaxFr,0.8),0,1,0,8),
                      modulate(upperAvgFr,0,1,0,4));
    }

    /* -------- rotate group -------- */
    if (groupRef.current) groupRef.current.rotation.y += 0.005;

    /* -------- dynamic colour / material updates -------- */
    if (ballRef.current && plane1Ref.current && plane2Ref.current){
      const [ballMat, p1Mat, p2Mat] = [
        ballRef.current.material,
        plane1Ref.current.material,
        plane2Ref.current.material,
      ] as THREE.MeshLambertMaterial[];

      /** wireframe / transparency toggles */
      [ballMat,p1Mat,p2Mat].forEach(m=>{
        m.wireframe   = renderingMode==="wireframe";
        m.transparent = renderingMode==="transparent";
        m.opacity     = renderingMode==="transparent" ? 0.5 : 1;
      });

      const basePlaneClr = new THREE.Color(0x6904ce);
      const baseBallClr  = new THREE.Color(0xff00ee);

      if (renderingMode==="rainbow" || colorMode==="rainbow"){
        ballMat.color.setHSL(upperAvgFr,1,0.5);
        p1Mat.color.setHSL(upperAvgFr,1,0.5);
        p2Mat.color.setHSL(lowerMaxFr,1,0.5);
      } else if (colorMode==="audioAmplitude"){
        const it = overallAvg/255;
        ballMat.color.copy(baseBallClr).lerp(new THREE.Color(0xffffff), it);
        p1Mat.color .copy(basePlaneClr).lerp(new THREE.Color(0xffffff), it);
        p2Mat.color .copy(basePlaneClr).lerp(new THREE.Color(0xffffff), it);
      } else if (colorMode==="frequencyBased"){
        ballMat.color.setHSL(upperAvgFr ,0.7,0.6);
        p1Mat.color .setHSL(lowerMaxFr  ,0.7,0.6);
        p2Mat.color .setHSL(upperAvgFr  ,0.7,0.6);
      } else {
        ballMat.color.copy(baseBallClr);
        p1Mat.color .copy(basePlaneClr);
        p2Mat.color .copy(basePlaneClr);
      }
    }
  });

  /* =====================================================================
     JSX
  ==================================================================== */
  return (
    <>
      {/* 3-D scene graph */}
      <group ref={groupRef}>
        {/* ground plane 1 */}
        <mesh ref={plane1Ref} rotation-x={-Math.PI/2} position={[0,30,0]}>
          <planeGeometry args={[800,800,20,20]} />
          <meshLambertMaterial color={0x6904ce} wireframe />
        </mesh>

        {/* ground plane 2 */}
        <mesh ref={plane2Ref} rotation-x={-Math.PI/2} position={[0,-30,0]}>
          <planeGeometry args={[800,800,20,20]} />
          <meshLambertMaterial color={0x6904ce} wireframe />
        </mesh>

        {/* perlin-distorted ball */}
        <mesh ref={ballRef}>
          <icosahedronGeometry args={[10,4]} />
          <meshLambertMaterial color={0xff00ee} wireframe />
        </mesh>

        {/* basic lights */}
        <ambientLight intensity={0.9}/>
        <spotLight   position={[-10,40,20]} intensity={0.9}/>
      </group>

      {/* UI overlays */}
      <Html>
        <div
          style={{
            position   : "absolute",
            top        : 20,
            left       : 20,
            display    : "flex",
            flexDirection: "column",
            gap        : 10,
            color      : "white",
            fontFamily : "sans-serif",
            fontSize   : 14,
            userSelect : "none",
          }}
        >
          <label>
            Rendering&nbsp;Mode:&nbsp;
            <select
              value={renderingMode}
              onChange={e=>setRenderingMode(e.target.value as RenderingMode)}
            >
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </label>

          <label>
            Color&nbsp;Mode:&nbsp;
            <select
              value={colorMode}
              onChange={e=>setColorMode(e.target.value as ColorMode)}
            >
              <option value="default">Default</option>
              <option value="audioAmplitude">Audio Amplitude</option>
              <option value="frequencyBased">Frequency-based</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </label>
        </div>
      </Html>
    </>
  );
}
