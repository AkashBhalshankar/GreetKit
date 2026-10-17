import React, { useState, useEffect } from 'react';
import { FinalBlock, WishItem, ReplyItem } from '../types/greeting';
import { Sparkles, Heart, RotateCcw, Plus, Send, MessageCircle, Share2, Check, Edit3 } from 'lucide-react';
import { fireCelebration } from '../lib/confetti';
import { playTriumph, playChime } from '../lib/audio';
import { getWishes, postWish, postReply } from '../lib/api';

interface Props {
  block: FinalBlock;
  greetingId: string;
  recipientName?: string;
  senderName?: string;
  onReplay?: () => void;
  onCreateNew?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}

export const FinalBlockView: React.FC<Props> = ({
  block,
  greetingId,
  recipientName = 'Friend',
  senderName = 'Someone who cares',
  onReplay,
  onCreateNew,
  onShare,
  onEdit,
}) => {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [newWishName, setNewWishName] = useState('');
  const [newWishMsg, setNewWishMsg] = useState('');
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);

  // Thank You Reply state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyReaction, setReplyReaction] = useState('❤️');
  const [replyMsg, setReplyMsg] = useState('');
  const [replySent, setReplySent] = useState(false);

  useEffect(() => {
    fireCelebration('confetti');
    playTriumph();

    if (greetingId) {
      getWishes(greetingId).then(setWishes);
    }
  }, [greetingId]);

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishMsg.trim() || !greetingId) return;

    setWishSubmitting(true);
    try {
      const added = await postWish(greetingId, {
        name: newWishName.trim(),
        message: newWishMsg.trim(),
        emoji: '🎉',
      });
      setWishes((prev) => [added, ...prev]);
      setNewWishName('');
      setNewWishMsg('');
      setShowAddWish(false);
      playChime(800, 0.3);
      fireCelebration('sparkles');
    } catch (err) {
      console.error(err);
    } finally {
      setWishSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!greetingId) {
      setReplySent(true);
      return;
    }
    try {
      await postReply(greetingId, {
        name: recipientName,
        reaction: replyReaction,
        message: replyMsg || 'Thank you so much! This made my entire day so special!',
      });
      setReplySent(true);
      playChime(950, 0.4);
      fireCelebration('confetti');
    } catch (err) {
      console.error(err);
      setReplySent(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[440px] w-full p-2 sm:p-4 text-center select-none space-y-5 text-[#2C241E]">
      {/* Top Victory Card */}
      <div className="space-y-2 z-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4A373] via-[#B85D3B] to-[#C86446] p-0.5 mx-auto shadow-md animate-pulse">
          <div className="w-full h-full rounded-full bg-[#FFFDF9] flex items-center justify-center text-2xl">
            🎉
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241E] tracking-tight">
          Celebration Complete!
        </h2>
        <p className="text-xs sm:text-sm text-[#7D6E63] max-w-sm mx-auto leading-relaxed">
          Crafted with love by <span className="font-semibold text-[#B85D3B]">{senderName}</span> for{' '}
          <span className="font-semibold text-[#B85D3B]">{recipientName}</span>.
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 z-10 w-full max-w-md">
        {!replySent ? (
          <button
            type="button"
            onClick={() => setShowReplyModal(true)}
            className="flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-current text-white" />
            Send Thank You Note
          </button>
        ) : (
          <div className="flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-semibold bg-[#EBF3E8] text-[#557C4F] border border-[#C5D8C1] flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Thank You Sent!
          </div>
        )}

        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="py-2.5 px-4 rounded-2xl text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#4A3E36] border border-[#DDD5C7] transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>
        )}

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="py-2.5 px-4 rounded-2xl text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#4A3E36] border border-[#DDD5C7] transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="py-2.5 px-4 rounded-2xl text-xs font-semibold bg-[#FAF4EB] hover:bg-[#F0E4D5] text-[#B85D3B] border border-[#E8DFC8] transition-all active:scale-95 flex items-center justify-center gap-1.5"
            title="Modify this greeting in Studio"
          >
            <Edit3 className="w-3.5 h-3.5" /> Modify / Edit
          </button>
        )}
      </div>

      {/* Wish Wall Section */}
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#E8DFC8] p-5 text-left space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#2C241E]">
            <MessageCircle className="w-4 h-4 text-[#B85D3B]" />
            <span>Wish Wall ({wishes.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddWish(!showAddWish)}
            className="text-[11px] font-semibold text-[#B85D3B] hover:text-[#A14F33] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Leave a Wish
          </button>
        </div>

        {/* Add Wish Form */}
        {showAddWish && (
          <form onSubmit={handleSendWish} className="p-3.5 bg-[#FAF7F2] rounded-2xl space-y-2.5 border border-[#DDD5C7]">
            <input
              type="text"
              value={newWishName}
              onChange={(e) => setNewWishName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none"
              required
            />
            <textarea
              value={newWishMsg}
              onChange={(e) => setNewWishMsg(e.target.value)}
              placeholder="Write your sweet birthday wish..."
              rows={2}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddWish(false)}
                className="text-xs text-[#7D6E63] hover:text-[#2C241E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={wishSubmitting}
                className="px-3.5 py-1.5 bg-[#B85D3B] text-white font-semibold rounded-xl text-xs hover:bg-[#A14F33]"
              >
                Post Wish ✨
              </button>
            </div>
          </form>
        )}

        {/* Wishes List */}
        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {wishes.length === 0 ? (
            <p className="text-xs text-[#9E8E81] italic text-center py-2">
              Be the first friend to leave a wish on this wall!
            </p>
          ) : (
            wishes.map((w) => {
              const displayMsg = (w.message || '')
                .replace(/\b(Priya|Pri|Mateo)\b/gi, recipientName || 'You')
                .replace(/\{recipient\}/gi, recipientName || 'You')
                .replace(/\{name\}/gi, recipientName || 'You');

              return (
                <div key={w.id} className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-[#B85D3B]">{w.name}</span>
                    <span className="text-[#9E8E81]">{w.createdAt}</span>
                  </div>
                  <p className="text-[#4A3E36]">{displayMsg}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create your own Greetkit Banner */}
      {onCreateNew && (
        <div className="w-full max-w-md pt-1">
          <button
            type="button"
            onClick={onCreateNew}
            className="w-full py-3 px-4 rounded-2xl bg-[#2C241E] hover:bg-[#3D322A] text-[#FAF7F2] font-semibold text-xs tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            Make an Interactive Living Greeting
          </button>
        </div>
      )}

      {/* Thank You Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FFFDF9] border border-[#E8DFC8] rounded-3xl p-6 shadow-2xl text-left space-y-3.5">
            <div className="flex items-center gap-2 text-[#B85D3B] font-serif font-bold text-base">
              <Heart className="w-4 h-4 fill-current" />
              <span>Send a Thank-You to {senderName}</span>
            </div>
            <p className="text-xs text-[#7D6E63]">
              Pick your reaction and leave a warm thank-you note:
            </p>
            <div className="flex gap-2 justify-center py-1">
              {['❤️', '🥹', '🥳', '🙌', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setReplyReaction(emoji)}
                  className={`text-xl p-2.5 rounded-2xl border transition-all ${
                    replyReaction === emoji
                      ? 'bg-[#FAF4EB] border-[#B85D3B] scale-110 shadow-sm'
                      : 'bg-white border-[#EAE3D9] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={replyMsg}
              onChange={(e) => setReplyMsg(e.target.value)}
              placeholder="e.g. You truly made my day! Thank you so much for this beautiful surprise!"
              rows={3}
              className="w-full bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-3 text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowReplyModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-[#7D6E63] hover:text-[#2C241E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendReply();
                  setShowReplyModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white transition-all active:scale-95"
              >
                Send Reply 💌
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
