import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, Database, Shield, Save, Check, Download, AlertTriangle } from 'lucide-react';
import api from '../api/api';

export default function Settings({ user, contacts, opportunities, tasks, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

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
    theme: localStorage.getItem('theme') || 'light',
    compactMode: localStorage.getItem('compactMode') === 'true',
    language: localStorage.getItem('language') || 'it'
  });

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
    localStorage.setItem('theme', appearance.theme);
    localStorage.setItem('compactMode', appearance.compactMode.toString());
    localStorage.setItem('language', appearance.language);
    document.documentElement.setAttribute('data-theme', appearance.theme);
    showSuccess();
  };

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
    { id: 'data', label: 'Dati', icon: <Database size={18} /> }
  ];

  const styles = `
    .settings-container { display: flex; gap: 24px; max-width: 1200px; }
    .settings-sidebar { width: 240px; flex-shrink: 0; }
    .settings-tabs { background: white; border-radius: 16px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .settings-tab { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; width: 100%; text-align: left; font-size: 14px; font-weight: 500; color: #64748b; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .settings-tab:hover { background: #f1f5f9; color: #1e293b; }
    .settings-tab.active { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
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
  `;

  return (
    <div className="settings-container">
      <style>{styles}</style>

      <div className="settings-sidebar">
        <nav className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
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
                    <div className={`theme-option ${appearance.theme === 'light' ? 'active' : ''}`} onClick={() => setAppearance({ ...appearance, theme: 'light' })}>
                      <div className="theme-preview light"></div>
                      <span className="theme-name">Chiaro</span>
                    </div>
                    <div className={`theme-option ${appearance.theme === 'dark' ? 'active' : ''}`} onClick={() => setAppearance({ ...appearance, theme: 'dark' })}>
                      <div className="theme-preview dark"></div>
                      <span className="theme-name">Scuro</span>
                    </div>
                    <div className={`theme-option ${appearance.theme === 'auto' ? 'active' : ''}`} onClick={() => setAppearance({ ...appearance, theme: 'auto' })}>
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
                <div className="settings-footer">
                  <button className="btn btn-primary" onClick={handleSaveAppearance}>
                    <Save size={18} />
                    Salva Preferenze
                  </button>
                </div>
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
