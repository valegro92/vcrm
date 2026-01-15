import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/api';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Errore durante la richiesta');
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .forgot-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 20px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .forgot-card {
      background: white;
      border-radius: 20px;
      padding: 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    .forgot-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .forgot-logo {
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
    .forgot-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .forgot-subtitle {
      font-size: 15px;
      color: #64748b;
      line-height: 1.5;
    }
    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .input-group {
      position: relative;
    }
    .input-group svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
    .input-group input {
      width: 100%;
      padding: 14px 14px 14px 44px;
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
    .forgot-button {
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
    .forgot-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
    }
    .forgot-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
    }
    .back-link:hover {
      color: #6366f1;
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
    <div className="forgot-page">
      <style>{styles}</style>

      <div className="forgot-card">
        <div className="forgot-header">
          <div className="forgot-logo">V</div>
          <h1 className="forgot-title">Password dimenticata?</h1>
          <p className="forgot-subtitle">
            Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
          </p>
        </div>

        {error && (
          <div className="error-box">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success ? (
          <div className="success-box">
            <CheckCircle size={20} />
            <div>
              <strong>Email inviata!</strong>
              <p style={{ marginTop: '4px', opacity: 0.9 }}>
                Se l'indirizzo email esiste nel nostro sistema, riceverai le istruzioni per reimpostare la password.
              </p>
            </div>
          </div>
        ) : (
          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="forgot-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Invio in corso...
                </>
              ) : (
                'Invia istruzioni'
              )}
            </button>
          </form>
        )}

        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} />
          Torna al login
        </button>
      </div>
    </div>
  );
}
