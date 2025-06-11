// src/components/scene/BeatsVisualizerControls.tsx
import {
    PointMode,
    ShapeMode,
    ColorMode as V1ColorMode,
    RenderingMode as V1RenderingMode
} from "@/components/visualizers/VisualizerOneHelpers/types";
import { VisualizerOneControls } from "@/components/visualizers/VisualizerOneHelpers/VisualizerOneControls";
import {
    FractalType,
    ColorMode as V2ColorMode,
    RenderingMode as V2RenderingMode
} from "@/components/visualizers/VisualizerTwoHelpers/types";
import { VisualizerTwoControls } from "@/components/visualizers/VisualizerTwoHelpers/VisualizerTwoControls";
import { VisualizerType } from "./BeatAudioVisualizerScene";

interface BeatsVisualizerControlsProps {
  type: VisualizerType;
  uiHidden: boolean;
  // VisualizerOne props
  v1RenderingMode: V1RenderingMode;
  setV1RenderingMode: (mode: V1RenderingMode) => void;
  v1ColorMode: V1ColorMode;
  setV1ColorMode: (mode: V1ColorMode) => void;
  v1ShapeMode: ShapeMode;
  setV1ShapeMode: (mode: ShapeMode) => void;
  v1PointMode: PointMode;
  setV1PointMode: (mode: PointMode) => void;
  // VisualizerTwo props
  v2RenderingMode: V2RenderingMode;
  setV2RenderingMode: (mode: V2RenderingMode) => void;
  v2ColorMode: V2ColorMode;
  setV2ColorMode: (mode: V2ColorMode) => void;
  v2FractalType: FractalType;
  setV2FractalType: (type: FractalType) => void;
}

export function BeatsVisualizerControls({
  type,
  uiHidden,
  v1RenderingMode,
  setV1RenderingMode,
  v1ColorMode,
  setV1ColorMode,
  v1ShapeMode,
  setV1ShapeMode,
  v1PointMode,
  setV1PointMode,
  v2RenderingMode,
  setV2RenderingMode,
  v2ColorMode,
  setV2ColorMode,
  v2FractalType,
  setV2FractalType,
}: BeatsVisualizerControlsProps) {
  if (uiHidden) return null;

  return (
    <>
      {type === "one" && (
        <VisualizerOneControls
          renderingMode={v1RenderingMode}
          setRenderingMode={setV1RenderingMode}
          colorMode={v1ColorMode}
          setColorMode={setV1ColorMode}
          shapeMode={v1ShapeMode}
          setShapeMode={setV1ShapeMode}
          pointMode={v1PointMode}
          setPointMode={setV1PointMode}
        />
      )}
      
      {type === "two" && (
        <VisualizerTwoControls
          fractalType={v2FractalType}
          setFractalType={setV2FractalType}
          renderingMode={v2RenderingMode}
          setRenderingMode={setV2RenderingMode}
          colorMode={v2ColorMode}
          setColorMode={setV2ColorMode}
        />
      )}
    </>
  );
}