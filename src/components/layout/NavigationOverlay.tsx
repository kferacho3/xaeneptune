"use client";

import { Route, useRouteStore } from "@/store/useRouteStore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BsSpeakerFill } from "react-icons/bs";
import { FaCompactDisc, FaGlobe, FaMusic, FaPlug, FaUser } from "react-icons/fa";

interface Props {
  handleRouteChange: (route: Route) => void; // 👈 receives handler
}

const allRoutes: Route[] = ["music", "artist", "beats", "albums", "connect", "xaeneptune"];

const routeIcons: Partial<Record<Route, React.ComponentType<{ className?: string }>>> = {
  music: FaMusic,
  artist: FaUser,
  beats: BsSpeakerFill,
  albums: FaCompactDisc,
  connect: FaPlug,
  xaeneptune: FaGlobe,
};

export default function NavigationOverlay({ handleRouteChange }: Props) {
  const { activeRoute, hoveredRoute, setHoveredRoute } = useRouteStore();

  const [isMobile, setIsMobile] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    const timer = setTimeout(() => setAnimationReady(true), 1000);
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const containerVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.12 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  if (!animationReady) return null;

  return (
    <motion.div
      className="absolute w-full z-[9999] pointer-events-auto flex flex-col items-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ bottom: isMobile ? "2.5%" : "10px" }}
    >
      {isMobile ? (
        <div className="grid grid-cols-3 gap-1 p-1 rounded-md backdrop-blur-md bg-white/10">
          {allRoutes.map((route) => {
            const Icon = routeIcons[route]!;
            const isActive = activeRoute === route;
            const isHovered = hoveredRoute === route;
            return (
              <motion.button
                key={route}
                onClick={() => handleRouteChange(route)}
                onMouseEnter={() => setHoveredRoute(route)}
                onMouseLeave={() => setHoveredRoute(undefined)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                variants={buttonVariants}
                className={`flex flex-col items-center gap-0.5 rounded-md p-1 border 
                  ${isActive ? "text-cyan-400" : "text-white"} 
                  ${isHovered ? "border-2 border-cyan-400 bg-cyan-400/10" : "border border-white/50"}`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span className="text-[9px] text-center">{route.toUpperCase()}</span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-row gap-4 items-center justify-center p-4 rounded-full backdrop-blur-lg bg-white/10">
          {allRoutes.map((route) => {
            const Icon = routeIcons[route]!;
            const isActive = activeRoute === route;
            const isHovered = hoveredRoute === route;
            return (
              <motion.button
                key={route}
                onClick={() => handleRouteChange(route)}
                onMouseEnter={() => setHoveredRoute(route)}
                onMouseLeave={() => setHoveredRoute(undefined)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                variants={buttonVariants}
                className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold 
                  ${isActive ? "text-cyan-400" : "text-white"} 
                  ${isHovered ? "border-2 border-cyan-400 bg-cyan-400/10" : "border border-white/50"}`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{route.toUpperCase()}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
