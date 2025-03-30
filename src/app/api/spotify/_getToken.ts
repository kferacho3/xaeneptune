// /src/app/api/spotify/_getToken.ts
export async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const tokenUrl = "https://accounts.spotify.com/api/token";

  console.log("=== /api/spotify/_getToken DEBUG INFO ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("clientId:", clientId);
  console.log("clientSecret starts with:", clientSecret?.slice(0, 5));

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error fetching Spotify token: ${response.status} ${errorText}`);
    throw new Error("Failed to fetch Spotify token");
  }

  const data = await response.json();
  return data.access_token;
}
