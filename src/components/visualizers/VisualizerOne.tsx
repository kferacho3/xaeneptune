"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { createNoise2D, createNoise3D } from "simplex-noise";
import * as THREE from "three";

import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { avg, max, modulate } from "./VisualizerOneHelpers/audioHelpers";
import { ColorPalette, getRandomPalette, hexToRgb } from "./VisualizerOneHelpers/colorPalettes";
import {
  createShapeGeometry
} from "./VisualizerOneHelpers/geometryHelpers";
import {
  VisualizerOneProps
} from "./VisualizerOneHelpers/types";

/* ====================================================================
   Initialize Noise Functions
==================================================================== */
const noise2D = createNoise2D();
const noise3D = createNoise3D();

/* ====================================================================
   Shared Audio Objects
==================================================================== */
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;

/* ====================================================================
   Create Cross Geometry Helper
==================================================================== */
function createCrossGeometry(): THREE.BufferGeometry {
  const box1 = new THREE.BoxGeometry(2, 0.4, 0.4);
  const box2 = new THREE.BoxGeometry(0.4, 2, 0.4);
  const box3 = new THREE.BoxGeometry(0.4, 0.4, 2);
  
  const geometries = [box1, box2, box3];
  const mergedGeometry = mergeGeometries(geometries);
  
  return mergedGeometry;
}

/* ====================================================================
   VisualizerOneScene Component
==================================================================== */
function VisualizerOneScene({ 
  audioUrl, 
  isPaused,
  renderingMode: propRenderingMode,
  colorMode: propColorMode,
  shapeMode: propShapeMode,
  pointMode: propPointMode,
}: VisualizerOneProps) {
  console.log("VisualizerOne active");

  /* ------------------------------------------------------------------
     Mesh and Scene References
  ------------------------------------------------------------------ */
  const groupRef = useRef<THREE.Group>(null);
  const shapeRef = useRef<THREE.Mesh>(null);
  const plane1Ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>>(null);
  const plane2Ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>>(null);
  const plane1PointsRef = useRef<THREE.Points | THREE.InstancedMesh>(null);
  const plane2PointsRef = useRef<THREE.Points | THREE.InstancedMesh>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Use props with defaults
  const renderingMode = propRenderingMode || "wireframe";
  const colorMode = propColorMode || "default";
  const shapeMode = propShapeMode || "sphere";
  const pointMode = propPointMode || "points";
  
  // Color palette state
  const currentPalette = useRef<ColorPalette>(getRandomPalette());
  const paletteColorsRef = useRef<THREE.Color[]>([]);

  // Store original vertices for shape morphing
  const originalVerticesRef = useRef<Float32Array | null>(null);
  
  // Store vertex colors for dynamic coloring
  const shapeColorsRef = useRef<Float32Array | null>(null);
  const plane1ColorsRef = useRef<Float32Array | null>(null);
  const plane2ColorsRef = useRef<Float32Array | null>(null);

  // Initialize palette colors
  useEffect(() => {
    paletteColorsRef.current = currentPalette.current.colors.map(hex => {
      const rgb = hexToRgb(hex);
      return new THREE.Color(rgb.r, rgb.g, rgb.b);
    });
  }, []);

  /* ------------------------------------------------------------------
     Shared Audio Setup Effect
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

    /* ---------- Cleanup Function ---------- */
    return () => {
      if (sharedAudioElement) {
        sharedAudioElement.pause();
        sharedAudioElement.currentTime = 0;
      }
    };
  }, [audioUrl, isPaused]);

  /* ------------------------------------------------------------------
     Initialize Vertex Colors
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (shapeRef.current) {
      const shapeGeometry = shapeRef.current.geometry;
      const shapeVertexCount = shapeGeometry.attributes.position.count;
      const shapeColors = new Float32Array(shapeVertexCount * 3);
      shapeColorsRef.current = shapeColors;
      shapeGeometry.setAttribute('color', new THREE.BufferAttribute(shapeColors, 3));
      const material = shapeRef.current.material as THREE.MeshPhysicalMaterial;
      material.vertexColors = true;
    }

    if (plane1Ref.current) {
      const plane1Geometry = plane1Ref.current.geometry;
      const plane1VertexCount = plane1Geometry.attributes.position.count;
      const plane1Colors = new Float32Array(plane1VertexCount * 3);
      plane1ColorsRef.current = plane1Colors;
      plane1Geometry.setAttribute('color', new THREE.BufferAttribute(plane1Colors, 3));
      const material = plane1Ref.current.material as THREE.MeshPhysicalMaterial;
      material.vertexColors = true;
    }

    if (plane2Ref.current) {
      const plane2Geometry = plane2Ref.current.geometry;
      const plane2VertexCount = plane2Geometry.attributes.position.count;
      const plane2Colors = new Float32Array(plane2VertexCount * 3);
      plane2ColorsRef.current = plane2Colors;
      plane2Geometry.setAttribute('color', new THREE.BufferAttribute(plane2Colors, 3));
      const material = plane2Ref.current.material as THREE.MeshPhysicalMaterial;
      material.vertexColors = true;
    }
  }, [shapeMode]);

  /* ------------------------------------------------------------------
     Handle Shape Mode Changes
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!shapeRef.current) return;

    // Dispose old geometry
    shapeRef.current.geometry.dispose();

    // Create new geometry
    const newGeometry = createShapeGeometry(shapeMode);
    shapeRef.current.geometry = newGeometry;

    // Store new original vertices
    originalVerticesRef.current = new Float32Array(newGeometry.attributes.position.array);
    
    // Initialize vertex colors for new geometry
    const vertexCount = newGeometry.attributes.position.count;
    const colors = new Float32Array(vertexCount * 3);
    shapeColorsRef.current = colors;
    newGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [shapeMode]);

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
  const makeRoughShape = (
    mesh: THREE.Mesh,
    bassFr: number,
    treFr: number,
    midFr: number
  ) => {
    if (!mesh || !originalVerticesRef.current || !shapeColorsRef.current) return;
    
    const vertices = mesh.geometry.attributes.position.array as Float32Array;
    const colors = shapeColorsRef.current;
    const originalVerts = originalVerticesRef.current;
    const time = window.performance.now();
    const rf = 0.00001;
    
    // Different deformation strategies based on shape
    const amp = shapeMode === "torus" ? 3 : 7;
    const noiseScale = shapeMode === "cube" ? 0.5 : 1.0;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const origX = originalVerts[i];
      const origY = originalVerts[i + 1];
      const origZ = originalVerts[i + 2];
      
      const vertex = new THREE.Vector3(origX, origY, origZ);
      const length = vertex.length();
      
      if (length > 0) {
        vertex.normalize();
        
        const noiseValue = noise3D(
          vertex.x * noiseScale + time * rf * 7,
          vertex.y * noiseScale + time * rf * 8,
          vertex.z * noiseScale + time * rf * 9
        );
        
        const distance = length + bassFr * 2 + noiseValue * amp * treFr;
        vertex.multiplyScalar(distance);
        
        vertices[i] = vertex.x;
        vertices[i + 1] = vertex.y;
        vertices[i + 2] = vertex.z;
        
        // Update vertex colors
        const colorIndex = i / 3;
        
        if (renderingMode === "rainbow") {
          // Rainbow mode: use pure HSL rainbow
          const hue = (time * 0.0001 + colorIndex * 0.01 + bassFr) % 1;
          const color = new THREE.Color();
          color.setHSL(hue, 1, 0.5 + midFr * 0.3);
          colors[colorIndex * 3] = color.r;
          colors[colorIndex * 3 + 1] = color.g;
          colors[colorIndex * 3 + 2] = color.b;
        } else {
          // Use palette colors
          const paletteColors = paletteColorsRef.current;
          if (paletteColors.length > 0) {
            const paletteIndex = Math.floor((bassFr + midFr + treFr + time * 0.00001) * paletteColors.length) % paletteColors.length;
            const baseColor = paletteColors[paletteIndex];
            const nextColor = paletteColors[(paletteIndex + 1) % paletteColors.length];
            
            const lerpFactor = (bassFr * 0.3 + midFr * 0.4 + treFr * 0.3);
            const color = new THREE.Color().lerpColors(baseColor, nextColor, lerpFactor);
            
            const brightness = 0.7 + midFr * 0.3;
            color.multiplyScalar(brightness);
            
            colors[colorIndex * 3] = color.r;
            colors[colorIndex * 3 + 1] = color.g;
            colors[colorIndex * 3 + 2] = color.b;
          }
        }
      }
    }
    
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  };

  const makeRoughGround = (
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>,
    points: THREE.Points | THREE.InstancedMesh,
    distortionFr: number,
    bassFr: number,
    midFr: number,
    lowerAvgFr: number
  ) => {
    if (!mesh || !points) return;
    
    const meshVertices = mesh.geometry.attributes.position.array as Float32Array;
    const meshColors = mesh.geometry.attributes.color?.array as Float32Array;
    const amp = 3;
    const time = Date.now();
    
    // Update mesh vertices and colors
    for (let i = 0; i < meshVertices.length; i += 3) {
      const x = meshVertices[i];
      const y = meshVertices[i + 1];
      
      // Create more complex wave patterns
      const noise1 = noise2D(x * 0.003 + time * 0.0003, y * 0.003 + time * 0.0001);
      const noise2Val = noise2D(x * 0.01 + time * 0.0002, y * 0.01 + time * 0.0004);
      const combinedNoise = (noise1 + noise2Val * 0.5) * distortionFr * amp;
      
      meshVertices[i + 2] = combinedNoise;
      
      // Update vertex colors
      if (meshColors) {
        const colorIndex = i / 3;
        
        if (renderingMode === "rainbow") {
          // Rainbow mode: use pure HSL rainbow
          const distance = Math.sqrt(x * x + y * y) / 400;
          const hue = (distance + time * 0.00005 + bassFr) % 1;
          const color = new THREE.Color();
          color.setHSL(hue, 1, 0.5 + distortionFr * 0.3);
          meshColors[colorIndex * 3] = color.r;
          meshColors[colorIndex * 3 + 1] = color.g;
          meshColors[colorIndex * 3 + 2] = color.b;
        } else {
          // Use palette colors
          const paletteColors = paletteColorsRef.current;
          if (paletteColors.length > 0) {
            const distance = Math.sqrt(x * x + y * y) / 400;
            const paletteIndex = Math.floor((distance + bassFr + time * 0.00001) * paletteColors.length) % paletteColors.length;
            const baseColor = paletteColors[paletteIndex];
            const nextColor = paletteColors[(paletteIndex + 1) % paletteColors.length];
            
            const lerpFactor = midFr + distortionFr * 0.5;
            const color = new THREE.Color().lerpColors(baseColor, nextColor, lerpFactor);
            
            const brightness = 0.6 + distortionFr * 0.4;
            color.multiplyScalar(brightness);
            
            meshColors[colorIndex * 3] = color.r;
            meshColors[colorIndex * 3 + 1] = color.g;
            meshColors[colorIndex * 3 + 2] = color.b;
          }
        }
      }
    }
    
    // Update points or instanced mesh
    if (points instanceof THREE.Points) {
      const pointsVertices = points.geometry.attributes.position.array as Float32Array;
      // Sync point positions with mesh
      for (let i = 0; i < meshVertices.length; i++) {
        pointsVertices[i] = meshVertices[i];
      }
      points.geometry.attributes.position.needsUpdate = true;
    } else if (points instanceof THREE.InstancedMesh) {
      // Update instanced mesh transforms
      const dummy = new THREE.Object3D();
      const planeGeometry = mesh.geometry;
      const positions = planeGeometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        
        dummy.position.set(x, y, z);
        
        // Enhanced rotation for 3D effect
        const rotationSpeed = time * 0.001 + i * 0.1;
        dummy.rotation.set(
          Math.sin(rotationSpeed) * lowerAvgFr * Math.PI,
          Math.cos(rotationSpeed) * lowerAvgFr * Math.PI,
          Math.sin(rotationSpeed * 0.5) * midFr * Math.PI
        );
        
        // Dynamic scaling
        const baseScale = 0.8;
        const scaleModulation = baseScale + bassFr * 0.5 + Math.sin(time * 0.001 + i) * 0.2;
        dummy.scale.setScalar(scaleModulation);
        
        dummy.updateMatrix();
        points.setMatrixAt(i, dummy.matrix);
      }
      points.instanceMatrix.needsUpdate = true;
    }
    
    mesh.geometry.attributes.position.needsUpdate = true;
    if (mesh.geometry.attributes.color) {
      mesh.geometry.attributes.color.needsUpdate = true;
    }
    mesh.geometry.computeVertexNormals();
  };

  /* ------------------------------------------------------------------
     Render Loop (useFrame)
  ------------------------------------------------------------------ */
  useFrame(() => {
    if (
      !analyserRef.current ||
      !shapeRef.current ||
      !plane1Ref.current ||
      !plane2Ref.current ||
      !plane1PointsRef.current ||
      !plane2PointsRef.current ||
      !groupRef.current
    )
      return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const lowerHalfArray = dataArray.slice(0, Math.floor(dataArray.length / 3));
    const midArray = dataArray.slice(Math.floor(dataArray.length / 3), Math.floor(dataArray.length * 2 / 3));
    const upperHalfArray = dataArray.slice(Math.floor(dataArray.length * 2 / 3), dataArray.length - 1);

    const overallAvg = avg(dataArray);
    const lowerMax = max(lowerHalfArray);
    const lowerAvgVal = avg(lowerHalfArray);
    const midMax = max(midArray);
    const midAvgVal = avg(midArray);
    const upperMax = max(upperHalfArray);
    const upperAvgVal = avg(upperHalfArray);

    const lowerMaxFr = lowerMax / lowerHalfArray.length;
    const lowerAvgFr = lowerAvgVal / lowerHalfArray.length;
    const midMaxFr = midMax / midArray.length;
    const midAvgFr = midAvgVal / midArray.length;
    const upperMaxFr = upperMax / upperHalfArray.length;
    const upperAvgFr = upperAvgVal / upperHalfArray.length;

    makeRoughGround(
      plane1Ref.current, 
      plane1PointsRef.current, 
      modulate(upperAvgFr, 0, 1, 5,  100),
      lowerMaxFr,
      midAvgFr,
      lowerAvgFr
    );
    makeRoughGround(
      plane2Ref.current, 
      plane2PointsRef.current, 
      modulate(lowerMaxFr, 0, 1, 0.2, 5),
      upperMaxFr,
      midAvgFr,
      lowerAvgFr
    );
    makeRoughShape(
      shapeRef.current,
      modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 2, 5),
      modulate(upperAvgFr, 0, 1, 0, 4),
      modulate(midAvgFr, 0, 1, 0, 2)
    );

    groupRef.current.rotation.y += 0.005;

    // Update materials based on rendering mode and color mode
    const shapeMaterial = shapeRef.current.material as THREE.MeshPhysicalMaterial;
    const plane1Material = plane1Ref.current.material as THREE.MeshPhysicalMaterial;
    const plane2Material = plane2Ref.current.material as THREE.MeshPhysicalMaterial;
    
    let plane1PointsMaterial: THREE.PointsMaterial | THREE.MeshStandardMaterial;
    let plane2PointsMaterial: THREE.PointsMaterial | THREE.MeshStandardMaterial;
    
    if (plane1PointsRef.current instanceof THREE.Points) {
      plane1PointsMaterial = plane1PointsRef.current.material as THREE.PointsMaterial;
    } else {
      plane1PointsMaterial = plane1PointsRef.current.material as THREE.MeshStandardMaterial;
    }
    
    if (plane2PointsRef.current instanceof THREE.Points) {
      plane2PointsMaterial = plane2PointsRef.current.material as THREE.PointsMaterial;
    } else {
      plane2PointsMaterial = plane2PointsRef.current.material as THREE.MeshStandardMaterial;
    }

    // Apply rendering mode
    if (renderingMode === "transparent") {
      // Glass-like material for transparent mode
      [shapeMaterial, plane1Material, plane2Material].forEach((mat) => {
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = 0.3;
        mat.metalness = 0.9;
        mat.roughness = 0.1;
        mat.envMapIntensity = 1
        mat.clearcoat = 1;
        mat.clearcoatRoughness = 0.1;
        mat.ior = 1.5;
        mat.thickness = 0.5;
        mat.transmission = 0.9;
      });
    } else if (renderingMode === "rainbow") {
      // Rainbow mode with wireframe
      [shapeMaterial, plane1Material, plane2Material].forEach((mat) => {
        mat.wireframe = true;
        mat.transparent = false;
        mat.opacity = 1;
        mat.metalness = 0;
        mat.roughness = 1;
        mat.clearcoat = 0;
        mat.transmission = 0;
        mat.vertexColors = true;
      });
    } else {
      // Normal modes
      [shapeMaterial, plane1Material, plane2Material].forEach((mat) => {
        mat.wireframe = renderingMode === "wireframe";
        mat.transparent = false;
        mat.opacity = 1;
        mat.metalness = 0;
        mat.roughness = 0.7;
        mat.clearcoat = 0;
        mat.transmission = 0;
        mat.vertexColors = colorMode !== "default";
      });
    }

    // Apply transparency and brightness to points based on audio
    const pointBrightness = modulate(overallAvg, 0, 255, 0.3, 1);
    const pointOpacity = renderingMode === "transparent" ? 0.3 * pointBrightness : 0.8 * pointBrightness;
    
    plane1PointsMaterial.opacity = pointOpacity;
    plane2PointsMaterial.opacity = pointOpacity;

    const paletteColors = paletteColorsRef.current;
    const time = Date.now() * 0.0001;

    // Enhanced instanced mesh updates to match points behavior
    if (plane1PointsRef.current instanceof THREE.InstancedMesh && plane2PointsRef.current instanceof THREE.InstancedMesh) {
      const dummy = new THREE.Object3D();
      const instanceColor = new THREE.Color();
      
      // Update plane1 instances
      const plane1Geometry = plane1Ref.current.geometry;
      const plane1Positions = plane1Geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < plane1Geometry.attributes.position.count; i++) {
        const x = plane1Positions[i * 3];
        const y = plane1Positions[i * 3 + 1];
        const z = plane1Positions[i * 3 + 2];
        
        dummy.position.set(x, y, z);
        
        // Enhanced rotation based on audio
        dummy.rotation.set(
          Math.sin(time * 10 + i * 0.1) * upperAvgFr * 2,
          Math.cos(time * 10 + i * 0.1) * upperAvgFr * 2,
          (time * 5 + i * 0.05) * midAvgFr
        );
        
        // Enhanced scale based on audio - matching points size behavior
        const baseScale = 0.5;
        const scaleModulation = baseScale + modulate(Math.pow(upperAvgFr, 0.5), 0, 1, 0, 2) * (1 + lowerMaxFr);
        dummy.scale.setScalar(scaleModulation);
        
        dummy.updateMatrix();
        plane1PointsRef.current.setMatrixAt(i, dummy.matrix);
        
        // Dynamic color updates for instances
        if (renderingMode === "rainbow") {
          const hue = (upperAvgFr + time + i * 0.001) % 1;
          instanceColor.setHSL(hue, 1, pointBrightness);
        } else if (colorMode === "rainbow") {
          const hue = (upperAvgFr + time + i * 0.001) % 1;
          instanceColor.setHSL(hue, 1, pointBrightness);
        } else if (colorMode === "audioAmplitude") {
          const intensity = overallAvg / 255;
          if (paletteColors.length > 0) {
            const colorIndex = Math.floor(intensity * paletteColors.length);
            const baseColor = paletteColors[colorIndex % paletteColors.length];
            const nextColor = paletteColors[(colorIndex + 1) % paletteColors.length];
            instanceColor.lerpColors(baseColor, nextColor, intensity);
            instanceColor.multiplyScalar(pointBrightness);
          }
        } else if (colorMode === "frequencyBased") {
          if (paletteColors.length > 0) {
            const colorIndex1 = Math.floor(upperAvgFr * paletteColors.length) % paletteColors.length;
            instanceColor.copy(paletteColors[colorIndex1]);
            instanceColor.multiplyScalar(pointBrightness);
          }
        } else {
          // Default - use time-based color cycling through palette
          if (paletteColors.length > 0) {
            const colorIndex = Math.floor((time + upperAvgFr) * paletteColors.length) % paletteColors.length;
            instanceColor.copy(paletteColors[colorIndex]);
            instanceColor.multiplyScalar(pointBrightness);
          }
        }
        
        plane1PointsRef.current.setColorAt(i, instanceColor);
      }
      
      // Update plane2 instances
      const plane2Geometry = plane2Ref.current.geometry;
      const plane2Positions = plane2Geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < plane2Geometry.attributes.position.count; i++) {
        const x = plane2Positions[i * 3];
        const y = plane2Positions[i * 3 + 1];
        const z = plane2Positions[i * 3 + 2];
        
        dummy.position.set(x, y, z);
        
        // Enhanced rotation based on audio
        dummy.rotation.set(
          Math.sin(time * 10 + i * 0.1) * lowerMaxFr * 2,
          Math.cos(time * 10 + i * 0.1) * lowerMaxFr * 2,
          (time * 5 + i * 0.05) * midAvgFr
        );
        
        // Enhanced scale based on audio - matching points size behavior
        const baseScale = 0.5;
        const scaleModulation = baseScale + modulate(Math.pow(lowerMaxFr, 0.5), 0, 1, 0, 2) * (1 + upperMaxFr);
        dummy.scale.setScalar(scaleModulation);
        
        dummy.updateMatrix();
        plane2PointsRef.current.setMatrixAt(i, dummy.matrix);
        
        // Dynamic color updates for instances
        if (renderingMode === "rainbow") {
          const hue = (lowerMaxFr + time + i * 0.001) % 1;
          instanceColor.setHSL(hue, 1, pointBrightness);
        } else if (colorMode === "rainbow") {
          const hue = (lowerMaxFr + time + i * 0.001) % 1;
          instanceColor.setHSL(hue, 1, pointBrightness);
        } else if (colorMode === "audioAmplitude") {
          const intensity = overallAvg / 255;
          if (paletteColors.length > 0) {
            const colorIndex = Math.floor(intensity * paletteColors.length);
            const baseColor = paletteColors[colorIndex % paletteColors.length];
            const nextColor = paletteColors[(colorIndex + 1) % paletteColors.length];
            instanceColor.lerpColors(baseColor, nextColor, intensity);
            instanceColor.multiplyScalar(pointBrightness);
          }
        } else if (colorMode === "frequencyBased") {
          if (paletteColors.length > 0) {
            const colorIndex2 = Math.floor(lowerMaxFr * paletteColors.length) % paletteColors.length;
            instanceColor.copy(paletteColors[colorIndex2]);
            instanceColor.multiplyScalar(pointBrightness);
          }
        } else {
          // Default - use time-based color cycling through palette
          if (paletteColors.length > 0) {
            const colorIndex = Math.floor((time + lowerMaxFr) * paletteColors.length) % paletteColors.length;
            instanceColor.copy(paletteColors[colorIndex]);
            instanceColor.multiplyScalar(pointBrightness);
          }
        }
        
        plane2PointsRef.current.setColorAt(i, instanceColor);
      }
      
      plane1PointsRef.current.instanceMatrix.needsUpdate = true;
      plane2PointsRef.current.instanceMatrix.needsUpdate = true;
      
      if (plane1PointsRef.current.instanceColor) {
        plane1PointsRef.current.instanceColor.needsUpdate = true;
      }
      if (plane2PointsRef.current.instanceColor) {
        plane2PointsRef.current.instanceColor.needsUpdate = true;
      }
    }

    // Apply color modes for regular points
    if (renderingMode === "rainbow") {
      // Rainbow mode ignores palettes and uses HSL
      const hue1 = (upperAvgFr + time) % 1;
      const hue2 = (lowerMaxFr + time) % 1;
      
      if (plane1PointsRef.current instanceof THREE.Points) {
        plane1PointsMaterial.color.setHSL(hue1, 1, pointBrightness);
      }
      if (plane2PointsRef.current instanceof THREE.Points) {
        plane2PointsMaterial.color.setHSL(hue2, 1, pointBrightness);
      }
      
      // Shape uses vertex colors set in makeRoughShape
      shapeMaterial.vertexColors = true;
      plane1Material.vertexColors = true;
      plane2Material.vertexColors = true;
    } else if (colorMode === "rainbow") {
      // Color mode rainbow (different from rendering mode rainbow)
      shapeMaterial.vertexColors = true;
      plane1Material.vertexColors = true;
      plane2Material.vertexColors = true;
      
      const hue1 = (upperAvgFr + time) % 1;
      const hue2 = (lowerMaxFr + time) % 1;
      
      if (plane1PointsRef.current instanceof THREE.Points) {
        plane1PointsMaterial.color.setHSL(hue1, 1, pointBrightness);
      }
      if (plane2PointsRef.current instanceof THREE.Points) {
        plane2PointsMaterial.color.setHSL(hue2, 1, pointBrightness);
      }
    } else if (colorMode === "audioAmplitude") {
      const intensity = overallAvg / 255;
      
      // Use palette colors modulated by audio
      if (paletteColors.length > 0) {
        const colorIndex = Math.floor(intensity * paletteColors.length);
        const baseColor = paletteColors[colorIndex % paletteColors.length];
        const nextColor = paletteColors[(colorIndex + 1) % paletteColors.length];
        
        const audioColor = new THREE.Color().lerpColors(baseColor, nextColor, intensity);
        
        shapeMaterial.color.lerp(audioColor, intensity);
        plane1Material.color.lerp(audioColor, intensity);
        plane2Material.color.lerp(audioColor, intensity);
        
        if (plane1PointsRef.current instanceof THREE.Points) {
          plane1PointsMaterial.color.lerp(audioColor, intensity);
        }
        if (plane2PointsRef.current instanceof THREE.Points) {
          plane2PointsMaterial.color.lerp(audioColor, intensity);
        }
      }
    } else if (colorMode === "frequencyBased") {
      // Use vertex colors for frequency-based coloring
      shapeMaterial.vertexColors = true;
      plane1Material.vertexColors = true;
      plane2Material.vertexColors = true;
      
      if (paletteColors.length > 0) {
        const colorIndex1 = Math.floor(upperAvgFr * paletteColors.length) % paletteColors.length;
        const colorIndex2 = Math.floor(lowerMaxFr * paletteColors.length) % paletteColors.length;
        
        if (plane1PointsRef.current instanceof THREE.Points) {
          plane1PointsMaterial.color.copy(paletteColors[colorIndex1]);
          plane1PointsMaterial.color.multiplyScalar(pointBrightness);
        }
        if (plane2PointsRef.current instanceof THREE.Points) {
          plane2PointsMaterial.color.copy(paletteColors[colorIndex2]);
          plane2PointsMaterial.color.multiplyScalar(pointBrightness);
        }
      }
    } else {
      // Default mode - use palette base colors
      if (paletteColors.length > 0) {
        shapeMaterial.color.copy(paletteColors[0]);
        plane1Material.color.copy(paletteColors[1 % paletteColors.length]);
        plane2Material.color.copy(paletteColors[2 % paletteColors.length]);
        
        if (plane1PointsRef.current instanceof THREE.Points) {
          plane1PointsMaterial.color.copy(paletteColors[3 % paletteColors.length]);
          plane1PointsMaterial.color.multiplyScalar(pointBrightness);
        }
        if (plane2PointsRef.current instanceof THREE.Points) {
          plane2PointsMaterial.color.copy(paletteColors[4 % paletteColors.length]);
          plane2PointsMaterial.color.multiplyScalar(pointBrightness);
        }
      }
      
      // Reduce vertex color influence in default mode
      shapeMaterial.vertexColors = false;
      plane1Material.vertexColors = false;
      plane2Material.vertexColors = false;
    }

    // Update point sizes based on audio with smooth transition
    if (plane1PointsMaterial instanceof THREE.PointsMaterial && plane2PointsMaterial instanceof THREE.PointsMaterial) {
      const basePointSize = 2;
      const pointSize = basePointSize + modulate(Math.pow(overallAvg / 255, 0.5), 0, 1, 0, 4);
      plane1PointsMaterial.size = pointSize * (1 + upperAvgFr);
      plane2PointsMaterial.size = pointSize * (1 + lowerMaxFr);
    }
    
    // Enhanced material properties for instanced meshes to match points behavior
    if (plane1PointsRef.current instanceof THREE.InstancedMesh && plane2PointsRef.current instanceof THREE.InstancedMesh) {
      // Update emissive properties based on audio
      const mat1 = plane1PointsMaterial as THREE.MeshStandardMaterial;
      const mat2 = plane2PointsMaterial as THREE.MeshStandardMaterial;
      
      mat1.emissive = mat1.color;
      mat2.emissive = mat2.color;
      mat1.emissiveIntensity = pointBrightness * 0.5;
      mat2.emissiveIntensity = pointBrightness * 0.5;
    }
    
    // Additional lighting effects based on audio
    const spotLight = groupRef.current.children.find(child => child instanceof THREE.SpotLight) as THREE.SpotLight;
    if (spotLight) {
      spotLight.intensity = 0.5 + midMaxFr * 0.5;
      
      if (renderingMode === "rainbow") {
        // Rainbow lighting
        const lightHue = (time + midAvgFr) % 1;
        spotLight.color.setHSL(lightHue, 1, 0.8);
      } else if (paletteColors.length > 0) {
        // Palette-based lighting
        const lightColorIndex = Math.floor((midAvgFr + time) * paletteColors.length) % paletteColors.length;
        spotLight.color.copy(paletteColors[lightColorIndex]);
      }
    }
  });

  /* ------------------------------------------------------------------
     Render JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <group ref={groupRef}>
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[-10, 40, 20]} 
          intensity={0.9} 
          castShadow 
          color={new THREE.Color(1, 0.9, 0.8)}
        />
        <pointLight 
          position={[10, 10, 10]} 
          intensity={0.5} 
          color={new THREE.Color(0.8, 0.9, 1)}
        />
        
        {/* Plane 1 - Mesh (2x larger) */}
        <mesh ref={plane1Ref} rotation-x={-Math.PI / 2} position={[0, 60, 0]}>
          <planeGeometry args={[1600, 1600, 50, 50]} />
          <meshPhysicalMaterial
            color={0x6904ce}
            wireframe={renderingMode === "wireframe"}
            side={THREE.DoubleSide}
            vertexColors={true}
          />
        </mesh>
        
        {/* Plane 1 - Points/Instances */}
        {pointMode === "points" ? (
          <points ref={plane1PointsRef} rotation-x={-Math.PI / 2} position={[0, 60, 0]}>
            <planeGeometry args={[1600, 1600, 50, 50]} />
            <pointsMaterial
              color={0xffffff}
              size={20}
              sizeAttenuation={false}
              transparent={true}
              opacity={1}
            />
          </points>
        ) : (
          <instancedMesh 
            ref={plane1PointsRef} 
            args={[
              undefined, 
              undefined, 
              50 * 50
            ]}
            rotation-x={-Math.PI / 2} 
            position={[0, 60, 0]}
          >
            {pointMode === "smallCubes" && <boxGeometry args={[1, 1, 1]} />}
            {pointMode === "crosses" && <bufferGeometry attach="geometry" {...createCrossGeometry()} />}
            {pointMode === "circles" && <sphereGeometry args={[0.5, 16, 16]} />}
            {pointMode === "diamonds" && <octahedronGeometry args={[0.7, 0]} />}
            {pointMode === "triangles" && <tetrahedronGeometry args={[0.8, 0]} />}
            <meshStandardMaterial
              color={0xffffff}
              transparent={true}
              opacity={1}
              metalness={0.3}
              roughness={0.4}
              emissive={0xffffff}
              emissiveIntensity={0.2}
            />
          </instancedMesh>
        )}
        
        {/* Plane 2 - Mesh (2x larger) */}
        <mesh ref={plane2Ref} rotation-x={-Math.PI / 2} position={[0, -80, 0]}>
          <planeGeometry args={[1600, 1600, 50, 50]} />
          <meshPhysicalMaterial
            color={0x6904ce}
            wireframe={renderingMode === "wireframe"}
            side={THREE.DoubleSide}
            vertexColors={true}
          />
        </mesh>
        
        {/* Plane 2 - Points/Instances */}
        {pointMode === "points" ? (
          <points ref={plane2PointsRef} rotation-x={-Math.PI / 2} position={[0, -80, 0]}>
            <planeGeometry args={[1600, 1600, 50, 50]} />
            <pointsMaterial
              color={0xffffff}
              size={10}
              sizeAttenuation={false}
              transparent={false}
              opacity={1}
            />
          </points>
        ) : (
          <instancedMesh 
            ref={plane2PointsRef} 
            args={[
              undefined, 
              undefined, 
              50 * 50
            ]}
            rotation-x={-Math.PI / 2} 
            position={[0, -80, 0]}
          >
            {pointMode === "smallCubes" && <boxGeometry args={[1, 1, 1]} />}
            {pointMode === "crosses" && <bufferGeometry attach="geometry" {...createCrossGeometry()} />}
            {pointMode === "circles" && <sphereGeometry args={[0.5, 16, 16]} />}
            {pointMode === "diamonds" && <octahedronGeometry args={[0.7, 0]} />}
            {pointMode === "triangles" && <tetrahedronGeometry args={[0.8, 0]} />}
            <meshStandardMaterial
              color={0xffffff}
              transparent={false}
              opacity={1}
              metalness={0.3}
              roughness={0.4}
              emissive={0xffffff}
              emissiveIntensity={1}
            />
          </instancedMesh>
        )}
        
        {/* Shape Mesh */}
        <mesh ref={shapeRef} position={[0, 0, 0]}>
          {shapeMode === "sphere" && <sphereGeometry args={[10, 32, 32]} />}
          {shapeMode === "cube" && <boxGeometry args={[20, 20, 20, 10, 10, 10]} />}
          {shapeMode === "icosahedron" && <icosahedronGeometry args={[10, 4]} />}
          {shapeMode === "tetrahedron" && <tetrahedronGeometry args={[15, 3]} />}
          {shapeMode === "dodecahedron" && <dodecahedronGeometry args={[10, 2]} />}
          {shapeMode === "octahedron" && <octahedronGeometry args={[12, 3]} />}
          {shapeMode === "torus" && <torusGeometry args={[10, 4, 16, 100]} />}
                    <meshPhysicalMaterial
            color={0xff00ee}
            wireframe={renderingMode === "wireframe"}
            vertexColors={true}
          />
        </mesh>
      </group>
    </>
  );
}

/* ====================================================================
   Exported VisualizerOne Component
==================================================================== */
export default function VisualizerOne(props: VisualizerOneProps) {
  return <VisualizerOneScene {...props} />;
}

/* ====================================================================
   End of VisualizerOne Component Code
==================================================================== */