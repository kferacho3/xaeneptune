// /src/app/api/spotify/artist/route.ts
import { NextResponse } from 'next/server';
import { getSpotifyToken } from '../_getToken';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artistId') || '7iysPipkcsfGFVEgUMDzHQ';
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const artistData = await response.json();
    return NextResponse.json(artistData);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch artist data' }, { status: 500 });
  }
}
