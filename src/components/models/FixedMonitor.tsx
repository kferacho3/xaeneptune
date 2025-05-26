/* ────────────────────────────────────────────────────────────────────────────
   FixedMonitor
   Anchors the AntiHeroMonitor to the camera’s bottom‑right corner,
   starts at [0,0,0] scale‑1, waits 3 s, flies down‑and‑right with wobble,
   then tracks the mouse and enlarges on hover. Fully typed.
   ────────────────────────────────────────────────────────────────────────── */

   "use client";

   import { AntiHeroMonitor } from "@/components/models/AntiheroMonitor";
import { a, useSpring } from "@react-spring/three";
import {
    useThree
} from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Vector3 } from "three";
   
   export default function FixedMonitor() {
     /* THREE refs / helpers --------------------------------------------------- */
     const group                      = useRef<Group>(null!);
     const { size, viewport, camera } = useThree();
   
     /* responsive scale + position ------------------------------------------- */
     const [baseScale, setBaseScale]   = useState(1);
     const [targetPos, setTargetPos]   = useState<Vector3>(() => new Vector3());
   
     /* recalculate on canvas resize ------------------------------------------ */
     useEffect(() => {
       const w = size.width;
   
       /* gradual down‑scaling — tweak break‑points to taste */
       let s = 1;
       if (w < 1800) s = 0.9;
       if (w < 1400) s = 0.8;
       if (w < 1100) s = 0.65;
       if (w < 900)  s = 0.55;
       if (w < 700)  s = 0.45;
       if (w < 550)  s = 0.35;
       setBaseScale(s);
   
       /* bottom‑right corner in view‑space units */
       const margin = 0.75;
       const x =  viewport.width  / 2 - margin;
       const y = -viewport.height / 2 + margin;
       const z = -1.6;
       setTargetPos(new Vector3(x, y, z));
     }, [size, viewport]);
   
     /* entrance animation ----------------------------------------------------- */
     const springs = useSpring({
       position : targetPos.toArray(),
       rotation : [0, 0, 0],
       from     : {
         position: [0, 0, 0],           // ⬅️ initial position
         rotation: [0.4, 0, 0.25],      // wobble entry
       },
       config : { mass: 4, tension: 280, friction: 38 },
       delay  : 3000,                   // wait 3 s before animating in
     });
   
     /* interactivity ---------------------------------------------------------- */
     const [hovered, setHovered] = useState(false);
   

   
     /* render ----------------------------------------------------------------- */
     return (
       <a.group
 

       >
         <AntiHeroMonitor />
       </a.group>
     );
   }
   