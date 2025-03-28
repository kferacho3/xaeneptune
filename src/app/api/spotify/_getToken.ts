// /src/app/api/spotify/_getToken.ts
export async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const tokenUrl = "https://accounts.spotify.com/api/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!response.ok) {
    console.error(
      `Error fetching Spotify token: ${response.status} ${await response.text()}`,
    );
    throw new Error("Failed to fetch Spotify token");
  }
  const data = await response.json();
  return data.access_token;
}
