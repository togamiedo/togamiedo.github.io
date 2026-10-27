<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve published history while automatic repository synchronization is active to prevent conflicting versions.
- Story text lives as typed blocks in src/lib/story.ts (with inline *bold* / {red} markers and optional fx), rendered by StoryFlow; edit content there, not in route files.
- Katana 3D models are meshopt-compressed GLBs loaded only client-side (lazy + ClientOnly) because three.js cannot run during SSR.
- Site media (photos, katana GLBs, background music) ships inside the repo under public/ and is referenced by absolute path, so the site serves itself on any static host; do not move it back to hosted asset pointers.
- GitHub Pages deploys from its own build config (vite.config.pages.ts), which prerenders every listed route to static HTML; add new pages to that list when a route is created.
- Page transitions cover navigation before revealing three aligned artwork fragments; finish on animation completion rather than a fixed navigation timeout so slow page loads remain hidden.
- Animation sound cues are cancellable Web Audio textures; cancel pending cues on unmount, and lock katana controls during staged drawing to prevent conflicting sequences.
- Weapon history uses typographic chapter bands with sticky reading progress and unframed varied passages; keep its text sourced from the shared typed story blocks.
- Full-screen passage effects use a client-side canvas mounted on visibility, resolve colors from CSS tokens, and cancel animation frames on unmount to keep static rendering and navigation safe.
