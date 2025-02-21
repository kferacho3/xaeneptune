'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MouseEvent, ReactElement, useState } from 'react';
import {
  FaBars,
  FaCompactDisc,
  FaEnvelope,
  FaHeadphones,
  FaMusic,
  FaSearch,
  FaUser,
} from 'react-icons/fa';
import { GiPlanetCore } from 'react-icons/gi';

export type Route =
  | 'music'
  | 'artist'
  | 'beats'
  | 'albums'
  | 'connect'
  | 'xaeneptunesworld';

interface NavigationMenuProps {
  onSelectRoute: (route: Route) => void;
  showSocialLinks?: boolean;
  mobile?: boolean;
}

const routes: { name: string; route: Route; icon: React.ElementType }[] = [
  { name: 'MUSIC', route: 'music', icon: FaMusic },
  { name: 'ARTIST', route: 'artist', icon: FaUser },
  { name: 'BEATS AVAILABLE', route: 'beats', icon: FaHeadphones },
  { name: 'ALBUMS', route: 'albums', icon: FaCompactDisc },
  { name: 'CONNECT', route: 'connect', icon: FaEnvelope },
  { name: "XAENEPTUNE'S WORLD", route: 'xaeneptunesworld', icon: GiPlanetCore },
];

// Framer Motion variants for the circular (desktop) menu
const circularContainerVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1,
    },
  },
};

const circularItemVariants = {
  hidden: { x: 0, y: 0, opacity: 0 },
  visible: (custom: { x: number; y: number; delay: number }) => ({
    x: custom.x,
    y: custom.y,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25, delay: custom.delay },
  }),
};

export default function NavigationMenu({
  onSelectRoute,
  showSocialLinks = false,
  mobile = false,
}: NavigationMenuProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const handleExploreClick = () => {
    setExpanded(true);
  };

  const handleRouteClick = (route: Route, e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setExpanded(false);
    setHamburgerOpen(false);
    onSelectRoute(route);
  };

  // For circular menu layout (desktop)
  const radius = 150; // matches the provided CSS radius
  const angleIncrement = (2 * Math.PI) / routes.length;

  if (mobile) {
    // Mobile: Render a conventional hamburger menu at the top.
    return (
      <div className="fixed top-0 left-0 w-full z-30 select-none">
        <div className="flex justify-between items-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-md border-b border-white">
          <button onClick={() => setHamburgerOpen(!hamburgerOpen)} className="text-white">
            <FaBars size={24} />
          </button>
          <div className="text-white font-futuristic">Futuristic Nav</div>
          <div className="w-6"></div>
        </div>
        <AnimatePresence>
          {hamburgerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[rgba(0,0,0,0.8)] backdrop-blur-md border-b border-white"
            >
              <ul className="flex flex-col">
                {routes.map((item) => (
                  <li key={item.route}>
                    <button
                      onClick={(e) => handleRouteClick(item.route, e)}
                      className="w-full text-left px-4 py-2 border-b border-white text-white hover:bg-[var(--secondary-color)]"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
                {showSocialLinks && (
                  <li className="flex justify-center space-x-4 py-2">
                    <a href="https://twitter.com" className="text-white hover:text-[var(--secondary-color)]">
                      Twitter
                    </a>
                    <a href="https://instagram.com" className="text-white hover:text-[var(--secondary-color)]">
                      Instagram
                    </a>
                    <a href="https://facebook.com" className="text-white hover:text-[var(--secondary-color)]">
                      Facebook
                    </a>
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop: Render the circular popup navigation.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 select-none"
    >
      <div className="relative w-96 h-96 flex items-center justify-center rounded-full border border-white/30 bg-[rgba(0,0,0,0.5)] backdrop-blur-md shadow-2xl">
        {!expanded && (
          <motion.button
            onClick={handleExploreClick}
            whileHover={{ scale: 1.1 }}
            className="w-[70px] h-[70px] rounded-full bg-white border border-white flex flex-col items-center justify-center text-black font-futuristic text-xl shadow transition-all duration-300 cursor-pointer"
          >
            <FaSearch className="text-2xl" />
            <span className="absolute -bottom-8 text-xs">Explore</span>
          </motion.button>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="absolute inset-0"
              variants={circularContainerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {routes.map((item, index) => {
                const angle = index * angleIncrement - Math.PI / 2;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                const IconComponent = item.icon;
                return (
                  <motion.button
                    key={item.route}
                    custom={{ x, y, delay: index * 0.1 }}
                    variants={circularItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.2 }}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => handleRouteClick(item.route, e)}
                    className="absolute w-[70px] h-[70px] rounded-full bg-[#ECEFF1] border border-white flex flex-col items-center justify-center text-black font-futuristic shadow transition-all duration-600 cursor-pointer z-[-2] opacity-0"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <IconComponent className="text-xl" />
                    <span className="text-[10px] mt-1 text-center">
                      {item.name.split(' ').map((word, i) => (
                        <span key={i}>
                          {word}
                          {i < item.name.split(' ').length - 1 && <br />}
                        </span>
                      ))}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {showSocialLinks && (
          <div className="absolute -bottom-20 w-full flex justify-center space-x-4">
            <a href="https://twitter.com" className="text-white hover:text-[var(--secondary-color)] font-semibold">
              Twitter
            </a>
            <a href="https://instagram.com" className="text-white hover:text-[var(--secondary-color)] font-semibold">
              Instagram
            </a>
            <a href="https://facebook.com" className="text-white hover:text-[var(--secondary-color)] font-semibold">
              Facebook
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
