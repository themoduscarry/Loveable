"use client";

import type { ContainerPhase } from "@/lib/webcontainer";

type LivePreviewProps = {
  /** The URL of the running dev server inside the WebContainer. */
  url: string | null;
  /** Current boot phase of the WebContainer. */
  phase: ContainerPhase;
};

/**
 * Renders a live preview iframe for the WebContainer dev server.
 * Shows appropriate loading states while the container boots, installs
 * deps, and starts the dev server.
 */
export function LivePreview({ url, phase }: LivePreviewProps) {
  if (phase === "error") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="rounded-2xl bg-red-400/10 p-6 text-center">
          <p className="text-sm font-semibold text-red-400">
            WebContainer failed to start
          </p>
          <p className="mt-2 text-xs text-cream-100/50">
            Try refreshing the page. If the problem persists, your browser may
            not support WebContainers.
          </p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-400" />
          <p className="mt-4 text-sm text-cream-100/50">
            {phase === "booting" && "Booting WebContainer…"}
            {phase === "installing" && "Installing dependencies…"}
            {phase === "starting" && "Starting dev server…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title="Live Preview"
      className="h-full w-full border-0 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      allow="cross-origin-isolated"
    />
  );
}
