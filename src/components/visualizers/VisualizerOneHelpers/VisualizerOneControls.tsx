import { useState } from "react";
import { ColorMode, PointMode, RenderingMode, ShapeMode } from "./types";

interface Props {
  isMobile: boolean;
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
  "bg-black/60 border border-teal-500/50 px-3 py-2 rounded-lg text-xs text-teal-100 " +
  "hover:border-teal-400 hover:bg-black/80 focus:border-teal-300 focus:bg-black/80 " +
  "outline-none w-full transition-all duration-200 cursor-pointer";

const labelClass = "flex flex-col gap-1 text-xs";
const labelTextClass = "font-semibold text-teal-200 uppercase tracking-wider text-[10px]";

export function VisualizerOneControls({
  isMobile,
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  shapeMode,
  setShapeMode,
  pointMode,
  setPointMode,
}: Props) {
  const [collapsed, setCollapsed] = useState(isMobile); // Start collapsed on mobile

  const containerWidth = isMobile ? (collapsed ? "4rem" : "100%") : (collapsed ? "5rem" : "20rem");
  const containerPadding = isMobile ? (collapsed ? "p-3" : "p-3") : (collapsed ? "p-4" : "p-4");

  return (
    <div
      className={`bottom-6 z-40 font-mono
                 ${collapsed ? 'flex items-center justify-center' : containerPadding}
                 ${collapsed ? '' : 'rounded-xl bg-black/85 backdrop-blur-xl shadow-2xl shadow-teal-500/40 text-teal-100'}
                 transition-all duration-300`}
      style={{ width: containerWidth }}
    >
      {/* minimiser */}
      <button
        className={`${collapsed ? 'flex items-center justify-center w-full h-full' : `absolute ${isMobile ? 'top-2 right-2' : 'top-3 right-3'}`}
                   text-teal-300 ${isMobile ? 'text-xl' : 'text-2xl'} select-none
                   hover:text-teal-200 transition-all duration-200
                   ${collapsed ? 'hover:scale-110 active:scale-95' : ''}`}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand Controls" : "Collapse Controls"}
      >
        <span className={`${collapsed ? 'animate-pulse' : ''}`}>
          {collapsed ? "⚙" : "✕"}
        </span>
      </button>

      {/* expanded content */}
      {!collapsed && (
        <>
          <div className="mb-3">
            <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-teal-300 tracking-wider mb-1`}>
              VISUALIZER v1.0
            </h3>
            <div className="h-px bg-gradient-to-r from-teal-500/50 to-transparent"></div>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            {/* Rendering */}
            <label className={labelClass}>
              <span className={labelTextClass}>Rendering</span>
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
            <label className={labelClass}>
              <span className={labelTextClass}>Color Mode</span>
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
            <label className={labelClass}>
              <span className={labelTextClass}>Shape</span>
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
            <label className={labelClass}>
              <span className={labelTextClass}>Point Style</span>
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
