// src/app/albums/page.tsx
'use client';

import { Html } from '@react-three/drei';

export default function Albums() {
  // Sample album data; replace with real data as needed.
  const albums = [
    { id: 1, title: 'Creative Cohesive Album', cover: '/album1.jpg', description: 'An innovative mix of sounds.' },
    { id: 2, title: 'Executive Produced Album', cover: '/album2.jpg', description: 'A polished, high-impact production.' },
    { id: 3, title: 'Featured Album', cover: '/album3.jpg', description: 'A standout project featuring multiple artists.' },
  ];

  return (
    <Html fullscreen>
      <div className="min-h-screen bg-primary text-tertiary p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Albums</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="bg-black bg-opacity-75 p-4 rounded">
              <img src={album.cover} alt={album.title} className="w-full h-auto mb-4" />
              <h2 className="text-2xl font-semibold">{album.title}</h2>
              <p>{album.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}
