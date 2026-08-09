"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DocsSearch } from "@/components/docs-search";
import { DocsSidebar, type SidebarNode } from "@/components/docs-sidebar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Project } from "@/lib/projects";

/**
 * Docs chrome: sticky top bar (drawer trigger, project, search, theme),
 * left sidebar, content column. Owns the mobile drawer state.
 */
export function DocsShell({
  project,
  tree,
  children,
}: {
  project: Project;
  tree: SidebarNode[];
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        data-pagefind-ignore
        className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur"
      >
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open docs navigation"
            className="rounded-md p-1.5 text-muted hover:text-foreground lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/" aria-label="Augments Labs home" className="shrink-0">
            <Logo className="h-9" />
          </Link>
          <Link
            href={`/${project.slug}`}
            className="truncate font-semibold hover:text-accent"
          >
            {project.name}
          </Link>
          <span className="text-sm text-muted">Docs</span>
          <div className="ml-auto flex items-center gap-2">
            <DocsSearch currentSlug={project.slug} />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <DocsSidebar
          tree={tree}
          slug={project.slug}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
