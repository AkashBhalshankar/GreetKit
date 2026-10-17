import React, { useState } from 'react';
import { ConstellationProps, PaletteMode } from '../types/greeting';
import { playStarlightPing, playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';
import { Sparkles, Star, CheckCircle2 } from 'lucide-react';

interface Props {
  props: ConstellationProps;
  accentColor: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete: () => void;
  isInteractive?: boolean;
}

interface LetterStar {
  id: number;
  letter: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  blessing: string;
}

export const ConstellationEngine: React.FC<Props> = ({
  props,
  accentColor,
  recipientName = 'Star',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  // Extract clean letters from recipient's nickname/name (3 to 6 chars)
  const rawLetters = (recipientName || 'STAR')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6);
  const activeName = rawLetters.length >= 2 ? rawLetters : 'STAR';
  const letterArray = activeName.split('');

  const letterBlessingMap: Record<string, string> = {
    A: 'Authenticity & boundless radiant joy in all you touch',
    B: 'Brilliance, courage, and a fierce, loyal heart',
    C: 'Creativity that turns everyday moments into pure magic',
    D: 'Delight, boundless dreams, and heartwarming laughs',
    E: 'Endless wonder, empathy, and electrifying energy',
    F: 'Fearless spirit, fun adventures, and true warmth',
    G: 'Grace, golden kindness, and inspiring triumphs',
    H: 'Heartfelt loyalty and making everyone feel cherished',
    I: 'Infectious laughter and deep, sparkling wisdom',
    J: 'Joy that lights up every room the second you walk in',
    K: 'Kindness, sharp wit, and an unstoppable spark',
    L: 'Limitless potential and love that knows no bounds',
    M: 'Magnetic personality and legendary humor',
    N: 'Natural brilliance, empathy, and uplifting vibes',
    O: 'Optimism, great taste, and unforgettable moments',
    P: 'Pure radiance, warmth, and irresistible charm',
    Q: 'Quiet strength, originality, and regal poise',
    R: 'Resilience, wild adventures, and joyful courage',
    S: 'Sunshine, deep loyalty, and a soul made of starlight',
    T: 'Tenacity, sweet affection, and genuine warmth',
    U: 'Unstoppable drive and a wonderfully unique spirit',
    V: 'Vitality, vivid dreams, and victory in all you do',
    W: 'Warmth, wisdom, and wild belly laughs together',
    X: 'Extraordinary brilliance that defies every ceiling',
    Y: 'Youthful wonder, vibrant heart, and deep soul',
    Z: 'Zest for life and dazzling unforgettable spark',
  };

  // Position letter stars in an organic celestial arc
  const total = letterArray.length;
  const stars: LetterStar[] = letterArray.map((letter, idx) => {
    let x = 50;
    let y = 45;
    if (total === 1) {
      x = 50;
      y = 45;
    } else {
      const step = 70 / (total - 1);
      x = 15 + idx * step;
      // Arc wave: middle stars slightly higher or alternating
      const arcOffset = Math.sin((idx / (total - 1)) * Math.PI) * -16;
      y = 50 + arcOffset;
    }

    const blessing =
      letterBlessingMap[letter] ||
      `Radiant starlight blessing of love and laughter for ${recipientName}`;

    return {
      id: idx,
      letter,
      x,
      y,
      blessing,
    };
  });

  const [connectedIds, setConnectedIds] = useState<number[]>([]);
  const [activeBlessing, setActiveBlessing] = useState<string | null>(null);
  const isComplete = connectedIds.length === stars.length;

  const handleStarClick = (starIndex: number) => {
    if (!isInteractive) return;

    if (!connectedIds.includes(starIndex)) {
      const nextConnected = [...connectedIds, starIndex];
      setConnectedIds(nextConnected);
      playStarlightPing(starIndex);
      setActiveBlessing(
        `✦ Star Letter [${stars[starIndex].letter}]: ${stars[starIndex].blessing}`
      );

      if (nextConnected.length === stars.length) {
        setTimeout(() => {
          playTriumph();
          fireCelebration('sparkles');
        }, 350);
      }
    } else {
      playChime(640, 0.2);
      setActiveBlessing(
        `✦ Star Letter [${stars[starIndex].letter}]: ${stars[starIndex].blessing}`
      );
    }
  };

  const isBright = paletteMode === 'bright';
  const isMidnight = paletteMode === 'midnight';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-2 px-2 sm:px-4 text-center select-none">
      {/* Header */}
      <div className="space-y-1 mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
          <span>Constellation Stars · Name Weaver</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-serif font-bold ${
            isMidnight ? 'text-stone-100' : isBright ? 'text-rose-900' : 'text-[#2C241E]'
          }`}
        >
          {props.title || `Weave ${recipientName}'s Star Constellation`}
        </h2>
        <p
          className={`text-xs ${
            isMidnight ? 'text-stone-400' : isBright ? 'text-rose-700/80' : 'text-[#7D6E63]'
          }`}
        >
          {!isComplete
            ? `Tap each glowing letter star to weave ${recipientName}'s celestial constellation (${connectedIds.length}/${stars.length})`
            : `✨ ${recipientName}'s name constellation is complete! Golden starlight unlocked!`}
        </p>
      </div>

      {/* Interactive Celestial Sky Canvas */}
      <div
        className={`relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border shadow-inner transition-colors duration-500 ${
          isMidnight
            ? 'bg-gradient-to-b from-[#090A17] via-[#10122B] to-[#181635] border-indigo-900/40'
            : isBright
            ? 'bg-gradient-to-b from-[#FFF0F7] via-[#F5EAFF] to-[#E5EDFF] border-purple-200'
            : 'bg-gradient-to-b from-[#161B22] via-[#212732] to-[#191F28] border-stone-700 text-stone-100'
        }`}
      >
        {/* Subtle twinkling background stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/70 rounded-full animate-twinkle"
              style={{
                top: `${(i * 17) % 92}%`,
                left: `${(i * 29) % 94}%`,
                animationDelay: `${(i * 160) % 1800}ms`,
              }}
            />
          ))}
        </div>

        {/* Name watermark across galaxy background */}
        <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none opacity-20">
          <span className="font-serif tracking-[0.3em] font-extrabold text-3xl sm:text-4xl text-white">
            {activeName}
          </span>
        </div>

        {/* SVG Starlight Constellation Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {stars.map((star, idx) => {
            if (idx === 0) return null;
            const prevStar = stars[idx - 1];
            const isLineActive =
              connectedIds.includes(star.id) && connectedIds.includes(prevStar.id);

            if (!isLineActive) return null;

            return (
              <g key={idx}>
                {/* Glow shadow line */}
                <line
                  x1={`${prevStar.x}%`}
                  y1={`${prevStar.y}%`}
                  x2={`${star.x}%`}
                  y2={`${star.y}%`}
                  stroke={isBright ? '#D946EF' : '#FBBF24'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                {/* Laser core line */}
                <line
                  x1={`${prevStar.x}%`}
                  y1={`${prevStar.y}%`}
                  x2={`${star.x}%`}
                  y2={`${star.y}%`}
                  stroke={isBright ? '#9333EA' : '#FEF08A'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Star Interactive Nodes with Recipient Letters */}
        {stars.map((star) => {
          const isConnected = connectedIds.includes(star.id);
          return (
            <button
              key={star.id}
              type="button"
              onClick={() => handleStarClick(star.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group p-2 cursor-pointer outline-none focus:outline-none transition-transform duration-200 active:scale-90"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              title={`Tap to connect Star Letter ${star.letter}`}
            >
              {/* Outer pulsing aura */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isConnected
                    ? 'bg-amber-400/30 scale-110 shadow-lg shadow-amber-400/50'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {/* Star Core with Big Letter */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300 border ${
                    isConnected
                      ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-100 text-stone-950 border-amber-300 scale-110 shadow-amber-400/80 ring-2 ring-amber-300/60'
                      : 'bg-stone-800/80 text-white/90 border-white/30 hover:border-white/60'
                  }`}
                >
                  <span className="font-serif font-black text-sm tracking-tight">
                    {star.letter}
                  </span>
                </div>
              </div>

              {/* Star Indicator Pip */}
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <Star
                  className={`w-2.5 h-2.5 ${
                    isConnected ? 'fill-amber-400 text-amber-500' : 'text-stone-400/60'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono font-bold ${
                    isConnected ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {star.id + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Blessing Card display */}
      <div className="w-full mt-3 min-h-[64px]">
        {activeBlessing ? (
          <div
            className={`p-3.5 rounded-2xl border shadow-sm text-left animate-in fade-in slide-in-from-bottom-1 duration-300 ${
              isMidnight
                ? 'bg-stone-900 border-indigo-900/50 text-stone-200'
                : isBright
                ? 'bg-white border-purple-200 text-purple-950'
                : 'bg-[#FFFDF9] border-[#E8DFC8] text-[#2C241E]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base text-amber-500 shrink-0">✨</span>
              <p className="text-xs sm:text-sm font-serif font-medium leading-relaxed">
                {activeBlessing}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#9E8E81] italic">
            Tap the star letters to illuminate {recipientName}'s celestial constellation!
          </p>
        )}
      </div>

      {/* Completion Banner & Next Step */}
      {isComplete && (
        <div className="mt-3 animate-in zoom-in-95 duration-300">
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md active:scale-95 transition-all"
          >
            Read Birthday Letter →
          </button>
        </div>
      )}
    </div>
  );
};
