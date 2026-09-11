import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repo also has a top-level package-lock.json (the marketing
  // site at the repo root, a separate Vite app) — without this, Next
  // infers the wrong workspace root from that sibling lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
