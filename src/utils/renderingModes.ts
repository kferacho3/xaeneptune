import { RenderingMode } from "@/components/visualizers/VisualizerFourHelpers/types";

export const RENDER_MODE_CODE: Record<RenderingMode, number> = {
  solid:            0,
  wireframe:        1,
  grayscale:        2,
  metallicRainbow:  3,
  nebula:           4,
  auroraCrystal:    5,
};
