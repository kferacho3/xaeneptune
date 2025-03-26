'use client';

import { hardcodedAlbums } from '@/data/artistsData';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  album?: {
    id: string;
    name: string;
    images: { url: string }[];
    release_date: string;
    external_urls?: { spotify: string };
  };
  artists: { id?: string; name: string }[];
  external_urls?: { spotify: string };
}


interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  external_urls?: { spotify: string };
  tracks?: SpotifyTrack[];
}

interface ArtistAlbumsResponse {
  items: SpotifyAlbum[];
}

/**
 * Returns the album cover URL. If the image URL is a Spotify album page,
 * then we use fallback mapping URLs.
 */
function getAlbumCoverUrl(album: SpotifyAlbum): string {
  const url = album.images?.[0]?.url || "";
  if (url.includes("open.spotify.com/album")) {
    const fallbackMapping: Record<string, string> = {
      "5uLRSI4k2mglRv53j26VpT": "https://i.scdn.co/image/ab67616d0000b273exoticluvcover",
      "56d63lOnDLJl2HDrbrdG3U": "https://i.scdn.co/image/ab67616d0000b273idontmindcover",
      "04RJRrnRBkjfZyT36dAeS5": "https://i.scdn.co/image/ab67616d0000b273godspeedcover",
      "257teVy7xAOfpN9OzY85Lo": "https://i.scdn.co/image/ab67616d0000b273prerolls2cover",
      "0djUyeQEWuCWhz1VWRLkFe": "https://i.scdn.co/image/ab67616d0000b273wherethesidewalkendscover",
    };
    return fallbackMapping[album.id] || "/fallback-album.png";
  }
  return url;
}

// Hardcoded XO June album – always included.
const xoJuneAlbum: SpotifyAlbum = {
  id: "xo-june-bedroom-tapes-vol1",
  name: "Bedroom Tapes, Vol 1.",
  release_date: "2024",
  images: [
    {
      url: "https://i1.sndcdn.com/artworks-HO9ZhEvqdwTcFVk2-R8IuQQ-t1080x1080.jpg",
    },
  ],
  external_urls: { spotify: "https://soundcloud.com/xojune/real-foyf" },
  tracks: [
    {
      id: "xo-june-real-foyf",
      name: "Real (FOYF) Prod. XaeNeptune",
      preview_url: null,
      external_urls: { spotify: "https://soundcloud.com/xojune/real-foyf" },
      artists: [{ name: "XO June" }],
    },
  ],
};

export default function Albums() {
  // State for tab (My Albums vs Produced Albums)
  const [activeTab, setActiveTab] = useState<'published' | 'produced'>('published');
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [loadingAlbumTracks, setLoadingAlbumTracks] = useState(false);

  const artistId = '7iysPipkcsfGFVEgUMDzHQ';

  // Hardcoded album IDs based on your specification.
  const publishedAlbumIds = [
    '55Xr7mE7Zya6ccCViy7yyh', // Social Networks
    '6PBCQ44h15c7VN35lAzu3M',  // jordanyear
  ];
  const producedAlbumIds = [
    '0djUyeQEWuCWhz1VWRLkFe', // Where The Sidewalk Ends...
    '257teVy7xAOfpN9OzY85Lo', // Pre Rolls 2
  ];

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoadingAlbums(true);
      try {
        const res = await fetch(
          `/api/spotify/artist-albums?artistId=${artistId}&include_groups=album,single&limit=50`
        );
        if (!res.ok) {
          console.error(`Error fetching albums: ${await res.text()}`);
          setAlbums([]);
          return;
        }
        const data: ArtistAlbumsResponse = await res.json();
        const fetchedAlbums = data.items || [];
        const fetchedAlbumIds = new Set(fetchedAlbums.map(album => album.id));

        // Merge fallback data for albums with hardcoded tracklists.
        const mergedAlbums = fetchedAlbums.map(album => {
          if (hardcodedAlbums[album.id]) {
            console.log(`Using fallback track data for album ${album.name} (${album.id})`);
            return { ...album, tracks: hardcodedAlbums[album.id].tracks };
          }
          return album;
        });

        // Get fallback albums that weren't returned from the API.
        const fallbackAlbums = Object.values(hardcodedAlbums).filter(
          album => !fetchedAlbumIds.has(album.id)
        );

        // For each fallback album, try to fetch additional details.
        const updatedFallbackAlbums = await Promise.all(
          fallbackAlbums.map(async (album) => {
            try {
              const res = await fetch(`/api/spotify/album?albumId=${album.id}`);
              if (!res.ok) {
                console.error(`Error fetching album details for ${album.id}: ${await res.text()}`);
                return album;
              }
              const albumData = await res.json();
              return { ...albumData, tracks: album.tracks };
            } catch (error) {
              console.error(`Error fetching album details for ${album.id}:`, error);
              return album;
            }
          })
        );

        // Always include the XO June album.
        const finalAlbums = [...mergedAlbums, ...updatedFallbackAlbums, xoJuneAlbum];

        // Filter to only show our specified albums.
        const filteredAlbums = finalAlbums.filter(album =>
          publishedAlbumIds.includes(album.id) || producedAlbumIds.includes(album.id)
        );

        // Sort by release date descending.
        filteredAlbums.sort(
          (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );

        setAlbums(filteredAlbums);
      } catch (error) {
        console.error('Error fetching albums:', error);
        setAlbums([]);
      } finally {
        setLoadingAlbums(false);
      }
    };

    fetchAlbums();
  }, [artistId]);

  // When an album is clicked, fetch its tracklist if not already present.
  const handleAlbumClick = async (album: SpotifyAlbum) => {
    setSelectedAlbum(album);
    if (album.tracks && album.tracks.length > 0) {
      setAlbumTracks(album.tracks);
      return;
    }
    setLoadingAlbumTracks(true);
    try {
      const res = await fetch(
        `/api/spotify/albums/${album.id}/tracks?market=ES&limit=50`
      );
      if (!res.ok) {
        console.error(`Error fetching tracks for album ${album.id}: ${await res.text()}`);
        setAlbumTracks([]);
        return;
      }
      const data = await res.json();
      setAlbumTracks(data.items || []);
    } catch (error) {
      console.error(`Error fetching tracks for album ${album.id}:`, error);
      setAlbumTracks([]);
    } finally {
      setLoadingAlbumTracks(false);
    }
  };

  // Album detail view with immersive styling.
  const renderAlbumDetail = () => {
    if (!selectedAlbum) return null;
    return (
      <div className="max-w-5xl mx-auto my-12 p-6 bg-black bg-opacity-80 rounded-xl shadow-2xl flex flex-col md:flex-row gap-8 animate-fadeIn">
        <button
          onClick={() => {
            setSelectedAlbum(null);
            setAlbumTracks([]);
          }}
          className="self-start px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded hover:bg-gray-700 transition"
        >
          &larr; Back to Albums
        </button>
        <div className="md:w-1/2 relative shadow-lg rounded overflow-hidden">
          <Image
            src={getAlbumCoverUrl(selectedAlbum)}
            alt={`${selectedAlbum.name} cover`}
            width={500}
            height={500}
            sizes="100vw"
            className="object-cover rounded-lg"
            priority
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold text-white mb-4 bg-indigo-800 bg-opacity-50 p-3 rounded">
            {selectedAlbum.name} <span className="text-lg font-light">({selectedAlbum.release_date || 'N/A'})</span>
          </h2>
          {loadingAlbumTracks ? (
            <p className="text-gray-400 text-center my-6">Loading tracks...</p>
          ) : albumTracks.length > 0 ? (
            <ul className="space-y-4">
              {albumTracks.map((track: SpotifyTrack) => (
                <li
                  key={track.id}
                  className="flex items-center bg-gray-900 rounded p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    const url =
                      track.external_urls?.spotify || track.album?.external_urls?.spotify;
                    if (url) window.open(url, '_blank');
                  }}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={getAlbumCoverUrl(selectedAlbum)}
                      alt={`${selectedAlbum.name} cover`}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold">{track.name}</p>
                    <p className="text-gray-400 text-sm">
                      {track.artists.map(artist => artist.name).join(', ')}
                    </p>
                  </div>
                  {track.preview_url && (
                    <div className="ml-4">
                      <audio controls src={track.preview_url} className="w-32" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url =
                        track.external_urls?.spotify || track.album?.external_urls?.spotify;
                      if (url) window.open(url, '_blank');
                    }}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    Play <span>&rarr;</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center my-6">No tracks available for this album.</p>
          )}
        </div>
      </div>
    );
  };

  // Album grid view with enhanced immersive styling.
  const renderAlbumGrid = () => {
    if (loadingAlbums) {
      return <p className="text-center text-white mt-10">Loading albums...</p>;
    }
    if (!albums.length) {
      return <p className="text-center text-white mt-10">No albums found.</p>;
    }
    const publishedAlbums = albums.filter(album => publishedAlbumIds.includes(album.id));
    const producedAlbums = albums.filter(album => producedAlbumIds.includes(album.id));
    const currentAlbums = activeTab === 'published' ? publishedAlbums : producedAlbums;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 animate-fadeIn">
        {currentAlbums.map(album => (
          <div
            key={album.id}
            onClick={() => handleAlbumClick(album)}
            className="bg-gray-900 bg-opacity-80 rounded-xl shadow-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
          >
            <div className="relative h-72">
              <Image
                src={getAlbumCoverUrl(album)}
                alt={`${album.name} cover`}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-2xl text-white font-bold">{album.name}</h3>
              <p className="text-sm text-gray-300 mt-1">
                Released: {album.release_date ? album.release_date.substring(0, 4) : 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-indigo-900 text-tertiary p-6 md:p-12">
      <header className="text-center mt-12">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Immersive Albums</h1>
        <p className="mt-4 text-lg text-gray-300">Discover the soundscape of my musical journey</p>
      </header>
      <nav className="flex justify-center mt-8 space-x-6">
        <button
          onClick={() => setActiveTab('published')}
          className={`px-8 py-3 rounded-lg text-xl font-semibold transition-all ${
            activeTab === 'published'
              ? 'bg-blue-700 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600'
          }`}
        >
          My Albums
        </button>
        <button
          onClick={() => setActiveTab('produced')}
          className={`px-8 py-3 rounded-lg text-xl font-semibold transition-all ${
            activeTab === 'produced'
              ? 'bg-blue-700 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600'
          }`}
        >
          Produced Albums
        </button>
      </nav>
      {selectedAlbum ? renderAlbumDetail() : renderAlbumGrid()}
      <footer className="mt-16 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Xaeneptune Music. All rights reserved.</p>
      </footer>
    </main>
  );
}
