"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

function LoginForm() {
  const params = useSearchParams();
  const notConfigured = params.get("reason") === "not-configured";
  const next = params.get("next") ?? "/studio/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function withGitHub() {
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/studio/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reach Supabase.");
    }
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/studio/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Couldn't reach Supabase.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm">
        <Link href="/studio" className="flex items-center justify-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-teal-400/15 font-mono text-sm font-bold text-teal-300">
            VB
          </span>
          <span className="text-sm font-bold tracking-tight text-cream-50">
            VBC AI Studio
          </span>
        </Link>

        <div className="ring-hairline mt-8 rounded-3xl bg-ink-900/60 p-8">
          <h1 className="text-xl font-bold tracking-tight text-cream-50">
            Sign in to build
          </h1>

          {notConfigured ? (
            <p className="mt-4 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-400">
              This deployment doesn&apos;t have a Supabase project connected
              yet, so sign-in isn&apos;t live. See studio/README.md for setup.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-cream-100/55">
                GitHub is recommended — it&apos;s also what powers repo sync
                once you&apos;re in.
              </p>

              <button
                type="button"
                onClick={withGitHub}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-cream-100 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
                Continue with GitHub
              </button>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-cream-100/10" />
                <span className="text-xs text-cream-100/35">or</span>
                <span className="h-px flex-1 bg-cream-100/10" />
              </div>

              {status === "sent" ? (
                <p className="rounded-2xl bg-teal-400/10 p-4 text-sm text-teal-300">
                  Check {email} for a sign-in link.
                </p>
              ) : (
                <form onSubmit={withEmail} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-2xl bg-ink-950/50 px-4 py-3 text-sm text-cream-50 ring-1 ring-cream-100/10 outline-none placeholder:text-cream-100/30 focus:ring-teal-400/70"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Sending…" : "Send magic link"}
                  </Button>
                </form>
              )}

              {error ? (
                <p className="mt-4 text-center text-xs text-red-400">{error}</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
