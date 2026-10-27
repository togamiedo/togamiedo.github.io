import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/** Every piece rises, slides or settles into place — the dojo constructs itself. */
export function DojoScene() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const on = active || reduced;
  const build = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 26 },
    animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const },
  });
  const drop = (delay: number, from = -70) => ({
    initial: reduced ? false : { opacity: 0, y: from },
    animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: from },
    transition: { duration: reduced ? 0 : 1, delay: reduced ? 0 : delay, ease: [0.76, 0, 0.12, 1] as const },
  });
  return (
    <div ref={ref} data-dojo-scene className="pointer-events-none relative mr-auto mt-8 h-72 w-64 xl:absolute xl:right-full xl:top-0 xl:mr-6 xl:mt-0" aria-hidden="true">
      <motion.svg viewBox="0 0 260 300" className="h-full w-full overflow-visible" initial={reduced ? false : { opacity: 0 }} animate={on ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 1.2 }}>
        <ellipse cx="130" cy="282" rx="110" ry="10" fill="var(--blood-deep)" opacity="0.35" />
        {/* stone foundation rises out of the ground */}
        <motion.g {...build(0.15)}>
          <rect x="52" y="252" width="156" height="26" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1" />
          <rect x="64" y="240" width="132" height="14" fill="var(--card)" stroke="var(--gold)" strokeWidth="0.8" />
          <path d="M84 240v14 M116 240v14 M148 240v14 M180 240v14" stroke="var(--gold)" strokeWidth="0.6" opacity="0.6" />
        </motion.g>
        {/* wall frame + shoji lattice rise */}
        <motion.g {...build(0.55)}>
          <rect x="58" y="118" width="144" height="124" fill="var(--card)" stroke="var(--lacquer)" strokeWidth="2" />
          <rect x="104" y="150" width="52" height="90" fill="var(--blood-deep)" opacity="0.55" />
          <path d="M74 126h112 M74 142h112 M74 250V126 M186 250V126 M104 150h52v90h-52Z M130 150v90" fill="none" stroke="var(--paper)" strokeWidth="1.2" opacity="0.35" />
        </motion.g>
        {/* pillars: left, right, and the center beam post settle with a lean */}
        {[
          { x: 62, rot: -2.2, d: 0.8 },
          { x: 178, rot: 2.2, d: 0.95 },
        ].map(p => <motion.rect key={p.x} x={p.x} y="112" width="13" height="142" rx="1.5" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1"
          initial={reduced ? false : { opacity: 0, y: 40, rotate: p.rot * 4 }} animate={on ? { opacity: 1, y: 0, rotate: p.rot } : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : p.d, ease: [0.34, 1.4, 0.4, 1] }} style={{ transformOrigin: `${p.x + 6}px 254px` }} />)}
        <motion.g {...build(1.1)}>
          <rect x="58" y="112" width="144" height="12" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1" />
          <rect x="98" y="124" width="64" height="10" fill="var(--primary)" opacity="0.7" stroke="var(--gold)" strokeWidth="0.6" />
          <text x="130" y="133" textAnchor="middle" fill="var(--gold)" fontSize="8" fontFamily="var(--font-brush)">稽古場</text>
        </motion.g>
        {/* ridge beam drops, then the two roof halves slide together */}
        <motion.rect x="46" y="86" width="168" height="10" rx="2" fill="var(--gold)" opacity="0.9" {...drop(1.25)} />
        <motion.path d="M130 62Q84 70 34 100Q60 106 130 96Z" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1.2"
          initial={reduced ? false : { opacity: 0, x: -90, rotate: -6 }} animate={on ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x: -90 }}
          transition={{ duration: reduced ? 0 : 1.3, delay: reduced ? 0 : 1.55, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "130px 96px" }} />
        <motion.path d="M130 62Q176 70 226 100Q200 106 130 96Z" fill="var(--lacquer)" stroke="var(--gold)" strokeWidth="1.2"
          initial={reduced ? false : { opacity: 0, x: 90, rotate: 6 }} animate={on ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x: 90 }}
          transition={{ duration: reduced ? 0 : 1.3, delay: reduced ? 0 : 1.55, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "130px 96px" }} />
        <motion.path d="M40 102Q130 74 220 102" fill="none" stroke="var(--gold)" strokeWidth="2" opacity="0.8"
          initial={reduced ? false : { pathLength: 0 }} animate={on ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 2 }} />
        {/* noren curtain falls over the entrance */}
        <motion.g {...drop(2.15, -46)}>
          <path d="M102 152h56v34q-9 6-18.5 0q-9.5 6-19 0q-9.5 6-18.5 0Z" fill="var(--primary)" stroke="var(--gold)" strokeWidth="0.8" />
          <text x="130" y="175" textAnchor="middle" fill="var(--gold)" fontSize="15" fontFamily="var(--font-brush)">道</text>
        </motion.g>
        {/* signboard rises beside the entrance */}
        <motion.g {...build(2.35)}>
          <rect x="222" y="196" width="6" height="60" fill="var(--lacquer)" />
          <rect x="206" y="178" width="38" height="24" rx="2" fill="var(--card)" stroke="var(--gold)" strokeWidth="1" />
          <text x="225" y="195" textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--font-brush)">道場</text>
        </motion.g>
        {/* hanging bell drops, then keeps swinging */}
        <motion.g {...drop(2.55, -40)} style={{ transformOrigin: "130px 96px" }}>
          <line x1="130" y1="96" x2="130" y2="128" stroke="var(--gold)" strokeWidth="1.2" />
          <motion.g
            initial={false}
            animate={on && !reduced ? { rotate: [0, 9, -8, 6, -4, 2, 0] } : { rotate: 0 }}
            transition={on && !reduced ? { duration: 3.2, delay: 3, ease: "easeInOut" } : { duration: 0 }}
            style={{ transformOrigin: "130px 128px" }}
          >
            <path d="M124 128h12l-2.5 16q-3.5 3-7 0Z" fill="var(--gold)" stroke="var(--lacquer)" strokeWidth="0.8" />
            <circle cx="130" cy="147" r="2" fill="var(--sakura)" />
          </motion.g>
        </motion.g>
        {/* lantern glows to life */}
        <motion.g {...drop(2.8, -34)}>
          <rect x="206" y="118" width="20" height="26" rx="3" fill="var(--card)" stroke="var(--lacquer)" strokeWidth="1.2" />
          <motion.circle cx="216" cy="131" r="5" fill="var(--gold)" initial={false} animate={on ? { opacity: reduced ? 0.8 : [0, 1, 0.55, 0.9, 0.75] } : { opacity: 0 }} transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 3.15 }} />
          <motion.circle cx="216" cy="131" r="11" fill="var(--gold)" initial={false} animate={on ? { opacity: reduced ? 0.15 : [0, 0.35, 0.2] } : { opacity: 0 }} transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 3.15 }} />
        </motion.g>
        {/* practice sparks flicker across the dojo floor */}
        {!reduced && [0, 1, 2, 3].map(i => <motion.path key={i} d={`M${112 + i * 6} ${196 + (i % 2) * 10}l14 -7 M${114 + i * 6} ${210 + (i % 2) * 8}l-15 -4`}
          stroke="var(--paper)" strokeWidth="1.6" strokeLinecap="round" fill="none"
          initial={{ opacity: 0 }} animate={active ? { opacity: [0, 0.85, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 3.5 + i * 0.55, repeat: 2, repeatDelay: 1.4 }} />)}
        {/* dust puffs where the pieces land */}
        {(!reduced ? [[70, 254, 0.9], [190, 254, 1.05], [46, 96, 2.3]] as const : []).map(([x, y, d], i) => <motion.ellipse key={i} cx={x} cy={y} rx="16" ry="4" fill="var(--paper)" opacity="0"
          initial={{ opacity: 0 }} animate={active ? { opacity: [0, 0.3, 0], rx: [8, 20] } : { opacity: 0 }} transition={{ duration: 1, delay: d }} />)}
      </motion.svg>
    </div>
  );
}
