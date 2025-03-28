"use client";

import { hardcodedAlbums } from "@/data/artistsData";
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
//        Accepts SpotifyArtist | null so we don't pass null inadvertently.
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
    return "https://via.placeholder.com/300?text=Vinyl+Record";
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
// EXTRACT TRACKS FOR SELECTED ARTIST
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

  // XO June artist wrapped in useMemo:
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-100 text-indigo-800">
        <div>Loading Artist Data...</div>
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
      <div className="min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-black via-green-800 to-white">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            {mainArtist?.name || "Xae Neptune"}
          </h1>

          {/* Use next/image for main artist's image if it exists */}
          {mainArtist?.images?.[0]?.url && (
            <div className="flex justify-center mb-4 relative w-40 h-40 mx-auto">
              <Image
                src={mainArtist.images[0].url}
                alt={mainArtist.name || "Main Artist"}
                fill
                className="rounded-full object-cover border-4 border-white"
                sizes="(max-width: 768px) 40px, 80px"
              />
            </div>
          )}

          <p className="text-lg mb-2">
            Followers: {mainArtist?.followers?.total ?? 0}
          </p>
          <p className="mb-6">Genres: {mainArtist?.genres?.join(", ") ?? ""}</p>
        </div>

        {/* Associated Artists */}
        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Associated Artists
          </h2>
          {loadingAssociated ? (
            <div className="text-center text-white">
              Loading Associated Artists...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {associatedArtists.map(
                ({
                  id,
                  name = "",
                  images,
                  followers,
                  genres,
                  external_urls,
                }) => {
                  // Base fallback if no images:
                  const baseImageUrl =
                    images && images[0]?.url ? images[0].url : "";

                  // We'll do a lowercase name check for special artist fallback images:
                  const lowerName = name.toLowerCase();
                  const imageUrl =
                    lowerName === "iann tyler"
                      ? "https://i1.sndcdn.com/avatars-8HyvIOZxOAq1iNja-dBVAMA-t500x500.jpg"
                      : lowerName === "kyistt"
                        ? "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5a/12/bc/5a12bc69-7832-d7c2-83d8-7fb3412c4f41/pr_source.png/190x190cc.webp"
                        : lowerName === "statik"
                          ? "https://via.placeholder.com/150?text=Record+Label"
                          : baseImageUrl;

                  // Then render
                  return (
                    <div
                      key={id}
                      className="bg-white shadow-md rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105"
                      onClick={() =>
                        setSelectedArtist({
                          id,
                          name,
                          images,
                          followers,
                          genres,
                          external_urls,
                        })
                      }
                    >
                      <div className="relative w-full h-40 mb-4">
                        <Image
                          src={imageUrl || "/fallback.png"}
                          alt={name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900">
                        {name}
                      </h3>
                      <p className="text-sm text-gray-800">
                        Followers: {followers?.total ?? 0}
                      </p>
                      <p className="text-sm text-gray-800">
                        Genres: {genres?.join(", ") ?? ""}
                      </p>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (external_urls?.spotify) {
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
                            setSelectedArtist({
                              id,
                              name,
                              images,
                              followers,
                              genres,
                              external_urls,
                            });
                          }}
                          className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-100 transition"
                        >
                          View Artist
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------
  // RENDER: SELECTED ARTIST
  // ----------------
  function renderSelectedArtistView() {
    // Build a dynamic gradient if we have the extracted colors
    const backgroundStyle = gradientColors
      ? `linear-gradient(to bottom, ${gradientColors[0]}, ${gradientColors[1]}, white)`
      : "linear-gradient(to bottom, #000000, #FFFFFF)";

    return (
      <div
        className="min-h-screen pt-20 pb-10 px-4"
        style={{
          background: backgroundStyle,
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
          className="fixed top-20 left-5 px-4 py-2 bg-indigo-600 text-white rounded shadow-md hover:bg-indigo-700 transition"
        >
          &larr; Go Back
        </button>
        <div className="max-w-4xl mx-auto text-center text-black">
          <h1 className="text-4xl font-bold mb-4">{selectedArtist?.name}</h1>

          {/* Artist Image (with fallback if needed) */}
          <div className="relative w-40 h-40 mx-auto mb-4">
            <Image
              src={getArtistImageUrl(selectedArtist)}
              alt={selectedArtist?.name || "Selected Artist"}
              fill
              className="rounded-full object-cover border-4 border-black"
              sizes="(max-width: 768px) 40px, 80px"
            />
          </div>

          <p className="text-lg mb-2">
            Followers: {selectedArtist?.followers?.total ?? 0}
          </p>
          <p className="mb-6">
            Genres: {selectedArtist?.genres?.join(", ") ?? ""}
          </p>

          {/* Tab Buttons */}
          <div className="flex justify-center mb-8 space-x-4">
            <button
              onClick={() => setActiveArtistTab("top-tracks")}
              className={`px-4 py-2 rounded ${
                activeArtistTab === "top-tracks"
                  ? "bg-white text-black"
                  : "bg-transparent border border-white text-white hover:bg-gray-700"
              }`}
            >
              Top Tracks
            </button>
            <button
              onClick={() => setActiveArtistTab("discography")}
              className={`px-4 py-2 rounded ${
                activeArtistTab === "discography"
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

  // ----------------------------------------------------------------
  // RENDER: SELECTED ARTIST -> TOP TRACKS
  // ----------------------------------------------------------------
  function renderArtistTopTracks() {
    if (loadingArtistTopTracks) {
      return <p className="text-black">Loading top tracks...</p>;
    }
    if (!artistTopTracks.length) {
      return <p className="text-black">No top tracks found.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artistTopTracks.map((track) => (
          <article
            key={track.id}
            className="bg-white p-4 rounded-lg shadow-md transition-transform hover:scale-105 cursor-pointer"
            onClick={() => {
              const url =
                track.external_urls?.spotify ||
                track.album.external_urls?.spotify;
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {track.name}
            </h2>
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
  }

  // ----------------------------------------------------------------
  // RENDER: SELECTED ARTIST -> DISCOGRAPHY
  // ----------------------------------------------------------------
  function renderArtistDiscography() {
    if (loadingTracks) {
      return <p className="text-black">Loading discography...</p>;
    }
    if (selectedDiscographyAlbum) {
      return renderDiscographyAlbumDetail();
    }
    if (!artistDiscography.length) {
      return (
        <p className="text-black">No discography found for this artist.</p>
      );
    }

    // grid of albums
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {artistDiscography.map((group) => (
          <div
            key={group.album.id}
            className="bg-white rounded-md shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleDiscographyTracks(group.album)}
          >
            <div className="relative w-full h-48">
              {group.album.images?.[0]?.url ? (
                <Image
                  src={group.album.images[0].url}
                  alt={`${group.album.name} cover`}
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/fallback-album.png"
                  alt="No album cover"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-3">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {group.album.name}
              </h3>
              <p className="text-gray-700 text-sm">
                {group.album.release_date
                  ? group.album.release_date.substring(0, 4)
                  : ""}
              </p>
            </div>
          </div>
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
      <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 bg-white bg-opacity-80 rounded-lg shadow-md">
        <div className="md:w-1/2 shadow-lg rounded-md overflow-hidden">
          {selectedDiscographyAlbum.images?.[0]?.url && (
            <Image
              src={selectedDiscographyAlbum.images[0].url}
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
                    const url =
                      track.external_urls?.spotify ||
                      track.album.external_urls?.spotify;
                    if (url) window.open(url, "_blank");
                  }}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                    {selectedDiscographyAlbum.images?.[0]?.url && (
                      <Image
                        src={selectedDiscographyAlbum.images[0].url}
                        alt={`${selectedDiscographyAlbum.name} cover`}
                        fill
                        className="object-cover"
                      />
                    )}
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
                      const url =
                        track.external_urls?.spotify ||
                        track.album.external_urls?.spotify;
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
  }
}
