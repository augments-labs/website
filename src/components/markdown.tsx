import Link from "next/link";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { collapseSlugSegment } from "@/lib/docs";

/**
 * Resolves a link found in synced markdown to a site URL.
 * External links and pure anchors pass through; relative links to other
 * markdown files (e.g. [Sessions](../session/session.md)) are rewritten onto
 * the /docs/<slug>/... route space, relative to the directory of the markdown
 * file on disk. The redundant <slug>/<slug>/ prefix is collapsed to match the
 * route space.
 */
function resolveDocHref(baseSegments: string[], href: string): string {
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
  const url = path.posix.join("/docs", slug, ...segments);
  return hash ? `${url}#${hash}` : url;
}

/**
 * Resolves an image source in synced markdown to a URL under /synced/, where
 * docs images are served from. Paths resolve against the markdown file's
 * on-disk directory; no slug collapsing (public/synced mirrors the repos).
 */
function resolveAssetSrc(baseSegments: string[], src: string): string {
  if (/^(https?:|data:|\/)/i.test(src)) return src;
  return path.posix.join("/synced", ...baseSegments, src);
}

export function Markdown({
  content,
  baseSegments,
}: {
  content: string;
  /**
   * [slug, ...directory of the markdown file on disk, relative to docs/],
   * e.g. ["philharmonica-adk-python", "a2a"] for docs/a2a/index.md.
   */
  baseSegments: string[];
}) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        components={{
          a: ({ href, children }) => {
            const resolved = resolveDocHref(baseSegments, href ?? "");
            if (/^https?:/i.test(resolved)) {
              return (
                <a href={resolved} target="_blank" rel="noreferrer">
                  {children}
                </a>
              );
            }
            return <Link href={resolved}>{children}</Link>;
          },
          img: ({ src, alt }) => {
            const resolved = resolveAssetSrc(
              baseSegments,
              typeof src === "string" ? src : "",
            );
            // eslint-disable-next-line @next/next/no-img-element -- synced static assets
            return <img src={resolved} alt={alt ?? ""} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
