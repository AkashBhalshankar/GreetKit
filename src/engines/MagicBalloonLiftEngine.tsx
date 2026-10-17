import React, { useState } from 'react';
import { MagicBalloonLiftProps, PaletteMode } from '../types/greeting';
import { playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';
import { Wind, Sparkles, Cloud, ArrowUp } from 'lucide-react';

interface Props {
  props: MagicBalloonLiftProps;
  accentColor?: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const MagicBalloonLiftEngine: React.FC<Props> = ({
  props,
  accentColor = '#B85D3B',
  recipientName = 'Friend',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const [puffs, setPuffs] = useState(0);
  const [isLiftingOff, setIsLiftingOff] = useState(false);
  const [hasSoared, setHasSoared] = useState(false);

  const perks = props.perks || [
    '🎈 Balloon 1 (Coral): Overflowing Joy & Pure Laughter',
    '🎈 Balloon 2 (Golden): Radiant Vitality & Glowing Health',
    '🎈 Balloon 3 (Lavender): Extraordinary Dreams Taking Flight',
    '🎈 Balloon 4 (Mint): Deep Loyal Friendships & Warm Hugs',
    '🎈 Balloon 5 (Sky Blue): Maximum Buoyancy! Lift Off Time!',
  ];

  const balloonColors = [
    { bg: 'from-rose-400 to-rose-600', border: 'border-rose-300', shadow: 'shadow-rose-400/40' },
    { bg: 'from-amber-300 to-amber-500', border: 'border-amber-200', shadow: 'shadow-amber-400/40' },
    { bg: 'from-purple-400 to-purple-600', border: 'border-purple-300', shadow: 'shadow-purple-400/40' },
    { bg: 'from-emerald-400 to-emerald-600', border: 'border-emerald-300', shadow: 'shadow-emerald-400/40' },
    { bg: 'from-sky-400 to-sky-600', border: 'border-sky-300', shadow: 'shadow-sky-400/40' },
  ];

  const handleInflate = () => {
    if (!isInteractive || isLiftingOff || hasSoared) return;

    if (puffs < 4) {
      const next = puffs + 1;
      setPuffs(next);
      playChime(380 + next * 90, 0.2);
    } else if (puffs === 4) {
      // Final 5th puff triggers lift-off!
      setPuffs(5);
      playChime(850, 0.3);
      setIsLiftingOff(true);

      setTimeout(() => {
        playTriumph();
        fireCelebration('balloons');
        setHasSoared(true);
        setIsLiftingOff(false);
        if (onComplete) onComplete();
      }, 1400);
    }
  };

  const scaleClasses = [
    'scale-[0.45] opacity-60',
    'scale-[0.65] opacity-75',
    'scale-[0.82] opacity-85',
    'scale-[0.98] opacity-95',
    'scale-[1.12] opacity-100',
    'scale-[1.20] opacity-100',
  ];

  const isDark = paletteMode === 'midnight';

  return (
    <div className={`relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none overflow-hidden rounded-3xl ${isDark ? 'text-stone-100' : 'text-[#2C241E]'}`}>
      {/* Dynamic Sky Gradient */}
      <div
        className="absolute inset-0 transition-colors duration-1000 -z-10 rounded-3xl"
        style={{
          background: hasSoared
            ? 'linear-gradient(180deg, #F0E6D8 0%, #E8DFC8 50%, #FAF7F2 100%)'
            : isDark
            ? 'linear-gradient(180deg, #181926 0%, #11121c 100%)'
            : 'linear-gradient(180deg, #FFFDF9 0%, #FBF6EE 60%, #FAF7F2 100%)',
        }}
      />

      {/* Floating Watercolor Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5 opacity-40">
        <div
          className={`absolute -left-6 top-16 text-[#D4A373]/60 transition-transform duration-1000 ${
            hasSoared ? 'translate-y-24 scale-110' : 'animate-float'
          }`}
        >
          <Cloud className="w-16 h-16 fill-[#D4A373]/30" />
        </div>
        <div
          className={`absolute right-4 top-32 text-[#B85D3B]/40 transition-transform duration-1000 ${
            hasSoared ? 'translate-y-20 scale-110' : 'animate-float'
          }`}
        >
          <Cloud className="w-20 h-20 fill-[#B85D3B]/20" />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-1.5 mb-2 z-10 w-full max-w-md mx-auto">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase font-medium ${isDark ? 'bg-white/10 text-rose-300 border border-white/10' : 'bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8]'}`}>
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
          <span>{hasSoared ? 'Balloons Lifted Off! 🎈' : props.title || 'Magic Balloon Lift'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          {recipientName}'s Birthday Balloon Lift
        </h2>
        <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#7D6E63]'}`}>
          {hasSoared
            ? `Your birthday wishes have soared into the stratosphere for ${recipientName}!`
            : 'Tap the balloons to pump air into them and watch them lift off!'}
        </p>
      </div>

      {/* Balloon Cluster Interactive Canvas */}
      <div
        onClick={handleInflate}
        className={`my-4 relative w-64 h-64 flex flex-col items-center justify-center cursor-pointer transition-transform duration-1000 ${
          isLiftingOff ? '-translate-y-48 scale-90 opacity-90' : hasSoared ? '-translate-y-36 scale-95' : 'hover:scale-105 active:scale-95'
        }`}
        title="Tap to inflate balloons!"
      >
        {/* Festive Balloons Bouquet */}
        <div className={`relative w-48 h-44 flex items-center justify-center transition-all duration-300 ${scaleClasses[puffs]}`}>
          {/* Balloon 1: Top Center */}
          <div className={`absolute top-0 left-16 w-16 h-20 rounded-full bg-gradient-to-tr ${balloonColors[0].bg} ${balloonColors[0].border} border-2 shadow-lg ${balloonColors[0].shadow} transform -rotate-3`}>
            <div className="w-3 h-4 bg-white/40 rounded-full ml-3 mt-2 transform -rotate-12" />
          </div>
          {/* Balloon 2: Top Left */}
          <div className={`absolute top-4 left-4 w-16 h-20 rounded-full bg-gradient-to-tr ${balloonColors[1].bg} ${balloonColors[1].border} border-2 shadow-lg ${balloonColors[1].shadow} transform -rotate-12`}>
            <div className="w-3 h-4 bg-white/40 rounded-full ml-3 mt-2 transform -rotate-12" />
          </div>
          {/* Balloon 3: Top Right */}
          <div className={`absolute top-4 right-4 w-16 h-20 rounded-full bg-gradient-to-tr ${balloonColors[2].bg} ${balloonColors[2].border} border-2 shadow-lg ${balloonColors[2].shadow} transform rotate-12`}>
            <div className="w-3 h-4 bg-white/40 rounded-full ml-3 mt-2 transform -rotate-12" />
          </div>
          {/* Balloon 4: Mid Left */}
          <div className={`absolute top-14 left-10 w-16 h-20 rounded-full bg-gradient-to-tr ${balloonColors[3].bg} ${balloonColors[3].border} border-2 shadow-lg ${balloonColors[3].shadow} transform -rotate-6`}>
            <div className="w-3 h-4 bg-white/40 rounded-full ml-3 mt-2 transform -rotate-12" />
          </div>
          {/* Balloon 5: Mid Right */}
          <div className={`absolute top-14 right-10 w-16 h-20 rounded-full bg-gradient-to-tr ${balloonColors[4].bg} ${balloonColors[4].border} border-2 shadow-lg ${balloonColors[4].shadow} transform rotate-6`}>
            <div className="w-3 h-4 bg-white/40 rounded-full ml-3 mt-2 transform -rotate-12" />
          </div>

          {/* Balloon Tied Knot & Strings */}
          <div className="absolute -bottom-6 flex flex-col items-center">
            <div className="w-3 h-2 bg-stone-700 rounded-sm" />
            <svg className="w-20 h-16 text-stone-400/80 -mt-0.5">
              <path d="M 10 0 Q 30 20 40 50" stroke="currentColor" fill="transparent" strokeWidth="1.2" />
              <path d="M 40 0 Q 40 20 40 50" stroke="currentColor" fill="transparent" strokeWidth="1.2" />
              <path d="M 70 0 Q 50 20 40 50" stroke="currentColor" fill="transparent" strokeWidth="1.2" />
            </svg>
          </div>
        </div>

        {/* Personalized Birthday Banner tied below the basket */}
        <div className="mt-8 z-10 animate-bounce-slow">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#E8DFC8] shadow-md text-xs sm:text-sm font-serif font-bold text-[#B85D3B] flex items-center gap-1.5">
            <span>🎉 {props.bannerMessage || `Happy Birthday, ${recipientName}!`} 🎉</span>
          </div>
        </div>
      </div>

      {/* Active Perk Unlocked Display */}
      <div className="w-full max-w-md min-h-[56px] flex items-center justify-center my-1 px-3 z-10">
        {puffs > 0 ? (
          <div className={`w-full p-3 rounded-2xl shadow-sm border text-xs sm:text-sm font-serif font-medium leading-relaxed animate-in fade-in zoom-in-95 ${isDark ? 'bg-stone-900 border-white/10 text-stone-200' : 'bg-[#FFFDF9] border-[#E8DFC8]'}`}>
            {perks[puffs - 1]}
          </div>
        ) : (
          <div className="text-xs text-[#8C6D53] italic">
            Tap balloons to inflate buoyancy (0/5 Full)...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-2 z-10">
        {!hasSoared && (
          <button
            type="button"
            onClick={handleInflate}
            disabled={isLiftingOff}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md transition-all active:scale-95"
          >
            <ArrowUp className="w-4 h-4 animate-bounce" />
            <span>{puffs === 0 ? 'Tap to Inflate Balloons! 🎈' : puffs === 4 ? 'Final Tap: Launch Lift Off! 🚀' : `Inflate Balloons (${puffs}/5)`}</span>
          </button>
        )}

        {hasSoared && (
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
