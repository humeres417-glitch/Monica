import React from 'react';
import { Smartphone, Download, CheckCircle, HelpCircle, X, ExternalLink, ShieldCheck, Share2 } from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
  isStandalone: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
  isStandalone,
}) => {
  if (!isOpen) return null;

  const currentAppUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-white border-2 border-[#1A1A1A] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif italic text-lg font-bold">Instalar en Dispositivo Android / APK</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded-sm text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-[#1A1A1A]">
          {/* Status Banner */}
          {isStandalone ? (
            <div className="bg-emerald-50 border border-emerald-800 p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 text-sm">¡La aplicación ya está instalada como App nativa!</p>
                <p className="text-xs text-emerald-800 mt-0.5">Estás ejecutando la aplicación en modo Standalone PWA.</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#F7F5F2] border border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#1A1A1A] font-bold">Modo PWA Directo</span>
                <h4 className="font-serif italic font-bold text-base mt-0.5">Instalar como App en pantalla de inicio</h4>
                <p className="text-xs opacity-70 mt-1">Funciona sin descargar archivos extra en Android Chrome o Edge.</p>
              </div>
              {deferredPrompt ? (
                <button
                  onClick={onTriggerInstall}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 border border-[#1A1A1A] transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Ahora</span>
                </button>
              ) : (
                <div className="text-xs font-mono bg-white border border-[#1A1A1A] px-3 py-1.5 text-center">
                  Listo para Android
                </div>
              )}
            </div>
          )}

          {/* Option 1: Chrome Android Direct Installation */}
          <div className="border border-[#1A1A1A] p-4 space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
              <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs font-mono">1</span>
              Instalación Directa desde Chrome Android (Recomendado)
            </h4>
            <ol className="text-xs space-y-2 list-decimal list-inside opacity-90 leading-relaxed font-sans">
              <li>Abre esta misma página en el navegador <strong>Google Chrome</strong> de tu teléfono Android.</li>
              <li>Toca el menú de tres puntos (<strong>⋮</strong>) en la esquina superior derecha de Chrome.</li>
              <li>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.</li>
              <li>Confirma en <strong>"Instalar"</strong>. La App aparecerá con su ícono oficial en el menú de aplicaciones de tu teléfono como una App nativa Android.</li>
            </ol>
          </div>

          {/* Option 2: Build / Convert to Standalone APK */}
          <div className="border border-[#1A1A1A] p-4 space-y-3 bg-[#F7F5F2]">
            <h4 className="font-bold text-sm flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
              <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xs font-mono">2</span>
              Generar un archivo instalador .APK
            </h4>
            <p className="text-xs opacity-80 leading-relaxed">
              Si requieres el archivo físico <strong>.APK</strong> para enviarlo por WhatsApp o instalarlo sin navegador:
            </p>
            <ul className="text-xs space-y-2 list-disc list-inside font-sans">
              <li>
                <strong>PWABuilder (Gratis & Directo):</strong> Ingresa a <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-800 inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="w-3 h-3" /></a>, pega el enlace de esta app (<code>{currentAppUrl}</code>) y descarga el paquete APK para Android.
              </li>
              <li>
                <strong>Capacitor / Android Studio:</strong> Exporta el código fuente desde el menú superior de AI Studio (Export Project), ejecuta <code>npx cap add android</code> y compila el APK firmado en Android Studio.
              </li>
            </ul>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-[#1A1A1A] pt-4">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Soporte PWA Manifest 2.0</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Soporte Offline & Cámara</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F5F2] border-t border-[#1A1A1A] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A1A1A] text-white font-mono text-xs uppercase font-bold tracking-wider hover:bg-[#333] transition-colors cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
