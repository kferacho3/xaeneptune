/* --------------------------------------------------------------------------
   src/components/visualizers/VisualizerThreeHelpers/VisualizerThreeControls.tsx
   Harmonised with v1/v2/v6 styling • minimisable
--------------------------------------------------------------------------- */
import { useState } from "react";
import { ColorPaletteName, EnvironmentMode, RenderingMode } from "./types";

interface Props {
  environmentMode: EnvironmentMode;
  setEnvironmentMode: (m: EnvironmentMode) => void;
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorPalette: ColorPaletteName;
  setColorPalette: (p: ColorPaletteName) => void;
  fftIntensity: number;
  setFftIntensity: (n: number) => void;
}

/* shared select class */
const select =
  "bg-black/70 border border-teal-500/40 px-2 py-1 rounded-md text-xs text-teal-100 " +
  "hover:border-teal-400 focus:border-teal-300 outline-none w-full max-h-36 overflow-y-auto";

export function VisualizerThreeControls({
  environmentMode,
  setEnvironmentMode,
  renderingMode,
  setRenderingMode,
  colorPalette,
  setColorPalette,
  fftIntensity,
  setFftIntensity,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="top-6  z-40 font-mono
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

      {/* expanded content */}
      {!collapsed && (
        <>
          <h3 className="text-sm font-bold text-teal-300 tracking-wider mb-4">
            ENVIRONMENT • SETTINGS
          </h3>

          {/* two-column grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Environment */}
            <label className="flex flex-col gap-1 text-xs col-span-2">
              <span className="font-semibold text-teal-200">Environment</span>
              <select
                value={environmentMode}
                onChange={(e) =>
                  setEnvironmentMode(e.target.value as EnvironmentMode)
                }
                className={select}
              >
                <option value="phantom">Disco Glaze</option>
                <option value="octagrams">Octagrams</option>
                <option value="raymarching">Raymarching</option>
                <option value="cycube">Cycube</option>
                <option value="disco">Phantom Star</option>
                <option value="golden">Golden Hell</option>
                <option value="undulating">Undulating Urchin</option>
                <option value="mandelbob">MandelBOB</option>
                <option value="plasma">Plasma Globe</option>
                <option value="crystal">Crystal Mind</option>
                <option value="truchet">Torus Truchet</option>
                <option value="structural">Structural Rounds</option>
                <option value="apollonian">Apollonian</option>
                <option value="binary">Binary Bits</option>
                <option value="solar">Solar Hollow</option>
                <option value="pastel">Pastel Cubes</option>
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

            {/* Palette */}
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-teal-200">Palette</span>
              <select
                value={colorPalette}
                onChange={(e) =>
                  setColorPalette(e.target.value as ColorPaletteName)
                }
                className={select}
              >
                {[
                  "default",
                  "sunset",
                  "ocean",
                  "forest",
                  "candy",
                  "pastel",
                  "neon",
                  "grayscale",
                  "blues",
                  "greens",
                  "reds",
                  "purples",
                  "yellows",
                  "oranges",
                  "browns",
                  "teals",
                  "magentas",
                  "lime",
                  "indigo",
                  "violet",
                  "coral",
                  "salmon",
                  "skyblue",
                  "goldenrod",
                  "chocolate",
                  "maroon",
                  "olive",
                  "cyan",
                  "beige",
                  "lavender",
                  "tan",
                  "mustard",
                  "plum",
                  "turquoise",
                  "skyblue_darker",
                ].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            {/* FFT Intensity (slider spans both columns) */}
            <label className="flex flex-col gap-1 text-xs col-span-2">
              <span className="font-semibold text-teal-200">
                FFT Intensity ({fftIntensity.toFixed(2)})
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={fftIntensity}
                onChange={(e) => setFftIntensity(+e.target.value)}
                className="w-full h-1 bg-teal-500/40 rounded appearance-none cursor-pointer"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
