import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { Markdown } from "@/components/markdown";
import { PrevNext } from "@/components/prev-next";
import { TableOfContents } from "@/components/toc";
import {
  docPageTitle,
  extractHeadings,
  flattenDocTree,
  getAllDocRoutes,
  getDocContent,
  getProjectDocRoutes,
  getProjectDocTree,
  getRepoMeta,
} from "@/lib/docs";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export async function generateStaticParams() {
  const routes = await getAllDocRoutes();
  const params = routes.map((route) => ({
    slug: route.slug,
    path: route.docPath.length > 0 ? route.docPath : undefined,
  }));
  // Every project gets an index route even when its docs/ has no README/index
  // file: the page renders a generated listing there (dynamicParams = false,
  // so routes must be enumerated here to exist). Only slugs with an existing
  // file-backed index (path === undefined) count as covered.
  const withIndex = new Set(
    params
      .filter((param) => param.path === undefined)
      .map((param) => param.slug),
  );
  for (const project of projects) {
    if (!withIndex.has(project.slug)) {
      params.push({ slug: project.slug, path: undefined });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ slug: string; path?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, path: docPath = [] } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const doc = await getDocContent(slug, docPath);
  return { title: docPageTitle(doc?.title, project.name), description: project.tagline };
}

function humanize(segment: string): string {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function DocPage({ params }: Props) {
  const { slug, path: docPath = [] } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const doc = await getDocContent(slug, docPath);
  if (!doc && docPath.length > 0) notFound();

  const [tree, routes, repoMeta] = await Promise.all([
    getProjectDocTree(slug),
    getProjectDocRoutes(slug),
    getRepoMeta(slug),
  ]);

  if (!doc) {
    // Project has no docs index file: render a generated top-level listing.
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6" data-pagefind-body>
        <span hidden data-pagefind-meta={`url:/${slug}/docs`} />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: project.name, href: `/${slug}` },
            { label: "Docs", current: true },
          ]}
        />
        <h1 className="text-3xl font-semibold tracking-tight">
          {project.name} documentation
        </h1>
        <p className="mt-3 text-muted">{project.tagline}</p>
        <ul className="mt-8 list-disc space-y-2 pl-5">
          {tree.map(
            (node) =>
              node.docPath && (
                <li key={node.title}>
                  <Link
                    href={`/${slug}/docs/${node.docPath.join("/")}`}
                    className="text-accent hover:underline"
                  >
                    {node.title}
                  </Link>
                </li>
              ),
          )}
        </ul>
      </div>
    );
  }

  // Base for resolving relative links/images: the markdown file's own
  // directory on disk (relative to the repo's docs/ folder).
  const fileDir = path.dirname(doc.fileRelPath);
  const baseSegments = [
    slug,
    ...(fileDir === "." ? [] : fileDir.split(path.sep)),
  ];
  const headings = extractHeadings(doc.markdown);

  // Prev/next, following the sidebar tree order.
  const sequence = flattenDocTree(tree);
  const currentKey = docPath.join("/");
  const sequenceIndex = sequence.findIndex(
    (entry) => entry.docPath.join("/") === currentKey,
  );
  const toTarget = (entry?: { title: string; docPath: string[] }) =>
    entry
      ? {
          title: entry.title,
          href: `/${slug}/docs/${entry.docPath.join("/")}`,
        }
      : null;
  const prev = sequenceIndex > 0 ? toTarget(sequence[sequenceIndex - 1]) : null;
  const next =
    sequenceIndex >= 0 && sequenceIndex < sequence.length - 1
      ? toTarget(sequence[sequenceIndex + 1])
      : null;

  // Breadcrumb: link only prefixes that exist as routes (bare sections 404).
  const routeKeys = new Set(routes.map((r) => r.docPath.join("/")));
  const crumbs = docPath.map((segment, i) => {
    const key = docPath.slice(0, i + 1).join("/");
    return {
      label: humanize(segment),
      href: routeKeys.has(key) ? `/${slug}/docs/${key}` : null,
      isCurrent: i === docPath.length - 1,
    };
  });

  const editUrl = repoMeta
    ? `${project.repoUrl}/edit/${repoMeta.branch}/docs/${doc.fileRelPath.split(path.sep).join("/")}`
    : null;

  const breadcrumbItems: Crumb[] = [
    { label: "Home", href: "/" },
    { label: project.name, href: `/${slug}` },
    docPath.length === 0
      ? { label: "Docs", current: true }
      : { label: "Docs", href: `/${slug}/docs` },
    ...crumbs.map((crumb) => ({
      label: crumb.label,
      href: crumb.href ?? undefined,
      current: crumb.isCurrent,
    })),
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-10 sm:px-6">
      <div className="max-w-3xl min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbItems} />
        <article
          data-pagefind-body
          data-pagefind-meta={`title:${docPageTitle(doc.title, project.name)}`}
        >
          {/* Pagefind derives URLs from .html file paths, which Next serves
              extensionless, so override with the canonical route. */}
          <span
            hidden
            data-pagefind-meta={`url:/${slug}/docs${docPath.length ? `/${docPath.join("/")}` : ""}`}
          />
          <Markdown content={doc.markdown} baseSegments={baseSegments} />
        </article>
        <div data-pagefind-ignore>
          {editUrl && (
            <p className="mt-12 border-t border-border pt-6 text-sm">
              <a
                href={editUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Edit this page on GitHub
              </a>
            </p>
          )}
          <PrevNext prev={prev} next={next} />
        </div>
      </div>
      <aside data-pagefind-ignore className="hidden w-56 shrink-0 xl:block">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  );
}
