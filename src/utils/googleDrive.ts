import { Inspection, UploadProgress } from '../types';
import { getAccessToken, googleSignIn } from './firebaseAuth';

/**
 * Google Drive API helper configured for upload to te4.servilec@gmail.com
 */

export const TARGET_DRIVE_ACCOUNT = 'te4.servilec@gmail.com';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

/**
 * Helper to get active Access Token
 */
export function getStoredAccessToken(): string | null {
  return getAccessToken() || localStorage.getItem('te4_google_access_token');
}

export function setStoredAccessToken(token: string): void {
  localStorage.setItem('te4_google_access_token', token);
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem('te4_google_access_token');
}

/**
 * Converts a Blob to a Base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Creates a folder on Google Drive using REST API
 */
export async function createDriveFolder(
  folderName: string,
  parentFolderId?: string,
  accessToken?: string
): Promise<DriveFolder> {
  const token = accessToken || getStoredAccessToken();
  if (!token) {
    throw new Error('Se requiere iniciar sesión en Google con la cuenta te4.servilec@gmail.com para crear carpetas en Google Drive.');
  }

  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: FOLDER_MIME_TYPE,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const msg = errJson.error?.message || response.statusText;
    throw new Error(`Google Drive Error (${response.status}): ${msg}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/drive/folders/${data.id}`,
  };
}

/**
 * Uploads a file (Blob or base64 data URL) directly to a Google Drive folder
 */
export async function uploadFileToDrive(
  fileDataUrlOrBlob: string | Blob,
  fileName: string,
  mimeType: string,
  folderId: string,
  accessToken?: string
): Promise<{ id: string; webViewLink: string }> {
  const token = accessToken || getStoredAccessToken();
  if (!token) {
    throw new Error('No hay un token de Google activo. Por favor inicie sesión con Google.');
  }

  let blob: Blob;
  if (typeof fileDataUrlOrBlob === 'string') {
    if (fileDataUrlOrBlob.includes(',')) {
      const arr = fileDataUrlOrBlob.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : mimeType;
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else if (fileDataUrlOrBlob.startsWith('http')) {
      const res = await fetch(fileDataUrlOrBlob);
      blob = await res.blob();
    } else {
      const bstr = atob(fileDataUrlOrBlob);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mimeType });
    }
  } else {
    blob = fileDataUrlOrBlob;
  }

  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const msg = errJson.error?.message || response.statusText;
    throw new Error(`Error al subir ${fileName} a Google Drive (${response.status}): ${msg}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}

/**
 * Finds an existing folder by name or creates a new one in Google Drive
 */
export async function findOrCreateFolder(
  folderName: string,
  parentFolderId?: string,
  accessToken?: string
): Promise<DriveFolder> {
  const token = accessToken || getStoredAccessToken();
  if (!token) {
    throw new Error('Token de Google Drive no disponible.');
  }

  const safeName = folderName.replace(/'/g, "\\'");
  let query = `name = '${safeName}' and mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&pageSize=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        const found = data.files[0];
        return {
          id: found.id,
          name: found.name,
          webViewLink: found.webViewLink || `https://drive.google.com/drive/folders/${found.id}`,
        };
      }
    }
  } catch (err) {
    console.warn('Error buscando carpeta en Drive:', err);
  }

  return createDriveFolder(folderName, parentFolderId, token);
}

/**
 * Uploads complete Inspection (PDF report + all item photos) to Google Drive
 */
export async function uploadFullInspectionToDrive(
  inspection: Inspection,
  pdfBlob: Blob,
  accessToken?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ folderId: string; folderUrl: string }> {
  // Ensure access token is present or perform OAuth login
  let activeToken = accessToken || getStoredAccessToken();
  if (!activeToken) {
    const loginResult = await googleSignIn();
    activeToken = loginResult.accessToken;
  }

  // Collect all item photos
  const allPhotos: { categoryTitle: string; itemCode: string; itemTitle: string; photo: any }[] = [];
  
  inspection.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      item.photos.forEach((photo) => {
        allPhotos.push({
          categoryTitle: cat.title,
          itemCode: item.code,
          itemTitle: item.title,
          photo,
        });
      });
    });
  });

  const totalFiles = 1 + allPhotos.length;
  let completedFiles = 0;

  if (onProgress) {
    onProgress({
      currentStep: `Conectando con Google Drive (${TARGET_DRIVE_ACCOUNT})...`,
      totalFiles,
      completedFiles: 0,
      currentFileName: 'Carpeta Principal SERVILEC',
      isComplete: false,
    });
  }

  // 1. Find or create root folder "INSTALACIONES SERVILEC"
  const rootFolder = await findOrCreateFolder('INSTALACIONES SERVILEC', undefined, activeToken);

  // 2. Create Project Subfolder: [YYYY-MM-DD] - Proyecto TE4 Solar - [Cliente] - [Comuna]
  const todayUploadDate = new Date().toISOString().slice(0, 10);
  const clientNameClean = (inspection.client.name || 'Cliente Sin Nombre').trim().replace(/[/\\?%*:|"<>]/g, '');
  const comunaClean = (inspection.client.comuna || '').trim().replace(/[/\\?%*:|"<>]/g, '');
  const projectFolderName = `[${todayUploadDate}] - Proyecto TE4 Solar - ${clientNameClean}${comunaClean ? ` - ${comunaClean}` : ''}`;

  const projectFolder = await createDriveFolder(projectFolderName, rootFolder.id, activeToken);

  // 3. Upload PDF Report
  if (onProgress) {
    onProgress({
      currentStep: 'Subiendo Reporte PDF...',
      totalFiles,
      completedFiles: 1,
      currentFileName: `Informe_TE4_${clientNameClean}.pdf`,
      isComplete: false,
    });
  }

  const pdfFileName = `[${todayUploadDate}]_Informe_Tecnico_TE4_SEC_${clientNameClean.replace(/\s+/g, '_')}.pdf`;
  await uploadFileToDrive(pdfBlob, pdfFileName, 'application/pdf', projectFolder.id, activeToken);
  completedFiles = 1;

  // 4. Create Subfolder "Fotos_Inspeccion_TE4" for photos if any photos exist
  if (allPhotos.length > 0) {
    const photosFolder = await createDriveFolder('Fotos_Inspeccion_TE4', projectFolder.id, activeToken);

    for (let i = 0; i < allPhotos.length; i++) {
      const photoData = allPhotos[i];
      const photoName = `Item_${photoData.itemCode}_${photoData.photo.id}_${photoData.photo.name || 'foto'}.jpg`;

      if (onProgress) {
        onProgress({
          currentStep: `Subiendo Foto ${i + 1} de ${allPhotos.length}`,
          totalFiles,
          completedFiles: completedFiles + 1,
          currentFileName: photoName,
          isComplete: false,
        });
      }

      await uploadFileToDrive(photoData.photo.url, photoName, 'image/jpeg', photosFolder.id, activeToken);
      completedFiles++;
    }
  }

  const finalUrl = projectFolder.webViewLink || `https://drive.google.com/drive/folders/${projectFolder.id}`;

  if (onProgress) {
    onProgress({
      currentStep: `¡Carga exitosa a Google Drive (${TARGET_DRIVE_ACCOUNT})!`,
      totalFiles,
      completedFiles: totalFiles,
      currentFileName: 'Archivos respaldados correctamente',
      isComplete: true,
      driveFolderUrl: finalUrl,
    });
  }

  return {
    folderId: projectFolder.id,
    folderUrl: finalUrl,
  };
}

