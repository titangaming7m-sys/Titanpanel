export interface SocialLinks {
  github?: string;
  discord?: string;
  twitter?: string;
  telegram?: string;
}

export interface PanelConfig {
  id: string;
  title: string;
  description: string;
  version: string;
  fileSize: string;
  lastUpdated: string;
  features: string[];
  downloadCount: number;
  downloadUrl: string; // URL or local path
  imageUrl: string; // custom icon/image url or emoji/fallback icon class
  enabled: boolean;
}

export interface WebsiteSettings {
  websiteName: string;
  logoUrl: string;
  bannerUrl: string;
  footerText: string;
  socialLinks: SocialLinks;
  contactEmail: string;
  contactTelegram: string;
  contactWhatsApp?: string;
  contactWhatsAppGroup?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  chatbotEnabled?: boolean;
  chatbotWelcomeMessage?: string;
  whatsappBotEnabled?: boolean;
  telegramBotEnabled?: boolean;
  totalVisitors: number;
  
  // Custom Design & Effects Properties
  activeTheme?: string;           // Selected preset theme ID (30+ options)
  activeEffect?: string;          // Selected visual effect ID (15 options)
  customPrimary?: string;         // Individual hex customizer colors
  customSecondary?: string;
  customAccent?: string;
  customBg?: string;
  customCardBg?: string;
  effectIntensity?: number;       // Slider for effect speed/amount (1-100)
  loadingLogoUrl?: string;        // Custom loading screen logo URL

  // Custom Ad Placements (HTML Code or Links)
  adHeaderCode?: string;          // Header banner ad
  adFooterCode?: string;          // Footer banner ad
  adPcBannerCode?: string;        // PC Panel Card ad placement
  adMobileBannerCode?: string;    // Mobile Panel Card ad placement
  adFreeBannerCode?: string;      // Free Panel Card ad placement
}

export interface DownloadLog {
  id: string;
  panelId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

export interface AccessKey {
  id: string;
  keyString: string;
  createdAt: string;
  claimedByIp: string | null;
  claimedAt: string | null;
  expiresAt: string | null;
  status: 'active' | 'claimed' | 'expired';
}

export interface DashboardStats {
  totalDownloads: number;
  totalFiles: number;
  websiteVisitors: number;
  latestDownloads: DownloadLog[];
}
