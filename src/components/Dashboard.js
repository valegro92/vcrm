import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ReferenceLine, ComposedChart, Area
} from 'recharts';
import { Target, TrendingUp, Receipt, Wallet, AlertTriangle, Calendar, FolderKanban, Package, ArrowRight, CheckCircle2, Clock, FileText } from 'lucide-react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import {
    MONTH_NAMES_SHORT as MONTH_NAMES,
    FORFETTARIO_LIMIT,
    CURRENT_YEAR,
    generateYearOptions,
    getStageProbability
} from '../constants/business';
import { calculateForfettarioStats } from '../utils/invoiceCalculations';

export default function Dashboard({ opportunities, tasks, contacts, invoices = [], setActiveView }) {
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
    const [monthlyTargets, setMonthlyTargets] = useState(Array(12).fill(0).map((_, i) => ({ month: i, target: 0 })));
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [editingTargets, setEditingTargets] = useState([]);
    const [isSavingTarget, setIsSavingTarget] = useState(false);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const toast = useToast();

    // Carica target mensili dal database
    useEffect(() => {
        const loadTargets = async () => {
            try {
                const targets = await api.getMonthlyTargets(selectedYear);
                setMonthlyTargets(targets);
                setEditingTargets(targets.map(t => ({ ...t })));
            } catch (error) {
                console.error('Error loading targets:', error);
                const defaultTargets = Array(12).fill(0).map((_, i) => ({ month: i, target: 0 }));
                setMonthlyTargets(defaultTargets);
                setEditingTargets(defaultTargets);
            }
        };
        loadTargets();
    }, [selectedYear]);

    // Salva tutti i target
    const handleSaveTargets = async () => {
        setIsSavingTarget(true);
        try {
            await api.saveAllTargets(selectedYear, editingTargets);
            setMonthlyTargets(editingTargets.map(t => ({ ...t })));
            setShowTargetModal(false);
            toast.success('Target salvati con successo');
        } catch (error) {
            toast.error(error.message || 'Errore nel salvataggio dei target');
        } finally {
            setIsSavingTarget(false);
        }
    };

    // Target annuale totale
    const annualTarget = useMemo(() => {
        return monthlyTargets.reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0);
    }, [monthlyTargets]);

    // === DATI PER GRAFICI BI ===
    const biData = useMemo(() => {
        // Opportunita' vinte
        const wonOpportunities = opportunities.filter(o =>
            o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto'
        );

        // Pipeline attiva (non chiusa)
        const activeOffers = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        );

        // Probabilita' per stage
        const stageProbability = {
            'Lead': 0.1,
            'In contatto': 0.2,
            'Follow Up da fare': 0.4,
            'Revisionare offerta': 0.6
        };

        // Pipeline ponderata totale
        const weightedPipeline = activeOffers.reduce((sum, o) => {
            const prob = stageProbability[o.stage] || 0.3;
            return sum + ((parseFloat(o.value) || 0) * prob);
        }, 0);

        // Genera dati per ogni mese
        const monthlyData = MONTH_NAMES.map((monthName, index) => {
            const target = monthlyTargets[index]?.target || 0;

            const ordinato = wonOpportunities
                .filter(o => {
                    if (!o.closeDate) return false;
                    const d = new Date(o.closeDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            const ipotesiFatturato = wonOpportunities
                .filter(o => {
                    if (!o.expectedInvoiceDate) return false;
                    const d = new Date(o.expectedInvoiceDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            const ipotesiIncassato = wonOpportunities
                .filter(o => {
                    if (!o.expectedPaymentDate) return false;
                    const d = new Date(o.expectedPaymentDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            const fatturatoReale = invoices
                .filter(i => {
                    if (!i.issueDate) return false;
                    const d = new Date(i.issueDate);
                    return d.getMonth() === index &&
                           d.getFullYear() === selectedYear &&
                           (i.status === 'emessa' || i.status === 'pagata');
                })
                .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

            const incassatoReale = invoices
                .filter(i => {
                    if (!i.paidDate) return false;
                    const d = new Date(i.paidDate);
                    return d.getMonth() === index &&
                           d.getFullYear() === selectedYear &&
                           i.status === 'pagata';
                })
                .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

            const isCurrentYear = selectedYear === currentYear;
            const isFuture = isCurrentYear && index > currentMonth;

            return {
                month: monthName,
                monthIndex: index,
                target,
                ordinato,
                ipotesiFatturato,
                ipotesiIncassato,
                fatturatoReale,
                incassatoReale,
                isFuture,
                isPast: isCurrentYear ? index < currentMonth : true,
                isCurrent: isCurrentYear && index === currentMonth
            };
        });

        // Calcoli cumulativi
        let cumOrdinato = 0, cumIpotesiFatturato = 0, cumIpotesiIncassato = 0;
        let cumFatturatoReale = 0, cumIncassatoReale = 0, cumTarget = 0;

        const cumulativeData = monthlyData.map((m, index) => {
            cumOrdinato += m.ordinato;
            cumIpotesiFatturato += m.ipotesiFatturato;
            cumIpotesiIncassato += m.ipotesiIncassato;
            cumFatturatoReale += m.fatturatoReale;
            cumIncassatoReale += m.incassatoReale;
            cumTarget += m.target;

            return {
                ...m,
                cumOrdinato,
                cumIpotesiFatturato,
                cumIpotesiIncassato,
                cumFatturatoReale,
                cumIncassatoReale,
                cumTarget
            };
        });

        // KPI Summary
        const isCurrentYear = selectedYear === currentYear;
        const referenceMonth = isCurrentYear ? currentMonth : 11;
        const ytdOrdinato = cumulativeData[referenceMonth]?.cumOrdinato || 0;
        const ytdIpotesiFatturato = cumulativeData[referenceMonth]?.cumIpotesiFatturato || 0;
        const ytdIpotesiIncassato = cumulativeData[referenceMonth]?.cumIpotesiIncassato || 0;
        const ytdFatturatoReale = cumulativeData[referenceMonth]?.cumFatturatoReale || 0;
        const ytdIncassatoReale = cumulativeData[referenceMonth]?.cumIncassatoReale || 0;
        const ytdTarget = cumulativeData[referenceMonth]?.cumTarget || 0;

        // Full year cumulatives (for projections)
        const fullYearOrdinato = cumulativeData[11]?.cumOrdinato || 0;
        const fullYearIpotesiFatturato = cumulativeData[11]?.cumIpotesiFatturato || 0;
        const fullYearIpotesiIncassato = cumulativeData[11]?.cumIpotesiIncassato || 0;

        // Calcolo % verso limite forfettario
        const forfettarioStats = calculateForfettarioStats(invoices, selectedYear);
        const forfettarioProgress = forfettarioStats.progressPercent;
        const forfettarioRemaining = forfettarioStats.remaining;

        // GAP ANALYSIS
        const gapOrdinatoVsFatturato = ytdOrdinato - ytdFatturatoReale;
        const gapFatturatoVsIncassato = ytdFatturatoReale - ytdIncassatoReale;
        const gapOrdinatoVsTarget = ytdOrdinato - ytdTarget;

        // Proiezione fine anno basata su trend attuale
        const monthsElapsed = isCurrentYear ? currentMonth + 1 : 12;
        const projectedOrdinato = monthsElapsed > 0 ? (ytdOrdinato / monthsElapsed) * 12 : 0;
        const projectedFatturato = monthsElapsed > 0 ? (ytdFatturatoReale / monthsElapsed) * 12 : 0;
        const projectedIncassato = monthsElapsed > 0 ? (ytdIncassatoReale / monthsElapsed) * 12 : 0;

        // === METRICHE PROGETTI (DELIVERY) ===
        const projectsInProgress = wonOpportunities.filter(o =>
            o.projectStatus === 'in_lavorazione' || !o.projectStatus
        );
        const projectsInProgressCount = projectsInProgress.length;
        const projectsInProgressValue = projectsInProgress.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const projectsInReview = wonOpportunities.filter(o => o.projectStatus === 'in_revisione');
        const projectsInReviewCount = projectsInReview.length;
        const projectsDelivered = wonOpportunities.filter(o => o.projectStatus === 'consegnato');
        const projectsDeliveredCount = projectsDelivered.length;
        const projectsDeliveredValue = projectsDelivered.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const projectsClosed = wonOpportunities.filter(o => o.projectStatus === 'chiuso');
        const projectsClosedCount = projectsClosed.length;

        return {
            monthlyData,
            cumulativeData,
            ytdOrdinato,
            ytdIpotesiFatturato,
            ytdIpotesiIncassato,
            ytdFatturatoReale,
            ytdIncassatoReale,
            ytdTarget,
            weightedPipeline,
            forfettarioProgress,
            forfettarioRemaining,
            // Gap analysis
            gapOrdinatoVsFatturato,
            gapFatturatoVsIncassato,
            gapOrdinatoVsTarget,
            // Projections
            projectedOrdinato,
            projectedFatturato,
            projectedIncassato,
            fullYearOrdinato,
            fullYearIpotesiFatturato,
            fullYearIpotesiIncassato,
            annualTarget,
            // Project metrics
            projectsInProgressCount,
            projectsInProgressValue,
            projectsInReviewCount,
            projectsDeliveredCount,
            projectsDeliveredValue,
            projectsClosedCount
        };
    }, [opportunities, invoices, selectedYear, currentMonth, currentYear, monthlyTargets, annualTarget]);

    const formatTooltip = (value) => `€${value.toLocaleString('it-IT')}`;

    // Helper per calcolare percentuale progressbar
    const getProgressPercent = (value, target) => {
        if (!target || target === 0) return 0;
        return Math.min(100, Math.max(0, (value / target) * 100));
    };

    // Helper per determinare colore stato
    const getHealthColor = (percent) => {
        if (percent >= 90) return 'health-green';
        if (percent >= 70) return 'health-yellow';
        if (percent >= 50) return 'health-orange';
        return 'health-red';
    };

    // Colori
    const colors = {
        target: '#94a3b8',
        ordinato: '#3b82f6',
        ipotesiFatturato: '#fbbf24',
        ipotesiIncassato: '#a78bfa',
        fatturatoReale: '#f59e0b',
        incassatoReale: '#10b981',
        danger: '#ef4444'
    };

    // Calcolo progress percentuali per le card
    const ordinatoVsTarget = getProgressPercent(biData.ytdOrdinato, biData.ytdTarget);
    const fatturatoVsOrdinato = getProgressPercent(biData.ytdFatturatoReale, biData.ytdOrdinato);
    const incassatoVsFatturato = getProgressPercent(biData.ytdIncassatoReale, biData.ytdFatturatoReale);

    return (
        <div className="dashboard bi-dashboard">
            {/* Header */}
            <div className="bi-header">
                <div className="bi-header-left">
                    <h1>Business Intelligence</h1>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="year-selector"
                    >
                        {generateYearOptions(-2, 2).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button
                        className="target-btn"
                        onClick={() => setShowTargetModal(true)}
                        title="Imposta target mensili"
                    >
                        <Target size={18} />
                        Target: {formatCurrency(annualTarget)}
                    </button>
                </div>
            </div>

            {/* Alert Forfettario */}
            {biData.forfettarioProgress > 75 && (
                <div className={`forfettario-alert ${biData.forfettarioProgress > 90 ? 'danger' : 'warning'}`}>
                    <AlertTriangle size={20} />
                    <div>
                        <strong>Attenzione Limite Forfettario!</strong>
                        <span>
                            Hai incassato {formatCurrency(biData.ytdIncassatoReale)} su {formatCurrency(FORFETTARIO_LIMIT)} ({biData.forfettarioProgress.toFixed(1)}%).
                            Rimangono {formatCurrency(biData.forfettarioRemaining)}.
                        </span>
                    </div>
                </div>
            )}

            {/* === BUSINESS HEALTH: Flusso Ordinato > Fatturato > Incassato === */}
            <div className="bh-section">
                <div className="bh-section-header">
                    <h3>Salute del Business</h3>
                    <p>Il tuo flusso: Ordinato &rarr; Fatturato &rarr; Incassato</p>
                </div>

                <div className="bh-flow">
                    {/* CARD 1: Ordinato vs Target */}
                    <div className={`bh-card ${getHealthColor(ordinatoVsTarget)}`}>
                        <div className="bh-card-icon">
                            <TrendingUp size={22} />
                        </div>
                        <div className="bh-card-content">
                            <span className="bh-card-label">Ordinato vs Target</span>
                            <span className="bh-card-value">{formatCurrency(biData.ytdOrdinato)}</span>
                            <div className="bh-progress-bar">
                                <div
                                    className="bh-progress-fill"
                                    style={{ width: `${ordinatoVsTarget}%` }}
                                />
                            </div>
                            <div className="bh-card-detail">
                                <span className="bh-card-percent">{ordinatoVsTarget.toFixed(0)}%</span>
                                <span className="bh-card-target">su {formatCurrency(biData.ytdTarget)} target</span>
                            </div>
                            {biData.gapOrdinatoVsTarget !== 0 && (
                                <span className={`bh-card-delta ${biData.gapOrdinatoVsTarget >= 0 ? 'positive' : 'negative'}`}>
                                    {biData.gapOrdinatoVsTarget >= 0 ? '+' : ''}{formatCurrency(biData.gapOrdinatoVsTarget)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bh-flow-arrow"><ArrowRight size={20} /></div>

                    {/* CARD 2: Fatturato vs Ordinato */}
                    <div className={`bh-card ${getHealthColor(fatturatoVsOrdinato)}`}>
                        <div className="bh-card-icon">
                            <Receipt size={22} />
                        </div>
                        <div className="bh-card-content">
                            <span className="bh-card-label">Fatturato vs Ordinato</span>
                            <span className="bh-card-value">{formatCurrency(biData.ytdFatturatoReale)}</span>
                            <div className="bh-progress-bar">
                                <div
                                    className="bh-progress-fill"
                                    style={{ width: `${fatturatoVsOrdinato}%` }}
                                />
                            </div>
                            <div className="bh-card-detail">
                                <span className="bh-card-percent">{fatturatoVsOrdinato.toFixed(0)}%</span>
                                <span className="bh-card-target">su {formatCurrency(biData.ytdOrdinato)} ordinato</span>
                            </div>
                            {biData.gapOrdinatoVsFatturato > 0 && (
                                <span className="bh-card-delta negative">
                                    {formatCurrency(biData.gapOrdinatoVsFatturato)} da fatturare
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bh-flow-arrow"><ArrowRight size={20} /></div>

                    {/* CARD 3: Incassato vs Fatturato */}
                    <div className={`bh-card ${getHealthColor(incassatoVsFatturato)}`}>
                        <div className="bh-card-icon">
                            <Wallet size={22} />
                        </div>
                        <div className="bh-card-content">
                            <span className="bh-card-label">Incassato vs Fatturato</span>
                            <span className="bh-card-value">{formatCurrency(biData.ytdIncassatoReale)}</span>
                            <div className="bh-progress-bar">
                                <div
                                    className="bh-progress-fill"
                                    style={{ width: `${incassatoVsFatturato}%` }}
                                />
                            </div>
                            <div className="bh-card-detail">
                                <span className="bh-card-percent">{incassatoVsFatturato.toFixed(0)}%</span>
                                <span className="bh-card-target">su {formatCurrency(biData.ytdFatturatoReale)} fatturato</span>
                            </div>
                            {biData.gapFatturatoVsIncassato > 0 && (
                                <span className="bh-card-delta negative">
                                    {formatCurrency(biData.gapFatturatoVsIncassato)} da incassare
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Riga pipeline ponderata + forfettario */}
                <div className="bh-bottom-row">
                    <div className="bh-mini-card">
                        <Target size={16} />
                        <span className="bh-mini-label">Pipeline Ponderata</span>
                        <span className="bh-mini-value">{formatCurrency(biData.weightedPipeline)}</span>
                    </div>
                    <div className="bh-mini-card">
                        <TrendingUp size={16} />
                        <span className="bh-mini-label">Proiezione Fine Anno</span>
                        <span className="bh-mini-value">{formatCurrency(biData.projectedOrdinato)}</span>
                    </div>
                    <div className={`bh-mini-card ${biData.forfettarioProgress > 90 ? 'danger' : biData.forfettarioProgress > 75 ? 'warning' : ''}`}>
                        {biData.forfettarioProgress > 75 && <AlertTriangle size={16} />}
                        {biData.forfettarioProgress <= 75 && <CheckCircle2 size={16} />}
                        <span className="bh-mini-label">Limite 85K</span>
                        <span className="bh-mini-value">{biData.forfettarioProgress.toFixed(0)}%</span>
                        <span className="bh-mini-sub">Residuo: {formatCurrency(biData.forfettarioRemaining)}</span>
                    </div>
                </div>
            </div>

            {/* Sezione Delivery/Progetti */}
            <div className="bi-delivery-section">
                <h3><FolderKanban size={18} /> Stato Delivery</h3>
                <div className="delivery-kpis">
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon blue">
                            <FolderKanban size={20} />
                        </div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsInProgressCount}</span>
                            <span className="delivery-kpi-label">In Lavorazione</span>
                            <span className="delivery-kpi-amount">{formatCurrency(biData.projectsInProgressValue)}</span>
                        </div>
                    </div>
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon orange">
                            <Calendar size={20} />
                        </div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsInReviewCount}</span>
                            <span className="delivery-kpi-label">In Revisione</span>
                        </div>
                    </div>
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon green">
                            <Package size={20} />
                        </div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsDeliveredCount}</span>
                            <span className="delivery-kpi-label">Consegnati</span>
                            <span className="delivery-kpi-amount">{formatCurrency(biData.projectsDeliveredValue)}</span>
                        </div>
                    </div>
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon purple">
                            <Target size={20} />
                        </div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsClosedCount}</span>
                            <span className="delivery-kpi-label">Chiusi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRAFICO 1: Ordinato vs Target */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><TrendingUp size={18} /> Ordinato vs Target Mensile</h3>
                        <p>Confronto venduto vs obiettivo per ogni mese</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.target }}></span> Target</span>
                        <span><span className="dot" style={{ background: colors.ordinato }}></span> Ordinato</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={biData.monthlyData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <Bar dataKey="target" fill={colors.target} radius={[4, 4, 0, 0]} name="Target" />
                        <Bar dataKey="ordinato" fill={colors.ordinato} radius={[4, 4, 0, 0]} name="Ordinato" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 2: Fatturato Cumulativo */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><Receipt size={18} /> Fatturato Cumulativo</h3>
                        <p>Cumulo fatture emesse (reale) vs previsioni (ipotesi) vs target</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.fatturatoReale }}></span> Fatturato Reale</span>
                        <span><span className="dot" style={{ background: colors.ipotesiFatturato }}></span> Ipotesi Fatturato</span>
                        <span><span className="dot" style={{ background: colors.target }}></span> Target</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={biData.cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <Area type="monotone" dataKey="cumFatturatoReale" fill={colors.fatturatoReale} fillOpacity={0.3} stroke={colors.fatturatoReale} strokeWidth={3} name="Fatturato Reale" />
                        <Line type="monotone" dataKey="cumIpotesiFatturato" stroke={colors.ipotesiFatturato} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Ipotesi Fatturato" />
                        <Line type="monotone" dataKey="cumTarget" stroke={colors.target} strokeWidth={2} dot={{ r: 3 }} name="Target Cumulativo" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 3: Incassato Cumulativo vs Limite 85K */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><Wallet size={18} /> Incassato Cumulativo vs Limite 85K</h3>
                        <p>Monitoraggio incassi reali per regime forfettario</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.incassatoReale }}></span> Incassato Reale</span>
                        <span><span className="dot" style={{ background: colors.ipotesiIncassato }}></span> Ipotesi Incassato</span>
                        <span><span className="dot" style={{ background: colors.danger }}></span> Limite 85K</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={biData.cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <ReferenceLine y={FORFETTARIO_LIMIT} stroke={colors.danger} strokeDasharray="5 5" label={{ value: `Limite €${FORFETTARIO_LIMIT/1000}K`, position: 'right', fill: colors.danger, fontSize: 12 }} />
                        <ReferenceLine y={FORFETTARIO_LIMIT * 0.75} stroke={colors.fatturatoReale} strokeDasharray="3 3" label={{ value: 'Soglia attenzione', position: 'right', fill: colors.fatturatoReale, fontSize: 11 }} />
                        <Area type="monotone" dataKey="cumIncassatoReale" fill={colors.incassatoReale} fillOpacity={0.3} stroke={colors.incassatoReale} strokeWidth={3} name="Incassato Reale" />
                        <Line type="monotone" dataKey="cumIpotesiIncassato" stroke={colors.ipotesiIncassato} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Ipotesi Incassato" />
                        <Line type="monotone" dataKey="cumTarget" stroke={colors.target} strokeWidth={2} dot={{ r: 3 }} name="Target Cumulativo" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Modal Target Mensili */}
            {showTargetModal && (
                <div className="modal-overlay" onClick={() => setShowTargetModal(false)}>
                    <div className="modal target-modal monthly-targets-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Calendar size={20} /> Target Mensili {selectedYear}</h2>
                            <button className="close-btn" onClick={() => setShowTargetModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-description">
                                Imposta il target di fatturato per ogni mese. Il totale annuale sar&agrave; la somma dei mesi.
                            </p>
                            <div className="monthly-targets-grid">
                                {editingTargets.map((t, index) => (
                                    <div key={index} className="monthly-target-input">
                                        <label>{MONTH_NAMES[index]}</label>
                                        <input
                                            type="number"
                                            value={t.target || ''}
                                            onChange={(e) => {
                                                const newTargets = [...editingTargets];
                                                newTargets[index] = { ...newTargets[index], target: parseFloat(e.target.value) || 0 };
                                                setEditingTargets(newTargets);
                                            }}
                                            placeholder="0"
                                            step="500"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="target-total">
                                <span>Totale Annuale:</span>
                                <strong>{formatCurrency(editingTargets.reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0))}</strong>
                            </div>
                            <div className="target-presets">
                                <span>Preset annuale:</span>
                                <button onClick={() => {
                                    const monthly = Math.round(50000 / 12);
                                    setEditingTargets(editingTargets.map(t => ({ ...t, target: monthly })));
                                }}>€50K</button>
                                <button onClick={() => {
                                    const monthly = Math.round(70000 / 12);
                                    setEditingTargets(editingTargets.map(t => ({ ...t, target: monthly })));
                                }}>€70K</button>
                                <button onClick={() => {
                                    const monthly = Math.round(85000 / 12);
                                    setEditingTargets(editingTargets.map(t => ({ ...t, target: monthly })));
                                }}>€85K</button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowTargetModal(false)}>Annulla</button>
                            <button
                                className="primary-btn"
                                onClick={handleSaveTargets}
                                disabled={isSavingTarget}
                            >
                                {isSavingTarget ? 'Salvataggio...' : 'Salva Target'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
