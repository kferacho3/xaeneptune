'use client';

import { useVisualizer } from '@/context/VisualizerContext';
import { useRouteStore } from '@/store/useRouteStore';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function TopBarNavbar() {
  const { setActiveRoute, setVisualizerMode } = useRouteStore();
  const { setIsBeatVisualizer } = useVisualizer();

  const handleVisualizerClick = () => {
    setVisualizerMode(true);
    setIsBeatVisualizer(true);
    setActiveRoute('beats-visualizer');
  };

  const handleBeatsClick = () => {
    setVisualizerMode(false);
    setIsBeatVisualizer(false);
    setActiveRoute('beats');
  };

  return (
    <div className="fixed top-0 inset-x-0 flex justify-between items-center p-4 bg-black bg-opacity-60 backdrop-blur-md border-b border-white z-50">
      <div className="flex items-center space-x-2">
        <Image src="/AntiHeroLogo.png" alt="AntiHero Logo" width={40} height={40} priority />
        <div className="text-white text-2xl font-bold" style={{ fontFamily: '"Devil2", sans-serif' }}>
          ANTI HERO
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <a
          href="https://twitter.com"
          className="text-white hover:text-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter size={18} />
        </a>
        <a
          href="https://instagram.com"
          className="text-white hover:text-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={18} />
        </a>
        <a
          href="https://facebook.com"
          className="text-white hover:text-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook size={18} />
        </a>
        <button
          onClick={handleBeatsClick}
          className="px-2 py-1 rounded bg-gradient-to-r from-indigo-800 via-purple-700 to-yellow-500 text-white font-bold"
        >
          BEATS
        </button>
        <button
          onClick={handleVisualizerClick}
          className="px-2 py-1 rounded bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white font-bold"
        >
          VISUALIZER
        </button>
      </div>
    </div>
  );
}
