// /src/app/api/spotify/artist-albums/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId") || "7iysPipkcsfGFVEgUMDzHQ";
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      console.error(
        `Error fetching artist albums for ID ${artistId}: ${response.status} ${await response.text()}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch albums data" },
        { status: response.status },
      );
    }
    const albumsData = await response.json();
    return NextResponse.json(albumsData);
  } catch (error) {
    console.error("Error in /api/spotify/artist-albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums data" },
      { status: 500 },
    );
  }
}
