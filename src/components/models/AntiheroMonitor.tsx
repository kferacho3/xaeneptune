/* ─────────────────────────────────────────────────────────────────────────────
   AntiHeroMonitor
   • exact base pose               rotation [π/2, 0, 0.5]   position [0.275, –0.15, –0.3]
   • ONLY X‑offset + uniform scale change responsively
   • slides in (after 3 s) from one unit below with a wobble
   • hover enlarges 10 %
   • model subtly looks at the cursor
   • screen texture swaps live from useMonitorStore
────────────────────────────────────────────────────────────────────────────── */

"use client";

import { TextureName } from "@/store/useMonitorStore";
import { useSpring } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import {
  ThreeElements,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

/* ----------------------------- typed GLB ----------------------------- */
type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.MeshStandardMaterial>;
};

/* --------------------------- responsive map -------------------------- */
const responsive = (w: number) =>
  w > 1400 ? { x: 0.275, s: 0.05 } :
  w > 1100 ? { x: 0.245, s: 0.045 } :
  w >  800 ? { x: 0.215, s: 0.040 } :
  w >  600 ? { x: 0.190, s: 0.035 } :
             { x: 0.170, s: 0.030 };

/* ------------------------------- URL --------------------------------- */
const MODEL_URL =
  "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiheroMonitor.glb";

/* turn TextureName → texture URL (adjust path if needed) */
const texUrl = (name: TextureName) =>
  `https://xaeneptune.s3.us-east-2.amazonaws.com/textures/${name}.webp`;

/* --------------------------- component ------------------------------- */
export function AntiHeroMonitor(props: ThreeElements["group"]) {
  const group = useRef<THREE.Group>(null!);
  const { size, camera, pointer } = useThree();

  /* GLB ----------------------------------------------------------------- */
  // Cast through unknown to silence GLTF-node‐typing mismatch
  const { nodes, materials } = useGLTF(MODEL_URL) as unknown as GLTFResult;

  /* --------------------- responsive layout ---------------------------- */
  const [layout, setLayout] = useState(() => responsive(size.width));
  useEffect(() => setLayout(responsive(size.width)), [size.width]);

  /* ---------------------- hover state --------------------------------- */
  const [hovered, setHovered] = useState(false);

  /* ---------------- spring animation ---------------------------------- */
  const [{ position, scale, rotationZ }, api] = useSpring(() => ({
    from: {
      position: [layout.x, -0.15 - 1, -0.3] as [number, number, number],
      scale: layout.s,
      rotationZ: 0.6,
    },
    config: { tension: 120, friction: 10, mass: 1 },
  }));

  /* delayed entry ------------------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      api.start({ position: [layout.x, -0.15, -0.3], rotationZ: 0 });
    }, 3000);
    return () => clearTimeout(t);
  }, [layout.x]);

  /* respond to resize / hover ------------------------------------------ */
  useEffect(() => {
    api.start({
      position: [layout.x, -0.15, -0.3],
      scale: hovered ? layout.s * 1.1 : layout.s,
    });
  }, [layout, hovered]);

  /* ------------------ live texture swap ------------------------------- */

  /* cache texture once */
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(texUrl("antiheroesPerlinNoise"));
  }, []);

  /* set emissiveMap on every material that already had one -------------- */
  useEffect(() => {
    Object.values(materials).forEach((mat) => {
      // swap only if that material originally *had* an emissive map
      if ((mat as THREE.MeshStandardMaterial).emissiveMap !== null) {
        mat.emissiveMap = texture;
        mat.emissive = new THREE.Color(0xffffff);
        mat.needsUpdate = true;
      }
    });
  }, [texture, materials]);

  /* subtle look‑at‑cursor ---------------------------------------------- */
  useFrame(() => {
    if (!group.current) return;
    const target = new THREE.Vector3(pointer.x, pointer.y, 0).unproject(camera);
    target.z = camera.position.z - 1;
    group.current.lookAt(target);
  });

  /* ----------------------------- render ------------------------------- */
  return (
    <Suspense fallback={null}>
      <group
        ref={group}
        {...props}
        position={position.get()}
        rotation-z={rotationZ.get()}
        scale={scale.get()}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        dispose={null}
      >
        <group rotation={[Math.PI / 1.8, 0.2, -2.2]} position={[0.275, -0.15, 0]}>
          {Object.entries(nodes).map(([key, mesh]) => (
            <primitive key={key} object={mesh} />
          ))}
        </group>
      </group>
    </Suspense>
  );
}

/* preload for faster startup */
useGLTF.preload(MODEL_URL);
