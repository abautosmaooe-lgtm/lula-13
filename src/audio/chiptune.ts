/**
 * Chiptune Sound and Music Synthesizer for Lulalá - Caminho da Estrela
 * Features 8-bit recreation of the famous "Lula-Lá" campaign anthem,
 * "Olê Olê Olá - Lula Lula", ABC Industrial Factory march, Planalto presidential march,
 * and retro platformer SFX.
 */

export type BGMTrack = 'title' | 'esperanca' | 'ole_lula' | 'abc' | 'boss';

export interface TrackMetadata {
  id: BGMTrack;
  title: string;
  subtitle: string;
  year: string;
  badge: string;
  description: string;
  tempo: number;
}

export const TRACK_LIST: TrackMetadata[] = [
  {
    id: 'title',
    title: 'Lula Lá (Brilha Uma Estrela)',
    subtitle: 'O hino histórico de esperança e união',
    year: '1989',
    badge: '★ CLÁSSICO',
    description: 'Trilha sonora oficial da campanha de 1989 ("Lula lá, brilha uma estrela, cresce a esperança...").',
    tempo: 135,
  },
  {
    id: 'ole_lula',
    title: 'Olê, Olê, Olê, Olá - Lula, Lula!',
    subtitle: 'Marcha festiva da vitória do povo',
    year: 'FESTIVAL',
    badge: '★ POPULAR',
    description: 'O coro inesquecível entoado pelos trabalhadores e multidões em praça pública!',
    tempo: 125,
  },
  {
    id: 'abc',
    title: 'ABC Metalúrgico (O Som da Fábrica)',
    subtitle: 'Greve dos metalúrgicos e o nascimento do novo Brasil',
    year: '1978',
    badge: '★ INDUSTRIAL',
    description: 'Batida rítmica industrial inspirada nas esteiras de montagem e assembleias de São Bernardo.',
    tempo: 130,
  },
  {
    id: 'esperanca',
    title: 'O Brasil da Esperança (Planalto)',
    subtitle: 'A chegada ao Palácio do Planalto',
    year: '2002',
    badge: '★ VITÓRIA',
    description: 'Melodia alegre e triunfal que celebra o povo brasileiro no poder.',
    tempo: 135,
  },
  {
    id: 'boss',
    title: 'Batalha Eleitoral (Boss Battle)',
    subtitle: 'Confronto decisivo contra o retrocesso',
    year: 'CONFRONTO',
    badge: '★ TENSÃO',
    description: 'Ritmo acelerado e tenso de 8-bits para os confrontos contra os chefões das fases!',
    tempo: 105,
  },
];

export interface AudioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTrack: BGMTrack | null;
  bgmVolume: number;
  sfxVolume: number;
  lockedTrack: BGMTrack | null;
}

class ChiptuneAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmVolume: number = 0.75;
  private sfxVolume: number = 0.8;
  private currentTrack: BGMTrack | null = null;
  private isPlaying: boolean = false;
  private lockedTrack: BGMTrack | null = null;
  private stepIndex: number = 0;
  private tempoTimer: number | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private listeners: Set<(state: AudioEngineState) => void> = new Set();

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public subscribe(callback: (state: AudioEngineState) => void) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch {
        // Safe listener execution
      }
    });
  }

  public getState(): AudioEngineState {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      lockedTrack: this.lockedTrack,
    };
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master gain node with dynamics compressor to prevent clipping
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      compressor.connect(this.ctx.destination);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(compressor);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.bgmVolume * 0.75,
        this.ctx.currentTime
      );
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.sfxVolume * 0.85,
        this.ctx.currentTime
      );
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlock() {
    this.initContext();
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    if (this.ctx) {
      if (this.bgmGain) {
        this.bgmGain.gain.setValueAtTime(
          this.isMuted ? 0 : this.bgmVolume * 0.75,
          this.ctx.currentTime
        );
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setValueAtTime(
          this.isMuted ? 0 : this.sfxVolume * 0.85,
          this.ctx.currentTime
        );
      }
    }
    this.notify();
    return this.isMuted;
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx && !this.isMuted) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume * 0.75, this.ctx.currentTime);
    }
    this.notify();
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx && !this.isMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume * 0.85, this.ctx.currentTime);
    }
    this.notify();
  }

  public lockCustomTrack(track: BGMTrack | null) {
    this.lockedTrack = track;
    if (track) {
      this.startMusic(track, true);
    }
    this.notify();
  }

  public isCustomTrackLocked(): boolean {
    return this.lockedTrack !== null;
  }

  public getCurrentTrack(): BGMTrack | null {
    return this.currentTrack;
  }

  public isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  // Frequency mapping for notes
  private noteFreq(note: string): number {
    const notes: Record<string, number> = {
      'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98
    };
    return notes[note] || 440;
  }

  // --- SOUND EFFECTS ---
  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playFly() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(540, t + 0.1);
    osc.frequency.linearRampToValueAtTime(400, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playSpeech() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.25, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.12);
    });
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.setValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playCard() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.3, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.1);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.1);
    });
  }

  public playPovoFeliz() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.35, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.16);
    });

    this.speakVoice('O povo feliz!');
  }

  public playStarJingle() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const starNotes = [
      { f: 392.0, dur: 0.14 },
      { f: 523.25, dur: 0.18 },
      { f: 493.88, dur: 0.14 },
      { f: 523.25, dur: 0.16 },
      { f: 587.33, dur: 0.16 },
      { f: 523.25, dur: 0.16 },
      { f: 392.0, dur: 0.22 },
      { f: 523.25, dur: 0.35 },
    ];

    let offset = 0;
    starNotes.forEach(({ f, dur }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + offset);
      gain.gain.setValueAtTime(0.32, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + dur);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + offset);
      osc.stop(t + offset + dur);
      offset += dur * 0.85;
    });

    setTimeout(() => {
      this.speakVoice('Brilha uma estrela! Faz o L!');
    }, 450);
  }

  public playWaterStream() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
  }

  public playExtinguishFire() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  public playPowerDown() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Classic 8-bit descending power-down warble
    const notes = [587.33, 493.88, 392.0, 329.63, 261.63, 196.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.045);
      gain.gain.setValueAtTime(0.28, t + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.045 + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.045);
      osc.stop(t + idx * 0.045 + 0.08);
    });
  }

  public playSpikeHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Metallic clang + sharp hurt impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.16);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playSpinDash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Sonic-style fast rising spindash revving sound!
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.22);

    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playMusclePunch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.2);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playEarthquake() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public speakVoice(phrase: string) {
    if (this.isMuted) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.15;
        utterance.pitch = 1.05;
        utterance.volume = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Graceful fallback
    }
  }

  public playPicanha() {
    this.playPovoFeliz();
  }

  public playStomp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playBump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playPowerup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [330, 392, 494, 587, 659, 784, 988, 1175];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.28, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.08);
    });
  }

  public playHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playStageClear() {
    this.pauseMusic();
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const fanfare = [
      { note: 'G4', dur: 0.12 },
      { note: 'C5', dur: 0.16 },
      { note: 'B4', dur: 0.16 },
      { note: 'C5', dur: 0.16 },
      { note: 'D5', dur: 0.24 },
      { note: 'C5', dur: 0.48 },
    ];
    let offset = 0;
    fanfare.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(this.noteFreq(n.note), t + offset);
      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + n.dur);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + offset);
      osc.stop(t + offset + n.dur);
      offset += n.dur;
    });

    setTimeout(() => {
      if (this.currentTrack) {
        this.resumeMusic();
      }
    }, 2800);
  }

  public playBossHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playBossDefeat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [659, 587, 523, 440, 392, 330, 261];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.4, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.16);
    });
  }

  // --- BACKGROUND MUSIC ENGINE ---

  /**
   * Starts playing a soundtrack track. If lockedTrack is active, preserves locked track.
   */
  public startMusic(track: BGMTrack, forceOverride: boolean = false) {
    const targetTrack = !forceOverride && this.lockedTrack ? this.lockedTrack : track;

    if (this.currentTrack === targetTrack && this.isPlaying) return;

    this.stopMusicTimer();
    this.initContext();
    this.currentTrack = targetTrack;
    this.isPlaying = true;
    this.stepIndex = 0;

    const meta = TRACK_LIST.find((t) => t.id === targetTrack);
    const tempoMs = meta ? meta.tempo : 135;

    this.tempoTimer = window.setInterval(() => {
      this.playMusicStep(targetTrack);
    }, tempoMs);

    this.notify();
  }

  public pauseMusic() {
    this.stopMusicTimer();
    this.isPlaying = false;
    this.notify();
  }

  public resumeMusic() {
    if (this.currentTrack) {
      this.startMusic(this.currentTrack, true);
    } else {
      this.startMusic('title', true);
    }
  }

  public toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }
  }

  public stopMusic() {
    this.stopMusicTimer();
    this.isPlaying = false;
    this.currentTrack = null;
    this.notify();
  }

  private stopMusicTimer() {
    if (this.tempoTimer !== null) {
      clearInterval(this.tempoTimer);
      this.tempoTimer = null;
    }
  }

  private playMusicStep(track: BGMTrack) {
    if (!this.ctx || !this.bgmGain) {
      this.stepIndex++;
      return;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isMuted) {
      this.stepIndex++;
      return;
    }

    const t = this.ctx.currentTime;

    if (track === 'title' || track === 'esperanca') {
      // 8-Bit Chiptune recreation of the iconic "Lula-Lá" campaign anthem!
      // "Lula lá, brilha uma estrela / Lula lá, cresce a esperança..."
      const melody: (string | null)[] = [
        // Measure 1 & 2: "Lula lá, brilha uma estrela"
        'G4', null, 'C5', null, 'B4', 'C5', 'D5', null,
        'C5', null, 'G4', null, null, null, 'G4', null,
        // Measure 3 & 4: "Lula lá, cresce a esperança"
        'E5', null, 'D5', null, 'C5', null, 'D5', 'E5',
        'D5', null, null, null, 'G4', null, null, null,
        // Measure 5 & 6: "Lula lá, o Brasil criança"
        'G4', null, 'C5', null, 'B4', 'C5', 'D5', null,
        'E5', null, 'F5', null, 'G5', null, null, null,
        // Measure 7 & 8: "Na alegria de se abraçar!"
        'F5', null, 'E5', null, 'D5', null, 'C5', null,
        'D5', null, 'B4', null, 'C5', null, null, null,

        // Chorus Bridge: "Lula lá, é a nossa voz!"
        'C5', 'C5', 'E5', null, 'G5', null, 'G5', 'F5',
        'E5', null, 'D5', null, 'C5', null, null, null,
        'D5', 'D5', 'F5', null, 'A5', null, 'A5', 'G5',
        'F5', null, 'E5', null, 'D5', null, 'G4', null,

        // Return to Theme: "Sem medo de ser feliz!"
        'G4', null, 'C5', null, 'B4', 'C5', 'D5', null,
        'E5', null, 'G5', null, 'C6', null, null, null,
        'F5', null, 'E5', null, 'D5', null, 'B4', null,
        'C5', null, 'C5', null, null, null, null, null,
      ];

      const harmony: (string | null)[] = [
        'E4', null, 'G4', null, 'G4', 'A4', 'B4', null,
        'G4', null, 'E4', null, null, null, 'E4', null,
        'C5', null, 'B4', null, 'A4', null, 'B4', 'C5',
        'B4', null, null, null, 'E4', null, null, null,
        'E4', null, 'G4', null, 'G4', 'A4', 'B4', null,
        'C5', null, 'D5', null, 'E5', null, null, null,
        'D5', null, 'C5', null, 'B4', null, 'A4', null,
        'B4', null, 'G4', null, 'G4', null, null, null,

        'G4', 'G4', 'C5', null, 'E5', null, 'E5', 'D5',
        'C5', null, 'B4', null, 'A4', null, null, null,
        'B4', 'B4', 'D5', null, 'F5', null, 'F5', 'E5',
        'D5', null, 'C5', null, 'B4', null, 'E4', null,

        'E4', null, 'G4', null, 'G4', 'A4', 'B4', null,
        'C5', null, 'E5', null, 'G5', null, null, null,
        'D5', null, 'C5', null, 'B4', null, 'G4', null,
        'G4', null, 'G4', null, null, null, null, null,
      ];

      const bass: (string | null)[] = [
        'C3', 'C3', 'G2', 'G2', 'C3', 'C3', 'G2', 'G2',
        'C3', 'C3', 'E3', 'E3', 'G3', 'G3', 'G2', 'G2',
        'F3', 'F3', 'C3', 'C3', 'A2', 'A2', 'E3', 'E3',
        'G3', 'G3', 'D3', 'D3', 'G3', 'G3', 'G2', 'G2',
        'C3', 'C3', 'G2', 'G2', 'C3', 'C3', 'G2', 'G2',
        'C3', 'C3', 'E3', 'E3', 'F3', 'F3', 'C3', 'C3',
        'D3', 'D3', 'A2', 'A2', 'G3', 'G3', 'D3', 'D3',
        'G3', 'G3', 'G2', 'G2', 'C3', 'G2', 'C3', 'C3',

        'C3', 'C3', 'E3', 'E3', 'G3', 'G3', 'C3', 'C3',
        'F3', 'F3', 'C3', 'C3', 'A2', 'A2', 'F3', 'F3',
        'D3', 'D3', 'F3', 'F3', 'A3', 'A3', 'D3', 'D3',
        'G3', 'G3', 'D3', 'D3', 'G3', 'G3', 'G2', 'G2',

        'C3', 'C3', 'G2', 'G2', 'C3', 'C3', 'G2', 'G2',
        'C3', 'C3', 'E3', 'E3', 'F3', 'F3', 'C3', 'C3',
        'G3', 'G3', 'D3', 'D3', 'G3', 'G3', 'G2', 'G2',
        'C3', 'G2', 'C3', 'G2', 'C3', 'C3', 'C3', 'C3',
      ];

      const step = this.stepIndex % melody.length;
      const leadNote = melody[step];
      const harmNote = harmony[step];
      const bassNote = bass[step];

      if (leadNote) this.playPulseTone(this.noteFreq(leadNote), 0.14, 0.32, t);
      if (harmNote) this.playPulseTone(this.noteFreq(harmNote), 0.12, 0.16, t, 0.25);
      if (bassNote) this.playTriangleTone(this.noteFreq(bassNote), 0.15, 0.35, t);

      // Drum groove
      if (step % 4 === 0) this.playKick(t);
      if (step % 4 === 2) this.playSnare(t);
      if (step % 2 === 1) this.playHiHat(t);

    } else if (track === 'ole_lula') {
      // "Olê, Olê, Olê, Olá - Lula, Lula!" Marcha festiva popular!
      const melody: (string | null)[] = [
        // "Olê, olê, olê, olá!"
        'G4', null, 'G4', null, 'E4', null, 'C4', null,
        'G4', null, 'G4', null, 'A4', null, null, null,
        // "Lula! Lula!"
        'G4', null, 'C5', null, 'C5', null, null, null,
        'G4', null, 'C5', null, 'C5', null, null, null,

        // "Olê, olê, olê, olá!"
        'A4', null, 'A4', null, 'F4', null, 'D4', null,
        'A4', null, 'A4', null, 'B4', null, null, null,
        // "Lula! Lula!"
        'B4', null, 'D5', null, 'D5', null, null, null,
        'B4', null, 'C5', null, 'C5', null, null, null,

        // Chorus turn: "O povo unido jamais será vencido!"
        'C5', 'C5', 'B4', 'B4', 'A4', 'A4', 'G4', null,
        'E4', null, 'F4', null, 'G4', null, null, null,
        'A4', 'A4', 'G4', 'G4', 'F4', 'F4', 'E4', null,
        'D4', null, 'E4', null, 'C4', null, null, null,

        // Grand fanfare finish
        'G4', null, 'C5', null, 'E5', null, 'G5', null,
        'F5', null, 'E5', null, 'D5', null, 'C5', null,
        'G4', null, 'C5', null, 'C5', null, null, null,
        'G4', null, 'C5', null, 'C5', null, null, null,
      ];

      const bass: (string | null)[] = [
        'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'E3',
        'F3', 'C3', 'F3', 'C3', 'F3', 'A2', 'D3', 'F3',
        'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2',
        'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'C3',

        'D3', 'A2', 'D3', 'A2', 'D3', 'A2', 'D3', 'F#3',
        'G3', 'D3', 'G3', 'D3', 'G3', 'B2', 'E3', 'G3',
        'G3', 'D3', 'G3', 'D3', 'G3', 'D3', 'G3', 'D3',
        'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'C3',

        'F3', 'F3', 'C3', 'C3', 'F3', 'F3', 'C3', 'C3',
        'C3', 'C3', 'G2', 'G2', 'C3', 'C3', 'E3', 'E3',
        'D3', 'D3', 'A2', 'A2', 'D3', 'D3', 'F3', 'F3',
        'G3', 'G3', 'D3', 'D3', 'C3', 'G2', 'C3', 'C3',

        'C3', 'G2', 'C3', 'E3', 'G3', 'E3', 'C3', 'E3',
        'F3', 'C3', 'G3', 'D3', 'G3', 'D3', 'C3', 'G2',
        'C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'C3', 'G2',
        'C3', 'G2', 'C3', 'G2', 'C3', 'C3', 'C3', 'C3',
      ];

      const step = this.stepIndex % melody.length;
      if (melody[step]) this.playPulseTone(this.noteFreq(melody[step]!), 0.13, 0.35, t);
      if (bass[step]) this.playTriangleTone(this.noteFreq(bass[step]!), 0.14, 0.38, t);

      // Festive marching snare & kick
      if (step % 2 === 0) this.playKick(t);
      if (step % 4 === 2) this.playSnare(t);
      this.playHiHat(t);

    } else if (track === 'abc') {
      // ABC Metalúrgico Industrial 8-bit beat (Fábrica, esteiras e greve operária)
      const leadMelody: (string | null)[] = [
        'D4', 'D4', null, 'F4', 'G4', null, 'G#4', 'A4',
        null, 'C5', null, 'A4', 'G4', 'F4', 'D4', null,
        'D4', 'D4', null, 'F4', 'G4', null, 'A4', null,
        'C5', 'D5', 'C5', 'A4', 'G4', null, 'D4', null,
        'F4', 'F4', null, 'A4', 'C5', null, 'D5', 'D5',
        'C5', null, 'A4', null, 'G4', 'F4', 'D4', null,
        'D4', 'F4', 'G4', 'A4', 'C5', 'A4', 'G4', 'F4',
        'D4', null, 'A3', null, 'D4', null, null, null,
      ];

      const bassline: (string | null)[] = [
        'D3', 'D3', 'A2', 'A2', 'D3', 'D3', 'F3', 'F3',
        'G3', 'G3', 'D3', 'D3', 'C3', 'C3', 'D3', 'A2',
        'D3', 'D3', 'A2', 'A2', 'D3', 'D3', 'F3', 'F3',
        'G3', 'G3', 'A2', 'A2', 'D3', 'A2', 'D3', 'D3',
        'F3', 'F3', 'C3', 'C3', 'F3', 'F3', 'G3', 'G3',
        'A3', 'A3', 'E3', 'E3', 'G3', 'G3', 'D3', 'D3',
        'D3', 'D3', 'F3', 'F3', 'G3', 'G3', 'A2', 'A2',
        'D3', 'A2', 'D3', 'A2', 'D3', 'D3', 'D3', 'D3',
      ];

      const step = this.stepIndex % leadMelody.length;
      if (leadMelody[step]) this.playPulseTone(this.noteFreq(leadMelody[step]!), 0.11, 0.32, t);
      if (bassline[step]) this.playTriangleTone(this.noteFreq(bassline[step]!), 0.13, 0.38, t);

      // Industrial rhythmic snare & metallic kick
      if (step % 4 === 0) this.playKick(t);
      if (step % 4 === 2) this.playSnare(t);
      this.playHiHat(t);

    } else if (track === 'boss') {
      // Fast, dramatic, tense 8-bit Boss Battle groove!
      const bossLead: (string | null)[] = [
        'A4', 'A4', 'C5', 'A4', 'D#5', 'D5', 'C5', 'A4',
        'G4', 'A4', 'C5', 'D5', 'D#5', 'D5', 'C5', 'G4',
        'A4', 'A4', 'C5', 'A4', 'E5', 'D5', 'C5', 'A4',
        'G5', 'E5', 'D5', 'C5', 'D5', 'C5', 'A4', 'G4',
        'E5', 'E5', 'G5', 'E5', 'A#5', 'A5', 'G5', 'E5',
        'D5', 'E5', 'G5', 'A5', 'A#5', 'A5', 'G5', 'D5',
        'A4', 'C5', 'D5', 'D#5', 'E5', 'G5', 'A5', null,
        'G5', 'E5', 'D5', 'C5', 'A4', null, 'A4', null,
      ];

      const bossBass: (string | null)[] = [
        'A2', 'A2', 'E2', 'A2', 'C3', 'C3', 'D3', 'D#3',
        'E3', 'E3', 'D3', 'C3', 'A2', 'A2', 'E2', 'G2',
        'A2', 'A2', 'E2', 'A2', 'C3', 'C3', 'D3', 'D#3',
        'E3', 'E3', 'G3', 'G3', 'D3', 'D3', 'E3', 'E2',
        'E2', 'E2', 'B1', 'E2', 'G2', 'G2', 'A2', 'A#2',
        'B2', 'B2', 'A2', 'G2', 'E2', 'E2', 'B1', 'D2',
        'A2', 'A2', 'C3', 'C3', 'D3', 'D3', 'E3', 'E3',
        'G3', 'G3', 'E3', 'E3', 'A2', 'E2', 'A2', 'A2',
      ];

      const step = this.stepIndex % bossLead.length;
      if (bossLead[step]) this.playPulseTone(this.noteFreq(bossLead[step]!), 0.09, 0.35, t);
      if (bossBass[step]) this.playTriangleTone(this.noteFreq(bossBass[step]!), 0.11, 0.4, t);

      // Fast driving battle drums
      if (step % 2 === 0) this.playKick(t);
      if (step % 2 === 1) this.playSnare(t);
      this.playHiHat(t);
    }

    this.stepIndex++;
  }

  private playPulseTone(
    freq: number,
    duration: number,
    gainLevel: number,
    time: number,
    dutyRatio: number = 0.5
  ) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = dutyRatio === 0.25 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playTriangleTone(freq: number, duration: number, gainLevel: number, time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playKick(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.08);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  private playHiHat(time: number) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = this.ctx.sampleRate * 0.025;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(time);
    noise.stop(time + 0.025);
  }
}

export const chiptune = new ChiptuneAudio();
