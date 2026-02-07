import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ReferenceLine, ComposedChart, Area
} from 'recharts';
import { Target, TrendingUp, Receipt, Wallet, AlertTriangle, Calendar, FolderKanban, Package, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import {
    MONTH_NAMES_SHORT as MONTH_NAMES,
    FORFETTARIO_LIMIT,
    CURRENT_YEAR,
    generateYearOptions
} from '../constants/business';
import { calculateForfettarioStats } from '../utils/invoiceCalculations';

const EMPTY_TARGETS = () => Array(12).fill(0).map((_, i) => ({ month: i, target: 0 }));

export default function Dashboard({ opportunities, tasks, contacts, invoices = [], setActiveView }) {
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
    const [targetsByType, setTargetsByType] = useState({
        ordinato: EMPTY_TARGETS(),
        fatturato: EMPTY_TARGETS(),
        incassato: EMPTY_TARGETS()
    });
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [editingTargets, setEditingTargets] = useState({
        ordinato: EMPTY_TARGETS(),
        fatturato: EMPTY_TARGETS(),
        incassato: EMPTY_TARGETS()
    });
    const [activeTargetTab, setActiveTargetTab] = useState('ordinato');
    const [isSavingTarget, setIsSavingTarget] = useState(false);
    const [showMonthlyTable, setShowMonthlyTable] = useState(true);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const toast = useToast();

    // Carica target mensili dal database
    useEffect(() => {
        const loadTargets = async () => {
            try {
                const response = await api.getMonthlyTargets(selectedYear);

                // Handle new format (byType) and legacy format
                if (response && response.byType) {
                    const byType = {
                        ordinato: response.byType.ordinato || EMPTY_TARGETS(),
                        fatturato: response.byType.fatturato || EMPTY_TARGETS(),
                        incassato: response.byType.incassato || EMPTY_TARGETS()
                    };
                    setTargetsByType(byType);
                    setEditingTargets({
                        ordinato: byType.ordinato.map(t => ({ ...t })),
                        fatturato: byType.fatturato.map(t => ({ ...t })),
                        incassato: byType.incassato.map(t => ({ ...t }))
                    });
                } else if (Array.isArray(response)) {
                    // Legacy: array = ordinato only
                    const legacy = response;
                    const byType = {
                        ordinato: legacy,
                        fatturato: EMPTY_TARGETS(),
                        incassato: EMPTY_TARGETS()
                    };
                    setTargetsByType(byType);
                    setEditingTargets({
                        ordinato: legacy.map(t => ({ ...t })),
                        fatturato: EMPTY_TARGETS(),
                        incassato: EMPTY_TARGETS()
                    });
                }
            } catch (error) {
                console.error('Error loading targets:', error);
                const empty = { ordinato: EMPTY_TARGETS(), fatturato: EMPTY_TARGETS(), incassato: EMPTY_TARGETS() };
                setTargetsByType(empty);
                setEditingTargets({ ordinato: EMPTY_TARGETS(), fatturato: EMPTY_TARGETS(), incassato: EMPTY_TARGETS() });
            }
        };
        loadTargets();
    }, [selectedYear]);

    // Salva tutti i target (3 tipi)
    const handleSaveTargets = async () => {
        setIsSavingTarget(true);
        try {
            await api.saveAllTargets(selectedYear, null, editingTargets);
            setTargetsByType({
                ordinato: editingTargets.ordinato.map(t => ({ ...t })),
                fatturato: editingTargets.fatturato.map(t => ({ ...t })),
                incassato: editingTargets.incassato.map(t => ({ ...t }))
            });
            setShowTargetModal(false);
            toast.success('Target salvati con successo');
        } catch (error) {
            toast.error(error.message || 'Errore nel salvataggio dei target');
        } finally {
            setIsSavingTarget(false);
        }
    };

    // Target annuali per tipo
    const annualTargets = useMemo(() => ({
        ordinato: targetsByType.ordinato.reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0),
        fatturato: targetsByType.fatturato.reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0),
        incassato: targetsByType.incassato.reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0)
    }), [targetsByType]);

    // === DATI PER GRAFICI BI ===
    const biData = useMemo(() => {
        const wonOpportunities = opportunities.filter(o =>
            o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto'
        );

        const activeOffers = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        );

        const stageProbability = {
            'Lead': 0.1,
            'In contatto': 0.2,
            'Follow Up da fare': 0.4,
            'Revisionare offerta': 0.6
        };

        const weightedPipeline = activeOffers.reduce((sum, o) => {
            const prob = stageProbability[o.stage] || 0.3;
            return sum + ((parseFloat(o.value) || 0) * prob);
        }, 0);

        // Genera dati per ogni mese
        const monthlyData = MONTH_NAMES.map((monthName, index) => {
            const targetOrdinato = targetsByType.ordinato[index]?.target || 0;
            const targetFatturato = targetsByType.fatturato[index]?.target || 0;
            const targetIncassato = targetsByType.incassato[index]?.target || 0;

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
                targetOrdinato,
                targetFatturato,
                targetIncassato,
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
        let cumFatturatoReale = 0, cumIncassatoReale = 0;
        let cumTargetOrdinato = 0, cumTargetFatturato = 0, cumTargetIncassato = 0;

        const cumulativeData = monthlyData.map((m) => {
            cumOrdinato += m.ordinato;
            cumIpotesiFatturato += m.ipotesiFatturato;
            cumIpotesiIncassato += m.ipotesiIncassato;
            cumFatturatoReale += m.fatturatoReale;
            cumIncassatoReale += m.incassatoReale;
            cumTargetOrdinato += m.targetOrdinato;
            cumTargetFatturato += m.targetFatturato;
            cumTargetIncassato += m.targetIncassato;

            return {
                ...m,
                cumOrdinato,
                cumIpotesiFatturato,
                cumIpotesiIncassato,
                cumFatturatoReale,
                cumIncassatoReale,
                cumTargetOrdinato,
                cumTargetFatturato,
                cumTargetIncassato
            };
        });

        // KPI Summary
        const isCurrentYear = selectedYear === currentYear;
        const referenceMonth = isCurrentYear ? currentMonth : 11;
        const ytdOrdinato = cumulativeData[referenceMonth]?.cumOrdinato || 0;
        const ytdFatturatoReale = cumulativeData[referenceMonth]?.cumFatturatoReale || 0;
        const ytdIncassatoReale = cumulativeData[referenceMonth]?.cumIncassatoReale || 0;
        const ytdTargetOrdinato = cumulativeData[referenceMonth]?.cumTargetOrdinato || 0;
        const ytdTargetFatturato = cumulativeData[referenceMonth]?.cumTargetFatturato || 0;
        const ytdTargetIncassato = cumulativeData[referenceMonth]?.cumTargetIncassato || 0;

        // Forfettario
        const forfettarioStats = calculateForfettarioStats(invoices, selectedYear);
        const forfettarioProgress = forfettarioStats.progressPercent;
        const forfettarioRemaining = forfettarioStats.remaining;

        // GAP ANALYSIS
        const gapOrdinatoVsFatturato = ytdOrdinato - ytdFatturatoReale;
        const gapFatturatoVsIncassato = ytdFatturatoReale - ytdIncassatoReale;
        const gapOrdinatoVsTarget = ytdOrdinato - ytdTargetOrdinato;

        // Proiezioni
        const monthsElapsed = isCurrentYear ? currentMonth + 1 : 12;
        const projectedOrdinato = monthsElapsed > 0 ? (ytdOrdinato / monthsElapsed) * 12 : 0;

        // Delivery metrics
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
            ytdFatturatoReale,
            ytdIncassatoReale,
            ytdTargetOrdinato,
            ytdTargetFatturato,
            ytdTargetIncassato,
            weightedPipeline,
            forfettarioProgress,
            forfettarioRemaining,
            gapOrdinatoVsFatturato,
            gapFatturatoVsIncassato,
            gapOrdinatoVsTarget,
            projectedOrdinato,
            projectsInProgressCount,
            projectsInProgressValue,
            projectsInReviewCount,
            projectsDeliveredCount,
            projectsDeliveredValue,
            projectsClosedCount
        };
    }, [opportunities, invoices, selectedYear, currentMonth, currentYear, targetsByType]);

    const formatTooltip = (value) => `€${value.toLocaleString('it-IT')}`;

    const getProgressPercent = (value, target) => {
        if (!target || target === 0) return 0;
        return Math.min(100, Math.max(0, (value / target) * 100));
    };

    const getHealthColor = (percent) => {
        if (percent >= 90) return 'health-green';
        if (percent >= 70) return 'health-yellow';
        if (percent >= 50) return 'health-orange';
        return 'health-red';
    };

    const colors = {
        target: '#94a3b8',
        ordinato: '#3b82f6',
        ipotesiFatturato: '#fbbf24',
        ipotesiIncassato: '#a78bfa',
        fatturatoReale: '#f59e0b',
        incassatoReale: '#10b981',
        danger: '#ef4444'
    };

    const ordinatoVsTarget = getProgressPercent(biData.ytdOrdinato, biData.ytdTargetOrdinato);
    const fatturatoVsTarget = getProgressPercent(biData.ytdFatturatoReale, biData.ytdTargetFatturato);
    const incassatoVsTarget = getProgressPercent(biData.ytdIncassatoReale, biData.ytdTargetIncassato);

    // Helper per copiare target da un tipo all'altro
    const copyTargets = (from, to) => {
        setEditingTargets(prev => ({
            ...prev,
            [to]: prev[from].map(t => ({ ...t }))
        }));
    };

    // Helper per preset
    const applyPreset = (type, annualAmount) => {
        const monthly = Math.round(annualAmount / 12);
        setEditingTargets(prev => ({
            ...prev,
            [type]: prev[type].map(t => ({ ...t, target: monthly }))
        }));
    };

    const targetTabConfig = {
        ordinato: { label: 'Ordinato', icon: TrendingUp, color: '#3b82f6', desc: 'Quanto prevedi di vendere/chiudere ogni mese' },
        fatturato: { label: 'Fatturato', icon: Receipt, color: '#f59e0b', desc: 'Quanto prevedi di fatturare ogni mese' },
        incassato: { label: 'Incassato', icon: Wallet, color: '#10b981', desc: 'Quanto prevedi di incassare ogni mese' }
    };

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
                        Target
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
                    <p>Ognuno col proprio target: Ordinato &rarr; Fatturato &rarr; Incassato</p>
                </div>

                <div className="bh-flow">
                    {/* CARD 1: Ordinato vs suo Target */}
                    <div className={`bh-card ${biData.ytdTargetOrdinato > 0 ? getHealthColor(ordinatoVsTarget) : 'health-neutral'}`}>
                        <div className="bh-card-icon">
                            <TrendingUp size={22} />
                        </div>
                        <div className="bh-card-content">
                            <span className="bh-card-label">Ordinato vs Target</span>
                            <span className="bh-card-value">{formatCurrency(biData.ytdOrdinato)}</span>
                            {biData.ytdTargetOrdinato > 0 ? (
                                <>
                                    <div className="bh-progress-bar">
                                        <div className="bh-progress-fill" style={{ width: `${ordinatoVsTarget}%` }} />
                                    </div>
                                    <div className="bh-card-detail">
                                        <span className="bh-card-percent">{ordinatoVsTarget.toFixed(0)}%</span>
                                        <span className="bh-card-target">su {formatCurrency(biData.ytdTargetOrdinato)}</span>
                                    </div>
                                    <span className={`bh-card-delta ${biData.gapOrdinatoVsTarget >= 0 ? 'positive' : 'negative'}`}>
                                        {biData.gapOrdinatoVsTarget >= 0 ? '+' : ''}{formatCurrency(biData.gapOrdinatoVsTarget)}
                                    </span>
                                </>
                            ) : (
                                <span className="bh-card-no-target" onClick={() => setShowTargetModal(true)}>
                                    Imposta target &rarr;
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bh-flow-arrow"><ArrowRight size={20} /></div>

                    {/* CARD 2: Fatturato vs suo Target */}
                    <div className={`bh-card ${biData.ytdTargetFatturato > 0 ? getHealthColor(fatturatoVsTarget) : 'health-neutral'}`}>
                        <div className="bh-card-icon">
                            <Receipt size={22} />
                        </div>
                        <div className="bh-card-content">
                            <span className="bh-card-label">Fatturato vs Target</span>
                            <span className="bh-card-value">{formatCurrency(biData.ytdFatturatoReale)}</span>
                            {biData.ytdTargetFatturato > 0 ? (
                                <>
                                    <div className="bh-progress-bar">
                                        <div className="bh-progress-fill" style={{ width: `${fatturatoVsTarget}%` }} />
                                    </div>
                                    <div className="bh-card-detail">
                                        <span className="bh-card-percent">{fatturatoVsTarget.toFixed(0)}%</span>
                                        <span className="bh-card-target">su {formatCurrency(biData.ytdTargetFatturato)}</span>
                                    </div>
                                    {biData.gapOrdinatoVsFatturato > 0 && (
                                        <span className="bh-card-delta negative">
                                            {formatCurrency(biData.gapOrdinatoVsFatturato)} da fatturare
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="bh-card-no-target" onClick={() => setShowTargetModal(true)}>
                                    Imposta target &rarr;
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bh-flow-arrow"><ArrowRight size={20} /></div>

                    {/* CARD 3: Incassato vs suo Target */}
                    <div className={`bh-card ${biData.ytdTargetIncassato > 0 ? getHealthColor(incassatoVsTarget) : 'health-neutral'}`}>
                        <div className="bh-card-icon">
                            <Wallet size={22} />
                        </div>
                        <div className="bh-card-content">
                            <span className="bh-card-label">Incassato vs Target</span>
                            <span className="bh-card-value">{formatCurrency(biData.ytdIncassatoReale)}</span>
                            {biData.ytdTargetIncassato > 0 ? (
                                <>
                                    <div className="bh-progress-bar">
                                        <div className="bh-progress-fill" style={{ width: `${incassatoVsTarget}%` }} />
                                    </div>
                                    <div className="bh-card-detail">
                                        <span className="bh-card-percent">{incassatoVsTarget.toFixed(0)}%</span>
                                        <span className="bh-card-target">su {formatCurrency(biData.ytdTargetIncassato)}</span>
                                    </div>
                                    {biData.gapFatturatoVsIncassato > 0 && (
                                        <span className="bh-card-delta negative">
                                            {formatCurrency(biData.gapFatturatoVsIncassato)} da incassare
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="bh-card-no-target" onClick={() => setShowTargetModal(true)}>
                                    Imposta target &rarr;
                                </span>
                            )}
                        </div>
                    </div>
                </div>

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
                        <div className="delivery-kpi-icon blue"><FolderKanban size={20} /></div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsInProgressCount}</span>
                            <span className="delivery-kpi-label">In Lavorazione</span>
                            <span className="delivery-kpi-amount">{formatCurrency(biData.projectsInProgressValue)}</span>
                        </div>
                    </div>
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon orange"><Calendar size={20} /></div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsInReviewCount}</span>
                            <span className="delivery-kpi-label">In Revisione</span>
                        </div>
                    </div>
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon green"><Package size={20} /></div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsDeliveredCount}</span>
                            <span className="delivery-kpi-label">Consegnati</span>
                            <span className="delivery-kpi-amount">{formatCurrency(biData.projectsDeliveredValue)}</span>
                        </div>
                    </div>
                    <div className="delivery-kpi" onClick={() => setActiveView('projects')}>
                        <div className="delivery-kpi-icon purple"><Target size={20} /></div>
                        <div className="delivery-kpi-content">
                            <span className="delivery-kpi-value">{biData.projectsClosedCount}</span>
                            <span className="delivery-kpi-label">Chiusi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === RIEPILOGO ANNUALE === */}
            <div className="bi-annual-section">
                <h3><TrendingUp size={18} /> Riepilogo Annuale {selectedYear}</h3>
                <div className="annual-summary-grid">
                    {[
                        { label: 'Ordinato', ytd: biData.ytdOrdinato, ytdTarget: biData.ytdTargetOrdinato, annualTarget: annualTargets.ordinato, color: colors.ordinato, icon: TrendingUp },
                        { label: 'Fatturato', ytd: biData.ytdFatturatoReale, ytdTarget: biData.ytdTargetFatturato, annualTarget: annualTargets.fatturato, color: colors.fatturatoReale, icon: Receipt },
                        { label: 'Incassato', ytd: biData.ytdIncassatoReale, ytdTarget: biData.ytdTargetIncassato, annualTarget: annualTargets.incassato, color: colors.incassatoReale, icon: Wallet }
                    ].map(item => {
                        const Icon = item.icon;
                        const annualPct = item.annualTarget > 0 ? (item.ytd / item.annualTarget * 100) : 0;
                        const ytdDelta = item.ytd - item.ytdTarget;
                        const isCurrentYear = selectedYear === currentYear;
                        return (
                            <div key={item.label} className="annual-card">
                                <div className="ac-top" style={{ borderLeftColor: item.color }}>
                                    <div className="ac-icon" style={{ color: item.color }}><Icon size={18} /></div>
                                    <div className="ac-info">
                                        <span className="ac-label">{item.label} {isCurrentYear ? 'YTD' : selectedYear}</span>
                                        <span className="ac-value">{formatCurrency(item.ytd, { compact: false })}</span>
                                    </div>
                                </div>
                                {item.annualTarget > 0 && (
                                    <>
                                        <div className="ac-progress">
                                            <div className="ac-bar">
                                                <div className="ac-fill" style={{ width: `${Math.min(100, annualPct)}%`, background: item.color }} />
                                            </div>
                                            <span className="ac-pct">{annualPct.toFixed(0)}%</span>
                                        </div>
                                        <div className="ac-details">
                                            <span className="ac-target">Target annuo: {formatCurrency(item.annualTarget)}</span>
                                            {isCurrentYear && (
                                                <span className={`ac-delta ${ytdDelta >= 0 ? 'positive' : 'negative'}`}>
                                                    vs target ad oggi: {ytdDelta >= 0 ? '+' : ''}{formatCurrency(ytdDelta)}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="annual-conversion">
                    <div className="conv-step">
                        <span className="conv-label">Conversione Ord → Fatt</span>
                        <span className="conv-rate">
                            {biData.ytdOrdinato > 0
                                ? `${(biData.ytdFatturatoReale / biData.ytdOrdinato * 100).toFixed(0)}%`
                                : 'N/D'}
                        </span>
                        {biData.gapOrdinatoVsFatturato > 0 && (
                            <span className="conv-gap">Da fatturare: {formatCurrency(biData.gapOrdinatoVsFatturato)}</span>
                        )}
                    </div>
                    <div className="conv-arrow"><ArrowRight size={16} /></div>
                    <div className="conv-step">
                        <span className="conv-label">Conversione Fatt → Inc</span>
                        <span className="conv-rate">
                            {biData.ytdFatturatoReale > 0
                                ? `${(biData.ytdIncassatoReale / biData.ytdFatturatoReale * 100).toFixed(0)}%`
                                : 'N/D'}
                        </span>
                        {biData.gapFatturatoVsIncassato > 0 && (
                            <span className="conv-gap">Da incassare: {formatCurrency(biData.gapFatturatoVsIncassato)}</span>
                        )}
                    </div>
                    {selectedYear === currentYear && (
                        <>
                            <div className="conv-arrow"><ArrowRight size={16} /></div>
                            <div className="conv-step projection">
                                <span className="conv-label">Proiezione Fine Anno</span>
                                <span className="conv-rate">{formatCurrency(biData.projectedOrdinato)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* GRAFICO 1: Ordinato vs Target Ordinato */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><TrendingUp size={18} /> Ordinato vs Target Mensile</h3>
                        <p>Confronto venduto vs obiettivo ordinato per ogni mese</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.target }}></span> Target Ordinato</span>
                        <span><span className="dot" style={{ background: colors.ordinato }}></span> Ordinato</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={biData.monthlyData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <Bar dataKey="targetOrdinato" fill={colors.target} radius={[4, 4, 0, 0]} name="Target Ordinato" />
                        <Bar dataKey="ordinato" fill={colors.ordinato} radius={[4, 4, 0, 0]} name="Ordinato" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 2: Fatturato Cumulativo vs Target Fatturato */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><Receipt size={18} /> Fatturato Cumulativo</h3>
                        <p>Fatture emesse (reale) vs ipotesi vs target fatturato</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.fatturatoReale }}></span> Fatturato Reale</span>
                        <span><span className="dot" style={{ background: colors.ipotesiFatturato }}></span> Ipotesi</span>
                        <span><span className="dot" style={{ background: colors.target }}></span> Target Fatturato</span>
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
                        <Line type="monotone" dataKey="cumTargetFatturato" stroke={colors.target} strokeWidth={2} dot={{ r: 3 }} name="Target Fatturato" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 3: Incassato Cumulativo vs Target Incassato vs Limite 85K */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><Wallet size={18} /> Incassato Cumulativo vs Limite 85K</h3>
                        <p>Incassi reali vs ipotesi vs target incassato</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.incassatoReale }}></span> Incassato Reale</span>
                        <span><span className="dot" style={{ background: colors.ipotesiIncassato }}></span> Ipotesi</span>
                        <span><span className="dot" style={{ background: colors.target }}></span> Target Incassato</span>
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
                        <Line type="monotone" dataKey="cumTargetIncassato" stroke={colors.target} strokeWidth={2} dot={{ r: 3 }} name="Target Incassato" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* === DETTAGLIO MENSILE === */}
            <div className="bi-monthly-section">
                <div className="bi-monthly-header" onClick={() => setShowMonthlyTable(!showMonthlyTable)}>
                    <h3><Calendar size={18} /> Dettaglio Mensile {selectedYear}</h3>
                    <ChevronDown size={18} className={`chevron-toggle ${showMonthlyTable ? 'open' : ''}`} />
                </div>
                {showMonthlyTable && (
                    <div className="bi-monthly-wrapper">
                        <table className="bi-monthly-table">
                            <thead>
                                <tr>
                                    <th rowSpan="2" className="th-month">Mese</th>
                                    <th colSpan="3" className="th-group th-ordinato">Ordinato</th>
                                    <th colSpan="3" className="th-group th-fatturato">Fatturato</th>
                                    <th colSpan="3" className="th-group th-incassato">Incassato</th>
                                </tr>
                                <tr>
                                    <th className="th-sub th-ordinato">Target</th>
                                    <th className="th-sub th-ordinato">Reale</th>
                                    <th className="th-sub th-ordinato">&Delta;</th>
                                    <th className="th-sub th-fatturato">Target</th>
                                    <th className="th-sub th-fatturato">Reale</th>
                                    <th className="th-sub th-fatturato">&Delta;</th>
                                    <th className="th-sub th-incassato">Target</th>
                                    <th className="th-sub th-incassato">Reale</th>
                                    <th className="th-sub th-incassato">&Delta;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {biData.monthlyData.map((m, i) => {
                                    const dOrd = m.ordinato - m.targetOrdinato;
                                    const dFatt = m.fatturatoReale - m.targetFatturato;
                                    const dInc = m.incassatoReale - m.targetIncassato;
                                    const fmt = (v) => {
                                        const n = parseFloat(v) || 0;
                                        return n === 0 ? '-' : formatCurrency(n);
                                    };
                                    return (
                                        <tr key={i} className={`${m.isCurrent ? 'row-current' : ''} ${m.isFuture ? 'row-future' : ''}`}>
                                            <td className="td-month">{m.month}{m.isCurrent ? ' \u25CF' : ''}</td>
                                            <td className="td-num td-ord">{fmt(m.targetOrdinato)}</td>
                                            <td className="td-num td-ord">{fmt(m.ordinato)}</td>
                                            <td className={`td-num td-ord td-delta ${dOrd > 0 ? 'pos' : dOrd < 0 ? 'neg' : ''}`}>{fmt(dOrd)}</td>
                                            <td className="td-num td-fat">{fmt(m.targetFatturato)}</td>
                                            <td className="td-num td-fat">{fmt(m.fatturatoReale)}</td>
                                            <td className={`td-num td-fat td-delta ${dFatt > 0 ? 'pos' : dFatt < 0 ? 'neg' : ''}`}>{fmt(dFatt)}</td>
                                            <td className="td-num td-inc">{fmt(m.targetIncassato)}</td>
                                            <td className="td-num td-inc">{fmt(m.incassatoReale)}</td>
                                            <td className={`td-num td-inc td-delta ${dInc > 0 ? 'pos' : dInc < 0 ? 'neg' : ''}`}>{fmt(dInc)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="row-total">
                                    <td className="td-month">{selectedYear === currentYear ? 'YTD' : 'TOTALE'}</td>
                                    <td className="td-num td-ord">{formatCurrency(annualTargets.ordinato)}</td>
                                    <td className="td-num td-ord">{formatCurrency(biData.ytdOrdinato)}</td>
                                    <td className={`td-num td-ord td-delta ${biData.ytdOrdinato - annualTargets.ordinato >= 0 ? 'pos' : 'neg'}`}>
                                        {formatCurrency(biData.ytdOrdinato - annualTargets.ordinato)}
                                    </td>
                                    <td className="td-num td-fat">{formatCurrency(annualTargets.fatturato)}</td>
                                    <td className="td-num td-fat">{formatCurrency(biData.ytdFatturatoReale)}</td>
                                    <td className={`td-num td-fat td-delta ${biData.ytdFatturatoReale - annualTargets.fatturato >= 0 ? 'pos' : 'neg'}`}>
                                        {formatCurrency(biData.ytdFatturatoReale - annualTargets.fatturato)}
                                    </td>
                                    <td className="td-num td-inc">{formatCurrency(annualTargets.incassato)}</td>
                                    <td className="td-num td-inc">{formatCurrency(biData.ytdIncassatoReale)}</td>
                                    <td className={`td-num td-inc td-delta ${biData.ytdIncassatoReale - annualTargets.incassato >= 0 ? 'pos' : 'neg'}`}>
                                        {formatCurrency(biData.ytdIncassatoReale - annualTargets.incassato)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Target Mensili con 3 tabs */}
            {showTargetModal && (
                <div className="modal-overlay" onClick={() => setShowTargetModal(false)}>
                    <div className="modal target-modal monthly-targets-modal targets-3type" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Calendar size={20} /> Target Mensili {selectedYear}</h2>
                            <button className="close-btn" onClick={() => setShowTargetModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {/* Tabs per tipo target */}
                            <div className="target-tabs">
                                {Object.entries(targetTabConfig).map(([type, cfg]) => {
                                    const Icon = cfg.icon;
                                    const typeTotal = editingTargets[type].reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0);
                                    return (
                                        <button
                                            key={type}
                                            className={`target-tab ${activeTargetTab === type ? 'active' : ''}`}
                                            onClick={() => setActiveTargetTab(type)}
                                            style={activeTargetTab === type ? { borderColor: cfg.color, color: cfg.color } : {}}
                                        >
                                            <Icon size={16} />
                                            <span className="target-tab-label">{cfg.label}</span>
                                            <span className="target-tab-total">{formatCurrency(typeTotal)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="modal-description">
                                {targetTabConfig[activeTargetTab].desc}
                            </p>

                            <div className="monthly-targets-grid">
                                {editingTargets[activeTargetTab].map((t, index) => (
                                    <div key={index} className="monthly-target-input">
                                        <label>{MONTH_NAMES[index]}</label>
                                        <input
                                            type="number"
                                            value={t.target || ''}
                                            onChange={(e) => {
                                                const newTargets = { ...editingTargets };
                                                newTargets[activeTargetTab] = [...newTargets[activeTargetTab]];
                                                newTargets[activeTargetTab][index] = {
                                                    ...newTargets[activeTargetTab][index],
                                                    target: parseFloat(e.target.value) || 0
                                                };
                                                setEditingTargets(newTargets);
                                            }}
                                            placeholder="0"
                                            step="500"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="target-total">
                                <span>Totale Annuale {targetTabConfig[activeTargetTab].label}:</span>
                                <strong style={{ color: targetTabConfig[activeTargetTab].color }}>
                                    {formatCurrency(editingTargets[activeTargetTab].reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0))}
                                </strong>
                            </div>

                            <div className="target-presets">
                                <span>Preset:</span>
                                {[30000, 50000, 70000, 85000].map(amount => (
                                    <button key={amount} onClick={() => applyPreset(activeTargetTab, amount)}>
                                        €{amount / 1000}K
                                    </button>
                                ))}
                            </div>

                            <div className="target-copy-row">
                                <span>Copia da:</span>
                                {Object.keys(targetTabConfig).filter(t => t !== activeTargetTab).map(type => (
                                    <button key={type} onClick={() => copyTargets(type, activeTargetTab)} className="target-copy-btn">
                                        {targetTabConfig[type].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowTargetModal(false)}>Annulla</button>
                            <button
                                className="primary-btn"
                                onClick={handleSaveTargets}
                                disabled={isSavingTarget}
                            >
                                {isSavingTarget ? 'Salvataggio...' : 'Salva Tutti i Target'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
