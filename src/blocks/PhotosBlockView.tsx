import React, { useState } from 'react';
import { PhotosBlock } from '../types/greeting';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  block: PhotosBlock;
  recipientName?: string;
}

export const PhotosBlockView: React.FC<Props> = ({ block, recipientName = 'Friend' }) => {
  const items = block.items && block.items.length > 0 ? block.items : [
    { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80', caption: 'Unforgettable moments together ✨' },
    { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80', caption: 'Endless laughter & celebrations 🎂' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => setCurrentIndex((idx) => (idx === 0 ? items.length - 1 : idx - 1));
  const next = () => setCurrentIndex((idx) => (idx === items.length - 1 ? 0 : idx + 1));

  const current = items[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] w-full p-2 sm:p-4 text-center select-none text-[#2C241E]">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-[#FAF4EB] border border-[#E8DFC8] mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Memories Vault</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2C241E]">Snapshot Moments</h3>
        </div>

        {/* Polaroid Frame (Warm Linen Parchment) */}
        <div className="w-72 sm:w-80 bg-white p-3.5 pb-6 rounded-2xl shadow-md border border-[#E8DFC8] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-[#FAF7F2] relative shadow-inner">
            <img
              src={current.url}
              alt={current.caption || 'Memory'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div className="mt-3.5 font-serif text-xs sm:text-sm text-[#4A3E36] font-medium text-center italic">
            {current.caption || `Captured with love for ${recipientName}`}
          </div>
        </div>

        {/* Carousel controls */}
        {items.length > 1 && (
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={prev}
              className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7] transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#8C6D53]">
              {currentIndex + 1} of {items.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7] transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
