import { create } from "zustand";

export type Route =
  | "home"
  | "music"
  | "artist"
  | "beats"
  | "beats-visualizer"
  | "albums"
  | "xaeneptunesworld"
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
}

export const useRouteStore = create<RouteStore>((set) => ({
  activeRoute: "home",
  setActiveRoute: (route: Route) => set({ activeRoute: route }),
  visualizerMode: false,
  setVisualizerMode: (mode: boolean) => set({ visualizerMode: mode }),
  audioUrlForBeat:
    "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/SEP+2024/Xae+x+VGS+Midnight+x+beatsbylmc+-+doumissme+126+(C+minor).mp3",
  setAudioUrlForBeat: (url: string) => set({ audioUrlForBeat: url }),
  onBeatGoBack: undefined,
  setOnBeatGoBack: (cb?: () => void) => set({ onBeatGoBack: cb }),
  onBeatShuffle: undefined,
  setOnBeatShuffle: (cb?: () => void) => set({ onBeatShuffle: cb }),
}));
