"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

const ICONS = {
  dark: (
    // half moon — right half filled
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" strokeLinejoin="round" />
      <path d="M12 3a9 9 0 0 1 0 18V3Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  light: (
    // sun
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  ),
} as const;

/** Switches dark ↔ light based on the resolved theme, so every press
 *  visibly changes the theme (no dead press on a stored `system` value).
 *  Dark is the site default. */
export function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribe, getMounted, getServerMounted);
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return <span className="inline-flex h-8 w-8" aria-hidden />;
  }

  const current = resolvedTheme === "light" ? "light" : "dark";
  const next = current === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${current}. Switch to ${next}.`}
      title={`Theme: ${current} (switch to ${next})`}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-9 sm:w-9"
    >
      {ICONS[current]}
    </button>
  );
}
