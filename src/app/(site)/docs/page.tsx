import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getProjectDocRoutes } from "@/lib/docs";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Documentation for every Augments Labs project.",
};

export default async function DocsIndex() {
  const pageCounts = new Map(
    await Promise.all(
      projects.map(
        async (project) =>
          [
            project.slug,
            (await getProjectDocRoutes(project.slug)).length,
          ] as const,
      ),
    ),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <span hidden data-pagefind-meta="url:/docs" />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Documentation", current: true }]}
      />
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
      <p className="mt-3 text-muted">
        Every project documents itself in its own repository; those pages are
        synced here at build time.
      </p>
      <div className="mt-10 grid gap-4">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/${project.slug}/docs`}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <div>
              <h2 className="font-semibold">{project.name}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {project.tagline}
              </p>
            </div>
            <span className="shrink-0 text-sm text-muted">
              {pageCounts.get(project.slug) ?? 0} pages
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
