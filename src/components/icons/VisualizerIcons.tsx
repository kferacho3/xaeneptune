/* ===========================================================================
   VisualizerIcons – SVG icon components for VisualizerOne
   ========================================================================== */
"use client";

import React, { memo } from "react";

/* ---------------------------------------------------------------------------
   PerlinSphereIcon (visualizer one)
   – 24‑sided "sphere" (circle) whose vertices are jittered to mimic noise
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