import React, { useState, useEffect, useRef } from 'react';
import { Wind, Mic, MicOff, Sparkles } from 'lucide-react';
import { DandelionProps, PaletteMode } from '../types/greeting';
import { createMicBlowDetector, MicController } from '../lib/mic';
import { playBlowoutSwoosh, playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: DandelionProps;
  accentColor?: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete?: () => void;
  isInteractive?: boolean;
}

interface SeedItem {
  id: number;
  angle: number;
  distance: number;
  driftX: number;
  driftY: number;
}

export const DandelionEngine: React.FC<Props> = ({
  props,
  accentColor = '#557C4F',
  recipientName = 'Dear Friend',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const [seedsBlown, setSeedsBlown] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [currentWish, setCurrentWish] = useState<string | null>(null);

  const micRef = useRef<MicController | null>(null);

  const wishes = props.wishNotes || [
    'May light follow every step you take.',
    'May true laughter fill your days.',
    'May unexpected beauty catch your breath.',
    'May every deep dream take root and bloom.',
    'Wishing you the happiest birthday yet!',
  ];

  // 16 seeds positioned in radial circle
  const [seeds] = useState<SeedItem[]>(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * Math.PI * 2,
      distance: 35 + (i % 3) * 6,
      driftX: (Math.random() - 0.5) * 120 + 60,
      driftY: -Math.random() * 120 - 40,
    }))
  );

  const handleScatter = () => {
    if (seedsBlown || !isInteractive) return;
    setSeedsBlown(true);
    playBlowoutSwoosh();
    playChime(750, 0.4);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < wishes.length) {
        setCurrentWish(wishes[idx]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 900);

    setTimeout(() => {
      playTriumph();
      fireCelebration('sparkles');
      if (onComplete) onComplete();
    }, 3200);
  };

  const [micNotice, setMicNotice] = useState<string | null>(null);

  const toggleMic = async () => {
    if (micActive) {
      micRef.current?.stop();
      setMicActive(false);
      setMicNotice(null);
      return;
    }
    if (!micRef.current) {
      micRef.current = createMicBlowDetector();
    }
    const success = await micRef.current.start(() => {
      handleScatter();
    });
    if (success) {
      setMicActive(true);
      setMicNotice('Microphone active! Blow directly toward your device mic 🌬️');
    } else {
      setMicNotice('Microphone access unavailable. Tap the dandelion directly to scatter seeds!');
    }
  };

  useEffect(() => {
    return () => {
      micRef.current?.stop();
    };
  }, []);

  const isDark = paletteMode === 'midnight';

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none overflow-hidden ${isDark ? 'text-stone-100' : 'text-[#2C241E]'}`}>
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase font-medium ${isDark ? 'bg-white/10 text-emerald-300 border border-white/10' : 'bg-[#EBF3E8] text-[#557C4F] border border-[#C5D8C1]'}`}>
          <Wind className="w-3.5 h-3.5 text-[#557C4F]" />
          <span>{seedsBlown ? 'Seeds Scattered! 🌾' : props.title || 'Blow Dandelion Birthday Wishes'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          {recipientName}'s Wish in the Wind
        </h2>
        <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#7D6E63]'}`}>
          {seedsBlown
            ? 'Your wishes have been caught by the wind and carried into the world!'
            : micActive
            ? 'Blow into your microphone or tap the dandelion to scatter the seeds!'
            : 'Tap the dandelion or use your mic to scatter the seeds into the breeze.'}
        </p>
      </div>

      {/* Dandelion Stem & Floating Seeds Canvas */}
      <div
        onClick={handleScatter}
        className="my-5 relative w-64 h-56 flex flex-col items-center justify-center cursor-pointer"
        title="Tap to scatter dandelion"
      >
        {/* Flower Center Seed Head */}
        <div className="relative w-12 h-12 rounded-full bg-[#8C6D53] border-2 border-[#D4A373] shadow-inner flex items-center justify-center z-10">
          <div className="w-6 h-6 rounded-full bg-[#A67C52]" />
        </div>

        {/* Stem */}
        <div className="w-1.5 h-28 bg-[#557C4F] rounded-full -mt-2 -z-5" />

        {/* Radial Dandelion Seeds */}
        {seeds.map((seed) => {
          const x = Math.cos(seed.angle) * seed.distance;
          const y = Math.sin(seed.angle) * seed.distance;

          return (
            <div
              key={seed.id}
              className={`absolute transition-all duration-1000 ${
                seedsBlown ? 'opacity-0 scale-75' : 'opacity-90'
              }`}
              style={{
                transform: seedsBlown
                  ? `translate(${seed.driftX}px, ${seed.driftY}px) scale(0.6)`
                  : `translate(${x}px, ${y - 40}px)`,
                transitionDuration: seedsBlown ? `${1200 + seed.id * 80}ms` : '300ms',
              }}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm select-none">🪶</span>
                <div className="w-0.5 h-4 bg-white/70" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Unfurling Wish Note */}
      <div className="w-full max-w-md min-h-[50px] flex items-center justify-center my-2 px-3 z-10">
        {currentWish ? (
          <div className={`w-full p-3 rounded-2xl shadow-sm border text-xs sm:text-sm font-serif italic animate-in zoom-in-95 leading-relaxed ${isDark ? 'bg-stone-900 border-emerald-500/30' : 'bg-[#FFFDF9] border-[#E8DFC8]'}`}>
            "{currentWish}"
          </div>
        ) : (
          <div className="text-xs text-[#8C6D53] italic">
            Each seed holds an unspoken birthday blessing...
          </div>
        )}
      </div>

      {/* Notice banner */}
      {micNotice && (
        <div className="w-full max-w-sm mx-auto my-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium animate-in fade-in z-10">
          {micNotice}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2 z-10">
        <button
          type="button"
          onClick={toggleMic}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm transition-all active:scale-95 ${
            micActive
              ? 'bg-[#557C4F] text-white'
              : 'bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7]'
          }`}
        >
          {micActive ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <MicOff className="w-3.5 h-3.5 opacity-60" />}
          <span>{micActive ? 'Listening (Blow!)' : 'Use Mic'}</span>
        </button>

        {!seedsBlown && (
          <button
            type="button"
            onClick={handleScatter}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#557C4F] hover:bg-[#43643E] text-white shadow-sm transition-all active:scale-95"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Scatter Seeds</span>
          </button>
        )}

        {seedsBlown && (
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md active:scale-95 transition-all"
          >
            Read Birthday Letter →
          </button>
        )}
      </div>
    </div>
  );
};
