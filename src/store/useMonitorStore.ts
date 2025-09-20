/* ========================================================================
   useMonitorStore.ts – global state for the AntiHeroMonitor “screen”
   ===================================================================== */
   import { create } from "zustand";

   /* --------------------------- public API --------------------------- */
  export type TextureName = "antiheroesPerlinNoise";
   
   interface MonitorState {
     screenName: TextureName;
     setScreenName: (name: TextureName) => void;
   }
   
   /* ------------------------- store instance ------------------------- */
   export const useMonitorStore = create<MonitorState>()((set) => ({
     screenName: "antiheroesPerlinNoise",
     setScreenName: (n) => set({ screenName: n }),
   }));
   