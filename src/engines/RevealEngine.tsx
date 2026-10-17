import React, { useState, useRef, useEffect } from 'react';
import { Gift, Sparkles, Check } from 'lucide-react';
import { RevealProps } from '../types/greeting';
import { playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: RevealProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const RevealEngine: React.FC<Props> = ({
  props,
  recipientName = 'Friend',
  onComplete,
  isInteractive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawing = useRef(false);

  const message = props.secretMessage || `Happy Birthday ${recipientName}! You are the greatest gift to everyone who knows you!`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#D4A373';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#E5DAC6');
    grad.addColorStop(0.5, '#D4A373');
    grad.addColorStop(1, '#B85D3B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4A3E36';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ SCRATCH WITH FINGER TO REVEAL ✦', canvas.width / 2, canvas.height / 2);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    setScratchPercent((prev) => {
      const next = Math.min(100, prev + 3.5);
      if (next >= 42 && !isRevealed) {
        setIsRevealed(true);
        playTriumph();
        fireCelebration('sparkles');
        if (onComplete) onComplete();
      }
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !isInteractive) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-[#FAF4EB] border border-[#E8DFC8]">
          <Gift className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{isRevealed ? 'Surprise Unwrapped! 🎁' : props.title || 'Gold Foil Scratch Card'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          A Secret For {recipientName}
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {isRevealed ? 'Secret uncovered!' : 'Rub your finger or mouse across the gold foil card'}
        </p>
      </div>

      {/* Scratch Card Container */}
      <div className="relative w-full max-w-sm h-60 rounded-3xl overflow-hidden shadow-md border-2 border-[#E8DFC8] my-4 flex items-center justify-center bg-[#FFFDF9]">
        {/* Underneath Message Content */}
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-gradient-to-tr from-[#FAF4EB] via-[#FFFDF9] to-[#F5ECE0] text-center">
          <Sparkles className="w-8 h-8 text-[#D4A373] mb-2 animate-bounce" />
          <p className="text-sm sm:text-base font-serif font-bold text-[#2C241E] leading-relaxed px-2">
            "{message}"
          </p>
        </div>

        {/* Scratchable Canvas Layer */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            width={340}
            height={240}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
          />
        )}
      </div>

      {/* Progress / Reveal Button */}
      <div className="mt-2 z-10">
        {!isRevealed && (
          <button
            type="button"
            onClick={() => {
              setIsRevealed(true);
              playTriumph();
              fireCelebration('confetti');
              if (onComplete) onComplete();
            }}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-sm transition-all active:scale-95"
          >
            Instant Reveal 🎁
          </button>
        )}
      </div>
    </div>
  );
};
