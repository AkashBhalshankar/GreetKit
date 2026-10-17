import confetti from 'canvas-confetti';

export function fireCelebration(type: 'confetti' | 'sparkles' | 'fireworks' | 'balloons' = 'confetti') {
  if (typeof window === 'undefined') return;

  if (type === 'fireworks') {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  } else if (type === 'sparkles') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ffb703', '#ffffff', '#fb8500'],
      shapes: ['star', 'circle'],
      scalar: 1.1,
    });
  } else if (type === 'balloons') {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'],
      scalar: 1.4,
      gravity: 0.5,
      drift: 0.1,
    });
  } else {
    // Classic confetti shower
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
    });
  }
}
