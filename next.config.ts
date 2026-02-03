// next.config.ts (full updated version)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },

  turbopack: {
    resolveAlias: {
      // Only alias for browser/client bundles (Turbopack allows object with 'browser' key)
      fs: { browser: 'next-internal-empty-module' },
      path: { browser: 'next-internal-empty-module' },
      os: { browser: 'next-internal-empty-module' },
      crypto: { browser: 'next-internal-empty-module' },
      stream: { browser: 'next-internal-empty-module' },
      // Add more if needed, but only browser-specific
    },
  },

  poweredByHeader: false,
  compress: true,
};

export default nextConfig;