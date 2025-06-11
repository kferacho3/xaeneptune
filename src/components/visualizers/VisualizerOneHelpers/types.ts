// In VisualizerOneHelpers/types.ts, update:
// In VisualizerOneHelpers/types.ts
export interface VisualizerOneProps {
  audioUrl: string;
  isPaused: boolean;
  renderingMode?: RenderingMode;
  colorMode?: ColorMode;
  shapeMode?: ShapeMode;
  pointMode?: PointMode;
}

export type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
export type ColorMode = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";
export type ShapeMode = "sphere" | "cube" | "icosahedron" | "tetrahedron" | "dodecahedron" | "octahedron" | "torus";
export type PointMode = "points" | "smallCubes" | "crosses" | "circles" | "diamonds" | "triangles";