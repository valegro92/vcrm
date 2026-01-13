import React, { useState, useMemo } from 'react';
import {
    FolderKanban, Plus, CheckCircle, Circle, Clock, Calendar, Euro, FileText,
    ChevronDown, ChevronRight, Target, Users, Receipt, AlertTriangle,
    Edit2, MoreHorizontal, Check, Building
} from 'lucide-react';
import { PageHeader, KPICard, KPISection } from './ui';

export default function Projects({ opportunities, tasks, invoices, contacts, openAddModal, handleToggleTask }) {
    const [expandedProject, setExpandedProject] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed

    // Progetti = Opportunità vinte (Chiuso Vinto)
    const projects = useMemo(() => {
        return opportunities
            .filter(o => o.stage === 'Chiuso Vinto')
            .map(opp => {
                // Task collegati a questo progetto
                const projectTasks = tasks.filter(t => t.opportunityId === opp.id);
                const completedTasks = projectTasks.filter(t => t.status === 'Completata');
                const taskProgress = projectTasks.length > 0
                    ? Math.round((completedTasks.length / projectTasks.length) * 100)
                    : 0;

                // Fatture collegate a questo progetto
                const projectInvoices = invoices.filter(i => i.opportunityId === opp.id);
                const paidInvoices = projectInvoices.filter(i => i.status === 'pagata');
                const totalInvoiced = projectInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
                const totalPaid = paidInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

                // Stato del progetto
                const isCompleted = taskProgress === 100 && projectTasks.length > 0;
                const hasOverdueTasks = projectTasks.some(t =>
                    t.status !== 'Completata' && new Date(t.dueDate) < new Date()
                );

                // Contatto collegato
                const contact = contacts.find(c => c.id === opp.contactId);

                return {
                    ...opp,
                    projectTasks,
                    completedTasks,
                    taskProgress,
                    projectInvoices,
                    paidInvoices,
                    totalInvoiced,
                    totalPaid,
                    isCompleted,
                    hasOverdueTasks,
                    contact
                };
            })
            .sort((a, b) => new Date(b.closeDate) - new Date(a.closeDate));
    }, [opportunities, tasks, invoices, contacts]);

    // Filtra progetti
    const filteredProjects = useMemo(() => {
        if (statusFilter === 'active') {
            return projects.filter(p => !p.isCompleted);
        }
        if (statusFilter === 'completed') {
            return projects.filter(p => p.isCompleted);
        }
        return projects;
    }, [projects, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const active = projects.filter(p => !p.isCompleted).length;
        const completed = projects.filter(p => p.isCompleted).length;
        const totalValue = projects.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
        const totalTasks = projects.reduce((sum, p) => sum + p.projectTasks.length, 0);
        const completedTasksTotal = projects.reduce((sum, p) => sum + p.completedTasks.length, 0);
        const overdue = projects.filter(p => p.hasOverdueTasks).length;

        return { active, completed, totalValue, totalTasks, completedTasksTotal, overdue };
    }, [projects]);

    const formatCurrency = (value) => {
        const num = parseFloat(value) || 0;
        if (num >= 1000) return `€${(num / 1000).toFixed(1)}K`;
        return `€${num.toLocaleString('it-IT')}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const toggleExpand = (projectId) => {
        setExpandedProject(expandedProject === projectId ? null : projectId);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                title="Progetti"
                subtitle={`${projects.length} progetti • ${stats.active} attivi`}
                icon={<FolderKanban size={24} />}
            >
                <div className="filter-tags">
                    {[
                        { value: 'all', label: 'Tutti' },
                        { value: 'active', label: 'Attivi' },
                        { value: 'completed', label: 'Completati' }
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
            </PageHeader>

            {/* KPI Section */}
            <KPISection>
                <KPICard
                    title="Progetti Attivi"
                    value={stats.active}
                    icon={<FolderKanban size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Valore Totale"
                    value={formatCurrency(stats.totalValue)}
                    icon={<Euro size={20} />}
                    color="green"
                />
                <KPICard
                    title="Task Completati"
                    value={`${stats.completedTasksTotal}/${stats.totalTasks}`}
                    subtitle={stats.totalTasks > 0 ? `${Math.round((stats.completedTasksTotal / stats.totalTasks) * 100)}%` : '0%'}
                    icon={<CheckCircle size={20} />}
                    color="purple"
                />
                <KPICard
                    title="Con Scadenze"
                    value={stats.overdue}
                    subtitle="task scaduti"
                    icon={<AlertTriangle size={20} />}
                    color={stats.overdue > 0 ? 'red' : 'green'}
                />
            </KPISection>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <div className="empty-state">
                    <FolderKanban size={64} strokeWidth={1} />
                    <p>Nessun progetto trovato</p>
                    <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                        I progetti vengono creati automaticamente quando un'opportunità diventa "Chiuso Vinto"
                    </span>
                </div>
            ) : (
                <div className="projects-list">
                    {filteredProjects.map(project => {
                        const isExpanded = expandedProject === project.id;

                        return (
                            <div key={project.id} className={`project-card ${project.isCompleted ? 'completed' : ''} ${project.hasOverdueTasks ? 'has-overdue' : ''}`}>
                                {/* Project Header - Always visible */}
                                <div className="project-header" onClick={() => toggleExpand(project.id)}>
                                    <div className="project-expand">
                                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>

                                    <div className="project-info">
                                        <div className="project-title-row">
                                            <h3 className="project-title">{project.title}</h3>
                                            {project.isCompleted && (
                                                <span className="project-status completed">
                                                    <Check size={12} /> Completato
                                                </span>
                                            )}
                                            {project.hasOverdueTasks && !project.isCompleted && (
                                                <span className="project-status overdue">
                                                    <AlertTriangle size={12} /> Scadenze
                                                </span>
                                            )}
                                        </div>
                                        <div className="project-meta">
                                            <span><Building size={14} /> {project.company}</span>
                                            {project.contact && (
                                                <span><Users size={14} /> {project.contact.name}</span>
                                            )}
                                            <span><Calendar size={14} /> Vinto: {formatDate(project.closeDate)}</span>
                                        </div>
                                    </div>

                                    <div className="project-stats">
                                        <div className="stat">
                                            <span className="stat-value">{formatCurrency(project.value)}</span>
                                            <span className="stat-label">Valore</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{project.completedTasks.length}/{project.projectTasks.length}</span>
                                            <span className="stat-label">Task</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{project.paidInvoices.length}/{project.projectInvoices.length}</span>
                                            <span className="stat-label">Fatture</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="project-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${project.taskProgress}%` }}
                                            />
                                        </div>
                                        <span className="progress-text">{project.taskProgress}%</span>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="project-details">
                                        {/* Quick Actions */}
                                        <div className="project-actions">
                                            <button
                                                className="action-btn-small primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddModal('task', {
                                                        opportunityId: project.id,
                                                        title: `Task per: ${project.title}`,
                                                        description: `Attività per il progetto ${project.title} (${project.company})`
                                                    });
                                                }}
                                            >
                                                <Plus size={14} /> Nuovo Task
                                            </button>
                                            <button
                                                className="action-btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddModal('opportunity', project);
                                                }}
                                            >
                                                <Edit2 size={14} /> Modifica Progetto
                                            </button>
                                        </div>

                                        {/* Tasks Section */}
                                        <div className="project-section">
                                            <div className="section-header">
                                                <h4><CheckCircle size={16} /> Attività ({project.projectTasks.length})</h4>
                                            </div>
                                            {project.projectTasks.length === 0 ? (
                                                <div className="section-empty">
                                                    Nessuna attività collegata
                                                </div>
                                            ) : (
                                                <div className="task-list-mini">
                                                    {project.projectTasks.map(task => {
                                                        const isTaskCompleted = task.status === 'Completata';
                                                        const isOverdue = !isTaskCompleted && new Date(task.dueDate) < new Date();

                                                        return (
                                                            <div
                                                                key={task.id}
                                                                className={`task-mini ${isTaskCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
                                                            >
                                                                <button
                                                                    className={`task-check ${isTaskCompleted ? 'checked' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleTask(task.id);
                                                                    }}
                                                                >
                                                                    {isTaskCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                                </button>
                                                                <span className={`task-mini-title ${isTaskCompleted ? 'done' : ''}`}>
                                                                    {task.title}
                                                                </span>
                                                                <span className={`task-mini-date ${isOverdue ? 'overdue' : ''}`}>
                                                                    {formatDate(task.dueDate)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Invoices Section */}
                                        <div className="project-section">
                                            <div className="section-header">
                                                <h4><Receipt size={16} /> Fatture ({project.projectInvoices.length})</h4>
                                                <span className="section-summary">
                                                    {formatCurrency(project.totalPaid)} / {formatCurrency(project.totalInvoiced)}
                                                </span>
                                            </div>
                                            {project.projectInvoices.length === 0 ? (
                                                <div className="section-empty">
                                                    Nessuna fattura collegata
                                                </div>
                                            ) : (
                                                <div className="invoice-list-mini">
                                                    {project.projectInvoices.map(inv => (
                                                        <div
                                                            key={inv.id}
                                                            className={`invoice-mini ${inv.status}`}
                                                        >
                                                            <span className="invoice-mini-num">{inv.invoiceNumber}</span>
                                                            <span className="invoice-mini-amount">{formatCurrency(inv.amount)}</span>
                                                            <span className={`invoice-mini-status ${inv.status}`}>
                                                                {inv.status === 'pagata' ? 'Incassata' :
                                                                 inv.status === 'emessa' ? 'Emessa' : 'Da emettere'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Dates Section */}
                                        <div className="project-dates">
                                            {project.expectedInvoiceDate && (
                                                <div className="date-item">
                                                    <FileText size={14} />
                                                    <span>Fatturazione prevista: {formatDate(project.expectedInvoiceDate)}</span>
                                                </div>
                                            )}
                                            {project.expectedPaymentDate && (
                                                <div className="date-item">
                                                    <Euro size={14} />
                                                    <span>Incasso previsto: {formatDate(project.expectedPaymentDate)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
