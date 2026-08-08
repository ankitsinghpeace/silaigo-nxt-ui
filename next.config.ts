import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mytest0274.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
  // Force dynamic rendering for all routes to prevent AuthProvider issues during build
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
