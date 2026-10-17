import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PopProps } from '../types/greeting';
import { playPop, playTriumph } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: PopProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

const EARTHEN_BALLOON_COLORS = [
  'from-[#B85D3B] to-[#C86446]', // Terracotta
  'from-[#D4A373] to-[#E2B886]', // Warm Ochre
  'from-[#557C4F] to-[#749A6E]', // Sage
  'from-[#8C6D53] to-[#A67C52]', // Warm Clay
  'from-[#C27D66] to-[#D99B85]', // Terracotta Rose
];

export const PopEngine: React.FC<Props> = ({
  props,
  recipientName = 'Friend',
  onComplete,
  isInteractive = true,
}) => {
  const count = Math.max(3, Math.min(6, props.balloonsCount || 5));
  const messages = props.messages || [
    'Pure Joy!',
    'Wild Success!',
    'Great Health!',
    'Laughter Always!',
    'Infinite Love!',
  ];

  const [popped, setPopped] = useState<boolean[]>(() => new Array(count).fill(false));
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [allPopped, setAllPopped] = useState(false);

  const handlePop = (index: number) => {
    if (!isInteractive || popped[index]) return;

    setPopped((prev) => {
      const next = [...prev];
      next[index] = true;

      playPop();

      if (messages[index]) {
        setCurrentMessage(messages[index]);
      }

      if (next.every(Boolean)) {
        setTimeout(() => {
          setAllPopped(true);
          playTriumph();
          fireCelebration('balloons');
          if (onComplete) onComplete();
        }, 400);
      }

      return next;
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-[#FAF4EB] border border-[#E8DFC8]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{allPopped ? 'All Popped! 🎈' : props.title || 'Pop the Balloons'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          Pop To Discover For {recipientName}
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {allPopped ? 'Every surprise revealed!' : 'Tap each floating party balloon to pop and reveal a wish'}
        </p>
      </div>

      {/* Floating Balloons Cluster */}
      <div className="my-6 flex flex-wrap justify-center items-center gap-4 sm:gap-6 max-w-sm z-10">
        {popped.map((isPopped, idx) => (
          <div
            key={idx}
            onClick={() => handlePop(idx)}
            className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
              !isPopped && isInteractive ? 'hover:scale-110 active:scale-90 animate-float' : ''
            }`}
            style={{ animationDelay: `${idx * 250}ms` }}
          >
            {!isPopped ? (
              <div className="flex flex-col items-center">
                {/* Balloon Body */}
                <div
                  className={`w-14 sm:w-16 h-16 sm:h-18 rounded-full bg-gradient-to-tr ${
                    EARTHEN_BALLOON_COLORS[idx % EARTHEN_BALLOON_COLORS.length]
                  } shadow-md relative flex items-center justify-center border-t border-white/50`}
                >
                  <div className="w-2.5 h-4 rounded-full bg-white/40 absolute top-2 left-2 rotate-12" />
                  <span className="text-xs text-white font-serif font-bold">#{idx + 1}</span>
                </div>
                {/* Knot and string */}
                <div className="w-2 h-2 bg-[#8C6D53] rounded-b-sm -mt-0.5" />
                <div className="w-0.5 h-7 bg-[#C5B7A8]" />
              </div>
            ) : (
              <div className="w-14 sm:w-16 h-16 sm:h-18 flex items-center justify-center opacity-40 text-2xl">
                💥
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Box */}
      <div className="w-full max-w-md min-h-[64px] flex items-center justify-center my-2 px-3 z-10">
        {currentMessage ? (
          <div className="w-full p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFC8] text-xs sm:text-sm text-[#2C241E] shadow-sm animate-in fade-in zoom-in-95">
            <span className="font-serif font-bold text-[#B85D3B] mr-1.5">🎈 Popped Reveal:</span>
            "{currentMessage}"
          </div>
        ) : null}
      </div>

      {/* Pop All Action */}
      {!allPopped && (
        <button
          type="button"
          onClick={() => {
            popped.forEach((isPopped, idx) => {
              if (!isPopped) {
                setTimeout(() => handlePop(idx), idx * 120);
              }
            });
          }}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#FAF4EB] hover:bg-[#F0E4D5] text-[#2C241E] border border-[#E8DFC8] shadow-sm transition-all active:scale-95"
        >
          Pop All Fast 🎈
        </button>
      )}
    </div>
  );
};
