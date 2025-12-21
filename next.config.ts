import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Using webpack instead of Turbopack for Windows compatibility
};

export default nextConfig;
