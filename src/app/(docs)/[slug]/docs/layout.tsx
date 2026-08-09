import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { getProjectDocTree } from "@/lib/docs";
import { getProject } from "@/lib/projects";

export default async function DocsLayout({
  children,
  params,
}: LayoutProps<"/[slug]/docs">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const tree = await getProjectDocTree(slug);
  return (
    <DocsShell project={project} tree={tree}>
      {children}
    </DocsShell>
  );
}
