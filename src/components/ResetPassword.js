import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/api';

export default function ResetPassword({ token, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      await api.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Errore durante il reset');
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .reset-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 20px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .reset-card {
      background: white;
      border-radius: 20px;
      padding: 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    .reset-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .reset-logo {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: 800;
      margin: 0 auto 20px;
    }
    .reset-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .reset-subtitle {
      font-size: 15px;
      color: #64748b;
      line-height: 1.5;
    }
    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .input-group {
      position: relative;
    }
    .input-group svg:first-child {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
    .input-group input {
      width: 100%;
      padding: 14px 44px 14px 44px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.2s;
      outline: none;
      background: #f8fafc;
    }
    .input-group input:focus {
      border-color: #6366f1;
      background: white;
    }
    .toggle-password {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
    }
    .reset-button {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .reset-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
    }
    .reset-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .success-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 16px;
      border-radius: 10px;
      font-size: 14px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-align: left;
    }
    .spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div className="reset-page">
      <style>{styles}</style>

      <div className="reset-card">
        <div className="reset-header">
          <div className="reset-logo">V</div>
          <h1 className="reset-title">Reimposta password</h1>
          <p className="reset-subtitle">
            Inserisci la tua nuova password.
          </p>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success ? (
          <div className="success-box">
            <CheckCircle size={20} />
            <div>
              <strong>Password aggiornata!</strong>
              <p style={{ marginTop: '4px', opacity: 0.9 }}>
                Verrai reindirizzato al login...
              </p>
            </div>
          </div>
        ) : (
          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nuova password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Conferma password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="reset-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Aggiornamento...
                </>
              ) : (
                'Aggiorna password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
