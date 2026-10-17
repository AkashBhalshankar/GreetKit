// Microphone Breath & Blow Detection Engine
// Detects aerodynamic turbulence / blowing on mobile phone or desktop microphone

export interface MicController {
  start: (onBlow: (intensity: number) => void, onLevel?: (level: number) => void) => Promise<boolean>;
  stop: () => void;
  isSupported: boolean;
}

export function createMicBlowDetector(): MicController {
  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let animFrameId: number | null = null;
  let isListening = false;
  let consecutivePuffs = 0;

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  async function start(
    onBlow: (intensity: number) => void,
    onLevel?: (level: number) => void
  ): Promise<boolean> {
    if (!isSupported) return false;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);

      // Lowpass / bandpass filter focusing on breath turbulence (80Hz to 600Hz)
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;

      source.connect(filter);
      filter.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      isListening = true;

      function checkAudio() {
        if (!isListening || !analyser) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average energy in the breath turbulence band
        let sum = 0;
        const lowBandBins = Math.min(30, bufferLength);
        for (let i = 0; i < lowBandBins; i++) {
          sum += dataArray[i];
        }
        const average = sum / lowBandBins;
        const normalized = Math.min(1, average / 128);

        if (onLevel) {
          onLevel(normalized);
        }

        // Blow detection threshold: sustained turbulence energy above 45
        if (average > 48) {
          consecutivePuffs++;
          if (consecutivePuffs >= 2) {
            onBlow(normalized);
            consecutivePuffs = 0;
          }
        } else {
          consecutivePuffs = Math.max(0, consecutivePuffs - 1);
        }

        animFrameId = requestAnimationFrame(checkAudio);
      }

      checkAudio();
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      return false;
    }
  }

  function stop() {
    isListening = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  return {
    start,
    stop,
    isSupported,
  };
}
