import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@sanity/image-url'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
};

export default nextConfig;
