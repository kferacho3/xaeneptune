'use client';

import { hardcodedAlbums } from '@/data/artistsData';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SpotifyArtist {
  id: string;
  name: string;
  images?: { url: string }[];
  followers?: { total: number };
  genres?: string[];
  external_urls?: { spotify: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url?: string | null;
  external_urls?: { spotify: string };
  album: {
    id: string;
    name: string;
    images?: { url: string }[];
    release_date: string;
    external_urls?: { spotify: string };
  };
  artists: { id?: string; name: string }[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images?: { url: string }[];
  release_date: string;
  external_urls?: { spotify: string };
  tracks?: SpotifyTrack[];
}

interface TopTracksResponse {
  tracks: SpotifyTrack[];
}

interface DiscographyGroup {
  album: SpotifyAlbum;
  tracks: SpotifyTrack[];
}

/**
 * Returns the album cover URL. If the image URL is a Spotify album page (containing "open.spotify.com/album"),
 * then we return a fallback mapping URL.
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

/**
 * Hardcoded XO June album – always used when on Xae Neptune’s page.
 */
const xoJuneAlbum: SpotifyAlbum & { tracks: SpotifyTrack[] } = {
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
      album: {
        id: "xo-june-bedroom-tapes-vol1",
        name: "Bedroom Tapes, Vol 1.",
        images: [
          {
            url: "https://i1.sndcdn.com/artworks-HO9ZhEvqdwTcFVk2-R8IuQQ-t1080x1080.jpg",
          },
        ],
        release_date: "2024",
        external_urls: { spotify: "https://soundcloud.com/xojune/real-foyf" },
      },
      artists: [{ name: "XO June" }],
    },
  ],
};

/**
 * Utility to compute the longest common substring length.
 */
function longestCommonSubstring(s1: string, s2: string): number {
  let maxLen = 0;
  const dp: number[][] = Array(s1.length + 1)
    .fill(null)
    .map(() => Array(s2.length + 1).fill(0));
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLen) maxLen = dp[i][j];
      }
    }
  }
  return maxLen;
}

/**
 * Fuzzy matching helper – considers names similar if the longest common substring is >= 5.
 */
function isSimilar(name1: string, name2: string): boolean {
  const a = name1.replace(/\s/g, '').toLowerCase();
  const b = name2.replace(/\s/g, '').toLowerCase();
  return longestCommonSubstring(a, b) >= 5;
}

/**
 * Fetch album tracks via our API.
 */
async function fetchAlbumTracks(albumId: string): Promise<SpotifyTrack[]> {
  try {
    const res = await fetch(`/api/spotify/albums/${albumId}/tracks?market=ES&limit=50`);
    if (!res.ok) {
      console.error(`Error fetching tracks for album ${albumId}: ${await res.text()}`);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching tracks for album ${albumId}:`, error);
    return [];
  }
}

/**
 * Extract primary colors from an image. For Xae Neptune’s page, this is used to generate
 * a gradient background from his album cover.
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function extractPrimaryColors(imageUrl: string): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      // Sample top-left quadrant
      const data1 = ctx.getImageData(0, 0, img.width / 2, img.height / 2).data;
      let r1 = 0, g1 = 0, b1 = 0, count1 = 0;
      for (let i = 0; i < data1.length; i += 4) {
        r1 += data1[i];
        g1 += data1[i + 1];
        b1 += data1[i + 2];
        count1++;
      }
      r1 = Math.floor(r1 / count1);
      g1 = Math.floor(g1 / count1);
      b1 = Math.floor(b1 / count1);
      // Sample bottom-right quadrant
      const data2 = ctx.getImageData(
        img.width / 2,
        img.height / 2,
        img.width / 2,
        img.height / 2
      ).data;
      let r2 = 0, g2 = 0, b2 = 0, count2 = 0;
      for (let i = 0; i < data2.length; i += 4) {
        r2 += data2[i];
        g2 += data2[i + 1];
        b2 += data2[i + 2];
        count2++;
      }
      r2 = Math.floor(r2 / count2);
      g2 = Math.floor(g2 / count2);
      b2 = Math.floor(b2 / count2);
      resolve([rgbToHex(r1, g1, b1), rgbToHex(r2, g2, b2)]);
    };
    img.onerror = () => reject('Image load error');
  });
}

/**
 * Extract tracks for the selected artist from the hardcodedAlbums.
 * This helper uses fuzzy matching to include tracks that feature both the selected artist
 * and Xae Neptune. The result is grouped by album.
 */
async function extractTracksForArtist(
  artist: SpotifyArtist,
  setArtistDiscography: (groups: DiscographyGroup[]) => void,
  setLoadingTracks: (loading: boolean) => void
) {
  setLoadingTracks(true);
  const artistName = artist.name;
  let extractedTracks: SpotifyTrack[] = [];

  for (const albumId in hardcodedAlbums) {
    const album = hardcodedAlbums[albumId];
    // Use fallback tracks if available; otherwise, fetch from API.
    const albumTracks =
      album.tracks && album.tracks.length > 0
        ? album.tracks
        : await fetchAlbumTracks(album.id);

    const filtered = albumTracks.filter((track) => {
      const hasArtist = track.artists.some((a) => isSimilar(a.name, artistName));
      const hasXae = track.artists.some((a) => a.name.toLowerCase() === 'xae neptune');
      return hasArtist && hasXae;
    });

    const adaptedTracks = filtered.map((track) => ({
      ...track,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        release_date: album.release_date,
        external_urls: album.external_urls,
      },
    }));
    extractedTracks = [...extractedTracks, ...adaptedTracks];
  }

  // Remove duplicate tracks.
  const uniqueTracksMap = new Map<string, SpotifyTrack>();
  extractedTracks.forEach((track) => {
    if (!uniqueTracksMap.has(track.id)) uniqueTracksMap.set(track.id, track);
  });
  const uniqueTracks = Array.from(uniqueTracksMap.values());

  // Group tracks by album.
  const discographyMap = new Map<string, DiscographyGroup>();
  uniqueTracks.forEach((track) => {
    const albumId = track.album.id;
    if (discographyMap.has(albumId)) {
      discographyMap.get(albumId)!.tracks.push(track);
    } else {
      discographyMap.set(albumId, { album: track.album, tracks: [track] });
    }
  });

  // Include XO June’s album if the selected artist is XO June.
  if (artist.name.toLowerCase() === 'xo june') {
    discographyMap.set(xoJuneAlbum.id, { album: xoJuneAlbum, tracks: xoJuneAlbum.tracks });
  }

  // Sort each album’s tracks so that Xae Neptune appears first if he is the lead artist.
  discographyMap.forEach(group => {
    group.tracks.sort((a, b) => {
      const aHasXae = a.artists[0].name.toLowerCase() === 'xae neptune' ? -1 : 1;
      const bHasXae = b.artists[0].name.toLowerCase() === 'xae neptune' ? -1 : 1;
      return aHasXae - bHasXae;
    });
  });

  setArtistDiscography(Array.from(discographyMap.values()));
  setLoadingTracks(false);
}

/**
 * Main Artist Component.
 *
 * For the main artist (Xae Neptune), the background gradient is derived from his album cover.
 * When an associated artist is selected, only albums that feature both the selected artist and
 * Xae Neptune (as determined by our hardcoded data) are shown.
 * Clicking an album shows its tracklist as in the Music component.
 */
export default function Artist() {
  const [mainArtist, setMainArtist] = useState<SpotifyArtist | null>(null);
  const [associatedArtists, setAssociatedArtists] = useState<SpotifyArtist[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingAssociated, setLoadingAssociated] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [activeArtistTab, setActiveArtistTab] = useState<'top-tracks' | 'discography'>('top-tracks');
  const [artistTopTracks, setArtistTopTracks] = useState<SpotifyTrack[]>([]);
  const [loadingArtistTopTracks, setLoadingArtistTopTracks] = useState(false);
  const [artistDiscography, setArtistDiscography] = useState<DiscographyGroup[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [selectedDiscographyAlbum, setSelectedDiscographyAlbum] = useState<SpotifyAlbum | null>(null);
  const [discographyTracks, setDiscographyTracks] = useState<SpotifyTrack[]>([]);
  const [gradientColors, setGradientColors] = useState<[string, string] | null>(null);

  // Main artist (Xae Neptune) is fetched from our API.
  const mainArtistId = '7iysPipkcsfGFVEgUMDzHQ';
  const associatedArtistIds = [
    '0zRLHcRfGiz3GCHk852mIL',
    '6cPZNDrHphEZ3ok4t8K7ZT',
    '5bNFzNn84AoUqClYZJKan5',
    '1IwJ9sVzmn5hBSe02HsLnM',
    '5pVOuKzA3hhsdScwg2k4o',
    '3k8lBDenIm90lWaSpAYQeH',
    '4O0urd9sL16UmRnmdHienf',
    '05eq9g0p6jze8k6Wva5BUz',
    '2pZnyv4zLqnSDktBqXQlZz',
    '0z3M3HSEsrgi5YmwY5e9fB',
    '4wtNgDt8QcZCPfx64NiBGi',
    '6E9lvijZw6hhoNiEaZ765i'
  ];
  // Hardcoded XO June artist.
  const xoJuneArtist: SpotifyArtist = {
    id: 'xo-june',
    name: 'XO June',
    images: [{ url: "https://i1.sndcdn.com/avatars-WTj6LWMHQK0o1lDw-Vz5D1A-t500x500.jpg" }],
    followers: { total: 0 },
    genres: [],
    external_urls: { spotify: "https://soundcloud.com/xojune" }
  };

  // Fetch main artist data.
  useEffect(() => {
    const fetchMainArtist = async () => {
      try {
        const res = await fetch(`/api/spotify/artist?artistId=${mainArtistId}`);
        const data = await res.json();
        setMainArtist(data);
      } catch (error) {
        console.error('Error fetching main artist data:', error);
      } finally {
        setLoadingMain(false);
      }
    };
    fetchMainArtist();
  }, []);

  // Fetch associated artists.
  useEffect(() => {
    const fetchAssociatedArtists = async () => {
      try {
        const promises = associatedArtistIds.map((id) =>
          fetch(`/api/spotify/artist?artistId=${id}`).then((res) => res.json())
        );
        const artistsData = await Promise.all(promises);
        setAssociatedArtists([...artistsData, xoJuneArtist]);
      } catch (error) {
        console.error('Error fetching associated artists:', error);
      } finally {
        setLoadingAssociated(false);
      }
    };
    fetchAssociatedArtists();
  }, []);

  // When an artist is selected, fetch their top tracks and extract their discography.
  useEffect(() => {
    if (selectedArtist) {
      setLoadingArtistTopTracks(true);
      fetch(`/api/spotify/artist-top-tracks?artistId=${selectedArtist.id}`)
        .then((res) => res.json())
        .then((data: TopTracksResponse) => {
          setArtistTopTracks(data.tracks.slice(0, 10) || []);
        })
        .catch((error) => {
          console.error('Error fetching artist top tracks:', error);
          setArtistTopTracks([]);
        })
        .finally(() => {
          setLoadingArtistTopTracks(false);
        });
      extractTracksForArtist(selectedArtist, setArtistDiscography, setLoadingTracks);
    }
  }, [selectedArtist]);

  // Handle album click in the discography view.
  async function handleDiscographyTracks(album: SpotifyAlbum) {
    setSelectedDiscographyAlbum(album);
    const tracks: SpotifyTrack[] =
      album.tracks && album.tracks.length > 0
        ? album.tracks
        : await fetchAlbumTracks(album.id);
    const adaptedTracks = tracks.map((track) => ({
      ...track,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        release_date: album.release_date,
        external_urls: album.external_urls,
      },
    }));
    setDiscographyTracks(adaptedTracks);
  }

  // Compute the gradient colors.
  // For the main artist page (Xae Neptune) we use his album cover,
  // otherwise we use the selected artist's or album's image.
  useEffect(() => {
    let imageUrl = "";
    if (selectedDiscographyAlbum && selectedDiscographyAlbum.images?.[0]?.url) {
      imageUrl = selectedDiscographyAlbum.images[0].url;
    } else if (selectedArtist && selectedArtist.images && selectedArtist.images[0]?.url) {
      imageUrl =
        selectedArtist.name.toLowerCase() === 'xo june'
          ? "https://i1.sndcdn.com/avatars-WTj6LWMHQK0o1lDw-Vz5D1A-t500x500.jpg"
          : selectedArtist.images[0].url;
    } else if (mainArtist && mainArtist.name.toLowerCase() === 'xae neptune') {
      // Use the Xae Neptune album cover from xoJuneAlbum for background
      imageUrl = xoJuneAlbum.images?.[0]?.url || "";
    } else if (mainArtist && mainArtist.images && mainArtist.images[0]?.url) {
      imageUrl = mainArtist.images[0].url;
    }
    if (imageUrl) {
      extractPrimaryColors(imageUrl)
        .then((colors) => setGradientColors(colors))
        .catch((err) => {
          console.error(err);
          setGradientColors(null);
        });
    } else {
      setGradientColors(null);
    }
  }, [selectedDiscographyAlbum, selectedArtist, mainArtist]);

  // Render the main artist view.
  const renderMainView = () => (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-white to-indigo-100">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">{mainArtist?.name}</h1>
        {mainArtist?.images && mainArtist.images[0] && (
          <div className="flex justify-center mb-4">
            <img
              src={mainArtist.images[0].url}
              alt={mainArtist.name}
              className="w-40 h-40 rounded-full object-cover mx-auto"
            />
          </div>
        )}
        <p className="text-lg mb-2 text-gray-800">
          Followers: {mainArtist?.followers?.total ?? 0}
        </p>
        <p className="mb-6 text-gray-800">
          Genres: {mainArtist?.genres?.join(", ") ?? ""}
        </p>
      </div>
      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
          Associated Artists
        </h2>
        {loadingAssociated ? (
          <div className="text-center text-gray-800">
            Loading Associated Artists...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {associatedArtists.map(({ id, name = "", images, followers, genres, external_urls }) => {
              const baseImageUrl = images && images[0]?.url ? images[0].url : "";
              const lowerName = name.toLowerCase();
              const imageUrl =
                lowerName === "iann tyler"
                  ? "https://i1.sndcdn.com/avatars-8HyvIOZxOAq1iNja-dBVAMA-t500x500.jpg"
                  : lowerName === "kyistt"
                  ? "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5a/12/bc/5a12bc69-7832-d7c2-83d8-7fb3412c4f41/pr_source.png/190x190cc.webp"
                  : lowerName === "statik"
                  ? "https://via.placeholder.com/150?text=Record+Label"
                  : baseImageUrl;
              return (
                <div
                  key={id}
                  className="bg-white shadow-md rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105"
                  onClick={() =>
                    setSelectedArtist({ id, name, images, followers, genres, external_urls })
                  }
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-800">Followers: {followers?.total ?? 0}</p>
                  <p className="text-sm text-gray-800">Genres: {genres?.join(", ") ?? ""}</p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (external_urls && external_urls.spotify) {
                          window.open(external_urls.spotify, "_blank");
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Open Spotify
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArtist({ id, name, images, followers, genres, external_urls });
                      }}
                      className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-100 transition"
                    >
                      View Artist
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render top tracks for the selected artist.
  const renderArtistTopTracks = () => {
    if (loadingArtistTopTracks) {
      return <p className="text-gray-800">Loading top tracks...</p>;
    }
    if (!artistTopTracks.length) {
      return <p className="text-gray-800">No top tracks found.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artistTopTracks.map((track) => (
          <article
            key={track.id}
            className="bg-white p-4 rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer"
            onClick={() => {
              const url = track.external_urls?.spotify || track.album.external_urls?.spotify;
              if (url) window.open(url, "_blank");
            }}
          >
            {track.album.images?.[0]?.url && (
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={track.album.images[0].url}
                  alt={`${track.album.name} cover`}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{track.name}</h2>
            <p className="text-sm text-gray-700">Album: {track.album.name}</p>
            {track.preview_url ? (
              <audio controls src={track.preview_url} className="w-full mt-2" />
            ) : (
              <p className="text-xs text-gray-500 mt-2">No preview available</p>
            )}
          </article>
        ))}
      </div>
    );
  };

  // Render the discography view.
  const renderArtistDiscography = () => {
    if (loadingTracks) {
      return <p className="text-gray-800">Loading discography...</p>;
    }
    if (selectedDiscographyAlbum) {
      return renderDiscographyAlbumDetail();
    }
    if (!artistDiscography.length) {
      return <p className="text-gray-800">No discography found for this artist.</p>;
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {artistDiscography.map((group) => (
          <div
            key={group.album.id}
            className="bg-white rounded-md shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleDiscographyTracks(group.album)}
          >
            <div className="relative w-full h-48">
              <Image
                src={getAlbumCoverUrl(group.album)}
                alt={`${group.album.name} cover`}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {group.album.name}
              </h3>
              <p className="text-gray-700 text-sm">
                {group.album.release_date ? group.album.release_date.substring(0, 4) : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render detailed view for a selected album in the discography.
  const renderDiscographyAlbumDetail = () => {
    if (!selectedDiscographyAlbum) return null;
    return (
      <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 bg-white bg-opacity-80 rounded-lg shadow-md">
        <div className="md:w-1/2 shadow-lg rounded-md overflow-hidden">
          {selectedDiscographyAlbum.images?.[0]?.url && (
            <Image
              src={getAlbumCoverUrl(selectedDiscographyAlbum)}
              alt={`${selectedDiscographyAlbum.name} cover`}
              width={500}
              height={500}
              className="w-full h-auto object-cover rounded-lg"
              priority
            />
          )}
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            {selectedDiscographyAlbum.name}
          </h2>
          {discographyTracks.length > 0 ? (
            <ul className="space-y-4">
              {discographyTracks.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center bg-gray-100 rounded-md p-3 cursor-pointer transition-colors hover:bg-gray-200"
                  onClick={() => {
                    const url = track.external_urls?.spotify || track.album.external_urls?.spotify;
                    if (url) window.open(url, "_blank");
                  }}
                >
                  <div className="flex-shrink-0">
                    <div className="relative w-12 h-12 rounded overflow-hidden">
                      <Image
                        src={getAlbumCoverUrl(selectedDiscographyAlbum)}
                        alt={`${selectedDiscographyAlbum.name} cover`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-900">{track.name}</p>
                    <p className="text-sm text-gray-700">
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = track.external_urls?.spotify || track.album.external_urls?.spotify;
                      if (url) window.open(url, "_blank");
                    }}
                    className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    Play Song &rarr;
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No tracks found for this album.</p>
          )}
          <button
            onClick={() => {
              setSelectedDiscographyAlbum(null);
              setDiscographyTracks([]);
            }}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Back to Albums
          </button>
        </div>
      </div>
    );
  };

  if (loadingMain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-100 text-indigo-800">
        <div>Loading Artist Data...</div>
      </div>
    );
  }

  return selectedArtist ? renderSelectedArtistView() : renderMainView();

  function renderSelectedArtistView() {
    return (
      <div
        className="min-h-screen pt-20 pb-10 px-4"
        style={{
          background: gradientColors
            ? `linear-gradient(to bottom, ${gradientColors[0]}, ${gradientColors[1]}, white)`
            : undefined,
        }}
      >
        <button
          onClick={() => {
            setSelectedArtist(null);
            setArtistTopTracks([]);
            setArtistDiscography([]);
            setSelectedDiscographyAlbum(null);
            setDiscographyTracks([]);
          }}
          className="fixed top-5 left-5 px-4 py-2 bg-indigo-600 text-white rounded shadow-md hover:bg-indigo-700 transition"
        >
          &larr; Go Back
        </button>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{selectedArtist?.name}</h1>
          {selectedArtist?.images && selectedArtist.images[0] && (
            <div className="flex justify-center mb-4">
              <img
                src={
                  selectedArtist.name.toLowerCase() === 'xo june'
                    ? "https://i1.sndcdn.com/avatars-WTj6LWMHQK0o1lDw-Vz5D1A-t500x500.jpg"
                    : selectedArtist.images[0].url
                }
                alt={selectedArtist.name}
                className="w-40 h-40 rounded-full object-cover mx-auto"
              />
            </div>
          )}
          <p className="text-lg mb-2 text-gray-800">
            Followers: {selectedArtist?.followers?.total ?? 0}
          </p>
          <p className="mb-6 text-gray-800">
            Genres: {selectedArtist?.genres?.join(", ") ?? ""}
          </p>
          <div className="flex justify-center mb-8 space-x-4">
            <button
              onClick={() => setActiveArtistTab("top-tracks")}
              className={`px-4 py-2 rounded ${activeArtistTab === "top-tracks"
                  ? "bg-white text-black"
                  : "bg-transparent border border-white text-white hover:bg-gray-700"
                }`}
            >
              Top Tracks
            </button>
            <button
              onClick={() => setActiveArtistTab("discography")}
              className={`px-4 py-2 rounded ${activeArtistTab === "discography"
                  ? "bg-white text-black"
                  : "bg-transparent border border-white text-white hover:bg-gray-700"
                }`}
            >
              Discography
            </button>
          </div>
          {activeArtistTab === "top-tracks"
            ? renderArtistTopTracks()
            : renderArtistDiscography()}
        </div>
      </div>
    );
  }
}
