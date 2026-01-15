/**
 * VAIB Onboarding - First-run wizard
 * Guides new users through setup and showcases AI customization
 */

import React, { useState, useCallback } from 'react';
import {
  Sparkles, ArrowRight, ArrowLeft, Check,
  User, Building, Target, Wand2, Send, Loader2,
  LayoutDashboard, Receipt, Users
} from 'lucide-react';
import api from '../api/api';
import { useUIConfig } from '../context/UIConfigContext';

const STEPS = [
  { id: 'welcome', title: 'Benvenuto' },
  { id: 'profile', title: 'Il tuo profilo' },
  { id: 'forfettario', title: 'Regime fiscale' },
  { id: 'ai', title: 'Personalizza' },
  { id: 'ready', title: 'Pronto!' }
];

export default function Onboarding({ user, onComplete, onUserUpdate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);

  const { config, updateTheme, reloadConfig } = useUIConfig();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    company: user?.company || '',
    phone: user?.phone || '',
    forfettarioLimit: 85000,
    currentRevenue: 0,
    fiscalYear: new Date().getFullYear()
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      // Save profile data
      setLoading(true);
      try {
        await api.updateProfile({
          fullName: formData.fullName,
          company: formData.company,
          phone: formData.phone
        });
        if (onUserUpdate) {
          onUserUpdate({ ...user, ...formData });
        }
      } catch (err) {
        console.error('Error saving profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Mark onboarding as complete
      localStorage.setItem('vaib_onboarding_complete', 'true');
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSend = useCallback(async (customMessage = null) => {
    const messageText = customMessage || aiInput.trim();
    if (!messageText || aiLoading) return;

    setAiInput('');
    setAiLoading(true);

    try {
      const result = await api.generateUIConfig(messageText, config);
      if (result.success && result.changes) {
        if (result.changes.theme) {
          await updateTheme(result.changes.theme);
        }
        await reloadConfig();
        setAiApplied(true);
      }
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, config, updateTheme, reloadConfig]);

  const styles = `
    .onboarding-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .onboarding-card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      max-width: 600px;
      width: 100%;
      overflow: hidden;
    }
    .onboarding-progress {
      display: flex;
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      gap: 8px;
    }
    .onboarding-step {
      flex: 1;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      transition: all 0.3s;
    }
    .onboarding-step.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }
    .onboarding-step.completed {
      background: #10b981;
    }
    .onboarding-content {
      padding: 40px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }
    .onboarding-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .onboarding-icon.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1)); color: #8b5cf6; }
    .onboarding-icon.blue { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)); color: #3b82f6; }
    .onboarding-icon.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); color: #10b981; }
    .onboarding-title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .onboarding-subtitle {
      font-size: 16px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .onboarding-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
    }
    .onboarding-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .onboarding-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    .onboarding-input {
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.2s;
      outline: none;
    }
    .onboarding-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }
    .onboarding-footer {
      display: flex;
      justify-content: space-between;
      padding: 24px 40px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .onboarding-btn {
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      border: none;
    }
    .onboarding-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .onboarding-btn-secondary {
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .onboarding-btn-secondary:hover:not(:disabled) {
      background: #f1f5f9;
    }
    .onboarding-btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .onboarding-btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
    .onboarding-highlight {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05));
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 16px;
      padding: 20px;
      margin-top: 16px;
    }
    .onboarding-feature {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .onboarding-feature:last-child {
      border-bottom: none;
    }
    .onboarding-feature-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .onboarding-feature-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .onboarding-feature-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .onboarding-feature-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .onboarding-ai-box {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }
    .onboarding-ai-input {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .onboarding-ai-input input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
    }
    .onboarding-ai-input input:focus {
      border-color: #8b5cf6;
    }
    .onboarding-ai-btn {
      padding: 12px 20px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    .onboarding-ai-btn:disabled {
      opacity: 0.5;
    }
    .onboarding-ai-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .onboarding-ai-suggestion {
      padding: 8px 14px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }
    .onboarding-ai-suggestion:hover {
      border-color: #8b5cf6;
      color: #8b5cf6;
    }
    .onboarding-success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      color: #15803d;
      font-size: 14px;
      margin-top: 12px;
    }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <>
            <div className="onboarding-icon purple">
              <Sparkles size={36} />
            </div>
            <h1 className="onboarding-title">Benvenuto in VAIB</h1>
            <p className="onboarding-subtitle">
              Il CRM che si adatta parlandoci.<br />
              Pensato per freelancer e partite IVA forfettarie come te.
            </p>
            <div style={{ flex: 1 }}>
              <div className="onboarding-feature">
                <div className="onboarding-feature-icon purple">
                  <Wand2 size={22} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Personalizza con l'AI</strong>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Descrivi come vuoi l'interfaccia e VAIB si adatta
                  </p>
                </div>
              </div>
              <div className="onboarding-feature">
                <div className="onboarding-feature-icon green">
                  <Target size={22} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Monitora il forfettario</strong>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Tracking automatico del limite €85.000
                  </p>
                </div>
              </div>
              <div className="onboarding-feature">
                <div className="onboarding-feature-icon blue">
                  <LayoutDashboard size={22} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Tutto in un posto</strong>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Contatti, opportunità, progetti e fatture
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      case 1: // Profile
        return (
          <>
            <div className="onboarding-icon blue">
              <User size={36} />
            </div>
            <h1 className="onboarding-title">Parlaci di te</h1>
            <p className="onboarding-subtitle">
              Queste informazioni ci aiutano a personalizzare la tua esperienza.
            </p>
            <div className="onboarding-form">
              <div className="onboarding-field">
                <label className="onboarding-label">Come ti chiami?</label>
                <input
                  type="text"
                  className="onboarding-input"
                  placeholder="Mario Rossi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="onboarding-field">
                <label className="onboarding-label">Nome attività / P.IVA</label>
                <input
                  type="text"
                  className="onboarding-input"
                  placeholder="Studio Rossi o nome freelance"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="onboarding-field">
                <label className="onboarding-label">Telefono (opzionale)</label>
                <input
                  type="tel"
                  className="onboarding-input"
                  placeholder="+39 333 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </>
        );

      case 2: // Forfettario
        return (
          <>
            <div className="onboarding-icon green">
              <Target size={36} />
            </div>
            <h1 className="onboarding-title">Regime Forfettario</h1>
            <p className="onboarding-subtitle">
              Configuriamo il monitoraggio del tuo limite annuale.
            </p>
            <div className="onboarding-form">
              <div className="onboarding-field">
                <label className="onboarding-label">Limite annuale</label>
                <input
                  type="number"
                  className="onboarding-input"
                  value={formData.forfettarioLimit}
                  onChange={(e) => setFormData({ ...formData, forfettarioLimit: parseInt(e.target.value) || 85000 })}
                />
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Il limite standard è €85.000 per il regime forfettario
                </span>
              </div>
              <div className="onboarding-field">
                <label className="onboarding-label">Fatturato {formData.fiscalYear} (finora)</label>
                <input
                  type="number"
                  className="onboarding-input"
                  placeholder="0"
                  value={formData.currentRevenue}
                  onChange={(e) => setFormData({ ...formData, currentRevenue: parseInt(e.target.value) || 0 })}
                />
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Inserisci quanto hai già fatturato quest'anno
                </span>
              </div>
              <div className="onboarding-highlight">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Budget rimanente</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                    €{(formData.forfettarioLimit - formData.currentRevenue).toLocaleString()}
                  </span>
                </div>
                <div style={{ marginTop: '12px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min((formData.currentRevenue / formData.forfettarioLimit) * 100, 100)}%`,
                      background: formData.currentRevenue / formData.forfettarioLimit > 0.8 ? '#ef4444' : '#10b981',
                      borderRadius: '4px',
                      transition: 'all 0.3s'
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 3: // AI Customization
        return (
          <>
            <div className="onboarding-icon purple">
              <Wand2 size={36} />
            </div>
            <h1 className="onboarding-title">La magia di VAIB</h1>
            <p className="onboarding-subtitle">
              Prova a personalizzare l'interfaccia semplicemente descrivendola.
            </p>
            <div className="onboarding-ai-box">
              <div className="onboarding-ai-input">
                <input
                  type="text"
                  placeholder="Es: tema scuro con colori verdi..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  disabled={aiLoading}
                />
                <button
                  className="onboarding-ai-btn"
                  onClick={() => handleAiSend()}
                  disabled={aiLoading || !aiInput.trim()}
                >
                  {aiLoading ? <Loader2 size={18} className="spinning" /> : <Send size={18} />}
                  Applica
                </button>
              </div>
              <div className="onboarding-ai-suggestions">
                {['Tema scuro', 'Colori verdi', 'Più compatto', 'Bordi arrotondati'].map((s, i) => (
                  <button
                    key={i}
                    className="onboarding-ai-suggestion"
                    onClick={() => handleAiSend(s)}
                    disabled={aiLoading}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {aiApplied && (
                <div className="onboarding-success">
                  <Check size={18} />
                  Modifiche applicate! Guarda come è cambiata l'interfaccia.
                </div>
              )}
            </div>
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
              Puoi sempre modificare l'aspetto da Impostazioni → Personalizza
            </p>
          </>
        );

      case 4: // Ready
        return (
          <>
            <div className="onboarding-icon green">
              <Check size={36} />
            </div>
            <h1 className="onboarding-title">Sei pronto!</h1>
            <p className="onboarding-subtitle">
              VAIB è configurato e pronto per aiutarti a gestire la tua attività.
            </p>
            <div style={{ flex: 1 }}>
              <div className="onboarding-feature">
                <div className="onboarding-feature-icon blue">
                  <Users size={22} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Aggiungi i tuoi contatti</strong>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Clienti, prospect, fornitori - tutti in un posto
                  </p>
                </div>
              </div>
              <div className="onboarding-feature">
                <div className="onboarding-feature-icon green">
                  <Receipt size={22} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Traccia le fatture</strong>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Monitora pagamenti e scadenze
                  </p>
                </div>
              </div>
              <div className="onboarding-feature">
                <div className="onboarding-feature-icon purple">
                  <Sparkles size={22} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Chiedi all'AI</strong>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Usa il chatbot per interrogare i tuoi dati
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-overlay">
      <style>{styles}</style>
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`onboarding-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-content">
          {renderStep()}
        </div>

        <div className="onboarding-footer">
          {currentStep > 0 ? (
            <button className="onboarding-btn onboarding-btn-secondary" onClick={handleBack}>
              <ArrowLeft size={18} />
              Indietro
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              className="onboarding-btn onboarding-btn-primary"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="spinning" /> : 'Continua'}
              {!loading && <ArrowRight size={18} />}
            </button>
          ) : (
            <button
              className="onboarding-btn onboarding-btn-primary"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="spinning" /> : 'Inizia a usare VAIB'}
              {!loading && <ArrowRight size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
