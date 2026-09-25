import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
  current?: boolean;
}

/** Site-wide way back: a breadcrumb trail on every page except home, on
 *  every form factor (44px touch targets, wraps on narrow screens).
 *  Ignored by the search indexer: it's chrome, not content. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" data-pagefind-ignore className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="select-none">
                &gt;
              </span>
            )}
            {item.current ? (
              <span
                aria-current="page"
                className="inline-flex min-h-11 items-center text-foreground sm:min-h-9"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center transition-colors hover:text-accent sm:min-h-9"
              >
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center sm:min-h-9">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
