// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['i.scdn.co'],
  },
  // any other config options
}

export default nextConfig;
