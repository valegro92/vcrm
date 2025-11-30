import React, { useState, useMemo } from 'react';
import { Plus, Building2, Mail, Phone, Edit2, Trash2, X, Search, Users, MapPin, Globe } from 'lucide-react';

export default function Contacts({ contacts, openAddModal, handleDeleteContact }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);

    const filteredContacts = useMemo(() => {
        let result = [...contacts];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.company?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(c => c.status === statusFilter);
        }

        return result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [contacts, searchTerm, statusFilter]);

    const statuses = ['Lead', 'Prospect', 'Cliente'];

    const getAvatarGradient = (name) => {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        ];
        const index = (name?.charCodeAt(0) || 0) % gradients.length;
        return gradients[index];
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'cliente': return { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46' };
            case 'prospect': return { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e' };
            default: return { bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#3730a3' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#0f172a',
                        marginBottom: '4px',
                        letterSpacing: '-0.5px'
                    }}>
                        I tuoi Contatti
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                        {filteredContacts.length} contatti • Valore totale: <strong>€{filteredContacts.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0).toLocaleString()}</strong>
                    </p>
                </div>
            </div>
            {/* Removed "Nuovo Contatto" button - using global Quick Add instead */}

            {/* Search & Filters */}
            <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0',
                    flex: '1',
                    maxWidth: '400px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    <Search size={20} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Cerca contatti..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            flex: 1,
                            fontSize: '15px',
                            background: 'transparent'
                        }}
                    />
                    {searchTerm && (
                        <X size={18} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearchTerm('')} />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`filter-tag ${statusFilter === 'all' ? 'active' : ''}`}
                    >
                        Tutti
                    </button>
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`filter-tag ${statusFilter === status ? 'active' : ''}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards Grid */}
            {filteredContacts.length === 0 ? (
                <div className="empty-state">
                    <Users size={64} strokeWidth={1} />
                    <p>{searchTerm || statusFilter !== 'all' ? 'Nessun contatto trovato' : 'Nessun contatto ancora'}</p>
                    <button className="primary-btn" onClick={() => openAddModal('contact')}>
                        <Plus size={18} />
                        <span>Aggiungi il primo contatto</span>
                    </button>
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredContacts.map(contact => {
                        const statusStyle = getStatusColor(contact.status);
                        return (
                            <div
                                key={contact.id}
                                className="card"
                                onClick={() => setSelectedContact(contact)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Card Top */}
                                <div className="card-top">
                                    <div
                                        className="card-avatar"
                                        style={{ background: getAvatarGradient(contact.name) }}
                                    >
                                        {getInitials(contact.name)}
                                    </div>
                                    <div className="card-info">
                                        <div className="card-name">{contact.name}</div>
                                        <div className="card-subtitle">{contact.company || 'Freelance'}</div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div style={{ marginBottom: '16px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        background: statusStyle.bg,
                                        color: statusStyle.color,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px'
                                    }}>
                                        {contact.status || 'Lead'}
                                    </span>
                                </div>

                                {/* Contact Details */}
                                <div className="card-details">
                                    {contact.email && (
                                        <div className="card-detail">
                                            <Mail size={16} />
                                            <span style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {contact.email}
                                            </span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="card-detail">
                                            <Phone size={16} />
                                            <span>{contact.phone}</span>
                                        </div>
                                    )}
                                    {contact.city && (
                                        <div className="card-detail">
                                            <MapPin size={16} />
                                            <span>{contact.city}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="card-footer">
                                    <div className="card-value">
                                        €{(contact.value || 0).toLocaleString()}
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className="action-btn"
                                            onClick={(e) => { e.stopPropagation(); openAddModal('contact', contact); }}
                                            title="Modifica"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                                            title="Elimina"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Contact Detail Modal */}
            {selectedContact && (
                <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Dettagli Contatto</h2>
                            <button className="close-btn" onClick={() => setSelectedContact(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Profile Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                marginBottom: '28px',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                borderRadius: '16px'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: getAvatarGradient(selectedContact.name),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    fontWeight: 800,
                                    color: 'white',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                }}>
                                    {getInitials(selectedContact.name)}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        marginBottom: '6px',
                                        letterSpacing: '-0.3px'
                                    }}>
                                        {selectedContact.name}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '8px' }}>
                                        {selectedContact.company || 'Freelance'}
                                    </p>
                                    <span style={{
                                        display: 'inline-flex',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        background: getStatusColor(selectedContact.status).bg,
                                        color: getStatusColor(selectedContact.status).color,
                                        textTransform: 'uppercase'
                                    }}>
                                        {selectedContact.status || 'Lead'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '16px'
                                }}>
                                    Informazioni di contatto
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 16px',
                                        background: '#f8fafc',
                                        borderRadius: '12px'
                                    }}>
                                        <Mail size={18} color="#6366f1" />
                                        <span style={{ color: '#1e293b', fontSize: '14px' }}>
                                            {selectedContact.email || 'Non specificato'}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 16px',
                                        background: '#f8fafc',
                                        borderRadius: '12px'
                                    }}>
                                        <Phone size={18} color="#6366f1" />
                                        <span style={{ color: '#1e293b', fontSize: '14px' }}>
                                            {selectedContact.phone || 'Non specificato'}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 16px',
                                        background: '#f8fafc',
                                        borderRadius: '12px'
                                    }}>
                                        <Building2 size={18} color="#6366f1" />
                                        <span style={{ color: '#1e293b', fontSize: '14px' }}>
                                            {selectedContact.company || 'Non specificato'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Value */}
                            <div style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.8)',
                                    marginBottom: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 600
                                }}>
                                    Valore Totale
                                </div>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 800,
                                    color: 'white',
                                    letterSpacing: '-1px'
                                }}>
                                    €{(selectedContact.value || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setSelectedContact(null)}>
                                Chiudi
                            </button>
                            <button className="primary-btn" onClick={() => {
                                openAddModal('contact', selectedContact);
                                setSelectedContact(null);
                            }}>
                                <Edit2 size={16} />
                                <span>Modifica</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
