import React, { useState } from 'react';
import { GripVertical, CheckSquare, Edit2, Plus, Clock } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import COLORS from '../constants/colors';
import api from '../api/api';

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
        if (draggedItem) {
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
                setDraggedItem(null);
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

    return (
        <div className="pipeline-view">
            <div className="pipeline-header">
                <div className="pipeline-filters">
                    <select
                        className="year-filter"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="all">Tutto</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div className="pipeline-stats">
                    {pipelineStages.map((stage, idx) => {
                        const stageOpps = filteredOpportunities.filter(o => o.stage === stage);
                        const stageValue = stageOpps.reduce((sum, o) => sum + o.value, 0);
                        return (
                            <div key={stage} className="stage-stat">
                                <span className="stage-name">{stage}</span>
                                <span className="stage-count">{stageOpps.length} opportunità</span>
                                <span className="stage-value">€{stageValue.toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="kanban-board">
                {pipelineStages.map((stage, idx) => {
                    const color = COLORS[idx];
                    return (
                        <div
                            key={stage}
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                            style={{
                                '--header-bg-1': color,
                                '--header-bg-2': color
                            }}
                        >
                            <div className="column-header">
                                <h3>{stage}</h3>
                                <span className="column-count">{filteredOpportunities.filter(o => o.stage === stage).length}</span>
                            </div>
                            <div className="column-content">
                                {filteredOpportunities.filter(o => o.stage === stage).map(opp => {
                                    const oppTasks = tasks.filter(t => t.opportunityId === opp.id);
                                    return (
                                        <div
                                            key={opp.id}
                                            className="kanban-card"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, opp)}
                                            style={{ '--card-accent-color': color }}
                                        >
                                            <div className="card-drag-handle"><GripVertical size={16} /></div>
                                            <div className="kanban-card-header">
                                                <span className="card-title">{opp.title || 'Senza titolo'}</span>
                                                <div className="card-actions">
                                                    <button
                                                        className="card-action-btn"
                                                        onClick={() => {
                                                            setNewItem({ opportunityId: opp.id, title: '' });
                                                            openAddModal('task');
                                                        }}
                                                        title="Aggiungi attività"
                                                    >
                                                        <CheckSquare size={14} />
                                                    </button>
                                                    <button className="card-action-btn" onClick={() => openAddModal('opportunity', opp)}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-company">{opp.company || 'N/D'}</div>
                                            <div className="card-footer">
                                                <span className="card-value">€{opp.value.toLocaleString()}</span>
                                                <span className="card-probability">{opp.probability}%</span>
                                            </div>
                                            {oppTasks.length > 0 && (
                                                <div className="card-tasks">
                                                    <div className="card-tasks-header">
                                                        <CheckSquare size={12} />
                                                        <span>{oppTasks.filter(t => t.status === 'Completata').length}/{oppTasks.length} attività</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="card-meta">
                                                <Clock size={14} />
                                                <span>Chiusura: {opp.closeDate}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="add-card-btn" onClick={() => openAddModal('opportunity')}>
                                <Plus size={16} />
                                <span>Aggiungi opportunità</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
