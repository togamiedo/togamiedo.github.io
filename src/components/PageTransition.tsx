import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@tanstack/react-router";
import { playSlash } from "@/lib/sfx";

const PAGES: Record<string, { jp: string; en: string }> = {
  "/": { jp: "序", en: "Introduction" },
  "/story": { jp: "物語", en: "Story" },
  "/weapon": { jp: "刀", en: "Weapon" },
};

const STRIPS = 6;
const EASE = [0.76, 0, 0.24, 1] as const;
type Run = { key: number; to: string; x: number; y: number; phase: "cover" | "reveal" };

/**
 * Tab change, in two acts. Cover: blood ink blooms out from where you clicked,
 * the destination kanji is brushed on stroke by stroke, a blade flashes across.
 * Reveal: the screen splits into shoji panels that slide away one after another.
 * Navigation happens hidden under the ink, so the old page never pops.
 */
export function PageTransition() {
  const router = useRouter();
  const [run, setRun] = useState<Run | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !(url.pathname in PAGES)) return;
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      const to = url.pathname;
      setRun({ key: Date.now(), to, x: e.clientX, y: e.clientY, phase: "cover" });
      setTimeout(() => playSlash(0.22), 650);
      setTimeout(async () => {
        await router.navigate({ to });
        window.scrollTo(0, 0);
        setRun((r) => (r ? { ...r, phase: "reveal" } : r));
      }, 1050);
      setTimeout(() => {
        setRun(null);
        busy.current = false;
      }, 2200);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  const page = run ? PAGES[run.to] : null;
  const reveal = run?.phase === "reveal";

  return (
    <AnimatePresence>
      {run && page && (
        <motion.div key={run.key} className="fixed inset-0 z-[90] overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {/* Shoji strips: carry the ink while covering, slide away one by one on reveal */}
          {Array.from({ length: STRIPS }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 h-full bg-lacquer"
              style={{ left: `${(i * 100) / STRIPS}%`, width: `${100 / STRIPS + 0.2}%` }}
              initial={{ clipPath: `circle(0% at ${run.x - (i * innerWidth) / STRIPS}px ${run.y}px)` }}
              animate={
                reveal
                  ? { y: i % 2 ? "105%" : "-105%", clipPath: "circle(150% at 50% 50%)" }
                  : { clipPath: `circle(150% at ${run.x - (i * innerWidth) / STRIPS}px ${run.y}px)` }
              }
              transition={reveal ? { duration: 0.75, delay: 0.05 * Math.abs(i - (STRIPS - 1) / 2) * 2, ease: EASE } : { duration: 0.75, ease: EASE }}
            >
              <div className="grain absolute inset-0" />
              <div className="absolute inset-y-0 right-0 w-px bg-gold/15" />
            </motion.div>
          ))}

          {/* Blood bloom chasing the ink */}
          {!reveal && (
            <motion.div
              className="absolute rounded-full bg-primary/25 blur-3xl"
              style={{ left: run.x, top: run.y, x: "-50%", y: "-50%" }}
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: 1400, height: 1400, opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          )}

          {/* Kanji brushed on, then sliced */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            animate={reveal ? { opacity: 0, scale: 1.15, filter: "blur(10px)" } : { opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="relative">
              <motion.p
                className="font-brush text-[9rem] leading-none text-paper md:text-[13rem]"
                initial={{ clipPath: "inset(0 0 100% 0)", filter: "blur(6px)" }}
                animate={{ clipPath: "inset(0 0 0% 0)", filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.55, ease: EASE }}
              >
                {page.jp}
              </motion.p>
              <motion.span
                className="absolute -right-10 -top-4 flex h-12 w-12 items-center justify-center border-2 border-primary font-brush text-xl text-primary"
                initial={{ scale: 2.5, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ delay: 0.75, duration: 0.25, ease: "easeIn" }}
              >
                印
              </motion.span>
            </div>
            <motion.p
              className="mt-6 font-display text-xs uppercase text-gold"
              initial={{ opacity: 0, letterSpacing: "1.4em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              {page.en}
            </motion.p>
          </motion.div>

          {/* Blade flash */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[180vw] bg-gradient-to-r from-transparent via-paper to-transparent shadow-[0_0_30px_6px_var(--primary)]"
            style={{ x: "-50%", y: "-50%", rotate: -18 }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ delay: 0.65, duration: 0.5, times: [0, 0.4, 1], ease: "easeOut" }}
          />

          {/* Petals thrown by the cut */}
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={`p${i}`}
              className="pointer-events-none absolute left-1/2 top-1/2 block bg-primary"
              style={{ width: 12, height: 9, borderRadius: "80% 0 80% 0" }}
              initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
              animate={{
                x: Math.cos((i / 14) * Math.PI * 2) * (260 + (i % 4) * 90),
                y: Math.sin((i / 14) * Math.PI * 2) * (180 + (i % 3) * 70) + 120,
                opacity: [0, 1, 0],
                rotate: 360 + i * 40,
              }}
              transition={{ delay: 0.7, duration: 1.3, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
