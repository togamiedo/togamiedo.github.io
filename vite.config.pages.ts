// Build config used ONLY by the GitHub Pages workflow:
//   bunx vite build --config vite.config.pages.ts
// The normal Lovable build keeps its own config from vite.config.ts.
//
// The prerender pass renders every page listed below once, at build time, and
// writes it as a real HTML file into the static output folder
// (.output/public): "/" -> index.html, "/story" -> story/index.html, ...
// That folder is then uploaded to GitHub Pages as-is — no server needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    pages: [{ path: "/" }, { path: "/story" }, { path: "/weapon" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
