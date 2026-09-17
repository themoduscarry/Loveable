import "server-only";

import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CandidateFile = {
  /** Path relative to the project root, e.g. "app/page.tsx". */
  path: string;
  content: string;
};

export type CodeGuardResult =
  | { passed: true; stage: "static-analysis"; durationMs: number }
  | {
      passed: false;
      stage: "static-analysis";
      durationMs: number;
      diagnostics: string;
    };

const TSCONFIG = {
  compilerOptions: {
    target: "ES2022",
    lib: ["ES2022", "DOM", "DOM.Iterable"],
    module: "ESNext",
    moduleResolution: "bundler",
    jsx: "react-jsx",
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    isolatedModules: true,
    allowJs: true,
  },
  include: ["**/*.ts", "**/*.tsx"],
};

/**
 * Code Guard, Stage 2: Static Analysis.
 *
 * Runs a real `tsc --noEmit` against a candidate set of files, in an
 * isolated temp workspace, before anything is proposed as a commit.
 * This is deliberately server-side rather than the blueprint's
 * WebContainer-in-the-browser approach for this one stage: a compiler
 * check needs no DOM, no runtime, and no per-user browser sandbox —
 * running it server-side means Stage 2 works today, without waiting on
 * (or paying for) a WebContainers production license. Stage 3 (the
 * runtime/console listener) is the stage that actually needs a
 * browser-shaped sandbox — it lives client-side in
 * src/lib/webcontainer.ts, driven from src/components/StudioWorkspace.tsx.
 *
 * The temp workspace is created under the OS temp directory (not inside
 * the project) and gets a directory link back to this project's
 * node_modules, so `import` of react/next/etc. in candidate files
 * resolves against real types without copying node_modules per check.
 */
export async function runStaticAnalysis(
  files: CandidateFile[],
): Promise<CodeGuardResult> {
  const startedAt = Date.now();
  const workDir = path.join(os.tmpdir(), "vbc-codeguard", randomUUID());

  try {
    await mkdir(workDir, { recursive: true });

    const projectRoot = process.cwd();
    try {
      await symlink(
        path.join(projectRoot, "node_modules"),
        path.join(workDir, "node_modules"),
        "junction",
      );
    } catch {
      // Non-fatal — type-checking still catches syntax/logic errors in
      // the candidate files themselves; it just won't resolve external
      // package types (e.g. flags `JSX.IntrinsicElements` as unknown).
    }

    await writeFile(
      path.join(workDir, "tsconfig.json"),
      JSON.stringify(TSCONFIG, null, 2),
    );

    for (const file of files) {
      const dest = path.join(workDir, file.path);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, file.content);
    }

    const tscBin = path.join(projectRoot, "node_modules", "typescript", "bin", "tsc");

    try {
      await execFileAsync(process.execPath, [tscBin, "--noEmit", "-p", "tsconfig.json"], {
        cwd: workDir,
        timeout: 30_000,
        maxBuffer: 4 * 1024 * 1024,
      });
      return { passed: true, stage: "static-analysis", durationMs: Date.now() - startedAt };
    } catch (err) {
      const diagnostics =
        err && typeof err === "object" && "stdout" in err
          ? String((err as { stdout: unknown }).stdout)
          : String(err);
      return {
        passed: false,
        stage: "static-analysis",
        durationMs: Date.now() - startedAt,
        diagnostics: diagnostics.trim(),
      };
    }
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
