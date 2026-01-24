import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        className: 'toast-success',
        defaultTitle: 'Successo'
    },
    error: {
        icon: XCircle,
        className: 'toast-error',
        defaultTitle: 'Errore'
    },
    warning: {
        icon: AlertTriangle,
        className: 'toast-warning',
        defaultTitle: 'Attenzione'
    },
    info: {
        icon: Info,
        className: 'toast-info',
        defaultTitle: 'Info'
    }
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t =>
            t.id === id ? { ...t, exiting: true } : t
        ));
        // Remove after animation
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        const { title, duration = 4000, action } = options;

        const toast = {
            id,
            message,
            type,
            title: title || TOAST_TYPES[type]?.defaultTitle,
            action,
            exiting: false
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }

        return id;
    }, [removeToast]);

    // Convenience methods
    const toast = {
        success: (message, options) => addToast(message, 'success', options),
        error: (message, options) => addToast(message, 'error', { duration: 6000, ...options }),
        warning: (message, options) => addToast(message, 'warning', options),
        info: (message, options) => addToast(message, 'info', options),
        remove: removeToast,
        removeAll: () => setToasts([])
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function Toast({ toast, onRemove }) {
    const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
    const Icon = config.icon;

    return (
        <div className={`toast ${config.className} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}>
            <div className="toast-icon">
                <Icon size={20} />
            </div>
            <div className="toast-content">
                {toast.title && <div className="toast-title">{toast.title}</div>}
                <div className="toast-message">{toast.message}</div>
                {toast.action && (
                    <button className="toast-action" onClick={toast.action.onClick}>
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button className="toast-close" onClick={() => onRemove(toast.id)}>
                <X size={16} />
            </button>
        </div>
    );
}

export default ToastProvider;
