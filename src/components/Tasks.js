import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Edit2, Trash2, CheckCircle, Circle, Clock, AlertCircle, ListTodo, Flag, Users } from 'lucide-react';
import { PageHeader, SearchFilter, KPICard, KPISection } from './ui';

export default function Tasks({ tasks, contacts, openAddModal, handleDeleteTask, handleToggleTask }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');

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

        // Sort by due date
        return result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }, [tasks, searchTerm, statusFilter, priorityFilter]);

    const getPriorityStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'alta': return { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', icon: '🔴' };
            case 'media': return { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', icon: '🟡' };
            default: return { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', icon: '🟢' };
        }
    };

    const getTypeStyle = (type) => {
        switch (type?.toLowerCase()) {
            case 'chiamata': return { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#2563eb' };
            case 'meeting': return { bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed' };
            case 'email': return { bg: 'linear-gradient(135deg, #cffafe, #a5f3fc)', color: '#0891b2' };
            default: return { bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#475569' };
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
        return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getContactName = (contactId) => {
        const contact = contacts.find(c => c.id === contactId);
        return contact?.name || 'Nessun contatto';
    };

    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'Completata').length;
        const pending = tasks.length - completed;
        const overdue = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Completata').length;
        const today = tasks.filter(t => isToday(t.dueDate) && t.status !== 'Completata').length;
        return { completed, pending, overdue, today };
    }, [tasks]);
    const filters = [
        { value: 'all', label: 'Tutte' },
        { value: 'pending', label: 'Da fare' },
        { value: 'completed', label: 'Completate' }
    ];

    return (
        <div className="page-container">
            {/* Unified Header */}
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

            {/* Unified Search & Filters */}
            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Cerca attività..."
                filters={filters}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
            />

            {/* Tasks Grid */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredTasks.map(task => {
                        const priorityStyle = getPriorityStyle(task.priority);
                        const typeStyle = getTypeStyle(task.type);
                        const isCompleted = task.status === 'Completata';
                        const overdue = isOverdue(task.dueDate) && !isCompleted;
                        const todayTask = isToday(task.dueDate);

                        return (
                            <div
                                key={task.id}
                                className={`task-card-row ${overdue ? 'overdue' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        border: isCompleted ? 'none' : '2px solid #cbd5e1',
                                        background: isCompleted ? 'linear-gradient(135deg, #10b981, #34d399)' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {isCompleted ? (
                                        <CheckCircle size={20} color="white" />
                                    ) : (
                                        <Circle size={20} color="#cbd5e1" />
                                    )}
                                </button>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: isCompleted ? '#94a3b8' : '#0f172a',
                                            textDecoration: isCompleted ? 'line-through' : 'none'
                                        }}>
                                            {task.title}
                                        </span>

                                        {/* Badges */}
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: typeStyle.bg,
                                            color: typeStyle.color,
                                            textTransform: 'uppercase'
                                        }}>
                                            {task.type || 'Task'}
                                        </span>

                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: priorityStyle.bg,
                                            color: priorityStyle.color,
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Flag size={12} />
                                            {task.priority || 'Normale'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            color: '#64748b'
                                        }}>
                                            <Users size={14} />
                                            {getContactName(task.contactId)}
                                        </span>

                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            color: overdue ? '#dc2626' : todayTask ? '#d97706' : '#64748b',
                                            fontWeight: overdue || todayTask ? 600 : 400
                                        }}>
                                            <Calendar size={14} />
                                            {formatDate(task.dueDate)}
                                            {overdue && (
                                                <span style={{
                                                    padding: '2px 8px',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    borderRadius: '10px',
                                                    fontSize: '11px',
                                                    fontWeight: 700
                                                }}>
                                                    SCADUTA
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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
