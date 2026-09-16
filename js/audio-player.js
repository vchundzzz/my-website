/* ==========================================================
   INTERACTIVE AUDIO PLAYER & LIVE WEB SYNTHESIZER
   Using pure Web Audio API & HTML5 Canvas Realtime Visualizer
   ========================================================== */

class WebDJStudio {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.timerId = null;
    this.currentStep = 0;
    this.bpm = 128;
    this.currentGenre = 'techhouse';

    // UI Elements
    this.playBtn = document.getElementById('playBtn');
    this.playIcon = document.getElementById('playIcon');
    this.miniEq = document.getElementById('miniEq');
    this.canvas = document.getElementById('visualizerCanvas');
    this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;
    this.bpmDisplay = document.getElementById('bpmDisplay');
    this.trackTitle = document.getElementById('currentTrackTitle');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.volumeIcon = document.getElementById('volumeIcon');
    this.turntable = document.getElementById('turntable');
    this.vinylDisc = document.getElementById('vinylDisc');
    this.trackCards = document.querySelectorAll('.track-card');

    this.currentGenre = 'vinahouse';
    this.bpm = 135;

    this.tracks = {
      vinahouse: {
        title: "Vinahouse Bass Drop Groove (135 BPM)",
        bpm: 135,
        bassNotes: [55, 55, 58, 55, 51, 55, 58, 60] // A1 punchy notes
      },
      houselak: {
        title: "Houselak Midnight Anthem (132 BPM)",
        bpm: 132,
        bassNotes: [65, 65, 68, 65, 63, 65, 70, 72] // F energetic notes
      },
      lofi: {
        title: "Coding Chill Flow (Deep Melodic 120 BPM)",
        bpm: 120,
        bassNotes: [48, 48, 51, 53, 48, 51, 55, 53] // C mellow notes
      }
    };

    this.init();
  }

  init() {
    if (!this.playBtn || !this.canvas) return;

    // Canvas size adjustment
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Play/Pause button
    this.playBtn.addEventListener('click', () => this.togglePlayback());

    // Volume Slider
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
        }
        if (this.volumeIcon) {
          if (val === 0) {
            this.volumeIcon.className = "fa-solid fa-volume-xmark";
          } else if (val < 0.5) {
            this.volumeIcon.className = "fa-solid fa-volume-low";
          } else {
            this.volumeIcon.className = "fa-solid fa-volume-high";
          }
        }
      });
    }

    // Track selector cards
    this.trackCards.forEach(card => {
      card.addEventListener('click', () => {
        const genre = card.getAttribute('data-genre');
        const bpm = parseInt(card.getAttribute('data-bpm'), 10);
        this.selectTrack(genre, bpm, card);
      });
    });

    // Start idle visualizer wave
    this.drawIdleVisualizer();
  }

  setupAudioContext() {
    if (this.audioCtx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = this.volumeSlider ? parseFloat(this.volumeSlider.value) : 0.7;

    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  togglePlayback() {
    if (!this.audioCtx) {
      this.setupAudioContext();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.currentStep = 0;

    // UI Updates
    document.body.classList.add('playing-audio');
    if (this.playIcon) {
      this.playIcon.classList.remove('fa-play');
      this.playIcon.classList.add('fa-pause');
    }
    if (this.miniEq) this.miniEq.classList.add('playing');
    if (this.turntable) this.turntable.classList.add('active');
    if (this.vinylDisc) this.vinylDisc.classList.add('playing');

    // Interval step based on 16th notes (4 steps per beat)
    const stepTimeMs = (60 / this.bpm / 4) * 1000;
    this.timerId = setInterval(() => this.step(), stepTimeMs);

    // Run active audio frequency visualizer
    this.drawActiveVisualizer();
  }

  stop() {
    this.isPlaying = false;
    clearInterval(this.timerId);

    // UI Updates
    document.body.classList.remove('playing-audio');
    if (this.playIcon) {
      this.playIcon.classList.remove('fa-pause');
      this.playIcon.classList.add('fa-play');
    }
    if (this.miniEq) this.miniEq.classList.remove('playing');
    if (this.turntable) this.turntable.classList.remove('active');
    if (this.vinylDisc) this.vinylDisc.classList.remove('playing');
  }

  selectTrack(genre, bpm, clickedCard) {
    this.trackCards.forEach(c => c.classList.remove('active'));
    clickedCard.classList.add('active');

    this.currentGenre = genre;
    this.bpm = bpm;
    if (this.bpmDisplay) this.bpmDisplay.textContent = `${bpm} BPM`;

    const track = this.tracks[genre];
    if (track && this.trackTitle) {
      this.trackTitle.textContent = track.title;
    }

    // If currently playing, restart with new tempo
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  // Synthesizer Drum & Bass Step Sequencer
  step() {
    if (!this.audioCtx || !this.isPlaying) return;
    const t = this.audioCtx.currentTime;
    const step16 = this.currentStep % 16;

    // 1. Kick Drum (on beats 0, 4, 8, 12 - 4-on-the-floor)
    if (step16 % 4 === 0) {
      this.triggerKick(t);
    }

    // 2. Off-beat Open Hi-Hat (steps 2, 6, 10, 14)
    if (step16 % 4 === 2) {
      this.triggerHiHat(t, true);
    } else if (step16 % 2 === 0) {
      // Closed Hi-Hat
      this.triggerHiHat(t, false);
    }

    // 3. Snare / Clap (steps 4, 12)
    if (step16 === 4 || step16 === 12) {
      this.triggerClap(t);
    }

    // 4. Rolling Synth Bassline (on every 16th note with groovy patterns)
    if (step16 % 2 !== 0 || step16 === 2) {
      const track = this.tracks[this.currentGenre] || this.tracks.vinahouse;
      const noteIdx = Math.floor(step16 / 2) % track.bassNotes.length;
      const freq = track.bassNotes[noteIdx];
      this.triggerBass(t, freq);
    }

    this.currentStep++;
  }

  // --- Web Audio Synth Instruments ---

  // Kick: Pitch decay oscillator + transient pop
  triggerKick(time) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  // Hi-Hat: Filtered White Noise burst
  triggerHiHat(time, isOpen) {
    const bufferSize = this.audioCtx.sampleRate * (isOpen ? 0.12 : 0.04);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.audioCtx.createGain();
    const duration = isOpen ? 0.12 : 0.04;
    gain.gain.setValueAtTime(isOpen ? 0.3 : 0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(time);
    noise.stop(time + duration);
  }

  // Clap / Snare: Filtered snappy noise bursts
  triggerClap(time) {
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 2.5;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(time);
    noise.stop(time + 0.16);
  }

  // Bass Synth: Low-pass filtered sawtooth wave with snappy filter envelope
  triggerBass(time, baseFreq) {
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + 0.18);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  // --- Visualizer Render Loops ---

  drawIdleVisualizer() {
    if (!this.canvasCtx || this.isPlaying) return;

    const ctx = this.canvasCtx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#080a10';
    ctx.fillRect(0, 0, w, h);

    // Subtle gentle sine wave in idle state
    const time = Date.now() * 0.002;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';

    for (let x = 0; x < w; x += 5) {
      const y = h / 2 + Math.sin(x * 0.015 + time) * 12 + Math.cos(x * 0.008 + time) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (!this.isPlaying) {
      requestAnimationFrame(() => this.drawIdleVisualizer());
    }
  }

  drawActiveVisualizer() {
    if (!this.canvasCtx || !this.isPlaying || !this.analyser) return;

    const ctx = this.canvasCtx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!this.isPlaying) {
        this.drawIdleVisualizer();
        return;
      }

      requestAnimationFrame(render);
      this.analyser.getByteFrequencyData(dataArray);

      // Semi-transparent background for motion trail
      ctx.fillStyle = 'rgba(8, 10, 16, 0.3)';
      ctx.fillRect(0, 0, w, h);

      const numBars = 32;
      const barWidth = (w / numBars) - 3;
      let x = 2;

      for (let i = 0; i < numBars; i++) {
        // Map dataArray index
        const index = Math.floor((i / numBars) * (bufferLength * 0.8));
        const barHeight = (dataArray[index] / 255) * (h * 0.82) + 6;

        // Gradient color for bars (Dev Cyan to DJ Pink)
        const gradient = ctx.createLinearGradient(0, h - barHeight, 0, h);
        gradient.addColorStop(0, '#d946ef'); // Pink/Magenta top
        gradient.addColorStop(0.5, '#8b5cf6'); // Purple middle
        gradient.addColorStop(1, '#06b6d4'); // Cyan bottom

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(217, 70, 239, 0.6)';

        // Draw rounded top bar
        ctx.beginPath();
        ctx.roundRect(x, h - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 3;
      }
      ctx.shadowBlur = 0; // reset
    };

    render();
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.djStudio = new WebDJStudio();
});
