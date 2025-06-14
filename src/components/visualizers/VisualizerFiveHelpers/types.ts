/* ---------------------------------------------------------------------
 *  Shared type-aliases for Supershape-based “Visualizer Five”
 * ------------------------------------------------------------------ */
export type RenderingMode =
  | "solid"
  | "wireframe"
  | "rainbow"
  | "transparent";

export type ColorMode =
  | "default"
  | "audioAmplitude"
  | "frequencyBased"
  | "rainbow";

/* ------------------------------------------------------------------ */
/*  (Optional)  If you need the full parameter-union elsewhere,        */
/*  re-export it here so every helper lives behind a single import.    */
/* ------------------------------------------------------------------ */
export type ParamUnion =
  | import("@/types").SupershapeParams
  | import("@/types").SupershapeMeshParams
  | import("@/types").ParametricCode9Params
  | import("@/types").MakeMeshParams;
