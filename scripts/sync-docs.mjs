/**
 * Syncs the docs/ folder of every project repo in the augments-labs org:
 *   - markdown (docs/**.md)      -> content/docs/<slug>/   (rendered as pages)
 *   - images  (docs/**.(svg...)) -> public/synced/<slug>/  (served statically)
 *
 * Runs automatically before `next dev` and `next build` via npm pre-hooks,
 * both locally and on Vercel.
 *
 * The source of truth for documentation is each project's own GitHub repo —
 * never edit content/ or public/synced/ by hand; both are regenerated on
 * every run.
 *
 * Optional: set GITHUB_TOKEN to raise the GitHub API rate limit (60 req/h
 * unauthenticated, which is plenty for the default set of repos).
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import projects from "../src/lib/projects.json" with { type: "json" };

const ORG = "augments-labs";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "content", "docs");
const ASSETS_DIR = path.join(ROOT, "public", "synced");

const MARKDOWN_RE = /\.(md|mdx)$/i;
const IMAGE_RE = /\.(svg|png|jpe?g|gif|webp|avif|ico)$/i;

const headers = {
  "User-Agent": "augments-labs-website",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const hint = res.status === 403 ? " (rate limited? set GITHUB_TOKEN)" : "";
    throw new Error(`GitHub API returned ${res.status} for ${url}${hint}`);
  }
  return res.json();
}

async function download(project, branch, repoPath, destRoot) {
  const rawUrl = `https://raw.githubusercontent.com/${ORG}/${project.slug}/${branch}/${repoPath}`;
  const res = await fetch(rawUrl, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${rawUrl}: ${res.status}`);
  const dest = path.join(destRoot, project.slug, repoPath.slice("docs/".length));
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function syncProject(project) {
  const repo = await fetchJson(
    `https://api.github.com/repos/${ORG}/${project.slug}`,
  );
  const branch = repo.default_branch;
  const tree = await fetchJson(
    `https://api.github.com/repos/${ORG}/${project.slug}/git/trees/${branch}?recursive=1`,
  );
  const docs = tree.tree.filter(
    (entry) =>
      entry.type === "blob" &&
      entry.path.startsWith("docs/") &&
      MARKDOWN_RE.test(entry.path),
  );
  const images = tree.tree.filter(
    (entry) =>
      entry.type === "blob" &&
      entry.path.startsWith("docs/") &&
      IMAGE_RE.test(entry.path),
  );

  await Promise.all([
    ...docs.map((f) => download(project, branch, f.path, CONTENT_DIR)),
    ...images.map((f) => download(project, branch, f.path, ASSETS_DIR)),
  ]);
  console.log(
    `  ${project.slug}: ${docs.length} page(s), ${images.length} image(s)`,
  );
}

console.log(`Syncing docs from github.com/${ORG} ...`);
await rm(CONTENT_DIR, { recursive: true, force: true });
await rm(ASSETS_DIR, { recursive: true, force: true });
await mkdir(CONTENT_DIR, { recursive: true });
for (const project of projects) {
  await syncProject(project);
}
console.log("Docs synced into content/docs/ and public/synced/");
