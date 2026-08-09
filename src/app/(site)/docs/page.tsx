import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Every project documents itself in its own repository; those pages are
        synced here at build time.
      </p>
      <div className="mt-10 grid gap-4">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/${project.slug}/docs`}
            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div>
              <h2 className="font-semibold">{project.name}</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {project.tagline}
              </p>
            </div>
            <span className="shrink-0 text-sm text-zinc-500">
              {pageCounts.get(project.slug) ?? 0} pages
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
