"use client";
import GoBackButton from "@/components/layout/GoBackButton";
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
import { Loader, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { motion } from "framer-motion";
import Head from "next/head";
import { Suspense, useEffect, useState } from "react";

export default function HomePage() {
  const {
    activeRoute,
    setActiveRoute,
    onBeatGoBack,
    onBeatShuffle,
    visualizerMode,
  } = useRouteStore();
  const { isBeatVisualizer } = useVisualizer();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dpr, setDpr] = useState(1.5);
  const [mobile, setMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, []);

  const renderContent = () => {
    switch (activeRoute) {
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
      case "xaeneptunesworld":
        return <XaeneptunesWorld />;
      default:
        return null;
    }
  };

  const promptMessage = mobile
    ? "Drag with your fingers to explore"
    : "Click and drag to explore";

  return (
    <VisualizerProvider>
      <>
        <Head>
          <title>Futuristic Space Experience</title>
          <meta name="description" content="Immersive 3D space experience" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div
          style={{ width: "100vw", height: "100vh" }}
          className="w-full h-full relative"
        >
          {/* Top Navbar */}
          <div
            style={{ zIndex: 100, position: "absolute", top: 0, width: "100%" }}
          >
            <TopBarNavbar onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            setActiveRoute={setActiveRoute}
          />
          <Canvas
            style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
            className="w-full h-screen"
            camera={{ position: [0, 75, 200], fov: 75 }}
            onPointerDown={() => setHasInteracted(true)}
            dpr={dpr}
            gl={{
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
              antialias: false,
              depth: false,
            }}
          >
            {hasInteracted && (
              <Scene
                isMobile={mobile}
                onSelectRoute={(route: Route) => setActiveRoute(route)}
                specialEffect={activeRoute === "xaeneptunesworld"}
                activeRoute={activeRoute}
                visualizerMode={visualizerMode || isBeatVisualizer}
                onBeatGoBack={onBeatGoBack || (() => setActiveRoute("beats"))}
                onBeatShuffle={
                  onBeatShuffle || (() => console.log("Shuffle beat"))
                }
              />
            )}
            <PerformanceMonitor
              onIncline={() => setDpr(1)}
              onDecline={() => setDpr(0.6)}
            />
            <OrbitControls
              autoRotate
              autoRotateSpeed={0.15}
              zoomSpeed={2}
              maxDistance={75}
              minDistance={35}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 1.75}
            />
            <directionalLight intensity={3} position={[-25, 60, -60]} />
            <Suspense fallback={null}>
              <EffectComposer multisampling={0}>
                <Vignette />
                <Bloom
                  mipmapBlur
                  radius={0.9}
                  luminanceThreshold={0.966}
                  intensity={2}
                  levels={4}
                />
                <SMAA />
              </EffectComposer>
            </Suspense>
          </Canvas>
          {activeRoute !== "home" && activeRoute !== "beats-visualizer" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 50,
                pointerEvents: "auto",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="min-h-screen">{renderContent()}</div>
            </div>
          )}
          {!hasInteracted && activeRoute === "home" && (
            <div
              onPointerDown={() => setHasInteracted(true)}
              className="absolute inset-0 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`font-bold bg-gradient-to-r from-gray-300 via-white to-gray-500 bg-clip-text text-transparent animate-pulse ${
                  mobile ? "text-2xl" : "text-4xl"
                }`}
              >
                {promptMessage}
              </motion.div>
            </div>
          )}
          {activeRoute !== "home" && (
            <div
              style={{
                position: "fixed",
                bottom: "1.5%",
                left: mobile ? "0.5%" : "2%",
                zIndex: 200,
              }}
            >
              <GoBackButton onClick={() => setActiveRoute("home")} />
            </div>
          )}
        </div>
        <Loader />
      </>
    </VisualizerProvider>
  );
}
