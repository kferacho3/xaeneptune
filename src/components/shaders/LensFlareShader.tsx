"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const LensFlareShader = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Update the time uniform on every frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -50]}>
      {/* Use sphereGeometry instead of planeGeometry for a 3D curved surface */}
      <sphereGeometry args={[50, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          iTime: { value: 0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
          // Placeholder texture. Replace this with a valid texture as needed.
          iChannel0: { value: null },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision mediump float;
          uniform vec2 iResolution;
          uniform float iTime;
          uniform vec4 iMouse;
          uniform sampler2D iChannel0;
          varying vec2 vUv;
          
          // --- Code from Shader 1 ---
          float noise(float t) {
            return texture2D(iChannel0, vec2(t, 0.0) / iResolution).r;
          }
          float noise2(vec2 t) {
            return texture2D(iChannel0, t / iResolution).r;
          }
          vec3 lensflare(vec2 uv, vec2 pos) {
            vec2 main = uv - pos;
            vec2 uvd = uv * length(uv);
            float ang = atan(main.x, main.y);
            float dist = length(main);
            dist = pow(dist, 0.1);
            float f0 = 1.0 / (length(uv - pos) * 16.0 + 1.0);
            f0 = f0 + f0 * (sin(noise2(vec2(sin(ang * 2.0 + pos.x) * 4.0 - cos(ang * 3.0 + pos.y))) * 16.0) * 0.1 + dist * 0.1 + 0.8);
            float f2 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.8 * pos), 2.0)), 0.0) * 0.25;
            float f22 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.85 * pos), 2.0)), 0.0) * 0.23;
            float f23 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.9 * pos), 2.0)), 0.0) * 0.21;
            vec2 uvx = mix(uv, uvd, -0.5);
            float f4 = max(0.01 - pow(length(uvx + 0.4 * pos), 2.4), 0.0) * 6.0;
            float f42 = max(0.01 - pow(length(uvx + 0.45 * pos), 2.4), 0.0) * 5.0;
            float f43 = max(0.01 - pow(length(uvx + 0.5 * pos), 2.4), 0.0) * 3.0;
            uvx = mix(uv, uvd, -0.4);
            float f5 = max(0.01 - pow(length(uvx + 0.2 * pos), 5.5), 0.0) * 2.0;
            float f52 = max(0.01 - pow(length(uvx + 0.4 * pos), 5.5), 0.0) * 2.0;
            float f53 = max(0.01 - pow(length(uvx + 0.6 * pos), 5.5), 0.0) * 2.0;
            uvx = mix(uv, uvd, -0.5);
            float f6 = max(0.01 - pow(length(uvx - 0.3 * pos), 1.6), 0.0) * 6.0;
            float f62 = max(0.01 - pow(length(uvx - 0.325 * pos), 1.6), 0.0) * 3.0;
            float f63 = max(0.01 - pow(length(uvx - 0.35 * pos), 1.6), 0.0) * 5.0;
            vec3 c = vec3(0.0);
            c.r += f2 + f4 + f5 + f6;
            c.g += f22 + f42 + f52 + f62;
            c.b += f23 + f43 + f53 + f63;
            c = c * 1.3 - vec3(length(uvd) * 0.05);
            c += vec3(f0);
            return c;
          }
          vec3 cc(vec3 color, float factor, float factor2) {
            float w = color.r + color.g + color.b;
            return mix(color, vec3(w), w * factor2);
          }
          
          // --- Code from Shader 2 ---
          float sdHex(vec2 p) {
            p = abs(p);
            vec2 q = vec2(p.x * 2.0 * 0.5773503, p.y + p.x * 0.5773503);
            return dot(step(q.xy, q.yx), 1.0 - q.yx);
          }
          float fpow(float x, float k) {
            return x > k ? pow((x - k) / (1.0 - k), 2.0) : 0.0;
          }
          vec3 renderhex(vec2 uv, vec2 p, float s, vec3 col) {
            uv -= p;
            if (abs(uv.x) < 0.2 * s && abs(uv.y) < 0.2 * s) {
              return mix(
                vec3(0.0),
                mix(vec3(0.0), col, 0.1 + fpow(length(uv / s), 0.1) * 10.0),
                smoothstep(0.0, 0.3, sdHex(uv * 5.0 / s))
              );
            }
            return vec3(0.0);
          }
          vec3 renderLensFlare2(vec2 uv, vec2 light) {
            vec3 col = vec3(0.0);
            col += renderhex(uv, -light * 0.25, 1.4, vec3(0.25, 0.75, 0.0));
            col += renderhex(uv, light * 0.25, 0.5, vec3(1.0, 0.5, 0.5));
            col += renderhex(uv, light * 0.1, 1.6, vec3(1.0, 1.0, 1.0));
            col += renderhex(uv, light * 1.8, 2.0, vec3(0.0, 0.5, 0.75));
            col += renderhex(uv, light * 1.25, 0.8, vec3(1.0, 1.0, 0.5));
            col += renderhex(uv, -light * 1.25, 5.0, vec3(0.5, 0.5, 0.25));
            col += fpow(1.0 - abs(distance(light * 0.8, uv) - 0.7), 0.985) * vec3(0.1, 0.05, 0.0);
            col += vec3(1.0, 0.6, 0.4) * fpow(texture2D(iChannel0, normalize(light - uv) * 0.25).r, 0.3) * 0.04 / distance(light, uv);
            col += vec3(1.0, 0.6, 0.4) * fpow(max(1.0 - distance(light, uv), 0.0), 0.5);
            return col / (1.0 + distance(uv, light));
          }
          
          void main(){
            // Map vUv to a centered coordinate system with aspect correction
            vec2 uv = (vUv - 0.5) * vec2(iResolution.x / iResolution.y, 1.0) * 2.0;
            // Compute mouse coordinate in the same range
            vec2 mouse = (iMouse.xy / iResolution) - 0.5;
            mouse.x *= iResolution.x / iResolution.y;
            if(iMouse.w < 0.5){
              mouse.x = sin(iTime) * 0.5;
              mouse.y = sin(iTime * 0.913) * 0.5;
            }
            vec3 color1 = vec3(1.4, 1.2, 1.0) * lensflare(uv, mouse);
            color1 -= noise2(vUv * iResolution) * 0.015;
            color1 = cc(color1, 0.5, 0.1);
            vec3 color2 = renderLensFlare2(uv, mouse);
            vec3 finalColor = (color1 + color2) * 0.5;
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
  );
};
