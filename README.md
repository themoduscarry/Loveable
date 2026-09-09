# Virtual Bridge Connect — Landing Page

Vite + React + TypeScript + Tailwind v4 marketing site for Virtual Bridge
Connect, LLC.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Contact form

The contact form posts to [Formspree](https://formspree.io). Without a form
id configured it falls back to a `mailto:` link instead, so nothing breaks
if you skip this step.

1. Sign up free at formspree.io and create a form pointed at
   `virtualbridgeconnect@gmail.com`.
2. Copy the id from the endpoint it gives you
   (`https://formspree.io/f/XXXXXXXX` → `XXXXXXXX`).
3. Local dev: copy `.env.example` to `.env.local` and set
   `VITE_FORMSPREE_ID`.
4. Deployed site: add a repo secret named `VITE_FORMSPREE_ID` (Settings →
   Secrets and variables → Actions) so the deploy workflow bakes it in.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). One-time
setup in the repo: **Settings → Pages → Source → GitHub Actions**.

A `public/CNAME` file points the deployed site at
`virtualbridgeconnect.com` — remove it if that domain shouldn't be wired up
yet, or update the DNS records at your registrar (a `CNAME` record to
`<username>.github.io`, or the four GitHub Pages `A` records for an apex
domain) once you're ready to go live there.
