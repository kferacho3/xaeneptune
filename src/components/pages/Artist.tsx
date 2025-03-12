// /src/components/pages/Artist.tsx
'use client';

import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';

interface SpotifyArtist {
  name: string;
  images?: { url: string }[];
  followers: { total: number };
  genres: string[];
}

export default function Artist() {
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await fetch('/api/spotify/artist?artistId=7iysPipkcsfGFVEgUMDzHQ');
        const data = await res.json();
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, []);

  if (loading || !artist) {
    return (
      <Html fullscreen>
        <div>Loading Artist Data...</div>
      </Html>
    );
  }

  return (
    <Html fullscreen>
      <div className="min-h-screen text-tertiary p-4 relative">
        <h1 className="text-4xl font-bold text-center mb-8">{artist.name}</h1>
        {artist.images && artist.images[0] && (
          <div className="flex justify-center mb-4">
            <img src={artist.images[0].url} alt={artist.name} className="w-48 rounded" />
          </div>
        )}
        <p className="text-center">Followers: {artist.followers.total}</p>
        <p className="text-center">Genres: {artist.genres.join(', ')}</p>
      </div>
    </Html>
  );
}
