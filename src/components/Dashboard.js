import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ReferenceLine, ComposedChart, Area
} from 'recharts';
import { Settings, Target, TrendingUp, Receipt, Wallet, AlertTriangle } from 'lucide-react';
import api from '../api/api';

export default function Dashboard({ opportunities, tasks, contacts, invoices = [], setActiveView }) {
    const [selectedYear, setSelectedYear] = useState(2026);
    const [annualTarget, setAnnualTarget] = useState(85000);
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [editingTarget, setEditingTarget] = useState(85000);
    const [isSavingTarget, setIsSavingTarget] = useState(false);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Carica target dal database
    useEffect(() => {
        const loadTarget = async () => {
            try {
                const target = await api.getTargetByYear(selectedYear);
                setAnnualTarget(target.target || 85000);
                setEditingTarget(target.target || 85000);
            } catch (error) {
                console.error('Error loading target:', error);
                setAnnualTarget(85000);
                setEditingTarget(85000);
            }
        };
        loadTarget();
    }, [selectedYear]);

    // Salva target
    const handleSaveTarget = async () => {
        setIsSavingTarget(true);
        try {
            await api.saveTarget(selectedYear, editingTarget);
            setAnnualTarget(editingTarget);
            setShowTargetModal(false);
        } catch (error) {
            alert('Errore nel salvataggio del target: ' + error.message);
        } finally {
            setIsSavingTarget(false);
        }
    };

    // Target mensili distribuiti proporzionalmente
    const monthlyTargets = useMemo(() => {
        const distribution = [0.04, 0.06, 0.07, 0.08, 0.09, 0.09, 0.09, 0.05, 0.08, 0.10, 0.12, 0.13];
        return distribution.map((pct, i) => ({
            month: i,
            target: Math.round(annualTarget * pct),
            label: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'][i]
        }));
    }, [annualTarget]);

    // === DATI PER GRAFICI BI ===
    const biData = useMemo(() => {
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

        // Opportunità vinte per l'anno selezionato
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

        // Mesi rimanenti nell'anno
        const isCurrentYear = selectedYear === currentYear;
        const remainingMonths = isCurrentYear ? Math.max(1, 12 - currentMonth - 1) : 12;
        const pipelinePerMonth = remainingMonths > 0 ? weightedPipeline / remainingMonths : 0;

        // Genera dati per ogni mese
        const monthlyData = months.map((monthName, index) => {
            const target = monthlyTargets[index]?.target || 0;

            // Ordinato: basato su closeDate delle opportunità vinte
            const ordinato = wonOpportunities
                .filter(o => {
                    if (!o.closeDate) return false;
                    const d = new Date(o.closeDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // Fatturato: basato su expectedInvoiceDate delle opportunità vinte
            const fatturato = wonOpportunities
                .filter(o => {
                    if (!o.expectedInvoiceDate) return false;
                    const d = new Date(o.expectedInvoiceDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // Incassato: basato su expectedPaymentDate delle opportunità vinte
            const incassato = wonOpportunities
                .filter(o => {
                    if (!o.expectedPaymentDate) return false;
                    const d = new Date(o.expectedPaymentDate);
                    return d.getMonth() === index && d.getFullYear() === selectedYear;
                })
                .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

            // Forecast (per mesi futuri nell'anno corrente)
            const isFuture = isCurrentYear && index > currentMonth;
            const forecast = isFuture ? pipelinePerMonth : null;

            return {
                month: monthName,
                monthIndex: index,
                target,
                ordinato,
                fatturato,
                incassato,
                forecast,
                isFuture,
                isPast: isCurrentYear ? index < currentMonth : true,
                isCurrent: isCurrentYear && index === currentMonth
            };
        });

        // Calcoli cumulativi
        let cumulativeOrdinato = 0;
        let cumulativeFatturato = 0;
        let cumulativeIncassato = 0;
        let cumulativeForecast = 0;

        const cumulativeData = monthlyData.map((m, index) => {
            if (m.isFuture) {
                cumulativeForecast += m.forecast || 0;
            } else {
                cumulativeOrdinato += m.ordinato;
                cumulativeFatturato += m.fatturato;
                cumulativeIncassato += m.incassato;
            }

            // Target cumulativo
            const cumulativeTarget = monthlyTargets
                .slice(0, index + 1)
                .reduce((sum, t) => sum + t.target, 0);

            return {
                ...m,
                cumulativeOrdinato,
                cumulativeFatturato,
                cumulativeIncassato,
                cumulativeTarget,
                cumulativeForecast: m.isFuture ? cumulativeOrdinato + cumulativeForecast : null
            };
        });

        // KPI Summary - basati sull'anno corrente o sull'intero anno selezionato
        const referenceMonth = isCurrentYear ? currentMonth : 11;
        const ytdOrdinato = cumulativeData[referenceMonth]?.cumulativeOrdinato || 0;
        const ytdFatturato = cumulativeData[referenceMonth]?.cumulativeFatturato || 0;
        const ytdIncassato = cumulativeData[referenceMonth]?.cumulativeIncassato || 0;
        const ytdTarget = cumulativeData[referenceMonth]?.cumulativeTarget || 0;
        const projectedTotal = ytdOrdinato + (isCurrentYear ? weightedPipeline : 0);

        // Calcolo % verso limite 85K forfettario (basato su incassato)
        const forfettarioLimit = 85000;
        const forfettarioProgress = (ytdIncassato / forfettarioLimit) * 100;
        const forfettarioRemaining = forfettarioLimit - ytdIncassato;

        return {
            monthlyData,
            cumulativeData,
            ytdOrdinato,
            ytdFatturato,
            ytdIncassato,
            ytdTarget,
            weightedPipeline,
            projectedTotal,
            forfettarioProgress,
            forfettarioRemaining
        };
    }, [opportunities, selectedYear, currentMonth, currentYear, monthlyTargets]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${Math.round(value / 1000)}K`;
        return `€${Math.round(value)}`;
    };

    const formatTooltip = (value) => `€${value.toLocaleString('it-IT')}`;

    // Colori
    const colors = {
        target: '#94a3b8',
        ordinato: '#3b82f6',
        fatturato: '#f59e0b',
        incassato: '#10b981',
        forecast: '#8b5cf6',
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
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                    </select>
                    <button
                        className="target-btn"
                        onClick={() => setShowTargetModal(true)}
                        title="Imposta target annuale"
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
                            <Receipt size={14} /> Fatturato YTD
                        </span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdFatturato)}</span>
                        <span className="bi-kpi-delta neutral">
                            {formatCurrency(biData.ytdOrdinato - biData.ytdFatturato)} da fatturare
                        </span>
                    </div>
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">
                            <Wallet size={14} /> Incassato YTD
                        </span>
                        <span className="bi-kpi-value">{formatCurrency(biData.ytdIncassato)}</span>
                        <span className={`bi-kpi-delta ${biData.forfettarioProgress > 90 ? 'negative' : biData.forfettarioProgress > 75 ? 'warning' : 'positive'}`}>
                            {biData.forfettarioProgress > 90 && <AlertTriangle size={12} />}
                            {biData.forfettarioProgress.toFixed(0)}% limite 85K
                        </span>
                    </div>
                    <div className="bi-kpi">
                        <span className="bi-kpi-label">Proiezione Anno</span>
                        <span className="bi-kpi-value">{formatCurrency(biData.projectedTotal)}</span>
                        <span className={`bi-kpi-delta ${biData.projectedTotal >= annualTarget ? 'positive' : 'negative'}`}>
                            {biData.projectedTotal >= annualTarget ? '✓' : '⚠'} Target {formatCurrency(annualTarget)}
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
                            Hai incassato {formatCurrency(biData.ytdIncassato)} su €85.000 ({biData.forfettarioProgress.toFixed(1)}%).
                            Rimangono {formatCurrency(biData.forfettarioRemaining)}.
                        </span>
                    </div>
                </div>
            )}

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

            {/* GRAFICO 2: Fatturato vs Incassato */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><Receipt size={18} /> Fatturato vs Incassato</h3>
                        <p>Andamento fatturazione e incassi previsti</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.fatturato }}></span> Fatturato</span>
                        <span><span className="dot" style={{ background: colors.incassato }}></span> Incassato</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={biData.monthlyData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <Bar dataKey="fatturato" fill={colors.fatturato} radius={[4, 4, 0, 0]} name="Fatturato" />
                        <Bar dataKey="incassato" fill={colors.incassato} radius={[4, 4, 0, 0]} name="Incassato" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* GRAFICO 3: Forecast Cumulativo */}
            <div className="bi-chart-card">
                <div className="bi-chart-header">
                    <div>
                        <h3><Wallet size={18} /> Incassato Cumulativo vs Limite 85K</h3>
                        <p>Monitoraggio incassi per regime forfettario</p>
                    </div>
                    <div className="bi-legend">
                        <span><span className="dot" style={{ background: colors.incassato }}></span> Incassato</span>
                        <span><span className="dot" style={{ background: colors.danger }}></span> Limite 85K</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={biData.cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip formatter={formatTooltip} />
                        <ReferenceLine y={85000} stroke={colors.danger} strokeDasharray="5 5" label={{ value: 'Limite €85K', position: 'right', fill: colors.danger, fontSize: 12 }} />
                        <ReferenceLine y={75000} stroke={colors.fatturato} strokeDasharray="3 3" label={{ value: 'Soglia attenzione', position: 'right', fill: colors.fatturato, fontSize: 11 }} />
                        <Area type="monotone" dataKey="cumulativeIncassato" fill={colors.incassato} fillOpacity={0.3} stroke={colors.incassato} strokeWidth={3} name="Incassato Cumulativo" />
                        <Line type="monotone" dataKey="cumulativeOrdinato" stroke={colors.ordinato} strokeWidth={2} dot={{ r: 3 }} name="Ordinato Cumulativo" />
                        <Line type="monotone" dataKey="cumulativeFatturato" stroke={colors.fatturato} strokeWidth={2} dot={{ r: 3 }} name="Fatturato Cumulativo" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Modal Target */}
            {showTargetModal && (
                <div className="modal-overlay" onClick={() => setShowTargetModal(false)}>
                    <div className="modal target-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Target size={20} /> Target Annuale {selectedYear}</h2>
                            <button className="close-btn" onClick={() => setShowTargetModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Target fatturato per il {selectedYear}</label>
                                <input
                                    type="number"
                                    value={editingTarget}
                                    onChange={(e) => setEditingTarget(parseFloat(e.target.value) || 0)}
                                    placeholder="85000"
                                    step="1000"
                                />
                                <small className="form-hint">
                                    Per il regime forfettario il limite è €85.000.
                                    Puoi impostare un target diverso per ogni anno.
                                </small>
                            </div>
                            <div className="target-presets">
                                <span>Preset:</span>
                                <button onClick={() => setEditingTarget(50000)}>€50K</button>
                                <button onClick={() => setEditingTarget(70000)}>€70K</button>
                                <button onClick={() => setEditingTarget(85000)}>€85K</button>
                                <button onClick={() => setEditingTarget(100000)}>€100K</button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowTargetModal(false)}>Annulla</button>
                            <button
                                className="primary-btn"
                                onClick={handleSaveTarget}
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
