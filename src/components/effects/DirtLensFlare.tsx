'use client';

import { useTexture } from '@react-three/drei';
import { useControls } from 'leva';
import { BlendFunction } from 'postprocessing'; // Import BlendFunction
import { useMemo } from 'react';
import { Color } from 'three';
import { LensFlareEffect } from './LensFlareEffect';
import { wrapEffect } from './util';

// Wrap your LensFlareEffect class to make it a React component
const WrappedLensFlareEffect = wrapEffect(LensFlareEffect);

function DirtLensFlare() {
  // Load the texture from /public
  const texture = useTexture('/lensDirtTexture.png');

  // Setup controls with Leva - Modified initial values for better visibility
  const controls = useControls(
    {
      enabled: { value: true, label: 'enabled?' },
      opacity: { value: 0.0, min: 0, max: 1, label: 'opacity' },
      position: { value: { x: 0, y: 20, z: -70 }, step: 1, label: 'position' }, // Center position for testing
      glareSize: { value: 0.0, min: 0.01, max: 1, label: 'glareSize' }, // Increased glareSize
      starPoints: { value: 6, step: 1, min: 0, max: 32, label: 'starPoints' },
      animated: { value: true, label: 'animated?' },
      followMouse: { value: false, label: 'followMouse?' },
      anamorphic: { value: false, label: 'anamorphic?' },
      colorGain: { value: '#1f23c1', label: 'colorGain' }, // Red color for testing
      flareSpeed: { value: 0.4, step: 0.001, min: 0, max: 1, label: 'flareSpeed' },
      flareShape: { value: 0.1, step: 0.001, min: 0, max: 1, label: 'flareShape' },
      flareSize: { value: 0.05, step: 0.001, min: 0, max: 0.01, label: 'flareSize' }, // Increased flareSize
      secondaryGhosts: { value: true, label: 'secondaryGhosts?' },
      ghostScale: { value: 0.1, min: 0.01, max: 1, label: 'ghostScale' },
      aditionalStreaks: { value: true, label: 'aditionalStreaks?' },
      starBurst: { value: true, label: 'starBurst?' },
      haloScale: { value: 0.5, step: 0.01, min: 0.3, max: 1, label: 'haloScale' },
      blendFunction: { value: 'ADD', options: ['NORMAL', 'ADD', 'SCREEN', 'ALPHA'], label: 'Blend Function' } // Added blend function control
    },
    { collapsed: true }
  );

  // Destructure your control values, including blendFunction
  const {
    enabled,
    opacity,
    position,
    glareSize,
    starPoints,
    animated,
    anamorphic,
    colorGain,
    flareSpeed,
    flareShape,
    flareSize,
    secondaryGhosts,
    ghostScale,
    aditionalStreaks,
    starBurst,
    haloScale,
    blendFunction, // Destructure blendFunction
  } = controls;

  // Memoize final props
  const finalProps = useMemo(
    () => ({
      enabled,
      opacity,
      lensPosition: [position.x, position.y],
      glareSize,
      starPoints,
      animated,
      anamorphic,
      colorGain: new Color(colorGain),
      flareSpeed,
      flareShape,
      flareSize,
      secondaryGhosts,
      ghostScale,
      aditionalStreaks,
      starBurst,
      haloScale,
      lensDirtTexture: texture,
      blendFunction: BlendFunction[blendFunction as keyof typeof BlendFunction], // Use selected blend function
    }),
    [
      enabled,
      opacity,
      position,
      glareSize,
      starPoints,
      animated,
      anamorphic,
      colorGain,
      flareSpeed,
      flareShape,
      flareSize,
      secondaryGhosts,
      ghostScale,
      aditionalStreaks,
      starBurst,
      haloScale,
      texture,
      blendFunction, // Add blendFunction to dependency array
    ]
  );

  return <WrappedLensFlareEffect {...finalProps} />;
}

export default DirtLensFlare;