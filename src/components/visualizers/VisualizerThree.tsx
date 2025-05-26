"use client";

import { Html, shaderMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useSharedAudio from "./useSharedAudio"; // <- make sure this hook exists
export type EnvironmentMode = "phantom" | "octagrams" | "raymarching";
export type RenderingMode   = "solid"   | "wireframe" | "rainbow" | "transparent";


/**
 * This code has:
 *   - Three ENVIRONMENTS (Phantom Star, Octagrams, Raymarching)
 *       => controlled by the uniform "uEnvironment"
 *          (0=Phantom, 1=Octagrams, 2=Raymarching)
 *
 *   - Four RENDER MODES (Solid, Wireframe, Rainbow, Transparent/Glass)
 *       => controlled by the uniform "uRenderMode"
 *          (0=solid, 1=wireframe, 2=rainbow, 3=transparent)
 *
 * The environment is chosen first. Then we apply the chosen
 * render mode as a final pass (e.g. wireframe lines, rainbow hue shift, etc.).
 *
 * The FFT data influences each environment’s color, shape, speed,
 * positioning, etc.
 *
 * The color palette is also used across all three scenes.
 *
 * NOTE: For brevity, we only show a short palette snippet below,
 * but you'll paste your full palette object in place of `colorPalettes`.
 */

/** ------------------------------------------------------------
 * 1) Condensed color palette object, to be replaced by your full version
 * ------------------------------------------------------------ */

/* ──────────────────────────────────────────────────────────────
 *  GLOBAL SHARED‑AUDIO OBJECTS  (new – needed for clean‑up)
 * ──────────────────────────────────────────────────────────────*/

const colorPalettes: Record<string, THREE.Color[]> = {
  default: [
    new THREE.Color(0xedae49),
    new THREE.Color(0xd4a373),
    new THREE.Color(0xfae3d9),
    new THREE.Color(0xffdac1),
    new THREE.Color(0xe9c46a),
  ],
  sunset: [
    new THREE.Color(0xf94144),
    new THREE.Color(0xf3722c),
    new THREE.Color(0xf8961e),
    new THREE.Color(0xf9c74f),
    new THREE.Color(0x90be6d),
  ],
  ocean: [
    new THREE.Color(0x03045e),
    new THREE.Color(0x0077b6),
    new THREE.Color(0x00b4d8),
    new THREE.Color(0x90e0ef),
    new THREE.Color(0xade8f4),
  ],
  forest: [
    new THREE.Color(0x228b22),
    new THREE.Color(0x3cb371),
    new THREE.Color(0x98fb98),
    new THREE.Color(0x8fbc8f),
    new THREE.Color(0x6b8e23),
  ],
  candy: [
    new THREE.Color(0xff69b4),
    new THREE.Color(0xffa07a),
    new THREE.Color(0xffd700),
    new THREE.Color(0xadff2f),
    new THREE.Color(0x87cefa),
  ],
  pastel: [
    new THREE.Color(0xffdab9),
    new THREE.Color(0xfff0f5),
    new THREE.Color(0xf0fff0),
    new THREE.Color(0xf5f5dc),
    new THREE.Color(0xffe4e1),
  ],
  neon: [
    new THREE.Color(0xff00ff),
    new THREE.Color(0x00ffff),
    new THREE.Color(0xffff00),
    new THREE.Color(0x00ff00),
    new THREE.Color(0xffa500),
  ],
  grayscale: [
    new THREE.Color(0x111111),
    new THREE.Color(0x333333),
    new THREE.Color(0x555555),
    new THREE.Color(0x777777),
    new THREE.Color(0x999999),
  ],
  blues: [
    new THREE.Color(0xadd8e6),
    new THREE.Color(0x87ceeb),
    new THREE.Color(0x6495ed),
    new THREE.Color(0x4682b4),
    new THREE.Color(0x1e90ff),
  ],
  greens: [
    new THREE.Color(0x98fb98),
    new THREE.Color(0x90ee90),
    new THREE.Color(0x3cb371),
    new THREE.Color(0x2e8b57),
    new THREE.Color(0x008000),
  ],
  reds: [
    new THREE.Color(0xff6347),
    new THREE.Color(0xff4500),
    new THREE.Color(0xff0000),
    new THREE.Color(0xb22222),
    new THREE.Color(0x8b0000),
  ],
  purples: [
    new THREE.Color(0xe6e6fa),
    new THREE.Color(0xd8bfd8),
    new THREE.Color(0xdda0dd),
    new THREE.Color(0xee82ee),
    new THREE.Color(0x9400d3),
  ],
  yellows: [
    new THREE.Color(0xffffe0),
    new THREE.Color(0xfffff0),
    new THREE.Color(0xffd700),
    new THREE.Color(0xffa500),
    new THREE.Color(0xf0e68c),
  ],
  oranges: [
    new THREE.Color(0xffa500),
    new THREE.Color(0xff8c00),
    new THREE.Color(0xff7f50),
    new THREE.Color(0xff6347),
    new THREE.Color(0xff4500),
  ],
  browns: [
    new THREE.Color(0xf4a460),
    new THREE.Color(0xd2691e),
    new THREE.Color(0xa0522d),
    new THREE.Color(0x8b4513),
    new THREE.Color(0x693d3d),
  ],
  teals: [
    new THREE.Color(0x008080),
    new THREE.Color(0x008b8b),
    new THREE.Color(0x20b2aa),
    new THREE.Color(0x48d1cc),
    new THREE.Color(0x7fffd4),
  ],
  magentas: [
    new THREE.Color(0xff00ff),
    new THREE.Color(0xff00ff),
    new THREE.Color(0xda70d6),
    new THREE.Color(0xba55d3),
    new THREE.Color(0x8a2be2),
  ],
  lime: [
    new THREE.Color(0x00ff00),
    new THREE.Color(0x32cd32),
    new THREE.Color(0x98fb98),
    new THREE.Color(0x90ee90),
    new THREE.Color(0xadff2f),
  ],
  indigo: [
    new THREE.Color(0x4b0082),
    new THREE.Color(0x8a2be2),
    new THREE.Color(0x9370db),
    new THREE.Color(0x7b68ee),
    new THREE.Color(0x6a5acd),
  ],
  violet: [
    new THREE.Color(0xee82ee),
    new THREE.Color(0xd8bfd8),
    new THREE.Color(0xc71585),
    new THREE.Color(0xba55d3),
    new THREE.Color(0x9400d3),
  ],
  coral: [
    new THREE.Color(0xff7f50),
    new THREE.Color(0xff6347),
    new THREE.Color(0xff4500),
    new THREE.Color(0xfa8072),
    new THREE.Color(0xf08080),
  ],
  salmon: [
    new THREE.Color(0xfa8072),
    new THREE.Color(0xe9967a),
    new THREE.Color(0xffa07a),
    new THREE.Color(0xff7f50),
    new THREE.Color(0xff6347),
  ],
  skyblue: [
    new THREE.Color(0x87ceeb),
    new THREE.Color(0x87cefa),
    new THREE.Color(0x6495ed),
    new THREE.Color(0xadd8e6),
    new THREE.Color(0xb0e0e6),
  ],
  goldenrod: [
    new THREE.Color(0xdaa520),
    new THREE.Color(0xffd700),
    new THREE.Color(0xf0e68c),
    new THREE.Color(0xb8860b),
    new THREE.Color(0xcd853f),
  ],
  chocolate: [
    new THREE.Color(0xd2691e),
    new THREE.Color(0xf4a460),
    new THREE.Color(0xa0522d),
    new THREE.Color(0x8b4513),
    new THREE.Color(0x693d3d),
  ],
  maroon: [
    new THREE.Color(0x800000),
    new THREE.Color(0xb03060),
    new THREE.Color(0xff0000),
    new THREE.Color(0xff6347),
    new THREE.Color(0xff4500),
  ],
  olive: [
    new THREE.Color(0x808000),
    new THREE.Color(0x6b8e23),
    new THREE.Color(0x556b2f),
    new THREE.Color(0x9acd32),
    new THREE.Color(0x8fbc8f),
  ],
  cyan: [
    new THREE.Color(0x00ffff),
    new THREE.Color(0x00ced1),
    new THREE.Color(0x40e0d0),
    new THREE.Color(0x48d1cc),
    new THREE.Color(0x7fffd4),
  ],
  beige: [
    new THREE.Color(0xf5f5dc),
    new THREE.Color(0xfff8dc),
    new THREE.Color(0xffe4c4),
    new THREE.Color(0xffdab9),
    new THREE.Color(0xf0fff0),
  ],
  lavender: [
    new THREE.Color(0xe6e6fa),
    new THREE.Color(0xdda0dd),
    new THREE.Color(0xee82ee),
    new THREE.Color(0xba55d3),
    new THREE.Color(0x9370db),
  ],
  tan: [
    new THREE.Color(0xd2b48c),
    new THREE.Color(0xf4a460),
    new THREE.Color(0xa0522d),
    new THREE.Color(0x8b4513),
    new THREE.Color(0x693d3d),
  ],
  mustard: [
    new THREE.Color(0xffdb58),
    new THREE.Color(0xf0ad4e),
    new THREE.Color(0xffa500),
    new THREE.Color(0xff8c00),
    new THREE.Color(0xff7f50),
  ],
  plum: [
    new THREE.Color(0xdda0dd),
    new THREE.Color(0xe0b0ff),
    new THREE.Color(0xcd853f),
    new THREE.Color(0xd8bfd8),
    new THREE.Color(0x9370db),
  ],
  turquoise: [
    new THREE.Color(0x40e0d0),
    new THREE.Color(0x48d1cc),
    new THREE.Color(0x00ced1),
    new THREE.Color(0x008b8b),
    new THREE.Color(0x008080),
  ],
  skyblue_darker: [
    new THREE.Color(0x00bfff),
    new THREE.Color(0x1e90ff),
    new THREE.Color(0x0000ff),
    new THREE.Color(0x4169e1),
    new THREE.Color(0x6495ed),
  ],
};

/** ------------------------------------------------------------
 * 2) The ShaderMaterial definition
 * ------------------------------------------------------------ */
const FFTVisualizerMaterial = shaderMaterial(
  {
    // Uniforms for environment and render mode
    uEnvironment: 0, // 0=Phantom Star, 1=Octagrams, 2=Raymarching
    uRenderMode: 0, // 0=solid, 1=wireframe, 2=rainbow, 3=transparent

    // Common uniforms
    iTime: 0,
    iResolution: new THREE.Vector2(),
    iMouse: new THREE.Vector3(),
    fftTexture: null as THREE.DataTexture | null,
    fftIntensity: 0.1,

    // A small array for the user-chosen color palette
    colorPalette: [] as THREE.Vector3[],
  },

  /* --------------------------------------------------------------------------------
   * VERTEX SHADER
   * We morph geometry by reading from the FFT texture.
   * --------------------------------------------------------------------------------*/
  /* glsl */ `
    varying vec2 vUV;
    varying float vMorphFactor; // used for color adjustments in fragment

    uniform float iTime;
    uniform float fftIntensity;
    uniform sampler2D fftTexture;

    // minimal 2D rotation function for swirl
    mat2 symRot(float a){
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    // read the FFT texture at x in [0..1]
    float getFFT(float x){
      float clamped = clamp(x, 0.0, 1.0);
      return texture2D(fftTexture, vec2(clamped, 0.5)).r;
    }

    void main() {
      vUV = uv;

      // baseline pos
      vec3 pos = position;

      // sample a few different FFT bins
      float fA = getFFT(0.05);
      float fB = getFFT(0.3);
      float fC = getFFT(0.9);
      float combined = (fA + fB + fC) / 3.0;

      // swirl around z
      float swirlAmount = combined * fftIntensity * 3.0;
      mat2 R = symRot(iTime * 0.2 + swirlAmount * (pos.x + pos.y));
      pos.xy = R * pos.xy;

      // bulge or ripple in z
      pos.z += sin((pos.x + pos.y) * 4.0 + iTime * 0.5) * 0.3 * combined * fftIntensity;

      // expand the geometry scale
      float scale = 1.0 + 0.5 * fftIntensity * combined;
      pos *= scale;

      // store a "morph factor" for the fragment
      vMorphFactor = combined;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,

  /* --------------------------------------------------------------------------------
   * FRAGMENT SHADER
   *   - 3 Environments: Phantom Star, Octagrams, Raymarching
   *   - 4 Render Modes: Solid, Wireframe, Rainbow, Transparent
   *   - color palette usage
   * --------------------------------------------------------------------------------*/
  /* glsl */ `
    precision highp float;

    // uniforms
    uniform int uEnvironment;   // 0=Phantom, 1=Octagrams, 2=Raymarching
    uniform int uRenderMode;    // 0=solid,1=wireframe,2=rainbow,3=transparent

    uniform float iTime;
    uniform vec2  iResolution;
    uniform vec3  iMouse;
    uniform float fftIntensity;
    uniform sampler2D fftTexture;
    uniform vec3  colorPalette[5];

    // varyings
    varying vec2 vUV;
    varying float vMorphFactor;

    // read from FFT texture
    float getFFT(float x){
      float c = clamp(x, 0.0, 1.0);
      return texture2D(fftTexture, vec2(c, 0.5)).r;
    }

    // 2D rotation
    mat2 rot2D(float a){
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    // hue shift for rainbow mode
    vec3 hueRotate(vec3 color, float shift){
      float angle = shift * 6.28318; 
      float c = cos(angle), s = sin(angle);
      mat3 rotation = mat3(
        c,  s,  0.0,
       -s,  c,  0.0,
        0.0, 0.0, 1.0
      );
      return clamp(rotation * color, 0.0, 1.0);
    }

    // quick palette function (IQ style)
    vec3 paletteFancy(float t){
      return 0.5 + 0.5 * cos(6.28318*(t + vec3(0.3,0.416,0.557)));
    }

    // user palette interpolation
    // we assume exactly 5 colors
    vec3 paletteUser(float t){
      float scaled = t * 4.0; // produce range [0..4)
      float idx = floor(scaled);
      float frac = fract(scaled);
      int i1 = int(mod(idx, 5.0));
      int i2 = int(mod(idx + 1.0, 5.0));
      vec3 c1 = colorPalette[i1];
      vec3 c2 = colorPalette[i2];
      return mix(c1, c2, frac);
    }

    /* ----------------------------------------------------------------
     *  ENVIRONMENT 0: Phantom Star
     * ----------------------------------------------------------------*/
    float sdBox(vec3 p, vec3 b){
      vec3 d = abs(p) - b;
      return min(max(d.x, max(d.y,d.z)), 0.0) + length(max(d,0.0));
    }
    mat2 rotPhantom2D(float a){
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }
    float ifsBox(vec3 pos, float localT){
      for(int i=0; i<5; i++){
        pos = abs(pos) - 1.0;
        pos.xy = rotPhantom2D(localT * 0.3) * pos.xy;
        vec2 xz = vec2(pos.x, pos.z);
        xz = rotPhantom2D(localT * 0.1) * xz;
        pos.x = xz.x; pos.z = xz.y;
      }
      // final swirl
      vec2 xz2 = vec2(pos.x, pos.z);
      xz2 = rotPhantom2D(localT) * xz2;
      pos.x = xz2.x; pos.z = xz2.y;
      return sdBox(pos, vec3(0.4, 0.8, 0.3));
    }
    float mapPhantom(vec3 p, float localT){
      // repeat space
      p.x = mod(p.x - 5.0, 10.0) - 5.0;
      p.y = mod(p.y - 5.0, 10.0) - 5.0;
      p.z = mod(p.z, 16.0) - 8.0;
      return ifsBox(p, localT);
    }
    vec4 renderPhantomStar(vec2 fragCoord){
      vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
      // basic camera
      vec3 cPos = vec3(0.0, 0.0, -3.0 * iTime);
      vec3 cDir = normalize(vec3(0.0, 0.0, -1.0));
      vec3 cUp = vec3(sin(iTime), 1.0, 0.0);
      vec3 cSide = cross(cDir, cUp);

      vec3 rd = normalize(cSide * uv.x + cUp * uv.y + cDir);

      float freqA = getFFT(0.2);
      float freqB = getFFT(0.7);
      float localT = iTime + (freqA + freqB) * 0.5 * fftIntensity * 5.0;

      float acc = 0.0, acc2 = 0.0, t = 0.0;
      for(int i = 0; i < 99; i++){
        vec3 pos = cPos + rd * t;
        float d = mapPhantom(pos, localT);
        d = max(d, 0.02);
        float a = exp(-d * 3.0);
        // band effect
        if(mod(length(pos) + 24.0 * localT, 30.0) < 3.0){
          a *= 2.0;
          acc2 += a;
        }
        acc += a;
        t += d * 0.5;
        if(t > 120.0) break;
      }
      vec3 col = vec3(acc * 0.01, acc * 0.011 + acc2 * 0.002, acc * 0.012 + acc2 * 0.005);

      // incorporate morph factor for hue shift
      col += vMorphFactor * 0.2;
      float alpha = 1.0 - t * 0.03;
      return vec4(col, alpha);
    }

    /* ----------------------------------------------------------------
     *  ENVIRONMENT 1: Octagrams
     * ----------------------------------------------------------------*/
    float sdBoxOcta(vec3 p, vec3 b){
      vec3 q = abs(p) - b;
      return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0));
    }
    float boxOct(vec3 pos, float scale){
      pos *= scale;
      float base = sdBoxOcta(pos, vec3(0.4, 0.4, 0.1)) / 1.5;
      pos.xy *= 5.0;
      pos.y -= 3.5;
      float rotA = 0.75;
      float c = cos(rotA), s = sin(rotA);
      mat2 R = mat2(c, s, -s, c);
      pos.xy = R * pos.xy;
      return -base;
    }
    float box_set(vec3 pos, float localT){
      vec3 orig = pos;
      // expand or swirl using localTime
      float s = sin(localT * 0.4) * 2.5;

      pos = orig;
      pos.y += s;
      pos.xy = rot2D(0.8) * pos.xy;
      float b1 = boxOct(pos, 2.0 - abs(sin(localT * 0.4)) * 1.5);

      pos = orig;
      pos.y -= s;
      pos.xy = rot2D(0.8) * pos.xy;
      float b2 = boxOct(pos, 2.0 - abs(sin(localT * 0.4)) * 1.5);

      pos = orig;
      pos.x += s;
      pos.xy = rot2D(0.8) * pos.xy;
      float b3 = boxOct(pos, 2.0 - abs(sin(localT * 0.4)) * 1.5);

      pos = orig;
      pos.x -= s;
      pos.xy = rot2D(0.8) * pos.xy;
      float b4 = boxOct(pos, 2.0 - abs(sin(localT * 0.4)) * 1.5);

      pos = orig;
      pos.xy = rot2D(0.8) * pos.xy;
      float b5 = boxOct(pos, 0.5) * 6.0;

      pos = orig;
      float b6 = boxOct(pos, 0.5) * 6.0;

      float final = max(max(max(max(max(b1, b2), b3), b4), b5), b6);
      return final;
    }
    float mapOctagrams(vec3 pos, float localT){
      pos = mod(pos - 2.0, 4.0) - 2.0;
      return box_set(pos, localT);
    }
    vec4 renderOctagrams(vec2 fragCoord){
      vec2 uv = (fragCoord * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
      vec3 ro = vec3(0.0, -0.2, iTime * 4.0);
      vec3 rd = normalize(vec3(uv, 1.5));

      // swirl the ray
      float a1 = sin(iTime * 0.03) * 5.0;
      mat2 R1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1));
      rd.xy = R1 * rd.xy;

      float a2 = sin(iTime * 0.05) * 0.2;
      mat2 R2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2));
      vec2 yz = R2 * vec2(rd.y, rd.z);
      rd.y = yz.x; rd.z = yz.y;

      float fLow = getFFT(0.2);
      float fHigh = getFFT(0.8);
      float localT = iTime + (fLow + fHigh) * 0.5 * fftIntensity * 4.0;

      float t = 0.1;
      float ac = 0.0;
      for(int i = 0; i < 99; i++){
        vec3 p = ro + rd * t;
        p = mod(p - 2.0, 4.0) - 2.0;
        float d = mapOctagrams(p, localT);
        d = max(d, 0.01);
        ac += exp(-d * 23.0);
        t += d * 0.55;
        if(t > 120.0) break;
      }
      vec3 col = vec3(ac * 0.02);
      col = mix(col, vec3(fLow, 0.2, 0.5 + fHigh), vMorphFactor * 0.2);
      float alpha = 1.0 - t * (0.02 + 0.02 * sin(iTime));
      return vec4(col, alpha);
    }

    /* ----------------------------------------------------------------
     *  ENVIRONMENT 2: Raymarching 
     *  (Adopted from the user’s snippet with fract repeating, rotating by mouse, etc.)
     * ----------------------------------------------------------------*/
    // small rotation
    mat2 rmRot2D(float a){
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }
    float sdOctahedron(vec3 p, float s){
      p = abs(p);
      return (p.x + p.y + p.z - s) * 0.57735027;
    }
    float mapRaymarch(vec3 p){
      p.z += iTime * 0.4;
      p.xy = fract(p.xy) - 0.5;
      p.z  = mod(p.z, 0.25) - 0.125;
      return sdOctahedron(p, 0.15);
    }
    vec4 renderRaymarch(vec2 fragCoord){
      vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
      vec2 m = (iMouse.xy * 2.0 - iResolution.xy) / iResolution.y;
      if(iMouse.z <= 0.0) {
        m = vec2(cos(iTime * 0.2), sin(iTime * 0.2));
      }
      vec3 ro = vec3(0.0, 0.0, -3.0);
      vec3 rd = normalize(vec3(uv, 1.0));
      vec3 col = vec3(0.0);
      float t = 0.0;
      int loopIndex = 0;
      for(loopIndex = 0; loopIndex < 80; loopIndex++){
        vec3 p = ro + rd * t;
        p.xy *= rmRot2D(t * 0.15 * m.x);
        p.y += sin(t * (m.y + 1.0) * 0.5) * 0.35;
        float d = mapRaymarch(p);
        t += d;
        if(d < 0.001 || t > 100.0) break;
      }
      col = paletteFancy(t * 0.04 + float(loopIndex) * 0.005);
      float fA = getFFT(0.25);
      float fB = getFFT(0.75);
      col.r += fA * 0.2;
      col.b += fB * 0.2;
      return vec4(col, 1.0);
    }

    /* ----------------------------------------------------------------
     *  RENDER MODES (solid, wireframe, rainbow, transparent)
     * ----------------------------------------------------------------*/
    vec4 applyRenderMode(vec4 baseColor, vec2 uv){
      if(uRenderMode == 0){
        return baseColor;
      }
      else if(uRenderMode == 1){
        float lineThickness = 0.02;
        vec2 grid = fract(uv * 10.0);
        float minG = min(grid.x, grid.y);
        float wire = step(minG, lineThickness);
        return mix(baseColor, vec4(0.0, 0.0, 0.0, 1.0), wire);
      }
      else if(uRenderMode == 2){
        vec3 shifted = hueRotate(baseColor.rgb, 0.25 * sin(iTime * 0.5));
        return vec4(shifted, baseColor.a);
      }
      else if(uRenderMode == 3){
        return vec4(baseColor.rgb, baseColor.a * 0.3);
      }
      return baseColor;
    }

    void main(){
      vec2 fragCoord = gl_FragCoord.xy;
      vec4 outColor;
      if(uEnvironment == 0){
        outColor = renderPhantomStar(fragCoord);
      }
      else if(uEnvironment == 1){
        outColor = renderOctagrams(fragCoord);
      }
      else if(uEnvironment == 2){
        outColor = renderRaymarch(fragCoord);
      }
      else{
        outColor = vec4(0.0);
      }
      gl_FragColor = applyRenderMode(outColor, vUV);
    }
  `,
);


interface VisualizerThreeProps { audioUrl: string; isPaused: boolean }

/* ======================================================================== */
/*                            Scene component                               */
/* ======================================================================== */
function VisualizerThreeScene({ audioUrl, isPaused }: VisualizerThreeProps) {
  /* ===== shared analyser (single audio across app) ===== */
  const analyserRef = useSharedAudio(audioUrl, isPaused);

  /* ===== shader & geometry refs ===== */
  const material = useMemo(() => new FFTVisualizerMaterial(), []);
  const planeRef = useRef<THREE.Mesh>(null);
  const fftTexRef = useRef<THREE.DataTexture | null>(null);

  /* ===== user-controlled state (now with setters) ===== */
  const [envMode, setEnvMode]                     = useState<EnvironmentMode>("phantom");
  const [renderMode, setRenderMode]               = useState<RenderingMode>("solid");
  const [paletteName, setPaletteName]             =
    useState<keyof typeof colorPalettes>("default");
  const [fftIntensity, setFftIntensity]           = useState(0.2);

  /* ===== allocate FFT DataTexture once analyser ready ===== */
  useEffect(() => {
    if (!analyserRef.current) return;
    const bins = analyserRef.current.frequencyBinCount;
    fftTexRef.current = new THREE.DataTexture(new Uint8Array(bins * 4), bins, 1, THREE.RGBAFormat);
    fftTexRef.current.needsUpdate = true;
    material.uniforms.fftTexture.value = fftTexRef.current;

    return () => { fftTexRef.current?.dispose(); fftTexRef.current = null; };
  }, [analyserRef, material]);

  /* ===== per-frame uniforms update ===== */
  useFrame(({ clock, gl, camera, mouse }) => {
    planeRef.current?.lookAt(camera.position);

    material.uniforms.iTime.value        = clock.elapsedTime;
    material.uniforms.iResolution.value.set(gl.domElement.width, gl.domElement.height);
    material.uniforms.iMouse.value.set(mouse.x * gl.domElement.width,
                                       mouse.y * gl.domElement.height, 0);
    material.uniforms.fftIntensity.value = fftIntensity;

    /* env + render */
    material.uniforms.uEnvironment.value =
      envMode === "phantom" ? 0 : envMode === "octagrams" ? 1 : 2;
    material.uniforms.uRenderMode.value  =
      renderMode === "solid" ? 0 : renderMode === "wireframe" ? 1 :
      renderMode === "rainbow" ? 2 : 3;

    /* palette */
    const pal = colorPalettes[paletteName] ?? colorPalettes.default;
    material.uniforms.colorPalette.value = pal.map(c => new THREE.Vector3(c.r, c.g, c.b));

    /* FFT texture */
    if (analyserRef.current && fftTexRef.current) {
      const bins  = analyserRef.current.frequencyBinCount;
      const data  = new Uint8Array(bins);
      analyserRef.current.getByteFrequencyData(data);

      const img = fftTexRef.current.image.data as Uint8Array;
      for (let i = 0; i < bins; i++) {
        img.set([data[i], data[i], data[i], 255], i * 4);
      }
      fftTexRef.current.needsUpdate = true;
    }
  });

  /* ===== JSX ===== */
  return (
    <>
      {/* shader-driven plane */}
      <mesh ref={planeRef} position={[0, 0, 0]} scale={[15, 15, 1]} frustumCulled={false}>
        <planeGeometry args={[20, 20, 60, 60]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* selector UI */}
<Html >
    <div
    style={{

     
    }}
  >
  <div
    style={{
      position: "fixed",
       background: "white",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",    // center children horizontally
      gap: "2px",
      color: "white",
      fontSize: "14px",
      userSelect: "none",
      cursor: "pointer",
      width: "30vw",
      height: "30vh",
      zIndex: 999,
    }}
  >
          {/* Env mode */}
          <div>
            <label className="block mb-1">Environment</label>
            <select value={envMode} onChange={e => setEnvMode(e.target.value as EnvironmentMode)}
                    className="w-full bg-gray-800 p-1 rounded">
              <option value="phantom">Phantom Star</option>
              <option value="octagrams">Octagrams</option>
              <option value="raymarching">Raymarching</option>
            </select>
          </div>

          {/* Render mode */}
          <div>
            <label className="block mb-1">Render mode</label>
            <select value={renderMode} onChange={e => setRenderMode(e.target.value as RenderingMode)}
                    className="w-full bg-gray-800 p-1 rounded">
              <option value="solid">Solid</option>
              <option value="wireframe">Wireframe</option>
              <option value="rainbow">Rainbow</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>

          {/* Palette */}
          <div>
            <label className="block mb-1">Palette</label>
            <select value={paletteName} onChange={e => setPaletteName(e.target.value as keyof typeof colorPalettes)}
                    className="w-full bg-gray-800 p-1 rounded">
              {Object.keys(colorPalettes).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* FFT intensity */}
          <div>
            <label className="block mb-1">FFT intensity&nbsp;({fftIntensity.toFixed(2)})</label>
            <input type="range" min={0} max={1} step={0.01}
                   value={fftIntensity}
                   onChange={e => setFftIntensity(parseFloat(e.target.value))}
                   className="w-full" />
          </div>
          </div>
        </div>
      </Html>
    </>
  );
}

/* ======================================================================== */
/*                             Wrapper export                               */
/* ======================================================================== */
export default function VisualizerThree({ audioUrl, isPaused }: VisualizerThreeProps) {
  return <VisualizerThreeScene audioUrl={audioUrl} isPaused={isPaused} />;
}