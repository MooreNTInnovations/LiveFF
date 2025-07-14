import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is the crucial setting that creates a static export.
  output: 'export',
};

export default nextConfig;
