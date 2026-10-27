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

- Story text lives as typed blocks in src/lib/story.ts (with inline *bold* / {red} markers and optional fx), rendered by StoryFlow; edit content there, not in route files.
- Katana 3D models are meshopt-compressed GLBs served via Lovable Assets and loaded only client-side (lazy + ClientOnly) because three.js cannot run during SSR.
- Page transitions cover navigation before revealing three aligned artwork fragments; finish on animation completion rather than a fixed navigation timeout so slow page loads remain hidden.
