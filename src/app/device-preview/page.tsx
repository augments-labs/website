import type { Metadata } from "next";
import { PreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "Device preview",
  description:
    "Preview the Augments Labs site across named device viewports.",
};

export default function DevicePreviewPage() {
  return (
    <div className="h-dvh w-full">
      <PreviewClient />
    </div>
  );
}
