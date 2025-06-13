import { ColorPaletteName, EnvironmentMode, RenderingMode } from "./types";

interface VisualizerThreeControlsProps {
  environmentMode: EnvironmentMode;
  setEnvironmentMode: (mode: EnvironmentMode) => void;
  renderingMode: RenderingMode;
  setRenderingMode: (mode: RenderingMode) => void;
  colorPalette: ColorPaletteName;
  setColorPalette: (palette: ColorPaletteName) => void;
  fftIntensity: number;
  setFftIntensity: (intensity: number) => void;
}

export function VisualizerThreeControls({
  environmentMode,
  setEnvironmentMode,
  renderingMode,
  setRenderingMode,
  colorPalette,
  setColorPalette,
  fftIntensity,
  setFftIntensity,
}: VisualizerThreeControlsProps) {
  return (
    <div className="bg-neutral-900/70 backdrop-blur rounded-lg p-4 max-w-xs">
      <h3 className="text-sm font-semibold text-neutral-300 mb-3">Visualizer Controls</h3>
      
      <div className="space-y-3">
        {/* Environment Mode */}
        <div className="space-y-1">
<label className="text-xs text-neutral-400">Environment</label>
<select
  value={environmentMode}
  onChange={(e) => setEnvironmentMode(e.target.value as EnvironmentMode)}
  className="w-full bg-neutral-800 text-white text-sm rounded px-2 py-1"
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

        </div>

        {/* Rendering Mode */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Render Mode</label>
          <select
            value={renderingMode}
            onChange={(e) => setRenderingMode(e.target.value as RenderingMode)}
            className="w-full bg-neutral-800 text-white text-sm rounded px-2 py-1"
          >
            <option value="solid">Solid</option>
            <option value="wireframe">Wireframe</option>
            <option value="rainbow">Rainbow</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>

        {/* Color Palette */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Color Palette</label>
          <select
            value={colorPalette}
            onChange={(e) => setColorPalette(e.target.value as ColorPaletteName)}
            className="w-full bg-neutral-800 text-white text-sm rounded px-2 py-1 max-h-32 overflow-y-auto"
          >
            <option value="default">Default</option>
            <option value="sunset">Sunset</option>
            <option value="ocean">Ocean</option>
            <option value="forest">Forest</option>
            <option value="candy">Candy</option>
            <option value="pastel">Pastel</option>
            <option value="neon">Neon</option>
            <option value="grayscale">Grayscale</option>
            <option value="blues">Blues</option>
            <option value="greens">Greens</option>
            <option value="reds">Reds</option>
            <option value="purples">Purples</option>
            <option value="yellows">Yellows</option>
            <option value="oranges">Oranges</option>
            <option value="browns">Browns</option>
            <option value="teals">Teals</option>
            <option value="magentas">Magentas</option>
            <option value="lime">Lime</option>
            <option value="indigo">Indigo</option>
            <option value="violet">Violet</option>
            <option value="coral">Coral</option>
            <option value="salmon">Salmon</option>
            <option value="skyblue">Sky Blue</option>
            <option value="goldenrod">Goldenrod</option>
            <option value="chocolate">Chocolate</option>
            <option value="maroon">Maroon</option>
            <option value="olive">Olive</option>
            <option value="cyan">Cyan</option>
            <option value="beige">Beige</option>
            <option value="lavender">Lavender</option>
            <option value="tan">Tan</option>
            <option value="mustard">Mustard</option>
            <option value="plum">Plum</option>
            <option value="turquoise">Turquoise</option>
            <option value="skyblue_darker">Sky Blue Darker</option>
          </select>
        </div>

        {/* FFT Intensity */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">
            FFT Intensity ({fftIntensity.toFixed(2)})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fftIntensity}
            onChange={(e) => setFftIntensity(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
}