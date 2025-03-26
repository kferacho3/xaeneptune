// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error: appDir is experimental and may not be defined in the current type definitions
    appDir: true,
  },
  images: {
    domains: ['i.scdn.co', 'i1.sndcdn.com', 'open.spotify.com'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      type: 'asset/source', // loads shader files as raw text
    });
    return config;
  },
};

export default nextConfig;
