import React, { useState, useMemo } from 'react';
import {
    FolderKanban, Plus, CheckCircle, Circle, Clock, Calendar, Euro, FileText,
    ChevronDown, ChevronRight, Target, Users, Receipt, AlertTriangle,
    Edit2, Archive, Check, Building, Play, Eye, Package, Lock
} from 'lucide-react';
import { PageHeader, KPICard, KPISection } from './ui';
import api from '../api/api';
import { formatCurrency, formatDate } from '../utils/formatters';

// Definizione colonne Kanban per progetti
const PROJECT_COLUMNS = [
    { id: 'in_lavorazione', title: 'In Lavorazione', icon: Play, color: 'blue' },
    { id: 'in_revisione', title: 'In Revisione', icon: Eye, color: 'orange' },
    { id: 'consegnato', title: 'Consegnato', icon: Package, color: 'green' },
    { id: 'chiuso', title: 'Chiuso', icon: Lock, color: 'purple' }
];

export default function Projects({ opportunities, tasks, invoices, contacts, openAddModal, handleToggleTask, refreshData, onCreateInvoice }) {
    const [expandedProject, setExpandedProject] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [draggedProject, setDraggedProject] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

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

                // Check se tutte le fatture sono pagate
                const allInvoicesPaid = projectInvoices.length > 0 && projectInvoices.every(i => i.status === 'pagata');

                // Stato overdue
                const hasOverdueTasks = projectTasks.some(t =>
                    t.status !== 'Completata' && new Date(t.dueDate) < new Date()
                );

                // Contatto collegato
                const contact = contacts.find(c => c.id === opp.contactId);

                // Status del progetto (default: in_lavorazione)
                const projectStatus = opp.projectStatus || 'in_lavorazione';

                return {
                    ...opp,
                    projectTasks,
                    completedTasks,
                    taskProgress,
                    projectInvoices,
                    paidInvoices,
                    totalInvoiced,
                    totalPaid,
                    allInvoicesPaid,
                    hasOverdueTasks,
                    contact,
                    projectStatus
                };
            })
            .sort((a, b) => new Date(b.closeDate) - new Date(a.closeDate));
    }, [opportunities, tasks, invoices, contacts]);

    // Progetti per colonna
    const projectsByColumn = useMemo(() => {
        const columns = {};
        PROJECT_COLUMNS.forEach(col => {
            columns[col.id] = projects.filter(p => p.projectStatus === col.id);
        });
        // Archiviati separati
        columns['archiviato'] = projects.filter(p => p.projectStatus === 'archiviato');
        return columns;
    }, [projects]);

    // Stats
    const stats = useMemo(() => {
        const active = projects.filter(p => p.projectStatus !== 'archiviato' && p.projectStatus !== 'chiuso').length;
        const inProgress = projectsByColumn['in_lavorazione']?.length || 0;
        const delivered = projectsByColumn['consegnato']?.length || 0;
        const totalValue = projects.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
        const overdue = projects.filter(p => p.hasOverdueTasks && p.projectStatus !== 'archiviato').length;

        return { active, inProgress, delivered, totalValue, overdue };
    }, [projects, projectsByColumn]);

    const toggleExpand = (projectId) => {
        setExpandedProject(expandedProject === projectId ? null : projectId);
    };

    // Drag & Drop handlers
    const handleDragStart = (e, project) => {
        setDraggedProject(project);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedProject(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedProject || draggedProject.projectStatus === newStatus) {
            return;
        }

        try {
            await api.updateProjectStatus(draggedProject.id, newStatus);
            if (refreshData) {
                refreshData();
            }
        } catch (error) {
            console.error('Failed to update project status:', error);
            alert('Errore nell\'aggiornamento dello stato del progetto');
        }
    };

    // Logica per suggerire avanzamento di stato
    const getPromotionSuggestion = (project) => {
        const { projectStatus, taskProgress, allInvoicesPaid, projectTasks, projectInvoices } = project;

        // In Lavorazione → In Revisione: tutti i task completati
        if (projectStatus === 'in_lavorazione' && taskProgress === 100 && projectTasks.length > 0) {
            return { nextStatus: 'in_revisione', label: 'Pronto per revisione', icon: Eye };
        }

        // In Revisione → Consegnato: manuale (approvazione cliente)
        // Nessun suggerimento automatico per questo step

        // Consegnato → Chiuso: tutte le fatture pagate
        if (projectStatus === 'consegnato' && allInvoicesPaid && projectInvoices.length > 0) {
            return { nextStatus: 'chiuso', label: 'Pronto per chiusura', icon: Lock };
        }

        // Chiuso → Archiviato: manuale
        if (projectStatus === 'chiuso') {
            return { nextStatus: 'archiviato', label: 'Archivia progetto', icon: Archive };
        }

        return null;
    };

    // Azione rapida per avanzare stato
    const handlePromote = async (project, nextStatus) => {
        try {
            await api.updateProjectStatus(project.id, nextStatus);
            if (refreshData) {
                refreshData();
            }
        } catch (error) {
            console.error('Failed to promote project:', error);
            alert('Errore nell\'avanzamento del progetto');
        }
    };

    // Render card progetto
    const renderProjectCard = (project) => {
        const isExpanded = expandedProject === project.id;
        const promotion = getPromotionSuggestion(project);

        return (
            <div
                key={project.id}
                className={`project-kanban-card ${project.hasOverdueTasks ? 'has-overdue' : ''} ${draggedProject?.id === project.id ? 'dragging' : ''} ${promotion ? 'has-promotion' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, project)}
                onDragEnd={handleDragEnd}
            >
                {/* Promotion Banner */}
                {promotion && (
                    <div className="promotion-banner" onClick={(e) => { e.stopPropagation(); handlePromote(project, promotion.nextStatus); }}>
                        <promotion.icon size={12} />
                        <span>{promotion.label}</span>
                        <ChevronRight size={12} />
                    </div>
                )}

                {/* Card Header */}
                <div className="project-kanban-header" onClick={() => toggleExpand(project.id)}>
                    <div className="project-kanban-title">
                        <h4>{project.title}</h4>
                        <span className="project-kanban-company">{project.company}</span>
                    </div>
                    <div className="project-kanban-expand">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                </div>

                {/* Card Stats */}
                <div className="project-kanban-stats">
                    <div className="kanban-stat">
                        <Euro size={12} />
                        <span>{formatCurrency(project.value)}</span>
                    </div>
                    <div className="kanban-stat">
                        <CheckCircle size={12} />
                        <span>{project.completedTasks.length}/{project.projectTasks.length}</span>
                    </div>
                    <div className="kanban-stat">
                        <Receipt size={12} />
                        <span>{project.paidInvoices.length}/{project.projectInvoices.length}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="project-kanban-progress">
                    <div className="progress-bar-mini">
                        <div
                            className="progress-fill-mini"
                            style={{ width: `${project.taskProgress}%` }}
                        />
                    </div>
                    <span className="progress-label">{project.taskProgress}%</span>
                </div>

                {/* Badges */}
                <div className="project-kanban-badges">
                    {project.hasOverdueTasks && (
                        <span className="badge badge-danger">
                            <AlertTriangle size={10} /> Scadenze
                        </span>
                    )}
                    {project.allInvoicesPaid && project.projectInvoices.length > 0 && (
                        <span className="badge badge-success">
                            <Check size={10} /> Pagato
                        </span>
                    )}
                    {project.contact && (
                        <span className="badge badge-neutral">
                            <Users size={10} /> {project.contact.name}
                        </span>
                    )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="project-kanban-details">
                        {/* Quick Actions */}
                        <div className="kanban-actions">
                            <button
                                className="kanban-action-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openAddModal('task', {
                                        opportunityId: project.id,
                                        title: `Task per: ${project.title}`
                                    });
                                }}
                            >
                                <Plus size={12} /> Task
                            </button>
                            {onCreateInvoice && (
                                <button
                                    className="kanban-action-btn invoice-action"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCreateInvoice(project);
                                    }}
                                >
                                    <Receipt size={12} /> Fattura
                                </button>
                            )}
                            <button
                                className="kanban-action-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openAddModal('opportunity', project);
                                }}
                            >
                                <Edit2 size={12} /> Modifica
                            </button>
                        </div>

                        {/* Tasks mini list */}
                        {project.projectTasks.length > 0 && (
                            <div className="kanban-section">
                                <div className="kanban-section-title">Attività</div>
                                {project.projectTasks.slice(0, 3).map(task => {
                                    const isCompleted = task.status === 'Completata';
                                    return (
                                        <div key={task.id} className={`kanban-task-item ${isCompleted ? 'done' : ''}`}>
                                            <button
                                                className="kanban-task-check"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleTask(task.id);
                                                }}
                                            >
                                                {isCompleted ? <CheckCircle size={14} /> : <Circle size={14} />}
                                            </button>
                                            <span className={isCompleted ? 'task-done' : ''}>{task.title}</span>
                                        </div>
                                    );
                                })}
                                {project.projectTasks.length > 3 && (
                                    <div className="kanban-more">+{project.projectTasks.length - 3} altre</div>
                                )}
                            </div>
                        )}

                        {/* Invoices summary */}
                        {project.projectInvoices.length > 0 && (
                            <div className="kanban-section">
                                <div className="kanban-section-title">Fatture</div>
                                <div className="kanban-invoice-summary">
                                    <span>Incassato: {formatCurrency(project.totalPaid)}</span>
                                    <span>/ {formatCurrency(project.totalInvoiced)}</span>
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="kanban-dates">
                            {project.expectedInvoiceDate && (
                                <div className="kanban-date">
                                    <FileText size={12} />
                                    <span>Fatt: {formatDate(project.expectedInvoiceDate, 'monthDay')}</span>
                                </div>
                            )}
                            {project.expectedPaymentDate && (
                                <div className="kanban-date">
                                    <Euro size={12} />
                                    <span>Inc: {formatDate(project.expectedPaymentDate, 'monthDay')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                title="Progetti"
                subtitle={`${projects.length} progetti • ${stats.active} attivi`}
                icon={<FolderKanban size={24} />}
            >
                <label className="show-archived-toggle">
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.target.checked)}
                    />
                    <span>Mostra archiviati ({projectsByColumn['archiviato']?.length || 0})</span>
                </label>
            </PageHeader>

            {/* KPI Section */}
            <KPISection>
                <KPICard
                    title="In Lavorazione"
                    value={stats.inProgress}
                    icon={<Play size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Consegnati"
                    value={stats.delivered}
                    icon={<Package size={20} />}
                    color="green"
                />
                <KPICard
                    title="Valore Totale"
                    value={formatCurrency(stats.totalValue)}
                    icon={<Euro size={20} />}
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

            {/* Kanban Board */}
            <div className="kanban-board projects-kanban">
                {PROJECT_COLUMNS.map(column => {
                    const Icon = column.icon;
                    const columnProjects = projectsByColumn[column.id] || [];
                    const columnValue = columnProjects.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);

                    return (
                        <div
                            key={column.id}
                            className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className={`kanban-column-header ${column.color}`}>
                                <div className="column-title">
                                    <Icon size={16} />
                                    <span>{column.title}</span>
                                    <span className="column-count">{columnProjects.length}</span>
                                </div>
                                <div className="column-value">{formatCurrency(columnValue)}</div>
                            </div>
                            <div className="kanban-column-content">
                                {columnProjects.length === 0 ? (
                                    <div className="kanban-empty">
                                        Nessun progetto
                                    </div>
                                ) : (
                                    columnProjects.map(project => renderProjectCard(project))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Archived Projects (if toggled) */}
            {showArchived && projectsByColumn['archiviato']?.length > 0 && (
                <div className="archived-section">
                    <div className="archived-header">
                        <Archive size={18} />
                        <span>Progetti Archiviati ({projectsByColumn['archiviato'].length})</span>
                    </div>
                    <div className="archived-projects">
                        {projectsByColumn['archiviato'].map(project => (
                            <div key={project.id} className="archived-project-card">
                                <div className="archived-project-info">
                                    <strong>{project.title}</strong>
                                    <span>{project.company}</span>
                                </div>
                                <div className="archived-project-value">
                                    {formatCurrency(project.value)}
                                </div>
                                <div className="archived-project-date">
                                    {formatDate(project.closeDate, 'monthDay')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
