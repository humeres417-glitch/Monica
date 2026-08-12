import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, CheckCircle, XCircle, MinusCircle, Info, Trash2, Eye, Loader2, Video, RefreshCw, Check, Square, Circle } from 'lucide-react';
import { ChecklistItem, ItemStatus, PhotoItem } from '../types';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onUpdateStatus: (itemId: string, status: ItemStatus) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onAddPhotos: (itemId: string, photos: PhotoItem[]) => void;
  onRemovePhoto: (itemId: string, photoId: string) => void;
  onUpdatePhotoNote: (itemId: string, photoId: string, note: string) => void;
}

/**
 * Resizes and compresses image file to lightweight JPEG Data URL
 */
const processImageFile = (file: File): Promise<PhotoItem> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        return reject(new Error('Archivo de imagen vacío'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar el formato de la imagen'));
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const timestampStr = new Date().toLocaleString('es-CL');
          resolve({
            id: 'ph-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            url: src,
            name: file.name || 'foto_sec.jpg',
            timestamp: timestampStr,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        const timestampStr = new Date().toLocaleString('es-CL');
        resolve({
          id: 'ph-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          url: compressedDataUrl,
          name: file.name || 'foto_sec.jpg',
          timestamp: timestampStr,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};

export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  item,
  onUpdateStatus,
  onUpdateObservation,
  onAddPhotos,
  onRemovePhoto,
  onUpdatePhotoNote,
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState<PhotoItem | null>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSuccessMessage, setCapturedSuccessMessage] = useState<string | null>(null);

  // Live Video Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Live Camera Stream Setup
  useEffect(() => {
    if (!isLiveCameraOpen) return;

    let activeStream: MediaStream | null = null;
    setCameraError(null);

    const startCamera = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: cameraFacingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: true,
          });
        } catch {
          // Fallback to video-only if audio permission is rejected or mic unavailable
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: cameraFacingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        }
        activeStream = stream;
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error('Error accediendo a la cámara en vivo:', err);
        setCameraError('No se pudo abrir la cámara en vivo. Puede usar el botón de Cámara del Dispositivo.');
      }
    };

    startCamera();

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      setIsRecording(false);
      setRecordingSeconds(0);
    };
  }, [isLiveCameraOpen, cameraFacingMode]);

  // Start Live Video Recording
  const handleStartRecording = () => {
    if (!cameraStreamRef.current) return;
    recordedChunksRef.current = [];

    let mimeType = '';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }
    }

    try {
      const recorder = new MediaRecorder(
        cameraStreamRef.current,
        mimeType ? { mimeType } : undefined
      );

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalType = mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: finalType });
        if (blob.size === 0) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          const videoDataUrl = reader.result as string;
          const ext = finalType.includes('mp4') ? 'mp4' : 'webm';
          const newVideo: PhotoItem = {
            id: 'vid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            url: videoDataUrl,
            name: `video_vivo_${Date.now()}.${ext}`,
            timestamp: new Date().toLocaleString('es-CL'),
          };

          onAddPhotos(item.id, [newVideo]);
          if (item.status === 'PENDIENTE') {
            onUpdateStatus(item.id, 'C');
          }

          setCapturedSuccessMessage('¡Video en vivo grabado y guardado exitosamente!');
          setTimeout(() => setCapturedSuccessMessage(null), 2500);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error al iniciar grabación de video:', err);
      alert('Error al iniciar la grabación de video en vivo.');
    }
  };

  // Stop Live Video Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  // Take Snapshot from Live Camera Stream
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

    const newPhoto: PhotoItem = {
      id: 'ph-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      url: dataUrl,
      name: `captura_camara_${Date.now()}.jpg`,
      timestamp: new Date().toLocaleString('es-CL'),
    };

    onAddPhotos(item.id, [newPhoto]);
    if (item.status === 'PENDIENTE') {
      onUpdateStatus(item.id, 'C');
    }

    setCapturedSuccessMessage('¡Foto capturada!');
    setTimeout(() => setCapturedSuccessMessage(null), 1800);
  };

  // Handle Photo or Video File Upload (Gallery or Native Camera Input)
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const fileArray = Array.from(files);
      const processedPhotos: PhotoItem[] = [];

      for (const file of fileArray) {
        try {
          if (file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.name)) {
            const videoDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(new Error('Error al leer el archivo de video'));
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            });
            processedPhotos.push({
              id: 'vid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
              url: videoDataUrl,
              name: file.name || 'video_continuidad_tierra.mp4',
              timestamp: new Date().toLocaleString('es-CL'),
            });
          } else {
            const photo = await processImageFile(file);
            processedPhotos.push(photo);
          }
        } catch (err) {
          console.error('Error procesando archivo individual:', err);
        }
      }

      if (processedPhotos.length > 0) {
        onAddPhotos(item.id, processedPhotos);
        if (item.status === 'PENDIENTE') {
          onUpdateStatus(item.id, 'C');
        }
      } else {
        alert('No se pudo procesar el archivo seleccionado.');
      }
    } catch (err) {
      console.error('Error en carga de archivos:', err);
      alert('Error al cargar archivos. Asegúrese de seleccionar fotos o videos válidos.');
    } finally {
      setIsProcessingPhotos(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  return (
    <div
      id={`item-card-${item.id}`}
      className={`bg-white border border-[#1A1A1A] p-3 sm:p-4 space-y-2.5 transition-colors ${
        item.status === 'NC' ? 'bg-red-50/30' : ''
      }`}
    >
      {/* Item Header & Code */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 border-b border-[#1A1A1A] pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-[#15803D] text-white font-mono text-[9px] uppercase font-bold px-2 py-0.5 border border-[#14532D] shadow-2xs">
              Ítem {item.code}
            </span>
            <span className="bg-white text-[#14532D] border border-[#15803D]/40 text-[9px] font-mono uppercase px-2 py-0.5 font-bold">
              {item.normaSec}
            </span>
          </div>
          <h3
            className={`text-base font-serif italic leading-snug ${
              item.id === 'item-502' ? 'text-[#ec0a0a]' : 'text-[#0F172A]'
            }`}
          >
            {item.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#0F172A]/80 leading-relaxed font-sans">
            {item.description}
          </p>
        </div>

        {/* Status Buttons */}
        <div className="flex items-center gap-1 self-start sm:self-auto pt-0.5 sm:pt-0">
          {/* Conforme */}
          <button
            id={`btn-status-c-${item.id}`}
            type="button"
            onClick={() => onUpdateStatus(item.id, 'C')}
            className={`px-2.5 py-1 border text-[9px] font-mono uppercase font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              item.status === 'C'
                ? 'bg-[#15803D] text-white border-[#14532D] shadow-2xs'
                : 'bg-white text-[#15803D] border-[#15803D]/40 hover:bg-[#F0FDF4]'
            }`}
            title="Conforme con la normativa SEC"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Conforme</span>
          </button>

          {/* No Conforme */}
          <button
            id={`btn-status-nc-${item.id}`}
            type="button"
            onClick={() => onUpdateStatus(item.id, 'NC')}
            className={`px-2.5 py-1 border text-[9px] font-mono uppercase font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              item.status === 'NC'
                ? 'bg-rose-700 text-white border-rose-800 shadow-2xs'
                : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
            }`}
            title="No Conforme - Presenta observaciones"
          >
            <XCircle className="w-3 h-3" />
            <span>No Conf.</span>
          </button>

          {/* No Aplica */}
          <button
            id={`btn-status-na-${item.id}`}
            type="button"
            onClick={() => onUpdateStatus(item.id, 'NA')}
            className={`px-2.5 py-1 border text-[9px] font-mono uppercase font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              item.status === 'NA'
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-2xs'
                : 'bg-white text-[#0F172A] border-[#0F172A]/30 hover:bg-slate-100'
            }`}
            title="No Aplica a esta instalación"
          >
            <MinusCircle className="w-3 h-3" />
            <span>N/A</span>
          </button>
        </div>
      </div>

      {/* Photo Guide Tip */}
      <div className="bg-[#F0FDF4] border-l-4 border-l-[#25A238] border border-[#15803D]/30 p-2.5 text-xs text-[#14532D] flex items-start gap-2 shadow-2xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D]" />
        <div>
          <span className="uppercase text-[9px] font-mono tracking-wider font-extrabold block mb-0.5 text-[#15803D]">Requisito de Evidencia SEC:</span>
          <span className="italic font-serif text-[11px] sm:text-xs font-medium text-[#14532D]">{item.photoGuide}</span>
        </div>
      </div>

      {/* Observations Field */}
      <div>
        <label className="block text-[9px] uppercase font-mono tracking-wider font-semibold text-[#15803D] mb-0.5">
          Observaciones / Notas Técnicas
        </label>
        <input
          id={`input-obs-${item.id}`}
          type="text"
          value={item.observation}
          onChange={(e) => onUpdateObservation(item.id, e.target.value)}
          placeholder={item.status === 'NC' ? 'Describa la No Conformidad y solución...' : 'Observación opcional...'}
          className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAF9] border border-[#15803D]/30 text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
        />
      </div>

      {/* Camera & Gallery Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#15803D]/20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#15803D] font-bold">
            Fotografías Adjuntas ({item.photos.length})
          </span>
          {isProcessingPhotos && (
            <span className="text-[10px] font-mono uppercase text-[#15803D] flex items-center gap-1 font-bold">
              <Loader2 className="w-3 h-3 animate-spin text-[#15803D]" /> Procesando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* In-App Live Webcam Button */}
          <button
            id={`btn-live-cam-${item.id}`}
            type="button"
            onClick={() => setIsLiveCameraOpen(true)}
            className="px-3.5 py-1.5 border border-[#14532D] bg-[#15803D] text-white text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#25A238] transition-colors cursor-pointer shadow-2xs"
            title="Abrir cámara en vivo en pantalla"
          >
            <Video className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Cámara en Vivo</span>
          </button>

          {/* Gallery Upload Button */}
          <button
            id={`btn-gallery-${item.id}`}
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="px-3.5 py-1.5 border border-[#15803D]/40 bg-white text-[#14532D] text-[10px] uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#F0FDF4] hover:border-[#15803D] transition-colors cursor-pointer shadow-2xs"
            title="Seleccionar fotos/videos guardados de la galería"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Galería</span>
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Photo/Video Thumbnails Grid */}
      {item.photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {item.photos.map((ph, idx) => {
            const isVideoFile = ph.id.startsWith('vid-') || ph.url.startsWith('data:video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(ph.name || '');
            return (
              <div
                key={ph.id}
                className="group relative bg-[#F7F5F2] border border-[#1A1A1A] overflow-hidden flex flex-col"
              >
                <div className="relative aspect-4/3 w-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center">
                  {isVideoFile ? (
                    <>
                      <video
                        src={ph.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                        <Video className="w-6 h-6 text-white drop-shadow" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={ph.url}
                      alt={ph.name}
                      className="w-full h-full object-cover grayscale-20 group-hover:grayscale-0 transition duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-[#1A1A1A]/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewPhoto(ph)}
                      className="p-1.5 bg-white text-[#1A1A1A] hover:bg-[#F7F5F2] border border-[#1A1A1A] cursor-pointer"
                      title={isVideoFile ? "Ver Video" : "Ver Foto"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(item.id, ph.id)}
                      className="p-1.5 bg-red-800 text-white border border-[#1A1A1A] cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-[#1A1A1A] text-white text-[9px] font-mono px-1.5 py-0.5 border border-white/20">
                    #{idx + 1} {isVideoFile ? '[VIDEO]' : ''}
                  </span>
                </div>

                <div className="p-2 bg-white space-y-1 border-t border-[#1A1A1A]">
                  <p className="text-[#1A1A1A] font-mono text-[9px] opacity-60 truncate">{ph.timestamp}</p>
                  <input
                    type="text"
                    value={ph.note || ''}
                    onChange={(e) => onUpdatePhotoNote(item.id, ph.id, e.target.value)}
                    placeholder="Nota / Leyenda..."
                    className="w-full px-1.5 py-0.5 bg-[#F7F5F2] border border-[#1A1A1A] text-[10px] text-[#1A1A1A] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Camera Modal */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-[#1A1A1A] max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <div>
                <h4 className="text-base font-serif italic text-[#1A1A1A] flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#1A1A1A]" /> Cámara y Grabador de Video en Vivo — {item.code}
                </h4>
                <p className="text-[10px] uppercase font-mono tracking-widest opacity-60">
                  Tome fotos o grabe videos de evidencia directamente
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isRecording) handleStopRecording();
                  setIsLiveCameraOpen(false);
                }}
                className="p-1 text-[#1A1A1A] hover:opacity-60 font-mono text-xs font-bold cursor-pointer"
              >
                [CERRAR]
              </button>
            </div>

            {capturedSuccessMessage && (
              <div className="bg-emerald-100 border border-[#1A1A1A] px-3 py-1.5 text-emerald-950 font-mono text-xs font-bold flex items-center gap-1.5 justify-center">
                <Check className="w-4 h-4" />
                <span>{capturedSuccessMessage}</span>
              </div>
            )}

            {cameraError ? (
              <div className="bg-red-50 border border-[#1A1A1A] p-4 text-center space-y-3">
                <p className="text-xs text-red-950 font-mono">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsLiveCameraOpen(false);
                    galleryInputRef.current?.click();
                  }}
                  className="px-4 py-2 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-xs font-mono uppercase font-bold cursor-pointer"
                >
                  Seleccionar de la Galería
                </button>
              </div>
            ) : (
              <div className="relative bg-[#1A1A1A] border border-[#1A1A1A] overflow-hidden aspect-4/3 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Recording Indicator Overlay */}
                {isRecording && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white border border-white/40 px-3 py-1 font-mono text-xs uppercase font-bold flex items-center gap-2 shadow-md animate-pulse">
                    <Circle className="w-3 h-3 fill-white text-white animate-ping" />
                    <span>REC {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{ (recordingSeconds % 60).toString().padStart(2, '0') }</span>
                  </div>
                )}

                {!isRecording && (
                  <button
                    type="button"
                    onClick={() =>
                      setCameraFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white/90 text-[#1A1A1A] border border-[#1A1A1A] font-mono text-[10px] uppercase font-bold flex items-center gap-1 hover:bg-white cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Rotar Cámara
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1A1A1A]">
              <span className="text-[10px] font-mono opacity-60">
                Archivos cargados para este ítem: {item.photos.length}
              </span>
              {!cameraError && (
                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-5 py-2.5 border border-red-950 bg-red-700 text-white text-xs uppercase font-mono tracking-widest font-bold flex items-center gap-2 hover:bg-red-800 transition-colors cursor-pointer shadow-md"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Detener Grabación</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleTakeSnapshot}
                        className="px-4 py-2 border border-[#1A1A1A] bg-white text-[#1A1A1A] text-xs uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#F7F5F2] transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Tomar Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-4 py-2 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-xs uppercase font-mono tracking-widest font-bold flex items-center gap-1.5 hover:bg-[#333] transition-colors cursor-pointer"
                      >
                        <Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        <span>Grabar Video</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {selectedPreviewPhoto && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#1A1A1A] max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <h4 className="text-base font-serif italic text-[#1A1A1A]">
                Evidencia Fotográfica — {item.code}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedPreviewPhoto(null)}
                className="p-1 text-[#1A1A1A] hover:opacity-60 font-mono text-sm font-bold cursor-pointer"
              >
                [CERRAR]
              </button>
            </div>

            <div className="max-h-[60vh] bg-[#1A1A1A] border border-[#1A1A1A] overflow-hidden flex items-center justify-center">
              {selectedPreviewPhoto.id.startsWith('vid-') || selectedPreviewPhoto.url.startsWith('data:video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(selectedPreviewPhoto.name || '') ? (
                <video
                  src={selectedPreviewPhoto.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <img
                  src={selectedPreviewPhoto.url}
                  alt="Foto ampliada"
                  className="max-h-[60vh] w-auto object-contain"
                />
              )}
            </div>

            <div className="text-xs text-[#1A1A1A] font-mono flex justify-between items-center pt-2">
              <span>Captura: {selectedPreviewPhoto.timestamp}</span>
              <button
                type="button"
                onClick={() => {
                  onRemovePhoto(item.id, selectedPreviewPhoto.id);
                  setSelectedPreviewPhoto(null);
                }}
                className="text-red-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
