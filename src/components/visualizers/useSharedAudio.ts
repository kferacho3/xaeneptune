/* -----------------------------------------------------------
   React hook - gives a *stable* AnalyserNode + cleanup logic.
------------------------------------------------------------ */
"use client";

import { destroy, getAnalyser, pause } from "@/utils/audioManager";
import { useEffect, useRef } from "react";

export default function useSharedAudio(src: string, isPaused: boolean) {
  const analyserRef = useRef<AnalyserNode | null>(null);

  /* create or update analyser when src / pause-state changes */
  useEffect(() => {
    analyserRef.current = getAnalyser(src, !isPaused);
    if (isPaused) pause();
  }, [src, isPaused]);

  /* tidy up on *unmount* of the visualiser */
  useEffect(() => destroy, []);

  return analyserRef;          //   <- stable ref
}
