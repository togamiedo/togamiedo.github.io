import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import type Lenis from "lenis";
import { smooth } from "@/lib/scroll";

const items = [
  { to: "/", en: "Introduction", jp: "序" },
  { to: "/story", en: "Story", jp: "物語" },
  { to: "/weapon", en: "Weapon", jp: "刀" },
] as const;

export function SiteNav() {
  useEffect(() => {
    let raf = 0;
    let lenis: Lenis | null = null;
    void import("lenis").then(({ default: L }) => {
      lenis = new L({ lerp: 0.07, smoothWheel: true });
      smooth.lenis = lenis;
      const loop = (t: number) => {
        if (document.body.style.overflow === "hidden") lenis?.stop();
        else lenis?.start();
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      smooth.lenis = null;
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-lacquer/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="font-brush text-2xl text-primary glow-red">戸上</Link>
        <ul className="flex gap-6 md:gap-10">
          {items.map((it) => (
            <li key={it.to}>
              <Link
                to={it.to}
                className="group flex flex-col items-center font-display text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-paper"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: true }}
              >
                <span className="font-brush text-base normal-case tracking-normal">{it.jp}</span>
                {it.en}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
