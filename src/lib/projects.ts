import projectsJson from "./projects.json";

export interface Project {
  /** Repo name in the augments-labs org; also the /<slug> URL segment. */
  slug: string;
  /** Display name on cards and doc pages. */
  name: string;
  /** One-liner shown on the project card. */
  tagline: string;
  language: string;
  repoUrl: string;
  /** Install/build snippet for the welcome page. */
  quickstart: { label: string; code: string };
  /** 3–5 bullets for the welcome page. */
  highlights: string[];
}

export const ORG = "augments-labs";

export const projects: Project[] = projectsJson;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
