import { BlendFunction, Effect } from 'postprocessing';
import { Color, Texture, Uniform } from 'three';
import LensFlareShader from './shaders/LensFlareShader';

export interface LensFlareEffectProps {
  blendFunction?: BlendFunction;
  enabled?: boolean;
  glareSize?: number;
  lensPosition?: [number, number];
  iResolution?: [number, number];
  starPoints?: number;
  flareSize?: number;
  flareSpeed?: number;
  flareShape?: number;
  animated?: boolean;
  anamorphic?: boolean;
  colorGain?: Color;
  lensDirtTexture?: Texture | null;
  haloScale?: number;
  secondaryGhosts?: boolean;
  aditionalStreaks?: boolean;
  ghostScale?: number;
  opacity?: number;
  starBurst?: boolean;
}

export class LensFlareEffect extends Effect {
  constructor({
    blendFunction = BlendFunction.NORMAL,
    enabled = true,
    glareSize = 0.02,
    lensPosition = [0.01, 0.01],
    iResolution = [0, 0],
    starPoints = 6,
    flareSize = 0.01,
    flareSpeed = 0.01,
    flareShape = 0.01,
    animated = true,
    anamorphic = false,
    colorGain = new Color(10, 70, 10),
    lensDirtTexture = null,
    haloScale = 0.5,
    secondaryGhosts = true,
    aditionalStreaks = true,
    ghostScale = 0.0,
    opacity = 1.0,
    starBurst = true
  }: LensFlareEffectProps = {}) {
    // Use Map<string, Uniform<unknown>> to combine different types of uniforms.
    super('LensFlareEffect', LensFlareShader.fragmentShader, {
      blendFunction,
      uniforms: new Map<string, Uniform<unknown>>([
        ['enabled', new Uniform(enabled)],
        ['glareSize', new Uniform(glareSize)],
        ['lensPosition', new Uniform(lensPosition)],
        ['iTime', new Uniform(0)],
        ['iResolution', new Uniform(iResolution)],
        ['starPoints', new Uniform(starPoints)],
        ['flareSize', new Uniform(flareSize)],
        ['flareSpeed', new Uniform(flareSpeed)],
        ['flareShape', new Uniform(flareShape)],
        ['animated', new Uniform(animated)],
        ['anamorphic', new Uniform(anamorphic)],
        ['colorGain', new Uniform(colorGain)],
        ['lensDirtTexture', new Uniform(lensDirtTexture)],
        ['haloScale', new Uniform(haloScale)],
        ['secondaryGhosts', new Uniform(secondaryGhosts)],
        ['aditionalStreaks', new Uniform(aditionalStreaks)],
        ['ghostScale', new Uniform(ghostScale)],
        ['starBurst', new Uniform(starBurst)],
        ['opacity', new Uniform(opacity)]
      ]) as Map<string, Uniform<unknown>>
    });
  }

  update(_renderer: unknown, _inputBuffer: unknown, deltaTime: number): void {
    this.uniforms.get('iTime')!.value += deltaTime;
  }
}
