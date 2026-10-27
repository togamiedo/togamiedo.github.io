import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const WORDS = ["法", "租税", "身分", "規則", "抜け道", "知恵"];

/** A stitched legal volume; its marginal notes escape the pages as he studies. */
export function StudyBook() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  return (
    <div ref={ref} data-study-book className="pointer-events-none relative ml-auto mt-8 h-72 w-48 xl:absolute xl:left-full xl:top-0 xl:ml-6 xl:mt-0" aria-hidden="true">
      <motion.svg viewBox="0 0 220 300" className="h-full w-full overflow-visible"
        initial={reduced ? false : { opacity: 0, y: 24 }} animate={active || reduced ? { opacity: 1, y: 0 } : { opacity: 0 }} transition={{ duration: 1.4 }}>
        <ellipse cx="110" cy="274" rx="87" ry="9" fill="var(--blood-deep)" opacity="0.35" />
        <motion.g initial={reduced ? false : { scaleX: 0.35 }} animate={active || reduced ? { scaleX: 1 } : { scaleX: 0.35 }} transition={{ duration: 2, ease: "easeOut" }} style={{ transformOrigin: "110px 220px" }}>
          <path d="M13 184 Q61 172 109 192 Q155 171 207 183 L209 260 Q155 249 110 269 Q61 250 11 262Z" fill="var(--blood-deep)" stroke="var(--gold)" strokeWidth="1" />
          <path d="M18 174 Q63 165 110 187 L110 258 Q65 237 17 250Z" fill="var(--paper)" />
          <path d="M110 187 Q156 162 201 174 L202 250 Q156 237 110 258Z" fill="var(--paper)" />
          <path d="M110 188L110 259 M20 253Q65 242 106 261 M114 261Q155 242 199 253" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4].map(col => <g key={col} fill="var(--lacquer)" opacity="0.6" fontSize="8" fontFamily="serif">
            {["御", "定", "書", "法", "令"].map((word, row) => <text key={row} x={33 + col * 13} y={191 + row * 10 + col * 1.6}>{word}</text>)}
            {["租", "税", "身", "分", "律"].map((word, row) => <text key={row} x={128 + col * 13} y={197 + row * 10 - col * 1.5}>{word}</text>)}
          </g>)}
          <path d="M103 186 Q110 177 117 186 M105 203L115 200 M105 224L115 221 M105 245L115 242" fill="none" stroke="var(--blood-deep)" strokeWidth="1.5" />
          <path d="M171 179L165 229L174 221L180 226L183 176Z" fill="var(--primary)" opacity="0.85" />
        </motion.g>
        {!reduced && WORDS.map((word, i) => <motion.text key={word} x={94 + (i % 3) * 12} y="190" className="font-brush" fill={i === 4 ? "var(--primary)" : "var(--gold)"} fontSize={i === 4 ? 24 : 17}
          initial={{ opacity: 0 }} animate={active ? { opacity: [0, 0.9, 0.75, 0], x: [0, (i % 2 ? 1 : -1) * (22 + i * 7)], y: [0, -95 - i * 12], rotate: [0, i % 2 ? 12 : -9] } : { opacity: 0 }}
          transition={{ duration: 4.6 + i * 0.28, delay: 1.2 + i * 0.65, repeat: 1, repeatDelay: 1.1, ease: "easeInOut" }}>{word}</motion.text>)}
      </motion.svg>
    </div>
  );
}