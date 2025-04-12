import { create } from "zustand";

export type Route =
  | "home"
  | "music"
  | "artist"
  | "beats"
  | "beats-visualizer"
  | "albums"
  | "xaeneptune"
  | "connect";

interface RouteStore {
  activeRoute: Route;
  setActiveRoute: (route: Route) => void;
  visualizerMode: boolean;
  setVisualizerMode: (mode: boolean) => void;
  audioUrlForBeat: string;
  setAudioUrlForBeat: (url: string) => void;
  onBeatGoBack?: () => void;
  setOnBeatGoBack: (cb?: () => void) => void;
  onBeatShuffle?: () => void;
  setOnBeatShuffle: (cb?: () => void) => void;
  hoveredRoute?: Route;
  setHoveredRoute: (route?: Route) => void;
  // New nightMode state for environment mode.
  nightMode: boolean;
  setNightMode: (mode: boolean) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  activeRoute: "home",
  setActiveRoute: (route) => set({ activeRoute: route }),
  visualizerMode: false,
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  audioUrlForBeat:
    "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/SEP+2024/Xae+x+VGS+Midnight+x+beatsbylmc+-+doumissme+126+(C+minor).mp3",
  setAudioUrlForBeat: (url: string) => set({ audioUrlForBeat: url }),
  onBeatGoBack: undefined,
  setOnBeatGoBack: (cb) => set({ onBeatGoBack: cb }),
  onBeatShuffle: undefined,
  setOnBeatShuffle: (cb) => set({ onBeatShuffle: cb }),
  hoveredRoute: undefined,
  setHoveredRoute: (route) => set({ hoveredRoute: route }),
  // Set default mode to night mode (true means "night")
  nightMode: true,
  setNightMode: (mode: boolean) => set({ nightMode: mode }),
}));
