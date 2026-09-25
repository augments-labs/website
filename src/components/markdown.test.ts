import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

async function render(content: string): Promise<string> {
  const stream = await renderToReadableStream(
    createElement(Markdown, { content, baseSegments: ["p"] }),
  );
  await stream.allReady;
  return new Response(stream).text();
}

const textOf = (html: string) => html.replace(/<[^>]+>/g, "");

describe("Markdown fenced code blocks", () => {
  it("renders inside a <pre> so indentation and line breaks survive", async () => {
    const html = await render("```ts\nfunction f() {\n    return 1;\n}\n```\n");
    expect(html).toMatch(/<pre[^>]*>\s*<code/);
    expect(html).toMatch(/<pre[^>]*data-language="ts"[^>]*>/);
    expect(textOf(html)).toContain("function f() {\n    return 1;\n}");
  });

  it("keeps the copy button next to the code", async () => {
    const html = await render("```sh\nnpm test\n```\n");
    expect(html).toMatch(/<pre[\s\S]*<\/pre>[\s\S]*Copy/);
  });
});
