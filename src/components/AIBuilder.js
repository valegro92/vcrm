/**
 * AI Builder Component - Conversational UI Customization
 * Chat-based interface to customize the app via natural language
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Wand2,
  X,
  Loader2,
  Send,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useUIConfig } from '../context/UIConfigContext';
import api from '../api/api';
import './AIBuilder.css';

// Suggestions for first-time users
const SUGGESTIONS = [
  'Metti il tema scuro',
  'Usa un blu professionale',
  'Rendi tutto più compatto',
  'Voglio bordi più arrotondati'
];

export default function AIBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente per personalizzare l\'interfaccia. Dimmi cosa vuoi cambiare, ad esempio "metti il tema scuro" o "usa un colore verde".',
      timestamp: new Date()
    }
  ]);

  const { config, updateTheme, reloadConfig, resetConfig } = useUIConfig();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message and apply changes
  const handleSend = useCallback(async (customMessage = null) => {
    const messageText = customMessage || input.trim();
    if (!messageText || loading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call AI to generate and apply changes
      const result = await api.generateUIConfig(messageText, config);

      if (result.success && result.changes) {
        // Apply theme changes immediately
        if (result.changes.theme) {
          await updateTheme(result.changes.theme);
        }

        // Reload config to sync
        await reloadConfig();

        // Add success message
        const assistantMessage = {
          role: 'assistant',
          content: `✓ ${result.description || 'Modifiche applicate!'} Vuoi cambiare altro?`,
          timestamp: new Date(),
          changes: result.changes
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Add error message
        const errorMessage = {
          role: 'assistant',
          content: `Mi dispiace, non sono riuscito ad applicare le modifiche. ${result.error || 'Riprova con una descrizione diversa.'}`,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error('[AIBuilder] Error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Si è verificato un errore. Riprova tra qualche momento.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, config, updateTheme, reloadConfig]);

  // Handle keyboard
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Handle suggestion click
  const handleSuggestion = useCallback((suggestion) => {
    handleSend(suggestion);
  }, [handleSend]);

  // Reset config
  const handleReset = useCallback(async () => {
    if (!window.confirm('Vuoi ripristinare la configurazione predefinita?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await resetConfig();
      if (result.success) {
        const resetMessage = {
          role: 'assistant',
          content: '✓ Configurazione ripristinata ai valori predefiniti.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, resetMessage]);
      }
    } catch (err) {
      console.error('[AIBuilder] Reset error:', err);
    } finally {
      setLoading(false);
    }
  }, [resetConfig]);

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Button - LEFT side */}
      <button
        className="ai-builder-trigger"
        onClick={() => setIsOpen(true)}
        title="AI Builder - Personalizza interfaccia"
      >
        <Wand2 size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="ai-builder-overlay" onClick={() => setIsOpen(false)}>
          <div className="ai-builder-chat" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="ai-builder-chat-header">
              <div className="ai-builder-chat-title">
                <Sparkles size={20} />
                <span>AI Builder</span>
              </div>
              <div className="ai-builder-chat-actions">
                <button
                  className="ai-builder-reset-btn"
                  onClick={handleReset}
                  disabled={loading}
                  title="Reset configurazione"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  className="ai-builder-close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="ai-builder-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`ai-builder-message ${msg.role} ${msg.isError ? 'error' : ''}`}
                >
                  <div className="ai-builder-message-content">
                    {msg.content}
                    {msg.changes?.theme && (
                      <div className="ai-builder-message-changes">
                        {msg.changes.theme.primaryColor && (
                          <span
                            className="ai-builder-color-badge"
                            style={{ backgroundColor: msg.changes.theme.primaryColor }}
                          />
                        )}
                        {msg.changes.theme.mode && (
                          <span className="ai-builder-change-tag">
                            {msg.changes.theme.mode === 'dark' ? '🌙' : '☀️'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="ai-builder-message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="ai-builder-message assistant loading">
                  <div className="ai-builder-message-content">
                    <Loader2 size={16} className="spinning" />
                    <span>Sto applicando le modifiche...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (show only if few messages) */}
            {messages.length <= 2 && !loading && (
              <div className="ai-builder-suggestions">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="ai-builder-suggestion"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Current config indicator */}
            <div className="ai-builder-config-bar">
              <span
                className="ai-builder-config-color"
                style={{ backgroundColor: config?.theme?.primaryColor || '#6366f1' }}
              />
              <span className="ai-builder-config-text">
                {config?.theme?.mode === 'dark' ? 'Scuro' : 'Chiaro'} ·
                {config?.theme?.density === 'compact' ? ' Compatto' :
                 config?.theme?.density === 'comfortable' ? ' Spazioso' : ' Normale'}
              </span>
            </div>

            {/* Input */}
            <div className="ai-builder-input-area">
              <input
                ref={inputRef}
                type="text"
                className="ai-builder-input"
                placeholder="Descrivi cosa vuoi cambiare..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className="ai-builder-send-btn"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <Loader2 size={20} className="spinning" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
