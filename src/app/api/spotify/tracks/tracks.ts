// /src/app/api/spotify/albums/[albumId]/tracks/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(
  request: Request,
  { params }: { params: { albumId: string } },
) {
  const albumId = params.albumId;
  if (!albumId) {
    return NextResponse.json({ error: "albumId is required" }, { status: 400 });
  }

  // Extract query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const market = searchParams.get("market") || "US";
  const limit = searchParams.get("limit") || "50";
  const offset = searchParams.get("offset") || "0";

  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?market=${market}&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      console.error(
        `Error fetching album tracks data for ID ${albumId}: ${response.status} ${await response.text()}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch album tracks data" },
        { status: response.status },
      );
    }
    const tracksData = await response.json();
    return NextResponse.json(tracksData);
  } catch (error) {
    console.error(`Error in /api/spotify/albums/${albumId}/tracks:`, error);
    return NextResponse.json(
      { error: "Failed to fetch album tracks data" },
      { status: 500 },
    );
  }
}
