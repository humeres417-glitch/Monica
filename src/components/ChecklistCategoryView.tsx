import React, { useState } from 'react';
import { ChecklistCategory, ItemStatus, PhotoItem } from '../types';
import { ChecklistItemCard } from './ChecklistItemCard';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Clock, Search, Filter } from 'lucide-react';

interface ChecklistCategoryViewProps {
  categories: ChecklistCategory[];
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onAddPhotos: (itemId: string, photos: PhotoItem[]) => void;
  onRemovePhoto: (itemId: string, photoId: string) => void;
  onUpdatePhotoNote: (itemId: string, photoId: string, note: string) => void;
}

export const ChecklistCategoryView: React.FC<ChecklistCategoryViewProps> = ({
  categories,
  onUpdateStatus,
  onUpdateObservation,
  onAddPhotos,
  onRemovePhoto,
  onUpdatePhotoNote,
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initial[cat.id] = true;
    });
    return initial;
  });

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDIENTE' | 'C' | 'NC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <div className="space-y-3">
      {/* Search and Quick Status Filter Bar */}
      <div className="bg-white p-2.5 sm:p-3 border border-[#15803D]/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#15803D]" />
          <input
            id="input-search-checklist"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ítem, norma SEC o código..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#F8FAF9] border border-[#15803D]/30 text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>

          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono shrink-0 transition-colors cursor-pointer border ${
              filterStatus === 'ALL'
                ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold'
                : 'bg-white text-[#0F172A] border-[#15803D]/30 hover:bg-[#F8FAF9]'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setFilterStatus('PENDIENTE')}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
              filterStatus === 'PENDIENTE'
                ? 'bg-amber-100 text-amber-900 border-amber-500 font-bold'
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            Pendientes
          </button>

          <button
            onClick={() => setFilterStatus('NC')}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
              filterStatus === 'NC'
                ? 'bg-rose-700 text-white border-rose-800 font-bold'
                : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            No Conformes
          </button>

          <button
            onClick={() => setFilterStatus('C')}
            className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
              filterStatus === 'C'
                ? 'bg-[#15803D] text-white border-[#14532D] font-bold'
                : 'bg-white text-[#15803D] border-[#15803D]/40 hover:bg-[#F0FDF4]'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            Conformes
          </button>
        </div>
      </div>

      {/* Render Categories */}
      {categories.map((cat) => {
        const filteredItems = cat.items.filter((item) => {
          const matchesStatus =
            filterStatus === 'ALL' ? true : item.status === filterStatus;
          const matchesQuery =
            searchQuery.trim() === ''
              ? true
              : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.normaSec.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesStatus && matchesQuery;
        });

        if (filteredItems.length === 0 && (filterStatus !== 'ALL' || searchQuery !== '')) {
          return null;
        }

        const completedCount = cat.items.filter((i) => i.status !== 'PENDIENTE').length;
        const totalCatItems = cat.items.length;
        const catPhotosCount = cat.items.reduce((sum, i) => sum + i.photos.length, 0);

        return (
          <div key={cat.id} className="bg-white border border-[#15803D]/30 overflow-hidden shadow-2xs">
            {/* Category Header Bar */}
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full bg-[#F0FDF4] hover:bg-[#DCFCE7] px-3.5 sm:px-5 py-2.5 flex items-center justify-between border-b border-[#15803D]/30 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-[#15803D] text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 rounded-xs shadow-2xs">
                  {cat.title.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-serif italic text-[#14532D] font-bold">
                    {cat.title}
                  </h2>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-[#15803D] font-semibold">
                    {completedCount} de {totalCatItems} ítems evaluados • {catPhotosCount} fotos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {completedCount === totalCatItems ? (
                  <span className="hidden sm:inline-block border border-[#15803D] bg-[#25A238] text-white px-2 py-0.5 text-[9px] uppercase font-mono font-bold shadow-2xs">
                    ✓ Completo
                  </span>
                ) : (
                  <span className="hidden sm:inline-block border border-amber-300 bg-amber-100 text-amber-900 px-2 py-0.5 text-[9px] uppercase font-mono font-bold">
                    {totalCatItems - completedCount} Pendientes
                  </span>
                )}
                {openCategories[cat.id] ? (
                  <ChevronUp className="w-4 h-4 text-[#15803D]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#15803D]" />
                )}
              </div>
            </button>

            {/* Category Items List */}
            {openCategories[cat.id] && (
              <div className="p-2 sm:p-3.5 space-y-2.5 bg-[#F7F5F2]/50">
                {filteredItems.map((item) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateObservation={onUpdateObservation}
                    onAddPhotos={onAddPhotos}
                    onRemovePhoto={onRemovePhoto}
                    onUpdatePhotoNote={onUpdatePhotoNote}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

