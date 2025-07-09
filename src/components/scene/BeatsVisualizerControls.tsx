/* --------------------------------------------------------------------------
   src/components/scene/BeatsVisualizerControls.tsx
--------------------------------------------------------------------------- */
import {
  PointMode,
  ShapeMode,
  ColorMode as V1ColorMode,
  RenderingMode as V1RenderingMode,
} from "@/components/visualizers/VisualizerOneHelpers/types";
import { VisualizerOneControls } from "@/components/visualizers/VisualizerOneHelpers/VisualizerOneControls";

import {
  FractalType,
  ColorMode as V2ColorMode,
  RenderingMode as V2RenderingMode,
} from "@/components/visualizers/VisualizerTwoHelpers/types";
import { VisualizerTwoControls } from "@/components/visualizers/VisualizerTwoHelpers/VisualizerTwoControls";

import {
  ColorPaletteName,
  EnvironmentMode,
  RenderingMode as V3RenderingMode,
} from "@/components/visualizers/VisualizerThreeHelpers/types";
import { VisualizerThreeControls } from "@/components/visualizers/VisualizerThreeHelpers/VisualizerThreeControls";

import {
  ColorMode as V4ColorMode,
  RenderingMode as V4RenderingMode,
} from "@/components/visualizers/VisualizerFourHelpers/types";
import { VisualizerFourControls } from "@/components/visualizers/VisualizerFourHelpers/VisualizerFourControls";

/* ---------- Supershape (V5) ------------------------------------------- */
import {
  ColorMode as V5ColorMode,
  ParamUnion as V5ParamUnion,
  RenderingMode as V5RenderingMode,
} from "@/components/visualizers/VisualizerFiveHelpers/types";
import { VisualizerFiveControls } from "@/components/visualizers/VisualizerFiveHelpers/VisualizerFiveControls";

/* ---------- Physics Visualizer Six ----------------------------------- */
import {
  ColorMode6 as V6ColorMode,
  RenderingMode6 as V6RenderingMode,
  ShapeMode6 as V6ShapeMode,
} from "@/components/visualizers/VisualizerSix";

/*  ⬇️  NOTE: same path, now **named** import  */
import VisualizerSixControls from "../visualizers/VisualizerSixHelpers/VisualizerSixControls";
import { VisualizerType } from "./BeatAudioVisualizerScene";

/* --------------------------------------------------------------------- */
/*  Props                                                                */
/* --------------------------------------------------------------------- */
interface BeatsVisualizerControlsProps {
  type: VisualizerType;
  uiHidden: boolean;

  /* V1 */
  v1RenderingMode: V1RenderingMode;
  setV1RenderingMode: (m: V1RenderingMode) => void;
  v1ColorMode: V1ColorMode;
  setV1ColorMode: (m: V1ColorMode) => void;
  v1ShapeMode: ShapeMode;
  setV1ShapeMode: (m: ShapeMode) => void;
  v1PointMode: PointMode;
  setV1PointMode: (m: PointMode) => void;

  /* V2 */
  v2RenderingMode: V2RenderingMode;
  setV2RenderingMode: (m: V2RenderingMode) => void;
  v2ColorMode: V2ColorMode;
  setV2ColorMode: (m: V2ColorMode) => void;
  v2FractalType: FractalType;
  setV2FractalType: (t: FractalType) => void;

  /* V3 */
  v3EnvironmentMode: EnvironmentMode;
  setV3EnvironmentMode: (m: EnvironmentMode) => void;
  v3RenderingMode: V3RenderingMode;
  setV3RenderingMode: (m: V3RenderingMode) => void;
  v3ColorPalette: ColorPaletteName;
  setV3ColorPalette: (p: ColorPaletteName) => void;
  v3FftIntensity: number;
  setV3FftIntensity: (i: number) => void;

  /* V4 */
  v4RenderingMode: V4RenderingMode;
  setV4RenderingMode: (m: V4RenderingMode) => void;
  v4ColorMode: V4ColorMode;
  setV4ColorMode: (m: V4ColorMode) => void;
  v4FftIntensity: number;
  setV4FftIntensity: (i: number) => void;
  v4RandomPalette: () => void;

  /* V5 (Supershape) */
  v5ConfigIndex: number;
  setV5ConfigIndex: (i: number) => void;
  v5RenderingMode: V5RenderingMode;
  setV5RenderingMode: (m: V5RenderingMode) => void;
  v5ColorMode: V5ColorMode;
  setV5ColorMode: (m: V5ColorMode) => void;
  v5Params: V5ParamUnion;

  /* V6 (Physics) */
  v6RenderingMode: V6RenderingMode;
  setV6RenderingMode: (m: V6RenderingMode) => void;
  v6ColorMode: V6ColorMode;
  setV6ColorMode: (m: V6ColorMode) => void;
  v6ShapeMode: V6ShapeMode;
  setV6ShapeMode: (m: V6ShapeMode) => void;
  v6PaletteIndex: number;
  setV6PaletteIndex: (i: number) => void;

  v6TotalInst: number;
  v6ShapeCount: number;
  v6Bass: number;
  v6Mid: number;
  v6Treble: number;
  v6IsPaused: boolean;

  v6RandShape: () => void;
  v6RandAll: () => void;
  v6Palettes: readonly string[][];
}

/* --------------------------------------------------------------------- */
/*  Component                                                            */
/* --------------------------------------------------------------------- */
export function BeatsVisualizerControls({
  type,
  uiHidden,

  /* V1 */
  v1RenderingMode,
  setV1RenderingMode,
  v1ColorMode,
  setV1ColorMode,
  v1ShapeMode,
  setV1ShapeMode,
  v1PointMode,
  setV1PointMode,

  /* V2 */
  v2RenderingMode,
  setV2RenderingMode,
  v2ColorMode,
  setV2ColorMode,
  v2FractalType,
  setV2FractalType,

  /* V3 */
  v3EnvironmentMode,
  setV3EnvironmentMode,
  v3RenderingMode,
  setV3RenderingMode,
  v3ColorPalette,
  setV3ColorPalette,
  v3FftIntensity,
  setV3FftIntensity,

  /* V4 */
  v4RenderingMode,
  setV4RenderingMode,
  v4ColorMode,
  setV4ColorMode,
  v4FftIntensity,
  setV4FftIntensity,
  v4RandomPalette,

  /* V5 */
  v5ConfigIndex,
  setV5ConfigIndex,
  v5RenderingMode,
  setV5RenderingMode,
  v5ColorMode,
  setV5ColorMode,
  v5Params,

  /* V6 */
  v6RenderingMode,
  setV6RenderingMode,
  v6ColorMode,
  setV6ColorMode,
  v6ShapeMode,
  setV6ShapeMode,
  v6PaletteIndex,
  setV6PaletteIndex,
  v6TotalInst,
  v6ShapeCount,
  v6Bass,
  v6Mid,
  v6Treble,
  v6IsPaused,
  v6RandShape,
  v6RandAll,
  v6Palettes,
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

      {type === "three" && (
        <VisualizerThreeControls
          environmentMode={v3EnvironmentMode}
          setEnvironmentMode={setV3EnvironmentMode}
          renderingMode={v3RenderingMode}
          setRenderingMode={setV3RenderingMode}
          colorPalette={v3ColorPalette}
          setColorPalette={setV3ColorPalette}
          fftIntensity={v3FftIntensity}
          setFftIntensity={setV3FftIntensity}
        />
      )}

      {type === "four" && (
        <VisualizerFourControls
          renderingMode={v4RenderingMode}
          setRenderingMode={setV4RenderingMode}
          colorMode={v4ColorMode}
          setColorMode={setV4ColorMode}
          fftIntensity={v4FftIntensity}
          setFftIntensity={setV4FftIntensity}
          randomPalette={v4RandomPalette}
        />
      )}

      {type === "supershape" && (
        <VisualizerFiveControls
          configIndex={v5ConfigIndex}
          setConfigIndex={setV5ConfigIndex}
          renderingMode={v5RenderingMode}
          setRenderingMode={setV5RenderingMode}
          colorMode={v5ColorMode}
          setColorMode={setV5ColorMode}
          params={v5Params}
        />
      )}

      {type === "six" && (
        <VisualizerSixControls
          /* live state */
          shapeMode={v6ShapeMode}
          renderingMode={v6RenderingMode}
          colorMode={v6ColorMode}
          paletteIndex={v6PaletteIndex}
          totalInst={v6TotalInst}
          shapeCount={v6ShapeCount}
          bass={v6Bass}
          mid={v6Mid}
          treble={v6Treble}
          isPaused={v6IsPaused}
          /* setters */
          setShapeMode={setV6ShapeMode}
          setRenderingMode={setV6RenderingMode}
          setColorMode={setV6ColorMode}
          setPaletteIdx={setV6PaletteIndex}
          /* helpers */
          randShape={v6RandShape}
          randAll={v6RandAll}
          palettes={v6Palettes}
        />
      )}
    </>
  );
}
