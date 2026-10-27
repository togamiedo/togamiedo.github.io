import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { playMotionCue, playSplash } from "@/lib/sfx";

/** A brief lens-level liquid spray; no figures or generated imagery. */
export function ExecutionSplash() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    el.width = w * dpr; el.height = h * dpr;
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const blood = css.getPropertyValue("--blood-wet").trim();
    const dark = css.getPropertyValue("--blood-deep").trim();
    const shine = css.getPropertyValue("--blood-glint").trim();
    const steel = css.getPropertyValue("--paper").trim();
    const cancelSound = playMotionCue("cut");
    let splashPlayed = false;
    let seed = 1937;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const drops = Array.from({ length: 175 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const x = w * (side < 0 ? 0.13 : 0.86) + (rand() - 0.5) * w * 0.28;
      const y = h * (side < 0 ? 0.62 : 0.26) + (rand() - 0.5) * h * 0.45;
      const r = i < 35 ? 12 + rand() * Math.min(w * 0.045, 58) : 1.5 + rand() * 9;
      return { x, y, r, angle: rand() * Math.PI, delay: rand() * 0.19,
        drift: 20 + rand() * 100, outline: Array.from({ length: 14 }, () => 0.65 + rand() * 0.55) };
    });
    const started = performance.now();
    let frame = 0;
    const paint = (now: number) => {
      const t = (now - started) / 1000;
      ctx.clearRect(0, 0, w, h);
      if (t > 0.15 && !splashPlayed) { playSplash(0.12); splashPlayed = true; }
      const fade = t < 2.1 ? 1 : Math.max(0, 1 - (t - 2.1) / 1.1);
      if (t < 0.55) {
        const sweep = Math.min(1, t / 0.18);
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 0.22) / 0.3);
        ctx.strokeStyle = steel; ctx.lineWidth = 2.5; ctx.shadowColor = steel; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(-w * 0.1, h * 0.82);
        ctx.lineTo(-w * 0.1 + w * 1.2 * sweep, h * 0.82 - h * 0.64 * sweep); ctx.stroke(); ctx.restore();
      }
      for (const d of drops) {
        const age = t - 0.12 - d.delay;
        if (age <= 0) continue;
        const impact = Math.min(1, age / 0.16);
        const x = d.x + (1 - impact) * (w * 0.5 - d.x) * 0.18;
        const y = d.y + Math.max(0, age - 0.3) ** 1.65 * d.drift * 0.17;
        ctx.save(); ctx.globalAlpha = fade * Math.min(1, age * 16);
        ctx.translate(x, y); ctx.rotate(d.angle); ctx.scale(impact, impact * 0.72);
        const liquid = ctx.createRadialGradient(-d.r * 0.25, -d.r * 0.35, 0, 0, 0, d.r * 1.2);
        liquid.addColorStop(0, blood); liquid.addColorStop(0.65, blood); liquid.addColorStop(1, dark);
        ctx.fillStyle = liquid;
        ctx.beginPath();
        d.outline.forEach((radius, i) => {
          const a = (i / d.outline.length) * Math.PI * 2;
          const px = Math.cos(a) * d.r * radius, py = Math.sin(a) * d.r * radius;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha *= 0.4; ctx.fillStyle = shine;
        ctx.beginPath(); ctx.ellipse(-d.r * 0.24, -d.r * 0.36, d.r * 0.22, Math.max(0.6, d.r * 0.055), -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (d.r > 25 && age > 0.35) {
          ctx.save(); ctx.globalAlpha = fade * 0.85; ctx.strokeStyle = dark;
          ctx.lineWidth = Math.max(2, d.r * 0.09); ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 2, y + Math.min(100, (age - 0.35) * d.drift)); ctx.stroke(); ctx.restore();
        }
      }
      if (t < 3.2) frame = requestAnimationFrame(paint);
      else el.dataset["phase"] = "complete";
    };
    frame = requestAnimationFrame(paint);
    return () => { cancelAnimationFrame(frame); cancelSound(); };
  }, []);
  return createPortal(<canvas ref={canvas} aria-hidden="true" data-execution-splash data-phase="playing" className="pointer-events-none fixed inset-0 z-[90] h-dvh w-screen" />, document.body);
}