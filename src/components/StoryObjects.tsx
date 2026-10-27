import { motion, useInView, useReducedMotion } from "framer-motion";
import { useId, useRef } from "react";

export function KatanaDraw() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const id = useId();
  return <div ref={ref} data-katana-draw className="ml-auto mt-5 w-full max-w-lg" aria-hidden="true">
    <svg viewBox="0 0 600 150" className="h-auto w-full">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--paper)" /><stop offset="0.45" stopColor="var(--gold)" /><stop offset="0.52" stopColor="var(--paper)" /><stop offset="1" stopColor="var(--muted-foreground)" /></linearGradient></defs>
      <g transform="translate(8 6) rotate(-6 300 80)">
        <motion.g data-drawn-blade initial={false} animate={{ x: active ? -238 : 0 }} transition={{ delay: reduced ? 0 : 0.5, duration: reduced ? 0 : 1.9, ease: [0.76, 0, 0.12, 1] }}>
          <path d="M335 71L552 70Q578 72 585 62Q574 88 547 85L335 84Z" fill={`url(#${id})`} stroke="var(--paper)" strokeWidth="0.7" />
          <path d="M345 81Q403 77 418 80T478 80T550 80" fill="none" stroke="var(--paper)" strokeWidth="1" opacity="0.65" />
          <rect x="325" y="68" width="16" height="20" rx="2" fill="var(--gold)" />
          <ellipse cx="325" cy="78" rx="5" ry="25" fill="var(--gold)" stroke="var(--blood-deep)" strokeWidth="2" />
          <path d="M246 69L319 68L319 88L246 86Z" fill="var(--lacquer)" stroke="var(--gold)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${249+i*9} 70l9 8-9 8-9-8Z`} fill="var(--primary)" stroke="var(--gold)" strokeWidth="0.6" />)}
          <motion.path d="M348 72L575 70" stroke="var(--paper)" strokeWidth="3" initial={{ opacity: 0 }} animate={active && !reduced ? { opacity: [0, 0, 1, 0] } : { opacity: 0 }} transition={{ duration: 2.6, delay: 0.5 }} />
        </motion.g>
        <path d="M340 65L551 66Q588 68 584 84Q579 94 550 94L340 91Z" fill="var(--blood-deep)" stroke="var(--gold)" strokeWidth="1.3" />
        <path d="M352 71Q470 76 570 74" stroke="var(--primary)" strokeWidth="2" opacity="0.6" />
        <path d="M345 65L345 91 M350 65L350 91 M380 66L380 92 M386 66L386 92" stroke="var(--gold)" strokeWidth="2" />
        <path d="M382 93Q367 111 406 116Q425 113 393 94" fill="none" stroke="var(--primary)" strokeWidth="3" />
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
      <g transform="translate(130 180)">{Array.from({ length: 13 }, (_, i) => <motion.g key={i} initial={false} animate={{ rotate: active || reduced ? -72 + i * 12 : -7 + i * 1.1 }} transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 0.3 + i * 0.025, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}>
        <path d="M0 0L-15-145Q0-150 15-145Z" fill={i % 2 ? "var(--blood-deep)" : "var(--primary)"} stroke="var(--gold)" strokeWidth="0.6" />
        <path d="M-12-119Q0-124 12-119 M-9-97Q0-101 9-97" fill="none" stroke="var(--sakura)" strokeOpacity="0.5" />
        <path d="M0 0L0-146" stroke="var(--gold)" strokeWidth="1.8" />
        <path d="M-5-80Q2-89 6-79Q2-67-5-80" fill="var(--paper)" opacity="0.65" />
      </motion.g>)}</g>
      <circle cx="130" cy="180" r="5" fill="var(--gold)" /><path d="M130 185Q118 196 136 197" stroke="var(--sakura)" fill="none" strokeWidth="2" />
    </svg>
  </div>;
}