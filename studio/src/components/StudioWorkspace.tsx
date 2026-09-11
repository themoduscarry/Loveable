"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import type { ModelTier } from "@/lib/modelRouter";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-cream-100/40">
      Loading editor…
    </div>
  ),
});

type StudioProject = {
  id: string;
  name: string;
  slug: string;
  github_repo_name: string | null;
  github_repo_owner: string | null;
};

type FileEntry = { path: string; content: string };

const STARTER_FILES: FileEntry[] = [
  {
    path: "app/page.tsx",
    content: `export default function Page() {
  return (
    <main>
      <h1>Hello from VBC AI Studio</h1>
    </main>
  );
}
`,
  },
];

type GenerateOutcome =
  | { kind: "idle" }
  | { kind: "loading" }
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
  const [files, setFiles] = useState<FileEntry[]>(STARTER_FILES);
  const [activePath, setActivePath] = useState(STARTER_FILES[0].path);
  const [prompt, setPrompt] = useState("");
  const [balance, setBalance] = useState(initialBalance);
  const [outcome, setOutcome] = useState<GenerateOutcome>({ kind: "idle" });

  const activeFile = files.find((f) => f.path === activePath) ?? files[0];

  function updateActiveFileContent(content: string) {
    setFiles((prev) => prev.map((f) => (f.path === activePath ? { ...f, content } : f)));
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setOutcome({ kind: "loading" });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          prompt,
          filePath: activeFile.path,
          context: activeFile.content,
        }),
      });
      const data = await res.json();

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

      updateActiveFileContent(data.code);
      setBalance(data.newBalance);
      setOutcome({
        kind: "passed",
        model: data.model,
        route: data.route,
        creditsCharged: data.creditsCharged,
        newBalance: data.newBalance,
      });
      setPrompt("");
    } catch {
      setOutcome({ kind: "error", message: "Network error reaching /api/generate." });
    }
  }

  return (
    <div className="flex h-screen flex-col bg-ink-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-cream-100/8 px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-cream-100/50 transition hover:text-cream-50">
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

      <div className="grid min-h-0 flex-1 grid-cols-[200px_1fr_360px]">
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
                  className={`w-full truncate rounded-lg px-2.5 py-1.5 text-left font-mono text-xs transition ${
                    f.path === activePath
                      ? "bg-teal-400/15 text-teal-300"
                      : "text-cream-100/55 hover:bg-cream-100/6 hover:text-cream-50"
                  }`}
                >
                  {f.path}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor */}
        <main className="min-w-0">
          <MonacoEditor
            height="100%"
            theme="vs-dark"
            path={activeFile.path}
            defaultLanguage="typescript"
            value={activeFile.content}
            onChange={(v) => updateActiveFileContent(v ?? "")}
            options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 16 } }}
          />
        </main>

        {/* Prompt / Code Guard panel */}
        <aside className="flex min-h-0 flex-col border-l border-cream-100/8">
          <div className="flex-1 overflow-y-auto p-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-cream-100/35 uppercase">
              Code Guard
            </p>
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
              disabled={outcome.kind === "loading" || !prompt.trim()}
              className="mt-3 w-full rounded-full bg-cream-100 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-white disabled:pointer-events-none disabled:opacity-50"
            >
              {outcome.kind === "loading" ? "Generating…" : "Generate"}
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
    case "passed":
      return (
        <div className="mt-3 space-y-2 rounded-2xl bg-green-400/10 p-4 text-sm text-green-400">
          <p className="font-semibold">Passed — committed to buffer</p>
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
