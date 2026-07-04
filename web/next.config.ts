import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // Add any other image hosts you use
      {
        protocol: 'https',
        hostname: 'cdn.comvia.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
