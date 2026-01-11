import React, { useState } from 'react';
import { X, Trophy, Calendar, Receipt, Wallet } from 'lucide-react';

export default function WonModal({ opportunity, onConfirm, onCancel }) {
    const today = new Date().toISOString().split('T')[0];

    // Default: fatturazione oggi, incasso tra 30 giorni
    const defaultPaymentDate = new Date();
    defaultPaymentDate.setDate(defaultPaymentDate.getDate() + 30);

    const [expectedInvoiceDate, setExpectedInvoiceDate] = useState(today);
    const [expectedPaymentDate, setExpectedPaymentDate] = useState(
        defaultPaymentDate.toISOString().split('T')[0]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(expectedInvoiceDate, expectedPaymentDate);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value || 0);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal won-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header won-header">
                    <div className="won-icon">
                        <Trophy size={24} />
                    </div>
                    <h2>Opportunità Vinta!</h2>
                    <button className="close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="won-summary">
                        <div className="won-title">{opportunity?.title || 'Opportunità'}</div>
                        <div className="won-company">{opportunity?.company || 'N/D'}</div>
                        <div className="won-value">{formatCurrency(opportunity?.value)}</div>
                    </div>

                    <div className="won-info-box">
                        <Calendar size={16} />
                        <span>Inserisci le date previste per il controllo del fatturato (regime forfettario 85K)</span>
                    </div>

                    <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>
                                <Receipt size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Data Prevista Fatturazione
                            </label>
                            <input
                                type="date"
                                value={expectedInvoiceDate}
                                onChange={(e) => setExpectedInvoiceDate(e.target.value)}
                                required
                            />
                            <small className="form-hint">Quando prevedi di emettere la fattura</small>
                        </div>

                        <div className="form-group">
                            <label>
                                <Wallet size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Data Prevista Incasso
                            </label>
                            <input
                                type="date"
                                value={expectedPaymentDate}
                                onChange={(e) => setExpectedPaymentDate(e.target.value)}
                                required
                            />
                            <small className="form-hint">Quando prevedi di incassare il pagamento</small>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button
                        className="secondary-btn"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Annulla
                    </button>
                    <button
                        className={`primary-btn success-btn ${isSubmitting ? 'btn-loading' : ''}`}
                        onClick={handleConfirm}
                        disabled={isSubmitting || !expectedInvoiceDate || !expectedPaymentDate}
                    >
                        {isSubmitting && <div className="loading-spinner-sm"></div>}
                        <Trophy size={16} />
                        Conferma Vittoria
                    </button>
                </div>
            </div>
        </div>
    );
}
