import { describe, expect, it } from "vitest";
import {
  childRoutes,
  collapseSlugSegment,
  extractHeadings,
  fileToSegments,
  flattenDocTree,
  type DocRoute,
  type DocTreeNode,
} from "./docs";

describe("collapseSlugSegment", () => {
  it("drops a leading segment equal to the slug", () => {
    expect(collapseSlugSegment(["sdlc-skills", "philosophy"], "sdlc-skills")).toEqual(
      ["philosophy"],
    );
  });

  it("leaves other paths untouched", () => {
    expect(
      collapseSlugSegment(["a2a", "a2a"], "philharmonica-adk-python"),
    ).toEqual(["a2a", "a2a"]);
  });
});

describe("fileToSegments", () => {
  it("maps a root README to the project index", () => {
    expect(fileToSegments("README.md", "p")).toEqual([]);
  });

  it("maps a directory index to the directory route", () => {
    expect(fileToSegments("guides/index.md", "p")).toEqual(["guides"]);
  });

  it("keeps nested pages", () => {
    expect(fileToSegments("a2a/a2a.md", "p")).toEqual(["a2a", "a2a"]);
  });

  it("collapses a docs folder named after the repo", () => {
    expect(fileToSegments("sdlc-skills/philosophy.md", "sdlc-skills")).toEqual([
      "philosophy",
    ]);
  });
});

describe("extractHeadings", () => {
  it("collects h2/h3 with github-slugger ids, skipping fences and h1/h4", () => {
    const md = [
      "# Title",
      "## Getting started",
      "```",
      "## not a heading",
      "```",
      "### Deep `code` dive",
      "#### Too deep",
      "## Getting started",
    ].join("\n");
    expect(extractHeadings(md)).toEqual([
      { depth: 2, text: "Getting started", id: "getting-started" },
      { depth: 3, text: "Deep code dive", id: "deep-code-dive" },
      { depth: 2, text: "Getting started", id: "getting-started-1" },
    ]);
  });

  it("strips markdown links from heading text", () => {
    expect(extractHeadings("## See [the guide](https://x.com) now")[0]).toEqual(
      { depth: 2, text: "See the guide now", id: "see-the-guide-now" },
    );
  });
});

describe("flattenDocTree", () => {
  it("flattens depth-first in display order, skipping bare sections", () => {
    const tree: DocTreeNode[] = [
      {
        title: "Guides",
        docPath: ["guides"],
        children: [
          { title: "Agents", docPath: ["guides", "agents"], children: [] },
        ],
      },
      { title: "Bare section", docPath: null, children: [] },
      { title: "Changelog", docPath: ["changelog"], children: [] },
    ];
    expect(flattenDocTree(tree)).toEqual([
      { title: "Guides", docPath: ["guides"] },
      { title: "Agents", docPath: ["guides", "agents"] },
      { title: "Changelog", docPath: ["changelog"] },
    ]);
  });
});

describe("childRoutes", () => {
  const routes: DocRoute[] = [
    { slug: "p", docPath: ["guides"] },
    { slug: "p", docPath: ["guides", "agents"] },
    { slug: "p", docPath: ["guides", "agents", "advanced"] },
    { slug: "p", docPath: ["changelog"] },
  ];

  it("returns immediate children only", () => {
    expect(childRoutes(routes, [])).toEqual([
      { slug: "p", docPath: ["guides"] },
      { slug: "p", docPath: ["changelog"] },
    ]);
    expect(childRoutes(routes, ["guides"])).toEqual([
      { slug: "p", docPath: ["guides", "agents"] },
    ]);
  });
});
