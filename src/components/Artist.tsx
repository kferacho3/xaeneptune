// src/components/Artist.tsx
'use client';

import { Html } from '@react-three/drei';

export default function Artist() {
  return (
    <Html fullscreen>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ARTIST</h1>
        <p>Information about the main producer and produced tracks by XaeNeptune.</p>
      </div>
    </Html>
  );
}
