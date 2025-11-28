import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, Plus, Building2, Eye, Edit2, Trash2, Search, X, Check, Euro, TrendingUp, Target, Calendar } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';

export default function Opportunities({ opportunities, openAddModal, handleDeleteOpportunity }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [sortBy, setSortBy] = useState('value');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState(null);

    // Stats
    const stats = useMemo(() => {
        const active = opportunities.filter(o => !o.stage?.toLowerCase().includes('chiuso'));
        const totalValue = active.reduce((sum, o) => sum + (o.value || 0), 0);
        const avgProbability = active.length > 0 
            ? Math.round(active.reduce((sum, o) => sum + (o.probability || 0), 0) / active.length)
            : 0;
        const weighted = active.reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0);
        return { count: active.length, totalValue, avgProbability, weighted };
    }, [opportunities]);

    // Filtered and sorted opportunities
    const filteredOpportunities = useMemo(() => {
        let result = [...opportunities];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(o => 
                o.title?.toLowerCase().includes(term) ||
                o.company?.toLowerCase().includes(term) ||
                o.owner?.toLowerCase().includes(term)
            );
        }

        // Filter by stage
        if (filterStage !== 'all') {
            result = result.filter(o => o.stage === filterStage);
        }

        // Sort
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
                case 'title':
                    aVal = a.title?.toLowerCase() || '';
                    bVal = b.title?.toLowerCase() || '';
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
    }, [opportunities, searchTerm, filterStage, sortBy, sortOrder]);

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
        return `€${value?.toLocaleString() || 0}`;
    };

    const getStageColor = (stage) => {
        const colors = {
            'Lead': 'bg-gray',
            'In contatto': 'bg-blue',
            'Follow Up da fare': 'bg-yellow',
            'Revisionare offerta': 'bg-orange',
            'Negoziazione': 'bg-purple',
            'Chiuso Vinto': 'bg-green',
            'Chiuso Perso': 'bg-red'
        };
        return colors[stage] || 'bg-gray';
    };

    const styles = `
        .opportunities-view {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .opp-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.green { background: #dcfce7; color: #16a34a; }
        .stat-icon.purple { background: #f3e8ff; color: #9333ea; }
        .stat-icon.orange { background: #ffedd5; color: #ea580c; }

        .stat-info h4 {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 4px;
        }

        .stat-info p {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
        }

        .view-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            background: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .search-box {
            position: relative;
        }

        .search-box input {
            padding: 10px 16px 10px 40px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 14px;
            width: 280px;
            transition: all 0.2s;
        }

        .search-box input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-box .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
        }

        .filter-btn, .sort-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
        }

        .filter-btn:hover, .sort-btn:hover {
            background: #e2e8f0;
        }

        .filter-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }

        .primary-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .primary-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .filters-panel {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            padding: 16px 20px;
            background: #f8fafc;
            border-radius: 12px;
            margin-top: -8px;
        }

        .filter-group label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .filter-group select {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            color: #1e293b;
            background: white;
            cursor: pointer;
        }

        .data-table {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .data-table table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            padding: 16px 20px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }

        .data-table th.sortable {
            cursor: pointer;
            user-select: none;
        }

        .data-table th.sortable:hover {
            color: #1e293b;
        }

        .data-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
            color: #374151;
        }

        .data-table tr:hover {
            background: #f8fafc;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .opp-title {
            font-weight: 600;
            color: #0f172a;
        }

        .company-cell {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
        }

        .value-cell {
            font-weight: 700;
            color: #0f172a;
            font-size: 15px;
        }

        .stage-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .stage-badge.bg-gray { background: #f1f5f9; color: #475569; }
        .stage-badge.bg-blue { background: #dbeafe; color: #1d4ed8; }
        .stage-badge.bg-yellow { background: #fef3c7; color: #d97706; }
        .stage-badge.bg-orange { background: #ffedd5; color: #ea580c; }
        .stage-badge.bg-purple { background: #f3e8ff; color: #9333ea; }
        .stage-badge.bg-green { background: #dcfce7; color: #16a34a; }
        .stage-badge.bg-red { background: #fee2e2; color: #dc2626; }

        .probability-cell {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .probability-bar {
            width: 60px;
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
        }

        .probability-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            border-radius: 3px;
            transition: width 0.3s;
        }

        .date-cell {
            color: #64748b;
        }

        .actions-cell {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 8px;
            background: #f1f5f9;
            color: #64748b;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .action-btn:hover {
            background: #e2e8f0;
            color: #1e293b;
        }

        .action-btn.edit:hover {
            background: #dbeafe;
            color: #2563eb;
        }

        .action-btn.delete:hover {
            background: #fee2e2;
            color: #dc2626;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
        }

        .empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }

        @media (max-width: 1024px) {
            .opp-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .opp-stats {
                grid-template-columns: 1fr;
            }
            .search-box input {
                width: 100%;
            }
            .data-table {
                overflow-x: auto;
            }
            .data-table table {
                min-width: 800px;
            }
        }
    `;

    return (
        <div className="opportunities-view">
            <style>{styles}</style>

            {/* Stats Cards */}
            <div className="opp-stats">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Target size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Opportunità Attive</h4>
                        <p>{stats.count}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Euro size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Valore Totale</h4>
                        <p>{formatCurrency(stats.totalValue)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Probabilità Media</h4>
                        <p>{stats.avgProbability}%</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Euro size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Valore Ponderato</h4>
                        <p>{formatCurrency(stats.weighted)}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="view-toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cerca opportunità..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span>Filtri</span>
                        <ChevronDown size={16} />
                    </button>
                </div>
                <button className="primary-btn" onClick={() => openAddModal('opportunity')}>
                    <Plus size={18} />
                    <span>Nuova Opportunità</span>
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Fase</label>
                        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                            <option value="all">Tutte le fasi</option>
                            {pipelineStages.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Ordina per</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="value">Valore</option>
                            <option value="probability">Probabilità</option>
                            <option value="closeDate">Data Chiusura</option>
                            <option value="title">Nome</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Ordine</label>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="desc">Decrescente</option>
                            <option value="asc">Crescente</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="data-table">
                {filteredOpportunities.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Opportunità</th>
                                <th>Azienda</th>
                                <th className="sortable" onClick={() => { setSortBy('value'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                                    Valore {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Fase</th>
                                <th className="sortable" onClick={() => { setSortBy('probability'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                                    Probabilità {sortBy === 'probability' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="sortable" onClick={() => { setSortBy('closeDate'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                                    Data Chiusura {sortBy === 'closeDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Responsabile</th>
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
                                            <span>{opp.company}</span>
                                        </div>
                                    </td>
                                    <td className="value-cell">€{(opp.value || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`stage-badge ${getStageColor(opp.stage)}`}>
                                            {opp.stage}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="probability-cell">
                                            <div className="probability-bar">
                                                <div 
                                                    className="probability-fill" 
                                                    style={{ width: `${opp.probability || 0}%` }}
                                                ></div>
                                            </div>
                                            <span>{opp.probability || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="date-cell">
                                        {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString('it-IT') : '-'}
                                    </td>
                                    <td>{opp.owner || '-'}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button 
                                                className="action-btn edit" 
                                                onClick={() => openAddModal('opportunity', opp)}
                                                title="Modifica"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                onClick={() => handleDeleteOpportunity(opp.id)}
                                                title="Elimina"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <h3>Nessuna opportunità trovata</h3>
                        <p>Crea una nuova opportunità per iniziare</p>
                    </div>
                )}
            </div>
        </div>
    );
}
