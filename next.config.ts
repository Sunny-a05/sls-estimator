import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel uses default SSR mode — API routes become Serverless Functions
  // Workers are handled natively via `new Worker(new URL(...), import.meta.url)`
};

export default nextConfig;
