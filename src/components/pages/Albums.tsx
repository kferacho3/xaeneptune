// /src/components/pages/Albums.tsx
'use client';

import { Html } from '@react-three/drei';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  album_type: string; // "album", "single", etc.
}

export default function Albums() {
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'full' | 'featured'>('full');

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch('/api/spotify/artist-albums?artistId=7iysPipkcsfGFVEgUMDzHQ');
        const data = await res.json();
        const albumItems = data.items as SpotifyAlbum[];
        albumItems.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        setAlbums(albumItems);
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <Html fullscreen>
        <div>Loading Albums...</div>
      </Html>
    );
  }

  const filteredAlbums = albums.filter(album =>
    activeTab === 'full' ? album.album_type === 'album' : album.album_type !== 'album'
  );

  return (
    <Html fullscreen>
      <div className="min-h-screen text-tertiary p-4 relative">
        <div className="absolute inset-0 bg-black opacity-30 backdrop-blur-sm z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center mb-8">Albums</h1>
          <div className="flex justify-center mb-6 space-x-4">
            <button 
              onClick={() => setActiveTab('full')}
              className={`px-4 py-2 rounded ${activeTab === 'full' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              Full Albums
            </button>
            <button 
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded ${activeTab === 'featured' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              Featured Albums
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map(album => (
              <Link key={album.id} href={`/albums/${album.id}`}>
                <div className="bg-black bg-opacity-75 p-4 rounded hover:scale-105 transition-transform cursor-pointer">
                  {album.images && album.images.length > 0 && (
                    <Image 
                      src={album.images[0].url}
                      alt={album.name}
                      width={800}
                      height={600}
                      className="w-full h-auto mb-4 rounded" 
                    />
                  )}
                  <h2 className="text-2xl font-semibold">{album.name}</h2>
                  <p className="text-xs mt-2">Released: {album.release_date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Html>
  );
}
