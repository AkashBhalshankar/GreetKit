import React from 'react';
import { TimelineBlock } from '../types/greeting';
import { Calendar, Compass, Sparkles } from 'lucide-react';

interface Props {
  block: TimelineBlock;
  recipientName?: string;
}

export const TimelineBlockView: React.FC<Props> = ({ block, recipientName = 'Friend' }) => {
  const items = block.items && block.items.length > 0 ? block.items : [
    { date: 'Chapter 1', title: 'The Beginning', story: 'The first time our worlds crossed paths.' },
    { date: 'Chapter 2', title: 'Adventures', story: 'Countless memories and inside jokes that never get old.' },
    { date: 'Today', title: 'Your Big Day', story: 'Celebrating the incredible human you are today.' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] w-full p-2 sm:p-4 text-center select-none text-[#2C241E]">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif tracking-widest uppercase text-[#B85D3B] font-medium bg-[#FAF4EB] border border-[#E8DFC8] mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Storyline</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2C241E]">Our Shared Timeline</h3>
        </div>

        {/* Timeline Items */}
        <div className="w-full space-y-3.5 relative text-left">
          {/* Vertical Track Line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#EAE3D9] -z-5" />

          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3.5 relative">
              {/* Dot Icon with Terracotta ring */}
              <div className="w-8 h-8 rounded-full bg-[#B85D3B] text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-sm mt-1">
                {idx + 1}
              </div>

              {/* Earthen Paper Card */}
              <div className="flex-1 p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DFC8] shadow-sm hover:border-[#D4A373] transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-serif font-bold text-[#2C241E] text-sm">{item.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAF4EB] text-[#8C6D53] border border-[#E8DFC8]">
                    {item.date}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#7D6E63] leading-relaxed">{item.story}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
