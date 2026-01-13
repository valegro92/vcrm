import React, { useState, useMemo } from 'react';
import {
    Plus, Calendar, Edit2, Trash2, CheckCircle, Circle, Clock, AlertCircle,
    ListTodo, Flag, Users, Calendar as CalendarIcon, Briefcase, Target, Filter
} from 'lucide-react';
import { PageHeader, KPICard, KPISection } from './ui';
import { downloadICS } from '../utils/icsGenerator';

export default function Tasks({ tasks, contacts, opportunities, openAddModal, handleDeleteTask, handleToggleTask }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [opportunityFilter, setOpportunityFilter] = useState('all');

    // Get opportunities that have tasks linked
    const opportunitiesWithTasks = useMemo(() => {
        const oppIds = new Set(tasks.filter(t => t.opportunityId).map(t => t.opportunityId));
        return opportunities?.filter(o => oppIds.has(o.id)) || [];
    }, [tasks, opportunities]);

    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.title?.toLowerCase().includes(term) ||
                t.description?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            if (statusFilter === 'completed') {
                result = result.filter(t => t.status === 'Completata');
            } else if (statusFilter === 'pending') {
                result = result.filter(t => t.status !== 'Completata');
            }
        }

        if (priorityFilter !== 'all') {
            result = result.filter(t => t.priority?.toLowerCase() === priorityFilter.toLowerCase());
        }

        if (opportunityFilter !== 'all') {
            if (opportunityFilter === 'linked') {
                result = result.filter(t => t.opportunityId);
            } else if (opportunityFilter === 'unlinked') {
                result = result.filter(t => !t.opportunityId);
            } else {
                result = result.filter(t => t.opportunityId === parseInt(opportunityFilter));
            }
        }

        // Sort by due date
        return result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }, [tasks, searchTerm, statusFilter, priorityFilter, opportunityFilter]);

    const getPriorityStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'alta': return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' };
            case 'media': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
            default: return { bg: '#d1fae5', color: '#059669', border: '#a7f3d0' };
        }
    };

    const getTypeStyle = (type) => {
        switch (type?.toLowerCase()) {
            case 'chiamata': return { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' };
            case 'meeting': return { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
            case 'email': return { bg: '#cffafe', color: '#0891b2', border: '#a5f3fc' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        }
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    const isToday = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate).toDateString() === new Date().toDateString();
    };

    const formatDate = (date) => {
        if (!date) return 'Nessuna scadenza';
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return 'Oggi';
        if (d.toDateString() === tomorrow.toDateString()) return 'Domani';
        return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    };

    const getContactName = (contactId) => {
        const contact = contacts.find(c => c.id === contactId);
        return contact?.name || null;
    };

    const getOpportunity = (opportunityId) => {
        if (!opportunityId || !opportunities) return null;
        return opportunities.find(o => o.id === opportunityId);
    };

    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'Completata').length;
        const pending = tasks.length - completed;
        const overdue = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Completata').length;
        const today = tasks.filter(t => isToday(t.dueDate) && t.status !== 'Completata').length;
        const linked = tasks.filter(t => t.opportunityId).length;
        return { completed, pending, overdue, today, linked };
    }, [tasks]);

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                title="Attività"
                subtitle={`${filteredTasks.length} attività • ${stats.pending} da completare`}
                icon={<ListTodo size={24} />}
            >
                <button className="primary-btn" onClick={() => openAddModal('task')}>
                    <Plus size={18} />
                    <span>Nuova Attività</span>
                </button>
            </PageHeader>

            {/* KPI Section */}
            <KPISection>
                <KPICard
                    title="Totali"
                    value={tasks.length}
                    icon={<ListTodo size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Completate"
                    value={stats.completed}
                    icon={<CheckCircle size={20} />}
                    color="green"
                />
                <KPICard
                    title="Oggi"
                    value={stats.today}
                    icon={<Clock size={20} />}
                    color="orange"
                />
                <KPICard
                    title="Scadute"
                    value={stats.overdue}
                    icon={<AlertCircle size={20} />}
                    color="red"
                />
            </KPISection>

            {/* Enhanced Filters */}
            <div className="task-filters">
                {/* Search */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cerca attività..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Row */}
                <div className="filter-row">
                    {/* Status Filter */}
                    <div className="filter-group">
                        <div className="filter-tags">
                            {[
                                { value: 'all', label: 'Tutte' },
                                { value: 'pending', label: 'Da fare' },
                                { value: 'completed', label: 'Completate' }
                            ].map(f => (
                                <button
                                    key={f.value}
                                    className={`filter-tag ${statusFilter === f.value ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(f.value)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Opportunity Filter */}
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={opportunityFilter}
                            onChange={(e) => setOpportunityFilter(e.target.value)}
                        >
                            <option value="all">Tutte le opportunità</option>
                            <option value="linked">Solo collegate</option>
                            <option value="unlinked">Non collegate</option>
                            {opportunitiesWithTasks.map(opp => (
                                <option key={opp.id} value={opp.id}>
                                    {opp.title} - {opp.company}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="all">Tutte le priorità</option>
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="bassa">Bassa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="empty-state">
                    <ListTodo size={64} strokeWidth={1} />
                    <p>{searchTerm || statusFilter !== 'all' ? 'Nessuna attività trovata' : 'Nessuna attività ancora'}</p>
                    <button className="primary-btn" onClick={() => openAddModal('task')}>
                        <Plus size={18} />
                        <span>Aggiungi la prima attività</span>
                    </button>
                </div>
            ) : (
                <div className="tasks-list">
                    {filteredTasks.map(task => {
                        const priorityStyle = getPriorityStyle(task.priority);
                        const typeStyle = getTypeStyle(task.type);
                        const isCompleted = task.status === 'Completata';
                        const overdue = isOverdue(task.dueDate) && !isCompleted;
                        const todayTask = isToday(task.dueDate);
                        const opportunity = getOpportunity(task.opportunityId);
                        const contactName = getContactName(task.contactId);

                        return (
                            <div
                                key={task.id}
                                className={`task-card ${overdue ? 'overdue' : ''} ${isCompleted ? 'completed' : ''} ${opportunity ? 'has-opportunity' : ''}`}
                            >
                                {/* Left: Checkbox */}
                                <button
                                    className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                                    onClick={() => handleToggleTask(task.id)}
                                >
                                    {isCompleted ? (
                                        <CheckCircle size={22} />
                                    ) : (
                                        <Circle size={22} />
                                    )}
                                </button>

                                {/* Center: Content */}
                                <div className="task-content">
                                    {/* Title Row */}
                                    <div className="task-title-row">
                                        <span className={`task-title ${isCompleted ? 'done' : ''}`}>
                                            {task.title}
                                        </span>

                                        {/* Badges */}
                                        <div className="task-badges">
                                            <span
                                                className="badge type-badge"
                                                style={{
                                                    background: typeStyle.bg,
                                                    color: typeStyle.color,
                                                    borderColor: typeStyle.border
                                                }}
                                            >
                                                {task.type || 'Task'}
                                            </span>
                                            <span
                                                className="badge priority-badge"
                                                style={{
                                                    background: priorityStyle.bg,
                                                    color: priorityStyle.color,
                                                    borderColor: priorityStyle.border
                                                }}
                                            >
                                                <Flag size={10} />
                                                {task.priority || 'Normale'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Meta Row */}
                                    <div className="task-meta">
                                        {/* Opportunity Link - NEW! */}
                                        {opportunity && (
                                            <span className="meta-item opportunity-link">
                                                <Target size={14} />
                                                <span className="opp-title">{opportunity.title}</span>
                                                <span className="opp-company">({opportunity.company})</span>
                                                {opportunity.stage === 'Chiuso Vinto' && (
                                                    <span className="opp-won">Vinta</span>
                                                )}
                                            </span>
                                        )}

                                        {/* Contact */}
                                        {contactName && (
                                            <span className="meta-item">
                                                <Users size={14} />
                                                {contactName}
                                            </span>
                                        )}

                                        {/* Due Date */}
                                        <span className={`meta-item due-date ${overdue ? 'overdue' : ''} ${todayTask ? 'today' : ''}`}>
                                            <Calendar size={14} />
                                            {formatDate(task.dueDate)}
                                            {overdue && <span className="overdue-badge">SCADUTA</span>}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="task-actions">
                                    <button
                                        className="action-btn"
                                        onClick={() => downloadICS(task)}
                                        title="Aggiungi al calendario"
                                    >
                                        <CalendarIcon size={16} />
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => openAddModal('task', task)}
                                        title="Modifica"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDeleteTask(task.id)}
                                        title="Elimina"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
