import React, { useState, useMemo } from 'react';
import { Plus, Building2, Edit2, Trash2, Euro, TrendingUp, Target, X, Calendar, Search, Filter } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';
import { PageHeader, SearchFilter, KPICard, KPISection } from './ui';

export default function Opportunities({ opportunities, openAddModal, handleDeleteOpportunity }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [filterStatus, setFilterStatus] = useState('active'); // New: active, won, lost, all
    const [sortBy, setSortBy] = useState('value');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedYear, setSelectedYear] = useState('all'); // Year filter

    // Filtered opportunities for stats (before search/sort)
    const baseFilteredOpps = useMemo(() => {
        let result = [...opportunities];

        // Year filter
        if (selectedYear !== 'all') {
            result = result.filter(o => {
                if (!o.closeDate) return false;
                const oppYear = new Date(o.closeDate).getFullYear();
                return oppYear === parseInt(selectedYear);
            });
        }

        // Status filter
        if (filterStatus === 'active') {
            result = result.filter(o => !o.stage?.toLowerCase().includes('chiuso'));
        } else if (filterStatus === 'won') {
            result = result.filter(o => o.stage === 'Chiuso Vinto' || o.originalStage === 'Chiuso Vinto');
        } else if (filterStatus === 'lost') {
            result = result.filter(o => o.stage === 'Chiuso Perso' || o.originalStage === 'Chiuso Perso');
        }
        // 'all' shows everything

        return result;
    }, [opportunities, selectedYear, filterStatus]);

    // Stats based on filtered data
    const stats = useMemo(() => {
        const totalValue = baseFilteredOpps.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const avgProbability = baseFilteredOpps.length > 0
            ? Math.round(baseFilteredOpps.reduce((sum, o) => sum + (parseFloat(o.probability) || 0), 0) / baseFilteredOpps.length)
            : 0;
        const weighted = baseFilteredOpps.reduce((sum, o) => sum + ((parseFloat(o.value) || 0) * (parseFloat(o.probability) || 0) / 100), 0);
        return { count: baseFilteredOpps.length, totalValue, avgProbability, weighted };
    }, [baseFilteredOpps]);

    // Filtered and sorted opportunities (adds search and stage filters to baseFilteredOpps)
    const filteredOpportunities = useMemo(() => {
        let result = [...baseFilteredOpps];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.title?.toLowerCase().includes(term) ||
                o.company?.toLowerCase().includes(term) ||
                o.owner?.toLowerCase().includes(term)
            );
        }

        if (filterStage !== 'all') {
            result = result.filter(o => o.stage === filterStage);
        }

        result.sort((a, b) => {
            let aVal, bVal;
            switch (sortBy) {
                case 'value':
                    aVal = a.value || 0;
                    bVal = b.value || 0;
                    break;
                case 'probability':
                    aVal = a.probability || 0;
                    bVal = b.probability || 0;
                    break;
                case 'closeDate':
                    aVal = new Date(a.closeDate || '2099-12-31');
                    bVal = new Date(b.closeDate || '2099-12-31');
                    break;
                default:
                    aVal = a.value || 0;
                    bVal = b.value || 0;
            }
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });

        return result;
    }, [baseFilteredOpps, searchTerm, filterStage, sortBy, sortOrder]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
        return `€${value?.toLocaleString() || 0}`;
    };

    const getStageClass = (stage) => {
        const slug = stage?.toLowerCase().replace(/\s+/g, '-') || 'lead';
        return slug;
    };

    const hasActiveFilters = filterStage !== 'all' || searchTerm || filterStatus !== 'active' || selectedYear !== 'all';

    // Helper functions
    const handleDragStart = (e, opp) => {
        e.dataTransfer.setData('opportunityId', opp.id);
        e.dataTransfer.setData('sourceStage', opp.stage);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    const getProbabilityColor = (prob) => {
        if (prob >= 80) return '#10b981'; // Green
        if (prob >= 50) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const handleDelete = (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questa opportunità?')) {
            handleDeleteOpportunity(id);
        }
    };

    return (
        <div className="page-container">
            {/* Unified Header */}
            <PageHeader
                title="Opportunità"
                subtitle={`${filteredOpportunities.length} opportunità • Valore: ${formatCurrency(stats.totalValue)}`}
                icon={<Target size={24} />}
            >
                <select
                    className="year-selector"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="active">Attive</option>
                    <option value="won">Chiuso Vinto</option>
                    <option value="lost">Chiuso Perso</option>
                    <option value="all">Tutte</option>
                </select>
                <select
                    className="year-selector"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="all">Tutti gli anni</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
                <button className="primary-btn" onClick={() => openAddModal('opportunity')}>
                    <Plus size={18} />
                    <span>Nuova</span>
                </button>
            </PageHeader>

            {/* KPI Section */}
            <KPISection>
                <KPICard
                    title="Opportunità"
                    value={stats.count}
                    icon={<Target size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Valore Totale"
                    value={formatCurrency(stats.totalValue)}
                    icon={<Euro size={20} />}
                    color="green"
                />
                <KPICard
                    title="Probabilità Media"
                    value={`${stats.avgProbability}%`}
                    icon={<TrendingUp size={20} />}
                    color="purple"
                />
                <KPICard
                    title="Valore Ponderato"
                    value={formatCurrency(stats.weighted)}
                    icon={<Euro size={20} />}
                    color="orange"
                />
            </KPISection>

            {/* Toolbar */}
            <div className="view-toolbar">
                <div className="toolbar-left">
                    <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Cerca opportunità..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
                        )}
                    </div>
                    <button
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span className="hide-mobile">Filtri</span>
                        {hasActiveFilters && <span style={{ background: 'var(--primary-500)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>!</span>}
                    </button>
                </div>
                {/* Removed "Nuovo" button - using global Quick Add instead */}

            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--gray-100)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>Fase</label>
                        <select
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px', minWidth: '150px' }}
                        >
                            <option value="all">Tutte le fasi</option>
                            {pipelineStages.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>Ordina per</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px', minWidth: '150px' }}
                        >
                            <option value="value">Valore</option>
                            <option value="probability">Probabilità</option>
                            <option value="closeDate">Data Chiusura</option>
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setFilterStage('all');
                                setSearchTerm('');
                                setFilterStatus('active');
                                setSelectedYear('all');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Cancella filtri
                        </button>
                    )}
                </div>
            )}

            {/* Opportunities Cards - Tasks Style */}
            {filteredOpportunities.length === 0 ? (
                <div className="empty-state">
                    <Target size={64} strokeWidth={1} />
                    <p>{searchTerm || hasActiveFilters ? 'Nessuna opportunità trovata' : 'Nessuna opportunità ancora'}</p>
                    <button className="primary-btn" onClick={() => openAddModal('opportunity')}>
                        <Plus size={18} />
                        <span>Aggiungi la prima opportunità</span>
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredOpportunities.map(opp => {
                        const stageClass = getStageClass(opp.stage);

                        return (
                            <div
                                key={opp.id}
                                className="opportunity-card-row"
                                draggable
                                onDragStart={(e) => handleDragStart(e, opp)}
                            >
                                <div className="opp-row-content">
                                    <div className="opp-row-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{opp.title}</h3>
                                            <span className={`stage-badge ${opp.stage.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {opp.stage}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Building2 size={14} />
                                                <span>{opp.company}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} />
                                                <span>{formatDate(opp.closeDate)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="opp-row-meta">
                                        <div className="value-badge">
                                            € {parseFloat(opp.value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        width: `${opp.probability}%`,
                                                        height: '100%',
                                                        background: getProbabilityColor(opp.probability),
                                                        borderRadius: '3px'
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{opp.probability}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="opp-row-actions">
                                    <button
                                        className="icon-btn"
                                        onClick={() => openAddModal('opportunity', opp)}
                                        title="Modifica"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className="icon-btn danger"
                                        onClick={() => handleDelete(opp.id)}
                                        title="Elimina"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
            }
        </div >
    );
}
