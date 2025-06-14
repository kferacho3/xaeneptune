/* ---------------------------------------------------------------------
 *  Overlay UI controls for Supershape Visualizer (“Visualizer Five”)
 * ------------------------------------------------------------------ */
"use client";

import { allSupershapeConfigs } from "@/config/supershapeConfigs";
import { useMemo } from "react";
import { ColorMode, ParamUnion, RenderingMode } from "./types";

interface Props {
  /* basic render-state */
  configIndex: number;
  setConfigIndex: (i: number) => void;
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;

  /* read-only telemetry */
  params: ParamUnion;
}

export function VisualizerFiveControls({
  configIndex,
  setConfigIndex,
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  params,
}: Props) {
  /* friendly labels for the dropdown */
  const options = useMemo(
    () =>
      allSupershapeConfigs.map(
        (cfg, idx) => (cfg as { name?: string }).name ?? `Config ${idx + 1}`,
      ),
    [],
  );

  return (
    <div className="bg-neutral-900/70 backdrop-blur rounded-lg p-4 max-w-xs">
      {/* --- Supershape preset -------------------------------------- */}
      <div>
        <label>Supershape:&nbsp;</label>
        <select
          value={configIndex}
          onChange={e => setConfigIndex(Number(e.target.value))}
        >
          {options.map((label, idx) => (
            <option key={idx} value={idx}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* --- Rendering mode ---------------------------------------- */}
      <div style={{ marginTop: 6 }}>
        <label>Rendering:&nbsp;</label>
        <select
          value={renderingMode}
          onChange={e =>
            setRenderingMode(e.target.value as RenderingMode)
          }
        >
          <option value="solid">Solid</option>
          <option value="wireframe">Wire-frame</option>
          <option value="rainbow">Rainbow</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>

      {/* --- Colour mode ------------------------------------------- */}
      <div style={{ marginTop: 6 }}>
        <label>Colour:&nbsp;</label>
        <select
          value={colorMode}
          onChange={e => setColorMode(e.target.value as ColorMode)}
        >
          <option value="default">Default</option>
          <option value="audioAmplitude">Audio Amp</option>
          <option value="frequencyBased">Frequency</option>
          <option value="rainbow">Rainbow</option>
        </select>
      </div>

      {/* --- Live parameter read-out ------------------------------- */}
      <div
        style={{
          marginTop: 8,
          maxHeight: 120,
          overflowY: "auto",
          fontSize: 12,
        }}
      >
        <strong>Current Params:</strong>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    </div>
  );
}
