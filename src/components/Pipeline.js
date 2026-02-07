import React, { useState, useMemo } from 'react';
import { Plus, Eye, CheckSquare, Target, Euro, TrendingUp, Layers, Receipt, Wallet, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { PageHeader, KPICard, KPISection } from './ui';
import WonModal from './WonModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CURRENT_YEAR, generateYearOptions, STAGE_PROBABILITIES } from '../constants/business';

// Colori per gli header delle colonne pipeline
const STAGE_COLORS = {
    'Lead': '#fbbf24',
    'In contatto': '#60a5fa',
    'Follow Up da fare': '#fb923c',
    'Revisionare offerta': '#a78bfa',
    'Chiuso Vinto': '#4ade80',
    'Chiuso Perso': '#f87171'
};

// Determina lo stato di fatturazione/incasso di un'opportunita' vinta
function getWonStatus(opp, invoices = []) {
    const oppInvoices = invoices.filter(inv =>
        inv.opportunityId === opp.id ||
        (inv.opportunityTitle && inv.opportunityTitle === opp.title)
    );

    const hasPaidInvoice = oppInvoices.some(inv => inv.status === 'pagata');
    const hasIssuedInvoice = oppInvoices.some(inv => inv.status === 'emessa' || inv.status === 'pagata');

    if (hasPaidInvoice) {
        return { id: 'incassata', label: 'Incassata', color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle2, priority: 3 };
    }
    if (hasIssuedInvoice) {
        // Check if overdue
        const overdueInvoice = oppInvoices.find(inv => {
            if (inv.status !== 'emessa' || !inv.dueDate) return false;
            return new Date(inv.dueDate) < new Date();
        });
        if (overdueInvoice) {
            return { id: 'scaduta', label: 'Pagamento Scaduto', color: '#ef4444', bgColor: '#fee2e2', icon: AlertTriangle, priority: 0 };
        }
        return { id: 'fatturata', label: 'Fatturata', color: '#f59e0b', bgColor: '#fef3c7', icon: FileText, priority: 2 };
    }

    // Check se la data prevista fatturazione e' passata
    if (opp.expectedInvoiceDate && new Date(opp.expectedInvoiceDate) < new Date()) {
        return { id: 'da_fatturare_urgente', label: 'Da Fatturare (scaduta)', color: '#ef4444', bgColor: '#fee2e2', icon: AlertTriangle, priority: 0 };
    }

    return { id: 'da_fatturare', label: 'Da Fatturare', color: '#6366f1', bgColor: '#e0e7ff', icon: Receipt, priority: 1 };
}

export default function Pipeline({ opportunities, tasks, invoices = [], setOpportunities, openAddModal, setNewItem, onCreateInvoice }) {
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
    const [draggedItem, setDraggedItem] = useState(null);
    const [mobileViewStage, setMobileViewStage] = useState(null);
    const [showWonModal, setShowWonModal] = useState(false);
    const [pendingWonOpportunity, setPendingWonOpportunity] = useState(null);
    const toast = useToast();

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
                toast.error(error.message || 'Errore durante lo spostamento');
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
            toast.success('Opportunita\' chiusa come vinta!');
        } catch (error) {
            toast.error(error.message || 'Errore durante la conferma');
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

    // Stats
    const stats = useMemo(() => {
        const active = filteredOpportunities.filter(o => !['Chiuso Vinto', 'Chiuso Perso'].includes(o.stage));
        const totalValue = filteredOpportunities.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const avgProbability = filteredOpportunities.length > 0
            ? Math.round(filteredOpportunities.reduce((sum, o) => sum + (parseInt(o.probability) || 0), 0) / filteredOpportunities.length)
            : 0;
        const weightedValue = filteredOpportunities.reduce((sum, o) =>
            sum + ((parseFloat(o.value) || 0) * (parseInt(o.probability) || 0) / 100), 0);

        return { activeCount: active.length, totalValue, avgProbability, weightedValue };
    }, [filteredOpportunities]);

    // Won opportunities con status raggruppati
    const wonGrouped = useMemo(() => {
        const wonOpps = filteredOpportunities.filter(o => o.stage === 'Chiuso Vinto');
        const withStatus = wonOpps.map(opp => ({
            ...opp,
            wonStatus: getWonStatus(opp, invoices)
        }));
        // Sort: urgenti prima, poi da fatturare, poi fatturate, poi incassate
        withStatus.sort((a, b) => a.wonStatus.priority - b.wonStatus.priority);

        // Gruppo summary
        const groups = {
            urgent: withStatus.filter(o => o.wonStatus.id === 'da_fatturare_urgente' || o.wonStatus.id === 'scaduta'),
            daFatturare: withStatus.filter(o => o.wonStatus.id === 'da_fatturare'),
            fatturate: withStatus.filter(o => o.wonStatus.id === 'fatturata'),
            incassate: withStatus.filter(o => o.wonStatus.id === 'incassata')
        };

        const urgentValue = groups.urgent.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
        const daFatturareValue = groups.daFatturare.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
        const fatturateValue = groups.fatturate.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
        const incassateValue = groups.incassate.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);

        return { all: withStatus, groups, urgentValue, daFatturareValue, fatturateValue, incassateValue };
    }, [filteredOpportunities, invoices]);

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

    // Render una card standard (non Chiuso Vinto)
    const renderStandardCard = (opp) => (
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
                <div className="opp-card-date">{formatDate(opp.closeDate)}</div>
            </div>
            <div className="opp-card-actions">
                <button
                    className="opp-action-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        openAddModal('task', {
                            title: `Follow up: ${opp.title}`,
                            description: `Attivita' relativa all'opportunita': ${opp.title} (${opp.company})`,
                            priority: 'media',
                            type: 'call'
                        });
                    }}
                    title="Aggiungi attivita'"
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
    );

    // Render card "Chiuso Vinto" migliorata
    const renderWonCard = (opp) => {
        const status = opp.wonStatus;
        const StatusIcon = status.icon;

        return (
            <div
                key={opp.id}
                className={`opp-card won-card won-status-${status.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, opp)}
                style={{ borderLeft: `4px solid ${status.color}` }}
            >
                <div className="opp-card-header">
                    <div className="opp-card-title">{opp.title || 'Senza titolo'}</div>
                    <div className="opp-card-value">{formatCurrency(parseFloat(opp.value) || 0)}</div>
                </div>

                <div className="opp-card-body">
                    <div className="opp-card-company">{opp.company || 'N/D'}</div>
                </div>

                {/* Status badge */}
                <div className="won-status-badge" style={{ background: status.bgColor, color: status.color }}>
                    <StatusIcon size={14} />
                    <span>{status.label}</span>
                </div>

                {/* Workflow progress dots */}
                <div className="won-workflow">
                    <div className={`won-step ${status.priority >= 0 ? 'done' : ''}`} title="Vinto">
                        <CheckCircle2 size={12} />
                    </div>
                    <div className="won-step-line" />
                    <div className={`won-step ${status.id === 'fatturata' || status.id === 'incassata' ? 'done' : status.id === 'scaduta' ? 'done' : ''}`} title="Fatturato">
                        <FileText size={12} />
                    </div>
                    <div className="won-step-line" />
                    <div className={`won-step ${status.id === 'incassata' ? 'done' : ''}`} title="Incassato">
                        <Wallet size={12} />
                    </div>
                </div>

                {/* Date previste */}
                {(opp.expectedInvoiceDate || opp.expectedPaymentDate) && (
                    <div className="opp-card-forecast">
                        {opp.expectedInvoiceDate && (
                            <div className={`forecast-item ${new Date(opp.expectedInvoiceDate) < new Date() && status.id.includes('da_fatturare') ? 'overdue' : ''}`}>
                                <span className="forecast-label">Fatt:</span>
                                <span className="forecast-date">{formatDate(opp.expectedInvoiceDate)}</span>
                            </div>
                        )}
                        {opp.expectedPaymentDate && (
                            <div className={`forecast-item ${new Date(opp.expectedPaymentDate) < new Date() && status.id === 'scaduta' ? 'overdue' : ''}`}>
                                <span className="forecast-label">Inc:</span>
                                <span className="forecast-date">{formatDate(opp.expectedPaymentDate)}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="opp-card-actions">
                    {onCreateInvoice && status.id.includes('da_fatturare') && (
                        <button
                            className="opp-action-btn invoice-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateInvoice(opp);
                            }}
                            title="Crea Fattura"
                        >
                            <Receipt size={16} />
                        </button>
                    )}
                    <button
                        className="opp-action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            openAddModal('task', {
                                title: `Follow up: ${opp.title}`,
                                description: `Attivita' relativa all'opportunita': ${opp.title} (${opp.company})`,
                                priority: 'media',
                                type: 'call'
                            });
                        }}
                        title="Aggiungi attivita'"
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
        );
    };

    return (
        <div className="page-container pipeline-page">
            <PageHeader
                title="Pipeline"
                subtitle={`${stats.activeCount} opportunita' attive \u2022 Valore: ${formatCurrency(stats.totalValue)}`}
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

            <KPISection>
                <KPICard title="Opportunita' Attive" value={stats.activeCount} icon={<Target size={20} />} color="blue" />
                <KPICard title="Valore Totale" value={formatCurrency(stats.totalValue)} icon={<Euro size={20} />} color="green" />
                <KPICard title="Probabilita' Media" value={`${stats.avgProbability}%`} icon={<TrendingUp size={20} />} color="purple" />
                <KPICard title="Valore Ponderato" value={formatCurrency(stats.weightedValue)} icon={<Euro size={20} />} color="orange" />
            </KPISection>

            {/* Kanban Board */}
            <div className="kanban-wrapper">
                <div className="kanban-board">
                    {pipelineStages.map((stage) => {
                        const isWonStage = stage === 'Chiuso Vinto';
                        const stageOpps = isWonStage
                            ? wonGrouped.all
                            : filteredOpportunities.filter(o => o.stage === stage);
                        const stageValue = stageOpps.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
                        const headerColor = STAGE_COLORS[stage] || '#6366f1';
                        const isExpanded = mobileViewStage === stage;

                        return (
                            <div
                                key={stage}
                                className={`kanban-column ${isExpanded ? 'expanded' : ''} ${isWonStage ? 'won-column' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage)}
                            >
                                <div
                                    className="column-header"
                                    style={{ background: headerColor }}
                                    onClick={() => setMobileViewStage(isExpanded ? null : stage)}
                                >
                                    <h3>{stage}</h3>
                                    <div className="column-header-right">
                                        <span className="column-count">{stageOpps.length}</span>
                                        <span className="mobile-toggle">{isExpanded ? '\u25BC' : '\u25B6'}</span>
                                    </div>
                                </div>

                                <div className="column-value">
                                    {formatCurrency(stageValue)}
                                </div>

                                {/* Summary mini-stats per Chiuso Vinto */}
                                {isWonStage && stageOpps.length > 0 && (
                                    <div className="won-summary-bar">
                                        {wonGrouped.groups.urgent.length > 0 && (
                                            <div className="won-summary-item urgent">
                                                <AlertTriangle size={12} />
                                                <span>{wonGrouped.groups.urgent.length} urgenti</span>
                                                <span className="won-summary-value">{formatCurrency(wonGrouped.urgentValue)}</span>
                                            </div>
                                        )}
                                        {wonGrouped.groups.daFatturare.length > 0 && (
                                            <div className="won-summary-item da-fatturare">
                                                <Receipt size={12} />
                                                <span>{wonGrouped.groups.daFatturare.length} da fatturare</span>
                                                <span className="won-summary-value">{formatCurrency(wonGrouped.daFatturareValue)}</span>
                                            </div>
                                        )}
                                        {wonGrouped.groups.fatturate.length > 0 && (
                                            <div className="won-summary-item fatturata">
                                                <FileText size={12} />
                                                <span>{wonGrouped.groups.fatturate.length} fatturate</span>
                                                <span className="won-summary-value">{formatCurrency(wonGrouped.fatturateValue)}</span>
                                            </div>
                                        )}
                                        {wonGrouped.groups.incassate.length > 0 && (
                                            <div className="won-summary-item incassata">
                                                <CheckCircle2 size={12} />
                                                <span>{wonGrouped.groups.incassate.length} incassate</span>
                                                <span className="won-summary-value">{formatCurrency(wonGrouped.incassateValue)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={`column-content ${isExpanded ? 'show' : ''}`}>
                                    {isWonStage
                                        ? stageOpps.map(opp => renderWonCard(opp))
                                        : stageOpps.map(opp => renderStandardCard(opp))
                                    }
                                    {stageOpps.length === 0 && (
                                        <div className="empty-column">Nessuna opportunita'</div>
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
                    <h3 className="chart-title">Pipeline per Fase</h3>
                    <div className="donut-chart">
                        {donutData.total === 0 ? (
                            <div className="no-data">Nessuna opportunita' attiva</div>
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
                                        <div className="donut-label">Opportunita'</div>
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
