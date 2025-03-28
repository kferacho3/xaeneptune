"use client";

import Image from "next/image";
import {
  FaApple,
  FaRecordVinyl,
  FaSoundcloud,
  FaSpotify,
} from "react-icons/fa";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  setActiveRoute: (route: string) => void;
};

export default function Sidebar({
  isOpen,
  onClose,
  setActiveRoute,
}: SidebarProps) {
  return (
    <div
      className={`fixed top-0 right-0 w-72 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${
        isOpen ? "right-0" : "-right-72"
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="mb-8 flex justify-center">
          <Image
            src="/AntiHeroLogo.png"
            alt="AntiHero Logo"
            width={150}
            height={150}
            priority
          />
        </div>
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
              setActiveRoute("connect");
              onClose();
            }}
          >
            Xaeneptune&apos;s World
          </li>
        </ul>
        <div className="space-y-4 mb-4">
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
        <div className="flex justify-around text-2xl">
          <FaRecordVinyl
            title="Beastars (Record Label)"
            className="hover:text-red-500 cursor-pointer"
          />
          <FaApple
            title="Apple Music"
            className="hover:text-red-500 cursor-pointer"
          />
          <FaSoundcloud
            title="SoundCloud"
            className="hover:text-red-500 cursor-pointer"
          />
          <FaSpotify
            title="Spotify"
            className="hover:text-red-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
