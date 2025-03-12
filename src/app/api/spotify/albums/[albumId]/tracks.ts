// /src/app/api/spotify/albums/[albumId]/tracks/route.ts
import { NextResponse } from 'next/server';
import { getSpotifyToken } from '../../_getToken';

export async function GET(
  request: Request,
  { params }: { params: { albumId: string } }
) {
  const albumId = params.albumId;
  if (!albumId) {
    return NextResponse.json({ error: 'albumId is required' }, { status: 400 });
  }
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tracksData = await response.json();
    return NextResponse.json(tracksData);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch album tracks data' }, { status: 500 });
  }
}
