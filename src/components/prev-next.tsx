import Link from "next/link";

export interface PrevNextTarget {
  title: string;
  href: string;
}

/** Linear prev/next footer following the sidebar tree order. */
export function PrevNext({
  prev,
  next,
}: {
  prev: PrevNextTarget | null;
  next: PrevNextTarget | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="Previous and next pages"
      className="mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-6"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex max-w-[48%] flex-col rounded-lg border border-border px-4 py-3 transition-colors hover:border-accent"
        >
          <span className="text-xs text-muted">Previous</span>
          <span className="truncate text-sm font-medium text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex max-w-[48%] flex-col items-end rounded-lg border border-border px-4 py-3 text-right transition-colors hover:border-accent"
        >
          <span className="text-xs text-muted">Next</span>
          <span className="truncate text-sm font-medium text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
