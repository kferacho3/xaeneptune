// src/components/XaeneptunesWorld.tsx
'use client';

import { Html } from '@react-three/drei';

export default function XaeneptunesWorld() {
  return (
    <Html fullscreen>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">XAENEPTUNE'S WORLD</h1>
        <p>Showcase of creative projects, ventures, and collaborations related to XaeNeptune.</p>
        <div className="mt-8 flex justify-center space-x-4">
          <a href="https://twitter.com" className="text-white hover:text-[#013a63]">Twitter</a>
          <a href="https://instagram.com" className="text-white hover:text-[#013a63]">Instagram</a>
          <a href="https://facebook.com" className="text-white hover:text-[#013a63]">Facebook</a>
        </div>
      </div>
    </Html>
  );
}
