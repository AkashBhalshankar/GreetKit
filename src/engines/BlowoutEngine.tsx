import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Heart, CheckCircle2, Wind } from 'lucide-react';
import { BlowoutProps } from '../types/greeting';
import { createMicBlowDetector, MicController } from '../lib/mic';
import { playBlowoutSwoosh, playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: BlowoutProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const BlowoutEngine: React.FC<Props> = ({
  props,
  accentColor = '#C86446', // Terracotta default
  recipientName = 'Friend',
  onComplete,
  isInteractive = true,
}) => {
  const candlesCount = Math.max(1, Math.min(12, props.candles || 5));
  const reasons = props.reasons || [];
  const showReasons = props.showReasons !== false;

  const [extinguished, setExtinguished] = useState<boolean[]>(() =>
    new Array(candlesCount).fill(false)
  );
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [currentReason, setCurrentReason] = useState<string | null>(null);
  const [privateWish, setPrivateWish] = useState('');
  const [wishSaved, setWishSaved] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const micRef = useRef<MicController | null>(null);
  const allBlown = extinguished.every(Boolean);

  const blowOutNextCandle = () => {
    setExtinguished((prev) => {
      const nextIndex = prev.findIndex((b) => !b);
      if (nextIndex === -1) return prev;

      const next = [...prev];
      next[nextIndex] = true;

      playBlowoutSwoosh();

      if (showReasons && reasons[nextIndex]) {
        setCurrentReason(reasons[nextIndex]);
      }

      if (next.every(Boolean)) {
        setTimeout(() => {
          setIsCompleted(true);
          playTriumph();
          fireCelebration('confetti');
          if (onComplete) onComplete();
        }, 650);
      }

      return next;
    });
  };

  const handleCandleClick = (index: number) => {
    if (!isInteractive || extinguished[index]) return;
    setExtinguished((prev) => {
      const next = [...prev];
      next[index] = true;
      playBlowoutSwoosh();
      if (showReasons && reasons[index]) {
        setCurrentReason(reasons[index]);
      }
      if (next.every(Boolean)) {
        setTimeout(() => {
          setIsCompleted(true);
          playTriumph();
          fireCelebration('confetti');
          if (onComplete) onComplete();
        }, 650);
      }
      return next;
    });
  };

  const toggleMic = async () => {
    if (micActive) {
      micRef.current?.stop();
      setMicActive(false);
      setMicLevel(0);
      return;
    }

    if (!micRef.current) {
      micRef.current = createMicBlowDetector();
    }

    const success = await micRef.current.start(
      () => {
        blowOutNextCandle();
      },
      (level) => {
        setMicLevel(level);
      }
    );

    if (success) {
      setMicActive(true);
    } else {
      alert('Microphone access was denied or not supported. You can tap the candles directly to blow them out!');
    }
  };

  useEffect(() => {
    return () => {
      micRef.current?.stop();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373] animate-spin-slow" />
          <span>{allBlown ? 'Wish Released · 100% Blown' : props.title || 'Make a Wish & Blow Out'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          {recipientName}'s Birthday Cake
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {allBlown
            ? 'All candles extinguished! May this year bring your deepest hopes to life.'
            : micActive
            ? 'Blow gently toward your microphone, or tap any candle to blow it out.'
            : 'Tap the candles to blow them out, or enable your microphone to blow for real.'}
        </p>
      </div>

      {/* Artisan Patisserie Cake (Light Earthen Aesthetic) */}
      <div className="relative my-6 w-full flex flex-col items-center justify-center">
        {/* Row of Beeswax Candles */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 z-20 -mb-2 px-2 max-w-full flex-wrap">
          {extinguished.map((isExtinguished, idx) => (
            <div
              key={idx}
              onClick={() => handleCandleClick(idx)}
              className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                isInteractive && !isExtinguished ? 'hover:-translate-y-1 active:scale-95' : ''
              }`}
              title={isExtinguished ? 'Blown out' : 'Tap or blow into mic'}
            >
              {/* Flame or Ascending Smoke */}
              <div className="h-10 flex items-center justify-center relative">
                {!isExtinguished ? (
                  <div className="relative flex items-center justify-center">
                    {/* Warm Ambient Glow Aura */}
                    <div className="absolute w-9 h-9 rounded-full bg-[#F59E0B]/25 blur-md animate-glow-breath" />

                    {/* Animated Teardrop Flame with organic micro-flicker */}
                    <svg viewBox="0 0 24 36" className="w-6 h-9 animate-flame drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      <path
                        d="M12 2 C9 10 3 16 3 24 C3 30 7 34 12 34 C17 34 21 30 21 24 C21 16 15 10 12 2 Z"
                        fill="url(#candleFlameGrad)"
                      />
                      {/* Inner bright core */}
                      <path
                        d="M12 12 C10.5 16 8 20 8 25 C8 28.5 9.8 31 12 31 C14.2 31 16 28.5 16 25 C16 20 13.5 16 12 12 Z"
                        fill="#FFFBEB"
                      />
                      <defs>
                        <linearGradient id="candleFlameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#C86446" />
                          <stop offset="40%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#FCD34D" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  /* Curling Ascending Smoke */
                  <div className="relative flex flex-col items-center animate-smoke">
                    <div className="w-1 h-3 bg-[#A89F91] rounded-full" />
                    <span className="text-[11px] text-[#A89F91] opacity-60">☁️</span>
                  </div>
                )}
              </div>

              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-[#4A3E36]" />

              {/* Artisan Candle Stick with Earthen Striping */}
              <div
                className="w-3.5 sm:w-4 h-11 sm:h-12 rounded-t-sm shadow-sm border-t border-white/60 flex flex-col justify-between overflow-hidden"
                style={{
                  background:
                    idx % 2 === 0
                      ? `linear-gradient(180deg, #FFFFFF 0%, #D4A373 100%)`
                      : `linear-gradient(180deg, #FFFFFF 0%, #C86446 100%)`,
                }}
              >
                <div className="w-full h-1 bg-white/50" />
                <div className="w-full h-1 bg-white/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Multi-Tier Ceramic Vanilla Cake */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Top Tier (Alabaster Vanilla Cream) */}
          <div className="w-52 sm:w-64 h-14 bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EB] to-[#F3ECE0] rounded-t-2xl shadow-md border-t-2 border-white relative overflow-hidden flex items-center justify-center">
            {/* Buttercream frosting scallops */}
            <div className="absolute top-0 inset-x-0 flex justify-between px-1">
              {[...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-3 bg-white rounded-b-full shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  style={{ height: i % 2 === 0 ? '13px' : '9px' }}
                />
              ))}
            </div>

            {/* Fresh Strawberries & Gold Leaf Deco */}
            <div className="flex gap-4 mt-2">
              <span className="text-xs hover:scale-125 transition-transform cursor-default">🍓</span>
              <span className="text-xs text-[#D4A373]">✦</span>
              <span className="text-xs hover:scale-125 transition-transform cursor-default">🍓</span>
            </div>
          </div>

          {/* Bottom Tier (Almond Biscuit & Terracotta piping) */}
          <div className="w-64 sm:w-80 h-16 bg-gradient-to-b from-[#FAF4EB] via-[#F3ECE0] to-[#E9DFCF] rounded-t-xl shadow-lg border-t-2 border-white relative overflow-hidden flex items-center justify-center">
            {/* Decorative earthen pearl piping */}
            <div className="absolute top-0 inset-x-0 flex justify-between px-2">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="w-3.5 h-3 bg-white/90 rounded-b-full" />
              ))}
            </div>
            <div className="text-[11px] font-serif tracking-[0.2em] font-semibold text-[#8C6D53] mt-2">
              CELEBRATING {recipientName.toUpperCase()}
            </div>
          </div>

          {/* Terracotta/Marble Cake Stand Plate */}
          <div className="w-72 sm:w-92 h-3.5 bg-gradient-to-r from-[#EDE6DC] via-[#FAF8F5] to-[#EDE6DC] rounded-full shadow-md border border-[#DDD5C7]" />
          <div className="w-24 sm:w-32 h-4 bg-[#DFD6C7] rounded-b-xl shadow-inner" />
        </div>
      </div>

      {/* Reason Card / Live Feedback */}
      <div className="w-full max-w-md min-h-[64px] flex items-center justify-center my-2 px-3">
        {currentReason ? (
          <div className="w-full p-3 rounded-2xl bg-[#FFFDF9] border border-[#E8DFC8] text-xs sm:text-sm text-[#2C241E] shadow-sm animate-in fade-in zoom-in-95 leading-relaxed">
            <span className="font-serif font-bold text-[#B85D3B] mr-1.5">✦ A Reason You Shine:</span>
            "{currentReason}"
          </div>
        ) : (
          <div className="text-xs text-[#9E8E81] italic">
            {!allBlown ? `${extinguished.filter((b) => !b).length} candles burning brightly with warm wishes...` : ''}
          </div>
        )}
      </div>

      {/* Control Buttons with Tactile Micro-Interactions */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 w-full max-w-md">
        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm transition-all active:scale-95 ${
            micActive
              ? 'bg-[#B85D3B] text-white ring-2 ring-[#B85D3B]/30 shadow-[#B85D3B]/20'
              : 'bg-[#FFFDF9] hover:bg-[#F3ECE0] text-[#2C241E] border border-[#DDD5C7]'
          }`}
        >
          {micActive ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <MicOff className="w-3.5 h-3.5 opacity-60" />}
          <span>{micActive ? 'Listening (Blow Now!)' : 'Blow with Microphone'}</span>
        </button>

        {/* Tap to blow out fallback */}
        {!allBlown && (
          <button
            type="button"
            onClick={blowOutNextCandle}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium bg-[#EFE8DC] hover:bg-[#E5DCCF] text-[#4A3E36] border border-[#DDD5C7] transition-all active:scale-95"
          >
            <Wind className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span>Tap to Blow Out</span>
          </button>
        )}

        {/* Private Secret Wish */}
        {!wishSaved && !allBlown && (
          <button
            type="button"
            onClick={() => setShowWishModal(true)}
            className="px-3.5 py-2 rounded-2xl text-xs text-[#7D6E63] hover:text-[#2C241E] bg-[#FAF7F2] border border-[#DDD5C7] hover:bg-[#F3ECE0] transition-colors"
          >
            🔒 Make a Secret Wish
          </button>
        )}
      </div>

      {/* Mic Energy Bar */}
      {micActive && (
        <div className="w-44 h-1.5 bg-[#EAE3D9] rounded-full overflow-hidden mt-3 border border-[#DDD5C7]">
          <div
            className="h-full bg-gradient-to-r from-[#D4A373] to-[#B85D3B] transition-all duration-75"
            style={{ width: `${Math.min(100, micLevel * 100)}%` }}
          />
        </div>
      )}

      {/* Secret Birthday Wish Modal (Light Earthen Aesthetic) */}
      {showWishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FFFDF9] border border-[#E8DFC8] rounded-3xl p-6 shadow-2xl text-left space-y-3.5">
            <div className="flex items-center gap-2 text-[#B85D3B] font-serif font-bold text-base">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Make a Private Birthday Wish</span>
            </div>
            <p className="text-xs text-[#7D6E63] leading-relaxed">
              Whisper or write down your secret wish before blowing out your last candle. It stays private to you!
            </p>
            <textarea
              value={privateWish}
              onChange={(e) => setPrivateWish(e.target.value)}
              placeholder="e.g. Visit Italy, finish my first screenplay, or find peace..."
              rows={3}
              className="w-full bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-3 text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowWishModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#7D6E63] hover:text-[#2C241E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (privateWish.trim()) {
                    setWishSaved(true);
                    playChime(900, 0.4);
                  }
                  setShowWishModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#B85D3B] text-white hover:bg-[#A14F33] transition-all active:scale-95"
              >
                Seal My Wish 🔒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
