import React, { useState } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, Loader2, Mail, ArrowLeft, Building } from 'lucide-react';
import api from '../api/api';

export default function Login({ onLoginSuccess, mode = 'login', onBack, onSwitchMode, onForgotPassword }) {
  const [isRegister, setIsRegister] = useState(mode === 'register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Inserisci username e password');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(username, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.message || 'Login fallito. Verifica le credenziali.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        email,
        password,
        fullName,
        company
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      // New user - don't set onboarding complete, let them see it
      onLoginSuccess(response.user, true); // true = isNewUser
    } catch (err) {
      setError(err.message || 'Registrazione fallita. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .login-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          animation: float 30s linear infinite;
        }

        @keyframes float {
          from { transform: translateX(0) translateY(0); }
          to { transform: translateX(50px) translateY(50px); }
        }

        .login-branding {
          text-align: center;
          color: white;
          z-index: 1;
        }

        .login-logo {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 800;
          margin: 0 auto 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .login-brand-title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .login-brand-subtitle {
          font-size: 18px;
          opacity: 0.9;
          max-width: 400px;
          line-height: 1.6;
        }

        .login-features {
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          z-index: 1;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-text {
          font-size: 15px;
          font-weight: 500;
        }

        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #f8fafc;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .login-header {
          margin-bottom: 36px;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 15px;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          color: #1e293b;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #64748b;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 12px;
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .login-left {
            display: none;
          }
          .login-right {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .login-right {
            padding: 20px;
          }
          .login-card {
            padding: 32px 24px;
          }
        }
      `}</style>

      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">V</div>
          <h1 className="login-brand-title">VAIB</h1>
          <p className="login-brand-subtitle">
            Il business assistant AI per freelancer e partite IVA forfettarie.
            Gestisci clienti, progetti e fatture parlando.
          </p>
        </div>
        
        <div className="login-features">
          <div className="login-feature">
            <div className="feature-icon">📊</div>
            <span className="feature-text">Dashboard interattiva con KPI in tempo reale</span>
          </div>
          <div className="login-feature">
            <div className="feature-icon">🎯</div>
            <span className="feature-text">Pipeline Kanban drag & drop</span>
          </div>
          <div className="login-feature">
            <div className="feature-icon">👥</div>
            <span className="feature-text">Gestione contatti e opportunità</span>
          </div>
          <div className="login-feature">
            <div className="feature-icon">✅</div>
            <span className="feature-text">Task management integrato</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '20px',
                padding: 0
              }}
            >
              <ArrowLeft size={18} />
              Torna alla home
            </button>
          )}

          <div className="login-header">
            <h2 className="login-title">{isRegister ? 'Crea il tuo account' : 'Bentornato!'} 👋</h2>
            <p className="login-subtitle">
              {isRegister ? 'Inizia a usare VAIB gratuitamente' : 'Accedi al tuo account per continuare'}
            </p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {isRegister ? (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Nome completo *</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mario Rossi"
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Azienda / P.IVA (opzionale)</label>
                <div className="input-wrapper">
                  <Building size={20} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Studio Rossi"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Conferma Password *</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ripeti la password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Registrazione...
                  </>
                ) : (
                  'Crea Account'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username o Email</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Inserisci username o email"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserisci password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </button>

              {!isRegister && onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '16px',
                    textDecoration: 'underline'
                  }}
                >
                  Password dimenticata?
                </button>
              )}
            </form>
          )}

          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              {isRegister ? 'Hai già un account?' : 'Non hai un account?'}{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {isRegister ? 'Accedi' : 'Registrati gratis'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
