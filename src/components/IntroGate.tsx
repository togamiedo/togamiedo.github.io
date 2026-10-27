import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import portrait from "@/assets/togami-notice.png.asset.json";
import { Petals } from "./Petals";
import { playCrack, playSlash } from "@/lib/sfx";

type Phase = "idle" | "breaking" | "gone";

/** Opening scene: a bounty notice sealed with a wax rose. Click to cut it open. */
export function IntroGate() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    document.body.style.overflow = phase === "gone" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  const breakSeal = () => {
    if (phase !== "idle") return;
    setPhase("breaking");
    playCrack();
    setTimeout(() => playSlash(), 330);
    setTimeout(() => setPhase("gone"), 2300);
  };

  const breaking = phase === "breaking";

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden bg-lacquer"
          onClick={breakSeal}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          role="button"
          aria-label="Break the seal to enter"
        >
          {/* lantern glow */}
          <div className="animate-flicker absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <Petals count={breaking ? 30 : 8} />

          <div className="relative h-[78vh] max-h-[680px] w-[min(86vw,420px)]">
            {/* top half */}
            <motion.div
              className="absolute inset-0"
              style={{ clipPath: "polygon(0 0,100% 0,100% 47%,0 53%)" }}
              animate={breaking ? { y: "-70vh", rotate: -8, opacity: 0 } : { y: 0 }}
              transition={{ delay: 0.55, duration: 1.3, ease: [0.7, 0, 0.3, 1] }}
            >
              <Notice />
            </motion.div>
            {/* bottom half */}
            <motion.div
              className="absolute inset-0"
              style={{ clipPath: "polygon(0 53%,100% 47%,100% 100%,0 100%)" }}
              animate={breaking ? { y: "70vh", rotate: 6, opacity: 0 } : { y: 0 }}
              transition={{ delay: 0.55, duration: 1.3, ease: [0.7, 0, 0.3, 1] }}
            >
              <Notice />
            </motion.div>

            {/* wax rose seal */}
            <motion.div
              className="absolute left-1/2 top-1/2 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
              animate={
                breaking
                  ? { scale: [1, 1.2, 0], rotate: [0, -15, 60], opacity: [1, 1, 0] }
                  : { scale: [1, 1.04, 1] }
              }
              transition={breaking ? { duration: 0.5 } : { duration: 2.4, repeat: Infinity }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <radialGradient id="wax" cx="38%" cy="32%" r="75%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--blood)" />
                  </radialGradient>
                </defs>
                <path
                  d="M50 4 C62 6 70 2 78 10 C88 18 96 28 95 42 C97 55 98 66 90 76 C82 88 70 96 56 95 C42 98 30 96 20 88 C9 80 3 66 5 52 C3 38 8 24 18 15 C28 6 38 3 50 4Z"
                  fill="url(#wax)"
                />
                <circle cx="50" cy="50" r="31" fill="none" stroke="var(--blood)" strokeWidth="2.5" opacity="0.8" />
                <circle cx="50" cy="50" r="27" fill="none" stroke="var(--paper)" strokeWidth="0.6" opacity="0.25" />
                <text x="50" y="62" textAnchor="middle" fontSize="34" fill="var(--paper)" opacity="0.85" style={{ fontFamily: "var(--font-brush)" }}>薔</text>
              </svg>
            </motion.div>

            {/* the slash */}
            {breaking && (
              <motion.div
                className="absolute left-[-30vw] top-1/2 z-20 h-[3px] w-[160vw] origin-left -rotate-[3deg] bg-paper shadow-[0_0_30px_6px] shadow-primary"
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: 1, opacity: [1, 1, 0] }}
                transition={{ delay: 0.35, duration: 0.45, ease: "easeIn" }}
              />
            )}
          </div>

          <motion.p
            className="absolute bottom-8 left-0 right-0 text-center font-display text-sm uppercase tracking-[0.5em] text-gold"
            animate={breaking ? { opacity: 0 } : { opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: breaking ? 0 : Infinity }}
          >
            Click to break the seal · 封を切る
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Notice() {
  return (
    <div className="grain flex h-full w-full flex-col items-center bg-paper px-6 py-6 text-lacquer shadow-2xl">
      <p className="font-brush text-5xl tracking-widest text-blood">手配書</p>
      <p className="mt-1 font-display text-xs uppercase tracking-[0.4em]">Notice of Bounty · Kyōto</p>
      <div className="mt-4 h-[45%] w-full overflow-hidden border-2 border-lacquer">
        <img src={portrait.url} alt="" className="h-full w-full object-cover object-center grayscale sepia contrast-125" />
      </div>
      <p className="mt-4 font-display text-3xl font-bold">GENSHIRO TOGAMI</p>
      <p className="font-body text-sm italic">Disgraced son of magistrates. Kabukimono. Bounty hunter.</p>
      <div className="mt-auto flex w-full items-end justify-between">
        <span className="font-brush text-vertical text-lg">賞金首</span>
        <span className="font-display text-xs">Wanted, by the letter of the law.</span>
        <span className="font-brush text-vertical text-lg text-blood">戸上</span>
      </div>
    </div>
  );
}
