import React, { useState } from 'react';
import { Trophy, Zap, Shield, Heart, Award, ArrowUp, Sparkles } from 'lucide-react';
import { LevelUpProps } from '../types/greeting';
import { playLevelUpFanfare, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';

interface Props {
  props: LevelUpProps;
  accentColor?: string;
  recipientName?: string;
  onComplete?: () => void;
  isInteractive?: boolean;
}

export const LevelUpEngine: React.FC<Props> = ({
  props,
  accentColor = '#B85D3B',
  recipientName = 'Hero',
  onComplete,
  isInteractive = true,
}) => {
  const currentLevel = props.currentLevel || 24;
  const targetLevel = props.nextLevel || currentLevel + 1;
  const perks = props.perksUnlocked || [
    'Infinite Charisma Boost',
    'Certified Legend Status',
    'Unbreakable Humor Shield',
    'Immunity to Boring Days',
  ];

  const [xp, setXp] = useState(0);
  const [displayedLevel, setDisplayedLevel] = useState(currentLevel);
  const [levelUpAchieved, setLevelUpAchieved] = useState(false);
  const [claimedPerks, setClaimedPerks] = useState<number[]>([]);

  const handleLevelUpClick = () => {
    if (levelUpAchieved || !isInteractive) return;

    let currentXp = 0;
    const interval = setInterval(() => {
      currentXp += 15;
      playChime(420 + currentXp * 5, 0.08);

      if (currentXp >= 100) {
        setXp(100);
        clearInterval(interval);
        setDisplayedLevel(targetLevel);
        setLevelUpAchieved(true);
        playLevelUpFanfare();
        fireCelebration('fireworks');
        if (onComplete) onComplete();
      } else {
        setXp(currentXp);
      }
    }, 70);
  };

  const unlockPerk = (idx: number) => {
    if (!claimedPerks.includes(idx)) {
      setClaimedPerks((prev) => [...prev, idx]);
      playChime(780 + idx * 90, 0.2);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[440px] w-full p-4 sm:p-6 text-center select-none text-[#2C241E]">
      {/* Header */}
      <div className="space-y-1.5 mb-2 w-full max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-[#B85D3B] font-medium">
          <Trophy className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{levelUpAchieved ? 'MILESTONE ACHIEVED!' : props.title || 'ANNUAL LEVEL-UP QUEST'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight flex items-center justify-center gap-2">
          <span>{recipientName}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAE3D9] text-[#7D6E63] font-mono border border-[#DDD5C7]">
            LVL {displayedLevel}
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          {levelUpAchieved
            ? `Congratulations! New perks unlocked for Year ${targetLevel}.`
            : `Fill your XP bar to evolve into Level ${targetLevel}!`}
        </p>
      </div>

      {/* Level Crest & Animated Badge */}
      <div className="my-5 relative flex flex-col items-center justify-center">
        <div
          className={`relative w-28 h-28 rounded-3xl flex flex-col items-center justify-center border transition-all duration-500 shadow-md ${
            levelUpAchieved
              ? 'bg-gradient-to-tr from-[#FFFDF9] via-[#FAF4EB] to-[#F5ECE0] border-[#D4A373] shadow-[#D4A373]/20 scale-105'
              : 'bg-[#FFFDF9] border-[#E8DFC8]'
          }`}
        >
          <span className="text-[10px] font-mono tracking-widest text-[#9E8E81] uppercase">LEVEL</span>
          <span className="text-4xl font-serif font-bold text-[#2C241E] tracking-tight">
            {displayedLevel}
          </span>
          {levelUpAchieved && (
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#D4A373] text-[#2C241E] flex items-center justify-center font-bold text-xs shadow-md animate-bounce">
              <Zap className="w-4 h-4 fill-current text-white" />
            </div>
          )}
        </div>

        <div className="mt-2 text-xs font-mono text-[#8C6D53] font-semibold tracking-wider">
          {props.characterTitle || '★ SUPREME LEGEND ★'}
        </div>
      </div>

      {/* XP Bar (Warm Ochre / Terracotta) */}
      <div className="w-full max-w-sm space-y-1.5 my-2">
        <div className="flex justify-between text-[11px] font-mono text-[#7D6E63]">
          <span>EXP PROGRESS</span>
          <span>{xp}%</span>
        </div>
        <div className="w-full h-3.5 bg-[#EAE3D9] border border-[#DDD5C7] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#D4A373] to-[#B85D3B] rounded-full transition-all duration-150 shadow-inner"
            style={{ width: `${xp}%` }}
          />
        </div>
      </div>

      {/* Unlocked Perks Grid */}
      <div className="w-full max-w-md space-y-2 my-2 text-left">
        <div className="text-[10px] font-mono text-[#9E8E81] uppercase tracking-wider text-center">
          {levelUpAchieved ? '✦ Perks Unlocked for this Age ✦' : '✦ Pending Perks in Vault ✦'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {perks.map((perk, idx) => {
            const isClaimed = levelUpAchieved || claimedPerks.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => unlockPerk(idx)}
                className={`p-2.5 rounded-2xl border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isClaimed
                    ? 'bg-[#FFFDF9] border-[#E8DFC8] text-[#2C241E] shadow-sm'
                    : 'bg-[#FAF7F2] border-[#EAE3D9] text-[#9E8E81] hover:border-[#DDD5C7]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isClaimed ? 'bg-[#F5ECE0] text-[#B85D3B]' : 'bg-[#EAE3D9] text-[#9E8E81]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">{perk}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Up Button */}
      <div className="mt-2 z-10">
        {!levelUpAchieved ? (
          <button
            type="button"
            onClick={handleLevelUpClick}
            className="px-6 py-2.5 rounded-2xl font-mono text-xs font-bold tracking-wider uppercase bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            Claim EXP & Level Up!
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EBF3E8] text-[#557C4F] border border-[#C5D8C1] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STATS MAXED OUT</span>
          </div>
        )}
      </div>
    </div>
  );
};
