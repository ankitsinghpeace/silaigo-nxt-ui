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
};

export default nextConfig;
