import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { playSlash } from "@/lib/sfx";

const PAGES: Record<string, { jp: string; en: string }> = {
  "/": { jp: "序", en: "Introduction" },
  "/story": { jp: "物語", en: "Story" },
  "/weapon": { jp: "刀", en: "Weapon" },
};

// Two halves of a diagonal cut, like a shoji screen sliced in one stroke.
const TOP = "polygon(0 0, 100% 0, 100% 38%, 0 62%)";
const BOTTOM = "polygon(0 62%, 100% 38%, 100% 100%, 0 100%)";

/** On every tab change: an ink ensō paints the page's kanji, a blade cuts the screen diagonally, and the halves slide apart. */
export function PageTransition() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const first = useRef(true);
  const [run, setRun] = useState<{ key: number; path: string } | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    setRun({ key: Date.now(), path });
    const s = setTimeout(() => playSlash(0.22), 750);
    const t = setTimeout(() => setRun(null), 1900);
    return () => {
      clearTimeout(s);
      clearTimeout(t);
    };
  }, [path]);

  const page = run ? (PAGES[run.path] ?? { jp: "頁", en: "" }) : null;

  return (
    <AnimatePresence>
      {run && page && (
        <motion.div key={run.key} className="pointer-events-none fixed inset-0 z-[90]" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {[TOP, BOTTOM].map((clip, i) => (
            <motion.div
              key={i}
              className="grain absolute inset-0 bg-lacquer"
              style={{ clipPath: clip }}
              initial={{ x: 0, y: 0 }}
              animate={{ x: i === 0 ? "-12%" : "12%", y: i === 0 ? "-110%" : "110%" }}
              transition={{ delay: 0.95, duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg viewBox="0 0 200 200" className="absolute h-72 w-72 md:h-96 md:w-96">
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="82"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, rotate: -100 }}
                    animate={{ pathLength: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ originX: "50%", originY: "50%" }}
                  />
                </svg>
                <motion.p
                  className="relative font-brush text-8xl text-paper md:text-9xl"
                  initial={{ opacity: 0, scale: 1.6, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                >
                  {page.jp}
                </motion.p>
                <motion.p
                  className="relative mt-4 font-display text-xs uppercase tracking-[0.6em] text-gold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {page.en}
                </motion.p>
              </div>
            </motion.div>
          ))}
          {/* the cut */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[3px] w-[160vw] bg-primary shadow-[0_0_24px_4px_var(--primary)]"
            style={{ x: "-50%", y: "-50%", rotate: -13 }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
            transition={{ delay: 0.75, duration: 0.6, times: [0, 0.35, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
