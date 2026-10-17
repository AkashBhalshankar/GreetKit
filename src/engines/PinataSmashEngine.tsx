import React, { useState } from 'react';
import { PinataProps, PaletteMode } from '../types/greeting';
import { playPinataWhack, playPartyHorn, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';
import { Sparkles, Trophy, Heart, Gift, Award } from 'lucide-react';

interface Props {
  props: PinataProps;
  accentColor: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete: () => void;
  isInteractive?: boolean;
}

export const PinataSmashEngine: React.FC<Props> = ({
  props,
  accentColor,
  recipientName = 'Friend',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const swingsTotal = props.swingsNeeded || 4;
  const [swingsDone, setSwingsDone] = useState(0);
  const [wobbleAngle, setWobbleAngle] = useState(0);
  const [isBurst, setIsBurst] = useState(false);
  const [revealedWishes, setRevealedWishes] = useState<string[]>([]);

  const defaultWishes = [
    `Happy Birthday ${recipientName}! May this year shatter every boundary!`,
    'May your days overflow with laughter, sweet treats, and loyal friends!',
    'Here is to leveling up your wildest dreams with endless energy!',
    'You are pure magic and joy to everyone lucky enough to know you!',
  ];

  const wishes = props.wishes && props.wishes.length > 0 ? props.wishes : defaultWishes;
  const goodies = props.goodies || ['🍬', '🍭', '⭐', '✨', '🍫', '🎉', '🎁'];

  const handleSwing = () => {
    if (!isInteractive || isBurst) return;

    const nextSwings = swingsDone + 1;
    setSwingsDone(nextSwings);

    // Random wobble angle
    const angle = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 12);
    setWobbleAngle(angle);
    setTimeout(() => setWobbleAngle(0), 300);

    if (nextSwings >= swingsTotal) {
      // BURST!
      setIsBurst(true);
      playPinataWhack(true);
      playPartyHorn();
      fireCelebration('confetti');
      setRevealedWishes(wishes);
    } else {
      // Impact hit
      playPinataWhack(false);
      // Small sparkle burst
      fireCelebration('sparkles');
    }
  };

  const isBright = paletteMode === 'bright';
  const isMidnight = paletteMode === 'midnight';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-3 px-2 sm:px-4 text-center">
      {/* Title Header */}
      <div className="space-y-1 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>Birthday Piñata Fiesta</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-serif font-bold ${
            isMidnight ? 'text-stone-100' : isBright ? 'text-rose-900' : 'text-[#2C241E]'
          }`}
        >
          {props.title || `Smash the Piñata for ${recipientName}!`}
        </h2>
        <p
          className={`text-xs ${
            isMidnight ? 'text-stone-400' : isBright ? 'text-rose-700/80' : 'text-[#7D6E63]'
          }`}
        >
          {!isBurst
            ? `Tap the piñata to swing! (${swingsDone}/${swingsTotal} hits)`
            : '¡VIVA! All birthday goodies and wishes unlocked!'}
        </p>
      </div>

      {/* Hit Counter Gauge Bar */}
      <div className="w-full max-w-xs mb-5 px-4">
        <div className="w-full h-2.5 rounded-full bg-stone-200/60 overflow-hidden p-0.5 border border-stone-300/40">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isBright
                ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-amber-500 to-[#B85D3B]'
            }`}
            style={{ width: `${Math.min(100, (swingsDone / swingsTotal) * 100)}%` }}
          />
        </div>
      </div>

      {/* Interactive Piñata Canvas / Visual Container */}
      <div className="relative w-full flex flex-col items-center justify-center my-2 min-h-[240px]">
        {/* Hanging Rope */}
        <div className="w-0.5 h-10 bg-amber-800/40 border-dashed border-l border-amber-900/60 mb-[-4px]" />

        {/* The Piñata Graphic (Interactive button) */}
        {!isBurst ? (
          <button
            type="button"
            onClick={handleSwing}
            className="group relative cursor-pointer outline-none focus:outline-none transition-transform duration-200 active:scale-95"
            style={{
              transform: `rotate(${wobbleAngle}deg)`,
              transformOrigin: 'top center',
            }}
            title="Tap to swing at the Piñata!"
          >
            {/* Piñata SVG Illustration with bright rainbow fringes */}
            <svg
              className="w-48 h-48 sm:w-56 sm:h-56 drop-shadow-xl select-none"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Hanging Ring */}
              <circle cx="100" cy="18" r="8" stroke="#D4A373" strokeWidth="3" fill="none" />

              {/* Star Cones */}
              <polygon points="100,24 116,68 84,68" fill="#FF4365" />
              <polygon points="100,176 116,132 84,132" fill="#00C2CB" />
              <polygon points="24,100 68,116 68,84" fill="#FFAA00" />
              <polygon points="176,100 132,116 132,84" fill="#8A2BE2" />

              {/* Diagonals */}
              <polygon points="46,46 80,72 68,84" fill="#FF2E93" />
              <polygon points="154,46 120,72 132,84" fill="#00E676" />
              <polygon points="46,154 80,128 68,116" fill="#FF9100" />
              <polygon points="154,154 120,128 132,116" fill="#D500F9" />

              {/* Center Piñata Core Sphere */}
              <circle cx="100" cy="100" r="42" fill="#FFD54F" />

              {/* Colorful Fringe Bands */}
              <path d="M 62 82 Q 100 95 138 82" stroke="#FF4365" strokeWidth="7" fill="none" />
              <path d="M 60 100 Q 100 115 140 100" stroke="#00C2CB" strokeWidth="7" fill="none" />
              <path d="M 64 118 Q 100 132 136 118" stroke="#8A2BE2" strokeWidth="7" fill="none" />

              {/* Streamer Tassels on cones */}
              <path d="M 100 176 Q 96 195 90 200" stroke="#FFAA00" strokeWidth="2.5" />
              <path d="M 100 176 Q 104 195 110 200" stroke="#FF4365" strokeWidth="2.5" />
              <path d="M 24 100 Q 10 96 5 90" stroke="#00C2CB" strokeWidth="2.5" />
              <path d="M 176 100 Q 190 104 195 110" stroke="#8A2BE2" strokeWidth="2.5" />

              {/* Cute smiling face */}
              <circle cx="88" cy="98" r="4" fill="#2C241E" />
              <circle cx="112" cy="98" r="4" fill="#2C241E" />
              <path
                d="M 94 106 Q 100 112 106 106"
                stroke="#2C241E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="82" cy="104" r="3.5" fill="#FF8A80" opacity="0.8" />
              <circle cx="118" cy="104" r="3.5" fill="#FF8A80" opacity="0.8" />

              {/* Crack lines if hit */}
              {swingsDone >= 1 && (
                <path d="M 90 70 L 96 85 L 92 95" stroke="#2C241E" strokeWidth="2" fill="none" />
              )}
              {swingsDone >= 2 && (
                <path d="M 120 75 L 112 90 L 118 105" stroke="#2C241E" strokeWidth="2" fill="none" />
              )}
              {swingsDone >= 3 && (
                <path d="M 75 110 L 88 115 L 82 125" stroke="#2C241E" strokeWidth="2" fill="none" />
              )}
            </svg>

            {/* Swing Baton Hint */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 shadow-sm border border-stone-200 text-[#B85D3B] group-hover:scale-105 transition-transform">
              <span>🏏 Tap to Whack!</span>
            </div>
          </button>
        ) : (
          /* Burst State: Exploding Candies & Goodies */
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500 space-y-4">
            {/* Burst Goodies shower */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {goodies.map((g, idx) => (
                <span
                  key={idx}
                  className="text-2xl sm:text-3xl animate-bounce"
                  style={{ animationDelay: `${idx * 120}ms` }}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Unfolded Birthday Wishes Cards */}
            <div className="w-full space-y-2.5 max-w-md">
              {revealedWishes.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-left border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isMidnight
                      ? 'bg-stone-900 border-stone-800 text-stone-200'
                      : isBright
                      ? 'bg-white border-rose-200 text-rose-950 shadow-rose-100'
                      : 'bg-[#FFFDF9] border-[#E8DFC8] text-[#2C241E]'
                  }`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ★
                    </span>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{w}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onComplete}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md active:scale-95 transition-all"
              >
                Continue to Birthday Note →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
