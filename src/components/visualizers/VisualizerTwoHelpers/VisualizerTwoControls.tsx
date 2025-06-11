// src/components/visualizers/VisualizerTwoHelpers/VisualizerTwoControls.tsx
import { ColorMode, FractalType, RenderingMode } from "./types";

interface VisualizerTwoControlsProps {
  fractalType: FractalType;
  setFractalType: (type: FractalType) => void;
  renderingMode: RenderingMode;
  setRenderingMode: (mode: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

export function VisualizerTwoControls({
  fractalType,
  setFractalType,
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
}: VisualizerTwoControlsProps) {
  return (
    <div className="flex flex-col gap-3 bg-neutral-900/70 px-4 py-3 rounded-lg backdrop-blur
                  border border-neutral-800/50 shadow-lg min-w-[200px]">
      <h3 className="text-sm font-semibold text-neutral-200 border-b border-neutral-700 pb-2 mb-1">
        Fractal Settings
      </h3>
      
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-400">Fractal Type</label>
          <select
            value={fractalType}
            onChange={(e) => setFractalType(e.target.value as FractalType)}
            className="bg-neutral-800/70 text-neutral-200 text-xs px-2 py-1.5 rounded
                     border border-neutral-700 outline-none focus:border-brand
                     cursor-pointer hover:bg-neutral-700/70 transition-all duration-150"
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
            <option value="sierpinskiTetrahedron">Sierpinski Tetrahedron</option>
            <option value="buddhabrot">Buddhabrot</option>
            <option value="pythagorasTree3D">Pythagoras Tree 3D</option>
            <option value="apollonianGasket">Apollonian Gasket</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-400">Rendering Mode</label>
          <select
            value={renderingMode}
            onChange={(e) => setRenderingMode(e.target.value as RenderingMode)}
            className="bg-neutral-800/70 text-neutral-200 text-xs px-2 py-1.5 rounded
                     border border-neutral-700 outline-none focus:border-brand
                     cursor-pointer hover:bg-neutral-700/70 transition-all duration-150"
          >
            <option value="solid">Solid</option>
            <option value="wireframe">Wireframe</option>
            <option value="rainbow">Rainbow</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-400">Color Mode</label>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as ColorMode)}
            className="bg-neutral-800/70 text-neutral-200 text-xs px-2 py-1.5 rounded
                     border border-neutral-700 outline-none focus:border-brand
                     cursor-pointer hover:bg-neutral-700/70 transition-all duration-150"
          >
            <option value="default">Default</option>
            <option value="audioAmplitude">Audio Amplitude</option>
            <option value="frequencyBased">Frequency Based</option>
            <option value="rainbow">Rainbow</option>
          </select>
        </div>
      </div>
    </div>
  );
}