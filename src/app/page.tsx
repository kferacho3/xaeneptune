"use client";

import { Loader, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import Head from "next/head";
import { Suspense, useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import * as THREE from "three";

import CombinedProgressPrompt from "@/components/background/ProgressBar";
import { LensFlare } from "@/components/effects/LensFlareEffect";
import FluidTransitionEffect from "@/components/effects/TransitionBackground";
import GoBackButton from "@/components/layout/GoBackButton";
import NavigationOverlay from "@/components/layout/NavigationOverlay";
import Sidebar from "@/components/layout/Sidebar";
import TopBarNavbar from "@/components/layout/TopBarNavbar";
import Albums from "@/components/pages/Albums";
import Artist from "@/components/pages/Artist";
import BeatsAvailable from "@/components/pages/BeatsAvailable";
import Connect from "@/components/pages/Connect";
import Music from "@/components/pages/Music";
import XaeneptunesWorld from "@/components/pages/XaeneptunesWorld";
import Scene from "@/components/scene/Scene";

import { VisualizerProvider, useVisualizer } from "@/context/VisualizerContext";
import { Route, useRouteStore } from "@/store/useRouteStore";

export default function HomePage() {
  const { activeRoute, setActiveRoute, hoveredRoute } = useRouteStore();
  const route: Route = activeRoute; // already typed with the new union
  const { isBeatVisualizer } = useVisualizer();

  /* ---------------- state ---------------- */
  const [hasInteracted, setHasInteracted] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  const [phase, setPhase] = useState<"none" | "fill" | "wash">("none");
  const [pending, setPending] = useState<Route | null>(null);

  const BUFFER_IN = 1;
  const BUFFER_OUT = 800;

  const [covered, setCovered] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const [dpr, setDpr] = useState(1.5);
  const [mobile, setMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [environmentMode, setEnvironmentMode] =
    useState<"day" | "night">("night");

  /* ---------------- routing helpers ---------------- */
  const changeRoute = (r: Route) => {
    if (r === route) return;
    setPending(r);
    setPhase("fill"); // start cover transition
  };

  const onFluidComplete = () => {
    if (phase === "fill" && pending) {
      const delay = pending === "home" ? BUFFER_OUT : BUFFER_IN;
      setWaiting(true);
      setTimeout(() => {
        setActiveRoute(pending);
        setCovered(pending !== "home");
        setPhase("wash");
        setPending(null);
        setWaiting(false);
      }, delay);
    } else if (phase === "wash") {
      setPhase("none");
      setCovered(false);
    } else {
      setTransitionDone(true);
    }
  };

  /* ---------------- helpers ---------------- */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const renderContent = () => {
    switch (route) {
      case "music":
        return <Music />;
      case "artist":
        return <Artist />;
      case "beats":
        return <BeatsAvailable />;
      case "albums":
        return <Albums />;
      case "connect":
        return <Connect />;
      case "xaeneptune":
        return <XaeneptunesWorld />;
      default:
        return null;
    }
  };

  /* ---- which parts are visible? ---- */
  const isSceneRoute = route === "home" || route === "beats-visualizer";

  const showScene =
    isSceneRoute &&
    hasInteracted &&
    progressComplete &&
    (!covered || route === "home") &&
    !(phase === "fill" && waiting);

  const showHtmlOverlay = route !== "home" && route !== "beats-visualizer";

  const showNavOverlay =
    route === "home" &&
    phase === "none" &&
    hasInteracted &&
    progressComplete;

  /* ===================================================================== */
  /*                                JSX                                    */
  /* ===================================================================== */
  return (
    <VisualizerProvider>
      <>
        {/* ───────────── SIDE BAR ───────────── */}
        <div className="absolute top-0 w-full z-[100]">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            setActiveRoute={setActiveRoute}
          />
        </div>

        {/* ───────────── HEAD ───────────── */}
        <Head>
          <title>Futuristic Space Experience</title>
          <meta name="description" content="Immersive 3D space experience" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* ───────────── CANVAS ───────────── */}
        <div className="relative w-full h-full">
          {/* TopBar always on top */}
          <div className="absolute top-0 w-full z-[99999]">
            <TopBarNavbar
              onHamburgerClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>

          <Canvas
            shadows
            className="absolute inset-0 z-[1100]"
            camera={{ position: [0, 75, 200], fov: 75 }}
            onPointerDown={() => setHasInteracted(true)}
            dpr={dpr}
            gl={{
              alpha: true,
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
          >
            {/* progress prompt until first interaction */}
            {!progressComplete && (
              <CombinedProgressPrompt
                onComplete={() => setProgressComplete(true)}
                mobile={mobile}
              />
            )}

            {/* FLUID TRANSITION */}
            {(phase !== "none" || !transitionDone) && (
              <Suspense fallback={null}>
                <FluidTransitionEffect
                  key={phase}
                  isActive={phase !== "none" || (hasInteracted && progressComplete)}
                  direction={phase === "fill" ? "reverse" : "forward"}
                  onComplete={onFluidComplete}
                />
              </Suspense>
            )}

            {/* MAIN 3D SCENE */}
            {showScene && (
              <>
                <Suspense fallback={null}>
                  <EffectComposer multisampling={0}>
                    <Vignette />
                    <Bloom
                      mipmapBlur
                      radius={0.9}
                      luminanceThreshold={0.966}
                      intensity={1}
                      levels={3}
                    />
                    <SMAA />
                  </EffectComposer>
                </Suspense>

                <LensFlare enabled />

                <Scene
                  isMobile={mobile}
                  onSelectRoute={changeRoute}
                  activeRoute={route}
                  visualizerMode={isBeatVisualizer}
                  onBeatGoBack={() => changeRoute("beats")}
                  hoveredRoute={hoveredRoute}
                  environmentMode={environmentMode}
                />
              </>
            )}

            <PerformanceMonitor
              onIncline={() => setDpr(1)}
              onDecline={() => setDpr(0.6)}
            />
          </Canvas>

          {/* HTML PAGES */}
          {showHtmlOverlay && (
            <div
              className={`absolute inset-0 h-full overflow-y-auto ${
                phase !== "none"
                  ? "pointer-events-none z-[999]"
                  : "pointer-events-auto z-[9999]"
              }`}
            >
              <div className="min-h-screen">{renderContent()}</div>
            </div>
          )}

          {/* GO BACK BUTTON */}
          {route !== "home" && (
            <div className="fixed bottom-[1.5%] left-2 md:left-[0.5%] z-[9999]">
              <GoBackButton onClick={() => changeRoute("home")} />
            </div>
          )}

          {/* NAV + ENV TOGGLE (home only) */}
          {showNavOverlay && (
            <>
              <NavigationOverlay handleRouteChange={changeRoute} />
              <button
                onClick={() =>
                  setEnvironmentMode((p) => (p === "night" ? "day" : "night"))
                }
                className={`fixed ${
                  mobile ? "right-5 bottom-5" : "right-20 bottom-5"
                } z-[1200] flex flex-col items-center justify-center rounded-full p-2 shadow-lg transition-colors duration-300 ${
                  environmentMode === "night"
                    ? "bg-slate-800 text-slate-100"
                    : "bg-amber-400 text-amber-900"
                }`}
              >
                {environmentMode === "night" ? (
                  <span className="group flex flex-col items-center">
                    <span className="rounded-full p-1 border-2 border-indigo-900 transition-all duration-300 group-hover:border-orange-500 group-active:border-indigo-900">
                      <FiSun className={mobile ? "h-3 w-3" : "h-6 w-6"} />
                    </span>
                    <span
                      className={
                        mobile
                          ? "mt-1 text-[8px] font-semibold"
                          : "mt-1 text-xs font-semibold"
                      }
                    >
                      Day
                    </span>
                  </span>
                ) : (
                  <span className="group flex flex-col items-center">
                    <span className="rounded-full p-1 border-2 border-orange-500 transition-all duration-300 group-hover:border-indigo-900 group-active:border-orange-500">
                      <FiMoon className={mobile ? "h-3 w-3" : "h-6 w-6"} />
                    </span>
                    <span
                      className={
                        mobile
                          ? "mt-1 text-[8px] font-semibold"
                          : "mt-1 text-xs font-semibold"
                      }
                    >
                      Night
                    </span>
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        <Loader />
      </>
    </VisualizerProvider>
  );
}
