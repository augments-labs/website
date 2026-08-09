import type { Metadata } from "next";
import "react-device-lab/styles.css";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "Device preview",
  description:
    "Preview the Augments Labs site across named device viewports.",
};

export default function DevicePreviewPage() {
  // Dev tool: keep it out of the search index (the site layout's
  // data-pagefind-body would otherwise index it with a broken .html URL).
  return (
    <div data-pagefind-ignore="all" className="h-dvh w-full">
      <PreviewClient />
    </div>
  );
}
