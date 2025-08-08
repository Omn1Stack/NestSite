import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', // allow images from your dev backend
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // allow Unsplash images
      },
      {
        protocol: 'https',
        hostname: 'www.befunky.com'
      },
      {
        protocol: 'https',
        hostname: 'sdmntpreastus.oaiusercontent.com'
      }
    ],
  },
  allowedDevOrigins: ["http://192.168.1.104:3000"], 
  
};

export default nextConfig;
