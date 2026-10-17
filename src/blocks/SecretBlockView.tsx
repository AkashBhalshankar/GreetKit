import React, { useState } from 'react';
import { SecretBlock } from '../types/greeting';
import { Lock, Unlock, Key, CheckCircle2 } from 'lucide-react';
import { playTriumph, playChime } from '../lib/audio';

interface Props {
  block: SecretBlock;
  onUnlocked?: () => void;
  isInteractive?: boolean;
}

export const SecretBlockView: React.FC<Props> = ({ block, onUnlocked, isInteractive = true }) => {
  const [inputAnswer, setInputAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const accepted = (block.acceptedAnswers || []).map((a) => a.trim().toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputAnswer.trim().toLowerCase();

    const isCorrect = accepted.length === 0 || accepted.includes(cleanInput);

    if (isCorrect) {
      setIsUnlocked(true);
      setErrorMsg(false);
      playTriumph();
      if (onUnlocked) onUnlocked();
    } else {
      setErrorMsg(true);
      playChime(300, 0.2);
    }
  };

  const handleBypass = () => {
    setIsUnlocked(true);
    playTriumph();
    if (onUnlocked) onUnlocked();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-4 text-center select-none text-[#2C241E]">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#E8DFC8] shadow-sm space-y-4">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] flex items-center justify-center mx-auto shadow-sm">
          {isUnlocked ? <Unlock className="w-7 h-7 text-[#407B54]" /> : <Lock className="w-7 h-7" />}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-xl font-serif font-bold text-[#2C241E]">
            {isUnlocked ? 'Gate Unlocked!' : 'Secret Gatekeeper Question'}
          </h3>
          <p className="text-xs text-[#7D6E63]">
            {isUnlocked
              ? 'You cracked the secret! Proceeding to the greeting...'
              : 'Answer this inside joke question to open your greeting'}
          </p>
        </div>

        {/* Question Text */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-[#2C241E] font-serif text-sm italic">
          "{block.question || 'Where was our first legendary hangout?'}"
        </div>

        {/* Form */}
        {!isUnlocked ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => {
                setInputAnswer(e.target.value);
                if (errorMsg) setErrorMsg(false);
              }}
              placeholder="Type your answer here..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] placeholder-[#A89F91] text-center focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
            />

            {errorMsg && (
              <p className="text-xs text-[#C86446]">
                Not quite! Try another inside joke or guess again.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              Unlock Gate
            </button>

            {block.answerHint && (
              <div>
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="text-[11px] text-[#8C6D53] hover:text-[#B85D3B] underline"
                  >
                    Need a hint?
                  </button>
                ) : (
                  <div className="text-[11px] text-[#8C6D53] bg-[#FAF4EB] p-2 rounded-xl border border-[#E8DFC8]">
                    Hint: {block.answerHint}
                  </div>
                )}
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={handleBypass}
                className="text-[10px] text-[#9E8E81] hover:text-[#2C241E]"
              >
                (Let me in anyway)
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-[#EBF3E8] border border-[#C5D8C1] rounded-2xl text-xs text-[#407B54] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Success! Access granted.</span>
          </div>
        )}
      </div>
    </div>
  );
};
