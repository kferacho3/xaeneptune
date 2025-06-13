/* ---------------------------------------------------------------------
 *  Overlay UI controls for the Harmonic Orrery (Visualizer Four)
 * ------------------------------------------------------------------ */
"use client";

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

export function VisualizerFourControls({
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  fftIntensity,
  setFftIntensity,
  randomPalette,
}: Props) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.6)",
          padding: "12px",
          borderRadius: "8px",
          color: "white",
          zIndex: 10,
          userSelect: "none",
        }}
      >
        {/* --- Rendering ------------------------------------------------ */}
        <div>
          <label>Rendering:&nbsp;</label>
          <select
            value={renderingMode}
            onChange={e =>
              setRenderingMode(
                e.target.value as RenderingMode,
              )
            }
          >
            <option value="solid">Solid</option>
            <option value="wireframe">Wire-frame</option>
            <option value="rainbow">Rainbow</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>

        {/* --- Colour --------------------------------------------------- */}
        <div style={{ marginTop: 6 }}>
          <label>Colour Mode:&nbsp;</label>
          <select
            value={colorMode}
            onChange={e =>
              setColorMode(e.target.value as ColorMode)
            }
          >
            <option value="default">Default</option>
            <option value="audioAmplitude">Audio Amp</option>
            <option value="frequencyBased">Frequency</option>
            <option value="rainbow">Rainbow</option>
          </select>
        </div>

        <button style={{ marginTop: 8 }} onClick={randomPalette}>
          Random Palette
        </button>

        {/* --- FFT Intensity slider ------------------------------------ */}
        <div style={{ marginTop: 10 }}>
          <label>FFT Intensity:&nbsp;</label>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={fftIntensity}
            onChange={e => setFftIntensity(parseFloat(e.target.value))}
          />
          <span style={{ marginLeft: 6 }}>{fftIntensity.toFixed(1)}</span>
        </div>
      </div>
    </>
  );
}
