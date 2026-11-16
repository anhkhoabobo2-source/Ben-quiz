import type { SoundCue } from './boneRig';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public unlock(): void {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private jitter(): number {
    return 0.94 + Math.random() * 0.12;
  }

  public play(cue: SoundCue): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const j = this.jitter();

    switch (cue) {
      case 'yes':
        this.playFormantBark(ctx, now, 195 * j, 275 * j, 0.14);
        this.playFormantBark(ctx, now + 0.12, 235 * j, 340 * j, 0.16);
        break;
      case 'no':
        this.playFormantBark(ctx, now, 170 * j, 118 * j, 0.24);
        break;
      case 'hohoho':
        this.playFormantBark(ctx, now, 145 * j, 170 * j, 0.11);
        this.playFormantBark(ctx, now + 0.13, 155 * j, 185 * j, 0.11);
        this.playFormantBark(ctx, now + 0.26, 165 * j, 200 * j, 0.14);
        break;
      case 'ugh':
        this.playFormantBark(ctx, now, 130 * j, 102 * j, 0.22);
        break;
      case 'boop':
        this.playTone(ctx, now, 'sine', 420 * j, 760 * j, 0.09, 0.22);
        this.playTone(ctx, now + 0.05, 'triangle', 680 * j, 360 * j, 0.08, 0.14);
        break;
      case 'slap':
        this.playNoiseBurst(ctx, now, 0.075, 1600, 0.26);
        this.playTone(ctx, now + 0.02, 'triangle', 520 * j, 820 * j, 0.12, 0.18);
        break;
      case 'earFlop':
        this.playTone(ctx, now, 'sine', 220 * j, 490 * j, 0.14, 0.18);
        this.playTone(ctx, now + 0.09, 'sine', 380 * j, 260 * j, 0.12, 0.14);
        break;
      case 'footTap':
        this.playTone(ctx, now, 'triangle', 145 * j, 62 * j, 0.11, 0.28);
        this.playNoiseBurst(ctx, now, 0.04, 420, 0.14);
        break;
      case 'tickle':
        this.playTone(ctx, now, 'sine', 340 * j, 520 * j, 0.08, 0.15);
        this.playTone(ctx, now + 0.08, 'sine', 440 * j, 620 * j, 0.08, 0.15);
        break;
      case 'correct':
        this.playTone(ctx, now, 'triangle', 523.25, 523.25, 0.14, 0.16);
        this.playTone(ctx, now + 0.09, 'triangle', 659.25, 659.25, 0.16, 0.16);
        this.playTone(ctx, now + 0.18, 'triangle', 783.99, 783.99, 0.24, 0.18);
        break;
      case 'wrong':
        this.playTone(ctx, now, 'sawtooth', 260, 220, 0.18, 0.1);
        this.playTone(ctx, now + 0.16, 'sawtooth', 210, 155, 0.28, 0.1);
        break;
      case 'victory': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          this.playTone(ctx, now + idx * 0.09, 'triangle', freq, freq, 0.24, 0.16);
        });
        break;
      }
      case 'click':
        this.playTone(ctx, now, 'sine', 640 * j, 480 * j, 0.04, 0.08);
        break;
    }
  }

  private playTone(
    ctx: AudioContext,
    startTime: number,
    type: OscillatorType,
    startFreq: number,
    endFreq: number,
    duration: number,
    peakGain: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), startTime + duration);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private playFormantBark(
    ctx: AudioContext,
    startTime: number,
    startPitch: number,
    endPitch: number,
    duration: number
  ): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(startPitch, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endPitch), startTime + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(680, startTime);
    filter.frequency.linearRampToValueAtTime(1150, startTime + duration * 0.6);
    filter.Q.value = 3.2;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.24, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private playNoiseBurst(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    cutoffHz: number,
    peakGain: number
  ): void {
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffHz, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(startTime);
    src.stop(startTime + duration + 0.01);
  }
}

export const soundEngine = new SoundEngine();
