import { useVisualizer } from '@/context/VisualizerContext';
import { useRouteStore } from '@/store/useRouteStore';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import BeatsList from './BeatsList';

export default function BeatsAvailable(): React.ReactElement | null {
  const { setActiveRoute, setAudioUrlForBeat, setVisualizerMode } = useRouteStore();
  const { isBeatVisualizer, setIsBeatVisualizer } = useVisualizer();
  const [selectedBeat, setSelectedBeat] = useState<{ audioUrl: string } | null>(null);

  const handleBeatSelect = (audioUrl: string) => {
    setSelectedBeat({ audioUrl });
    setAudioUrlForBeat(audioUrl);
    setVisualizerMode(true);
    setIsBeatVisualizer(true);
    // Switch to the visualizer route so that the Scene renders the visualizer
    setActiveRoute('beats-visualizer');
  };

  const handleTabChange = (tab: 'beats' | 'visualizer') => {
    if (tab === 'visualizer') {
      setVisualizerMode(true);
      setIsBeatVisualizer(true);
      if (!selectedBeat) {
        const defaultBeat = '/audio/sample-beat.mp3';
        setSelectedBeat({ audioUrl: defaultBeat });
        setAudioUrlForBeat(defaultBeat);
      }
      setActiveRoute('beats-visualizer');
    } else {
      setVisualizerMode(false);
      setIsBeatVisualizer(false);
      setActiveRoute('beats');
    }
  };

  let overlayContent: React.ReactElement | null = null;
  if (!isBeatVisualizer) {
    overlayContent = (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="mt-20 flex justify-center my-4">
          <button
            onClick={() => handleTabChange('beats')}
            className={`px-4 py-2 mx-2 rounded ${
              !isBeatVisualizer ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Beats For Sale
          </button>
          <button
            onClick={() => handleTabChange('visualizer')}
            className={`px-4 py-2 mx-2 rounded ${
              isBeatVisualizer ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Audio Visualizer
          </button>
        </div>
        <BeatsList onBeatSelect={handleBeatSelect} />
      </div>
    );
  }

  useEffect(() => {
    if (selectedBeat !== null) {
      console.log('Selected beat:', selectedBeat);
    }
  }, [selectedBeat]);

  return (
    <>
      <Head>
        <title>Beats Available - SciFi Beats Marketplace</title>
        <meta
          name="description"
          content="Discover and purchase futuristic beats with advanced filtering. Explore our collection and enjoy immersive audio visualization."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {overlayContent}
    </>
  );
}
