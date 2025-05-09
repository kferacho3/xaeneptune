"use client";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { createNoise2D, createNoise3D } from "simplex-noise";
import * as THREE from "three";

/* ====================================================================
   Type Definitions
==================================================================== */
type VisualizerOneProps = {
  audioUrl: string;
  isPaused: boolean;
};

type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
type ColorMode = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";

/* ====================================================================
   Initialize Noise Functions
==================================================================== */
const noise2D = createNoise2D();
const noise3D = createNoise3D();

/* ====================================================================
   Shared Audio Objects
   (You can replace these with your useStore hook if desired.)
==================================================================== */
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;

/* ====================================================================
   VisualizerOneScene Component
   This component creates the scene, camera, and all 3D objects.
==================================================================== */
function VisualizerOneScene({ audioUrl, isPaused }: VisualizerOneProps) {
  console.log("VisualizerOne active");

  /* ------------------------------------------------------------------
     Mesh and Scene References
  ------------------------------------------------------------------ */
  const groupRef = useRef<THREE.Group>(null);
  // Note: Explicitly casting the ball mesh geometry to THREE.IcosahedronGeometry
  const ballRef = useRef<THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshLambertMaterial>>(null);
  // Casting plane geometries to THREE.PlaneGeometry for type correctness
  const plane1Ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>>(null);
  const plane2Ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );
  const rendererRef = useRef<THREE.WebGLRenderer>(
    new THREE.WebGLRenderer({ alpha: true, antialias: true })
  );

  const [renderingMode, setRenderingMode] = useState<RenderingMode>("wireframe");
  const [colorMode, setColorMode] = useState<ColorMode>("default");

  /* ------------------------------------------------------------------
     Shared Audio and Scene Setup Effect
  ------------------------------------------------------------------ */
  useEffect(() => {
    /* ---------- Shared Audio Setup ---------- */
    if (!sharedAudioElement) {
      sharedAudioElement = new Audio(audioUrl);
      sharedAudioElement.crossOrigin = "anonymous";
      sharedAudioElement.loop = true;

      sharedAudioContext = new AudioContext();
      const src = sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize = 512;
      src.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } else if (sharedAudioElement.src !== audioUrl) {
      // Update source if a new audio file is provided.
      sharedAudioElement.src = audioUrl;
    }

    audioRef.current = sharedAudioElement;
    audioContextRef.current = sharedAudioContext;
    analyserRef.current = sharedAnalyser;

    const tryPlay = async () => {
      if (isPaused) {
        sharedAudioElement?.pause();
      } else {
        if (sharedAudioContext && sharedAudioContext.state === "suspended") {
          await sharedAudioContext.resume();
        }
        try {
          await sharedAudioElement?.play();
        } catch (err) {
          console.error("Audio play error:", err);
        }
      }
    };
    void tryPlay();

    /* ---------- THREE.js Scene Setup ---------- */
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const group = groupRef.current || new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);

    // Create a plane geometry and explicitly cast it as THREE.PlaneGeometry
    const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20) as THREE.PlaneGeometry;
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x6904ce,
      side: THREE.DoubleSide,
      wireframe: true,
    });

    // Create plane1 mesh
    const plane1 = new THREE.Mesh(planeGeometry, planeMaterial);
    plane1.rotation.x = -0.5 * Math.PI;
    plane1.position.set(0, 30, 0);
    group.add(plane1);
    plane1Ref.current = plane1;

    // Create plane2 mesh
    const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    plane2.rotation.x = -0.5 * Math.PI;
    plane2.position.set(0, -30, 0);
    group.add(plane2);
    plane2Ref.current = plane2;

    // Create the ball (icosahedron) mesh
    const ballGeometry = new THREE.IcosahedronGeometry(10, 4) as THREE.IcosahedronGeometry;
    const ballMaterial = new THREE.MeshLambertMaterial({
      color: 0xff00ee,
      wireframe: true,
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    group.add(ball);
    ballRef.current = ball;

    // Add ambient and spotlight to the scene
    const ambient = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xffffff, 0.9);
    spot.position.set(-10, 40, 20);
    spot.lookAt(ball.position);
    spot.castShadow = true;
    scene.add(spot);

    /* ---------- Resize Handling ---------- */
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    /* ---------- Cleanup Function ---------- */
    return () => {
      window.removeEventListener("resize", handleResize);
      if (sharedAudioElement) {
        sharedAudioElement.pause();
        sharedAudioElement.currentTime = 0;
      }
    };
  }, [audioUrl, isPaused]);

  /* ------------------------------------------------------------------
     Handle Pause/Resume Updates
  ------------------------------------------------------------------ */
  useEffect(() => {
    const audio = audioRef.current;
    const audioContext = audioContextRef.current;
    if (!audio || !audioContext) return;
    if (isPaused) {
      audio.pause();
    } else {
      (async () => {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
        try {
          await audio.play();
        } catch (err) {
          console.error("Audio play error:", err);
        }
      })();
    }
  }, [isPaused]);

  /* ------------------------------------------------------------------
     Helper Functions for FFT Processing & Geometry Modulation
  ------------------------------------------------------------------ */
  const makeRoughBall = (
    mesh: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshLambertMaterial>,
    bassFr: number,
    treFr: number
  ) => {
    if (!mesh) return;
    const vertices = mesh.geometry.attributes.position.array as Float32Array;
    // Cast geometry to THREE.IcosahedronGeometry to access the 'parameters' property
    const ballGeom = mesh.geometry as THREE.IcosahedronGeometry;
    const offset = ballGeom.parameters.radius as number;
    const amp = 7;
    const time = window.performance.now();
    const rf = 0.00001;

    for (let i = 0; i < vertices.length; i += 3) {
      const vertex = new THREE.Vector3(
        vertices[i],
        vertices[i + 1],
        vertices[i + 2]
      ).normalize();
      const distance =
        offset +
        bassFr +
        noise3D(
          vertex.x + time * rf * 7,
          vertex.y + time * rf * 8,
          vertex.z + time * rf * 9
        ) *
          amp *
          treFr;
      vertex.multiplyScalar(distance);
      vertices[i] = vertex.x;
      vertices[i + 1] = vertex.y;
      vertices[i + 2] = vertex.z;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  };

  const makeRoughGround = (
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>,
    distortionFr: number
  ) => {
    if (!mesh) return;
    const vertices = mesh.geometry.attributes.position.array as Float32Array;
    // We explicitly cast geometry to THREE.PlaneGeometry if needed but we do not store it.
    const amp = 2;
    const time = Date.now();

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const distance =
        (noise2D(x + time * 0.0003, y + time * 0.0001) + 0) *
        distortionFr *
        amp;
      vertices[i + 2] = distance;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  };

  const fractionate = (val: number, minVal: number, maxVal: number): number => {
    return (val - minVal) / (maxVal - minVal);
  };

  const modulate = (
    val: number,
    minVal: number,
    maxVal: number,
    outMin: number,
    outMax: number
  ): number => {
    const fr = fractionate(val, minVal, maxVal);
    const delta = outMax - outMin;
    return outMin + fr * delta;
  };

  const avg = (arr: Uint8Array): number => {
    const total = Array.from(arr).reduce((sum, b) => sum + b, 0);
    return total / arr.length;
  };

  const max = (arr: Uint8Array): number => {
    return Array.from(arr).reduce((a, b) => Math.max(a, b), 0);
  };

  /* ------------------------------------------------------------------
     Render Loop (useFrame)
  ------------------------------------------------------------------ */
  useFrame(() => {
    if (
      !analyserRef.current ||
      !ballRef.current ||
      !plane1Ref.current ||
      !plane2Ref.current ||
      !groupRef.current
    )
      return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const lowerHalfArray = dataArray.slice(
      0,
      Math.floor(dataArray.length / 2) - 1
    );
    const upperHalfArray = dataArray.slice(
      Math.floor(dataArray.length / 2) - 1,
      dataArray.length - 1
    );

    const overallAvg = avg(dataArray);
    const lowerMax = max(lowerHalfArray);
    const lowerAvgVal = avg(lowerHalfArray);
    const upperMax = max(upperHalfArray);
    const upperAvgVal = avg(upperHalfArray);

    const lowerMaxFr = lowerMax / lowerHalfArray.length;
    const lowerAvgFr = lowerAvgVal / lowerHalfArray.length;
    const upperMaxFr = upperMax / upperHalfArray.length;
    const upperAvgFr = upperAvgVal / upperHalfArray.length;

    makeRoughGround(plane1Ref.current, modulate(upperAvgFr, 0, 1, 0.5, 4));
    makeRoughGround(plane2Ref.current, modulate(lowerMaxFr, 0, 1, 0.5, 4));
    makeRoughBall(
      ballRef.current,
      modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8),
      modulate(upperAvgFr, 0, 1, 0, 4)
    );

    groupRef.current.rotation.y += 0.005;

    // Update materials based on rendering mode and color mode
    const ballMaterial = ballRef.current.material as THREE.MeshLambertMaterial;
    const plane1Material = plane1Ref.current.material as THREE.MeshLambertMaterial;
    const plane2Material = plane2Ref.current.material as THREE.MeshLambertMaterial;

    const baseColor = new THREE.Color(0x6904ce);
    const ballBaseColor = new THREE.Color(0xff00ee);

    [ballMaterial, plane1Material, plane2Material].forEach((mat) => {
      mat.wireframe = renderingMode === "wireframe";
      mat.transparent = renderingMode === "transparent";
      mat.opacity = renderingMode === "transparent" ? 0.5 : 1;
    });

    if (renderingMode === "rainbow") {
      ballMaterial.color.setHSL(upperAvgFr, 1, 0.5);
      plane1Material.color.setHSL(upperAvgFr, 1, 0.5);
      plane2Material.color.setHSL(lowerMaxFr, 1, 0.5);
    } else if (colorMode === "audioAmplitude") {
      const intensity = overallAvg / 255;
      ballMaterial.color.lerp(ballBaseColor, intensity);
      plane1Material.color.lerp(baseColor, intensity);
      plane2Material.color.lerp(baseColor, intensity);
    } else if (colorMode === "frequencyBased") {
      ballMaterial.color.setHSL(upperAvgFr, 0.7, 0.6);
      plane1Material.color.setHSL(lowerAvgFr, 0.7, 0.6);
      plane2Material.color.setHSL(upperMaxFr, 0.7, 0.6);
    } else if (colorMode === "rainbow") {
      ballMaterial.color.setHSL(upperAvgFr, 1, 0.5);
      plane1Material.color.setHSL(lowerAvgFr, 1, 0.5);
      plane2Material.color.setHSL(upperMaxFr, 1, 0.5);
    } else {
      ballMaterial.color.copy(ballBaseColor);
      plane1Material.color.copy(baseColor);
      plane2Material.color.copy(baseColor);
    }
  });

  /* ------------------------------------------------------------------
     Render JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <scene ref={sceneRef}>
        <group ref={groupRef}>
          <ambientLight intensity={0.9} />
          <spotLight position={[-10, 40, 20]} intensity={0.9} castShadow />
          <mesh ref={plane1Ref} rotation-x={-Math.PI / 2} position={[0, 30, 0]}>
            <planeGeometry args={[800, 800, 20, 20]} />
            <meshLambertMaterial
              color={0x6904ce}
              wireframe={renderingMode === "wireframe"}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={plane2Ref} rotation-x={-Math.PI / 2} position={[0, -30, 0]}>
            <planeGeometry args={[800, 800, 20, 20]} />
            <meshLambertMaterial
              color={0x6904ce}
              wireframe={renderingMode === "wireframe"}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={ballRef} position={[0, 0, 0]}>
            <icosahedronGeometry args={[10, 4]} />
            <meshLambertMaterial
              color={0xff00ee}
              wireframe={renderingMode === "wireframe"}
            />
          </mesh>
        </group>
        <perspectiveCamera ref={cameraRef} position={[0, 0, 100]} />
      </scene>
      <Html>
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            color: "white",
          }}
        >
          <div>
            Rendering Mode:
            <select
              value={renderingMode}
              onChange={(e) =>
                setRenderingMode(e.target.value as RenderingMode)
              }
            >
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
          <div>
            Color Mode:
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as ColorMode)}
            >
              <option value="default">Default</option>
              <option value="audioAmplitude">Audio Amplitude</option>
              <option value="frequencyBased">Frequency Based</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </div>
        </div>
      </Html>
    </>
  );
}

/* ====================================================================
   Exported VisualizerOne Component
   (This simply wraps VisualizerOneScene.)
==================================================================== */
export default function VisualizerOne({ audioUrl, isPaused }: VisualizerOneProps) {
  return <VisualizerOneScene audioUrl={audioUrl} isPaused={isPaused} />;
}

/* ====================================================================
   End of VisualizerOne Component Code
==================================================================== */
