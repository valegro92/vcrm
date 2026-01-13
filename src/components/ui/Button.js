import React from 'react';

/**
 * Unified Button Component
 * Varianti: primary, secondary, ghost, danger, icon
 * Size: small, normal, large
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'normal',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    fullWidth = false,
    onClick,
    type = 'button',
    className = '',
    title,
    ...props
}) {
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
        icon: 'btn-icon'
    };

    const sizeClasses = {
        small: 'btn-sm',
        normal: '',
        large: 'btn-lg'
    };

    const handleClick = (e) => {
        if (!disabled && !loading && onClick) {
            onClick(e);
        }
    };

    return (
        <button
            type={type}
            className={`unified-btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
            disabled={disabled || loading}
            onClick={handleClick}
            title={title}
            {...props}
        >
            {loading && <span className="btn-spinner" />}
            {icon && iconPosition === 'left' && !loading && (
                <span className="btn-icon-left">{icon}</span>
            )}
            {children && <span className="btn-text">{children}</span>}
            {icon && iconPosition === 'right' && !loading && (
                <span className="btn-icon-right">{icon}</span>
            )}
        </button>
    );
}

/**
 * Icon Button - solo icona, niente testo
 */
export function IconButton({ icon, variant = 'ghost', size = 'normal', ...props }) {
    return (
        <Button variant="icon" size={size} className={`icon-btn-${variant}`} {...props}>
            {icon}
        </Button>
    );
}

/**
 * Action Button - piccolo per azioni inline
 */
export function ActionButton({ children, icon, variant = 'ghost', ...props }) {
    return (
        <Button variant={variant} size="small" icon={icon} {...props}>
            {children}
        </Button>
    );
}
