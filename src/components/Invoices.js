import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, FileText, Calendar, Check, AlertTriangle,
  Clock, Edit2, Trash2, Receipt, Building, X, Euro, Wallet
} from 'lucide-react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { PageHeader, KPICard, KPISection } from './ui';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CURRENT_YEAR, generateYearOptions, FORFETTARIO_LIMIT } from '../constants/business';
import { INVOICE_STAGES, INVOICE_STATUS_CONFIG } from '../constants/invoiceStatuses';
import {
  calculateFatturato,
  calculateIncassato,
  calculateDaIncassare,
  calculateForfettarioStats,
  getInvoicesForYear
} from '../utils/invoiceCalculations';

export default function Invoices({ opportunities }) {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const toast = useToast();
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    opportunityId: '',
    type: 'emessa',
    amount: '',
    issueDate: '',
    dueDate: '',
    paidDate: '',
    status: 'da_emettere',
    notes: ''
  });

  // Filtra solo opportunità chiuse vinte
  const wonOpportunities = useMemo(() => {
    return opportunities
      .filter(o => o.stage === 'Chiuso Vinto')
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [opportunities]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, statsData] = await Promise.all([
        api.getInvoices({}),
        api.getInvoiceStats()
      ]);
      setInvoices(invoicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e, invoice) => {
    setDraggedItem(invoice);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      let issueDate = null;
      let paidDate = null;

      // Quando passa a "emessa", imposta issueDate se non presente
      if (newStatus === 'emessa' && !draggedItem.issueDate) {
        issueDate = today;
      }

      // Quando passa a "pagata", imposta paidDate (IMPORTANTE per forfettario!)
      if (newStatus === 'pagata') {
        paidDate = today;
        // Se non ha issueDate, imposta anche quella
        if (!draggedItem.issueDate) {
          issueDate = today;
        }
      }

      await api.updateInvoiceStatus(draggedItem.id, newStatus, issueDate, paidDate);
      loadData();
      toast.success('Stato fattura aggiornato');
    } catch (error) {
      toast.error(error.message || 'Errore nell\'aggiornamento');
    }
    setDraggedItem(null);
  };

  // Quick pay - click per segnare come pagata
  const handleQuickPay = async (invoice) => {
    if (invoice.status !== 'emessa') return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await api.updateInvoiceStatus(invoice.id, 'pagata', null, today);
      loadData();
      toast.success('Fattura segnata come pagata');
    } catch (error) {
      toast.error(error.message || 'Errore nel pagamento');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };

      // Se stato è emessa e non c'è issueDate, usa oggi
      if (dataToSend.status === 'emessa' && !dataToSend.issueDate) {
        dataToSend.issueDate = new Date().toISOString().split('T')[0];
      }

      // Se stato è pagata e non c'è paidDate, usa oggi
      if (dataToSend.status === 'pagata' && !dataToSend.paidDate) {
        dataToSend.paidDate = new Date().toISOString().split('T')[0];
      }

      if (editingInvoice) {
        await api.updateInvoice(editingInvoice.id, dataToSend);
      } else {
        await api.createInvoice(dataToSend);
      }
      setShowModal(false);
      setEditingInvoice(null);
      resetForm();
      loadData();
      toast.success(editingInvoice ? 'Fattura aggiornata' : 'Fattura creata');
    } catch (error) {
      toast.error(error.message || 'Errore nel salvataggio');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      opportunityId: invoice.opportunityId || '',
      type: invoice.type,
      amount: invoice.amount,
      issueDate: invoice.issueDate || '',
      dueDate: invoice.dueDate || '',
      paidDate: invoice.paidDate || '',
      status: invoice.status,
      notes: invoice.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa fattura?')) {
      try {
        await api.deleteInvoice(id);
        loadData();
        toast.success('Fattura eliminata');
      } catch (error) {
        toast.error(error.message || 'Errore nell\'eliminazione');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      opportunityId: '',
      type: 'emessa',
      amount: '',
      issueDate: '',
      dueDate: '',
      paidDate: '',
      status: 'da_emettere',
      notes: ''
    });
  };

  const openNewInvoice = () => {
    resetForm();
    setEditingInvoice(null);
    setShowModal(true);
  };

  // Filtra fatture per anno (usando funzione centralizzata)
  const filteredInvoices = useMemo(() => {
    return getInvoicesForYear(invoices, selectedYear);
  }, [invoices, selectedYear]);

  // Stats per anno selezionato (usando funzioni centralizzate)
  const yearStats = useMemo(() => {
    const year = selectedYear === 'all' ? 'all' : parseInt(selectedYear);
    return {
      fatturato: calculateFatturato(invoices, year),
      incassato: calculateIncassato(invoices, year),
      daIncassare: calculateDaIncassare(invoices)
    };
  }, [invoices, selectedYear]);

  // Calcolo limite forfettario (usando funzione centralizzata)
  const forfettarioStats = useMemo(() => {
    if (selectedYear === 'all') return null;
    return calculateForfettarioStats(invoices, parseInt(selectedYear));
  }, [invoices, selectedYear]);

  const forfettarioProgress = forfettarioStats?.progressPercent || 0;
  const forfettarioRemaining = forfettarioStats?.remaining || FORFETTARIO_LIMIT;

  if (loading && invoices.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Caricamento fatture...</p>
      </div>
    );
  }

  return (
    <div className="page-container pipeline-page">
      {/* Header */}
      <PageHeader
        title="Fatture"
        subtitle={`${invoices.length} fatture totali`}
        icon={<Receipt size={24} />}
      >
        <select
          className="year-selector"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="all">Tutte</option>
          {generateYearOptions(-2, 2).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <button className="primary-btn" onClick={openNewInvoice}>
          <Plus size={18} />
          <span>Nuova Fattura</span>
        </button>
      </PageHeader>

      {/* KPI Section */}
      <KPISection>
        <KPICard
          title={`Fatturato ${selectedYear === 'all' ? 'Totale' : selectedYear}`}
          value={formatCurrency(yearStats.fatturato)}
          subtitle="Fatture emesse"
          icon={<FileText size={20} />}
          color="orange"
        />
        <KPICard
          title={`Incassato ${selectedYear === 'all' ? 'Totale' : selectedYear}`}
          value={formatCurrency(yearStats.incassato)}
          subtitle={selectedYear !== 'all' ? `${forfettarioProgress.toFixed(0)}% del limite ${formatCurrency(FORFETTARIO_LIMIT)}` : 'Totale incassato'}
          icon={<Wallet size={20} />}
          color="green"
        />
        <KPICard
          title="Da Incassare"
          value={formatCurrency(yearStats.daIncassare)}
          subtitle="Fatture in attesa"
          icon={<Clock size={20} />}
          color="blue"
        />
        {selectedYear !== 'all' && (
          <KPICard
            title="Residuo Forfettario"
            value={formatCurrency(Math.max(0, forfettarioRemaining))}
            subtitle={forfettarioProgress > 90 ? '⚠️ Attenzione!' : `${(100 - forfettarioProgress).toFixed(0)}% disponibile`}
            icon={<AlertTriangle size={20} />}
            color={forfettarioProgress > 90 ? 'red' : forfettarioProgress > 75 ? 'orange' : 'purple'}
          />
        )}
      </KPISection>

      {/* Alert Forfettario */}
      {selectedYear !== 'all' && forfettarioProgress > 75 && (
        <div className={`forfettario-alert ${forfettarioProgress > 90 ? 'danger' : 'warning'}`}>
          <AlertTriangle size={20} />
          <div>
            <strong>Attenzione Limite Forfettario {selectedYear}!</strong>
            <span>
              Incassato {formatCurrency(yearStats.incassato)} su {formatCurrency(FORFETTARIO_LIMIT)} ({forfettarioProgress.toFixed(1)}%).
              Rimangono {formatCurrency(forfettarioRemaining)}.
            </span>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-wrapper">
        <div className="kanban-board invoice-kanban">
          {INVOICE_STAGES.map((status) => {
            const config = INVOICE_STATUS_CONFIG[status];
            const stageInvoices = filteredInvoices.filter(i => i.status === status);
            const stageValue = stageInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
            const IconComponent = config.icon;

            return (
              <div
                key={status}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Header */}
                <div className="column-header" style={{ background: config.color }}>
                  <h3>
                    {IconComponent && <IconComponent size={16} />}
                    {config.label}
                  </h3>
                  <span className="column-count">{stageInvoices.length}</span>
                </div>

                {/* Valore totale colonna */}
                <div className="column-value">
                  {formatCurrency(stageValue)}
                </div>

                {/* Cards */}
                <div className="column-content">
                  {stageInvoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className={`invoice-kanban-card ${status === 'emessa' ? 'can-pay' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, invoice)}
                    >
                      {/* Quick Pay Button per fatture emesse */}
                      {status === 'emessa' && (
                        <button
                          className="quick-pay-circle"
                          onClick={() => handleQuickPay(invoice)}
                          title="Clicca per segnare come incassata"
                        >
                          <Check size={14} />
                        </button>
                      )}

                      {/* Contenuto card */}
                      <div className="card-content">
                        <div className="card-header">
                          <span className="invoice-num">{invoice.invoiceNumber}</span>
                          <span className="invoice-amount">{formatCurrency(invoice.amount)}</span>
                        </div>

                        {invoice.opportunityTitle && (
                          <div className="card-client">
                            <Building size={12} />
                            {invoice.opportunityCompany || invoice.opportunityTitle}
                          </div>
                        )}

                        {/* Date rilevanti */}
                        <div className="card-dates">
                          {invoice.issueDate && (
                            <span className="date-tag issue">
                              <Calendar size={10} />
                              Em: {formatDate(invoice.issueDate)}
                            </span>
                          )}
                          {invoice.dueDate && status === 'emessa' && (
                            <span className={`date-tag due ${new Date(invoice.dueDate) < new Date() ? 'overdue' : ''}`}>
                              <Clock size={10} />
                              Sc: {formatDate(invoice.dueDate)}
                            </span>
                          )}
                          {invoice.paidDate && (
                            <span className="date-tag paid">
                              <Check size={10} />
                              Inc: {formatDate(invoice.paidDate)}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="card-actions">
                          <button onClick={() => handleEdit(invoice)} title="Modifica">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(invoice.id)} title="Elimina" className="delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageInvoices.length === 0 && (
                    <div className="empty-column">
                      {IconComponent && <IconComponent size={24} />}
                      <span>Nessuna fattura</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingInvoice ? 'Modifica Fattura' : 'Nuova Fattura'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form">
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

                  <div className="form-group">
                    <label>Opportunità Collegata</label>
                    <select
                      value={formData.opportunityId}
                      onChange={e => {
                        const oppId = e.target.value;
                        const selectedOpp = wonOpportunities.find(o => o.id.toString() === oppId);
                        setFormData({
                          ...formData,
                          opportunityId: oppId,
                          amount: selectedOpp && !formData.amount ? selectedOpp.value : formData.amount
                        });
                      }}
                    >
                      <option value="">-- Nessuna --</option>
                      {wonOpportunities.map(opp => (
                        <option key={opp.id} value={opp.id}>
                          {opp.title} - {opp.company} (€{parseFloat(opp.value).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Stato</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="da_emettere">Da Emettere</option>
                      <option value="emessa">Emessa</option>
                      <option value="pagata">Incassata</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Data Emissione</label>
                      <input
                        type="date"
                        value={formData.issueDate}
                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                      />
                      <small>Quando hai emesso la fattura</small>
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
                    <small>⚠️ Per forfettario: questa data determina l'anno fiscale!</small>
                  </div>

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
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="primary-btn">
                  {editingInvoice ? 'Salva Modifiche' : 'Crea Fattura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
