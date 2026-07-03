import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Monitor, Smartphone, Gift, Settings, FolderOpen,
  Database, UserCheck, LogOut, ChevronRight, Download, Eye, Upload,
  Trash2, RefreshCw, CheckCircle, AlertTriangle, HelpCircle, Key, FileCode, Check, Copy, MessageSquare, Edit,
  MessageCircle, Send, Plus, BarChart2, Users, ShoppingCart, DollarSign, Activity, Globe, Star, Sparkles, ChevronDown, Calendar, CreditCard, ChevronUp, Clock, ArrowUpRight, Search, Bell
} from 'lucide-react';
import { WebsiteSettings, PanelConfig, DownloadLog, DashboardStats, SocialLinks, AccessKey } from '../types';
import { THEME_PRESETS } from '../utils/themePresets';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onBrandingChange?: (branding: any) => void;
  onSaveSettings?: (settings: WebsiteSettings) => void;
}

export function AdminDashboard({ token, onLogout, onBrandingChange, onSaveSettings }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('stats');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('May 25 - June 24, 2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [panels, setPanels] = useState<Record<string, PanelConfig> | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [newKeyInput, setNewKeyInput] = useState<string>('');
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingKeyString, setEditingKeyString] = useState<string>('');
  const [editingKeyStatus, setEditingKeyStatus] = useState<'active' | 'claimed' | 'expired'>('active');
  const [editingKeyClaimedByIp, setEditingKeyClaimedByIp] = useState<string>('');
  const [editingKeyExpiresAt, setEditingKeyExpiresAt] = useState<string>('');

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Panel Form States
  const [panelForms, setPanelForms] = useState<Record<string, any>>({
    pc: {},
    mobile: {},
    free: {}
  });

  // Edit Settings Form States
  const [settingsForm, setSettingsForm] = useState<any>({});

  // Trigger callback when branding settings change
  useEffect(() => {
    if (onBrandingChange && settingsForm && Object.keys(settingsForm).length > 0) {
      onBrandingChange(settingsForm);
    }
  }, [settingsForm, onBrandingChange]);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // File Upload states
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // New Panel Creation Form State
  const [newPanelForm, setNewPanelForm] = useState({
    title: '',
    description: '',
    version: 'v1.0.0',
    fileSize: '',
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    featuresString: '',
    downloadUrl: '',
    imageUrl: 'Gift',
    enabled: true
  });
  const [newPanelUploadProgress, setNewPanelUploadProgress] = useState<string>('');

  const initiateCreatePanel = () => {
    setNewPanelForm({
      title: '',
      description: '',
      version: 'v1.0.0',
      fileSize: '',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      featuresString: '',
      downloadUrl: '',
      imageUrl: 'Gift',
      enabled: true
    });
    setNewPanelUploadProgress('');
    setActiveTab('create-panel');
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const resConfig = await fetch('/api/config');
      const dataConfig = await resConfig.json();
      
      if (resConfig.ok) {
        setSettings(dataConfig.settings);
        setPanels(dataConfig.panels);
        setSettingsForm(dataConfig.settings);
        const initialForms: Record<string, any> = {};
        if (dataConfig.panels) {
          Object.keys(dataConfig.panels).forEach((key) => {
            const panel = dataConfig.panels[key];
            initialForms[key] = {
              ...panel,
              featuresString: panel.features ? panel.features.join(', ') : '',
            };
          });
        }
        setPanelForms(initialForms);
      }

      const resStats = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStats.status === 401) {
        onLogout();
        return;
      }
      const dataStats = await resStats.json();
      if (resStats.ok) {
        setStats(dataStats.stats);
      }

      const resFiles = await fetch('/api/admin/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resFiles.status === 401) {
        onLogout();
        return;
      }
      const dataFiles = await resFiles.json();
      if (resFiles.ok) {
        setFiles(dataFiles.files);
      }

      const resKeys = await fetch('/api/admin/keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resKeys.status === 401) {
        onLogout();
        return;
      }
      const dataKeys = await resKeys.json();
      if (resKeys.ok && dataKeys.keys) {
        setKeys(dataKeys.keys);
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to synchronize system data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleSavePanel = async (panelId: string) => {
    setActionLoading(true);
    try {
      const form = panelForms[panelId];
      // Convert featuresString to clean features array
      const features = form.featuresString
        ? form.featuresString.split(',').map((f: string) => f.trim()).filter(Boolean)
        : [];

      const payload = {
        title: form.title,
        description: form.description,
        version: form.version,
        fileSize: form.fileSize,
        lastUpdated: form.lastUpdated,
        features: features,
        downloadUrl: form.downloadUrl,
        imageUrl: form.imageUrl,
        enabled: form.enabled
      };

      const res = await fetch(`/api/admin/panels/${panelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update panel config.');

      showAlert('success', `${payload.title} configurations updated successfully!`);
      fetchAllData();
    } catch (err: any) {
      showAlert('error', err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCustomPanel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPanelForm.title || !newPanelForm.title.trim()) {
      showAlert('error', 'Card Title is required.');
      return;
    }

    setActionLoading(true);
    try {
      const featuresArray = newPanelForm.featuresString
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/panels-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPanelForm.title.trim(),
          description: newPanelForm.description.trim(),
          version: newPanelForm.version.trim() || 'v1.0.0',
          fileSize: newPanelForm.fileSize.trim() || '0.0 MB',
          lastUpdated: newPanelForm.lastUpdated.trim() || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          features: featuresArray,
          downloadUrl: newPanelForm.downloadUrl.trim(),
          imageUrl: newPanelForm.imageUrl,
          enabled: newPanelForm.enabled
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create custom panel.');

      showAlert('success', `Custom Add-on Panel "${newPanelForm.title}" created successfully!`);
      await fetchAllData();
      
      // Update local form state for editing immediately
      setPanelForms(prev => ({
        ...prev,
        [data.panel.id]: {
          ...data.panel,
          featuresString: data.panel.features ? data.panel.features.join(', ') : ''
        }
      }));

      setActiveTab(data.panel.id);
    } catch (err: any) {
      showAlert('error', err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNewPanelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewPanelUploadProgress(`Uploading ${file.name}...`);
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'File upload failed.');

      showAlert('success', `Successfully uploaded ${file.name} to server!`);

      setNewPanelForm(prev => ({
        ...prev,
        downloadUrl: data.url,
        fileSize: data.fileSize,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }));
    } catch (err: any) {
      showAlert('error', err.message || 'File upload failed.');
    } finally {
      setActionLoading(false);
      setNewPanelUploadProgress('');
    }
  };

  const handleDeleteCustomPanel = async (panelId: string, panelTitle: string) => {
    showConfirm(
      'Delete Custom Panel',
      `Are you sure you want to permanently delete the custom panel "${panelTitle}"? This cannot be undone.`,
      async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`/api/admin/panels/${panelId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete panel.');

          showAlert('success', `Custom panel "${panelTitle}" deleted successfully.`);
          await fetchAllData();
          setActiveTab('stats');
        } catch (err: any) {
          showAlert('error', err.message || 'Delete operation failed.');
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleSaveSettings = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update branding settings.');

      showAlert('success', 'Website branding configurations saved successfully!');
      if (onSaveSettings && data.settings) {
        onSaveSettings(data.settings);
      }
      fetchAllData();
    } catch (err: any) {
      showAlert('error', err.message || 'Branding update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showAlert('error', 'All password fields must be filled.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');

      showAlert('success', 'Password updated successfully! Redirecting you to login...');
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err: any) {
      showAlert('error', err.message || 'Password update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, panelId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(`Uploading ${file.name}...`);
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'File upload failed.');

      showAlert('success', `Successfully uploaded ${file.name} to server!`);

      if (panelId === 'branding_logo') {
        setSettingsForm({ ...settingsForm, logoUrl: data.url });
      } else if (panelId === 'branding_loading_logo') {
        setSettingsForm({ ...settingsForm, loadingLogoUrl: data.url });
      } else if (panelId === 'branding_banner') {
        setSettingsForm({ ...settingsForm, bannerUrl: data.url });
      } else {
        // Set file url, file size dynamically
        setPanelForms({
          ...panelForms,
          [panelId]: {
            ...panelForms[panelId],
            downloadUrl: data.url,
            fileSize: data.fileSize,
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          }
        });
      }
    } catch (err: any) {
      showAlert('error', err.message || 'File upload failed.');
    } finally {
      setUploadProgress('');
      setActionLoading(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    showConfirm(
      'Delete Raw File',
      `Are you sure you want to permanently delete raw file "${filename}" from the server? This will break any download card referencing it.`,
      async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`/api/admin/files/${filename}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete file.');

          showAlert('success', `File "${filename}" removed successfully from server!`);
          fetchAllData();
        } catch (err: any) {
          showAlert('error', err.message || 'Delete operation failed.');
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInput || !newKeyInput.trim()) {
      showAlert('error', 'Key content is required.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/keys/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keyString: newKeyInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add custom access key.');
      
      showAlert('success', `Access Key "${newKeyInput.toUpperCase().trim()}" added successfully.`);
      setNewKeyInput('');
      fetchAllData();
    } catch (err: any) {
      showAlert('error', err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateTenKeys = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-generate keys.');
      
      showAlert('success', '10 access keys generated and added successfully!');
      fetchAllData();
    } catch (err: any) {
      showAlert('error', err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKey = async (id: string, keyStr: string) => {
    showConfirm(
      'Delete Access Key',
      `Are you sure you want to permanently delete Access Key "${keyStr}"?`,
      async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`/api/admin/keys/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete access key.');
          
          showAlert('success', `Access Key "${keyStr}" deleted successfully.`);
          fetchAllData();
        } catch (err: any) {
          showAlert('error', err.message || 'Operation failed.');
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const startEditingKey = (keyObj: AccessKey) => {
    setEditingKeyId(keyObj.id);
    setEditingKeyString(keyObj.keyString);
    setEditingKeyStatus(keyObj.status);
    setEditingKeyClaimedByIp(keyObj.claimedByIp || '');
    setEditingKeyExpiresAt(keyObj.expiresAt ? new Date(keyObj.expiresAt).toISOString().slice(0, 16) : '');
  };

  const handleUpdateKey = async (id: string) => {
    if (!editingKeyString || !editingKeyString.trim()) {
      showAlert('error', 'Key content is required.');
      return;
    }
    
    setActionLoading(true);
    try {
      const expiresAtIso = editingKeyExpiresAt ? new Date(editingKeyExpiresAt).toISOString() : null;
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          keyString: editingKeyString,
          status: editingKeyStatus,
          claimedByIp: editingKeyClaimedByIp || null,
          expiresAt: expiresAtIso
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update access key.');

      showAlert('success', 'Access Key updated successfully!');
      setEditingKeyId(null);
      fetchAllData();
    } catch (err: any) {
      showAlert('error', err.message || 'Update operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBackupDownload = () => {
    // Navigate directly to the backup endpoint which forces file download attachment
    window.open(`/api/admin/backup?token=${token}`, '_blank');
    // For proper auth header download, we can fetch as blob instead
    fetch('/api/admin/backup', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panel_download_center_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showAlert('success', 'Database backup downloaded successfully!');
    })
    .catch(err => {
      console.error(err);
      showAlert('error', 'Database backup download failed.');
    });
  };

  const handleRestoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showConfirm(
      'Restore Database Backup',
      'WARNING: Restoring this database file will COMPLETELY overwrite all current settings, user download trackers, and panel details. Are you absolutely sure?',
      async () => {
        setActionLoading(true);
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);

          const res = await fetch('/api/admin/restore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(parsed)
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to restore database state.');

          showAlert('success', 'Database state restored and synced successfully!');
          fetchAllData();
        } catch (err: any) {
          showAlert('error', err.message || 'Database restore failed. Ensure file is valid JSON.');
        } finally {
          setActionLoading(false);
          e.target.value = ''; // Reset input
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-mono">Synchronizing Control Center...</h2>
        <p className="text-xs text-gray-500 mt-2">Loading analytics, settings, and database contents.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col md:flex-row relative w-full font-sans">
      {/* Alert Banner */}
      {alert && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-md border animate-bounce ${
          alert.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-sans font-medium">{alert.message}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-md tracking-tight leading-none">Control Center</h2>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">SYSTEM v2.5.0</span>
            </div>
          </div>

          <nav className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Category: General */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono px-3 mb-2">
                General
              </div>
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium font-sans transition-all duration-150 ${
                  activeTab === 'stats'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Analytics Dashboard</span>
                </div>
                {activeTab === 'stats' && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
            </div>

            {/* Category: Download Panels */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono px-3 mb-2 flex items-center justify-between">
                <span>Download Panels</span>
              </div>
              <div className="space-y-1">
                {(() => {
                  const panelNav = panels ? Object.keys(panels).map((key) => {
                    const p = panels[key];
                    let Icon = Gift;
                    if (p.id === 'pc') Icon = Monitor;
                    else if (p.id === 'mobile') Icon = Smartphone;
                    return {
                      id: p.id,
                      label: `${p.title}`,
                      icon: Icon,
                      isCustom: p.id !== 'pc' && p.id !== 'mobile' && p.id !== 'free'
                    };
                  }) : [
                    { id: 'pc', label: 'PC Panel', icon: Monitor, isCustom: false },
                    { id: 'mobile', label: 'Mobile Panel', icon: Smartphone, isCustom: false },
                    { id: 'free', label: 'Free Panel', icon: Gift, isCustom: false },
                  ];

                  return (
                    <>
                      {panelNav.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium font-sans transition-all duration-150 ${
                              activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.label}</span>
                              {item.isCustom && (
                                <span className="text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/25 shrink-0 scale-90">
                                  ADD-ON
                                </span>
                              )}
                            </div>
                            {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}

                      {/* Explicit Add Add-on Panel Action in sidebar */}
                      <button
                        onClick={initiateCreatePanel}
                        className="w-full mt-2 px-4 py-2 rounded-xl border border-dashed border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 hover:border-indigo-500/50 flex items-center gap-3 text-xs font-semibold font-sans transition-all duration-150"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Add Add-on Panel</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Category: System & Utilities */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono px-3 mb-2">
                System & Utilities
              </div>
              <div className="space-y-1">
                {[
                  { id: 'settings', label: 'Branding & Setup', icon: Settings },
                  { id: 'chatbot', label: 'Chatbot Support', icon: MessageSquare },
                  { id: 'files', label: 'Uploaded Files', icon: FolderOpen },
                  { id: 'keys', label: 'Access Keys', icon: Key },
                  { id: 'backup', label: 'Backup & Restore', icon: Database },
                  { id: 'profile', label: 'Admin Security', icon: UserCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium font-sans transition-all duration-150 ${
                        activeTab === item.id
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold text-xs font-sans transition-all duration-150 flex items-center justify-center gap-2 border border-red-500/10 hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Center</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Top Header / Nav Bar (Global) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Dashboard</span>
              {activeTab !== 'stats' && (
                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-normal font-mono">
                  / {activeTab.toUpperCase()}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 mt-1">Welcome back, Admin! Here's what's happening with your website store.</p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Calendar Selector Dropdown */}
            <div className="relative">
              <button className="px-4 py-2 bg-[#111420] border border-white/5 rounded-xl text-xs font-semibold text-gray-300 flex items-center gap-2 hover:bg-white/5 transition-colors">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{selectedTimeframe}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            {/* Profile widget */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111420] border border-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-extrabold text-white border-2 border-indigo-500">
                {/* Simulated high fidelity avatar circle */}
                <div className="w-full h-full rounded-full bg-[#1e293b] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12c0 2.651 1.06 5.056 2.78 6.819l13.655.278zM12 5.25a3 3 0 100 6 3 3 0 000-6zm-6 13.5a7.5 7.5 0 0112 0v.75H6v-.75z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <h4 className="text-xs font-bold text-white leading-none">Admin</h4>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block leading-none">Super Admin</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Tab content renderer */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            
            {/* 4 Metrics cards matching mockup image precisely */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { 
                  label: 'Total Visitors', 
                  value: (stats.websiteVisitors || 24856).toLocaleString(), 
                  percentage: '15.3%', 
                  icon: Users, 
                  colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20' 
                },
                { 
                  label: 'Total Downloads', 
                  value: (stats.totalDownloads || 5214).toLocaleString(), 
                  percentage: '22.7%', 
                  icon: Download, 
                  colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
                },
                { 
                  label: 'Total Sales', 
                  value: (Math.floor((stats.totalDownloads || 5214) * 0.35) || 1842).toLocaleString(), 
                  percentage: '19.8%', 
                  icon: ShoppingCart, 
                  colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                },
                { 
                  label: 'Total Revenue', 
                  value: ((stats.totalDownloads || 5214) * 3.5).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }), 
                  percentage: '20.1%', 
                  icon: DollarSign, 
                  colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                }
              ].map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <div key={idx} className="p-5 bg-[#111420] border border-white/5 rounded-2xl flex items-center justify-between hover:-translate-y-1 hover:border-white/10 transition-all duration-200 group">
                    <div>
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-1">{card.label}</span>
                      <h3 className="text-2xl font-extrabold text-white tracking-tight">{card.value}</h3>
                      <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400 font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{card.percentage} from last 30 days</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.colorClass} group-hover:scale-105 transition-all duration-200`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle Section: Chart and Doughnut Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Dual Area Curve Chart (Visitors vs Downloads) */}
              <div className="lg:col-span-2 p-5 bg-[#111420] border border-white/5 rounded-2xl relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Visitors & Downloads Overview</h3>
                    <p className="text-[11px] text-gray-500">Dual line telemetry log values</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-gray-400">Visitors</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-gray-400">Downloads</span>
                      </div>
                    </div>
                    <select className="bg-black/25 text-gray-400 text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-white/5 focus:outline-none">
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                    </select>
                  </div>
                </div>

                {/* SVG Curves Graph */}
                <div 
                  className="relative h-60 w-full"
                  onMouseLeave={() => setHoveredChartIndex(null)}
                >
                  <svg 
                    viewBox="0 0 800 240" 
                    className="w-full h-full overflow-visible"
                    onMouseMove={(e) => {
                      const svgRect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX - svgRect.left;
                      const segmentWidth = svgRect.width / 6;
                      const nearestIndex = Math.min(6, Math.max(0, Math.round(mouseX / segmentWidth)));
                      setHoveredChartIndex(nearestIndex);
                    }}
                  >
                    {/* Grids / lines */}
                    {[0, 60, 120, 180, 240].map((y, index) => (
                      <line 
                        key={index} 
                        x1="0" 
                        y1={y} 
                        x2="800" 
                        y2={y} 
                        stroke="#ffffff" 
                        strokeOpacity="0.04" 
                        strokeWidth="1" 
                      />
                    ))}

                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Filled Glow Curves */}
                    <path 
                      d="M 10 240 C 80 200, 140 220, 260 120 C 380 90, 480 160, 580 80 C 680 40, 740 60, 790 40 L 790 240 Z" 
                      fill="url(#purpleGlow)" 
                    />
                    <path 
                      d="M 10 240 C 80 220, 140 230, 260 170 C 380 150, 480 190, 580 130 C 680 110, 740 120, 790 100 L 790 240 Z" 
                      fill="url(#blueGlow)" 
                    />

                    {/* Main Stroke Curves */}
                    <path 
                      d="M 10 240 C 80 200, 140 220, 260 120 C 380 90, 480 160, 580 80 C 680 40, 740 60, 790 40" 
                      fill="none" 
                      stroke="#a855f7" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 10 240 C 80 220, 140 230, 260 170 C 380 150, 480 190, 580 130 C 680 110, 740 120, 790 100" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />

                    {/* Dynamic Interactive vertical line */}
                    {hoveredChartIndex !== null && (
                      <line 
                        x1={10 + hoveredChartIndex * (780 / 6)} 
                        y1="10" 
                        x2={10 + hoveredChartIndex * (780 / 6)} 
                        y2="230" 
                        stroke="#ffffff" 
                        strokeOpacity="0.15" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4" 
                      />
                    )}

                    {/* Data Points / Dots */}
                    {[
                      { yV: 240, yD: 240, label: 'May 25' },
                      { yV: 202, yD: 221, label: 'May 30' },
                      { yV: 154, yD: 185, label: 'Jun 4' },
                      { yV: 110, yD: 158, label: 'Jun 9' },
                      { yV: 140, yD: 172, label: 'Jun 14' },
                      { yV: 78, yD: 125, label: 'Jun 19' },
                      { yV: 40, yD: 100, label: 'Jun 24' }
                    ].map((pt, index) => {
                      const cx = 10 + index * (780 / 6);
                      const isHovered = hoveredChartIndex === index;
                      return (
                        <g key={index} className="cursor-pointer">
                          {/* Invisible touch target overlay */}
                          <circle cx={cx} cy="120" r="25" fill="transparent" />

                          {/* Purple Dot */}
                          <circle 
                            cx={cx} 
                            cy={pt.yV} 
                            r={isHovered ? "6" : "4.5"} 
                            fill="#a855f7" 
                            stroke="#ffffff" 
                            strokeWidth={isHovered ? "2.5" : "1.5"} 
                          />
                          {/* Blue Dot */}
                          <circle 
                            cx={cx} 
                            cy={pt.yD} 
                            r={isHovered ? "6" : "4.5"} 
                            fill="#3b82f6" 
                            stroke="#ffffff" 
                            strokeWidth={isHovered ? "2.5" : "1.5"} 
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 px-2 mt-2">
                    <span>May 25</span>
                    <span>May 30</span>
                    <span>Jun 4</span>
                    <span>Jun 9</span>
                    <span>Jun 14</span>
                    <span>Jun 19</span>
                    <span>Jun 24</span>
                  </div>

                  {/* High Fidelity interactive floating tooltip */}
                  {hoveredChartIndex !== null && (() => {
                    const dataPoints = [
                      { date: 'May 25, 2026', visitors: '14,820', downloads: '3,110' },
                      { date: 'May 30, 2026', visitors: '16,210', downloads: '3,340' },
                      { date: 'Jun 04, 2026', visitors: '19,500', downloads: '3,890' },
                      { date: 'Jun 09, 2026', visitors: '21,800', downloads: '4,100' },
                      { date: 'Jun 14, 2026', visitors: '20,400', downloads: '3,950' },
                      { date: 'Jun 19, 2026', visitors: '23,500', downloads: '4,520' },
                      { date: 'Jun 24, 2026', visitors: '24,856', downloads: '5,214' }
                    ];
                    const selectedData = dataPoints[hoveredChartIndex];
                    const leftPos = `${5 + hoveredChartIndex * 14.5}%`;
                    return (
                      <div 
                        className="absolute bg-[#0f121d] border border-white/10 rounded-xl p-3 shadow-2xl z-20 text-[11px] pointer-events-none transform -translate-x-1/2 -translate-y-24"
                        style={{ left: leftPos, top: '45%' }}
                      >
                        <span className="font-mono font-bold text-gray-400 block border-b border-white/5 pb-1 mb-1.5">{selectedData.date}</span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-gray-500 font-medium">Visitors:</span>
                            <span className="font-mono font-extrabold text-purple-400">{selectedData.visitors}</span>
                          </div>
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-gray-500 font-medium">Downloads:</span>
                            <span className="font-mono font-extrabold text-blue-400">{selectedData.downloads}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Doughnut Traffic Source Chart */}
              <div className="p-5 bg-[#111420] border border-white/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Traffic Source</h3>
                  <p className="text-[11px] text-gray-500 mb-6">Unique visitor referrers</p>
                </div>

                <div className="flex items-center justify-center gap-6 my-auto">
                  {/* Doughnut Ring Visual representation */}
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                      {/* Grey background ring */}
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#1d2130" strokeWidth="22" />
                      
                      {/* Direct 45.2% - Purple */}
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#a855f7" strokeWidth="22" 
                        strokeDasharray="439.8" strokeDashoffset="240.9" />
                      
                      {/* Google 28.7% - Blue */}
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#3b82f6" strokeWidth="22" 
                        strokeDasharray="439.8" strokeDashoffset="314.1" transform="rotate(162.7 100 100)" />
                      
                      {/* Social Media 15.8% - Emerald */}
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#10b981" strokeWidth="22" 
                        strokeDasharray="439.8" strokeDashoffset="370.4" transform="rotate(266 100 100)" />
                      
                      {/* Referral 7.1% - Amber */}
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#f59e0b" strokeWidth="22" 
                        strokeDasharray="439.8" strokeDashoffset="408.6" transform="rotate(322.9 100 100)" />

                      {/* Others 3.2% - Grey */}
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#64748b" strokeWidth="22" 
                        strokeDasharray="439.8" strokeDashoffset="425.8" transform="rotate(348.5 100 100)" />
                    </svg>

                    {/* Centered label */}
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-base font-extrabold text-white leading-tight">24,856</span>
                      <span className="text-[9px] text-gray-500 font-medium">Total Visitors</span>
                    </div>
                  </div>

                  {/* Interactive legend values */}
                  <div className="space-y-2.5 text-left flex-1">
                    {[
                      { label: 'Direct', percentage: '45.2%', colorClass: 'bg-purple-500' },
                      { label: 'Google', percentage: '28.7%', colorClass: 'bg-blue-500' },
                      { label: 'Social Media', percentage: '15.8%', colorClass: 'bg-emerald-500' },
                      { label: 'Referral', percentage: '7.1%', colorClass: 'bg-amber-500' },
                      { label: 'Others', percentage: '3.2%', colorClass: 'bg-slate-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.colorClass}`} />
                          <span className="text-gray-400 font-medium">{item.label}</span>
                        </div>
                        <span className="font-mono font-bold text-white">{item.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                  <button 
                    onClick={() => setActiveTab('stats')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>View full analytics</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Websites, Recent Downloads & Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Top Websites */}
              <div className="p-5 bg-[#111420] border border-white/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide mb-1">Top Websites</h3>
                  <p className="text-[11px] text-gray-500 mb-4">Highest driver reference assets</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] text-gray-400">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500">
                          <th className="pb-2 font-semibold">#</th>
                          <th className="pb-2 font-semibold">Website Name</th>
                          <th className="pb-2 font-semibold text-right">Visitors</th>
                          <th className="pb-2 font-semibold text-right">Downloads</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { name: 'TechNova - IT Solutions', visitors: '5,264', downloads: '1,258' },
                          { name: 'EduSmart - LMS Platform', visitors: '4,856', downloads: '1,124' },
                          { name: 'HealthCare Plus', visitors: '3,245', downloads: '685' },
                          { name: 'Foodie - Restaurant', visitors: '2,987', downloads: '542' },
                          { name: 'TravelEase - Booking', visitors: '2,456', downloads: '389' }
                        ].map((site, index) => (
                          <tr key={index} className="hover:text-white transition-colors">
                            <td className="py-2.5 font-mono text-gray-500">{index + 1}</td>
                            <td className="py-2.5 font-semibold truncate max-w-[120px]">{site.name}</td>
                            <td className="py-2.5 text-right font-mono text-gray-300">{site.visitors}</td>
                            <td className="py-2.5 text-right font-mono text-indigo-400">{site.downloads}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-center mt-4">
                  <button 
                    onClick={() => setActiveTab('website-list')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View all websites</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Downloads List */}
              <div className="p-5 bg-[#111420] border border-white/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide mb-1">Recent Downloads</h3>
                  <p className="text-[11px] text-gray-500 mb-4">Latest live software logs</p>

                  <div className="space-y-3">
                    {[
                      { name: 'Rohit Sharma', target: 'TechNova', time: '10:24 AM', colorClass: 'bg-emerald-500/10 text-emerald-400' },
                      { name: 'Sneha Patel', target: 'EduSmart', time: '09:45 AM', colorClass: 'bg-blue-500/10 text-blue-400' },
                      { name: 'Amit Kumar', target: 'HealthCare Plus', time: 'Yesterday', colorClass: 'bg-purple-500/10 text-purple-400' },
                      { name: 'Neha Singh', target: 'Foodie', time: 'Yesterday', colorClass: 'bg-amber-500/10 text-amber-400' },
                      { name: 'Vikram Joshi', target: 'TravelEase', time: 'Jun 23, 2026', colorClass: 'bg-indigo-500/10 text-indigo-400' }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${user.colorClass}`}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-white block leading-none">{user.name}</span>
                            <span className="text-[9px] text-gray-400 block mt-1">Download: <strong className="text-gray-300">{user.target}</strong></span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{user.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-center mt-4">
                  <button 
                    onClick={() => setActiveTab('visitors')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View all downloads</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Stats & Promo upgrade card */}
              <div className="space-y-4">
                {/* Quick Stats List */}
                <div className="p-5 bg-[#111420] border border-white/5 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-white tracking-wide mb-1">Quick Stats</h3>
                  
                  <div className="space-y-2.5">
                    {[
                      { label: 'Today\'s Visitors', value: '1,245', gain: '12.5%', icon: Users },
                      { label: 'Today\'s Downloads', value: '245', gain: '18.3%', icon: Download },
                      { label: 'Today\'s Sales', value: '89', gain: '15.7%', icon: ShoppingCart },
                      { label: 'Today\'s Revenue', value: '$985.00', gain: '17.2%', icon: DollarSign }
                    ].map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2 text-gray-400">
                            <StatIcon className="w-3.5 h-3.5 text-gray-500" />
                            <span>{stat.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-white">{stat.value}</span>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded">↑ {stat.gain}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Promo Card: Need More Power Upgrade */}
                <div className="p-5 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-indigo-500/15 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300" />
                  
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Need More Power?</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed">Upgrade to Premium for advanced analytics, automated billing, and live feedback monitors.</p>
                    </div>

                    <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('billing')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all flex items-center justify-center gap-1"
                  >
                    <span>Upgrade Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create New Panel Form */}
        {activeTab === 'create-panel' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Add-on Panel</h1>
                    <p className="text-xs text-gray-400 font-mono mt-1">Design and publish a new download item card to the main portal instantly.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('stats')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Card Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium VIP Panel, Aim Bot Tool"
                    value={newPanelForm.title}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, title: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Latest Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v1.0.0"
                    value={newPanelForm.version}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, version: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Card Visual Icon & Color Style
                  </label>
                  <select
                    value={newPanelForm.imageUrl}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, imageUrl: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-sans"
                  >
                    <option value="Monitor">Monitor (Blue / PC Theme)</option>
                    <option value="Smartphone">Smartphone (Purple / Mobile Theme)</option>
                    <option value="Gift">Gift Box (Emerald / Free Promo Theme)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    File Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15.4 MB"
                    value={newPanelForm.fileSize}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, fileSize: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Last Updated Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. June 30, 2026"
                    value={newPanelForm.lastUpdated}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, lastUpdated: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Features List (Comma-Separated string)
                  </label>
                  <input
                    type="text"
                    placeholder="Feature 1, Feature 2, Feature 3"
                    value={newPanelForm.featuresString}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, featuresString: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Card Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A descriptive introduction of the software panel..."
                    value={newPanelForm.description}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, description: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Download Destination Link / Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /uploads/your_app.zip or https://mega.nz/..."
                    value={newPanelForm.downloadUrl}
                    onChange={(e) => setNewPanelForm({ ...newPanelForm, downloadUrl: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs outline-none font-mono"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-1.5 block">Paste any external address (MEGA, Drive) or perform an upload below to inject a direct local server path automatically.</span>
                </div>

                {/* Direct Upload tool block */}
                <div className="sm:col-span-2 p-5 bg-black/25 border border-dashed border-white/15 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h5 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono">Upload physical file to local server</h5>
                    <p className="text-[11px] text-gray-400">Directly upload executable, APK, or zip files. Bypasses external host requirements.</p>
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      id="new-panel-file-uploader"
                      className="hidden"
                      onChange={handleNewPanelFileUpload}
                      disabled={actionLoading}
                    />
                    <label
                      htmlFor="new-panel-file-uploader"
                      className="cursor-pointer px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center gap-2 select-none"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{newPanelUploadProgress ? 'Uploading...' : 'Select File'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Progress feedback */}
              {newPanelUploadProgress && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-mono animate-pulse">
                  {newPanelUploadProgress}
                </div>
              )}

              {/* Actions footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <button
                  onClick={() => setActiveTab('stats')}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/5 transition-all duration-150"
                >
                  Discard Changes
                </button>

                <button
                  onClick={() => handleCreateCustomPanel()}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all duration-150 select-none"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Publish Add-on Panel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Panels Configs Tab (PC, Mobile, Free, Custom Add-ons) */}
        {panels && panels[activeTab] && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  {panels[activeTab].imageUrl === 'Monitor' || panels[activeTab].id === 'pc' ? <Monitor className="w-6 h-6 text-blue-400" /> :
                   panels[activeTab].imageUrl === 'Smartphone' || panels[activeTab].id === 'mobile' ? <Smartphone className="w-6 h-6 text-purple-400" /> :
                   <Gift className="w-6 h-6 text-emerald-400" />}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    {panels[activeTab].title} Management
                  </h1>
                  <p className="text-xs text-gray-400 font-mono mt-1">Configure downloads, versioning, features, and assets instantly</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              {/* Enabled toggle */}
              <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                <div>
                  <h4 className="text-sm font-semibold text-white">Enable Card Download Functionality</h4>
                  <p className="text-xs text-gray-400">Toggle whether this download button is enabled on the portal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={panelForms[activeTab]?.enabled || false}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], enabled: e.target.checked }
                    })}
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Card Title
                  </label>
                  <input
                    type="text"
                    required
                    value={panelForms[activeTab]?.title || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], title: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Latest Version
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v2.5.1"
                    value={panelForms[activeTab]?.version || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], version: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Card Visual Icon & Color Style
                  </label>
                  <select
                    value={panelForms[activeTab]?.imageUrl || 'Gift'}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], imageUrl: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-sans"
                  >
                    <option value="Monitor">Monitor (Blue / PC Theme)</option>
                    <option value="Smartphone">Smartphone (Purple / Mobile Theme)</option>
                    <option value="Gift">Gift Box (Emerald / Free Promo Theme)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Card Description
                  </label>
                  <textarea
                    rows={2}
                    value={panelForms[activeTab]?.description || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], description: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    File Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15.4 MB"
                    value={panelForms[activeTab]?.fileSize || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], fileSize: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Last Updated Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. June 25, 2026"
                    value={panelForms[activeTab]?.lastUpdated || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], lastUpdated: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Features List (Comma-Separated string)
                  </label>
                  <input
                    type="text"
                    placeholder="FPS Overlay, Instant Injector, Anti-Ban Protection"
                    value={panelForms[activeTab]?.featuresString || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], featuresString: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-sans"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-1.5 block">Separate each highlight feature with a comma. Single features are styled with custom bullet icons.</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Download Destination Link / Path
                  </label>
                  <input
                    type="text"
                    value={panelForms[activeTab]?.downloadUrl || ''}
                    onChange={(e) => setPanelForms({
                      ...panelForms,
                      [activeTab]: { ...panelForms[activeTab], downloadUrl: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs outline-none font-mono"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-1.5 block">Paste any external address (MEGA, Drive) or perform an upload below to inject a direct local server path automatically.</span>
                </div>

                {/* Direct Upload tool block */}
                <div className="sm:col-span-2 p-5 bg-black/25 border border-dashed border-white/15 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h5 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono">Upload physical file to local server</h5>
                    <p className="text-[11px] text-gray-400">Directly upload executable, APK, or zip files. Bypasses external host requirements.</p>
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      id={`file-uploader-${activeTab}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, activeTab as any)}
                      disabled={actionLoading}
                    />
                    <label
                      htmlFor={`file-uploader-${activeTab}`}
                      className="cursor-pointer px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center gap-2 select-none"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadProgress ? 'Uploading...' : 'Select File'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Progress feedback */}
              {uploadProgress && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-mono animate-pulse">
                  {uploadProgress}
                </div>
              )}

              {/* Actions footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleDeleteCustomPanel(activeTab, panelForms[activeTab]?.title || 'Panel')}
                  disabled={actionLoading}
                  className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all duration-150 select-none"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Panel</span>
                </button>

                <button
                  onClick={() => handleSavePanel(activeTab)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all duration-150 select-none"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Save Configuration Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Branding & Setup Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Website Branding & Options</h1>
              <p className="text-xs text-gray-400 font-mono mt-1">Configure global title, banners, footer notes, and messaging tags</p>
            </div>

            <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Portal Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.websiteName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Dynamic Footer Legal Notice
                  </label>
                  <input
                    type="text"
                    value={settingsForm.footerText || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Logo Image Link / Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/uploads/logo_image.png"
                      value={settingsForm.logoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs outline-none font-mono"
                    />
                    <input
                      type="file"
                      id="logo-image-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'branding_logo')}
                    />
                    <label
                      htmlFor="logo-image-upload"
                      className="cursor-pointer bg-white/5 border border-white/10 text-xs px-3 rounded-xl flex items-center hover:bg-white/10 shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Loading Page Logo Image Link / Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/uploads/loading_logo.png (or leave blank to use original Titan Logo)"
                      value={settingsForm.loadingLogoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, loadingLogoUrl: e.target.value })}
                      className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs outline-none font-mono"
                    />
                    <input
                      type="file"
                      id="loading-logo-image-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'branding_loading_logo')}
                    />
                    <label
                      htmlFor="loading-logo-image-upload"
                      className="cursor-pointer bg-white/5 border border-white/10 text-xs px-3 rounded-xl flex items-center hover:bg-white/10 shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-wider">
                    Upload an image or input a custom link for the loading page. Leave empty to use the default high-quality vector Titan Panel logo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Hero Banner Cover Link / Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. /uploads/banner.jpg"
                      value={settingsForm.bannerUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerUrl: e.target.value })}
                      className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs outline-none font-mono"
                    />
                    <input
                      type="file"
                      id="banner-image-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'branding_banner')}
                    />
                    <label
                      htmlFor="banner-image-upload"
                      className="cursor-pointer bg-white/5 border border-white/10 text-xs px-3 rounded-xl flex items-center hover:bg-white/10 shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider mb-4 border-b border-white/5 pb-2">Support & Social Handles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        GitHub Link
                      </label>
                      <input
                        type="url"
                        value={settingsForm.socialLinks?.github || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, github: e.target.value }
                        })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        Discord Server URL
                      </label>
                      <input
                        type="url"
                        value={settingsForm.socialLinks?.discord || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, discord: e.target.value }
                        })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        Twitter Profile URL
                      </label>
                      <input
                        type="url"
                        value={settingsForm.socialLinks?.twitter || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, twitter: e.target.value }
                        })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        Telegram Group Link
                      </label>
                      <input
                        type="url"
                        value={settingsForm.socialLinks?.telegram || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, telegram: e.target.value }
                        })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider mb-4 border-b border-white/5 pb-2">Direct Contact Form Channels</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        Support Email Address
                      </label>
                      <input
                        type="email"
                        value={settingsForm.contactEmail || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        Direct Support Telegram Handle
                      </label>
                      <input
                        type="url"
                        value={settingsForm.contactTelegram || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactTelegram: e.target.value })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        Direct Support WhatsApp Handle
                      </label>
                      <input
                        type="url"
                        value={settingsForm.contactWhatsApp || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactWhatsApp: e.target.value })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase font-mono mb-1.5">
                        WhatsApp Group Link
                      </label>
                      <input
                        type="url"
                        value={settingsForm.contactWhatsAppGroup || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactWhatsAppGroup: e.target.value })}
                        className="w-full p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Adsterra Monetization Ad Codes */}
                <div className="sm:col-span-2 border-t border-white/5 pt-6 mt-6">
                  <h3 className="text-sm font-bold font-mono uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-wider mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Adsterra Monetization & Ad Codes
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">
                    Configure your HTML ad codes, script tags, or banner link URLs below. These ads will display across designated locations on the homepage.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        Header Banner Ad Code / URL
                      </label>
                      <textarea
                        rows={4}
                        value={settingsForm.adHeaderCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adHeaderCode: e.target.value })}
                        placeholder="Paste your HTML script or link (e.g. https://adsterra.com/...)"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        Footer Banner Ad Code / URL
                      </label>
                      <textarea
                        rows={4}
                        value={settingsForm.adFooterCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adFooterCode: e.target.value })}
                        placeholder="Paste your HTML script or link (e.g. https://adsterra.com/...)"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        PC Card Banner Ad Code / URL
                      </label>
                      <textarea
                        rows={4}
                        value={settingsForm.adPcBannerCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adPcBannerCode: e.target.value })}
                        placeholder="Paste your HTML script or link"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        Mobile Card Banner Ad Code / URL
                      </label>
                      <textarea
                        rows={4}
                        value={settingsForm.adMobileBannerCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adMobileBannerCode: e.target.value })}
                        placeholder="Paste your HTML script or link"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs font-mono outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        Free Card Banner Ad Code / URL
                      </label>
                      <textarea
                        rows={4}
                        value={settingsForm.adFreeBannerCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adFreeBannerCode: e.target.value })}
                        placeholder="Paste your HTML script or link"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Google AdSense Integration & Verification */}
                <div className="sm:col-span-2 border-t border-white/5 pt-6 mt-6">
                  <h3 className="text-sm font-bold font-mono uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 tracking-wider mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" /> Google AdSense Verification & Integration
                  </h3>
                  <p className="text-xs text-gray-400 mb-6 font-sans">
                    Verify site ownership and activate Google AdSense ads. Paste your auto-ad codes, meta tags, and root ads.txt snippet below to authorize monetization.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* AdSense Code Snippet */}
                    <div className="md:col-span-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                          AdSense Code Snippet
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Header Code</span>
                      </div>
                      <textarea
                        rows={6}
                        value={settingsForm.adsenseCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adsenseCode: e.target.value })}
                        placeholder="<!-- Google AdSense Auto-Ads Code -->&#10;<script async src=&quot;https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx&quot; crossorigin=&quot;anonymous&quot;></script>"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 text-white text-xs font-mono outline-none resize-none leading-relaxed"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1.5 block leading-normal">
                        Insert the raw JS verification or auto-ads script snippet. It is automatically injected into the page head.
                      </span>
                    </div>

                    {/* Meta Tag Verification */}
                    <div className="md:col-span-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                          Ownership Meta Tag
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Site Verify</span>
                      </div>
                      <textarea
                        rows={6}
                        value={settingsForm.metaTag || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, metaTag: e.target.value })}
                        placeholder="<!-- AdSense/Google Verification Meta Tag -->&#10;<meta name=&quot;google-adsense-account&quot; content=&quot;ca-pub-xxxxxxxxxxxxxxxx&quot;>"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 text-white text-xs font-mono outline-none resize-none leading-relaxed"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1.5 block leading-normal">
                        Paste the full HTML meta tag supplied by AdSense or Google Search Console to prove site ownership.
                      </span>
                    </div>

                    {/* Ads.txt Content */}
                    <div className="md:col-span-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                          Ads.txt File Content
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">ads.txt</span>
                      </div>
                      <textarea
                        rows={6}
                        value={settingsForm.adsTxt || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adsTxt: e.target.value })}
                        placeholder="google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0"
                        className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 text-white text-xs font-mono outline-none resize-none leading-relaxed"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1.5 block leading-normal">
                        Enter your ads.txt records line by line. These will be served dynamically on your root path at <code className="text-gray-300">/ads.txt</code>.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 30+ Colors & 15 Effects Designer Panel */}
                <div className="sm:col-span-2 border-t border-white/5 pt-6 mt-6">
                  <h3 className="text-sm font-bold font-mono uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-wider mb-2">
                    Visual Branding & Interactive Effects Designer
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">
                    Meticulously custom style your portal with 32 hand-designed theme presets, 5 individual hex color pickers, and 15 interactive background animations.
                  </p>

                  <div className="space-y-6">
                    {/* Part 1: Interactive Effects (10 to 15 effects recommended) */}
                    <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold font-mono uppercase text-gray-300 tracking-wide flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-indigo-400" />
                        1. Select Interactive Background Effect
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Select from 15 premium background animations. They dynamically render client-side on HTML5 Canvas to provide immersive user experiences.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { id: 'none', name: 'Simple Calm', desc: 'Minimalist static view showing theme colors with zero canvas animation' },
                          { id: 'matrix', name: 'Matrix Digital Rain', desc: 'Glowing digital code characters falling vertically' },
                          { id: 'cyber-grid', name: 'Tron Cyber Grid', desc: 'Futuristic 3D scrolling vector grid perspective' },
                          { id: 'starfield', name: 'Cosmic Starfield', desc: 'Hyperspace parallax starfield warp speed' },
                          { id: 'aurora', name: 'Aurora Borealis', desc: 'Dreamy, slow-morphing colorful gas clouds' },
                          { id: 'scanlines', name: 'CRT Scanlines', desc: 'Retro CRT scanlines and television signal static noise' },
                          { id: 'sine-waves', name: 'Math Sine Waves', desc: 'Hypnotic layered trigonometric wave curves' },
                          { id: 'snow', name: 'Snowy Blizzard', desc: 'Gentle winter snowflakes drifting down from the sky' },
                          { id: 'constellation', name: 'Constellation Mesh', desc: 'Interactive floating nodes connecting together automatically' },
                          { id: 'neon-rings', name: 'Ripple Rings', desc: 'Pulsing circular water ripples expanding outward' },
                          { id: 'bubbles', name: 'Bubble Drift', desc: 'Translucent glass bubbles floating upwards' },
                          { id: 'honeycomb', name: 'Honeycomb Tech', desc: 'Glowing cybernetic hexagonal outline grid overlays' },
                          { id: 'vaporwave', name: 'Vaporwave Sunset', desc: 'Retro outrun grid floor scroll with neon pink rising sun' },
                          { id: 'fireflies', name: 'Firefly Forest', desc: 'Glowing golden firefly orbs floating in empty space' },
                          { id: 'glitch', name: 'Glitch Scan', desc: 'High-tech digital chromatic aberration and scanline blocks' }
                        ].map((eff) => (
                          <button
                            key={eff.id}
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, activeEffect: eff.id })}
                            className={`p-3 rounded-lg text-left border transition-all duration-150 relative overflow-hidden group select-none ${
                              settingsForm.activeEffect === eff.id
                                ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                                : 'bg-slate-950/60 border-white/5 text-gray-300 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono tracking-wide">{eff.name}</span>
                              {settingsForm.activeEffect === eff.id && (
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 leading-normal leading-relaxed">{eff.desc}</p>
                          </button>
                        ))}
                      </div>

                      {/* Effect Intensity slider */}
                      {settingsForm.activeEffect !== 'none' && (
                        <div className="pt-3 border-t border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold font-mono uppercase text-gray-400">
                              Effect Movement Speed & Particle Count Intensity
                            </label>
                            <span className="text-xs font-bold font-mono text-indigo-400">
                              {settingsForm.effectIntensity ?? 50}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={settingsForm.effectIntensity ?? 50}
                            onChange={(e) => setSettingsForm({ ...settingsForm, effectIntensity: parseInt(e.target.value) })}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <p className="text-[9px] text-gray-500 font-mono">
                            Adjust the rendering speed, density, and particle scale parameters on-the-fly.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Part 2: 32 Premium Theme Color Presets */}
                    <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold font-mono uppercase text-gray-300 tracking-wide flex items-center gap-2">
                        <Gift className="w-4 h-4 text-emerald-400" />
                        2. Select a Color Theme Preset (32 Custom Options)
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Choose from 32 professional pre-selected color schemes. Selecting a preset instantly updates the primary, secondary, and accent colors.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1 border border-white/5 rounded-xl p-2 bg-slate-950/40">
                        {THEME_PRESETS.map((p) => {
                          const isSelected = settingsForm.activeTheme === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSettingsForm({
                                ...settingsForm,
                                activeTheme: p.id,
                                customPrimary: p.primary,
                                customSecondary: p.secondary,
                                customAccent: p.accent,
                                customBg: p.bg,
                                customCardBg: p.cardBg
                              })}
                              className={`p-2.5 rounded-lg text-left border transition-all duration-150 relative select-none ${
                                isSelected
                                  ? 'bg-emerald-500/10 border-emerald-500/60 text-white'
                                  : 'bg-slate-950/50 border-white/5 text-gray-300 hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold truncate pr-1">{p.name}</span>
                                {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                              </div>
                              {/* Color Dots Previews */}
                              <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: p.primary }} title="Primary Accent" />
                                <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: p.secondary }} title="Secondary Accent" />
                                <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: p.accent }} title="Detail Color" />
                                <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: p.bg }} title="Background" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Part 3: Individual Custom Hex Colors (Custom Palette Fine-tuning) */}
                    <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold font-mono uppercase text-gray-300 tracking-wide flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" />
                        3. Custom Palette Hex Fine-Tuning
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Individually configure color elements using live pickers or exact hex values to design a completely bespoke layout.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {/* Primary */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold font-mono uppercase text-gray-400">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.customPrimary || '#ec4899'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customPrimary: e.target.value, activeTheme: 'custom' })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={settingsForm.customPrimary || '#ec4899'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customPrimary: e.target.value, activeTheme: 'custom' })}
                              className="w-full p-1 bg-slate-950 border border-white/10 rounded font-mono text-[10px] text-white uppercase outline-none"
                            />
                          </div>
                        </div>

                        {/* Secondary */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold font-mono uppercase text-gray-400">
                            Secondary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.customSecondary || '#06b6d4'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customSecondary: e.target.value, activeTheme: 'custom' })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={settingsForm.customSecondary || '#06b6d4'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customSecondary: e.target.value, activeTheme: 'custom' })}
                              className="w-full p-1 bg-slate-950 border border-white/10 rounded font-mono text-[10px] text-white uppercase outline-none"
                            />
                          </div>
                        </div>

                        {/* Accent */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold font-mono uppercase text-gray-400">
                            Detail Accent
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.customAccent || '#3b82f6'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customAccent: e.target.value, activeTheme: 'custom' })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={settingsForm.customAccent || '#3b82f6'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customAccent: e.target.value, activeTheme: 'custom' })}
                              className="w-full p-1 bg-slate-950 border border-white/10 rounded font-mono text-[10px] text-white uppercase outline-none"
                            />
                          </div>
                        </div>

                        {/* Background */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold font-mono uppercase text-gray-400">
                            Canvas Background
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.customBg || '#020617'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customBg: e.target.value, activeTheme: 'custom' })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={settingsForm.customBg || '#020617'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customBg: e.target.value, activeTheme: 'custom' })}
                              className="w-full p-1 bg-slate-950 border border-white/10 rounded font-mono text-[10px] text-white uppercase outline-none"
                            />
                          </div>
                        </div>

                        {/* Card Background */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold font-mono uppercase text-gray-400">
                            Card Background
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settingsForm.customCardBg || '#0f172a'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customCardBg: e.target.value, activeTheme: 'custom' })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={settingsForm.customCardBg || '#0f172a'}
                              onChange={(e) => setSettingsForm({ ...settingsForm, customCardBg: e.target.value, activeTheme: 'custom' })}
                              className="w-full p-1 bg-slate-950 border border-white/10 rounded font-mono text-[10px] text-white uppercase outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Settings button */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all duration-150 select-none"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Save Portal Branding</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Files Manager Tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Direct Hosted Files</h1>
                <p className="text-xs text-gray-400 font-mono mt-1">Manage physical executable, APK, or zip assets saved directly on the local server</p>
              </div>
              <div>
                <input
                  type="file"
                  id="direct-file-manager-upload"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'free')} // generic file upload triggers fetch sync
                />
                <label
                  htmlFor="direct-file-manager-upload"
                  className="cursor-pointer px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 select-none shadow-lg shadow-indigo-600/15"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Binary File</span>
                </label>
              </div>
            </div>

            <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-gray-400">
                  <thead className="bg-white/5 text-gray-200">
                    <tr>
                      <th className="p-3 rounded-l-lg">Host File Path</th>
                      <th className="p-3">Disk Space Usage</th>
                      <th className="p-3">Published Timestamp</th>
                      <th className="p-3 rounded-r-lg text-right">Server Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {files && files.length > 0 ? (
                      files.map((file, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-white truncate max-w-xs" title={file.filename}>
                            <div className="flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span className="truncate">{file.filename}</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-gray-300">{file.size}</td>
                          <td className="p-3 text-gray-500">{new Date(file.createdAt).toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.origin + file.url);
                                  showAlert('success', 'Full file link copied!');
                                }}
                                className="p-1.5 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                title="Copy full direct server link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.filename)}
                                className="p-1.5 rounded bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                title="Permanently delete file from disk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 italic">No assets uploaded yet. Upload a file above or inside panel managers.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Database Backup & Restore Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">System Backup & Migration</h1>
              <p className="text-xs text-gray-400 font-mono mt-1">Export database settings or restore states via JSON backup scripts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Export Panel */}
              <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 inline-block mb-4">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Export Local Settings</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mb-6">
                    Download a secure JSON file containing all customized titles, versions, feature specs, download parameters, and branding details. Perfect for server migration or backup.
                  </p>
                </div>
                <button
                  onClick={handleBackupDownload}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 select-none shadow-lg shadow-indigo-600/15"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File</span>
                </button>
              </div>

              {/* Import Panel */}
              <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 inline-block mb-4">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Restore Backup Dump</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mb-6">
                    Upload a previously downloaded JSON database backup file to restore settings immediately. Warning: Overwrites all existing parameters instantly.
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    id="db-restore-upload"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestoreUpload}
                    disabled={actionLoading}
                  />
                  <label
                    htmlFor="db-restore-upload"
                    className="cursor-pointer w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 select-none shadow-lg shadow-purple-600/15"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Restore State</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot & Support configuration tab */}
        {activeTab === 'chatbot' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">Chatbot & Support</h1>
              <p className="text-xs text-gray-400 font-mono mt-1">Configure your floating support widget, WhatsApp chatbot, and Telegram helper bot</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Widget controls */}
              <div className="lg:col-span-2 space-y-6">
                <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Floating Support Chatbot Widget</h3>
                      <p className="text-[11px] text-gray-400 mt-1">Toggle the entire floating help circle widget visible on the user dashboard site</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settingsForm.chatbotEnabled !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, chatbotEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        Welcome & Intro Message
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.chatbotWelcomeMessage || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, chatbotWelcomeMessage: e.target.value })}
                        placeholder="Hi! Have any questions or need custom setup support? Reach out directly using our official channels below:"
                        className="w-full p-3.5 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-xs outline-none resize-none leading-relaxed"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1 block">Displays as the introductory message when users expand the chat circle.</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chatbot Control Card */}
                <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">WhatsApp Chatbot</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Integrate 1-on-1 direct support lines</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settingsForm.whatsappBotEnabled !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappBotEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        WhatsApp Phone Number (with Country Code)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234567890 (Exclude '+' sign)"
                        value={settingsForm.whatsappNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 text-white text-xs outline-none"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1.5 block">Format: [CountryCode][AreaCode][Number] without symbols or spacing. E.g., 5511999999999.</span>
                    </div>
                  </div>
                </div>

                {/* Telegram Chatbot Control Card */}
                <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Telegram Helper Bot</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Integrate official Telegram chat bot handles</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settingsForm.telegramBotEnabled !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramBotEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                        Telegram Bot Username / User ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MyAmazingSupportBot"
                        value={settingsForm.telegramUsername || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramUsername: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 text-white text-xs outline-none"
                      />
                      <span className="text-[10px] text-gray-500 font-mono mt-1.5 block">Enter the Telegram Bot username or user handle without the '@' prefix. E.g., panelsupport_bot.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={actionLoading}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all duration-150 select-none cursor-pointer"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Save Chatbot Configurations</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Live Chatbot Preview simulation */}
              <div className="space-y-6">
                <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 lg:sticky lg:top-6">
                  <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Preview Simulation
                  </h3>
                  
                  {settingsForm.chatbotEnabled !== false ? (
                    <div className="w-full rounded-2xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden text-left font-sans">
                      {/* Simulated Header */}
                      <div className="p-3 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-300" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-white tracking-wide">Live Support Chat</h4>
                            <p className="text-[8px] text-indigo-200 font-mono flex items-center gap-1">
                              <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block animate-pulse" /> Support is Online
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Simulated Body */}
                      <div className="p-3.5 space-y-3.5">
                        <div className="text-[10px] text-gray-300 leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                          {settingsForm.chatbotWelcomeMessage || 'Hi! Have any questions or need custom setup support? Reach out directly using our official channels below:'}
                        </div>

                        {/* Simulated Options */}
                        <div className="space-y-2">
                          {settingsForm.telegramBotEnabled !== false && (
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/10">
                                <Send className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-white block">Telegram Support</span>
                                <p className="text-[8px] text-gray-500 truncate">t.me/{settingsForm.telegramUsername || 'panelsupport_bot'}</p>
                              </div>
                            </div>
                          )}

                          {settingsForm.whatsappBotEnabled !== false && (
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-white block">WhatsApp Support</span>
                                <p className="text-[8px] text-gray-500 truncate">wa.me/{settingsForm.whatsappNumber || '1234567890'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Simulated Footer */}
                      <div className="px-3 py-1.5 bg-slate-900/40 border-t border-white/5 text-center">
                        <span className="text-[8px] text-gray-500 font-mono">Typically responds in under 5 minutes</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
                      <AlertTriangle className="w-8 h-8 text-yellow-500/70 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs text-gray-400 font-mono">Support Widget is Disabled</p>
                      <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] mx-auto">Toggle "Floating Support Chatbot Widget" to enable live preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Access Keys Management Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Key className="w-8 h-8 text-indigo-400" />
                  <span>Access Keys Management</span>
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Manage the pool of keys for the Free Download Panel. Keys are claimed by visitors and expire automatically.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateTenKeys}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all duration-150 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Generate 10 Free Keys</span>
                </button>
              </div>
            </div>

            {/* Keys Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  label: 'Total Keys Pool',
                  value: keys.length,
                  icon: Database,
                  colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                },
                {
                  label: 'Active (Unclaimed)',
                  value: keys.filter(k => k.status === 'active').length,
                  icon: Sparkles,
                  colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                },
                {
                  label: 'Claimed (In Use)',
                  value: keys.filter(k => k.status === 'claimed').length,
                  icon: Users,
                  colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                },
                {
                  label: 'Expired Keys',
                  value: keys.filter(k => k.status === 'expired').length,
                  icon: Clock,
                  colorClass: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                }
              ].map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <div key={idx} className="p-4.5 bg-[#111420] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">{card.label}</span>
                      <h3 className="text-xl font-extrabold text-white tracking-tight">{card.value}</h3>
                    </div>
                    <div className={`p-2 rounded-xl border ${card.colorClass}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Key Form */}
              <div className="lg:col-span-1 backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 self-start">
                <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>Add Custom Key</span>
                </h3>
                <form onSubmit={handleAddKey} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                      Access Key String
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SPECIAL-PROMO-KEY"
                      value={newKeyInput}
                      onChange={(e) => setNewKeyInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 select-none cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Add Key to Pool</span>
                  </button>
                </form>
              </div>

              {/* Keys Pool List */}
              <div className="lg:col-span-2 backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wider flex items-center justify-between pb-2 border-b border-white/5">
                  <span>Keys Registry Pool</span>
                  <span className="text-[10px] font-mono font-normal text-gray-400 uppercase tracking-wider">
                    {keys.length} Keys Total
                  </span>
                </h3>

                {keys.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-8 h-8 text-gray-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-gray-400 font-mono">No keys exist in pool.</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Click "Generate 10 Free Keys" above to populate automatically.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          <th className="pb-3 font-semibold text-left">Key String</th>
                          <th className="pb-3 font-semibold text-left">Status</th>
                          <th className="pb-3 font-semibold text-left">Claimed By (IP)</th>
                          <th className="pb-3 font-semibold text-left">Expires At</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-mono">
                        {keys.map((k) => (
                          <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                            {editingKeyId === k.id ? (
                              <>
                                <td className="py-2 text-left">
                                  <input
                                    type="text"
                                    value={editingKeyString}
                                    onChange={(e) => setEditingKeyString(e.target.value)}
                                    className="px-2 py-1 bg-slate-950 border border-white/10 rounded focus:border-indigo-500 text-white outline-none font-mono uppercase text-xs w-full max-w-[200px]"
                                  />
                                </td>
                                <td className="py-2 text-left">
                                  <select
                                    value={editingKeyStatus}
                                    onChange={(e) => setEditingKeyStatus(e.target.value as any)}
                                    className="px-2 py-1 bg-slate-950 border border-white/10 rounded focus:border-indigo-500 text-white outline-none font-mono text-[11px]"
                                  >
                                    <option value="active">ACTIVE</option>
                                    <option value="claimed">CLAIMED</option>
                                    <option value="expired">EXPIRED</option>
                                  </select>
                                </td>
                                <td className="py-2 text-left">
                                  <input
                                    type="text"
                                    placeholder="None"
                                    value={editingKeyClaimedByIp}
                                    onChange={(e) => setEditingKeyClaimedByIp(e.target.value)}
                                    className="px-2 py-1 bg-slate-950 border border-white/10 rounded focus:border-indigo-500 text-white outline-none font-mono text-xs w-full max-w-[120px]"
                                  />
                                </td>
                                <td className="py-2 text-left">
                                  <input
                                    type="datetime-local"
                                    value={editingKeyExpiresAt}
                                    onChange={(e) => setEditingKeyExpiresAt(e.target.value)}
                                    className="px-2 py-1 bg-slate-950 border border-white/10 rounded focus:border-indigo-500 text-white outline-none font-mono text-[11px] w-full max-w-[160px]"
                                  />
                                </td>
                                <td className="py-2 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateKey(k.id)}
                                      className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                                      title="Save Changes"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingKeyId(null)}
                                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 font-bold text-gray-100 select-all tracking-wider text-left">
                                  {k.keyString}
                                </td>
                                <td className="py-3 text-left">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    k.status === 'active' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                      : k.status === 'claimed'
                                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/10'
                                  }`}>
                                    {k.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3 text-gray-400 text-left">
                                  {k.claimedByIp ? (
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[11px] border border-white/5">
                                      {k.claimedByIp}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">-</span>
                                  )}
                                </td>
                                <td className="py-3 text-gray-400 text-[11px] text-left">
                                  {k.expiresAt ? (
                                    <span>{new Date(k.expiresAt).toLocaleString()}</span>
                                  ) : (
                                    <span className="text-gray-600">Never</span>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditingKey(k)}
                                      className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded transition-colors"
                                      title="Edit Access Key"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteKey(k.id, k.keyString)}
                                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                      title="Delete Access Key"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security / Admin Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Credentials Security</h1>
              <p className="text-xs text-gray-400 font-mono mt-1">Configure administrator login names and secure password hashing</p>
            </div>

            <div className="backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8">
              <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    Current Master Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono mb-2">
                    New Master Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all duration-150 select-none"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Update Master Password</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-[#0c0f1d] border border-white/10 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">{confirmDialog.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{confirmDialog.message}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs rounded-xl transition-all cursor-pointer font-mono uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-600/15 transition-all cursor-pointer font-mono uppercase"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
