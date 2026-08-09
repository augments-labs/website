"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * Wraps a fenced code block rendered by react-markdown and adds a copy
 * button. The copied text is read from the rendered <pre> at click time, so
 * no source text needs to cross the server/client boundary.
 */
export function CodeBlock({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = containerRef.current?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (permissions); leave the button state unchanged
    }
  };

  return (
    <div ref={containerRef} className="group relative">
      {children}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2 right-2 rounded-md border border-border bg-background/80 px-2 py-1 text-xs font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
