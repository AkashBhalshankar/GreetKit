import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { generateAiDrafts, generateAiSlots, generateAiStyleSuggestion } from '../lib/api';
import { Occasion, Relationship, Tone, Language } from '../types/greeting';

interface Props {
  occasion: Occasion;
  recipientName: string;
  relationship: Relationship;
  tone: Tone;
  language: Language;
  onApplyDraft: (text: string) => void;
  onApplySlots?: (slots: string[]) => void;
  onApplyStyle?: (style: { engine: string; skin: string; accent: string; font: string; tone: string }) => void;
  onClose: () => void;
}

export const AiDraftModal: React.FC<Props> = ({
  occasion,
  recipientName,
  relationship,
  tone,
  language,
  onApplyDraft,
  onApplySlots,
  onApplyStyle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'drafts' | 'slots' | 'style'>('drafts');

  const [insideJoke, setInsideJoke] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [drafts, setDrafts] = useState<string[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [appliedDraftIdx, setAppliedDraftIdx] = useState<number | null>(null);

  const [slotEngine, setSlotEngine] = useState('blowout');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [appliedSlots, setAppliedSlots] = useState(false);

  const [personDesc, setPersonDesc] = useState('');
  const [styleSuggestion, setStyleSuggestion] = useState<any>(null);
  const [loadingStyle, setLoadingStyle] = useState(false);

  const handleGenerateDrafts = async () => {
    setLoadingDrafts(true);
    setAppliedDraftIdx(null);
    try {
      const res = await generateAiDrafts({
        occasion,
        recipientName: recipientName || 'Friend',
        relationship,
        tone,
        language,
        insideJoke,
        details: extraDetails,
      });
      setDrafts(res.drafts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const handleGenerateSlots = async () => {
    setLoadingSlots(true);
    setAppliedSlots(false);
    try {
      const res = await generateAiSlots({
        engine: slotEngine,
        recipientName: recipientName || 'Friend',
        relationship,
        occasion,
        count: 5,
      });
      setSlots(res.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSuggestStyle = async () => {
    if (!personDesc.trim()) return;
    setLoadingStyle(true);
    try {
      const res = await generateAiStyleSuggestion({
        description: personDesc.trim(),
        occasion,
      });
      setStyleSuggestion(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStyle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FFFDF9] border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left text-[#2C241E]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2C241E]">AI Greeting Assistant</h3>
              <p className="text-[11px] text-[#7D6E63]">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9E8E81] hover:text-[#2C241E] text-sm p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-1.5 p-1 bg-[#FAF7F2] rounded-2xl my-4 border border-[#EAE3D9] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'drafts'
                ? 'bg-white text-[#B85D3B] font-semibold border border-[#E8DFC8] shadow-sm'
                : 'text-[#7D6E63] hover:text-[#2C241E]'
            }`}
          >
            ✍️ Draft Messages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('slots')}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'slots'
                ? 'bg-white text-[#B85D3B] font-semibold border border-[#E8DFC8] shadow-sm'
                : 'text-[#7D6E63] hover:text-[#2C241E]'
            }`}
          >
            🎯 Fill Engine Slots
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'style'
                ? 'bg-white text-[#B85D3B] font-semibold border border-[#E8DFC8] shadow-sm'
                : 'text-[#7D6E63] hover:text-[#2C241E]'
            }`}
          >
            🎨 Style Matcher
          </button>
        </div>

        {/* Tab 1: Draft Messages */}
        {activeTab === 'drafts' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#7D6E63] block mb-1">
                  Inside Joke / Memory (Optional)
                </label>
                <input
                  type="text"
                  value={insideJoke}
                  onChange={(e) => setInsideJoke(e.target.value)}
                  placeholder="e.g. Always burns the chai"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#7D6E63] block mb-1">
                  Special Wish or Trait (Optional)
                </label>
                <input
                  type="text"
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  placeholder="e.g. Studying for bar exam, loves cats"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateDrafts}
              disabled={loadingDrafts}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingDrafts ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating 3 drafts with Gemini...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  Generate 3 Tailored Drafts
                </>
              )}
            </button>

            {drafts.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                  Select a draft to apply to message block:
                </span>
                {drafts.map((draft, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] hover:border-[#B85D3B] transition-all space-y-2"
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-serif font-bold text-[#B85D3B]">Draft #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          onApplyDraft(draft);
                          setAppliedDraftIdx(idx);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                          appliedDraftIdx === idx
                            ? 'bg-[#EBF3E8] text-[#557C4F] border border-[#C5D8C1]'
                            : 'bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7]'
                        }`}
                      >
                        {appliedDraftIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#557C4F]" /> Applied
                          </>
                        ) : (
                          'Use this Draft'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[#2C241E] leading-relaxed font-serif">"{draft}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fill Engine Slots */}
        {activeTab === 'slots' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div>
              <label className="text-[11px] font-medium text-[#7D6E63] block mb-1">
                Engine to generate slots for:
              </label>
              <select
                value={slotEngine}
                onChange={(e) => setSlotEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
              >
                <option value="blowout">🎂 Blowout Cake (5 Reasons You Shine)</option>
                <option value="tap-light">🪔 Tap-Light (5 Sacred Blessings)</option>
                <option value="level-up">🎮 Level-Up (5 RPG Character Perks)</option>
                <option value="pop">🎈 Pop Balloons (5 Surprise Reveals)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerateSlots}
              disabled={loadingSlots}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingSlots ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating 5 slots...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Fill 5 Engine Slots
                </>
              )}
            </button>

            {slots.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-serif font-bold text-[#8C6D53] uppercase tracking-wider">
                    Generated Slots ({slots.length})
                  </span>
                  {onApplySlots && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplySlots(slots);
                        setAppliedSlots(true);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                        appliedSlots
                          ? 'bg-[#EBF3E8] text-[#557C4F] border border-[#C5D8C1]'
                          : 'bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7]'
                      }`}
                    >
                      {appliedSlots ? <Check className="w-3.5 h-3.5" /> : null}
                      {appliedSlots ? 'Applied to Engine!' : 'Apply to Engine'}
                    </button>
                  )}
                </div>
                {slots.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs text-[#2C241E] flex items-center gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#FAF4EB] text-[#B85D3B] text-[10px] flex items-center justify-center font-bold border border-[#E8DFC8]">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Style Suggester */}
        {activeTab === 'style' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div>
              <label className="text-[11px] font-medium text-[#7D6E63] block mb-1">
                Tell us about the person (1-2 sentences):
              </label>
              <textarea
                value={personDesc}
                onChange={(e) => setPersonDesc(e.target.value)}
                placeholder="e.g. Pri is super energetic, loves warm coffee shops, indie cozy games, and baking."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] placeholder-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
              />
            </div>

            <button
              type="button"
              onClick={handleSuggestStyle}
              disabled={loadingStyle || !personDesc.trim()}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingStyle ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing personality...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  Suggest Best Engine & Skin
                </>
              )}
            </button>

            {styleSuggestion && (
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-serif font-bold text-[#B85D3B]">
                    Recommended Setup:
                  </span>
                  {onApplyStyle && (
                    <button
                      type="button"
                      onClick={() => onApplyStyle(styleSuggestion)}
                      className="px-3.5 py-1 bg-[#B85D3B] hover:bg-[#A14F33] text-white font-semibold rounded-xl text-xs"
                    >
                      Apply This Style
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-[#EAE3D9] rounded-xl">
                    <span className="text-[#7D6E63] block text-[10px]">Engine:</span>
                    <span className="font-semibold text-[#2C241E] capitalize">{styleSuggestion.engine}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#EAE3D9] rounded-xl">
                    <span className="text-[#7D6E63] block text-[10px]">Skin:</span>
                    <span className="font-semibold text-[#2C241E] capitalize">{styleSuggestion.skin}</span>
                  </div>
                </div>
                <p className="text-xs text-[#7D6E63] italic">
                  "{styleSuggestion.rationale}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#EAE3D9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl text-xs font-semibold bg-[#FAF4EB] hover:bg-[#F0E4D5] text-[#2C241E] border border-[#E8DFC8] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
