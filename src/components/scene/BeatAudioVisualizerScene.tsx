"use client";

import {
  FractalIcon,
  GridPatternIcon,
  PerlinSphereIcon,
  PlanetMoonsIcon,
  SupershapeIcon,
} from "@/components/icons/VisualizerIcons";
import { TextureName, useMonitorStore } from "@/store/useMonitorStore";
import { pauseAllAudio } from "@/utils/pauseAllAudio";
import { Html } from "@react-three/drei";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

// Import VisualizerOne types
import {
  getRandomPointMode,
  getRandomShape
} from "@/components/visualizers/VisualizerOneHelpers/geometryHelpers";
import {
  ColorMode,
  PointMode,
  RenderingMode,
  ShapeMode
} from "@/components/visualizers/VisualizerOneHelpers/types";

// Import VisualizerTwo types
import {
  FractalType,
  ColorMode as V2ColorMode,
  RenderingMode as V2RenderingMode
} from "@/components/visualizers/VisualizerTwoHelpers/types";

// Import VisualizerThree types
import {
  ColorPaletteName,
  EnvironmentMode,
  RenderingMode as V3RenderingMode
} from "@/components/visualizers/VisualizerThreeHelpers/types";

// ---------- Visualizer-Four types ----------
import {
  ColorMode as V4ColorMode,
  RenderingMode as V4RenderingMode,
} from "@/components/visualizers/VisualizerFourHelpers/types";

import {
  ColorMode as V5ColorMode,
  ParamUnion as V5ParamUnion,
  RenderingMode as V5RenderingMode,
} from "@/components/visualizers/VisualizerFiveHelpers/types";
import { allSupershapeConfigs } from "@/config/supershapeConfigs";
// Import the controls component
import { BeatsVisualizerControls } from "./BeatsVisualizerControls";

/* ---------- lazy-loaded visualizers ---------- */
const VisualizerOne = dynamic(() => import("@/components/visualizers/VisualizerOne"), { ssr: false });
const VisualizerTwo = dynamic(() => import("@/components/visualizers/VisualizerTwo"), { ssr: false });
const VisualizerThree = dynamic(() => import("@/components/visualizers/VisualizerThree"), { ssr: false });
const VisualizerFour = dynamic(() => import("@/components/visualizers/VisualizerFour"), { ssr: false });
const SupershapeVis = dynamic(() => import("@/components/visualizers/SupershapeVisualizer"), { ssr: false });

/* ---------- props & types ---------- */
export type VisualizerType = "one" | "two" | "three" | "four" | "supershape";

export interface BeatAudioVisualizerSceneProps {
  audioUrl: string;
  onGoBack: () => void;
  onShuffle: () => void;
}

/* ---------- random cover helper ---------- */
const randomCover = () =>
  `https://xaeneptune.s3.us-east-2.amazonaws.com/beats/Beat+Album+Covers/xaeneptuneBeats${Math.floor(Math.random() * 100) + 1}.png`;

/* ---------------------------------------------------------------- */
export default function BeatAudioVisualizerScene({
  audioUrl: propAudioUrl,
  onGoBack,
  onShuffle,
}: BeatAudioVisualizerSceneProps) {
  const [type, setType] = useState<VisualizerType>("one");
  const [visKey, setVisKey] = useState(0);
  const [audioUrl, setAudioUrl] = useState(propAudioUrl);
  const [paused, setPaused] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);

  /* now-playing info */
  const [title, setTitle] = useState<string>("Unknown Title");
  const [artist, setArtist] = useState<string>("Xaeneptune");
  const [cover, setCover] = useState<string>(randomCover());

  /* VisualizerOne controls state */
  const [v1RenderingMode, setV1RenderingMode] = useState<RenderingMode>("wireframe");
  const [v1ColorMode, setV1ColorMode] = useState<ColorMode>("default");
  const [v1ShapeMode, setV1ShapeMode] = useState<ShapeMode>(getRandomShape());
  const [v1PointMode, setV1PointMode] = useState<PointMode>(getRandomPointMode());

  /* VisualizerTwo controls state */
  const [v2RenderingMode, setV2RenderingMode] = useState<V2RenderingMode>("solid");
  const [v2ColorMode, setV2ColorMode] = useState<V2ColorMode>("default");
  const [v2FractalType, setV2FractalType] = useState<FractalType>("mandelbox");

  /* VisualizerThree controls state */
  const [v3EnvironmentMode, setV3EnvironmentMode] = useState<EnvironmentMode>("phantom");
  const [v3RenderingMode, setV3RenderingMode] = useState<V3RenderingMode>("solid");
  const [v3ColorPalette, setV3ColorPalette] = useState<ColorPaletteName>("default");
  const [v3FftIntensity, setV3FftIntensity] = useState(0.2);

  /* Visualizer-Four controls state */
  const [v4RenderingMode, setV4RenderingMode] = useState<V4RenderingMode>("solid");
  const [v4ColorMode,     setV4ColorMode]     = useState<V4ColorMode>("default");
  const [v4FftIntensity,  setV4FftIntensity]  = useState(1.0);
  const v4RandomPalette   = () => setVisKey(k => k + 1);   // force re-mount to shuffle palette

  /* -------- Visualizer-Five (Supershape) controls state ---------- */
  const [v5ConfigIndex,     setV5ConfigIndex]     = useState(0);
  const [v5RenderingMode,   setV5RenderingMode]   = useState<V5RenderingMode>("transparent");
  const [v5ColorMode,       setV5ColorMode]       = useState<V5ColorMode>("default");
  // keep a copy so the control panel can show the live JSON read-out
const [v5Params, setV5Params] = useState<V5ParamUnion>(
  () => allSupershapeConfigs[0].params,
);
  /* monitor texture swap */
  const setScreen = useMonitorStore(s => s.setScreenName);
  const tex: Record<VisualizerType, TextureName> = {
    one: "antiheroesPerlinNoise",
    two: "antiheroesFractals",
    three: "antiheroesSand",
    four: "antiheroesCellular",
    supershape: "antiheroesSuperShape",
  };

  /* ---------------- lifecycle ---------------- */
useEffect(() => {
  setV5Params(allSupershapeConfigs[v5ConfigIndex].params);
    // 1) stop whatever is playing
    pauseAllAudio();

    // 2) show the UI in "playing" state
    setPaused(false);

    // 3) push the new URL into state *and* force-remount the visualizer
    setAudioUrl(propAudioUrl);
    setVisKey(k => k + 1);          // <- key change triggers <audio>.play()

    // 4) derive meta for the "Now-Playing" card
    const file = propAudioUrl.split("/").pop() ?? "unknown";
    setTitle(prettify(decodeURIComponent(file)));   // <-- fix %20 etc.
    setArtist("Xaeneptune");
    setCover(randomCover());

    // pause again whenever this scene un-mounts
    return pauseAllAudio;
  }, [propAudioUrl, v5ConfigIndex]);

  /* ---------------- helpers ---------------- */
  const prettify = (name: string) =>
    name.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "");

  function loadNewAudio(url: string) {
    pauseAllAudio();
    setPaused(false); // ← force un-paused state
    setAudioUrl(url);
    setVisKey(k => k + 1); // ← re-mount visualizer so .play() runs
    const filename = url.split("/").pop() || "";
    setTitle(prettify(filename));
    setArtist("Xaeneptune");
    setCover(randomCover());
  }

  const resetAudio = () =>
    loadNewAudio(`${audioUrl.split("?")[0]}?t=${Date.now()}`);

  function switchVis(v: VisualizerType) {
    setType(v);
    setVisKey(k => k + 1);
    resetAudio();
    setScreen(tex[v]);
  }

  function randomVis() {
    const pool: VisualizerType[] = ["one", "two", "three", "four", "supershape"];
    switchVis(pool[Math.floor(Math.random() * pool.length)]);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      loadNewAudio(url);
    }
  }

  function handleGoBack() {
    pauseAllAudio();
    requestAnimationFrame(onGoBack);
  }
type AnyRenderingMode = RenderingMode | V2RenderingMode | V3RenderingMode | V4RenderingMode;
type AnyColorMode     = ColorMode     | V2ColorMode     | V4ColorMode;
const VisComponent = {
  one: VisualizerOne,
  two: VisualizerTwo,
  three: VisualizerThree,
  four: VisualizerFour,
  supershape: SupershapeVis,
}[type] as React.ComponentType<{
  audioUrl: string;
  isPaused: boolean;
  renderingMode?: AnyRenderingMode;
  colorMode?: AnyColorMode;
  shapeMode?: ShapeMode;
  pointMode?: PointMode;
  fractalType?: FractalType;
  environmentMode?: EnvironmentMode;
  colorPalette?: ColorPaletteName; // still needed by V3
  fftIntensity?: number;
}>;

  /* ---------------------------------------------------------------- render */
  return (
    <>
    
      <VisComponent
        key={visKey}
        audioUrl={audioUrl}
        isPaused={paused}
        {...(type === "one" && {
          renderingMode: v1RenderingMode,
          colorMode: v1ColorMode,
          shapeMode: v1ShapeMode,
          pointMode: v1PointMode,
        })}
        {...(type === "two" && {
          renderingMode: v2RenderingMode,
          colorMode: v2ColorMode,
          fractalType: v2FractalType,
        })}
        {...(type === "three" && {
          environmentMode: v3EnvironmentMode,
          renderingMode: v3RenderingMode,
          colorPalette: v3ColorPalette,
          fftIntensity: v3FftIntensity,
        })}
        {...(type === "four" && {
          renderingMode: v4RenderingMode,
          colorMode:     v4ColorMode,      // <- this was missing
          fftIntensity:  v4FftIntensity,
        })}
   {...(type === "supershape" && {
          configIndex:   v5ConfigIndex,
          renderingMode: v5RenderingMode,
          colorMode:     v5ColorMode,
        })}

      />

      <Html fullscreen style={{ pointerEvents: "auto", zIndex: 9999 }}>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-6 select-none">
          
          {/* Visualizer Controls - Far left */}
          <BeatsVisualizerControls
            type={type}
            uiHidden={uiHidden}
            v1RenderingMode={v1RenderingMode}
            setV1RenderingMode={setV1RenderingMode}
            v1ColorMode={v1ColorMode}
            setV1ColorMode={setV1ColorMode}
            v1ShapeMode={v1ShapeMode}
            setV1ShapeMode={setV1ShapeMode}
            v1PointMode={v1PointMode}
            setV1PointMode={setV1PointMode}
            v2RenderingMode={v2RenderingMode}
            setV2RenderingMode={setV2RenderingMode}
            v2ColorMode={v2ColorMode}
            setV2ColorMode={setV2ColorMode}
            v2FractalType={v2FractalType}
            setV2FractalType={setV2FractalType}
            v3EnvironmentMode={v3EnvironmentMode}
            setV3EnvironmentMode={setV3EnvironmentMode}
            v3RenderingMode={v3RenderingMode}
            setV3RenderingMode={setV3RenderingMode}
            v3ColorPalette={v3ColorPalette}
            setV3ColorPalette={setV3ColorPalette}
            v3FftIntensity={v3FftIntensity}
            setV3FftIntensity={setV3FftIntensity}
            v4RenderingMode={v4RenderingMode}
            setV4RenderingMode={setV4RenderingMode}
            v4ColorMode={v4ColorMode}
            setV4ColorMode={setV4ColorMode}
            v4FftIntensity={v4FftIntensity}
            setV4FftIntensity={setV4FftIntensity}
            v4RandomPalette={v4RandomPalette}
                      /* ------- new Supershape props ------- */
            v5ConfigIndex={v5ConfigIndex}
            setV5ConfigIndex={setV5ConfigIndex}
            v5RenderingMode={v5RenderingMode}
            setV5RenderingMode={setV5RenderingMode}
            v5ColorMode={v5ColorMode}
            setV5ColorMode={setV5ColorMode}
            v5Params={v5Params}
          />

          {/* Now-playing card */}
          {!uiHidden && (
            <div className="flex items-center min-w-72 gap-3 px-4 py-2 bg-neutral-900/70 backdrop-blur rounded-lg">
              <img
                src={cover}
                alt="Album cover"
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs text-neutral-400">{artist}</span>
              </div>
            </div>
          )}

          {/* main UI cluster */}
          {!uiHidden && (
            <div className="flex flex-col gap-3">

              {/* row 1 – text buttons */}
                           <div className="flex gap-3 bg-neutral-900/70 px-4 py-2 rounded-full backdrop-blur">
                <button onClick={handleGoBack} className="btn-main">
                  Go Back
                </button>
                <button onClick={onShuffle} className="btn-main">
                  Shuffle Beat
                </button>
                <button
                  onClick={() => setPaused(p => !p)}
                  className="btn-main"
                >
                  {paused ? "Resume" : "Pause"}
                </button>
                <label className="btn-main cursor-pointer">
                  Upload
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* row 2 – icon buttons */}
              <div className="flex gap-4 bg-neutral-900/70 px-4 py-2 rounded-full backdrop-blur">
                <button
                  className={`btn-vis ${type === "one" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.one)}
                  onClick={() => switchVis("one")}
                >
                  <PerlinSphereIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "two" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.two)}
                  onClick={() => switchVis("two")}
                >
                  <FractalIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "three" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.three)}
                  onClick={() => switchVis("three")}
                >
                  <GridPatternIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "four" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.four)}
                  onClick={() => switchVis("four")}
                >
                  <PlanetMoonsIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "supershape" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.supershape)}
                  onClick={() => switchVis("supershape")}
                >
                  <SupershapeIcon size={28} />
                </button>
                <button onClick={randomVis} className="btn-main">
                  Random Vis
                </button>
              </div>
            </div>
          )}

          {/* hide / show toggle */}
          <button
            onClick={() => setUiHidden(h => !h)}
            className="bg-neutral-800/70 backdrop-blur rounded-full p-2 text-neutral-200
                     hover:bg-brand hover:scale-105 transition-all"
          >
            {uiHidden
              ? <HiOutlineEye className="w-6 h-6" />
              : <HiOutlineEyeSlash className="w-6 h-6" />
            }
          </button>
        </div>
      </Html>
    </>
  );
}