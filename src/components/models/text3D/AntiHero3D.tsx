import { Route } from '@/components/layout/NavigationMenu';
import { extend, useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
extend({ TextGeometry });

interface AntiHero3DConfig {
  text: string;
  color: string;
  fontSize: number;
  fontDepth: number;
  uTwistSpeed: number;
  uRotateSpeed: number;
  uTwists: number;
  uRadius: number;
}

interface AntiHero3DProps {
  config: AntiHero3DConfig;
  specialEffect?: boolean;
  onSelectRoute: (route: Route) => void; // changed from unknown to Route
  position?: [number, number, number];
  showMarkers?: boolean;
}

// Define a custom shader interface with explicit types for our uniforms.
interface CustomShader {
  uniforms: {
    uTime: { value: number };
    uTwistSpeed: { value: number };
    uRotateSpeed: { value: number };
    uTwists: { value: number };
    uRadius: { value: number };
    uMin: { value: THREE.Vector3 };
    uMax: { value: THREE.Vector3 };
    [key: string]: { value: number | THREE.Vector3 };
  };
  vertexShader: string;
  fragmentShader: string;
}

interface CustomMeshStandardMaterial extends THREE.MeshStandardMaterial {
  userData: {
    shader?: CustomShader;
  };
}

export default function AntiHero3D({
  config,
  position = [0, 0, 0],
}: AntiHero3DProps) {
  const refMesh = useRef<THREE.Mesh>(null);
  const refMaterial = useRef<CustomMeshStandardMaterial | null>(null);

  // Load the font.
  const font = useLoader(FontLoader, '/fonts/Devil2.json');

  // Create the TextGeometry.
  const geo = new TextGeometry(config.text, {
    font,
    size: config.fontSize,
    height: config.fontDepth,
    curveSegments: 100,
    bevelEnabled: false,
  });
  geo.center();
  geo.computeBoundingBox();

  // Define shader uniforms.
  const refUniforms = {
    uTime: { value: 0 },
    uTwistSpeed: { value: config.uTwistSpeed },
    uRotateSpeed: { value: config.uRotateSpeed },
    uTwists: { value: config.uTwists },
    uRadius: { value: config.uRadius },
    uMin: { value: new THREE.Vector3(0, 0, 0) },
    uMax: { value: new THREE.Vector3(0, 0, 0) },
  };

  // Update uniforms when config changes.
  useEffect(() => {
    if (refMaterial.current?.userData.shader) {
      refMaterial.current.userData.shader.uniforms.uRadius.value = config.uRadius;
      refMaterial.current.userData.shader.uniforms.uTwists.value = config.uTwists;
      refMaterial.current.userData.shader.uniforms.uTwistSpeed.value = config.uTwistSpeed;
      refMaterial.current.userData.shader.uniforms.uRotateSpeed.value = config.uRotateSpeed;
    }
  }, [config]);

  // Animate the uTime uniform.
  useFrame((_, delta) => {
    if (refMaterial.current?.userData.shader) {
      refMaterial.current.userData.shader.uniforms.uTime.value += delta;
    }
  });

  // Update geometry bounding box info for the shader.
  useLayoutEffect(() => {
    if (geo.boundingBox) {
      const min = geo.boundingBox.min;
      const max = geo.boundingBox.max;
      // Add extra space based on font size.
      max.x += config.fontSize / 6;
      refUniforms.uMin.value.copy(min);
      refUniforms.uMax.value.copy(max);
      if (refMaterial.current?.userData.shader) {
        refMaterial.current.userData.shader.uniforms.uMin.value.copy(min);
        refMaterial.current.userData.shader.uniforms.uMax.value.copy(max);
      }
    }
  }, [geo, config]);

  // Modify the material shader.
  const onBeforeCompile = (shader: CustomShader) => {
    shader.uniforms = { ...refUniforms, ...shader.uniforms };

    shader.vertexShader = `
      uniform float uTwistSpeed;
      uniform float uRotateSpeed;
      uniform float uTwists;
      uniform float uRadius;
      uniform vec3 uMin;
      uniform vec3 uMax;
      uniform float uTime;
      float PI = 3.141592653589793238;
      mat4 rotationMatrix(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        return mat4(
          oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
          oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
          oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
          0.0, 0.0, 0.0, 1.0
        );
      }
      
      vec3 rotate(vec3 v, vec3 axis, float angle) {
        mat4 m = rotationMatrix(axis, angle);
        return (m * vec4(v, 1.0)).xyz;
      }
      
      float mapRange(float value, float min1, float max1, float min2, float max2) {
        return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
      }
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `#include <beginnormal_vertex>
      float xx = mapRange(position.x, uMin.x, uMax.x, -1.0, 1.0);
      objectNormal = rotate(objectNormal, vec3(1.0, 0.0, 0.0), 0.5 * PI * uTwists * xx + 0.01 * uTime * uTwistSpeed);
      objectNormal = rotate(objectNormal, vec3(0.0, 0.0, 1.0), (xx + 0.01 * uTime * uRotateSpeed) * PI);
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vec3 pos = transformed;
      float theta = (xx + 0.01 * uTime * uRotateSpeed) * PI;
      pos = rotate(pos, vec3(1.0, 0.0, 0.0), 0.5 * PI * uTwists * xx + 0.01 * uTime * uTwistSpeed);
      vec3 dir = vec3(sin(theta), cos(theta), pos.z);
      vec3 circled = vec3(dir.xy * uRadius, pos.z) + vec3(pos.y * dir.x, pos.y * dir.y, 0.0);
      transformed = circled;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      '#include <output_fragment>'
    );
    if (refMaterial.current) {
      refMaterial.current.userData.shader = shader;
    }
  };

  return (
    <mesh ref={refMesh} castShadow position={position}>
      <primitive object={geo} attach="geometry" />
      <meshStandardMaterial
        onBeforeCompile={onBeforeCompile}
        ref={refMaterial}
        attach="material"
        color={config.color}
      />
    </mesh>
  );
}
