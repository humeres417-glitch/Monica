import React, { useState, useEffect } from 'react';
import { FileText, Download, HardDrive, Loader2, Share2, Check } from 'lucide-react';
import { Inspection } from '../types';
import { generateTE4PdfReport } from '../utils/pdfGenerator';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection;
  onOpenDriveSync: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  inspection,
  onOpenDriveSync,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      generateTE4PdfReport(inspection)
        .then((blob) => {
          setPdfBlob(blob);
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        })
        .catch((err) => {
          console.error('Error al generar PDF:', err);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    } else {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    if (!pdfBlob) return;
    const clientClean = (inspection.client.name || 'Cliente').replace(/\s+/g, '_');
    const fileName = `Informe_Técnico_TE4_SEC_${clientClean}_${inspection.technical.inspectionDate || '2026'}.pdf`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfBlob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share && pdfBlob) {
      try {
        const file = new File([pdfBlob], `Informe_TE4_${inspection.client.name || 'Cliente'}.pdf`, { type: 'application/pdf' });
        await navigator.share({
          title: `Informe TE4 SEC - ${inspection.client.name}`,
          text: `Informe de inspección técnica TE4 para instalación solar fotovoltaica.`,
          files: [file],
        });
      } catch (e) {
        console.log('Share canceled or not supported');
      }
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-[#1A1A1A] max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 border-b-2 border-[#25A238]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25A238] text-white flex items-center justify-center font-bold rounded-xs shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white font-bold">
                Informe de Inspección TE4 SEC Chile
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/80">
                SERVILEC ENERGÍA • Cliente: {inspection.client.name || 'Sin especificar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Button */}
            <button
              id="btn-download-pdf-modal"
              onClick={handleDownloadPdf}
              disabled={isGenerating || !pdfBlob}
              className="px-3 py-1.5 border border-[#25A238] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#25A238] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#DCFCE7]" />
              <span className="hidden sm:inline">Descargar PDF</span>
            </button>

            {/* Upload to Drive */}
            <button
              id="btn-drive-from-pdf-modal"
              onClick={() => {
                onClose();
                onOpenDriveSync();
              }}
              className="px-3 py-1.5 border border-white bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#333] transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Subir a Drive</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-white hover:opacity-60 font-mono text-sm font-bold ml-2 cursor-pointer"
            >
              [CERRAR]
            </button>
          </div>
        </div>

        {/* Content Preview Canvas / iFrame */}
        <div className="flex-1 bg-[#1A1A1A]/90 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center text-white space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
              <p className="text-xs uppercase font-mono tracking-widest">Generando documento PDF oficial TE4 SEC...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Vista previa del reporte PDF TE4"
              className="w-full h-full border border-[#1A1A1A] bg-white shadow-lg"
            />
          ) : (
            <div className="text-center text-red-300 text-xs font-mono uppercase tracking-widest">
              No se pudo cargar la vista previa del PDF.
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#F7F5F2] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 border-t border-[#1A1A1A] text-xs">
          <div className="flex items-center gap-2 text-[#1A1A1A] font-mono text-[10px] uppercase tracking-widest opacity-70">
            <span>Formato oficial Chile SEC Ley 20.571</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#F7F5F2] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]" />}
              <span>{copiedLink ? 'Copificado' : 'Compartir'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-1.5 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#333] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Guardar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

