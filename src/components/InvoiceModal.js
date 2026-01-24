import React, { useState, useEffect, useMemo } from 'react';
import { X, Receipt, Building, Search, Check, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { INVOICE_STATUS, INVOICE_STATUS_CONFIG } from '../constants/invoiceStatuses';
import { FORFETTARIO_LIMIT, DEFAULT_PAYMENT_DAYS } from '../constants/business';

/**
 * Reusable Invoice Modal Component
 * Can be used from Invoices, Pipeline, or Projects
 */
export default function InvoiceModal({
    show,
    onClose,
    onSave,
    editingInvoice = null,
    opportunities = [],
    prefilledData = null, // Pre-fill from opportunity
    forfettarioStats = null
}) {
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        opportunityId: '',
        type: 'emessa',
        amount: '',
        issueDate: '',
        dueDate: '',
        paidDate: '',
        status: INVOICE_STATUS.DA_EMETTERE,
        notes: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showOpportunityDropdown, setShowOpportunityDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Filter only won opportunities
    const wonOpportunities = useMemo(() => {
        return opportunities
            .filter(o => o.stage === 'Chiuso Vinto')
            .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }, [opportunities]);

    // Filter opportunities by search term
    const filteredOpportunities = useMemo(() => {
        if (!searchTerm) return wonOpportunities;
        const term = searchTerm.toLowerCase();
        return wonOpportunities.filter(o =>
            o.title?.toLowerCase().includes(term) ||
            o.company?.toLowerCase().includes(term)
        );
    }, [wonOpportunities, searchTerm]);

    // Get selected opportunity details
    const selectedOpportunity = useMemo(() => {
        if (!formData.opportunityId) return null;
        return wonOpportunities.find(o => o.id.toString() === formData.opportunityId.toString());
    }, [formData.opportunityId, wonOpportunities]);

    // Initialize form when modal opens or editing changes
    useEffect(() => {
        if (editingInvoice) {
            setFormData({
                invoiceNumber: editingInvoice.invoiceNumber || '',
                opportunityId: editingInvoice.opportunityId || '',
                type: editingInvoice.type || 'emessa',
                amount: editingInvoice.amount || '',
                issueDate: editingInvoice.issueDate || '',
                dueDate: editingInvoice.dueDate || '',
                paidDate: editingInvoice.paidDate || '',
                status: editingInvoice.status || INVOICE_STATUS.DA_EMETTERE,
                notes: editingInvoice.notes || ''
            });
        } else if (prefilledData) {
            // Pre-fill from opportunity
            const today = new Date().toISOString().split('T')[0];
            const defaultDueDate = prefilledData.expectedPaymentDate ||
                new Date(Date.now() + DEFAULT_PAYMENT_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            setFormData({
                invoiceNumber: '',
                opportunityId: prefilledData.opportunityId || prefilledData.id || '',
                type: 'emessa',
                amount: prefilledData.value || prefilledData.amount || '',
                issueDate: prefilledData.expectedInvoiceDate || today,
                dueDate: defaultDueDate,
                paidDate: '',
                status: INVOICE_STATUS.DA_EMETTERE,
                notes: prefilledData.notes || `Fattura per: ${prefilledData.title || ''}`
            });
        } else {
            // Reset form
            setFormData({
                invoiceNumber: '',
                opportunityId: '',
                type: 'emessa',
                amount: '',
                issueDate: '',
                dueDate: '',
                paidDate: '',
                status: INVOICE_STATUS.DA_EMETTERE,
                notes: ''
            });
        }
        setSearchTerm('');
        setError(null);
    }, [show, editingInvoice, prefilledData]);

    // Handle opportunity selection
    const handleSelectOpportunity = (opp) => {
        const today = new Date().toISOString().split('T')[0];
        const defaultDueDate = opp.expectedPaymentDate ||
            new Date(Date.now() + DEFAULT_PAYMENT_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        setFormData(prev => ({
            ...prev,
            opportunityId: opp.id,
            amount: prev.amount || opp.value || '',
            issueDate: prev.issueDate || opp.expectedInvoiceDate || today,
            dueDate: prev.dueDate || defaultDueDate
        }));
        setShowOpportunityDropdown(false);
        setSearchTerm('');
    };

    // Clear opportunity selection
    const handleClearOpportunity = () => {
        setFormData(prev => ({ ...prev, opportunityId: '' }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.invoiceNumber?.trim()) {
            setError('Il numero fattura è obbligatorio');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('L\'importo deve essere maggiore di zero');
            return;
        }

        setIsSubmitting(true);

        try {
            const dataToSend = { ...formData };

            // Auto-set dates based on status
            const today = new Date().toISOString().split('T')[0];
            if (dataToSend.status === INVOICE_STATUS.EMESSA && !dataToSend.issueDate) {
                dataToSend.issueDate = today;
            }
            if (dataToSend.status === INVOICE_STATUS.PAGATA && !dataToSend.paidDate) {
                dataToSend.paidDate = today;
            }

            await onSave(dataToSend, editingInvoice?.id);
            onClose();
        } catch (err) {
            setError(err.message || 'Errore durante il salvataggio');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    // Calculate forfettario impact preview
    const newAmount = parseFloat(formData.amount) || 0;
    const wouldExceedLimit = forfettarioStats &&
        formData.status === INVOICE_STATUS.PAGATA &&
        (forfettarioStats.incassato + newAmount) > FORFETTARIO_LIMIT;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal invoice-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Receipt size={20} />
                        {editingInvoice ? 'Modifica Fattura' : 'Nuova Fattura'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="modal-form">
                            {/* Error message */}
                            {error && (
                                <div className="form-error">
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Invoice number and amount */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Numero Fattura *</label>
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        placeholder="Es: FT-2026-001"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Importo (€) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Opportunity selector with search */}
                            <div className="form-group">
                                <label>Opportunità Collegata</label>
                                <div className="searchable-select">
                                    {selectedOpportunity ? (
                                        <div className="selected-opportunity">
                                            <div className="selected-opportunity-info">
                                                <Building size={16} />
                                                <div>
                                                    <strong>{selectedOpportunity.title}</strong>
                                                    <span>{selectedOpportunity.company} - {formatCurrency(selectedOpportunity.value)}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="clear-btn"
                                                onClick={handleClearOpportunity}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="search-input-wrapper">
                                            <Search size={16} />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={e => {
                                                    setSearchTerm(e.target.value);
                                                    setShowOpportunityDropdown(true);
                                                }}
                                                onFocus={() => setShowOpportunityDropdown(true)}
                                                placeholder="Cerca opportunità per titolo o azienda..."
                                            />
                                        </div>
                                    )}

                                    {/* Dropdown */}
                                    {showOpportunityDropdown && !selectedOpportunity && (
                                        <div className="opportunity-dropdown">
                                            {filteredOpportunities.length === 0 ? (
                                                <div className="dropdown-empty">
                                                    {searchTerm ? 'Nessuna opportunità trovata' : 'Nessuna opportunità vinta disponibile'}
                                                </div>
                                            ) : (
                                                filteredOpportunities.map(opp => (
                                                    <div
                                                        key={opp.id}
                                                        className="dropdown-item"
                                                        onClick={() => handleSelectOpportunity(opp)}
                                                    >
                                                        <div className="dropdown-item-main">
                                                            <strong>{opp.title}</strong>
                                                            <span className="dropdown-item-company">{opp.company}</span>
                                                        </div>
                                                        <div className="dropdown-item-value">
                                                            {formatCurrency(opp.value)}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                {showOpportunityDropdown && (
                                    <div
                                        className="dropdown-backdrop"
                                        onClick={() => setShowOpportunityDropdown(false)}
                                    />
                                )}
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>Stato</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {Object.values(INVOICE_STATUS_CONFIG).map(config => (
                                        <option key={config.id} value={config.id}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data Emissione</label>
                                    <input
                                        type="date"
                                        value={formData.issueDate}
                                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                                    />
                                    <small>Quando emetti la fattura</small>
                                </div>
                                <div className="form-group">
                                    <label>Data Scadenza</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                    <small>Termine per il pagamento</small>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Data Incasso</label>
                                <input
                                    type="date"
                                    value={formData.paidDate}
                                    onChange={e => setFormData({ ...formData, paidDate: e.target.value })}
                                />
                                <small>Per forfettario: questa data determina l'anno fiscale!</small>
                            </div>

                            {/* Forfettario warning */}
                            {wouldExceedLimit && (
                                <div className="forfettario-warning">
                                    <AlertTriangle size={16} />
                                    <span>
                                        Attenzione: con questa fattura supereresti il limite forfettario di {formatCurrency(FORFETTARIO_LIMIT)}!
                                    </span>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="form-group full">
                                <label>Note</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Eventuali note..."
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Salvataggio...' : (editingInvoice ? 'Salva Modifiche' : 'Crea Fattura')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
