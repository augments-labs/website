"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface SidebarNode {
  title: string;
  docPath: string[] | null;
  children: SidebarNode[];
}

function nodeHref(slug: string, docPath: string[] | null): string | null {
  if (!docPath) return null;
  const suffix = docPath.join("/");
  return `/${slug}/docs${suffix ? `/${suffix}` : ""}`;
}

function containsActive(node: SidebarNode, slug: string, pathname: string): boolean {
  const href = nodeHref(slug, node.docPath);
  if (href && pathname === href) return true;
  return node.children.some((child) => containsActive(child, slug, pathname));
}

function SidebarItem({
  node,
  slug,
  pathname,
  onNavigate,
  depth,
}: {
  node: SidebarNode;
  slug: string;
  pathname: string;
  onNavigate?: (href: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(() =>
    containsActive(node, slug, pathname),
  );
  const href = nodeHref(slug, node.docPath);
  const isActive = href === pathname;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className="flex items-center">
        {href ? (
          <Link
            href={href}
            onClick={(e) => {
              // Modifier clicks (new tab etc.) keep native link behaviour.
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              onNavigate?.(href);
            }}
            aria-current={isActive ? "page" : undefined}
            className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-surface font-medium text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {node.title}
          </Link>
        ) : (
          <span className="min-w-0 flex-1 truncate px-2 py-1.5 text-sm font-medium text-foreground">
            {node.title}
          </span>
        )}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? `Collapse ${node.title}` : `Expand ${node.title}`}
            aria-expanded={expanded}
            className="mr-1 rounded p-1 text-muted hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
              aria-hidden
            >
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <ul className={`space-y-0.5 ${depth === 0 ? "ml-3 border-l border-border pl-2" : "ml-3 pl-2"}`}>
          {node.children.map((child) => (
            <SidebarItem
              key={child.title + (child.docPath?.join("/") ?? "")}
              node={child}
              slug={slug}
              pathname={pathname}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DocsSidebar({
  tree,
  slug,
  open,
  onClose,
  onNavigate,
}: {
  tree: SidebarNode[];
  slug: string;
  /** Mobile drawer state. */
  open: boolean;
  /** X button / backdrop: dismiss the drawer. */
  onClose: () => void;
  /** Item clicks: navigate, dismissing the drawer first if it is open. */
  onNavigate?: (href: string) => void;
}) {
  const pathname = usePathname();

  const nav = (
    <nav aria-label="Documentation" className="space-y-0.5 px-3 py-4">
      <ul className="space-y-0.5">
        {tree.map((node) => (
          <SidebarItem
            key={node.title}
            node={node}
            slug={slug}
            pathname={pathname}
            onNavigate={onNavigate}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r border-border lg:block">
        {nav}
      </aside>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <div className="safe-top safe-bottom absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <span className="px-2 text-sm font-semibold">Documentation</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close docs navigation"
                className="rounded-md p-3 text-muted hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
