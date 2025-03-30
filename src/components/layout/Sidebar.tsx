"use client";
import { Route } from "@/store/useRouteStore"; // Import the Route type
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  FaApple,
  FaInstagram,
  FaRecordVinyl,
  FaSoundcloud,
  FaSpotify,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  setActiveRoute: (route: Route) => void; // Updated type here
};

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: "100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

export default function Sidebar({
  isOpen,
  onClose,
  setActiveRoute,
}: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 right-0 w-full h-full bg-gray-900 text-white z-1000"
          initial="closed"
          animate="open"
          exit="closed"
          variants={sidebarVariants}
        >
          <div className="p-6 flex flex-col h-full">
            {/* Logo at the top */}
            <div className="mb-8 flex mt-20 justify-center">
              <Image
                src="/AntiHeroLogo.png"
                alt="AntiHero Logo"
                width={100}
                height={100}
                priority
              />
            </div>
            {/* Navigation Routes */}
            <ul className="flex-1 space-y-4 text-xl">
              <li
                className="cursor-pointer hover:text-red-500"
                onClick={() => {
                  setActiveRoute("music");
                  onClose();
                }}
              >
                Music
              </li>
              <li
                className="cursor-pointer hover:text-red-500"
                onClick={() => {
                  setActiveRoute("beats");
                  onClose();
                }}
              >
                Beats Available
              </li>
              <li
                className="cursor-pointer hover:text-red-500"
                onClick={() => {
                  setActiveRoute("albums");
                  onClose();
                }}
              >
                Albums
              </li>
              <li
                className="cursor-pointer hover:text-red-500"
                onClick={() => {
                  setActiveRoute("artist");
                  onClose();
                }}
              >
                Artist
              </li>
              <li
                className="cursor-pointer hover:text-red-500"
                onClick={() => {
                  setActiveRoute("connect");
                  onClose();
                }}
              >
                Contact
              </li>
              <li
                className="cursor-pointer hover:text-red-500"
                onClick={() => {
                  setActiveRoute("xaeneptunesworld");
                  onClose();
                }}
              >
                Xaeneptune&apos;s World
              </li>
            </ul>
            {/* Beats & Audio Visualizer Buttons */}
            <div className="space-y-4 mb-20">
              <button
                onClick={() => {
                  setActiveRoute("beats");
                  onClose();
                }}
                className="w-full py-2 rounded bg-gray-800 hover:bg-red-500 font-bold"
              >
                Beats
              </button>
              <button
                onClick={() => {
                  setActiveRoute("beats-visualizer");
                  onClose();
                }}
                className="w-full py-2 rounded bg-gray-800 hover:bg-red-500 font-bold"
              >
                Audio Visualizer
              </button>
            </div>
            {/* Social Media Icons */}
            <div className="flex justify-around text-2xl">
              <a
                href="https://www.beatstars.com/xaeneptune"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaRecordVinyl
                  title="Beatstars"
                  className="hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:bg-clip-text hover:text-transparent"
                />
              </a>
              <a
                href="https://music.apple.com/us/artist/xae-neptune/1636578727"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaApple
                  title="Apple Music"
                  className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:bg-clip-text hover:text-transparent"
                />
              </a>
              <a
                href="https://soundcloud.com/xaeneptune?ref=clipboard&p=i&c=1&si=78627C74A0204A24839E6C2E72191D40&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaSoundcloud
                  title="SoundCloud"
                  className="hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:bg-clip-text hover:text-transparent"
                />
              </a>
              <a
                href="https://open.spotify.com/artist/7iysPipkcsfGFVEgUMDzHQ?si=bn4UOIaTRiemprp-uOorVQ"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaSpotify
                  title="Spotify"
                  className="hover:bg-gradient-to-r hover:from-green-500 hover:to-green-300 hover:bg-clip-text hover:text-transparent"
                />
              </a>
              <a
                href="https://www.instagram.com/xaeneptune/#"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaInstagram
                  title="Instagram"
                  className="hover:bg-gradient-to-r hover:from-purple-500 hover:to-yellow-500 hover:bg-clip-text hover:text-transparent"
                />
              </a>
              <a
                href="https://twitter.com/xaeneptune"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaTwitter
                  title="Twitter"
                  className="hover:bg-gradient-to-r hover:from-purple-500 hover:to-yellow-500 hover:bg-clip-text hover:text-transparent"
                />
              </a>
              <a
                href="https://youtube.com/@xaeneptune"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 transform hover:scale-110"
              >
                <FaYoutube
                  title="Youtube"
                  className="hover:bg-gradient-to-r hover:from-purple-500 hover:to-yellow-500 hover:bg-clip-text hover:text-transparent"
                />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
