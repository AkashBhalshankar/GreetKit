// Web Audio API Procedural Sound Engine
// Completely self-contained, no external audio file downloads required

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;
let ambientOscillators: OscillatorNode[] = [];
let ambientGain: GainNode | null = null;
let ambientInterval: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean) {
  isAudioMuted = muted;
  if (muted) {
    stopAmbientMusic();
  }
}

export function getAudioMuted(): boolean {
  return isAudioMuted;
}

/**
 * Play a soothing chime / bell ping (Diyas, lanterns, stars)
 */
export function playChime(freq = 880, duration = 0.8) {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Play candle blowout / extinguishing whoosh with subtle white noise
 */
export function playBlowoutSwoosh() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate shaped white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseSource.start(now);
}

/**
 * Play RPG level up arpeggio fanfare
 */
export function playLevelUpFanfare() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const noteStart = now + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.2, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.25);
  });
}

/**
 * Play balloon pop sound
 */
export function playPop() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Play typewriter mechanical key clack
 */
export function playTypewriterClack() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

/**
 * Play plant blooming sparkle
 */
export function playBloom() {
  if (isAudioMuted) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playChime(freq, 0.6), i * 90);
  });
}

/**
 * Play triumphant celebratory victory chord
 */
export function playTriumph() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major
  const now = ctx.currentTime;

  chord.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  });
}

/**
 * Ambient background music synthesizer
 */
let ringtoneTimeouts: number[] = [];
let ringtoneLoopTimeout: number | null = null;
let isRingtoneActive = false;

export function isHappyBirthdayRingtonePlaying(): boolean {
  return isRingtoneActive;
}

export function stopHappyBirthdayRingtone() {
  isRingtoneActive = false;
  ringtoneTimeouts.forEach(t => clearTimeout(t));
  ringtoneTimeouts = [];
  if (ringtoneLoopTimeout) {
    clearTimeout(ringtoneLoopTimeout);
    ringtoneLoopTimeout = null;
  }
}

/**
 * Play authentic Happy Birthday Ringtone / Melody via procedural Web Audio synthesizer
 * Sounds like a warm, cheerful music-box with crystal chime overtones
 */
export function playHappyBirthdayRingtone(loop = false, onFinish?: () => void) {
  if (isAudioMuted) return;
  stopHappyBirthdayRingtone();
  stopAmbientMusic();

  const ctx = getAudioContext();
  if (!ctx) return;

  isRingtoneActive = true;

  // Melody data: [frequency, duration in seconds, gap after note in seconds]
  const melody: Array<[number, number, number]> = [
    // Happy Birthday to You
    [392.00, 0.24, 0.06], // G4 - Hap-
    [392.00, 0.22, 0.08], // G4 - py
    [440.00, 0.42, 0.08], // A4 - Birth-
    [392.00, 0.42, 0.08], // G4 - day
    [523.25, 0.42, 0.08], // C5 - to
    [493.88, 0.80, 0.22], // B4 - you!

    // Happy Birthday to You
    [392.00, 0.24, 0.06], // G4 - Hap-
    [392.00, 0.22, 0.08], // G4 - py
    [440.00, 0.42, 0.08], // A4 - Birth-
    [392.00, 0.42, 0.08], // G4 - day
    [587.33, 0.42, 0.08], // D5 - to
    [523.25, 0.80, 0.22], // C5 - you!

    // Happy Birthday Dear [Friend]
    [392.00, 0.24, 0.06], // G4 - Hap-
    [392.00, 0.22, 0.08], // G4 - py
    [783.99, 0.42, 0.08], // G5 - Birth-
    [659.25, 0.42, 0.08], // E5 - day
    [523.25, 0.42, 0.08], // C5 - dear
    [493.88, 0.42, 0.08], // B4 - spe-
    [440.00, 0.75, 0.22], // A4 - cial!

    // Happy Birthday to You!
    [698.46, 0.26, 0.06], // F5 - Hap-
    [698.46, 0.22, 0.08], // F5 - py
    [659.25, 0.42, 0.08], // E5 - Birth-
    [523.25, 0.42, 0.08], // C5 - day
    [587.33, 0.46, 0.08], // D5 - to
    [523.25, 1.10, 0.35], // C5 - you!!
  ];

  let cumulativeTime = 0;

  melody.forEach(([freq, dur, gap]) => {
    const noteStartDelay = cumulativeTime;
    cumulativeTime += dur + gap;

    const timeoutId = window.setTimeout(() => {
      if (!isRingtoneActive || isAudioMuted) return;
      playMusicBoxNote(freq, dur);
    }, noteStartDelay * 1000);

    ringtoneTimeouts.push(timeoutId);
  });

  const totalDurationMs = cumulativeTime * 1000;

  if (loop) {
    ringtoneLoopTimeout = window.setTimeout(() => {
      if (isRingtoneActive && !isAudioMuted) {
        playHappyBirthdayRingtone(true, onFinish);
      }
    }, totalDurationMs + 800);
  } else {
    ringtoneLoopTimeout = window.setTimeout(() => {
      isRingtoneActive = false;
      if (onFinish) onFinish();
    }, totalDurationMs);
  }
}

/**
 * Synthesize a single crystal music-box bell chime
 */
function playMusicBoxNote(freq: number, duration: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Primary tone (triangle wave for music box warmth)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, now);

  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.22, now + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + duration + 0.05);

  // Bell shimmer overtone (sine wave 2x octave above, subtle decay)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, now);

  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(0.08, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.55));

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + duration * 0.6);
}

export function startAmbientMusic(musicType: string) {
  if (isAudioMuted || musicType === 'none') return;
  stopAmbientMusic();
  stopHappyBirthdayRingtone();

  if (musicType === 'happy-birthday-ringtone') {
    playHappyBirthdayRingtone(true);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  // Gentle pentatonic progression in C/G: [C4, E4, G4, A4, D5, E5, G5]
  const chordNotes = [
    [261.63, 329.63, 392.00], // C
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66], // G
  ];

  let step = 0;

  function playAmbientChord() {
    if (isAudioMuted || !ctx) return;
    const now = ctx.currentTime;
    const currentChord = chordNotes[step % chordNotes.length];
    step++;

    currentChord.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = musicType === 'arcade-upbeat' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const peak = musicType === 'arcade-upbeat' ? 0.03 : 0.04;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.4);
    });
  }

  playAmbientChord();
  ambientInterval = window.setInterval(playAmbientChord, 3500);
}

export function stopAmbientMusic() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
  stopHappyBirthdayRingtone();
}

/**
 * Play Piñata whack impact / burst sound
 */
export function playPinataWhack(isBurst = false) {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (isBurst) {
    // Joyful trumpet fanfare and burst sound
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.5);
    });
    return;
  }

  // Wooden whack thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Play Celestial Starlight Ping
 */
export function playStarlightPing(stepIndex = 0) {
  if (isAudioMuted) return;
  const frequencies = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]; // D Major pentatonic
  const freq = frequencies[stepIndex % frequencies.length];
  playChime(freq, 0.9);
}

/**
 * Play Retro Vinyl needle drop and crackle
 */
export function playVinylDrop() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Gentle crackle
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    if (Math.random() < 0.08) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    } else {
      data[i] = 0;
    }
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  noiseSource.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.start(now);

  // Warm bass bump
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = 'sine';
  bass.frequency.setValueAtTime(95, now + 0.05);
  bass.frequency.exponentialRampToValueAtTime(45, now + 0.25);
  bassGain.gain.setValueAtTime(0.2, now + 0.05);
  bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  bass.connect(bassGain);
  bassGain.connect(ctx.destination);
  bass.start(now + 0.05);
  bass.stop(now + 0.25);
}

/**
 * Play celebration party horn
 */
export function playPartyHorn() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.linearRampToValueAtTime(460, now + 0.15);
  osc.frequency.linearRampToValueAtTime(380, now + 0.4);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);
}
