import React, { useState } from 'react';
import { Music, Sparkles } from 'lucide-react';
import { PianoTuneProps, PaletteMode } from '../types/greeting';
import { playChime, playTriumph } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: PianoTuneProps;
  accentColor?: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete?: () => void;
  isInteractive?: boolean;
}

const TUNE_NOTES = [
  { note: 'C4', label: 'Hap-', freq: 523.25, color: 'from-[#B85D3B] to-[#D4A373]' },
  { note: 'D4', label: 'py', freq: 587.33, color: 'from-[#D4A373] to-[#E2B886]' },
  { note: 'F4', label: 'Birth-', freq: 698.46, color: 'from-[#557C4F] to-[#749A6E]' },
  { note: 'E4', label: 'day!', freq: 659.25, color: 'from-[#B85D3B] to-[#C86446]' },
];

export const PianoTuneEngine: React.FC<Props> = ({
  props,
  accentColor = '#B85D3B',
  recipientName = 'Dear Friend',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const [playedSteps, setPlayedSteps] = useState<number[]>([]);
  const isCompleted = playedSteps.length >= TUNE_NOTES.length;

  const handlePlayKey = (idx: number) => {
    if (!isInteractive) return;

    playChime(TUNE_NOTES[idx].freq, 0.4);

    if (!playedSteps.includes(idx)) {
      const next = [...playedSteps, idx];
      setPlayedSteps(next);

      if (next.length === TUNE_NOTES.length) {
        setTimeout(() => {
          playTriumph();
          fireCelebration('fireworks');
          if (onComplete) onComplete();
        }, 500);
      }
    }
  };

  const isDark = paletteMode === 'midnight';

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none ${isDark ? 'text-stone-100' : 'text-[#2C241E]'}`}>
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase font-medium ${isDark ? 'bg-white/10 text-amber-300 border border-white/10' : 'bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8]'}`}>
          <Music className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{isCompleted ? 'Harmonies Complete! 🎵' : props.title || 'Play the Birthday Melody'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          A Song For {recipientName}
        </h2>
        <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#7D6E63]'}`}>
          {isCompleted
            ? 'The celebration anthem has been played in full harmony!'
            : 'Tap each musical chime key to play the birthday song notes!'}
        </p>
      </div>

      {/* Musical Chime Keys Grid */}
      <div className="my-6 grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-sm px-2">
        {TUNE_NOTES.map((item, idx) => {
          const isPressed = playedSteps.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePlayKey(idx)}
              className={`group flex flex-col items-center justify-between p-3 sm:p-4 rounded-3xl border transition-all duration-200 cursor-pointer ${
                isPressed
                  ? 'bg-gradient-to-b from-[#FFFDF9] to-[#FAF4EB] border-[#B85D3B] shadow-md -translate-y-1'
                  : 'bg-white border-[#E8DFC8] hover:border-[#D4A373] hover:-translate-y-1 active:scale-95'
              }`}
            >
              <span className="text-[11px] font-mono text-[#8C6D53] font-bold">
                {item.note}
              </span>

              {/* Chime bar */}
              <div
                className={`w-4 sm:w-5 rounded-full my-3 transition-all ${
                  isPressed ? 'bg-gradient-to-b ' + item.color + ' shadow-sm' : 'bg-[#EAE3D9]'
                }`}
                style={{ height: `${60 + idx * 16}px` }}
              />

              <span className="text-xs sm:text-sm font-serif font-bold text-[#2C241E]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress feedback */}
      <div className="w-full max-w-md min-h-[48px] flex items-center justify-center my-2 px-3 z-10">
        <span className="text-xs font-mono text-[#8C6D53]">
          Notes Struck: {playedSteps.length} of {TUNE_NOTES.length}
        </span>
      </div>

      {/* Play all CTA */}
      <div className="mt-2 z-10">
        {!isCompleted ? (
          <button
            type="button"
            onClick={() => {
              TUNE_NOTES.forEach((_, idx) => {
                setTimeout(() => handlePlayKey(idx), idx * 280);
              });
            }}
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Play Full Melody
          </button>
        ) : (
          <div className="text-xs font-serif text-[#557C4F] bg-[#EBF3E8] border border-[#C5D8C1] px-4 py-1.5 rounded-full font-medium">
            Melody singing in the stars ✨
          </div>
        )}
      </div>
    </div>
  );
};
