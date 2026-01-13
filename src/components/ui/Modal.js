import React from 'react';
import { X } from 'lucide-react';

/**
 * Unified Modal Component
 * Size: small, medium, large, fullscreen
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'medium',
    showCloseButton = true,
    closeOnOverlay = true,
    footer,
    className = ''
}) {
    if (!isOpen) return null;

    const sizeClasses = {
        small: 'modal-sm',
        medium: 'modal-md',
        large: 'modal-lg',
        fullscreen: 'modal-fullscreen'
    };

    const handleOverlayClick = (e) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="unified-modal-overlay" onClick={handleOverlayClick}>
            <div className={`unified-modal ${sizeClasses[size]} ${className}`}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="modal-header">
                        <div className="modal-header-text">
                            {title && <h2 className="modal-title">{title}</h2>}
                            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                        </div>
                        {showCloseButton && (
                            <button className="modal-close-btn" onClick={onClose} type="button">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="modal-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Modal Actions - bottoni per il footer
 */
export function ModalActions({ children, align = 'right' }) {
    const alignClasses = {
        left: 'modal-actions-left',
        center: 'modal-actions-center',
        right: 'modal-actions-right',
        between: 'modal-actions-between'
    };

    return (
        <div className={`modal-actions ${alignClasses[align]}`}>
            {children}
        </div>
    );
}

/**
 * Confirmation Modal - per conferme rapide
 */
export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Conferma',
    message,
    confirmText = 'Conferma',
    cancelText = 'Annulla',
    variant = 'danger'
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
            footer={
                <ModalActions>
                    <button className="unified-btn btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`unified-btn btn-${variant}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </ModalActions>
            }
        >
            <p className="confirm-message">{message}</p>
        </Modal>
    );
}
