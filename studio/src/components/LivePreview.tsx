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
    const steps = [
      { key: "booting", label: "Booting sandbox" },
      { key: "installing", label: "Installing dependencies" },
      { key: "starting", label: "Starting dev server" },
    ] as const;
    const currentIndex = steps.findIndex((s) => s.key === phase);

    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-[220px]">
          <div className="mx-auto size-7 animate-spin rounded-full border-2 border-teal-400/25 border-t-teal-400" />
          <ul className="mt-5 space-y-2">
            {steps.map((step, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-2 text-xs transition ${
                    active
                      ? "text-cream-100/80"
                      : done
                        ? "text-cream-100/35"
                        : "text-cream-100/20"
                  }`}
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      active
                        ? "animate-pulse bg-teal-400"
                        : done
                          ? "bg-teal-400/40"
                          : "bg-cream-100/15"
                    }`}
                  />
                  {step.label}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-cream-100/25">
            First load installs React and Vite inside your browser — this takes
            a few seconds.
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
