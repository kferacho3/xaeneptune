// /src/components/NavigationOverlay.tsx
"use client";

import { Route, useRouteStore } from "@/store/useRouteStore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BsSpeakerFill } from "react-icons/bs";
import {
  FaCompactDisc,
  FaGlobe,
  FaMusic,
  FaPlug,
  FaUser,
} from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";

interface Props {
  handleRouteChange: (route: Route) => void;
  environmentMode: "day" | "night";
  toggleEnvironment: () => void;
}

const allRoutes: Route[] = [
  "music",
  "artist",
  "beats",
  "albums",
  "connect",
  "xaeneptune",
];

const routeIcons: Partial<
  Record<Route, React.ComponentType<{ className?: string }>>
> = {
  music: FaMusic,
  artist: FaUser,
  beats: BsSpeakerFill,
  albums: FaCompactDisc,
  connect: FaPlug,
  xaeneptune: FaGlobe,
};

export default function NavigationOverlay({
  handleRouteChange,
  environmentMode,
  toggleEnvironment,
}: Props) {
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
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.12,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  if (!animationReady) return null;

  /* ------------------------------------------------------------------ */
  /*  MARK-UP                                                           */
  /* ------------------------------------------------------------------ */
  return (
  <motion.div
    /* fixed so it isn’t pushed by scrolling & respects the visual viewport */
    className="
      pointer-events-auto fixed z-[9999] flex w-full flex-col items-center
      px-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]
    "
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    /* safe-area aware bottom margin on phones; 10 px on larger screens */
    style={{
      bottom: isMobile
        ? "calc(env(safe-area-inset-bottom,0px) + 12px)"
        : "10px",
    }}
  >
      {isMobile ? (
        /* ─────────── MOBILE GRID ─────────── */
        <div className="grid grid-cols-4 grid-rows-2 gap-1 rounded-md bg-white/10 p-1 backdrop-blur-md">
          {/* Row 1 – first three routes */}
          {allRoutes.slice(0, 3).map((route) => {
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
                className={`flex flex-col items-center gap-0.5 rounded-md p-1 border ${
                  isActive ? "text-cyan-400" : "text-white"
                } ${
                  isHovered
                    ? "border-2 border-cyan-400 bg-cyan-400/10"
                    : "border border-white/50"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                <span className="text-[9px]">{route.toUpperCase()}</span>
              </motion.button>
            );
          })}

          {/* Day | Night toggle occupies entire 4th column (row-span-2) */}
          <motion.button
            key="env-toggle-mobile"
            onClick={toggleEnvironment}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={buttonVariants}
            className={`col-start-4 row-span-2 flex flex-col items-center justify-center gap-0.5 rounded-md p-1 ${
              environmentMode === "night"
                ? "bg-slate-800 text-slate-100"
                : "bg-amber-400 text-amber-900"
            }`}
          >
            {environmentMode === "night" ? (
              <>
                <FiSun className="h-2.5 w-2.5" />
                <span className="text-[9px]">DAY</span>
              </>
            ) : (
              <>
                <FiMoon className="h-2.5 w-2.5" />
                <span className="text-[9px]">NGHT</span>
              </>
            )}
          </motion.button>

          {/* Row 2 – remaining three routes (start at row 2) */}
          {allRoutes.slice(3, 6).map((route) => {
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
                className={`row-start-2 flex flex-col items-center gap-0.5 rounded-md p-1 border ${
                  isActive ? "text-cyan-400" : "text-white"
                } ${
                  isHovered
                    ? "border-2 border-cyan-400 bg-cyan-400/10"
                    : "border border-white/50"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                <span className="text-[9px]">{route.toUpperCase()}</span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        /* ─────────── DESKTOP RIBBON ─────────── */
        <div className="flex flex-row items-center justify-center gap-4 rounded-full bg-white/10 p-4 backdrop-blur-lg">
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
                className={`flex items-center gap-2 rounded-md px-3 py-2 font-semibold ${
                  isActive ? "text-cyan-400" : "text-white"
                } ${
                  isHovered
                    ? "border-2 border-cyan-400 bg-cyan-400/10"
                    : "border border-white/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{route.toUpperCase()}</span>
              </motion.button>
            );
          })}

          {/* Day | Night toggle (desktop) */}
          <motion.button
            key="env-toggle-desktop"
            onClick={toggleEnvironment}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={buttonVariants}
            className={`flex items-center gap-2 rounded-md px-3 py-2 font-semibold border ${
              environmentMode === "night"
                ? "bg-slate-800 text-slate-100 border-white/50"
                : "bg-amber-400 text-amber-900 border-amber-900/50"
            }`}
          >
            {environmentMode === "night" ? (
              <>
                <FiSun className="h-5 w-5" />
                <span className="hidden sm:inline">DAY</span>
              </>
            ) : (
              <>
                <FiMoon className="h-5 w-5" />
                <span className="hidden sm:inline">NIGHT</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
