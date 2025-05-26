// next.config.ts
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  // ← appDir at top‐level, not under `experimental`
  appDir: true,

  images: {
    domains: [
      "i.scdn.co",
      "via.placeholder.com",
      "i1.sndcdn.com",
      "open.spotify.com",
      "is1-ssl.mzstatic.com",
      "xaeneptune.s3.us-east-2.amazonaws.com",
    ],
  },

  eslint: {
    // Only run ESLint on files in the 'src' directory.
    dirs: ["src"],
  },

  webpack(config: Configuration): Configuration {
    config.module?.rules?.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      type: "asset/source", // loads shader files as raw text
    });
    return config;
  },
};

export default nextConfig;
