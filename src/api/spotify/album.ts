// /pages/api/spotify/album.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyToken } from './_getToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const albumId = req.query.albumId as string;
  if (!albumId) {
    return res.status(400).json({ error: 'albumId is required' });
  }
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const albumData = await response.json();
    res.status(200).json(albumData);
  } catch {
    res.status(500).json({ error: 'Failed to fetch album data' });
  }
}
