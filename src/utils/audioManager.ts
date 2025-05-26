/* -----------------------------------------------------------
   A SINGLETON audio manager — guarantees exactly ONE player,
   ONE AudioContext and ONE AnalyserNode across the whole SPA.
------------------------------------------------------------ */
let element: HTMLAudioElement | null   = null;
let ctx: AudioContext        | null   = null;
let analyser: AnalyserNode    | null   = null;

/** create (or reuse) the global player & analyser */
export function getAnalyser(src: string, autoPlay = true): AnalyserNode {
  /* ───────────── initialise once ───────────── */
  if (!element) {
    element       = new Audio();
    element.crossOrigin = "anonymous";
    element.loop  = true;

    ctx           = new AudioContext();
    const source  = ctx.createMediaElementSource(element);
    analyser      = ctx.createAnalyser();
    analyser.fftSize = 512;

    source.connect(analyser);
    analyser.connect(ctx.destination);
  }

  /* ───────────── set / switch source ────────── */
  if (element!.src !== src) {
    element!.pause();
    element!.src = src;
  }

  /* ───────────── play / pause ──────────────── */
  if (autoPlay) element!.play().catch(() => {});
  else          element!.pause();

  return analyser!;
}

/** pause WITHOUT destroying (so another vis can resume) */
export function pause() {
  element?.pause();
}

/** stop EVERYTHING and release the AudioContext */
export function destroy() {
  if (element) {
    element.pause();
    element.src = "";
  }
  if (ctx) ctx.close();
  element = ctx = analyser = null;
}
