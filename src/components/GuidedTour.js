/**
 * GuidedTour Component for VAIB
 * Interactive tour that guides users through the main features
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ArrowRight, ArrowLeft, CheckCircle,
  TrendingUp, Target, Users, Receipt, MessageCircle, Wand2,
  LayoutDashboard, PieChart
} from 'lucide-react';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Benvenuto in VAIB!',
    description: 'Questa breve guida ti mostrerà le funzionalità principali. In modalità demo hai accesso a dati realistici di un freelancer.',
    icon: LayoutDashboard,
    highlight: null,
    view: null
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'La tua base operativa. Vedi a colpo d\'occhio fatturato, opportunità in corso, task in scadenza e lo stato del tuo limite forfettario €85.000.',
    icon: TrendingUp,
    highlight: '.dashboard-main, .content',
    view: 'dashboard'
  },
  {
    id: 'forfettario',
    title: 'Tracker Forfettario €85K',
    description: 'Monitora in tempo reale quanto hai fatturato e quanto ti resta. Ricevi alert automatici prima di sforare il limite del regime forfettario.',
    icon: PieChart,
    highlight: '.forfettario-card, .forfettario-gauge',
    view: 'dashboard'
  },
  {
    id: 'pipeline',
    title: 'Pipeline Vendite',
    description: 'Visualizza tutte le tue opportunità in stile Kanban. Trascina le card per cambiare stato. Vedi il valore totale per ogni fase.',
    icon: Target,
    highlight: '.pipeline-board, .pipeline-column',
    view: 'pipeline'
  },
  {
    id: 'contacts',
    title: 'Gestione Contatti',
    description: 'Tutti i tuoi clienti e prospect in un posto. Storico, note, valore generato e opportunità collegate.',
    icon: Users,
    highlight: '.contacts-grid, .contact-card',
    view: 'contacts'
  },
  {
    id: 'invoices',
    title: 'Fatture & Pagamenti',
    description: 'Tieni traccia di fatture emesse, pagate e in scadenza. Il totale si aggiorna automaticamente nel tracker forfettario.',
    icon: Receipt,
    highlight: '.invoices-table, .invoice-row',
    view: 'invoices'
  },
  {
    id: 'ai-chat',
    title: 'Assistente AI',
    description: 'Clicca sulla chat in basso a destra. Chiedi cose come "Quanto ho fatturato questo mese?" o "Quali task scadono domani?"',
    icon: MessageCircle,
    highlight: '.ai-chat-button, .ai-chat-fab',
    view: null
  },
  {
    id: 'ai-builder',
    title: 'AI Builder (Personalizzazione)',
    description: 'Dì all\'AI come vuoi il tuo VAIB: "Tema scuro", "Layout compatto", "Nascondi calendario". Si adatta parlando!',
    icon: Wand2,
    highlight: null,
    view: null
  },
  {
    id: 'complete',
    title: 'Pronto per iniziare!',
    description: 'Esplora liberamente la demo. Quando sei pronto, registrati per creare il tuo account e importare i tuoi dati reali.',
    icon: CheckCircle,
    highlight: null,
    view: null
  }
];

export default function GuidedTour({ isActive, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Navigate to the view when step changes
  useEffect(() => {
    if (step.view && onNavigate) {
      onNavigate(step.view);
    }
  }, [currentStep, step.view, onNavigate]);

  // Highlight element when step changes
  useEffect(() => {
    if (!isActive) return;

    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    // Add highlight to current element
    if (step.highlight) {
      setTimeout(() => {
        const selectors = step.highlight.split(', ');
        selectors.forEach(selector => {
          const element = document.querySelector(selector);
          if (element) {
            element.classList.add('tour-highlight');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }, 300);
    }

    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep, isActive, step.highlight]);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      onClose();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  }, [isLastStep, onClose]);

  const prevStep = useCallback(() => {
    if (isFirstStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  }, [isFirstStep]);

  const skipTour = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isActive) return null;

  const StepIcon = step.icon;

  const styles = `
    .guided-tour-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      backdrop-filter: blur(2px);
    }

    .guided-tour-modal {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 20px;
      padding: 28px 32px;
      max-width: 480px;
      width: calc(100% - 48px);
      z-index: 9999;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .tour-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .tour-close:hover {
      background: #f1f5f9;
      color: #64748b;
    }

    .tour-progress {
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .tour-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .tour-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366f1;
      margin-bottom: 20px;
    }

    .tour-content {
      opacity: 1;
      transition: opacity 0.2s;
    }
    .tour-content.animating {
      opacity: 0;
    }

    .tour-step-indicator {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .tour-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .tour-description {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .tour-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .tour-skip {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      cursor: pointer;
      padding: 8px 12px;
    }
    .tour-skip:hover {
      color: #64748b;
    }

    .tour-nav {
      display: flex;
      gap: 10px;
    }

    .tour-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tour-btn-prev {
      background: #f1f5f9;
      border: none;
      color: #475569;
    }
    .tour-btn-prev:hover {
      background: #e2e8f0;
    }
    .tour-btn-prev:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tour-btn-next {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .tour-btn-next:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    /* Highlight styles - injected globally */
    .tour-highlight {
      position: relative;
      z-index: 9997 !important;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 30px rgba(99, 102, 241, 0.2) !important;
      border-radius: 12px;
      animation: tourPulse 2s infinite;
    }

    @keyframes tourPulse {
      0%, 100% {
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 30px rgba(99, 102, 241, 0.2);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.2), 0 0 40px rgba(99, 102, 241, 0.3);
      }
    }

    @media (max-width: 600px) {
      .guided-tour-modal {
        bottom: 16px;
        padding: 24px 20px;
        width: calc(100% - 32px);
      }
      .tour-title {
        font-size: 18px;
      }
      .tour-description {
        font-size: 14px;
      }
      .tour-actions {
        flex-direction: column;
      }
      .tour-nav {
        width: 100%;
        justify-content: space-between;
      }
      .tour-btn {
        flex: 1;
        justify-content: center;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="guided-tour-overlay" onClick={skipTour} />
      <div className="guided-tour-modal">
        <button className="tour-close" onClick={skipTour}>
          <X size={20} />
        </button>

        <div className="tour-progress">
          <div className="tour-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className={`tour-content ${isAnimating ? 'animating' : ''}`}>
          <div className="tour-icon">
            <StepIcon size={28} />
          </div>

          <div className="tour-step-indicator">
            Passo {currentStep + 1} di {tourSteps.length}
          </div>

          <h2 className="tour-title">{step.title}</h2>
          <p className="tour-description">{step.description}</p>

          <div className="tour-actions">
            <button className="tour-skip" onClick={skipTour}>
              Salta tour
            </button>

            <div className="tour-nav">
              <button
                className="tour-btn tour-btn-prev"
                onClick={prevStep}
                disabled={isFirstStep}
              >
                <ArrowLeft size={18} />
                Indietro
              </button>

              <button className="tour-btn tour-btn-next" onClick={nextStep}>
                {isLastStep ? 'Inizia!' : 'Avanti'}
                {!isLastStep && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
