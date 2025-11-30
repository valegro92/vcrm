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
                                        <div className="opp-card-title">{opp.title || 'Senza titolo'}</div>
                                        <div className="opp-card-value">€{(parseFloat(opp.value) || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                                        <div className="opp-card-company">{opp.company || 'N/D'}</div>
                                        <div className="opp-card-owner">{opp.owner || 'Non assegnato'}</div>
                                        <div className="opp-card-date">
                                            <Calendar size={12} />
                                            {formatDate(opp.closeDate)}
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="opp-card-actions">
                                            <button 
                                                className="opp-action-btn"
                                                onClick={() => openAddModal('opportunity', opp)}
                                                title="Modifica"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button 
                                                className="opp-action-btn"
                                                onClick={() => {
                                                    setNewItem({ opportunityId: opp.id, title: '' });
                                                    openAddModal('task');
                                                }}
                                                title="Aggiungi attività"
                                            >
                                                <Plus size={12} />
                                            </button>
                                            <button 
                                                className="opp-action-btn delete"
                                                onClick={() => handleDelete(opp.id)}
                                                title="Elimina"
                                            >
                                                <Trash2 size={12} />
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
        </div>
    );
}
