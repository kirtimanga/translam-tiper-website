import type { NextConfig } from "next";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "tiper.translam.com";
const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || "tiper.translam.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // API uploads (main path)
      {
        protocol: "https",
        hostname: BACKEND_DOMAIN,
        pathname: "/api/uploads/**",
      },

      // Safety net (if /uploads is used anywhere)
      {
        protocol: "https",
        hostname: BACKEND_DOMAIN,
        pathname: "/uploads/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `https://${BACKEND_DOMAIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
