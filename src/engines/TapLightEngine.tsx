import React, { useState } from 'react';
import { Sparkles, Sun, Flame, Check } from 'lucide-react';
import { TapLightProps } from '../types/greeting';
import { playChime, playTriumph } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: TapLightProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const TapLightEngine: React.FC<Props> = ({
  props,
  accentColor = '#B85D3B',
  recipientName = 'Dear One',
  onComplete,
  isInteractive = true,
}) => {
  const count = Math.max(3, Math.min(8, props.itemsCount || 5));
  const blessings = props.blessings || [];

  const [litState, setLitState] = useState<boolean[]>(() => new Array(count).fill(false));
  const [currentBlessing, setCurrentBlessing] = useState<string | null>(null);
  const [isAllLit, setIsAllLit] = useState(false);

  const litCount = litState.filter(Boolean).length;

  const handleLight = (index: number) => {
    if (!isInteractive || litState[index]) return;

    setLitState((prev) => {
      const next = [...prev];
      next[index] = true;

      const freq = 560 + index * 90;
      playChime(freq, 0.85);

      if (blessings[index]) {
        setCurrentBlessing(blessings[index]);
      }

      if (next.every(Boolean)) {
        setTimeout(() => {
          setIsAllLit(true);
          playTriumph();
          fireCelebration('sparkles');
          if (onComplete) onComplete();
        }, 500);
      }

      return next;
    });
  };

  const lightAllAuto = () => {
    litState.forEach((isLit, idx) => {
      if (!isLit) {
        setTimeout(() => {
          handleLight(idx);
        }, idx * 220);
      }
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium">
          <Sun className="w-3.5 h-3.5 text-[#D4A373] animate-spin-slow" />
          <span>{isAllLit ? 'Radiance Kindled 🪔' : props.title || 'Tap to Light the Diyas'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          {recipientName}'s Festival of Lights
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {isAllLit
            ? 'Every sacred diya is glowing. May boundless prosperity and peace illuminate your days!'
            : 'Tap each handcrafted terracotta diya to kindle its flame and reveal your blessings.'}
        </p>
      </div>

      {/* Terracotta Diyas Row */}
      <div className="w-full my-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 z-10 px-2">
        {litState.map((isLit, idx) => (
          <div
            key={idx}
            onClick={() => handleLight(idx)}
            className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
              isInteractive && !isLit ? 'hover:-translate-y-1 active:scale-95' : ''
            }`}
          >
            {/* Glowing Flame */}
            <div className="h-12 flex items-center justify-center">
              {isLit ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-10 h-10 rounded-full bg-[#F59E0B]/30 blur-md animate-glow-breath" />
                  {/* Diya Flame SVG */}
                  <svg viewBox="0 0 24 36" className="w-7 h-10 animate-flame drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                    <path
                      d="M12 2 C9 10 3 16 3 24 C3 30 7 34 12 34 C17 34 21 30 21 24 C21 16 15 10 12 2 Z"
                      fill="url(#diyaFlameEarthen)"
                    />
                    <path
                      d="M12 14 C10 18 7 21 7 26 C7 29.5 9.2 32 12 32 C14.8 32 17 29.5 17 26 C17 21 14 18 12 14 Z"
                      fill="#FFFBEB"
                    />
                    <defs>
                      <linearGradient id="diyaFlameEarthen" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#C86446" />
                        <stop offset="40%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#FEF08A" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div className="w-1.5 h-3 bg-[#8C6D53] rounded-t-sm" />
              )}
            </div>

            {/* Clay Terracotta Diya Vessel */}
            <div className="relative">
              <div
                className={`w-16 h-7 rounded-b-full shadow-md border-t-2 transition-all duration-300 ${
                  isLit
                    ? 'bg-gradient-to-r from-[#B85D3B] via-[#C86446] to-[#9E4627] border-[#F59E0B] shadow-[#B85D3B]/20'
                    : 'bg-gradient-to-r from-[#C2A895] via-[#B59883] to-[#A38670] border-[#D4C3B4]'
                }`}
              >
                <div className="flex justify-center items-center h-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#EAE3D9]/60 rounded-full" />
            </div>

            {!isLit && isInteractive && (
              <span className="absolute -bottom-5 text-[10px] text-[#B85D3B] font-medium whitespace-nowrap animate-pulse">
                Tap to light
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Blessing Display Card */}
      <div className="w-full max-w-md min-h-[72px] flex items-center justify-center my-2 px-3 z-10">
        {currentBlessing ? (
          <div className="w-full p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFC8] text-xs sm:text-sm text-[#2C241E] shadow-sm animate-in fade-in zoom-in-95 leading-relaxed">
            <span className="font-serif font-bold text-[#B85D3B] mr-1.5">🪔 Sacred Blessing:</span>
            "{currentBlessing}"
          </div>
        ) : (
          <div className="text-xs text-[#9E8E81] italic">
            {!isAllLit ? `${count - litCount} diyas awaiting your warm touch...` : ''}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="flex items-center gap-2 mt-2 z-10">
        {!isAllLit && (
          <button
            type="button"
            onClick={lightAllAuto}
            className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-[#EFE8DC] hover:bg-[#E5DCCF] text-[#4A3E36] border border-[#DDD5C7] transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B85D3B]" />
            Light All Simultaneously
          </button>
        )}
      </div>
    </div>
  );
};
