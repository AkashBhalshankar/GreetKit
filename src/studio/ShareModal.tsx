import React, { useState, useEffect } from 'react';
import { Greeting } from '../types/greeting';
import { getWhatsAppShareUrl } from '../lib/codec';
import { Share2, Copy, Check, MessageSquare, QrCode, Sparkles, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { saveGreeting, updateGreeting } from '../lib/api';

interface Props {
  greeting: Greeting;
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ greeting, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  // Ensure greeting has a concise short ID
  if (!greeting.id) {
    greeting.id = `bday-${Math.random().toString(36).substring(2, 8)}`;
  }

  const shortShareUrl = `${window.location.origin}/?id=${encodeURIComponent(greeting.id)}`;
  const whatsappUrl = getWhatsAppShareUrl(greeting, shortShareUrl);

  // Auto-persist greeting to backend and localStorage immediately when modal opens
  useEffect(() => {
    let active = true;
    async function persist() {
      setIsSaving(true);
      try {
        if (greeting.id) {
          await updateGreeting(greeting.id, greeting);
        } else {
          const res = await saveGreeting(greeting);
          if (active && res.id) {
            greeting.id = res.id;
          }
        }
        if (active) {
          setSyncStatus('Link active & ready to send!');
        }
      } catch (err) {
        console.warn('Auto-save notice:', err);
      } finally {
        if (active) setIsSaving(false);
      }
    }
    persist();
    return () => {
      active = false;
    };
  }, [greeting]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shortShareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleManualSync = async () => {
    setIsSaving(true);
    setSyncStatus(null);
    try {
      if (greeting.id) {
        await updateGreeting(greeting.id, greeting);
      } else {
        const res = await saveGreeting(greeting);
        greeting.id = res.id;
      }
      setSyncStatus('Modifications saved! Recipient sees latest version.');
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (err) {
      console.error('Failed to sync greeting:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Birthday Greeting for ${greeting.recipient?.nickname || greeting.recipient?.name || 'You'}!`,
          text: `I made a special interactive birthday greeting for you on Greetkit! Tap to open:`,
          url: shortShareUrl,
        });
      } catch {
        // user dismissed
      }
    }
  };

  const recipientNick = greeting.recipient?.nickname || greeting.recipient?.name || 'Them';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col text-left space-y-4 text-[#2C241E]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] font-bold flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2C241E]">
                Share Birthday Greeting
              </h3>
              <p className="text-[11px] text-[#7D6E63]">
                Clean, short & workable link for {recipientNick}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#FAF4EB] text-[#9E8E81] hover:text-[#2C241E] border border-[#EAE3D9] flex items-center justify-center transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* WhatsApp Direct Share Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs tracking-wide shadow-md shadow-[#25D366]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Send Directly on WhatsApp</span>
        </a>

        {/* Short Shareable Link Box */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-serif font-bold text-[#2C241E] flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#B85D3B]" />
              Short Shareable Link
            </span>
            <span className="text-[10px] text-[#407B54] font-mono bg-[#EBF3E8] px-2 py-0.5 rounded-full border border-[#C5D8C1] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#407B54]" /> Compact & Permanent
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shortShareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                copied
                  ? 'bg-[#407B54] text-white'
                  : 'bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-[#B85D3B]/20'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <p className="text-[11px] text-[#7D6E63]">
            This short link works reliably in WhatsApp, iMessage, Instagram DMs, and emails without breaking or truncating.
          </p>
        </div>

        {/* Sync modifications / QR toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSaving}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7] shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B85D3B] ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Sync Latest Edits'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF4EB] text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7] shadow-xs transition-all flex items-center gap-1 active:scale-95"
            title="Toggle QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQr ? 'Hide QR' : 'QR Code'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#FAF4EB] hover:bg-[#F3ECE0] text-[#B85D3B] border border-[#E8DFC8] shadow-xs transition-all flex items-center gap-1 active:scale-95"
              title="More Share Options"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}
        </div>

        {syncStatus && (
          <p className="text-[11px] text-[#407B54] font-medium text-center flex items-center justify-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> {syncStatus}
          </p>
        )}

        {/* QR Code Card */}
        {showQr && (
          <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                shortShareUrl
              )}`}
              alt="QR Code"
              className="w-36 h-36 rounded-xl border border-stone-100"
            />
            <span className="text-[10px] text-[#7D6E63]">
              Point phone camera to open greeting instantly
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
