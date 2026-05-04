/**
 * Background music manager.
 * Uses HTML Audio elements for .mp3 files.
 * music.play(src) is idempotent — won't restart if same track is already playing.
 */

class MusicSystem {
  private audio: HTMLAudioElement | null = null;
  private currentSrc = '';
  private pendingSrc = '';
  private interactionBound = false;
  muted: boolean;
  volume: number;

  constructor() {
    try {
      const raw = localStorage.getItem('bq_music');
      const p   = raw ? JSON.parse(raw) : {};
      this.muted  = p.muted  ?? false;
      this.volume = p.volume ?? 0.5;
    } catch {
      this.muted  = false;
      this.volume = 0.5;
    }
  }

  play(src: string) {
    if (this.currentSrc === src && this.audio && !this.audio.paused) return;
    this.stop();
    const a = new Audio(src);
    a.loop   = true;
    a.volume = this.muted ? 0 : Math.min(1, this.volume);
    a.play().catch(() => {
      // Browser blocked autoplay — queue src and retry on first user interaction
      this.pendingSrc = src;
      if (!this.interactionBound) {
        this.interactionBound = true;
        const retry = () => {
          document.removeEventListener('click',      retry);
          document.removeEventListener('keydown',    retry);
          document.removeEventListener('touchstart', retry);
          this.interactionBound = false;
          if (this.pendingSrc) {
            const s = this.pendingSrc;
            this.pendingSrc = '';
            this.play(s);
          }
        };
        document.addEventListener('click',      retry, { once: true });
        document.addEventListener('keydown',    retry, { once: true });
        document.addEventListener('touchstart', retry, { once: true });
      }
    });
    this.audio      = a;
    this.currentSrc = src;
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentSrc = '';
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.audio) this.audio.volume = m ? 0 : Math.min(1, this.volume);
    this.save();
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.audio && !this.muted) this.audio.volume = Math.min(1, v);
    this.save();
  }

  private save() {
    try { localStorage.setItem('bq_music', JSON.stringify({ muted: this.muted, volume: this.volume })); }
    catch { /* private browsing */ }
  }
}

export const music = new MusicSystem();

const ROUND_TRACKS = ['/music/round1.mp3', '/music/round2.mp3', '/music/round3.mp3'];

// Keep track of which random track was chosen for each high round number
const roundTrackCache = new Map<number, string>();

export function trackForRound(roundNumber: number): string {
  if (roundNumber >= 1 && roundNumber <= 3) return `/music/round${roundNumber}.mp3`;
  if (!roundTrackCache.has(roundNumber)) {
    roundTrackCache.set(roundNumber, ROUND_TRACKS[Math.floor(Math.random() * ROUND_TRACKS.length)]);
  }
  return roundTrackCache.get(roundNumber)!;
}

const battleTrackCache = new Map<number, string>();

export function trackForBattle(battleNumber: number): string {
  if (battleNumber >= 1 && battleNumber <= 3) return `/music/round${battleNumber}.mp3`;
  if (!battleTrackCache.has(battleNumber)) {
    battleTrackCache.set(battleNumber, ROUND_TRACKS[Math.floor(Math.random() * ROUND_TRACKS.length)]);
  }
  return battleTrackCache.get(battleNumber)!;
}
