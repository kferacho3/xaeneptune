"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { Html } from "@react-three/drei";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*   Helper so **only one** <audio> can ever play at a time            */
/* ------------------------------------------------------------------ */
const pauseAllAudio = () => {
  const els = Array.from(document.getElementsByTagName("audio"));
  els.forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
};

/* ---------------- dynamic visualisers ---------------- */
const VisualizerOne = dynamic(() => import("@/components/visualizers/VisualizerOne"), { ssr: false });
const VisualizerTwo = dynamic(() => import("@/components/visualizers/VisualizerTwo"), { ssr: false });
const VisualizerThree = dynamic(() => import("@/components/visualizers/VisualizerThree"), { ssr: false });
const VisualizerFour = dynamic(() => import("@/components/visualizers/VisualizerFour"), { ssr: false });
const SupershapeVisualizer = dynamic(() => import("@/components/visualizers/SupershapeVisualizer"), { ssr: false });

export type VisualizerType = "one" | "two" | "three" | "four" | "supershape";

export interface BeatAudioVisualizerSceneProps {
  audioUrl: string;
  onGoBack: () => void;
  onShuffle: () => void;
}

export default function BeatAudioVisualizerScene({
  audioUrl: propAudioUrl,
  onGoBack,
  onShuffle,
}: BeatAudioVisualizerSceneProps) {
  /* ---------------------------------------------------- */
  /*                       state                          */
  /* ---------------------------------------------------- */
  const [visualizerType, setVisualizerType] = useState<VisualizerType>("one");
  const [visualizerKey, setVisualizerKey] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(propAudioUrl);
  const [isPaused, setIsPaused] = useState(false);

  const setAudioUrlForBeat = useRouteStore((s) => s.setAudioUrlForBeat);

  /* ---------------------------------------------------- */
  /*                 life‑cycle & sync                    */
  /* ---------------------------------------------------- */
  /* stop any existing audio when the scene mounts */
  useEffect(() => {
    pauseAllAudio();
  }, []);

  /* keep local audioUrl in sync with parent prop */
  useEffect(() => {
    setCurrentAudioUrl(propAudioUrl);
  }, [propAudioUrl]);

  /* stop audio when the whole visualiser scene unmounts */
  useEffect(() => () => pauseAllAudio(), []);

  /* ---------------------------------------------------- */
  /*            helpers to swap visualiser/audio          */
  /* ---------------------------------------------------- */
  const resetAudio = () => {
    pauseAllAudio();
    setCurrentAudioUrl((prev) => `${prev.split("?")[0]}?t=${Date.now()}`);
  };

  const randomizeVisualizer = () => {
    const list: VisualizerType[] = ["one", "two", "three", "four", "supershape"];
    setVisualizerType(list[Math.floor(Math.random() * list.length)]);
    setVisualizerKey((k) => k + 1);
    resetAudio();
  };

  const switchVisualizer = (t: VisualizerType) => {
    setVisualizerType(t);
    setVisualizerKey((k) => k + 1);
    resetAudio();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setCurrentAudioUrl(url);
      setAudioUrlForBeat(url);
    }
  };

  /* ---------------------------------------------------- */
  /*               pick the visualiser component          */
  /* ---------------------------------------------------- */
  const VisualizerComponent = {
    one: VisualizerOne,
    two: VisualizerTwo,
    three: VisualizerThree,
    four: VisualizerFour,
    supershape: SupershapeVisualizer,
  }[visualizerType] as React.ComponentType<{ audioUrl: string; isPaused: boolean }>;

  /* ==================================================================== */
  /*                                JSX                                   */
  /* ==================================================================== */
  return (
    <>
      <VisualizerComponent
        key={visualizerKey}
        audioUrl={currentAudioUrl}
        isPaused={isPaused}
      />

      <Html style={{ pointerEvents: "auto", zIndex: 9999 }}>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2">
          <div className="flex space-x-8">
            <button onClick={onGoBack} className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded">
              Go Back
            </button>
            <button onClick={onShuffle} className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded">
              Shuffle Beat
            </button>
            <button onClick={randomizeVisualizer} className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded">
              Randomize Visualizer
            </button>
            <button onClick={() => setIsPaused((p) => !p)} className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded">
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* visualiser selection */}
          <div className="mt-3 flex text-xs space-x-0">
            {(["one","two","three","four","supershape"] as VisualizerType[]).map((t) => (
              <button key={t} onClick={() => switchVisualizer(t)} className="flex flex-col items-center">
                <img src={`/visualizerIcons/neptune${t === "one" ? "Noise" : t === "two" ? "Fractals" : t === "three" ? "Sand" : t === "four" ? "Cellular" : "Supershapes"}.svg`} alt={t} className="w-8 h-8" />
                <span className="text-white mt-1">{t}</span>
              </button>
            ))}
          </div>

          {/* upload */}
          <div className="mt-5 flex space-x-4">
            <label htmlFor="audio-upload" className="cursor-pointer text-white font-bold bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 px-4 py-2 rounded">
              Upload Audio
            </label>
            <input id="audio-upload" type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>
      </Html>
    </>
  );
}
