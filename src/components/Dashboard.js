import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Euro, Target, TrendingUp, CheckSquare, ArrowUpRight, ArrowDownRight, Users, Clock, Zap, ChevronRight, Plus, Phone } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import COLORS from '../constants/colors';

const KPICard = ({ title, value, change, changeType, icon, color, onClick }) => (
    <div className="kpi-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div className="kpi-header">
            <span className="kpi-title">{title}</span>
            <div className={`kpi-icon ${color}`}>{icon}</div>
        </div>
        <div className="kpi-value">{value}</div>
        <div className={`kpi-change ${changeType}`}>
            {changeType === 'positive' ? <ArrowUpRight size={16} /> : changeType === 'negative' ? <ArrowDownRight size={16} /> : null}
            <span>{change}</span>
        </div>
    </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
    <button className="quick-action-btn" onClick={onClick}>
        <div className={`quick-action-icon ${color}`}>{icon}</div>
        <span>{label}</span>
    </button>
);

export default function Dashboard({ opportunities, tasks, contacts, setActiveView }) {
    const [timeRange, setTimeRange] = useState('month');

    // Calcoli KPI con confronto periodo precedente
    const kpiData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filtra opportunità per periodo corrente e precedente
        // Filtra opportunità per periodo corrente e precedente

        const lastMonthOpps = opportunities.filter(o => {
            if (!o.closeDate) return false;
            const d = new Date(o.closeDate);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        // Pipeline totale
        const totalPipeline = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        ).reduce((sum, o) => sum + (o.value || 0), 0);

        const lastMonthPipeline = lastMonthOpps.reduce((sum, o) => sum + (o.value || 0), 0);
        const pipelineChange = lastMonthPipeline > 0
            ? (((totalPipeline - lastMonthPipeline) / lastMonthPipeline) * 100).toFixed(1)
            : 0;

        // Pipeline ponderata
        const weightedPipeline = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        ).reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0);

        // Tasso conversione
        const wonDeals = opportunities.filter(o =>
            o.stage?.toLowerCase().includes('vinto') ||
            o.originalStage?.toLowerCase().includes('vinto')
        ).length;

        const closedDeals = opportunities.filter(o =>
            o.stage?.toLowerCase().includes('chiuso')
        ).length;

        const conversionRate = closedDeals > 0 ? ((wonDeals / closedDeals) * 100).toFixed(1) : 0;

        // Attività in scadenza oggi
        const today = new Date().toISOString().split('T')[0];
        const dueTodayCount = tasks.filter(t =>
            t.dueDate === today && t.status !== 'Completata'
        ).length;

        const openTasks = tasks.filter(t => t.status !== 'Completata').length;

        return {
            totalPipeline,
            pipelineChange,
            weightedPipeline,
            conversionRate,
            openTasks,
            dueTodayCount,
            wonDeals,
            totalContacts: contacts.length
        };
    }, [opportunities, tasks, contacts]);

    // Dati vendite mensili calcolati
    const salesData = useMemo(() => {
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        const currentYear = new Date().getFullYear();

        const monthlyData = months.map((m, idx) => ({
            month: m,
            vendite: 0,
            opportunita: 0,
            target: 50000
        }));

        opportunities.forEach(opp => {
            if (opp.closeDate) {
                const date = new Date(opp.closeDate);
                if (date.getFullYear() === currentYear) {
                    const monthIdx = date.getMonth();
                    if (monthlyData[monthIdx]) {
                        if (opp.stage?.toLowerCase().includes('vinto') || opp.originalStage?.toLowerCase().includes('vinto')) {
                            monthlyData[monthIdx].vendite += opp.value || 0;
                        }
                        monthlyData[monthIdx].opportunita++;
                    }
                }
            }
        });

        return monthlyData;
    }, [opportunities]);

    // Pipeline per fase
    const pipelineData = useMemo(() => {
        return pipelineStages.map(stage => ({
            name: stage,
            value: opportunities.filter(o => o.stage === stage).reduce((sum, o) => sum + (o.value || 0), 0),
            count: opportunities.filter(o => o.stage === stage).length
        })).filter(d => d.value > 0);
    }, [opportunities]);

    // Attività per tipo
    const tasksByType = useMemo(() => {
        const types = { 'Chiamata': 0, 'Email': 0, 'Meeting': 0, 'Documento': 0 };
        tasks.forEach(t => {
            if (types[t.type] !== undefined) {
                types[t.type]++;
            }
        });
        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    // Prossime attività (entro 7 giorni)
    const upcomingTasks = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        return tasks
            .filter(t => {
                if (t.status === 'Completata') return false;
                if (!t.dueDate) return true;
                const dueDate = new Date(t.dueDate);
                return dueDate <= nextWeek;
            })
            .sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            })
            .slice(0, 5);
    }, [tasks]);

    // Opportunità hot (alta probabilità, valore alto)
    const hotOpportunities = useMemo(() => {
        return opportunities
            .filter(o => !o.stage?.toLowerCase().includes('chiuso'))
            .sort((a, b) => ((b.value || 0) * (b.probability || 0)) - ((a.value || 0) * (a.probability || 0)))
            .slice(0, 4);
    }, [opportunities]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
        return `€${value}`;
    };

    const getChangeType = (value) => {
        if (value > 0) return 'positive';
        if (value < 0) return 'negative';
        return 'neutral';
    };

    const styles = `
        .dashboard {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .dashboard-welcome h1 {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
        }

        .dashboard-welcome p {
            color: #64748b;
            font-size: 14px;
        }

        .quick-actions {
            display: flex;
            gap: 12px;
        }

        .quick-action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            cursor: pointer;
            transition: all 0.2s;
        }

        .quick-action-btn:hover {
            border-color: #3b82f6;
            background: #f8fafc;
        }

        .quick-action-icon {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .quick-action-icon.blue { background: #dbeafe; color: #2563eb; }
        .quick-action-icon.green { background: #dcfce7; color: #16a34a; }
        .quick-action-icon.purple { background: #f3e8ff; color: #9333ea; }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }

        .kpi-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.3s;
        }

        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }

        .kpi-title {
            font-size: 14px;
            font-weight: 500;
            color: #64748b;
        }

        .kpi-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .kpi-icon.blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
        .kpi-icon.green { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #16a34a; }
        .kpi-icon.purple { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); color: #9333ea; }
        .kpi-icon.orange { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #ea580c; }

        .kpi-value {
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
        }

        .kpi-change {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            font-weight: 500;
        }

        .kpi-change.positive { color: #16a34a; }
        .kpi-change.negative { color: #dc2626; }
        .kpi-change.neutral { color: #64748b; }

        .charts-row {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }

        .chart-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .chart-header h3 {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
        }

        .chart-filter {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 13px;
            color: #475569;
            background: white;
            cursor: pointer;
        }

        .bottom-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .recent-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-header h3 {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .text-btn {
            background: none;
            border: none;
            color: #3b82f6;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .text-btn:hover {
            color: #1d4ed8;
        }

        .recent-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .recent-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 16px;
            background: #f8fafc;
            border-radius: 12px;
            transition: all 0.2s;
            cursor: pointer;
        }

        .recent-item:hover {
            background: #f1f5f9;
            transform: translateX(4px);
        }

        .recent-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .recent-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
        }

        .recent-subtitle {
            font-size: 12px;
            color: #64748b;
        }

        .recent-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
        }

        .recent-value {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
        }

        .stage-badge, .priority-badge {
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: uppercase;
        }

        .stage-badge { background: #dbeafe; color: #1d4ed8; }
        .priority-badge.alta { background: #fee2e2; color: #dc2626; }
        .priority-badge.media { background: #fef3c7; color: #d97706; }
        .priority-badge.bassa { background: #dcfce7; color: #16a34a; }

        .due-date {
            font-size: 12px;
            color: #64748b;
        }

        .hot-badge {
            background: linear-gradient(135deg, #f97316, #ef4444);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
            margin-left: 8px;
        }

        .pie-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 16px;
            justify-content: center;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #64748b;
        }

        .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .insights-card {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 16px;
            padding: 24px;
            color: white;
        }

        .insights-card h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .insight-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 13px;
        }

        .insight-icon {
            width: 36px;
            height: 36px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 1200px) {
            .kpi-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .kpi-grid {
                grid-template-columns: 1fr;
            }
            .charts-row, .bottom-row {
                grid-template-columns: 1fr;
            }
            .quick-actions {
                display: none;
            }
        }
    `;

    return (
        <div className="dashboard">
            <style>{styles}</style>

            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <h1>👋 Bentornato!</h1>
                    <p>Ecco cosa sta succedendo con il tuo CRM oggi</p>
                </div>
                <div className="quick-actions">
                    <QuickAction
                        icon={<Phone size={16} />}
                        label="Nuova Chiamata"
                        color="blue"
                        onClick={() => setActiveView('tasks')}
                    />
                    <QuickAction
                        icon={<Plus size={16} />}
                        label="Nuova Opportunità"
                        color="green"
                        onClick={() => setActiveView('opportunities')}
                    />
                    <QuickAction
                        icon={<Users size={16} />}
                        label="Nuovo Contatto"
                        color="purple"
                        onClick={() => setActiveView('contacts')}
                    />
                </div>
            </div>

            <div className="kpi-grid">
                <KPICard
                    title="Pipeline Totale"
                    value={formatCurrency(kpiData.totalPipeline)}
                    change={`${kpiData.pipelineChange > 0 ? '+' : ''}${kpiData.pipelineChange}% vs mese scorso`}
                    changeType={getChangeType(parseFloat(kpiData.pipelineChange))}
                    icon={<Euro size={24} />}
                    color="blue"
                    onClick={() => setActiveView('pipeline')}
                />
                <KPICard
                    title="Pipeline Ponderata"
                    value={formatCurrency(kpiData.weightedPipeline)}
                    change={`${kpiData.wonDeals} deal vinti`}
                    changeType="positive"
                    icon={<Target size={24} />}
                    color="green"
                    onClick={() => setActiveView('pipeline')}
                />
                <KPICard
                    title="Tasso Conversione"
                    value={`${kpiData.conversionRate}%`}
                    change={`su ${opportunities.length} totali`}
                    changeType="neutral"
                    icon={<TrendingUp size={24} />}
                    color="purple"
                    onClick={() => setActiveView('opportunities')}
                />
                <KPICard
                    title="Attività Aperte"
                    value={kpiData.openTasks}
                    change={kpiData.dueTodayCount > 0 ? `${kpiData.dueTodayCount} in scadenza oggi` : 'Nessuna urgente'}
                    changeType={kpiData.dueTodayCount > 0 ? 'negative' : 'neutral'}
                    icon={<CheckSquare size={24} />}
                    color="orange"
                    onClick={() => setActiveView('tasks')}
                />
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>📈 Andamento Vendite {new Date().getFullYear()}</h3>
                        <select
                            className="chart-filter"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="month">Ultimi 6 mesi</option>
                            <option value="year">Anno corrente</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip
                                formatter={(value, name) => [formatCurrency(value), name === 'vendite' ? 'Vendite Chiuse' : 'Target']}
                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="vendite" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} name="Vendite" />
                            <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>🎯 Pipeline per Fase</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pipelineData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {pipelineData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                        {pipelineData.map((entry, index) => (
                            <div key={entry.name} className="legend-item">
                                <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                                <span>{entry.name} ({entry.count})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bottom-row">
                <div className="recent-card">
                    <div className="card-header">
                        <h3>🔥 Opportunità Hot</h3>
                        <button className="text-btn" onClick={() => setActiveView('opportunities')}>
                            Vedi tutte <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="recent-list">
                        {hotOpportunities.length > 0 ? hotOpportunities.map(opp => (
                            <div key={opp.id} className="recent-item">
                                <div className="recent-info">
                                    <span className="recent-title">
                                        {opp.title}
                                        {(opp.probability || 0) >= 70 && <span className="hot-badge">HOT</span>}
                                    </span>
                                    <span className="recent-subtitle">{opp.company} • {opp.probability || 0}% probabilità</span>
                                </div>
                                <div className="recent-meta">
                                    <span className="recent-value">{formatCurrency(opp.value || 0)}</span>
                                    <span className="stage-badge">{opp.stage}</span>
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                                Nessuna opportunità attiva
                            </p>
                        )}
                    </div>
                </div>

                <div className="recent-card">
                    <div className="card-header">
                        <h3>📋 Prossime Attività</h3>
                        <button className="text-btn" onClick={() => setActiveView('tasks')}>
                            Vedi tutte <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="recent-list">
                        {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                            <div key={task.id} className="recent-item">
                                <div className="recent-info">
                                    <span className="recent-title">{task.title}</span>
                                    <span className="recent-subtitle">
                                        {task.type} • {contacts.find(c => c.id === task.contactId)?.name || 'Non assegnato'}
                                    </span>
                                </div>
                                <div className="recent-meta">
                                    <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority}</span>
                                    <span className="due-date">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'Nessuna data'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                                Nessuna attività in programma
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="insights-card">
                    <h3><Zap size={20} /> Insights AI</h3>
                    <div className="insight-item">
                        <div className="insight-icon"><TrendingUp size={18} /></div>
                        <span>
                            {kpiData.conversionRate > 50
                                ? `Ottimo tasso di conversione! Sei sopra la media del settore.`
                                : `Il tasso di conversione può migliorare. Considera di qualificare meglio i lead.`
                            }
                        </span>
                    </div>
                    <div className="insight-item">
                        <div className="insight-icon"><Clock size={18} /></div>
                        <span>
                            {kpiData.openTasks > 10
                                ? `Hai ${kpiData.openTasks} attività aperte. Prioritizza quelle urgenti!`
                                : `Le tue attività sono sotto controllo. Continua così!`
                            }
                        </span>
                    </div>
                    <div className="insight-item">
                        <div className="insight-icon"><Euro size={18} /></div>
                        <span>
                            {hotOpportunities.length > 0
                                ? `Focus su ${hotOpportunities[0]?.company}: opportunità da ${formatCurrency(hotOpportunities[0]?.value || 0)}`
                                : `Crea nuove opportunità per alimentare la pipeline.`
                            }
                        </span>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>📊 Attività per Tipo</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={tasksByType}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
