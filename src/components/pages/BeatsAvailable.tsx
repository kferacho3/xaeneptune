'use client';

import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { artists } from '../../data/artistsData';

interface Track {
  id: number;
  title: string;
  duration: string;
  mp3: string;
  cover?: string;
  isXaeNeptuneTrack: boolean;
  beatType?: string;
}

const getAllBeats = () => {
  const beats: (Track & { albumTitle: string, artistName: string, releaseDate: string })[] = [];
  artists.forEach(artist => {
    artist.albums.forEach(album => {
      album.tracks.forEach(track => {
        if (track.title.toLowerCase().includes("beat") ||
            track.title.toLowerCase().includes("boom") ||
            track.title.toLowerCase().includes("pulse")) {
          beats.push({ ...track, albumTitle: album.title, artistName: artist.name, releaseDate: album.releaseDate, beatType: "Trap" });
        }
      });
    });
  });
  return beats;
};

export default function BeatsAvailable() {
  const [beats] = useState(getAllBeats());
  const [filters, setFilters] = useState({ sort: 'newest', nameOrder: 'A-Z', beatType: 'all' });
  const [showVisualizer, setShowVisualizer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVisualizer(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredBeats = beats.filter(beat => {
    if (filters.beatType !== 'all' && beat.beatType !== filters.beatType) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'newest') {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    } else if (filters.sort === 'oldest') {
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    }
    return 0;
  }).sort((a, b) => {
    if (filters.nameOrder === 'A-Z') {
      return a.title.localeCompare(b.title);
    } else if (filters.nameOrder === 'Z-A') {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  return (
    <Html fullscreen>
      <div className="min-h-screen bg-primary text-tertiary p-4 relative">
        {showVisualizer ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-3xl">Beats Visualizer</div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black transition-opacity duration-2000 opacity-100"></div>
        )}
        <div className="relative z-10 pt-8">
          <h1 className="text-4xl font-bold text-center mb-4">Beats Available</h1>
          <div className="flex flex-wrap justify-center space-x-4 mb-6">
            <select 
              value={filters.sort} 
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="bg-gray-800 p-2 rounded"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <select 
              value={filters.nameOrder} 
              onChange={(e) => setFilters({ ...filters, nameOrder: e.target.value })}
              className="bg-gray-800 p-2 rounded"
            >
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
            </select>
            <select 
              value={filters.beatType} 
              onChange={(e) => setFilters({ ...filters, beatType: e.target.value })}
              className="bg-gray-800 p-2 rounded"
            >
              <option value="all">All Beat Types</option>
              <option value="Trap">Trap</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBeats.map(beat => (
              <div key={beat.id} className="bg-black bg-opacity-75 p-4 rounded">
                <img src={beat.cover || 'https://source.unsplash.com/random/400x400/?music,track'} alt={beat.title} className="w-full h-auto mb-4 rounded" />
                <h2 className="text-xl font-semibold">{beat.title}</h2>
                <p className="text-sm">Artist: {beat.artistName}</p>
                <p className="text-sm">Album: {beat.albumTitle}</p>
                <audio controls src={beat.mp3} className="w-full mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Html>
  );
}
