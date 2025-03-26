'use client';

import { useVisualizer } from '@/context/VisualizerContext';
import { useRouteStore } from '@/store/useRouteStore';
import Image from 'next/image';
// If you have react-icons installed, you can import icons like this:
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
    // Adjust this to whatever navigation logic you want, e.g.:
    // setActiveRoute('beats');
    // or a different route if needed
    setVisualizerMode(false);
    setIsBeatVisualizer(false);
    setActiveRoute('beats');
  };

  return (
    <div className="fixed top-0 inset-x-0 flex justify-between items-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-md border-b border-white z-1000">
      <div className="flex items-center space-x-2">
        <Image src="/AntiHeroLogo.png" alt="AntiHero Logo" width={40} height={40} priority />
        <div className="text-white text-4xl" style={{ fontFamily: '"Devil2", sans-serif' }}>
          ANTI HERO
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* Social icons */}
        <a
          href="https://twitter.com"
          className="text-white hover:text-[var(--secondary-color)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter size={18} />
        </a>
        <a
          href="https://instagram.com"
          className="text-white hover:text-[var(--secondary-color)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={18} />
        </a>
        <a
          href="https://facebook.com"
          className="text-white hover:text-[var(--secondary-color)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook size={18} />
        </a>

        {/* The new BEATS button with indigo-gold gradient */}
        <button
          onClick={handleBeatsClick}
          className="px-2 py-0.5 rounded bg-gradient-to-r from-indigo-800 via-purple-700 to-yellow-500 text-white font-bold"
        >
          BEATS
        </button>

        {/* Existing VISUALIZER button */}
        <button
          onClick={handleVisualizerClick}
          className="px-2 py-0.5 rounded bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white font-bold"
        >
          VISUALIZER
        </button>
      </div>
    </div>
  );
}
