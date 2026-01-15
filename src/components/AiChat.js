import React, { useState, useRef, useEffect } from 'react';
import {
    MessageCircle, X, Send, Sparkles, RefreshCw,
    TrendingUp, FileText, AlertCircle, Calendar,
    Briefcase, CheckSquare, Bot, User, Zap,
    ChevronDown, Loader2
} from 'lucide-react';
import api from '../api/api';

const QUICK_QUERIES = [
    { id: 'fatturato-anno', label: 'Fatturato anno', icon: TrendingUp },
    { id: 'budget-rimasto', label: 'Budget forfettario', icon: FileText },
    { id: 'task-urgenti', label: 'Task urgenti', icon: AlertCircle },
    { id: 'fatture-scadute', label: 'Fatture scadute', icon: Calendar },
    { id: 'pipeline-status', label: 'Pipeline', icon: Briefcase },
    { id: 'progetti-attivi', label: 'Progetti attivi', icon: CheckSquare },
    { id: 'riepilogo-generale', label: 'Riepilogo', icon: Sparkles },
];

// Parse actions from AI response
const parseActions = (message) => {
    const actionRegex = /\[ACTION:(\w+):(\{.*?\})\]/g;
    const actions = [];
    let match;

    while ((match = actionRegex.exec(message)) !== null) {
        try {
            actions.push({
                type: match[1],
                data: JSON.parse(match[2])
            });
        } catch (e) {
            console.error('Failed to parse action:', match[0], e);
        }
    }

    // Remove action tags from message for display
    const cleanMessage = message.replace(actionRegex, '').trim();

    return { actions, cleanMessage };
};

// Process date placeholders
const processDate = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();

    switch (dateStr) {
        case 'TODAY':
            return today.toISOString().split('T')[0];
        case 'TOMORROW':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        case 'NEXT_WEEK':
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek.toISOString().split('T')[0];
        default:
            return dateStr; // Already a date string
    }
};

export default function AiChat({ onCreateContact, onCreateOpportunity, onCreateTask, isDemoMode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Ciao! Sono VAIB, il tuo assistente AI. **Raccontami** cosa succede e popolo io il CRM!\n\n**Esempi:**\n- "Ho parlato con Marco di TechCorp, interessato a un sito da 5000€"\n- "Domani devo chiamare il cliente della pizzeria"\n- "Quanto ho fatturato questo mese?"\n\nCapisco dal contesto e creo contatti, opportunità e task automaticamente!'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showQuickQueries, setShowQuickQueries] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load suggestions when chat opens
    useEffect(() => {
        if (isOpen) {
            loadSuggestions();
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const loadSuggestions = async () => {
        try {
            const data = await api.getChatSuggestions();
            setSuggestions(data.suggestions || []);
        } catch (err) {
            console.error('Error loading suggestions:', err);
        }
    };

    // Execute parsed actions
    const executeActions = (actions) => {
        const results = [];

        for (const action of actions) {
            try {
                switch (action.type) {
                    case 'create_contact':
                        if (onCreateContact) {
                            const contactData = {
                                name: action.data.name,
                                email: action.data.email || '',
                                phone: action.data.phone || '',
                                company: action.data.company || '',
                                status: action.data.status || 'Lead',
                                notes: action.data.notes || ''
                            };
                            onCreateContact(contactData);
                            results.push({ success: true, type: 'contact', name: action.data.name });
                        }
                        break;

                    case 'create_opportunity':
                        if (onCreateOpportunity) {
                            const oppData = {
                                title: action.data.title,
                                company: action.data.company || '',
                                value: action.data.value || 0,
                                stage: action.data.stage || 'Lead',
                                expectedClose: processDate(action.data.expectedClose) || '',
                                notes: action.data.notes || ''
                            };
                            onCreateOpportunity(oppData);
                            results.push({ success: true, type: 'opportunity', name: action.data.title });
                        }
                        break;

                    case 'create_task':
                        if (onCreateTask) {
                            const taskData = {
                                title: action.data.title,
                                description: action.data.description || '',
                                dueDate: processDate(action.data.dueDate) || '',
                                priority: action.data.priority || 'Media',
                                contactName: action.data.contactName || ''
                            };
                            onCreateTask(taskData);
                            results.push({ success: true, type: 'task', name: action.data.title });
                        }
                        break;

                    default:
                        console.warn('Unknown action type:', action.type);
                }
            } catch (err) {
                console.error('Error executing action:', action, err);
                results.push({ success: false, type: action.type, error: err.message });
            }
        }

        return results;
    };

    const sendMessage = async (messageText) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setShowQuickQueries(false);

        try {
            // Build conversation history for context
            const conversationHistory = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await api.sendChatMessage(messageText, conversationHistory);

            // Parse actions from response
            const { actions, cleanMessage } = parseActions(response.message);

            // Execute any actions found
            if (actions.length > 0) {
                const results = executeActions(actions);
                console.log('Executed actions:', results);
            }

            const assistantMessage = {
                role: 'assistant',
                content: cleanMessage || response.message,
                model: response.model,
                hadActions: actions.length > 0
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Mi dispiace, si è verificato un errore. Riprova tra qualche momento.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuery = async (queryId) => {
        const query = QUICK_QUERIES.find(q => q.id === queryId);
        if (!query || isLoading) return;

        const queryLabels = {
            'fatturato-anno': 'Quanto ho fatturato quest\'anno?',
            'budget-rimasto': 'Quanto budget forfettario mi rimane?',
            'task-urgenti': 'Quali sono i task più urgenti?',
            'fatture-scadute': 'Ho fatture scadute?',
            'pipeline-status': 'Com\'è la mia pipeline?',
            'progetti-attivi': 'Quali progetti ho attivi?',
            'riepilogo-generale': 'Dammi un riepilogo della situazione'
        };

        const userMessage = { role: 'user', content: queryLabels[queryId] };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setShowQuickQueries(false);

        try {
            const response = await api.sendQuickQuery(queryId);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.message,
                model: response.model
            }]);

        } catch (error) {
            console.error('Quick query error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Mi dispiace, si è verificato un errore. Riprova.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: 'Pronto! Raccontami cosa sta succedendo nel tuo business e popolo il CRM per te.'
        }]);
        setShowQuickQueries(true);
    };

    const formatMessage = (content) => {
        // Simple markdown-like formatting
        return content
            .split('\n')
            .map((line, i) => {
                // Bold
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Lists
                if (line.startsWith('- ')) {
                    return `<li key="${i}">${line.substring(2)}</li>`;
                }
                // Headers
                if (line.startsWith('### ')) {
                    return `<h4 key="${i}" class="chat-heading">${line.substring(4)}</h4>`;
                }
                if (line.startsWith('## ')) {
                    return `<h3 key="${i}" class="chat-heading">${line.substring(3)}</h3>`;
                }
                return line ? `<p key="${i}">${line}</p>` : '<br/>';
            })
            .join('');
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                className={`ai-chat-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Assistente AI"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && suggestions.length > 0 && (
                    <span className="ai-chat-badge">{suggestions.length}</span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-chat-header-info">
                            <div className="ai-chat-avatar">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3>Assistente VAIB</h3>
                                <span className="ai-chat-status">
                                    <Zap size={10} /> AI Powered
                                </span>
                            </div>
                        </div>
                        <div className="ai-chat-header-actions">
                            <button onClick={clearChat} title="Nuova chat">
                                <RefreshCw size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} title="Chiudi">
                                <ChevronDown size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Suggestions Bar */}
                    {suggestions.length > 0 && (
                        <div className="ai-chat-suggestions">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className={`ai-suggestion-chip ${s.type}`}
                                    onClick={() => sendMessage(s.action)}
                                >
                                    {s.type === 'warning' && <AlertCircle size={12} />}
                                    {s.type === 'danger' && <AlertCircle size={12} />}
                                    {s.type === 'info' && <TrendingUp size={12} />}
                                    {s.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    <div className="ai-chat-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`ai-chat-message ${msg.role} ${msg.isError ? 'error' : ''}`}
                            >
                                <div className="ai-message-avatar">
                                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="ai-message-content">
                                    <div
                                        className="ai-message-text"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                    />
                                    {msg.model && (
                                        <div className="ai-message-meta">
                                            {msg.model.split('/')[1]?.replace(':free', '') || 'AI'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-chat-message assistant loading">
                                <div className="ai-message-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="ai-message-content">
                                    <div className="ai-typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Queries */}
                    {showQuickQueries && messages.length <= 2 && (
                        <div className="ai-quick-queries">
                            <div className="ai-quick-queries-label">Domande rapide:</div>
                            <div className="ai-quick-queries-grid">
                                {QUICK_QUERIES.map((query) => (
                                    <button
                                        key={query.id}
                                        className="ai-quick-query-btn"
                                        onClick={() => handleQuickQuery(query.id)}
                                        disabled={isLoading}
                                    >
                                        <query.icon size={14} />
                                        {query.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="ai-chat-input-container">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Scrivi un messaggio..."
                            disabled={isLoading}
                            rows={1}
                        />
                        <button
                            className="ai-chat-send-btn"
                            onClick={() => sendMessage(inputValue)}
                            disabled={!inputValue.trim() || isLoading}
                        >
                            {isLoading ? <Loader2 size={18} className="spinning" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
