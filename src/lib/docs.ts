import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { projects } from "./projects";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export interface DocRoute {
  slug: string;
  /** Route segments after /docs/<slug>/; empty array = the project's doc index. */
  docPath: string[];
}

/**
 * Repos whose docs/ contains a single top-level folder named after the repo
 * itself (e.g. sdlc-skills/docs/sdlc-skills/*.md) get that redundant segment
 * collapsed, so URLs read /docs/sdlc-skills/philosophy, not
 * /docs/sdlc-skills/sdlc-skills/philosophy. Disk layout is untouched.
 */
export function collapseSlugSegment(segments: string[], slug: string): string[] {
  return segments[0] === slug ? segments.slice(1) : segments;
}

/**
 * Maps a synced file (relative to content/docs/<slug>/) to route segments.
 * README and index files become the index of their directory.
 */
function fileToSegments(relativePath: string, slug: string): string[] {
  const segments = collapseSlugSegment(
    relativePath
      .replace(/\.(md|mdx)$/i, "")
      .split("/")
      .filter(Boolean),
    slug,
  );
  const last = segments[segments.length - 1];
  if (last === "README" || last === "index") segments.pop();
  return segments;
}

async function listMarkdownFiles(dir: string, base = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        return listMarkdownFiles(path.join(dir, entry.name), rel);
      }
      return /\.(md|mdx)$/i.test(entry.name) ? [rel] : [];
    }),
  );
  return nested.flat();
}

export async function getProjectDocRoutes(slug: string): Promise<DocRoute[]> {
  try {
    const files = await listMarkdownFiles(path.join(CONTENT_DIR, slug));
    return files
      .map((file) => ({ slug, docPath: fileToSegments(file, slug) }))
      .sort((a, b) => a.docPath.join("/").localeCompare(b.docPath.join("/")));
  } catch {
    return []; // project has no synced docs
  }
}

export async function getAllDocRoutes(): Promise<DocRoute[]> {
  const perProject = await Promise.all(
    projects.map((p) => getProjectDocRoutes(p.slug)),
  );
  return perProject.flat();
}

/** Immediate children of a doc path: pages or sections one level deeper. */
export function childRoutes(
  routes: DocRoute[],
  docPath: string[],
): DocRoute[] {
  return routes.filter(
    (route) =>
      route.docPath.length === docPath.length + 1 &&
      docPath.every((segment, i) => route.docPath[i] === segment),
  );
}

export interface DocContent {
  markdown: string;
  title: string;
  /**
   * Path of the matched file relative to content/docs/<slug>/
   * (e.g. "a2a/index.md"). Its dirname is the base for resolving relative
   * links and images inside the markdown.
   */
  fileRelPath: string;
}

export async function getDocContent(
  slug: string,
  docPath: string[],
): Promise<DocContent | null> {
  const projectDir = path.join(CONTENT_DIR, slug);
  // Route space collapses the redundant <slug>/ segment, so a route like
  // /docs/sdlc-skills/philosophy may live at sdlc-skills/philosophy.md on disk.
  const diskPath = [slug, ...docPath];
  const candidates = (
    docPath.length === 0
      ? [
          path.join(projectDir, "README.md"),
          path.join(projectDir, "index.md"),
          path.join(projectDir, slug, "README.md"),
          path.join(projectDir, slug, "index.md"),
        ]
      : [
          path.join(projectDir, ...diskPath) + ".md",
          path.join(projectDir, ...diskPath, "README.md"),
          path.join(projectDir, ...diskPath, "index.md"),
          path.join(projectDir, ...docPath) + ".md",
          path.join(projectDir, ...docPath, "README.md"),
          path.join(projectDir, ...docPath, "index.md"),
        ]
  ).flatMap((p) => [p, p.replace(/\.md$/, ".mdx")]);
  for (const candidate of candidates) {
    try {
      const markdown = await readFile(candidate, "utf8");
      return {
        markdown,
        title: extractTitle(markdown, docPath),
        fileRelPath: path.relative(projectDir, candidate),
      };
    } catch {
      // candidate does not exist; try the next one
    }
  }
  return null;
}

function extractTitle(markdown: string, docPath: string[]): string {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  const last = docPath[docPath.length - 1] ?? "";
  return last.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
