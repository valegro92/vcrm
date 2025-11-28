import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Clock, Phone, Mail, Video, FileText } from 'lucide-react';

export default function Calendar({ tasks, openAddModal, handleToggleTask }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                currentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                currentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                currentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    }, [currentDate]);

    const getTasksForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(t => t.dueDate === dateStr);
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    const getTaskIcon = (type) => {
        switch (type) {
            case 'Chiamata': return <Phone size={14} />;
            case 'Email': return <Mail size={14} />;
            case 'Meeting': return <Video size={14} />;
            case 'Documento': return <FileText size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    const styles = `
        .calendar-container {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 24px;
            height: calc(100vh - 150px);
        }

        .calendar-main {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .calendar-nav {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .calendar-title {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            min-width: 200px;
        }

        .nav-btn {
            background: #f1f5f9;
            border: none;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            color: #64748b;
            transition: all 0.2s;
        }

        .nav-btn:hover {
            background: #e2e8f0;
            color: #1e293b;
        }

        .today-btn {
            background: white;
            border: 1px solid #e2e8f0;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
        }

        .today-btn:hover {
            background: #f1f5f9;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
        }

        .day-header {
            padding: 12px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
        }

        .day-cell {
            aspect-ratio: 1;
            padding: 8px;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.15s;
            position: relative;
            min-height: 80px;
        }

        .day-cell:hover {
            background: #f8fafc;
        }

        .day-cell.other-month {
            background: #f8fafc;
        }

        .day-cell.other-month .day-number {
            color: #cbd5e1;
        }

        .day-cell.today {
            background: #eff6ff;
        }

        .day-cell.selected {
            background: #dbeafe;
            border-color: #3b82f6;
        }

        .day-number {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
        }

        .day-cell.today .day-number {
            background: #3b82f6;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .day-tasks {
            margin-top: 4px;
        }

        .day-task-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            margin-right: 3px;
        }

        .day-task-dot.high { background: #ef4444; }
        .day-task-dot.medium { background: #f59e0b; }
        .day-task-dot.low { background: #10b981; }

        .day-task-count {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }

        .calendar-sidebar {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .sidebar-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .sidebar-title {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
        }

        .add-task-btn {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border: none;
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }

        .add-task-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .selected-date {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 16px;
        }

        .task-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 400px;
            overflow-y: auto;
        }

        .task-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 10px;
            transition: all 0.2s;
        }

        .task-item:hover {
            background: #f1f5f9;
        }

        .task-item.completed {
            opacity: 0.6;
        }

        .task-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #cbd5e1;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s;
        }

        .task-checkbox:hover {
            border-color: #3b82f6;
        }

        .task-checkbox.checked {
            background: #10b981;
            border-color: #10b981;
            color: white;
        }

        .task-info {
            flex: 1;
            min-width: 0;
        }

        .task-title {
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
            margin-bottom: 4px;
        }

        .task-item.completed .task-title {
            text-decoration: line-through;
            color: #94a3b8;
        }

        .task-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #64748b;
        }

        .task-type {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .task-priority {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }

        .task-priority.alta { background: #fee2e2; color: #dc2626; }
        .task-priority.media { background: #fef3c7; color: #d97706; }
        .task-priority.bassa { background: #dcfce7; color: #16a34a; }

        .no-tasks {
            text-align: center;
            padding: 32px;
            color: #94a3b8;
        }

        .no-tasks-icon {
            font-size: 48px;
            margin-bottom: 8px;
        }

        .upcoming-section {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        @media (max-width: 1024px) {
            .calendar-container {
                grid-template-columns: 1fr;
            }
            .calendar-sidebar {
                flex-direction: row;
            }
            .sidebar-card {
                flex: 1;
            }
        }

        @media (max-width: 768px) {
            .calendar-sidebar {
                flex-direction: column;
            }
            .day-cell {
                min-height: 60px;
            }
        }
    `;

    return (
        <div className="calendar-container">
            <style>{styles}</style>

            <div className="calendar-main">
                <div className="calendar-header">
                    <div className="calendar-nav">
                        <button className="nav-btn" onClick={goToPreviousMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="calendar-title">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button className="nav-btn" onClick={goToNextMonth}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button className="today-btn" onClick={goToToday}>Oggi</button>
                </div>

                <div className="calendar-grid">
                    {dayNames.map(day => (
                        <div key={day} className="day-header">{day}</div>
                    ))}
                    {daysInMonth.map((dayObj, idx) => {
                        const dayTasks = getTasksForDate(dayObj.date);
                        return (
                            <div
                                key={idx}
                                className={`day-cell ${!dayObj.currentMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                                onClick={() => setSelectedDate(dayObj.date)}
                            >
                                <div className="day-number">{dayObj.day}</div>
                                {dayTasks.length > 0 && (
                                    <div className="day-tasks">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <span
                                                key={task.id}
                                                className={`day-task-dot ${task.priority?.toLowerCase() || 'medium'}`}
                                            />
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <div className="day-task-count">+{dayTasks.length - 3}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="calendar-sidebar">
                <div className="sidebar-card">
                    <div className="sidebar-header">
                        <h3 className="sidebar-title">
                            {selectedDate ? 'Attività del giorno' : 'Seleziona una data'}
                        </h3>
                        {selectedDate && (
                            <button className="add-task-btn" onClick={() => openAddModal('task', { dueDate: selectedDate.toISOString().split('T')[0] })}>
                                <Plus size={14} />
                                Aggiungi
                            </button>
                        )}
                    </div>

                    {selectedDate && (
                        <div className="selected-date">
                            {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    )}

                    <div className="task-list">
                        {!selectedDate ? (
                            <div className="no-tasks">
                                <div className="no-tasks-icon">📅</div>
                                <p>Clicca su una data per vedere le attività</p>
                            </div>
                        ) : selectedDateTasks.length === 0 ? (
                            <div className="no-tasks">
                                <div className="no-tasks-icon">✨</div>
                                <p>Nessuna attività per questa data</p>
                            </div>
                        ) : (
                            selectedDateTasks.map(task => (
                                <div key={task.id} className={`task-item ${task.status === 'Completata' ? 'completed' : ''}`}>
                                    <div
                                        className={`task-checkbox ${task.status === 'Completata' ? 'checked' : ''}`}
                                        onClick={() => handleToggleTask(task.id)}
                                    >
                                        {task.status === 'Completata' && <Check size={14} />}
                                    </div>
                                    <div className="task-info">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-meta">
                                            <span className="task-type">
                                                {getTaskIcon(task.type)}
                                                {task.type}
                                            </span>
                                            <span className={`task-priority ${task.priority?.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="sidebar-card upcoming-section">
                    <div className="sidebar-header">
                        <h3 className="sidebar-title">Prossime attività</h3>
                    </div>
                    <div className="task-list">
                        {tasks
                            .filter(t => t.status !== 'Completata' && t.dueDate >= new Date().toISOString().split('T')[0])
                            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                            .slice(0, 5)
                            .map(task => (
                                <div key={task.id} className="task-item">
                                    <div
                                        className="task-checkbox"
                                        onClick={() => handleToggleTask(task.id)}
                                    >
                                    </div>
                                    <div className="task-info">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-meta">
                                            <span className="task-type">
                                                <Clock size={12} />
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'Nessuna data'}
                                            </span>
                                            <span className={`task-priority ${task.priority?.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                        {tasks.filter(t => t.status !== 'Completata' && t.dueDate >= new Date().toISOString().split('T')[0]).length === 0 && (
                            <div className="no-tasks">
                                <p>Nessuna attività in programma</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
