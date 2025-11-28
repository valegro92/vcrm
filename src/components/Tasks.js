import React from 'react';
import { Filter, ChevronDown, Plus, Users, Calendar, Edit2, Trash2 } from 'lucide-react';

export default function Tasks({ tasks, contacts, openAddModal, handleDeleteTask, handleToggleTask }) {
    return (
        <div className="tasks-view">
            <div className="view-toolbar">
                <div className="toolbar-left">
                    <button className="filter-btn">
                        <Filter size={18} />
                        <span>Filtri</span>
                        <ChevronDown size={16} />
                    </button>
                    <div className="filter-tags">
                        <button className="filter-tag active">Tutte</button>
                        <button className="filter-tag">Da fare</button>
                        <button className="filter-tag">In corso</button>
                        <button className="filter-tag">Completate</button>
                    </div>
                </div>
                <button className="primary-btn" onClick={() => openAddModal('task')}>
                    <Plus size={18} />
                    <span>Nuova Attività</span>
                </button>
            </div>

            <div className="tasks-list">
                {tasks.map(task => (
                    <div key={task.id} className={`task-item ${task.status === 'Completata' ? 'completed' : ''}`}>
                        <div className="task-checkbox">
                            <input
                                type="checkbox"
                                checked={task.status === 'Completata'}
                                onChange={() => handleToggleTask(task.id)}
                            />
                        </div>
                        <div className="task-content">
                            <div className="task-header">
                                <span className="task-title">{task.title}</span>
                                <div className="task-badges">
                                    <span className={`type-badge ${task.type?.toLowerCase()}`}>{task.type}</span>
                                    <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority}</span>
                                </div>
                            </div>
                            <div className="task-meta">
                                <span className="task-contact">
                                    <Users size={14} />
                                    {contacts.find(c => c.id === task.contactId)?.name || 'N/D'}
                                </span>
                                <span className="task-due">
                                    <Calendar size={14} />
                                    {task.dueDate}
                                </span>
                            </div>
                        </div>
                        <div className="task-actions">
                            <button className="action-btn" onClick={() => openAddModal('task', task)}><Edit2 size={16} /></button>
                            <button className="action-btn delete" onClick={() => handleDeleteTask(task.id)}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
