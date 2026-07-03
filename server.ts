import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  getSettings,
  updateSettings,
  incrementVisitorCount,
  getPanels,
  updatePanel,
  createPanel,
  deletePanel,
  getAdminProfile,
  updateAdminProfile,
  recordDownload,
  getDashboardStats,
  restoreDatabase,
  loadDB,
  getKeys,
  addKey,
  generateTenKeys,
  deleteKey,
  claimFreeKey,
  updateKey
} from './server/db.js';

// Setup Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up security headers manually to avoid introducing complex dependencies
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Configure Multer for File Uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Prevent XSS or folder traversal by sanitizing filename
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${Date.now()}-${sanitizedOriginal}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Max 100MB limit
  fileFilter: (req, file, cb) => {
    // Basic file filter to avoid dangerous scripts (.html, .js, .sh, .exe, etc. can be uploaded but we must serve them safely as binary downloads)
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.php' || ext === '.html' || ext === '.htm' || ext === '.js' || ext === '.sh') {
      return cb(new Error('Dangerous file formats are restricted.'));
    }
    cb(null, true);
  },
});

// Serve static uploaded files safely
// Adding Content-Disposition attachment to prevent browser executing any uploaded html/svg/scripts
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('Content-Disposition', 'attachment');
  next();
}, express.static(uploadsDir));

// Keep track of active admin sessions (Simple file-persistent session token store)
// Token to session info mapping
interface AdminSession {
  token: string;
  username: string;
  createdAt: number;
}

const SESSIONS_PATH = path.join(process.cwd(), 'server-sessions.json');

class PersistentSessionStore {
  private cache: Map<string, AdminSession> = new Map();

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(SESSIONS_PATH)) {
        const data = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf8'));
        if (Array.isArray(data)) {
          for (const s of data) {
            if (s && s.token) {
              this.cache.set(s.token, s);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading persistent sessions:', err);
    }
  }

  private save() {
    try {
      const list = Array.from(this.cache.values());
      fs.writeFileSync(SESSIONS_PATH, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving persistent sessions:', err);
    }
  }

  get(token: string): AdminSession | undefined {
    return this.cache.get(token);
  }

  set(token: string, session: AdminSession): this {
    this.cache.set(token, session);
    this.save();
    return this;
  }

  delete(token: string): boolean {
    const res = this.cache.delete(token);
    this.save();
    return res;
  }

  clear(): void {
    this.cache.clear();
    this.save();
  }
}

const ACTIVE_SESSIONS = new PersistentSessionStore();

// Helper function to generate clean session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication guard middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
  }
  const token = authHeader.split(' ')[1];
  const session = ACTIVE_SESSIONS.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid.' });
  }

  // Session expiry check (e.g., 2 hours)
  const sessionAge = Date.now() - session.createdAt;
  if (sessionAge > 2 * 60 * 60 * 1000) {
    ACTIVE_SESSIONS.delete(token);
    return res.status(401).json({ error: 'Unauthorized: Session expired.' });
  }

  // Refresh session activity time
  session.createdAt = Date.now();
  ACTIVE_SESSIONS.set(token, session);
  next();
}

// ---------------------- API ENDPOINTS ----------------------

// 1. Visit tracker
app.post('/api/visit', async (req, res) => {
  try {
    const count = await incrementVisitorCount();
    res.json({ success: true, totalVisitors: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch public configuration (Settings + Panels)
app.get('/ads.txt', async (req, res) => {
  try {
    const settings = await getSettings();
    res.type('text/plain');
    res.send(settings.adsTxt || '');
  } catch (err: any) {
    res.status(500).send('Error serving ads.txt');
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const settings = await getSettings();
    const panels = await getPanels();
    res.json({ settings, panels });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Track download & trigger actual download / redirect
app.get('/api/download/:panelId', async (req, res) => {
  try {
    const { panelId } = req.params;
    const panels = await getPanels();
    const panel = panels[panelId];
    if (!panel || !panel.enabled) {
      return res.status(404).json({ error: 'This panel download is currently disabled or unavailable.' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Record the download event in Firestore/LocalDB
    await recordDownload(panelId, ip, userAgent);

    // Dynamic redirect or serve the file
    // If the downloadUrl is an uploaded local path (starts with /uploads), we serve/redirect to it
    // Otherwise, redirect to the custom URL provided by the admin.
    let targetUrl = panel.downloadUrl;
    if (!targetUrl) {
      return res.status(400).json({ error: 'No download link configured for this panel.' });
    }

    // Direct the browser to retrieve the file
    res.json({ url: targetUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin Auth Endpoints
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await getAdminProfile();
    const match = await bcrypt.compare(password, admin.passwordHash);

    if (username.toLowerCase() !== admin.username.toLowerCase() || !match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Login successful - create token
    const token = generateSessionToken();
    ACTIVE_SESSIONS.set(token, {
      token,
      username: admin.username,
      createdAt: Date.now(),
    });

    res.json({ success: true, token, username: admin.username });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    ACTIVE_SESSIONS.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Token is valid.' });
});

// 5. Manage Admin Profile / Password Changes
app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admin = await getAdminProfile();
    const match = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!match) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateAdminProfile(admin.username, newHash);

    // Clear all active sessions so the user has to re-login with the new password
    ACTIVE_SESSIONS.clear();

    res.json({ success: true, message: 'Password updated successfully. Please log in again.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Manage Website Settings
app.post('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { 
      websiteName, logoUrl, bannerUrl, footerText, socialLinks, 
      contactEmail, contactTelegram, contactWhatsApp, contactWhatsAppGroup,
      whatsappNumber, telegramUsername, chatbotEnabled, chatbotWelcomeMessage,
      whatsappBotEnabled, telegramBotEnabled,
      activeTheme, activeEffect, effectIntensity,
      customPrimary, customSecondary, customAccent, customBg, customCardBg,
      loadingLogoUrl,
      adHeaderCode, adFooterCode, adPcBannerCode, adMobileBannerCode, adFreeBannerCode,
      adsenseCode, adsTxt, metaTag
    } = req.body;
    
    // Strict Input Validation
    if (!websiteName || websiteName.trim().length === 0) {
      return res.status(400).json({ error: 'Website name cannot be empty.' });
    }

    const updated = await updateSettings({
      websiteName: websiteName.trim(),
      logoUrl: logoUrl || '',
      bannerUrl: bannerUrl || '',
      footerText: footerText || '',
      socialLinks: socialLinks || {},
      contactEmail: contactEmail || '',
      contactTelegram: contactTelegram || '',
      contactWhatsApp: contactWhatsApp || '',
      contactWhatsAppGroup: contactWhatsAppGroup || '',
      whatsappNumber: whatsappNumber || '',
      telegramUsername: telegramUsername || '',
      chatbotEnabled: chatbotEnabled !== undefined ? chatbotEnabled : true,
      chatbotWelcomeMessage: chatbotWelcomeMessage || '',
      whatsappBotEnabled: whatsappBotEnabled !== undefined ? whatsappBotEnabled : true,
      telegramBotEnabled: telegramBotEnabled !== undefined ? telegramBotEnabled : true,
      activeTheme: activeTheme || 'cyberpunk-neon',
      activeEffect: activeEffect || 'starfield',
      effectIntensity: effectIntensity !== undefined ? Number(effectIntensity) : 50,
      customPrimary: customPrimary || '',
      customSecondary: customSecondary || '',
      customAccent: customAccent || '',
      customBg: customBg || '',
      customCardBg: customCardBg || '',
      loadingLogoUrl: loadingLogoUrl || '',
      adHeaderCode: adHeaderCode || '',
      adFooterCode: adFooterCode || '',
      adPcBannerCode: adPcBannerCode || '',
      adMobileBannerCode: adMobileBannerCode || '',
      adFreeBannerCode: adFreeBannerCode || '',
      adsenseCode: adsenseCode || '',
      adsTxt: adsTxt || '',
      metaTag: metaTag || '',
    });

    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Manage Panel configurations
app.post('/api/admin/panels/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, version, fileSize, lastUpdated, features, downloadUrl, imageUrl, enabled } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    // Convert features array to sanitized format
    let sanitizedFeatures: string[] = [];
    if (Array.isArray(features)) {
      sanitizedFeatures = features.map(f => String(f).trim()).filter(Boolean);
    }

    const updated = await updatePanel(id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      version: version ? version.trim() : '',
      fileSize: fileSize ? fileSize.trim() : '',
      lastUpdated: lastUpdated ? lastUpdated.trim() : '',
      features: sanitizedFeatures,
      downloadUrl: downloadUrl ? downloadUrl.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      enabled: enabled === true,
    });

    res.json({ success: true, panel: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7.5 Create a new custom panel
app.post('/api/admin/panels-create', requireAdmin, async (req, res) => {
  try {
    const { title, description, version, fileSize, lastUpdated, features, downloadUrl, imageUrl, enabled } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    // Generate a unique ID
    const id = 'custom_' + Math.random().toString(36).substring(2, 9);

    // Convert features array to sanitized format
    let sanitizedFeatures: string[] = [];
    if (Array.isArray(features)) {
      sanitizedFeatures = features.map(f => String(f).trim()).filter(Boolean);
    }

    const newPanel = {
      id,
      title: title.trim(),
      description: description ? description.trim() : '',
      version: version ? version.trim() : 'v1.0.0',
      fileSize: fileSize ? fileSize.trim() : '0.0 MB',
      lastUpdated: lastUpdated ? lastUpdated.trim() : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      features: sanitizedFeatures,
      downloadCount: 0,
      downloadUrl: downloadUrl ? downloadUrl.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : 'Gift',
      enabled: enabled === true,
    };

    const created = await createPanel(newPanel);
    res.json({ success: true, panel: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7.6 Delete a custom panel
app.delete('/api/admin/panels/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deletePanel(id);
    if (!deleted) {
      return res.status(404).json({ error: `Panel with ID ${id} not found.` });
    }

    res.json({ success: true, message: 'Panel deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Admin Upload API Endpoint (Multer Single Upload)
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file was provided.' });
    }

    // Return the absolute/relative URL of the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      url: fileUrl,
    });
  });
});

// 9. Fetch and manage physical upload folder files
app.get('/api/admin/files', requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stat = fs.statSync(filePath);
      return {
        filename,
        url: `/uploads/${filename}`,
        size: `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
        createdAt: stat.birthtime,
      };
    });

    res.json({ success: true, files: fileDetails });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Delete file
app.delete('/api/admin/files/:filename', requireAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    // Safety check against path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid file parameter.' });
    }

    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: 'File deleted successfully.' });
    } else {
      return res.status(404).json({ error: 'File does not exist on server.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Statistics & Logs API
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Backup Database State (Exports entire DB JSON)
app.get('/api/admin/backup', requireAdmin, async (req, res) => {
  try {
    const fullState = await loadDB();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=panel_download_center_backup.json');
    res.send(JSON.stringify(fullState, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Restore Database State
app.post('/api/admin/restore', requireAdmin, async (req, res) => {
  try {
    const restoredState = req.body;
    if (!restoredState || typeof restoredState !== 'object') {
      return res.status(400).json({ error: 'Invalid backup structure.' });
    }

    const success = await restoreDatabase(restoredState);
    if (success) {
      res.json({ success: true, message: 'Database state restored successfully.' });
    } else {
      res.status(400).json({ error: 'Failed to restore database. Ensure database structure is correct.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Access Keys APIs
app.post('/api/keys/claim', async (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const key = await claimFreeKey(ip);
    res.json({ success: true, key });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/keys', requireAdmin, async (req, res) => {
  try {
    const keysList = await getKeys();
    res.json({ success: true, keys: keysList });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/keys/add', requireAdmin, async (req, res) => {
  try {
    const { keyString } = req.body;
    if (!keyString || keyString.trim().length === 0) {
      return res.status(400).json({ error: 'Key string is required.' });
    }
    const newKey = await addKey(keyString);
    res.json({ success: true, key: newKey });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/keys/generate', requireAdmin, async (req, res) => {
  try {
    const newKeys = await generateTenKeys();
    res.json({ success: true, keys: newKeys });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/keys/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteKey(id);
    if (deleted) {
      res.json({ success: true, message: 'Key deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Key not found.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/keys/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { keyString, status, claimedByIp, expiresAt } = req.body;
    
    const updated = await updateKey(id, {
      keyString,
      status,
      claimedByIp,
      expiresAt
    });

    if (updated) {
      res.json({ success: true, key: updated, message: 'Key updated successfully.' });
    } else {
      res.status(404).json({ error: 'Key not found.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware integration for SPA routing and asset serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    // SPA fallback with dynamic head tag injection for AdSense verification crawlers
    app.get('*', async (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          const settings = await getSettings();
          
          let headInjection = '';
          if (settings.metaTag) {
            headInjection += `\n<!-- Google AdSense Verification Meta Tag Server-Side Injection -->\n${settings.metaTag}\n`;
          }
          if (settings.adsenseCode) {
            headInjection += `\n<!-- Google AdSense Code Snippet Server-Side Injection -->\n${settings.adsenseCode}\n`;
          }
          
          if (headInjection) {
            html = html.replace('</head>', `${headInjection}</head>`);
          }
          
          res.send(html);
        } else {
          res.sendFile(indexPath);
        }
      } catch (err) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
