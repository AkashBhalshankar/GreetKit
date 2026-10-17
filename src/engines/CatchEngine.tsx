import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Trophy } from 'lucide-react';
import { CatchProps } from '../types/greeting';
import { playChime, playTriumph } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: CatchProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const CatchEngine: React.FC<Props> = ({
  props,
  recipientName = 'Friend',
  onComplete,
  isInteractive = true,
}) => {
  const target = props.targetScore || 5;
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState<Array<{ id: number; left: number; top: number }>>([]);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setStars((prev) => {
        if (prev.length >= 4) return prev;
        const newStar = {
          id: Math.random(),
          left: Math.floor(Math.random() * 80) + 10,
          top: Math.floor(Math.random() * 60) + 20,
        };
        return [...prev, newStar];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isWon]);

  const catchStar = (id: number) => {
    if (!isInteractive || isWon) return;

    setStars((prev) => prev.filter((s) => s.id !== id));
    const nextScore = score + 1;
    setScore(nextScore);
    playChime(600 + nextScore * 100, 0.2);

    if (nextScore >= target) {
      setIsWon(true);
      setStars([]);
      playTriumph();
      fireCelebration('sparkles');
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none overflow-hidden text-[#2C241E]">
      <div className="space-y-1.5 mb-2 z-10 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-[#FAF4EB] border border-[#E8DFC8]">
          <Trophy className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{isWon ? 'Target Caught! 🌟' : props.title || 'Catch 5 Lucky Stars'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          Catch Good Fortune for {recipientName}
        </h2>
        <div className="text-xs font-mono text-[#8C6D53]">
          STARS CAUGHT: <span className="font-bold text-[#B85D3B]">{score}</span> / {target}
        </div>
      </div>

      {/* Play Area with Warm Linen Canvas */}
      <div className="relative w-full max-w-sm h-60 rounded-3xl bg-[#FAF7F2] border-2 border-[#E8DFC8] my-4 overflow-hidden shadow-inner">
        {stars.map((star) => (
          <button
            key={star.id}
            type="button"
            onClick={() => catchStar(star.id)}
            style={{ left: `${star.left}%`, top: `${star.top}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-2 text-2xl sm:text-3xl hover:scale-125 active:scale-90 transition-transform animate-twinkle cursor-pointer"
          >
            ⭐
          </button>
        ))}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in zoom-in-95 p-4">
            <Sparkles className="w-10 h-10 text-[#D4A373] mb-2 animate-bounce" />
            <p className="text-sm font-serif font-bold text-[#2C241E]">
              {props.completionMessage || 'All blessings caught! Wishing you endless good luck!'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 z-10">
        {!isWon && (
          <button
            type="button"
            onClick={() => {
              setScore(target);
              setIsWon(true);
              setStars([]);
              playTriumph();
              fireCelebration('sparkles');
              if (onComplete) onComplete();
            }}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#FAF4EB] hover:bg-[#F0E4D5] text-[#2C241E] border border-[#E8DFC8] shadow-sm transition-all active:scale-95"
          >
            Catch All Fast ✨
          </button>
        )}
      </div>
    </div>
  );
};
