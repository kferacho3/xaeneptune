/* --------------------------------------------------------------------------
   src/app/page.tsx – HomePage with single-click FluidTransition trigger
--------------------------------------------------------------------------- */
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
import { FaTimes } from "react-icons/fa";
import * as THREE from "three";

import CombinedProgressPrompt from "@/components/background/ProgressBar";
import { LensFlare } from "@/components/effects/LensFlareEffect";
import FluidTransitionEffect from "@/components/effects/TransitionBackground";

import GoBackButton from "@/components/layout/GoBackButton";
import NavigationOverlay from "@/components/layout/NavigationOverlay";
import Sidebar from "@/components/layout/Sidebar";
import TopBarNavbar from "@/components/layout/TopBarNavbar";
// import { AntiHeroMonitor } from "@/components/models/AntiheroMonitor";
import Scene from "@/components/scene/Scene";

import Albums from "@/components/pages/Albums";
import Artist from "@/components/pages/Artist";
import BeatsAvailable from "@/components/pages/BeatsAvailable";
import Connect from "@/components/pages/Connect";
import Music from "@/components/pages/Music";
import XaeneptunesWorld from "@/components/pages/XaeneptunesWorld";

import { VisualizerProvider } from "@/context/VisualizerContext";
import { Route, useRouteStore } from "@/store/useRouteStore";
import { pauseAllAudio } from "@/utils/pauseAllAudio";

/* ======================================================================== */

export default function HomePage() {
  /* ROUTE STATE */
  const { activeRoute, setActiveRoute, hoveredRoute } = useRouteStore();
  const route: Route = activeRoute;

  /* LOCAL UI STATE */
  const [hasInteracted, setHasInteracted] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);

  const [phase, setPhase] = useState<"none" | "fill" | "wash">("none");
  const [pending, setPending] = useState<Route | null>(null);

  const BUFFER_IN = 1;
  const BUFFER_OUT = 800;

  const [covered, setCovered] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [dpr, setDpr] = useState(1);
  const [mobile, setMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [environmentMode, setEnvironmentMode] =
    useState<"day" | "night">("night");

  /* CONNECT MODAL */
  const [showConnectModal, setShowConnectModal] = useState(false);

  /* ROUTE HANDLERS */
  const changeRoute = (r: Route) => {
    if (r === "connect") {
      setShowConnectModal(true);
      return;
    }
    if (r === route) return;
    if (route === "beats-visualizer") pauseAllAudio();
    setPending(r);
    setPhase("fill");
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

  /* RESPONSIVE & BODY-SCROLL CONTROL */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* lock / unlock scrolling on mobile while on home route */
  useEffect(() => {
    if (mobile && route === "home") {
      document.body.style.overflowY = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflowY = "";
      document.body.style.touchAction = "";
    }
  }, [mobile, route]);

  useEffect(() => {
    setDpr(
      phase !== "none" || !transitionDone
        ? 1
        : Math.min(window.devicePixelRatio, 2),
    );
  }, [phase, transitionDone]);

  /* PAGE COMPONENT SELECTOR */
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
      case "xaeneptune":
        return <XaeneptunesWorld />;
      default:
        return null;
    }
  };

  /* VISIBILITY FLAGS */
  const isSceneRoute = route === "home" || route === "beats-visualizer";
  const showScene =
    isSceneRoute &&
    (!covered || route === "home") &&
    !(phase === "fill" && waiting);
  const showHtmlOverlay = route !== "home" && route !== "beats-visualizer";
  const showNavOverlay =
    route === "home" && phase === "none" && transitionDone && hasInteracted;
  const showTopbar =
    phase === "none" &&
    transitionDone &&
    hasInteracted &&
    route !== "beats";

  /* -------------------------------------------------------------------- */
  /* RENDER                                                               */
  /* -------------------------------------------------------------------- */
  return (
    <VisualizerProvider>
      <>
        {/* ---------- Sidebar ---------- */}
        <div className="absolute top-0 w-full z-[100]">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            setActiveRoute={(r: Route) => {
              if (r === "connect") {
                setShowConnectModal(true);
                setSidebarOpen(false);
              } else {
                setActiveRoute(r);
              }
            }}
          />
        </div>

        {/* ---------- <head> ---------- */}
        <Head>
          <title>Futuristic Space Experience</title>
          <meta
            name="description"
            content="Immersive 3-D space experience"
          />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* ---------- Main Layer ---------- */}
        <div className="relative w-full h-full">
          {/* ---------- Three Canvas ---------- */}
          <Canvas
            shadows
            className="absolute inset-0 z-[1100]"
            camera={{ position: [0, 75, 200], fov: 75 }}
            dpr={dpr}
            onPointerDown={() => {
              if (progressComplete) setHasInteracted(true);
            }}
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
            {/* Loader & Progress Prompt */}
            {!progressComplete && (
              <CombinedProgressPrompt
                onComplete={() => setProgressComplete(true)}
                onEnter={() => setHasInteracted(true)}
                mobile={mobile}
              />
            )}

            {/* Fluid cover */}
            {(phase !== "none" || !transitionDone) && (
              <Suspense fallback={null}>
                <FluidTransitionEffect
                  key={phase}
                  isActive={
                    phase !== "none" ||
                    (!transitionDone && progressComplete && hasInteracted)
                  }
                  direction={phase === "fill" ? "reverse" : "forward"}
                  onComplete={onFluidComplete}
                />
              </Suspense>
            )}

            {/* Scene */}
            {showScene && (
              <>
                <Suspense fallback={null}>
                  <EffectComposer multisampling={0}>
                    <Vignette />
                    <Bloom
                      mipmapBlur
                      radius={0.7}
                      luminanceThreshold={0.1}
                      intensity={1}
                      levels={1.5}
                    />
                    <SMAA />
                  </EffectComposer>
                </Suspense>

                <LensFlare enabled />

                <Scene
                  isMobile={mobile}
                  onSelectRoute={changeRoute}
                  activeRoute={route}
                  onBeatGoBack={() => changeRoute("beats")}
                  hoveredRoute={hoveredRoute}
                  environmentMode={environmentMode}
                />
              </>
            )}

            <PerformanceMonitor
              onIncline={() => setDpr((p) => Math.min(p + 0.25, 2))}
              onDecline={() => setDpr((p) => Math.max(p - 0.25, 0.6))}
            />
          </Canvas>

          {/* ---------- HTML overlay ---------- */}
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

          {/* ---------- Go back ---------- */}
          {route !== "home" && (
            <div className="fixed bottom-[1.5%] left-2 md:left-[0.5%] z-[9999]">
              <GoBackButton onClick={() => changeRoute("home")} />
            </div>
          )}

          {/* ---------- Top-bar ---------- */}
          <div className="absolute top-0 w-full z-[99999]">
            {showTopbar && (
              <TopBarNavbar
                onHamburgerClick={() => setSidebarOpen(!sidebarOpen)}
              />
            )}
          </div>

          {/* ---------- Navigation Overlay ---------- */}
          {showNavOverlay && (
            <NavigationOverlay
              handleRouteChange={changeRoute}
              environmentMode={environmentMode}
              toggleEnvironment={() =>
                setEnvironmentMode((p) => (p === "night" ? "day" : "night"))
              }
            />
          )}
        </div>

        {/* ---------- Connect Modal ---------- */}
        {showConnectModal && (
          <div className="fixed inset-0 z-[100000]">
            <Connect />
            <button
              onClick={() => setShowConnectModal(false)}
              className="fixed top-6 right-6 z-[100001] p-3 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700/50 transition-colors group"
              aria-label="Close connect modal"
            >
              <FaTimes className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}

        <Loader />
      </>
    </VisualizerProvider>
  );
}
