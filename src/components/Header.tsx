import React from 'react';
import { HardDrive, FileText } from 'lucide-react';

interface HeaderProps {
  driveConnected: boolean;
  onConnectDrive: () => void;
  onOpenPdfPreview: () => void;
  onOpenDriveSync: () => void;
  onOpenHistory: () => void;
  onNewInspection: () => void;
  onOpenAndroidInstall?: () => void;
  completedItemsCount: number;
  totalItemsCount: number;
  photosCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  driveConnected,
  onConnectDrive,
  onOpenPdfPreview,
  onOpenDriveSync,
  onOpenHistory,
  onNewInspection,
  onOpenAndroidInstall,
  completedItemsCount,
  totalItemsCount,
  photosCount,
}) => {
  const completionPercentage = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  return (
    <header id="app-header" className="bg-white text-[#0F172A] border-b-2 border-[#15803D] border-t-4 border-t-[#25A238] sticky top-0 z-30 shadow-sm">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3.5">
          <img
            src="/servilec_logo.svg"
            alt="Servilec Energía Logo"
            className="h-10 sm:h-12 max-w-[180px] sm:max-w-[210px] w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col border-l-2 border-[#15803D]/20 pl-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-['Arial',sans-serif] not-italic font-bold tracking-tight text-[#0F172A] leading-tight flex items-center gap-2">
              CHECK LIST TE4
              <span className="hidden md:inline-block bg-[#15803D] text-white text-[10px] font-mono px-2 py-0.5 rounded-xs font-semibold">
                SEC
              </span>
            </h1>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#15803D] font-extrabold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#25A238] animate-pulse"></span>
              INSPECCIÓN TÉCNICA
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Google Drive Direct Button targeting te4.servilec@gmail.com */}
          <button
            id="btn-drive-sync"
            onClick={onOpenDriveSync}
            className="px-3.5 py-1.5 rounded-full border border-[#15803D] bg-[#15803D] text-white text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 hover:bg-[#16A34A] transition-colors cursor-pointer shadow-xs"
            title="Respaldo automático en Google Drive: te4.servilec@gmail.com"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Drive: te4.servilec@gmail.com</span>
          </button>

          {/* PDF Preview / Export Button */}
          <button
            id="btn-pdf-preview"
            onClick={onOpenPdfPreview}
            className="px-3.5 py-1.5 rounded-full bg-[#15803D] text-white border border-[#14532D] font-serif text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#25A238] transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Generar PDF</span>
          </button>
        </div>
      </div>

      {/* Progress & Metadata Sub-bar */}
      <div className="bg-[#F0FDF4] border-t border-[#15803D]/30 px-4 sm:px-8 py-1 sm:py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 text-[#0F172A]">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="uppercase text-[9px] sm:text-[10px] tracking-wider text-[#14532D] font-bold">Progreso:</span>
            <div className="w-24 sm:w-36 bg-white h-2.5 border border-[#15803D]/40 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#15803D] to-[#25A238] h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="font-mono font-extrabold text-xs text-[#15803D]">{completionPercentage}%</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 uppercase text-[9px] sm:text-[10px] tracking-wider text-[#14532D]">
            <span>Evaluados:</span>
            <strong className="font-mono text-xs text-[#15803D]">{completedItemsCount} / {totalItemsCount}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[9px] sm:text-[10px] uppercase tracking-wider">
          <div className="flex items-center gap-1.5 border border-[#15803D]/30 px-2.5 py-0.5 bg-white rounded-xs">
            <span className="text-[#14532D] font-semibold">Archivos Fotográficos:</span>
            <strong className="font-mono text-xs text-[#15803D]">{photosCount}</strong>
          </div>
        </div>
      </div>
    </header>
  );
};

