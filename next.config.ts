import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The docs route space moved from /docs/<slug>/... to /<slug>/docs/...
      {
        source: "/docs/:slug(crucible-code|sdlc-skills|augments-adk-python)",
        destination: "/:slug/docs",
        permanent: true,
      },
      {
        source:
          "/docs/:slug(crucible-code|sdlc-skills|augments-adk-python)/:path+",
        destination: "/:slug/docs/:path+",
        permanent: true,
      },
      // philharmonica-adk-python was renamed to augments-adk-python; keep its
      // old links working, including the pre-move /docs/<slug> ones, in one hop.
      {
        source: "/philharmonica-adk-python",
        destination: "/augments-adk-python",
        permanent: true,
      },
      {
        source: "/philharmonica-adk-python/:path+",
        destination: "/augments-adk-python/:path+",
        permanent: true,
      },
      {
        source: "/docs/philharmonica-adk-python",
        destination: "/augments-adk-python/docs",
        permanent: true,
      },
      {
        source: "/docs/philharmonica-adk-python/:path+",
        destination: "/augments-adk-python/docs/:path+",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
