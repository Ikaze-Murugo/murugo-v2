import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use 'standalone' for production builds if you hit React context / static export issues (e.g. _global-error)
  // output: "standalone",
  // Skip static generation for pages with React context
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // APK is served from EAS artifact URL (see web/app/download/page.tsx); no local APK headers needed
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
