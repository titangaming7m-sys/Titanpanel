import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { PanelConfig, WebsiteSettings, DownloadLog, DashboardStats } from '../src/types';

// Let's establish paths
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure local folders exist
if (!fs.existsSync(path.dirname(LOCAL_DB_PATH))) {
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Create dummy default files so download buttons actually work right away!
const defaultPcFile = path.join(UPLOADS_DIR, 'pc_panel_default.zip');
const defaultMobileFile = path.join(UPLOADS_DIR, 'mobile_panel_default.apk');
const defaultFreeFile = path.join(UPLOADS_DIR, 'free_panel_default.zip');

if (!fs.existsSync(defaultPcFile)) fs.writeFileSync(defaultPcFile, 'PC Panel Default Mock Content');
if (!fs.existsSync(defaultMobileFile)) fs.writeFileSync(defaultMobileFile, 'Mobile Panel Default Mock Content');
if (!fs.existsSync(defaultFreeFile)) fs.writeFileSync(defaultFreeFile, 'Free Panel Default Mock Content');

// Default initial state
const defaultSettings: WebsiteSettings = {
  websiteName: 'Panel Download Center',
  logoUrl: '',
  bannerUrl: '',
  footerText: '© 2026 Panel Download Center. All Rights Reserved.',
  socialLinks: {
    github: 'https://github.com',
    discord: 'https://discord.gg',
    twitter: 'https://twitter.com',
    telegram: 'https://t.me',
  },
  contactEmail: 'support@paneldownloadcenter.com',
  contactTelegram: 'https://t.me/panelsupport',
  contactWhatsApp: 'https://wa.me/1234567890',
  contactWhatsAppGroup: 'https://chat.whatsapp.com/sample-group-link',
  whatsappNumber: '1234567890',
  telegramUsername: 'panelsupport_bot',
  chatbotEnabled: true,
  chatbotWelcomeMessage: 'Hi! Have any questions or need custom setup support? Reach out directly using our official channels below:',
  whatsappBotEnabled: true,
  telegramBotEnabled: true,
  totalVisitors: 1024,
  activeTheme: 'cyberpunk-neon',
  activeEffect: 'starfield',
  customPrimary: '#ec4899',
  customSecondary: '#06b6d4',
  customAccent: '#3b82f6',
  customBg: '#0f172a',
  customCardBg: '#1e293b',
  effectIntensity: 50,
  loadingLogoUrl: '',
};

const defaultPanels: Record<string, PanelConfig> = {
  pc: {
    id: 'pc',
    title: 'PC Panel',
    description: 'Ultimate overlay and settings optimizer for desktop PCs. Experience buttery smooth performance and extensive customizations.',
    version: 'v2.5.1',
    fileSize: '15.4 MB',
    lastUpdated: 'June 25, 2026',
    features: ['Instant Injector', 'Custom Floating Menu', 'System Opt Keybinds', 'FPS Overlay Mode'],
    downloadCount: 1450,
    downloadUrl: '/uploads/pc_panel_default.zip',
    imageUrl: 'Monitor',
    enabled: true,
  },
  mobile: {
    id: 'mobile',
    title: 'Mobile Panel',
    description: 'Premium floating mod menu APK for android devices. Optimized for high refresh rate mobile screens.',
    version: 'v1.8.0',
    fileSize: '8.2 MB',
    lastUpdated: 'June 28, 2026',
    features: ['Anti-Ban Protection', 'Floating Control Bar', 'Zero Root Needed', 'Battery Saver Mode'],
    downloadCount: 3120,
    downloadUrl: '/uploads/mobile_panel_default.apk',
    imageUrl: 'Smartphone',
    enabled: true,
  },
  free: {
    id: 'free',
    title: 'Free Panel',
    description: 'Get started immediately with our free layout customizer. Secure and completely free forever.',
    version: 'v1.0.0',
    fileSize: '5.1 MB',
    lastUpdated: 'June 10, 2026',
    features: ['Clean Interface', 'Basic Controls', 'Community Support'],
    downloadCount: 5690,
    downloadUrl: '/uploads/free_panel_default.zip',
    imageUrl: 'Gift',
    enabled: true,
  },
};

const defaultAdmin = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('adminpassword', 10),
};

const defaultDownloads: DownloadLog[] = [
  { id: '1', panelId: 'mobile', timestamp: new Date(Date.now() - 50000).toISOString(), ip: '127.0.0.1', userAgent: 'Mozilla' },
  { id: '2', panelId: 'pc', timestamp: new Date(Date.now() - 360000).toISOString(), ip: '192.168.1.10', userAgent: 'Chrome' },
  { id: '3', panelId: 'free', timestamp: new Date(Date.now() - 900000).toISOString(), ip: '8.8.8.8', userAgent: 'Safari' },
];

interface FullDBState {
  settings: WebsiteSettings;
  panels: Record<string, PanelConfig>;
  admin: typeof defaultAdmin;
  downloads: DownloadLog[];
}

let dbState: FullDBState = {
  settings: defaultSettings,
  panels: defaultPanels,
  admin: defaultAdmin,
  downloads: defaultDownloads,
};

// Try initializing Firebase
let firestore: any = null;
let useFirebase = false;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (firebaseConfig && firebaseConfig.projectId) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
      useFirebase = true;
      console.log('Firebase Web SDK initialized successfully with DatabaseId:', firebaseConfig.firestoreDatabaseId);
    }
  }
} catch (e) {
  console.error('Failed to initialize Firebase Web SDK, falling back to local JSON database.', e);
  useFirebase = false;
}

// Read database
export async function loadDB(): Promise<FullDBState> {
  if (useFirebase && firestore) {
    try {
      const docRef = doc(firestore, 'app_data', 'state');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<FullDBState>;
        if (data.settings) dbState.settings = { ...defaultSettings, ...data.settings };
        if (data.panels) dbState.panels = { ...defaultPanels, ...data.panels };
        if (data.admin) dbState.admin = { ...defaultAdmin, ...data.admin };
        if (data.downloads) dbState.downloads = data.downloads;
        return dbState;
      } else {
        // Document doesn't exist, let's write default data to Firestore
        await setDoc(docRef, dbState);
        return dbState;
      }
    } catch (err) {
      console.error('Error loading from Firebase Firestore, using memory state:', err);
      // Fallback to local file read
      return loadLocalDB();
    }
  } else {
    return loadLocalDB();
  }
}

function loadLocalDB(): FullDBState {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const fileContent = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
      const loaded = JSON.parse(fileContent);
      if (loaded.settings) dbState.settings = { ...defaultSettings, ...loaded.settings };
      if (loaded.panels) dbState.panels = { ...defaultPanels, ...loaded.panels };
      if (loaded.admin) dbState.admin = { ...defaultAdmin, ...loaded.admin };
      if (loaded.downloads) dbState.downloads = loaded.downloads;
    } else {
      // Write default
      saveLocalDB(dbState);
    }
  } catch (err) {
    console.error('Error loading local JSON DB:', err);
  }
  return dbState;
}

async function saveDB(): Promise<void> {
  // Sync to local file anyway as a backup/cache
  saveLocalDB(dbState);

  if (useFirebase && firestore) {
    try {
      const docRef = doc(firestore, 'app_data', 'state');
      await setDoc(docRef, dbState);
    } catch (err) {
      console.error('Error saving to Firebase Firestore:', err);
    }
  }
}

function saveLocalDB(state: FullDBState) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write local database file:', err);
  }
}

// Export specific helper methods
export async function getSettings(): Promise<WebsiteSettings> {
  const db = await loadDB();
  return db.settings;
}

export async function updateSettings(newSettings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
  const db = await loadDB();
  db.settings = { ...db.settings, ...newSettings };
  await saveDB();
  return db.settings;
}

export async function incrementVisitorCount(): Promise<number> {
  const db = await loadDB();
  db.settings.totalVisitors = (db.settings.totalVisitors || 0) + 1;
  await saveDB();
  return db.settings.totalVisitors;
}

export async function getPanels(): Promise<Record<string, PanelConfig>> {
  const db = await loadDB();
  return db.panels;
}

export async function updatePanel(id: string, updates: Partial<PanelConfig>): Promise<PanelConfig> {
  const db = await loadDB();
  if (db.panels[id]) {
    db.panels[id] = { ...db.panels[id], ...updates };
    await saveDB();
    return db.panels[id];
  }
  throw new Error(`Panel with id ${id} not found`);
}

export async function createPanel(panel: PanelConfig): Promise<PanelConfig> {
  const db = await loadDB();
  if (db.panels[panel.id]) {
    throw new Error(`Panel with id ${panel.id} already exists`);
  }
  db.panels[panel.id] = panel;
  await saveDB();
  return panel;
}

export async function deletePanel(id: string): Promise<boolean> {
  const db = await loadDB();
  if (db.panels[id]) {
    delete db.panels[id];
    await saveDB();
    return true;
  }
  return false;
}

export async function getAdminProfile() {
  const db = await loadDB();
  return db.admin;
}

export async function updateAdminProfile(username: string, passwordHash: string) {
  const db = await loadDB();
  db.admin = { username, passwordHash };
  await saveDB();
}

export async function recordDownload(panelId: string, ip: string, userAgent: string): Promise<PanelConfig> {
  const db = await loadDB();
  if (db.panels[panelId]) {
    db.panels[panelId].downloadCount = (db.panels[panelId].downloadCount || 0) + 1;
    
    // Add log
    const newLog: DownloadLog = {
      id: Math.random().toString(36).substring(2, 9),
      panelId,
      timestamp: new Date().toISOString(),
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };
    db.downloads.unshift(newLog);
    // Limit to latest 100 logs
    if (db.downloads.length > 100) {
      db.downloads = db.downloads.slice(0, 100);
    }
    
    await saveDB();
    return db.panels[panelId];
  }
  throw new Error(`Panel ${panelId} not found`);
}

export async function getDownloads(): Promise<DownloadLog[]> {
  const db = await loadDB();
  return db.downloads || [];
}

export async function restoreDatabase(restoredState: FullDBState): Promise<boolean> {
  try {
    if (restoredState.settings && restoredState.panels && restoredState.admin) {
      dbState = {
        settings: { ...defaultSettings, ...restoredState.settings },
        panels: { ...defaultPanels, ...restoredState.panels },
        admin: { ...defaultAdmin, ...restoredState.admin },
        downloads: restoredState.downloads || [],
      };
      await saveDB();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error during database restore:', err);
    return false;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await loadDB();
  const totalDownloads = Object.values(db.panels).reduce((sum, panel) => sum + (panel.downloadCount || 0), 0);
  const totalFiles = fs.readdirSync(UPLOADS_DIR).filter(file => !file.startsWith('.')).length;
  return {
    totalDownloads,
    totalFiles,
    websiteVisitors: db.settings.totalVisitors || 1024,
    latestDownloads: db.downloads.slice(0, 10), // return latest 10
  };
}
