import type Lenis from "lenis";

/** Shared smooth-scroll instance (created client-side in SiteNav). */
export const smooth: { lenis: Lenis | null } = { lenis: null };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -90, duration: 2.2 });
  else el.scrollIntoView({ behavior: "smooth" });
}
