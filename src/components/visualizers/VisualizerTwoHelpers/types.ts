// src/components/visualizers/VisualizerTwoHelpers/types.ts
export type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
export type ColorMode = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";
export type FractalType =
  | "mandelbulb"
  | "mandelbox"
  | "mengerSponge"
  | "cantorDust"
  | "sierpinskiCarpet"
  | "juliaSet"
  | "pythagorasTree"
  | "kochSnowflake"
  | "nFlake"
  | "sierpinskiTetrahedron"
  | "buddhabrot"
  | "pythagorasTree3D"
  | "apollonianGasket";

export interface VisualizerTwoProps {
  audioUrl: string;
  isPaused: boolean;
  renderingMode?: RenderingMode;
  colorMode?: ColorMode;
  fractalType?: FractalType;
}

export const fractalTypes: FractalType[] = [
  "mandelbulb",
  "mandelbox",
  "mengerSponge",
  "cantorDust",
  "sierpinskiCarpet",
  "juliaSet",
  "pythagorasTree",
  "kochSnowflake",
  "nFlake",
  "sierpinskiTetrahedron",
  "buddhabrot",
  "pythagorasTree3D",
  "apollonianGasket",
];

export const availableRenderingModes: RenderingMode[] = [
  "solid",
  "wireframe",
  "rainbow",
  "transparent",
];

export const availableColorModes: ColorMode[] = [
  "default",
  "audioAmplitude",
  "frequencyBased",
  "rainbow",
];