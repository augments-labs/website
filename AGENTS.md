<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project: augmentslabs.com website

Static Next.js (App Router) + Tailwind v4 site, deployed on Vercel.

- Commands: `npm run dev` (syncs docs first), `npm test` (vitest),
  `npm run lint`, `npm run build` (docs sync + next build + pagefind index).
- Docs content is SYNCED from the project repos by `scripts/sync-docs.mjs`
  into `content/` and `public/synced/` — never edit generated output; edit
  the source repo's `docs/` folder instead.
- Project card/welcome-page data: `src/lib/projects.json`.
- Docs logic unit tests live next to it: `src/lib/*.test.ts` (vitest).
- Design of record for the UI: `.sdlc-skills/designs/2026-08-08-augmentslabs-redesign.md`,
  revised by the `2026-08-09-site-chrome-polish*.md` series (latest v4:
  header, theme toggle, light tokens, footer removal, safe area, touch
  targets, breadcrumbs, native back).
- `CLAUDE.md` is a symlink to this file; keep them in sync by editing only
  `AGENTS.md`.
