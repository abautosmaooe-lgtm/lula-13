/**
 * Female Narrator Speech Engine (Voz da Narradora)
 * Uses Web Speech API (SpeechSynthesis) with voice selection prioritized
 * for natural Brazilian Portuguese female voices, audio ducking for BGM,
 * and speech state management.
 */

import { chiptune } from './chiptune';

class NarratorEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeakingState: boolean = false;
  private lastSpokenText: string = '';
  private autoNarrateEnabled: boolean = true;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Filter Brazilian Portuguese voices
    const ptBrVoices = voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith('pt-br') || v.lang.toLowerCase().startsWith('pt'));

    // Preference list for Brazilian female voices:
    // Common names: Luciana, Francisca, Leticia, Maria, Google português do Brasil, Helena, Vitória
    const femaleVoice = ptBrVoices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('female') ||
        name.includes('mulher') ||
        name.includes('luciana') ||
        name.includes('francisca') ||
        name.includes('leticia') ||
        name.includes('letícia') ||
        name.includes('maria') ||
        name.includes('helena') ||
        name.includes('vitória') ||
        name.includes('vitoria') ||
        name.includes('camila') ||
        name.includes('google')
      );
    });

    this.selectedVoice = femaleVoice || ptBrVoices[0] || voices.find(v => v.lang.startsWith('pt')) || null;
  }

  public subscribe(listener: (speaking: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.listeners.forEach(fn => fn(speaking));
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isAutoNarrate(): boolean {
    return this.autoNarrateEnabled;
  }

  public toggleAutoNarrate(): boolean {
    this.autoNarrateEnabled = !this.autoNarrateEnabled;
    if (!this.autoNarrateEnabled && this.isSpeakingState) {
      this.stop();
    }
    return this.autoNarrateEnabled;
  }

  public speak(text: string, onFinish?: () => void) {
    if (!this.synth) return;

    this.stop();
    this.lastSpokenText = text;

    // Audio ducking: lower BGM so narrator is crystal clear
    chiptune.unlock();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    if (!this.selectedVoice) {
      this.loadVoices();
    }

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
    } else {
      utterance.lang = 'pt-BR';
    }

    // Female voice parameters: pitch slightly higher, conversational broadcast rate
    utterance.pitch = 1.12;
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      this.currentUtterance = null;
      if (onFinish) onFinish();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.notify(false);
      this.currentUtterance = null;
    };

    // iOS Safari workaround: resume if paused
    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.notify(false);
    this.currentUtterance = null;
  }

  public replay() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }
}

export const narrator = new NarratorEngine();
