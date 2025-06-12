"use client";

import { AnimatePresence, motion } from "framer-motion";
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

  // Audio state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

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

  // Enhanced track card renderer
  const renderTrackCard = (track: SpotifyTrack, index: number) => (
    <motion.article
      key={track.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => {
          if (track.external_urls?.spotify) {
            window.open(track.external_urls.spotify, "_blank");
          }
        }}
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-emerald-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-emerald-600/10 group-hover:to-purple-600/10 transition-all duration-500" />
        
        {/* Album cover with enhanced styling */}
        {track.album?.images?.[0]?.url && (
          <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <Image
              src={track.album.images[0].url}
              alt={`${track.album.name} cover`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Play button overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Track info with improved typography */}
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
            {track.name}
          </h2>
          <p className="text-sm text-gray-400 mb-1 font-medium">
            {track.artists.map((a) => a.name).join(", ")}
          </p>
          {track.album?.name && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {track.album.name}
              {track.album.release_date && (
                <span className="text-gray-600"> • {new Date(track.album.release_date).getFullYear()}</span>
              )}
            </p>
          )}
        </div>
        
        {/* Audio preview with custom styling */}
        {track.preview_url && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <audio
              controls
              src={track.preview_url}
              className="w-full h-8 custom-audio"
              onPlay={() => setCurrentlyPlaying(track.id)}
              onPause={() => setCurrentlyPlaying(null)}
              style={{
                filter: currentlyPlaying === track.id ? "hue-rotate(270deg)" : "none",
              }}
            />
          </motion.div>
        )}
        
        {/* Spotify icon */}
        <div className="absolute bottom-2 right-4 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
      </div>
    </motion.article>
  );

  const renderTopTracks = () => {
    if (loadingTopTracks) {
      return (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (!topTracks.length) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 text-lg"
        >
          No top tracks found.
        </motion.p>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {topTracks.map((track, index) => renderTrackCard(track, index))}
      </div>
    );
  };

  const renderPlaylistTracks = () => {
    if (loadingPlaylist) {
      return (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (!playlistTracks.length) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 text-lg"
        >
          No tracks found in the playlist.
        </motion.p>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {playlistTracks.map((track, index) => renderTrackCard(track, index))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-emerald-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      </motion.div>

      {/* Animated particles/stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 px-4 md:px-20 py-16">
        {/* Header with enhanced animation */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-emerald-300"
            initial={{ letterSpacing: "0.5em", opacity: 0 }}
            animate={{ letterSpacing: "0.05em", opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            MUSIC
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-400 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Discover the sonic universe of Xae Neptune
          </motion.p>
        </motion.header>

        {/* Enhanced Tab Navigation */}
        <nav className="flex justify-center mb-12">
          <motion.div
            className="relative flex bg-gray-900/50 backdrop-blur-sm rounded-full  border border-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Animated background pill */}
            <motion.div
              className="absolute h-[100%] bg-gradient-to-r from-purple-600 to-emerald-600 rounded-full"
              initial={false}
              animate={{
                x: activeTab === "top-tracks" ? 0 : "100%",
                width: "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            {/* Tab buttons */}
            <button
              onClick={() => setActiveTab("top-tracks")}
              className={`relative z-10 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === "top-tracks"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Top Tracks
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`relative z-10 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === "playlist"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Playlist
            </button>
          </motion.div>
        </nav>

        {/* Tab Content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "top-tracks" ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "top-tracks" ? 50 : -50 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "top-tracks" ? renderTopTracks() : renderPlaylistTracks()}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced footer */}
        <motion.footer
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8 max-w-4xl mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          />
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Xae Neptune. All rights reserved.
          </p>
          <motion.p
            className="text-xs text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Powered by Spotify
          </motion.p>
        </motion.footer>
      </main>

      {/* Add custom styles for audio controls */}
      <style jsx global>{`
        .custom-audio::-webkit-media-controls-panel {
          background-color: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .custom-audio::-webkit-media-controls-play-button,
        .custom-audio::-webkit-media-controls-current-time-display,
        .custom-audio::-webkit-media-controls-time-remaining-display {
          color: white;
        }
        
        .custom-audio::-webkit-media-controls-timeline {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 25px;
          margin: 0 12px;
        }
      `}</style>
    </div>
  );
}