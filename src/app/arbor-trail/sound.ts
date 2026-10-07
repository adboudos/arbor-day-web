// Tiny Web Audio sound effects for The Arbor Day Trail. No assets, all
// synthesized. Mute preference persists in localStorage.

const MUTE_KEY = "arbor-trail-muted";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (isMuted()) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  return ctx;
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {
    // ignore
  }
  if (m && ctx) {
    void ctx.suspend().catch(() => undefined);
  } else if (!m && ctx) {
    void ctx.resume().catch(() => undefined);
  }
}

function tone(
  freq: number,
  dur = 0.09,
  type: OscillatorType = "square",
  vol = 0.04,
  delay = 0
): void {
  const c = ac();
  if (!c) return;
  try {
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    // audio is decorative, never break the game
  }
}

export const sfx = {
  click() {
    tone(660, 0.05, "square", 0.03);
  },
  event() {
    tone(392, 0.08, "square", 0.04);
    tone(523, 0.1, "square", 0.04, 0.09);
  },
  toast() {
    tone(523, 0.08, "triangle", 0.05);
    tone(659, 0.08, "triangle", 0.05, 0.09);
    tone(784, 0.14, "triangle", 0.05, 0.18);
  },
  hit() {
    tone(880, 0.07, "square", 0.05);
    tone(1174, 0.1, "square", 0.04, 0.07);
  },
  miss() {
    tone(220, 0.12, "sawtooth", 0.04);
  },
  coin() {
    tone(988, 0.06, "square", 0.04);
    tone(1319, 0.12, "square", 0.04, 0.06);
  },
  step() {
    tone(196, 0.04, "triangle", 0.02);
  },
  win() {
    const notes = [523, 659, 784, 1046, 784, 1046];
    notes.forEach((n, i) => tone(n, 0.12, "square", 0.05, i * 0.11));
  },
  lose() {
    const notes = [392, 370, 349, 311];
    notes.forEach((n, i) => tone(n, 0.18, "sawtooth", 0.04, i * 0.16));
  },
};
