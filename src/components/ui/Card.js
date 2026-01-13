import React from 'react';

/**
 * Unified Card Component
 * Layout: vertical (default), horizontal, compact
 * Varianti: default, elevated, outlined, interactive
 */
export default function Card({
    children,
    variant = 'default',
    layout = 'vertical',
    padding = 'normal',
    onClick,
    className = '',
    ...props
}) {
    const variantClasses = {
        default: 'card-default',
        elevated: 'card-elevated',
        outlined: 'card-outlined',
        interactive: 'card-interactive',
        kanban: 'card-kanban'
    };

    const layoutClasses = {
        vertical: 'card-vertical',
        horizontal: 'card-horizontal',
        compact: 'card-compact'
    };

    const paddingClasses = {
        none: 'card-p-none',
        small: 'card-p-sm',
        normal: '',
        large: 'card-p-lg'
    };

    return (
        <div
            className={`unified-card ${variantClasses[variant]} ${layoutClasses[layout]} ${paddingClasses[padding]} ${onClick ? 'card-clickable' : ''} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Card Header
 */
export function CardHeader({ children, title, subtitle, action, className = '' }) {
    return (
        <div className={`card-header ${className}`}>
            {(title || subtitle) ? (
                <div className="card-header-text">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            ) : children}
            {action && <div className="card-header-action">{action}</div>}
        </div>
    );
}

/**
 * Card Body
 */
export function CardBody({ children, className = '' }) {
    return (
        <div className={`card-body ${className}`}>
            {children}
        </div>
    );
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
        </div>
    );
}

/**
 * Card Meta - per info secondarie (date, valori, etc)
 */
export function CardMeta({ children, className = '' }) {
    return (
        <div className={`card-meta ${className}`}>
            {children}
        </div>
    );
}

/**
 * Card Meta Item - singolo elemento meta
 */
export function CardMetaItem({ icon, label, value, className = '' }) {
    return (
        <div className={`card-meta-item ${className}`}>
            {icon && <span className="meta-icon">{icon}</span>}
            {label && <span className="meta-label">{label}</span>}
            {value && <span className="meta-value">{value}</span>}
        </div>
    );
}
