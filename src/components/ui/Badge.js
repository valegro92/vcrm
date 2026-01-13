import React from 'react';

/**
 * Unified Badge Component
 * Varianti: status, priority, stage, info, success, warning, danger
 */
export default function Badge({ children, variant = 'default', size = 'normal', icon, className = '' }) {
    const variantClasses = {
        default: 'badge-default',
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
        purple: 'badge-purple',
        // Status specifici
        lead: 'badge-lead',
        cliente: 'badge-cliente',
        prospect: 'badge-prospect',
        // Priority
        alta: 'badge-danger',
        media: 'badge-warning',
        bassa: 'badge-info'
    };

    const sizeClasses = {
        small: 'badge-sm',
        normal: '',
        large: 'badge-lg'
    };

    return (
        <span className={`unified-badge ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size]} ${className}`}>
            {icon && <span className="badge-icon">{icon}</span>}
            {children}
        </span>
    );
}

/**
 * Status Badge - per stati contatto/opportunità
 */
export function StatusBadge({ status }) {
    const statusMap = {
        'Lead': { variant: 'info', label: 'Lead' },
        'Prospect': { variant: 'warning', label: 'Prospect' },
        'Cliente': { variant: 'success', label: 'Cliente' },
        'Chiuso Vinto': { variant: 'success', label: 'Vinto' },
        'Chiuso Perso': { variant: 'danger', label: 'Perso' }
    };

    const config = statusMap[status] || { variant: 'default', label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Priority Badge - per priorità task
 */
export function PriorityBadge({ priority }) {
    const priorityMap = {
        'Alta': { variant: 'danger', label: 'Alta' },
        'Media': { variant: 'warning', label: 'Media' },
        'Bassa': { variant: 'info', label: 'Bassa' }
    };

    const config = priorityMap[priority] || { variant: 'default', label: priority };

    return <Badge variant={config.variant} size="small">{config.label}</Badge>;
}

/**
 * Stage Badge - per stage pipeline
 */
export function StageBadge({ stage }) {
    const stageMap = {
        'Lead': 'info',
        'In contatto': 'primary',
        'Follow Up da fare': 'warning',
        'Revisionare offerta': 'purple',
        'Chiuso Vinto': 'success',
        'Chiuso Perso': 'danger'
    };

    return <Badge variant={stageMap[stage] || 'default'}>{stage}</Badge>;
}
