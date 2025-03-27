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
 * Returns an album cover URL. If the first image's URL is a direct link to
 * "open.spotify.com/album", we use a fallback mapping instead.
 */
function getAlbumCoverUrl(album: SpotifyAlbum): string {
  const url = album.images?.[0]?.url || '';
  if (url.includes('open.spotify.com/album')) {
    const fallbackMapping: Record<string, string> = {
      '257teVy7xAOfpN9OzY85Lo': 'https://i.scdn.co/image/ab67616d0000b273prerolls2cover',
      '0djUyeQEWuCWhz1VWRLkFe': 'https://i.scdn.co/image/ab67616d0000b273wherethesidewalkendscover',
    };
    return fallbackMapping[album.id] || '/fallback-album.png';
  }
  return url;
}

export default function Albums() {
  // Three tab states
  type Tabs = 'associated' | 'personal' | 'executive';
  const [activeTab, setActiveTab] = useState<Tabs>('associated');

  // The complete merged list of albums
  const [discographyAlbums, setDiscographyAlbums] = useState<SpotifyAlbum[]>([]);
  const [loadingDiscography, setLoadingDiscography] = useState(true);

  // When an album is clicked, we can show the detail view with tracklist
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [loadingAlbumTracks, setLoadingAlbumTracks] = useState(false);

  // ID arrays for personal vs executive albums
  const personalAlbumIds = [
    '6PBCQ44h15c7VN35lAzu3M', // jordanyear
    '55Xr7mE7Zya6ccCViy7yyh', // Social Networks
  ];
  const executiveAlbumIds = [
    '0djUyeQEWuCWhz1VWRLkFe', // Where The Sidewalk Ends...
    '257teVy7xAOfpN9OzY85Lo', // Pre Rolls 2
    '0QBZSqSw8BumuSzFWqjXYR',
    '343aezvXQOm8UTT9lNB64h',
    '3yejH64Ofken9zTwLQ9c7X',
  ];

  // Fetch all albums from Spotify + fallback
  const artistId = '7iysPipkcsfGFVEgUMDzHQ';
  useEffect(() => {
    const fetchDiscographyAlbums = async () => {
      setLoadingDiscography(true);
      try {
        // 1) Fetch from Spotify
        const albumsRes = await fetch(
          `/api/spotify/artist-albums?artistId=${artistId}&include_groups=album,single&limit=50`
        );
        if (!albumsRes.ok) {
          console.error(`Error fetching artist albums: ${await albumsRes.text()}`);
          setDiscographyAlbums([]);
          return;
        }
        const albumsData: ArtistAlbumsResponse = await albumsRes.json();
        const fetchedAlbums = albumsData.items || [];
        const fetchedIds = new Set(fetchedAlbums.map((a) => a.id));

        // 2) Merge fallback data for those in Spotify
        const merged = fetchedAlbums.map((album) => {
          if (hardcodedAlbums[album.id]) {
            return { ...album, tracks: hardcodedAlbums[album.id].tracks };
          }
          return album;
        });

        // 3) Check for fallback albums not in the Spotify result
        const fallbackOnly = Object.values(hardcodedAlbums).filter((a) => !fetchedIds.has(a.id));

        // 4) For each fallback, attempt to fetch real data
        const updatedFallback = await Promise.all(
          fallbackOnly.map(async (alb) => {
            try {
              const fallbackRes = await fetch(`/api/spotify/album?albumId=${alb.id}`);
              if (!fallbackRes.ok) {
                console.error(`Error fetching detail for fallback album ${alb.id}: ${await fallbackRes.text()}`);
                return alb;
              }
              const realData = await fallbackRes.json();
              return { ...realData, tracks: alb.tracks };
            } catch (err) {
              console.error(`Fallback fetch error for ${alb.id}`, err);
              return alb; // fallback to local data only
            }
          })
        );

        // 5) Combine everything & sort by release_date desc
        const finalAlbums = [...merged, ...updatedFallback];
        finalAlbums.sort(
          (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );

        setDiscographyAlbums(finalAlbums);
      } catch (err) {
        console.error('Error fetching discography albums:', err);
        setDiscographyAlbums([]);
      } finally {
        setLoadingDiscography(false);
      }
    };

    fetchDiscographyAlbums();
  }, []);

  // Handle album click => fetch track list if needed
  const handleAlbumClick = async (album: SpotifyAlbum) => {
    setSelectedAlbum(album);

    if (album.tracks && album.tracks.length > 0) {
      setAlbumTracks(album.tracks);
      return;
    }

    setLoadingAlbumTracks(true);
    try {
      const res = await fetch(`/api/spotify/albums/${album.id}/tracks?market=ES&limit=50`);
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

  // Render the detail popup for a single album (cover + track list)
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
          &larr; Back
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
            {selectedAlbum.name}{' '}
            <span className="text-lg font-light">({selectedAlbum.release_date || 'N/A'})</span>
          </h2>
          {loadingAlbumTracks ? (
            <p className="text-gray-400 text-center my-6">Loading tracks...</p>
          ) : albumTracks.length ? (
            <ul className="space-y-4">
              {albumTracks.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center bg-gray-900 rounded p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    const url = track.external_urls?.spotify || track.album?.external_urls?.spotify;
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
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                  {track.preview_url && (
                    <div className="ml-4">
                      <audio controls src={track.preview_url} className="w-24 md:w-32" />
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

  /**
   * TAB 1: Associated Albums
   * Shows **all** albums in discography (the entire array).
   */
  const renderAssociatedAlbums = () => {
    if (loadingDiscography) {
      return <p className="text-center text-white mt-10">Loading albums...</p>;
    }
    if (!discographyAlbums.length) {
      return <p className="text-center text-white mt-10">No albums found.</p>;
    }

    if (selectedAlbum) {
      return renderAlbumDetail();
    }

    return (
      <section className="p-4 text-white">
        <h2 className="text-2xl mb-4">Associated Albums (All)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {discographyAlbums.map((alb) => (
            <div
              key={alb.id}
              className="bg-gray-900 rounded-md shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden"
              onClick={() => handleAlbumClick(alb)}
            >
              <div className="relative w-full h-48">
                <Image
                  src={getAlbumCoverUrl(alb)}
                  alt={`${alb.name} cover`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold truncate">{alb.name}</h3>
                <p className="text-sm text-gray-400">
                  {alb.release_date ? alb.release_date.substring(0, 4) : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  /**
   * TAB 2: Personal Albums
   */
  const renderPersonalAlbums = () => {
    if (loadingDiscography) {
      return <p className="text-center text-white mt-10">Loading albums...</p>;
    }
    if (!discographyAlbums.length) {
      return <p className="text-center text-white mt-10">No albums found.</p>;
    }

    const personalSet = new Set(personalAlbumIds);
    const personal = discographyAlbums.filter((alb) => personalSet.has(alb.id));

    if (!personal.length) {
      return <p className="text-center text-white mt-10">No personal albums found.</p>;
    }

    if (selectedAlbum) {
      return renderAlbumDetail();
    }

    return (
      <section className="p-4 text-white">
        <h2 className="text-2xl mb-4">Personal Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {personal.map((alb) => (
            <div
              key={alb.id}
              className="bg-gray-900 rounded-md shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden"
              onClick={() => handleAlbumClick(alb)}
            >
              <div className="relative w-full h-48">
                <Image
                  src={getAlbumCoverUrl(alb)}
                  alt={`${alb.name} cover`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold truncate">{alb.name}</h3>
                <p className="text-sm text-gray-400">
                  {alb.release_date ? alb.release_date.substring(0, 4) : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  /**
   * TAB 3: Executive Produced
   */
  const renderExecutiveAlbums = () => {
    if (loadingDiscography) {
      return <p className="text-center text-white mt-10">Loading albums...</p>;
    }
    if (!discographyAlbums.length) {
      return <p className="text-center text-white mt-10">No albums found.</p>;
    }

    const executiveSet = new Set(executiveAlbumIds);
    const executive = discographyAlbums.filter((alb) => executiveSet.has(alb.id));

    if (!executive.length) {
      return <p className="text-center text-white mt-10">No executive produced albums found.</p>;
    }

    if (selectedAlbum) {
      return renderAlbumDetail();
    }

    return (
      <section className="p-4 text-white">
        <h2 className="text-2xl mb-4">Executive Produced Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {executive.map((alb) => (
            <div
              key={alb.id}
              className="bg-gray-900 rounded-md shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden"
              onClick={() => handleAlbumClick(alb)}
            >
              <div className="relative w-full h-48">
                <Image
                  src={getAlbumCoverUrl(alb)}
                  alt={`${alb.name} cover`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold truncate">{alb.name}</h3>
                <p className="text-sm text-gray-400">
                  {alb.release_date ? alb.release_date.substring(0, 4) : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-indigo-900 text-tertiary px-6 py-8 md:p-12">
      {/* Header */}
      <header className="text-center mt-6 md:mt-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Albums
        </h1>
        <p className="mt-4 text-base md:text-lg text-gray-300">
          Featuring my personal & executive produced albums
        </p>
      </header>

      {/* Tab Navigation */}
      <nav className="flex justify-center mt-8 space-x-6">
        <button
          onClick={() => setActiveTab('associated')}
          className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-md md:text-xl font-semibold transition-all ${
            activeTab === 'associated'
              ? 'bg-blue-700 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600'
          }`}
        >
          Associated Albums
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-md md:text-xl font-semibold transition-all ${
            activeTab === 'personal'
              ? 'bg-blue-700 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600'
          }`}
        >
          Personal Albums
        </button>
        <button
          onClick={() => setActiveTab('executive')}
          className={`px-6 md:px-8 py-2 md:py-3 rounded-lg text-md md:text-xl font-semibold transition-all ${
            activeTab === 'executive'
              ? 'bg-blue-700 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600'
          }`}
        >
          Executive Produced
        </button>
      </nav>

      {/* Tab Content */}
      {activeTab === 'associated'
        ? renderAssociatedAlbums()
        : activeTab === 'personal'
        ? renderPersonalAlbums()
        : renderExecutiveAlbums()}

      <footer className="mt-16 text-center text-gray-500 text-sm md:text-base">
        <p>© {new Date().getFullYear()} Xaeneptune Music. All rights reserved.</p>
      </footer>
    </main>
  );
}
