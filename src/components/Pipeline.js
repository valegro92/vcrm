import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar, CheckSquare, Target, Euro, TrendingUp } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import api from '../api/api';

// Colori per gli header delle colonne stile Ydea
const STAGE_COLORS = {
    'Lead': '#fbbf24',           // Giallo/Oro (Analisi esigenze)
    'In contatto': '#60a5fa',    // Azzurro (Inviare offerta)
    'Follow Up da fare': '#fb923c', // Arancione (In attesa decision makers)
    'Revisionare offerta': '#a78bfa', // Viola Chiaro (Revisionare offerta)
    'Chiuso Vinto': '#4ade80',   // Verde (Chiuso vinto)
    'Chiuso Perso': '#f87171'    // Rosso Chiaro
};

export default function Pipeline({ opportunities, tasks, setOpportunities, openAddModal, setNewItem }) {
    const [selectedYear, setSelectedYear] = useState('all');
    const [draggedItem, setDraggedItem] = useState(null);

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
            try {
                const newProbabilities = {
                    'Lead': 10,
                    'In contatto': 30,
                    'Follow Up da fare': 50,
                    'Revisionare offerta': 75,
                    'Chiuso Vinto': 100,
                    'Chiuso Perso': 0
                };
                const updated = await api.updateOpportunityStage(
                    draggedItem.id,
                    newStage,
                    newProbabilities[newStage]
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

    const handleDelete = async (id) => {
        if (window.confirm('Eliminare questa opportunità?')) {
            try {
                await api.deleteOpportunity(id);
                setOpportunities(opportunities.filter(o => o.id !== id));
            } catch (error) {
                alert('Errore: ' + error.message);
            }
        }
    };

    const filteredOpportunities = opportunities.filter(opp => {
        if (selectedYear === 'all') return true;
        if (!opp.closeDate) return true;
        const oppYear = new Date(opp.closeDate).getFullYear();
        return oppYear === parseInt(selectedYear);
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/D';
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="pipeline-view">
            {/* Toolbar */}
            <div className="view-toolbar">
                <div className="toolbar-left">
                    <select
                        className="year-filter"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="all">Tutti gli anni</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div className="toolbar-right">
                    <button className="primary-btn" onClick={() => openAddModal('opportunity')}>
                        <Plus size={18} />
                        <span>Aggiungi</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board - Scroll Orizzontale */}
            <div className="kanban-board">
                {pipelineStages.map((stage) => {
                    const stageOpps = filteredOpportunities.filter(o => o.stage === stage);
                    const stageValue = stageOpps.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
                    const headerColor = STAGE_COLORS[stage] || '#6366f1';

                    return (
                        <div
                            key={stage}
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                        >
                            {/* Header colorato */}
                            <div
                                className="column-header"
                                style={{ background: headerColor }}
                            >
                                <h3>{stage}</h3>
                                <span className="column-count">{stageOpps.length}</span>
                            </div>

                            {/* Valore totale */}
                            <div className="column-value">
                                €{stageValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                            </div>

                            {/* Cards */}
                            <div className="column-content">
                                {stageOpps.map(opp => (
                                    <div
                                        key={opp.id}
                                        className="opp-card"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, opp)}
                                    >
                                        <div className="opp-card-header">
                                            <div className="opp-card-title">{opp.title || 'Senza titolo'}</div>
                                            <div className="opp-card-value">€{(parseFloat(opp.value) || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                                        </div>

                                        <div className="opp-card-body">
                                            <div className="opp-card-company">{opp.company || 'N/D'}</div>
                                            <div className="opp-card-owner">{opp.owner || 'Non assegnato'}</div>
                                            <div className="opp-card-date">
                                                {formatDate(opp.closeDate)}
                                            </div>
                                        </div>

                                        <div className="card-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
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
                                                style={{
                                                    background: 'var(--bg-subtle)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    padding: '6px',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
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
                                                style={{
                                                    background: 'var(--bg-subtle)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    padding: '6px',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {stageOpps.length === 0 && (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#94a3b8',
                                        fontSize: '13px'
                                    }}>
                                        Nessuna opportunità
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* BI Analytics Section */}
            <div className="bi-section">
                <div className="bi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>

                    {/* KPI 1: Opportunità Attive */}
                    <div className="bi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Opportunità Attive
                            </span>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#e0e7ff', color: '#4f46e5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Target size={20} />
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {filteredOpportunities.filter(o => !['Chiuso Vinto', 'Chiuso Perso'].includes(o.stage)).length}
                        </div>
                    </div>

                    {/* KPI 2: Valore Totale */}
                    <div className="bi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Valore Totale
                            </span>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#dcfce7', color: '#16a34a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Euro size={20} />
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            €{(filteredOpportunities.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0) / 1000).toFixed(0)}K
                        </div>
                    </div>

                    {/* KPI 3: Probabilità Media */}
                    <div className="bi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Probabilità Media
                            </span>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#f3e8ff', color: '#9333ea',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {filteredOpportunities.length > 0
                                ? Math.round(filteredOpportunities.reduce((sum, o) => sum + (parseInt(o.probability) || 0), 0) / filteredOpportunities.length)
                                : 0}%
                        </div>
                    </div>

                    {/* KPI 4: Valore Ponderato */}
                    <div className="bi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Valore Ponderato
                            </span>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#ffedd5', color: '#ea580c',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Euro size={20} />
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            €{(filteredOpportunities.reduce((sum, o) => sum + ((parseFloat(o.value) || 0) * (parseInt(o.probability) || 0) / 100), 0) / 1000).toFixed(0)}K
                        </div>
                    </div>
                </div>

                {/* Pipeline Distribution - Donut Chart */}
                <div className="bi-card">
                    <h3 className="bi-card-title">🎯 Pipeline per Fase</h3>
                    <div className="donut-chart">
                        {(() => {
                            const activeStages = pipelineStages.filter(s =>
                                !s.includes('Chiuso')
                            );
                            const stageData = activeStages.map(stage => ({
                                stage,
                                count: filteredOpportunities.filter(o => o.stage === stage).length,
                                value: filteredOpportunities
                                    .filter(o => o.stage === stage)
                                    .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0),
                                color: STAGE_COLORS[stage]
                            })).filter(d => d.count > 0);

                            const total = stageData.reduce((sum, d) => sum + d.count, 0);

                            if (total === 0) {
                                return <div className="no-data">Nessuna opportunità attiva</div>;
                            }

                            return (
                                <>
                                    <div className="donut-visual">
                                        <svg viewBox="0 0 100 100" className="donut-svg">
                                            {(() => {
                                                let currentAngle = 0;
                                                return stageData.map((d, i) => {
                                                    const percentage = (d.count / total) * 100;
                                                    const angle = (percentage / 100) * 360;
                                                    const radius = 40;
                                                    const innerRadius = 28;

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
                                            <div className="donut-total">{total}</div>
                                            <div className="donut-label">Opportunità</div>
                                        </div>
                                    </div>
                                    <div className="donut-legend">
                                        {stageData.map((d, i) => (
                                            <div key={i} className="legend-row">
                                                <span className="legend-color" style={{ background: d.color }}></span>
                                                <span className="legend-name">{d.stage}</span>
                                                <span className="legend-percentage">
                                                    {Math.round((d.count / total) * 100)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .bi-section {
                    margin-top: 32px;
                    padding-top: 32px;
                    border-top: 2px solid #e2e8f0;
                }

                .bi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                }

                .bi-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    border: 1px solid rgba(226,232,240,0.5);
                }

                .bi-card-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 24px;
                }

                .no-data {
                    text-align: center;
                    color: #94a3b8;
                    padding: 40px;
                    font-size: 14px;
                }

                /* Area Chart - YDEA Style */
                .area-chart-container {
                    min-height: 250px;
                }

                .chart-legend {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                    justify-content: center;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #64748b;
                }

                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .area-chart-svg {
                    width: 100%;
                    height: auto;
                    max-height: 250px;
                }

                /* Donut Chart */
                .donut-chart {
                    display: flex;
                    gap: 32px;
                    align-items: center;
                    justify-content: center;
                    min-height: 250px;
                }

                .donut-visual {
                    position: relative;
                    width: 200px;
                    height: 200px;
                }

                .donut-svg {
                    width: 100%;
                    height: 100%;
                }

                .donut-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .donut-total {
                    font-size: 32px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .donut-label {
                    font-size: 12px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-top: 4px;
                }

                .donut-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .legend-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                }

                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .legend-name {
                    flex: 1;
                    color: #475569;
                }

                .legend-percentage {
                    font-weight: 700;
                    color: #0f172a;
                    min-width: 45px;
                    text-align: right;
                }

                @media (max-width: 768px) {
                    .bi-grid {
                        grid-template-columns: 1fr;
                    }

                    .donut-chart {
                        flex-direction: column;
                        gap: 24px;
                    }

                    .chart-bars {
                        padding: 0 8px;
                    }
                }
            `}</style>
        </div >
    );
}
