/**
 * AI Builder Component
 * Allows users to customize UI via natural language
 */

import React, { useState, useCallback } from 'react';
import {
  Wand2,
  X,
  Loader2,
  Check,
  Undo2,
  RotateCcw,
  Palette,
  Layout,
  Eye,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useUIConfig } from '../context/UIConfigContext';
import api from '../api/api';
import './AIBuilder.css';

// Quick action suggestions
const QUICK_ACTIONS = [
  { icon: Palette, label: 'Tema scuro', prompt: 'Metti il tema scuro' },
  { icon: Palette, label: 'Tema chiaro', prompt: 'Metti il tema chiaro' },
  { icon: Palette, label: 'Blu professionale', prompt: 'Usa un tema blu professionale' },
  { icon: Palette, label: 'Verde nature', prompt: 'Usa una palette verde natura' },
  { icon: Layout, label: 'Più compatto', prompt: 'Rendi l\'interfaccia più compatta' },
  { icon: Layout, label: 'Più spazioso', prompt: 'Rendi l\'interfaccia più spaziosa e ariosa' },
  { icon: Eye, label: 'Minimal', prompt: 'Rendi la dashboard più minimale' },
  { icon: Sparkles, label: 'Moderno', prompt: 'Usa uno stile moderno con angoli arrotondati' },
];

export default function AIBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);

  const { config, updateTheme, reloadConfig, resetConfig } = useUIConfig();
  const [resetting, setResetting] = useState(false);

  // Generate UI modification via AI
  const handleGenerate = useCallback(async (customPrompt = null) => {
    const requestPrompt = customPrompt || prompt;
    if (!requestPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const result = await api.generateUIConfig(requestPrompt, config);

      if (result.success && result.changes) {
        setPreview({
          prompt: requestPrompt,
          changes: result.changes,
          description: result.description,
          originalConfig: { ...config }
        });
      } else {
        setError(result.error || 'Errore nella generazione della configurazione');
      }
    } catch (err) {
      console.error('[AIBuilder] Error:', err);
      setError(err.message || 'Errore di comunicazione con il server');
    } finally {
      setLoading(false);
    }
  }, [prompt, config]);

  // Apply previewed changes
  const handleApply = useCallback(async () => {
    if (!preview?.changes) return;

    setLoading(true);
    try {
      // Save current config to history for undo
      setHistory(prev => [...prev, preview.originalConfig]);

      // Apply theme changes if present
      if (preview.changes.theme) {
        await updateTheme(preview.changes.theme);
      }

      // TODO: Apply other changes (pages, navigation, etc.)
      // For now, reload config to get server-side changes
      await reloadConfig();

      setPreview(null);
      setPrompt('');
    } catch (err) {
      setError('Errore nell\'applicazione delle modifiche');
    } finally {
      setLoading(false);
    }
  }, [preview, updateTheme, reloadConfig]);

  // Undo last change
  const handleUndo = useCallback(async () => {
    if (history.length === 0) return;

    setLoading(true);
    try {
      const previousConfig = history[history.length - 1];
      if (previousConfig.theme) {
        await updateTheme(previousConfig.theme);
      }
      setHistory(prev => prev.slice(0, -1));
    } catch (err) {
      setError('Errore nel ripristino');
    } finally {
      setLoading(false);
    }
  }, [history, updateTheme]);

  // Cancel preview
  const handleCancel = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  // Reset to default config
  const handleReset = useCallback(async () => {
    if (!window.confirm('Vuoi ripristinare la configurazione predefinita? Tutte le personalizzazioni andranno perse.')) {
      return;
    }

    setResetting(true);
    setError(null);
    try {
      const result = await resetConfig();
      if (result.success) {
        setHistory([]);
        setPreview(null);
        setPrompt('');
      } else {
        setError(result.error || 'Errore nel reset');
      }
    } catch (err) {
      setError('Errore nel ripristino della configurazione');
    } finally {
      setResetting(false);
    }
  }, [resetConfig]);

  // Handle quick action
  const handleQuickAction = useCallback((actionPrompt) => {
    setPrompt(actionPrompt);
    handleGenerate(actionPrompt);
  }, [handleGenerate]);

  // Handle keyboard
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  return (
    <>
      {/* Floating Button */}
      <button
        className="ai-builder-trigger"
        onClick={() => setIsOpen(true)}
        title="AI Builder - Personalizza interfaccia"
      >
        <Wand2 size={24} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="ai-builder-overlay" onClick={() => setIsOpen(false)}>
          <div className="ai-builder-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="ai-builder-header">
              <div className="ai-builder-title">
                <Wand2 size={20} />
                <span>AI Builder</span>
              </div>
              <div className="ai-builder-actions">
                {history.length > 0 && (
                  <button
                    className="ai-builder-undo"
                    onClick={handleUndo}
                    disabled={loading}
                    title="Annulla ultima modifica"
                  >
                    <Undo2 size={18} />
                  </button>
                )}
                <button
                  className="ai-builder-close"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="ai-builder-content">
              {/* Quick Actions */}
              <div className="ai-builder-quick-actions">
                <p className="ai-builder-section-label">Azioni rapide</p>
                <div className="ai-builder-quick-grid">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      className="ai-builder-quick-btn"
                      onClick={() => handleQuickAction(action.prompt)}
                      disabled={loading}
                    >
                      <action.icon size={16} />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="ai-builder-prompt-section">
                <p className="ai-builder-section-label">Descrivi cosa vuoi cambiare</p>
                <div className="ai-builder-input-wrapper">
                  <textarea
                    className="ai-builder-input"
                    placeholder="Es: Usa un tema scuro con accenti viola, rendi le card più compatte..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    rows={3}
                  />
                  <button
                    className="ai-builder-generate-btn"
                    onClick={() => handleGenerate()}
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? (
                      <Loader2 size={20} className="spinning" />
                    ) : (
                      <Sparkles size={20} />
                    )}
                    <span>{loading ? 'Generando...' : 'Genera'}</span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="ai-builder-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div className="ai-builder-preview">
                  <p className="ai-builder-section-label">Anteprima modifiche</p>
                  <div className="ai-builder-preview-content">
                    <p className="ai-builder-preview-desc">{preview.description}</p>

                    {preview.changes.theme && (
                      <div className="ai-builder-preview-changes">
                        <span className="ai-builder-preview-label">Tema:</span>
                        <div className="ai-builder-preview-theme">
                          {preview.changes.theme.mode && (
                            <span className="ai-builder-preview-tag">
                              {preview.changes.theme.mode === 'dark' ? 'Scuro' : 'Chiaro'}
                            </span>
                          )}
                          {preview.changes.theme.primaryColor && (
                            <span
                              className="ai-builder-preview-color"
                              style={{ backgroundColor: preview.changes.theme.primaryColor }}
                            />
                          )}
                          {preview.changes.theme.density && (
                            <span className="ai-builder-preview-tag">
                              {preview.changes.theme.density === 'compact' ? 'Compatto' :
                               preview.changes.theme.density === 'comfortable' ? 'Spazioso' : 'Normale'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ai-builder-preview-actions">
                    <button
                      className="ai-builder-cancel-btn"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X size={18} />
                      <span>Annulla</span>
                    </button>
                    <button
                      className="ai-builder-apply-btn"
                      onClick={handleApply}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 size={18} className="spinning" />
                      ) : (
                        <Check size={18} />
                      )}
                      <span>Applica</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Current Config Summary */}
              <div className="ai-builder-current">
                <div className="ai-builder-current-header">
                  <p className="ai-builder-section-label">Configurazione attuale</p>
                  <button
                    className="ai-builder-reset-btn"
                    onClick={handleReset}
                    disabled={loading || resetting}
                    title="Ripristina configurazione predefinita"
                  >
                    {resetting ? (
                      <Loader2 size={14} className="spinning" />
                    ) : (
                      <RotateCcw size={14} />
                    )}
                    <span>Reset</span>
                  </button>
                </div>
                <div className="ai-builder-current-info">
                  <div className="ai-builder-current-item">
                    <span>Tema:</span>
                    <strong>{config?.theme?.mode === 'dark' ? 'Scuro' : 'Chiaro'}</strong>
                  </div>
                  <div className="ai-builder-current-item">
                    <span>Colore primario:</span>
                    <span
                      className="ai-builder-current-color"
                      style={{ backgroundColor: config?.theme?.primaryColor || '#6366f1' }}
                    />
                  </div>
                  <div className="ai-builder-current-item">
                    <span>Densità:</span>
                    <strong>
                      {config?.theme?.density === 'compact' ? 'Compatta' :
                       config?.theme?.density === 'comfortable' ? 'Spaziosa' : 'Normale'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
