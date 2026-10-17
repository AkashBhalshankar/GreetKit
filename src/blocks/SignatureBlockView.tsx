import React, { useRef, useState, useEffect } from 'react';
import { SignatureBlock } from '../types/greeting';
import { Edit3, Check, RefreshCw, Feather } from 'lucide-react';

interface Props {
  block: SignatureBlock;
  senderName?: string;
  isEditable?: boolean;
  onSaveSignature?: (dataUrl: string) => void;
}

export const SignatureBlockView: React.FC<Props> = ({
  block,
  senderName = 'Someone who cares',
  isEditable = false,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedUrl, setSavedUrl] = useState(block.signatureDataUrl || '');

  const startDraw = (e: React.PointerEvent) => {
    if (!isEditable) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !isEditable) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current && onSaveSignature) {
      const dataUrl = canvasRef.current.toDataURL();
      setSavedUrl(dataUrl);
      onSaveSignature(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSavedUrl('');
    if (onSaveSignature) onSaveSignature('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] w-full p-4 text-center select-none">
      <div className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-[#FFFDF9] text-[#2C241E] border border-[#E8DFC8] shadow-xl relative overflow-hidden">
        {/* Wax seal watermark */}
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#B85D3B]/10 border border-[#B85D3B]/30 flex items-center justify-center text-[#B85D3B] font-serif font-bold text-xs select-none">
          ✦
        </div>

        <div className="text-left space-y-1 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B85D3B] font-semibold">
            Handwritten Seal
          </span>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#2C241E]">Signed with Heart</h3>
        </div>

        {/* Note from sender */}
        <p className="text-xs font-serif text-[#7D6E63] italic mb-4 text-left leading-relaxed">
          "{block.handNote || 'Sent across the miles with pure heartfelt affection.'}"
        </p>

        {/* Signature Area */}
        <div className="relative w-full h-32 rounded-2xl bg-[#FAF7F2] border border-[#DDD5C7] flex items-center justify-center overflow-hidden shadow-inner">
          {savedUrl ? (
            <div className="flex flex-col items-center justify-center w-full h-full p-2 animate-in fade-in">
              <img
                src={savedUrl}
                alt="Sender signature"
                className="max-h-24 max-w-[85%] object-contain filter contrast-125"
              />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={340}
              height={128}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={stopDraw}
              className="w-full h-full touch-none cursor-crosshair"
              style={{ touchAction: 'none' }}
            />
          )}

          {!hasDrawn && !savedUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[#A89F91] text-xs">
              <Edit3 className="w-4 h-4 mr-1.5 opacity-60 text-[#B85D3B]" />
              Touch or drag to leave your handwritten sign
            </div>
          )}
        </div>

        {/* Clear button if drawn on the fly */}
        {hasDrawn && !block.signatureDataUrl && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] text-[#A89F91] hover:text-[#B85D3B] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          </div>
        )}

        {/* Signer footer */}
        <div className="mt-5 pt-3 border-t border-[#EAE3D9] flex justify-between items-center text-xs text-[#7D6E63]">
          <span className="flex items-center gap-1 font-mono text-[10px] text-[#8C6D53]">
            <Check className="w-3 h-3 text-[#407B54]" /> Verified Sender
          </span>
          <span className="font-serif font-bold text-[#2C241E] text-sm">
            — {block.senderName || senderName}
          </span>
        </div>
      </div>
    </div>
  );
};
