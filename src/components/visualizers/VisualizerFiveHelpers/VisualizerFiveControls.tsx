"use client";

import { allSupershapeConfigs } from "@/config/supershapeConfigs";
import { useMemo, useState } from "react";
import { ColorMode, ParamUnion, RenderingMode } from "./types";

interface Props {
  configIndex: number;
  setConfigIndex: (i: number) => void;
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  params: ParamUnion;
}

const select =
  "bg-black/70 border border-teal-500/40 px-2 py-1 rounded-md text-xs text-teal-100 " +
  "hover:border-teal-400 focus:border-teal-300 outline-none w-full";

export function VisualizerFiveControls({
  configIndex,
  setConfigIndex,
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  params,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  /* friendly labels for dropdown */
  const options = useMemo(
    () =>
      allSupershapeConfigs.map(
        (cfg, idx) => (cfg as { name?: string }).name ?? `Config ${idx + 1}`
      ),
    []
  );

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
            SUPERSHAPE SETTINGS
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Supershape */}
            <label className="flex flex-col gap-1 text-xs col-span-2">
              <span className="font-semibold text-teal-200">Preset</span>
              <select
                value={configIndex}
                onChange={(e) => setConfigIndex(+e.target.value)}
                className={select}
              >
                {options.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
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
                <option value="wireframe">Wire-frame</option>
                <option value="rainbow">Rainbow</option>
                <option value="transparent">Transparent</option>
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

          {/* live params */}
          <div className="mt-4 max-h-32 overflow-y-auto text-[10px] leading-[14px]">
            <span className="font-semibold text-teal-200">Current Params</span>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
