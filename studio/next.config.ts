import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repo also has a top-level package-lock.json (the marketing
  // site at the repo root, a separate Vite app) — without this, Next
  // infers the wrong workspace root from that sibling lockfile.
  turbopack: {
    root: path.join(__dirname),
  },

  // WebContainer (in-browser Node.js runtime) needs SharedArrayBuffer,
  // which the browser only exposes when COOP/COEP headers are set.
  // Only the workspace route (/studio/<uuid>) runs a WebContainer;
  // other studio pages (login, dashboard) and the marketing site don't
  // need these headers. The regex [0-9a-f-]+ matches Supabase UUIDs
  // but not named routes like /studio/login or /studio/dashboard.
  async headers() {
    return [
      {
        source: "/studio/:id([0-9a-f-]+)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

