 /* --------------------------------------------------------------------------ng it 5x closer than you did before
   src/components/BeatAudioVisualizerScene.tsx
--------------------------------------------------------------------------- */
"use client";

import { beatsData } from "@/data/beatData";
import { useMonitorStore } from "@/store/useMonitorStore";
import { pauseAllAudio } from "@/utils/pauseAllAudio";
import { Html } from "@react-three/drei";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
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

/* ---------- Controls panel ---------- */
import { BeatsVisualizerControls } from "./BeatsVisualizerControls";

/* ---------- lazy-loaded visualizers ---------- */
const VisualizerOne = dynamic(() => import("@/components/visualizers/VisualizerOne"), { ssr: false });

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
  const [visKey, setVisKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  const [renderingMode, setRenderingMode] = useState<RenderingMode>("wireframe");
  const [colorMode, setColorMode] = useState<ColorMode>("default");
  const [shapeMode, setShapeMode] = useState<ShapeMode>(getRandomShape());
  const [pointMode, setPointMode] = useState<PointMode>(getRandomPointMode());

  /* ---------- mobile detection ---------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ---------- monitor texture swap ---------- */
  const setScreen = useMonitorStore((s) => s.setScreenName);
  useEffect(() => {
    setScreen("antiheroesPerlinNoise");
  }, [setScreen]);

  /* ---------- beat shuffle helper ---------- */
  function shuffleBeat() {
    loadNewAudio(randomBeatUrl());
  }

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    if (!propAudioUrl) return undefined;
    pauseAllAudio();
    setPaused(false);
    setAudioUrl(propAudioUrl);
    setVisKey((k) => k + 1);
    const file = propAudioUrl.split("/").pop() ?? "unknown";
    setTitle(prettify(decodeURIComponent(file)));
    setArtist("Xaeneptune");
    setCover(randomCover());
    return pauseAllAudio;
  }, [propAudioUrl]);

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

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadNewAudio(URL.createObjectURL(file));
  }

  function handleGoBack() {
    pauseAllAudio();
    requestAnimationFrame(onGoBack);
  }

  /* ---------------------------------------------------------------- render */
  return (
    <>
      <VisualizerOne
        key={visKey}
        audioUrl={audioUrl}
        isPaused={paused}
        renderingMode={renderingMode}
        colorMode={colorMode}
        shapeMode={shapeMode}
        pointMode={pointMode}
      />

      {/* ------------------------------------------------------------------ */}
      {/*  Overlay (controls, now-playing card, buttons, hide/show toggle)  */}
      {/* ------------------------------------------------------------------ */}
      <Html fullscreen style={{ pointerEvents: "auto", zIndex: 9999 }}>
        <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-10 left-1/2 -translate-x-1/2'} flex ${isMobile ? 'flex-col' : 'items-end'} gap-2 select-none`}>
          {/* ---------- Visualizer Controls ---------- */}
          {!isMobile && (
            <BeatsVisualizerControls
              uiHidden={uiHidden}
              isMobile={isMobile}
              renderingMode={renderingMode} setRenderingMode={setRenderingMode}
              colorMode={colorMode} setColorMode={setColorMode}
              shapeMode={shapeMode} setShapeMode={setShapeMode}
              pointMode={pointMode} setPointMode={setPointMode}
            />
          )}

          {/* ──────────── Now-playing card ──────────── */}
          {!uiHidden && (
            <div className={`flex items-center ${isMobile ? 'w-full' : 'min-w-72'} gap-2 px-3 py-2
                            bg-black/70 backdrop-blur-lg rounded-xl
                            border border-teal-500/30 shadow-lg shadow-teal-500/20 font-mono`}>
              <img
                src={cover}
                alt="Album cover"
                className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-lg object-cover shadow-md shadow-black/40`}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-extrabold text-teal-300 tracking-wider leading-tight truncate`}>
                  {decodeURIComponent(title)
                    .replace(/(\+|%20)/g, " ")
                    .replace(/%/g, "")
                    .replace(/\s{2,}/g, " ")
                    .trim()}
                </span>
                <span className="text-xs text-teal-200 truncate">
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
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col'} gap-2 font-mono`}>
              {/* row 1 – action buttons */}
              <div className={`flex items-center justify-center gap-3 px-3 py-1 rounded-lg min-h-[32px] max-w-fit mx-auto
                              bg-black/70 backdrop-blur-lg
                              border border-teal-500/25 shadow-md shadow-teal-500/15`}>
                
                {/* Settings button - only on mobile, positioned to the left */}
                {isMobile && (
                  <div className="flex items-center gap-1">
                    <BeatsVisualizerControls
                      uiHidden={uiHidden}
                      isMobile={isMobile}
                      renderingMode={renderingMode} setRenderingMode={setRenderingMode}
                      colorMode={colorMode} setColorMode={setColorMode}
                      shapeMode={shapeMode} setShapeMode={setShapeMode}
                      pointMode={pointMode} setPointMode={setPointMode}
                    />
                    {/* Vertical separator line */}
                    <div className="h-4 w-px bg-teal-500/30"></div>
                  </div>
                )}

                <button
                  onClick={handleGoBack}
                  className="btn-main flex items-center gap-1
                             text-teal-300 hover:text-teal-200 transition-colors duration-200 p-2 rounded-md
                             hover:bg-teal-500/20 active:scale-95"
                  title="Go Back">
                  <FaMusic className="w-4 h-4" />
                  {!isMobile && <span className="text-xs font-medium">Beats</span>}
                </button>

                <button
                  onClick={shuffleBeat}
                  className="btn-main flex items-center gap-1
                             text-teal-300 hover:text-teal-200 transition-colors duration-200 p-2 rounded-md
                             hover:bg-teal-500/20 active:scale-95"
                  title="Shuffle">
                  <FaRandom className="w-4 h-4" />
                  {!isMobile && <span className="text-xs font-medium">Shuffle</span>}
                </button>

                <button
                  onClick={() => setPaused((p) => !p)}
                  className="btn-main flex items-center gap-1
                             text-teal-300 hover:text-teal-200 transition-colors duration-200 p-2 rounded-md
                             hover:bg-teal-500/20 active:scale-95"
                  title={paused ? "Resume" : "Pause"}>
                  {paused ? (
                    <FaPlay className="w-4 h-4" />
                  ) : (
                    <FaPause className="w-4 h-4" />
                  )}
                  {!isMobile && <span className="text-xs font-medium">{paused ? "Resume" : "Pause"}</span>}
                </button>

                <label
                  className="btn-main flex items-center gap-1 cursor-pointer
                             text-teal-300 hover:text-teal-200 transition-colors duration-200 p-2 rounded-md
                             hover:bg-teal-500/20 active:scale-95"
                  title="Upload">
                  <FaUpload className="w-4 h-4" />
                  {!isMobile && <span className="text-xs font-medium">Upload</span>}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          )}

          {/* ──────────── hide / show toggle ──────────── */}
          <button
            onClick={() => setUiHidden((h) => !h)}
            className={`${isMobile ? 'p-2' : 'p-1.5'} rounded-full bg-black/70 backdrop-blur-lg
                       border border-teal-500/25 text-teal-200
                       hover:bg-teal-600 hover:text-white hover:scale-105
                       transition-all shadow-md shadow-teal-500/15 ${isMobile ? 'self-center' : ''}`}>
            {uiHidden ? (
              <HiOutlineEye className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            ) : (
              <HiOutlineEyeSlash className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            )}
          </button>
        </div>
      </Html>
    </>
  );
}
