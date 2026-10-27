import type Lenis from "lenis";

/** Shared smooth-scroll instance (created client-side in SiteNav). */
export const smooth: { lenis: Lenis | null } = { lenis: null };

export function scrollToId(id: string, highlight = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = (el.querySelector("[data-card]") as HTMLElement | null) ?? el;
  const glow = () => {
    if (!highlight) return;
    target.classList.remove("rose-highlight");
    void target.offsetWidth;
    target.classList.add("rose-highlight");
    setTimeout(() => target.classList.remove("rose-highlight"), 5000);
  };
  if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -160, duration: 2.2, onComplete: glow });
  else {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(glow, 900);
  }
}
