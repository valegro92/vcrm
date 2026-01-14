import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Lock, Bell, Palette, Database, Shield, Save, Check, Download, AlertTriangle, RotateCcw, Wand2, Send, Loader2, Sparkles } from 'lucide-react';
import api from '../api/api';
import { useUIConfig } from '../context/UIConfigContext';

export default function Settings({ user, contacts, opportunities, tasks, onUserUpdate, currentTheme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [resetting, setResetting] = useState(false);

  // UI Config for reset functionality
  const { config, resetConfig, isDefault, updateTheme, reloadConfig } = useUIConfig();

  // AI Builder state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: 'Ciao! Descrivi come vuoi personalizzare l\'interfaccia. Ad esempio: "usa un tema scuro con colori verdi" oppure "nascondi la sezione fatture dalla dashboard".',
      timestamp: new Date()
    }
  ]);
  const aiMessagesEndRef = useRef(null);
  const aiInputRef = useRef(null);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    role: user?.role || 'user'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    dealUpdates: true,
    weeklyReport: false
  });

  const [appearance, setAppearance] = useState({
    theme: currentTheme || 'light',
    compactMode: localStorage.getItem('compactMode') === 'true',
    language: localStorage.getItem('language') || 'it'
  });

  // Sync local state with prop if it changes externally
  useEffect(() => {
    if (currentTheme) {
      setAppearance(prev => ({ ...prev, theme: currentTheme }));
    }
  }, [currentTheme]);

  const loadStats = React.useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setStats({
        contacts: contacts?.length || 0,
        opportunities: opportunities?.length || 0,
        tasks: tasks?.length || 0
      });
    }
  }, [contacts, opportunities, tasks]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const showSuccess = () => {
    setSaved(true);
    setError('');
    setTimeout(() => setSaved(false), 3000);
  };

  const showError = (message) => {
    setError(message);
    setSaved(false);
    setTimeout(() => setError(''), 5000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(profile);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      if (onUserUpdate) onUserUpdate(newUser);
      showSuccess();
    } catch (err) {
      showError(err.message || 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showError('Le password non coincidono');
      return;
    }
    if (passwords.new.length < 6) {
      showError('La password deve essere di almeno 6 caratteri');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(passwords.current, passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      showSuccess();
    } catch (err) {
      showError(err.message || 'Errore durante il cambio password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    showSuccess();
  };

  const handleSaveAppearance = () => {
    // Theme is handled instantly via props
    localStorage.setItem('compactMode', appearance.compactMode.toString());
    localStorage.setItem('language', appearance.language);
    showSuccess();
  };

  const handleResetUIConfig = async () => {
    if (!window.confirm('Sei sicuro di voler ripristinare le impostazioni predefinite dell\'interfaccia?')) {
      return;
    }
    setResetting(true);
    try {
      const result = await resetConfig();
      if (result.success) {
        showSuccess();
        // Refresh the page to apply default theme
        window.location.reload();
      } else {
        showError(result.error || 'Errore durante il reset');
      }
    } catch (err) {
      showError(err.message || 'Errore durante il reset');
    } finally {
      setResetting(false);
    }
  };

  // AI Builder handlers
  const handleAiSend = useCallback(async (customMessage = null) => {
    const messageText = customMessage || aiInput.trim();
    if (!messageText || aiLoading) return;

    const userMessage = { role: 'user', content: messageText, timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const result = await api.generateUIConfig(messageText, config);
      if (result.success && result.changes) {
        if (result.changes.theme) {
          await updateTheme(result.changes.theme);
        }
        await reloadConfig();
        const assistantMessage = {
          role: 'assistant',
          content: `✓ ${result.description || 'Modifiche applicate!'} Vuoi cambiare altro?`,
          timestamp: new Date(),
          changes: result.changes
        };
        setAiMessages(prev => [...prev, assistantMessage]);
      } else {
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: `Non sono riuscito ad applicare le modifiche. ${result.error || 'Riprova con una descrizione diversa.'}`,
          timestamp: new Date(),
          isError: true
        }]);
      }
    } catch (err) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Si è verificato un errore. Riprova tra qualche momento.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, config, updateTheme, reloadConfig]);

  const handleAiKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  }, [handleAiSend]);

  // Auto-scroll AI messages
  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Focus AI input when tab changes
  useEffect(() => {
    if (activeTab === 'personalize') {
      setTimeout(() => aiInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const data = await api.exportData(format);
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        downloadFile(blob, `vcrm-export-${new Date().toISOString().split('T')[0]}.json`);
      } else if (format === 'csv') {
        if (data.data.contacts) {
          const blob = new Blob([data.data.contacts], { type: 'text/csv' });
          downloadFile(blob, `vcrm-contatti-${new Date().toISOString().split('T')[0]}.csv`);
        }
      }
      showSuccess();
    } catch (err) {
      showError('Errore durante esportazione');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const tabs = [
    { id: 'profile', label: 'Profilo', icon: <User size={18} /> },
    { id: 'security', label: 'Sicurezza', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifiche', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Aspetto', icon: <Palette size={18} /> },
    { id: 'personalize', label: 'Personalizza', icon: <Wand2 size={18} />, special: true },
    { id: 'data', label: 'Dati', icon: <Database size={18} /> }
  ];

  const styles = `
    .settings-container { display: flex; gap: 24px; max-width: 1200px; }
    .settings-sidebar { width: 240px; flex-shrink: 0; }
    .settings-tabs { background: white; border-radius: 16px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .settings-tab { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; width: 100%; text-align: left; font-size: 14px; font-weight: 500; color: #64748b; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .settings-tab:hover { background: #f1f5f9; color: #1e293b; }
    .settings-tab.active { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
    .settings-tab.special { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); }
    .settings-tab.special svg { color: #8b5cf6; }
    .settings-tab.special.active { background: linear-gradient(135deg, #8b5cf6, #6366f1); border-color: transparent; }
    .settings-tab.special.active svg { color: white; }
    .settings-main { flex: 1; }
    .settings-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .settings-header { margin-bottom: 32px; }
    .settings-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .settings-description { font-size: 14px; color: #64748b; }
    .settings-form { display: flex; flex-direction: column; gap: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { font-size: 13px; font-weight: 600; color: #374151; }
    .form-input { padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #1e293b; transition: all 0.2s; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
    .form-input:disabled { background: #f1f5f9; cursor: not-allowed; }
    .form-select { padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #1e293b; background: white; cursor: pointer; }
    .toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border-radius: 10px; }
    .toggle-info h4 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
    .toggle-info p { font-size: 13px; color: #64748b; }
    .toggle-switch { position: relative; width: 48px; height: 26px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: 0.3s; border-radius: 26px; }
    .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    input:checked + .toggle-slider { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    input:checked + .toggle-slider:before { transform: translateX(22px); }
    .theme-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .theme-option { padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: center; }
    .theme-option:hover { border-color: #93c5fd; }
    .theme-option.active { border-color: #3b82f6; background: #eff6ff; }
    .theme-preview { width: 40px; height: 40px; border-radius: 8px; margin: 0 auto 8px; }
    .theme-preview.light { background: linear-gradient(135deg, #f8fafc 50%, #e2e8f0 50%); }
    .theme-preview.dark { background: linear-gradient(135deg, #1e293b 50%, #0f172a 50%); }
    .theme-preview.auto { background: linear-gradient(135deg, #f8fafc 25%, #1e293b 25%, #1e293b 50%, #e2e8f0 50%, #e2e8f0 75%, #0f172a 75%); }
    .theme-name { font-size: 13px; font-weight: 600; color: #1e293b; }
    .settings-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; border: none; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; }
    .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
    .success-message { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; color: #15803d; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
    .error-message { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #dc2626; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
    .danger-zone { margin-top: 32px; padding: 24px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; }
    .danger-zone h4 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .danger-zone p { color: #991b1b; font-size: 13px; margin-bottom: 16px; }
    .btn-danger { background: #dc2626; border: none; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-danger:hover { background: #b91c1c; }
    .data-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 20px; background: #f8fafc; border-radius: 12px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .stat-label { font-size: 13px; color: #64748b; }
    .export-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .password-strength { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .password-strength-bar { height: 100%; transition: all 0.3s; }
    .password-strength-bar.weak { width: 33%; background: #ef4444; }
    .password-strength-bar.medium { width: 66%; background: #f59e0b; }
    .password-strength-bar.strong { width: 100%; background: #10b981; }
    @media (max-width: 768px) { .settings-container { flex-direction: column; } .settings-sidebar { width: 100%; } .form-row { grid-template-columns: 1fr; } .data-stats { grid-template-columns: 1fr; } }

    /* AI Builder Chat Styles */
    .ai-chat-container { display: flex; flex-direction: column; height: 500px; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .ai-chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .ai-chat-message { max-width: 85%; display: flex; flex-direction: column; gap: 4px; }
    .ai-chat-message.user { align-self: flex-end; }
    .ai-chat-message.assistant { align-self: flex-start; }
    .ai-chat-message-content { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
    .ai-chat-message.user .ai-chat-message-content { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; border-bottom-right-radius: 4px; }
    .ai-chat-message.assistant .ai-chat-message-content { background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .ai-chat-message.assistant.error .ai-chat-message-content { background: #fef2f2; color: #dc2626; }
    .ai-chat-message-time { font-size: 11px; color: #9ca3af; padding: 0 4px; }
    .ai-chat-message.user .ai-chat-message-time { text-align: right; }
    .ai-chat-message-changes { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .ai-chat-color-badge { width: 20px; height: 20px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.3); }
    .ai-chat-input-area { display: flex; gap: 12px; padding: 16px; background: white; border-top: 1px solid #e2e8f0; }
    .ai-chat-input { flex: 1; padding: 12px 16px; border-radius: 24px; border: 2px solid #e2e8f0; font-size: 14px; outline: none; transition: all 0.2s; }
    .ai-chat-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }
    .ai-chat-send-btn { width: 48px; height: 48px; border-radius: 50%; border: none; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
    .ai-chat-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); }
    .ai-chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ai-suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 16px; background: white; border-top: 1px solid #e2e8f0; }
    .ai-suggestion-btn { padding: 8px 14px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .ai-suggestion-btn:hover { border-color: #8b5cf6; color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
    .ai-config-bar { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(139, 92, 246, 0.05); border-bottom: 1px solid #e2e8f0; }
    .ai-config-color { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .ai-config-text { font-size: 12px; color: #64748b; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;

  return (
    <div className="settings-container">
      <style>{styles}</style>

      <div className="settings-sidebar">
        <nav className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''} ${tab.special ? 'special' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="settings-main">
        <div className="settings-card">
          {saved && (
            <div className="success-message">
              <Check size={18} />
              Modifiche salvate con successo!
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <>
              <div className="settings-header">
                <h2 className="settings-title">Profilo Utente</h2>
                <p className="settings-description">Gestisci le informazioni del tuo account</p>
              </div>
              <form className="settings-form" onSubmit={handleSaveProfile}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input type="text" className="form-input" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} placeholder="Il tuo nome" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="email@esempio.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telefono</label>
                    <input type="tel" className="form-input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+39 ..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Azienda</label>
                    <input type="text" className="form-input" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} placeholder="Nome azienda" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ruolo</label>
                  <input type="text" className="form-input" value={profile.role === 'admin' ? 'Amministratore' : 'Utente'} disabled />
                </div>
                <div className="settings-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setProfile({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '', company: user?.company || '', role: user?.role || 'user' })}>Annulla</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Save size={18} />
                    Salva Modifiche
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div className="settings-header">
                <h2 className="settings-title">Sicurezza</h2>
                <p className="settings-description">Gestisci la password</p>
              </div>
              <form className="settings-form" onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Password Attuale</label>
                  <input type="password" className="form-input" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nuova Password</label>
                    <input type="password" className="form-input" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="••••••••" required minLength={6} />
                    <div className="password-strength">
                      <div className={`password-strength-bar ${passwords.new.length === 0 ? '' : passwords.new.length < 6 ? 'weak' : passwords.new.length < 10 ? 'medium' : 'strong'}`}></div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Conferma Password</label>
                    <input type="password" className="form-input" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" required />
                  </div>
                </div>
                <div className="settings-footer">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Shield size={18} />
                    Aggiorna Password
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className="settings-header">
                <h2 className="settings-title">Notifiche</h2>
                <p className="settings-description">Configura le preferenze di notifica</p>
              </div>
              <div className="settings-form">
                <div className="toggle-group">
                  <div className="toggle-info">
                    <h4>Notifiche Email</h4>
                    <p>Ricevi aggiornamenti via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.emailNotifications} onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-group">
                  <div className="toggle-info">
                    <h4>Promemoria Attività</h4>
                    <p>Ricevi promemoria per le attività in scadenza</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.taskReminders} onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-group">
                  <div className="toggle-info">
                    <h4>Aggiornamenti Opportunità</h4>
                    <p>Notifiche quando cambiano le opportunità</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.dealUpdates} onChange={(e) => setNotifications({ ...notifications, dealUpdates: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-group">
                  <div className="toggle-info">
                    <h4>Report Settimanale</h4>
                    <p>Ricevi un riepilogo settimanale</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notifications.weeklyReport} onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-footer">
                  <button className="btn btn-primary" onClick={handleSaveNotifications}>
                    <Save size={18} />
                    Salva Preferenze
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <div className="settings-header">
                <h2 className="settings-title">Aspetto</h2>
                <p className="settings-description">Personalizza l'aspetto dell'applicazione</p>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Tema</label>
                  <div className="theme-options">
                    <div className={`theme-option ${appearance.theme === 'light' ? 'active' : ''}`} onClick={() => onThemeChange && onThemeChange('light')}>
                      <div className="theme-preview light"></div>
                      <span className="theme-name">Chiaro</span>
                    </div>
                    <div className={`theme-option ${appearance.theme === 'dark' ? 'active' : ''}`} onClick={() => onThemeChange && onThemeChange('dark')}>
                      <div className="theme-preview dark"></div>
                      <span className="theme-name">Scuro</span>
                    </div>
                    <div className={`theme-option ${appearance.theme === 'auto' ? 'active' : ''}`} onClick={() => onThemeChange && onThemeChange('auto')}>
                      <div className="theme-preview auto"></div>
                      <span className="theme-name">Auto</span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Lingua</label>
                  <select className="form-select" value={appearance.language} onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}>
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="toggle-group">
                  <div className="toggle-info">
                    <h4>Modalità Compatta</h4>
                    <p>Riduci lo spazio tra gli elementi</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={appearance.compactMode} onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* AI Builder Reset Section */}
                <div className="ui-config-section" style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Wand2 size={20} style={{ color: '#8b5cf6' }} />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Personalizzazione AI</h4>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    {isDefault
                      ? 'Stai usando le impostazioni predefinite. Usa AI Builder per personalizzare l\'interfaccia.'
                      : 'Hai personalizzato l\'interfaccia tramite AI Builder. Puoi ripristinare le impostazioni predefinite.'}
                  </p>
                  {config?.theme?.primaryColor && !isDefault && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#64748b' }}>
                      <span>Colore attuale:</span>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: config.theme.primaryColor, border: '2px solid rgba(0,0,0,0.1)' }}></div>
                      <span>{config.theme.primaryColor}</span>
                    </div>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={handleResetUIConfig}
                    disabled={resetting || isDefault}
                    style={{ opacity: isDefault ? 0.5 : 1 }}
                  >
                    <RotateCcw size={16} />
                    {resetting ? 'Ripristino...' : 'Ripristina Predefiniti'}
                  </button>
                </div>

                <div className="settings-footer">
                  <button className="btn btn-primary" onClick={handleSaveAppearance}>
                    <Save size={18} />
                    Salva Preferenze
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'personalize' && (
            <>
              <div className="settings-header">
                <h2 className="settings-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                  Personalizza con AI
                </h2>
                <p className="settings-description">
                  Descrivi come vuoi modificare l'interfaccia e l'AI applicherà le modifiche in tempo reale
                </p>
              </div>

              <div className="ai-chat-container">
                {/* Current config indicator */}
                <div className="ai-config-bar">
                  <span className="ai-config-color" style={{ backgroundColor: config?.theme?.primaryColor || '#6366f1' }} />
                  <span className="ai-config-text">
                    {config?.theme?.mode === 'dark' ? 'Tema scuro' : 'Tema chiaro'} ·
                    {config?.theme?.density === 'compact' ? ' Compatto' : config?.theme?.density === 'comfortable' ? ' Spazioso' : ' Normale'}
                  </span>
                  {!isDefault && (
                    <button
                      onClick={handleResetUIConfig}
                      disabled={resetting}
                      style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="ai-chat-messages">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`ai-chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}>
                      <div className="ai-chat-message-content">
                        {msg.content}
                        {msg.changes?.theme && (
                          <div className="ai-chat-message-changes">
                            {msg.changes.theme.primaryColor && (
                              <span className="ai-chat-color-badge" style={{ backgroundColor: msg.changes.theme.primaryColor }} />
                            )}
                            {msg.changes.theme.mode && (
                              <span>{msg.changes.theme.mode === 'dark' ? '🌙' : '☀️'}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="ai-chat-message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="ai-chat-message assistant">
                      <div className="ai-chat-message-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 size={16} className="spinning" />
                        Sto applicando le modifiche...
                      </div>
                    </div>
                  )}
                  <div ref={aiMessagesEndRef} />
                </div>

                {/* Quick suggestions */}
                {aiMessages.length <= 2 && !aiLoading && (
                  <div className="ai-suggestions">
                    {['Tema scuro blu', 'Colori verdi', 'Interfaccia compatta', 'Bordi arrotondati'].map((s, i) => (
                      <button key={i} className="ai-suggestion-btn" onClick={() => handleAiSend(s)}>{s}</button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="ai-chat-input-area">
                  <input
                    ref={aiInputRef}
                    type="text"
                    className="ai-chat-input"
                    placeholder="Es: 'usa colori più caldi' o 'rendi tutto più compatto'..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={handleAiKeyDown}
                    disabled={aiLoading}
                  />
                  <button
                    className="ai-chat-send-btn"
                    onClick={() => handleAiSend()}
                    disabled={aiLoading || !aiInput.trim()}
                  >
                    {aiLoading ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                  </button>
                </div>
              </div>

              {/* Info box */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>💡 Cosa puoi chiedere</h4>
                <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '13px', color: '#64748b', lineHeight: '1.8' }}>
                  <li>Cambiare tema: "tema scuro", "colori blu"</li>
                  <li>Densità: "più compatto", "più spazioso"</li>
                  <li>Stile: "bordi più arrotondati", "stile minimal"</li>
                  <li>Colori: "usa il verde", "colori più caldi"</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'data' && (
            <>
              <div className="settings-header">
                <h2 className="settings-title">Gestione Dati</h2>
                <p className="settings-description">Esporta o gestisci i tuoi dati</p>
              </div>
              <div className="settings-form">
                <div className="data-stats">
                  <div className="stat-card">
                    <div className="stat-value">{stats?.contacts || contacts?.length || 0}</div>
                    <div className="stat-label">Contatti</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats?.opportunities || opportunities?.length || 0}</div>
                    <div className="stat-label">Opportunità</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats?.tasks || tasks?.length || 0}</div>
                    <div className="stat-label">Attività</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Esporta Dati</label>
                  <div className="export-buttons">
                    <button className="btn btn-secondary" onClick={() => handleExport('csv')} disabled={loading}>
                      <Download size={18} />
                      Esporta CSV
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExport('json')} disabled={loading}>
                      <Download size={18} />
                      Esporta JSON
                    </button>
                  </div>
                </div>

                <div className="danger-zone">
                  <h4><AlertTriangle size={18} /> Zona Pericolosa</h4>
                  <p>Queste azioni sono irreversibili. Procedi con cautela.</p>
                  <button className="btn-danger" onClick={() => alert('Funzione disabilitata per sicurezza')}>Elimina tutti i dati</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
