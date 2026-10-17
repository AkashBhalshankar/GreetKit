import React, { useState } from 'react';
import { Sparkles, Gift } from 'lucide-react';
import { FortuneCookieProps, PaletteMode } from '../types/greeting';
import { playPop, playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: FortuneCookieProps;
  accentColor?: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const FortuneCookieEngine: React.FC<Props> = ({
  props,
  accentColor = '#B85D3B',
  recipientName = 'Birthday Star',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const [isBroken, setIsBroken] = useState(false);
  const fortune =
    props.fortuneMessage ||
    `This year will bring unexpected joy, legendary road trips, and boundless love for ${recipientName}!`;
  const luckyNumbers = props.luckyNumbers || '7 · 14 · 21 · 25 · 42';

  const handleBreak = () => {
    if (isBroken || !isInteractive) return;
    setIsBroken(true);
    playPop();
    playChime(850, 0.4);
    setTimeout(() => {
      playTriumph();
      fireCelebration('confetti');
      if (onComplete) onComplete();
    }, 450);
  };

  const isDark = paletteMode === 'midnight';

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none ${isDark ? 'text-stone-100' : 'text-[#2C241E]'}`}>
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase font-medium ${isDark ? 'bg-white/10 text-amber-300 border border-white/10' : 'bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8]'}`}>
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373] animate-spin-slow" />
          <span>{isBroken ? 'Fortune Revealed! 🥠' : props.title || 'Crack Your Birthday Fortune'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          {recipientName}'s Golden Cookie
        </h2>
        <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#7D6E63]'}`}>
          {isBroken
            ? 'Your annual birthday prophecy has been cracked open!'
            : 'Tap the golden crisp cookie to snap it open and reveal your birthday prophecy.'}
        </p>
      </div>

      {/* Interactive Fortune Cookie Visual */}
      <div className="my-6 relative flex flex-col items-center justify-center">
        {!isBroken ? (
          <button
            type="button"
            onClick={handleBreak}
            className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
            title="Tap to crack open"
          >
            {/* Glowing Aura */}
            <div className="absolute w-36 h-36 rounded-full bg-[#D4A373]/30 blur-xl animate-glow-breath" />

            {/* Cookie SVG Graphic */}
            <svg viewBox="0 0 120 100" className="w-36 sm:w-44 h-32 sm:h-36 drop-shadow-md group-hover:rotate-2 transition-transform">
              {/* Crescent Cookie Shape */}
              <path
                d="M10 50 C10 15, 60 10, 60 50 C60 10, 110 15, 110 50 C110 85, 75 90, 60 68 C45 90, 10 85, 10 50 Z"
                fill="url(#cookieGrad)"
                stroke="#C69255"
                strokeWidth="2"
              />
              {/* Center crease */}
              <path
                d="M60 50 C60 58, 60 62, 60 68"
                stroke="#A87239"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="cookieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5D8A0" />
                  <stop offset="50%" stopColor="#E5B972" />
                  <stop offset="100%" stopColor="#C8934A" />
                </linearGradient>
              </defs>
            </svg>

            <span className={`mt-2 text-[11px] font-serif font-bold uppercase tracking-wider animate-pulse ${isDark ? 'text-amber-300' : 'text-[#B85D3B]'}`}>
              ✦ Tap To Crack Open ✦
            </span>
          </button>
        ) : (
          /* Broken Cookie Halves with Unfurled Slip */
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
            {/* Broken halves */}
            <div className="flex items-center gap-12 sm:gap-16 opacity-80">
              <span className="text-4xl transform -rotate-20 transition-transform">🥠</span>
              <span className="text-4xl transform rotate-20 scale-x-[-1] transition-transform">🥠</span>
            </div>

            {/* Unfurled Authentic Paper Slip */}
            <div className={`mt-3 w-full max-w-sm p-4 sm:p-5 rounded-2xl shadow-md border animate-in slide-in-from-bottom-3 duration-500 ${isDark ? 'bg-stone-900 border-amber-500/40 text-stone-100' : 'bg-[#FFFDF9] border-[#E8DFC8] text-[#2C241E]'}`}>
              <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#B85D3B] uppercase mb-1.5 border-b pb-1 border-[#EAE3D9]">
                <span>BIRTHDAY FORTUNE</span>
                <span>★ VERIFIED ★</span>
              </div>
              <p className="text-xs sm:text-sm font-serif font-bold leading-relaxed my-2 italic">
                "{fortune}"
              </p>
              <div className="text-[10px] font-mono text-[#8C6D53] pt-1 flex justify-between">
                <span>LUCKY NUMBERS:</span>
                <span className="font-bold text-[#B85D3B]">{luckyNumbers}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control CTA */}
      <div className="mt-2 z-10">
        {!isBroken ? (
          <button
            type="button"
            onClick={handleBreak}
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Gift className="w-3.5 h-3.5" />
            Crack Open Cookie
          </button>
        ) : (
          <div className="text-xs font-serif text-[#557C4F] bg-[#EBF3E8] border border-[#C5D8C1] px-4 py-1.5 rounded-full font-medium">
            Fortune sealed in the stars ✨
          </div>
        )}
      </div>
    </div>
  );
};
