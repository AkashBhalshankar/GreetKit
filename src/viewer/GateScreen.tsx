import React, { useState, useEffect } from 'react';
import { Lock, Clock, Sparkles } from 'lucide-react';

interface Props {
  unlockAt: string; // ISO string
  recipientName?: string;
  senderName?: string;
  onUnlocked: () => void;
}

export const GateScreen: React.FC<Props> = ({
  unlockAt,
  recipientName = 'Friend',
  senderName = 'Someone who loves you',
  onUnlocked,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  useEffect(() => {
    function calculate() {
      const target = new Date(unlockAt).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        onUnlocked();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [unlockAt]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[440px] w-full p-4 sm:p-6 text-center select-none space-y-6 text-[#2C241E]">
      <div className="w-16 h-16 rounded-full bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] flex items-center justify-center mx-auto shadow-sm animate-pulse">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-medium bg-[#FAF7F2] text-[#8C6D53] border border-[#EAE3D9]">
          <Clock className="w-3.5 h-3.5 text-[#B85D3B]" />
          <span>Locked Until the Perfect Moment</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          A Surprise for {recipientName}
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {senderName} has prepared a personalized interactive greeting set to open on your special date!
        </p>
      </div>

      {/* Countdown Grid (Light Earthen Cards) */}
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm">
        {[
          { label: 'DAYS', val: timeLeft.days },
          { label: 'HOURS', val: timeLeft.hours },
          { label: 'MINUTES', val: timeLeft.minutes },
          { label: 'SECONDS', val: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] shadow-sm flex flex-col items-center"
          >
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E]">
              {String(item.val).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#9E8E81] mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Sender bypass */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onUnlocked}
          className="text-xs text-[#7D6E63] hover:text-[#2C241E] underline decoration-[#DDD5C7]"
        >
          Preview now as creator / early tester
        </button>
      </div>
    </div>
  );
};
