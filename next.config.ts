import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The docs route space moved from /docs/<slug>/... to /<slug>/docs/...
    return [
      {
        source: "/docs/:slug(crucible-code|sdlc-skills|philharmonica-adk-python)",
        destination: "/:slug/docs",
        permanent: true,
      },
      {
        source:
          "/docs/:slug(crucible-code|sdlc-skills|philharmonica-adk-python)/:path+",
        destination: "/:slug/docs/:path+",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
