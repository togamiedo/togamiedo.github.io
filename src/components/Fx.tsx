import { motion } from "framer-motion";

const once = { once: true, amount: 0.6 } as const;

/** A small katana that leaves its sheath and cuts the air. */
export function SwordFx() {
  return (
    <motion.svg viewBox="0 0 220 120" className="h-28 w-56" initial="hide" whileInView="show" viewport={once} aria-hidden>
      {/* slash arc */}
      <motion.path
        d="M10 100 Q110 -20 210 60"
        fill="none"
        stroke="currentColor"
        className="text-paper"
        strokeWidth="2.5"
        strokeLinecap="round"
        variants={{ hide: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: [0, 1, 0], transition: { delay: 0.7, duration: 0.6 } } }}
      />
      {/* sheath */}
      <rect x="20" y="70" width="110" height="9" rx="4" className="fill-primary" />
      {/* blade + hilt sliding out */}
      <motion.g
        variants={{ hide: { x: 0, rotate: 0 }, show: { x: 70, rotate: -18, transition: { duration: 0.6, ease: [0.8, 0, 0.2, 1] } } }}
        style={{ transformOrigin: "120px 74px" }}
      >
        <path d="M60 72 L170 70 Q178 72 170 77 L60 77 Z" className="fill-paper" />
        <circle cx="58" cy="74.5" r="8" className="fill-blood" />
        <rect x="14" y="71" width="42" height="7" rx="2" className="fill-lacquer stroke-gold" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  );
}

/** Blood splatter that bursts and drips. */
export function BloodFx({ big = false }: { big?: boolean }) {
  const drops: [number, number, number][] = [
    [60, 50, 22], [95, 40, 10], [30, 70, 9], [110, 75, 13], [80, 90, 7], [20, 35, 6], [125, 45, 5], [45, 25, 7],
  ];
  return (
    <motion.svg viewBox="0 0 150 160" className={big ? "h-48 w-44" : "h-36 w-32"} initial="hide" whileInView="show" viewport={once} aria-hidden>
      {drops.map(([x, y, r], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          className="fill-blood"
          variants={{
            hide: { scale: 0, opacity: 0 },
            show: { scale: [0, 1.3, 1], opacity: 1, transition: { delay: i * 0.04, duration: 0.35 } },
          }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
      {([[60, 70], [110, 86], [30, 78]] as [number, number][]).map(([x, y], i) => (
        <motion.rect
          key={`d${i}`}
          x={x - 2.5}
          y={y}
          width="5"
          rx="2.5"
          className="fill-blood"
          variants={{ hide: { height: 0 }, show: { height: 40 + i * 15, transition: { delay: 0.4 + i * 0.15, duration: 1.6, ease: "easeIn" } } }}
        />
      ))}
    </motion.svg>
  );
}

/** A rose bloom that opens. */
export function BloomFx() {
  return (
    <motion.svg viewBox="0 0 100 100" className="h-24 w-24" initial="hide" whileInView="show" viewport={once} aria-hidden>
      {[0, 72, 144, 216, 288].map((r, i) => (
        <motion.ellipse
          key={r}
          cx="50"
          cy="32"
          rx="14"
          ry="20"
          className="fill-primary"
          style={{ transformOrigin: "50px 50px", rotate: r }}
          variants={{ hide: { scale: 0 }, show: { scale: 1, transition: { delay: i * 0.1, duration: 0.7 } } }}
        />
      ))}
      <motion.circle cx="50" cy="50" r="11" className="fill-blood" variants={{ hide: { scale: 0 }, show: { scale: 1, transition: { delay: 0.6 } } }} style={{ transformOrigin: "50px 50px" }} />
    </motion.svg>
  );
}

/** A wooden sandal stamping on a flower. */
export function CrushFx() {
  return (
    <motion.svg viewBox="0 0 120 120" className="h-28 w-28" initial="hide" whileInView="show" viewport={once} aria-hidden>
      <motion.g variants={{ hide: { scaleY: 1 }, show: { scaleY: 0.25, transition: { delay: 0.55, duration: 0.15 } } }} style={{ transformOrigin: "60px 108px" }}>
        <path d="M60 108 V75" className="stroke-gold" strokeWidth="2" />
        <circle cx="60" cy="70" r="10" className="fill-paper" />
        <circle cx="60" cy="70" r="4" className="fill-accent" />
      </motion.g>
      <motion.g variants={{ hide: { y: -80, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeIn" } } }}>
        <rect x="25" y="88" width="70" height="8" rx="3" className="fill-muted-foreground" />
        <rect x="32" y="96" width="10" height="12" className="fill-muted-foreground" />
        <rect x="78" y="96" width="10" height="12" className="fill-muted-foreground" />
      </motion.g>
    </motion.svg>
  );
}

/** Coins tumbling. */
export function CoinFx() {
  return (
    <motion.svg viewBox="0 0 100 80" className="h-20 w-24" initial="hide" whileInView="show" viewport={once} aria-hidden>
      {[20, 45, 70].map((x, i) => (
        <motion.g key={x} variants={{ hide: { y: -60, opacity: 0 }, show: { y: 0, opacity: 1, transition: { delay: i * 0.15, type: "spring", bounce: 0.5 } } }}>
          <ellipse cx={x} cy={55 - i * 4} rx="14" ry="9" className="fill-gold" />
          <rect x={x - 4} y={52 - i * 4} width="8" height="6" className="fill-lacquer" />
        </motion.g>
      ))}
    </motion.svg>
  );
}

/** A plain kimono crossed out. */
export function KimonoFx() {
  return (
    <motion.svg viewBox="0 0 100 100" className="h-20 w-20" initial="hide" whileInView="show" viewport={once} aria-hidden>
      <path d="M30 15 L50 30 L70 15 L90 35 L75 45 L75 90 L25 90 L25 45 L10 35 Z" className="fill-secondary stroke-gold" strokeWidth="1.5" />
      <motion.path d="M15 15 L85 90" className="stroke-primary" strokeWidth="6" strokeLinecap="round" variants={{ hide: { pathLength: 0 }, show: { pathLength: 1, transition: { delay: 0.3, duration: 0.4 } } }} />
    </motion.svg>
  );
}

export type FxKind = "sword" | "blood" | "bigblood" | "bloom" | "crush" | "coin" | "kimono";

export function Fx({ kind }: { kind: FxKind }) {
  switch (kind) {
    case "sword":
      return <SwordFx />;
    case "blood":
      return <BloodFx />;
    case "bigblood":
      return <BloodFx big />;
    case "bloom":
      return <BloomFx />;
    case "crush":
      return <CrushFx />;
    case "coin":
      return <CoinFx />;
    case "kimono":
      return <KimonoFx />;
  }
}
