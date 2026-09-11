// Engine de Áudio Procedural usando Web Audio API para o Modo Foco Gentil
// Zero dependências externas, 100% offline, leve e sem latência.

export type SoundType = 'rain' | 'lofi' | 'whitenoise' | 'cafe';

export interface SoundOption {
  id: SoundType;
  name: string;
  description: string;
  icon: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: 'rain', name: 'Chuva Suave', description: 'Gotas e brisa relaxante', icon: 'CloudRain' },
  { id: 'lofi', name: 'Frequência Lo-Fi', description: 'Acordes quentes em 432Hz', icon: 'Radio' },
  { id: 'whitenoise', name: 'Ruído Branco', description: 'Fluxo contínuo de ar puro', icon: 'Wind' },
  { id: 'cafe', name: 'Café Aconchegante', description: 'Zumbido quente & acolhedor', icon: 'Coffee' },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundType | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentVolume = 0.5; // 0.0 a 1.0
  private cleanupFns: (() => void)[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): SoundType | null {
    return this.currentType;
  }

  public stop() {
    if (!this.isPlaying) return;

    if (this.masterGain && this.ctx) {
      try {
        // Fade out suave de 200ms para evitar cliques
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      } catch (e) {
        // Ignora se contexto já estiver fechado
      }
    }

    setTimeout(() => {
      this.cleanupFns.forEach(fn => {
        try { fn(); } catch (e) {}
      });
      this.cleanupFns = [];
      this.isPlaying = false;
    }, 200);
  }

  public play(type: SoundType, volume = this.currentVolume) {
    this.stop();

    setTimeout(() => {
      const ctx = this.getContext();
      this.currentType = type;
      this.currentVolume = volume;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(this.currentVolume, ctx.currentTime + 0.3); // Fade in suave
      master.connect(ctx.destination);
      this.masterGain = master;

      switch (type) {
        case 'whitenoise':
          this.startWhiteNoise(ctx, master);
          break;
        case 'rain':
          this.startRain(ctx, master);
          break;
        case 'lofi':
          this.startLoFi(ctx, master);
          break;
        case 'cafe':
          this.startCafe(ctx, master);
          break;
      }

      this.isPlaying = true;
    }, 220);
  }

  // 1. Ruído Branco Suave (Filtrado para soar como ar condicionado / brisa leve)
  private startWhiteNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Filtro passa-baixa para retirar agudos cortantes
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.cleanupFns.push(() => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
        filter.disconnect();
      } catch (e) {}
    });
  }

  // 2. Chuva Suave (Ruído Rosa com oscilação orgânica LFO)
  private startRain(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Algoritmo de ruído rosa de Paul Kellet
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.12;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Filtro modulado para simular o vento e variação da chuva
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.7;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // 0.2 Hz (uma onda a cada 5s)

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350; // Modula o filtro em +-350Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    rainSource.connect(filter);
    filter.connect(destination);

    rainSource.start();
    lfo.start();

    this.cleanupFns.push(() => {
      try {
        rainSource.stop();
        lfo.stop();
        rainSource.disconnect();
        lfo.disconnect();
        filter.disconnect();
      } catch (e) {}
    });
  }

  // 3. Frequência Lo-Fi / Harmônicos Quentes em 432Hz
  private startLoFi(ctx: AudioContext, destination: AudioNode) {
    // Acorde suave em Lá menor acolhedor baseado na frequência harmônica 432Hz
    // Fundamental A3 (216 Hz), Terça C4 (257 Hz), Quinta E4 (324 Hz) e Oitava (432 Hz)
    const freqs = [216, 257, 324, 432];
    const oscillators: OscillatorNode[] = [];
    const chordGain = ctx.createGain();
    chordGain.gain.value = 0.12;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650; // Som aveludado e quente
    filter.Q.value = 1.0;

    // LFO para um leve tremolo característico de fita analógica / Lo-Fi
    const tremolo = ctx.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.value = 0.3; // 0.3 Hz

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.03;
    tremolo.connect(tremoloGain);
    tremoloGain.connect(chordGain.gain);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      // Alterna entre ondas senoidais e triangulares para textura orgânica
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Pequeno detuning de centésimos para dar amplitude espacial
      const detune = (idx - 1.5) * 4;
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);

      osc.connect(chordGain);
      osc.start();
      oscillators.push(osc);
    });

    tremolo.start();
    chordGain.connect(filter);
    filter.connect(destination);

    this.cleanupFns.push(() => {
      try {
        oscillators.forEach(o => { o.stop(); o.disconnect(); });
        tremolo.stop();
        tremolo.disconnect();
        chordGain.disconnect();
        filter.disconnect();
      } catch (e) {}
    });
  }

  // 4. Café Aconchegante (Ruído Marrom Profundo com sensação de isolamento acústico)
  private startCafe(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Algoritmo de Ruído Marrom (Brownian noise)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.8; // Ganho compensatório
    }

    const brownSource = ctx.createBufferSource();
    brownSource.buffer = buffer;
    brownSource.loop = true;

    // Filtro grave acolhedor para abafar distrações externas
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    brownSource.connect(filter);
    filter.connect(destination);
    brownSource.start();

    this.cleanupFns.push(() => {
      try {
        brownSource.stop();
        brownSource.disconnect();
        filter.disconnect();
      } catch (e) {}
    });
  }
}

// Instância singleton para uso em todo o ciclo de vida do Pomodoro
export const ambientSound = new AmbientSoundEngine();
