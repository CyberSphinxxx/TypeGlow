import { writable } from 'svelte/store';

export const soundEnabled = writable(true);

class SoundManager {
    private audioContext: AudioContext | null = null;
    private clickBuffer: AudioBuffer | null = null;
    private errorBuffer: AudioBuffer | null = null;

    constructor() { }

    private initContext() {
        if (!this.audioContext && typeof window !== 'undefined') {
            const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioCtor();
        }
    }

    // Ensure context is running (browsers block auto-play)
    public unlockAudio() {
        this.initContext();
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    private async ensureContext() {
        this.initContext();
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Play a synthetic mechanical click
    async playClick() {
        if (!this.shouldPlay()) return;
        if (!this.audioContext) this.initContext();
        if (this.audioContext?.state === 'suspended') await this.audioContext.resume();
        this.synthesizeClick();
    }

    // Play a synthetic error buzz
    async playError() {
        if (!this.shouldPlay()) return;
        if (!this.audioContext) this.initContext();
        if (this.audioContext?.state === 'suspended') await this.audioContext.resume();
        this.synthesizeError();
    }

    private shouldPlay(): boolean {
        let enabled = true;
        soundEnabled.subscribe(v => enabled = v)();
        return enabled && !!this.audioContext;
    }

    private synthesizeClick() {
        if (!this.audioContext) return;
        const t = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // High frequency "tick"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

        // Increased volume
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    private synthesizeError() {
        if (!this.audioContext) return;
        const t = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Low frequency "buzz"
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.1);

        // Increased volume
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(t);
        osc.stop(t + 0.1);
    }
}

export const soundManager = new SoundManager();
