import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

async function redirectFor(source: string) {
  const redirects = (await nextConfig.redirects?.()) ?? [];
  return redirects.find((r) => r.source === source);
}

describe("renamed project redirects", () => {
  it("sends the previous welcome page to the new slug", async () => {
    expect(await redirectFor("/philharmonica-adk-python")).toMatchObject({
      destination: "/augments-adk-python",
      permanent: true,
    });
  });

  it("sends every page under the previous slug to the same path under the new one", async () => {
    expect(await redirectFor("/philharmonica-adk-python/:path+")).toMatchObject({
      destination: "/augments-adk-python/:path+",
      permanent: true,
    });
  });

  it("sends the previous /docs/<slug> routes straight to the new docs, in one hop", async () => {
    expect(await redirectFor("/docs/philharmonica-adk-python")).toMatchObject({
      destination: "/augments-adk-python/docs",
      permanent: true,
    });
    expect(await redirectFor("/docs/philharmonica-adk-python/:path+")).toMatchObject({
      destination: "/augments-adk-python/docs/:path+",
      permanent: true,
    });
  });

  it("serves the new slug from the /docs/<slug> redirect like the other projects", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const docsIndex = redirects.find((r) => r.destination === "/:slug/docs");
    expect(docsIndex?.source).toContain("augments-adk-python");
    expect(docsIndex?.source).not.toContain("philharmonica");
  });
});
