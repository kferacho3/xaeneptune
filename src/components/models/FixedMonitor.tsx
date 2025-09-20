/* ────────────────────────────────────────────────────────────────────────────
   FixedMonitor.tsx
   Anchors <AntiHeroMonitor /> to the camera’s bottom-right corner,
   starts at [0 0 0] scale-1, waits 3 s, flies down-and-right with wobble,
   then enlarges on hover.  Its orientation is *locked* so that it **never**
   inherits OrbitControls rotation (x-axis stays fixed).   Fully typed.
   ────────────────────────────────────────────────────────────────────────── */
"use client";

import { AntiHeroMonitor } from "@/components/models/AntiheroMonitor";
import { useSpring } from "@react-spring/three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Quaternion, Vector3 } from "three";

export default function FixedMonitor() {
  /* ------------------------------------------------------------------ refs */
  const rootRef   = useRef<Group>(null!); // animated — position / wobble
  const orientRef = useRef<Group>(null!); // cancels camera rotation
  const { size, viewport, camera } = useThree();

  /* ----------------------------------------------------------- responsive */
  const [baseScale, setBaseScale] = useState(1);
  const [targetPos, setTargetPos] = useState<Vector3>(() => new Vector3());

  /* recalc on canvas resize */
  useEffect(() => {
    const w = size.width;
    let s = 1;
    if (w < 1800) s = 0.9;
    if (w < 1400) s = 0.8;
    if (w < 1100) s = 0.65;
    if (w < 900)  s = 0.55;
    if (w < 700)  s = 0.45;
    if (w < 550)  s = 0.35;
    setBaseScale(s);

    /* bottom-right corner in view-space */
    const margin = 0.75;
    const x =  viewport.width  / 2 - margin;
    const y = -viewport.height / 2 + margin;
    const z = -1.6;                    // push slightly “into” the screen
    setTargetPos(new Vector3(x, y, z));
  }, [size, viewport]);

  /* ------------------------------------------------------- hover enlarge */
  const [hovered, setHovered] = useState(false);

  /* --------------------------------------------------------- spring anim */
  const springs = useSpring({
    position : targetPos.toArray(),
    rotation : [0, 0, 0], // settle upright
    scale    : hovered
      ? [baseScale * 1.1, baseScale * 1.1, baseScale * 1.1]
      : [baseScale, baseScale, baseScale],
    from : {
      position : [0, 0, 0],
      rotation : [0.4, 0, 0.25],      // wobble while flying in
      scale    : [baseScale, baseScale, baseScale],
    },
    config : { mass: 4, tension: 280, friction: 38 },
    delay  : 3000,
  });

  /* ------------------------------------ cancel camera rotation each tick */
  useFrame(() => {
    if (!orientRef.current) return;
    // worldQuat = cameraQuat · rootQuat · orientQuat
    // choosing orientQuat = cameraQuat⁻¹ → worldQuat = rootQuat (locked)
    orientRef.current.quaternion.copy(
      (new Quaternion()).copy(camera.quaternion).invert()
    );
  });

  /* ---------------------------------------------------------------- render */
  return (
    <primitive object={camera /* parent to camera for simple positioning */}>
      <group
        ref={rootRef}
        position={springs.position.get() as [number, number, number]}
        rotation={springs.rotation.get() as [number, number, number]}
        scale={springs.scale.get() as [number, number, number]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* inner group wipes out camera rotation so monitor stays put */}
        <group ref={orientRef}>
          <AntiHeroMonitor />
        </group>
      </group>
    </primitive>
  );
}
