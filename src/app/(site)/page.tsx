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
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="py-20 sm:py-28">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Practical augments for human capability.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          An <strong className="font-semibold text-foreground">augment</strong>{" "}
          is a tool that extends a person&apos;s abilities. It does not replace
          the person, make decisions on their behalf, or demand attention for
          its own sake — it expands what they can do while leaving them firmly
          in command.
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Augments Labs is where we design and build those tools.
        </p>
      </section>

      <section id="projects" className="scroll-mt-20 border-t border-border py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/${project.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold group-hover:text-accent">
                  {project.name}
                </h3>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                  {project.language}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                {project.tagline}
              </p>
              <span className="mt-4 text-sm font-medium text-accent">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What guides us</h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title} className="border-l-2 border-accent/60 pl-4">
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted">
                {principle.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
