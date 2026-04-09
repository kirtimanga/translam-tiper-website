import type { NextConfig } from "next";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "tiper.translam.com";
const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || "tiper.translam.com";
const isLocal = BACKEND_DOMAIN.includes("localhost");
const BACKEND_PROTOCOL = isLocal ? "http" : "https";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // API uploads (main path)
      {
        protocol: isLocal ? "http" : "https",
        hostname: BACKEND_DOMAIN.split(":")[0],
        ...(isLocal && BACKEND_DOMAIN.includes(":") ? { port: BACKEND_DOMAIN.split(":")[1] } : {}),
        pathname: "/api/uploads/**",
      },

      // Safety net (if /uploads is used anywhere)
      {
        protocol: isLocal ? "http" : "https",
        hostname: BACKEND_DOMAIN.split(":")[0],
        ...(isLocal && BACKEND_DOMAIN.includes(":") ? { port: BACKEND_DOMAIN.split(":")[1] } : {}),
        pathname: "/uploads/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_PROTOCOL}://${BACKEND_DOMAIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
