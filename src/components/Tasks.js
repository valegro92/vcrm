import React, { useState, useMemo } from 'react';
import { Plus, Users, Calendar, Edit2, Trash2, Search, X, CheckCircle, Circle, Clock, AlertCircle, Flag, ListTodo } from 'lucide-react';

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Section */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '16px' 
            }}>
                <div>
                    <h2 style={{ 
                        fontSize: '28px', 
                        fontWeight: 800, 
                        color: '#0f172a', 
                        marginBottom: '4px',
                        letterSpacing: '-0.5px'
                    }}>
                        Le tue Attività
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                        {filteredTasks.length} attività • {stats.pending} da completare
                    </p>
                </div>
                <button className="primary-btn" onClick={() => openAddModal('task')}>
                    <Plus size={20} />
                    <span>Nuova Attività</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '16px' 
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(226,232,240,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ListTodo size={24} color="#4f46e5" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{tasks.length}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Totali</div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(226,232,240,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={24} color="#059669" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{stats.completed}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Completate</div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(226,232,240,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Clock size={24} color="#d97706" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{stats.today}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Oggi</div>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(226,232,240,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <AlertCircle size={24} color="#dc2626" />
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>{stats.overdue}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Scadute</div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div style={{ 
                display: 'flex', 
                gap: '16px', 
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0',
                    flex: '1',
                    maxWidth: '400px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    <Search size={20} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Cerca attività..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            border: 'none', 
                            outline: 'none', 
                            flex: 1, 
                            fontSize: '15px',
                            background: 'transparent'
                        }}
                    />
                    {searchTerm && (
                        <X size={18} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearchTerm('')} />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['all', 'pending', 'completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`filter-tag ${statusFilter === status ? 'active' : ''}`}
                        >
                            {status === 'all' ? 'Tutte' : status === 'pending' ? 'Da fare' : 'Completate'}
                        </button>
                    ))}
                </div>
            </div>

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
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '20px 24px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: overdue ? '2px solid #fecaca' : '1px solid rgba(226,232,240,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    transition: 'all 0.25s ease',
                                    opacity: isCompleted ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                }}
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
