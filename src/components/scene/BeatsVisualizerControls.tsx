/* --------------------------------------------------------------------------
   src/components/scene/BeatsVisualizerControls.tsx
--------------------------------------------------------------------------- */
import {
  PointMode,
  ShapeMode,
  ColorMode,
  RenderingMode,
} from "@/components/visualizers/VisualizerOneHelpers/types";
import { VisualizerOneControls } from "@/components/visualizers/VisualizerOneHelpers/VisualizerOneControls";

/* --------------------------------------------------------------------- */
/*  Props                                                                */
/* --------------------------------------------------------------------- */
interface BeatsVisualizerControlsProps {
  uiHidden: boolean;
  isMobile: boolean;
  renderingMode: RenderingMode;
  setRenderingMode: (m: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  shapeMode: ShapeMode;
  setShapeMode: (m: ShapeMode) => void;
  pointMode: PointMode;
  setPointMode: (m: PointMode) => void;
}

/* --------------------------------------------------------------------- */
/*  Component                                                            */
/* --------------------------------------------------------------------- */
export function BeatsVisualizerControls({
  uiHidden,
  isMobile,
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  shapeMode,
  setShapeMode,
  pointMode,
  setPointMode,
}: BeatsVisualizerControlsProps) {
  if (uiHidden) return null;

  return (
    <VisualizerOneControls
      isMobile={isMobile}
      renderingMode={renderingMode}
      setRenderingMode={setRenderingMode}
      colorMode={colorMode}
      setColorMode={setColorMode}
      shapeMode={shapeMode}
      setShapeMode={setShapeMode}
      pointMode={pointMode}
      setPointMode={setPointMode}
    />
  );
}