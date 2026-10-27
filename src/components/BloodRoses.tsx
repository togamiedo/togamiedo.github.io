import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ExecutionSplash } from "./ExecutionSplash";

function Rose({ stained, index, reduced }: { stained: boolean; index: number; reduced: boolean }) {
  return <motion.svg viewBox="0 0 100 150" data-blood-rose data-stained={stained} className="h-36 w-20 shrink-0 sm:h-44 sm:w-24" aria-hidden="true"
    animate={stained && !reduced ? { rotate: [0, 9 - index * 2, -7 + index, 4, -2, 0] } : { rotate: 0 }}
    transition={{ duration: 2.3, delay: index * 0.045, ease: "easeOut" }} style={{ transformOrigin: "50% 100%" }}>
    <path d="M50 146Q43 110 50 58 M47 115Q25 96 21 109Q25 125 47 123 M49 98Q71 81 76 89Q72 107 49 109" fill="var(--gold)" fillOpacity="0.32" stroke="var(--gold)" strokeWidth="1.2" />
    {[0, 1, 2, 3].map(ring => <g key={ring} transform={`translate(50 47) rotate(${ring * 33 + index * 17})`}>
      {Array.from({ length: 6 - ring }, (_, p) => {
        const r = 32 - ring * 7;
        return <motion.path key={p} transform={`rotate(${p * 360 / (6 - ring)})`}
          d={`M${-r * 0.5} 4C${-r * 1.3} ${-r * 0.9} ${-r * 0.5} ${-r * 1.5} ${r * 0.4} ${-r}C${r * 1.2} ${-r * 0.4} ${r * 0.6} 10 ${-r * 0.5} 4Z`}
          initial={false} animate={{ fill: stained ? (ring % 2 ? "var(--blood-deep)" : "var(--blood-wet)") : "var(--paper)" }}
          transition={{ duration: reduced ? 0 : 0.45 + ring * 0.12, delay: reduced ? 0 : index * 0.045 + p * 0.018 }}
          stroke="var(--lacquer)" strokeOpacity="0.15" strokeWidth="0.65" />;
      })}
    </g>)}
    {stained && <g fill="var(--blood-wet)">
      <path d="M35 64Q34 76 36 85Q39 79 38 68Z M59 65Q61 84 59 94Q55 88 57 69Z" />
      <ellipse cx="59" cy="95" rx="2.2" ry="3.7" />
      <path d="M29 35Q33 29 39 32" fill="none" stroke="var(--blood-glint)" strokeWidth="1.2" opacity="0.55" />
    </g>}
  </motion.svg>;
}

/** One trigger owns the slash, spray, lasting petal stains and impact sway. */
export function BloodRoses({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const near = useInView(host, { once: true, margin: "100% 0px 100% 0px" });
  const reading = useInView(host, { once: true, margin: "-25% 0px -25% 0px" });
  const [impact, setImpact] = useState(false);
  useEffect(() => {
    if (!reading || reduced) return;
    const timer = window.setTimeout(() => setImpact(true), 1600);
    return () => window.clearTimeout(timer);
  }, [reading, reduced]);
  return <div ref={host} id="lord-blood-roses" data-blood-roses className="relative my-16 flow-root">
    <div ref={text} data-slash-text>{children}</div>
    <div className="relative mt-8 flex min-h-52 items-start justify-center gap-0 sm:gap-3" data-rose-bed>
      {["mt-7 -rotate-6", "mt-0 rotate-3", "mt-12 -rotate-3", "mt-4 rotate-6"].map((placement, index) => <div key={index} className={placement}><Rose stained={impact} index={index} reduced={Boolean(reduced)} /></div>)}
      {impact && !reduced && <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: 30 }, (_, i) => <motion.ellipse key={i} cx={35 + i * 73 % 420} cy={25 + i * 37 % 105} rx={1.5 + i % 4} ry={3 + i % 6} fill="var(--blood-wet)" initial={{ y: -85, opacity: 0 }} animate={{ y: [-85, 0, 24], opacity: [0, 1, 0] }} transition={{ duration: 0.85, delay: 0.05 + i % 7 * 0.025 }} />)}
      </svg>}
    </div>
    {near && !reduced && <ExecutionSplash active={impact} target={text} />}
  </div>;
}