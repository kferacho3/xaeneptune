// /src/app/api/spotify/artist-top-tracks/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId") || "7iysPipkcsfGFVEgUMDzHQ";
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      console.error(
        `Error fetching top tracks for ID ${artistId}: ${response.status} ${await response.text()}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch top tracks" },
        { status: response.status },
      );
    }
    const topTracks = await response.json();
    return NextResponse.json(topTracks);
  } catch (error) {
    console.error("Error in /api/spotify/artist-top-tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch top tracks" },
      { status: 500 },
    );
  }
}
