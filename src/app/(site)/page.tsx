import Link from "next/link";
import { projects } from "@/lib/projects";

const principles = [
  {
    title: "Human authority",
    body: "People stay responsible for the decisions that matter. Our tools make each action clearer and more deliberate, and they never hide what they do.",
  },
  {
    title: "Understandable behavior",
    body: "You can see what a tool is doing and why, and step in whenever you need to.",
  },
  {
    title: "Meaningful choice",
    body: "Durable software avoids needless lock-in. You pick the systems and services you trust.",
  },
  {
    title: "Local ownership",
    body: "Your work and your data belong to you. We treat privacy and control as design constraints from the start.",
  },
  {
    title: "Measured usefulness",
    body: "Reliability, performance and concrete results count for more than impressive demos or big claims.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <section className="pt-20 pb-16 sm:pt-28">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Practical augments for human capability.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          An <strong className="font-semibold text-foreground">augment</strong>{" "}
          is a tool that extends what a person can do. It does not replace
          the person or decide for them, and it will not demand their
          attention. The person stays in command.
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Augments Labs is where we build them: a coding agent for the
          terminal, a framework for systems of agents that act in the real
          world, and a set of skills that hold autonomous agents to real
          engineering standards.
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
