import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const PETALS = Array.from({ length: 28 }, (_, i) => ({
  x: 70 + ((i * 137) % 850), y: 230 + ((i * 89) % 280),
  rotation: (i % 2 ? 1 : -1) * (80 + i * 23), delay: (i * 7 % 13) * 0.035,
}));

/** A single reading-triggered stomp, followed by torn orchid petals across the prose. */
export function OrchidStomp({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });
  const reduced = useReducedMotion();
  return <div ref={ref} id="orchid-stomp" data-orchid-stomp className="relative pt-44">
    {children}
    <svg viewBox="0 0 260 180" className="pointer-events-none absolute left-1/2 top-0 h-44 w-64 -translate-x-1/2" aria-hidden="true">
      <ellipse cx="132" cy="163" rx="78" ry="6" fill="var(--gold)" opacity="0.12" />
      <motion.g initial={false} animate={active && !reduced ? { rotate: [0, 0, 73, 80], opacity: [1, 1, 0.7, 0] } : { rotate: 0, opacity: 1 }}
        transition={{ delay: 3.25, duration: 1.7, times: [0, 0.08, 0.3, 1] }} style={{ transformOrigin: "132px 160px" }}>
        <path d="M132 162Q123 131 132 102 M128 141Q106 127 109 119Q125 119 130 139 M131 125Q146 111 153 115Q149 132 131 136" fill="none" stroke="var(--gold)" strokeWidth="2" />
        {[0, 72, 144, 216, 288].map((angle, i) => <path key={angle} transform={`translate(132 98) rotate(${angle})`} d={i % 2 ? "M0 2C-25-9-26-34-9-32C4-34 12-12 0 2Z" : "M0 2C-16-14-6-43 7-34C24-23 18-5 0 2Z"} fill="var(--paper)" stroke="var(--gold)" strokeWidth="0.6" />)}
        <path d="M122 97Q132 87 143 98L139 108Q131 118 125 108Z" fill="var(--paper)" stroke="var(--sakura)" strokeWidth="1.5" />
        <circle cx="132" cy="100" r="3" fill="var(--gold)" />
      </motion.g>
      {!reduced && <motion.g initial={{ x: 74, y: -140, rotate: -24, opacity: 0 }}
        animate={active ? { x: [74, 20, 0, 0, 45], y: [-140, -74, 0, 0, -100], rotate: [-24, -13, 0, -7, -18], opacity: [0, 1, 1, 1, 0] } : { opacity: 0 }}
        transition={{ delay: 2.1, duration: 3.2, times: [0, 0.28, 0.36, 0.67, 1], ease: [0.65, 0, 0.9, 1] }}>
        {/* Heavy geta platform, exposed foot, cloth thong and two wooden teeth. */}
        <path d="M57 126L208 121L207 139L57 144Z" fill="var(--gold)" stroke="var(--lacquer)" strokeWidth="2" />
        <path d="M59 137L206 132 M67 129L197 125 M80 146L80 158L97 156L97 142 M170 140L170 153L189 151L189 137" fill="var(--gold)" stroke="var(--lacquer)" strokeWidth="2" />
        <path d="M162-16L200-12L191 83Q197 99 188 112Q169 123 105 124L73 127Q59 124 66 114Q72 102 104 100L141 85Z" fill="var(--paper)" stroke="var(--gold)" strokeWidth="1.2" />
        <path d="M73 111Q79 106 84 112 M84 106Q89 102 94 109 M96 104Q102 100 108 107 M110 102L117 109" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
        <path d="M105 113L131 88L158 114" fill="none" stroke="var(--blood-deep)" strokeWidth="8" strokeLinecap="round" />
        <path d="M105 113L131 88L158 114" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <path d="M153-10L201-10L199 49L146 43Z" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1" />
      </motion.g>}
    </svg>
    {!reduced && <svg viewBox="0 0 1000 600" preserveAspectRatio="none" data-orchid-petals className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true">
      {PETALS.map((p, i) => <motion.g key={i} initial={{ x: 500, y: 170, opacity: 0, rotate: 0 }}
        animate={active ? { x: [500, p.x, p.x + (i % 2 ? 24 : -24)], y: [170, p.y, p.y + 65], opacity: [0, 0.9, 0.7, 0], rotate: [0, p.rotation * 0.7, p.rotation], scale: [0.4, 1, 0.8] } : { opacity: 0 }}
        transition={{ delay: 3.26 + p.delay, duration: 3.4 + i % 4 * 0.24, ease: "easeOut" }}>
        <path d="M0 0C-13-7-18-22-9-25C1-29 14-11 7-4L3-6Z" fill="var(--paper)" />
        <path d="M-7-20Q-1-11 2-5" fill="none" stroke="var(--gold)" strokeWidth="0.45" opacity="0.4" />
      </motion.g>)}
    </svg>}
  </div>;
}