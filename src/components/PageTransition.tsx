import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "@tanstack/react-router";
import { playSlash } from "@/lib/sfx";

const PAGES: Record<string, { jp: string; en: string; cut: number }> = {
  "/": { jp: "序", en: "Introduction", cut: -12 },
  "/story": { jp: "物語", en: "Story", cut: 12 },
  "/weapon": { jp: "刀", en: "Weapon", cut: -22 },
};
const EASE = [0.76, 0, 0.24, 1] as const;
const SLICES = [
  { clip: "polygon(0 0,100% 0,100% 30%,0 55%)", x: "-12%", y: "-110%", rotate: -8 },
  { clip: "polygon(0 55%,100% 30%,100% 62%,0 87%)", x: "110%", y: "-12%", rotate: 6 },
  { clip: "polygon(0 87%,100% 62%,100% 100%,0 100%)", x: "-12%", y: "110%", rotate: -6 },
];
type Run = { key: number; to: string; phase: "cover" | "reveal" };

/** One opaque cover hides navigation; three cut fragments carry the same artwork away. */
export function PageTransition() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [run, setRun] = useState<Run | null>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let alive = true;
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !(url.pathname in PAGES)) return;
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      setRun({ key: Date.now(), to: url.pathname, phase: "cover" });
      if (!reduced) later(() => playSlash(0.16), 780);
      later(() => {
        void (async () => {
          try {
            await router.navigate({ to: url.pathname, hash: url.hash.slice(1) });
            if (!alive) return;
            if (!url.hash) window.scrollTo({ top: 0, behavior: "instant" });
          } finally {
            if (alive) setRun((r) => r ? { ...r, phase: "reveal" } : r);
          }
        })().catch(() => {});
      }, reduced ? 100 : 1150);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      alive = false;
      document.removeEventListener("click", onClick, true);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      busy.current = false;
    };
  }, [router, reduced]);

  const page = run ? PAGES[run.to] : null;
  const reveal = run?.phase === "reveal";
  const finish = () => { setRun(null); busy.current = false; };

  return (
    <AnimatePresence>
      {run && page && (
        <motion.div key={run.key} data-page-transition className="fixed inset-0 z-[90] overflow-hidden" aria-hidden="true"
          initial={{ opacity: reduced ? 0 : 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
          {/* A fast diagonal ink shutter, not a slow circle leaving the old page exposed. */}
          <motion.div className="absolute inset-0 bg-lacquer"
            initial={{ clipPath: reduced ? "inset(0)" : "polygon(-30% 0,0 0,-30% 100%,-60% 100%)" }}
            animate={{ clipPath: "polygon(0 0,130% 0,100% 100%,-30% 100%)", opacity: reveal ? 0 : 1 }}
            transition={{ clipPath: { duration: 0.38, ease: EASE }, opacity: { duration: 0, delay: reduced ? 0 : 0.06 } }} />

          {SLICES.map((slice, index) => (
            <motion.div key={index} className="absolute inset-0 bg-lacquer" style={{ clipPath: slice.clip }}
              initial={{ opacity: 0 }}
              animate={reveal && !reduced ? { opacity: 1, x: slice.x, y: slice.y, rotate: slice.rotate } : { opacity: reveal ? 0 : 1, x: 0, y: 0, rotate: 0 }}
              transition={reveal ? { duration: reduced ? 0.15 : 0.92, delay: reduced ? 0 : index * 0.075, ease: EASE } : { duration: 0.06, delay: 0.36 }}
              onAnimationComplete={() => { if (reveal && index === 2) finish(); }}>
              <div className="grain absolute inset-0" />
              {/* Repeated composition aligns exactly across the three cut pieces. */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.svg viewBox="0 0 500 500" className="absolute h-[min(76vh,640px)] w-[min(90vw,640px)] text-primary" fill="none"
                  initial={{ rotate: -24, scale: 0.8, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 0.6 }} transition={{ delay: 0.3, duration: 0.8, ease: EASE }}>
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <motion.path key={angle} d="M250 250 C110 250 105 92 235 70 C385 45 440 245 250 250 C285 170 210 138 183 206"
                      transform={`rotate(${angle} 250 250)`} stroke="currentColor" strokeWidth="1.2"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.33, duration: 0.65 }} />
                  ))}
                  <circle cx="250" cy="250" r="222" stroke="currentColor" strokeDasharray="2 24" />
                </motion.svg>
                <motion.div className="relative flex flex-col items-center" initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.38, duration: 0.4 }}>
                  <motion.p className="font-brush text-[7rem] leading-none text-paper transition-kanji sm:text-[10rem] md:text-[13rem]"
                    initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ delay: 0.4, duration: 0.4, ease: EASE }}>{page.jp}</motion.p>
                  <motion.span className="absolute -right-5 -top-7 flex h-11 w-11 items-center justify-center border-2 border-primary font-brush text-xl text-primary"
                    initial={{ scale: 2, rotate: -28, opacity: 0 }} animate={{ scale: 1, rotate: -9, opacity: 1 }} transition={{ delay: 0.67, duration: 0.2 }}>印</motion.span>
                  <p className="mt-7 font-display text-sm uppercase text-gold">{page.en}</p>
                  <motion.div className="mt-5 h-px w-16 bg-gold/60" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.35 }} />
                </motion.div>
              </div>
              <div className="absolute inset-5 border border-gold/15 md:inset-10" />
            </motion.div>
          ))}

          {!reduced && (
            <>
              {/* The cutting edge sweeps across, leaving two fine heated seams. */}
              {[page.cut, page.cut + 32].map((angle, i) => (
                <motion.div key={angle} className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[170vmax] bg-paper transition-blade"
                  style={{ rotate: angle, x: "-50%", y: i ? "13vh" : "-8vh" }}
                  initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={{ delay: 0.78 + i * 0.12, duration: 0.42, times: [0, 0.35, 1], ease: "easeOut" }} />
              ))}
              {Array.from({ length: 22 }, (_, i) => (
                <motion.span key={i} className={`pointer-events-none absolute left-1/2 top-1/2 block ${i % 4 === 0 ? "bg-gold" : "bg-primary"}`}
                  style={{ width: 7 + i % 5 * 3, height: 5 + i % 3 * 3, borderRadius: "85% 5% 85% 5%" }}
                  initial={{ x: -120, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x: [-120, Math.cos(i * 2.4) * (170 + i * 14)], y: [0, Math.sin(i * 2.4) * (110 + i * 9) + 150], rotate: i * 51, scale: [0, 1, 0.5], opacity: [0, 1, 0] }}
                  transition={{ delay: 0.82 + i % 3 * 0.04, duration: 1.05, ease: "easeOut" }} />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
