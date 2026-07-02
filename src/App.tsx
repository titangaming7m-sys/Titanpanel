import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PanelCard } from './components/PanelCard';
import { AdRenderer } from './components/AdRenderer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import {
  Monitor, Smartphone, Gift, Search, Mail, Send, Github,
  MessageSquare, Twitter, ExternalLink, Lock, Menu, X, ShieldAlert, CheckCircle, HelpCircle, MessageCircle
} from 'lucide-react';
import { WebsiteSettings, PanelConfig } from './types';
import { THEME_PRESETS, getThemeVariables } from './utils/themePresets';
import { BackgroundEffects } from './components/BackgroundEffects';
import { TitanLogo } from './components/TitanLogo';

export default function App() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [settings, setSettings] = useState<WebsiteSettings | null>(() => {
    try {
      const cached = localStorage.getItem('cached_settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [previewSettings, setPreviewSettings] = useState<WebsiteSettings | null>(null);
  const [panels, setPanels] = useState<Record<string, PanelConfig> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Chatbot widget toggle state
  const [chatOpen, setChatOpen] = useState(false);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Session Token
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem('admin_session_token')
  );
  const [adminUsername, setAdminUsername] = useState<string | null>(
    localStorage.getItem('admin_username')
  );

  // Parse location hash on load to enable deep-linking to #admin
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('admin');
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Trigger once on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch configs and track visitor session
  const fetchPortalConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setPanels(data.panels);
        setPreviewSettings(null); // Reset live preview when configuration is fetched
        try {
          localStorage.setItem('cached_settings', JSON.stringify(data.settings));
        } catch (e) {
          console.warn('Failed to cache settings in localStorage:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load portal configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerVisitorSession = async () => {
    // Only register a visit once per browser session to prevent inflated metrics on refreshes!
    const hasVisited = sessionStorage.getItem('visited_this_session');
    if (!hasVisited) {
      try {
        await fetch('/api/visit', { method: 'POST' });
        sessionStorage.setItem('visited_this_session', 'true');
      } catch (err) {
        console.error('Failed to register visit telemetry:', err);
      }
    }
  };

  useEffect(() => {
    if (view === 'home') {
      fetchPortalConfig();
    }
  }, [view]);

  useEffect(() => {
    registerVisitorSession();
  }, []);

  // Download Trigger Handler
  const handleDownloadTrigger = async (panelId: string) => {
    try {
      const res = await fetch(`/api/download/${panelId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server rejected download request.');
      }

      if (data.url) {
        // Trigger a clean physical browser download
        const link = document.createElement('a');
        link.href = data.url;
        link.download = ''; // Let's try downloading natively
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Refresh portal counts in background
        fetchPortalConfig();
      }
    } catch (err: any) {
      alert(err.message || 'System failed to fetch target panel download link.');
      throw err;
    }
  };

  // Admin login callbacks
  const handleAdminLogin = (token: string, username: string) => {
    localStorage.setItem('admin_session_token', token);
    localStorage.setItem('admin_username', username);
    setAdminToken(token);
    setAdminUsername(username);
    window.location.hash = '#admin';
    setView('admin');
    fetchPortalConfig();
  };

  const handleAdminLogout = () => {
    // Call server logout to discard session token
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(err => console.error(err));
    }

    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('admin_username');
    setAdminToken(null);
    setAdminUsername(null);
    window.location.hash = '#home';
    setView('home');
    fetchPortalConfig();
  };

  if (loading) {
    const currentLoadingLogo = previewSettings?.loadingLogoUrl || settings?.loadingLogoUrl;
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background styling */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center justify-center mb-6">
          {/* Glowing pulse effect background */}
          <div className="absolute w-48 h-48 rounded-full bg-red-600/10 blur-3xl animate-pulse" />
          
          {/* Main detailed Titan Panel Logo or Custom Logo centered with subtle float animation */}
          <div className="relative z-10 animate-[bounce_2s_infinite_ease-in-out] flex items-center justify-center">
            {currentLoadingLogo ? (
              <img
                src={currentLoadingLogo}
                alt="Loading Logo"
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-amber-500 shadow-2xl shadow-red-500/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <TitanLogo className="w-48 h-48 sm:w-56 sm:h-56" />
            )}
          </div>

          {/* Spinner surrounding or below the logo */}
          <div className="absolute w-56 h-56 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_12s_linear_infinite]" />
          <div className="absolute w-60 h-60 rounded-full border border-double border-red-500/15 animate-[spin_18s_linear_infinite_reverse]" />
        </div>
        
        <h2 className="text-2xl font-black tracking-wider uppercase font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-amber-600 animate-pulse">
          {previewSettings?.websiteName || settings?.websiteName || 'TITAN PANEL'}
        </h2>
        <p className="text-xs text-gray-500 mt-2 font-mono tracking-widest uppercase animate-[pulse_1.5s_infinite]">
          Booting secure transmission channels...
        </p>
      </div>
    );
  }

  // Define dynamic settings fallbacks
  const activeSettings = previewSettings || settings;
  const activeThemeId = activeSettings?.activeTheme || 'cyberpunk-neon';
  const activeEffectId = activeSettings?.activeEffect || 'starfield';
  const intensityValue = activeSettings?.effectIntensity ?? 50;

  const themeVars = getThemeVariables(activeThemeId, {
    primary: activeSettings?.customPrimary,
    secondary: activeSettings?.customSecondary,
    accent: activeSettings?.customAccent,
    bg: activeSettings?.customBg,
    cardBg: activeSettings?.customCardBg,
  });

  const siteName = activeSettings?.websiteName || 'Panel Download Center';
  const logoUrl = activeSettings?.logoUrl;
  const bannerUrl = activeSettings?.bannerUrl;
  const footerText = activeSettings?.footerText || '© 2026 Panel Download Center. All Rights Reserved.';
  const socialLinks = activeSettings?.socialLinks || {};
  const contactEmail = activeSettings?.contactEmail || 'support@paneldownloadcenter.com';
  const contactWhatsAppGroup = settings?.contactWhatsAppGroup || 'https://chat.whatsapp.com/sample-group-link';

  // Chatbot configuration fields
  const chatbotEnabled = settings?.chatbotEnabled !== false;
  const chatbotWelcomeMessage = settings?.chatbotWelcomeMessage || 'Hi! Have any questions or need custom setup support? Reach out directly using our official channels below:';
  const whatsappBotEnabled = settings?.whatsappBotEnabled !== false;
  const telegramBotEnabled = settings?.telegramBotEnabled !== false;
  const whatsappNumber = settings?.whatsappNumber || '1234567890';
  const telegramUsername = settings?.telegramUsername || 'panelsupport_bot';

  // Clean links
  const whatsappLink = whatsappNumber.startsWith('http') ? whatsappNumber : `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
  const telegramLink = telegramUsername.startsWith('http') ? telegramUsername : `https://t.me/${telegramUsername.replace(/^@/, '')}`;

  // Filter panels by search input
  const filteredPanels: PanelConfig[] = panels
    ? (Object.values(panels) as PanelConfig[]).filter((panel: PanelConfig) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          panel.title.toLowerCase().includes(query) ||
          panel.description.toLowerCase().includes(query) ||
          panel.features.some((f: string) => f.toLowerCase().includes(query)) ||
          panel.version.toLowerCase().includes(query)
        );
      })
    : [];

  // Admin Gateway Page routing removed from top-level to wrap inside styled layout
  
  return (
    <div className="min-h-screen theme-custom-bg text-gray-100 flex flex-col font-sans relative antialiased selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic CSS Custom Theme Variables Injector */}
      <style>{`
        :root {
          --theme-primary: ${themeVars['--theme-primary']};
          --theme-secondary: ${themeVars['--theme-secondary']};
          --theme-accent: ${themeVars['--theme-accent']};
          --theme-bg: ${themeVars['--theme-bg']};
          --theme-card-bg: ${themeVars['--theme-card-bg']};
          --theme-primary-rgb: ${themeVars['--theme-primary-rgb']};
          --theme-secondary-rgb: ${themeVars['--theme-secondary-rgb']};
          --theme-bg-rgb: ${themeVars['--theme-bg-rgb']};
          --theme-card-bg-rgb: ${themeVars['--theme-card-bg-rgb']};
        }

        .theme-custom-bg {
          background-color: var(--theme-bg) !important;
        }

        .theme-custom-card {
          background-color: rgba(var(--theme-card-bg-rgb), 0.55) !important;
          border-color: rgba(var(--theme-primary-rgb), 0.12) !important;
          backdrop-filter: blur(16px);
        }

        .theme-custom-card:hover {
          border-color: rgba(var(--theme-primary-rgb), 0.45) !important;
          box-shadow: 0 10px 40px -10px rgba(var(--theme-primary-rgb), 0.2) !important;
        }

        .theme-custom-text-primary {
          color: var(--theme-primary) !important;
        }

        .theme-custom-text-secondary {
          color: var(--theme-secondary) !important;
        }

        .theme-custom-border {
          border-color: rgba(var(--theme-primary-rgb), 0.15) !important;
        }

        .theme-custom-btn-primary {
          background-color: var(--theme-primary) !important;
          color: #ffffff !important;
          box-shadow: 0 8px 20px -6px rgba(var(--theme-primary-rgb), 0.4) !important;
        }

        .theme-custom-btn-primary:hover {
          filter: brightness(1.15);
          box-shadow: 0 12px 25px -4px rgba(var(--theme-primary-rgb), 0.5) !important;
        }

        .theme-custom-btn-secondary {
          background-color: rgba(var(--theme-secondary-rgb), 0.08) !important;
          border: 1px solid rgba(var(--theme-secondary-rgb), 0.25) !important;
          color: var(--theme-secondary) !important;
        }

        .theme-custom-btn-secondary:hover {
          background-color: rgba(var(--theme-secondary-rgb), 0.15) !important;
          border-color: rgba(var(--theme-secondary-rgb), 0.45) !important;
        }
      `}</style>

      {/* Dynamic Background visual effects canvas */}
      <BackgroundEffects
        effectId={activeEffectId}
        intensity={intensityValue}
        primaryColor={themeVars['--theme-primary']}
        secondaryColor={themeVars['--theme-secondary']}
        accentColor={themeVars['--theme-accent']}
      />

      {/* Background radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--theme-primary-rgb),0.07),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(var(--theme-secondary-rgb),0.07),transparent_50%)] pointer-events-none z-0" />

      {/* Grid Pattern overlay for tech aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {view === 'admin' ? (
        adminToken ? (
          <div className="relative z-10 flex-1 flex flex-col md:flex-row min-h-screen">
            <AdminDashboard
              token={adminToken}
              onLogout={handleAdminLogout}
              onBrandingChange={(branding) => setPreviewSettings(branding)}
              onSaveSettings={(updatedSettings) => {
                setSettings(updatedSettings);
                try {
                  localStorage.setItem('cached_settings', JSON.stringify(updatedSettings));
                } catch (e) {
                  console.warn('Failed to cache settings in localStorage:', e);
                }
              }}
            />
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
            <AdminLogin
              onLoginSuccess={handleAdminLogin}
              onGoHome={() => {
                window.location.hash = '#home';
                setView('home');
              }}
            />
          </div>
        )
      ) : (
        <>
          {/* Top Header / Branding Bar */}
          <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10 theme-custom-border relative">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <a href="#home" className="flex items-center gap-3 group">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-white/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-black text-sm tracking-widest shadow-md">
                    PDC
                  </div>
                )}
                <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                  {siteName}
                </span>
              </a>

              {/* Desktop Nav links */}
              <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide uppercase text-gray-300 font-mono">
                <a
                  href="#admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 theme-custom-btn-secondary"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Gateway</span>
                </a>
              </nav>

              {/* Mobile menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile menu Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-white/10 bg-slate-950 p-6 flex flex-col gap-4 text-sm font-semibold tracking-wide uppercase font-mono">
                <a
                  href="#admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs theme-custom-btn-primary"
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin Gateway</span>
                </a>
              </div>
            )}
          </header>

          {/* Header Ad Placement */}
          {activeSettings?.adHeaderCode && (
            <div className="max-w-7xl mx-auto px-6 pt-6">
              <AdRenderer 
                code={activeSettings.adHeaderCode} 
                fallbackText="⚡ High-Paying Ad Network for Publishers - Join Adsterra Today!" 
              />
            </div>
          )}

          {/* Hero Banner Section */}
          <section className="relative py-12 px-6 overflow-hidden">
            {/* Banner background - custom uploaded banner or a beautiful default gradient backing */}
            {bannerUrl ? (
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-20 blur-sm" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
              </div>
            ) : (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            )}

            <div className="max-w-4xl mx-auto text-center relative z-10">
              {/* Core Search bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search panel features or version codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 backdrop-blur-md border rounded-full text-white placeholder-gray-500 text-sm focus:outline-none transition-all"
                    style={{
                      borderColor: searchQuery ? 'var(--theme-primary)' : 'rgba(255,255,255,0.1)',
                      boxShadow: searchQuery ? '0 0 15px rgba(var(--theme-primary-rgb), 0.15)' : 'none'
                    }}
                  />
                </div>
                {searchQuery && (
                  <p className="text-[11px] font-mono mt-2 theme-custom-text-primary">
                    Filtering panel cards for "{searchQuery}"
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Main Grid Section */}
          <section className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
            {filteredPanels.length === 0 ? (
              <div className="text-center p-12 bg-slate-900/40 border border-white/5 rounded-3xl">
                <ShieldAlert className="w-12 h-12 text-yellow-500/70 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No panels match your query</h3>
                <p className="text-xs text-gray-500 mt-1">Try refining your search text or clear query to list all options.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white"
                >
                  Reset Search Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {filteredPanels.map((panel) => (
                  <PanelCard 
                    key={panel.id} 
                    panel={panel} 
                    onDownload={handleDownloadTrigger} 
                    whatsAppGroupUrl={contactWhatsAppGroup} 
                    adCode={
                      panel.id === 'pc' ? activeSettings?.adPcBannerCode :
                      panel.id === 'mobile' ? activeSettings?.adMobileBannerCode :
                      panel.id === 'free' ? activeSettings?.adFreeBannerCode : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Secure footer */}
          <footer className="bg-black/40 border-t border-white/10 mt-auto py-12 px-6 theme-custom-border relative">
            {activeSettings?.adFooterCode && (
              <div className="max-w-7xl mx-auto mb-8 pb-8 border-b border-white/5">
                <AdRenderer 
                  code={activeSettings.adFooterCode} 
                  fallbackText="🚀 Monetize 100% of Your Desktop & Mobile Traffic with Adsterra" 
                />
              </div>
            )}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-6 h-6 rounded object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-[10px] text-white font-bold">
                    P
                  </div>
                )}
                <span className="text-xs text-gray-400 font-bold font-mono">
                  {siteName}
                </span>
              </div>

              <p className="text-[11px] text-gray-500 text-center font-mono">
                {footerText}
              </p>

              {/* Social media connections */}
              <div className="flex items-center gap-4">
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.discord && (
                  <a href={socialLinks.discord} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all" title="Discord">
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all" title="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.telegram && (
                  <a href={socialLinks.telegram} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all" title="Telegram">
                    <Send className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </footer>

          {/* Floating Chatbot-style Support Widget */}
          {chatbotEnabled && (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
              <AnimatePresence>
                {chatOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-left"
                  >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                            <MessageSquare className="w-4 h-4 text-indigo-300" />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-wide">Live Support Chat</h4>
                          <p className="text-[9px] text-indigo-200 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" /> Support is Online
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setChatOpen(false)}
                        className="p-1 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-4">
                      <p className="text-[11px] text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {chatbotWelcomeMessage}
                      </p>

                      {/* Branded Channels inside Chatbot */}
                      <div className="space-y-2.5">
                        {telegramBotEnabled && (
                          <a
                            href={telegramLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-purple-500/10">
                              <Send className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Telegram Support Bot</span>
                                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" />
                              </div>
                              <p className="text-[10px] text-gray-400 font-mono">@{(telegramUsername || 'panelsupport_bot').replace(/^@/, '')}</p>
                            </div>
                          </a>
                        )}

                        {whatsappBotEnabled && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-emerald-500/10">
                              <MessageCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">WhatsApp Chatbot</span>
                                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                              </div>
                              <p className="text-[10px] text-gray-400 font-mono">Chat with support bot</p>
                            </div>
                          </a>
                        )}

                        {!telegramBotEnabled && !whatsappBotEnabled && (
                          <div className="text-center py-4 text-xs text-gray-500 font-mono">
                            No active support bot channels.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-slate-950/40 border-t border-white/5 text-center">
                      <span className="text-[9px] text-gray-500 font-mono">Typically responds in under 5 minutes</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Floating Trigger Button */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group border border-white/10 theme-custom-btn-primary"
                aria-label="Toggle support chat"
              >
                {chatOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <div className="relative">
                    <MessageSquare className="w-6 h-6" />
                    {/* Pulsing indicator when closed */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border border-indigo-600 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border border-indigo-600" />
                  </div>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
