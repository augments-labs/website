import Link from "next/link";
import { projects } from "@/lib/projects";

const principles = [
  {
    title: "Human authority",
    body: "People remain responsible for consequential decisions. Our tools make actions clearer and more deliberate, never less visible.",
  },
  {
    title: "Understandable behavior",
    body: "You should be able to inspect what a tool is doing, understand why it behaves that way, and intervene when necessary.",
  },
  {
    title: "Meaningful choice",
    body: "Durable software avoids needless lock-in and leaves room to choose the systems and services you trust.",
  },
  {
    title: "Local ownership",
    body: "Your work and data belong to you. Privacy and control are design constraints, not features added at the end.",
  },
  {
    title: "Measured usefulness",
    body: "Reliability, performance, and concrete outcomes matter more than impressive demonstrations or ambitious claims.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6">
      <section className="py-20 sm:py-28">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Practical augments for human capability.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          An <strong className="font-semibold">augment</strong> is a tool that
          extends a person&apos;s abilities. It does not replace the person,
          make decisions on their behalf, or demand attention for its own sake —
          it expands what they can do while leaving them firmly in command.
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Augments Labs is where we design and build those tools.
        </p>
      </section>

      <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold tracking-tight">What guides us</h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title}>
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {principle.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="flex flex-col rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{project.name}</h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {project.language}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {project.tagline}
              </p>
              <div className="mt-4 flex gap-4 text-sm font-medium">
                <Link
                  href={`/docs/${project.slug}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Docs
                </Link>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:underline"
                >
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
