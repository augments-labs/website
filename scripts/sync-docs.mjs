/**
 * Syncs the docs/ folder of every project repo in the augments-labs org:
 *   - markdown (docs/**.md)      -> content/docs/<slug>/   (rendered as pages)
 *   - images  (docs/**.(svg...)) -> public/synced/<slug>/  (served statically)
 * plus .meta.json per project (default branch, drives "Edit this page").
 *
 * Runs automatically before `next dev` and `next build` via npm pre-hooks,
 * both locally and on Vercel.
 *
 * The source of truth for documentation is each project's own GitHub repo.
 * Never edit content/ or public/synced/ by hand; both are regenerated on
 * every run. Sync writes to temp dirs first and swaps on success, so a
 * failure (e.g. API rate limit) keeps the previous snapshot if one exists.
 *
 * Optional: set GITHUB_TOKEN to raise the GitHub API rate limit (60 req/h
 * unauthenticated). Recommended on Vercel: add GITHUB_TOKEN as an env var.
 */
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import projects from "../src/lib/projects.json" with { type: "json" };

const ORG = "augments-labs";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "content", "docs");
const ASSETS_DIR = path.join(ROOT, "public", "synced");
const TMP_CONTENT = path.join(ROOT, "content", ".docs-tmp");
const TMP_ASSETS = path.join(ROOT, "public", ".synced-tmp");

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

  const projectDir = path.join(TMP_CONTENT, project.slug);
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    path.join(projectDir, ".meta.json"),
    JSON.stringify({ branch }),
  );
  await Promise.all([
    ...docs.map((f) => download(project, branch, f.path, TMP_CONTENT)),
    ...images.map((f) => download(project, branch, f.path, TMP_ASSETS)),
  ]);
  console.log(
    `  ${project.slug}: ${docs.length} page(s), ${images.length} image(s)`,
  );
}

async function hasSnapshot(dir) {
  return (await readdir(dir).catch(() => [])).length > 0;
}

console.log(`Syncing docs from github.com/${ORG} ...`);
await rm(TMP_CONTENT, { recursive: true, force: true });
await rm(TMP_ASSETS, { recursive: true, force: true });
try {
  await mkdir(TMP_CONTENT, { recursive: true });
  for (const project of projects) {
    await syncProject(project);
  }
  // Success: swap the fresh snapshot in atomically-ish.
  await rm(CONTENT_DIR, { recursive: true, force: true });
  await rm(ASSETS_DIR, { recursive: true, force: true });
  await rename(TMP_CONTENT, CONTENT_DIR);
  if (await hasSnapshot(TMP_ASSETS)) {
    await rename(TMP_ASSETS, ASSETS_DIR);
  } else {
    await mkdir(ASSETS_DIR, { recursive: true });
  }
  console.log("Docs synced into content/docs/ and public/synced/");
} catch (error) {
  await rm(TMP_CONTENT, { recursive: true, force: true });
  await rm(TMP_ASSETS, { recursive: true, force: true });
  if (await hasSnapshot(CONTENT_DIR)) {
    console.warn(
      `Sync failed (${error.message}); using the existing content/ snapshot.`,
    );
  } else {
    throw error;
  }
}
