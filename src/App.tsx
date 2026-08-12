import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InstallerForm } from './components/InstallerForm';
import { ChecklistCategoryView } from './components/ChecklistCategoryView';
import { SignaturePad } from './components/SignaturePad';
import { DriveSyncModal } from './components/DriveSyncModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { HistoryModal } from './components/HistoryModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { INITIAL_TE4_CATEGORIES } from './data/te4NormativeCategories';
import { Inspection, InstallerInfo, ClientInfo, TechnicalInfo, ItemStatus, PhotoItem } from './types';
import { TARGET_DRIVE_ACCOUNT } from './utils/googleDrive';
import { Save, CheckCircle, FileText, HardDrive, Shield, AlertTriangle, Smartphone } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'te4_inspection_active_v1';
const LOCAL_STORAGE_LIST_KEY = 'te4_inspections_history_v1';

export default function App() {
  // Initialize state
  const [inspection, setInspection] = useState<Inspection>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.categories) {
          parsed.categories.forEach((cat: any) => {
            if (cat.id === 'cat-02') {
              cat.title = '2. Tableros Instalación Fotovoltaica';
            }
            if (cat.id === 'cat-05' && cat.items && !cat.items.some((it: any) => it.id === 'item-504')) {
              cat.items.push({
                id: 'item-504',
                code: '5.4',
                title: 'Video Comprobando Continuidad de Tierra en Canalizaciones AC y DC',
                normaSec: 'RIC N°06 § 7.2 / RIC N°04',
                description: 'Verificación mediante registro en video comprobando la continuidad de tierra de las canalizaciones de AC y DC con multímetro o instrumento de prueba.',
                photoGuide: 'Video o fotos comprobando la continuidad de tierra de las canalizaciones AC y DC.',
                status: 'PENDIENTE',
                observation: '',
                photos: []
              });
            }
            if (cat.id === 'cat-06' && cat.items && !cat.items.some((it: any) => it.id === 'item-604')) {
              cat.items.push({
                id: 'item-604',
                code: '6.4',
                title: 'Fachada de la Propiedad y Numeración',
                normaSec: 'RIC N°02 / RIC N°10',
                description: 'Evidencia fotográfica de la fachada principal de la propiedad donde se aprecie claramente el inmueble y su numeración municipal.',
                photoGuide: 'Foto general de la fachada de la propiedad mostrando la numeración visible del inmueble.',
                status: 'PENDIENTE',
                observation: '',
                photos: []
              });
            }
            if (cat.items) {
              cat.items = cat.items.filter((it: any) => it.id !== 'item-403');
            }
            cat.items?.forEach((it: any) => {
              if (it.id === 'item-102') {
                it.title = 'Verificación de Cables Solares';
                it.description = 'Verificación de cables solar sin tocar techumbre, asegurando la adecuada fijación y protección UV.';
                it.photoGuide = 'Foto de la canalización/tendido de cable solar verificando que no exista contacto directo con la techumbre.';
              }
              if (it.id === 'item-103') {
                it.description = 'Verificar que conectores MC4 queden bien armados y que no queden expuestos a la intemperie, protegidos bajo paneles.';
                it.photoGuide = 'Foto de conectores MC4 bien armados y protegidos bajo los paneles solares.';
              }
              if (it.id === 'item-201') {
                it.title = 'Foto Tablero FV Interior y Exterior';
              }
              if (it.id === 'item-202') {
                it.title = 'Fotografías Tableros Existentes';
                it.description = 'Sacar fotografía en donde se vean claros la capacidad de las protecciones.';
                it.photoGuide = 'Foto en donde se aprecie claramente la capacidad y amperaje de las protecciones.';
              }
              if (it.id === 'item-203') {
                it.title = 'Fotografía Selector ATS';
                it.description = 'Verificar existencia de selector de GRID y BACKUP para conmutación en caso de mantención o fallo del sistema FV.';
                it.photoGuide = 'Foto del selector ATS/conmutador GRID y BACKUP mostrando su estado y posición.';
              }
              if (it.id === 'item-204') {
                it.title = 'Canalización String, Aterrizaje Tierra de Cajas Metálicas';
                it.description = 'Verificar canalización de String C.C. y el correcto aterrizaje a tierra de las cajas metálicas y canalizaciones.';
                it.photoGuide = 'Foto de la canalización de String y aterrizaje a tierra de las cajas metálicas.';
              }
              if (it.id === 'item-303') {
                it.title = 'Interruptor Desconectador Banco de baterias';
              }
              if (it.id === 'item-502') {
                it.title = 'Canalización Baterías Abierta y Cerrada';
                it.description = 'Verificar tipo de canalización de baterías (abierta y cerrada), su fijación, protección y aislamiento.';
                it.photoGuide = 'Foto de la canalización abierta y cerrada del banco de baterías.';
              }
              if (it.id === 'item-504') {
                it.title = 'Video Comprobando Continuidad de Tierra en Canalizaciones AC y DC';
                it.description = 'Verificación mediante registro en video comprobando la continuidad de tierra de las canalizaciones de AC y DC con multímetro o instrumento de prueba.';
                it.photoGuide = 'Video o fotos comprobando la continuidad de tierra de las canalizaciones AC y DC.';
              }
              if (it.id === 'item-602') {
                it.title = 'Dibujo de Instalación (Distancias, Equipos y Empalme)';
                it.description = 'Dibujo de instalación con distancias de canalización, ubicación de equipos y punto de empalme, además del esquema unifilar.';
                it.photoGuide = 'Foto del dibujo o croquis de la instalación indicando distancias de canalización, equipos y empalme.';
              }
              if (it.id === 'item-603') {
                it.title = 'Medidor Distribuidora con Rotulación Normativa';
                it.description = 'Verificar instalación, rotulación normativa y registro del medidor de la empresa distribuidora de energía eléctrica.';
                it.photoGuide = 'Foto en detalle del medidor de la empresa distribuidora, su rotulación normativa y empalme.';
              }
              if (it.id === 'item-604') {
                it.title = 'Fachada de la Propiedad y Numeración';
                it.description = 'Evidencia fotográfica de la fachada principal de la propiedad donde se aprecie claramente el inmueble y su numeración municipal.';
                it.photoGuide = 'Foto general de la fachada de la propiedad mostrando la numeración visible del inmueble.';
              }
            });
          });
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing stored inspection:', e);
      }
    }
    return createNewDefaultInspection();
  });

  const [savedInspectionsList, setSavedInspectionsList] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored list:', e);
      }
    }
    return [];
  });

  const [driveConnected, setDriveConnected] = useState<boolean>(true);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Check PWA Standalone status and beforeinstallprompt
  useEffect(() => {
    const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!isStandaloneApp);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('El usuario aceptó la instalación de la App');
    }
    setDeferredPrompt(null);
  };

  // Auto-save active inspection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inspection));
    } catch (e) {
      console.warn('No se pudo guardar la inspección en localStorage:', e);
    }
  }, [inspection]);

  // Auto-save history list
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(savedInspectionsList));
    } catch (e) {
      console.warn('No se pudo guardar la lista de inspecciones en localStorage:', e);
    }
  }, [savedInspectionsList]);

  function createNewDefaultInspection(): Inspection {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: 'insp-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installer: {
        name: '',
        rut: '',
        secClass: 'Clase A',
        secLicenceNumber: '',
        phone: '',
        email: '',
        companyName: 'Servilec Solar SpA',
      },
      client: {
        name: '',
        rut: '',
        address: '',
        comuna: '',
        region: 'Región Metropolitana',
        phone: '',
        email: '',
      },
      technical: {
        systemType: 'On-Grid (Netbilling)',
        installedPowerKwp: '5.5',
        inverterBrandModel: '',
        inverterSerialNumber: '',
        panelsCountAndPower: '10x 550W',
        mpptCount: '2 MPPT',
        stringsCount: '2 Strings',
        panelsPerString: '5 paneles por string (10 total)',
        groundingResistanceOhm: '8.5',
        gpsCoordinates: '',
        inspectionDate: today,
      },
      categories: JSON.parse(JSON.stringify(INITIAL_TE4_CATEGORIES)),
      generalNotes: 'La instalación fotovoltaica ha sido ejecutada de acuerdo a las especificaciones normativas de los pliegos técnicos RIC de la SEC.',
      status: 'Borrador',
    };
  }

  // Count metrics
  let totalItemsCount = 0;
  let completedItemsCount = 0;
  let totalPhotosCount = 0;
  let nonCompliantCount = 0;

  inspection.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      totalItemsCount++;
      if (item.status !== 'PENDIENTE') completedItemsCount++;
      if (item.status === 'NC') nonCompliantCount++;
      totalPhotosCount += item.photos.length;
    });
  });

  // Handlers for updating inspection state
  const handleUpdateInstaller = (data: InstallerInfo) => {
    setInspection((prev) => ({ ...prev, installer: data, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateClient = (data: ClientInfo) => {
    setInspection((prev) => ({ ...prev, client: data, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateTechnical = (data: TechnicalInfo) => {
    setInspection((prev) => ({ ...prev, technical: data, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateItemStatus = (itemId: string, status: ItemStatus) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateItemObservation = (itemId: string, observation: string) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => (item.id === itemId ? { ...item, observation } : item)),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddPhotosToItem = (itemId: string, newPhotos: PhotoItem[]) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, photos: [...item.photos, ...newPhotos] } : item
        ),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRemovePhotoFromItem = (itemId: string, photoId: string) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, photos: item.photos.filter((p) => p.id !== photoId) } : item
        ),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdatePhotoNote = (itemId: string, photoId: string, note: string) => {
    setInspection((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                photos: item.photos.map((p) => (p.id === photoId ? { ...p, note } : p)),
              }
            : item
        ),
      })),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveSignature = (dataUrl: string) => {
    setInspection((prev) => ({ ...prev, signatureDataUrl: dataUrl, updatedAt: new Date().toISOString() }));
  };

  const handleClearSignature = () => {
    setInspection((prev) => ({ ...prev, signatureDataUrl: undefined, updatedAt: new Date().toISOString() }));
  };

  const handleManualSave = () => {
    // Save to history array if not already present
    setSavedInspectionsList((prev) => {
      const idx = prev.findIndex((i) => i.id === inspection.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = inspection;
        return copy;
      }
      return [inspection, ...prev];
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleNewInspection = () => {
    handleManualSave();
    const fresh = createNewDefaultInspection();
    setInspection(fresh);
  };

  const handleLoadInspectionFromHistory = (insp: Inspection) => {
    setInspection(insp);
  };

  const handleDeleteInspectionFromHistory = (id: string) => {
    setSavedInspectionsList((prev) => prev.filter((i) => i.id !== id));
  };

  // Direct Google Drive Auto-Upload Modal Handler
  const handleConnectDrive = () => {
    setIsDriveModalOpen(true);
  };

  const handleInspectionUploadedToDrive = (folderId: string, folderUrl: string) => {
    setInspection((prev) => ({
      ...prev,
      driveFolderId: folderId,
      driveFolderUrl: folderUrl,
      status: 'Subido a Drive',
    }));
    handleManualSave();
  };

  // Export JSON backup
  const handleExportJsonBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedInspectionsList));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `TE4_Inspecciones_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import JSON backup
  const handleImportJsonBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setSavedInspectionsList(imported);
          if (imported.length > 0) {
            setInspection(imported[0]);
          }
          alert('¡Respaldo importado correctamente!');
        }
      } catch (err) {
        alert('Error al leer archivo de respaldo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] font-sans pb-16">
      {/* Header Bar */}
      <Header
        driveConnected={driveConnected}
        onConnectDrive={handleConnectDrive}
        onOpenPdfPreview={() => setIsPdfModalOpen(true)}
        onOpenDriveSync={() => setIsDriveModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onNewInspection={handleNewInspection}
        onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
        completedItemsCount={completedItemsCount}
        totalItemsCount={totalItemsCount}
        photosCount={totalPhotosCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 space-y-4">
        {/* Save Toast Notification */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-40 bg-[#1A1A1A] text-white font-mono text-xs uppercase tracking-widest font-bold px-4 py-3 border border-[#1A1A1A] flex items-center gap-2 shadow-2xl">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>¡Guardado localmente!</span>
          </div>
        )}

        {/* Warning Banner if Non-Compliant Items exist */}
        {nonCompliantCount > 0 && (
          <div className="bg-red-50 border border-[#1A1A1A] p-4 flex items-center justify-between gap-3 text-red-950">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-900 text-white flex items-center justify-center font-bold shrink-0 border border-[#1A1A1A]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-serif italic font-bold text-red-950">
                  {nonCompliantCount} Ítem(s) No Conforme(s) detectado(s)
                </h4>
                <p className="text-xs font-sans text-red-900/90">
                  Revise los ítems marcados en rojo antes de la tramitación final de la Declaración TE4 ante la SEC.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form 1: Installer and Client Data */}
        <InstallerForm
          installer={inspection.installer}
          client={inspection.client}
          technical={inspection.technical}
          onChangeInstaller={handleUpdateInstaller}
          onChangeClient={handleUpdateClient}
          onChangeTechnical={handleUpdateTechnical}
        />

        {/* Checklist Categories & Photo Upload Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#15803D] pb-2">
            <h2 className="text-lg sm:text-xl font-serif italic text-[#14532D] font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#25A238]" />
              Checklist de Inspección TE4 SEC (RIC N°01 a N°19)
            </h2>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#15803D] font-bold hidden sm:inline">
              SERVILEC ENERGÍA • Inspección Fotográfica
            </span>
          </div>

          <ChecklistCategoryView
            categories={inspection.categories}
            onUpdateStatus={handleUpdateItemStatus}
            onUpdateObservation={handleUpdateItemObservation}
            onAddPhotos={handleAddPhotosToItem}
            onRemovePhoto={handleRemovePhotoFromItem}
            onUpdatePhotoNote={handleUpdatePhotoNote}
          />
        </div>

        {/* Section 3: General Notes & Installer Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/30 space-y-1.5 shadow-2xs">
            <label className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#14532D] block">
              Observaciones Generales de la Inspección TE4
            </label>
            <textarea
              id="input-general-notes"
              rows={3}
              value={inspection.generalNotes}
              onChange={(e) =>
                setInspection((prev) => ({
                  ...prev,
                  generalNotes: e.target.value,
                  updatedAt: new Date().toISOString(),
                }))
              }
              placeholder="Escriba comentarios o recomendaciones adicionales para el cliente..."
              className="w-full p-2.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
            />
          </div>

          <SignaturePad
            signatureDataUrl={inspection.signatureDataUrl}
            onSaveSignature={handleSaveSignature}
            onClearSignature={handleClearSignature}
          />
        </div>

        {/* Bottom Floating Quick Actions Bar */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white p-3 sm:p-4 border-t-2 border-t-[#25A238] border border-[#15803D] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#25A238] text-white font-serif font-bold italic flex items-center justify-center text-base rounded-xs shadow-xs border border-white/30">
              TE4
            </div>
            <div>
              <h3 className="text-sm font-serif italic text-white font-bold">
                {inspection.client.name ? `Inspección: ${inspection.client.name}` : 'Borrador de Inspección Activo'}
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/90 font-medium">
                {completedItemsCount} de {totalItemsCount} evaluados • {totalPhotosCount} fotos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              id="btn-bottom-save"
              onClick={handleManualSave}
              className="px-3.5 py-2 border border-white/40 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#25A238]" />
              <span>Guardar Borrador</span>
            </button>

            <button
              id="btn-bottom-drive"
              onClick={() => setIsDriveModalOpen(true)}
              className="px-3.5 py-2 border border-[#25A238] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#16A34A] transition-colors cursor-pointer shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#DCFCE7]" />
              <span>Subir a Drive</span>
            </button>

            <button
              id="btn-bottom-android"
              onClick={() => setIsAndroidModalOpen(true)}
              className="px-3.5 py-2 border border-[#25A238] bg-[#14532D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#15803D] transition-colors cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#25A238]" />
              <span>Instalar App Android</span>
            </button>

            <button
              id="btn-bottom-pdf"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2 border border-white bg-white text-[#14532D] text-[10px] uppercase font-mono tracking-widest font-extrabold flex items-center gap-1.5 hover:bg-[#F0FDF4] transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Ver Reporte PDF</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        inspection={inspection}
        onInspectionUploaded={handleInspectionUploadedToDrive}
        onTokenCleared={() => setDriveConnected(false)}
      />

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        inspection={inspection}
        onOpenDriveSync={() => setIsDriveModalOpen(true)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedInspections={savedInspectionsList}
        currentInspectionId={inspection.id}
        onLoadInspection={handleLoadInspectionFromHistory}
        onDeleteInspection={handleDeleteInspectionFromHistory}
        onNewInspection={handleNewInspection}
        onExportJsonBackup={handleExportJsonBackup}
        onImportJsonBackup={handleImportJsonBackup}
      />

      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerPwaInstall}
        isStandalone={isStandalone}
      />
    </div>
  );
}
