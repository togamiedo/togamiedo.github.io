// Synthesized sound effects (Web Audio), no audio files needed.
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noise(a: AudioContext, dur: number) {
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  return src;
}

/** Sharp katana slash: a sweeping filtered whoosh plus a metallic ring. */
export function playSlash(volume = 0.7) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const n = noise(a, 0.5);
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(600, t);
  bp.frequency.exponentialRampToValueAtTime(7000, t + 0.18);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  n.connect(bp).connect(g).connect(a.destination);
  n.start(t);
  n.stop(t + 0.5);

  [2600, 3900, 5200].forEach((f, i) => {
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const og = a.createGain();
    og.gain.setValueAtTime(0.0001, t + 0.12);
    og.gain.exponentialRampToValueAtTime((volume * 0.12) / (i + 1), t + 0.14);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(og).connect(a.destination);
    o.start(t + 0.12);
    o.stop(t + 1.2);
  });
}

/** Wax seal cracking. */
export function playCrack(volume = 0.5) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const n = noise(a, 0.12);
  const hp = a.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  const g = a.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  n.connect(hp).connect(g).connect(a.destination);
  n.start(t);
}
