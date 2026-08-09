"use client";

import { useSyncExternalStore } from "react";
import { DevicePreviewLab } from "react-device-lab";
import { projects } from "@/lib/projects";

/**
 * Same-origin device review workspace for this site. The absolute iframe URL
 * is derived from the current origin so the route works identically in local
 * dev (localhost:3000) and production (augmentslabs.com). useSyncExternalStore
 * keeps the server snapshot (null) and the hydrated client value consistent.
 */

const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => null;

export function PreviewClient() {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);

  if (!origin) return null;

  const destinations = [
    { id: "home", label: "Home", src: `${origin}/` },
    { id: "docs", label: "Docs", src: `${origin}/docs` },
    ...projects.map((project) => ({
      id: project.slug,
      label: project.name,
      src: `${origin}/docs/${project.slug}`,
    })),
  ];

  return (
    <DevicePreviewLab
      title="Augments Labs device preview"
      defaultDeviceId="iphone-17-pro"
      destinations={destinations}
      src={destinations[0].src}
    />
  );
}
