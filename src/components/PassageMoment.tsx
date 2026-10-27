import { useEffect, useRef, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { FxKind } from "./Fx";
import { ExecutionSplash } from "./ExecutionSplash";
import { playMotionCue } from "@/lib/sfx";
import { roseLayout, type RoseParticle } from "@/lib/rose-layout";

type Particle = RoseParticle;

function GardenCanvas({ active, kind }: { active: boolean; kind: FxKind }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prepared = useRef<{ sprite: HTMLCanvasElement; layers: HTMLCanvasElement[]; particles: Particle[]; w: number; h: number; paper: string } | null>(null);
  useEffect(() => {
    const canvas = ref.current, host = canvas?.parentElement;
    if (!canvas || !host) return;
    const prepare = () => {
      const { width: w, height: h } = host.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const css = getComputedStyle(document.documentElement);
      const color = (name: string) => css.getPropertyValue(name).trim();
      const sprite = document.createElement("canvas"); sprite.width = 160; sprite.height = 160;
      const c = sprite.getContext("2d");
      if (!c) return;
      const layers: HTMLCanvasElement[] = [];
      c.translate(80, 80);
      if (kind === "coin") {
        c.fillStyle = color("--gold"); c.beginPath(); c.arc(0, 0, 51, 0, Math.PI * 2); c.fill();
        c.strokeStyle = color("--paper"); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 42, 0, Math.PI * 2); c.stroke();
        c.clearRect(-12, -12, 24, 24);
      } else {
        // Layered curled petals, drawn once and reused by every blooming rose.
        for (let ring = 0; ring < 5; ring++) {
          const layer = document.createElement("canvas"); layer.width = 160; layer.height = 160;
          const petalContext = layer.getContext("2d");
          if (!petalContext) continue;
          petalContext.translate(80, 80);
          const r = 48 - ring * 9, count = 7 - Math.floor(ring / 2);
          for (let petal = 0; petal < count; petal++) {
            petalContext.save(); petalContext.rotate(petal * Math.PI * 2 / count + ring * 0.68);
            const fill = petalContext.createLinearGradient(0, -r - 20, 0, 15);
            fill.addColorStop(0, color("--primary")); fill.addColorStop(0.55, color("--blood-wet")); fill.addColorStop(1, color("--blood-deep"));
            petalContext.fillStyle = fill; petalContext.beginPath(); petalContext.moveTo(-r * 0.55, 0);
            petalContext.bezierCurveTo(-r * 1.05, -r * 1.2, r * 0.9, -r * 1.5, r * 0.65, -r * 0.3);
            petalContext.bezierCurveTo(r * 0.4, r * 0.3, -r * 0.2, r * 0.5, -r * 0.55, 0); petalContext.fill();
            petalContext.restore();
          }
          layers.push(layer); c.drawImage(layer, -80, -80);
        }
      }
      const count = kind === "bloom" ? 26 : kind === "coin" ? 18 : 32;
      const particles = kind === "bloom" ? roseLayout(w, h) : Array.from({ length: count }, (_, i) => {
        const t = i / count * Math.PI * 2;
        return { x: w / 2 + Math.cos(t) * (w * 0.47), y: h / 2 + Math.sin(t) * (h * 0.47),
          size: 28 + (i * 13 % 39), rotation: i * 2.4, delay: (i % 7) * 0.075, duration: 0.85 };
      });
      prepared.current = { sprite, layers, particles, w, h, paper: color("--paper") };
    };
    prepare(); const resize = new ResizeObserver(prepare); resize.observe(host);
    return () => resize.disconnect();
  }, [kind]);
  useEffect(() => {
    const canvas = ref.current, data = prepared.current, ctx = canvas?.getContext("2d");
    if (!active || !canvas || !ctx || !data) return;
    const { sprite, layers, particles, w, h, paper } = data;
    const cancel = playMotionCue(kind === "coin" ? "lock" : "reveal");
    let frame = 0; const start = performance.now(); canvas.dataset["phase"] = "playing";
    const draw = (now: number) => {
      const t = (now - start) / 1000; ctx.clearRect(0, 0, w, h);
      if (kind === "sword" && t < 0.65) {
        ctx.strokeStyle = paper; ctx.lineWidth = 2; ctx.globalAlpha = Math.max(0, 1 - t / 0.65);
        ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w * Math.min(1, t / 0.16), h * (0.7 - 0.4 * Math.min(1, t / 0.16))); ctx.stroke();
      } else if (kind !== "sword") for (const p of particles) {
        const age = t - p.delay; if (age < 0) continue;
        const bloom = Math.min(1, age / p.duration), fade = Math.max(0, 1 - Math.max(0, age - (kind === "bloom" ? p.duration + 1.8 : 2.4)) / 1.5);
        ctx.save(); ctx.globalAlpha = Math.min(1, age * 3) * fade;
        const falling = kind === "coin" || kind === "crush";
        ctx.translate(p.x, p.y + (falling ? age * age * 48 - 80 : 0));
        ctx.rotate(p.rotation + (falling ? age * 1.8 : 0));
        ctx.scale(kind === "coin" ? Math.max(0.12, Math.abs(Math.cos(age * 5 + p.rotation))) : kind === "bloom" ? 1 : bloom, kind === "bloom" ? 1 : bloom);
        if (kind === "crush") {
          ctx.fillStyle = paper; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.19, p.size * 0.07, 0, 0, Math.PI * 2); ctx.fill();
        } else if (kind === "bloom") {
          for (let ring = 0; ring < layers.length; ring++) {
            const open = Math.max(0, Math.min(1, (bloom - (4 - ring) * 0.09) / 0.64));
            const eased = open * open * (3 - 2 * open);
            const extent = p.size * (0.12 + 0.88 * eased);
            ctx.save(); ctx.globalAlpha *= Math.min(1, open * 3);
            const layer = layers[ring];
            if (layer) ctx.drawImage(layer, -extent / 2, -extent / 2, extent, extent);
            ctx.restore();
          }
        } else ctx.drawImage(sprite, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      if (t < (kind === "bloom" ? 11 : 4.5)) frame = requestAnimationFrame(draw);
      else { ctx.clearRect(0, 0, w, h); canvas.dataset["phase"] = "complete"; }
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); cancel(); };
  }, [active, kind]);
  return <canvas ref={ref} data-passage-effect={kind} data-phase="ready" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
}

/** Prepare before arrival; fire once inside the reader's central viewing band. */
export function PassageMoment({ kind, children, id }: { kind?: FxKind | undefined; children: ReactNode; id?: string }) {
  const target = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const near = useInView(target, { once: true, margin: "100% 0px 100% 0px" });
  const active = useInView(target, { once: true, margin: "-35% 0px -35% 0px" });
  return <div ref={target} id={id} data-passage-moment={kind} className={`relative flow-root ${kind === "bloom" ? "px-8 py-16 md:px-14" : ""}`}>
    {children}
    {near && kind && !reduced && (kind === "blood" || kind === "bigblood"
      ? <ExecutionSplash active={active} target={target} />
      : <GardenCanvas active={active} kind={kind} />)}
  </div>;
}