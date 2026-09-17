# VBC AI Studio

One Next.js 16 (App Router) app serving the whole Virtual Bridge Connect
site: the company marketing pages at `/`, and VBC AI Studio — the
browser-based AI development studio described in the Master Strategy &
Technical Blueprint — under `/studio/*`. React 19 + Tailwind v4 + Supabase.

## Routes

| Path | What it is | Auth |
|---|---|---|
| `/` | Marketing homepage (services, expertise, engagement models, contact) | Public |
| `/studio` | AI Studio product landing page | Public |
| `/studio/login` | Sign in (GitHub OAuth + email magic link) | Public |
| `/studio/dashboard` | Project list, credit balance | Requires session |
| `/studio/[projectId]` | The IDE workspace | Requires session |

`src/proxy.ts` gates the last two behind a Supabase session; everything
else renders regardless of auth/config state.

## What's real right now

- **Marketing site** — ported in full from the standalone site: pain
  points, comparison table, pricing, contact form (Formspree, falls back
  to `mailto:` without a configured form id).
- **Studio landing page** — pain points, the Lovable/Bolt comparison
  table, Code Guard walkthrough, pricing, roadmap.
- **Auth** — GitHub OAuth + email magic link via Supabase Auth.
- **Database schema** — `supabase/migrations/0001_init.sql`: profiles,
  subscriptions/credit ledger, projects, generation logs, RLS policies,
  and a trigger that provisions a free-tier subscription on signup.
- **Smart 3-tier router** (`src/lib/modelRouter.ts`) — classifies a prompt
  as `fast` or `deep` and picks a model accordingly. Pure function, no
  network call.
- **Code Guard, Stage 2** (`src/lib/codeGuard.ts`) — runs a **real**
  `tsc --noEmit` against candidate code in an isolated temp workspace
  before it's ever proposed as a commit. This runs server-side rather
  than in a WebContainer — see the comment at the top of that file for
  why, and the "What's not built yet" section below.
- **Credit ledger** (`src/lib/creditLedger.ts`) — pre-flight balance
  check, then an atomic conditional deduction (full price on a Code
  Guard pass, the blueprint's capped 10% diagnostic fee on a fail),
  logged to `generation_logs`.
- **`/api/generate`** — wires all of the above together end-to-end. With
  `ANTHROPIC_API_KEY` set, this makes real Claude calls.
- **Studio workspace UI** — Monaco editor, file tree, prompt panel, live
  Code Guard pass/fail display wired to the API above.
- **Live preview + Code Guard Stages 1 & 3** (`src/lib/webcontainer.ts`,
  `src/components/LivePreview.tsx`) — boots a WebContainer in the
  browser, mounts a Vite + React template, installs, and runs the dev
  server in an iframe. A generation that clears Stage 2 is held in a
  diff buffer (Stage 1), written to the container, and given a window to
  surface uncaught exceptions, unhandled rejections, or `console.error`
  output (Stage 3) before it's allowed into the editor; anything that
  fires rolls the file back. Requires the COOP/COEP headers set on
  `/studio/:id` in `next.config.ts` for cross-origin isolation.
  **Read the licensing note below before putting this in front of
  customers.**

## What's not built yet — needs your accounts/credentials

Nothing below can be faked with a placeholder; each needs a real account:

| Piece | Needs | Where |
|---|---|---|
| Auth, DB, credit ledger | A Supabase project | supabase.com → copy 3 keys into `.env.local` (see `.env.example`) |
| GitHub sign-in & repo sync | A GitHub OAuth App | github.com/settings/developers → paste Client ID/Secret into Supabase's Auth → Providers → GitHub |
| AI generations | An Anthropic API key | console.anthropic.com → `ANTHROPIC_API_KEY` in `.env.local` |
| Contact form (marketing site) | A Formspree form | formspree.io → `NEXT_PUBLIC_FORMSPREE_ID` in `.env.local` |
| **WebContainers** (in-browser Node.js execution, Code Guard Stages 1 & 3, live preview) | A commercial license from StackBlitz for production use of `@webcontainer/api` | **Built and deployed, unlicensed.** Works today on the free terms; needs a quote before commercial use. See the note below. |
| Two-way GitHub commit sync | Octokit + the GitHub OAuth App above | Not started |
| Deploy triggers to Vercel/Netlify | User-supplied deploy hooks or OAuth | Not started |
| Fast-tier cost model | A DeepSeek or Gemini API key | Currently falls back to Claude Haiku — see `src/lib/aiProvider.ts` |
| Billing (Stripe) | A Stripe account | Not started — `user_subscriptions.tier` has no payment path wired to it yet |

**On WebContainers specifically:** `@webcontainer/api` is free for local
development and for prototypes/POCs, but StackBlitz's terms require a
commercial license to use it in production "to meet the needs of your
customers, prospective customers, and/or employees." It is currently
built and running in production **without** that license, which is fine
while this is a prototype and is not fine the day it's sold. Get a quote
before that day — see the cost-effectiveness note this was built
alongside. E2B or self-hosted Firecracker microVMs are usage-priced
alternatives with no sales-gated license.

Two known limits of the current implementation, both worth fixing before
this carries real usage:

- **The sandbox is ephemeral.** It boots and runs `npm install` on every
  page load — roughly 30s before the preview appears. Persisting
  `node_modules` (an IndexedDB snapshot of the container FS) or keeping
  the instance alive across client-side navigation would both help.
- **Stage 3 fails open.** If the container isn't running, a candidate
  that cleared Stage 2 is committed without any runtime check, and the
  UI still reports "Passed all checks." The sandbox status pill in the
  Code Guard header makes the container's state visible, but the
  fail-open behaviour itself is a deliberate choice to revisit: blocking
  generations whenever the sandbox is down is the stricter alternative.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Anthropic + Formspree values
npm run dev
```

Without `.env.local` filled in, the marketing site and Studio's landing
page still render fully; `/studio/login` shows a "not configured"
notice, and `/studio/dashboard`/`/studio/[projectId]` redirect to it —
nothing crashes on a bare checkout.

## Database setup

Once you have a Supabase project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste `supabase/migrations/0001_init.sql` directly into the SQL editor
in the Supabase dashboard.

## Deploy

Standard Next.js app — deploys to Vercel with zero config once the env
vars above are set as project secrets. Root Directory must be set to
`studio` in the Vercel project's Build & Development settings, since this
folder sits inside the repo alongside its docs, not at the repo root.
`npm run build` is verified clean (see the PR this shipped in).
