import { useState } from 'react';
import { Download, Monitor, Smartphone, Gift, Calendar, HardDrive, CheckCircle2, Copy, Check, Loader2, Share2, AlertCircle, Users } from 'lucide-react';
import { PanelConfig } from '../types';

interface PanelCardProps {
  key?: string;
  panel: PanelConfig;
  onDownload: (id: string) => Promise<void>;
  whatsAppGroupUrl?: string;
}

export function PanelCard({ panel, onDownload, whatsAppGroupUrl }: PanelCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showError, setShowError] = useState(false);

  const getIcon = () => {
    switch (panel.imageUrl) {
      case 'Monitor':
        return <Monitor className="w-12 h-12 text-blue-400" />;
      case 'Smartphone':
        return <Smartphone className="w-12 h-12 text-purple-400" />;
      case 'Gift':
        return <Gift className="w-12 h-12 text-emerald-400" />;
      default:
        // Use id fallback
        if (panel.id === 'pc') return <Monitor className="w-12 h-12 text-blue-400" />;
        if (panel.id === 'mobile') return <Smartphone className="w-12 h-12 text-purple-400" />;
        return <Gift className="w-12 h-12 text-emerald-400" />;
    }
  };

  const getGradient = () => {
    const isPc = panel.imageUrl === 'Monitor' || panel.id === 'pc';
    const isMobile = panel.imageUrl === 'Smartphone' || panel.id === 'mobile';
    const isFree = panel.imageUrl === 'Gift' || panel.id === 'free';

    if (isPc) return 'from-blue-600/20 via-sky-500/10 to-indigo-600/5 hover:border-blue-500/40';
    if (isMobile) return 'from-purple-600/20 via-fuchsia-500/10 to-pink-600/5 hover:border-purple-500/40';
    if (isFree) return 'from-emerald-600/20 via-teal-500/10 to-cyan-600/5 hover:border-emerald-500/40';
    return 'from-slate-600/20 via-slate-500/10 to-slate-600/5 hover:border-slate-500/40';
  };

  const getBadgeColor = () => {
    const isPc = panel.imageUrl === 'Monitor' || panel.id === 'pc';
    const isMobile = panel.imageUrl === 'Smartphone' || panel.id === 'mobile';
    const isFree = panel.imageUrl === 'Gift' || panel.id === 'free';

    if (isPc) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (isMobile) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (isFree) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getButtonGradient = () => {
    if (!panel.enabled) return 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700';
    const isPc = panel.imageUrl === 'Monitor' || panel.id === 'pc';
    const isMobile = panel.imageUrl === 'Smartphone' || panel.id === 'mobile';
    const isFree = panel.imageUrl === 'Gift' || panel.id === 'free';

    if (isPc) return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95';
    if (isMobile) return 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25 active:scale-95';
    if (isFree) return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 active:scale-95';
    return 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-lg shadow-slate-500/25 active:scale-95';
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = `${window.location.origin}/api/download/${panel.id}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownloadClick = async () => {
    if (!panel.enabled) return;
    setDownloading(true);
    setShowError(false);
    try {
      await onDownload(panel.id);
    } catch (err) {
      console.error(err);
      setShowError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id={`panel-card-${panel.id}`}
      className="relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border theme-custom-card"
    >
      {/* Dynamic Glow Backing */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none" style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.03 }} />

      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center theme-custom-border">
            {getIcon()}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border theme-custom-btn-secondary">
              {panel.version || 'v1.0.0'}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
              {panel.downloadCount || 0} Downloads
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {panel.title}
        </h3>
        <p className="text-sm text-gray-300 mb-5 leading-relaxed font-sans">
          {panel.description}
        </p>

        {/* Specs Table */}
        <div className="grid grid-cols-2 gap-3 p-3 mb-5 rounded-xl bg-black/20 border border-white/5 font-mono text-[11px] text-gray-400 theme-custom-border">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-gray-500" />
            <span>Size: <strong className="text-gray-200">{panel.fileSize || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="truncate">Updated: <strong className="text-gray-200">{panel.lastUpdated || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Features Bullets List */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2.5 font-mono">
            Features Included
          </h4>
          <ul className="space-y-2">
            {panel.features && panel.features.length > 0 ? (
              panel.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-300 animate-slide-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 theme-custom-text-primary" />
                  <span>{feature}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-gray-500 italic">No features specified</li>
            )}
          </ul>
        </div>
      </div>

      {/* Button and Actions footer */}
      <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3 theme-custom-border">
        {showError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Could not download file. Please try again.</span>
          </div>
        )}

        <button
          id={`download-btn-${panel.id}`}
          onClick={handleDownloadClick}
          disabled={!panel.enabled || downloading}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none ${
            !panel.enabled 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' 
              : 'theme-custom-btn-primary'
          }`}
        >
          {downloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching secure file...</span>
            </>
          ) : !panel.enabled ? (
            <span>Download Disabled</span>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Now</span>
            </>
          )}
        </button>

        {(panel.id === 'pc' || panel.id === 'mobile') && whatsAppGroupUrl && (
          <a
            href={whatsAppGroupUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none text-sm text-center border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
          >
            <Users className="w-5 h-5 shrink-0" />
            <span>Join WhatsApp Group</span>
          </a>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-mono">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${panel.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {panel.enabled ? 'Online / Secure' : 'Offline / Under Maintenance'}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            title="Copy Direct API link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 theme-custom-text-primary" />
                <span className="text-emerald-400 theme-custom-text-primary">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
