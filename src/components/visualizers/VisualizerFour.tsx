/* -----------------------------------------------------------------------
 *  VisualizerFour.tsx – Immersive FFT “Audio-Orbit” Ray-march Visualizer
 * Credits and Inspiration: https://www.shadertoy.com/view/wffSz4 
 * Created by KylBlz in 2025-02-28
 * -------------------------------------------------------------------- */
"use client";

import { RENDER_MODE_CODE } from "@/utils/renderingModes";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import useSharedAudio from "./useSharedAudio";
import { ColorMode, RenderingMode } from "./VisualizerFourHelpers/types";
/* ────── Props ────── */
interface VisualizerFourProps {
  audioUrl: string;
  isPaused: boolean;
    renderingMode: RenderingMode;
  colorMode:     ColorMode;
  fftIntensity:  number;
}

/* ──────────────────────────────────────────────────────────────
 *  Shaders (unchanged)
 * ───────────────────────────────────────────────────────────── */
// The main vertex shader is a simple pass-through for a full-screen quad.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;


// This is the first pass: the main raymarching shader.
const raymarchFragmentShader = `
  precision highp float;
  precision highp int;

  // Uniforms provided by the VisualizerFour component
  uniform int   iColorMode;
uniform float iFftIntensity;
 // Neptune-style texture helpers ----------------------------
 float hash1(float n){ return fract(sin(n)*43758.5453123); }
 float noise1D(float x){
   float i=floor(x), f=fract(x);
   float u=f*f*(3.0-2.0*f);
   return mix(hash1(i),hash1(i+1.0),u);
 }
 // banded blue gradient with subtle clouds
 vec3 neptuneBands(float lat,float t){
   float base = 0.35+0.25*sin(lat*8.0+noise1D(lat*4.0+t)*2.0);
   vec3 deep  = vec3(0.03,0.16,0.40);
   vec3 light = vec3(0.28,0.50,0.85);
   return mix(deep,light,base);
 }
  uniform vec2 iResolution;
  uniform float iTime;
  uniform int iFrame;
  uniform int iRenderMode;
  uniform vec4 iMouse;
  uniform sampler2D iChannel0; // Previous frame for temporal accumulation
  uniform vec3 iAudio;     
  uniform float iEnergy; 
  uniform vec3 iAudioExtra;
  
  // NEW: Camera position and target for dynamic camera movement
  uniform vec3 iCameraPos;
  uniform vec3 iCameraTarget;

  varying vec2 vUv;

  // All GLSL code from the prompt is inserted here
  const float EPS = (1.0 / 255.0);
  const float QTRPI = 0.7853981, HPI = 1.5707963, PI = 3.1415926, TWOPI = 6.2831853;

  const highp float PHI1 = 1.0 - 1.0 / float(1.61803398);
  const highp vec2  PHI2 = 1.0 - 1.0 / pow(vec2(1.32471795), vec2(1.0, 2.0));
  const highp vec3  PHI3 = 1.0 - 1.0 / pow(vec3(1.22074408), vec3(1.0, 2.0, 3.0));

  const int TEMPORAL_SMOOTHING = 8;

  int genSeed(in int f, in ivec2 c) {
      return (c.x + c.y*2 + f) + (c.x*1155 ^ c.y*2244) & 0xFFFF;
  }

  float r21(in int v) { return fract(PHI1 * float(v)); }
  vec2 r22(in int v) { return fract(PHI2 * float(v)); }
  vec3 r23(in int v) { return fract(PHI3 * float(v)); }

  vec2 concentric(in vec2 u) {
      vec2 w = u * 2.0 - 1.0;
      float thta, rad;
      if (abs(w.x) > abs(w.y)) {
          rad = w.x;
          thta = QTRPI * (w.y/w.x);
      } else {
          rad = w.y;
          thta = HPI - QTRPI * (w.x/w.y);
      }
      return rad * vec2(cos(thta), sin(thta));
  }

  mat3 basisFwd(in vec3 forward) {
      vec3 down = vec3(0.0, -1.0, 0.0);
      vec3 right = normalize(cross(forward, down));
      return mat3(right, normalize(cross(forward, right)), forward);
  }

  float gauss(float x) { return exp(-0.5*x*x); }

  float fA(float x) {
      return (abs(x) < 1.88)? gauss(x / 1.4): (abs(x) > 6.0)? 1.35/abs(x*x*x): (gauss(x/1.4) + 2.7/abs(x*x*x))/2.0;
  }

  vec3 wypb(in float i) {
      #define inRange(a,x,b) step(a,x)*step(x,b)
      vec3 c = vec3(0.0),
           w = vec3(1.0),
           y = vec3(1.0, 0.8, 0.0),
           o = vec3(1.0, 0.333, 0.0),
           p = vec3(1.0, 0.0, 0.666),
           b = vec3(0.0, 0.1, 1.0);
      float n_cols = 4., j = clamp(i, 0., 1.), x = clamp(j * n_cols, 0., n_cols), f = floor(x);
      x = smoothstep(0., 1., fract(x));
      c += inRange(0., f, 0.) * mix(w, y, x);
      c += inRange(1., f, 1.) * mix(y, o, x);
      c += inRange(2., f, 2.) * mix(o, p, x);
      c += inRange(3., f, 3.) * mix(p, b, x);
      c += inRange(4., f, 4.) * b;
      return c;
  }

  vec3 dfSmooth3(in vec2 fc, in vec3 v) {
      vec2 q = vec2(uvec2(fc.xy) & uvec2(1));
      q = q * 2.0 - 1.0;    
      v -= 0.5 * dFdx(v) * q.x;
      v -= 0.5 * dFdy(v) * q.y;
      return v;
  }

  float sd_segment(vec2 xy, vec2 pt1, vec2 pt2) {
      vec2 a = pt2 - pt1;
      vec2 b = xy - pt1;
      float h = dot(b, a) / dot(a, a);
      return length(b - clamp(h, 0.0, 1.0) * a);
  }

  float sd_circle(vec2 xy, vec2 c, float r) {
      return abs(distance(xy, c) - r);
  }

  float det2x2(in vec2 a, in vec2 b) { return a.x*b.y - b.x*a.y; }

  vec2 fn_d1(in vec2 fn_i, in vec2 fn_f) { return 0.5 * (fn_i - fn_f); }
  vec2 fn_d2(in vec2 fn_i, in vec2 fn, in vec2 fn_f) { return fn_f - 2.0*fn + fn_i; }

  vec2 _evolute(in vec2 d0, in vec2 d1, in vec2 d2) {
      float d1s = dot(d1, d1);
      float norm = 1.0 / det2x2(d1, d2);
      return d0 + vec2(-d1s, d1s) * d1.yx * norm;
  }

  vec2 evolute(in vec2 fn_i, in vec2 fn, in vec2 fn_f) {
      return _evolute(fn, fn_d1(fn_i, fn_f), fn_d2(fn_i, fn, fn_f));
  }
  
  vec2 _orthotomic(in vec2 d0, in vec2 d1, in vec2 p) {
    vec2 d1s = d1 * d1;
    vec2 d1yx = d1.yx * d1;
    float norm = 1.0 / (d1s.x + d1s.y);
    vec2 petal = p * d1s + d0 * d1s.yx + (p.yx - d0.yx) * d1yx;
    return 2.0 * petal * norm - p;
  }
  vec2 orthotomic(in vec2 fn_i, in vec2 fn, in vec2 fn_f, in vec2 p) {
    return _orthotomic(fn, fn_d1(fn_i, fn_f), p);
  }

  const float zfar = 1000.0;

  // Scene objects, now dynamically controlled
  vec4 light;
  vec4 sphere;

/* --------------------------------------------------------------
   SDF for ground, central sphere, light, and audio domes
   -------------------------------------------------------------- */
float sdf(in vec3 p)
{
    float d = zfar;

    /* ── Static objects ──────────────────────────────── */
    // Ground with wave effect driven by audio
    float waveFreq = 1.0 + iEnergy * 2.0; // Frequency of wave increases with energy
    float waveAmp = 0.2 + iAudio.x * 0.5; // Amplitude scales with bass
    float wavePhase = iTime * (1.0 + iEnergy * 1.5); // Speed of wave propagation tied to energy
    float waveOffset = sin(p.x * waveFreq + wavePhase) * sin(p.z * waveFreq + wavePhase) * waveAmp;
    d = min(d, p.y - waveOffset); // Deform ground with wave

    d = min(d, distance(p, sphere.xyz) - sphere.w);    // big sphere
    d = min(d, distance(p, light.xyz) - light.w);      // light

    /* ── Cell math ───────────────────────────────────── */
    vec2 cellId = floor(p.xz);
    vec2 idAbs = abs(cellId);              // mirror symmetry
    vec3 cellPos = vec3(fract(p.x), p.y, fract(p.z));

    /* Hash identical for ±X/±Z mirrors */
    float h = fract(sin(dot(idAbs, vec2(37.45, 91.17))) * 43758.5453);

    /* FFT band pick: (x+y)&3    0=bass 1=mid 2=treble */
    float idx = mod(cellId.x + cellId.y, 3.0);
    float bandAmp = mix(mix(iAudio.x, iAudio.y, step(1.0, idx)), iAudio.z, step(2.0, idx));

    /* ---------- MORE SENSITIVE AUDIO MATH ---------- */
    float delay = max(idAbs.x, idAbs.y) * 0.8;          // domino effect for cells
    float wave = 0.5 + 0.5 * sin(iTime - delay);        // 0-1 pulse
    float ampRaw = pow(bandAmp, 0.3) * (1.5 + iEnergy * 1.5);
    float amp = clamp(ampRaw, 0.0, 2.0) * wave;

    /* Geometry driven by louder amp ------------------- */
    float radiusBoost = 0.18 + 0.14 * h;
    float liftBoost = 0.35 + 0.55 * h;
    float wobbleBoost = 0.12;

    float radius = 0.05 + amp * radiusBoost;
    float yLift = amp * liftBoost;
    float wobble = sin(iTime * (10.1 + 3.0 * h));
    radius *= 0.9 + wobbleBoost * wobble;

    /* Signed distance to this dome with audio influence */
    d = min(d, distance(vec3(cellPos.x, cellPos.y - yLift, cellPos.z), vec3(0.5, 0.0, 0.5)) - radius);

    return d;
}

  vec4 norcurv(in vec3 p, in float ep) {
      vec2 e = vec2(-1, 1)*ep;
      float t1 = sdf(p + e.yxx), t2 = sdf(p + e.xxy);
      float t3 = sdf(p + e.xyx), t4 = sdf(p + e.yyy);
      float d = sdf(p);
      return vec4(normalize(e.yxx*t1 + e.xxy*t2 + e.xyx*t3 + e.yyy*t4), (t1+t2+t3+t4 - 4.0*d)/(ep*ep));
  }

  vec4 raymarch(in vec3 ro, in vec3 rd) {
      vec4 l = vec4(ro, 0.0);
      for (int i = 0; i < 255; i++) {
          float d = sdf(l.xyz);
          if (d < EPS) return l;
          l.w += d;
          l.xyz += rd * d;
          if (l.w > zfar) break;
      }
      return vec4(zfar);
  }

  float tMin = -PI;
  float tMax = PI;
  float density = 128.0;
  float alpha = 1.0, beta = 1.0 + EPS;

  vec2 ellipse_0(in float t) { vec2 a = vec2(cos(t), sin(t)); return vec2(alpha * a.x, beta * a.y); }
  vec2 ellipse_1(in float t) { vec2 a = vec2(cos(t), sin(t)); return vec2(alpha * -a.y, beta * a.x); }
  vec2 ellipse_2(in float t) { vec2 a = vec2(cos(t), sin(t)); return vec2(alpha * -a.x, beta * -a.y); }

  vec2 ellipse_evolute(in float t) { return _evolute(ellipse_0(t), ellipse_1(t), ellipse_2(t)); }
  vec2 ellipse_orthotomic(in float t, in vec2 p) { return _orthotomic(ellipse_0(t), ellipse_1(t), p); }
  vec2 ellipse_catacaustic(in float t, in vec2 p) {
      return evolute(
          ellipse_orthotomic(t - EPS, p),
          ellipse_orthotomic(t, p),
          ellipse_orthotomic(t + EPS, p)
      );
  }

  void diffGeo(in float t, in vec2 p1, out vec2 geo_0t, out vec2 geo_evo_0t, out vec2 geo_evo_1t, out vec2 geo_ortho_0t, out vec2 geo_cata_0t, out vec2 geo_cata_1t) {
    geo_0t = ellipse_0(t);
    geo_evo_0t = ellipse_evolute(t);
    geo_evo_1t = fn_d1(ellipse_evolute(t - EPS), ellipse_evolute(t + EPS));
    geo_ortho_0t = ellipse_orthotomic(t, p1);
    geo_cata_0t = ellipse_catacaustic(t, p1);
    geo_cata_1t = fn_d1(ellipse_catacaustic(t - EPS, p1), ellipse_catacaustic(t + EPS, p1));
    geo_evo_1t *= -sign(geo_evo_1t.x * geo_evo_1t.y);
    geo_cata_1t *= sign(dot(reflect(normalize(p1 - geo_0t), normalize(geo_evo_1t)), -geo_cata_1t));
  }

  vec3 drawCaustics(in vec2 p1, in vec2 p2, vec3 p2n, mat3 planeRot) {
    vec3 outp = vec3(0.0);
    float tStep = (tMax - tMin - EPS) / density;
    for (float t = tMin; t < tMax; t += tStep) {
        vec2 geo_0t, geo_evo_0t, geo_evo_1t, geo_ortho_0t, geo_cata_0t, geo_cata_1t;
        diffGeo(t, p1, geo_0t, geo_evo_0t, geo_evo_1t, geo_ortho_0t, geo_cata_0t, geo_cata_1t);
        vec2 evoVec = normalize(geo_evo_1t);
        vec2 catVec = normalize(geo_cata_1t);
        if (dot(evoVec, catVec) > 0.0) {
            vec3 mirror3d = planeRot[0] * geo_0t.x + planeRot[1] * geo_0t.y;
            vec3 mirrorColor = wypb((atan(mirror3d.x, -mirror3d.z)+HPI)/PI); 
            vec3 cat3d = planeRot[0] * catVec.x + planeRot[1] * catVec.y;
            outp = mix(mirrorColor * TWOPI * max(0.0, dot(p2n, -cat3d)), outp, smoothstep(0.0, 0.05, sd_segment(p2, geo_0t, geo_0t + catVec * zfar)));
        }
    }
    return outp;
  }

  void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec4 fragColor = vec4(0.0);
      
      int seed = genSeed(iFrame, ivec2(fragCoord));
      vec2 rng2 = concentric(r22(seed)*0.999+0.0005) * 0.5;
      
      float asp = iResolution.x / iResolution.y;
      vec2 uv = (fragCoord + rng2) / iResolution.xy;
      vec2 ndc = uv * 2.0 - 1.0;
      vec2 ndca = ndc * vec2(asp, 1.0);
      
      // Calculate ray origin (ro) and ray direction (rd) based on camera uniforms
      vec3 camFwd = normalize(iCameraTarget - iCameraPos);
      // Assuming Y is up, calculate right and up vectors for the camera basis
      vec3 camRight = normalize(cross(vec3(0.0, 1.0, 0.0), camFwd));
      vec3 camUp = normalize(cross(camFwd, camRight));
      
      // Focal length / FOV factor, adjust as needed for desired perspective
      float fov = 1.8; // Smaller value for wider FOV
      vec3 ro = iCameraPos;
      vec3 rd = normalize(camFwd * fov + camRight * ndca.x + camUp * ndca.y);
      
      fragColor = texture2D(iChannel0, vUv);
      if (iMouse.z > 0.0) { fragColor = vec4(0.0); }
      if (fragColor.w > float(TEMPORAL_SMOOTHING)) {
          fragColor.rgb *= float(TEMPORAL_SMOOTHING) / fragColor.w;
          fragColor.w = float(TEMPORAL_SMOOTHING);
      }
      
float bass  = iAudio.x;
float mid   = iAudio.y;
float treble= iAudio.z;
float time  = iTime * 0.4;

light.w   = 0.1;
light.xyz = vec3(
    cos(time)*3.0*(1.0 + bass*1.5),
    1.5 + mid*2.5,
    sin(time)*3.0*(1.0 + bass*1.5));

sphere.xyz = vec3(0.0, 1.0, 0.0);
 // centre sphere breathes with bass
 sphere.w   = 1.0 + bass * 0.8 * iFftIntensity;
      
      vec4 h = raymarch(ro, rd);
      vec4 nc = norcurv(h.xyz, EPS);
      
      if (h.w >= zfar) {
          fragColor.rgb += max(0.0, rd.y*0.5)*max(0.0, rd.y*0.5);
          fragColor.a += 1.0;
          gl_FragColor = fragColor;
          return;
      }
      if (distance(h.xyz, light.xyz) < light.w + EPS) {
          fragColor.rgb += vec3(1.0);
          fragColor.a += 1.0;
          gl_FragColor = fragColor;
          return;
      }
      if (distance(h.xyz, sphere.xyz) < sphere.w + EPS) {
          vec3 mirrorCol = wypb((atan(h.x, -h.z)+HPI)/PI);
          ro = h.xyz + nc.xyz * EPS;
          rd = reflect(rd, nc.xyz);
          h = raymarch(ro, rd);
          nc = norcurv(h.xyz, EPS);
          if (h.w >= zfar) {
              fragColor.rgb += max(0.0, rd.y*0.5)*max(0.0, rd.y*0.5) * mirrorCol;
              fragColor.a += 1.0;
              gl_FragColor = fragColor;
              return;
          }
          if (distance(h.xyz, light.xyz) < light.w + EPS) {
              fragColor.rgb += HPI * mirrorCol;
              fragColor.a += 1.0;
              gl_FragColor = fragColor;
              return;
          }
      }
      
      vec3 r3d = r23(seed);
      vec4 rng4 = vec4(concentric(r3d.xy), concentric(vec2(r3d.z, r21(seed))));
      vec3 ls = (light.xyz - sphere.xyz) + rng4.xyz * light.w;
      vec3 hs = (h.xyz - sphere.xyz);
      mat3 planeRot = basisFwd(normalize(cross(ls, hs)));
      vec2 planeL = vec2(dot(planeRot[0], ls), dot(planeRot[1], ls));
      vec2 planeH = vec2(dot(planeRot[0], hs), dot(planeRot[1], hs));
      
      float tstep = (tMax - tMin - EPS) / density;
      tMin += rng4.w*tstep;
      tMax += rng4.w*tstep;
      
      fragColor.rgb += drawCaustics(planeL.xy, planeH.xy, nc.xyz, planeRot) * 0.1;
      fragColor.a += 1.0;
/* ------------------------------------------------------------------
   ♥ RENDER MODES ♥  (solid is the default fall-through)
   ------------------------------------------------------------------ */
if (iRenderMode == 1){            // wire-frame
    float edge = smoothstep(0.0,0.02,fwidth(h.w));
    fragColor.rgb = mix(vec3(0.0),vec3(1.0),1.0-edge);
    fragColor.a   = 1.0;
}
else if (iRenderMode == 2){       // gray-scale
    float g = dot(fragColor.rgb,vec3(0.299,0.587,0.114));
    fragColor.rgb = vec3(g);
}
else if (iRenderMode == 3){       // metallic-rainbow
    float fres = pow(1.0-abs(dot(rd,nc.xyz)),5.0);
    float hue  = fract(iTime*0.05 + nc.x*0.3 + nc.y*0.3);
    vec3  col  = vec3(abs(sin(hue*6.283)),abs(sin(hue*6.283+2.1)),abs(sin(hue*6.283+4.2)));
    fragColor.rgb = mix(col,vec3(1.0),fres);
}
else if (iRenderMode == 4){       // nebula (fractal fog)
    float dFog = exp(-h.w*0.15);
    vec3 fogCol= mix(vec3(0.1,0.0,0.2),vec3(0.6,0.2,0.8),nc.y*0.5+0.5);
    fragColor.rgb = mix(fogCol,fragColor.rgb,dFog);
}
else if (iRenderMode == 5){       // aurora-crystal
    float band = smoothstep(0.0,0.1,abs(sin(rd.y*20.0+iTime*2.0)));
    vec3  aur  = vec3(0.1,0.8,1.2)*band;
    aur  = mix(aur,aur.bgr,0.5);
    float fres = pow(1.0-abs(dot(rd,nc.xyz)),3.0);
    fragColor.rgb = mix(fragColor.rgb+aur,aur,fres*0.7);
}

      gl_FragColor = fragColor;
  }
`;

// This is the second pass: a simple shader to display the result and apply gamma correction.
const displayFragmentShader = `
  precision highp float;
  uniform sampler2D iChannel0;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(iChannel0, vUv);
    if (color.a > 0.0) {
      color.rgb /= color.a;
    }
    color.rgb = pow(max(vec3(0.0), color.rgb), vec3(1.0/2.2));
    gl_FragColor = vec4(color.rgb, 1.0);
  }
`;

const VisualizerFour: React.FC<VisualizerFourProps> = ({
  audioUrl, isPaused, renderingMode, colorMode, fftIntensity,
}) => {
  /* Scene basics */
  const { gl, size } = useThree();

  /* ─── Shared audio hook ─── */
const analyserRef = useSharedAudio(audioUrl, isPaused);   // ← no cast, no destructuring

  /* If your hook *returns* the ref itself, replace the two lines above with:  */
  /* const analyserRef = useSharedAudio(audioUrl, isPaused);                  */

  /* Ping-pong render targets */
  const bufferA = useMemo(
    () =>
      new THREE.WebGLRenderTarget(size.width, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
      }),
    [size.width, size.height],
  );
  const bufferB = useMemo(
    () =>
      new THREE.WebGLRenderTarget(size.width, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
      }),
    [size.width, size.height],
  );
  const buffers = useRef({ read: bufferA, write: bufferB });

  /* Materials & dummy quad */
  const { raymarchMaterial, displayMaterial, dummyScene, dummyCamera } =
    useMemo(() => {
      const rm = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: raymarchFragmentShader,
        uniforms: {
          iResolution:  { value: new THREE.Vector2(size.width, size.height) },
          iTime:        { value: 0 },
          iFrame:       { value: 0 },
          iMouse:       { value: new THREE.Vector4() },
          iChannel0:    { value: null },
          iAudio:       { value: new THREE.Vector3() },
          iEnergy:      { value: 0 },          // ★ NEW – global loudness
          iCameraPos:   { value: new THREE.Vector3() },
          iCameraTarget:{ value: new THREE.Vector3() },
          iRenderMode : { value: 0 },      // default “classic”
          iAudioExtra:  { value: new THREE.Vector3() },
  iColorMode:   { value: 0 },
  iFftIntensity:{ value: 1.0 },
        },
      });

      const disp = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: displayFragmentShader,
        uniforms: { iChannel0: { value: null } },
      });

      const scene  = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), rm));

      return { raymarchMaterial: rm, displayMaterial: disp, dummyScene: scene, dummyCamera: camera };
    }, [size.width, size.height]);

  /* Resize → update targets & uniform only when W/H change */
  useEffect(() => {
    buffers.current.read.setSize(size.width, size.height);
    buffers.current.write.setSize(size.width, size.height);
    raymarchMaterial.uniforms.iResolution.value.set(size.width, size.height);
  }, [size.width, size.height, raymarchMaterial]);
useEffect(() => {
  raymarchMaterial.uniforms.iRenderMode.value =
    RENDER_MODE_CODE[renderingMode];

  // If you branch in GLSL on colour-mode, convert it the same way
  // raymarchMaterial.uniforms.iColorMode.value =
  //   COLOR_MODE_CODE[colorMode];

  raymarchMaterial.uniforms.iFftIntensity.value = fftIntensity;
}, [renderingMode, colorMode, fftIntensity, raymarchMaterial]);
  /* Audio smoothing & frame counter (refs don’t trigger renders) */
  const smoothed = useRef([0, 0, 0]);
  const frameCtr = useRef(0);

  /* Main animation loop */
/* ------------------------------------------------------------- *
 * 🌟  EINSTEIN x KANYE  –  audio feature extraction on steroids  *
 * ------------------------------------------------------------- */
const prevSpectrumRef = useRef<Float32Array | null>(null);
const longRmsRef      = useRef<number>(0);
const beatRef         = useRef<number>(0);

useFrame(({ clock }, delta) => {
  const now = clock.getElapsedTime();

  /* ──────────────── 1. FFT + time-domain harvest ────────────── */
  if (analyserRef.current) {
    const analyser  = analyserRef.current;
    const bins      = analyser.frequencyBinCount;

    /* allocate once */
    if (!prevSpectrumRef.current) prevSpectrumRef.current = new Float32Array(bins);

    const fBuf = new Float32Array(bins);   // dBFS spectrum
    const tBuf = new Uint8Array(bins);     // 0-255 waveform
    analyser.getFloatFrequencyData(fBuf);
    analyser.getByteTimeDomainData(tBuf);

    /* helpers */
    const lin  = (dB: number) => Math.pow(10, dB / 20);  // dB → linear power
    const lerp = THREE.MathUtils.lerp;

    /* Bark-scale bands (≈ critical bands, 0→~15 kHz) */
    const bark: [number, number][] = [
      [   20,   150], [ 150,   400], [ 400,   630], [ 630,  1000],
      [ 1000,  1500], [1500,  2500], [2500,  4000], [4000,  6000],
      [ 6000,  9000], [9000, 15000]
    ];

    const nyquist = analyser.context.sampleRate * 0.5;
    const idx2Hz  = (i: number) => (i / bins) * nyquist;

    /* power per bark band (log-RMS) */
    const bandPow = bark.map(([lo, hi]) => {
      let p = 0, n = 0;
      for (let i = 0; i < bins; i++) {
        const hz = idx2Hz(i);
        if (hz < lo || hz > hi) continue;
        p += Math.pow(lin(fBuf[i]), 2);
        n++;
      }
      return n ? Math.sqrt(p / n) : 0;
    });

    /* coarse musical bands */
    const bass   = bandPow.slice(0, 2).reduce((a, b) => a + b, 0);   // < 400 Hz
    const mid    = bandPow.slice(2, 6).reduce((a, b) => a + b, 0);   // 400-2 k5
    const treble = bandPow.slice(6).reduce((a, b) => a + b, 0);      // > 2 k5

    /* spectral centroid */
    let num = 0, den = 0;
    for (let i = 0; i < bins; i++) {
      const w = lin(fBuf[i]);
      num += idx2Hz(i) * w;
      den += w;
    }
    const centroid = den ? THREE.MathUtils.clamp(num / den / nyquist, 0, 1) : 0;

    /* flux (positive spectral change) */
    const prev = prevSpectrumRef.current!;
    let flux = 0;
    for (let i = 0; i < bins; i++) {
      const diff = lin(fBuf[i]) - lin(prev[i]);
      flux += diff > 0 ? diff : 0;
      prev[i] = fBuf[i];
    }
    flux = Math.min(flux * 0.5, 1);

    /* beat / transient detector */
    const shortRms = Math.sqrt(
      tBuf.reduce((s, v) => s + Math.pow((v - 128) / 128, 2), 0) / tBuf.length
    );
    const longRms  = longRmsRef.current;
    const BEAT_ATK = 0.6, BEAT_REL = 0.02;
    beatRef.current = Math.max(0, (shortRms - longRms) * 4);
    longRmsRef.current = lerp(
      longRms, shortRms, shortRms > longRms ? BEAT_ATK : BEAT_REL
    );

    /* perceptual smoothing (fast attack / slow release) */
    const atk = 0.25, rel = 0.05;
    const smooth = (v: number, i: 0 | 1 | 2) =>
      smoothed.current[i] = lerp(
        smoothed.current[i],
        v,
        v > smoothed.current[i] ? atk : rel
      );
    smooth(bass, 0); smooth(mid, 1); smooth(treble, 2);


    const loud   = bass + mid * 0.7 + treble * 0.4;
    const energy = THREE.MathUtils.clamp(
      Math.pow(loud, 0.4) * (1 + flux * 0.6) * (0.6 + centroid * 0.4),
      0, 1
    );
    raymarchMaterial.uniforms.iEnergy.value = energy;

    /* extra vec3 for the shader = (centroid, flux, beat) */
    raymarchMaterial.uniforms.iAudioExtra.value
      .set(centroid, flux, beatRef.current);
  }

  /* ──────────────── 2. Calm camera orbit ──────────────── */
  const radius = 8.0;
  const camX   = Math.sin(now * 0.25) * radius;
  const camZ   = Math.cos(now * 0.25) * radius;
  const camY   = 2.0 + Math.sin(now * 0.15) * 0.5;

  /* ──────────────── 3. Push uniforms & render ─────────── */
  const u = raymarchMaterial.uniforms;
  u.iTime.value += delta;
  u.iFrame.value = frameCtr.current++;
  u.iAudio.value.fromArray(smoothed.current);
  u.iChannel0.value = buffers.current.read.texture;
  u.iCameraPos.value.set(camX, camY, camZ);
  u.iCameraTarget.value.set(0, 0.5, 0);

  /* ping-pong render */
  (dummyScene.children[0] as THREE.Mesh).material = raymarchMaterial;
  gl.setRenderTarget(buffers.current.write);
  gl.render(dummyScene, dummyCamera);

  (dummyScene.children[0] as THREE.Mesh).material = displayMaterial;
  displayMaterial.uniforms.iChannel0.value = buffers.current.write.texture;
  gl.setRenderTarget(null);
  gl.render(dummyScene, dummyCamera);

  [buffers.current.read, buffers.current.write] =
    [buffers.current.write, buffers.current.read];
}, 1);

  return null; // ← pure WebGL
};

export default VisualizerFour;
