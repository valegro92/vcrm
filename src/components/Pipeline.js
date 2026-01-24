import React, { useState, useMemo } from 'react';
import { Plus, Eye, CheckSquare, Target, Euro, TrendingUp, Layers } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import api from '../api/api';
import { PageHeader, KPICard, KPISection } from './ui';
import WonModal from './WonModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CURRENT_YEAR, generateYearOptions, STAGE_PROBABILITIES } from '../constants/business';

// Colori per gli header delle colonne pipeline
const STAGE_COLORS = {
    'Lead': '#fbbf24',           // Giallo/Oro (Analisi esigenze)
    'In contatto': '#60a5fa',    // Azzurro (Inviare offerta)
    'Follow Up da fare': '#fb923c', // Arancione (In attesa decision makers)
    'Revisionare offerta': '#a78bfa', // Viola Chiaro (Revisionare offerta)
    'Chiuso Vinto': '#4ade80',   // Verde (Chiuso vinto)
    'Chiuso Perso': '#f87171'    // Rosso Chiaro
};

export default function Pipeline({ opportunities, tasks, setOpportunities, openAddModal, setNewItem }) {
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
    const [draggedItem, setDraggedItem] = useState(null);
    const [mobileViewStage, setMobileViewStage] = useState(null); // For mobile accordion
    const [showWonModal, setShowWonModal] = useState(false);
    const [pendingWonOpportunity, setPendingWonOpportunity] = useState(null);

    const handleDragStart = (e, opportunity) => {
        setDraggedItem(opportunity);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, newStage) => {
        e.preventDefault();
        if (draggedItem && draggedItem.stage !== newStage) {
            // Se è Chiuso Vinto, mostra il modal per le date
            if (newStage === 'Chiuso Vinto') {
                setPendingWonOpportunity(draggedItem);
                setShowWonModal(true);
                setDraggedItem(null);
                return;
            }

            try {
                const updated = await api.updateOpportunityStage(
                    draggedItem.id,
                    newStage,
                    STAGE_PROBABILITIES[newStage] || 30
                );
                setOpportunities(opportunities.map(opp =>
                    opp.id === updated.id ? updated : opp
                ));
            } catch (error) {
                alert('Errore: ' + error.message);
            }
        }
        setDraggedItem(null);
    };

    const handleWonConfirm = async (expectedInvoiceDate, expectedPaymentDate) => {
        if (!pendingWonOpportunity) return;

        try {
            const updated = await api.updateOpportunityStage(
                pendingWonOpportunity.id,
                'Chiuso Vinto',
                100,
                expectedInvoiceDate,
                expectedPaymentDate
            );
            setOpportunities(opportunities.map(opp =>
                opp.id === updated.id ? updated : opp
            ));
            setShowWonModal(false);
            setPendingWonOpportunity(null);
        } catch (error) {
            alert('Errore: ' + error.message);
        }
    };

    const handleWonCancel = () => {
        setShowWonModal(false);
        setPendingWonOpportunity(null);
    };

    const filteredOpportunities = useMemo(() => {
        return opportunities.filter(opp => {
            if (selectedYear === 'all') return true;
            if (!opp.closeDate) return true;
            const oppYear = new Date(opp.closeDate).getFullYear();
            return oppYear === parseInt(selectedYear);
        });
    }, [opportunities, selectedYear]);

    // Stats computed once
    const stats = useMemo(() => {
        const active = filteredOpportunities.filter(o => !['Chiuso Vinto', 'Chiuso Perso'].includes(o.stage));
        const totalValue = filteredOpportunities.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const avgProbability = filteredOpportunities.length > 0
            ? Math.round(filteredOpportunities.reduce((sum, o) => sum + (parseInt(o.probability) || 0), 0) / filteredOpportunities.length)
            : 0;
        const weightedValue = filteredOpportunities.reduce((sum, o) =>
            sum + ((parseFloat(o.value) || 0) * (parseInt(o.probability) || 0) / 100), 0);

        return {
            activeCount: active.length,
            totalValue,
            avgProbability,
            weightedValue
        };
    }, [filteredOpportunities]);

    // Donut chart data
    const donutData = useMemo(() => {
        const activeStages = pipelineStages.filter(s => !s.includes('Chiuso'));
        const stageData = activeStages.map(stage => ({
            stage,
            count: filteredOpportunities.filter(o => o.stage === stage).length,
            value: filteredOpportunities
                .filter(o => o.stage === stage)
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0),
            color: STAGE_COLORS[stage]
        })).filter(d => d.count > 0);

        const total = stageData.reduce((sum, d) => sum + d.count, 0);
        return { stageData, total };
    }, [filteredOpportunities]);

    return (
        <div className="page-container pipeline-page">
            {/* Unified Header */}
            <PageHeader
                title="Pipeline"
                subtitle={`${stats.activeCount} opportunità attive • Valore: ${formatCurrency(stats.totalValue)}`}
                icon={<Layers size={24} />}
            >
                <select
                    className="year-selector"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="all">Tutti gli anni</option>
                    {generateYearOptions(-2, 2).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <button className="primary-btn" onClick={() => openAddModal('opportunity')}>
                    <Plus size={18} />
                    <span>Nuova</span>
                </button>
            </PageHeader>

            {/* KPI Section */}
            <KPISection>
                <KPICard
                    title="Opportunità Attive"
                    value={stats.activeCount}
                    icon={<Target size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Valore Totale"
                    value={formatCurrency(stats.totalValue)}
                    icon={<Euro size={20} />}
                    color="green"
                />
                <KPICard
                    title="Probabilità Media"
                    value={`${stats.avgProbability}%`}
                    icon={<TrendingUp size={20} />}
                    color="purple"
                />
                <KPICard
                    title="Valore Ponderato"
                    value={formatCurrency(stats.weightedValue)}
                    icon={<Euro size={20} />}
                    color="orange"
                />
            </KPISection>

            {/* Kanban Board - Desktop: Horizontal Scroll, Mobile: Accordion */}
            <div className="kanban-wrapper">
                <div className="kanban-board">
                    {pipelineStages.map((stage) => {
                        const stageOpps = filteredOpportunities.filter(o => o.stage === stage);
                        const stageValue = stageOpps.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
                        const headerColor = STAGE_COLORS[stage] || '#6366f1';
                        const isExpanded = mobileViewStage === stage;

                        return (
                            <div
                                key={stage}
                                className={`kanban-column ${isExpanded ? 'expanded' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage)}
                            >
                                {/* Header colorato - clickable on mobile */}
                                <div
                                    className="column-header"
                                    style={{ background: headerColor }}
                                    onClick={() => setMobileViewStage(isExpanded ? null : stage)}
                                >
                                    <h3>{stage}</h3>
                                    <div className="column-header-right">
                                        <span className="column-count">{stageOpps.length}</span>
                                        <span className="mobile-toggle">{isExpanded ? '▼' : '▶'}</span>
                                    </div>
                                </div>

                                {/* Valore totale */}
                                <div className="column-value">
                                    {formatCurrency(stageValue)}
                                </div>

                                {/* Cards */}
                                <div className={`column-content ${isExpanded ? 'show' : ''}`}>
                                    {stageOpps.map(opp => (
                                        <div
                                            key={opp.id}
                                            className="opp-card"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, opp)}
                                        >
                                            <div className="opp-card-header">
                                                <div className="opp-card-title">{opp.title || 'Senza titolo'}</div>
                                                <div className="opp-card-value">{formatCurrency(parseFloat(opp.value) || 0)}</div>
                                            </div>

                                            <div className="opp-card-body">
                                                <div className="opp-card-company">{opp.company || 'N/D'}</div>
                                                <div className="opp-card-owner">{opp.owner || 'Non assegnato'}</div>
                                                <div className="opp-card-date">
                                                    {formatDate(opp.closeDate)}
                                                </div>
                                            </div>

                                            {/* Date previste per opportunità vinte */}
                                            {opp.stage === 'Chiuso Vinto' && (opp.expectedInvoiceDate || opp.expectedPaymentDate) && (
                                                <div className="opp-card-forecast">
                                                    {opp.expectedInvoiceDate && (
                                                        <div className="forecast-item">
                                                            <span className="forecast-label">Fatt:</span>
                                                            <span className="forecast-date">{formatDate(opp.expectedInvoiceDate)}</span>
                                                        </div>
                                                    )}
                                                    {opp.expectedPaymentDate && (
                                                        <div className="forecast-item">
                                                            <span className="forecast-label">Inc:</span>
                                                            <span className="forecast-date">{formatDate(opp.expectedPaymentDate)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="opp-card-actions">
                                                <button
                                                    className="opp-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openAddModal('task', {
                                                            title: `Follow up: ${opp.title}`,
                                                            description: `Attività relativa all'opportunità: ${opp.title} (${opp.company})`,
                                                            priority: 'media',
                                                            type: 'call'
                                                        });
                                                    }}
                                                    title="Aggiungi attività"
                                                >
                                                    <CheckSquare size={16} />
                                                </button>
                                                <button
                                                    className="opp-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openAddModal('opportunity', opp);
                                                    }}
                                                    title="Vedi dettagli"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {stageOpps.length === 0 && (
                                        <div className="empty-column">
                                            Nessuna opportunità
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pipeline Distribution - Donut Chart */}
            <div className="pipeline-chart-section">
                <div className="pipeline-chart-card">
                    <h3 className="chart-title">🎯 Pipeline per Fase</h3>
                    <div className="donut-chart">
                        {donutData.total === 0 ? (
                            <div className="no-data">Nessuna opportunità attiva</div>
                        ) : (
                            <>
                                <div className="donut-visual">
                                    <svg viewBox="0 0 100 100" className="donut-svg">
                                        {(() => {
                                            let currentAngle = 0;
                                            return donutData.stageData.map((d, i) => {
                                                const percentage = (d.count / donutData.total) * 100;
                                                const angle = (percentage / 100) * 360;
                                                const radius = 40;

                                                const startAngle = (currentAngle - 90) * (Math.PI / 180);
                                                const endAngle = (currentAngle + angle - 90) * (Math.PI / 180);

                                                const x1 = 50 + radius * Math.cos(startAngle);
                                                const y1 = 50 + radius * Math.sin(startAngle);
                                                const x2 = 50 + radius * Math.cos(endAngle);
                                                const y2 = 50 + radius * Math.sin(endAngle);

                                                const largeArc = angle > 180 ? 1 : 0;

                                                const path = [
                                                    `M 50 50`,
                                                    `L ${x1} ${y1}`,
                                                    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                                                    `Z`
                                                ].join(' ');

                                                currentAngle += angle;

                                                return (
                                                    <path
                                                        key={i}
                                                        d={path}
                                                        fill={d.color}
                                                        opacity="0.9"
                                                    />
                                                );
                                            });
                                        })()}
                                        <circle cx="50" cy="50" r="28" fill="white" />
                                    </svg>
                                    <div className="donut-center">
                                        <div className="donut-total">{donutData.total}</div>
                                        <div className="donut-label">Opportunità</div>
                                    </div>
                                </div>
                                <div className="donut-legend">
                                    {donutData.stageData.map((d, i) => (
                                        <div key={i} className="legend-row">
                                            <span className="legend-color" style={{ background: d.color }}></span>
                                            <span className="legend-name">{d.stage}</span>
                                            <span className="legend-percentage">
                                                {Math.round((d.count / donutData.total) * 100)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Won Modal */}
            {showWonModal && (
                <WonModal
                    opportunity={pendingWonOpportunity}
                    onConfirm={handleWonConfirm}
                    onCancel={handleWonCancel}
                />
            )}
        </div>
    );
}
