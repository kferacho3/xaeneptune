// /src/app/api/spotify/artist-top-tracks/route.ts
import { NextResponse } from 'next/server';
import { getSpotifyToken } from '../_getToken';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artistId') || '7iysPipkcsfGFVEgUMDzHQ';
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const topTracks = await response.json();
    return NextResponse.json(topTracks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch top tracks' }, { status: 500 });
  }
}
