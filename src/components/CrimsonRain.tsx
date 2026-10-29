import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

type Drop = { x: number; y: number; depth: number; speed: number; length: number };
type Splash = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };
type WetMark = { x: number; y: number; age: number; size: number };
type PaperMark = WetMark & { half: number; spread: number; tilt: number };
type PaperSurface = { x: number; y: number; width: number; height: number };

/** Cached shutter-length streaks, wax collisions, and absorbent paper-face impacts. */
export function CrimsonRain({ sealRef, paperRefs, breaking }: {
  sealRef: RefObject<HTMLDivElement | null>;
  paperRefs: readonly RefObject<HTMLDivElement | null>[];
  breaking: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const breakingRef = useRef(breaking);
  useEffect(() => { breakingRef.current = breaking; }, [breaking]);

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
    const paperMarks: PaperMark[] = [];
    let papers: PaperSurface[] = [];
    const css = getComputedStyle(canvas);
    const wet = css.getPropertyValue("--blood-wet").trim();
    const glint = css.getPropertyValue("--rain-glint").trim();
    const deep = css.getPropertyValue("--blood-deep").trim();
    const absorbed = css.getPropertyValue("--paper-rain-stain").trim();
    const stainSprite = document.createElement("canvas");
    stainSprite.width = 64; stainSprite.height = 80;
    const stainPaint = stainSprite.getContext("2d");
    if (stainPaint) {
      const soak = stainPaint.createRadialGradient(32, 34, 2, 32, 34, 24);
      soak.addColorStop(0, wet); soak.addColorStop(0.23, absorbed); soak.addColorStop(0.65, absorbed); soak.addColorStop(1, "transparent");
      stainPaint.fillStyle = soak;
      stainPaint.beginPath();
      for (let i = 0; i < 24; i++) {
        const angle = i / 24 * Math.PI * 2;
        const radius = 17 + Math.sin(i * 4.7) * 4;
        const x = 32 + Math.cos(angle) * radius;
        const y = 34 + Math.sin(angle) * radius * 1.2;
        if (i === 0) stainPaint.moveTo(x, y); else stainPaint.lineTo(x, y);
      }
      stainPaint.closePath(); stainPaint.fill();
      stainPaint.strokeStyle = absorbed; stainPaint.globalAlpha = 0.16;
      for (let i = 0; i < 28; i++) {
        const angle = i * 2.399;
        const radius = 13 + i % 7;
        stainPaint.beginPath();
        stainPaint.moveTo(32 + Math.cos(angle) * radius, 34 + Math.sin(angle) * radius * 1.2);
        stainPaint.lineTo(32 + Math.cos(angle) * (radius + 4), 34 + Math.sin(angle) * (radius + 4) * 1.2);
        stainPaint.stroke();
      }
    }
    // A reusable rounded wet bead: dark meniscus, saturated body, soft reflected sky.
    const beadSprite = document.createElement("canvas");
    beadSprite.width = 48; beadSprite.height = 64;
    const beadPaint = beadSprite.getContext("2d");
    if (beadPaint) {
      const body = beadPaint.createRadialGradient(20, 25, 1, 24, 32, 19);
      body.addColorStop(0, wet); body.addColorStop(0.6, wet); body.addColorStop(1, deep);
      beadPaint.fillStyle = body;
      beadPaint.beginPath(); beadPaint.ellipse(24, 32, 13, 18, -0.12, 0, Math.PI * 2); beadPaint.fill();
      beadPaint.globalAlpha = 0.65;
      beadPaint.strokeStyle = glint; beadPaint.lineWidth = 1.6; beadPaint.lineCap = "round";
      beadPaint.beginPath(); beadPaint.ellipse(24, 31, 9, 13, -0.12, Math.PI * 1.05, Math.PI * 1.42); beadPaint.stroke();
    }
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
    const measurePaper = () => {
      papers = paperRefs.map((ref) => {
        const rect = ref.current?.getBoundingClientRect();
        return rect ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : { x: 0, y: 0, width: 0, height: 0 };
      });
    };
    const insideHalf = (x: number, y: number, half: number) => {
      const cut = 0.53 - x * 0.06;
      return x > 0.015 && x < 0.985 && y > 0.008 && y < 0.992 && (half === 0 ? y < cut : y > cut);
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
      measurePaper();
      drops = Array.from({ length: Math.min(310, Math.max(140, Math.round(width * height / 4700))) }, (_, i) => {
        const depth = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
        const drop = { x: 0, y: 0, depth, speed: 620 + depth * 340 + Math.random() * 220, length: 24 + depth * 27 + Math.random() * 25 };
        reset(drop, true);
        return drop;
      });
    };
    const impact = (x: number, y: number, paper = false) => {
      if (splashes.length > 130) return;
      if (!paper) marks.push({ x: x - seal.x, y: y - seal.y, age: 0, size: 1.2 + Math.random() * 2 });
      if (marks.length > 30) marks.shift();
      for (let i = 0; i < (paper ? 3 : 6); i++) {
        splashes.push({ x, y, vx: (Math.random() - 0.5) * 135, vy: -35 - Math.random() * 100,
          age: 0, life: 0.25 + Math.random() * 0.3, size: 0.6 + Math.random() * 1.2 });
      }
    };
    const draw = (time: number) => {
      if (!running) return;
      const dt = last ? Math.min((time - last) / 1000, 0.035) : 0;
      last = time;
      ctx.clearRect(0, 0, width, height);
      if (breakingRef.current) { measureSeal(); measurePaper(); }
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
        if (!hit && !reduced && drop.depth > 0 && Math.random() < dt * 2.4) {
          for (let half = 0; half < papers.length; half++) {
            const paper = papers[half];
            if (!paper || !paper.width || !paper.height) continue;
            const x = (drop.x - paper.x) / paper.width;
            const y = (drop.y - paper.y) / paper.height;
            if (!insideHalf(x, y, half)) continue;
            paperMarks.push({ x, y, half, age: 0, size: 1.2 + Math.random() * 1.7, spread: 0.65 + Math.random() * 0.8, tilt: (Math.random() - 0.5) * 0.7 });
            if (paperMarks.length > 70) paperMarks.shift();
            impact(drop.x, drop.y, true);
            hit = true;
            break;
          }
        }
        if (hit || drop.y > height + drop.length) { reset(drop); continue; }
        ctx.globalAlpha = reduced ? 0.12 : drop.depth === 2 ? 0.58 : drop.depth === 1 ? 0.42 : 0.2;
        const w = drop.depth === 2 ? 13 : 7;
        const sprite = sprites[drop.depth];
        if (sprite) ctx.drawImage(sprite, drop.x - w * 0.66, drop.y - drop.length, w, drop.length);
      }
      // Small translucent feathered stains soak into the moving paper halves.
      for (let half = 0; half < papers.length; half++) {
        const paper = papers[half];
        if (!paper || !paper.width || !paper.height) continue;
        ctx.save();
        ctx.translate(paper.x, paper.y);
        ctx.beginPath();
        if (half === 0) {
          ctx.moveTo(0, 0); ctx.lineTo(paper.width, 0); ctx.lineTo(paper.width, paper.height * 0.47); ctx.lineTo(0, paper.height * 0.53);
        } else {
          ctx.moveTo(0, paper.height * 0.53); ctx.lineTo(paper.width, paper.height * 0.47); ctx.lineTo(paper.width, paper.height); ctx.lineTo(0, paper.height);
        }
        ctx.closePath(); ctx.clip();
        for (const mark of paperMarks) {
          if (mark.half !== half) continue;
          mark.age += dt;
          const x = mark.x * paper.width;
          const y = mark.y * paper.height;
          const absorbedAmount = 1 - Math.exp(-mark.age * 1.6);
          const radius = mark.size * (1 + absorbedAmount * mark.spread);
          const fade = Math.min(1, (12 - mark.age) / 3);
          ctx.save(); ctx.translate(x, y); ctx.rotate(mark.tilt);
          ctx.globalAlpha = absorbedAmount * fade * 0.34;
          ctx.drawImage(stainSprite, -radius * 1.7, -radius * 2, radius * 3.4, radius * 4);
          // A fresh raised drop gently flattens and loses its highlight as it soaks in.
          const wetness = Math.exp(-mark.age * 0.9);
          ctx.globalAlpha = wetness * 0.85;
          const beadSize = mark.size * (1 + absorbedAmount * 0.35);
          ctx.drawImage(beadSprite, -beadSize, -beadSize * 1.3, beadSize * 2, beadSize * 2.6);
          if (mark.size > 2.2) {
            ctx.globalAlpha = wetness * 0.35;
            ctx.strokeStyle = wet; ctx.lineWidth = mark.size * 0.35;
            ctx.beginPath(); ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(0.5, mark.age * 2, 0.4, Math.min(mark.age * 3, 7)); ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
      }
      for (let i = paperMarks.length - 1; i >= 0; i--) {
        if ((paperMarks[i]?.age ?? 0) > 12) paperMarks.splice(i, 1);
      }
      // Wet beads cling to the wax rather than accumulating over the notice's text.
      ctx.save();
      ctx.beginPath();
      ctx.arc(seal.x, seal.y, seal.radius, 0, Math.PI * 2);
      ctx.clip();
      for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i];
        if (!mark) continue;
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
        if (!p) continue;
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
  }, [sealRef, paperRefs, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" data-crimson-rain className="pointer-events-none absolute inset-0 z-20 h-full w-full" />;
}