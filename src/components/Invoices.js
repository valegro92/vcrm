import React, { useState, useEffect } from 'react';
import { 
  Plus, FileText, Calendar, Euro, Check, AlertTriangle, 
  Clock, Edit2, Trash2, Building, Filter, TrendingUp,
  ChevronDown, X, Receipt
} from 'lucide-react';
import api from '../api/api';

export default function Invoices({ opportunities }) {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    opportunityId: '',
    type: 'emessa',
    amount: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'da_emettere',
    notes: ''
  });

  // Filtra solo opportunità chiuse vinte
  const wonOpportunities = opportunities.filter(o => o.stage === 'Chiuso Vinto');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const [invoicesData, statsData] = await Promise.all([
        api.getInvoices(filters),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await api.updateInvoice(editingInvoice.id, formData);
      } else {
        await api.createInvoice(formData);
      }
      setShowModal(false);
      setEditingInvoice(null);
      resetForm();
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      opportunityId: invoice.opportunityId || '',
      type: invoice.type,
      amount: invoice.amount,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
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
      } catch (error) {
        alert('Errore: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      const paidDate = newStatus === 'pagata' ? new Date().toISOString().split('T')[0] : null;
      await api.updateInvoiceStatus(invoice.id, newStatus, paidDate);
      loadData();
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      opportunityId: '',
      type: 'emessa',
      amount: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'da_emettere',
      notes: ''
    });
  };

  const openNewInvoice = () => {
    resetForm();
    setEditingInvoice(null);
    setShowModal(true);
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'pagata') return 'success';
    if (status === 'emessa' && new Date(dueDate) < new Date()) return 'danger';
    if (status === 'emessa') return 'warning';
    return 'info';
  };

  const getStatusLabel = (status, dueDate) => {
    if (status === 'pagata') return 'Pagata';
    if (status === 'emessa' && new Date(dueDate) < new Date()) return 'Scaduta';
    if (status === 'emessa') return 'Da incassare';
    return 'Da emettere';
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Caricamento fatture...</p>
      </div>
    );
  }

  return (
    <div className="invoices-view">
      {/* Stats Cards */}
      {stats && (
        <div className="kpi-grid" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Totale Fatture</span>
              <div className="kpi-icon blue"><FileText size={20} /></div>
            </div>
            <div className="kpi-value">€{parseFloat(stats.totalAmount || 0).toLocaleString()}</div>
            <span className="kpi-change neutral">{stats.total || 0} fatture</span>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Incassato</span>
              <div className="kpi-icon green"><Check size={20} /></div>
            </div>
            <div className="kpi-value">€{parseFloat(stats.paidAmount || 0).toLocaleString()}</div>
            <span className="kpi-change positive">{stats.paidCount || 0} pagate</span>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Da Incassare</span>
              <div className="kpi-icon orange"><Clock size={20} /></div>
            </div>
            <div className="kpi-value">€{parseFloat(stats.pendingAmount || 0).toLocaleString()}</div>
            <span className="kpi-change neutral">{stats.issuedCount || 0} in attesa</span>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Scadute</span>
              <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #fee2e2, #fef2f2)', color: '#dc2626' }}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>€{parseFloat(stats.overdueAmount || 0).toLocaleString()}</div>
            <span className="kpi-change negative">{stats.overdueCount || 0} scadute</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="view-toolbar">
        <div className="toolbar-left">
          <div className="filter-tags">
            {['all', 'da_emettere', 'emessa', 'pagata'].map(status => (
              <button
                key={status}
                className={`filter-tag ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'Tutte' : 
                 status === 'da_emettere' ? 'Da Emettere' : 
                 status === 'emessa' ? 'Emesse' : 'Pagate'}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <button className="primary-btn" onClick={openNewInvoice}>
            <Plus size={18} />
            <span>Nuova Fattura</span>
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="invoices-list">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <Receipt size={64} />
            <p>Nessuna fattura trovata</p>
            <button className="primary-btn" onClick={openNewInvoice}>
              <Plus size={18} />
              Crea la prima fattura
            </button>
          </div>
        ) : (
          invoices.map(invoice => {
            const statusColor = getStatusColor(invoice.status, invoice.dueDate);
            const daysUntilDue = getDaysUntilDue(invoice.dueDate);
            
            return (
              <div key={invoice.id} className={`invoice-card ${statusColor}`}>
                <div className="invoice-header">
                  <div className="invoice-number">
                    <FileText size={18} />
                    <span>{invoice.invoiceNumber}</span>
                  </div>
                  <div className={`invoice-status status-${statusColor}`}>
                    {getStatusLabel(invoice.status, invoice.dueDate)}
                  </div>
                </div>
                
                <div className="invoice-body">
                  <div className="invoice-amount">
                    €{parseFloat(invoice.amount).toLocaleString()}
                  </div>
                  
                  {invoice.opportunityTitle && (
                    <div className="invoice-opportunity">
                      <Building size={14} />
                      <span>{invoice.opportunityTitle} - {invoice.opportunityCompany}</span>
                    </div>
                  )}
                  
                  <div className="invoice-dates">
                    <div className="invoice-date">
                      <Calendar size={14} />
                      <span>Emessa: {new Date(invoice.issueDate).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className={`invoice-date ${statusColor === 'danger' ? 'overdue' : ''}`}>
                      <Clock size={14} />
                      <span>Scadenza: {new Date(invoice.dueDate).toLocaleDateString('it-IT')}</span>
                      {invoice.status === 'emessa' && (
                        <span className="days-badge">
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}gg scaduta` : 
                           daysUntilDue === 0 ? 'Oggi' : `${daysUntilDue}gg`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="invoice-footer">
                  <div className="invoice-actions-left">
                    {invoice.status === 'da_emettere' && (
                      <button 
                        className="action-btn-small primary"
                        onClick={() => handleStatusChange(invoice, 'emessa')}
                      >
                        <FileText size={14} />
                        Emetti
                      </button>
                    )}
                    {invoice.status === 'emessa' && (
                      <button 
                        className="action-btn-small success"
                        onClick={() => handleStatusChange(invoice, 'pagata')}
                      >
                        <Check size={14} />
                        Incassata
                      </button>
                    )}
                  </div>
                  <div className="invoice-actions-right">
                    <button className="action-btn" onClick={() => handleEdit(invoice)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(invoice.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
                        onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
                        placeholder="Es: FT-2025-001"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Importo (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Opportunità Collegata (Chiuso Vinto)</label>
                    <select
                      value={formData.opportunityId}
                      onChange={e => setFormData({...formData, opportunityId: e.target.value})}
                    >
                      <option value="">-- Nessuna --</option>
                      {wonOpportunities.map(opp => (
                        <option key={opp.id} value={opp.id}>
                          {opp.title} - {opp.company} (€{parseFloat(opp.value).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Data Emissione *</label>
                      <input
                        type="date"
                        value={formData.issueDate}
                        onChange={e => setFormData({...formData, issueDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Data Scadenza *</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="emessa">Fattura Emessa</option>
                        <option value="ricevuta">Fattura Ricevuta</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stato</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="da_emettere">Da Emettere</option>
                        <option value="emessa">Emessa</option>
                        <option value="pagata">Pagata</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group full">
                    <label>Note</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      placeholder="Eventuali note..."
                      rows="3"
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

      <style jsx>{`
        .invoices-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .invoices-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .invoice-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--space-4);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-100);
          border-left: 4px solid var(--primary-500);
          transition: all var(--transition-fast);
        }

        .invoice-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .invoice-card.success { border-left-color: var(--success-500); }
        .invoice-card.warning { border-left-color: var(--warning-500); }
        .invoice-card.danger { border-left-color: var(--error-500); }
        .invoice-card.info { border-left-color: var(--primary-500); }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .invoice-number {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 600;
          color: var(--gray-900);
        }

        .invoice-status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
        }

        .status-success { background: var(--success-100); color: var(--success-700); }
        .status-warning { background: var(--warning-100); color: var(--warning-600); }
        .status-danger { background: var(--error-100); color: var(--error-600); }
        .status-info { background: var(--primary-100); color: var(--primary-700); }

        .invoice-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .invoice-amount {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-900);
        }

        .invoice-opportunity {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 13px;
          color: var(--gray-600);
        }

        .invoice-dates {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-top: var(--space-2);
        }

        .invoice-date {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 13px;
          color: var(--gray-500);
        }

        .invoice-date.overdue {
          color: var(--error-600);
          font-weight: 600;
        }

        .days-badge {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--gray-100);
          font-size: 11px;
          font-weight: 600;
          margin-left: var(--space-1);
        }

        .invoice-date.overdue .days-badge {
          background: var(--error-100);
          color: var(--error-700);
        }

        .invoice-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--gray-100);
        }

        .invoice-actions-left,
        .invoice-actions-right {
          display: flex;
          gap: var(--space-2);
        }

        .action-btn-small {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn-small.primary {
          background: var(--primary-100);
          color: var(--primary-700);
        }

        .action-btn-small.primary:hover {
          background: var(--primary-500);
          color: white;
        }

        .action-btn-small.success {
          background: var(--success-100);
          color: var(--success-700);
        }

        .action-btn-small.success:hover {
          background: var(--success-500);
          color: white;
        }

        @media (max-width: 768px) {
          .invoice-dates {
            flex-direction: column;
            gap: var(--space-2);
          }

          .invoice-footer {
            flex-direction: column;
            gap: var(--space-3);
          }

          .invoice-actions-left,
          .invoice-actions-right {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
