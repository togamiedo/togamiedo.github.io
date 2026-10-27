import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const LEFT = ["愚か者", "偽善者", "猪武者"];
const RIGHT = ["鈍才", "田舎侍", "声だけの男"];
const BANGS = [
  { top: "-5%", left: "3%", mark: "!!", rot: -13, d: 0.15 },
  { top: "-7%", right: "2%", mark: "!!!", rot: 11, d: 0.55 },
  { top: "38%", left: "-3%", mark: "!", rot: -7, d: 1.0 },
  { top: "46%", right: "-4%", mark: "!!", rot: 15, d: 1.45 },
  { bottom: "-7%", left: "10%", mark: "!!", rot: 8, d: 1.9 },
  { bottom: "-9%", right: "9%", mark: "!", rot: -11, d: 2.35 },
] as const;

/** Togami's jeers shriek in from both flanks while the whole passage trembles. */
export function InsultStorm({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const on = active && !reduced;
  const scream = (delay: number, rot: number) => ({
    initial: { opacity: 0, scale: 2.6, rotate: rot * 2.2 },
    animate: on
      ? { opacity: [0, 1, 1, 0], scale: [2.6, 0.9, 1.06, 1], rotate: [rot * 2.2, rot * 0.4, -rot * 0.3, rot] }
      : { opacity: reduced ? 0.8 : 0, scale: 1, rotate: rot },
    transition: reduced ? { duration: 0 } : { duration: 5.4, times: [0, 0.07, 0.8, 1], delay, ease: "easeOut" as const },
  });
  const jitter = { x: [0, 1.5, -1.5, 0], y: [0, -1, 1, 0] };
  const wave = (i: number) => 0.35 + i * 0.55;
  return (
    <div ref={ref} data-insult-storm className="relative" aria-hidden="true">
      <motion.div
        animate={on ? { x: [0, -3, 3, -2, 2, -1, 0], y: [0, 1, -1, 2, -1, 0], rotate: [0, -0.35, 0.35, -0.25, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={on ? { duration: 0.8, repeat: 4, repeatDelay: 1.15, ease: "easeInOut" } : { duration: 0 }}
      >
        {children}
      </motion.div>
      <div className="pointer-events-none absolute inset-0">
        {/* vertical jeers on the left flank */}
        <div className="absolute -left-2 top-1/2 flex -translate-y-1/2 flex-col gap-4 md:-left-6">
          {LEFT.map((word, i) => (
            <motion.span key={word} {...scream(wave(i), i % 2 ? 7 : -6)}
              className={`font-brush text-xl [writing-mode:vertical-rl] md:text-2xl ${i % 2 ? "text-gold" : "text-primary"}`}>
              <motion.span className="inline-block" animate={on ? jitter : { x: 0 }} transition={on ? { duration: 0.3, repeat: Infinity, delay: wave(i) + 0.8 } : { duration: 0 }}>{word}</motion.span>
            </motion.span>
          ))}
        </div>
        {/* vertical jeers on the right flank */}
        <div className="absolute -right-2 top-1/2 flex -translate-y-1/2 flex-col gap-4 md:-right-6">
          {RIGHT.map((word, i) => (
            <motion.span key={word} {...scream(wave(i + 1), i % 2 ? -7 : 6)}
              className={`font-brush text-xl [writing-mode:vertical-rl] md:text-2xl ${i % 2 ? "text-primary" : "text-gold"}`}>
              <motion.span className="inline-block" animate={on ? jitter : { x: 0 }} transition={on ? { duration: 0.28, repeat: Infinity, delay: wave(i + 1) + 0.8 } : { duration: 0 }}>{word}</motion.span>
            </motion.span>
          ))}
        </div>
        {/* shrieking exclamation marks all around */}
        {BANGS.map((b, i) => (
          <motion.span key={i} {...scream(b.d, b.rot)} style={{ top: b.top, right: b.right, left: b.left, bottom: b.bottom }}
            className="font-thug absolute text-2xl text-primary drop-shadow-[0_0_6px_var(--primary)] md:text-4xl">{b.mark}</motion.span>
        ))}
      </div>
    </div>
  );
}
