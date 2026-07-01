import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { PanelConfig, WebsiteSettings, DownloadLog, DashboardStats, AccessKey } from '../src/types';

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

const defaultKeys: AccessKey[] = Array.from({ length: 10 }, (_, i) => {
  const keyStr = `FREE-${1000 + i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  return {
    id: `key_${i + 1}`,
    keyString: keyStr,
    createdAt: new Date().toISOString(),
    claimedByIp: null,
    claimedAt: null,
    expiresAt: null,
    status: 'active' as const,
  };
});

interface FullDBState {
  settings: WebsiteSettings;
  panels: Record<string, PanelConfig>;
  admin: typeof defaultAdmin;
  downloads: DownloadLog[];
  keys: AccessKey[];
}

let dbState: FullDBState = {
  settings: defaultSettings,
  panels: defaultPanels,
  admin: defaultAdmin,
  downloads: defaultDownloads,
  keys: defaultKeys,
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
      firestore = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
      }, firebaseConfig.firestoreDatabaseId || '(default)');
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
        if (data.keys) dbState.keys = data.keys;
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
      if (loaded.keys) dbState.keys = loaded.keys;
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
        keys: restoredState.keys || defaultKeys,
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

// ACCESS KEYS OPERATIONS
export async function getKeys(): Promise<AccessKey[]> {
  const db = await loadDB();
  let changed = false;
  const now = new Date();
  
  if (!db.keys) {
    db.keys = [...defaultKeys];
    changed = true;
  }

  db.keys.forEach((k) => {
    if (k.status === 'claimed' && k.expiresAt && new Date(k.expiresAt) < now) {
      k.status = 'expired';
      changed = true;
    }
  });

  if (changed) {
    await saveDB();
  }
  return db.keys;
}

export async function addKey(keyString: string): Promise<AccessKey> {
  const db = await loadDB();
  if (!db.keys) db.keys = [];
  const newKey: AccessKey = {
    id: 'key_' + Math.random().toString(36).substring(2, 9),
    keyString: keyString.toUpperCase().trim(),
    createdAt: new Date().toISOString(),
    claimedByIp: null,
    claimedAt: null,
    expiresAt: null,
    status: 'active',
  };
  db.keys.push(newKey);
  await saveDB();
  return newKey;
}

export async function generateTenKeys(): Promise<AccessKey[]> {
  const db = await loadDB();
  if (!db.keys) db.keys = [];
  const newKeys: AccessKey[] = [];
  for (let i = 0; i < 10; i++) {
    const keyStr = `FREE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newKey: AccessKey = {
      id: 'key_' + Math.random().toString(36).substring(2, 9),
      keyString: keyStr,
      createdAt: new Date().toISOString(),
      claimedByIp: null,
      claimedAt: null,
      expiresAt: null,
      status: 'active',
    };
    db.keys.push(newKey);
    newKeys.push(newKey);
  }
  await saveDB();
  return newKeys;
}

export async function deleteKey(id: string): Promise<boolean> {
  const db = await loadDB();
  if (!db.keys) db.keys = [];
  const initialLength = db.keys.length;
  db.keys = db.keys.filter(k => k.id !== id);
  if (db.keys.length !== initialLength) {
    await saveDB();
    return true;
  }
  return false;
}

export async function claimFreeKey(ip: string): Promise<AccessKey> {
  const db = await loadDB();
  if (!db.keys) {
    db.keys = [...defaultKeys];
    await saveDB();
  }
  
  // First check if this IP has already claimed an active key
  const existing = db.keys.find(k => k.claimedByIp === ip && k.status === 'claimed');
  if (existing) {
    // Check if it's expired
    if (existing.expiresAt && new Date(existing.expiresAt) < new Date()) {
      existing.status = 'expired';
      await saveDB();
    } else {
      return existing; // return the same key they already claimed
    }
  }
  
  // Find an unclaimed active key
  const available = db.keys.find(k => k.status === 'active' && !k.claimedByIp);
  if (!available) {
    throw new Error('No free keys are currently available. Please check back later or contact admin.');
  }
  
  const claimedAt = new Date();
  const expiresAt = new Date(claimedAt.getTime() + 24 * 60 * 60 * 1000); // Expires in 24 hours
  
  available.status = 'claimed';
  available.claimedByIp = ip;
  available.claimedAt = claimedAt.toISOString();
  available.expiresAt = expiresAt.toISOString();
  
  await saveDB();
  return available;
}

export async function updateKey(id: string, updates: Partial<Omit<AccessKey, 'id' | 'createdAt'>>): Promise<AccessKey | null> {
  const db = await loadDB();
  if (!db.keys) db.keys = [];
  const key = db.keys.find(k => k.id === id);
  if (!key) return null;
  
  if (updates.keyString !== undefined) key.keyString = updates.keyString.toUpperCase().trim();
  if (updates.status !== undefined) key.status = updates.status;
  if (updates.claimedByIp !== undefined) {
    key.claimedByIp = updates.claimedByIp ? updates.claimedByIp.trim() : null;
  }
  if (updates.claimedAt !== undefined) {
    key.claimedAt = updates.claimedAt ? updates.claimedAt : null;
  }
  if (updates.expiresAt !== undefined) {
    key.expiresAt = updates.expiresAt ? updates.expiresAt : null;
  }
  
  await saveDB();
  return key;
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
