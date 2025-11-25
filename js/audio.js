/* ============================================
   TINY ARCADE - Ambient Audio Engine
   Web Audio API based sound system
   ============================================ */

class AmbientAudio {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.masterGain = null;
        this.volume = 0.25;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio not supported');
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    // ============================================
    // Basic Sound Primitives
    // ============================================

    // Simple tone
    playTone(frequency, duration = 0.1, type = 'sine', volume = 0.1) {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // Frequency sweep
    playSweep(startFreq, endFreq, duration = 0.15, type = 'sine', volume = 0.15) {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // Chord (multiple notes)
    playChord(frequencies, duration = 0.3, type = 'sine', volume = 0.1) {
        if (!this.initialized) return;

        frequencies.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(this.ctx.currentTime + i * 0.02);
            osc.stop(this.ctx.currentTime + duration);
        });
    }

    // Noise burst
    playNoise(duration = 0.1, filterFreq = 800, volume = 0.15) {
        if (!this.initialized) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(this.ctx.currentTime);
    }

    // ============================================
    // Common Game Sounds
    // ============================================

    // Movement tick (very soft)
    playMove() {
        this.playTone(200, 0.03, 'sine', 0.02);
    }

    // UI click
    playClick() {
        this.playTone(600, 0.05, 'sine', 0.08);
    }

    // Success / Eat / Collect
    playSuccess() {
        this.playSweep(400, 800, 0.15, 'sine', 0.12);
    }

    // Error / Hit
    playError() {
        this.playSweep(300, 100, 0.2, 'sawtooth', 0.1);
    }

    // Landing / Place
    playLand() {
        this.playSweep(150, 60, 0.15, 'sine', 0.2);
    }

    // Rotate
    playRotate() {
        this.playTone(523.25, 0.12, 'triangle', 0.08);
    }

    // Clear line / Win row
    playClear(count = 1) {
        const baseFreqs = [261.63, 329.63, 392.00, 523.25];
        const duration = 0.3 + count * 0.1;

        baseFreqs.slice(0, count + 1).forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, duration - i * 0.05, 'sine', 0.15);
            }, i * 50);
        });
    }

    // Hard drop / Fast action
    playDrop() {
        this.playNoise(0.1, 800, 0.15);
    }

    // Game over (melancholic)
    playGameOver() {
        const notes = [392.00, 349.23, 329.63, 293.66];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.5, 'sine', 0.12);
            }, i * 300);
        });
    }

    // Win / Victory
    playWin() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.4, 'sine', 0.12);
            }, i * 150);
        });
    }

    // Score up
    playScore() {
        this.playSweep(600, 900, 0.1, 'sine', 0.1);
    }
}

// Global instance
const audio = new AmbientAudio();
