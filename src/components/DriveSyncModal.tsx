import React, { useState, useEffect } from 'react';
import { HardDrive, ExternalLink, Loader2, FolderCheck, FileText, Image as ImageIcon, CheckCircle, LogIn, LogOut } from 'lucide-react';
import { Inspection, UploadProgress } from '../types';
import { uploadFullInspectionToDrive, TARGET_DRIVE_ACCOUNT } from '../utils/googleDrive';
import { generateTE4PdfReport } from '../utils/pdfGenerator';
import { googleSignIn, initAuth, logoutGoogle, getAccessToken } from '../utils/firebaseAuth';
import { User } from 'firebase/auth';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection;
  onInspectionUploaded: (driveFolderId: string, driveFolderUrl: string) => void;
  onTokenCleared?: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  inspection,
  onInspectionUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(!!getAccessToken());
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initAuth(
        (u, token) => {
          setUser(u);
          setHasToken(!!token);
        },
        () => {
          setUser(null);
          setHasToken(!!getAccessToken());
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Count total photos
  const totalPhotosCount = inspection.categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, item) => s + item.photos.length, 0),
    0
  );

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setHasToken(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Error al conectar con Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setHasToken(false);
  };

  const handleStartDriveUpload = async () => {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      let currentToken = getAccessToken();
      if (!currentToken) {
        setIsAuthenticating(true);
        const loginRes = await googleSignIn();
        currentToken = loginRes.accessToken;
        setUser(loginRes.user);
        setHasToken(true);
        setIsAuthenticating(false);
      }

      // 1. Generate PDF Report Blob
      const pdfBlob = await generateTE4PdfReport(inspection);

      // 2. Upload Report and Photos directly to Google Drive
      const { folderId, folderUrl } = await uploadFullInspectionToDrive(
        inspection,
        pdfBlob,
        currentToken,
        (currentProgress) => {
          setProgress(currentProgress);
        }
      );

      onInspectionUploaded(folderId, folderUrl);
    } catch (err: any) {
      console.error('Error en carga a Google Drive:', err);
      setErrorMessage(err.message || 'Error durante la carga a Google Drive.');
    } finally {
      setIsUploading(false);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1A1A1A] max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#25A238]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#25A238] text-white flex items-center justify-center font-bold rounded-xs shadow-xs">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white font-bold">Google Drive — Respaldo de Inspección</h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-100/80">SERVILEC ENERGÍA • {TARGET_DRIVE_ACCOUNT}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading || isAuthenticating}
            className="text-white hover:text-emerald-200 font-mono text-sm font-bold cursor-pointer"
          >
            [CERRAR]
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-[#1A1A1A]">
          {/* Account Status / Auth Box */}
          <div className="bg-[#F0FDF4] p-4 border border-[#15803D]/40 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#14532D] font-bold block">
                  Cuenta Google Drive:
                </span>
                <strong className="text-sm font-mono text-[#15803D]">
                  {user?.email || TARGET_DRIVE_ACCOUNT}
                </strong>
              </div>
              
              {hasToken ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#15803D] text-white text-[10px] font-mono font-bold rounded-xs shadow-xs">
                  <CheckCircle className="w-3 h-3 text-white" /> Conectado
                </span>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="px-3 py-1.5 bg-[#4285F4] text-white text-[10px] font-mono font-bold hover:bg-[#3367D6] flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer"
                >
                  {isAuthenticating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LogIn className="w-3 h-3" />
                  )}
                  Conectar Google
                </button>
              )}
            </div>

            {!hasToken && (
              <p className="text-[11px] text-[#14532D]/90 font-sans leading-relaxed pt-1 border-t border-[#15803D]/20">
                Haz clic en <strong>Conectar Google</strong> para autorizar la carga de la inspección a Google Drive con tu cuenta ({TARGET_DRIVE_ACCOUNT}).
              </p>
            )}

            {hasToken && user && (
              <div className="flex items-center justify-between text-[10px] text-[#14532D]/80 font-mono pt-1 border-t border-[#15803D]/20">
                <span>Sesión activa como: {user.displayName || user.email}</span>
                <button
                  onClick={handleGoogleLogout}
                  className="text-red-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <LogOut className="w-3 h-3" /> Desconectar
                </button>
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="bg-[#F7F5F2] p-4 border border-[#1A1A1A] space-y-2">
            <h4 className="font-serif italic text-sm text-[#1A1A1A] flex items-center gap-1.5">
              <FolderCheck className="w-4 h-4 text-[#1A1A1A]" />
              Archivos a Cargar:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#1A1A1A] font-sans">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#15803D]" />
                <span>1 Reporte PDF Técnico SEC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#15803D]" />
                <span>{totalPhotosCount} Fotos de Evidencia</span>
              </div>
            </div>
            <p className="text-[11px] font-mono opacity-80 pt-1.5 border-t border-[#1A1A1A]/20">
              Ruta en Drive: <strong>INSTALACIONES SERVILEC / [{new Date().toISOString().slice(0, 10)}] - Proyecto TE4 Solar - {inspection.client.name || 'Sin nombre'}</strong>
            </p>
          </div>

          {/* Upload Progress Display */}
          {progress && (
            <div className="bg-[#F7F5F2] border border-[#1A1A1A] p-4 space-y-2">
              <div className="flex justify-between items-center text-[#1A1A1A] font-mono text-[11px] font-bold">
                <span>{progress.currentStep}</span>
                <span>{progress.completedFiles}/{progress.totalFiles}</span>
              </div>

              <div className="w-full bg-white border border-[#1A1A1A] h-3 overflow-hidden">
                <div
                  className="bg-[#15803D] h-full transition-all duration-300"
                  style={{
                    width: `${Math.round((progress.completedFiles / (progress.totalFiles || 1)) * 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] font-mono text-[#1A1A1A] truncate">
                {progress.currentFileName}
              </p>

              {progress.isComplete && progress.driveFolderUrl && (
                <div className="pt-2">
                  <a
                    href={progress.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#25A238] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Carpeta en Google Drive ({TARGET_DRIVE_ACCOUNT})
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-900 p-3 text-xs font-mono space-y-1">
              <strong className="block font-bold">Error de Carga:</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A1A1A]">
            <button
              onClick={onClose}
              disabled={isUploading || isAuthenticating}
              className="px-4 py-2 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#F7F5F2] transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              onClick={handleStartDriveUpload}
              disabled={isUploading || isAuthenticating}
              className="px-5 py-2.5 border border-[#14532D] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold hover:bg-[#25A238] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isUploading || isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{isAuthenticating ? 'Conectando con Google...' : 'Subiendo a Google Drive...'}</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-white" />
                  <span>Subir a Google Drive ({TARGET_DRIVE_ACCOUNT})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

