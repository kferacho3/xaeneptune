"use client";

import { hardcodedAlbums } from "@/data/artistsData";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// ---------------------
// INTERFACES
// ---------------------
interface SpotifyArtist {
  id: string;
  name: string;
  images?: { url: string }[];
  followers?: { total: number };
  genres?: string[];
  external_urls?: { spotify?: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url?: string | null;
  external_urls?: {
    spotify?: string;
    soundcloud?: string; // if needed
  };
  album: {
    id: string;
    name: string;
    images?: { url: string }[];
    release_date: string;
    external_urls?: { spotify?: string };
  };
  artists: { id?: string; name: string }[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images?: { url: string }[];
  release_date: string;
  external_urls?: { spotify?: string };
  tracks?: SpotifyTrack[];
}

interface TopTracksResponse {
  tracks: SpotifyTrack[];
}

interface DiscographyGroup {
  album: SpotifyAlbum;
  tracks: SpotifyTrack[];
}

// ----------------------------------------------------------------------
// XO June fallback album
// ----------------------------------------------------------------------
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
      external_urls: {
        spotify: "https://soundcloud.com/xojune/real-foyf",
        soundcloud: "https://soundcloud.com/xojune/real-foyf",
      },
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

// ----------------------------------------------------------------------
// HELPER: GET ARTIST IMAGE (with fallback for iann tyler, kyistt, statik)
// ----------------------------------------------------------------------
function getArtistImageUrl(artist: SpotifyArtist | null): string {
  // If the "artist" is null or there's no artist.name, return a fallback.
  if (!artist || !artist.name) {
    return "https://via.placeholder.com/150?text=No+Image";
  }

  // If there ARE images, use the first one
  if (artist.images && artist.images.length > 0 && artist.images[0].url) {
    return artist.images[0].url;
  }

  // Otherwise, handle special fallback by name
  const lowerName = artist.name.toLowerCase();
  if (lowerName === "iann tyler") {
    return "https://i1.sndcdn.com/avatars-8HyvIOZxOAq1iNja-dBVAMA-t500x500.jpg";
  } else if (lowerName === "kyistt") {
    return "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5a/12/bc/5a12bc69-7832-d7c2-83d8-7fb3412c4f41/pr_source.png/190x190cc.webp";
  } else if (lowerName === "statik") {
    return "https://xaeneptune.s3.us-east-2.amazonaws.com/images/Artist/xaeneptune-no-profile.webp";
  }

  // Generic fallback
  return "https://via.placeholder.com/150?text=No+Image";
}

// ----------------------------------------------------------------------
// UTILITY: FETCH ALBUM DATA FROM SPOTIFY (for real images, release date, etc.)
// ----------------------------------------------------------------------
async function fetchSpotifyAlbum(
  albumId: string,
): Promise<SpotifyAlbum | null> {
  try {
    const res = await fetch(`/api/spotify/album?albumId=${albumId}`);
    if (!res.ok) {
      console.error(
        `Error fetching album data for ${albumId}`,
        await res.text(),
      );
      return null;
    }
    const album = await res.json();
    return album as SpotifyAlbum;
  } catch (error) {
    console.error("Error in fetchSpotifyAlbum:", error);
    return null;
  }
}

// ----------------------------------------------------------------------
// UTILITY: FETCH ALBUM TRACKS
// ----------------------------------------------------------------------
async function fetchAlbumTracks(albumId: string): Promise<SpotifyTrack[]> {
  try {
    // Might need to be /api/spotify/album-tracks?albumId=xxx in your app
    const res = await fetch(`/api/spotify/album?albumId=${albumId}/tracks`);
    if (!res.ok) {
      console.error(
        `Error fetching tracks for album ${albumId}: ${await res.text()}`,
      );
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching tracks for album ${albumId}:`, error);
    return [];
  }
}

// ----------------------------------------------------------------------
// UTILITY: FUZZY MATCHING FOR ARTIST NAMES
// ----------------------------------------------------------------------
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

function isSimilar(name1: string, name2: string): boolean {
  const a = name1.replace(/\s/g, "").toLowerCase();
  const b = name2.replace(/\s/g, "").toLowerCase();
  return longestCommonSubstring(a, b) >= 5;
}

// ----------------------------------------------------------------------
// UTILITY: IMAGE SAMPLING FOR GRADIENT (optional, as in your code)
// ----------------------------------------------------------------------
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function extractPrimaryColors(imageUrl: string): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Could not get canvas context");
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // sample half top-left
      const data1 = ctx.getImageData(0, 0, img.width / 2, img.height / 2).data;
      let r1 = 0,
        g1 = 0,
        b1 = 0,
        count1 = 0;
      for (let i = 0; i < data1.length; i += 4) {
        r1 += data1[i];
        g1 += data1[i + 1];
        b1 += data1[i + 2];
        count1++;
      }
      r1 = Math.floor(r1 / count1);
      g1 = Math.floor(g1 / count1);
      b1 = Math.floor(b1 / count1);

      // sample bottom-right
      const data2 = ctx.getImageData(
        img.width / 2,
        img.height / 2,
        img.width / 2,
        img.height / 2,
      ).data;
      let r2 = 0,
        g2 = 0,
        b2 = 0,
        count2 = 0;
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
    img.onerror = () => reject("Image load error");
  });
}

// ----------------------------------------------------------------------
// For AHMAD - we only want these two songs in top tracks & discography
// ----------------------------------------------------------------------
  function getAhmadFallbackTopTracks(): SpotifyTrack[] {
  // "neptune sent it" from "jordanyear" (id=6PBCQ44h15c7VN35lAzu3M, track=jt1)
  // "FIND YOUR LOVE" from "Social Networks" (id=55Xr7mE7Zya6ccCViy7yyh, track=sn5)
  const jordanyear = hardcodedAlbums["6PBCQ44h15c7VN35lAzu3M"];
  const social = hardcodedAlbums["55Xr7mE7Zya6ccCViy7yyh"];

  const track1 = jordanyear.tracks.find((t) => t.id === "jt1");
  const track2 = social.tracks.find((t) => t.id === "sn5");

  if (!track1 || !track2) return [];

  const track1WithAlbum = {
    ...track1,
    album: {
      ...jordanyear,
      tracks: [], // remove the sub-tracks to avoid recursion
    },
  };
  const track2WithAlbum = {
    ...track2,
    album: {
      ...social,
      tracks: [],
    },
  };
  return [track1WithAlbum, track2WithAlbum];
}

// ----------------------------------------------------------------------
// UTILITY: EXTRACT TRACKS FOR SELECTED ARTIST
// ----------------------------------------------------------------------
async function extractTracksForArtist(
  artist: SpotifyArtist,
  setArtistDiscography: (groups: DiscographyGroup[]) => void,
  setLoadingTracks: (loading: boolean) => void,
) {
  setLoadingTracks(true);
  const artistName = artist.name;
  let extractedTracks: SpotifyTrack[] = [];

  // Go through all fallback albums in `hardcodedAlbums`
  for (const albumId in hardcodedAlbums) {
    const album = hardcodedAlbums[albumId];
    const albumTracks = album.tracks || [];

    // Filter to tracks that have both this artist + Xae Neptune
    const filtered = albumTracks.filter((track) => {
      const hasArtist = track.artists.some((a) =>
        isSimilar(a.name, artistName),
      );
      const hasXae = track.artists.some(
        (a) => a.name.toLowerCase() === "xae neptune",
      );
      return hasArtist && hasXae;
    });

    // Adapt track album data
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

  // If the selected artist is XO June, add the XO June fallback album
  if (artist.name.toLowerCase() === "xo june") {
    extractedTracks = [
      ...extractedTracks,
      ...xoJuneAlbum.tracks.map((t) => ({
        ...t,
        album: {
          id: xoJuneAlbum.id,
          name: xoJuneAlbum.name,
          images: xoJuneAlbum.images,
          release_date: xoJuneAlbum.release_date,
          external_urls: xoJuneAlbum.external_urls,
        },
      })),
    ];
  }

  // Special rule for Ahmad: only show the two specific albums/tracks
  if (artist.name.toLowerCase() === "ahmad") {
    const ahmadTracks = getAhmadFallbackTopTracks();
    extractedTracks = ahmadTracks;
  }

  // Remove duplicates
  const uniqueTracksMap = new Map<string, SpotifyTrack>();
  extractedTracks.forEach((t) => {
    if (!uniqueTracksMap.has(t.id)) uniqueTracksMap.set(t.id, t);
  });
  const uniqueTracks = Array.from(uniqueTracksMap.values());

  // Group by album
  const discographyMap = new Map<string, DiscographyGroup>();
  uniqueTracks.forEach((track) => {
    const albumId = track.album.id;
    if (discographyMap.has(albumId)) {
      discographyMap.get(albumId)!.tracks.push(track);
    } else {
      discographyMap.set(albumId, { album: track.album, tracks: [track] });
    }
  });

  // Attempt to fetch real album data from Spotify
  for (const [albumId, group] of discographyMap.entries()) {
    const spAlbum = await fetchSpotifyAlbum(albumId);
    if (spAlbum) {
      // Overwrite fallback with real album data
      if (spAlbum.images && spAlbum.images.length > 0) {
        group.album.images = spAlbum.images;
      }
      if (spAlbum.release_date) {
        group.album.release_date = spAlbum.release_date;
      }
      if (spAlbum.external_urls) {
        group.album.external_urls = spAlbum.external_urls;
      }
      if (spAlbum.name) {
        group.album.name = spAlbum.name;
      }
    }
  }

  // Sort tracks so that Xae Neptune is first if he's the lead
  discographyMap.forEach((group) => {
    group.tracks.sort((a, b) => {
      const aHasXae =
        a.artists[0].name.toLowerCase() === "xae neptune" ? -1 : 1;
      const bHasXae =
        b.artists[0].name.toLowerCase() === "xae neptune" ? -1 : 1;
      return aHasXae - bHasXae;
    });
  });

  setArtistDiscography(Array.from(discographyMap.values()));
  setLoadingTracks(false);
}

// ----------------------------------------------------------------------
// ARTIST COMPONENT
// ----------------------------------------------------------------------
export default function Artist() {
  const [mainArtist, setMainArtist] = useState<SpotifyArtist | null>(null);
  const [associatedArtists, setAssociatedArtists] = useState<SpotifyArtist[]>(
    [],
  );
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingAssociated, setLoadingAssociated] = useState(true);

  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(
    null,
  );
  const [activeArtistTab, setActiveArtistTab] = useState<
    "top-tracks" | "discography"
  >("top-tracks");

  const [artistTopTracks, setArtistTopTracks] = useState<SpotifyTrack[]>([]);
  const [loadingArtistTopTracks, setLoadingArtistTopTracks] = useState(false);

  const [artistDiscography, setArtistDiscography] = useState<
    DiscographyGroup[]
  >([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const [selectedDiscographyAlbum, setSelectedDiscographyAlbum] =
    useState<SpotifyAlbum | null>(null);
  const [discographyTracks, setDiscographyTracks] = useState<SpotifyTrack[]>(
    [],
  );

  const [gradientColors, setGradientColors] = useState<[string, string] | null>(
    null,
  );

  // Main Artist is Xae Neptune
  const mainArtistId = "7iysPipkcsfGFVEgUMDzHQ";

  // Associated IDs wrapped in useMemo:
  const associatedArtistIds = useMemo(
    () => [
      "4ihlULofncvxd3Cz7ewTNV", // Jyse
      "3uwUJ78bwdDBLo3O04xlnL", // Kartier
      "4nRgpdGBG8DPYMHikqUp3w", // Bigbulwayne
      "6mFKPMFGbulPhOnj3UvzAF", // Vxin
      "0z3M3HSEsrgi5YmwY5e9fB",
      "2pZnyv4zLqnSDktBqXQlZz",
      "0zRLHcRfGiz3GCHk852mIL",
      "6cPZNDrHphEZ3ok4t8K7ZT",
      "5bNFzNn84AoUqClYZJKan5",
            "1IwJ9sVzmn5hBSe02HsLnM",
      "5pVOuKzA3hhsdScwg2k4o",
      "3k8lBDenIm90lWaSpAYQeH",
      "4O0urd9sL16UmRnmdHienf",
      "05eq9g0p6jze8k6Wva5BUz",
      "2pZnyv4zLqnSDktBqXQlZz",
      "0z3M3HSEsrgi5YmwY5e9fB",
      "4wtNgDt8QcZCPfx64NiBGi",
      "6E9lvijZw6hhoNiEaZ765i",
    ],
    [],
  );

  // XO June artist wrapped in useMemo:
  const xoJuneArtist: SpotifyArtist = useMemo(
    () => ({
      id: "xo-june",
      name: "XO June",
      images: [
        {
          url: "https://i1.sndcdn.com/avatars-WTj6LWMHQK0o1lDw-Vz5D1A-t500x500.jpg",
        },
      ],
      followers: { total: 0 },
      genres: [],
      external_urls: { spotify: "https://soundcloud.com/xojune" },
    }),
    [],
  );

  // ----------------
  // Fetch main artist (Xae Neptune)
  // ----------------
  useEffect(() => {
    const fetchMainArtist = async () => {
      try {
        const res = await fetch(`/api/spotify/artist?artistId=${mainArtistId}`);
        const data: SpotifyArtist = await res.json();
        setMainArtist(data);
      } catch (error) {
        console.error("Error fetching main artist data:", error);
      } finally {
        setLoadingMain(false);
      }
    };
    fetchMainArtist();
  }, []);

  // ----------------
  // Fetch associated artists in parallel
  // ----------------
  useEffect(() => {
    const fetchAssociatedArtists = async () => {
      try {
        const promises = associatedArtistIds.map((id) =>
          fetch(`/api/spotify/artist?artistId=${id}`).then((res) => res.json()),
        );
        const artistsData = await Promise.all(promises);

        // Add XO June
        const allArtists = [...artistsData, xoJuneArtist];
        setAssociatedArtists(allArtists);
      } catch (error) {
        console.error("Error fetching associated artists:", error);
      } finally {
        setLoadingAssociated(false);
      }
    };
    fetchAssociatedArtists();
  }, [associatedArtistIds, xoJuneArtist]);

  // ----------------
  // When user selects an artist, fetch top tracks & discography
  // ----------------
  useEffect(() => {
    if (!selectedArtist) return;

    setLoadingArtistTopTracks(true);

    // Special case: Ahmad
    if (selectedArtist.name.toLowerCase() === "ahmad") {
      const fallback = getAhmadFallbackTopTracks();
      setArtistTopTracks(fallback);
      setLoadingArtistTopTracks(false);
    } else {
      // Normal flow
      fetch(`/api/spotify/artist-top-tracks?artistId=${selectedArtist.id}`)
        .then((res) => res.json())
        .then((data: TopTracksResponse) => {
          setArtistTopTracks(data.tracks.slice(0, 10) || []);
        })
        .catch((error) => {
          console.error("Error fetching artist top tracks:", error);
          setArtistTopTracks([]);
        })
        .finally(() => {
          setLoadingArtistTopTracks(false);
        });
    }

    extractTracksForArtist(
      selectedArtist,
      setArtistDiscography,
      setLoadingTracks,
    );
  }, [selectedArtist]);

  // ----------------
  // Handle discography album click -> fetch tracklist
  // ----------------
  async function handleDiscographyTracks(album: SpotifyAlbum) {
    setSelectedDiscographyAlbum(album);

    // fetch real album data
    const spAlbum = await fetchSpotifyAlbum(album.id);
    if (spAlbum && spAlbum.images && spAlbum.images.length > 0) {
      album.images = spAlbum.images;
      album.release_date = spAlbum.release_date || album.release_date;
      album.external_urls = spAlbum.external_urls || album.external_urls;
      album.name = spAlbum.name || album.name;
    }

    // If fallback tracks exist, skip fetch from Spotify:
    const tracks: SpotifyTrack[] =
      album.tracks && album.tracks.length > 0
        ? album.tracks
        : await fetchAlbumTracks(album.id);

    const adapted = tracks.map((track) => ({
      ...track,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        release_date: album.release_date,
        external_urls: album.external_urls,
      },
    }));
    setDiscographyTracks(adapted);
  }

  // ----------------
  // Compute background gradient colors
  // ----------------
  useEffect(() => {
    let imageUrl = "";
    if (selectedDiscographyAlbum && selectedDiscographyAlbum.images?.[0]?.url) {
      imageUrl = selectedDiscographyAlbum.images[0].url;
    } else if (selectedArtist?.images?.[0]?.url) {
      imageUrl = selectedArtist.images[0].url;
    } else if (
      mainArtist?.name?.toLowerCase() === "xae neptune" &&
      mainArtist.images?.[0]?.url
    ) {
      imageUrl = mainArtist.images[0].url;
    }

    if (imageUrl) {
      extractPrimaryColors(imageUrl)
        .then((colors) => {
          if (mainArtist?.name.toLowerCase() === "xae neptune") {
            setGradientColors(["#000000", colors[1]]);
          } else {
            setGradientColors(colors);
          }
        })
        .catch((err) => {
          console.error(err);
          setGradientColors(null);
        });
    } else {
      setGradientColors(null);
    }
  }, [selectedDiscographyAlbum, selectedArtist, mainArtist]);

  // ----------------
  // RENDER MAIN
  // ----------------
  if (loadingMain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // If no artist selected yet, show main artist page
  return selectedArtist ? renderSelectedArtistView() : renderMainView();

  // ----------------
  // RENDER: MAIN VIEW (Xae Neptune + Associated)
  // ----------------
  function renderMainView() {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-emerald-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 px-8 py-16">
          {/* Main Artist Header */}
          <motion.header
            className="max-w-5xl mx-auto text-center mb-20"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-emerald-300"
              initial={{ letterSpacing: "0.5em", opacity: 0 }}
              animate={{ letterSpacing: "0.05em", opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {mainArtist?.name || "XAE NEPTUNE"}
            </motion.h1>

            {/* Main artist image */}
            {mainArtist?.images?.[0]?.url && (
              <motion.div
                className="relative w-48 h-48 mx-auto mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full blur-2xl opacity-50" />
                <Image
                  src={mainArtist.images[0].url}
                  alt={mainArtist.name || "Main Artist"}
                  fill
                  className="rounded-full object-cover border-4 border-white/80 shadow-2xl"
                  sizes="192px"
                />
              </motion.div>
            )}

            <motion.div
              className="text-gray-300 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xl">
                <span className="text-purple-400 font-semibold">
                  {mainArtist?.followers?.total?.toLocaleString() ?? 0}
                </span>{" "}
                Followers
              </p>
              {mainArtist?.genres && mainArtist.genres.length > 0 && (
                <p className="text-lg">
                  {mainArtist.genres.map((genre, i) => (
                    <span
                      key={i}
                                         className="inline-block px-3 py-1 mx-1 bg-purple-900/30 rounded-full text-purple-300 text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </p>
              )}
            </motion.div>
          </motion.header>

          {/* Associated Artists Section */}
          <motion.section
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2
              className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-emerald-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Collaborators & Featured Artists
            </motion.h2>

            {loadingAssociated ? (
              <div className="flex justify-center">
                <motion.div
                  className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {associatedArtists.map((artist, index) => {
                  const imageUrl = getArtistImageUrl(artist);
                  
                  return (
                    <motion.article
                      key={artist.id}
                      className="group relative"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -10 }}
                    >
                      <div
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 cursor-pointer overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
                        onClick={() => setSelectedArtist(artist)}
                      >
                        {/* Background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-emerald-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-emerald-600/10 group-hover:to-purple-600/10 transition-all duration-500" />
                        
                        {/* Artist Image */}
                        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                          <Image
                            src={imageUrl}
                            alt={artist.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </motion.div>
                        </div>

                        {/* Artist Info */}
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-1">
                          {artist.followers?.total?.toLocaleString() ?? 0} followers
                        </p>
                        {artist.genres && artist.genres.length > 0 && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {artist.genres.join(", ")}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (artist.external_urls?.spotify) {
                                window.open(artist.external_urls.spotify, "_blank");
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Spotify
                          </button>
                          <button
                            className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>
    );
  }

  // ----------------
  // RENDER: SELECTED ARTIST
  // ----------------
  function renderSelectedArtistView() {
    const backgroundStyle = gradientColors
      ? `linear-gradient(to bottom, ${gradientColors[0]}, ${gradientColors[1]}, #000000)`
      : "linear-gradient(to bottom, #000000, #1a1a1a)";

    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: backgroundStyle }}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => {
            setSelectedArtist(null);
            setArtistTopTracks([]);
            setArtistDiscography([]);
            setSelectedDiscographyAlbum(null);
            setDiscographyTracks([]);
          }}
          className="fixed top-20 left-5 z-50 px-4 py-2 bg-purple-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </motion.button>

        <div className="relative z-10 px-8 py-20">
          {/* Artist Header */}
          <motion.header
            className="max-w-5xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-black mb-6 text-white"
              initial={{ letterSpacing: "0.3em", opacity: 0 }}
              animate={{ letterSpacing: "0.02em", opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {selectedArtist?.name}
            </motion.h1>

            <motion.div
              className="relative w-40 h-40 mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full blur-xl opacity-50" />
              <Image
                src={getArtistImageUrl(selectedArtist)}
                alt={selectedArtist?.name || "Selected Artist"}
                fill
                className="rounded-full object-cover border-4 border-white/80 shadow-2xl"
                sizes="160px"
              />
            </motion.div>

            <motion.div
              className="text-gray-300 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-lg">
                <span className="text-purple-400 font-semibold">
                  {selectedArtist?.followers?.total?.toLocaleString() ?? 0}
                </span>{" "}
                Followers
              </p>
              {selectedArtist?.genres && selectedArtist.genres.length > 0 && (
                <p>
                  {selectedArtist.genres.map((genre, i) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1 mx-1 bg-purple-900/30 rounded-full text-purple-300 text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </p>
              )}
            </motion.div>
          </motion.header>

          {/* Tab Navigation */}
          <nav className="flex justify-center mb-12">
            <motion.div
              className="relative flex bg-gray-900/50 backdrop-blur-sm rounded-full p-1 border border-gray-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="absolute h-full bg-gradient-to-r from-purple-600 to-emerald-600 rounded-full"
                initial={false}
                animate={{
                  x: activeArtistTab === "top-tracks" ? 0 : "100%",
                  width: "50%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              <button
                onClick={() => setActiveArtistTab("top-tracks")}
                className={`relative z-10 px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                  activeArtistTab === "top-tracks"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Top Tracks
              </button>
              <button
                onClick={() => setActiveArtistTab("discography")}
                className={`relative z-10 px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                  activeArtistTab === "discography"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Discography
              </button>
            </motion.div>
          </nav>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeArtistTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {activeArtistTab === "top-tracks"
                ? renderArtistTopTracks()
                : renderArtistDiscography()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RENDER: SELECTED ARTIST -> TOP TRACKS
  // ----------------------------------------------------------------
  function renderArtistTopTracks() {
    if (loadingArtistTopTracks) {
      return (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (!artistTopTracks.length) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artistTopTracks.map((track, index) => (
          <motion.article
            key={track.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative"
          >
            <div
              className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => {
                const url =
                  track.external_urls?.spotify ||
                  track.album.external_urls?.spotify;
                if (url) window.open(url, "_blank");
              }}
            >
              {/* Background gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-emerald-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-emerald-600/10 group-hover:to-purple-600/10 transition-all duration-500" />
              
                            {/* Album cover */}
              {track.album.images?.[0]?.url && (
                <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <Image
                    src={track.album.images[0].url}
                    alt={`${track.album.name} cover`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Track info */}
              <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
                {track.name}
              </h2>
              <p className="text-sm text-gray-400 mb-1 line-clamp-1">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {track.album.name}
              </p>

              {/* Audio preview */}
              {track.preview_url && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <audio
                    controls
                    src={track.preview_url}
                    className="w-full h-8 custom-audio"
                  />
                </motion.div>
              )}

              {/* Spotify icon */}
              <div className="absolute top-4 right-4 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RENDER: SELECTED ARTIST -> DISCOGRAPHY
  // ----------------------------------------------------------------
  function renderArtistDiscography() {
    if (loadingTracks) {
      return (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (selectedDiscographyAlbum) {
      return renderDiscographyAlbumDetail();
    }
    if (!artistDiscography.length) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 text-lg"
        >
          No discography found for this artist.
        </motion.p>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {artistDiscography.map((group, index) => (
          <motion.article
            key={group.album.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative cursor-pointer"
            onClick={() => handleDiscographyTracks(group.album)}
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              {/* Album cover */}
              <div className="relative w-full aspect-square overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                {group.album.images?.[0]?.url ? (
                  <Image
                    src={group.album.images[0].url}
                    alt={`${group.album.name} cover`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-emerald-900 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                )}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* Album info */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
                  {group.album.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {group.album.release_date
                    ? new Date(group.album.release_date).getFullYear()
                    : "Unknown"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {group.tracks.length} track{group.tracks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RENDER: SELECTED ALBUM (FROM DISCOGRAPHY) -> TRACK LIST
  // ----------------------------------------------------------------
  function renderDiscographyAlbumDetail() {
    if (!selectedDiscographyAlbum) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <button
          onClick={() => {
            setSelectedDiscographyAlbum(null);
            setDiscographyTracks([]);
          }}
          className="mb-6 px-4 py-2 bg-purple-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Albums
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Album cover and info */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl mb-6">
                {selectedDiscographyAlbum.images?.[0]?.url && (
                  <Image
                    src={selectedDiscographyAlbum.images[0].url}
                    alt={`${selectedDiscographyAlbum.name} cover`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedDiscographyAlbum.name}
              </h2>
              <p className="text-gray-400 mb-4">
                {selectedDiscographyAlbum.release_date
                  ? new Date(selectedDiscographyAlbum.release_date).getFullYear()
                  : "Unknown Year"}
              </p>
              <p className="text-sm text-gray-500">
                {discographyTracks.length} track{discographyTracks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>

          {/* Track list */}
          <motion.div
            className="lg:w-2/3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {discographyTracks.length > 0 ? (
              <ul className="space-y-3">
                {discographyTracks.map((track, index) => (
                  <motion.li
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div
                      className="flex items-center gap-4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-purple-500/50 hover:bg-gray-900/70 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        const url =
                          track.external_urls?.spotify ||
                          track.album.external_urls?.spotify;
                        if (url) window.open(url, "_blank");
                      }}
                    >
                      {/* Track number */}
                      <div className="flex-shrink-0 w-8 text-center">
                                                <span className="text-gray-500 group-hover:text-purple-400 transition-colors">
                          {index + 1}
                        </span>
                      </div>

                      {/* Album thumbnail */}
                      <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                        {selectedDiscographyAlbum.images?.[0]?.url && (
                          <Image
                            src={selectedDiscographyAlbum.images[0].url}
                            alt={`${selectedDiscographyAlbum.name} cover`}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>

                      {/* Track info */}
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300 truncate">
                          {track.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      </div>

                      {/* Play button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url =
                            track.external_urls?.spotify ||
                            track.album.external_urls?.spotify;
                          if (url) window.open(url, "_blank");
                        }}
                        className="flex-shrink-0 w-10 h-10 bg-purple-600/20 hover:bg-purple-600/30 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300"
                      >
                        <svg className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No tracks found for this album.
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

}