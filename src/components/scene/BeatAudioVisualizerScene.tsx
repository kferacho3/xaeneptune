"use client";
import { useRouteStore } from "@/store/useRouteStore";
import { Html } from "@react-three/drei";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// Dynamically import visualizer components with SSR disabled.
const VisualizerOne = dynamic(
  () => import("@/components/visualizers/VisualizerOne"),
  { ssr: false }
);
const VisualizerTwo = dynamic(
  () => import("@/components/visualizers/VisualizerTwo"),
  { ssr: false }
);
const VisualizerThree = dynamic(
  () => import("@/components/visualizers/VisualizerThree"),
  { ssr: false }
);
const VisualizerFour = dynamic(
  () => import("@/components/visualizers/VisualizerFour"),
  { ssr: false }
);
const SupershapeVisualizer = dynamic(
  () => import("@/components/visualizers/SupershapeVisualizer"),
  { ssr: false }
);

export type BeatAudioVisualizerSceneProps = {
  audioUrl: string;
  onGoBack: () => void;
  onShuffle: () => void;
};

export type VisualizerType = "one" | "two" | "three" | "four" | "supershape";

export default function BeatAudioVisualizerScene({
  audioUrl: propAudioUrl,
  onGoBack,
  onShuffle,
}: BeatAudioVisualizerSceneProps): React.ReactElement {
  // Visualizer type state.
  const [visualizerType, setVisualizerType] = useState<VisualizerType>("one");
  // Key to force remounting the visualizer and its audio.
  const [visualizerKey, setVisualizerKey] = useState<number>(0);
  // Current audio URL state.
  const [currentAudioUrl, setCurrentAudioUrl] = useState(propAudioUrl);

  // Pause state.
  const [isPaused, setIsPaused] = useState(false);

  // For quick reference to your store’s setter
  const setAudioUrlForBeat = useRouteStore((state) => state.setAudioUrlForBeat);

  // Keep local audioUrl in sync with prop changes
  useEffect(() => {
    setCurrentAudioUrl(propAudioUrl);
  }, [propAudioUrl]);

  // Append a timestamp to force a new audio instance
  const resetAudio = () => {
    // This keeps the same file but changes the query param
    setCurrentAudioUrl((prev) => {
      const noQuery = prev.split("?")[0];
      return `${noQuery}?t=${Date.now()}`;
    });
  };

  // When randomizing the visualizer, pick one, force a key bump, reset audio
  const randomizeVisualizer = () => {
    const types: VisualizerType[] = [
      "one",
      "two",
      "three",
      "four",
      "supershape",
    ];
    const newType: VisualizerType =
      types[Math.floor(Math.random() * types.length)];
    console.log("Randomizing to visualizer type:", newType);
    setVisualizerType(newType);
    setVisualizerKey((prev) => prev + 1);
    resetAudio();
  };

  // Upload file => createObjectURL => set store + local states
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      console.log("Uploaded file URL:", url);
      setCurrentAudioUrl(url);
      setAudioUrlForBeat(url); // store so other places also see the new URL
    }
  };

  // Switch to a specific visualizer
  const switchVisualizer = (type: VisualizerType) => {
    setVisualizerType(type);
    setVisualizerKey((prev) => prev + 1);
    resetAudio();
  };

  // Map the type to the actual visualizer component
  const VisualizerMap: Record<
    VisualizerType,
    React.ComponentType<{ audioUrl: string; isPaused: boolean }>
  > = {
    one: VisualizerOne as React.ComponentType<{
      audioUrl: string;
      isPaused: boolean;
    }>,
    two: VisualizerTwo as React.ComponentType<{
      audioUrl: string;
      isPaused: boolean;
    }>,
    three: VisualizerThree as React.ComponentType<{
      audioUrl: string;
      isPaused: boolean;
    }>,
    four: VisualizerFour as React.ComponentType<{
      audioUrl: string;
      isPaused: boolean;
    }>,
    supershape: SupershapeVisualizer as React.ComponentType<{
      audioUrl: string;
      isPaused: boolean;
    }>,
  };

  const VisualizerComponent = VisualizerMap[visualizerType];

  return (
    <>
      {/* Render the selected visualizer, passing the current audioUrl and isPaused state */}
      <VisualizerComponent
        key={visualizerKey}
        audioUrl={currentAudioUrl}
        isPaused={isPaused}
      />

      <Html
        style={{
          pointerEvents: "auto",
          zIndex: 9999,
        }}
      >
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
          <div className="flex space-x-8">
            <button
              onClick={onGoBack}
              className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded"
            >
              Go Back
            </button>
            <button
              onClick={onShuffle}
              className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded"
            >
              Shuffle Beat
            </button>
            <button
              onClick={randomizeVisualizer}
              className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded"
            >
              Randomize Visualizer
            </button>
            {/* Pause/Resume Toggle */}
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="px-4 py-0 bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white rounded"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* Visualizer selection buttons */}
          <div className="mt-3 flex text-xs space-x-0">
            <button
              onClick={() => switchVisualizer("one")}
              className="flex flex-col items-center"
            >
              <Image
                src="/visualizerIcons/neptuneNoise.svg"
                alt="Noise Visualizer"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-white mt-1">Noise Visualizer</span>
            </button>
            <button
              onClick={() => switchVisualizer("two")}
              className="flex flex-col items-center"
            >
              <Image
                src="/visualizerIcons/neptuneFractals.svg"
                alt="Fractal Visualizer"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-white mt-1">Fractal Visualizer</span>
            </button>
            <button
              onClick={() => switchVisualizer("three")}
              className="flex flex-col items-center"
            >
              <Image
                src="/visualizerIcons/neptuneSand.svg"
                alt="Sand Visualizer"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-white mt-1">Sand Visualizer</span>
            </button>
            <button
              onClick={() => switchVisualizer("four")}
              className="flex flex-col items-center"
            >
              <Image
                src="/visualizerIcons/neptuneCellular.svg"
                alt="Cellular Visualizer"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-white mt-1">Cellular Visualizer</span>
            </button>
            <button
              onClick={() => switchVisualizer("supershape")}
              className="flex flex-col items-center"
            >
              <Image
                src="/visualizerIcons/neptuneSupershapes.svg"
                alt="Supershape Visualizer"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-white mt-1">Supershape Visualizer</span>
            </button>
          </div>

          {/* File upload row */}
          <div className="mt-5 flex space-x-4">
            <label
              htmlFor="audio-upload"
              className="cursor-pointer text-white font-bold bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 px-4 py-2 rounded"
            >
              Upload Audio
            </label>
            <input
              id="audio-upload"
              type="file"
              accept="audio/mp3, audio/ogg, audio/wav"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </Html>
    </>
  );
}
