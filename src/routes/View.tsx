import React, { useState, useEffect } from 'react';
import { Greeting } from '../types/greeting';
import { Player } from '../viewer/Player';
import { ShareModal } from '../studio/ShareModal';
import { decodeGreetingFromHash } from '../lib/codec';
import { fetchGreeting, saveGreeting } from '../lib/api';
import { Sparkles, ArrowLeft, RefreshCw, AlertCircle, Edit3 } from 'lucide-react';

interface Props {
  greetingId?: string;
  inlineHash?: string;
  onGoHome: () => void;
  onCreateNew: () => void;
  onEditGreeting?: (greeting: Greeting) => void;
}

export const View: React.FC<Props> = ({ greetingId, inlineHash, onGoHome, onCreateNew, onEditGreeting }) => {
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      // 1. Try server fetch if greetingId is present (gets live wish wall and latest synced updates)
      if (greetingId) {
        try {
          const doc = await fetchGreeting(greetingId);
          if (doc) {
            setGreeting(doc);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Backend fetch failed, checking inline fallback:', err);
        }
      }

      // 2. Fall back to resilient inline data embedded in the link
      if (inlineHash) {
        const decoded = decodeGreetingFromHash(inlineHash);
        if (decoded) {
          setGreeting(decoded);
          setLoading(false);
          // Sync back to server in background so next time it is cached
          saveGreeting(decoded).catch(() => {});
          return;
        }
      }

      // 3. Fall back to local storage cache if available
      if (greetingId) {
        try {
          const cached = localStorage.getItem(`greetkit_cached_${greetingId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            setGreeting(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      setError('Greeting could not be found. Please request an updated link from the sender.');
      setLoading(false);
    }

    load();
  }, [greetingId, inlineHash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] flex items-center justify-center animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs sm:text-sm text-[#7D6E63] font-serif">Unfolding your living greeting...</p>
      </div>
    );
  }

  if (error || !greeting) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FDE8E8] text-[#E02424] border border-[#F8B4B4] flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#2C241E]">Oops, greeting could not be loaded</h2>
        <p className="text-xs text-[#7D6E63] max-w-xs">{error || 'Invalid greeting document'}</p>
        <button
          type="button"
          onClick={onGoHome}
          className="px-4 py-2 rounded-2xl text-xs font-semibold bg-[#FAF4EB] hover:bg-[#F3ECE0] text-[#2C241E] border border-[#DDD5C7] transition-all"
        >
          Return to Greetkit Home
        </button>
      </div>
    );
  }

  const paletteMode = greeting.theme?.paletteMode || 'earthen';
  const isBright = paletteMode === 'bright';
  const isMidnight = paletteMode === 'midnight';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 transition-colors duration-300 selection:bg-[#E4C5A5] ${
        isMidnight
          ? 'bg-[#0F0E0D] text-stone-100'
          : isBright
          ? 'bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F4] to-[#FFE4E8] text-[#4C1D24]'
          : 'bg-[#FAF7F2] text-[#2C241E]'
      }`}
    >
      {/* Top Floating Mini Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-1 z-30">
        <button
          type="button"
          onClick={onGoHome}
          className={`text-xs font-medium flex items-center gap-1.5 p-2 rounded-2xl border shadow-sm transition-all active:scale-95 ${
            isMidnight
              ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
              : 'bg-white border-[#DDD5C7] text-[#7D6E63] hover:text-[#2C241E]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Greetkit
        </button>

        <div className="flex items-center gap-2">
          {onEditGreeting && (
            <button
              type="button"
              onClick={() => onEditGreeting(greeting)}
              className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-2xl border shadow-sm transition-all active:scale-95 ${
                isMidnight
                  ? 'bg-amber-950/70 hover:bg-amber-900 text-amber-200 border-amber-800'
                  : 'bg-[#FAF4EB] hover:bg-[#F0E4D5] text-[#B85D3B] border-[#E8DFC8]'
              }`}
              title="Open this greeting in Studio to edit and modify"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span className="hidden xs:inline">Edit Greeting</span>
              <span className="xs:hidden">Edit</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateNew}
            className={`text-xs font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border shadow-sm transition-all active:scale-95 ${
              isBright
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400'
                : 'bg-white hover:bg-[#FAF4EB] text-[#7D6E63] hover:text-[#2C241E] border-[#DDD5C7]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" /> Make New
          </button>
        </div>
      </div>

      {/* Main Responsive Adaptive Player Card (Adapts to Mobile, Tablet & Desktop) */}
      <div className="w-full max-w-2xl rounded-3xl shadow-sm sm:shadow-md overflow-hidden relative transition-all duration-300">
        <Player
          greeting={greeting}
          onReplay={() => {}}
          onCreateNew={onCreateNew}
          onShare={() => setShowShareModal(true)}
          onEdit={onEditGreeting ? () => onEditGreeting(greeting) : undefined}
          isInteractive={true}
        />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal greeting={greeting} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};
