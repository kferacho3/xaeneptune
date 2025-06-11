/* --------------------------------------------------------------------------
   src/app/page.tsx – HomePage with single-click FluidTransition trigger
--------------------------------------------------------------------------- */
"use client";

import { Loader, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";
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
//import { AntiHeroMonitor } from "@/components/models/AntiheroMonitor";
import Scene from "@/components/scene/Scene";

import Albums from "@/components/pages/Albums";
import Artist from "@/components/pages/Artist";
import BeatsAvailable from "@/components/pages/BeatsAvailable";
import Connect from "@/components/pages/Connect";
import Music from "@/components/pages/Music";
import XaeneptunesWorld from "@/components/pages/XaeneptunesWorld";

import { VisualizerProvider, } from "@/context/VisualizerContext";
import { Route, useRouteStore } from "@/store/useRouteStore";
import { pauseAllAudio } from "@/utils/pauseAllAudio";

/* ======================================================================== */

export default function HomePage() {
  /* ROUTE STATE */
  const { activeRoute, setActiveRoute, hoveredRoute } = useRouteStore();
  const route: Route = activeRoute;
 // const { isBeatVisualizer } = useVisualizer();

  /* LOCAL UI STATE */
  const [hasInteracted, setHasInteracted]       = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [transitionDone, setTransitionDone]     = useState(false);

  const [phase, setPhase]   = useState<"none" | "fill" | "wash">("none");
  const [pending, setPending] = useState<Route | null>(null);

  const BUFFER_IN  = 1;
  const BUFFER_OUT = 800;

  const [covered, setCovered] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [dpr, setDpr]         = useState(1);
  const [mobile, setMobile]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [environmentMode, setEnvironmentMode] =
    useState<"day" | "night">("night");

  /* ROUTE HANDLERS */
  const changeRoute = (r: Route) => {
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

  /* RESPONSIVE HELPERS */
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setDpr(
      phase !== "none" || !transitionDone
        ? 1
        : Math.min(window.devicePixelRatio, 2)
    );
  }, [phase, transitionDone]);

  /* PAGE COMPONENT SELECTOR */
  const renderContent = () => {
    switch (route) {
      case "music":      return <Music />;
      case "artist":     return <Artist />;
      case "beats":      return <BeatsAvailable />;
      case "albums":     return <Albums />;
      case "connect":    return <Connect />;
      case "xaeneptune": return <XaeneptunesWorld />;
      default:           return null;
    }
  };

  /* VISIBILITY FLAGS */
  const isSceneRoute   = route === "home" || route === "beats-visualizer";
  const showScene      = isSceneRoute && (!covered || route === "home") && !(phase === "fill" && waiting);
  const showHtmlOverlay = route !== "home" && route !== "beats-visualizer";
  const showNavOverlay  = route === "home" && phase === "none" && transitionDone && hasInteracted;
 // const showMonitor     = route === "beats-visualizer";
/* show the top-bar once Fluid is done & user has interacted */
const showTopbar = phase === "none" && transitionDone && hasInteracted && route !== "beats";

  /* RENDER */
  return (
    <VisualizerProvider>
      <>
        {/* ---------- Sidebar ---------- */}
        <div className="absolute top-0 w-full z-[100]">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            setActiveRoute={setActiveRoute}
          />
        </div>

        {/* ---------- <head> ---------- */}
        <Head>
          <title>Futuristic Space Experience</title>
          <meta name="description" content="Immersive 3-D space experience" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
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
              /* fallback: if user clicks after overlay is gone */
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
                    <Bloom mipmapBlur radius={0.7} luminanceThreshold={0.1} intensity={1} levels={1.5} />
                    <SMAA />
                  </EffectComposer>
                </Suspense>

                <LensFlare enabled />

                <Scene
                  isMobile={mobile}
                  onSelectRoute={changeRoute}
                  activeRoute={route}
                //  visualizerMode={isBeatVisualizer}
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

            {/* Monitor fixed to camera bottom-right */}
            {/* {showMonitor && <FixedMonitor />} */}
          </Canvas>

          {/* ---------- HTML overlay ---------- */}
          {showHtmlOverlay && (
            <div
              className={`absolute inset-0 h-full overflow-y-auto ${
                phase !== "none" ? "pointer-events-none z-[999]" : "pointer-events-auto z-[9999]"
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

                      <div className="absolute top-0 w-full z-[99999]">
            {/* ---------- Top-bar Navbar (all routes) ---------- */}
{showTopbar && <TopBarNavbar onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} />}

              </div>

          {/* ---------- Nav + Env toggle ---------- */}
          {showNavOverlay && (
            <>
  
              <NavigationOverlay handleRouteChange={changeRoute} />

              <button
                onClick={() => setEnvironmentMode((p) => (p === "night" ? "day" : "night"))}
                className={`fixed ${
                  mobile ? "right-5 bottom-5" : "right-20 bottom-5"
                } z-[1200] flex flex-col items-center justify-center rounded-full p-2 shadow-lg transition-colors duration-300 ${
                  environmentMode === "night" ? "bg-slate-800 text-slate-100" : "bg-amber-400 text-amber-900"
                }`}
              >
                {environmentMode === "night" ? (
                  <>
                    <FiSun className={mobile ? "h-3 w-3" : "h-6 w-6"} />
                    <span className={mobile ? "mt-1 text-[8px]" : "mt-1 text-xs"}>Day</span>
                  </>
                ) : (
                  <>
                    <FiMoon className={mobile ? "h-3 w-3" : "h-6 w-6"} />
                    <span className={mobile ? "mt-1 text-[8px]" : "mt-1 text-xs"}>Night</span>
                  </>
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

/* --------------------------------------------------------------------------
   Fixed monitor – parented to the camera so it stays in the same corner
--------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   Fixed monitor – parented to the camera so it stays in the same corner
--------------------------------------------------------------------------- */
// function FixedMonitor() {
//   const { camera } = useThree();
//   const monitorRef = useRef<THREE.Group>(null);

//   useFrame(() => {
//     if (monitorRef.current) {
//       // Get the camera's world quaternion
//       const cameraWorldQuaternion = new THREE.Quaternion();
//       camera.getWorldQuaternion(cameraWorldQuaternion);
      
//       // Invert it to counteract the camera rotation
//       const invertedQuaternion = cameraWorldQuaternion.clone().invert();
      
//       // Apply the inverted rotation to the monitor
//       monitorRef.current.setRotationFromQuaternion(invertedQuaternion);
//     }
//   });

//   return (
//     <primitive object={camera}>
//       <group 
//         ref={monitorRef}
//         position={[4, -3, -10]} // Adjust position as needed for bottom-right corner
//         scale={1}
//       >
//         <AntiHeroMonitor />
//       </group>
//     </primitive>
//   );
// }
