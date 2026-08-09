import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.tagline };
}

export default async function ProjectWelcomePage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <span hidden data-pagefind-meta={`url:/${slug}`} />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: project.name, current: true }]}
      />
      <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
        {project.language}
      </span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        {project.name}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        {project.tagline}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/${slug}/docs`}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Read the docs
        </Link>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          View on GitHub
        </a>
      </div>

      <section className="mt-14">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
          Quickstart
        </h2>
        <p className="mt-2 text-sm text-muted">{project.quickstart.label}</p>
        <div className="mt-3">
          <CodeBlock>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-sm leading-6">
              <code>{project.quickstart.code}</code>
            </pre>
          </CodeBlock>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
          Highlights
        </h2>
        <ul className="mt-4 space-y-3">
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="mt-1 h-4 w-4 shrink-0 text-accent"
                aria-hidden
              >
                <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm leading-6 text-muted">{highlight}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
