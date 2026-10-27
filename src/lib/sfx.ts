// Soft synthesized sound effects (Web Audio) + background music.
import music from "@/assets/shika-no-tone.mp3.asset.json";

let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noise(a: AudioContext, dur: number) {
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  return src;
}

/** Soft, airy katana swish: low-passed noise sweep, no harsh highs. */
export function playSlash(volume = 0.25) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const n = noise(a, 0.45);
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(2200, t + 0.16);
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.4);
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3000;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.1);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  n.connect(bp).connect(lp).connect(g).connect(a.destination);
  n.start(t);
  n.stop(t + 0.45);
}

/** Small wet blood splash: a soft thud plus a short spray of filtered noise. */
export function playSplash(volume = 0.18) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  const og = a.createGain();
  og.gain.setValueAtTime(volume * 0.8, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.connect(og).connect(a.destination);
  o.start(t);
  o.stop(t + 0.16);
  const n = noise(a, 0.35);
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(1800, t);
  bp.frequency.exponentialRampToValueAtTime(500, t + 0.3);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  n.connect(bp).connect(g).connect(a.destination);
  n.start(t + 0.01);
}

/** Muffled wax crack. */
export function playCrack(volume = 0.2) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const n = noise(a, 0.08);
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1400;
  const g = a.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  n.connect(lp).connect(g).connect(a.destination);
  n.start(t);
}

let bgm: HTMLAudioElement | null = null;
/** Rounded, stereo-moving textures. Returns cancellation for interrupted animations. */
export function playMotionCue(kind: "ink" | "cut" | "reveal" | "draw" | "lock") {
  const a = ac();
  if (!a) return () => {};
  const duration = kind === "draw" ? 1.15 : kind === "reveal" ? 0.75 : 0.45;
  const t = a.currentTime;
  const source = noise(a, duration);
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(kind === "lock" ? 400 : 650, t);
  filter.frequency.linearRampToValueAtTime(kind === "cut" || kind === "draw" ? 1900 : 950, t + duration * 0.4);
  filter.frequency.linearRampToValueAtTime(350, t + duration);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(kind === "cut" ? 0.11 : 0.07, t + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  const pan = a.createStereoPanner();
  pan.pan.setValueAtTime(kind === "lock" ? 0 : -0.65, t);
  pan.pan.linearRampToValueAtTime(kind === "lock" ? 0 : 0.65, t + duration);
  source.connect(filter).connect(gain).connect(pan).connect(a.destination);
  source.start(t);
  source.stop(t + duration);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); pan.disconnect(); };
  return () => { try { source.stop(); } catch { /* already ended */ } };
}

export function getMusic() {
  if (typeof window === "undefined") return null;
  if (!bgm) {
    bgm = new Audio(music.url);
    bgm.loop = true;
    bgm.volume = 0;
  }
  return bgm;
}

/** Start background music with a gentle fade-in. */
export function startMusic(target = 0.35) {
  const m = getMusic();
  if (!m) return;
  void m.play().catch(() => {});
  const id = setInterval(() => {
    m.volume = Math.min(target, m.volume + 0.02);
    if (m.volume >= target) clearInterval(id);
  }, 120);
}
