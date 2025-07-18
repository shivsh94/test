import type { NextConfig } from "next";
import crypto from "crypto";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "swyftin-prod-agape.s3.amazonaws.com",
        // pathname: '/events/cover/**', // Only include if you want to restrict to this path
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
  generateBuildId: async () => {
    return crypto.randomUUID();
  },
};

export default nextConfig;
