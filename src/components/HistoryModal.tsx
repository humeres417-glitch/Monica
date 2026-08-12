import React from 'react';
import { History, Plus, Trash2, FolderOpen, Download, Upload, Calendar, User } from 'lucide-react';
import { Inspection } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedInspections: Inspection[];
  currentInspectionId: string;
  onLoadInspection: (inspection: Inspection) => void;
  onDeleteInspection: (id: string) => void;
  onNewInspection: () => void;
  onExportJsonBackup: () => void;
  onImportJsonBackup: (file: File) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedInspections,
  currentInspectionId,
  onLoadInspection,
  onDeleteInspection,
  onNewInspection,
  onExportJsonBackup,
  onImportJsonBackup,
}) => {
  if (!isOpen) return null;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJsonBackup(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1A1A1A] max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-[#1A1A1A] flex items-center justify-center font-bold">
              <History className="w-4 h-4 text-[#1A1A1A]" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white">Historial de Inspecciones TE4</h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-white/70">Registros locales almacenados</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-60 font-mono text-sm font-bold cursor-pointer">
            [CERRAR]
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs text-[#1A1A1A]">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1A1A1A]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
              {savedInspections.length} Inspección(es) Guardada(s)
            </span>

            <button
              onClick={() => {
                onNewInspection();
                onClose();
              }}
              className="px-3.5 py-1.5 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#333] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Inspección
            </button>
          </div>

          {savedInspections.length === 0 ? (
            <div className="text-center py-8 text-[#1A1A1A]/60 space-y-2 font-serif italic">
              <p className="text-sm">No hay inspecciones guardadas previamente.</p>
              <p className="text-xs font-sans not-italic">Cree una nueva inspección o complete el formulario activo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedInspections.map((insp) => {
                const isCurrent = insp.id === currentInspectionId;
                const photosTotal = insp.categories.reduce(
                  (sum, cat) => sum + cat.items.reduce((s, it) => s + it.photos.length, 0),
                  0
                );

                return (
                  <div
                    key={insp.id}
                    className={`p-4 border transition-colors flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[#F7F5F2] border-[#1A1A1A]'
                        : 'bg-white border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-serif italic text-[#1A1A1A]">
                          {insp.client.name || 'Sin Nombre Cliente'}
                        </strong>
                        {isCurrent && (
                          <span className="border border-[#1A1A1A] bg-[#1A1A1A] text-white px-2 py-0.5 text-[9px] font-mono uppercase font-bold">
                            Activa
                          </span>
                        )}
                        {insp.driveFolderUrl && (
                          <span className="border border-[#1A1A1A] bg-emerald-100 text-emerald-950 px-2 py-0.5 text-[9px] font-mono uppercase font-bold">
                            Drive ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#1A1A1A]/70">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#1A1A1A]" />
                          Instalador: {insp.installer.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#1A1A1A]" />
                          {insp.technical.inspectionDate || 'Sin fecha'}
                        </span>
                        <span>📸 {photosTotal} fotos</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isCurrent && (
                        <button
                          onClick={() => {
                            onLoadInspection(insp);
                            onClose();
                          }}
                          className="px-3 py-1.5 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1 hover:bg-[#333] transition-colors cursor-pointer"
                          title="Abrir esta inspección"
                        >
                          <FolderOpen className="w-3.5 h-3.5" /> Abrir
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteInspection(insp.id)}
                        className="p-1.5 border border-[#1A1A1A] bg-white text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Backup & Import Footer Controls */}
          <div className="pt-3 border-t border-[#1A1A1A] flex items-center justify-between gap-2">
            <button
              onClick={onExportJsonBackup}
              className="px-3 py-1.5 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#F7F5F2] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Exportar (JSON)
            </button>

            <label className="px-3 py-1.5 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#F7F5F2] transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Importar Backup
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

