import React, { useMemo, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ComposedChart, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Euro, Target, TrendingUp, CheckSquare, ArrowUpRight, ArrowDownRight, Users, Clock, Zap, ChevronRight, Plus, Phone, Award, Calendar } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import COLORS from '../constants/colors';
import { MONTHLY_TARGETS, ANNUAL_TARGET } from '../constants/targets';

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

export default function Dashboard({ opportunities, tasks, contacts, invoices = [], setActiveView }) {
    const [timeRange, setTimeRange] = useState('year');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Calcoli KPI
    const kpiData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = selectedYear; // Use selected year instead of current year

        // Target Mese Corrente
        const currentMonthTarget = MONTHLY_TARGETS[currentMonth]?.target || 0;

        // Fatturato Mese Corrente (Opportunità Vinte)
        const currentMonthRevenue = opportunities
            .filter(o => {
                if (!o.closeDate) return false;
                const d = new Date(o.closeDate);
                return d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear &&
                    (o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto');
            })
            .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        // Distanza dal target
        const targetGap = currentMonthTarget - currentMonthRevenue;
        const targetProgress = currentMonthTarget > 0 ? (currentMonthRevenue / currentMonthTarget) * 100 : 0;

        // Fatturato Annuale
        const annualRevenue = opportunities
            .filter(o => {
                if (!o.closeDate) return false;
                const d = new Date(o.closeDate);
                return d.getFullYear() === currentYear &&
                    (o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto');
            })
            .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        const annualProgress = (annualRevenue / ANNUAL_TARGET) * 100;

        // Pipeline totale
        const totalPipeline = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        ).reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        // Attività urgenti
        const today = new Date().toISOString().split('T')[0];
        const dueTodayCount = tasks.filter(t =>
            t.dueDate === today && t.status !== 'Completata'
        ).length;

        // Fatturato Incassato/Emesso (Fatture)
        const invoicedRevenue = invoices
            .filter(i => {
                const dateStr = i.issueDate || i.date;
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return d.getFullYear() === currentYear && i.status !== 'Bozza' && i.status !== 'Annullata';
            })
            .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

        return {
            currentMonthRevenue,
            currentMonthTarget,
            targetGap,
            targetProgress,
            annualRevenue, // This is "Venduto" (Closed Won Opps)
            invoicedRevenue, // This is "Fatturato" (Invoices)
            annualProgress,
            totalPipeline,
            dueTodayCount,
            openTasks: tasks.filter(t => t.status !== 'Completata').length
        };
    }, [opportunities, tasks, invoices, selectedYear]); // Add invoices and selectedYear to dependencies

    // Dati Grafico Target vs Actual
    const chartData = useMemo(() => {
        const currentYear = selectedYear; // Use selected year

        return MONTHLY_TARGETS.map(t => {
            const actual = opportunities
                .filter(o => {
                    if (!o.closeDate) return false;
                    const d = new Date(o.closeDate);
                    return d.getMonth() === t.month &&
                        d.getFullYear() === currentYear &&
                        (o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto');
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            const invoiced = invoices
                .filter(i => {
                    const dateStr = i.issueDate || i.date;
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    return d.getMonth() === t.month &&
                        d.getFullYear() === currentYear &&
                        i.status !== 'Bozza' && i.status !== 'Annullata';
                })
                .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

            return {
                month: t.label,
                target: t.target,
                actual: actual, // Venduto
                invoiced: invoiced, // Fatturato
                gap: actual - t.target
            };
        });
    }, [opportunities, invoices, selectedYear]); // Add invoices and selectedYear to dependencies

    const monthlyInvoicedData = useMemo(() => {
        const currentYear = selectedYear;
        return MONTHLY_TARGETS.map(t => {
            const invoiced = invoices
                .filter(i => {
                    const dateStr = i.issueDate || i.date;
                    if (!dateStr) return false;
                    const d = new Date(dateStr);
                    return d.getMonth() === t.month &&
                        d.getFullYear() === currentYear &&
                        i.status !== 'Bozza' && i.status !== 'Annullata';
                })
                .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

            return {
                month: t.label,
                invoiced: invoiced
            };
        });
    }, [invoices, selectedYear]);

    // Dati Trend Valore Medio Deal
    const avgDealValueData = useMemo(() => {
        const currentYear = selectedYear; // Use selected year
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

        return months.map((monthName, index) => {
            const monthDeals = opportunities.filter(o => {
                if (!o.closeDate) return false;
                const d = new Date(o.closeDate);
                return d.getMonth() === index &&
                    d.getFullYear() === currentYear &&
                    (o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto');
            });

            const totalValue = monthDeals.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
            const avgValue = monthDeals.length > 0 ? totalValue / monthDeals.length : 0;

            return {
                month: monthName,
                value: avgValue,
                count: monthDeals.length
            };
        });
    }, [opportunities, selectedYear]); // Add selectedYear to dependencies

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)} M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)} K`;
        return `€${value.toLocaleString('it-IT')} `;
    };

    // Generazione Messaggio AI
    const getAIMessage = () => {
        const { targetGap, dueTodayCount, currentMonthRevenue, currentMonthTarget } = kpiData;

        if (dueTodayCount > 0) {
            return `Hai ${dueTodayCount} attività in scadenza oggi.Inizia da quelle per mantenere il ritmo!`;
        }

        if (targetGap > 0) {
            return `Sei a ${formatCurrency(currentMonthRevenue)} questo mese.Ti mancano ${formatCurrency(targetGap)} per raggiungere l'obiettivo di ${formatCurrency(currentMonthTarget)}.`;
        }

        if (targetGap <= 0 && currentMonthTarget > 0) {
            return `Fantastico! Hai già superato l'obiettivo mensile di ${formatCurrency(Math.abs(targetGap))}. Punta al record annuale! 🚀`;
        }

        return "Tutto tranquillo oggi. È un buon momento per fare follow-up sui clienti inattivi.";
    };

    return (
        <div className="dashboard">
            {/* AI Daily Briefing Section */}
            <div className="ai-briefing-section">
                <div className="ai-briefing-header">
                    <div className="ai-avatar">
                        <Zap size={24} color="white" fill="white" />
                    </div>
                    <div className="ai-content">
                        <h2>Buongiorno, Valentino!</h2>
                        <p className="ai-message">{getAIMessage()}</p>
                    </div>
                </div>
                <div className="ai-stats-row">
                    <div className="ai-stat">
                        <span className="label">Obiettivo Mese</span>
                        <span className="value">{Math.round(kpiData.targetProgress)}%</span>
                        <div className="progress-bar-sm">
                            <div className="progress-fill" style={{ width: `${Math.min(kpiData.targetProgress, 100)}%`, background: kpiData.targetProgress >= 100 ? '#10b981' : '#3b82f6' }}></div>
                        </div>
                    </div>
                    <div className="ai-stat">
                        <span className="label">Obiettivo Anno (€85k)</span>
                        <span className="value">{Math.round(kpiData.annualProgress)}%</span>
                        <div className="progress-bar-sm">
                            <div className="progress-fill" style={{ width: `${Math.min(kpiData.annualProgress, 100)}%`, background: '#8b5cf6' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Main Charts */}
                <div className="main-chart-column">
                    {/* Target vs Actual Chart */}
                    <div className="chart-card large">
                        <div className="chart-header">
                            <div>
                                <h3>🎯 Performance {selectedYear}</h3>
                                <p className="subtitle">Fatturato Reale vs Obiettivi Mensili</p>
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid var(--gray-200)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                            <div className="chart-legend">
                                <span className="legend-item"><span className="dot target"></span>Target</span>
                                <span className="legend-item"><span className="dot actual"></span>Venduto</span>
                                <span className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span>Fatturato</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name) => [
                                        formatCurrency(value),
                                        name === 'actual' ? 'Venduto (Ordini)' :
                                            name === 'invoiced' ? 'Fatturato (Reale)' :
                                                'Obiettivo'
                                    ]}
                                />
                                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                                <Line type="monotone" dataKey="invoiced" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                <Line type="step" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Grafico Fatturato Mensile (Barre) */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title-group">
                                <div className="chart-icon green">
                                    <Euro size={20} />
                                </div>
                                <div>
                                    <h3>Andamento Fatturato {selectedYear}</h3>
                                    <p>Totale fatturato mese per mese</p>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyInvoicedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorInvoicedBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [formatCurrency(value), 'Fatturato']}
                                />
                                <Bar dataKey="invoiced" fill="url(#colorInvoicedBar)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Trend Valore Medio Deal */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div>
                                <h3>📈 Trend Valore Medio Deal</h3>
                                <p className="subtitle">Evoluzione del valore medio dei contratti chiusi</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={avgDealValueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [formatCurrency(value), 'Valore Medio']}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Sidebar (Quick Actions + Stats) */}
                <div className="sidebar-column">
                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <QuickAction icon={<Phone size={18} />} label="Chiamata" color="blue" onClick={() => setActiveView('tasks')} />
                        <QuickAction icon={<Plus size={18} />} label="Opportunità" color="green" onClick={() => setActiveView('opportunities')} />
                        <QuickAction icon={<Users size={18} />} label="Contatto" color="purple" onClick={() => setActiveView('contacts')} />
                    </div>

                    {/* KPI Cards Stacked */}
                    <div className="stat-box">
                        <div className="stat-icon-bg blue"><Euro size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">Venduto (Ordini)</span>
                            <span className="stat-value">{formatCurrency(kpiData.annualRevenue)}</span>
                            <span className="stat-sub">su {formatCurrency(ANNUAL_TARGET)}</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon-bg green"><CheckSquare size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">Fatturato (Reale)</span>
                            <span className="stat-value">{formatCurrency(kpiData.invoicedRevenue)}</span>
                            <span className="stat-sub">Totale fatture emesse</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon-bg green"><TrendingUp size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">Pipeline Attiva</span>
                            <span className="stat-value">{formatCurrency(kpiData.totalPipeline)}</span>
                            <span className="stat-sub">Valore potenziale</span>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon-bg orange"><CheckSquare size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-label">Da Fare</span>
                            <span className="stat-value">{kpiData.openTasks}</span>
                            <span className="stat-sub">{kpiData.dueTodayCount} in scadenza oggi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
