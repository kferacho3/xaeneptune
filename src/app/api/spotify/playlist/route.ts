import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get("playlistId");
  if (!playlistId) {
    return NextResponse.json(
      { error: "playlistId is required" },
      { status: 400 },
    );
  }

  try {
    const token = await getSpotifyToken();
    // Adjust 'market' or fields as you like
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?market=US`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      console.error(
        `Error fetching playlist data for ID ${playlistId}: ${response.status} ${await response.text()}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch playlist data" },
        { status: response.status },
      );
    }
    const playlistData = await response.json();
    return NextResponse.json(playlistData);
  } catch (error) {
    console.error("Error in /api/spotify/playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist data" },
      { status: 500 },
    );
  }
}
