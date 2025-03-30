// /src/api/spotify/auth.ts
import axios, { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri =
    process.env.NODE_ENV === "production"
      ? process.env.SPOTIFY_REDIRECT_URI_PROD
      : process.env.SPOTIFY_REDIRECT_URI_DEV;

  // Debug logging (server-side)
  console.log("=== /api/spotify/auth DEBUG INFO ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("clientId:", clientId);
  console.log("clientSecret starts with:", clientSecret?.slice(0, 5));
  console.log("Using redirectUri =>", redirectUri);

  const tokenEndpoint = "https://accounts.spotify.com/api/token";

  try {
    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        code,
        redirect_uri: redirectUri as string,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      },
    );
    res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error(
      "Spotify Auth Error:",
      (error as AxiosError).response?.data || error,
    );
    res.status(400).json({ error: "Failed to fetch token" });
  }
}
