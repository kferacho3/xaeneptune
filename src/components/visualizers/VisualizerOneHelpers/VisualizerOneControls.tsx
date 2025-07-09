import { useState } from "react";
import { ColorMode, PointMode, RenderingMode, ShapeMode } from "./types";

interface Props {
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  shapeMode: ShapeMode;
  setShapeMode: (m: ShapeMode) => void;
  pointMode: PointMode;
  setPointMode: (m: PointMode) => void;
}

const select =
  "bg-black/70 border border-teal-500/40 px-2 py-1 rounded-md text-xs text-teal-100 " +
  "hover:border-teal-400 focus:border-teal-300 outline-none w-full";

export function VisualizerOneControls({
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  shapeMode,
  setShapeMode,
  pointMode,
  setPointMode,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="bottom-6 z-40 font-mono
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
            VISUALIZER&nbsp;v1.0&nbsp;•&nbsp;SETTINGS
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

            {/* Shape */}
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-teal-200">Shape</span>
              <select
                value={shapeMode}
                onChange={(e) => setShapeMode(e.target.value as ShapeMode)}
                className={select}
              >
                <option value="sphere">Sphere</option>
                <option value="cube">Cube</option>
                <option value="icosahedron">Icosahedron</option>
                <option value="tetrahedron">Tetrahedron</option>
                <option value="dodecahedron">Dodecahedron</option>
                <option value="octahedron">Octahedron</option>
                <option value="torus">Torus</option>
              </select>
            </label>

            {/* Point */}
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-teal-200">Point Style</span>
              <select
                value={pointMode}
                onChange={(e) => setPointMode(e.target.value as PointMode)}
                className={select}
              >
                <option value="points">Points</option>
                <option value="smallCubes">Small Cubes</option>
                <option value="crosses">Crosses</option>
                <option value="circles">Circles</option>
                <option value="diamonds">Diamonds</option>
                <option value="triangles">Triangles</option>
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
