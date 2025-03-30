"use client";
import { useVisualizer } from "@/context/VisualizerContext";
import { useRouteStore } from "@/store/useRouteStore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaBars, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

type TopBarNavbarProps = {
  onHamburgerClick?: () => void;
};

export default function TopBarNavbar({ onHamburgerClick }: TopBarNavbarProps) {
  const { setActiveRoute, setVisualizerMode } = useRouteStore();
  const { setIsBeatVisualizer } = useVisualizer();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVisualizerClick = () => {
    setVisualizerMode(true);
    setIsBeatVisualizer(true);
    setActiveRoute("beats-visualizer");
  };

  const handleBeatsClick = () => {
    setVisualizerMode(false);
    setIsBeatVisualizer(false);
    setActiveRoute("beats");
  };

  if (isMobile) {
    return (
      <div className="fixed top-0 inset-x-0 flex items-center justify-between py-2 px-4 bg-black bg-opacity-60 backdrop-blur-md border-b border-white z-10">
        {/* Left: Logo only */}
        <div className="flex items-center">
          <Image
            src="/AntiHeroLogo.png"
            alt="AntiHero Logo"
            width={40}
            height={40}
            priority
          />
        </div>
        {/* Center: Social Media Icons */}
        <div className="flex space-x-3">
          <a
            href="https://twitter.com/xaeneptune"
            className="text-white hover:text-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter size={18} />
          </a>
          <a
            href="https://www.instagram.com/xaeneptune/"
            className="text-white hover:text-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={18} />
          </a>
          <a
            href="https://youtube.com/@xaeneptune"
            className="text-white hover:text-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube size={18} />
          </a>
        </div>
        {/* Right: Hamburger Menu */}
        <div className="flex items-center">
          <button onClick={onHamburgerClick} className="text-white">
            <FaBars size={24} />
          </button>
        </div>
      </div>
    );
  }

  // Desktop view layout
  return (
    <div className="fixed top-0 inset-x-0 flex justify-between items-center p-4 bg-black bg-opacity-60 backdrop-blur-md border-b border-white z-50">
      <div className="flex items-center space-x-2">
        <Image
          src="/AntiHeroLogo.png"
          alt="AntiHero Logo"
          width={40}
          height={40}
          priority
        />
        <div
          className="text-white text-2xl font-bold"
          style={{ fontFamily: '"Devil2", sans-serif' }}
        >
          ANTI HERO
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <a
          href="https://twitter.com/xaeneptune"
          className="text-white hover:text-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter size={18} />
        </a>
        <a
          href="https://www.instagram.com/xaeneptune/"
          className="text-white hover:text-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={18} />
        </a>
        <a
          href="https://youtube.com/@xaeneptune"
          className="text-white hover:text-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaYoutube size={18} />
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
