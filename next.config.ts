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

  experimental: {
    forceSwcTransforms: true,
  },

  allowedDevOrigins: [
    "admin-dashboard-fix-90.cluster-5.preview.emergentcf.cloud",
    "3bdb106f-e360-4a3e-a19a-e7172fcb87b9.preview.emergentagent.com",
    "3bdb106f-e360-4a3e-a19a-e7172fcb87b9.cluster-5.preview.emergentcf.cloud",
    "nostalgic-vaughan-14.cluster-12.preview.emergentcf.cloud",
    "*.preview.emergentagent.com",
    "*.cluster-12.preview.emergentcf.cloud",
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.silaigo.com/:path*",
      },
    ];
  },
};

export default nextConfig;
