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
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.silaigo.com/:path*",
      },
      {
        source: "/kurti",
        destination: "/category/kurti",
      },
      {
        source: "/blouse",
        destination: "/category/blouse",
      },
      {
        source: "/suits",
        destination: "/category/suits",
      },
      {
        source: "/sharara-sets",
        destination: "/category/sharara-sets",
      },
      {
        source: "/co-ords-sets",
        destination: "/category/co-ords-sets",
      },
      {
        source: "/dresses",
        destination: "/category/dresses",
      },
      {
        source: "/ready-to-wear-sarees",
        destination: "/category/ready-to-wear-sarees",
      },
      {
        source: "/lehengas",
        destination: "/category/lehengas",
      },
    ];
  },
};


export default nextConfig;
