import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { Markdown } from "@/components/markdown";
import {
  childRoutes,
  getAllDocRoutes,
  getDocContent,
  getProjectDocRoutes,
  type DocRoute,
} from "@/lib/docs";
import { getProject, projects, type Project } from "@/lib/projects";

export const dynamicParams = false;

export async function generateStaticParams() {
  const routes = await getAllDocRoutes();
  const params = routes.map((route) => ({
    slug: route.slug,
    path: route.docPath.length > 0 ? route.docPath : undefined,
  }));
  // Every project gets an index route even when its docs/ has no README/index
  // file — the page renders a generated listing there (dynamicParams = false,
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
  const title = doc ? `${doc.title} — ${project.name}` : project.name;
  return { title, description: project.tagline };
}

function PageList({ slug, routes }: { slug: string; routes: DocRoute[] }) {
  if (routes.length === 0) return null;
  return (
    <nav className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="font-semibold">Pages</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
        {routes.map((route) => (
          <li key={route.docPath.join("/")}>
            <Link
              href={`/docs/${slug}/${route.docPath.join("/")}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {route.docPath[route.docPath.length - 1].replace(/[-_]/g, " ")}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Breadcrumb({ project }: { project: Project }) {
  return (
    <p className="text-sm font-medium text-zinc-500">
      <Link href="/docs" className="hover:underline">
        Docs
      </Link>
      {" / "}
      <Link href={`/docs/${project.slug}`} className="hover:underline">
        {project.name}
      </Link>
    </p>
  );
}

export default async function DocPage({ params }: Props) {
  const { slug, path: docPath = [] } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const doc = await getDocContent(slug, docPath);
  if (!doc && docPath.length > 0) notFound();

  const routes = await getProjectDocRoutes(slug);
  const children = childRoutes(routes, docPath);

  if (!doc) {
    // Project has no docs index page: render a generated one from its routes.
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <Breadcrumb project={project} />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          {project.name}
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          {project.tagline}
        </p>
        <PageList slug={slug} routes={children} />
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

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Breadcrumb project={project} />
      <article className="mt-8">
        <Markdown content={doc.markdown} baseSegments={baseSegments} />
      </article>
      <PageList slug={slug} routes={children} />
    </div>
  );
}
