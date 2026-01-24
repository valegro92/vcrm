import React, { useState, useMemo } from 'react';
import { Plus, Building2, Mail, Phone, Edit2, Trash2, X, Users, MapPin, Euro } from 'lucide-react';
import { PageHeader, SearchFilter, KPICard, KPISection } from './ui';
import { formatCurrency, getInitials } from '../utils/formatters';
import { getContactStatusColor, CONTACT_STATUSES } from '../constants/business';

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

    // Stats
    const stats = useMemo(() => {
        const totalValue = contacts.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0);
        const clienti = contacts.filter(c => c.status === 'Cliente').length;
        const prospects = contacts.filter(c => c.status === 'Prospect').length;
        const leads = contacts.filter(c => c.status === 'Lead' || !c.status).length;
        return { total: contacts.length, totalValue, clienti, prospects, leads };
    }, [contacts]);

    const filters = [
        { value: 'all', label: 'Tutti' },
        ...CONTACT_STATUSES.map(s => ({ value: s, label: s }))
    ];

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

    return (
        <div className="page-container">
            {/* Unified Header */}
            <PageHeader
                title="Contatti"
                subtitle={`${stats.total} contatti • Valore totale: ${formatCurrency(stats.totalValue)}`}
                icon={<Users size={24} />}
            >
                <button className="primary-btn" onClick={() => openAddModal('contact')}>
                    <Plus size={18} />
                    <span>Nuovo Contatto</span>
                </button>
            </PageHeader>

            {/* KPI Section */}
            <KPISection>
                <KPICard
                    title="Totale"
                    value={stats.total}
                    subtitle="contatti"
                    icon={<Users size={20} />}
                    color="blue"
                />
                <KPICard
                    title="Clienti"
                    value={stats.clienti}
                    icon={<Building2 size={20} />}
                    color="green"
                />
                <KPICard
                    title="Prospects"
                    value={stats.prospects}
                    icon={<Users size={20} />}
                    color="orange"
                />
                <KPICard
                    title="Valore Totale"
                    value={formatCurrency(stats.totalValue)}
                    icon={<Euro size={20} />}
                    color="purple"
                />
            </KPISection>

            {/* Unified Search & Filters */}
            <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Cerca contatti..."
                filters={filters}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
            />

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
                        const statusStyle = getContactStatusColor(contact.status);
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
                                        background: getContactStatusColor(selectedContact.status).bg,
                                        color: getContactStatusColor(selectedContact.status).color,
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
