import { describe, expect, it } from "vitest";
import { resolveAssetSrc, resolveDocHref } from "./doc-links";

describe("resolveDocHref", () => {
  it("passes through external, mailto and pure anchor links", () => {
    expect(resolveDocHref(["p"], "https://example.com/x.md")).toBe(
      "https://example.com/x.md",
    );
    expect(resolveDocHref(["p"], "mailto:a@b.c")).toBe("mailto:a@b.c");
    expect(resolveDocHref(["p"], "#section")).toBe("#section");
  });

  it("resolves a sibling markdown link from a root-level doc", () => {
    expect(resolveDocHref(["crucible-code"], "permission.md")).toBe(
      "/crucible-code/docs/permission",
    );
  });

  it("resolves ../ links against the file's directory", () => {
    expect(
      resolveDocHref(["philharmonica-adk-python", "a2a"], "../guides/agents.md"),
    ).toBe("/philharmonica-adk-python/docs/guides/agents");
  });

  it("maps index/readme targets to the directory route", () => {
    expect(
      resolveDocHref(
        ["philharmonica-adk-python", "guides"],
        "../concepts/index.md",
      ),
    ).toBe("/philharmonica-adk-python/docs/concepts");
  });

  it("preserves anchors while stripping the .md extension", () => {
    expect(
      resolveDocHref(
        ["philharmonica-adk-python", "guides"],
        "../a2a/a2a.md#production-warning",
      ),
    ).toBe("/philharmonica-adk-python/docs/a2a/a2a#production-warning");
  });

  it("collapses the redundant <slug>/<slug> segment (repo docs folder named after the repo)", () => {
    // docs/sdlc-skills/philosophy.md linking to its sibling activation.md
    expect(
      resolveDocHref(["sdlc-skills", "sdlc-skills"], "activation.md"),
    ).toBe("/sdlc-skills/docs/activation");
  });
});

describe("resolveAssetSrc", () => {
  it("passes through absolute, external and data URIs", () => {
    expect(resolveAssetSrc(["p"], "/img/x.svg")).toBe("/img/x.svg");
    expect(resolveAssetSrc(["p"], "https://x.com/y.png")).toBe(
      "https://x.com/y.png",
    );
    expect(resolveAssetSrc(["p"], "data:image/svg+xml,abc")).toBe(
      "data:image/svg+xml,abc",
    );
  });

  it("mirrors the repo docs layout under /synced without slug collapsing", () => {
    expect(
      resolveAssetSrc(
        ["philharmonica-adk-python", "architecture"],
        "../images/architecture/overview.svg",
      ),
    ).toBe("/synced/philharmonica-adk-python/images/architecture/overview.svg");
  });
});
