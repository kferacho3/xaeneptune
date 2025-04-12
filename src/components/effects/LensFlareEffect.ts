"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
    AdditiveBlending,
    Clock,
    Mesh,
    PlaneGeometry,
    Raycaster,
    ShaderMaterial,
    TextureLoader,
    Vector2
} from "three";

// Define an interface for our userData so we avoid using 'any'
interface LensFlareUserData {
  marker?: string;
}

export interface LensFlareEffectProps {
  enabled?: boolean;
  lensPosition?: THREE.Vector3;
  opacity?: number;
  colorGain?: THREE.Color;
  starPoints?: number;
  glareSize?: number;
  flareSize?: number;
  flareSpeed?: number;
  flareShape?: number;
  haloScale?: number;
  animated?: boolean;
  anamorphic?: boolean;
  secondaryGhosts?: boolean;
  starBurst?: boolean;
  ghostScale?: number;
  aditionalStreaks?: boolean;
  followMouse?: boolean;
}

/**
 * Creates a lens flare Mesh from the provided parameters.
 * @param params Effect configuration options.
 * @param mouseRef A React ref holding a THREE.Vector2 containing the latest mouse coordinates.
 * @param oldOpacityValue (optional) A numeric value to override the default opacity.
 */
export function createLensFlareEffect(
  params: LensFlareEffectProps = {},
  mouseRef: React.RefObject<THREE.Vector2>,
  oldOpacityValue?: number
): Mesh {
  // Default parameters.
  const defaultParams: LensFlareEffectProps = {
    enabled: true,
    lensPosition: new THREE.Vector3(25, 125, -200),
    opacity: 0.8,
    colorGain: new THREE.Color(15, 12, 10),
    starPoints: 10.0,
    glareSize: 0.35,
    flareSize: 0.04,
    flareSpeed: 0.4,
    flareShape: 1.2,
    haloScale: 0.7,
    animated: true,
    anamorphic: false,
    secondaryGhosts: true,
    starBurst: true,
    ghostScale: 0.5,
    aditionalStreaks: true,
    followMouse: false
  };

  const LensFlareParams = { ...defaultParams, ...params };

  const clock = new Clock();
  const screenPosition = LensFlareParams.lensPosition!;
  const viewport = new THREE.Vector4();
  const oldOpacity = oldOpacityValue ?? (LensFlareParams.opacity ?? 0.8);
  let internalOpacity = oldOpacity; // numeric value
  const flarePosition = new THREE.Vector3();
  const raycaster = new Raycaster();
  // (We use the external mouseRef passed in.)

  // Create the shader material.
  const lensFlareMaterial = new ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
      lensPosition: { value: new Vector2(0, 0) },
      enabled: { value: LensFlareParams.enabled },
      colorGain: { value: LensFlareParams.colorGain },
      starPoints: { value: LensFlareParams.starPoints },
      glareSize: { value: LensFlareParams.glareSize },
      flareSize: { value: LensFlareParams.flareSize },
      flareSpeed: { value: LensFlareParams.flareSpeed },
      flareShape: { value: LensFlareParams.flareShape },
      haloScale: { value: LensFlareParams.haloScale },
      opacity: { value: internalOpacity },
      animated: { value: LensFlareParams.animated },
      anamorphic: { value: LensFlareParams.anamorphic },
      secondaryGhosts: { value: LensFlareParams.secondaryGhosts },
      starBurst: { value: LensFlareParams.starBurst },
      ghostScale: { value: LensFlareParams.ghostScale },
      aditionalStreaks: { value: LensFlareParams.aditionalStreaks },
      followMouse: { value: LensFlareParams.followMouse },
      lensDirtTexture: {
        value: new TextureLoader().load("https://i.ibb.co/c3x4dBy/lens-Dirt-Texture.jpg")
      }
    },
    /* GLSL */
    fragmentShader: `
      precision highp float;
      
      // Based on https://www.shadertoy.com/view/4sX3Rs and your original code.
      uniform float iTime;
      uniform vec2 lensPosition;
      uniform vec2 iResolution;
      uniform vec3 colorGain;
      uniform float starPoints;
      uniform float glareSize;
      uniform float flareSize;
      uniform float flareSpeed;
      uniform float flareShape;
      uniform float haloScale;
      uniform float opacity;
      uniform bool animated;
      uniform bool anamorphic;
      uniform bool enabled;
      uniform bool secondaryGhosts;
      uniform bool starBurst;
      uniform float ghostScale;
      uniform bool aditionalStreaks;
      uniform sampler2D lensDirtTexture;
      
      varying vec2 vUv;
      vec2 vTexCoord;
      
      float uDispersal = 0.3;
      float uHaloWidth = 0.6;
      float uDistortion = 1.5;
      float uBrightDark = 0.5;
      
      float rand(float n) { return fract(sin(n) * 43758.5453123); }
      
      float noise(float p) {
          float fl = floor(p);
          float fc = fract(p);
          return mix(rand(fl), rand(fl + 1.0), fc);
      }
      
      vec3 hsv2rgb(vec3 c) {
          vec4 k = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
          vec3 p = abs(fract(c.xxx + k.xyz) * 6.0 - k.www);
          return c.z * mix(k.xxx, clamp(p - k.xxx, 0.0, 1.0), c.y);
      }
      
      float saturate2(float x) { return clamp(x, 0.0, 1.0); }
      
      vec2 rotateUV(vec2 uv, float rotation) {
          return vec2(
              cos(rotation) * uv.x + sin(rotation) * uv.y,
              cos(rotation) * uv.y - sin(rotation) * uv.x
          );
      }
      
      vec3 drawflare(vec2 p, float intensity, float rnd, float speed, int id) {
          float flarehueoffset = (1.0/32.0) * float(id) * 0.1;
          float lingrad = distance(vec2(0.0), p);
          float expgrad = 1.0 / exp(lingrad * (fract(rnd) * 0.66 + 0.33));
          vec3 colgrad = hsv2rgb(vec3(fract((expgrad * 8.0) + speed * flareSpeed + flarehueoffset),
                                      pow(1.0 - abs(expgrad * 2.0 - 1.0), 0.45),
                                      20.0 * expgrad * intensity));
          float internalStarPoints = anamorphic ? 1.0 : starPoints;
          float blades = length(p * flareShape * sin(internalStarPoints * atan(p.x, p.y)));
          float comp = pow(1.0 - saturate2(blades), (anamorphic ? 100.0 : 12.0));
          comp += saturate2(expgrad - 0.9) * 3.0;
          comp = pow(comp * expgrad, 8.0 + (1.0 - intensity) * 5.0);
          return (flareSpeed > 0.0) ? vec3(comp) * colgrad : vec3(comp) * flareSize * 15.0;
      }
      
      float glare(vec2 uv, vec2 pos, float size) {
          vec2 main;
          if(animated) {
            main = rotateUV(uv - pos, iTime * 0.1);
          } else {
            main = uv - pos;
          }
          float ang = atan(main.y, main.x) * (anamorphic ? 1.0 : starPoints);
          float dist = length(main);
          dist = pow(dist, 0.9);
          float f0 = 1.0/(length(uv - pos) * (1.0/size * 16.0) + 0.2);
          return f0 + f0 * (sin(ang) * 0.2 + 0.3);
      }
      
      vec3 LensFlare(vec2 uv, vec2 pos) {
          vec2 main = uv - pos;
          vec2 uvd = uv * length(uv);
          float ang = atan(main.x, main.y);
          float f0 = 0.3/(length(uv - pos)*16.0 + 1.0);
          f0 *= sin(noise(sin(ang*3.9 - (animated ? iTime : 0.0) * 0.3)*starPoints)) * 0.2;
          float f1 = max(0.01 - pow(length(uv + 1.2 * pos), 1.9), 0.0) * 7.0;
          float f2 = max(0.9/(10.0 + 32.0 * pow(length(uvd + 0.99 * pos), 2.0)), 0.0) * 0.35;
          float f22 = max(0.9/(11.0 + 32.0 * pow(length(uvd + 0.85 * pos), 2.0)), 0.0) * 0.23;
          float f23 = max(0.9/(12.0 + 32.0 * pow(length(uvd + 0.95 * pos), 2.0)), 0.0) * 0.6;
          vec2 uvx = mix(uv, uvd, 0.1);
          float f4 = max(0.01 - pow(length(uvx + 0.4 * pos), 2.9), 0.0) * 4.02;
          float f42 = max(0.0 - pow(length(uvx + 0.45 * pos), 2.9), 0.0) * 4.1;
          float f43 = max(0.01 - pow(length(uvx + 0.5 * pos), 2.9), 0.0) * 4.6;
          uvx = mix(uv, uvd, -0.4);
          float f5 = max(0.01 - pow(length(uvx + 0.1 * pos), 5.5), 0.0) * 2.0;
          float f52 = max(0.01 - pow(length(uvx + 0.2 * pos), 5.5), 0.0) * 2.0;
          float f53 = max(0.01 - pow(length(uvx + 0.1 * pos), 5.5), 0.0) * 2.0;
          uvx = mix(uv, uvd, 2.1);
          float f6 = max(0.01 - pow(length(uvx - 0.3 * pos), 1.61), 0.0) * 3.159;
          float f62 = max(0.01 - pow(length(uvx - 0.325 * pos), 1.614), 0.0) * 3.14;
          float f63 = max(0.01 - pow(length(uvx - 0.389 * pos), 1.623), 0.0) * 3.12;
          vec3 c = vec3(glare(uv, pos, glareSize));
          vec2 prot;
          if(animated) {
            prot = rotateUV(uv - pos, iTime * 0.1);
          } else if(anamorphic) {
            prot = rotateUV(uv - pos, 1.570796);
          } else {
            prot = uv - pos;
          }
          c += drawflare(prot, (anamorphic ? flareSize * 10.0 : flareSize), 0.1, iTime, 1);
          c.r += f1 + f2 + f4 + f5 + f6;
          c.g += f1 + f22 + f42 + f52 + f62;
          c.b += f1 + f23 + f43 + f53 + f63;
          c = c * 1.3 * vec3(length(uvd) + 0.09);
          c += vec3(f0);
          return c;
      }
      
      void main() {
          vec2 uv = vUv;
          vec2 myUV = uv - 0.5;
          myUV.y *= iResolution.y / iResolution.x;
          vec2 mouse = lensPosition * 0.5;
          mouse.y *= iResolution.y / iResolution.x;
          vTexCoord = myUV + 0.5;
          vec3 finalColor = LensFlare(myUV, mouse) * 20.0 * colorGain / 256.0;
          if (enabled) {
              gl_FragColor = vec4(finalColor, mix(finalColor, vec3(1.0), 0.5) * opacity);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
          } else {
              gl_FragColor = vec4(0.0);
          }
      }
    `,
    vertexShader: `
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
    name: "LensFlareShader"
  });

  const lensFlareContainer = new Mesh(new PlaneGeometry(2, 2, 1, 1), lensFlareMaterial);

  // onBeforeRender updates uniforms and applies occlusion logic.
  lensFlareMaterial.onBeforeRender = function (renderer, scene, camera) {
    const elapsedTime = clock.getElapsedTime();
    renderer.getCurrentViewport(viewport);
    lensFlareContainer.lookAt(camera.position);
    lensFlareMaterial.uniforms.iResolution.value.set(viewport.z, viewport.w);
    
    if (lensFlareMaterial.uniforms.followMouse.value === true) {
      if (mouseRef.current) {
        lensFlareMaterial.uniforms.lensPosition.value.set(mouseRef.current.x, mouseRef.current.y);
      }
    } else {
      const projectedPosition = screenPosition.clone();
      projectedPosition.project(camera);
      flarePosition.set(projectedPosition.x, projectedPosition.y, projectedPosition.z);
      if (flarePosition.z < 1) {
        lensFlareMaterial.uniforms.lensPosition.value.set(flarePosition.x, flarePosition.y);
      }
      const ndc = new Vector2(projectedPosition.x, projectedPosition.y);
      raycaster.setFromCamera(ndc, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      checkTransparency(intersects);
    }
    lensFlareMaterial.uniforms.iTime.value = elapsedTime;
    easing.damp(lensFlareMaterial.uniforms.opacity, "value", internalOpacity, 0.007, clock.getDelta());
  };

  function checkTransparency(intersects: THREE.Intersection[]): void {
    if (intersects[0]) {
      const object = intersects[0].object;
      if (object.visible && object instanceof THREE.Mesh && object.material) {
        const material = object.material as THREE.Material & {
          transmission?: number;
          opacity?: number;
          transparent?: boolean;
        };
        if (material.transmission !== undefined) {
          internalOpacity = material.transmission > 0.2 ? oldOpacity * (material.transmission * 0.5) : 0;
        } else if (material.transparent) {
          if (material.opacity !== undefined && material.opacity < 0.98) {
            internalOpacity = oldOpacity / (material.opacity * 10);
          }
        } else {
          const userData = object.userData as LensFlareUserData;
          internalOpacity = userData.marker === "no-occlusion" ? oldOpacity : 0;
        }
      }
    } else {
      internalOpacity = oldOpacity;
    }
  }

  return lensFlareContainer;
}

// React component wrapper that adds the lens flare mesh to your Three.js scene.
export const LensFlare: React.FC<LensFlareEffectProps> = (props) => {
  const { scene } = useThree();
  const mouseRef = useRef(new THREE.Vector2());
  const lensFlareRef = useRef<Mesh>(createLensFlareEffect(props, mouseRef));
  
  useEffect(() => {
    // Attach mousemove event listener.
    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);
  
  useEffect(() => {
    scene.add(lensFlareRef.current);
    // Cast the return to void so it doesn't return a THREE.Scene.
    return () => { void scene.remove(lensFlareRef.current); };
  }, [scene]);
  
  useFrame(() => {}); // No additional per-frame actions required.
  
  return null;
};
