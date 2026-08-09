"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PagefindResult {
  url: string;
  excerpt: string;
  meta?: { title?: string; url?: string };
}

interface PagefindApi {
  search: (term: string) => Promise<{ results: { data: () => Promise<PagefindResult> }[] }>;
}

declare global {
  interface Window {
    pagefind?: PagefindApi;
  }
}

type LoadState = "idle" | "loading" | "ready" | "unavailable";

async function loadPagefind(): Promise<PagefindApi | null> {
  if (window.pagefind) return window.pagefind;
  try {
    // Pagefind 1.5 ships pagefind.js as an ES module with named exports;
    // it never sets a window global, so a classic <script> tag cannot work.
    // Variable specifier: TS/bundlers must not resolve it at build time.
    const src = "/pagefind/pagefind.js";
    const pf = (await import(/* webpackIgnore: true */ src)) as PagefindApi;
    window.pagefind = pf;
    return pf;
  } catch {
    return null;
  }
}

/** Pagefind derives result URLs from .html file paths; Next serves routes
 *  extensionless. Pages declare their canonical route via
 *  data-pagefind-meta="url:…" — prefer it (same rule as Pagefind UI). */
function resultHref(result: PagefindResult): string {
  return result.meta?.url ?? result.url;
}

function groupResults(results: PagefindResult[], currentSlug: string) {
  const prefix = `/${currentSlug}/docs`;
  const here = results.filter((r) => resultHref(r).startsWith(prefix));
  const elsewhere = results.filter((r) => !resultHref(r).startsWith(prefix));
  return { here, elsewhere };
}

function ResultList({
  results,
  onNavigate,
}: {
  results: PagefindResult[];
  onNavigate: (url: string) => void;
}) {
  return (
    <ul className="divide-y divide-border">
      {results.map((result) => (
        <li key={resultHref(result)}>
          <Link
            href={resultHref(result)}
            onClick={(e) => {
              // Modifier clicks (new tab etc.) keep native link behaviour.
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              onNavigate(resultHref(result));
            }}
            className="block px-4 py-3 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
          >
            <p className="truncate text-sm font-medium">
              {result.meta?.title ?? resultHref(result)}
            </p>
            {/* Excerpt comes from our own synced content; pagefind wraps matches in <mark>. */}
            <p
              className="mt-0.5 line-clamp-2 text-xs text-muted [&_mark]:bg-accent/30 [&_mark]:text-foreground"
              dangerouslySetInnerHTML={{ __html: result.excerpt }}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Docs search over the Pagefind index produced at build time (postbuild).
 * Self-contained: renders the top-bar trigger, owns the ⌘K / "/" shortcuts,
 * the dialog, and result grouping (current project's docs first).
 */
export function DocsSearch({ currentSlug }: { currentSlug: string }) {
  const [open, setOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const pagefindRef = useRef<PagefindApi | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The dialog pushes a history entry so the native back button (mobile/
  // tablet) dismisses it instead of leaving the page.
  const pushedRef = useRef(false);
  // Result URL awaiting navigation once the pushed entry pops (goToResult).
  const pendingNavRef = useRef<string | null>(null);
  const router = useRouter();

  const openSearch = () => {
    if (open) return;
    // Keep Next's current history state so the router does not treat the
    // pushed entry as an external navigation.
    window.history.pushState(window.history.state, "");
    pushedRef.current = true;
    setOpen(true);
    if (!pagefindRef.current && loadState === "idle") {
      setLoadState("loading");
      loadPagefind()
        .then((api) => {
          pagefindRef.current = api;
          setLoadState(api ? "ready" : "unavailable");
        })
        .catch(() => setLoadState("unavailable"));
    }
  };

  const closeNow = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    triggerRef.current?.focus();
  };

  // UI-initiated close (Esc, backdrop, result click): consume the pushed
  // history entry via back(), which fires popstate → closeNow.
  const close = () => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      closeNow();
    }
  };

  // Native back while the dialog is open: pop the entry, stay on the page.
  // A pending result navigation (set by goToResult) runs after the pop.
  // Scoped to [open, router] — do NOT leave this dep-less: a no-deps effect
  // re-registers the listener on every render, and the render triggered by
  // the router's own popstate handling detaches it before the in-flight pop
  // reaches it (the dialog then never closes on native back).
  useEffect(() => {
    if (!open) return;
    const onPop = () => {
      const target = pendingNavRef.current;
      pendingNavRef.current = null;
      pushedRef.current = false;
      setOpen(false);
      setQuery("");
      setResults([]);
      triggerRef.current?.focus();
      if (target) router.push(target);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, router]);

  // Result navigation: consume the pushed dialog entry via back() first —
  // otherwise the result page would sit behind a dead dialog entry, and
  // native back would return to a closed-dialog page state.
  const goToResult = (url: string) => {
    if (pushedRef.current) {
      pendingNavRef.current = url;
      window.history.back();
    } else {
      router.push(url);
    }
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) setResults([]);
  };

  // Global shortcuts: ⌘K / Ctrl+K, or "/" outside of text inputs.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Debounced search; results are set in the async callback, not the body.
  // Deps include loadState: typing before the index finishes loading must
  // re-fire once it becomes ready, otherwise early queries never search.
  useEffect(() => {
    const api = pagefindRef.current;
    if (!api || !query.trim()) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const response = await api.search(query);
      const data = await Promise.all(
        response.results.slice(0, 15).map((r) => r.data()),
      );
      if (!cancelled) setResults(data);
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, loadState]);

  const grouped = groupResults(results, currentSlug);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        className="flex min-h-11 items-center gap-2 rounded-md border border-border px-2.5 text-sm text-muted transition-colors hover:text-foreground sm:min-h-9"
        aria-label="Search documentation"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-border px-1 text-xs sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24"
        >
          <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                  if (e.key === "Enter" && results.length > 0) {
                    goToResult(resultHref(results[0]));
                  }
                }}
                placeholder="Search documentation…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={close}
                className="rounded border border-border px-1.5 py-0.5 text-xs text-muted hover:text-foreground"
              >
                Esc
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loadState === "loading" && (
                <p className="px-4 py-6 text-sm text-muted">Loading search index…</p>
              )}
              {loadState === "unavailable" && (
                <p className="px-4 py-6 text-sm text-muted">
                  Search index not found. Run{" "}
                  <code className="rounded bg-surface px-1">npm run build</code>{" "}
                  once to generate it — then restart{" "}
                  <code className="rounded bg-surface px-1">npm run dev</code>:
                  a dev server started before the build does not see files
                  added to <code className="rounded bg-surface px-1">public/</code>{" "}
                  afterwards.
                </p>
              )}
              {loadState === "ready" && query.trim() && results.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted">
                  No results for “{query}”. Try fewer words, or browse the tree
                  on the left.
                </p>
              )}
              {grouped.here.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
                    This project
                  </p>
                  <ResultList results={grouped.here} onNavigate={goToResult} />
                </div>
              )}
              {grouped.elsewhere.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
                    Elsewhere
                  </p>
                  <ResultList results={grouped.elsewhere} onNavigate={goToResult} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
