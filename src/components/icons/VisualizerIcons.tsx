/* ===========================================================================
   VisualizerIcons – all SVG icon components
   ========================================================================== */
   "use client";

   import React, { memo } from "react";
   
   /* helper ------------------------------------------------------------------ */
   const randRGB = () =>
     `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(
       Math.random() * 256,
     )})`;
   
   /* ---------------------------------------------------------------------------
      1️⃣  PerlinSphereIcon  (visualizer one)
      – 24‑sided “sphere” (circle) whose vertices are jittered to mimic noise
   --------------------------------------------------------------------------- */
   export const PerlinSphereIcon = memo(function PerlinSphereIcon({
     sides = 128,
     size = 36,
     jitter = 0.17,
     className = "",
   }: {
     sides?: number;
     size?: number;
     jitter?: number;
     className?: string;
   }) {
     const points: string[] = [];
     for (let i = 0; i < sides; i++) {
       const phi = (i * 2 * Math.PI) / sides;
       const r = 0.5 + (Math.random() - 0.5) * jitter;
       const x = 0.5 + r * 0.48 * Math.cos(phi);
       const y = 0.5 + r * 0.48 * Math.sin(phi);
       points.push(`${(x * size).toFixed(2)},${(y * size).toFixed(2)}`);
     }
     return (
       <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
         <polygon
           points={points.join(" ")}
           fill="url(#perlinGrad)"
           stroke="currentColor"
           strokeWidth={0.8}
         />
         <defs>
           <radialGradient id="perlinGrad">
             <stop offset="0%" stopColor="#fff" />
             <stop offset="100%" stopColor="#aaa" />
           </radialGradient>
         </defs>
       </svg>
     );
   });
   PerlinSphereIcon.displayName = "PerlinSphereIcon";
   
   /* ---------------------------------------------------------------------------
      2️⃣  FractalIcon  (visualizer two)
   --------------------------------------------------------------------------- */
   interface FractalProps {
     size?: number;
     length?: number;
     depth?: number;
     branchAngle?: number;
     className?: string;
   }
   export const FractalIcon = memo(function FractalIcon({
     size = 64,
     length = 10,
     depth = 6,
     branchAngle = Math.PI / 4,
     className = "",
   }: FractalProps) {
     let id = 0;
     const lines: React.ReactNode[] = [];
   
     const draw = (
       x: number,
       y: number,
       len: number,
       d: number,
       angle: number,
       sw: number,
     ) => {
       if (d === 0) return;
       const x2 = x + len * Math.cos(angle);
       const y2 = y + len * Math.sin(angle);
       lines.push(
         <line
           key={`f-${id++}`}
           x1={x}
           y1={y}
           x2={x2}
           y2={y2}
           stroke={randRGB()}
           strokeWidth={sw}
           strokeLinecap="round"
         />,
       );
       const nextLen = len * 0.7;
       const nextSw = sw * 0.8;
       draw(x2, y2, nextLen, d - 1, angle - branchAngle, nextSw);
       draw(x2, y2, nextLen, d - 1, angle + branchAngle, nextSw);
     };
   
     draw(size / 2, size, length, depth, -Math.PI / 2, 1);
   
     return (
       <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
         {lines}
       </svg>
     );
   });
   FractalIcon.displayName = "FractalIcon";
   
   /* ---------------------------------------------------------------------------
      3️⃣  GridPatternIcon  (visualizer three)
      – endless grid of circles, squares, triangles
   --------------------------------------------------------------------------- */
   export const GridPatternIcon = memo(function GridPatternIcon({
     size = 48,
     step = 6,
     className = "",
   }: {
     size?: number;
     step?: number;
     className?: string;
   }) {
     const shapes: React.ReactNode[] = [];
     let id = 0;
     for (let y = step / 2; y < size; y += step) {
       for (let x = step / 2; x < size; x += step) {
         const t = (x + y) % (step * 3);
         if (t < step) {
           shapes.push(
             <circle
               key={`c-${id++}`}
               cx={x}
               cy={y}
               r={step * 0.25}
               fill="currentColor"
             />,
           );
         } else if (t < step * 2) {
           shapes.push(
             <rect
               key={`s-${id++}`}
               x={x - step * 0.25}
               y={y - step * 0.25}
               width={step * 0.5}
               height={step * 0.5}
               fill="currentColor"
             />,
           );
         } else {
           shapes.push(
             <polygon
               key={`t-${id++}`}
               points={`${x},${y - step * 0.3} ${x - step * 0.26},${y + step * 0.18} ${x + step * 0.26},${y +
                 step * 0.18}`}
               fill="currentColor"
             />,
           );
         }
       }
     }
     return (
       <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
         {shapes}
       </svg>
     );
   });
   GridPatternIcon.displayName = "GridPatternIcon";
   
   /* ---------------------------------------------------------------------------
      4️⃣  PlanetMoonsIcon  (visualizer four)
   --------------------------------------------------------------------------- */
   export const PlanetMoonsIcon = memo(function PlanetMoonsIcon({
     size = 48,
     className = "",
   }: {
     size?: number;
     className?: string;
   }) {
     return (
       <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
         {/* planet */}
         <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.22} fill="currentColor" />
         {/* ring */}
         <ellipse
           cx={size * 0.5}
           cy={size * 0.5}
           rx={size * 0.32}
           ry={size * 0.12}
           fill="none"
           stroke="currentColor"
           strokeWidth={1}
         />
         {/* moons */}
         {[0.2, 0.32, 0.45].map((r, i) => (
           <circle
             key={i}
             cx={size * 0.5 + r * size * Math.cos((i * 2 * Math.PI) / 3)}
             cy={size * 0.5 + r * size * Math.sin((i * 2 * Math.PI) / 3)}
             r={size * (0.05 + 0.02 * i)}
             fill="currentColor"
             opacity={0.8}
           />
         ))}
       </svg>
     );
   });
   PlanetMoonsIcon.displayName = "PlanetMoonsIcon";
   
   /* ---------------------------------------------------------------------------
      5️⃣  SupershapeIcon (unchanged except thinner stroke)
   --------------------------------------------------------------------------- */
   interface SuperProps {
     size?: number;
     points?: number;
     className?: string;
   }
   export const SupershapeIcon = memo(function SupershapeIcon({
     size = 48,
     points = 240,
     className = "",
   }: SuperProps) {
     const m = 25,
       n1 = 0.03,
       n2 = 1.7,
       n3 = 1.7,
       a = 1,
       b = 1;
     const path: string[] = [];
     for (let i = 0; i <= points; i++) {
       const phi = (i * 2 * Math.PI) / points;
       const t1 = Math.pow(Math.abs(Math.cos((m * phi) / 4) / a), n2);
       const t2 = Math.pow(Math.abs(Math.sin((m * phi) / 4) / b), n3);
       let r = Math.pow(t1 + t2, 1 / n1);
       r = r === 0 ? 0 : 1 / r;
       const x = size / 2 + (size / 2 - 2) * r * Math.cos(phi);
       const y = size / 2 + (size / 2 - 2) * r * Math.sin(phi);
       path.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
     }
     path.push("Z");
     return (
       <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
         <path d={path.join(" ")} fill="none" stroke="currentColor" strokeWidth={0.5} />
       </svg>
     );
   });
   SupershapeIcon.displayName = "SupershapeIcon";
   