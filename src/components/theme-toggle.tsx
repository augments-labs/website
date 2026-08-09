"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

const ORDER = ["dark", "light", "system"] as const;

const ICONS = {
  dark: (
    // moon
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  light: (
    // sun
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  ),
  system: (
    // monitor
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8m-4-4v4" strokeLinecap="round" />
    </svg>
  ),
} as const;

/** Cycles dark → light → system. Dark is the site default. */
export function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribe, getMounted, getServerMounted);
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <span className="inline-flex h-8 w-8" aria-hidden />;
  }

  const current = (ORDER.includes(theme as (typeof ORDER)[number])
    ? theme
    : "dark") as keyof typeof ICONS;
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${current}. Switch to ${next}.`}
      title={`Theme: ${current} (switch to ${next})`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {ICONS[current]}
    </button>
  );
}
