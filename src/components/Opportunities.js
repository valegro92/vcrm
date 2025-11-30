import React, { useState, useMemo } from 'react';
import { Filter, Plus, Building2, Edit2, Trash2, Search, Euro, TrendingUp, Target, X, Calendar } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';

export default function Opportunities({ opportunities, openAddModal, handleDeleteOpportunity }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [sortBy, setSortBy] = useState('value');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedYear, setSelectedYear] = useState('all'); // Year filter

    // Stats
    const stats = useMemo(() => {
        const active = opportunities.filter(o => !o.stage?.toLowerCase().includes('chiuso'));
        const totalValue = active.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
        const avgProbability = active.length > 0
            ? Math.round(active.reduce((sum, o) => sum + (parseFloat(o.probability) || 0), 0) / active.length)
            : 0;
        const weighted = active.reduce((sum, o) => sum + ((parseFloat(o.value) || 0) * (parseFloat(o.probability) || 0) / 100), 0);
        return { count: active.length, totalValue, avgProbability, weighted };
    }, [opportunities]);

    // Filtered and sorted opportunities
    const filteredOpportunities = useMemo(() => {
        let result = [...opportunities];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.title?.toLowerCase().includes(term) ||
                o.company?.toLowerCase().includes(term) ||
                o.owner?.toLowerCase().includes(term)
            );
        }

        // Year filter
        if (selectedYear !== 'all') {
            result = result.filter(o => {
                if (!o.closeDate) return false;
                const oppYear = new Date(o.closeDate).getFullYear();
                return oppYear === parseInt(selectedYear);
            });
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
    }, [opportunities, searchTerm, filterStage, sortBy, sortOrder, selectedYear]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
        return `€${value?.toLocaleString() || 0}`;
    };

    const getStageClass = (stage) => {
        const slug = stage?.toLowerCase().replace(/\s+/g, '-') || 'lead';
        return slug;
    };

    const hasActiveFilters = filterStage !== 'all' || searchTerm;

    return (
        <div className="opportunities-view">
            {/* Header Section */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Le tue Opportunità</h2>
                    <p className="page-subtitle">
                        {filteredOpportunities.length} opportunità • Valore: €{stats.totalValue.toLocaleString()}
                    </p>
                </div>
                {/* Year Filter */}
                <select
                    className="year-filter"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{ height: '44px' }}
                >
                    <option value="all">Tutti gli anni</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Opportunità Attive</span>
                        <div className="kpi-icon blue"><Target size={20} /></div>
                    </div>
                    <div className="kpi-value">{stats.count}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Valore Totale</span>
                        <div className="kpi-icon green"><Euro size={20} /></div>
                    </div>
                    <div className="kpi-value">{formatCurrency(stats.totalValue)}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Probabilità Media</span>
                        <div className="kpi-icon purple"><TrendingUp size={20} /></div>
                    </div>
                    <div className="kpi-value">{stats.avgProbability}%</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Valore Ponderato</span>
                        <div className="kpi-icon orange"><Euro size={20} /></div>
                    </div>
                    <div className="kpi-value">{formatCurrency(stats.weighted)}</div>
                </div>
            </div>

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
                            onClick={() => { setFilterStage('all'); setSearchTerm(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Cancella filtri
                        </button>
                    )}
                </div>
            )}

            {/* Desktop Table */}
            <div className="data-table">
                {filteredOpportunities.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Opportunità</th>
                                <th>Azienda</th>
                                <th>Valore</th>
                                <th>Fase</th>
                                <th>Probabilità</th>
                                <th>Data Chiusura</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOpportunities.map(opp => (
                                <tr key={opp.id}>
                                    <td className="opp-title">{opp.title}</td>
                                    <td>
                                        <div className="company-cell">
                                            <Building2 size={16} />
                                            <span>{opp.company || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="value-cell">€{(opp.value || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`stage-badge ${getStageClass(opp.stage)}`}>{opp.stage || 'Lead'}</span>
                                    </td>
                                    <td>
                                        <div className="probability-cell">
                                            <div className="probability-bar">
                                                <div className="probability-fill" style={{ width: `${opp.probability || 0}%` }}></div>
                                            </div>
                                            <span>{opp.probability || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="date-cell">
                                        {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString('it-IT') : '-'}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="action-btn" onClick={() => openAddModal('opportunity', opp)}><Edit2 size={16} /></button>
                                            <button className="action-btn delete" onClick={() => handleDeleteOpportunity(opp.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <Target size={48} strokeWidth={1} />
                        <p>Nessuna opportunità trovata</p>
                    </div>
                )}
            </div>

            {/* Mobile Card List */}
            <div className="mobile-card-list">
                {filteredOpportunities.length === 0 ? (
                    <div className="empty-state">
                        <Target size={48} strokeWidth={1} />
                        <p>Nessuna opportunità trovata</p>
                    </div>
                ) : (
                    filteredOpportunities.map(opp => (
                        <div key={opp.id} className="mobile-card">
                            <div className="mobile-card-header">
                                <div className="mobile-card-avatar" style={{ background: 'linear-gradient(135deg, var(--success-500), var(--success-600))' }}>
                                    <Euro size={20} />
                                </div>
                                <div className="mobile-card-info">
                                    <div className="mobile-card-title">{opp.title}</div>
                                    <div className="mobile-card-subtitle">{opp.company || 'Nessuna azienda'}</div>
                                </div>
                            </div>
                            <div className="mobile-card-body">
                                <div className="mobile-card-row">
                                    <span className={`stage-badge ${getStageClass(opp.stage)}`}>{opp.stage || 'Lead'}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--gray-500)' }}>{opp.probability || 0}%</span>
                                </div>
                                {opp.closeDate && (
                                    <div className="mobile-card-row">
                                        <Calendar size={16} />
                                        <span>Chiusura: {new Date(opp.closeDate).toLocaleDateString('it-IT')}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mobile-card-footer">
                                <div className="mobile-card-value">€{(opp.value || 0).toLocaleString()}</div>
                                <div className="mobile-card-actions">
                                    <button className="action-btn" onClick={() => openAddModal('opportunity', opp)}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDeleteOpportunity(opp.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
