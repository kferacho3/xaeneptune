/* --------------------------------------------------------------------------
   src/components/visualizers/VisualizerSix.tsx
--------------------------------------------------------------------------- */
"use client";

import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createNoise3D } from "simplex-noise";
import * as THREE from "three";
import useSharedAudio from "./useSharedAudio";

/* ------------------------------------------------------------------ *
 *  Physics System
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 *  Physics System
 * ------------------------------------------------------------------ */

interface PhysicsBody {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  mass: number;
  restitution: number;
}
/* ------------------------------------------------------------------ *
 *  Spatial-hash grid  (broad-phase acceleration)
 * ------------------------------------------------------------------ */
class SpatialHash {
  private cell = 60;
  private buckets = new Map<string, number[]>();

  private key(v: THREE.Vector3) {
    return [
      Math.floor(v.x / this.cell),
      Math.floor(v.y / this.cell),
      Math.floor(v.z / this.cell),
    ].join(",");
  }

  clear() { this.buckets.clear(); }

  insert(idx: number, pos: THREE.Vector3) {
    const k = this.key(pos);
    const list = this.buckets.get(k) ?? [];
    list.push(idx);
    this.buckets.set(k, list);
  }

  neighbours(pos: THREE.Vector3) {
    const [cx, cy, cz] = [
      Math.floor(pos.x / this.cell),
      Math.floor(pos.y / this.cell),
      Math.floor(pos.z / this.cell),
    ];
    const near: number[] = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const k = [cx + x, cy + y, cz + z].join(",");
          const arr = this.buckets.get(k);
          if (arr) near.push(...arr);
        }
    return near;
  }
}

class PhysicsSystem {
  bodies: PhysicsBody[] = [];
  gravity = new THREE.Vector3(0, 0, 0);
  damping = 0.98;                           // ↓ slightly lower for snappier motion

  addBody(pos: THREE.Vector3, radius: number, mass = 1) {
    const body: PhysicsBody = {
      position: pos.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ),
      radius,
      mass,
      restitution: 0.8 + Math.random() * 0.2,
    };
    this.bodies.push(body);
    return body;
  }

  update(dt: number, audioEnergy: number) {
    if (!this.bodies.length) return;

    /* 1 – index into the spatial hash */
    const grid = new SpatialHash();
    this.bodies.forEach((b, i) => grid.insert(i, b.position));

    /* 2 – Euler integration + gentle audio turbulence */
    const audioForce = audioEnergy * 10;    // ↑ stronger push
    this.bodies.forEach((b) => {
      b.velocity.addScaledVector(this.gravity, dt);

      if (audioEnergy > 0.05) {
        b.velocity.x += (Math.random() - 0.5) * audioForce * dt;
        b.velocity.y += (Math.random() - 0.5) * audioForce * dt;
        b.velocity.z += (Math.random() - 0.5) * audioForce * dt;
      }

      b.velocity.multiplyScalar(this.damping);
      b.position.addScaledVector(b.velocity, dt);

      /* world-sphere boundary */
      const B = 150;
      const d = b.position.length();
      if (d + b.radius > B) {
        const n = b.position.clone().normalize();
        b.position.copy(n.multiplyScalar(B - b.radius));
        const vDot = b.velocity.dot(n);
        if (vDot > 0) b.velocity.addScaledVector(n, -vDot * 1.9 * b.restitution);
      }
    });

    /* 3 – narrow-phase collision resolution */
    this.bodies.forEach((a, i) => {
      grid.neighbours(a.position).forEach((j) => {
        if (j <= i) return;
        this.resolve(a, this.bodies[j]);
      });
    });
  }

  private resolve(a: PhysicsBody, b: PhysicsBody) {
    const dist = a.position.distanceTo(b.position);
    const min  = a.radius + b.radius;
    if (dist >= min) return;

    const n = b.position.clone().sub(a.position).normalize();
    const overlap = min - dist;
    a.position.addScaledVector(n, -overlap * 0.5);
    b.position.addScaledVector(n,  overlap * 0.5);

    const relVel = b.velocity.clone().sub(a.velocity);
    const velAlongNormal = relVel.dot(n);
    if (velAlongNormal > 0) return;

    const e = Math.min(a.restitution, b.restitution);
    let j = -(1 + e) * velAlongNormal;
    j /= 1 / a.mass + 1 / b.mass;

    const impulse = n.clone().multiplyScalar(j);
    a.velocity.addScaledVector(impulse, -1 / a.mass);
    b.velocity.addScaledVector(impulse,  1 / b.mass);
  }

  clear() { this.bodies.length = 0; }
}



/* ------------------------------------------------------------------ *
 *  Enumerations & Props
 * ------------------------------------------------------------------ */

export type RenderingMode6 =
  | "solid"
  | "wireframe"
  | "transparent"
  | "rainbow"
  | "neon"
  | "plasma";

export type ColorMode6 =
  | "default"
  | "audioAmplitude"
  | "frequencyBased"
  | "paletteShift"
  | "chaotic"
  | "rhythmic"
  | "popular";

export type ShapeMode6 =
  | "box"
  | "sphere"
  | "torus"
  | "torusKnot"
  | "cone"
  | "pyramid"
  | "tetra"
  | "octa"
  | "dodeca"
  | "icosa"
  | "ring"
  | "spring"
  | "multi"
  | "supershape"  // NEW
  | "fractaloid" ;  // NEW

export interface VisualizerSixProps {
  audioUrl: string;
  isPaused: boolean;
  renderingMode?: RenderingMode6;
  colorMode?: ColorMode6;
  shapeMode?: ShapeMode6;
  paletteIndex?: number;
  setPaletteIdx?: (n: number | ((p: number) => number)) => void;
}

function geometryFor(
  s: Exclude<ShapeMode6, "multi">,
  isMultiMode: boolean,                     // NEW ARG
): THREE.BufferGeometry {
  const LOW_DETAIL = !isMultiMode;          // ← no more stray shapeMode!

  switch (s) {
    case "supershape":
      return superShapeGeom({
        seg:   LOW_DETAIL ? 32 : 48,
        rings: LOW_DETAIL ? 32 : 48,
      });

    case "fractaloid":
      return fractaloidGeom(LOW_DETAIL ? 2 : 3, 0.55);

    case "sphere":
      return new THREE.SphereGeometry(
        0.5,
        LOW_DETAIL ? 16 : 32, // width segments
        LOW_DETAIL ? 12 : 32  // height segments
      );

    case "torus":
      return new THREE.TorusGeometry(
        0.45,
        0.14,
        LOW_DETAIL ? 12 : 16, // radial segments
        LOW_DETAIL ? 24 : 32  // tubular segments
      );

    case "torusKnot":
      return new THREE.TorusKnotGeometry(
        0.4,
        0.15,
        LOW_DETAIL ? 48 : 64, // tubular segments
        8,                     // radial segments
        2,                     // p
        3                      // q
      );

    case "cone":
      return new THREE.ConeGeometry(
        0.45,
        1,
        LOW_DETAIL ? 8 : 16   // radial segments
      );

    case "pyramid":
      return new THREE.ConeGeometry(
        0.6,
        0.9,
        LOW_DETAIL ? 4 : 6    // radial segments
      );

    case "tetra":
      return new THREE.TetrahedronGeometry(0.55, LOW_DETAIL ? 0 : 1);

    case "octa":
      return new THREE.OctahedronGeometry(0.55, LOW_DETAIL ? 0 : 1);

    case "dodeca":
      return new THREE.DodecahedronGeometry(0.5, LOW_DETAIL ? 0 : 1);

    case "icosa":
      return new THREE.IcosahedronGeometry(0.5, LOW_DETAIL ? 0 : 1);

    case "ring":
      return new THREE.TorusGeometry(
        0.45,
        0.05,
        16,                    // radial segments (low complexity)
        LOW_DETAIL ? 24 : 48   // tubular segments
      );

    case "spring":
      return new THREE.TorusKnotGeometry(
        0.35,
        0.07,
        LOW_DETAIL ? 100 : 150, // tubular segments
        LOW_DETAIL ? 8   : 12,  // radial segments
        2,                       // p
        5                        // q
      );

    default:
      // box fallback (always low complexity)
      return new THREE.BoxGeometry(0.6, 0.6, 0.6, 2, 2, 2);
  }
}



/* ---------- cursor-paddle (“gel ball”) constants ---------- */
const PADDLE_RADIUS   = 10;
const PADDLE_MASS     = 1e5;        // practically immovable
/* constants */
const PADDLE_SPRING  = 60;   // was 14
const PADDLE_DAMPING = 12;   // was 10
/* central sphere */
const CENTER_RADIUS   = 30;   // ⬅︎ bigger liquid core
const SAFE_GAP        = 4;    // min distance between core & swarm

/* highly refractive, slightly tinted gel material */
const paddleMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#AAF"),
  transmission: 1,
  ior: 1.45,
  thickness: 2,
  roughness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
});


/* ------------------------------------------------------------------ *
 *  Edge–Outline ShaderMaterial
 * ------------------------------------------------------------------ */

const MeshEdgesMaterial = shaderMaterial(
  {
    color: new THREE.Color("white"),
    size: new THREE.Vector3(1, 1, 1),
    thickness: 0.008,
    smoothness: 0.015,
    glowIntensity: 1.0,
    time: 0,
  },
  /* vertex */ `
    varying vec3 vPos;
    uniform float time;
    void main() {
      vPos = position;
      vec3 p = position + sin(position * 10.0 + time) * 0.02;
      gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(p, 1.0);
    }`,
  /* fragment */ `
    varying vec3 vPos;
    uniform vec3 size, color;
    uniform float thickness, smoothness, glowIntensity, time;
    void main() {
      vec3 d = abs(vPos) - size * 0.5;
      float edge = min(min(length(d.xy), length(d.yz)), length(d.xz));
      float a = smoothstep(thickness, thickness + smoothness, edge);
      float pulse = sin(time * 3.0) * 0.3 + 0.7;
float glass = smoothstep(0.5, 0.9, glassness);
vec3  glow  = mix(col, vec3(1.0), trebEnergy * 0.6);
col         = mix(glow, col, glass);

gl_FragColor = vec4(col, mix(0.15, 0.95, glass));

    }`,
);
extend({ MeshEdgesMaterial });
// ───────────────── Liquid-Perlin central-sphere shader ───────────────
const LiquidPerlinMaterial = shaderMaterial(
  {
    time: 0,
    audioEnergy: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebEnergy: 0,
    color1: new THREE.Color("#ff0080"),
    color2: new THREE.Color("#0080ff"),
    color3: new THREE.Color("#80ff00"),
    noiseScale: 1,
    distortionAmount: 1,
    liquidSpeed: 1,
    glassness: 0.0,          // 0 = plasma, 1 = glass

  },
/* vertex */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  uniform float time, audioEnergy, bassEnergy, midEnergy, trebEnergy;
  uniform float noiseScale, distortionAmount, liquidSpeed;

  vec3  mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec2  mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
  vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,
                      -0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
    i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m; m=m*m;
    vec3 x=2.*fract(p*C.www)-1.; vec3 h=abs(x)-0.5;
    vec3 ox=floor(x+0.5); vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }
  float fbm(vec3 p){
    float v=0.,a=0.5,f=1.;
    for(int i=0;i<6;i++){
      v+=a*snoise(p.xy*f+time*liquidSpeed);
      p=p.zyx; f*=2.; a*=0.5;
    } return v;
  }

  void main(){
    vPos=position; vNormal=normal;
    float t=time*liquidSpeed;
    float amp=1.+audioEnergy*3.;
    float n = fbm(position*noiseScale*0.5+t*0.3)*amp
            + fbm(position*noiseScale*1.+t*0.5)*amp*0.5
            + fbm(position*noiseScale*2.+t*0.8)*amp*0.25;

    float pulse   = sin(t*4.)*0.3+0.7;
    float bass    = sin(t*2.+bassEnergy*10.)*bassEnergy*0.8;
    float mid     = cos(t*3.+midEnergy *8.)*midEnergy *0.6;
    float treb    = sin(t*6.+trebEnergy*12.)*trebEnergy*0.4;

    vec3 displaced = position + normal
                     * (n*distortionAmount*pulse + bass + mid + treb);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced,1.);
  }`,
/* fragment */ `
  varying vec3 vPos, vNormal;
  uniform float time, audioEnergy, bassEnergy, midEnergy, trebEnergy;
  uniform vec3  color1, color2, color3;
  uniform float liquidSpeed;

  void main(){
    float t = time*liquidSpeed;
    float noise = sin(vPos.x*3.+t)
                * cos(vPos.y*3.+t*0.7)
                * sin(vPos.z*3.+t*1.3);

    float bassMix = sin(t*2.+bassEnergy*8.)*0.5+0.5;
    float midMix  = cos(t*3.+midEnergy *6.)*0.5+0.5;

    vec3 col = mix(color1,color2,bassMix+noise*0.3);
         col = mix(col,color3,midMix+noise*0.2);

    float bright = 0.8+audioEnergy*0.8
                 + sin(t*5.)*trebEnergy*0.4;

    float fres   = pow(1.-dot(vNormal,
                     normalize(cameraPosition-vPos)),2.);
    col = mix(col,vec3(1.),fres*0.3)*bright;

    gl_FragColor = vec4(col,0.9+fres*0.1);
  }`
);
extend({ LiquidPerlinMaterial });


/* ------------------------------------------------------------------ *
 *  Helpers & Constants
 * ------------------------------------------------------------------ */

const noise3D = createNoise3D();
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Return a geometry for the given shape, reducing tessellation
 * when shapeMode !== "multi" to keep frame-rates smooth.
 */

/* Popular color palettes from color-hex.com */
export const POPULAR_PALETTES: readonly string[][] = [
  // Cappuccino
  ["#8B4513", "#D2691E", "#DEB887", "#F5DEB3", "#FFEFD5"],
  // Pastel colors of the rainbow
  ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"],
  // Beach
  ["#FFF8DC", "#F0E68C", "#87CEEB", "#20B2AA", "#008B8B"],
  // Beautiful Blues
  ["#E6F3FF", "#B3D9FF", "#80BFFF", "#4DA6FF", "#1A8CFF"],
  // Skin Tones
  ["#FDBCB4", "#EAA57F", "#D08B5B", "#B57142", "#8B4513"],
  // Faded Rose
  ["#FFF0F5", "#FFE4E1", "#FFCCCB", "#FFB6C1", "#FFA0B4"],
  // VaporWave
  ["#FF006E", "#8338EC", "#3A86FF", "#06FFA5", "#FFBE0B"],
  // Retro
  ["#F72585", "#B5179E", "#7209B7", "#480CA8", "#3A0CA3"],
  // Pastel
  ["#F8BBD9", "#E7C6FF", "#C8B6FF", "#B8E6B8", "#FFE5B4"],
  // Ice cream
  ["#FFB3E6", "#FFCCE6", "#FFE6F2", "#E6F3FF", "#CCFFFF"],
  // Shades of Teal
  ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#26A69A"],
  // Underwater Scene
  ["#003366", "#006699", "#0099CC", "#33CCFF", "#66DDFF"],
  // Dusty Sage
  ["#9CAF88", "#A8C4A2", "#B4D4AA", "#C0E4B2", "#CCF4BA"],
  // Twilight Sparkle
  ["#2E1A47", "#4A2C69", "#663D8B", "#824EAD", "#9E5FCF"],
  // Google Colors
  ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#9AA0A6"],
  // Sage Green
  ["#87A96B", "#9BB88A", "#AFC7A8", "#C3D6C7", "#D7E5E5"],
  // Rainbow Dash
  ["#00BFFF", "#87CEEB", "#ADD8E6", "#B0E0E6", "#F0F8FF"],
  // Summer Coming
  ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
  // City Sunset
  ["#FF8C69", "#FA8072", "#F4A460", "#DEB887", "#D2B48C"],
  // Instagram gradient
  ["#833AB4", "#C13584", "#E1306C", "#FD1D1D", "#F77737"],
  // Discord Colors
  ["#5865F2", "#5865F2", "#57F287", "#FEE75C", "#ED4245"],
  // Millennial Pink
  ["#F7CAC9", "#F7786B", "#C94C4C", "#AB4E52", "#92A8D1"],
  // Purple-Grey
  ["#E6E6FA", "#D8BFD8", "#DDA0DD", "#DA70D6", "#C8A2C8"],
  // Happy pastel
  ["#FDFD96", "#FFB347", "#FF6961", "#C5A3FF", "#87CEEB"],
  // Off white
  ["#FFF8DC", "#FFFACD", "#FFEFD5", "#FFE4E1", "#FDF5E6"],
];
/* ---------- Superformula helpers ---------- */
interface SuperParams {
  m: number;
  n1: number;
  n2: number;
  n3: number;
  a?: number;
  b?: number;
  seg?: number;
  rings?: number;
}
const superR = (
  { m, n1, n2, n3, a = 1, b = 1 }: SuperParams,
  φ: number,
  θ: number,
) => {
  /* 2-D radius (φ only) – Gielis superformula */
  const part1 = Math.pow(Math.abs(Math.cos((m * φ) / 4) / a), n2);
  const part2 = Math.pow(Math.abs(Math.sin((m * φ) / 4) / b), n3);
  const r2d = Math.pow(part1 + part2, -1 / n1);

  /* simple latitude falloff keeps poles from pinching */
  const k = 0.5 + 0.5 * Math.cos(θ);
  return r2d * k;
};

/** Build a closed 3-D supershape from SuperParams */
function superShapeGeom(p: Partial<SuperParams> = {}): THREE.BufferGeometry {
  //  ▸ pick a pleasing random parameter set if not supplied
  const M = p.m  ?? THREE.MathUtils.randInt(3, 9);
  const N1 = p.n1 ?? THREE.MathUtils.randFloat(0.15, 2.5);
  const N2 = p.n2 ?? THREE.MathUtils.randFloat(0.15, 2.5);
  const N3 = p.n3 ?? THREE.MathUtils.randFloat(0.15, 2.5);
  const seg   = p.seg   ?? 48;
  const rings = p.rings ?? 48;

  const geo = new THREE.BufferGeometry();
  const v: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const θ = -Math.PI + (2 * Math.PI * i) / rings;
    for (let j = 0; j <= seg; j++) {
      const φ = -Math.PI + (2 * Math.PI * j) / seg;
      const r = superR({ m: M, n1: N1, n2: N2, n3: N3 }, φ, θ);
      v.push(
        r * Math.cos(φ) * Math.cos(θ),
        r * Math.sin(φ) * Math.cos(θ),
        r * Math.sin(θ),
      );
    }
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  geo.computeVertexNormals();
  return geo;
}

/* ---------- “low-poly fractal” helper ---------- */
function fractaloidGeom(detail = 3, rough = 0.55): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(0.5, detail);
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      y = pos.getY(i),
      z = pos.getZ(i);
    // simplex noise displaced radial scale
    const n = noise3D(x * 3, y * 3, z * 3);
    const s = 1 + n * rough;
    pos.setXYZ(i, x * s, y * s, z * s);
  }
  g.computeVertexNormals();
  return g;
}


/* ------------------------------------------------------------------ *
 *  Component
 * ------------------------------------------------------------------ */
export default function VisualizerSix({
  audioUrl,
  isPaused,
  renderingMode: extRender,
  colorMode:    extColor,
  shapeMode:    extShape,
  paletteIndex: extPalette,
  setPaletteIdx,
}: VisualizerSixProps) {
  /* ---------------- controlled state ---------------- */
  const [renderingMode, setRenderingMode] = useState<RenderingMode6>(
    extRender ?? "solid",
  );
  const [colorMode, setColorMode] = useState<ColorMode6>(
    extColor ?? "default",
  );
  const [shapeMode, setShapeMode] = useState<ShapeMode6>(
    extShape ?? "multi",
  );
  const [paletteIdxInternal, setPaletteIdxInternal] = useState(
    typeof extPalette === "number"
      ? extPalette
      : Math.floor(Math.random() * POPULAR_PALETTES.length),
  );
/* ––– interaction ––– */

const { camera, gl } = useThree();
const raycaster = useMemo(() => new THREE.Raycaster(), []);
  /* ---------------- physics ---------------- */
const phys   = useRef(new PhysicsSystem());
const bodies = useRef<PhysicsBody[]>([]);   // ⬅️  move this pair ↑ here
const centerSphereRef = useRef<THREE.Mesh | null>(null);


/* ------------------------------------------------------------------ */
/* click-to-throw helper – TYPE-SAFE                                  */
/* ------------------------------------------------------------------ */

/*  💡  Deleted the 2nd `interface HitInfo { … }`
    to avoid a duplicate-name shadowing. */
/* cursor → world-space paddle target -------------------------------- */
/* cursor → world-space paddle target -------------------------------- */
const paddleTarget = useRef(new THREE.Vector3());

useEffect(() => {
  const ray   = new THREE.Ray();
  const dir   = new THREE.Vector3();
  const plane = new THREE.Plane();          // reused each event

  const onMove = (ev: PointerEvent) => {
    const { left, top, width, height } = gl.domElement.getBoundingClientRect();

    // Convert screen coords → NDC
    const ndc = new THREE.Vector2(
      ((ev.clientX - left) / width)  * 2 - 1,
      -((ev.clientY - top)  / height) * 2 + 1
    );

    // Build a world-space ray from camera through the cursor
    raycaster.setFromCamera(ndc, camera);
    ray.copy(raycaster.ray);

    // Plane that faces the camera and passes through the paddle
    if (paddleMeshRef.current) {
      camera.getWorldDirection(dir).normalize();
      plane.setFromNormalAndCoplanarPoint(dir, paddleMeshRef.current.position);

      // Intersection gives us the target point
      ray.intersectPlane(plane, paddleTarget.current);
    }
  };

  gl.domElement.addEventListener("pointermove", onMove);
  return () => gl.domElement.removeEventListener("pointermove", onMove);
}, [camera, gl, raycaster]);


useEffect(() => {
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0 plane

  const onMove = (ev: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
    raycaster.ray.intersectPlane(plane, paddleTarget.current);
  };

  gl.domElement.addEventListener("pointermove", onMove);
  return () => gl.domElement.removeEventListener("pointermove", onMove);
}, [camera, gl, raycaster]);


  /* ----- sync with parent props ----- */
  useEffect(() => { if (extRender && extRender !== renderingMode) setRenderingMode(extRender); }, [extRender]);
  useEffect(() => { if (extColor  && extColor  !== colorMode   ) setColorMode(extColor);       }, [extColor]);
  useEffect(() => { if (extShape  && extShape  !== shapeMode   ) setShapeMode(extShape);       }, [extShape]);
  useEffect(() => {
    if (typeof extPalette === "number" && extPalette !== paletteIdxInternal)
      setPaletteIdxInternal(extPalette);
  }, [extPalette]);

  /* unified palette setter */
  const bumpPalette = () => {
    if (setPaletteIdx) setPaletteIdx((p) => (typeof p === "number" ? (p + 1) % POPULAR_PALETTES.length : 0));
    else setPaletteIdxInternal((n) => (n + 1) % POPULAR_PALETTES.length);
  };

  const PALETTE = POPULAR_PALETTES[paletteIdxInternal];

  /* ---------------- audio ---------------- */
  const analyserRef = useSharedAudio(audioUrl, isPaused);
  const fft = useRef<Uint8Array>(new Uint8Array(0));
  const bassAvg = useRef(0);
  const midAvg  = useRef(0);
  const trebAvg = useRef(0);


/* ---------------- instancing refs ---------------- */
const ROOT          = useRef<THREE.Group>(null!);
const INSTS         = useRef<THREE.InstancedMesh[]>([]);
const COLORS        = useRef<Float32Array[]>([]);
const SEEDS         = useRef<Float32Array[]>([]);


/* ⬇️  new – per-instance swarm parameters */
interface SwarmParams {
  t: number; factor: number; speed: number;
  xFactor: number; yFactor: number; zFactor: number;
  mx: number; my: number;
}
const SWARM         = useRef<SwarmParams[]>([]);

const TMP           = useMemo(() => new THREE.Object3D(), []);

const paddleMeshRef = useRef<THREE.Mesh | null>(null);
const paddleBodyRef = useRef<PhysicsBody | null>(null);

  /* ---------------- constants ---------------- */
/* ---------------- constants ---------------- */
const SHAPES_ALL: Exclude<ShapeMode6,"multi">[] = [
  "box","sphere","torus","torusKnot","cone","pyramid",
  "tetra","octa","dodeca","icosa","ring","spring", "supershape", "fractaloid"     // NEW entries
];

const ACTIVE: typeof SHAPES_ALL =
  shapeMode === "multi" ? SHAPES_ALL
                        : [shapeMode as Exclude<ShapeMode6,"multi">];

/* target ≤ 1000 total when in multi-mode */
/* target ≤ 1000 total when in multi-mode – but auto-scale for heavy meshes */
const TARGET_TOTAL = 1000;

/* estimate vertex cost for the active shape ----------------------- */
const EST_COMPLEX =
  shapeMode === "supershape"  ? 2600 :          // ≈ 48×48 grid
  shapeMode === "fractaloid"  ? 1620 :          // detail-3 icosa
  shapeMode === "torusKnot"   ? 1152 :          // 64×8
  shapeMode === "spring"      ? 1800 :          // 150×12
  600;                                          // simple primitives

const PER_SHAPE =
  shapeMode === "multi"
    ? Math.floor(TARGET_TOTAL / SHAPES_ALL.length)  // ≈83 each
    : Math.min(1000, Math.max(250, Math.floor(350_000 / EST_COMPLEX)));

const TOTAL = PER_SHAPE * (shapeMode === "multi" ? SHAPES_ALL.length : 1);


 const R_MAX = 100;
  const SCALE_MIN = 0.2, SCALE_MAX = 10.0;

  /* ---------------- material ---------------- */
/* ---------------- material ---------------- */
const coreMat = useMemo<THREE.Material>(() => {
  const baseColor = PALETTE[0];

  switch (renderingMode) {
    case "solid":
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.6,
        roughness: 0.2,
      });

    case "wireframe":
      return new THREE.MeshBasicMaterial({
        wireframe: true,
        vertexColors: true,   // ⬅️ enable instance colours
      });

    case "transparent":
      return new THREE.MeshPhysicalMaterial({
        transmission: 0.9,
        thickness: 1,
        roughness: 0,
        metalness: 0,
        vertexColors: true,   // ⬅️ enable instance colours
        color: baseColor,
      });

    case "rainbow":
      return new THREE.MeshBasicMaterial({
        vertexColors: true,
        toneMapped: false,
      });

    case "neon":
      return new THREE.MeshBasicMaterial({
        vertexColors: true,   // ⬅️ enable instance colours
        toneMapped: false,
      });

    case "plasma":
      return new THREE.MeshStandardMaterial({
        vertexColors: true,   // ⬅️ enable instance colours
        emissiveIntensity: 1.2,
        metalness: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.95,
      });

    default:
      return new THREE.MeshStandardMaterial({ color: baseColor });
  }
}, [renderingMode, paletteIdxInternal]);
/* ---------------- build / rebuild geometry ---------------- */
useLayoutEffect(() => {
  const root = ROOT.current;

  /* fresh slate ---------------------------------------------------- */
  root.clear();
  phys.current.clear();
  bodies.current = [];
  INSTS.current  = [];
  COLORS.current = [];
  SEEDS.current  = [];
  SWARM.current  = [];

  /* ---------- cursor paddle (gel ball) --------------------------- */
  const paddleGeom = new THREE.SphereGeometry(PADDLE_RADIUS, 64, 64);
  const paddleMesh = new THREE.Mesh(paddleGeom, paddleMat);
  root.add(paddleMesh);
  paddleMeshRef.current = paddleMesh;

  const paddleBody = phys.current.addBody(
    new THREE.Vector3(0, 0, 0),
    PADDLE_RADIUS,
    PADDLE_MASS
  );
  paddleBodyRef.current = paddleBody;
  bodies.current.push(paddleBody);           // index 0 = paddle

  /* ---------- liquid-Perlin centre sphere ------------------------ */
  {
  const sGeo = new THREE.SphereGeometry(CENTER_RADIUS, 192, 192); // 12 ➟ 20
  const sMat = new LiquidPerlinMaterial() as THREE.ShaderMaterial;
    sMat.transparent = true;
    sMat.uniforms.color1.value.set(PALETTE[0]);
    sMat.uniforms.color2.value.set(PALETTE[1] ?? PALETTE[0]);
    sMat.uniforms.color3.value.set(PALETTE[2] ?? PALETTE[0]);
    const sphere = new THREE.Mesh(sGeo, sMat);
    root.add(sphere);
    centerSphereRef.current = sphere;
  }

  /* ---------- instanced swarming shapes -------------------------- */
  ACTIVE.forEach((shape, sIdx) => {
const geom = geometryFor(shape, shapeMode === "multi"); // pass the flag 🚀

    const inst = new THREE.InstancedMesh(geom, coreMat, PER_SHAPE);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const cols  = new Float32Array(PER_SHAPE * 3);
    const seeds = new Float32Array(PER_SHAPE * 4);

    for (let i = 0; i < PER_SHAPE; i++) {
      /* colour ---------------------------------------------------- */
      const clr = new THREE.Color(pick(PALETTE));
      inst.setColorAt(i, clr);
      clr.toArray(cols, i * 3);

      /* initial position & scale ---------------------------------- */
const r = THREE.MathUtils.randFloat(
  CENTER_RADIUS + SAFE_GAP + SCALE_MAX,
  R_MAX
);

      const phi   = Math.random() * Math.PI * 2;
      const cosT  = Math.random() * 2 - 1;
      const sinT  = Math.sqrt(1 - cosT * cosT);
      const pos   = new THREE.Vector3(
        r * sinT * Math.cos(phi) + Math.cos(sIdx * 0.3) * 5,
        r * sinT * Math.sin(phi) + Math.sin(sIdx * 0.3) * 5,
        r * cosT
      );
 // choose scale: 25 % – 100 % of SCALE_MAX
const scale = THREE.MathUtils.randFloat(
  SCALE_MAX * 0.25,
  SCALE_MAX
);

// physics body radius = *visual* radius
bodies.current.push(
  phys.current.addBody(pos, scale * 0.5, scale)
);

// simple rejection-sampling to avoid spawn overlaps
let tryCount = 0;
while (tryCount < 30) {
  const collides = bodies.current.some(
    (bd) => bd.position.distanceTo(pos) < bd.radius + scale * 0.5 + 0.5
  );
  if (!collides) break;
  pos.multiplyScalar(1.05); // push outward
  tryCount++;
}

      TMP.position.copy(pos);
      TMP.scale.setScalar(scale);
      TMP.updateMatrix();
      inst.setMatrixAt(i, TMP.matrix);

      /* chaos seeds ---------------------------------------------- */
      seeds.set(
        [Math.random()*10, Math.random()*10, Math.random()*10,
         Math.random()*Math.PI*2],
        i * 4
      );

      /* swarm parameters ----------------------------------------- */
      SWARM.current.push({
        t:       Math.random() * 100,
        factor:  20 + Math.random() * 100,
speed: 0.002 + Math.random() / 600, // smoother

        xFactor: -50 + Math.random() * 100,
        yFactor: -50 + Math.random() * 100,
        zFactor: -50 + Math.random() * 100,
        mx: 0,
        my: 0,
      });
    }

    geom.setAttribute("color",
      new THREE.InstancedBufferAttribute(cols, 3));

    root.add(inst);
    INSTS.current.push(inst);
    COLORS.current.push(cols);
    SEEDS.current.push(seeds);

    /* optional glowing outlines ---------------------------------- */
    if (renderingMode !== "transparent") {
      const oMat = new MeshEdgesMaterial() as THREE.ShaderMaterial;
      oMat.transparent          = true;
      oMat.polygonOffset        = true;
      oMat.polygonOffsetFactor  = -10;
      oMat.uniforms.size.value.set(1,1,1);
      oMat.uniforms.color.value.set(pick(PALETTE));
      oMat.uniforms.glowIntensity.value =
        renderingMode === "neon" ? 2 : 1;
      oMat.uniforms.time.value = 0;

      const outlines = new THREE.InstancedMesh(geom, oMat, PER_SHAPE);
      outlines.instanceMatrix = inst.instanceMatrix;
      root.add(outlines);
    }
  });
}, [shapeMode, renderingMode, paletteIdxInternal]);


/* ---------------- frame loop ---------------- */
const frameRef = useRef(0);           // local frame counter (pre-declare this!)

useFrame((state) => {
  /* --- gather FFT ------------------------------------------------ */
  const analyser = analyserRef.current;
  if (!analyser) return;

  if (fft.current.length !== analyser.frequencyBinCount)
    fft.current = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(fft.current);

  const bins    = fft.current.length;
  const bassEnd = Math.floor(bins * 0.10);
  const midEnd  = Math.floor(bins * 0.40);

  bassAvg.current = fft.current.slice(0, bassEnd)
                    .reduce((a, b) => a + b, 0) / bassEnd / 255;
  midAvg.current  = fft.current.slice(bassEnd, midEnd)
                    .reduce((a, b) => a + b, 0) / (midEnd - bassEnd) / 255;
  trebAvg.current = fft.current.slice(midEnd)
                    .reduce((a, b) => a + b, 0) / (bins - midEnd) / 255;
  const energy = (bassAvg.current + midAvg.current + trebAvg.current) / 3;

  /* --- timing & pointer ----------------------------------------- */
  const dt = Math.min(state.clock.getDelta(), 0.02);
  const t  = state.clock.elapsedTime;

  /* --- adaptive frame-skip for slow devices --------------------- */
  frameRef.current++;
  const fps = 1 / dt;
  if (fps < 40 && (frameRef.current & 1)) return;   // skip every other frame

  const ndc   = new THREE.Vector3(state.pointer.x, state.pointer.y, 0);
  const world = ndc.clone().unproject(state.camera);
  const dir   = world.sub(state.camera.position).normalize();
  const dist  = -state.camera.position.z / dir.z;
  paddleTarget.current.copy(
    state.camera.position.clone().addScaledVector(dir, dist),
  );

  /* --- paddle spring-mass --------------------------------------- */
  const pb = paddleBodyRef.current;
  const pm = paddleMeshRef.current;
  if (!pb || !pm) return;

  const accel = paddleTarget.current.clone().sub(pb.position)
                 .multiplyScalar(PADDLE_SPRING)
                 .sub(pb.velocity.clone().multiplyScalar(PADDLE_DAMPING));

  pb.velocity.addScaledVector(accel, dt);
  pb.position.addScaledVector(pb.velocity, dt);

  const speed   = pb.velocity.length();
  const jiggleT = 1 + Math.min(0.6, speed * 0.03);
  pm.scale.lerp(new THREE.Vector3(jiggleT, jiggleT, jiggleT), 0.25);
  pm.position.copy(pb.position);

  /* --- optional random shape flip ------------------------------- */
  if (energy > 0.6 && Math.random() < 0.005) {
    setShapeMode((m) => (m === "supershape" ? "fractaloid" : "supershape"));
  }

  /* --- physics update (bass-boosted) ---------------------------- */
  for (let c = 0; c < 2; c++) {
    phys.current.update(dt * 0.5, energy + bassAvg.current * 0.7);
  }

  /* --- centre sphere uniforms ----------------------------------- */
  if (centerSphereRef.current) {
    const m = centerSphereRef.current.material as THREE.ShaderMaterial;
    m.uniforms.time.value        = t;
    m.uniforms.audioEnergy.value = energy * 1.4;
    m.uniforms.bassEnergy.value  = bassAvg.current;
    m.uniforms.midEnergy.value   = midAvg.current;
    m.uniforms.trebEnergy.value  = trebAvg.current;
    m.uniforms.glassness.value   = THREE.MathUtils.clamp(
      bassAvg.current * 1.8 - 0.2, 0, 1,
    );

    /* ---- dynamic distortion & hue-shift ---- */
    const baseH = (t * 20) % 360;
    m.uniforms.distortionAmount.value = 1.0 + energy * 3.0;
    m.uniforms.color1.value.setHSL(baseH / 360, 0.9, 0.55);
    m.uniforms.color2.value.setHSL(((baseH + 120) % 360) / 360, 0.9, 0.55);
    m.uniforms.color3.value.setHSL(((baseH + 240) % 360) / 360, 0.9, 0.55);
  }

  /* ---- paddle colour pulse ---- */
  if (energy > 0.4) {
    const target = new THREE.Color(
      PALETTE[Math.floor(Math.random() * PALETTE.length)],
    );
    paddleMat.color.lerp(target, 0.12);
  }

  /* --- update every instanced mesh ------------------------------ */
  INSTS.current.forEach((inst, meshIdx) => {
    const cols = COLORS.current[meshIdx];

    /* glow outlines pulse */
    inst.parent?.children.forEach((child) => {
      if (
        child instanceof THREE.Mesh &&
        child !== inst &&
        child.material instanceof THREE.ShaderMaterial
      ) {
        const u = child.material.uniforms;
        if (u.time)          u.time.value          = t;
        if (u.glowIntensity) u.glowIntensity.value = 1 + bassAvg.current * 2;
      }
    });

    for (let i = 0; i < PER_SHAPE; ++i) {
      const gIdx = meshIdx * PER_SHAPE + i;
      const band = Math.min(
        fft.current.length - 1,
        Math.floor((gIdx / TOTAL) * fft.current.length),
      );
      const e    = fft.current[band] / 255;
      const body = bodies.current[gIdx];
      const sw   = SWARM.current[gIdx];

      /* swarm position ------------------------------------------ */
      sw.t += sw.speed * (1 + e * 3.5);
      const a = Math.cos(sw.t) + Math.sin(sw.t) / 10;
      const b = Math.sin(sw.t) + Math.cos(sw.t * 2) / 10;

      sw.mx += (state.pointer.x * 1000 - sw.mx) * 0.02;
      sw.my += (state.pointer.y * 1000 - sw.my) * 0.02;

      TMP.position.set(
        (sw.mx / 10) * a + sw.xFactor + Math.cos(sw.t / 10 * sw.factor)
          + Math.sin(sw.t) * sw.factor / 10,
        (sw.my / 10) * b + sw.yFactor + Math.sin(sw.t / 10 * sw.factor)
          + Math.cos(sw.t * 2) * sw.factor / 10,
        (sw.my / 10) * b + sw.zFactor + Math.cos(sw.t / 10 * sw.factor)
          + Math.sin(sw.t * 3) * sw.factor / 10,
      ).multiplyScalar(1 + e * 1.4);

      /* scale & rotation ----------------------------------------- */
      const baseScale = SCALE_MIN +
        ((SCALE_MAX - SCALE_MIN) * (meshIdx + 1)) / ACTIVE.length;
      const scale = baseScale * (1 + e * 3.25);

      const minRad = CENTER_RADIUS + SAFE_GAP + body.radius;
      const curRad = TMP.position.length();
      if (curRad < minRad) TMP.position.multiplyScalar(minRad / curRad);

      TMP.scale.setScalar(scale);
      body.radius = scale * 0.5;

      TMP.rotation.set(
        t * 0.3 + body.velocity.x * 0.1,
        t * 0.4 + body.velocity.y * 0.1,
        t * 0.5 + body.velocity.z * 0.1,
      );

      TMP.updateMatrix();
      inst.setMatrixAt(i, TMP.matrix);

      /* optional palette shuffle --------------------------------- */
      if (colorMode === "popular" && Math.random() < 0.02) {
        const c = new THREE.Color(pick(PALETTE));
        c.toArray(cols, i * 3);
        inst.setColorAt(i, c);
        inst.instanceColor!.needsUpdate = true;
      }
    }

    inst.instanceMatrix.needsUpdate = true;
  });

  /* --- timed palette cycling ------------------------------------ */
  if (
    (colorMode === "paletteShift" || colorMode === "popular") &&
    Math.floor(t * 4) !== Math.floor((t - dt) * 4)
  ) {
    bumpPalette();
  }
});

/* bass spikes also bump palette */
if (bassAvg.current > 0.7 && Math.random() < 0.05) bumpPalette();




/* ---------------- cleanup ---------------- */
useLayoutEffect(() => () => {
  ROOT.current.traverse((obj) => {
    if (obj instanceof THREE.InstancedMesh) {
      obj.geometry.dispose();
      (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
    }
  });
}, []);

/* ---------------- render ---------------- */
return (
  <>
    <ambientLight intensity={0.45} />
    <directionalLight
      position={[20, 20, 15]}
      intensity={1.4}
      color={PALETTE[1] ?? PALETTE[0]}
    />
    <pointLight
      position={[-25, -20, -15]}
      intensity={1.1}
      color={PALETTE[2] ?? PALETTE[0]}
    />
    <group ref={ROOT} />
  </>
);
}
