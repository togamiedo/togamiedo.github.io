import { motion, useInView, useReducedMotion } from "framer-motion";
import { useId, useRef } from "react";

export function KatanaDraw() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const drawn = active || reduced;
  const duration = reduced ? 0 : 6.8;
  const blade = "M432 127Q600 128 739 116L786 98Q775 130 740 139Q589 150 432 147Z";
  return <div ref={ref} data-katana-draw className="relative mx-auto mt-7 w-full max-w-2xl" aria-hidden="true">
    <svg viewBox="-110 0 950 290" className="h-auto w-full overflow-visible">
      <defs>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0.1" y2="1">
          <stop stopColor="var(--muted-foreground)" /><stop offset="0.24" stopColor="var(--paper)" />
          <stop offset="0.4" stopColor="var(--foreground)" /><stop offset="0.49" stopColor="var(--muted-foreground)" />
          <stop offset="0.78" stopColor="var(--paper)" /><stop offset="1" stopColor="var(--foreground)" />
        </linearGradient>
        <linearGradient id={`${id}-saya`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--lacquer)" /><stop offset="0.32" stopColor="var(--blood-deep)" />
          <stop offset="0.5" stopColor="var(--blood)" /><stop offset="0.65" stopColor="var(--blood-deep)" /><stop offset="1" stopColor="var(--lacquer)" />
        </linearGradient>
        <linearGradient id={`${id}-fittings`} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor="var(--paper)" /><stop offset="0.3" stopColor="var(--gold)" /><stop offset="0.7" stopColor="var(--muted-foreground)" /><stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
        <clipPath id={`${id}-edge`}><path d={blade} /></clipPath>
      </defs>
      {/* Brush strokes ground the scene without enclosing it in a panel. */}
      <motion.g initial={false} animate={{ opacity: drawn ? 0.15 : 0 }} transition={{ duration: reduced ? 0 : 1.4 }} fill="var(--gold)">
        <path d="M-55 207Q370 227 803 197L727 214Q298 243-55 207Z" />
        <path d="M8 230Q308 242 590 222L467 241Q162 251 8 230Z" opacity="0.5" />
      </motion.g>
      <g transform="rotate(-9 350 145)">
        <motion.g initial={false} animate={{ y: drawn ? [0, 2, 2, -5, 0] : 0 }} transition={{ duration, times: [0, 0.12, 0.3, 0.88, 1] }}>
          {/* A short release, a deliberate pause, then the full draw and settle. */}
          <motion.g data-drawn-blade initial={false} animate={{ x: drawn ? [0, -12, -12, -373, -370] : 0 }} transition={{ duration, times: [0, 0.12, 0.3, 0.9, 1], ease: "easeInOut" }}>
            <path d={blade} fill={`url(#${id}-steel)`} stroke="var(--muted-foreground)" strokeWidth="0.8" />
            <path d="M442 132Q593 134 742 121L783 101" fill="none" stroke="var(--lacquer)" strokeWidth="1.4" opacity="0.55" />
            <path d="M444 144Q481 139 497 143T540 141T580 142T620 137T665 135T711 130Q750 129 774 114" fill="none" stroke="var(--paper)" strokeWidth="1.2" opacity="0.85" />
            <path d="M441 147Q606 150 740 138Q770 130 785 100" fill="none" stroke="var(--paper)" strokeWidth="1.8" />
            <path d="M753 115L764 128" stroke="var(--muted-foreground)" strokeWidth="0.8" />
            <g clipPath={`url(#${id}-edge)`}>
              <motion.path d="M448 115L466 161" stroke="var(--paper)" strokeWidth="14" initial={false} animate={{ x: drawn && !reduced ? [0, 0, 300] : 0, opacity: drawn && !reduced ? [0, 0.9, 0] : 0 }} transition={{ delay: reduced ? 0 : 5.6, duration: reduced ? 0 : 1.5, times: [0, 0.12, 1] }} />
              {Array.from({ length: 17 }, (_, i) => <path key={i} d={`M${459 + i * 16} 130l17 4`} stroke="var(--paper)" strokeWidth="0.4" opacity="0.22" />)}
            </g>
            <rect x="420" y="124" width="23" height="27" rx="2" fill={`url(#${id}-fittings)`} stroke="var(--gold)" />
            <path d="M423 126v23m4-22v22m5-22v22" stroke="var(--lacquer)" opacity="0.35" />
            <ellipse cx="416" cy="138" rx="10" ry="38" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="2.5" />
            <ellipse cx="416" cy="138" rx="5.5" ry="30" fill="none" stroke="var(--gold)" strokeWidth="0.8" />
            <path d="M414 107q-9 9 0 15q8 6 0 15q-8 8 0 15q8 6 0 17" fill="none" stroke="var(--gold)" />
            <path d="M295 125L406 124L406 153L295 150Z" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1.2" />
            {Array.from({ length: 10 }, (_, i) => <g key={i}>
              <path d={`M${301 + i * 10} 127l8 11-8 11-8-11Z`} fill="var(--paper)" opacity="0.75" />
              <path d={`M${295 + i * 11} 125l17 28m-17-1 17-28`} fill="none" stroke="var(--blood-deep)" strokeWidth="4" />
              <path d={`M${296 + i * 11} 125l17 28`} stroke="var(--gold)" strokeWidth="0.5" opacity="0.65" />
            </g>)}
            <path d="M293 125v26m5-26v26m102-27v29m4-29v29" stroke="var(--gold)" strokeWidth="3" />
            <path d="M350 136q6-9 13 0q-6 8-13 0m9-1 7-4m-7 8 7 4" stroke="var(--gold)" fill="none" strokeWidth="1.5" />
          </motion.g>
          {/* Opaque scabbard masks the steel until it physically clears the mouth. */}
          <path d="M444 120Q610 122 754 107Q799 85 800 110Q802 140 755 147Q594 162 444 157Z" fill={`url(#${id}-saya)`} stroke="var(--gold)" strokeWidth="1.2" />
          <path d="M457 127Q613 129 765 113" fill="none" stroke="var(--blood-glint)" strokeWidth="1.5" opacity="0.55" />
          <path d="M455 151Q624 158 767 137" fill="none" stroke="var(--lacquer)" strokeWidth="2.5" />
          <path d="M444 120v37m6-37v37m336-59q12 18-2 34" fill="none" stroke={`url(#${id}-fittings)`} strokeWidth="5" />
          <path d="M491 120v37m8-37v37m8-38v38m8-38v38" stroke="var(--lacquer)" strokeWidth="4" />
          <path d="M492 125l23 25m-23 0 23-25" stroke="var(--gold)" strokeWidth="1" />
          <motion.g initial={false} animate={{ y: drawn ? [0, 0, 4, -3, 0] : 0 }} transition={{ duration, times: [0, 0.3, 0.65, 0.9, 1] }}>
            <path d="M504 155Q479 183 493 192Q524 206 548 178Q549 163 508 158Q479 173 470 196" stroke="var(--blood)" strokeWidth="5" fill="none" />
            <path d="M504 155Q479 183 493 192Q524 206 548 178" stroke="var(--blood-glint)" strokeWidth="0.8" fill="none" opacity="0.6" />
            <path d="M470 195l-8 13m9-12-2 15m4-14 3 13" stroke="var(--blood)" strokeWidth="2" />
          </motion.g>
          <g fill="none" stroke="var(--gold)" opacity="0.55" strokeWidth="0.8">
            <path d="M621 137q-14-12-21 0q8 15 21 0q8-16 19-5q2 16-19 5Zm0 0q-7-8-12 0q7 8 12 0q3-10 10-4q2 8-10 4Z" />
            <path d="M634 140q32 0 43-15m-20 12q0-12 10-11q0 9-10 11m18-13 11-5" />
          </g>
        </motion.g>
        <motion.g initial={false} animate={{ opacity: drawn && !reduced ? [0, 0.8, 0] : 0, scale: drawn && !reduced ? [0.6, 1, 0.7] : 0.6 }} transition={{ delay: reduced ? 0 : 5.8, duration: reduced ? 0 : 1.1 }} style={{ transformOrigin: "411px 111px" }} stroke="var(--paper)" fill="none">
          <path d="M391 111h40m-20-20v40" strokeWidth="1" /><path d="M401 101l20 20m-20 0 20-20" strokeWidth="0.5" />
        </motion.g>
      </g>
    </svg>
  </div>;
}

export function SilkFan() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  return <div ref={ref} data-silk-fan className="ml-auto mt-5 w-60 max-w-full" aria-hidden="true">
    <svg viewBox="0 0 260 200" className="h-auto w-full">
      {Array.from({ length: 13 }, (_, i) => {
        const angle = active || reduced ? -72 + i * 12 : -7 + i * 1.1;
        const point = (a: number, r: number) => `${130 + Math.sin(a * Math.PI / 180) * r} ${180 - Math.cos(a * Math.PI / 180) * r}`;
        const transition = { duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 0.3 + i * 0.025 };
        return <g key={i}>
          <motion.path initial={false} animate={{ d: `M130 180L${point(angle - 6, 145)}Q${point(angle, 150)} ${point(angle + 6, 145)}Z` }} transition={transition} fill={i % 2 ? "var(--blood-deep)" : "var(--primary)"} stroke="var(--gold)" strokeWidth="0.6" />
          <motion.path initial={false} animate={{ d: `M130 180L${point(angle, 146)} M${point(angle - 5, 112)}Q${point(angle, 116)} ${point(angle + 5, 112)}` }} transition={transition} fill="none" stroke="var(--gold)" strokeWidth="1.2" />
        </g>;
      })}
      <circle cx="130" cy="180" r="5" fill="var(--gold)" /><path d="M130 185Q118 196 136 197" stroke="var(--sakura)" fill="none" strokeWidth="2" />
    </svg>
  </div>;
}