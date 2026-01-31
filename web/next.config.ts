import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use 'standalone' for production builds if you hit React context / static export issues (e.g. _global-error)
  // output: "standalone",
  // Skip static generation for pages with React context
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
