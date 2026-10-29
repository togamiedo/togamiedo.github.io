import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
const NOTICE_PORTRAIT = "/img/togami-notice.png";
import { Petals } from "./Petals";
import { CrimsonRain } from "./CrimsonRain";
import { getMusic, playCrack, playSlash, startMusic } from "@/lib/sfx";

type Phase = "idle" | "breaking" | "revealing" | "gone";

/** Opening scene: a bounty notice sealed with a wax rose. Click to cut it open. */
export function IntroGate() {
  const [phase, setPhase] = useState<Phase>("idle");
  const sealRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const paperRefs = useMemo(() => [topRef, bottomRef] as const, []);
  const slashCue = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // A refresh always starts over: back to the Introduction, at the top.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (path !== "/") void navigate({ to: "/", replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = phase === "gone" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => () => {
    if (slashCue.current !== null) clearTimeout(slashCue.current);
  }, []);

  const breakSeal = () => {
    if (phase !== "idle") return;
    setPhase("breaking");
    playCrack();
    startMusic();
    slashCue.current = setTimeout(() => playSlash(), reduced ? 0 : 460);
  };

  const breaking = phase === "breaking" || phase === "revealing";

  return (
    <>
    {phase === "gone" && <MusicToggle />}
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden bg-lacquer"
          onClick={breakSeal}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); breakSeal(); }
          }}
          animate={{ opacity: phase === "revealing" ? 0 : 1 }}
          onAnimationComplete={() => { if (phase === "revealing") setPhase("gone"); }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.85 }}
          role="button"
          aria-label="Break the seal to enter"
        >
          <CrimsonRain sealRef={sealRef} paperRefs={paperRefs} breaking={breaking} />
          {breaking && <Petals count={30} className="z-30" />}

          <div className="relative h-[78vh] max-h-[680px] w-[min(86vw,420px)]">
            {/* top half */}
            <motion.div
              ref={topRef}
              className="absolute inset-0"
              style={{ clipPath: breaking ? "polygon(0 0,100% 0,100% 47%,0 53%)" : "none" }}
              animate={breaking ? { y: ["0vh", "-0.5vh", "-3vh", "-105vh"], rotate: [0, -1, -2, -9] } : { y: 0, rotate: 0 }}
              transition={{ delay: reduced ? 0 : 0.78, duration: reduced ? 0.2 : 2, times: [0, 0.13, 0.36, 1], ease: [0.55, 0, 0.3, 1] }}
            >
              <Notice cut={breaking} />
            </motion.div>
            {/* bottom half */}
            <motion.div
              ref={bottomRef}
              className="absolute inset-0"
              style={{ clipPath: "polygon(0 53%,100% 47%,100% 100%,0 100%)", visibility: breaking ? "visible" : "hidden" }}
              animate={breaking ? { y: ["0vh", "0.6vh", "3.5vh", "105vh"], rotate: [0, 1, 3, 8] } : { y: 0, rotate: 0 }}
              transition={{ delay: reduced ? 0 : 0.8, duration: reduced ? 0.2 : 2.15, times: [0, 0.13, 0.36, 1], ease: [0.55, 0, 0.3, 1] }}
              onAnimationComplete={() => { if (phase === "breaking") setPhase("revealing"); }}
            >
              <Notice cut={breaking} />
            </motion.div>

            {/* wax rose seal */}
            <motion.div
              ref={sealRef}
              className="intro-wax absolute -right-6 -top-6 z-10 h-24 w-24 rotate-12"
              animate={
                breaking
                  ? { scale: [1, 1.2, 0], rotate: [0, -15, 60], opacity: [1, 1, 0] }
                  : { scale: 1, rotate: 12 }
              }
              transition={breaking ? { delay: reduced ? 0 : 0.42, duration: 0.65 } : { duration: 2.4, repeat: Infinity }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
                <defs>
                  <radialGradient id="wax" cx="38%" cy="32%" r="75%">
                    <stop offset="0%" stopColor="var(--wax-worn)" />
                    <stop offset="42%" stopColor="var(--wax-body)" />
                    <stop offset="82%" stopColor="var(--blood-deep)" />
                    <stop offset="100%" stopColor="var(--wax-edge)" />
                  </radialGradient>
                  <filter id="wax-age" x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.17" numOctaves="3" seed="14" result="grain" />
                    <feDiffuseLighting in="grain" surfaceScale="1.3" diffuseConstant="0.65" lightingColor="var(--wax-worn)" result="relief">
                      <feDistantLight azimuth="225" elevation="48" />
                    </feDiffuseLighting>
                    <feComposite in="relief" in2="SourceAlpha" operator="in" result="clipped" />
                    <feBlend in="SourceGraphic" in2="clipped" mode="soft-light" />
                  </filter>
                  <clipPath id="wax-outline"><path d="M50 4 C62 6 70 2 78 10 C88 18 96 28 95 42 C97 55 98 66 90 76 C82 88 70 96 56 95 C42 98 30 96 20 88 C9 80 3 66 5 52 C3 38 8 24 18 15 C28 6 38 3 50 4Z" /></clipPath>
                </defs>
                <path
                  d="M50 4 C62 6 70 2 78 10 C88 18 96 28 95 42 C97 55 98 66 90 76 C82 88 70 96 56 95 C42 98 30 96 20 88 C9 80 3 66 5 52 C3 38 8 24 18 15 C28 6 38 3 50 4Z"
                  fill="url(#wax)"
                  filter="url(#wax-age)"
                />
                <g clipPath="url(#wax-outline)">
                  <path d="M20 13 24 22 20 29 27 35 M76 8 70 20 74 26 M94 60 83 58 78 65 72 67 M31 95 35 83 32 76 M11 69 20 66 23 61" fill="none" stroke="var(--wax-edge)" strokeWidth="1.4" opacity="0.9" />
                  <path d="M21 13 25 22 21 29 M77 9 71 20 M93 61 84 59 M32 94 36 83" fill="none" stroke="var(--wax-worn)" strokeWidth="0.5" opacity="0.5" />
                  {Array.from({ length: 48 }, (_, i) => <ellipse key={i} cx={8 + (i * 29) % 83} cy={7 + (i * 43) % 86} rx={0.3 + i % 3 * 0.25} ry={0.2 + i % 4 * 0.15} fill={i % 3 ? "var(--wax-edge)" : "var(--wax-worn)"} opacity="0.45" />)}
                </g>
                <circle cx="50" cy="51" r="31" fill="none" stroke="var(--wax-edge)" strokeWidth="3" opacity="0.9" />
                <circle cx="49.5" cy="49.5" r="31" fill="none" stroke="var(--wax-worn)" strokeWidth="0.8" strokeDasharray="42 5 61 9 31 4" opacity="0.55" />
                <circle cx="50" cy="50" r="27" fill="none" stroke="var(--wax-worn)" strokeWidth="0.6" opacity="0.24" />
                <text x="50.7" y="62.8" textAnchor="middle" fontSize="34" fill="var(--wax-edge)" className="font-brush">薔</text>
                <text x="50" y="62" textAnchor="middle" fontSize="34" fill="var(--wax-worn)" opacity="0.7" className="font-brush">薔</text>
              </svg>
            </motion.div>

            {/* the slash */}
            {breaking && (
              <motion.div
                className="intro-cut-flash absolute left-[-30vw] top-1/2 z-30 h-px w-[160vw] origin-left -rotate-[3deg] bg-paper"
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
                transition={{ delay: reduced ? 0 : 0.43, duration: 0.55, times: [0, 0.38, 1], ease: "easeIn" }}
              />
            )}
            {breaking && !reduced && (
              <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
                {Array.from({ length: 18 }, (_, i) => (
                  <motion.i key={i} className="absolute h-px w-2 bg-paper/70"
                    style={{ left: `${4 + i * 5.3}%`, top: `${53 - (4 + i * 5.3) * 0.06}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ x: [0, (i % 3 - 1) * 35], y: [0, (i % 2 ? -1 : 1) * (35 + i * 4)], rotate: [0, i * 31], opacity: [0, 0.8, 0] }}
                    transition={{ delay: 0.57 + i * 0.008, duration: 1.15 }} />
                ))}
              </div>
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
    </>
  );
}

function MusicToggle() {
  const [on, setOn] = useState(() => !(getMusic()?.paused ?? true));
  const toggle = () => {
    const m = getMusic();
    if (!m) return;
    if (m.paused) {
      startMusic();
      setOn(true);
    } else {
      m.pause();
      setOn(false);
    }
  };
  return (
    <div className="fixed bottom-5 left-5 z-[70] flex flex-col items-start gap-1.5">
    <button
      onClick={toggle}
      aria-label={on ? "Mute music" : "Play music"}
      className="border border-gold/50 bg-lacquer/70 px-4 py-2 font-display text-xs uppercase tracking-[0.3em] text-gold backdrop-blur transition hover:text-paper"
    >
      {on ? "♪ Music · 音" : "♪ Muted · 無音"}
    </button>
      <a
        href="https://commons.wikimedia.org/wiki/File:Shikanotoone_new.ogg"
        target="_blank"
        rel="noreferrer"
        className="max-w-[16rem] font-body text-xs italic text-paper/50 hover:text-paper/80"
      >
        Music: Shika no Tōne (鹿の遠音), traditional shakuhachi honkyoku. Wikimedia Commons, public domain.
      </a>
    </div>
  );
}

function Notice({ cut }: { cut: boolean }) {
  return (
    <div className="intro-paper grain flex h-full w-full flex-col items-center bg-paper px-6 py-6 text-lacquer shadow-2xl">
      <svg className="intro-paper-wear pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 420 680" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="paper-soft-wear"><feGaussianBlur stdDeviation="2.8" /></filter>
        </defs>
        <g filter="url(#paper-soft-wear)" fill="none" stroke="var(--paper-aged-edge)" opacity="0.2">
          <path d="M5 12 Q12 56 6 113 M416 68 Q408 104 415 155 M6 524 Q15 589 7 670 M414 480 Q405 544 413 626" strokeWidth="5" />
          <path d="M9 25 Q33 32 44 62 M380 620 Q391 645 414 656 M11 393 Q29 410 32 437" strokeWidth="2" />
        </g>
        <g fill="none" stroke="var(--paper-crease)" strokeWidth="0.7" opacity="0.14">
          <path d="M8 28 Q28 35 36 54 M10 31 Q25 40 31 57 M383 632 Q394 645 412 648 M11 402 Q20 413 23 430" />
        </g>
        {Array.from({ length: 72 }, (_, i) => <ellipse key={i} cx={6 + i * 137 % 407} cy={9 + i * 191 % 662} rx={0.4 + i % 4 * 0.4} ry={0.6 + i % 3 * 0.3} fill="var(--paper-crease)" opacity="0.13" />)}
        {cut && <path d="M0 360 21 357 38 358 65 353 82 355 112 348 136 349 170 343 194 344 219 338 242 339 270 331 294 332 321 325 340 327 368 321 393 323 420 319" fill="none" stroke="var(--paper-torn-edge)" strokeWidth="3" />}
      </svg>
      <p className="font-brush text-5xl tracking-widest text-blood">手配書</p>
      <p className="mt-1 font-display text-xs uppercase tracking-[0.4em]">Notice of Bounty · Kyōto</p>
      <div className="mt-4 h-[45%] w-full overflow-hidden border-2 border-lacquer">
        <img src={NOTICE_PORTRAIT} alt="" className="h-full w-full object-cover object-center grayscale sepia contrast-125" />
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
