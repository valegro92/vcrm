import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import api from '../api/api';

// Colori per gli header delle colonne stile Ydea
const STAGE_COLORS = {
    'Lead': '#f59e0b',           // Arancione
    'In contatto': '#3b82f6',    // Blu
    'Follow Up da fare': '#8b5cf6', // Viola
    'Revisionare offerta': '#ec4899', // Rosa
    'Chiuso Vinto': '#10b981',   // Verde
    'Chiuso Perso': '#ef4444'    // Rosso
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

                                        <button
                                            className="opp-eye-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAddModal('opportunity', opp);
                                            }}
                                            title="Vedi dettagli"
                                        >
                                            <Eye size={18} />
                                        </button>
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
                <div className="bi-grid">
                    {/* Trend Chart - Area */}
                    <div className="bi-card">
                        <h3 className="bi-card-title">📈 Andamento Vendite {selectedYear !== 'all' ? selectedYear : ''}</h3>
                        <div className="trend-chart">
                            {(() => {
                                // Group opportunities by month
                                const monthlyData = {};
                                const wonOpps = filteredOpportunities.filter(o => o.stage === 'Chiuso Vinto');
                                const lostOpps = filteredOpportunities.filter(o => o.stage === 'Chiuso Perso');

                                [...wonOpps, ...lostOpps].forEach(opp => {
                                    if (!opp.closeDate) return;
                                    const date = new Date(opp.closeDate);
                                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                                    if (!monthlyData[monthKey]) {
                                        monthlyData[monthKey] = { won: 0, lost: 0 };
                                    }

                                    if (opp.stage === 'Chiuso Vinto') {
                                        monthlyData[monthKey].won += parseFloat(opp.value) || 0;
                                    } else {
                                        monthlyData[monthKey].lost += parseFloat(opp.value) || 0;
                                    }
                                });

                                const months = Object.keys(monthlyData).sort();
                                const maxValue = Math.max(...months.map(m => monthlyData[m].won + monthlyData[m].lost), 1);

                                if (months.length === 0) {
                                    return <div className="no-data">Nessun dato disponibile</div>;
                                }

                                return (
                                    <div className="area-chart">
                                        <div className="chart-legend">
                                            <span className="legend-item">
                                                <span className="legend-dot" style={{ background: '#10b981' }}></span>
                                                Chiuso Vinto
                                            </span>
                                            <span className="legend-item">
                                                <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                                                Chiuso Perso
                                            </span>
                                        </div>
                                        <div className="chart-bars">
                                            {months.slice(-6).map(month => {
                                                const data = monthlyData[month];
                                                const wonHeight = (data.won / maxValue) * 100;
                                                const lostHeight = (data.lost / maxValue) * 100;
                                                const [year, monthNum] = month.split('-');
                                                const monthName = new Date(year, monthNum - 1).toLocaleDateString('it-IT', { month: 'short' });

                                                return (
                                                    <div key={month} className="chart-bar-group">
                                                        <div className="chart-bars-container">
                                                            <div
                                                                className="chart-bar won"
                                                                style={{ height: `${wonHeight}%` }}
                                                                title={`Vinto: €${data.won.toLocaleString()}`}
                                                            ></div>
                                                            <div
                                                                className="chart-bar lost"
                                                                style={{ height: `${lostHeight}%` }}
                                                                title={`Perso: €${data.lost.toLocaleString()}`}
                                                            ></div>
                                                        </div>
                                                        <div className="chart-label">{monthName}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Distribution Chart - Donut */}
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

                /* Area Chart */
                .area-chart {
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

                .chart-bars {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 180px;
                    gap: 8px;
                    padding: 0 16px;
                }

                .chart-bar-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .chart-bars-container {
                    display: flex;
                    gap: 4px;
                    height: 150px;
                    align-items: flex-end;
                    width: 100%;
                    justify-content: center;
                }

                .chart-bar {
                    width: 20px;
                    min-height: 4px;
                    border-radius: 4px 4px 0 0;
                    transition: all 0.3s ease;
                }

                .chart-bar.won {
                    background: linear-gradient(180deg, #10b981, #059669);
                }

                .chart-bar.lost {
                    background: linear-gradient(180deg, #ef4444, #dc2626);
                }

                .chart-bar:hover {
                    opacity: 0.8;
                    transform: scaleY(1.05);
                }

                .chart-label {
                    font-size: 11px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 600;
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
            </style>
        </div>
    );
}
