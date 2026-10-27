import { motion, type TargetAndTransition } from "framer-motion";
import type { ReactNode } from "react";
import { Fx, type FxKind } from "./Fx";
import { RoseMark } from "./Petals";
import type { Block } from "@/lib/story";

type Part = { t: "plain" | "bold" | "red" | "bleed" | "rose" | "chiyo"; s: string };

/** Inline markers: *bold*, {red}, ~bleed~ (white text soaked red), ^rose^ (a rose blooms), #chiyo# (her name). */
function parse(text: string): Part[] {
  return text
    .split(/(\*[^*]+\*|\{[^}]+\}|~[^~]+~|\^[^^]+\^|#[^#]+#)/g)
    .filter(Boolean)
    .map((p) => {
      const inner = p.slice(1, -1);
      if (p.startsWith("*")) return { t: "bold", s: inner };
      if (p.startsWith("{")) return { t: "red", s: inner };
      if (p.startsWith("~")) return { t: "bleed", s: inner };
      if (p.startsWith("^")) return { t: "rose", s: inner };
      if (p.startsWith("#")) return { t: "chiyo", s: inner };
      return { t: "plain", s: p };
    });
}

/** A small rose that can start white and get soaked red. */
function TinyRose({ delay = 0, white = false }: { delay?: number; white?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 32 32"
      className="mx-0.5 inline-block h-[1.1em] w-[1.1em] -translate-y-0.5 align-middle"
      initial={{ scale: 0, rotate: -120 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: "backOut" }}
      aria-hidden
    >
      <path d="M16 30 V17" stroke="var(--gold)" strokeWidth="1.5" />
      <motion.circle
        cx="16"
        cy="12"
        r="8"
        initial={{ fill: white ? "var(--paper)" : "var(--primary)" }}
        whileInView={{ fill: "var(--primary)" }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: delay + (white ? 1.2 : 0) }}
      />
      <path d="M12 11 q4 -5 8 0 q-4 5 -8 0z M10 14 q6 4 12 0" fill="none" stroke="var(--blood)" strokeWidth="1.4" />
    </motion.svg>
  );
}

function Bleed({ s }: { s: string }) {
  return (
    <span className="relative">
      <motion.span
        className="font-semibold [box-decoration-break:clone]"
        style={{
          backgroundImage: "linear-gradient(90deg, var(--primary) 0 50%, var(--paper) 50% 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
        initial={{ backgroundPosition: "100% 0" }}
        whileInView={{ backgroundPosition: "0% 0" }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 2.6, delay: 0.5, ease: "easeInOut" }}
      >
        {s}
      </motion.span>{" "}
      <TinyRose white delay={0.3} />
      <TinyRose white delay={0.6} />
      <TinyRose white delay={0.9} />
      {[8, 30, 55, 78].map((left, k) => (
        <motion.span
          key={k}
          className="pointer-events-none absolute top-full block w-1 rounded-b-full bg-primary"
          style={{ left: `${left}%` }}
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: [0, 14 + k * 6, 22 + k * 8], opacity: [0, 1, 0.8] }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, delay: 1.6 + k * 0.25, ease: "easeIn" }}
        />
      ))}
    </span>
  );
}

function ChiyoName({ s }: { s: string }) {
  return (
    <span className="relative inline-block font-chiyo text-[1.15em] text-sakura">
      {s.split("").map((c, k) => (
        <motion.span
          key={k}
          className="inline-block"
          initial={{ opacity: 0, y: -10, rotate: -20 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 + k * 0.07, duration: 0.6 }}
        >
          {c === " " ? "\u00a0" : c}
        </motion.span>
      ))}
      <motion.span
        className="absolute -bottom-1 left-0 h-px w-full origin-left bg-sakura"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 + s.length * 0.07, duration: 0.8 }}
      />
      <span className="ml-1 text-[0.8em]">🌸</span>
    </span>
  );
}

function styled(p: Part, key: number, dark = false): ReactNode {
  switch (p.t) {
    case "bold":
      return <strong key={key} className={`font-semibold ${dark ? "text-lacquer" : "text-paper"}`}>{p.s}</strong>;
    case "red":
      return <span key={key} className="font-semibold text-primary glow-red">{p.s}</span>;
    case "bleed":
      return <Bleed key={key} s={p.s} />;
    case "rose":
      return (
        <span key={key} className="whitespace-nowrap font-semibold text-primary">
          {p.s}
          <TinyRose delay={0.4} />
        </span>
      );
    case "chiyo":
      return <ChiyoName key={key} s={p.s} />;
    default:
      return <span key={key}>{p.s}</span>;
  }
}

export function Rich({ text, dark = false }: { text: string; dark?: boolean }) {
  return <>{parse(text).map((p, i) => styled(p, i, dark))}</>;
}

/** Word-by-word reveal, each word drops in like a stroke of the brush. */
function Words({ text }: { text: string }) {
  let n = 0;
  return (
    <>
      {parse(text).map((p, i) =>
        p.s.split(/(\s+)/).map((w, j) => {
          if (!w.trim()) return <span key={`${i}-${j}`}>{w}</span>;
          const d = n++ * 0.09;
          return (
            <motion.span
              key={`${i}-${j}`}
              className="inline-block"
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: d, duration: 0.5 }}
            >
              {styled({ t: p.t === "bleed" || p.t === "chiyo" ? "red" : p.t, s: w }, 0)}
            </motion.span>
          );
        }),
      )}
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

export function ChapterTitle({ jp }: { jp: string }) {
  return (
    <Ink className="my-28 flex flex-col items-center text-center">
      <div className="flex items-center gap-4">
        <RoseMark className="h-8 w-8" />
        <h2 className="font-display text-3xl font-bold tracking-widest text-paper md:text-5xl">- {jp} -</h2>
        <RoseMark className="h-8 w-8" />
      </div>
      <motion.div className="mt-4 h-px w-48 origin-center bg-primary" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 }} />
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

function FxSide({ fx, left }: { fx: FxKind; left: boolean }) {
  return (
    <div
      className={`pointer-events-none mb-2 flex justify-center md:absolute md:top-0 md:mb-0 md:block ${
        left ? "md:-left-48 lg:-left-56" : "md:-right-48 lg:-right-60"
      }`}
    >
      <Fx kind={fx} />
    </div>
  );
}

export function StoryFlow({ blocks }: { blocks: Block[] }) {
  let pIndex = 0;
  return (
    <div className="mx-auto max-w-3xl px-6">
      {blocks.map((b, i) => {
        if (b.kind === "chapter") return <ChapterTitle key={i} jp={b.jp} />;
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
                      ? "font-chiyo text-2xl font-semibold text-sakura md:text-3xl"
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

        const look = b.look ?? "panel";

        if (look === "dropcap") {
          const first = b.text.replace(/^[*{~^#]/, "")[0] ?? "";
          const rest = b.text.replace(first, "");
          return (
            <div key={i} className="relative my-16">
              {b.fx && <FxSide fx={b.fx} left={false} />}
              <motion.p
                className="text-xl leading-relaxed md:text-2xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.4 }}
              >
                <motion.span
                  className="float-left mr-4 mt-1 font-brush text-8xl leading-[0.8] text-primary glow-red md:text-9xl"
                  initial={{ opacity: 0, scale: 2.4, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {first}
                </motion.span>
                <Rich text={rest} />
              </motion.p>
              <motion.div
                className="clear-both mt-6 h-[3px] w-full origin-left bg-gradient-to-r from-primary via-primary/40 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, delay: 0.4 }}
              />
            </div>
          );
        }

        if (look === "words") {
          return (
            <div key={i} className="relative my-20 md:mx-4">
              {b.fx && <FxSide fx={b.fx} left />}
              <p className="font-display text-2xl font-bold italic leading-snug text-paper md:text-4xl">
                <Words text={b.text} />
              </p>
            </div>
          );
        }

        if (look === "edict") {
          return (
            <motion.div
              key={i}
              className="relative my-20 md:mx-8"
              initial={{ opacity: 0, rotateX: 70, y: -40 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 900, transformOrigin: "top" }}
            >
              <div className="relative flex gap-6 bg-paper p-7 text-lacquer shadow-2xl ring-4 ring-paper/30 ring-offset-4 ring-offset-lacquer md:p-10">
                <p className="font-brush text-vertical hidden shrink-0 border-l border-lacquer/30 pl-4 text-3xl text-blood md:block">古法 御定書</p>
                <p className="text-lg leading-relaxed md:text-xl"><Rich text={b.text} dark /></p>
                <motion.span
                  className="absolute -bottom-6 -right-4 flex h-20 w-20 items-center justify-center rounded-sm border-4 border-primary font-brush text-4xl text-primary"
                  initial={{ scale: 3, opacity: 0, rotate: -30 }}
                  whileInView={{ scale: 1, opacity: 0.9, rotate: -8 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 0.35, ease: "easeIn" }}
                >
                  法
                </motion.span>
              </div>
            </motion.div>
          );
        }

        if (look === "whisper") {
          return (
            <motion.p
              key={i}
              className="mx-auto my-14 max-w-lg text-center text-lg italic text-muted-foreground md:text-xl"
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.01em" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
            >
              <Rich text={b.text} />
            </motion.p>
          );
        }

        const v = pIndex++ % 4;
        return (
          <div key={i} className={`relative my-10 ${PLACE[v]}`}>
            {b.fx && <FxSide fx={b.fx} left={v === 1} />}
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
