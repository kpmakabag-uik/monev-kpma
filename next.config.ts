import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.210.14", "localhost", "pipe-almost-tickets-classic.trycloudflare.com"],
  output: "standalone",
  /* config options here */
};

export default nextConfig;
