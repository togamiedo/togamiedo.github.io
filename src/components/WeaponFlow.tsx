import { motion } from "framer-motion";
import { Fx } from "./Fx";
import { Rich } from "./StoryFlow";
import type { Block } from "@/lib/story";

const NUM = ["壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖", "拾"];

/** The weapon's history, laid out as a forging record: a vertical gold spine with
 *  numbered steps that hang off alternating sides, and chapter banners like noren. */
export function WeaponFlow({ blocks }: { blocks: Block[] }) {
  let step = 0;
  return (
    <div className="relative mx-auto max-w-5xl px-6">
      {/* spine */}
      <motion.div
        className="absolute bottom-0 left-8 top-0 w-px origin-top bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0 md:left-1/2"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
      {blocks.map((b, i) => {
        if (b.kind === "chapter") {
          step = 0;
          return (
            <motion.div
              key={i}
              id={b.id}
              className="relative z-10 my-28 flex justify-center scroll-mt-28"
              initial={{ opacity: 0, y: -80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 60, damping: 12 }}
            >
              <div className="relative bg-blood px-10 pb-10 pt-6 text-center shadow-2xl [clip-path:polygon(0_0,100%_0,100%_85%,75%_100%,50%_88%,25%_100%,0_85%)]">
                <p className="font-brush text-3xl text-paper md:text-4xl">{b.jp}</p>
                <p className="mt-2 font-display text-xs uppercase tracking-[0.5em] text-gold">{b.en}</p>
              </div>
            </motion.div>
          );
        }
        if (b.kind !== "p") return null;
        const n = step++;
        const right = n % 2 === 1;
        return (
          <div key={i} className={`relative my-14 flex pl-16 md:pl-0 ${right ? "md:justify-end" : "md:justify-start"}`}>
            {/* node on the spine */}
            <motion.span
              className="absolute left-8 top-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-gold bg-lacquer font-brush text-xl text-gold md:left-1/2"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "backOut" }}
            >
              {NUM[n] ?? n + 1}
            </motion.span>
            <motion.div
              className={`group relative w-full md:w-[44%] ${right ? "md:text-left" : "md:text-right"}`}
              initial={{ opacity: 0, x: right ? 120 : -120, rotateY: right ? -25 : 25 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 900 }}
            >
              <div className="relative overflow-hidden border border-gold/30 bg-gradient-to-br from-card to-lacquer p-6 md:p-8">
                <span className="pointer-events-none absolute -right-4 -top-8 font-brush text-[9rem] leading-none text-primary/10">
                  {NUM[n] ?? ""}
                </span>
                {/* steel glint sweeping across on reveal */}
                <motion.span
                  className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-paper/15 to-transparent"
                  initial={{ left: "-40%" }}
                  whileInView={{ left: "140%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.6 }}
                />
                <p className="relative text-lg leading-relaxed md:text-xl"><Rich text={b.text} /></p>
              </div>
              {b.fx && (
                <div className={`mt-4 flex ${right ? "md:justify-start" : "md:justify-end"} justify-center`}>
                  <Fx kind={b.fx} />
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
