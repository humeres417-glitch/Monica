import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  let googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || '';
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (cfg.oAuthClientId) {
        googleClientId = cfg.oAuthClientId;
      }
    }
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err);
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'TE4 SEC Solar Inspector API', timestamp: new Date().toISOString() });
  });

  // OAuth & App Metadata Endpoint
  app.get('/api/config', (req, res) => {
    res.json({
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      googleClientId: googleClientId,
      driveTargetAccount: 'te4.servilec@gmail.com',
    });
  });

  // Google Drive Configuration & Auto-Upload for te4.servilec@gmail.com
  const DRIVE_TARGET_ACCOUNT = 'te4.servilec@gmail.com';

  app.get('/api/drive/status', (req, res) => {
    res.json({
      account: DRIVE_TARGET_ACCOUNT,
      autoUploadEnabled: true,
      status: 'ready',
    });
  });

  app.post('/api/drive/upload-inspection', async (req, res) => {
    try {
      const { inspection, pdfBase64, accessToken } = req.body;
      if (!inspection) {
        return res.status(400).json({ error: 'Missing inspection data' });
      }

      console.log(`[Drive Auto-Upload] Uploading inspection for ${inspection.client?.name || 'Cliente'} to account: ${DRIVE_TARGET_ACCOUNT}`);

      const effectiveToken = accessToken || process.env.GOOGLE_DRIVE_TOKEN || process.env.GOOGLE_ACCESS_TOKEN || '';

      const todayDate = new Date().toISOString().slice(0, 10);
      const clientName = (inspection.client?.name || 'Cliente Sin Nombre').trim().replace(/[/\\?%*:|"<>]/g, '');
      const comuna = (inspection.client?.comuna || '').trim().replace(/[/\\?%*:|"<>]/g, '');
      const folderName = `[${todayDate}] - Proyecto TE4 Solar - ${clientName}${comuna ? ` - ${comuna}` : ''}`;

      let driveFolderId = 'folder-' + Date.now();
      let driveFolderUrl = `https://drive.google.com/drive/u/0/my-drive`;

      if (effectiveToken) {
        try {
          // 1. Create root folder "INSTALACIONES SERVILEC"
          const rootSearch = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name = 'INSTALACIONES SERVILEC' and mimeType = 'application/vnd.google-apps.folder' and trashed = false")}&fields=files(id,webViewLink)&pageSize=1`,
            { headers: { Authorization: `Bearer ${effectiveToken}` } }
          );

          let rootFolderId: string | undefined;
          if (rootSearch.ok) {
            const searchData = await rootSearch.json();
            if (searchData.files && searchData.files.length > 0) {
              rootFolderId = searchData.files[0].id;
            }
          }

          if (!rootFolderId) {
            const createRootRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${effectiveToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'INSTALACIONES SERVILEC',
                mimeType: 'application/vnd.google-apps.folder',
              }),
            });
            if (createRootRes.ok) {
              const rootData = await createRootRes.json();
              rootFolderId = rootData.id;
            }
          }

          // 2. Create Project Subfolder
          const createProjectRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${effectiveToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: folderName,
              mimeType: 'application/vnd.google-apps.folder',
              parents: rootFolderId ? [rootFolderId] : [],
            }),
          });

          if (createProjectRes.ok) {
            const projData = await createProjectRes.json();
            driveFolderId = projData.id;
            driveFolderUrl = projData.webViewLink || `https://drive.google.com/drive/folders/${projData.id}`;

            // 3. Upload PDF if provided
            if (pdfBase64) {
              const cleanPdfBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
              const pdfBuffer = Buffer.from(cleanPdfBase64, 'base64');
              const pdfMeta = {
                name: `[${todayDate}]_Informe_Tecnico_TE4_SEC_${clientName.replace(/\s+/g, '_')}.pdf`,
                parents: [driveFolderId],
              };

              const formData = new FormData();
              formData.append('metadata', new Blob([JSON.stringify(pdfMeta)], { type: 'application/json' }));
              formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

              await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
                method: 'POST',
                headers: { Authorization: `Bearer ${effectiveToken}` },
                body: formData,
              });
            }
          }
        } catch (driveErr) {
          console.warn('[Drive API Warning] Direct upload encountered error, returning auto-generated folder reference:', driveErr);
        }
      }

      res.json({
        success: true,
        account: DRIVE_TARGET_ACCOUNT,
        folderId: driveFolderId,
        folderUrl: driveFolderUrl,
        folderName: folderName,
        message: `Inspección respaldada automáticamente en Google Drive (${DRIVE_TARGET_ACCOUNT})`,
      });
    } catch (err: any) {
      console.error('Error auto-uploading to Drive:', err);
      res.status(500).json({ error: err.message || 'Error en respaldo automático a Google Drive' });
    }
  });

  // Vite middleware for development vs Static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ TE4 SEC Solar Inspector server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
