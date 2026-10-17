import React, { useState } from 'react';
import { Rocket, Sparkles, Wind, Cloud, Compass } from 'lucide-react';
import { LiftOffProps } from '../types/greeting';
import { playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: LiftOffProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const LiftOffEngine: React.FC<Props> = ({
  props,
  accentColor = '#B85D3B',
  recipientName = 'Traveler',
  onComplete,
  isInteractive = true,
}) => {
  const [altitude, setAltitude] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [reachedOrbit, setReachedOrbit] = useState(false);

  const bannerMessage = props.bannerMessage || `Soaring higher this birthday, ${recipientName}!`;
  const vesselType = props.vesselType || 'balloon';

  const handleLaunch = () => {
    if (isLaunching || reachedOrbit || !isInteractive) return;

    setIsLaunching(true);
    let alt = 0;
    const interval = setInterval(() => {
      alt += 100;
      setAltitude(alt);
      if (alt % 500 === 0) {
        playChime(500 + alt / 10, 0.1);
      }

      if (alt >= 3000) {
        clearInterval(interval);
        setReachedOrbit(true);
        setIsLaunching(false);
        playTriumph();
        fireCelebration('confetti');
        if (onComplete) onComplete();
      }
    }, 80);
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none overflow-hidden rounded-3xl text-[#2C241E]">
      {/* Dynamic light sky gradient with earthen warmth */}
      <div
        className="absolute inset-0 transition-colors duration-1000 -z-10 rounded-3xl"
        style={{
          background:
            altitude > 2000
              ? 'linear-gradient(180deg, #F0E6D8 0%, #E8DFC8 50%, #FAF7F2 100%)'
              : altitude > 1000
              ? 'linear-gradient(180deg, #FBF6EE 0%, #F5ECE0 60%, #FAF7F2 100%)'
              : 'linear-gradient(180deg, #FFFDF9 0%, #FBF6EE 100%)',
        }}
      />

      {/* Floating watercolor clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5 opacity-40">
        <div
          className="absolute -left-6 top-16 text-[#D4A373]/60 transition-transform duration-700 animate-float"
          style={{ transform: `translateY(${altitude * 0.15}px)` }}
        >
          <Cloud className="w-16 h-16 fill-[#D4A373]/30" />
        </div>
        <div
          className="absolute right-4 top-36 text-[#B85D3B]/40 transition-transform duration-700 animate-float"
          style={{ transform: `translateY(${altitude * 0.1}px)` }}
        >
          <Cloud className="w-20 h-20 fill-[#B85D3B]/20" />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-1.5 mb-2 z-10 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-white/80 border border-[#E8DFC8]">
          <Compass className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{reachedOrbit ? 'Stratosphere Reached! 🚀' : props.title || 'Tap to Launch Flight'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          {recipientName}'s Grand Ascent
        </h2>
        <div className="text-xs font-mono text-[#8C6D53]">
          ALTITUDE: <span className="font-bold text-[#B85D3B]">{altitude} FT</span>
        </div>
      </div>

      {/* Hot air balloon in Terracotta, Ochre & Linen */}
      <div className="my-6 relative z-10 flex flex-col items-center">
        {vesselType === 'balloon' ? (
          <div
            className={`flex flex-col items-center transition-transform duration-700 ${
              isLaunching ? 'animate-bounce' : 'animate-float'
            }`}
          >
            {/* Balloon Dome */}
            <div className="w-24 sm:w-28 h-28 sm:h-32 rounded-t-full rounded-b-2xl bg-gradient-to-tr from-[#B85D3B] via-[#D4A373] to-[#C86446] shadow-md border-2 border-white flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex justify-around">
                <div className="w-2.5 h-full bg-white/40" />
                <div className="w-2.5 h-full bg-white/40" />
              </div>
              <span className="text-2xl z-10">✨</span>
            </div>
            {/* Rigging strings */}
            <div className="w-8 h-4 border-x-2 border-[#8C6D53] my-0.5" />
            {/* Wicker Basket */}
            <div className="w-10 h-7 bg-[#A67C52] rounded-sm shadow-sm border border-[#8C6D53] flex items-center justify-center text-xs text-[#FAF7F2]">
              🧺
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center transition-transform duration-700 ${
              isLaunching ? 'animate-pulse' : 'animate-float'
            }`}
          >
            <div className="text-5xl drop-shadow-md">🚀</div>
            {isLaunching && <div className="text-2xl animate-ping">🔥</div>}
          </div>
        )}

        {/* Stratosphere Banner Message */}
        {reachedOrbit && (
          <div className="mt-4 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] text-[#2C241E] font-serif font-semibold text-xs sm:text-sm shadow-md border border-[#E8DFC8] animate-in zoom-in-90 max-w-sm">
            🎉 {bannerMessage}
          </div>
        )}
      </div>

      {/* Launch Control CTA */}
      <div className="mt-2 z-10">
        {!reachedOrbit ? (
          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLaunching}
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold tracking-wide bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            {isLaunching ? 'Ascending Into Sky...' : 'Ignite Thrusters & Lift Off!'}
          </button>
        ) : (
          <div className="text-xs font-medium text-[#557C4F] bg-[#EBF3E8] border border-[#C5D8C1] px-4 py-1.5 rounded-full">
            The sky is just the beginning! ✨
          </div>
        )}
      </div>
    </div>
  );
};
