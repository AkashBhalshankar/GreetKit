import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, AlertCircle, Volume2, Check } from 'lucide-react';

interface Props {
  existingAudioUrl?: string;
  existingDuration?: number;
  onSave: (audioUrl: string, durationSeconds: number) => void;
  onRemove: () => void;
}

export const VoiceNoteRecorder: React.FC<Props> = ({
  existingAudioUrl,
  existingDuration = 0,
  onSave,
  onRemove,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(existingAudioUrl || null);
  const [recordedDataUrl, setRecordedDataUrl] = useState<string | null>(existingAudioUrl || null);
  const [duration, setDuration] = useState<number>(existingDuration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (existingAudioUrl) {
      setRecordedDataUrl(existingAudioUrl);
      setRecordedBlobUrl(existingAudioUrl);
      setDuration(existingDuration);
    }
  }, [existingAudioUrl, existingDuration]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Microphone access is not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Select mime type
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMime || 'audio/webm',
        });
        const blobUrl = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(blobUrl);

        // Convert to Base64 data URL for permanent portable storage inside greeting
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setRecordedDataUrl(base64Data);
          onSave(base64Data, recordingSeconds);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(200); // 200ms slices
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setDuration(recordingSeconds || 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please select a valid audio file (.mp3, .m4a, .wav, .ogg).');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        setRecordedDataUrl(dataUrl);
        setRecordedBlobUrl(dataUrl);
        setDuration(15); // estimated
        onSave(dataUrl, 15);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error('Playback error:', e));
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleClear = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
    setRecordedBlobUrl(null);
    setRecordedDataUrl(null);
    setRecordingSeconds(0);
    setDuration(0);
    onRemove();
  };

  return (
    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DDD5C7] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] flex items-center justify-center">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-serif font-bold text-[#2C241E] block">
              Sender Voice Note
            </span>
            <span className="text-[10px] text-[#7D6E63]">
              Record your real voice message or upload an audio memo
            </span>
          </div>
        </div>

        {recordedDataUrl && !isRecording && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-[#A89F91] hover:text-[#B85D3B] flex items-center gap-1 transition-colors"
            title="Delete voice note"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* State 1: Currently Recording */}
      {isRecording && (
        <div className="p-4 rounded-xl bg-white border border-[#B85D3B]/40 shadow-inner flex flex-col items-center justify-center space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-base font-bold text-[#B85D3B]">
              {formatSeconds(recordingSeconds)} / 1:00
            </span>
          </div>

          {/* Animated soundwaves */}
          <div className="flex items-center gap-1 h-8">
            {[8, 16, 24, 32, 20, 28, 14, 22, 30, 18, 12, 26, 32, 18, 10].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-[#B85D3B] animate-bounce"
                style={{
                  height: `${h}px`,
                  animationDelay: `${(i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop & Save Voice Note</span>
          </button>
        </div>
      )}

      {/* State 2: Recorded Voice Note Ready */}
      {!isRecording && recordedBlobUrl && (
        <div className="p-3.5 rounded-xl bg-white border border-[#E8DFC8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#2C241E] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#407B54]" />
              Voice Note Recorded ({formatSeconds(duration || recordingSeconds)})
            </span>
            <span className="text-[10px] text-[#407B54] font-mono bg-[#EBF3E8] px-2 py-0.5 rounded-full border border-[#C5D8C1]">
              Attached to Letter
            </span>
          </div>

          {/* Audio Player Preview */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-9 h-9 rounded-full bg-[#B85D3B] hover:bg-[#A14F33] text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              {/* Progress bar */}
              <div className="w-full bg-[#FAF4EB] h-2 rounded-full overflow-hidden border border-[#E8DFC8]">
                <div
                  className="bg-[#B85D3B] h-full transition-all"
                  style={{
                    width: `${duration ? Math.min(100, (playbackTime / duration) * 100) : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7D6E63] font-mono">
                <span>{formatSeconds(playbackTime)}</span>
                <span>{formatSeconds(duration || recordingSeconds)}</span>
              </div>
            </div>

            <audio
              ref={audioElementRef}
              src={recordedBlobUrl}
              onTimeUpdate={() => {
                if (audioElementRef.current) {
                  setPlaybackTime(audioElementRef.current.currentTime);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                setPlaybackTime(0);
              }}
              onError={(e) => console.warn('Audio playback error:', e)}
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={startRecording}
              className="px-2.5 py-1 rounded-lg bg-[#FAF4EB] hover:bg-[#F3ECE0] text-[#B85D3B] border border-[#E8DFC8] text-[11px] font-semibold flex items-center gap-1 active:scale-95"
            >
              <Mic className="w-3 h-3" /> Re-record
            </button>
          </div>
        </div>
      )}

      {/* State 3: No Recording Yet */}
      {!isRecording && !recordedBlobUrl && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#B85D3B] hover:bg-[#A14F33] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Voice Note Now</span>
          </button>

          <label className="cursor-pointer py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7] text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all">
            <Upload className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span>Upload Audio File</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}
    </div>
  );
};
