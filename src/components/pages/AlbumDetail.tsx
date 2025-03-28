// /src/components/pages/AlbumDetail.tsx
"use client";
import Image from "next/image";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface SpotifyAlbum {
  name: string;
  release_date: string;
  images?: { url: string }[];
}

interface Track {
  id: string;
  name: string;
  preview_url: string | null;
}

export default function AlbumDetail() {
  const router = useRouter();
  const { albumId } = router.query;
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;
    const fetchAlbumData = async () => {
      try {
        // Fetch album details via our API endpoint
        const albumRes = await fetch(`/api/spotify/album?albumId=${albumId}`);
        const albumData = await albumRes.json();
        setAlbum(albumData);

        // Fetch album tracks via our API endpoint
        const tracksRes = await fetch(`/api/spotify/albums/${albumId}/tracks`);
        const tracksData = await tracksRes.json();
        setTracks(tracksData.items);
      } catch (error) {
        console.error("Error fetching album details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumData();
  }, [albumId]);

  if (loading) {
    return (
      <>
        <div>Loading album details...</div>
      </>
    );
  }

  if (!album) {
    return (
      <>
        <div>Album not found</div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-primary text-tertiary p-4">
        <button onClick={() => router.back()} className="mb-4 text-blue-500">
          ← Back
        </button>
        <div className="bg-black bg-opacity-75 p-6 rounded">
          {album.images && album.images[0] && (
            <Image
              src={album.images[0].url}
              alt={album.name}
              width={500} // adjust to your desired width
              height={500} // adjust to your desired height
              className="w-full h-auto mb-4 rounded"
            />
          )}

          <h1 className="text-4xl font-bold mb-2">{album.name}</h1>
          <p className="mb-4">Released: {album.release_date}</p>
          <h2 className="text-2xl font-semibold mb-2">Tracklist</h2>
          <ul>
            {tracks.map((track) => (
              <li key={track.id} className="mb-2 flex items-center">
                <p className="font-semibold">{track.name}</p>
                {track.preview_url && (
                  <audio controls src={track.preview_url} className="ml-4" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
