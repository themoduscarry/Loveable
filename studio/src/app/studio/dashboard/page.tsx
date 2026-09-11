import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/studio/login");

  const [{ data: projects }, { data: subscription }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, slug, updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("user_subscriptions")
      .select("tier, credit_balance, rollover_credits")
      .eq("user_id", user.id)
      .single(),
  ]);

  const balance = (subscription?.credit_balance ?? 0) + (subscription?.rollover_credits ?? 0);

  return (
    <main className="min-h-screen bg-ink-950 px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-teal-300/80 uppercase">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-cream-50">
              Your projects
            </h1>
          </div>
          <div className="ring-hairline rounded-2xl bg-ink-900/60 px-5 py-3 text-right">
            <p className="text-2xl font-bold text-cream-50">{balance}</p>
            <p className="text-xs text-cream-100/45">
              credits · {subscription?.tier ?? "free"} tier
            </p>
          </div>
        </header>

        <form
          action={createProject}
          className="ring-hairline mt-10 flex flex-col gap-3 rounded-3xl bg-ink-900/50 p-6 sm:flex-row sm:items-center"
        >
          <input
            name="name"
            required
            placeholder="Name your new project…"
            className="flex-1 rounded-2xl bg-ink-950/50 px-4 py-3 text-sm text-cream-50 ring-1 ring-cream-100/10 outline-none placeholder:text-cream-100/30 focus:ring-teal-400/70"
          />
          <button
            type="submit"
            className="rounded-full bg-cream-100 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white"
          >
            Create project
          </button>
        </form>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((p) => (
            <li key={p.id}>
              <Link
                href={`/studio/${p.id}`}
                className="ring-hairline block rounded-3xl bg-ink-900/50 p-6 transition hover:bg-ink-850/70"
              >
                <p className="font-semibold text-cream-50">{p.name}</p>
                <p className="mt-1 font-mono text-xs text-cream-100/40">{p.slug}</p>
              </Link>
            </li>
          ))}
        </ul>

        {(projects ?? []).length === 0 ? (
          <p className="mt-8 text-center text-sm text-cream-100/40">
            No projects yet — create one above to open the studio workspace.
          </p>
        ) : null}
      </div>
    </main>
  );
}
