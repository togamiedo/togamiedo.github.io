import { useEffect, useRef } from "react";
import { playMotionCue, playSplash } from "@/lib/sfx";

type Drop = { x: number; y: number; vx: number; vy: number; r: number; delay: number; streak: number; drip: number; outline: number[] };

/**
 * Blood spray drawn on a canvas laid over the passage. Particles are prepared
 * ahead of time (mounted before the passage is reached) and only play when
 * `active` turns true, reducing work at the moment of impact.
 */
export function ExecutionSplash({ active, target }: { active: boolean; target: React.RefObject<HTMLElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const prepared = useRef<{ drops: Drop[]; w: number; h: number; ox: number; oy: number } | null>(null);

  // Prepare in the background while the reader is still scrolling towards it.
  useEffect(() => {
    const el = canvas.current, sentence = target.current;
    const host = el?.parentElement;
    if (!el || !sentence || !host) return;
    const prep = () => {
      const hb = host.getBoundingClientRect(), sb = sentence.getBoundingClientRect();
      const w = hb.width, h = hb.height;
      const dpr = Math.min(window.devicePixelRatio, 2);
      el.width = w * dpr; el.height = h * dpr;
      el.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Origin: where the cut lands, on the left part of the sentence.
      const ox = sb.left - hb.left + sb.width * 0.25, oy = sb.top - hb.top + sb.height * 0.45;
      let seed = 7919;
      const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const drops: Drop[] = [];
      for (let i = 0; i < 420; i++) {
        // Main jet sprays right and slightly up across the sentence; a minority scatters.
        const jet = i < 330;
        const ang = jet ? -0.35 + (rand() - 0.5) * 0.9 : rand() * Math.PI * 2;
        const speed = (jet ? 500 + rand() * 1400 : 120 + rand() * 500) * Math.min(1, w / 700 + 0.35);
        const big = rand() < 0.1;
        drops.push({
          x: ox + (rand() - 0.5) * 14, y: oy + (rand() - 0.5) * 10,
          vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
          r: big ? 5 + rand() * 9 : 0.7 + rand() ** 2 * 4,
          delay: rand() * 0.14, streak: 0.4 + rand() * 1.6, drip: big ? 30 + rand() * 90 : 0,
          outline: Array.from({ length: 10 }, () => 0.75 + rand() * 0.45),
        });
      }
      prepared.current = { drops, w, h, ox, oy };
    };
    prep();
    const ro = new ResizeObserver(prep);
    ro.observe(host);
    return () => ro.disconnect();
  }, [target]);

  useEffect(() => {
    const el = canvas.current, data = prepared.current;
    const ctx = el?.getContext("2d");
    if (!active || !el || !ctx || !data) return;
    const css = getComputedStyle(document.documentElement);
    const wet = css.getPropertyValue("--blood-wet").trim();
    const deep = css.getPropertyValue("--blood-deep").trim();
    const glint = css.getPropertyValue("--blood-glint").trim();
    const steel = css.getPropertyValue("--paper").trim();
    const { drops, w, h, ox, oy } = data;
    const cancelCut = playMotionCue("cut");
    let splashed = false, frame = 0;
    const start = performance.now();
    // Each drop flies, then sticks where it lands (on the text) and may drip.
    const landT = drops.map((d) => 0.06 + d.delay + 0.05 + (d.r > 4 ? 0.03 : 0.09) * Math.random());
    const paint = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      if (t > 0.07 && !splashed) { playSplash(0.14); splashed = true; }
      const fade = t < 3.2 ? 1 : Math.max(0, 1 - (t - 3.2) / 1.2);
      // Blade flash across the sentence.
      if (t < 0.4) {
        const k = Math.min(1, t / 0.09);
        ctx.save(); ctx.globalAlpha = 1 - Math.max(0, t - 0.12) / 0.28;
        ctx.strokeStyle = steel; ctx.lineWidth = 2; ctx.shadowColor = steel; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(ox - 260, oy + 70); ctx.lineTo(ox - 260 + 900 * k, oy + 70 - 240 * k); ctx.stroke(); ctx.restore();
      }
      ctx.globalAlpha = fade;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const landing = landT[i];
        if (!d || landing === undefined) continue;
        const age = t - 0.06 - d.delay;
        if (age <= 0) continue;
        const fly = Math.min(age, landing - 0.06 - d.delay);
        const x = d.x + d.vx * fly, y = d.y + d.vy * fly + 900 * fly * fly;
        const flying = age < landing - 0.06 - d.delay;
        const sp = Math.hypot(d.vx, d.vy + 1800 * fly) || 1;
        const dx = d.vx / sp, dy = (d.vy + 1800 * fly) / sp;
        if (flying) {
          // Motion streak while airborne.
          ctx.strokeStyle = wet; ctx.lineCap = "round"; ctx.lineWidth = d.r * 1.3;
          ctx.beginPath(); ctx.moveTo(x - dx * d.r * 6 * d.streak, y - dy * d.r * 6 * d.streak); ctx.lineTo(x, y); ctx.stroke();
          continue;
        }
        // Landed: elongated splat pointing along travel direction, darker rim, wet glint.
        const len = 1 + d.streak * 0.8;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx));
        const g = ctx.createRadialGradient(-d.r * 0.2, -d.r * 0.2, 0, 0, 0, d.r * len);
        g.addColorStop(0, wet); g.addColorStop(0.7, wet); g.addColorStop(1, deep);
        ctx.fillStyle = g;
        const points = d.outline.map((rr, j) => {
          const a = (j / d.outline.length) * Math.PI * 2;
          return { x: Math.cos(a) * d.r * rr * len, y: Math.sin(a) * d.r * rr };
        });
        const first = points[0], last = points.at(-1);
        if (!first || !last) { ctx.restore(); continue; }
        ctx.beginPath(); ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
        points.forEach((point, j) => {
          const next = points[(j + 1) % points.length];
          if (next) ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
        });
        ctx.closePath(); ctx.fill();
        // Tail droplets thrown forward from bigger splats.
        if (d.r > 3) { ctx.beginPath(); ctx.arc(d.r * len * 1.7, 0, d.r * 0.3, 0, Math.PI * 2); ctx.arc(d.r * len * 2.3, 0, d.r * 0.18, 0, Math.PI * 2); ctx.fill(); }
        if (d.r > 2.5) { ctx.globalAlpha = fade * 0.45; ctx.fillStyle = glint; ctx.beginPath(); ctx.ellipse(-d.r * 0.25, -d.r * 0.3, d.r * 0.3, d.r * 0.1, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = fade; }
        ctx.restore();
        // Slow drips running down from heavy drops.
        if (d.drip) {
          const run = Math.min(d.drip, Math.max(0, age - 0.5) * 28);
          if (run > 0) {
            ctx.strokeStyle = deep; ctx.lineWidth = d.r * 0.45; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + run); ctx.stroke();
            ctx.fillStyle = wet; ctx.beginPath(); ctx.arc(x, y + run, d.r * 0.4, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      if (t < 4.4) frame = requestAnimationFrame(paint);
      else { ctx.clearRect(0, 0, w, h); el.dataset["phase"] = "complete"; }
    };
    el.dataset["phase"] = "playing";
    frame = requestAnimationFrame(paint);
    return () => { cancelAnimationFrame(frame); cancelCut(); };
  }, [active]);

  return <canvas ref={canvas} aria-hidden="true" data-execution-splash data-phase="ready" className="pointer-events-none absolute -inset-x-6 inset-y-0 z-10 h-full w-[calc(100%+3rem)]" />;
}