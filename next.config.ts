import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.fortnite-api.com",
        pathname: "/stats/**",
      },
    ],
  },
};

export default nextConfig;
