import { useThree } from '@react-three/fiber';
import { BlendFunction, Effect } from 'postprocessing';
import {
    forwardRef,
    MutableRefObject,
    useLayoutEffect,
    useMemo
} from 'react';
import { Object3D } from 'three';
  
  /** A reference type pointing to a THREE.Object3D */
  type ObjectRef = MutableRefObject<Object3D>;
  
  /** Common default props for an Effect, e.g. blend mode and opacity */
  type DefaultProps = Partial<{
    blendFunction: BlendFunction;
    opacity: number;
  }>;
  
  /** Type-guard that checks if `ref` is a React MutableRefObject */
  function isRef(ref: unknown): ref is ObjectRef {
    return typeof ref === 'object' && ref !== null && 'current' in ref;
  }
  
  /**
   * Resolve a ref that might be a plain Object3D or a MutableRefObject<Object3D>.
   * Returns the actual Object3D instance in either case.
   */
  export function resolveRef(ref: Object3D | ObjectRef): Object3D {
    return isRef(ref) ? ref.current : ref;
  }
  
  /**
   * A function that takes an Effect constructor (`effectImpl`) and returns a React component
   * that, when used in a scene, creates and configures that effect in postprocessing.
   *
   * Usage:
   *   const MyWrappedEffect = wrapEffect(MyEffectClass);
   *   ...
   *   <MyWrappedEffect blendFunction={...} opacity={...} someOtherProp={...} />
   */
  export function wrapEffect<
    // T is a constructor type of a postprocessing.Effect subclass
    T extends new (props: ConstructorParameters<T>[0]) => Effect
  >(
    effectImpl: T,
    defaultBlendMode: BlendFunction = BlendFunction.NORMAL
  ) {
    // The returned component:
    return forwardRef<InstanceType<T>, ConstructorParameters<T>[0] & DefaultProps>(
      function Wrap({ blendFunction, opacity, ...props }, ref) {
        // We can trigger React Three Fiber to re-render
        const invalidate = useThree((state) => state.invalidate);
  
        // Create the effect once, or whenever 'props' changes
        const effect = useMemo(() => {
          return new effectImpl(props as ConstructorParameters<T>[0]);
        }, [props]);
  
        // Update effect properties whenever blendFunction / opacity change
        useLayoutEffect(() => {
          effect.blendMode.blendFunction =
            blendFunction || blendFunction === 0 ? blendFunction : defaultBlendMode;
  
          if (opacity !== undefined) {
            effect.blendMode.opacity.value = opacity;
          }
  
          // Invalidate the R3F state so the effect gets re-rendered
          invalidate();
        }, [blendFunction, effect.blendMode, opacity, invalidate]);
  
        // Return a <primitive> so R3F can attach the effect to its scene
        return <primitive ref={ref} object={effect} dispose={null} />;
      }
    );
  }
  