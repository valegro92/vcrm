import React from 'react';

/**
 * Unified KPI Card Component
 * Displays a single KPI metric with icon and optional trend
 */
export function KPICard({ title, value, subtitle, icon, color = 'blue', trend, onClick }) {
    const colorClasses = {
        blue: 'kpi-color-blue',
        green: 'kpi-color-green',
        orange: 'kpi-color-orange',
        red: 'kpi-color-red',
        purple: 'kpi-color-purple'
    };

    return (
        <div
            className={`unified-kpi-card ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
        >
            <div className="kpi-card-header">
                <span className="kpi-card-title">{title}</span>
                {icon && (
                    <div className={`kpi-card-icon ${colorClasses[color] || colorClasses.blue}`}>
                        {icon}
                    </div>
                )}
            </div>
            <div className="kpi-card-value">{value}</div>
            {(subtitle || trend) && (
                <div className={`kpi-card-footer ${trend ? (trend.startsWith('+') || trend.startsWith('↑') ? 'positive' : trend.startsWith('-') || trend.startsWith('↓') ? 'negative' : 'neutral') : 'neutral'}`}>
                    {trend && <span className="kpi-card-trend">{trend}</span>}
                    {subtitle && <span className="kpi-card-subtitle">{subtitle}</span>}
                </div>
            )}
        </div>
    );
}

/**
 * KPI Section - Container for multiple KPI cards
 */
export function KPISection({ children }) {
    return (
        <div className="unified-kpi-section">
            {children}
        </div>
    );
}

export default KPICard;
