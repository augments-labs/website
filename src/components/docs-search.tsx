"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PagefindResult {
  url: string;
  excerpt: string;
  meta?: { title?: string };
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
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/pagefind/pagefind.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("pagefind.js not found"));
    document.head.appendChild(script);
  });
  return window.pagefind ?? null;
}

function groupResults(results: PagefindResult[], currentSlug: string) {
  const prefix = `/${currentSlug}/docs`;
  const here = results.filter((r) => r.url.startsWith(prefix));
  const elsewhere = results.filter((r) => !r.url.startsWith(prefix));
  return { here, elsewhere };
}

function ResultList({
  results,
  onNavigate,
}: {
  results: PagefindResult[];
  onNavigate: () => void;
}) {
  return (
    <ul className="divide-y divide-border">
      {results.map((result) => (
        <li key={result.url}>
          <Link
            href={result.url}
            onClick={onNavigate}
            className="block px-4 py-3 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
          >
            <p className="truncate text-sm font-medium">
              {result.meta?.title ?? result.url}
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
  const router = useRouter();

  const openSearch = () => {
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

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    triggerRef.current?.focus();
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
  }, [query]);

  const grouped = groupResults(results, currentSlug);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
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
                    close();
                    router.push(results[0].url);
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
                  Search index not found. In development, run{" "}
                  <code className="rounded bg-surface px-1">npm run build && npm start</code>{" "}
                  once to generate it.
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
                  <ResultList results={grouped.here} onNavigate={close} />
                </div>
              )}
              {grouped.elsewhere.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
                    Elsewhere
                  </p>
                  <ResultList results={grouped.elsewhere} onNavigate={close} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
