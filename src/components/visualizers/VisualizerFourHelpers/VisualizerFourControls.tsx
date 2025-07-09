"use client";

import { useState } from "react";
import { ColorMode, RenderingMode } from "./types";

interface Props {
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  fftIntensity: number;
  setFftIntensity: (v: number) => void;
  randomPalette: () => void;
}

const select =
  "bg-black/70 border border-teal-500/40 px-2 py-1 rounded-md text-xs text-teal-100 " +
  "hover:border-teal-400 focus:border-teal-300 outline-none w-full";

const btn =
  "px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-teal-600 " +
  "hover:from-fuchsia-500 hover:to-teal-500 text-white text-xs font-bold " +
  "tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 " +
  "shadow-lg hover:shadow-teal-500/30";

export function VisualizerFourControls({
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  fftIntensity,
  setFftIntensity,
  randomPalette,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="relative font-mono p-6 w-[22rem] rounded-2xl border border-teal-500/30
                 bg-black/70 backdrop-blur-lg shadow-2xl shadow-teal-500/20 text-teal-100"
      style={{ width: collapsed ? "4rem" : "22rem" }}
    >
      {/* minimiser */}
      <button
        className="absolute top-2 right-3 text-teal-300 text-base select-none"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? "▸" : "▾"}
      </button>

      {!collapsed && (
        <>
          <h3 className="text-sm font-bold text-teal-300 tracking-wider mb-4">
            HARMONIC ORRERY
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Rendering */}
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-teal-200">Rendering</span>
              <select
                value={renderingMode}
                onChange={(e) =>
                  setRenderingMode(e.target.value as RenderingMode)
                }
                className={select}
              >
                <option value="solid">Solid</option>
                <option value="wireframe">Wire-frame</option>
                <option value="grayscale">Gray-scale</option>
                <option value="metallicRainbow">Metallic 🌈</option>
                <option value="nebula">Nebula</option>
                <option value="auroraCrystal">Aurora-Crystal</option>
              </select>
            </label>

            {/* Colour */}
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-teal-200">Colour Mode</span>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className={select}
              >
                <option value="default">Default</option>
                <option value="audioAmplitude">Audio Amp</option>
                <option value="frequencyBased">Frequency</option>
                <option value="rainbow">Rainbow</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2 mt-3">
            <button className={btn} onClick={randomPalette}>
              🎨 Random Palette
            </button>
          </div>

          {/* FFT slider */}
          <label className="flex flex-col gap-1 text-xs mt-4">
            <span className="font-semibold text-teal-200">
              FFT Intensity ({fftIntensity.toFixed(1)})
            </span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={fftIntensity}
              onChange={(e) => setFftIntensity(+e.target.value)}
              className="w-full h-1 bg-teal-500/40 rounded appearance-none cursor-pointer"
            />
          </label>
        </>
      )}
    </div>
  );
}
