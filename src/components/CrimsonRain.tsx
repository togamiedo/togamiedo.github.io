import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

type Drop = { x: number; y: number; depth: number; speed: number; length: number };
type Splash = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };
type WetMark = { x: number; y: number; age: number; size: number };

/** Shutter-length streaks at three focal depths; only foreground drops collide with the wax. */
export function CrimsonRain({ sealRef, breaking }: {
  sealRef: RefObject<HTMLDivElement | null>;
  breaking: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    let last = 0;
    let running = true;
    let seal = { x: 0, y: 0, radius: 0 };
    let drops: Drop[] = [];
    const splashes: Splash[] = [];
    const marks: WetMark[] = [];
    const css = getComputedStyle(canvas);
    const wet = css.getPropertyValue("--blood-wet").trim();
    const glint = css.getPropertyValue("--rain-glint").trim();
    const deep = css.getPropertyValue("--blood-deep").trim();
    const sprites = [0, 1, 2].map((depth) => {
      const sprite = document.createElement("canvas");
      sprite.width = 32;
      sprite.height = 160;
      const paint = sprite.getContext("2d");
      if (!paint) return sprite;
      // The broad translucent exposure surrounds a narrow wet, reflective core.
      const exposure = paint.createLinearGradient(0, 0, 0, 152);
      exposure.addColorStop(0, "transparent");
      exposure.addColorStop(0.5, deep);
      exposure.addColorStop(0.88, wet);
      exposure.addColorStop(1, glint);
      paint.strokeStyle = exposure;
      paint.lineCap = "round";
      paint.lineWidth = depth === 2 ? 3.4 : 1.7;
      paint.shadowColor = wet;
      paint.shadowBlur = depth === 2 ? 5 : 2;
      paint.beginPath();
      paint.moveTo(8, 5);
      paint.lineTo(21, 151);
      paint.stroke();
      paint.shadowBlur = 0;
      paint.globalAlpha = 0.65;
      paint.lineWidth = 0.7;
      paint.beginPath();
      paint.moveTo(19, 128);
      paint.lineTo(21, 151);
      paint.stroke();
      return sprite;
    });

    const measureSeal = () => {
      const rect = sealRef.current?.getBoundingClientRect();
      if (!rect) return;
      seal = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: Math.min(rect.width, rect.height) * 0.39 };
    };
    const reset = (drop: Drop, initial = false) => {
      drop.x = Math.random() * (width + 100) - 80;
      drop.y = initial ? Math.random() * height : -drop.length - Math.random() * 80;
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureSeal();
      drops = Array.from({ length: Math.min(310, Math.max(140, Math.round(width * height / 4700))) }, (_, i) => {
        const depth = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
        const drop = { x: 0, y: 0, depth, speed: 620 + depth * 340 + Math.random() * 220, length: 24 + depth * 27 + Math.random() * 25 };
        reset(drop, true);
        return drop;
      });
    };
    const impact = (x: number, y: number) => {
      if (splashes.length > 130) return;
      marks.push({ x: x - seal.x, y: y - seal.y, age: 0, size: 1.2 + Math.random() * 2 });
      if (marks.length > 30) marks.shift();
      for (let i = 0; i < 5; i++) {
        splashes.push({ x, y, vx: (Math.random() - 0.5) * 135, vy: -35 - Math.random() * 100,
          age: 0, life: 0.25 + Math.random() * 0.3, size: 0.6 + Math.random() * 1.2 });
      }
    };
    const draw = (time: number) => {
      if (!running) return;
      const dt = last ? Math.min((time - last) / 1000, 0.035) : 0;
      last = time;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      const gust = 0.065 + Math.sin(time * 0.00043) * 0.018;
      for (const drop of drops) {
        const oldY = drop.y;
        if (!reduced) {
          drop.y += drop.speed * dt;
          drop.x += drop.speed * gust * dt;
        }
        let hit = false;
        if (!reduced && drop.depth > 0 && seal.radius > 0) {
          const dx = drop.x - seal.x;
          if (Math.abs(dx) < seal.radius) {
            const surface = seal.y - Math.sqrt(seal.radius * seal.radius - dx * dx);
            if (oldY <= surface && drop.y >= surface) {
              impact(drop.x, surface);
              hit = true;
            }
          }
        }
        if (hit || drop.y > height + drop.length) { reset(drop); continue; }
        ctx.globalAlpha = reduced ? 0.12 : [0.2, 0.42, 0.58][drop.depth];
        const w = drop.depth === 2 ? 13 : 7;
        ctx.drawImage(sprites[drop.depth], drop.x - w * 0.66, drop.y - drop.length, w, drop.length);
      }
      // Wet beads cling to the wax rather than accumulating over the notice's text.
      ctx.save();
      ctx.beginPath();
      ctx.arc(seal.x, seal.y, seal.radius, 0, Math.PI * 2);
      ctx.clip();
      for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i];
        mark.age += dt;
        if (mark.age > 3.6) { marks.splice(i, 1); continue; }
        const x = seal.x + mark.x;
        const y = seal.y + mark.y + Math.min(mark.age * 7, 19);
        ctx.globalAlpha = Math.min(0.7, (3.6 - mark.age) * 0.35);
        ctx.strokeStyle = wet;
        ctx.lineWidth = mark.size;
        ctx.beginPath();
        ctx.moveTo(x, y - Math.min(mark.age * 6, 15));
        ctx.lineTo(x + 0.5, y);
        ctx.stroke();
        ctx.fillStyle = glint;
        ctx.globalAlpha *= 0.55;
        ctx.beginPath(); ctx.ellipse(x - 0.5, y, 0.5, 1.1, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      for (let i = splashes.length - 1; i >= 0; i--) {
        const p = splashes[i];
        p.age += dt;
        if (p.age > p.life) { splashes.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt;
        ctx.globalAlpha = (1 - p.age / p.life) * 0.8;
        ctx.strokeStyle = wet;
        ctx.lineWidth = p.size;
        ctx.beginPath(); ctx.moveTo(p.x - p.vx * 0.012, p.y - p.vy * 0.012); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = glint;
        ctx.globalAlpha *= 0.65;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      running = !document.hidden;
      if (running) { last = 0; frame = requestAnimationFrame(draw); }
    };
    resize();
    const observer = new ResizeObserver(measureSeal);
    if (sealRef.current) observer.observe(sealRef.current);
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [sealRef, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" data-crimson-rain className={`pointer-events-none absolute inset-0 z-20 h-full w-full transition-opacity duration-500 ${breaking ? "opacity-0" : "opacity-100"}`} />;
}