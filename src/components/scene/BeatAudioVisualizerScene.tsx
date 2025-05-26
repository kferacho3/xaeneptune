// src/components/scene/BeatAudioVisualizerScene.tsx
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

/* ---------- lazy-loaded visualizers ---------- */
const VisualizerOne   = dynamic(() => import("@/components/visualizers/VisualizerOne"),   { ssr: false });
const VisualizerTwo   = dynamic(() => import("@/components/visualizers/VisualizerTwo"),   { ssr: false });
const VisualizerThree = dynamic(() => import("@/components/visualizers/VisualizerThree"), { ssr: false });
const VisualizerFour  = dynamic(() => import("@/components/visualizers/VisualizerFour"),  { ssr: false });
const SupershapeVis   = dynamic(() => import("@/components/visualizers/SupershapeVisualizer"), { ssr: false });

/* ---------- props & types ---------- */
export type VisualizerType = "one" | "two" | "three" | "four" | "supershape";

export interface BeatAudioVisualizerSceneProps {
  audioUrl : string;
  onGoBack : () => void;
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
  onShuffle,
}: BeatAudioVisualizerSceneProps) {
  const [type,      setType    ] = useState<VisualizerType>("one");
  const [visKey,    setVisKey  ] = useState(0);
  const [audioUrl,  setAudioUrl] = useState(propAudioUrl);
  const [paused,    setPaused  ] = useState(false);
  const [uiHidden,  setUiHidden] = useState(false);

  /* now-playing info */
  const [title,  setTitle ] = useState<string>("Unknown Title");
  const [artist, setArtist] = useState<string>("Xaeneptune");
  const [cover,  setCover ] = useState<string>(randomCover());

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
/* ---------------- lifecycle ---------------- */
/* ---------------- lifecycle ---------------- */
useEffect(() => {
  // 1) stop whatever is playing
  pauseAllAudio();

  // 2) show the UI in “playing” state
  setPaused(false);

  // 3) push the new URL into state *and* force-remount the visualizer
  setAudioUrl(propAudioUrl);
  setVisKey(k => k + 1);          // <- key change triggers <audio>.play()

  // 4) derive meta for the “Now-Playing” card
  const file = propAudioUrl.split("/").pop() ?? "unknown";
  setTitle(prettify(decodeURIComponent(file)));   // <-- fix %20 etc.
  setArtist("Xaeneptune");
  setCover(randomCover());

  // pause again whenever this scene un-mounts
  return pauseAllAudio;
}, [propAudioUrl]);


  /* ---------------- helpers ---------------- */
  const prettify = (name: string) =>
    name.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "");

function loadNewAudio(url:string){
  pauseAllAudio();
  setPaused(false);        // ← force un-paused state
  setAudioUrl(url);
  setVisKey(k=>k+1);       // ← re-mount visualizer so .play() runs
  const filename=url.split("/").pop()||"";
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

  const VisComponent = {
    one:   VisualizerOne,
    two:   VisualizerTwo,
    three: VisualizerThree,
    four:  VisualizerFour,
    supershape: SupershapeVis,
  }[type] as React.ComponentType<{ audioUrl: string; isPaused: boolean }>;

  /* ---------------------------------------------------------------- render */
  return (
    <>
      <VisComponent key={visKey} audioUrl={audioUrl} isPaused={paused} />

      <Html fullscreen style={{ pointerEvents: "auto", zIndex: 9999 }}>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-6 select-none">

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
                  className={`btn-vis ${type === "one"        && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.one)}
                  onClick={() => switchVis("one")}
                >
                  <PerlinSphereIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "two"        && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.two)}
                  onClick={() => switchVis("two")}
                >
                  <FractalIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "three"      && "ring-2 ring-brand"}`}
                  onMouseEnter={() => setScreen(tex.three)}
                  onClick={() => switchVis("three")}
                >
                  <GridPatternIcon size={28} />
                </button>
                <button
                  className={`btn-vis ${type === "four"       && "ring-2 ring-brand"}`}
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
