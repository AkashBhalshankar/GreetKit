import React, { useRef, useState, useEffect } from 'react';
import { Edit3, RefreshCw, Check, Sparkles, Trash2, PenTool } from 'lucide-react';

interface Props {
  initialSignatureDataUrl?: string;
  senderName?: string;
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

export const SignaturePad: React.FC<Props> = ({
  initialSignatureDataUrl,
  senderName = 'You',
  onSave,
  onClear,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignatureDataUrl));
  const [savedUrl, setSavedUrl] = useState<string>(initialSignatureDataUrl || '');
  const [inkColor, setInkColor] = useState<string>('#1E1B4B'); // Royal Indigo default
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (initialSignatureDataUrl) {
      setSavedUrl(initialSignatureDataUrl);
      setHasDrawn(true);
    }
  }, [initialSignatureDataUrl]);

  // Load existing signature onto canvas if editing
  useEffect(() => {
    if (savedUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = savedUrl;
      }
    }
  }, [savedUrl]);

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setHasDrawn(true);
    setLastPoint(coords);

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    // Smooth curve using mid-points
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastPoint(coords);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      const dataUrl = canvas.toDataURL('image/png');
      setSavedUrl(dataUrl);
      onSave(dataUrl);
    }
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    setSavedUrl('');
    onClear();
  };

  // Generate artistic cursive calligraphy signature from name
  const generateCalligraphy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const name = senderName || 'Sincerely';

    // Background style
    ctx.fillStyle = inkColor;
    ctx.font = 'italic 34px "Fraunces", "Newsreader", "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 6);

    // Calligraphy flourish line under signature
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const startX = canvas.width / 2 - 80;
    const endX = canvas.width / 2 + 80;
    const y = canvas.height / 2 + 20;
    ctx.moveTo(startX, y);
    ctx.bezierCurveTo(startX + 40, y + 8, endX - 40, y - 8, endX, y);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    setSavedUrl(dataUrl);
    setHasDrawn(true);
    onSave(dataUrl);
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] flex items-center justify-center">
            <PenTool className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-serif font-bold text-[#2C241E] block">
              Draw Your Handwritten Signature
            </span>
            <span className="text-[10px] text-[#7D6E63]">
              Sign with your finger, mouse, or stylus to leave an authentic seal
            </span>
          </div>
        </div>

        {hasDrawn && (
          <span className="text-[10px] font-mono text-[#407B54] bg-[#EBF3E8] px-2 py-0.5 rounded-full border border-[#C5D8C1] flex items-center gap-1">
            <Check className="w-3 h-3" /> Signed
          </span>
        )}
      </div>

      {/* Signature Canvas Box */}
      <div className="relative w-full h-36 rounded-xl bg-[#FFFDF9] border-2 border-dashed border-[#DDD5C7] overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={460}
          height={160}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        {!hasDrawn && !isDrawing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[#A89F91] space-y-1">
            <Edit3 className="w-5 h-5 opacity-50 text-[#B85D3B]" />
            <span className="text-xs font-serif italic">Sign your name here with finger or mouse</span>
            <span className="text-[10px] text-[#8C6D53]">Drawings auto-save to greeting</span>
          </div>
        )}
      </div>

      {/* Ink Color & Tools Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        {/* Ink Colors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#7D6E63] font-medium mr-1">Ink:</span>
          {[
            { id: '#1E1B4B', label: 'Indigo', bg: 'bg-[#1E1B4B]' },
            { id: '#B85D3B', label: 'Terracotta', bg: 'bg-[#B85D3B]' },
            { id: '#1C1917', label: 'Noir', bg: 'bg-[#1C1917]' },
            { id: '#881337', label: 'Wine', bg: 'bg-[#881337]' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setInkColor(c.id)}
              className={`w-5 h-5 rounded-full ${c.bg} border-2 transition-transform ${
                inkColor === c.id ? 'scale-110 border-[#FAF4EB] ring-2 ring-[#B85D3B]' : 'border-transparent opacity-80'
              }`}
              title={c.label}
            />
          ))}

          {/* Stroke Width Toggle */}
          <div className="ml-2 flex items-center gap-1 bg-[#FAF4EB] p-0.5 rounded-lg border border-[#E8DFC8]">
            {[
              { w: 1.8, label: 'Thin' },
              { w: 2.8, label: 'Med' },
              { w: 4.2, label: 'Bold' },
            ].map((sw) => (
              <button
                key={sw.w}
                type="button"
                onClick={() => setStrokeWidth(sw.w)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                  strokeWidth === sw.w ? 'bg-white text-[#B85D3B] shadow-xs' : 'text-[#7D6E63]'
                }`}
              >
                {sw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={generateCalligraphy}
            className="px-2.5 py-1 rounded-xl bg-[#FAF4EB] hover:bg-[#F3ECE0] text-[#B85D3B] border border-[#E8DFC8] text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
            title="Auto-generate calligraphy signature from sender name"
          >
            <Sparkles className="w-3 h-3 text-[#D4A373]" />
            <span>Calligraphy Style</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#7D6E63] hover:text-[#B85D3B] border border-[#DDD5C7] text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all"
            title="Clear signature"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
