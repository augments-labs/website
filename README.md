# augmentslabs.com

The Augments Labs website. Minimal static site built with Next.js (App
Router) and Tailwind CSS, deployed on Vercel.

## How it works

- The homepage and layout live in `src/app/` — copy is edited directly there.
- Project cards are driven by `src/lib/projects.json` (one entry per public
  repo in the `augments-labs` org). Adding a project = adding one JSON entry.
- **Documentation is synced, not written here.** Each project keeps its docs
  in its own repo under `docs/`. `scripts/sync-docs.mjs` pulls every
  `docs/**/*.md` file into `content/docs/<slug>/` before `next dev` and
  `next build` (npm pre-hooks, so it also runs on Vercel). `content/` is
  gitignored and regenerated on every run — never edit it by hand.
- Synced markdown is rendered at `/docs/<slug>/<page>` by
  `src/app/docs/[slug]/[[...path]]/page.tsx`. Relative links between markdown
  files (e.g. `[Sessions](sessions.md)`) are rewritten to site URLs.
- Doc updates in a project repo go live on the next website deploy. To make
  that automatic, add a Vercel deploy hook and call it from the project
  repo's CI on pushes to `main`.

## Develop

```bash
npm install
npm run dev   # syncs docs first, then starts Next
```

If you hit GitHub API rate limits during sync (60 req/h unauthenticated),
set `GITHUB_TOKEN` in the environment.

## Deploy

Import the repo into Vercel — no configuration needed, the build command is
the standard `next build`. The custom domain `augmentslabs.com` is attached
in the Vercel project settings.
