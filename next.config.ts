import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
};

// Next.js 14+ / 16+ has allowedDevOrigins in the root object or specific experimental depending on strictness
// But wait, the error is likely because standard typescript ignores undocumented Next.js flags sometimes
const extendConfig = {
  ...nextConfig,
  allowedDevOrigins: ['10.177.87.87']
};

export default extendConfig;
