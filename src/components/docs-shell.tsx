"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const router = useRouter();
  // The drawer pushes a history entry so the native back button (mobile/
  // tablet) dismisses it instead of leaving the page.
  const pushedRef = useRef(false);
  // Item href awaiting navigation once the pushed entry pops.
  const pendingNavRef = useRef<string | null>(null);

  const openDrawer = () => {
    if (drawerOpen) return;
    // Keep Next's current history state so the router does not treat the
    // pushed entry as an external navigation.
    window.history.pushState(window.history.state, "");
    pushedRef.current = true;
    setDrawerOpen(true);
  };

  const closeDrawerNow = () => setDrawerOpen(false);

  // UI-initiated dismiss (X, backdrop): consume the pushed entry via
  // back(), which fires popstate → closeDrawerNow.
  const closeDrawer = () => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      closeDrawerNow();
    }
  };

  // Item navigation: consume the drawer's pushed entry via back() first,
  // then navigate. Otherwise the target page would sit behind a dead
  // drawer entry and native back would return to a closed-drawer state.
  const navigateFromDrawer = (href: string) => {
    if (pushedRef.current) {
      pendingNavRef.current = href;
      window.history.back();
    } else {
      router.push(href);
    }
  };

  // Native back while the drawer is open: pop the entry, stay on the page;
  // a pending item navigation runs after the pop.
  // Scoped to [drawerOpen, router]: a dep-less effect would re-register the
  // listener on every render and lose the in-flight pop to the router's own
  // popstate handling (see DocsSearch for the same pattern).
  useEffect(() => {
    if (!drawerOpen) return;
    const onPop = () => {
      const target = pendingNavRef.current;
      pendingNavRef.current = null;
      pushedRef.current = false;
      setDrawerOpen(false);
      if (target) router.push(target);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [drawerOpen, router]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        data-pagefind-ignore
        className="safe-top sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur"
      >
        <div className="safe-x flex h-14 items-center gap-3">
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Open docs navigation"
            className="-ml-3 rounded-md p-3 text-muted hover:text-foreground lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/" aria-label="Augments Labs home" className="shrink-0">
            <Logo className="h-7 sm:h-9" />
          </Link>
          <Link
            href={`/${project.slug}`}
            className="truncate font-semibold hover:text-accent"
          >
            {project.name}
          </Link>
          <span className="hidden text-sm text-muted sm:inline">Docs</span>
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
          onClose={closeDrawer}
          onNavigate={navigateFromDrawer}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
