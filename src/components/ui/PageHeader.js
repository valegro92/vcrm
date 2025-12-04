import React from 'react';

/**
 * Unified Page Header Component
 * Used across all pages for consistent look and feel
 */
export default function PageHeader({ title, subtitle, icon, children }) {
    return (
        <div className="unified-page-header">
            <div className="page-header-content">
                {icon && <div className="page-header-icon">{icon}</div>}
                <div className="page-header-text">
                    <h1 className="page-header-title">{title}</h1>
                    {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
                </div>
            </div>
            {children && <div className="page-header-actions">{children}</div>}
        </div>
    );
}
