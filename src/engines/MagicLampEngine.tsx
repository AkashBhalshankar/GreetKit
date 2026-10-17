import React, { useState, useRef } from 'react';
import { Sparkles, Wand2, Flame } from 'lucide-react';
import { MagicLampProps, PaletteMode } from '../types/greeting';
import { playChime, playTriumph } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: MagicLampProps;
  accentColor?: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const MagicLampEngine: React.FC<Props> = ({
  props,
  accentColor = '#D4A373',
  recipientName = 'Dear One',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const [rubProgress, setRubProgress] = useState(0); // 0 to 100
  const [isSummoned, setIsSummoned] = useState(false);
  const lastX = useRef<number | null>(null);

  const wishes = props.wishesGranted || [
    'Wish 1: Boundless vitality and joyful health throughout the year',
    'Wish 2: Creative breakthroughs and effortless success in all you do',
    'Wish 3: Deep, abiding love, belly laughs, and unwavering friendships',
  ];

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isSummoned || !isInteractive) return;
    if (lastX.current !== null) {
      const delta = Math.abs(e.clientX - lastX.current);
      if (delta > 8) {
        setRubProgress((prev) => {
          const next = Math.min(100, prev + 6);
          if (next % 20 === 0) {
            playChime(600 + next * 4, 0.1);
          }
          if (next >= 100 && !isSummoned) {
            setIsSummoned(true);
            playTriumph();
            fireCelebration('sparkles');
            if (onComplete) onComplete();
          }
          return next;
        });
      }
    }
    lastX.current = e.clientX;
  };

  const handlePointerLeave = () => {
    lastX.current = null;
  };

  const triggerInstantRub = () => {
    setRubProgress(100);
    setIsSummoned(true);
    playTriumph();
    fireCelebration('sparkles');
    if (onComplete) onComplete();
  };

  const isDark = paletteMode === 'midnight';

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none ${isDark ? 'text-stone-100' : 'text-[#2C241E]'}`}>
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase font-medium ${isDark ? 'bg-white/10 text-amber-300 border border-white/10' : 'bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8]'}`}>
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373] animate-spin-slow" />
          <span>{isSummoned ? 'Wishes Granted! ✨' : props.title || 'Rub the Magic Wishing Lamp'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          {recipientName}'s Birthday Wish Genie
        </h2>
        <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#7D6E63]'}`}>
          {isSummoned
            ? 'The magical smoke has cleared and your 3 birthday wishes are granted!'
            : 'Rub your finger or cursor back and forth over the lamp to awaken the magic.'}
        </p>
      </div>

      {/* Interactive Lamp Graphic */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="my-5 relative flex flex-col items-center justify-center cursor-pointer p-4"
        title="Rub the lamp"
      >
        {/* Swirling Smoke when rubbing */}
        <div className="h-14 flex items-center justify-center relative">
          {isSummoned ? (
            <div className="flex items-center gap-2 animate-bounce">
              <span className="text-2xl animate-spin-slow">✨</span>
              <span className="text-3xl">🧞</span>
              <span className="text-2xl animate-spin-slow">✨</span>
            </div>
          ) : rubProgress > 20 ? (
            <div className="text-xl animate-smoke opacity-70">
              💨 ✦ 💨
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#D4A373] animate-pulse" />
          )}
        </div>

        {/* Magic Lamp SVG */}
        <div className="relative group hover:scale-105 transition-transform duration-200">
          <svg viewBox="0 0 160 100" className="w-48 sm:w-56 h-28 sm:h-32 drop-shadow-lg">
            {/* Lamp base and spout */}
            <path
              d="M30 65 Q45 78 80 78 Q115 78 130 65 Q145 52 140 40 Q130 38 100 45 Q70 48 55 42 Q40 38 30 50 Z"
              fill="url(#goldLampGrad)"
              stroke="#A87239"
              strokeWidth="2"
            />
            {/* Spout tip */}
            <path
              d="M135 45 C150 35 155 25 150 20 C145 22 135 32 125 40 Z"
              fill="#E5B972"
            />
            {/* Handle */}
            <path
              d="M35 55 C15 50 10 25 30 20 C45 15 48 35 40 45"
              fill="none"
              stroke="url(#goldLampGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Stand foot */}
            <ellipse cx="80" cy="80" rx="30" ry="6" fill="#C8934A" />
            <defs>
              <linearGradient id="goldLampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5D8A0" />
                <stop offset="50%" stopColor="#E5B972" />
                <stop offset="100%" stopColor="#C8934A" />
              </linearGradient>
            </defs>
          </svg>

          {!isSummoned && (
            <div className="w-full bg-[#EAE3D9] h-2 rounded-full overflow-hidden mt-2 max-w-[140px] mx-auto border border-[#DDD5C7]">
              <div
                className="h-full bg-gradient-to-r from-[#D4A373] to-[#B85D3B] transition-all duration-75"
                style={{ width: `${rubProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Granted Wishes Display */}
      <div className="w-full max-w-md min-h-[90px] flex items-center justify-center my-2 px-3 z-10">
        {isSummoned ? (
          <div className={`w-full p-4 rounded-2xl shadow-sm border space-y-2 text-left animate-in zoom-in-95 ${isDark ? 'bg-stone-900 border-amber-500/30' : 'bg-[#FFFDF9] border-[#E8DFC8]'}`}>
            <div className="text-[11px] font-serif font-bold text-[#B85D3B] uppercase tracking-wider">
              ✦ 3 Wishes Granted For Your Year ✦
            </div>
            {wishes.map((w, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="text-[#D4A373] font-bold">✨</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[#8C6D53] italic">
            Rub {100 - rubProgress}% more to summon your birthday wishes...
          </div>
        )}
      </div>

      {/* Button fallback */}
      <div className="mt-2 z-10">
        {!isSummoned && (
          <button
            type="button"
            onClick={triggerInstantRub}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Rub Lamp Instantly
          </button>
        )}
      </div>
    </div>
  );
};
