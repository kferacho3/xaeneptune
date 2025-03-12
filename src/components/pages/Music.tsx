// /src/components/pages/Music.tsx
'use client';

import { Html } from '@react-three/drei';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  album: {
    name: string;
    images: { url: string }[];
    release_date: string;
  };
}

interface TopTracksResponse {
  tracks: SpotifyTrack[];
}

export default function Music() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const res = await fetch('/api/spotify/artist-top-tracks?artistId=7iysPipkcsfGFVEgUMDzHQ');
        const data: TopTracksResponse = await res.json();
        setTracks(data.tracks);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopTracks();
  }, []);

  if (loading) {
    return (
      <Html fullscreen>
        <div>Loading Top Tracks...</div>
      </Html>
    );
  }

  return (
    <Html fullscreen>
      <div className="min-h-screen bg-primary text-tertiary p-4 relative">
        <h1 className="text-4xl font-bold text-center mb-4">Top Tracks</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="bg-black bg-opacity-75 p-4 rounded">
              {track.album.images && track.album.images[0] && (
                <Image 
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  width={800}
                  height={600}
                  className="w-full h-auto mb-4 rounded"
                />
              )}
              <h2 className="text-xl font-semibold">{track.name}</h2>
              <p className="text-sm">Album: {track.album.name}</p>
              <p className="text-sm">Released: {track.album.release_date}</p>
              {track.preview_url ? (
                <audio controls src={track.preview_url} className="w-full mt-2" />
              ) : (
                <p className="text-xs">No preview available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}
