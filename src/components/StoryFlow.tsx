import { motion, type TargetAndTransition } from "framer-motion";
import type { ReactNode } from "react";
import { Fx } from "./Fx";
import { RoseMark } from "./Petals";
import type { Block } from "@/lib/story";

/** Parses *bold* and {red} inline markers. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*|\{[^}]+\})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("*")) return <strong key={i} className="font-semibold text-paper">{p.slice(1, -1)}</strong>;
        if (p.startsWith("{")) return <span key={i} className="font-semibold text-primary glow-red">{p.slice(1, -1)}</span>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Ink({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ChapterTitle({ jp, en }: { jp: string; en: string }) {
  return (
    <Ink className="my-24 flex flex-col items-center text-center">
      <div className="flex items-center gap-4">
        <RoseMark className="h-8 w-8" />
        <h2 className="font-display text-3xl font-bold tracking-widest text-paper md:text-5xl">- {jp} -</h2>
        <RoseMark className="h-8 w-8" />
      </div>
      <motion.div className="mt-4 h-px w-48 origin-center bg-primary" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 }} />
      <p className="mt-3 font-display text-sm uppercase tracking-[0.5em] text-gold">{en}</p>
    </Ink>
  );
}

const PLACE = ["md:mr-20", "md:ml-20", "md:mx-6", "md:mr-10 md:ml-4"];
const SKIN = [
  "border-l-4 border-l-primary",
  "border-r-4 border-r-primary text-right",
  "text-center",
  "border-t-2 border-t-gold/60",
];
const ENTER: TargetAndTransition[] = [
  { opacity: 0, x: -90, filter: "blur(6px)" },
  { opacity: 0, x: 90, filter: "blur(6px)" },
  { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  { opacity: 0, y: 60, rotate: 3, scale: 0.94 },
];

export function StoryFlow({ blocks }: { blocks: Block[] }) {
  let pIndex = 0;
  return (
    <div className="mx-auto max-w-3xl px-6">
      {blocks.map((b, i) => {
        if (b.kind === "chapter") return <ChapterTitle key={i} jp={b.jp} en={b.en} />;
        if (b.kind === "quote") {
          const emoji = b.who === "togami" ? "🌹" : b.who === "chiyo" ? "🌸" : b.who === "thug" ? "🗡️" : null;
          const thug = b.who === "thug";
          return (
            <Ink key={i} className={`my-10 flex ${b.side === "right" ? "justify-end text-right" : "justify-start"}`}>
              <p
                className={
                  thug
                    ? "font-thug text-2xl tracking-wide text-paper md:text-3xl"
                    : b.who === "chiyo"
                      ? "font-display text-2xl font-bold text-sakura md:text-3xl"
                      : "font-display text-2xl font-bold text-primary glow-red md:text-3xl"
                }
              >
                {emoji && <span className="mr-3 inline-block align-middle text-xl md:text-2xl">{emoji}</span>}
                「{b.text}」
                {b.note && <span className="mt-2 block font-body text-base font-normal italic text-muted-foreground">{b.note}</span>}
              </p>
            </Ink>
          );
        }
        if (b.kind === "beat")
          return (
            <Ink key={i} className="my-12 flex items-center justify-center gap-6">
              {b.fx && <Fx kind={b.fx} />}
              <span className="font-display text-4xl font-bold italic tracking-[0.3em] text-paper md:text-5xl">{b.text}</span>
            </Ink>
          );
        const v = pIndex++ % 4;
        const fxLeft = v === 1;
        return (
          <div key={i} className={`relative my-10 ${PLACE[v]}`}>
            {b.fx && (
              <div
                className={`pointer-events-none mb-2 flex justify-center md:absolute md:top-0 md:mb-0 md:block ${
                  fxLeft ? "md:-left-48 lg:-left-56" : "md:-right-48 lg:-right-60"
                }`}
              >
                <Fx kind={b.fx} />
              </div>
            )}
            <motion.div
              className={`panel grain rounded-sm p-6 leading-relaxed md:p-8 ${SKIN[v]}`}
              initial={ENTER[v]!}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: v === 3 ? -0.6 : 0, scale: 1, clipPath: "inset(0 0% 0 0)", filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: v === 2 ? 1.6 : 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-lg md:text-xl"><Rich text={b.text} /></p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
