import { motion } from "framer-motion";

/** Deterministic falling rose petals (no random, so SSR matches). */
export function Petals({ count = 14, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const dur = 9 + ((i * 7) % 8);
        const delay = (i * 1.3) % 9;
        const size = 10 + ((i * 5) % 10);
        return (
          <motion.span
            key={i}
            className="absolute -top-8 block bg-primary"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.75,
              borderRadius: "80% 0 80% 0",
              opacity: 0.75,
            }}
            animate={{ y: ["0vh", "110vh"], x: [0, 40, -30, 20], rotate: [0, 180, 320] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

export function RoseMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 30 V17" stroke="currentColor" className="text-gold" strokeWidth="1.5" />
      <path d="M16 23 q-5 -1 -6 -5 q4 0 6 3" fill="currentColor" className="text-gold" opacity=".6" />
      <circle cx="16" cy="11" r="8" fill="currentColor" className="text-primary" />
      <path d="M12 10 q4 -5 8 0 q-4 5 -8 0z M10 13 q6 4 12 0" fill="none" stroke="currentColor" className="text-blood" strokeWidth="1.4" />
    </svg>
  );
}
