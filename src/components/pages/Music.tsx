'use client';

import { hardcodedAlbums } from '@/data/artistsData'; // our fallback album data
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

interface TopTracksResponse {
  tracks: SpotifyTrack[];
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
 * Returns the album cover URL. If the image URL is a Spotify album page (containing "open.spotify.com/album"),
 * then we return a fallback mapping URL.
 */
function getAlbumCoverUrl(album: SpotifyAlbum): string {
  const url = album.images?.[0]?.url || "";
  if (url.includes("open.spotify.com/album")) {
    const fallbackMapping: Record<string, string> = {
      "5uLRSI4k2mglRv53j26VpT": "https://i.scdn.co/image/ab67616d0000b273exoticluvcover", // Exotic Luv
      "56d63lOnDLJl2HDrbrdG3U": "https://i.scdn.co/image/ab67616d0000b273idontmindcover", // I Don't Mind
      "04RJRrnRBkjfZyT36dAeS5": "https://i.scdn.co/image/ab67616d0000b273godspeedcover", // #GodSpeed
      "257teVy7xAOfpN9OzY85Lo": "https://i.scdn.co/image/ab67616d0000b273prerolls2cover", // Pre Rolls 2
      "0djUyeQEWuCWhz1VWRLkFe": "https://i.scdn.co/image/ab67616d0000b273wherethesidewalkendscover", // Where The Sidewalk Ends...
    };
    return fallbackMapping[album.id] || "/fallback-album.png";
  }
  return url;
}

// Hardcoded XO June album – always included in discography.
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

//
// ---------------------
// Main Music Page Component
// ---------------------
export default function Music() {
  const [activeTab, setActiveTab] = useState<'top-tracks' | 'discography'>('top-tracks');
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [discographyAlbums, setDiscographyAlbums] = useState<SpotifyAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [loadingTopTracks, setLoadingTopTracks] = useState(true);
  const [loadingDiscographyAlbums, setLoadingDiscographyAlbums] = useState(true);
  const [loadingAlbumTracks, setLoadingAlbumTracks] = useState(false);

  const artistId = '7iysPipkcsfGFVEgUMDzHQ'; // Xae Neptune's Spotify ID

  useEffect(() => {
    // Fetch Top Tracks via our internal API endpoint.
    const fetchTopTracks = async () => {
      setLoadingTopTracks(true);
      try {
        const res = await fetch(`/api/spotify/artist-top-tracks?artistId=${artistId}`);
        if (!res.ok) {
          console.error(`Top tracks fetch error: ${await res.text()}`);
          setTopTracks([]);
          return;
        }
        const data: TopTracksResponse = await res.json();
        setTopTracks(data.tracks || []);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
        setTopTracks([]);
      } finally {
        setLoadingTopTracks(false);
      }
    };

    // Fetch discography albums via our internal API endpoint and merge fallback data.
    const fetchDiscographyAlbums = async () => {
      setLoadingDiscographyAlbums(true);
      try {
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
        const fetchedAlbumIds = new Set(fetchedAlbums.map((album) => album.id));

        // For albums that exist in our fallback data, merge in the fallback tracks.
        const mergedAlbums = fetchedAlbums.map((album) => {
          if (hardcodedAlbums[album.id]) {
            console.log(`Using fallback track data for album ${album.name} (${album.id})`);
            return { ...album, tracks: hardcodedAlbums[album.id].tracks };
          }
          return album;
        });

        // Get fallback albums that were not returned from the API.
        const fallbackAlbums = Object.values(hardcodedAlbums).filter(
          (album) => !fetchedAlbumIds.has(album.id)
        );

        // For each fallback album, fetch additional details via our internal API.
        const updatedFallbackAlbums = await Promise.all(
          fallbackAlbums.map(async (album) => {
            try {
              const res = await fetch(`/api/spotify/album?albumId=${album.id}`);
              if (!res.ok) {
                console.error(`Error fetching album details for ${album.id}: ${await res.text()}`);
                return album; // fallback to hardcoded data
              }
              const albumData = await res.json();
              console.log(`Fetched album details for fallback album ${album.name} (${album.id})`);
              return { ...albumData, tracks: album.tracks };
            } catch (error) {
              console.error(`Error fetching album details for ${album.id}:`, error);
              return album;
            }
          })
        );

        // Always include the XO June album.
        const finalAlbums = [...mergedAlbums, ...updatedFallbackAlbums, xoJuneAlbum];
        console.log("Final discography albums:", finalAlbums);
        setDiscographyAlbums(finalAlbums);
      } catch (error) {
        console.error('Error fetching discography albums:', error);
        setDiscographyAlbums([]);
      } finally {
        setLoadingDiscographyAlbums(false);
      }
    };

    fetchTopTracks();
    fetchDiscographyAlbums();
  }, [artistId]);

  // When an album is clicked, fetch its tracklist using our internal API.
// When an album is clicked, fetch its tracklist using our internal API.
const handleAlbumClick = async (album: SpotifyAlbum) => {
  setSelectedAlbum(album);
  
  // If the album already includes tracks (from fallback data), use them directly.
  if (album.tracks && album.tracks.length > 0) {
    setAlbumTracks(album.tracks);
    return;
  }
  
  setLoadingAlbumTracks(true);
  try {
    // Removed the trailing slash to match our API route exactly.
    const res = await fetch(
      `/api/spotify/albums/${album.id}/tracks?market=ES&limit=50`
    );
    if (!res.ok) {
      console.error(
        `Error fetching tracks for album ${album.id}: ${await res.text()}`
      );
      setAlbumTracks([]);
      return;
    }
    const data = await res.json();
    // Spotify returns a paged response; we extract the "items" property
    setAlbumTracks(data.items || []);
  } catch (error) {
    console.error(`Error fetching tracks for album ${album.id}:`, error);
    setAlbumTracks([]);
  } finally {
    setLoadingAlbumTracks(false);
  }
};

  
  
  
  

  // Render the detailed view for a selected album.
  const renderAlbumDetail = () => {
    if (!selectedAlbum) {
      return (
        <div className="text-center py-10 text-gray-500">
          Please select an album to view its tracks.
        </div>
      );
    }
    return (
      <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 bg-black bg-opacity-80 rounded-lg shadow-md">
        <button
          onClick={() => {
            setSelectedAlbum(null);
            setAlbumTracks([]);
          }}
          className="px-4 py-2 self-start bg-gray-900 border border-white text-white rounded hover:bg-gray-700 transition"
        >
          &larr; Go Back
        </button>
        <div className="md:w-1/2 shadow-lg rounded-md overflow-hidden">
          {getAlbumCoverUrl(selectedAlbum) && (
            <Image
              src={getAlbumCoverUrl(selectedAlbum)}
              alt={`${selectedAlbum.name} cover`}
              width={500}
              height={500}
              sizes="100vw"
              className="w-full h-auto object-cover rounded-lg"
              priority
            />
          )}
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-white mb-6 rounded-md py-2 px-4 bg-indigo-700 bg-opacity-50">
            {selectedAlbum.name} {selectedAlbum.release_date && `(${selectedAlbum.release_date || 'N/A'})`}
          </h2>
          {loadingAlbumTracks ? (
            <div className="text-center py-6 text-gray-400">Loading tracks...</div>
          ) : albumTracks.length > 0 ? (
            <ul className="space-y-4">
              {albumTracks.map((track: SpotifyTrack) => (
                <li
                  key={track.id}
                  className="flex items-center bg-gray-900 rounded-md p-0 cursor-pointer transition-colors hover:bg-gray-800"
                  onClick={() => {
                    const url =
                      track.external_urls?.spotify || track.album?.external_urls?.spotify;
                    if (url) window.open(url, '_blank');
                  }}
                >
                  <div className="flex-shrink-0">
                    <div className="relative w-12 h-12 rounded overflow-hidden">
                      <Image
                        src={getAlbumCoverUrl(selectedAlbum)}
                        alt={`${selectedAlbum.name} cover`}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-bold text-md">{track.name}</p>
                    <p className="text-gray-300 text-sm">
                      {track.artists.map((artist) => artist.name).join(', ')}
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
                    Play Song <span>&rarr;</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-400">No tracks found for this album.</div>
          )}
        </div>
      </div>
    );
  };

  // Render the grid of album covers.
  const renderAlbumGrid = () => {
    if (loadingDiscographyAlbums) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-300">Loading albums...</p>
        </div>
      );
    }
    if (!discographyAlbums.length) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-300">No albums found.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
        {discographyAlbums.map((album) => (
          <div
            key={album.id}
            className="bg-gray-900 rounded-md shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleAlbumClick(album)}
          >
            <div className="relative w-full h-48">
              <Image
                src={getAlbumCoverUrl(album)}
                alt={`${album.name} cover`}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-lg font-semibold text-white truncate">{album.name}</h3>
              <p className="text-gray-400 text-sm">
                {album.release_date ? album.release_date.substring(0, 4) : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the Top Tracks view.
  const renderTopTracks = (tracksList: SpotifyTrack[], loading: boolean) => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-300">Loading top tracks...</p>
        </div>
      );
    }
    if (!tracksList.length) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-300">No top tracks found.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {tracksList.map((track) => (
          <article
            key={track.id}
            className="bg-gray-900 p-4 rounded-lg shadow-md transition-transform hover:scale-105"
          >
            {track.album?.images?.[0]?.url && (
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={track.album.images[0].url}
                  alt={`${track.album.name} cover`}
                  fill
                  sizes="100vw"
                  className="rounded-md object-cover"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold text-white mb-2">{track.name}</h2>
            <p className="text-sm text-gray-300">Album: {track.album?.name}</p>
            <p className="text-sm text-gray-300">Released: {track.album?.release_date}</p>
            {track.preview_url ? (
              <audio controls src={track.preview_url} className="w-full mt-2" />
            ) : (
              <p className="text-xs text-gray-400 mt-2">No preview available</p>
            )}
            {track.external_urls?.spotify && (
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-sm text-blue-400 underline"
              >
                View on Spotify
              </a>
            )}
          </article>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary to-indigo-900 text-tertiary p-4 md:p-8">
      <header className="text-center mt-20 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Music</h1>
      </header>
      <nav className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('top-tracks')}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            activeTab === 'top-tracks'
              ? 'bg-white text-black'
              : 'bg-transparent border border-white text-white hover:bg-gray-700'
          }`}
          aria-current={activeTab === 'top-tracks' ? 'page' : undefined}
        >
          Top Tracks
        </button>
        <button
          onClick={() => setActiveTab('discography')}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            activeTab === 'discography'
              ? 'bg-white text-black'
              : 'bg-transparent border border-white text-white hover:bg-gray-700'
          }`}
          aria-current={activeTab === 'discography' ? 'page' : undefined}
        >
          Discography
        </button>
      </nav>
      <section aria-labelledby="music-content-heading">
        <h2 id="music-content-heading" className="sr-only">
          {activeTab === 'top-tracks' ? 'Top Tracks' : 'Discography'}
        </h2>
        {activeTab === 'top-tracks'
          ? renderTopTracks(topTracks, loadingTopTracks)
          : selectedAlbum
          ? renderAlbumDetail()
          : renderAlbumGrid()}
      </section>
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Xaeneptune Music. All rights reserved.</p>
      </footer>
    </main>
  );
}
