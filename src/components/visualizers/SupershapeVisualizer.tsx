/* ---------------------------------------------------------------------
 *  SupershapeVisualizer.tsx  –  Visualizer Five + Twisted-Geometry BG
 * ------------------------------------------------------------------ */
"use client";

import {
  MakeMeshParams,
  ParametricCode9Params,
  SupershapeConfig,
  SupershapeMeshParams,
  SupershapeParams,
} from "@/types";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Color, MathUtils, ShaderMaterial } from "three";

import { allSupershapeConfigs } from "@/config/supershapeConfigs";
import {
  computeParams,
  createMakeMeshGeometry,
  createSupershapeGeometry,
  createSupershapeMeshGeometry,
} from "./geometryHelpers";
import { ColorMode, RenderingMode } from "./VisualizerFiveHelpers/types";

/* ────────────────────────────────────────────────────────────── */
const SEGMENTS     = 100;
const MORPH_FACTOR = 0.7;
const BASE_RADIUS  = 12.5;
const precomputed  = computeParams(SEGMENTS);
const CAM_RADIUS   = 35;

/* ──────────────────────────────────────────────────────────────
   Shared audio chain (singleton)
   ────────────────────────────────────────────────────────────── */
let sharedAudioElement: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null     = null;
let sharedAnalyser: AnalyserNode | null         = null;

type ParamUnion =
  | SupershapeParams
  | SupershapeMeshParams
  | ParametricCode9Params
  | MakeMeshParams;

/* ────────────────────────────────────────────────────────────── */
export interface SupershapeVisualizerProps {
  audioUrl: string;
  isPaused?: boolean;
  configIndex: number;
  renderingMode?: RenderingMode;   // default = "transparent"
  colorMode: ColorMode;
}

/* ────────────────────────────────────────────────────────────── */
export default function SupershapeVisualizer({
  audioUrl,
  isPaused = false,
  configIndex,
  renderingMode = "transparent",
  colorMode,
}: SupershapeVisualizerProps) {
  /* three hooks */
  const { camera, size } = useThree();

  /* refs */
  const meshRef     = useRef<THREE.Mesh>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fftRef      = useRef<Uint8Array | null>(null);
  const bgMatRef    = useRef<ShaderMaterial>(null);
  const bgQuadRef   = useRef<THREE.Mesh>(null);

  /* ───────── current config + params ───────── */
  const currentConfig: SupershapeConfig = useMemo(
    () => allSupershapeConfigs[configIndex],
    [configIndex],
  );
  const [params, setParams] = useState<ParamUnion>(() => currentConfig.params);

  /* ───────── supershape geometry ───────── */
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
  }, [currentConfig, params]);

  /* colour attribute (avoid flicker) */
  useEffect(() => {
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    if (pos && !geometry.getAttribute("color")) {
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3),
      );
    }
  }, [geometry]);

  /* ───────── supershape material ───────── */
  const material = useMemo(() => {
    switch (renderingMode) {
      case "wireframe":
        return new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff });

      case "transparent":
        return new THREE.MeshPhysicalMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          transmission: 0.9,
        });

      case "rainbow":
      default:
        return new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide,
          vertexColors: renderingMode === "rainbow",
          color: new Color("hsl(200, 70%, 55%)"),
        });
    }
  }, [renderingMode]);

  /* ───────── shared-audio chain ───────── */
  useEffect(() => {
    if (!sharedAudioElement) {
      sharedAudioElement           = new Audio(audioUrl);
      sharedAudioElement.loop      = true;
      sharedAudioElement.crossOrigin = "anonymous";

      sharedAudioContext           = new AudioContext();
      const src                    = sharedAudioContext.createMediaElementSource(sharedAudioElement);
      sharedAnalyser               = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize       = 1024;
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
        try { await sharedAudioElement.play(); } catch (err) { console.warn(err); }
      }
    })();

    return () => {
      sharedAudioElement?.pause();
      if (sharedAudioElement) sharedAudioElement.currentTime = 0;
    };
  }, [audioUrl, isPaused]);

  /* ───────── BG shader material (Twisted Geometry) ───────── */
/* ───────── BG shader material (Twisted Geometry with FFT Audio Reactivity) ───────── */
/* ───────── BG shader material (Twisted Geometry with Per-Cell FFT Reactivity) ───────── */
const bgMaterial = useMemo(() => {
  const mat = new ShaderMaterial({
    uniforms: {
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
      iChannel0:   { value: null as THREE.Texture | null }, // optional tiling texture
      uAmp:        { value: 0 },                            // overall audio amplitude (0-1)
      uLowFreq:    { value: 0 },                            // low frequency energy (bass)
      uMidFreq:    { value: 0 },                            // mid frequency energy
      uHighFreq:   { value: 0 },                            // high frequency energy (treble)
    },

    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,

    fragmentShader: /* glsl */`
      precision highp float;

      uniform float      iTime;
      uniform vec3       iResolution;
      uniform sampler2D  iChannel0;
      uniform float      uAmp;
      uniform float      uLowFreq;
      uniform float      uMidFreq;
      uniform float      uHighFreq;

      /* ─── Twisted Geometry – FULL fragment from Shadertoy with Per-Cell Audio Enhancements ─── */

      // Maximum ray distance.
      #define FAR 30. 

      // Amount of object twisting about the Z-axis (now audio-reactive per cell).
      #define ZTWIST_BASE .5
      #define ZTWIST_AMP 1.0

      // Comment this out to omit the detailing. Basically, the bump mapping won't be included.
      #define SHOW_DETAILS

      // Object ID, used for the gold trimming in the bump mapping section.
      float svObjID;
      vec3 svCellPos; // Store cell position for per-cell effects in color

      // 2D rotation. Always handy. Angle vector, courtesy of Fabrice.
      mat2 rot(float th){ vec2 a=sin(vec2(1.5707963,0.)+th); return mat2(a,-a.y,a.x); }

      // Smooth minimum. Courtesy of IQ.
      float sminP(float a,float b,float smoothing){
          float h = clamp((b-a)/smoothing*.5 + .5, 0., 1.);
          return mix(b, a, h) - smoothing*h*(1. - h);
      }

      // Logarithmic modifier for infinite-like distribution between 0 and 1 based on position.
      float logModifier(vec3 p) {
          float dist = length(p);
          // Logarithmic function to map distance to 0-1 range with a smooth falloff.
          // log(1 + x) ensures positive values, normalized to stay in 0-1.
          return clamp(log(1.0 + dist * 0.5) / log(4.0), 0.0, 1.0);
      }

      float lattice(vec3 p){
          vec3 cellP = mod(p, 2.0); // Get cell position for unique identifier
          svCellPos = cellP; // Store for later use in color/effects
          p = abs(cellP - 1.0);
          float x1 = min(max(p.x,p.y), min(max(p.y,p.z), max(p.x,p.z))) - .32;
          p = abs(mod(p, 0.5) - 0.25);
          float x2 = min(p.x, min(p.y,p.z));
          svObjID = step(x2, x1);
          // Modulate size slightly per cell based on logarithmic modifier and audio.
          float modVal = logModifier(svCellPos);
          float audioMod = (uLowFreq * 0.5 + uMidFreq * 0.3 + uHighFreq * 0.2) * modVal;
          return max(x1, x2) - 0.05 - audioMod * 0.1;    
      }

      float map(vec3 p){
          // Per-cell twist based on position and audio.
          float modVal = logModifier(p);
          float twistFactor = ZTWIST_BASE + ZTWIST_AMP * (uLowFreq * modVal + uAmp * (1.0 - modVal));
          p.xy *= rot(p.z * twistFactor);
          float d = lattice(p); 
          p = abs(p);
          // Mids distort the shape boundaries slightly for a "pulsing" effect, scaled by cell modifier.
          d = sminP(d, -max(p.x,p.y)+1.5-d*.5 + uMidFreq * 0.3 * modVal, .25);
          return d*.7;
      }

      float trace(vec3 ro, vec3 rd){
          float t=0., d;
          for(int i=0;i<80;i++){
              d = map(ro+rd*t);
              if(abs(d)<.001*(t*.125+1.) || t>FAR) break;
              t += d;
          }
          return min(t,FAR);
      }

      vec3 tex3D(sampler2D ch, vec3 p, vec3 n){
          float modVal = logModifier(p);
          float twistFactor = ZTWIST_BASE + ZTWIST_AMP * uLowFreq * modVal;
          p.xy *= rot(p.z * twistFactor); 
          n.xy *= rot(p.z * twistFactor); 
          n = max(abs(n)-.2, .001);
          n /= dot(n, vec3(1));
          vec3 tx = texture(ch, p.yz).xyz;
          vec3 ty = texture(ch, p.xz).xyz;
          vec3 tz = texture(ch, p.xy).xyz;
          return tx*tx*n.x + ty*ty*n.y + tz*tz*n.z;
      }

      float bumpFunction(in vec3 p){
          float modVal = logModifier(p);
          float twistFactor = ZTWIST_BASE + ZTWIST_AMP * uLowFreq * modVal;
          p.xy *= rot(p.z * twistFactor); 
          return min(abs(lattice(p*4.))*1.6,1.);
      }

      vec3 doBumpMap(in vec3 p,in vec3 n,float bumpfactor,inout float edge){
          vec2 e = vec2(2./iResolution.y,0); 
          float f = bumpFunction(p);
          float fx = bumpFunction(p-e.xyy);
          float fy = bumpFunction(p-e.yxy);
          float fz = bumpFunction(p-e.yyx);
          float fx2= bumpFunction(p+e.xyy);
          float fy2= bumpFunction(p+e.yxy);
          float fz2= bumpFunction(p+e.yyx);
          vec3 grad = vec3(fx-fx2, fy-fy2, fz-fz2)/(e.x*2.);
          edge = abs(fx+fy+fz+fx2+fy2+fz2-6.*f);
          edge = smoothstep(0.,1.,edge/e.x);
          grad -= n*dot(n,grad);          
          return normalize(n + grad*bumpfactor);
      }

      vec3 nr(vec3 p,inout float edge,float t){ 
          vec2 e = vec2(2./iResolution.y,0); 
          float d1 = map(p+e.xyy), d2 = map(p-e.xyy);
          float d3 = map(p+e.yxy), d4 = map(p-e.yxy);
          float d5 = map(p+e.yyx), d6 = map(p-e.yyx);
          float d  = map(p)*2.;
          edge = abs(d1+d2-d)+abs(d3+d4-d)+abs(d5+d6-d);
          edge = smoothstep(0.,1.,sqrt(edge/e.x*2.));
          e = vec2(.005*min(1.+t,5.),0);
          d1 = map(p+e.xyy); d2=map(p-e.xyy);
          d3 = map(p+e.yxy); d4=map(p-e.yxy);
          d5 = map(p+e.yyx); d6=map(p-e.yyx);
          return normalize(vec3(d1-d2,d3-d4,d5-d6));
      }

      float cao(in vec3 p,in vec3 n){
          float sca=1.,occ=0.;
          for(float i=0.;i<5.;i++){
              float hr=.01+i*.5/4.;        
              float dd=map(n*hr+p);
              occ += (hr-dd)*sca;
              sca *= .7;
          }
          return clamp(1.-occ,0.,1.);    
      }

      float softShadow(vec3 ro, vec3 lp,float k){
          const int maxIterationsShad=20; 
          vec3 rd=(lp-ro);
          float shade=1.,dist=.05,end=max(length(rd),.001);
          rd/=end;
          for(int i=0;i<maxIterationsShad;i++){
              float h=map(ro+rd*dist);
              shade=min(shade,smoothstep(0.,1.,k*h/dist));
              dist+=clamp(h,.01,.2);
              if(h<.001||dist>end)break; 
          }
          return max(shade,0.); 
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord){
          vec2 uv=(fragCoord-iResolution.xy*.5)/iResolution.y;
          vec3 ro=vec3(0,0,iTime);
          vec3 rd=normalize(vec3(uv,.6));
          rd.xy*=rot(iTime/4. + uAmp * 0.5); // Audio-driven camera rotation
          rd.xz*=rot(iTime/4. + uAmp * 0.5);
          vec3 lp=ro+vec3(0,.25,.25);
          float t=trace(ro,rd);
          vec3 sp=ro+rd*t;
          float edge; 
          vec3 sn=nr(sp,edge,t);
          float sh=softShadow(sp,lp,16.);
          float ao=cao(sp,sn);
          lp-=sp;
          float lDist=max(length(lp),.0001);
          lp/=lDist;
          float atten=1./(1.+lDist*lDist*.2);
          vec3 tx=tex3D(iChannel0,sp,sn);
          tx=smoothstep(.05,.5,tx);
          float edge2=0.;
          #ifdef SHOW_DETAILS
          sn=doBumpMap(sp,sn,.125/(1.+t/FAR),edge2);
          if(svObjID<.5) tx*=vec3(0.3, 0.3, 0.3); // Darkened gold trimming to a dark gray
          #endif
          tx*=(1.-edge*.7)*(1.-edge2*.7);
          float dif=max(dot(lp,sn),0.);
          dif=pow(dif,4.)*.66+pow(dif,8.)*.34;
          float spe=pow(max(dot(reflect(rd,sn),lp),0.),6.);
          float fre=pow(clamp(dot(rd,sn)+1.,0.,1.),4.);
          vec3 fc=tx*(dif*sh*1.5+.3+vec3(0.2, 0.2, 0.2)*fre*sh*4.)+ // Dark gray fresnel effect
                   vec3(0.4, 0.4, 0.4)*spe*sh*3.; // Silver highlight for specular
          fc*=atten*ao;
          
          // Per-cell color variation using logarithmic modifier and audio frequencies, darker tones.
          float cellMod = logModifier(svCellPos);
          float grayTone = 0.1 + uAmp * 0.3 * cellMod + uHighFreq * 0.2 * (1.0 - cellMod); // Low lightness for dark theme
          vec3 audioColor = vec3(
            grayTone + uLowFreq * 0.1 * cellMod, // Slight variation in red channel for depth
            grayTone + uMidFreq * 0.05 * cellMod, // Slight variation in green channel
            grayTone + uHighFreq * 0.1 * (1.0 - cellMod) // Slight variation in blue channel for cold tone
          );
          fc = mix(fc, audioColor * fc, 0.3 + uAmp * 0.5 * cellMod); // Blend audio color with geometry per cell.
          
          // Darker background using blacks and dark grays
          vec3 bg=mix(vec3(0.05, 0.05, 0.05), vec3(0.2, 0.2, 0.2), rd.y*.25+.25);
          // High-frequency glitch effect with muted gray tones.
          float glitch = sin(iTime * 10.0 + uHighFreq * 20.0 * cellMod) > 0.9 ? 0.2 : 0.0;
          bg += vec3(glitch * uHighFreq * 0.3, glitch * uHighFreq * 0.3, glitch * uHighFreq * 0.35); // Subtle gray glitch
          fc=mix(bg,fc,1./(1.+t*t*.015));

          /* —— Audio-reactive brightness with Einstein's precision, per cell, toned down for darkness —— */
          fc *= (0.4 + uAmp * 0.8 + sin(uLowFreq * 3.14159 * cellMod) * 0.2); // Reduced brightness multiplier

          fragColor = vec4(sqrt(clamp(fc,0.,1.)),1.);
      }

      void main() {
        vec4 col;
        mainImage(col, gl_FragCoord.xy);
        gl_FragColor = col;
      }
    `,
  });

  mat.depthWrite = false;
  mat.depthTest = false;
  return mat;
}, [size]);


  /* keep iResolution updated on resize */
  useEffect(() => {
    bgMaterial.uniforms.iResolution.value.set(size.width, size.height, 1);
  }, [bgMaterial, size]);

  /* ───────── frame loop ───────── */
  useFrame(({ clock }) => {
    const mesh   = meshRef.current;
    const fft    = fftRef.current;
    const bgMat  = bgMatRef.current;
    const quad   = bgQuadRef.current;

    /* fft amplitude */
    let amp = 0;
    if (fft && analyserRef.current) {
      analyserRef.current.getByteFrequencyData(fft);
      amp = fft.reduce((s, v) => s + v, 0) / (fft.length * 255);
    }

    /* camera auto-orbit */
    const θ = clock.elapsedTime * 0.15;
    camera.position.set(
      Math.sin(θ) * CAM_RADIUS,
      Math.sin(θ * 0.5) * 10,
      Math.cos(θ) * CAM_RADIUS,
    );
    camera.lookAt(0, 0, 0);

    /* supershape transforms */
    if (mesh) {
      mesh.rotation.y += 0.003;
      mesh.rotation.x += 0.002;
      mesh.scale.setScalar(1 + amp * 0.5);
    }

    /* supershape morphing */
    setParams(prev => {
      if (currentConfig.type !== "supershape") return prev;
      const p = prev as SupershapeParams;
      const t = currentConfig.params as SupershapeParams;
      if (!p.params1 || !t.params1) return prev;
      return {
        params1: {
          m:  MathUtils.lerp(p.params1.m,  t.params1.m,  MORPH_FACTOR),
          n1: MathUtils.lerp(p.params1.n1, t.params1.n1, MORPH_FACTOR),
          n2: MathUtils.lerp(p.params1.n2, t.params1.n2, MORPH_FACTOR),
          n3: MathUtils.lerp(p.params1.n3, t.params1.n3, MORPH_FACTOR),
          a:  p.params1.a, b: p.params1.b,
        },
        params2: {
          m:  MathUtils.lerp(p.params2.m,  t.params2.m,  MORPH_FACTOR),
          n1: MathUtils.lerp(p.params2.n1, t.params2.n1, MORPH_FACTOR),
          n2: MathUtils.lerp(p.params2.n2, t.params2.n2, MORPH_FACTOR),
          n3: MathUtils.lerp(p.params2.n3, t.params2.n3, MORPH_FACTOR),
          a:  p.params2.a, b: p.params2.b,
        },
        resol: p.resol,
      } as SupershapeParams;
    });

    /* colour modes */
    const stdMat = mesh?.material as THREE.MeshStandardMaterial;
    if (stdMat) {
      if (colorMode === "audioAmplitude") {
        stdMat.color.setHSL(amp, 0.8, 0.5);
      } else if (colorMode === "frequencyBased" && fft) {
        const low  = fft.slice(0, fft.length/3).reduce((s,v)=>s+v,0)/(fft.length/3*255);
        const high = fft.slice(-fft.length/3).reduce((s,v)=>s+v,0)/(fft.length/3*255);
        stdMat.color.setRGB(low,0.5,high);
      } else if (colorMode === "rainbow") {
        stdMat.color.setHSL((clock.elapsedTime*0.15+amp*0.3)%1,0.7,0.6);
      }
    }

    /* per-vertex rainbow */
if (renderingMode === "rainbow" && mesh) {
  const geom = mesh.geometry as THREE.BufferGeometry;

  // ①  Ensure a color attribute exists *right now*.
  if (!geom.getAttribute("color")) {
    const pos = geom.getAttribute("position") as THREE.BufferAttribute;
    geom.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3)
    );
  }

  // ②  Now we’re safe to fetch it and write colours.
  const pos = geom.getAttribute("position") as THREE.BufferAttribute;
  const col = geom.getAttribute("color")    as THREE.BufferAttribute;

  const t   = clock.elapsedTime * 0.15;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const hue = (Math.atan2(y, x) / (2 * Math.PI) + 0.5 + t) % 1;
    const c   = new THREE.Color().setHSL(hue, 0.7 + amp * 0.3, 0.5);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
  (mesh.material as THREE.MeshStandardMaterial).vertexColors = true;
}
 else if (stdMat) {
      stdMat.vertexColors = false;
    }

    /* update BG uniforms */
    if (bgMat) {
      bgMat.uniforms.iTime.value = clock.elapsedTime;
      bgMat.uniforms.uAmp.value  = amp;
    }

    /* stick BG quad to camera */
    if (quad) {
      quad.position.copy(camera.position);
      quad.quaternion.copy(camera.quaternion);
      quad.translateZ(-0.5);   // half-unit behind camera
    }
  });

  /* ───────── JSX ───────── */
return (
  <>
    {/* 1️⃣  FULL-SCREEN BACKGROUND  (rendered first, depth-test off) */}
    <mesh
      ref={bgQuadRef}
      frustumCulled={false}
      renderOrder={-1}             /*  <- draws before anything else   */
    >
      <planeGeometry args={[2, 2]} />
      <primitive
        object={bgMaterial}
        ref={bgMatRef}
        attach="material"
      />
    </mesh>

    {/* 2️⃣  SUPER-SHAPE  (uses normal depth test, so sits “in front”) */}
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      renderOrder={0}              /*  default; can omit               */
    />

    {/* 3️⃣  CAMERA CONTROLS */}
    <OrbitControls
      enablePan={false}
      maxDistance={55}
      minDistance={20}
      autoRotate
      autoRotateSpeed={0.7}
    />
  </>
);

}
