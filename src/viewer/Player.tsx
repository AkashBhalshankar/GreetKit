import React, { useState, useEffect } from 'react';
import { Greeting, Block, PaletteMode } from '../types/greeting';
import { BlowoutEngine } from '../engines/BlowoutEngine';
import { TapLightEngine } from '../engines/TapLightEngine';
import { LevelUpEngine } from '../engines/LevelUpEngine';
import { LiftOffEngine } from '../engines/LiftOffEngine';
import { MagicBalloonLiftEngine } from '../engines/MagicBalloonLiftEngine';
import { TypeOutEngine } from '../engines/TypeOutEngine';
import { RevealEngine } from '../engines/RevealEngine';
import { PopEngine } from '../engines/PopEngine';
import { GrowEngine } from '../engines/GrowEngine';
import { CatchEngine } from '../engines/CatchEngine';
import { FortuneCookieEngine } from '../engines/FortuneCookieEngine';
import { MagicLampEngine } from '../engines/MagicLampEngine';
import { DandelionEngine } from '../engines/DandelionEngine';
import { PianoTuneEngine } from '../engines/PianoTuneEngine';
import { PinataSmashEngine } from '../engines/PinataSmashEngine';
import { ConstellationEngine } from '../engines/ConstellationEngine';
import { BirthdayVinylEngine } from '../engines/BirthdayVinylEngine';
import { MessageBlockView } from '../blocks/MessageBlockView';
import { PhotosBlockView } from '../blocks/PhotosBlockView';
import { TimelineBlockView } from '../blocks/TimelineBlockView';
import { SecretBlockView } from '../blocks/SecretBlockView';
import { SignatureBlockView } from '../blocks/SignatureBlockView';
import { FinalBlockView } from '../blocks/FinalBlockView';
import { GateScreen } from './GateScreen';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Share2, Palette, Sparkles, Sun, Moon, Edit3 } from 'lucide-react';
import {
  setAudioMuted,
  getAudioMuted,
  startAmbientMusic,
  stopAmbientMusic,
  playChime,
  playHappyBirthdayRingtone,
  stopHappyBirthdayRingtone,
  isHappyBirthdayRingtonePlaying,
} from '../lib/audio';

interface Props {
  greeting: Greeting;
  onReplay?: () => void;
  onCreateNew?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  isInteractive?: boolean;
}

export const Player: React.FC<Props> = ({
  greeting,
  onReplay,
  onCreateNew,
  onShare,
  onEdit,
  isInteractive = true,
}) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isMuted, setIsMutedState] = useState(false);
  const [isPlayingRingtone, setIsPlayingRingtone] = useState(false);
  const [paletteMode, setPaletteMode] = useState<PaletteMode>(
    greeting.theme?.paletteMode || 'earthen'
  );

  const [isLockedGate, setIsLockedGate] = useState(() => {
    if (greeting.delivery?.unlockAt) {
      return new Date(greeting.delivery.unlockAt).getTime() > Date.now();
    }
    return false;
  });

  const flow = greeting.flow || [];
  const currentBlock: Block | undefined = flow[currentBlockIndex];
  const accent = greeting.theme?.accent || '#B85D3B';
  const recipientName = greeting.recipient?.nickname || greeting.recipient?.name || 'Friend';

  useEffect(() => {
    if (greeting.theme?.music && greeting.theme.music !== 'none') {
      startAmbientMusic(greeting.theme.music);
    }
    return () => {
      stopAmbientMusic();
      stopHappyBirthdayRingtone();
    };
  }, [greeting.theme?.music]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMutedState(next);
    setAudioMuted(next);
    if (!next && greeting.theme?.music) {
      startAmbientMusic(greeting.theme.music);
    }
  };

  const toggleBirthdayRingtone = () => {
    if (isPlayingRingtone) {
      stopHappyBirthdayRingtone();
      setIsPlayingRingtone(false);
    } else {
      setIsPlayingRingtone(true);
      playHappyBirthdayRingtone(true, () => setIsPlayingRingtone(false));
    }
  };

  const cyclePalette = () => {
    setPaletteMode((curr) => {
      if (curr === 'earthen') return 'bright';
      if (curr === 'bright') return 'midnight';
      return 'earthen';
    });
    playChime(720, 0.2);
  };

  const handleNext = () => {
    if (currentBlockIndex < flow.length - 1) {
      setCurrentBlockIndex((idx) => idx + 1);
      playChime(680, 0.15);
    }
  };

  const handlePrev = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((idx) => idx - 1);
      playChime(580, 0.15);
    }
  };

  const restartFlow = () => {
    setCurrentBlockIndex(0);
    if (onReplay) onReplay();
  };

  const getFontFamily = () => {
    switch (greeting.theme?.font) {
      case 'serif':
        return 'font-serif';
      case 'display':
        return 'font-serif tracking-wide';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  // Dynamic Theme Styling across Earthen, Bright & Midnight modes
  const getContainerStyle = () => {
    if (paletteMode === 'midnight') {
      return 'bg-gradient-to-b from-[#1C1917] via-[#121110] to-[#0A0908] border-stone-800 text-stone-100 shadow-xl';
    }
    if (paletteMode === 'bright') {
      return 'bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F3] to-[#FFE4E8] border-rose-200 text-[#4C1D24] shadow-md';
    }
    // Earthen Light (Default)
    return 'bg-[#FFFDF9] border-[#E8DFC8] text-[#2C241E] shadow-sm';
  };

  if (isLockedGate && greeting.delivery?.unlockAt) {
    return (
      <div className={`relative min-h-[520px] w-full rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between shadow-sm border ${getContainerStyle()}`}>
        <GateScreen
          unlockAt={greeting.delivery.unlockAt}
          recipientName={greeting.recipient?.name}
          senderName={greeting.sender?.name}
          onUnlocked={() => setIsLockedGate(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-[520px] w-full rounded-3xl overflow-hidden flex flex-col justify-between p-4 sm:p-7 border ${getFontFamily()} ${getContainerStyle()} transition-all duration-300`}
    >
      {/* Top Bar: Progress Dots, Palette Switcher, Sound & Share */}
      <div className={`flex items-center justify-between w-full pb-3 border-b z-30 ${paletteMode === 'midnight' ? 'border-white/10' : 'border-[#EAE3D9]/60'}`}>
        {/* Step indicator dots */}
        <div className="flex items-center gap-2">
          {flow.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentBlockIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentBlockIndex
                  ? paletteMode === 'bright'
                    ? 'w-7 bg-rose-500 shadow-sm'
                    : paletteMode === 'midnight'
                    ? 'w-7 bg-amber-400 shadow-sm'
                    : 'w-7 bg-[#B85D3B] shadow-sm'
                  : idx < currentBlockIndex
                  ? paletteMode === 'midnight'
                    ? 'w-2 bg-stone-500'
                    : 'w-2 bg-[#D4A373]'
                  : paletteMode === 'midnight'
                  ? 'w-2 bg-stone-800'
                  : 'w-2 bg-[#EAE3D9]'
              }`}
              title={`Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Palette Mode Switcher (Earthen <-> Bright <-> Midnight) */}
          <button
            type="button"
            onClick={cyclePalette}
            className={`p-2 rounded-full border shadow-sm transition-all active:scale-95 flex items-center gap-1 text-[11px] font-medium ${
              paletteMode === 'midnight'
                ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                : paletteMode === 'bright'
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300'
                : 'bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#7D6E63] border-[#DDD5C7]'
            }`}
            title={`Palette: ${paletteMode}. Tap to cycle!`}
          >
            {paletteMode === 'midnight' ? (
              <Moon className="w-3.5 h-3.5 text-amber-300" />
            ) : paletteMode === 'bright' ? (
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#B85D3B]" />
            )}
            <span className="capitalize text-[10px] hidden sm:inline">{paletteMode}</span>
          </button>

          {/* Happy Birthday Ringtone Button */}
          <button
            type="button"
            onClick={toggleBirthdayRingtone}
            className={`px-2.5 py-1.5 rounded-full border shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold ${
              isPlayingRingtone
                ? 'bg-amber-400 text-stone-950 border-amber-500 animate-pulse'
                : paletteMode === 'midnight'
                ? 'bg-stone-800 text-amber-200 border-stone-700 hover:bg-stone-700'
                : 'bg-[#FAF4EB] text-[#B85D3B] border-[#E8DFC8] hover:bg-[#F3ECE0]'
            }`}
            title="Play Happy Birthday Ringtone"
          >
            <span className="text-sm">🎂</span>
            <span className="text-[11px] font-medium hidden sm:inline">
              {isPlayingRingtone ? 'Tune Playing 🎵' : 'Birthday Tune'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-full border shadow-sm transition-all active:scale-95 ${
              paletteMode === 'midnight'
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                : 'bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#7D6E63] border-[#DDD5C7]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#557C4F]" />}
          </button>

          {/* Share button */}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className={`p-2 rounded-full border shadow-sm transition-all active:scale-95 ${
                paletteMode === 'midnight'
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                  : 'bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#7D6E63] border-[#DDD5C7]'
              }`}
              title="Share Greeting"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit button */}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className={`p-2 rounded-full border shadow-sm transition-all active:scale-95 ${
                paletteMode === 'midnight'
                  ? 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-700'
                  : 'bg-[#FAF4EB] hover:bg-[#F0E4D5] text-[#B85D3B] border-[#E8DFC8]'
              }`}
              title="Modify / Edit this greeting"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Flow Content Container */}
      <div className="flex-1 flex items-center justify-center w-full my-auto py-4 sm:py-6 z-20">
        {currentBlock?.type === 'scene' && (
          <div className="w-full animate-in fade-in duration-300">
            {currentBlock.engine === 'blowout' && (
              <BlowoutEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'tap-light' && (
              <TapLightEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'level-up' && (
              <LevelUpEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {(currentBlock.engine === 'magic-balloon-lift' || currentBlock.engine === 'lift-off') && (
              <MagicBalloonLiftEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'type-out' && (
              <TypeOutEngine
                props={currentBlock.props}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'reveal' && (
              <RevealEngine
                props={currentBlock.props}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'pop' && (
              <PopEngine
                props={currentBlock.props}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'grow' && (
              <GrowEngine
                props={currentBlock.props}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'catch' && (
              <CatchEngine
                props={currentBlock.props}
                recipientName={recipientName}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'fortune-cookie' && (
              <FortuneCookieEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'magic-lamp' && (
              <MagicLampEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'dandelion' && (
              <DandelionEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'piano-tune' && (
              <PianoTuneEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'pinata-smash' && (
              <PinataSmashEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'constellation-star' && (
              <ConstellationEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
            {currentBlock.engine === 'birthday-vinyl' && (
              <BirthdayVinylEngine
                props={currentBlock.props}
                accentColor={accent}
                recipientName={recipientName}
                paletteMode={paletteMode}
                onComplete={handleNext}
                isInteractive={isInteractive}
              />
            )}
          </div>
        )}

        {currentBlock?.type === 'message' && (
          <div className="w-full animate-in fade-in duration-300">
            <MessageBlockView
              block={currentBlock}
              senderName={greeting.sender?.name}
              recipientName={recipientName}
            />
          </div>
        )}

        {currentBlock?.type === 'photos' && (
          <div className="w-full animate-in fade-in duration-300">
            <PhotosBlockView
              block={currentBlock}
              recipientName={recipientName}
            />
          </div>
        )}

        {currentBlock?.type === 'timeline' && (
          <div className="w-full animate-in fade-in duration-300">
            <TimelineBlockView
              block={currentBlock}
              recipientName={recipientName}
            />
          </div>
        )}

        {currentBlock?.type === 'secret' && (
          <div className="w-full animate-in fade-in duration-300">
            <SecretBlockView
              block={currentBlock}
              onUnlocked={handleNext}
              isInteractive={isInteractive}
            />
          </div>
        )}

        {currentBlock?.type === 'signature' && (
          <div className="w-full animate-in fade-in duration-300">
            <SignatureBlockView
              block={currentBlock}
              senderName={greeting.sender?.name}
            />
          </div>
        )}

        {currentBlock?.type === 'final' && (
          <div className="w-full animate-in fade-in duration-300">
            <FinalBlockView
              block={currentBlock}
              greetingId={greeting.id}
              recipientName={greeting.recipient?.name}
              senderName={greeting.sender?.name}
              onReplay={restartFlow}
              onCreateNew={onCreateNew}
              onShare={onShare}
              onEdit={onEdit}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className={`flex items-center justify-between w-full pt-3 border-t z-30 ${paletteMode === 'midnight' ? 'border-white/10' : 'border-[#EAE3D9]/60'}`}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentBlockIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-medium transition-all ${
            currentBlockIndex === 0
              ? 'opacity-30 cursor-not-allowed text-[#A89F91]'
              : paletteMode === 'midnight'
              ? 'text-stone-300 hover:text-white hover:bg-stone-800'
              : 'text-[#7D6E63] hover:text-[#2C241E] hover:bg-[#FAF7F2] active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <span className={`text-[11px] font-mono ${paletteMode === 'midnight' ? 'text-stone-400' : 'text-[#9E8E81]'}`}>
          {currentBlockIndex + 1} of {flow.length}
        </span>

        {currentBlockIndex < flow.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-2xl text-xs font-semibold shadow-sm transition-all active:scale-95 ${
              paletteMode === 'bright'
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                : paletteMode === 'midnight'
                ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold'
                : 'bg-[#B85D3B] hover:bg-[#A14F33] text-white'
            }`}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-20" />
        )}
      </div>
    </div>
  );
};
