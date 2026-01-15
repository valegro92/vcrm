/**
 * VAIB Landing Page - Commercial homepage
 */

import React from 'react';
import {
  Sparkles, Wand2, Target, Users, Receipt, TrendingUp,
  CheckCircle, ArrowRight, MessageCircle, LayoutDashboard,
  Shield, Zap
} from 'lucide-react';

export default function Landing({ onLogin, onRegister }) {
  const styles = `
    .landing {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Navbar */
    .landing-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .landing-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .landing-logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .landing-nav-buttons {
      display: flex;
      gap: 12px;
    }
    .btn-ghost {
      padding: 10px 20px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      background: rgba(0,0,0,0.05);
      color: #0f172a;
    }
    .btn-primary {
      padding: 12px 24px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    /* Hero */
    .landing-hero {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 40px 80px;
      text-align: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 100px;
      color: #7c3aed;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .hero-title {
      font-size: 56px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 24px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero-title span {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 20px;
      color: #64748b;
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.6;
    }
    .hero-cta {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 60px;
    }
    .btn-large {
      padding: 16px 32px;
      font-size: 16px;
    }
    .btn-secondary {
      padding: 16px 32px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #475569;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      border-color: #6366f1;
      color: #6366f1;
    }

    /* Features */
    .landing-features {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 40px;
    }
    .features-header {
      text-align: center;
      margin-bottom: 60px;
    }
    .features-title {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .features-subtitle {
      font-size: 18px;
      color: #64748b;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .feature-card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      transition: all 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    }
    .feature-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .feature-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .feature-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .feature-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .feature-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .feature-icon.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
    .feature-icon.indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
    .feature-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .feature-description {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
    }

    /* AI Section */
    .landing-ai {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 80px 40px;
      margin: 40px;
      border-radius: 32px;
      max-width: 1120px;
      margin-left: auto;
      margin-right: auto;
    }
    .ai-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      color: white;
    }
    .ai-title {
      font-size: 40px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .ai-subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 40px;
      line-height: 1.6;
    }
    .ai-examples {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }
    .ai-example {
      padding: 12px 20px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 100px;
      font-size: 14px;
      color: white;
    }
    .btn-white {
      padding: 16px 32px;
      border: none;
      background: white;
      color: #6366f1;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-white:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    /* Benefits */
    .landing-benefits {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 40px;
    }
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
      text-align: center;
    }
    .benefit-item {
      padding: 24px;
    }
    .benefit-icon {
      width: 48px;
      height: 48px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #10b981;
      margin: 0 auto 16px;
    }
    .benefit-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .benefit-text {
      font-size: 14px;
      color: #64748b;
    }

    /* CTA Final */
    .landing-cta {
      max-width: 800px;
      margin: 0 auto;
      padding: 80px 40px;
      text-align: center;
    }
    .cta-title {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .cta-subtitle {
      font-size: 18px;
      color: #64748b;
      margin-bottom: 32px;
    }

    /* Footer */
    .landing-footer {
      padding: 40px;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .benefits-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-title { font-size: 40px; }
    }
    @media (max-width: 600px) {
      .landing-nav { padding: 16px 20px; }
      .landing-hero { padding: 40px 20px 60px; }
      .hero-title { font-size: 32px; }
      .hero-cta { flex-direction: column; }
      .features-grid { grid-template-columns: 1fr; }
      .benefits-grid { grid-template-columns: 1fr; }
      .landing-ai { margin: 20px; padding: 40px 20px; }
      .ai-title { font-size: 28px; }
    }
  `;

  return (
    <div className="landing">
      <style>{styles}</style>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Sparkles size={22} />
          </div>
          VAIB
        </div>
        <div className="landing-nav-buttons">
          <button className="btn-ghost" onClick={onLogin}>Accedi</button>
          <button className="btn-primary" onClick={onRegister}>
            Prova Gratis
            <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <Wand2 size={16} />
          Il CRM che si adatta parlandoci
        </div>
        <h1 className="hero-title">
          Gestisci la tua attività.<br />
          <span>Parlando.</span>
        </h1>
        <p className="hero-subtitle">
          VAIB è il primo CRM pensato per freelancer e partite IVA forfettarie.
          Personalizza tutto con l'AI, monitora il limite €85.000 e gestisci clienti, progetti e fatture in un unico posto.
        </p>
        <div className="hero-cta">
          <button className="btn-primary btn-large" onClick={onRegister}>
            Inizia Gratis
            <ArrowRight size={20} />
          </button>
          <button className="btn-secondary" onClick={onLogin}>
            Ho già un account
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="features-header">
          <h2 className="features-title">Tutto quello che ti serve</h2>
          <p className="features-subtitle">Un CRM completo, semplice e pensato per te</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple">
              <Wand2 size={28} />
            </div>
            <h3 className="feature-title">AI Builder</h3>
            <p className="feature-description">
              Descrivi come vuoi l'interfaccia e VAIB si adatta. "Tema scuro", "più compatto", "colori verdi" - basta chiedere.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">
              <Target size={28} />
            </div>
            <h3 className="feature-title">Forfettario Tracker</h3>
            <p className="feature-description">
              Monitora in tempo reale il tuo limite €85.000. Alert automatici quando ti avvicini alla soglia.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">
              <Users size={28} />
            </div>
            <h3 className="feature-title">Gestione Contatti</h3>
            <p className="feature-description">
              Clienti, prospect, fornitori. Tutto organizzato con note, storico e valore associato.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">
              <TrendingUp size={28} />
            </div>
            <h3 className="feature-title">Pipeline Vendite</h3>
            <p className="feature-description">
              Visualizza le tue opportunità in stile Kanban. Trascina e rilascia per aggiornare gli stati.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon pink">
              <Receipt size={28} />
            </div>
            <h3 className="feature-title">Fatture & Reminder</h3>
            <p className="feature-description">
              Tieni traccia delle fatture emesse, scadenze e pagamenti. Mai più fatture dimenticate.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon indigo">
              <MessageCircle size={28} />
            </div>
            <h3 className="feature-title">AI Chatbot</h3>
            <p className="feature-description">
              Chiedi quello che vuoi sui tuoi dati. "Quanto ho fatturato?" "Quali task scadono domani?"
            </p>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="landing-ai">
        <div className="ai-content">
          <h2 className="ai-title">La magia dell'AI</h2>
          <p className="ai-subtitle">
            Non perdere tempo con configurazioni complesse.
            Dì a VAIB cosa vuoi e lui si adatta. In tempo reale.
          </p>
          <div className="ai-examples">
            <span className="ai-example">"Tema scuro con blu"</span>
            <span className="ai-example">"Più compatto"</span>
            <span className="ai-example">"Nascondi il calendario"</span>
            <span className="ai-example">"Bordi arrotondati"</span>
          </div>
          <button className="btn-white" onClick={onRegister}>
            Provalo Ora
            <Sparkles size={18} />
          </button>
        </div>
      </section>

      {/* Benefits */}
      <section className="landing-benefits">
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">
              <Zap size={24} />
            </div>
            <h4 className="benefit-title">Setup in 2 minuti</h4>
            <p className="benefit-text">Nessuna configurazione complessa</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <Shield size={24} />
            </div>
            <h4 className="benefit-title">Dati al sicuro</h4>
            <p className="benefit-text">Crittografia e backup automatici</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <LayoutDashboard size={24} />
            </div>
            <h4 className="benefit-title">100% Personalizzabile</h4>
            <p className="benefit-text">Ogni utente ha la sua interfaccia</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <CheckCircle size={24} />
            </div>
            <h4 className="benefit-title">Made for Forfettari</h4>
            <p className="benefit-text">Pensato per le tue esigenze</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="landing-cta">
        <h2 className="cta-title">Pronto a semplificare la tua attività?</h2>
        <p className="cta-subtitle">
          Unisciti ai freelancer che hanno scelto VAIB per gestire il loro business.
        </p>
        <button className="btn-primary btn-large" onClick={onRegister}>
          Inizia Gratis Ora
          <ArrowRight size={20} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 VAIB. Il CRM che si adatta parlandoci.</p>
      </footer>
    </div>
  );
}
