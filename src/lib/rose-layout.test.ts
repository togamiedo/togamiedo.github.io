import { describe, expect, it } from "vitest";
import { roseLayout } from "./rose-layout";

describe("weapon rose perimeter", () => {
  for (const [w, h, gutter] of [[342, 420, 32], [600, 350, 56]]) {
    it(`keeps the complete bloom outside prose at ${w}px`, () => {
      for (const p of roseLayout(w, h)) {
        const r = p.size / 2;
        expect(p.x + r <= gutter || p.x - r >= w - gutter || p.y + r <= 64 || p.y - r >= h - 64).toBe(true);
        expect(p.x - r).toBeGreaterThanOrEqual(0);
        expect(p.x + r).toBeLessThanOrEqual(w);
      }
    });
  }
  it("opens slowly with varied delays and durations", () => {
    const roses = roseLayout(600, 350);
    expect(Math.min(...roses.map(p => p.duration))).toBeGreaterThanOrEqual(2.2);
    expect(new Set(roses.map(p => p.delay)).size).toBeGreaterThan(20);
    expect(new Set(roses.map(p => p.duration)).size).toBeGreaterThan(10);
  });
});