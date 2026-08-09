# UI/UX Design — augmentslabs.com redesign

Normative identity: `uiux-augmentslabs-redesign-2026-08-08-v1`
Predecessor: none (v1 of the site shipped undocumented, commit `main`)
External decision ledger: this file + chat decision at approval time.
Decision owner: @peguy-njoyim (sole approver; conflict resolver: n/a;
decision rule: owner picks, preference recorded as preference, not usability
evidence).

## 1. Context

- **Subject:** engineering tools for agent-augmented work (Rust harness, SDLC
  skills, Python ADK). Native materials: terminals, code, precise docs.
- **Audience:** developers arriving from GitHub; technically literate; desktop
  and mobile; evaluating whether a project deserves their time.
- **Job:** in under a minute — grasp what Augments Labs stands for, pick a
  project, land in its docs.
- **Character:** a precise instrument. The brand's own principles forbid
  spectacle ("Prefer substance to spectacle"). Restraint is the brand.
- **Existing system (preserve):** Tailwind v4, zinc neutrals, Geist fonts,
  synced-docs architecture, `/device-preview`. New brand facts from logo SVGs:
  ink `#172033`, teal `#008C82` (light bg) / `#5ED2C4` (dark bg), off-white
  `#F2F8F7`, logo typeface Inter, and the logo's own concept — *"the open A is
  the foundation; the teal corner is the augment that extends it."*

## 2. Information architecture (fixed by owner brief)

- `/` — lab homepage (hero, principles, project cards → `/<slug>`)
- `/<slug>` — project welcome page (intro, highlights, quickstart, CTAs)
- `/<slug>/docs` — docs home for the project (full tree)
- `/<slug>/docs/<page...>` — doc pages (sidebar + search chrome)
- `/device-preview` — unchanged
- Legacy `/docs/<slug>/...` → 301 redirects to `/<slug>/docs/...` (site never
  launched; insurance only).

## 3. Key flows

- **F1 Discover lab:** given any entry, when on `/`, then thesis legible in
  <5s; escape → any project card.
- **F2 Evaluate project:** given `/<slug>`, when scanning, then tagline +
  3–5 highlights + quickstart visible without scrolling on desktop; primary
  CTA "Read the docs" → `/<slug>/docs`; secondary "GitHub".
- **F3 Read docs:** given `/<slug>/docs/<page>`, when navigating, then sidebar
  shows current position; escape to any section in 1 click; content ≤ ~72ch.
- **F4 Find by search:** given ⌘K or search button, when typing, then grouped
  results (by project) within the current docs context first; Enter opens top
  hit; Esc closes and returns focus to the trigger.
- **F5 Traverse a page:** given a long doc page, when scrolling, then the
  right rail shows current heading; clicking a TOC entry or a heading anchor
  deep-links to it.
- **F6 Move linearly:** given the end of a doc page, when the reader wants the
  next topic, then prev/next links follow the sidebar tree order.
- **F7 Contribute a fix:** given a doc page with an error, when the reader
  clicks "Edit this page", then they land on the source markdown in the
  project repo on GitHub.

## 4. State matrix

- **S1 empty docs** (project without docs/): welcome page CTA → GitHub; docs
  home shows generated listing (already built).
- **S2 search no-results:** message + suggestion to browse the tree; never a
  dead end.
- **S3 narrow viewport:** sidebar → drawer (hamburger in docs top bar); search
  full-width overlay; right rail hidden <1280px; content single column.
- **S4 theme:** default **dark**; light/system via header toggle; no flash of
  wrong theme (blocking script or cookie-class strategy).
- **S5 doc image missing / external link:** images alt text preserved;
  external links open new tab with indicator.
- **S6 reduced motion:** all transitions ≤150ms fade or none; no parallax.
- **S7 long pages:** right "On this page" rail present when ≥2 headings,
  active heading tracked by scroll-spy; hidden when content is short.

## 5. Hierarchy

- Homepage: H1 thesis → project cards → principles → footer.
- Welcome: project name+tagline → quickstart → highlights → CTAs.
- Docs: sidebar (orientation) → content (reading) → right rail (page map) →
  breadcrumb (context).
- Primary affordance per screen: `/` = project cards; `/<slug>` = "Read the
  docs"; docs = sidebar current item + search.

## 6. Visual direction (D1 — the open axis; see variants below)

Tokens held constant across variants: dark default, teal accent pair
`#008C82`/`#5ED2C4`, Inter for UI text (align with logo), Geist Mono for code,
hairline borders, 8pt spacing rhythm.

- **V1 "Instrument"** — near-black surfaces (`zinc-950`), teal reserved for
  action/active/focus, hairline `zinc-800` borders, flat. Signature: the
  *augment corner* — a small teal corner mark on active sidebar items, card
  hover, and section markers, echoing the logo's corner. Trade-off: quiet;
  reads "serious tool", not "wow".
- **V2 "Blueprint"** — deep ink surfaces derived from `#172033`, faint
  graph-paper grid in hero/welcome headers, slightly atmospheric. Trade-off:
  more character, but texture risks competing with dense docs content.
- **V3 "Glow"** — gradient mesh hero, glassy cards, soft glows. Trade-off:
  reads modern-SaaS "cool", but conflicts with the brand's anti-spectacle
  principles and dates quickly.

Recommendation: **V1**, with the augment corner as the single signature —
distinctive because it is *the logo's own idea*, invisible to copy.

## 7. Components / decisions

- **D2 Theme:** `next-themes`, `defaultTheme="dark"`, `attribute="class"`;
  Tailwind v4 `@custom-variant dark`; header icon cycles dark → light →
  system.
- **D3 Chrome:** header logo h-7 → **h-9** (owner feedback); nav: Projects,
  Docs, GitHub, theme toggle; docs sections get a docs top bar (project
  switcher + search trigger + theme toggle).
- **D4 Docs layout:** desktop fixed left sidebar 280px, collapsible sections,
  active = teal corner + tint; content column max-w-3xl; breadcrumb above
  content; right "On this page" rail ≥1280px (promoted from deferred — owner
  invited additions). Mobile drawer.
- **D5 Search:** build-time JSON index from synced markdown (titles, headings,
  body) → client-side **MiniSearch** (V-a) vs Pagefind post-build HTML indexer
  (V-b, adds binary build step). ⌘K + `/` shortcuts.
- **D6 Welcome pages:** data lives in `src/lib/projects.json` (add
  `highlights[]`, `quickstart{label,code}` per project); page = name/tagline/
  language badge → quickstart code block → highlights → CTAs (teal primary →
  docs; ghost → GitHub).
- **D7 Logo in hero:** homepage shows the full wordmark large (h-16+), header
  keeps h-9.
- **D8 Syntax highlighting:** Shiki at build time (RSC, zero client JS),
  dual light/dark themes via CSS variables; language from the code fence.
- **D9 Page-level navigation:** heading anchor links (`rehype-slug` +
  autolink); prev/next links at page foot following tree order.
- **D10 Code copy button** on every fenced block (small client component,
  top-right of `pre`, "Copied" feedback).
- **D11 Edit-on-GitHub:** page footer link to the exact source file at
  `github.com/augments-labs/<slug>/blob/<branch>/docs/<file>` — the sync
  pipeline already knows repo, branch, and path.
- **Deferred:** version switcher, feedback widget, mkdocs admonition rendering
  (Skip IDs DEF-2/3/4; rationale: needs backend or content conventions not in
  scope; owner: @peguy-njoyim; revisit when a project versions its docs or
  adopts GFM-alert syntax; compensating evaluator: manual doc review).

## 8. Responsive / accessibility commitments

- Breakpoints: sidebar fixed ≥1024px; drawer <1024px; right rail ≥1280px;
  cards 1-col <640px.
- Keyboard: full tab order through sidebar/search/TOC; focus-visible teal
  ring; Esc closes drawer/search with focus return.
- Contrast: `#5ED2C4` on `zinc-950` ≥ 4.5:1 for text-size UI; body text
  zinc-300 on zinc-950.
- Dark/light images: logo uses `<picture>` media switch (existing pattern).
- Semantic: sidebar `<nav aria-label>`, search `role="dialog"`, TOC
  `aria-label="On this page"`.

## 9. Acceptance checks

- **C1** `/` shows enlarged logo hero + 3 cards linking to `/<slug>`.
- **C2** `/<slug>` renders tagline, quickstart, highlights, both CTAs.
- **C3** `/<slug>/docs/...` shows sidebar with active state; drawer works
  <1024px.
- **C4** ⌘K search returns grouped results; no-results state exists (S2).
- **C5** Theme defaults to dark; toggle persists; no theme flash on reload.
- **C6** Old `/docs/<slug>` URLs 301 to `/<slug>/docs`.
- **C7** Lint + `next build` pass; all routes static; HTTP smoke 200 on
  `/`, `/<slug>`, `/<slug>/docs`, one deep doc per project, `/device-preview`.
- **C8** Keyboard-only pass of F4; focus return verified.
- **C9** Long doc page shows right rail with ≥2 entries; heading anchors
  produce `#` deep links; prev/next footers follow tree order.
- **C10** Fenced code blocks render Shiki-highlighted in both themes and show
  a working copy button.
- **C11** "Edit this page" on any doc page points to the correct source file
  in the project repo.

## 10. Risks

- **R1** Search relevance across 170 pages untested with real queries —
  evaluator: owner tries 5 real queries post-launch; owner: @peguy-njoyim.
- **R2** mkdocs-flavored markdown (admonitions, attr lists) renders plainly —
  accepted limitation; evaluator: visual review of philharmonica pages.

## State

`approved` — D1: V1 "Instrument"; D5: Pagefind. Compiled whole approved by
@peguy-njoyim in chat on 2026-08-08; implementation followed (this commit).
