/* --------------------------------------------------------------------------
   src/components/BeatAudioVisualizerScene.tsx
--------------------------------------------------------------------------- */
"use client";

import {
  FractalIcon,
  GridPatternIcon,
  PerlinSphereIcon,
  PlanetMoonsIcon,
  SupershapeIcon,
} from "@/components/icons/VisualizerIcons";
import {
  ColorMode6,
  POPULAR_PALETTES,
  RenderingMode6,
  ShapeMode6,
} from "@/components/visualizers/VisualizerSix";
import { beatsData } from "@/data/beatData";
import { TextureName, useMonitorStore } from "@/store/useMonitorStore";
import { pauseAllAudio } from "@/utils/pauseAllAudio";
import { Html } from "@react-three/drei";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { FaShapes } from "react-icons/fa";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
/* ─────────────────────── 1. Imports ─────────────────────────────── */
import {
  FaMusic,
  FaPause,
  FaPlay,
  FaRandom,
  FaUpload,
} from "react-icons/fa";

/* ---------- Visualizer-One helpers ---------- */
import {
  getRandomPointMode,
  getRandomShape,
} from "@/components/visualizers/VisualizerOneHelpers/geometryHelpers";
import {
  ColorMode,
  PointMode,
  RenderingMode,
  ShapeMode,
} from "@/components/visualizers/VisualizerOneHelpers/types";

/* ---------- Visualizer-Two types ---------- */
import {
  FractalType,
  ColorMode as V2ColorMode,
  RenderingMode as V2RenderingMode,
} from "@/components/visualizers/VisualizerTwoHelpers/types";

/* ---------- Visualizer-Three types ---------- */
import {
  ColorPaletteName,
  EnvironmentMode,
  RenderingMode as V3RenderingMode,
} from "@/components/visualizers/VisualizerThreeHelpers/types";

/* ---------- Visualizer-Four types ---------- */
import {
  ColorMode as V4ColorMode,
  RenderingMode as V4RenderingMode,
} from "@/components/visualizers/VisualizerFourHelpers/types";

/* ---------- Visualizer-Five (Supershape) types ---------- */
import {
  ColorMode as V5ColorMode,
  ParamUnion as V5ParamUnion,
  RenderingMode as V5RenderingMode,
} from "@/components/visualizers/VisualizerFiveHelpers/types";
import { allSupershapeConfigs } from "@/config/supershapeConfigs";

/* ---------- Controls panel ---------- */
import { BeatsVisualizerControls } from "./BeatsVisualizerControls";

/* ---------- lazy-loaded visualizers ---------- */
const VisualizerOne   = dynamic(() => import("@/components/visualizers/VisualizerOne"),   { ssr: false });
const VisualizerTwo   = dynamic(() => import("@/components/visualizers/VisualizerTwo"),   { ssr: false });
const VisualizerThree = dynamic(() => import("@/components/visualizers/VisualizerThree"), { ssr: false });
const VisualizerFour  = dynamic(() => import("@/components/visualizers/VisualizerFour"),  { ssr: false });
const SupershapeVis   = dynamic(() => import("@/components/visualizers/SupershapeVisualizer"), { ssr: false });
const VisualizerSix   = dynamic(() => import("@/components/visualizers/VisualizerSix"),   { ssr: false });

/* ---------- props & types ---------- */
export type VisualizerType =
  | "one"
  | "two"
  | "three"
  | "four"
  | "supershape"
  | "six";

export interface BeatAudioVisualizerSceneProps {
  audioUrl: string;
  onGoBack: () => void;
  onShuffle: () => void;
}

/* ---------- random cover helper ---------- */
const randomCover = () =>
  `https://xaeneptune.s3.us-east-2.amazonaws.com/beats/Beat+Album+Covers/xaeneptuneBeats${
    Math.floor(Math.random() * 100) + 1
  }.png`;

/* ---------------------------------------------------------------- */
export default function BeatAudioVisualizerScene({
  audioUrl: propAudioUrl,
  onGoBack,
}: BeatAudioVisualizerSceneProps) {
  /* ---------- local state ---------- */
  const [type, setType] = useState<VisualizerType>("one");
  const [visKey, setVisKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);

  const randomBeatUrl = () =>
    beatsData[Math.floor(Math.random() * beatsData.length)].audioFile;
  const [audioUrl, setAudioUrl] = useState(
    () => propAudioUrl || randomBeatUrl()
  );

  /* now-playing info */
  const [title, setTitle] = useState<string>("Unknown Title");
  const [artist, setArtist] = useState<string>("Xaeneptune");
  const [cover, setCover] = useState<string>(randomCover());

  /* ---------- Visualizer-One controls ---------- */
  const [v1RenderingMode, setV1RenderingMode] = useState<RenderingMode>("wireframe");
  const [v1ColorMode, setV1ColorMode] = useState<ColorMode>("default");
  const [v1ShapeMode, setV1ShapeMode] = useState<ShapeMode>(getRandomShape());
  const [v1PointMode, setV1PointMode] = useState<PointMode>(getRandomPointMode());

  /* ---------- Visualizer-Two controls ---------- */
  const [v2RenderingMode, setV2RenderingMode] = useState<V2RenderingMode>("solid");
  const [v2ColorMode, setV2ColorMode] = useState<V2ColorMode>("default");
  const [v2FractalType, setV2FractalType] = useState<FractalType>("mandelbox");

  /* ---------- Visualizer-Three controls ---------- */
  const [v3EnvironmentMode, setV3EnvironmentMode] = useState<EnvironmentMode>("phantom");
  const [v3RenderingMode, setV3RenderingMode] = useState<V3RenderingMode>("solid");
  const [v3ColorPalette, setV3ColorPalette] = useState<ColorPaletteName>("default");
  const [v3FftIntensity, setV3FftIntensity] = useState(0.2);

  /* ---------- Visualizer-Four controls ---------- */
  const [v4RenderingMode, setV4RenderingMode] = useState<V4RenderingMode>("solid");
  const [v4ColorMode, setV4ColorMode] = useState<V4ColorMode>("default");
  const [v4FftIntensity, setV4FftIntensity] = useState(1.0);
  const v4RandomPalette = () => setVisKey((k) => k + 1);

  /* ---------- Visualizer-Five (Supershape) controls ---------- */
  const [v5ConfigIndex, setV5ConfigIndex] = useState(0);
  const [v5RenderingMode, setV5RenderingMode] = useState<V5RenderingMode>("transparent");
  const [v5ColorMode, setV5ColorMode] = useState<V5ColorMode>("default");
  const [v5Params, setV5Params] = useState<V5ParamUnion>(
    () => allSupershapeConfigs[0].params
  );


  
  /* ---------- Visualizer-Six (Physics) controls ---------- */
  const [v6RenderingMode, setV6RenderingMode] = useState<RenderingMode6>("solid");
  const [v6ColorMode, setV6ColorMode] = useState<ColorMode6>("default");
  const [v6ShapeMode, setV6ShapeMode] = useState<ShapeMode6>("multi");
  const [v6PaletteIndex, setV6PaletteIndex] = useState(0);

  /* live telemetry (place-holders) */
  const [v6TotalInst] = useState(0);
  const [v6ShapeCount] = useState(0);
  const [v6Bass] = useState(0);
  const [v6Mid] = useState(0);
  const [v6Treble] = useState(0);

/* ---------- Visualizer-Six helper fns & palettes ---------- */
const SHAPES6: ShapeMode6[] = [
  "box","sphere","torus","torusKnot","cone","pyramid",
  "tetra","octa","dodeca","icosa","ring","spring",
];

/* pick a random item */
const pick = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

/* single random shape (never "multi") */
const v6RandShape = () => setV6ShapeMode(pick(SHAPES6));

/* full randomiser — every dropdown gets a random value */
const v6RandAll = () => {
  setV6ShapeMode   (pick(["multi", ...SHAPES6]));
  setV6RenderingMode(pick(["solid","wireframe","transparent","rainbow","neon","plasma"]));
  setV6ColorMode     (pick(["default","audioAmplitude","frequencyBased","paletteShift","chaotic","rhythmic","popular"]));
  setV6PaletteIndex((i) => (i + 1) % POPULAR_PALETTES.length);   // simple next-palette
};

/* little convenience palette list for the controls */
const v6Palettes = POPULAR_PALETTES;

  /* ---------- monitor texture swap ---------- */
  const setScreen = useMonitorStore((s) => s.setScreenName);
  const tex: Record<VisualizerType, TextureName> = {
    one: "antiheroesPerlinNoise",
    two: "antiheroesFractals",
    three: "antiheroesSand",
    four: "antiheroesCellular",
    supershape: "antiheroesSuperShape",
    six: "antiheroesPerlinNoise",
  };

  /* ---------- beat shuffle helper ---------- */
  function shuffleBeat() {
    loadNewAudio(randomBeatUrl());
  }

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    setV5Params(allSupershapeConfigs[v5ConfigIndex].params);
    pauseAllAudio();
    setPaused(false);
    setAudioUrl(propAudioUrl);
    setVisKey((k) => k + 1);
    const file = propAudioUrl.split("/").pop() ?? "unknown";
    setTitle(prettify(decodeURIComponent(file)));
    setArtist("Xaeneptune");
    setCover(randomCover());
    return pauseAllAudio;
  }, [propAudioUrl, v5ConfigIndex]);

  /* ---------- helpers ---------- */
  const prettify = (name: string) =>
    name.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "");

  function loadNewAudio(url: string) {
    pauseAllAudio();
    setPaused(false);
    setAudioUrl(url);
    setVisKey((k) => k + 1);
    const filename = url.split("/").pop() || "";
    setTitle(prettify(filename));
    setArtist("Xaeneptune");
    setCover(randomCover());
  }

  const resetAudio = () =>
    loadNewAudio(`${audioUrl.split("?")[0]}?t=${Date.now()}`);

  function switchVis(v: VisualizerType) {
    setType(v);
    setVisKey((k) => k + 1);
    resetAudio();
    setScreen(tex[v]);
  }

  function randomVis() {
    const pool: VisualizerType[] = ["one", "two", "three", "four", "supershape", "six"];
    switchVis(pool[Math.floor(Math.random() * pool.length)]);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadNewAudio(URL.createObjectURL(file));
  }

  function handleGoBack() {
    pauseAllAudio();
    requestAnimationFrame(onGoBack);
  }

  /* ---------- prop unions WITH V6 ADDED ---------- */
  type AnyRenderingMode =
    | RenderingMode
    | V2RenderingMode
    | V3RenderingMode
    | V4RenderingMode
    | RenderingMode6;

  type AnyColorMode =
    | ColorMode
    | V2ColorMode
    | V4ColorMode
    | ColorMode6;

  type AnyShapeMode = ShapeMode | ShapeMode6;

  /* ---------- component map ---------- */
  const VisComponent = {
    one: VisualizerOne,
    two: VisualizerTwo,
    three: VisualizerThree,
    four: VisualizerFour,
    supershape: SupershapeVis,
    six: VisualizerSix,
  }[type] as React.ComponentType<{
    audioUrl: string;
    isPaused: boolean;
    renderingMode?: AnyRenderingMode;
    colorMode?: AnyColorMode;
    shapeMode?: AnyShapeMode;
    pointMode?: PointMode;
    fractalType?: FractalType;
    environmentMode?: EnvironmentMode;
    colorPalette?: ColorPaletteName;
    fftIntensity?: number;
    paletteIndex?: number;
    setPaletteIdx?: (i: number | ((n: number) => number)) => void;
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
          colorMode: v4ColorMode,
          fftIntensity: v4FftIntensity,
        })}
        {...(type === "supershape" && {
          configIndex: v5ConfigIndex,
          renderingMode: v5RenderingMode,
          colorMode: v5ColorMode,
        })}
        {...(type === "six" && {
          renderingMode: v6RenderingMode,
          colorMode: v6ColorMode,
          shapeMode: v6ShapeMode,
          paletteIndex: v6PaletteIndex,
          setPaletteIdx: setV6PaletteIndex,
        })}
      />

      {/* ------------------------------------------------------------------ */}
      {/*  Overlay (controls, now-playing card, buttons, hide/show toggle)  */}
      {/* ------------------------------------------------------------------ */}
      <Html fullscreen style={{ pointerEvents: "auto", zIndex: 9999 }}>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-6 select-none">
          {/* ---------- Visualizer Controls ---------- */}
          <BeatsVisualizerControls
            type={type}
            uiHidden={uiHidden}
            /* v1 */ v1RenderingMode={v1RenderingMode} setV1RenderingMode={setV1RenderingMode}
            v1ColorMode={v1ColorMode}                 setV1ColorMode={setV1ColorMode}
            v1ShapeMode={v1ShapeMode}                 setV1ShapeMode={setV1ShapeMode}
            v1PointMode={v1PointMode}                 setV1PointMode={setV1PointMode}
            /* v2 */ v2RenderingMode={v2RenderingMode} setV2RenderingMode={setV2RenderingMode}
            v2ColorMode={v2ColorMode}                 setV2ColorMode={setV2ColorMode}
            v2FractalType={v2FractalType}             setV2FractalType={setV2FractalType}
            /* v3 */ v3EnvironmentMode={v3EnvironmentMode} setV3EnvironmentMode={setV3EnvironmentMode}
            v3RenderingMode={v3RenderingMode}         setV3RenderingMode={setV3RenderingMode}
            v3ColorPalette={v3ColorPalette}           setV3ColorPalette={setV3ColorPalette}
            v3FftIntensity={v3FftIntensity}           setV3FftIntensity={setV3FftIntensity}
            /* v4 */ v4RenderingMode={v4RenderingMode} setV4RenderingMode={setV4RenderingMode}
            v4ColorMode={v4ColorMode}                 setV4ColorMode={setV4ColorMode}
            v4FftIntensity={v4FftIntensity}           setV4FftIntensity={setV4FftIntensity}
            v4RandomPalette={v4RandomPalette}
            /* v5 */ v5ConfigIndex={v5ConfigIndex}     setV5ConfigIndex={setV5ConfigIndex}
            v5RenderingMode={v5RenderingMode}         setV5RenderingMode={setV5RenderingMode}
            v5ColorMode={v5ColorMode}                 setV5ColorMode={setV5ColorMode}
            v5Params={v5Params}
            /* v6 */ v6RenderingMode={v6RenderingMode} setV6RenderingMode={setV6RenderingMode}
            v6ColorMode={v6ColorMode}                 setV6ColorMode={setV6ColorMode}
            v6ShapeMode={v6ShapeMode}                 setV6ShapeMode={setV6ShapeMode}
            v6PaletteIndex={v6PaletteIndex}           setV6PaletteIndex={setV6PaletteIndex}
            v6TotalInst={v6TotalInst}                 v6ShapeCount={v6ShapeCount}
            v6Bass={v6Bass}                           v6Mid={v6Mid}     v6Treble={v6Treble}
            v6IsPaused={paused}                       v6RandShape={v6RandShape}
            v6RandAll={v6RandAll}                     v6Palettes={v6Palettes}
          />

          {/* ──────────── Now-playing card ──────────── */}
          {!uiHidden && (
            <div className="flex items-center min-w-72 gap-3 px-4 py-3
                            bg-black/70 backdrop-blur-lg rounded-2xl
                            border border-teal-500/30 shadow-lg shadow-teal-500/20 font-mono">
              <img
                src={cover}
                alt="Album cover"
                className="h-14 w-14 rounded-lg object-cover shadow-md shadow-black/40"
              />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-teal-300 tracking-wider leading-tight">
                  {decodeURIComponent(title)
                    .replace(/(\+|%20)/g, " ")
                    .replace(/%/g, "")
                    .replace(/\s{2,}/g, " ")
                    .trim()}
                </span>
                <span className="text-xs text-teal-200">
                  {decodeURIComponent(artist)
                    .replace(/(\+|%20)/g, " ")
                    .replace(/%/g, "")
                    .trim()}
                </span>
              </div>
            </div>
          )}

          {/* ──────────── main UI cluster ──────────── */}
          {!uiHidden && (
            <div className="flex flex-col gap-3 font-mono">
              {/* row 1 – action buttons */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl min-h-[44px]
                              bg-black/70 backdrop-blur-lg
                              border border-teal-500/25 shadow-md shadow-teal-500/15">

                <button
                  onClick={handleGoBack}
                  className="btn-main flex items-center gap-1
                             text-teal-300 text-sm font-extrabold tracking-wider">
                  <FaMusic className="w-4 h-4" />
                  <span>Beats</span>
                </button>

                <button
                  onClick={shuffleBeat}
                  className="btn-main flex items-center gap-1
                             text-teal-300 text-sm font-extrabold tracking-wider">
                  <FaRandom className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>

                <button
                  onClick={() => setPaused((p) => !p)}
                  className="btn-main flex items-center gap-1
                             text-teal-300 text-sm font-extrabold tracking-wider">
                  {paused ? (
                    <>
                      <FaPlay className="w-4 h-4" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <FaPause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <label
                  className="btn-main flex items-center gap-1 cursor-pointer
                             text-teal-300 text-sm font-extrabold tracking-wider">
                  <FaUpload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* row 2 – visualizer selector buttons */}
              <div className="flex items-center gap-4 px-4 py-2 rounded-2xl min-h-[44px]
                              bg-black/70 backdrop-blur-lg
                              border border-teal-500/25 shadow-md shadow-teal-500/15">

                <button
                  className={`btn-vis ${type === "one" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.one)}
                  onClick={() => switchVis("one")}>
                  <PerlinSphereIcon size={28} />
                  <span className="sr-only">V1</span>
                </button>

                <button
                  className={`btn-vis ${type === "two" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.two)}
                  onClick={() => switchVis("two")}>
                  <FractalIcon size={28} />
                  <span className="sr-only">V2</span>
                </button>

                <button
                  className={`btn-vis ${type === "three" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.three)}
                  onClick={() => switchVis("three")}>
                  <GridPatternIcon size={28} />
                  <span className="sr-only">V3</span>
                </button>

                <button
                  className={`btn-vis ${type === "four" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.four)}
                  onClick={() => switchVis("four")}>
                  <PlanetMoonsIcon size={28} />
                  <span className="sr-only">V4</span>
                </button>

                <button
                  className={`btn-vis ${type === "supershape" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.supershape)}
                  onClick={() => switchVis("supershape")}>
                  <SupershapeIcon size={28} />
                  <span className="sr-only">V5</span>
                </button>

                <button
                  className={`btn-vis ${type === "six" && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.six)}
                  onClick={() => switchVis("six")}>
                  <FaShapes size={28} />
                  <span className="sr-only">V6</span>
                </button>

                {/* Random visualizer */}
                <button
                  onClick={randomVis}
                  className="btn-main flex items-center gap-1 whitespace-nowrap
                             text-teal-300 text-sm font-extrabold tracking-wider">
                  <FaRandom className="w-4 h-4" />
                  <span>Random Vis</span>
                </button>
              </div>
            </div>
          )}

          {/* ──────────── hide / show toggle ──────────── */}
          <button
            onClick={() => setUiHidden((h) => !h)}
            className="p-2 rounded-full bg-black/70 backdrop-blur-lg
                       border border-teal-500/25 text-teal-200
                       hover:bg-teal-600 hover:text-white hover:scale-105
                       transition-all shadow-md shadow-teal-500/15">
            {uiHidden ? (
              <HiOutlineEye className="w-6 h-6" />
            ) : (
              <HiOutlineEyeSlash className="w-6 h-6" />
            )}
          </button>
        </div>
      </Html>
    </>
  );
}
