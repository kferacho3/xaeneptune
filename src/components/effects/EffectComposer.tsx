import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { LensFlareEffect } from './LensFlareEffect';
import { wrapEffect } from './util';

const WrappedLensFlare = wrapEffect(LensFlareEffect);

export default function EffectsComposerComponent() {
  return (
    <EffectComposer>
      <Vignette />
      <Bloom mipmapBlur radius={0.9} luminanceThreshold={0.966} intensity={2} levels={4} />
      <WrappedLensFlare enabled={true} />
    </EffectComposer>
  );
}
