import React, { useState } from 'react';
import { Droplet, Sparkles, Sun } from 'lucide-react';
import { GrowProps } from '../types/greeting';
import { playBloom, playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: GrowProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const GrowEngine: React.FC<Props> = ({
  props,
  recipientName = 'Dear One',
  onComplete,
  isInteractive = true,
}) => {
  const [stage, setStage] = useState(0);
  const [isFullyBloomed, setIsFullyBloomed] = useState(false);

  const stagesNotes = props.stages || [
    'A seed of love planted in the heart...',
    'Nurtured with cherished memories and warmth...',
    'Unfurling tender leaves toward the morning sun...',
    'In full, breathtaking bloom for you!',
  ];

  const handleWater = () => {
    if (stage >= 3 || !isInteractive) return;

    const nextStage = stage + 1;
    setStage(nextStage);
    playChime(500 + nextStage * 120, 0.4);

    if (nextStage === 3) {
      setTimeout(() => {
        setIsFullyBloomed(true);
        playBloom();
        playTriumph();
        fireCelebration('sparkles');
        if (onComplete) onComplete();
      }, 500);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#557C4F] font-medium bg-[#EBF3E8] border border-[#C5D8C1]">
          <Sun className="w-3.5 h-3.5 text-[#D4A373] animate-spin-slow" />
          <span>{isFullyBloomed ? 'Fully Bloomed! 🌸' : props.title || 'Tap to Water & Bloom'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          {recipientName}'s Garden of Blessings
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {isFullyBloomed
            ? 'May your days continue to bloom in vibrant, peaceful abundance!'
            : 'Tap the water droplet to help this sacred flower blossom.'}
        </p>
      </div>

      {/* Flower Illustration in Terracotta Planter */}
      <div className="my-6 relative flex flex-col items-center justify-center h-48">
        {stage === 0 && (
          <div className="flex flex-col items-center animate-fade-in">
            <span className="text-3xl">🌰</span>
            <span className="text-xs text-[#8C6D53] mt-2 font-medium">Seed Resting in Earth</span>
          </div>
        )}

        {stage === 1 && (
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-4xl">🌱</span>
            <span className="text-xs text-[#557C4F] mt-2 font-medium">Tender Sprout Reaching Up</span>
          </div>
        )}

        {stage === 2 && (
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-5xl">🌿🌷</span>
            <span className="text-xs text-[#B85D3B] mt-2 font-medium">Bud Ready to Open</span>
          </div>
        )}

        {stage === 3 && (
          <div className="flex flex-col items-center animate-in zoom-in-75 duration-700">
            <div className="text-7xl filter drop-shadow-[0_4px_12px_rgba(200,100,70,0.3)]">🌸</div>
            <span className="text-xs font-serif font-bold text-[#B85D3B] mt-2">Radiant Sacred Blossom</span>
          </div>
        )}

        {/* Terracotta Planter Pot */}
        <div className="w-24 sm:w-28 h-9 bg-gradient-to-r from-[#B85D3B] via-[#C86446] to-[#A14F33] rounded-b-2xl border-t-2 border-[#D4A373] shadow-md mt-3 flex items-center justify-center">
          <div className="w-16 h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Stage Note */}
      <div className="w-full max-w-md min-h-[50px] flex items-center justify-center my-2 px-3">
        <p className="text-xs sm:text-sm font-serif italic text-[#4A3E36] bg-[#FAF4EB] p-3 rounded-2xl border border-[#E8DFC8]">
          "{stagesNotes[stage]}"
        </p>
      </div>

      {/* Water Action Button */}
      <div className="mt-2 z-10">
        {!isFullyBloomed && (
          <button
            type="button"
            onClick={handleWater}
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold bg-[#557C4F] hover:bg-[#43643E] text-white shadow-md shadow-[#557C4F]/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Droplet className="w-4 h-4 fill-current text-[#DDF0D8]" />
            Pour Water (Stage {stage + 1}/4)
          </button>
        )}
      </div>
    </div>
  );
};
