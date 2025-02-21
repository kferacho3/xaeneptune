// src/components/Music.tsx
'use client';

import { Html } from '@react-three/drei';

export default function Music() {
  return (
    <Html fullscreen>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MUSIC</h1>
        <p>Timeline of tracks with details (artist, track name, producer, cover, snippet).</p>
      </div>
    </Html>
  );
}
