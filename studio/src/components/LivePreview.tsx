"use client";

import type { ContainerPhase } from "@/lib/webcontainer";

type LivePreviewProps = {
  /** The URL of the running dev server inside the WebContainer. */
  url: string | null;
  /** Current boot phase of the WebContainer. */
  phase: ContainerPhase;
  /** Why the container failed, when phase is "error". */
  error?: string | null;
};

/**
 * Renders a live preview iframe for the WebContainer dev server.
 * Shows appropriate loading states while the container boots, installs
 * deps, and starts the dev server.
 */
export function LivePreview({ url, phase, error }: LivePreviewProps) {
  if (phase === "error") {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-red-400/10 p-6">
          <p className="text-sm font-semibold text-red-400">
            WebContainer failed to start
          </p>
          {error ? (
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-ink-950/60 p-2.5 font-mono text-[11px] whitespace-pre-wrap text-cream-100/70">
              {error}
            </pre>
          ) : null}
          <p className="mt-3 text-xs text-cream-100/50">
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
