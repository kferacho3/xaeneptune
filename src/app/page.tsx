'use client';

import { Scroll, ScrollControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import Albums from '../components/Albums';
import Artist from '../components/Artist';
import BeatsAvailable from '../components/BeatsAvailable';
import Connect from '../components/Connect';
import GoBackButton from '../components/GoBackButton';
import Music from '../components/Music';
import NavigationMenu, { Route } from '../components/NavigationMenu';
import Scene from '../components/Scene';
import TopBarNavbar from '../components/TopBarNavbar';
import XaeneptunesWorld from '../components/XaeneptunesWorld';

export default function HomePage() {
  const [activeRoute, setActiveRoute] = useState<Route | 'home'>('home');
  const [isSceneLoaded, setIsSceneLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleSceneLoaded = () => {
    setIsSceneLoaded(true);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeRoute) {
      case 'music':
        return <Music />;
      case 'artist':
        return <Artist />;
      case 'beats':
        return <BeatsAvailable />;
      case 'albums':
        return <Albums />;
      case 'connect':
        return <Connect />;
      case 'xaeneptunesworld':
        return <XaeneptunesWorld />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }} className="w-full h-full">
      {/* Navigation on Home (desktop) */}
      {isSceneLoaded && activeRoute === 'home' && !isMobile && (
        <NavigationMenu
          onSelectRoute={(route: Route) => setActiveRoute(route)}
          showSocialLinks={true}
        />
      )}

      {/* TopBar navbar for non‑home routes on desktop */}
      {activeRoute !== 'home' && !isMobile && <TopBarNavbar />}

      {/* Hamburger navigation on mobile */}
      {activeRoute !== 'home' && isMobile && (
        <NavigationMenu
          onSelectRoute={(route: Route) => setActiveRoute(route)}
          showSocialLinks={false}
          mobile
        />
      )}

      <Canvas className="w-full h-screen">
        <ambientLight intensity={0.5} />
        <spotLight
          decay={0}
          position={[5, 5, -10]}
          angle={0.15}
          penumbra={1}
          castShadow
        />
        <pointLight decay={0} position={[-10, -10, -10]} />

        {/* 3D Scene */}
        <Scene onLoaded={handleSceneLoaded} />

        {/* HTML overlay using ScrollControls and Scroll */}
        <ScrollControls pages={1}>
          <Scroll html style={{ width: '100vw', height: '100vh' }}>
            <main className="p-6 min-h-screen">
              {/* Routed Content */}
              <AnimatePresence exitBeforeEnter>
                {activeRoute !== 'home' && (
                  <motion.div
                    key={activeRoute}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 w-full flex items-center justify-center"
                  >
                    {renderContent()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fixed Go Back Button */}
              {activeRoute !== 'home' && (
                <GoBackButton onClick={() => setActiveRoute('home')} />
              )}
            </main>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
