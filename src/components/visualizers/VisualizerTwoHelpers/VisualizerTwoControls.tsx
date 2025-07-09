import { useState } from "react";
import { ColorMode, FractalType, RenderingMode } from "./types";

interface Props {
  fractalType: FractalType;
  setFractalType: (t: FractalType) => void;
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
}

const select =
  "bg-black/70 border border-teal-500/40 px-2 py-1 rounded-md text-xs text-teal-100 " +
  "hover:border-teal-400 focus:border-teal-300 outline-none w-full";

export function VisualizerTwoControls({
  fractalType,
  setFractalType,
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="bottom-6  z-40 font-mono
                 p-6 w-[22rem] rounded-2xl border border-teal-500/30 bg-black/70
                 backdrop-blur-lg shadow-2xl shadow-teal-500/20 text-teal-100"
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
            FRACTAL SETTINGS
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Fractal */}
            <label className="flex flex-col gap-1 text-xs col-span-2">
              <span className="font-semibold text-teal-200">Fractal Type</span>
              <select
                value={fractalType}
                onChange={(e) => setFractalType(e.target.value as FractalType)}
                className={select}
              >
                <option value="mandelbulb">Mandelbulb</option>
                <option value="mandelbox">Mandelbox</option>
                <option value="mengerSponge">Menger Sponge</option>
                <option value="cantorDust">Cantor Dust</option>
                <option value="sierpinskiCarpet">Sierpinski Carpet</option>
                <option value="juliaSet">Julia Set</option>
                <option value="pythagorasTree">Pythagoras Tree</option>
                <option value="kochSnowflake">Koch Snowflake</option>
                <option value="nFlake">N-Flake</option>
                <option value="sierpinskiTetrahedron">
                  Sierpinski Tetrahedron
                </option>
                <option value="buddhabrot">Buddhabrot</option>
                <option value="pythagorasTree3D">Pythagoras Tree 3D</option>
                <option value="apollonianGasket">Apollonian Gasket</option>
              </select>
            </label>

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
                <option value="wireframe">Wireframe</option>
                <option value="rainbow">Rainbow</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>

            {/* Color */}
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-teal-200">Color Mode</span>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className={select}
              >
                <option value="default">Default</option>
                <option value="audioAmplitude">Audio Amplitude</option>
                <option value="frequencyBased">Frequency Based</option>
                <option value="rainbow">Rainbow</option>
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
