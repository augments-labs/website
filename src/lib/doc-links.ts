import path from "node:path";
import { collapseSlugSegment } from "./docs";

/**
 * Resolves a link found in synced markdown to a site URL.
 * External links and pure anchors pass through; relative links to other
 * markdown files (e.g. [Sessions](../session/session.md)) are rewritten onto
 * the /<slug>/docs/... route space, relative to the directory of the markdown
 * file on disk. The redundant <slug>/<slug>/ prefix is collapsed to match the
 * route space.
 */
export function resolveDocHref(baseSegments: string[], href: string): string {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  const [pathPart, hash] = href.split("#");
  if (!pathPart) return href; // pure in-page anchor
  const cleaned = pathPart
    .replace(/\.(md|mdx)$/i, "")
    .replace(/(^|\/)(readme|index)\/?$/i, "$1");
  const slug = baseSegments[0];
  const segments = collapseSlugSegment(
    path.posix
      .join(...baseSegments.slice(1), cleaned)
      .split("/")
      .filter(Boolean),
    slug,
  );
  const url = path.posix.join("/", slug, "docs", ...segments);
  return hash ? `${url}#${hash}` : url;
}

/**
 * Resolves an image source in synced markdown to a URL under /synced/, where
 * docs images are served from. Paths resolve against the markdown file's
 * on-disk directory; no slug collapsing (public/synced mirrors the repos).
 */
export function resolveAssetSrc(baseSegments: string[], src: string): string {
  if (/^(https?:|data:|\/)/i.test(src)) return src;
  return path.posix.join("/synced", ...baseSegments, src);
}
