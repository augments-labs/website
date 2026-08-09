import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { projects } from "./projects";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export interface DocRoute {
  slug: string;
  /** Route segments after /<slug>/docs/; empty array = the project's doc index. */
  docPath: string[];
}

/**
 * Repos whose docs/ contains a single top-level folder named after the repo
 * itself (e.g. sdlc-skills/docs/sdlc-skills/*.md) get that redundant segment
 * collapsed, so URLs read /sdlc-skills/docs/philosophy, not
 * /sdlc-skills/docs/sdlc-skills/philosophy. Disk layout is untouched.
 */
export function collapseSlugSegment(segments: string[], slug: string): string[] {
  return segments[0] === slug ? segments.slice(1) : segments;
}

/**
 * Maps a synced file (relative to content/docs/<slug>/) to route segments.
 * README and index files become the index of their directory.
 */
export function fileToSegments(relativePath: string, slug: string): string[] {
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
export function childRoutes(routes: DocRoute[], docPath: string[]): DocRoute[] {
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
   * links and images inside the markdown, and its full path feeds the
   * "Edit this page on GitHub" link.
   */
  fileRelPath: string;
}

export async function getDocContent(
  slug: string,
  docPath: string[],
): Promise<DocContent | null> {
  const projectDir = path.join(CONTENT_DIR, slug);
  // Route space collapses the redundant <slug>/ segment, so a route like
  // /sdlc-skills/docs/philosophy may live at sdlc-skills/philosophy.md on disk.
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

function humanize(segment: string): string {
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractTitle(markdown: string, docPath: string[]): string {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  const last = docPath[docPath.length - 1] ?? "";
  return humanize(last);
}

// ---------------------------------------------------------------------------
// Sidebar tree
// ---------------------------------------------------------------------------

export interface DocTreeNode {
  title: string;
  /** Route segments for this node's own page; null for bare sections. */
  docPath: string[] | null;
  children: DocTreeNode[];
}

interface FileInfo {
  segments: string[];
  isIndex: boolean;
  title: string;
}

async function readFileInfo(slug: string, relPath: string): Promise<FileInfo> {
  const markdown = await readFile(path.join(CONTENT_DIR, slug, relPath), "utf8");
  const base = relPath
    .split("/")
    .pop()!
    .replace(/\.(md|mdx)$/i, "");
  return {
    segments: fileToSegments(relPath, slug),
    isIndex: base === "README" || base === "index",
    title: extractTitle(markdown, []),
  };
}

function ensureSection(root: DocTreeNode, segments: string[]): DocTreeNode {
  let node = root;
  for (const segment of segments) {
    let child = node.children.find((c) => c.title === humanize(segment));
    if (!child) {
      child = { title: humanize(segment), docPath: null, children: [] };
      node.children.push(child);
    }
    node = child;
  }
  return node;
}

function sortTree(nodes: DocTreeNode[]): void {
  nodes.sort((a, b) => {
    const aSection = a.children.length > 0 ? 0 : 1;
    const bSection = b.children.length > 0 ? 0 : 1;
    if (aSection !== bSection) return aSection - bSection;
    return a.title.localeCompare(b.title);
  });
  nodes.forEach((node) => sortTree(node.children));
}

/**
 * Builds the nested sidebar tree for a project. Sections sort before pages,
 * alphabetically within each group. The project root index is not a node.
 */
export async function getProjectDocTree(slug: string): Promise<DocTreeNode[]> {
  let files: string[];
  try {
    files = await listMarkdownFiles(path.join(CONTENT_DIR, slug));
  } catch {
    return [];
  }
  const infos = await Promise.all(files.map((f) => readFileInfo(slug, f)));

  const root: DocTreeNode = { title: "", docPath: null, children: [] };
  for (const info of infos) {
    if (info.segments.length === 0) continue; // project root index
    if (info.isIndex) {
      const node = ensureSection(root, info.segments);
      node.title = info.title;
      node.docPath = info.segments;
    } else {
      const parent = ensureSection(root, info.segments.slice(0, -1));
      parent.children.push({
        title: info.title,
        docPath: info.segments,
        children: [],
      });
    }
  }
  sortTree(root.children);
  return root.children;
}

/** Depth-first flatten of the tree in sidebar display order, for prev/next. */
export function flattenDocTree(
  tree: DocTreeNode[],
): { title: string; docPath: string[] }[] {
  const out: { title: string; docPath: string[] }[] = [];
  const walk = (nodes: DocTreeNode[]) => {
    for (const node of nodes) {
      if (node.docPath) out.push({ title: node.title, docPath: node.docPath });
      walk(node.children);
    }
  };
  walk(tree);
  return out;
}

// ---------------------------------------------------------------------------
// Headings (for the "On this page" rail). IDs match rehype-slug exactly:
// both use github-slugger on the heading's plain text.
// ---------------------------------------------------------------------------

export interface DocHeading {
  depth: number;
  text: string;
  id: string;
}

export function extractHeadings(markdown: string): DocHeading[] {
  const slugger = new GithubSlugger();
  const headings: DocHeading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^```/.test(line.trimStart())) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const text = match[2]
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/[`*_]/g, "")
      .trim();
    headings.push({ depth: match[1].length, text, id: slugger.slug(text) });
  }
  return headings;
}

// ---------------------------------------------------------------------------
// Repo metadata written by scripts/sync-docs.mjs (drives "Edit this page").
// ---------------------------------------------------------------------------

export interface RepoMeta {
  branch: string;
}

export async function getRepoMeta(slug: string): Promise<RepoMeta | null> {
  try {
    const raw = await readFile(path.join(CONTENT_DIR, slug, ".meta.json"), "utf8");
    return JSON.parse(raw) as RepoMeta;
  } catch {
    return null;
  }
}
