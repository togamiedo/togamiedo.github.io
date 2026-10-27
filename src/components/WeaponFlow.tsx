import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { Fx } from "./Fx";
import { Rich } from "./StoryFlow";
import type { Block } from "@/lib/story";

function ChapterScene({ chapter, rows, index }: { chapter: Extract<Block, { kind: "chapter" }>; rows: Block[]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <section ref={ref} id={chapter.id} className="relative scroll-mt-24 border-t border-gold/20" data-weapon-chapter>
      <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-16 md:pt-24">
        <div>
          <p className="mb-4 font-brush text-xl text-gold">{index === 0 ? "壱" : "弐"}</p>
          <h2 className="max-w-3xl font-brush text-3xl text-paper md:text-5xl">{chapter.jp}</h2>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1.5fr] md:gap-20 md:py-24">
        <aside className="hidden md:block">
          <div className="sticky top-32">
            <p className="font-brush text-[8rem] leading-none text-primary/30">{index === 0 ? "鍛" : "薔薇"}</p>
            <div className="mt-8 h-px w-28 bg-gold/50" />
            <motion.div className="mt-8 h-1 w-40 origin-left bg-primary" style={{ scaleX: scrollYProgress }} />
          </div>
        </aside>
        <div className="min-w-0 space-y-20 md:space-y-28">
          {rows.map((b, n) => {
            if (b.kind !== "p") return null;
            const dramatic = b.fx === "bigblood" || b.fx === "sword";
            return (
              <motion.article key={n} id={b.id} data-weapon-passage className={`relative scroll-mt-32 ${dramatic ? "border-y border-primary/40 py-10" : n % 3 === 1 ? "border-l border-gold/40 pl-6 md:pl-10" : ""}`}
                initial={reduced ? false : { opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.75 }}>
                <p className="mb-5 font-display text-xs text-gold/60">{String(n + 1).padStart(2, "0")}</p>
                <p className={`font-body leading-relaxed text-paper ${dramatic ? "text-3xl italic md:text-4xl" : n === 0 ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}><Rich text={b.text} /></p>
                {b.fx && <div className="mt-6 flex justify-end"><Fx kind={b.fx} /></div>}
                {b.fx === "bloom" && <div className="absolute -left-3 top-16 h-20 w-px bg-primary/50" />}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WeaponFlow({ blocks }: { blocks: Block[] }) {
  const chapters: { chapter: Extract<Block, { kind: "chapter" }>; rows: Block[] }[] = [];
  for (const block of blocks) {
    if (block.kind === "chapter") chapters.push({ chapter: block, rows: [] });
    else chapters.at(-1)?.rows.push(block);
  }
  return <div>{chapters.map((group, i) => <ChapterScene key={group.chapter.jp} {...group} index={i} />)}</div>;
}
