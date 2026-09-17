"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { ModelTier } from "@/lib/modelRouter";
import {
  bootAndStart,
  isWebContainerSupported,
  writeFile as writeContainerFile,
  VITE_PROJECT_TEMPLATE,
  type ContainerPhase,
  type RuntimeError,
  type WebContainerInstance,
} from "@/lib/webcontainer";
import { LivePreview } from "@/components/LivePreview";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-cream-100/40">
      Loading editor…
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StudioProject = {
  id: string;
  name: string;
  slug: string;
  github_repo_name: string | null;
  github_repo_owner: string | null;
};

type FileEntry = { path: string; content: string };

/**
 * Code Guard Stage 1: the diff buffer. A candidate that has passed Stage 2
 * (server-side static analysis) but hasn't been committed to the visible
 * file yet — it sits here while Stage 3 (client-side runtime check) runs,
 * and either lands via commitCandidate or gets discarded on a runtime
 * failure, leaving the editor showing previousContent throughout.
 */
type PendingCandidate = {
  path: string;
  content: string;
  previousContent: string;
  model: string;
  route: { tier: ModelTier; reason: string };
  creditsCharged: number;
  newBalance: number;
};

/** How long Stage 3 waits for the preview to report a runtime error. */
const STAGE3_CHECK_WINDOW_MS = 2500;

/** Shared top bar for the editor and preview panes. */
function PaneHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-cream-100/8 px-3">
      {children}
    </div>
  );
}

/** Small pill showing whether the preview sandbox is up — Stage 3 needs it. */
function ContainerBadge({ phase }: { phase: ContainerPhase }) {
  const { dot, label } =
    phase === "running"
      ? { dot: "bg-green-400", label: "sandbox ready" }
      : phase === "error"
        ? { dot: "bg-red-400", label: "sandbox down" }
        : { dot: "bg-amber-400 animate-pulse", label: "sandbox starting" };

  return (
    <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-cream-100/40">
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/**
 * Monaco's TypeScript worker has no React or node_modules types, so it
 * flags ordinary JSX as broken — red squiggles under code that compiles
 * fine. Code Guard Stage 2 runs a real `tsc` server-side against the full
 * type graph, so the browser's half-informed semantic pass is pure noise.
 * Syntax validation stays on: that part it gets right.
 */
function configureMonaco(monaco: Monaco) {
  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    ...ts.typescriptDefaults.getCompilerOptions(),
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    esModuleInterop: true,
  });
  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
}

const STARTER_FILES: FileEntry[] = [
  {
    path: "src/App.tsx",
    content: `export default function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Hello from VBC AI Studio</h1>
      <p>Start by describing a change in the prompt below.</p>
    </main>
  );
}
`,
  },
  {
    path: "src/index.css",
    content: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
`,
  },
];

/** Enhanced generate outcome — includes Code Guard Stage 3. */
type GenerateOutcome =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "stage3_checking";
      model: string;
      route: { tier: ModelTier; reason: string };
      creditsCharged: number;
      newBalance: number;
      candidatePath: string;
    }
  | {
      kind: "passed";
      model: string;
      route: { tier: ModelTier; reason: string };
      creditsCharged: number;
      newBalance: number;
    }
  | {
      kind: "code_guard_failed";
      diagnostics: string;
      creditsCharged: number;
      newBalance: number;
    }
  | {
      kind: "runtime_failed";
      errors: RuntimeError[];
      creditsCharged: number;
      newBalance: number;
    }
  | { kind: "insufficient_credits"; balance: number; required: number }
  | { kind: "provider_not_configured"; message: string }
  | { kind: "error"; message: string };

export function StudioWorkspace({
  project,
  initialBalance,
}: {
  project: StudioProject;
  initialBalance: number;
}) {
  // Editor state
  const [files, setFiles] = useState<FileEntry[]>(STARTER_FILES);
  const [activePath, setActivePath] = useState(STARTER_FILES[0].path);
  const [prompt, setPrompt] = useState("");
  const [balance, setBalance] = useState(initialBalance);
  const [outcome, setOutcome] = useState<GenerateOutcome>({ kind: "idle" });

  // WebContainer state
  const containerRef = useRef<WebContainerInstance | null>(null);
  const [containerPhase, setContainerPhase] = useState<ContainerPhase>("booting");
  const [containerError, setContainerError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const runtimeErrorsRef = useRef<RuntimeError[]>([]);

  // Code Guard Stage 1: diff buffer
  const [pendingCandidate, setPendingCandidate] = useState<PendingCandidate | null>(null);

  // Whether the browser supports WebContainer at all
  const [containerSupported] = useState(() => isWebContainerSupported());

  const activeFile = files.find((f) => f.path === activePath) ?? files[0];

  // ------- WebContainer lifecycle -------

  useEffect(() => {
    if (!containerSupported) {
      setContainerError(
        "This page isn't cross-origin isolated, so SharedArrayBuffer is unavailable. " +
          "Check that /studio/<id> is served with Cross-Origin-Opener-Policy: same-origin " +
          "and Cross-Origin-Embedder-Policy: credentialless, and that you're on Chrome or Edge.",
      );
      setContainerPhase("error");
      return;
    }

    let cancelled = false;

    async function boot() {
      try {
        const container = await bootAndStart(VITE_PROJECT_TEMPLATE, {
          onPhase(phase) {
            if (!cancelled) setContainerPhase(phase);
          },
          onUrl(url) {
            if (!cancelled) setPreviewUrl(url);
          },
          onRuntimeError(errors) {
            runtimeErrorsRef.current = errors;
          },
        });

        // Unmounted while the boot was still in flight. Only one
        // WebContainer can exist per page, so this one has to go or the
        // next mount can't boot at all.
        if (cancelled) {
          container.teardown();
          return;
        }

        containerRef.current = container;
        // Sync starter files into the container.
        for (const file of files) {
          await writeContainerFile(container, file.path, file.content);
        }
      } catch (err) {
        if (!cancelled) {
          setContainerError(err instanceof Error ? err.message : String(err));
          setContainerPhase("error");
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
      containerRef.current?.teardown();
      containerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSupported]);

  // ------- File editing — sync to WebContainer -------

  function updateActiveFileContent(content: string) {
    setFiles((prev) =>
      prev.map((f) => (f.path === activePath ? { ...f, content } : f)),
    );
    const container = containerRef.current;
    if (container) {
      writeContainerFile(container, activePath, content).catch(() => {});
    }
  }

  // ------- Code Guard Stage 3: runtime check in the WebContainer -------

  /** Commit a candidate that passed (or skipped) Stage 3 into the editor. */
  const commitCandidate = useCallback((candidate: PendingCandidate) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === candidate.path ? { ...f, content: candidate.content } : f)),
    );
    setPendingCandidate(null);
    setOutcome({
      kind: "passed",
      model: candidate.model,
      route: candidate.route,
      creditsCharged: candidate.creditsCharged,
      newBalance: candidate.newBalance,
    });
  }, []);

  const runStage3 = useCallback(
    async (candidate: PendingCandidate) => {
      setOutcome({
        kind: "stage3_checking",
        model: candidate.model,
        route: candidate.route,
        creditsCharged: candidate.creditsCharged,
        newBalance: candidate.newBalance,
        candidatePath: candidate.path,
      });

      const container = containerRef.current;
      if (!container) {
        // No WebContainer available (unsupported browser, still booting,
        // or failed to start) — nothing can run Stage 3, so let the
        // Stage-2-passed candidate through rather than blocking on it.
        commitCandidate(candidate);
        return;
      }

      runtimeErrorsRef.current = [];
      await writeContainerFile(container, candidate.path, candidate.content);

      // Give the preview a short window to reload and report any runtime
      // errors via the WebContainer's forwardPreviewErrors channel.
      await new Promise((resolve) => setTimeout(resolve, STAGE3_CHECK_WINDOW_MS));

      const errors = runtimeErrorsRef.current;
      if (errors.length > 0) {
        // Roll the preview back to the last-known-good content so it
        // doesn't keep showing the broken candidate.
        await writeContainerFile(container, candidate.path, candidate.previousContent);
        setPendingCandidate(null);
        setOutcome({
          kind: "runtime_failed",
          errors,
          creditsCharged: candidate.creditsCharged,
          newBalance: candidate.newBalance,
        });
        return;
      }

      commitCandidate(candidate);
    },
    [commitCandidate],
  );

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setOutcome({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          prompt,
          filePath: activeFile.path,
          context: activeFile.content,
        }),
      });
    } catch {
      setOutcome({
        kind: "error",
        message: "Couldn't reach /api/generate — check your connection and try again.",
      });
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      // The response wasn't JSON at all — almost always the platform's own
      // timeout/error page rather than anything our route returned, e.g. a
      // generation that ran past the serverless function's time budget.
      setOutcome({
        kind: "error",
        message:
          res.status === 504
            ? "The request timed out before finishing. Try a smaller, more localized edit."
            : `Unexpected response from the server (status ${res.status}). Try again.`,
      });
      return;
    }

    if (res.status === 402) {
      setOutcome({ kind: "insufficient_credits", balance: data.balance, required: data.required });
      return;
    }
    if (res.status === 503) {
      setOutcome({ kind: "provider_not_configured", message: data.message });
      return;
    }
    if (res.status === 422) {
      setOutcome({
        kind: "code_guard_failed",
        diagnostics: data.diagnostics,
        creditsCharged: data.creditsCharged,
        newBalance: data.newBalance,
      });
      setBalance(data.newBalance);
      return;
    }
    if (!res.ok) {
      setOutcome({ kind: "error", message: data.error ?? `Request failed (${res.status})` });
      return;
    }

    // Stage 2 (server-side static analysis) passed. Hold the candidate in
    // the diff buffer and run Stage 3 (client-side runtime check) before
    // it ever lands in the visible editor.
    setBalance(data.newBalance);
    setPrompt("");

    const candidate: PendingCandidate = {
      path: activeFile.path,
      content: data.code,
      previousContent: activeFile.content,
      model: data.model,
      route: data.route,
      creditsCharged: data.creditsCharged,
      newBalance: data.newBalance,
    };
    setPendingCandidate(candidate);
    await runStage3(candidate);
  }

  return (
    <div className="flex h-screen flex-col bg-ink-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-cream-100/8 px-4">
        <div className="flex items-center gap-3">
          <Link href="/studio/dashboard" className="text-cream-100/50 transition hover:text-cream-50">
            ←
          </Link>
          <span className="text-sm font-semibold text-cream-50">{project.name}</span>
          <span className="font-mono text-xs text-cream-100/30">{project.slug}</span>
        </div>
        <div className="flex items-center gap-4">
          {project.github_repo_name ? (
            <span className="font-mono text-xs text-teal-300/80">
              {project.github_repo_owner}/{project.github_repo_name}
            </span>
          ) : (
            <span className="font-mono text-xs text-cream-100/30">no repo linked yet</span>
          )}
          <span className="ring-hairline rounded-full px-3 py-1 font-mono text-xs text-cream-100/70">
            {balance} credits
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_320px] overflow-hidden">
        {/* File tree */}
        <aside className="overflow-y-auto border-r border-cream-100/8 p-3">
          <p className="px-2 pb-2 font-mono text-[10px] tracking-[0.14em] text-cream-100/35 uppercase">
            Files
          </p>
          <ul className="space-y-0.5">
            {files.map((f) => (
              <li key={f.path}>
                <button
                  type="button"
                  onClick={() => setActivePath(f.path)}
                  className={`flex w-full items-center gap-1.5 truncate rounded-lg px-2.5 py-1.5 text-left font-mono text-xs transition ${
                    f.path === activePath
                      ? "bg-teal-400/15 text-teal-300"
                      : "text-cream-100/55 hover:bg-cream-100/6 hover:text-cream-50"
                  }`}
                >
                  <span className="truncate">{f.path}</span>
                  {pendingCandidate?.path === f.path && (
                    <span
                      title="Checking a generated candidate against the runtime"
                      className="size-1.5 shrink-0 animate-pulse rounded-full bg-amber-400"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor */}
        <main className="flex min-w-0 flex-col border-r border-cream-100/8">
          <PaneHeader>
            <span className="truncate font-mono text-[11px] text-cream-100/70">
              {activeFile.path}
            </span>
          </PaneHeader>
          <div className="min-h-0 flex-1">
            <MonacoEditor
              height="100%"
              theme="vs-dark"
              path={activeFile.path}
              defaultLanguage="typescript"
              value={activeFile.content}
              beforeMount={configureMonaco}
              onChange={(v) => updateActiveFileContent(v ?? "")}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                renderLineHighlight: "none",
                overviewRulerLanes: 0,
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
            />
          </div>
        </main>

        {/* Live preview */}
        <section className="flex min-w-0 flex-col">
          <PaneHeader>
            <span className="truncate font-mono text-[11px] text-cream-100/45">
              {previewUrl ?? "no preview yet"}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewNonce((n) => n + 1)}
                disabled={!previewUrl}
                title="Reload preview"
                className="rounded-md px-1.5 py-0.5 text-cream-100/45 transition hover:bg-cream-100/8 hover:text-cream-50 disabled:pointer-events-none disabled:opacity-30"
              >
                ⟳
              </button>
              <a
                href={previewUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                title="Open preview in a new tab"
                className={`rounded-md px-1.5 py-0.5 text-cream-100/45 transition hover:bg-cream-100/8 hover:text-cream-50 ${
                  previewUrl ? "" : "pointer-events-none opacity-30"
                }`}
              >
                ↗
              </a>
            </div>
          </PaneHeader>
          <div className="min-h-0 flex-1 p-3">
            <div className="ring-hairline h-full overflow-hidden rounded-xl bg-ink-900/40">
              <LivePreview
                key={previewNonce}
                url={previewUrl}
                phase={containerPhase}
                error={containerError}
              />
            </div>
          </div>
        </section>

        {/* Prompt / Code Guard panel */}
        <aside className="flex min-h-0 flex-col border-l border-cream-100/8">
          <PaneHeader>
            <span className="font-mono text-[10px] tracking-[0.14em] text-cream-100/35 uppercase">
              Code Guard
            </span>
            <ContainerBadge phase={containerPhase} />
          </PaneHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <CodeGuardStatus outcome={outcome} />
          </div>

          <div className="shrink-0 border-t border-cream-100/8 p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder={`Describe the change to ${activeFile.path}…`}
              className="w-full resize-none rounded-2xl bg-ink-900/60 px-3.5 py-3 text-sm text-cream-50 ring-1 ring-cream-100/10 outline-none placeholder:text-cream-100/30 focus:ring-teal-400/70"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={outcome.kind === "loading" || outcome.kind === "stage3_checking" || !prompt.trim()}
              className="mt-3 w-full rounded-full bg-cream-100 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-white disabled:pointer-events-none disabled:opacity-50"
            >
              {outcome.kind === "loading"
                ? "Generating…"
                : outcome.kind === "stage3_checking"
                  ? "Checking runtime…"
                  : "Generate"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CodeGuardStatus({ outcome }: { outcome: GenerateOutcome }) {
  switch (outcome.kind) {
    case "idle":
      return (
        <p className="mt-3 text-sm text-cream-100/40">
          Describe an edit below. Every generation runs through static analysis
          before it lands in the editor.
        </p>
      );
    case "loading":
      return (
        <p className="mt-3 flex items-center gap-2 text-sm text-cream-100/60">
          <span className="size-1.5 animate-pulse rounded-full bg-teal-400" />
          Generating, then checking…
        </p>
      );
    case "stage3_checking":
      return (
        <div className="mt-3 space-y-2 rounded-2xl bg-teal-400/10 p-4 text-sm text-teal-300">
          <p className="flex items-center gap-2 font-semibold">
            <span className="size-1.5 animate-pulse rounded-full bg-teal-400" />
            Passed static analysis — checking at runtime
          </p>
          <p className="text-cream-100/60">
            {outcome.model} · {outcome.route.tier} tier · {outcome.route.reason}
          </p>
          <p className="text-cream-100/60">
            Watching {outcome.candidatePath} in the live preview for uncaught errors…
          </p>
        </div>
      );
    case "passed":
      return (
        <div className="mt-3 space-y-2 rounded-2xl bg-green-400/10 p-4 text-sm text-green-400">
          <p className="font-semibold">Passed all checks — committed</p>
          <p className="text-cream-100/60">
            {outcome.model} · {outcome.route.tier} tier · {outcome.route.reason}
          </p>
          <p className="text-cream-100/60">
            {outcome.creditsCharged} credits charged · {outcome.newBalance} remaining
          </p>
        </div>
      );
    case "code_guard_failed":
      return (
        <div className="mt-3 space-y-2 rounded-2xl bg-red-400/10 p-4 text-sm text-red-400">
          <p className="font-semibold">Failed static analysis — rolled back</p>
          <pre className="max-h-40 overflow-auto rounded-lg bg-ink-950/60 p-2.5 font-mono text-[11px] whitespace-pre-wrap text-cream-100/70">
            {outcome.diagnostics}
          </pre>
          <p className="text-cream-100/60">
            {outcome.creditsCharged} credit diagnostic fee · {outcome.newBalance} remaining
          </p>
        </div>
      );
    case "runtime_failed":
      return (
        <div className="mt-3 space-y-2 rounded-2xl bg-red-400/10 p-4 text-sm text-red-400">
          <p className="font-semibold">Failed at runtime — rolled back</p>
          <ul className="max-h-40 space-y-1.5 overflow-auto rounded-lg bg-ink-950/60 p-2.5 font-mono text-[11px] text-cream-100/70">
            {outcome.errors.map((err, i) => (
              <li key={i} className="whitespace-pre-wrap">
                <span className="text-red-400/80">[{err.type}]</span> {err.message}
              </li>
            ))}
          </ul>
          <p className="text-cream-100/60">
            {outcome.creditsCharged} credits charged · {outcome.newBalance} remaining
          </p>
        </div>
      );
    case "insufficient_credits":
      return (
        <div className="mt-3 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-400">
          Only {outcome.balance} credits left — this generation needs {outcome.required}. Top up
          to continue.
        </div>
      );
    case "provider_not_configured":
      return (
        <div className="mt-3 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-400">
          {outcome.message}
        </div>
      );
    case "error":
      return (
        <div className="mt-3 rounded-2xl bg-red-400/10 p-4 text-sm text-red-400">
          {outcome.message}
        </div>
      );
  }
}
