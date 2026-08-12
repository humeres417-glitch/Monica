import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  signatureDataUrl?: string;
  onSaveSignature: (dataUrl: string) => void;
  onClearSignature: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  signatureDataUrl,
  onSaveSignature,
  onClearSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution canvas scaling
    canvas.width = 500;
    canvas.height = 160;

    ctx.strokeStyle = '#1A1A1A'; // Deep Charcoal SEC ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If existing signature exists
    if (signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 500, 160);
        setHasDrawn(true);
      };
      img.src = signatureDataUrl;
    }
  }, [signatureDataUrl]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      onSaveSignature(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onClearSignature();
  };

  return (
    <div className="bg-white p-5 border border-[#1A1A1A] space-y-3">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
        <label className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#1A1A1A] flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5" />
          Firma Digital del Instalador
        </label>
        {hasDrawn && (
          <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-emerald-900 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Registrada
          </span>
        )}
      </div>

      <div className="relative bg-[#F7F5F2] border border-[#1A1A1A] overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 cursor-crosshair block"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[#1A1A1A]/40 text-xs font-serif italic">
            Firme aquí con el dedo o mouse
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[10px] uppercase font-mono tracking-widest opacity-60">
          Incrustada en Informe TE4.
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <Eraser className="w-3.5 h-3.5" /> Limpiar
        </button>
      </div>
    </div>
  );
};

