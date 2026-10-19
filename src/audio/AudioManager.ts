/**
 * Small synthesized sound set (no asset files). Every cue has a visual counterpart, so the game
 * is fully playable muted. The AudioContext is created on the first user gesture.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private volume = 0.7;
  private muted = false;
  private lastWarn = 0;
  private lastEat = 0;

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyVolume();
    } catch {
      this.ctx = null;
    }
  }

  setVolume(volume: number, muted: boolean): void {
    this.volume = volume;
    this.muted = muted;
    this.applyVolume();
  }

  private applyVolume(): void {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume * 0.6, this.ctx.currentTime, 0.02);
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0, slideTo?: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Bigger prey makes a lower, fuller gulp. */
  eat(preySize: number): void {
    const now = performance.now();
    if (now - this.lastEat < 40) return;
    this.lastEat = now;
    const f = Math.max(140, 700 - preySize * 6);
    this.tone(f, 0.12, 'sine', 0.35, 0, f * 0.55);
  }

  nibble(): void {
    const now = performance.now();
    if (now - this.lastEat < 60) return;
    this.lastEat = now;
    this.tone(900 + Math.random() * 300, 0.05, 'triangle', 0.12);
  }

  golden(): void {
    [880, 1175, 1568, 2093].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.22, i * 0.06));
  }

  grow(): void {
    [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.22, 'sine', 0.25, i * 0.08));
  }

  dash(): void {
    this.tone(260, 0.18, 'sawtooth', 0.08, 0, 680);
  }

  /** Heartbeat thump, rate-limited and faster when danger is higher. */
  warn(level: number): void {
    const now = performance.now();
    if (now - this.lastWarn < 900 - level * 450) return;
    this.lastWarn = now;
    this.tone(70, 0.14, 'sine', 0.5 * level + 0.15, 0, 50);
    this.tone(62, 0.12, 'sine', 0.35 * level + 0.1, 0.16, 45);
  }

  gameOver(): void {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.25, i * 0.14));
  }

  reward(big: boolean): void {
    const notes = big ? [523, 659, 784, 1047, 1319, 1568] : [523, 659, 784, 1047];
    notes.forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.25, i * 0.09));
  }

  click(): void {
    this.tone(660, 0.05, 'square', 0.06);
  }

  /** Gentle filtered-noise ocean bed. */
  startAmbient(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.ambient) return;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.35, ctx.currentTime, 1);
    src.connect(lp).connect(gain).connect(this.master);
    src.start();
    this.ambient = { src, gain };
  }

  stopAmbient(): void {
    if (!this.ambient || !this.ctx) return;
    const { src, gain } = this.ambient;
    gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    src.stop(this.ctx.currentTime + 1.5);
    this.ambient = null;
  }
}
