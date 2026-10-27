// Build config used ONLY by the GitHub Pages workflow:
//   bunx vite build --config vite.config.pages.ts
// The normal Lovable build keeps its own SSR target from vite.config.ts.
//
// Here the app is rendered to plain static files (no server needed):
// - `spa.prerender` writes an HTML shell that boots the client router
// - nitro's `github-pages` preset prerenders / and /404.html, adds .nojekyll
//   and emits everything to .output/public
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: { preset: "github-pages" },
});
