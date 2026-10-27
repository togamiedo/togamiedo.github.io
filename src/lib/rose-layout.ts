export type RoseParticle = {
  x: number; y: number; size: number; rotation: number; delay: number; duration: number;
};

/** Keep every flower's full radius inside the reserved perimeter, away from prose. */
export function roseLayout(w: number, h: number): RoseParticle[] {
  return Array.from({ length: 26 }, (_, i) => {
    const side = i % 4;
    const jitter = ((i * 37 + 11) % 101) / 101;
    const size = side < 2 ? 26 + jitter * 22 : Math.min(w < 500 ? 22 : 36, 24 + jitter * 12);
    const radius = size / 2;
    const horizontal = (i * 0.61803398875 + 0.13) % 1;
    const vertical = (i * 0.41421356237 + 0.21) % 1;
    return {
      x: side < 2 ? radius + horizontal * Math.max(0, w - size) : side === 2 ? radius + 2 : w - radius - 2,
      y: side === 0 ? 28 + jitter * 8 : side === 1 ? h - 28 - jitter * 8 : 64 + vertical * Math.max(0, h - 128),
      size, rotation: i * 2.39996, delay: jitter * 3.2, duration: 2.2 + ((i * 19) % 17) / 10,
    };
  });
}