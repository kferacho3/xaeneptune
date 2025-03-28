"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Minimal track interfaces
interface SpotifyArtist {
  name: string;
  external_urls?: { spotify?: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album?: {
    id: string;
    name: string;
    release_date: string;
    images: { url: string }[];
  };
  external_urls?: { spotify?: string };
}

interface TopTracksResponse {
  tracks: SpotifyTrack[];
}

interface PlaylistResponse {
  tracks: {
    items: {
      track: SpotifyTrack;
    }[];
  };
  // plus any other playlist fields (name, etc.) that you want
}

export default function Music() {
  const [activeTab, setActiveTab] = useState<"top-tracks" | "playlist">(
    "top-tracks",
  );

  // State for top tracks
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [loadingTopTracks, setLoadingTopTracks] = useState(true);

  // State for playlist
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);

  // Hard-coded for demonstration
  const artistId = "7iysPipkcsfGFVEgUMDzHQ"; // Xae Neptune
  const playlistId = "1NL9L9zkZjkxlAVV3Qcqfh"; // The playlist you want to display

  // Fetch top tracks + playlist data
  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoadingTopTracks(true);
      try {
        const res = await fetch(
          `/api/spotify/artist-top-tracks?artistId=${artistId}`,
        );
        if (!res.ok) {
          console.error(`Error fetching top tracks: ${await res.text()}`);
          setTopTracks([]);
        } else {
          const data: TopTracksResponse = await res.json();
          setTopTracks(data.tracks || []);
        }
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setTopTracks([]);
      } finally {
        setLoadingTopTracks(false);
      }
    };

    const fetchPlaylistTracks = async () => {
      setLoadingPlaylist(true);
      try {
        // This route is newly created; see /api/spotify/playlist example below
        const res = await fetch(
          `/api/spotify/playlist?playlistId=${playlistId}`,
        );
        if (!res.ok) {
          console.error(`Error fetching playlist tracks: ${await res.text()}`);
          setPlaylistTracks([]);
        } else {
          const data: PlaylistResponse = await res.json();
          // The tracks are nested at data.tracks.items[].track
          const extractedTracks = data.tracks.items
            .map((item) => item.track)
            .filter(Boolean); // ensure no null
          setPlaylistTracks(extractedTracks);
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setPlaylistTracks([]);
      } finally {
        setLoadingPlaylist(false);
      }
    };

    fetchTopTracks();
    fetchPlaylistTracks();
  }, [artistId, playlistId]);

  // Helpers to render track lists
  const renderTrackCard = (track: SpotifyTrack) => (
    <article
      key={track.id}
      className="bg-gray-900 p-4 rounded-lg shadow-md transition-transform hover:scale-105"
      onClick={() => {
        if (track.external_urls?.spotify) {
          window.open(track.external_urls.spotify, "_blank");
        }
      }}
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
      <p className="text-sm text-gray-300 mb-1">
        Artist(s): {track.artists.map((a) => a.name).join(", ")}
      </p>
      {track.album?.name && (
        <p className="text-sm text-gray-300">
          Album: {track.album.name}{" "}
          {track.album.release_date && `(${track.album.release_date})`}
        </p>
      )}
      {track.preview_url ? (
        <audio controls src={track.preview_url} className="w-full mt-2" />
      ) : (
        <p className="text-xs text-gray-400 mt-2">No preview available</p>
      )}
    </article>
  );

  const renderTopTracks = () => {
    if (loadingTopTracks) {
      return <p className="text-center text-white">Loading top tracks...</p>;
    }
    if (!topTracks.length) {
      return <p className="text-center text-white">No top tracks found.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {topTracks.map((track) => renderTrackCard(track))}
      </div>
    );
  };

  const renderPlaylistTracks = () => {
    if (loadingPlaylist) {
      return (
        <p className="text-center text-white">Loading playlist tracks...</p>
      );
    }
    if (!playlistTracks.length) {
      return (
        <p className="text-center text-white">
          No tracks found in the playlist.
        </p>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {playlistTracks.map((track) => renderTrackCard(track))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary to-indigo-900 text-tertiary p-4 md:p-8">
      <header className="text-center mt-20 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Music</h1>
      </header>
      {/* Tab Buttons */}
      <nav className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("top-tracks")}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            activeTab === "top-tracks"
              ? "bg-white text-black"
              : "bg-transparent border border-white text-white hover:bg-gray-700"
          }`}
        >
          Top Tracks
        </button>
        <button
          onClick={() => setActiveTab("playlist")}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            activeTab === "playlist"
              ? "bg-white text-black"
              : "bg-transparent border border-white text-white hover:bg-gray-700"
          }`}
        >
          Playlist Tracks
        </button>
      </nav>

      {/* Tab Content */}
      {activeTab === "top-tracks" ? renderTopTracks() : renderPlaylistTracks()}

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Xaeneptune Music. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
