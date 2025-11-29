import React, { useState, useMemo } from 'react';
import { Filter, Plus, Building2, Mail, Phone, Eye, Edit2, Trash2, X, Search, SortAsc, SortDesc, Users } from 'lucide-react';

export default function Contacts({ contacts, openAddModal, handleDeleteContact }) {
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedContact, setSelectedContact] = useState(null);

    const filteredContacts = useMemo(() => {
        let result = [...contacts];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.company?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(c => c.status === statusFilter);
        }

        // Sorting
        result.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';

            if (sortBy === 'value') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return result;
    }, [contacts, searchTerm, statusFilter, sortBy, sortOrder]);

    const statuses = ['Lead', 'Prospect', 'Cliente', 'Inattivo'];

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const clearFilters = () => {
        setStatusFilter('');
        setSearchTerm('');
        setSortBy('name');
        setSortOrder('asc');
    };

    const hasActiveFilters = statusFilter || searchTerm;

    const styles = `
        .contacts-view {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .view-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .search-input {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 14px;
            min-width: 250px;
        }

        .search-input input {
            border: none;
            outline: none;
            font-size: 14px;
            width: 100%;
            color: #1e293b;
        }

        .search-input input::placeholder {
            color: #94a3b8;
        }

        .filter-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 14px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
        }

        .filter-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
        }

        .filter-btn.active {
            background: #eff6ff;
            border-color: #3b82f6;
            color: #3b82f6;
        }

        .filter-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .filter-tag {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #eff6ff;
            border-radius: 20px;
            font-size: 13px;
            color: #3b82f6;
        }

        .filter-tag .remove-tag {
            cursor: pointer;
            padding: 2px;
            border-radius: 50%;
        }

        .filter-tag .remove-tag:hover {
            background: #dbeafe;
        }

        .primary-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 10px 20px;
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
            background: white;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .filter-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
        }

        .filter-select {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            color: #1e293b;
            min-width: 150px;
            cursor: pointer;
        }

        .clear-filters-btn {
            background: none;
            border: none;
            color: #64748b;
            font-size: 13px;
            cursor: pointer;
            text-decoration: underline;
        }

        .clear-filters-btn:hover {
            color: #3b82f6;
        }

        .stats-bar {
            display: flex;
            gap: 24px;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 10px;
        }

        .stat-item {
            font-size: 13px;
            color: #64748b;
        }

        .stat-item strong {
            color: #0f172a;
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
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.15s;
            user-select: none;
        }

        .data-table th:hover {
            background: #f1f5f9;
            color: #1e293b;
        }

        .data-table th.sorted {
            color: #3b82f6;
        }

        .th-content {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .data-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            color: #475569;
        }

        .data-table tr:hover {
            background: #f8fafc;
        }

        .contact-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .contact-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 13px;
        }

        .contact-name {
            font-weight: 500;
            color: #1e293b;
        }

        .company-cell, .email-cell, .phone-cell {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
        }

        .value-cell {
            font-weight: 600;
            color: #0f172a;
        }

        .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-badge.lead { background: #fef3c7; color: #d97706; }
        .status-badge.prospect { background: #dbeafe; color: #2563eb; }
        .status-badge.cliente { background: #dcfce7; color: #16a34a; }
        .status-badge.inattivo { background: #f1f5f9; color: #64748b; }

        .date-cell {
            color: #64748b;
            font-size: 13px;
        }

        .actions-cell {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            background: none;
            border: none;
            padding: 6px;
            border-radius: 6px;
            cursor: pointer;
            color: #64748b;
            transition: all 0.15s;
        }

        .action-btn:hover {
            background: #f1f5f9;
            color: #1e293b;
        }

        .action-btn.delete:hover {
            background: #fee2e2;
            color: #dc2626;
        }

        .empty-state {
            text-align: center;
            padding: 48px;
            color: #64748b;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .empty-state h3 {
            color: #1e293b;
            margin-bottom: 8px;
        }

        /* Contact Detail Modal */
        .contact-detail-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .contact-detail-modal {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
        }

        .close-modal {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }

        .close-modal:hover {
            color: #1e293b;
        }

        .modal-body {
            padding: 24px;
        }

        .contact-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }

        .contact-header .contact-avatar {
            width: 64px;
            height: 64px;
            font-size: 24px;
            border-radius: 16px;
        }

        .contact-header-info h3 {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 4px;
        }

        .contact-header-info p {
            color: #64748b;
            font-size: 14px;
        }

        .detail-section {
            margin-bottom: 24px;
        }

        .detail-section h4 {
            font-size: 13px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .detail-label {
            font-size: 12px;
            color: #94a3b8;
        }

        .detail-value {
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            margin-top: 24px;
        }

        .btn-secondary {
            padding: 10px 20px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
        }

        .btn-secondary:hover {
            background: #e2e8f0;
        }

        @media (max-width: 768px) {
            .view-toolbar {
                flex-direction: column;
                align-items: stretch;
            }
            .search-input {
                min-width: auto;
            }
            .data-table {
                overflow-x: auto;
            }
            .detail-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    return (
        <div className="contacts-view">
            <style>{styles}</style>

            <div className="view-toolbar">
                <div className="toolbar-left">
                    <div className="search-input">
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Cerca contatti..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <X size={16} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearchTerm('')} />
                        )}
                    </div>
                    <button
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span>Filtri</span>
                        {hasActiveFilters && <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>!</span>}
                    </button>
                    {hasActiveFilters && (
                        <div className="filter-tags">
                            {statusFilter && (
                                <span className="filter-tag">
                                    Stato: {statusFilter}
                                    <X size={14} className="remove-tag" onClick={() => setStatusFilter('')} />
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <button className="primary-btn" onClick={() => openAddModal('contact')}>
                    <Plus size={18} />
                    <span>Nuovo Contatto</span>
                </button>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label className="filter-label">Stato</label>
                        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Tutti</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            Cancella filtri
                        </button>
                    )}
                </div>
            )}

            <div className="stats-bar">
                <div className="stat-item"><strong>{filteredContacts.length}</strong> contatti {hasActiveFilters && `(di ${contacts.length})`}</div>
                <div className="stat-item">Valore totale: <strong>€{filteredContacts.reduce((sum, c) => sum + (c.value || 0), 0).toLocaleString()}</strong></div>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th className={sortBy === 'name' ? 'sorted' : ''} onClick={() => toggleSort('name')}>
                                <div className="th-content">
                                    Nome
                                    {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th className={sortBy === 'company' ? 'sorted' : ''} onClick={() => toggleSort('company')}>
                                <div className="th-content">
                                    Azienda
                                    {sortBy === 'company' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th className={sortBy === 'value' ? 'sorted' : ''} onClick={() => toggleSort('value')}>
                                <div className="th-content">
                                    Valore
                                    {sortBy === 'value' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th className={sortBy === 'status' ? 'sorted' : ''} onClick={() => toggleSort('status')}>
                                <div className="th-content">
                                    Stato
                                    {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th>Ultimo Contatto</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan="8">
                                    <div className="empty-state">
                                        <div className="empty-state-icon"><Users size={48} strokeWidth={1} /></div>
                                        <h3>{hasActiveFilters ? 'Nessun contatto trovato' : 'Nessun contatto'}</h3>
                                        <p>{hasActiveFilters ? 'Prova a modificare i filtri' : 'Inizia aggiungendo il tuo primo contatto'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map(contact => (
                                <tr key={contact.id}>
                                    <td>
                                        <div className="contact-cell">
                                            <div className="contact-avatar">{contact.avatar || '??'}</div>
                                            <span className="contact-name">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-cell">
                                            <Building2 size={16} />
                                            <span>{contact.company || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell">
                                            <Mail size={16} />
                                            <span>{contact.email || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="phone-cell">
                                            <Phone size={16} />
                                            <span>{contact.phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="value-cell">€{(contact.value || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${contact.status?.toLowerCase() || 'lead'}`}>{contact.status || 'Lead'}</span>
                                    </td>
                                    <td className="date-cell">{contact.lastContact || '-'}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="action-btn" onClick={() => setSelectedContact(contact)}><Eye size={16} /></button>
                                            <button className="action-btn" onClick={() => openAddModal('contact', contact)}><Edit2 size={16} /></button>
                                            <button className="action-btn delete" onClick={() => handleDeleteContact(contact.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedContact && (
                <div className="contact-detail-overlay" onClick={() => setSelectedContact(null)}>
                    <div className="contact-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Dettagli Contatto</h2>
                            <button className="close-modal" onClick={() => setSelectedContact(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="contact-header">
                                <div className="contact-avatar">{selectedContact.avatar || '??'}</div>
                                <div className="contact-header-info">
                                    <h3>{selectedContact.name}</h3>
                                    <p>{selectedContact.company || 'Nessuna azienda'}</p>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Informazioni di contatto</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Email</span>
                                        <span className="detail-value">{selectedContact.email || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Telefono</span>
                                        <span className="detail-value">{selectedContact.phone || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Informazioni commerciali</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Valore</span>
                                        <span className="detail-value">€{(selectedContact.value || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Stato</span>
                                        <span className="detail-value">
                                            <span className={`status-badge ${selectedContact.status?.toLowerCase() || 'lead'}`}>{selectedContact.status || 'Lead'}</span>
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Ultimo contatto</span>
                                        <span className="detail-value">{selectedContact.lastContact || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setSelectedContact(null)}>Chiudi</button>
                                <button className="primary-btn" onClick={() => { openAddModal('contact', selectedContact); setSelectedContact(null); }}>
                                    <Edit2 size={16} />
                                    Modifica
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
