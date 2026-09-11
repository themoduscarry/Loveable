# Virtual Bridge Connect

One Next.js app, one Vercel project, serving the whole site:

- **`/`** — the company marketing site (services, expertise, engagement models, contact)
- **`/studio`** — VBC AI Studio, the browser-based AI dev studio product

All the code lives in [`studio/`](studio/) — see [`studio/README.md`](studio/README.md)
for setup, environment variables, and deployment.

## Why one app

This used to be two separate projects (a static Vite marketing site on
GitHub Pages, a Next.js app on Vercel). They're now merged into a single
Next.js app so the whole site — marketing and product — deploys together
from one Vercel project, with the marketing site's pages and the Studio
product's routes (auth, dashboard, IDE workspace) sharing one codebase,
one design system, and one deploy pipeline.
