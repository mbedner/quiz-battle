export type SoundName =
  | 'correct' | 'wrong' | 'round_start'
  | 'attack_normal' | 'attack_power' | 'attack_ultimate'
  | 'ko' | 'victory' | 'emote';

// ── Low-level helpers ──────────────────────────────────────────

function note(
  ctx: AudioContext, freq: number, start: number,
  dur: number, vol: number, type: OscillatorType = 'square',
) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function sweep(
  ctx: AudioContext, freqFrom: number, freqTo: number,
  start: number, dur: number, vol: number, type: OscillatorType = 'square',
) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(freqTo, start + dur);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function noise(ctx: AudioContext, start: number, dur: number, vol: number) {
  const n   = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buf;
  src.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.start(start);
}

// ── Sound definitions ──────────────────────────────────────────

type SoundFn = (ctx: AudioContext, t: number, v: number) => void;

const SOUNDS: Record<SoundName, SoundFn> = {
  correct: (ctx, t, v) => {
    note(ctx, 523, t,        0.10, v * 0.7); // C5
    note(ctx, 659, t + 0.10, 0.10, v * 0.8); // E5
    note(ctx, 784, t + 0.20, 0.20, v);        // G5
  },

  wrong: (ctx, t, v) => {
    note(ctx, 369, t,        0.12, v * 0.7, 'sawtooth'); // F#4
    note(ctx, 277, t + 0.13, 0.18, v * 0.8, 'sawtooth'); // C#4
  },

  round_start: (ctx, t, v) => {
    note(ctx, 261, t,        0.10, v * 0.6); // C4
    note(ctx, 329, t + 0.09, 0.10, v * 0.7); // E4
    note(ctx, 392, t + 0.18, 0.10, v * 0.8); // G4
    note(ctx, 523, t + 0.28, 0.28, v);        // C5
  },

  attack_normal: (ctx, t, v) => {
    sweep(ctx, 700, 90, t, 0.14, v * 0.45);
    noise(ctx, t + 0.02, 0.08, v * 0.18);
  },

  attack_power: (ctx, t, v) => {
    sweep(ctx, 220, 40, t, 0.28, v * 0.55, 'square');
    noise(ctx, t, 0.14, v * 0.38);
    note(ctx, 110, t + 0.05, 0.22, v * 0.3);
  },

  attack_ultimate: (ctx, t, v) => {
    [523, 659, 784, 1047].forEach((f, i) =>
      note(ctx, f, t + i * 0.06, 0.10, v * 0.55),
    );
    noise(ctx, t + 0.22, 0.28, v * 0.5);
    sweep(ctx, 130, 30, t + 0.20, 0.50, v * 0.45);
  },

  ko: (ctx, t, v) => {
    note(ctx, 523, t,        0.16, v * 0.8); // C5
    note(ctx, 392, t + 0.20, 0.16, v * 0.7); // G4
    note(ctx, 329, t + 0.42, 0.16, v * 0.7); // E4
    note(ctx, 261, t + 0.65, 0.40, v);        // C4
    noise(ctx, t + 0.65, 0.25, v * 0.28);
  },

  victory: (ctx, t, v) => {
    const mel = [261, 329, 392, 523, 659, 523, 659, 784];
    mel.forEach((f, i) =>
      note(ctx, f, t + i * 0.10, i === mel.length - 1 ? 0.5 : 0.11, v * (i === mel.length - 1 ? 1 : 0.65)),
    );
  },

  emote: (ctx, t, v) => {
    note(ctx, 880,  t,        0.06, v * 0.35);
    note(ctx, 1047, t + 0.07, 0.06, v * 0.35);
  },
};

// ── Singleton ──────────────────────────────────────────────────

class SoundSystem {
  private ctx: AudioContext | null = null;
  muted: boolean;
  volume: number;

  constructor() {
    try {
      const raw = localStorage.getItem('bq_sound');
      const p   = raw ? JSON.parse(raw) : {};
      this.muted  = p.muted  ?? false;
      this.volume = p.volume ?? 0.35;
    } catch {
      this.muted  = false;
      this.volume = 0.35;
    }
  }

  private ctx_(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  play(name: SoundName) {
    if (this.muted) return;
    try {
      const ctx = this.ctx_();
      SOUNDS[name](ctx, ctx.currentTime, this.volume);
    } catch { /* AudioContext unavailable */ }
  }

  setMuted(m: boolean)  { this.muted  = m; this.save(); }
  setVolume(v: number)  { this.volume = v; this.save(); }

  private save() {
    try {
      localStorage.setItem('bq_sound', JSON.stringify({ muted: this.muted, volume: this.volume }));
    } catch { /* private browsing */ }
  }
}

export const sound = new SoundSystem();
