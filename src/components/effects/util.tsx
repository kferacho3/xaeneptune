import { useThree } from '@react-three/fiber';
import { BlendFunction } from 'postprocessing';
import { forwardRef, useLayoutEffect, useMemo } from 'react';

interface WrapEffectProps {
  blendFunction?: BlendFunction;
  opacity?: number;
  [key: string]: unknown;
}

// Constrain T to object so that it can be passed as the "object" prop in <primitive />
const wrapEffect = <T extends object>(
  effectImpl: new (props: Record<string, unknown>) => T,
  defaultBlendMode: BlendFunction = BlendFunction.NORMAL
) => {
  const WrappedEffect = forwardRef<T, WrapEffectProps>(({ blendFunction, opacity, ...props }, ref) => {
    const invalidate = useThree((state) => state.invalidate);
    const effect = useMemo(() => new effectImpl(props), [props]);

    useLayoutEffect(() => {
      // We assume that effect.blendMode exists
      // @ts-expect-error: assuming blendMode exists on effect
      effect.blendMode.blendFunction = blendFunction !== undefined ? blendFunction : defaultBlendMode;
      if (opacity !== undefined) {
        // @ts-expect-error: assuming opacity.value exists on effect.blendMode
        effect.blendMode.opacity.value = opacity;
      }
      invalidate();
    }, [blendFunction, effect, opacity, invalidate]);

    return <primitive object={effect} ref={ref} dispose={null} />;
  });
  WrappedEffect.displayName = "wrapEffect";
  return WrappedEffect;
};

export { wrapEffect };
