"use client";

import { useVisualizer } from "@/context/VisualizerContext";
import { useRouteStore } from "@/store/useRouteStore";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaBars, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

type TopBarNavbarProps = { onHamburgerClick?: () => void };

/** slide-in animation */
const barAnim = {
  hidden: { y: -60, opacity: 0 },
  show:   { y:   0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function TopBarNavbar({ onHamburgerClick }: TopBarNavbarProps) {
  const { setActiveRoute, setVisualizerMode } = useRouteStore();
  const { setIsBeatVisualizer } = useVisualizer();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
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

  /* ---------- MOBILE ---------- */
  if (isMobile)
    return (
      <motion.div
        className="fixed top-0 inset-x-0 flex items-center justify-between py-2 px-4
                   bg-black/60 backdrop-blur-md border-b border-white z-[99999]"
        variants={barAnim}
        initial="hidden"
        animate="show"
      >
        <Image src="/AntiHeroLogo.png" alt="AntiHero Logo" width={20} height={20} priority />
        <div className="flex space-x-3">
          <a href="https://twitter.com/xaeneptune"  target="_blank" className="text-white hover:text-secondary"><FaTwitter  size={18} /></a>
          <a href="https://www.instagram.com/xaeneptune/" target="_blank" className="text-white hover:text-secondary"><FaInstagram size={18} /></a>
          <a href="https://youtube.com/@xaeneptune" target="_blank" className="text-white hover:text-secondary"><FaYoutube   size={18} /></a>
        </div>
        <button onClick={onHamburgerClick} className="text-white"><FaBars size={24} /></button>
      </motion.div>
    );

  /* ---------- DESKTOP ---------- */
  return (
    <motion.div
      className="fixed top-0 inset-x-0 flex justify-between items-center p-4
                 bg-black/60 backdrop-blur-md border-b border-white z-[99999]"
      variants={barAnim}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center space-x-2">
        <Image src="/AntiHeroLogo.png" alt="AntiHero Logo" width={25} height={25} priority />
        <div className="text-white text-2xl font-bold" style={{ fontFamily: '"Devil2", sans-serif' }}>
          ANTI HERO
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <a href="https://twitter.com/xaeneptune"        target="_blank" className="text-white hover:text-secondary"><FaTwitter  size={18} /></a>
        <a href="https://www.instagram.com/xaeneptune/" target="_blank" className="text-white hover:text-secondary"><FaInstagram size={18} /></a>
        <a href="https://youtube.com/@xaeneptune"       target="_blank" className="text-white hover:text-secondary"><FaYoutube   size={18} /></a>

        <button onClick={handleBeatsClick}
                className="px-2 py-1 rounded bg-gradient-to-r from-indigo-800 via-purple-700 to-yellow-500 text-white font-bold">
          BEATS
        </button>
        <button onClick={handleVisualizerClick}
                className="px-2 py-1 rounded bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 text-white font-bold">
          VISUALIZER
        </button>
      </div>
    </motion.div>
  );
}
