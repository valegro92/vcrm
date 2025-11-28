import React from 'react';
import { X, CheckSquare } from 'lucide-react';
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
    if (!showAddModal) return null;

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
                                    <label>Azienda</label>
                                    <select
                                        value={newItem.company || ''}
                                        onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                                    >
                                        <option value="">Seleziona azienda</option>
                                        {contacts.map(c => <option key={c.id} value={c.company}>{c.company}</option>)}
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
                            {newItem.opportunityId && (
                                <div className="form-info">
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
                    <button className="secondary-btn" onClick={() => setShowAddModal(false)}>Annulla</button>
                    <button 
                        className="primary-btn" 
                        onClick={() => {
                            // Validazione
                            if (modalType === 'contact' && !newItem.name?.trim()) {
                                alert('Il nome è obbligatorio');
                                return;
                            }
                            if (modalType === 'opportunity' && !newItem.title?.trim()) {
                                alert('Il titolo è obbligatorio');
                                return;
                            }
                            if (modalType === 'task' && !newItem.title?.trim()) {
                                alert('Il titolo è obbligatorio');
                                return;
                            }
                            handleAddItem();
                        }}
                    >
                        {isEditing ? 'Aggiorna' : 'Crea'}
                    </button>
                </div>
            </div>
        </div>
    );
}
