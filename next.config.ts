import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        
      },
       {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        
      },
      

    ],
  },
};

export default nextConfig;
