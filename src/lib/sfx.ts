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
