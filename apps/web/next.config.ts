import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.GATEWAY_URL ?? "http://localhost:3100"}/api/:path*` }];
  }
};

export default nextConfig;
