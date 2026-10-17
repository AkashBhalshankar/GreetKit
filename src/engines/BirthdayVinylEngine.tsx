import React, { useState } from 'react';
import { BirthdayVinylProps, PaletteMode } from '../types/greeting';
import { playVinylDrop, playTriumph, playChime } from '../lib/audio';
import { fireCelebration } from '../lib/confetti';
import { Disc, Play, Pause, Music, Sparkles, Volume2, Heart } from 'lucide-react';

interface Props {
  props: BirthdayVinylProps;
  accentColor: string;
  recipientName?: string;
  paletteMode?: PaletteMode;
  onComplete: () => void;
  isInteractive?: boolean;
}

export const BirthdayVinylEngine: React.FC<Props> = ({
  props,
  accentColor,
  recipientName = 'Friend',
  paletteMode = 'earthen',
  onComplete,
  isInteractive = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const defaultTracks = [
    'Track 1: "Ode to Your Chaos & Pure Laughter"',
    'Track 2: "Midnight Road Trips & 2000s Anthems"',
    'Track 3: "Unstoppable Ambition & New Milestones"',
    'Track 4: "Forever Young & Deeply Loved"',
  ];

  const tracks =
    props.dedications && props.dedications.length > 0 ? props.dedications : defaultTracks;

  const handleTogglePlay = () => {
    if (!isInteractive) return;

    if (!isPlaying) {
      setIsPlaying(true);
      playVinylDrop();
      playChime(523.25, 0.4);
      fireCelebration('confetti');
    } else {
      setIsPlaying(false);
      playChime(392, 0.2);
    }
  };

  const handleSelectTrack = (idx: number) => {
    setCurrentTrackIndex(idx);
    playChime(440 + idx * 80, 0.3);
    if (!isPlaying) {
      setIsPlaying(true);
      playVinylDrop();
    }
  };

  const isBright = paletteMode === 'bright';
  const isMidnight = paletteMode === 'midnight';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-2 px-2 sm:px-4 text-center">
      {/* Header */}
      <div className="space-y-1 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-600/10 text-amber-700 border border-amber-600/20">
          <Disc className={`w-3.5 h-3.5 text-amber-600 ${isPlaying ? 'animate-spin' : ''}`} />
          <span>Vintage Birthday Vinyl & Mixtape</span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-serif font-bold ${
            isMidnight ? 'text-stone-100' : isBright ? 'text-rose-900' : 'text-[#2C241E]'
          }`}
        >
          {props.title || `${recipientName}'s Golden Year LP`}
        </h2>
        <p
          className={`text-xs ${
            isMidnight ? 'text-stone-400' : isBright ? 'text-rose-700/80' : 'text-[#7D6E63]'
          }`}
        >
          {isPlaying
            ? '♪ Playing side A: Birthday Dedication Tracks'
            : 'Drop the needle to spin the birthday record and play dedications!'}
        </p>
      </div>

      {/* Turntable Platter Deck */}
      <div
        className={`relative w-full max-w-sm p-5 rounded-3xl border shadow-md flex items-center justify-between gap-4 transition-colors duration-300 ${
          isMidnight
            ? 'bg-[#1C1917] border-stone-800'
            : isBright
            ? 'bg-white border-rose-200 shadow-rose-100'
            : 'bg-[#FAF4EB] border-[#E8DFC8]'
        }`}
      >
        {/* Spinning Vinyl Record */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          {/* Black Vinyl Disc */}
          <div
            className={`w-full h-full rounded-full bg-[#121110] border-4 border-[#2C241E] shadow-xl flex items-center justify-center transition-all duration-700 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '3.5s' }}
          >
            {/* Vinyl grooves rings */}
            <div className="w-[85%] h-[85%] rounded-full border border-stone-800/80 flex items-center justify-center">
              <div className="w-[70%] h-[70%] rounded-full border border-stone-800/60 flex items-center justify-center">
                {/* Center Record Label sticker */}
                <div
                  className={`w-[45%] h-[45%] rounded-full flex flex-col items-center justify-center p-1 text-center shadow-md ${
                    isBright
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-400 text-stone-950 font-bold'
                  }`}
                >
                  <span className="text-[7px] font-mono uppercase tracking-widest leading-none">
                    Side A
                  </span>
                  <span className="text-[9px] font-serif font-bold leading-tight truncate max-w-full">
                    {recipientName}
                  </span>
                  <span className="text-[6px] opacity-75">33⅓ RPM</span>
                  {/* Center Spindle Hole */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#121110] mt-0.5 border border-black/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tonearm + Controls on Right */}
        <div className="flex-1 flex flex-col items-center justify-between h-40 py-2">
          {/* Tonearm graphic representation */}
          <div className="relative w-full h-16 flex justify-end pr-2">
            <div
              className={`w-2 h-16 bg-stone-400 rounded-full origin-top-right transition-transform duration-500 shadow-md ${
                isPlaying ? 'rotate-[25deg]' : 'rotate-0'
              }`}
            >
              {/* Needle Cartridge head */}
              <div className="w-3 h-4 bg-amber-600 rounded-sm -bottom-1 -left-0.5 absolute shadow-sm" />
            </div>
          </div>

          {/* Big Drop Needle / Play Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#B85D3B] hover:bg-[#A14F33] text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause Platter
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Drop Needle
              </>
            )}
          </button>
        </div>
      </div>

      {/* Album Liner Notes & Dedication Tracklist */}
      <div className="w-full mt-4 space-y-2">
        <span className="text-[11px] font-serif font-bold uppercase tracking-wider block text-left px-1 text-[#8C6D53]">
          Album Liner Notes & Track Dedications:
        </span>
        <div className="space-y-1.5">
          {tracks.map((track, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectTrack(idx)}
              className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                currentTrackIndex === idx
                  ? isBright
                    ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold shadow-sm'
                    : 'bg-[#FAF4EB] border-[#B85D3B] text-[#2C241E] font-semibold shadow-sm'
                  : 'bg-white/60 hover:bg-white border-[#E8DFC8] text-[#7D6E63]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs text-[#B85D3B] font-mono">0{idx + 1}</span>
                <span className="text-xs truncate">{track}</span>
              </div>
              {currentTrackIndex === idx && isPlaying && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="w-1 h-3 bg-[#B85D3B] rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-[#B85D3B] rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-[#B85D3B] rounded-full animate-pulse delay-150" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-4 pt-1">
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md active:scale-95 transition-all"
        >
          Continue to Personal Letter →
        </button>
      </div>
    </div>
  );
};
