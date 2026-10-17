import React, { useState, useEffect } from 'react';
import { Feather, FastForward } from 'lucide-react';
import { TypeOutProps } from '../types/greeting';
import { playTypewriterClack, playTriumph } from '../lib/audio';

interface Props {
  props: TypeOutProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const TypeOutEngine: React.FC<Props> = ({
  props,
  recipientName = 'Dear Friend',
  onComplete,
  isInteractive = true,
}) => {
  const lines = props.typedLines || [
    `Dear ${recipientName},`,
    `Some people make the world quieter, softer, and so much more wonderful.`,
    `You are undeniably one of those rare souls.`,
    `May this birthday year open every closed door and fulfill every unspoken wish.`
  ];

  const fullText = lines.join('\n\n');
  const [displayedText, setDisplayedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let index = 0;
    const speed = props.speedMs || 35;

    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (fullText[index] !== ' ' && fullText[index] !== '\n') {
          playTypewriterClack();
        }
        index++;
      } else {
        clearInterval(timer);
        setIsFinished(true);
        playTriumph();
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [fullText]);

  const handleSkip = () => {
    setDisplayedText(fullText);
    setIsFinished(true);
    playTriumph();
    if (onComplete) onComplete();
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      <div className="space-y-1.5 mb-2 z-10 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-[#FAF4EB] border border-[#E8DFC8]">
          <Feather className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{props.header || 'A Letter Typed In Ink'}</span>
        </div>
      </div>

      {/* Parchment Letter Paper Container */}
      <div className="w-full max-w-md flex-1 my-3 p-6 sm:p-7 rounded-3xl bg-[#FFFDF9] text-[#2C241E] shadow-sm border border-[#E8DFC8] font-serif text-sm sm:text-base leading-relaxed text-left flex flex-col justify-between relative overflow-hidden">
        <div className="whitespace-pre-wrap font-serif tracking-normal text-[#2C241E]">
          {displayedText}
          {!isFinished && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-[#B85D3B] animate-pulse align-middle" />
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#EAE3D9] flex items-center justify-between text-xs text-[#8C6D53] italic">
          <span>Written with sincere warmth</span>
          <span>✦ sealed ✦</span>
        </div>
      </div>

      {/* Fast Forward / Skip button */}
      <div className="mt-2 z-10">
        {!isFinished && isInteractive && (
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 rounded-2xl text-xs font-medium text-[#7D6E63] hover:text-[#2C241E] bg-[#FAF7F2] border border-[#DDD5C7] hover:bg-[#F3ECE0] transition-all flex items-center gap-1.5"
          >
            <FastForward className="w-3.5 h-3.5" />
            Reveal All
          </button>
        )}
      </div>
    </div>
  );
};
