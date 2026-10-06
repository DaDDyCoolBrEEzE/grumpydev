import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The preview is opened from GoDaddy's host, not localhost.
  allowedDevOrigins: [
    "godaddy.com",
    "**.godaddy.com",
    "godaddysites.com",
    "**.godaddysites.com",
    "secureserver.net",
    "**.secureserver.net",
  ],
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
