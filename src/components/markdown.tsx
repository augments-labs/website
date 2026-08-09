import Link from "next/link";
import { MarkdownAsync } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { resolveAssetSrc, resolveDocHref } from "@/lib/doc-links";

export async function Markdown({
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
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [
            rehypePrettyCode,
            {
              theme: {
                light: "github-light-default",
                dark: "github-dark-default",
              },
              keepBackground: false,
            },
          ],
        ]}
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
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}
