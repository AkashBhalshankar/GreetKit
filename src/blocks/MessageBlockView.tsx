import React, { useState } from 'react';
import { MessageBlock } from '../types/greeting';
import { Play, Pause, Heart, Feather } from 'lucide-react';
import { playChime } from '../lib/audio';

interface Props {
  block: MessageBlock;
  senderName?: string;
  recipientName?: string;
}

export const MessageBlockView: React.FC<Props> = ({
  block,
  senderName = 'Someone who cares',
  recipientName = 'You',
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(block.voiceNoteDuration || 0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleVoiceNote = () => {
    if (block.voiceNoteUrl && audioRef.current) {
      if (isPlayingVoice) {
        audioRef.current.pause();
        setIsPlayingVoice(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlayingVoice(true);
        }).catch((e) => {
          console.warn('Audio playback error:', e);
          setIsPlayingVoice(true);
          playChime(640, 0.4);
        });
      }
      return;
    }

    setIsPlayingVoice(!isPlayingVoice);
    if (!isPlayingVoice) {
      playChime(640, 0.4);
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dynamically ensure recipient name and sender name replace any hardcoded legacy names
  let messageText = block.text || '';
  if (recipientName && recipientName !== 'Friend' && recipientName !== 'You') {
    messageText = messageText.replace(/Priya/gi, recipientName);
    messageText = messageText.replace(/\{recipient\}/gi, recipientName);
    messageText = messageText.replace(/\{name\}/gi, recipientName);
  }
  if (senderName && senderName !== 'Someone who cares') {
    messageText = messageText.replace(/Akash/gi, senderName);
    messageText = messageText.replace(/\{sender\}/gi, senderName);
  }

  const effectiveAuthor = (senderName && senderName !== 'Someone who cares') 
    ? senderName 
    : (block.author && block.author !== 'Akash' ? block.author : senderName || 'Someone who cares');

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] w-full p-2 sm:p-4 text-center select-none text-[#2C241E]">
      <div className="w-full max-w-lg rounded-3xl bg-[#FFFDF9] border border-[#E8DFC8] p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[320px]">
        {/* Subtle decorative watermark */}
        <div className="absolute top-4 right-4 text-[#EAE3D9]/40 pointer-events-none">
          <Feather className="w-16 h-16" />
        </div>

        {/* Header */}
        <div className="text-left space-y-1 mb-4">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#B85D3B] font-semibold">
            A Letter For {recipientName}
          </span>
          <div className="w-8 h-0.5 bg-[#B85D3B] rounded-full" />
        </div>

        {/* Message Body with Newsreader/Fraunces warm serif */}
        <div className="my-auto text-left font-serif text-base sm:text-lg leading-relaxed text-[#2C241E]">
          "{messageText}"
        </div>

        {/* Voice Note Attachment (Real audio or simulated) */}
        {(block.voiceNoteUrl || block.voiceNoteSimulated) && (
          <div className="my-4 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD5C7] flex items-center gap-3">
            <button
              type="button"
              onClick={toggleVoiceNote}
              className="w-9 h-9 rounded-full bg-[#B85D3B] hover:bg-[#A14F33] text-white flex items-center justify-center shadow-sm shrink-0 transition-transform active:scale-95"
            >
              {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] text-[#7D6E63] font-medium">
                <span>Voice Note from {senderName}</span>
                <span className="font-mono">
                  {block.voiceNoteUrl
                    ? `${formatSec(currentTime)} / ${formatSec(audioDuration || 15)}`
                    : (isPlayingVoice ? '0:14 / 0:24' : '0:24')}
                </span>
              </div>
              {/* Waveform bars */}
              <div className="flex items-center gap-1 h-3">
                {[4, 8, 12, 6, 14, 10, 16, 8, 12, 10, 5, 8, 14, 7, 9, 13, 6, 11].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isPlayingVoice ? 'bg-[#B85D3B] animate-pulse' : 'bg-[#D4A373]/50'
                    }`}
                    style={{
                      height: isPlayingVoice ? `${height}px` : '4px',
                      animationDelay: `${(i % 4) * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {block.voiceNoteUrl && (
              <audio
                ref={audioRef}
                src={block.voiceNoteUrl}
                onLoadedMetadata={() => {
                  if (audioRef.current && audioRef.current.duration) {
                    setAudioDuration(audioRef.current.duration);
                  }
                }}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                  }
                }}
                onEnded={() => {
                  setIsPlayingVoice(false);
                  setCurrentTime(0);
                }}
                className="hidden"
              />
            )}
          </div>
        )}

        {/* Sender Sign-off */}
        <div className="mt-4 pt-3 border-t border-[#EAE3D9] flex items-center justify-between text-xs text-[#7D6E63]">
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#B85D3B] fill-current" />
            With all my heart
          </span>
          <span className="font-serif font-bold text-[#2C241E] text-sm">
            — {effectiveAuthor}
          </span>
        </div>
      </div>
    </div>
  );
};
