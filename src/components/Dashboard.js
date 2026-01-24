import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ReferenceLine, ComposedChart, Area
} from 'recharts';
import { Target, TrendingUp, Receipt, Wallet, AlertTriangle, Calendar, Edit3, FolderKanban, Package } from 'lucide-react';
import api from '../api/api';
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
        } catch (error) {
            alert('Errore nel salvataggio dei target: ' + error.message);
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
        // Opportunità vinte
        const wonOpportunities = opportunities.filter(o =>
            o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto'
        );

        // Pipeline attiva (non chiusa)
        const activeOffers = opportunities.filter(o =>
            !o.stage?.toLowerCase().includes('chiuso')
        );

        // Probabilità per stage
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

            // ORDINATO: basato su closeDate delle opportunità vinte
            const ordinato = wonOpportunities
                .filter(o => {
                    if (!o.closeDate) return false;
                    const d = new Date(o.closeDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // IPOTESI FATTURATO: basato su expectedInvoiceDate delle opportunità vinte
            const ipotesiFatturato = wonOpportunities
                .filter(o => {
                    if (!o.expectedInvoiceDate) return false;
                    const d = new Date(o.expectedInvoiceDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // IPOTESI INCASSATO: basato su expectedPaymentDate delle opportunità vinte
            const ipotesiIncassato = wonOpportunities
                .filter(o => {
                    if (!o.expectedPaymentDate) return false;
                    const d = new Date(o.expectedPaymentDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // FATTURATO REALE: basato su issueDate delle fatture emesse
            const fatturatoReale = invoices
                .filter(i => {
                    if (!i.issueDate) return false;
                    const d = new Date(i.issueDate);
                    return d.getMonth() === index &&
                           d.getFullYear() === selectedYear &&
                           (i.status === 'emessa' || i.status === 'pagata');
                })
                .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

            // INCASSATO REALE: basato su paidDate delle fatture pagate
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

        // Calcolo % verso limite forfettario (basato su incassato REALE)
        const forfettarioStats = calculateForfettarioStats(invoices, selectedYear);
        const forfettarioProgress = forfettarioStats.progressPercent;
        const forfettarioRemaining = forfettarioStats.remaining;

        // === METRICHE PROGETTI (DELIVERY) ===
        // Progetti in lavorazione
        const projectsInProgress = wonOpportunities.filter(o =>
            o.projectStatus === 'in_lavorazione' || !o.projectStatus
        );
        const projectsInProgressCount = projectsInProgress.length;
        const projectsInProgressValue = projectsInProgress.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        // Progetti in revisione
        const projectsInReview = wonOpportunities.filter(o => o.projectStatus === 'in_revisione');
        const projectsInReviewCount = projectsInReview.length;

        // Progetti consegnati (in attesa pagamento)
        const projectsDelivered = wonOpportunities.filter(o => o.projectStatus === 'consegnato');
        const projectsDeliveredCount = projectsDelivered.length;
        const projectsDeliveredValue = projectsDelivered.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        // Progetti chiusi
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
            // Project metrics
            projectsInProgressCount,
            projectsInProgressValue,
            projectsInReviewCount,
            projectsDeliveredCount,
            projectsDeliveredValue,
            projectsClosedCount
        };
    }, [opportunities, invoices, selectedYear, currentMonth, currentYear, monthlyTargets]);

    const formatTooltip = (value) => `€${value.toLocaleString('it-IT')}`;

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

    return (
        <div className="dashboard bi-dashboard">
            {/* Header con KPI Summary */}
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
                <div className="bi-kpi-row">
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">
                            <TrendingUp size={14} /> Ordinato YTD
                        </span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdOrdinato)}</span>
                        <span className={`bi-kpi-delta ${biData.ytdOrdinato >= biData.ytdTarget ? 'positive' : 'negative'}`}>
                            {biData.ytdOrdinato >= biData.ytdTarget ? '↑' : '↓'} {formatCurrency(Math.abs(biData.ytdOrdinato - biData.ytdTarget))} vs target
                        </span>
                    </div>
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">
                            <Receipt size={14} /> Fatturato Reale YTD
                        </span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdFatturatoReale)}</span>
                        <span className="bi-kpi-delta neutral">
                            Ipotesi: {formatCurrency(biData.ytdIpotesiFatturato)}
                        </span>
                    </div>
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">
                            <Wallet size={14} /> Incassato Reale YTD
                        </span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdIncassatoReale)}</span>
                        <span className={`bi-kpi-delta ${biData.forfettarioProgress > 90 ? 'negative' : biData.forfettarioProgress > 75 ? 'warning' : 'positive'}`}>
                            {biData.forfettarioProgress > 90 && <AlertTriangle size={12} />}
                            {biData.forfettarioProgress.toFixed(0)}% limite 85K
                        </span>
                    </div>
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

            {/* GRAFICO 2: Fatturato Cumulativo (Reale vs Ipotesi vs Target) */}
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
                                Imposta il target di fatturato per ogni mese. Il totale annuale sarà la somma dei mesi.
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
