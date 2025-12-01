import React, { useState, useMemo } from 'react';
import { X, CheckSquare, AlertCircle } from 'lucide-react';
import pipelineStages from '../constants/pipelineStages';

export default function AddModal({
    showAddModal,
    setShowAddModal,
    modalType,
    isEditing,
    newItem,
    setNewItem,
    handleAddItem,
    contacts,
    opportunities
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Sort contacts alphabetically by name or company
    const sortedContacts = useMemo(() => {
        return [...contacts].sort((a, b) => {
            const nameA = (a.name || a.company || '').toLowerCase();
            const nameB = (b.name || b.company || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [contacts]);

    // Sort opportunities alphabetically by title
    const sortedOpportunities = useMemo(() => {
        return [...opportunities].sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }, [opportunities]);

    if (!showAddModal) return null;

    const handleSubmit = async () => {
        setError(null);

        // Validazione
        if (modalType === 'contact' && !newItem.name?.trim()) {
            setError('Il nome è obbligatorio');
            return;
        }
        if (modalType === 'opportunity' && !newItem.title?.trim()) {
            setError('Il titolo è obbligatorio');
            return;
        }
        if (modalType === 'task' && !newItem.title?.trim()) {
            setError('Il titolo è obbligatorio');
            return;
        }

        setIsSubmitting(true);
        try {
            await handleAddItem();
        } catch (err) {
            setError(err.message || 'Si è verificato un errore');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {isEditing ? 'Modifica' : 'Nuovo'} {modalType === 'contact' ? 'Contatto' : modalType === 'opportunity' ? 'Opportunità' : 'Attività'}
                    </h2>
                    <button className="close-btn" onClick={() => setShowAddModal(false)}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {modalType === 'contact' && (
                        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome</label>
                                    <input
                                        type="text"
                                        placeholder="Nome completo"
                                        value={newItem.name || ''}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Azienda</label>
                                    <input
                                        type="text"
                                        placeholder="Nome azienda"
                                        value={newItem.company || ''}
                                        onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@esempio.it"
                                        value={newItem.email || ''}
                                        onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefono</label>
                                    <input
                                        type="tel"
                                        placeholder="+39 ..."
                                        value={newItem.phone || ''}
                                        onChange={(e) => setNewItem({ ...newItem, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Valore Stimato</label>
                                    <input
                                        type="number"
                                        placeholder="€"
                                        value={newItem.value || ''}
                                        onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stato</label>
                                    <select
                                        value={newItem.status || 'Lead'}
                                        onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                    >
                                        <option>Lead</option>
                                        <option>Prospect</option>
                                        <option>Cliente</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    )}
                    {modalType === 'opportunity' && (
                        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group full">
                                <label>Titolo Opportunità</label>
                                <input
                                    type="text"
                                    placeholder="Es. Implementazione ERP"
                                    value={newItem.title || ''}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Azienda / Contatto</label>
                                    <select
                                        value={newItem.contactId || ''}
                                        onChange={(e) => {
                                            const selectedContact = contacts.find(c => c.id === parseInt(e.target.value));
                                            setNewItem({
                                                ...newItem,
                                                contactId: selectedContact?.id || null,
                                                company: selectedContact?.company || selectedContact?.name || ''
                                            });
                                        }}
                                    >
                                        <option value="">Seleziona azienda/contatto</option>
                                        {sortedContacts.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.company || c.name} {c.company && c.name !== c.company ? `(${c.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Valore</label>
                                    <input
                                        type="number"
                                        placeholder="€"
                                        value={newItem.value || ''}
                                        onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fase</label>
                                    <select
                                        value={newItem.stage || 'Lead'}
                                        onChange={(e) => setNewItem({ ...newItem, stage: e.target.value })}
                                    >
                                        {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Probabilità (%)</label>
                                    <input
                                        type="number"
                                        placeholder="0-100"
                                        min="0"
                                        max="100"
                                        value={newItem.probability || ''}
                                        onChange={(e) => setNewItem({ ...newItem, probability: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data Apertura</label>
                                    <input
                                        type="date"
                                        value={newItem.openDate || ''}
                                        onChange={(e) => setNewItem({ ...newItem, openDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data Chiusura Prevista</label>
                                    <input
                                        type="date"
                                        value={newItem.closeDate || ''}
                                        onChange={(e) => setNewItem({ ...newItem, closeDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                    {modalType === 'task' && (
                        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group full">
                                <label>Titolo Attività</label>
                                <input
                                    type="text"
                                    placeholder="Es. Follow-up chiamata"
                                    value={newItem.title || ''}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contatto</label>
                                    <select
                                        value={newItem.contactId || ''}
                                        onChange={(e) => setNewItem({ ...newItem, contactId: parseInt(e.target.value) || null })}
                                    >
                                        <option value="">Seleziona contatto</option>
                                        {sortedContacts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name || c.company}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Opportunità</label>
                                    <select
                                        value={newItem.opportunityId || ''}
                                        onChange={(e) => setNewItem({ ...newItem, opportunityId: parseInt(e.target.value) || null })}
                                    >
                                        <option value="">Nessuna opportunità</option>
                                        {sortedOpportunities.map(o => (
                                            <option key={o.id} value={o.id}>{o.title} ({o.company})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {newItem.opportunityId && (
                                <div className="form-info" style={{ background: '#dcfce7', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#166534' }}>
                                    <CheckSquare size={16} />
                                    <span>Collegata a: {opportunities.find(o => o.id === newItem.opportunityId)?.title}</span>
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo</label>
                                    <select
                                        value={newItem.type || 'Chiamata'}
                                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                    >
                                        <option>Chiamata</option>
                                        <option>Email</option>
                                        <option>Meeting</option>
                                        <option>Documento</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priorità</label>
                                    <select
                                        value={newItem.priority || 'Media'}
                                        onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                                    >
                                        <option>Alta</option>
                                        <option>Media</option>
                                        <option>Bassa</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stato</label>
                                    <select
                                        value={newItem.status || 'Da fare'}
                                        onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                    >
                                        <option>Da fare</option>
                                        <option>In corso</option>
                                        <option>Completata</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Scadenza</label>
                                    <input
                                        type="date"
                                        value={newItem.dueDate || ''}
                                        onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>Descrizione</label>
                                <textarea
                                    placeholder="Dettagli attività..."
                                    value={newItem.description || ''}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    rows={3}
                                    style={{
                                        padding: '10px 14px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </form>
                    )}
                </div>
                <div className="modal-footer">
                    {error && (
                        <div className="error-message" style={{ marginBottom: 0, marginRight: 'auto' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    <button className="secondary-btn" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Annulla</button>
                    <button
                        className={`primary-btn ${isSubmitting ? 'btn-loading' : ''}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <div className="loading-spinner-sm"></div>}
                        {isEditing ? 'Aggiorna' : 'Crea'}
                    </button>
                </div>
            </div>
        </div>
    );
}
