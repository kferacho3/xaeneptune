/* --------------------------------------------------------------------------
   src/components/visualizers/VisualizerSixHelpers/VisualizerSixControls.tsx
   One-piece, minimisable control HUD ▸ collapses into a tidy pill
--------------------------------------------------------------------------- */
"use client";

import { ChangeEvent, useState } from "react";
import type { ColorMode6, RenderingMode6, ShapeMode6 } from "../VisualizerSix";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface VisualizerSixControlsProps {
  /* live state */
  shapeMode: ShapeMode6;
  renderingMode: RenderingMode6;
  colorMode: ColorMode6;
  paletteIndex: number;
  totalInst?: number;
  shapeCount?: number;
  bass: number;
  mid: number;
  treble: number;
  isPaused: boolean;

  /* setters */
  setShapeMode:    (v: ShapeMode6)    => void;
  setRenderingMode:(v: RenderingMode6)=> void;
  setColorMode:    (v: ColorMode6)    => void;
  setPaletteIdx:   (v: number)        => void;

  /* helpers */
  randShape: () => void;
  randAll:   () => void;
  palettes: readonly string[][];
}

/* ------------------------------------------------------------------ */
/*  Tiny helpers                                                      */
/* ------------------------------------------------------------------ */
const btn = `px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-teal-600
hover:from-fuchsia-500 hover:to-teal-500 text-white text-xs font-bold
tracking-wide transition-all duration-200 hover:scale-105 active:scale-95
shadow-lg hover:shadow-teal-500/30`;

const Select = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) => (
  <label className="flex flex-col gap-0.5 text-xs text-teal-200">
    <span className="font-semibold ml-0.5">{label}</span>
    <select
      className="bg-black/70 border border-teal-500/40 px-2 py-1 rounded-md
                 hover:border-teal-400 focus:border-teal-300 focus:outline-none"
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-black">
          {o}
        </option>
      ))}
    </select>
  </label>
);

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
function VisualizerSixControlsInternal({
  /* live */
  shapeMode,
  renderingMode,
  colorMode,
  paletteIndex,
  totalInst = 0,
  shapeCount = 0,
  bass,
  mid,
  treble,
  isPaused,
  /* setters */
  setShapeMode,
  setRenderingMode,
  setColorMode,
  setPaletteIdx,
  /* helpers */
  randShape,
  randAll,
  palettes,
}: VisualizerSixControlsProps) {
  const [collapsed, setCollapsed] = useState(false);

  const cyclePalette = () =>
    setPaletteIdx((paletteIndex + 1) % palettes.length);

  /* ––––– container classes ––––– */
  const container =
    "bottom-6 z-50 flex flex-col gap-4 p-5 rounded-2xl " +
    "border border-teal-500/30 bg-black/70 backdrop-blur-lg shadow-2xl " +
    "shadow-teal-500/25 text-teal-100";

  return (
    <div
      className={container}
      style={{ width: collapsed ? "4rem" : "17rem", fontFamily: "monospace" }}
    >
      {/* collapse / expand */}
      <button
        className="absolute top-2 right-3 text-teal-300 text-base select-none"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? "▸" : "▾"}
      </button>

      {/* ───────── expanded content ───────── */}
      {!collapsed && (
        <>
          {/* header */}
          <div className="text-sm font-extrabold text-teal-300 tracking-wider">
            VISUALIZER&nbsp;v6&nbsp;•&nbsp;PHYSICS
          </div>

          {/* SECTION 1 – dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="SHAPE"
              value={shapeMode}
              onChange={(v) => setShapeMode(v as ShapeMode6)}
              options={[
                "multi",
                "box",
                "sphere",
                "torus",
                "torusKnot",
                "cone",
                "pyramid",
                "tetra",
                "octa",
                "dodeca",
                "icosa",
                "ring",
                "spring",
              ]}
            />

            <Select
              label="RENDER"
              value={renderingMode}
              onChange={(v) => setRenderingMode(v as RenderingMode6)}
              options={[
                "solid",
                "wireframe",
                "transparent",
                "rainbow",
                "neon",
                "plasma",
              ]}
            />

            <Select
              label="COLOR"
              value={colorMode}
              onChange={(v) => setColorMode(v as ColorMode6)}
              options={[
                "default",
                "audioAmplitude",
                "frequencyBased",
                "paletteShift",
                "chaotic",
                "rhythmic",
                "popular",
              ]}
            />

            <Select
              label="PALETTE"
              value={paletteIndex.toString()}
              onChange={(v) => setPaletteIdx(parseInt(v, 10))}
              options={palettes.map((_, i) => i.toString())}
            />
          </div>

          {/* SECTION 2 – buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button className={btn} onClick={cyclePalette}>🎨 Palette</button>
            <button className={btn} onClick={randShape}>🔀 Shape</button>
            <button className={btn} onClick={randAll}>🎲 Random</button>
          </div>

          {/* SECTION 3 – stats */}
          <div className="pt-2 text-xs opacity-80 leading-tight">
            {totalInst.toLocaleString()} instances • {shapeCount} shape
            {shapeCount !== 1 && "s"}
          </div>

          {/* SECTION 4 – frequency bars */}
          <div className="mt-3 flex flex-col gap-0.5 text-xs text-fuchsia-100">
            <span className="font-semibold text-fuchsia-300">FREQUENCIES</span>
            <div className="flex justify-between">
              <span>BASS</span>
              <span className="text-red-400">{(bass * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>MID</span>
              <span className="text-yellow-400">{(mid * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>TREBLE</span>
              <span className="text-green-400">
                {(treble * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* footer */}
          <div className="pt-1 text-center text-[10px] text-teal-400/70">
            {isPaused ? "⏸ paused" : "🎵 playing"}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                           */
/* ------------------------------------------------------------------ */
export default VisualizerSixControlsInternal;
export { VisualizerSixControlsInternal as VisualizerSixControls };
