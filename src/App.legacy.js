import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Target, CheckSquare, Calendar, Settings, Bell, Search, Plus, MoreHorizontal, Phone, Mail, Building2, Euro, Clock, ArrowUpRight, ArrowDownRight, Filter, ChevronDown, GripVertical, X, Edit2, Trash2, Eye } from 'lucide-react';


// Data imports
import initialContacts from './data/initialContacts';
import initialOpportunities from './data/initialOpportunities';
import pipelineStages from './constants/pipelineStages';
import COLORS from './constants/colors';
export default function YdeaCRM() {
  const [activeView, setActiveView] = useState('dashboard');
  // Initialize state from localStorage or default to initial data
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('crm_contacts_v4');
    return saved ? JSON.parse(saved) : initialContacts;
  });
  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem('crm_opportunities_v4');
    return saved ? JSON.parse(saved) : initialOpportunities;
  });


  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State for new item form
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Calcolo dei dati per la Dashboard
  const [salesData, setSalesData] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    activeOpportunities: 0,
    winRate: 0,
    avgDealSize: 0
  });

  // Calcolo dati per il grafico a torta (Pipeline)
  const pipelineData = pipelineStages.map(stage => {
    const value = opportunities
      .filter(o => o.stage === stage)
      .reduce((sum, o) => sum + o.value, 0);
    return { name: stage, value };
  });

  useEffect(() => {
    // Calcolo KPI
    const wonOpps = opportunities.filter(o => o.originalStage && o.originalStage.toLowerCase().includes('vinto'));
    const lostOpps = opportunities.filter(o => o.originalStage && o.originalStage.toLowerCase().includes('perso'));
    const openOpps = opportunities.filter(o => !o.originalStage?.toLowerCase().includes('chiuso'));

    const totalRev = wonOpps.reduce((sum, o) => sum + o.value, 0);
    const activeCount = openOpps.length;
    const totalClosed = wonOpps.length + lostOpps.length;
    const rate = totalClosed > 0 ? Math.round((wonOpps.length / totalClosed) * 100) : 0;
    const avgSize = wonOpps.length > 0 ? Math.round(totalRev / wonOpps.length) : 0;

    setKpiData({
      totalRevenue: totalRev,
      activeOpportunities: activeCount,
      winRate: rate,
      avgDealSize: avgSize
    });

    // Calcolo dati grafico vendite (raggruppati per mese)
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    // Inizializza i dati per tutti i mesi
    const monthlyData = months.map(m => ({ month: m, vendite: 0, obiettivo: 5000 })); // Obiettivo fisso per ora

    wonOpps.forEach(opp => {
      if (opp.closeDate) {
        const date = new Date(opp.closeDate);
        const monthIdx = date.getMonth();
        if (monthlyData[monthIdx]) {
          monthlyData[monthIdx].vendite += opp.value;
        }
      }
    });

    setSalesData(monthlyData);
  }, [opportunities]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('crm_contacts_v4', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('crm_opportunities_v4', JSON.stringify(opportunities));
  }, [opportunities]);



  const handleAddItem = () => {
    const id = isEditing ? newItem.id : Date.now(); // Use existing ID if editing

    if (modalType === 'contact') {
      const contactData = {
        id,
        ...newItem,
        value: Number(newItem.value) || 0,
        avatar: newItem.name ? newItem.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??',
        lastContact: newItem.lastContact || new Date().toISOString().split('T')[0]
      };

      if (isEditing) {
        setContacts(contacts.map(c => c.id === id ? contactData : c));
      } else {
        setContacts([...contacts, contactData]);
      }
    } else if (modalType === 'opportunity') {
      const oppData = {
        id,
        ...newItem,
        value: Number(newItem.value) || 0,
        probability: newItem.stage === 'Lead' ? 10 : newItem.stage === 'In contatto' ? 20 : newItem.stage === 'Follow Up da fare' ? 40 : newItem.stage === 'Revisionare offerta' ? 60 : newItem.stage === 'Chiuso Vinto' ? 100 : 0,
        owner: newItem.owner || 'Utente Corrente'
      };

      if (isEditing) {
        setOpportunities(opportunities.map(o => o.id === id ? oppData : o));
      } else {
        setOpportunities([...opportunities, oppData]);
      }
    }


    setShowAddModal(false);
    setNewItem({});
    setIsEditing(false);
  };



  // Drag & Drop per Pipeline
  const handleDragStart = (e, opportunity) => {
    setDraggedItem(opportunity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    if (draggedItem) {
      const newProbabilities = { 'Lead': 10, 'In contatto': 20, 'Follow Up da fare': 40, 'Chiuso Vinto': 100, 'Stand By': 0, 'Revisionare offerta': 60, 'Chiuso Perso': 0 };
      setOpportunities(opportunities.map(opp =>
        opp.id === draggedItem.id
          ? { ...opp, stage: newStage, probability: newProbabilities[newStage] }
          : opp
      ));
      setDraggedItem(null);
    }
  };

  const openAddModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setNewItem(item);
      setIsEditing(true);
    } else {
      setNewItem({}); // Reset form
      setIsEditing(false);
    }
    setShowAddModal(true);
  };

  const handleDeleteContact = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo contatto?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleDeleteOpportunity = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa opportunità?')) {
      setOpportunities(opportunities.filter(o => o.id !== id));
    }
  };

  const Sidebar = () => (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">Y</div>
        <span className="logo-text">CRM Suite</span>
      </div>

      <nav className="nav-menu">
        <NavItem icon={<TrendingUp size={20} />} label="Dashboard" view="dashboard" />
        <NavItem icon={<Target size={20} />} label="Pipeline" view="pipeline" />
        <NavItem icon={<Users size={20} />} label="Contatti" view="contacts" />
        <NavItem icon={<Euro size={20} />} label="Opportunità" view="opportunities" />
      </nav>

      <div className="sidebar-footer">
        <NavItem icon={<Settings size={20} />} label="Impostazioni" view="settings" />
      </div>
    </div>
  );

  const NavItem = ({ icon, label, view }) => (
    <button
      className={`nav-item ${activeView === view ? 'active' : ''}`}
      onClick={() => setActiveView(view)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const Header = () => (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">
          {activeView === 'dashboard' && 'Dashboard'}
          {activeView === 'pipeline' && 'Pipeline Vendite'}
          {activeView === 'contacts' && 'Gestione Contatti'}
          {activeView === 'opportunities' && 'Opportunità'}
          {activeView === 'settings' && 'Impostazioni'}
        </h1>
      </div>

      <div className="header-center">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cerca contatti, opportunità, attività..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="user-avatar">VB</div>
      </div>
    </header>
  );

  const KPICard = ({ title, value, change, changeType, icon, color }) => (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className={`kpi-icon ${color}`}>{icon}</div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-change ${changeType}`}>
        {changeType === 'positive' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span>{change}</span>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="dashboard">
      <div className="kpi-grid">
        <KPICard
          title="Ricavi Totali"
          value={`€${kpiData.totalRevenue.toLocaleString()}`}
          change="vs mese scorso"
          changeType="neutral"
          icon={<Euro size={24} />}
          color="blue"
        />
        <KPICard
          title="Opportunità Attive"
          value={kpiData.activeOpportunities}
          change="in corso"
          changeType="neutral"
          icon={<Target size={24} />}
          color="green"
        />
        <KPICard
          title="Tasso di Chiusura"
          value={`${kpiData.winRate}%`}
          change="win rate"
          changeType="neutral"
          icon={<TrendingUp size={24} />}
          color="purple"
        />

      </div>

      <div className="charts-row">
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Andamento Vendite</h3>
            <select className="chart-filter">
              <option>Ultimi 6 mesi</option>
              <option>Ultimo anno</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `€${v / 1000}K`} />
              <Tooltip
                formatter={(value) => [`€${value.toLocaleString()}`, '']}
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="vendite" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2 }} name="Vendite" />
              <Line type="monotone" dataKey="obiettivo" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Obiettivo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Pipeline per Fase</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pipelineData.map((entry, index) => (
              <div key={entry.name} className="legend-item">
                <span className="legend-dot" style={{ background: COLORS[index] }}></span>
                <span className="legend-label">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="recent-card">
          <div className="card-header">
            <h3>Opportunità Recenti</h3>
            <button className="text-btn" onClick={() => setActiveView('opportunities')}>Vedi tutte</button>
          </div>
          <div className="recent-list">
            {opportunities.slice(0, 4).map(opp => (
              <div key={opp.id} className="recent-item">
                <div className="recent-info">
                  <span className="recent-title">{opp.title}</span>
                  <span className="recent-subtitle">{opp.company}</span>
                </div>
                <div className="recent-meta">
                  <span className="recent-value">€{opp.value.toLocaleString()}</span>
                  <span className={`stage-badge ${opp.stage.toLowerCase()}`}>{opp.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>

  );

  const Pipeline = () => {
    // Filter opportunities by selected year
    const filteredOpportunities = opportunities.filter(opp => {
      if (!opp.closeDate) return true;
      const oppYear = new Date(opp.closeDate).getFullYear();
      return oppYear === selectedYear;
    });

    // Get available years from opportunities
    const availableYears = [...new Set(opportunities
      .map(opp => opp.closeDate ? new Date(opp.closeDate).getFullYear() : null)
      .filter(year => year !== null)
    )].sort((a, b) => b - a);

    return (
      <div className="pipeline-view">
        <div className="pipeline-header">
          <div className="pipeline-filters">
            <select
              className="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="pipeline-stats">
            {pipelineStages.map((stage, idx) => {
              const stageOpps = filteredOpportunities.filter(o => o.stage === stage);
              const stageValue = stageOpps.reduce((sum, o) => sum + o.value, 0);
              return (
                <div key={stage} className="stage-stat">
                  <span className="stage-name">{stage}</span>
                  <span className="stage-count">{stageOpps.length} opportunità</span>
                  <span className="stage-value">€{stageValue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="kanban-board">
          {pipelineStages.map((stage, idx) => {
            // Define gradient colors for each stage
            const gradients = [
              { color1: '#fbbf24', color2: '#f59e0b', accent: '#f59e0b' }, // Lead - Yellow/Amber
              { color1: '#60a5fa', color2: '#3b82f6', accent: '#3b82f6' }, // In contatto - Blue
              { color1: '#fb923c', color2: '#f97316', accent: '#f97316' }, // Follow Up - Orange
              { color1: '#34d399', color2: '#10b981', accent: '#10b981' }, // Chiuso Vinto - Green
              { color1: '#a78bfa', color2: '#8b5cf6', accent: '#8b5cf6' }, // Stand By - Purple
              { color1: '#f472b6', color2: '#ec4899', accent: '#ec4899' }, // Revisionare - Pink
              { color1: '#f87171', color2: '#ef4444', accent: '#ef4444' }  // Chiuso Perso - Red
            ];
            const gradient = gradients[idx];

            return (
              <div
                key={stage}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                style={{
                  '--header-color-1': gradient.color1,
                  '--header-color-2': gradient.color2,
                  '--card-accent-color': gradient.accent
                }}
              >
                <div className="column-header" style={{ borderTopColor: COLORS[idx] }}>
                  <h3>{stage}</h3>
                  <span className="column-count">{filteredOpportunities.filter(o => o.stage === stage).length}</span>
                </div>
                <div className="column-content">
                  {filteredOpportunities.filter(o => o.stage === stage).map(opp => (
                    <div
                      key={opp.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp)}
                    >
                      <div className="card-drag-handle"><GripVertical size={16} /></div>
                      <div className="kanban-card-header">
                        <span className="card-title">{opp.title || 'Senza titolo'}</span>
                        <button className="card-menu" onClick={() => openAddModal('opportunity', opp)}><Edit2 size={14} /></button>
                      </div>
                      <div className="card-company">{opp.company || 'N/D'}</div>
                      <div className="card-badges">
                        <span className="badge badge-value">€{opp.value.toLocaleString()}</span>
                        <span className={`badge badge-probability ${opp.probability >= 75 ? 'high' : opp.probability >= 40 ? 'medium' : 'low'}`}>
                          {opp.probability}% probabilità
                        </span>
                      </div>
                      <div className="card-dates">
                        {opp.openDate && (
                          <div className="card-date">
                            <Clock size={12} />
                            <span>Aperto: {opp.openDate}</span>
                          </div>
                        )}
                        {opp.closeDate && (
                          <div className="card-date">
                            <Clock size={12} />
                            <span>Chiusura: {opp.closeDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-card-btn" onClick={() => openAddModal('opportunity')}>
                  <Plus size={16} />
                  <span>Aggiungi opportunità</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Contacts = () => (
    <div className="contacts-view">
      <div className="view-toolbar">
        <div className="toolbar-left">
          <button className="filter-btn">
            <Filter size={18} />
            <span>Filtri</span>
            <ChevronDown size={16} />
          </button>
          <div className="filter-tags">
            <span className="filter-tag">Tutti i contatti</span>
          </div>
        </div>
        <button className="primary-btn" onClick={() => openAddModal('contact')}>
          <Plus size={18} />
          <span>Nuovo Contatto</span>
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Azienda</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Valore</th>
              <th>Stato</th>
              <th>Ultimo Contatto</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td>
                  <div className="contact-cell">
                    <div className="contact-avatar">{contact.avatar}</div>
                    <span className="contact-name">{contact.name}</span>
                  </div>
                </td>
                <td>
                  <div className="company-cell">
                    <Building2 size={16} />
                    <span>{contact.company}</span>
                  </div>
                </td>
                <td>
                  <div className="email-cell">
                    <Mail size={16} />
                    <span>{contact.email}</span>
                  </div>
                </td>
                <td>
                  <div className="phone-cell">
                    <Phone size={16} />
                    <span>{contact.phone}</span>
                  </div>
                </td>
                <td className="value-cell">€{contact.value.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${contact.status.toLowerCase()}`}>{contact.status}</span>
                </td>
                <td className="date-cell">{contact.lastContact}</td>
                <td>
                  <div className="actions-cell">
                    <button className="action-btn"><Eye size={16} /></button>
                    <button className="action-btn" onClick={() => openAddModal('contact', contact)}><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDeleteContact(contact.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Opportunities = () => (
    <div className="opportunities-view">
      <div className="view-toolbar">
        <div className="toolbar-left">
          <button className="filter-btn">
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

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Opportunità</th>
              <th>Azienda</th>
              <th>Valore</th>
              <th>Fase</th>
              <th>Probabilità</th>
              <th>Data Chiusura</th>
              <th>Responsabile</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map(opp => (
              <tr key={opp.id}>
                <td className="opp-title">{opp.title}</td>
                <td>
                  <div className="company-cell">
                    <Building2 size={16} />
                    <span>{opp.company}</span>
                  </div>
                </td>
                <td className="value-cell">€{opp.value.toLocaleString()}</td>
                <td>
                  <span className={`stage-badge ${opp.stage.toLowerCase().replace(' ', '-')}`}>{opp.stage}</span>
                </td>
                <td>
                  <div className="probability-cell">
                    <div className="probability-bar">
                      <div className="probability-fill" style={{ width: `${opp.probability}%` }}></div>
                    </div>
                    <span>{opp.probability}%</span>
                  </div>
                </td>
                <td className="date-cell">{opp.closeDate}</td>
                <td>{opp.owner}</td>
                <td>
                  <div className="actions-cell">
                    <button className="action-btn"><Eye size={16} /></button>
                    <button className="action-btn" onClick={() => openAddModal('opportunity', opp)}><Edit2 size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDeleteOpportunity(opp.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );



  const AddModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isEditing ? 'Modifica' : 'Nuova'} {modalType === 'contact' ? 'Contatto' : 'Opportunità'}
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
                    value={newItem.stage || 'Qualificazione'}
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

        </div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={() => setShowAddModal(false)}>Annulla</button>
          <button className="primary-btn" onClick={handleAddItem}>Salva</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="crm-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .crm-app {
          display: flex;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f1f5f9;
          color: #1e293b;
        }
        
        /* Sidebar */
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          margin-bottom: 32px;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .nav-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .sidebar-footer {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 16px;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }
        
        /* Header */
        .header {
          background: #fff;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }
        
        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f1f5f9;
          padding: 10px 16px;
          border-radius: 10px;
          width: 400px;
        }
        
        .search-box svg {
          color: #64748b;
        }
        
        .search-box input {
          border: none;
          background: transparent;
          flex: 1;
          font-size: 14px;
          color: #1e293b;
          outline: none;
        }
        
        .search-box input::placeholder {
          color: #94a3b8;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          color: #64748b;
          transition: all 0.2s;
        }
        
        .icon-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: #ef4444;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }
        
        /* Content Area */
        .content {
          padding: 32px;
        }
        
        /* Dashboard */
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        .kpi-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .kpi-title {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        
        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .kpi-icon.blue { background: #dbeafe; color: #3b82f6; }
        .kpi-icon.green { background: #d1fae5; color: #10b981; }
        .kpi-icon.purple { background: #ede9fe; color: #8b5cf6; }
        .kpi-icon.orange { background: #ffedd5; color: #f59e0b; }
        
        .kpi-value {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }
        
        .kpi-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .kpi-change.positive { color: #10b981; }
        .kpi-change.negative { color: #ef4444; }
        .kpi-change.neutral { color: #64748b; }
        
        /* Charts */
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        
        .chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .chart-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .chart-filter {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          color: #64748b;
          background: #fff;
          cursor: pointer;
        }
        
        .pie-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          margin-top: 16px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }
        
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        /* Bottom Row */
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .recent-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .text-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .text-btn:hover {
          text-decoration: underline;
        }
        
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 10px;
          transition: all 0.2s;
        }
        
        .recent-item:hover {
          background: #f1f5f9;
        }
        
        .recent-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .recent-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .recent-subtitle {
          font-size: 13px;
          color: #64748b;
        }
        
        .recent-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        
        .recent-value {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        
        /* Badges */
        .stage-badge, .status-badge, .priority-badge, .type-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .stage-badge.qualificazione { background: #dbeafe; color: #1d4ed8; }
        .stage-badge.proposta { background: #d1fae5; color: #059669; }
        .stage-badge.negoziazione { background: #fef3c7; color: #d97706; }
        .stage-badge.chiusura { background: #fee2e2; color: #dc2626; }
        
        .status-badge.cliente { background: #d1fae5; color: #059669; }
        .status-badge.lead { background: #dbeafe; color: #1d4ed8; }
        .status-badge.prospect { background: #fef3c7; color: #d97706; }
        
        .priority-badge.alta { background: #fee2e2; color: #dc2626; }
        .priority-badge.media { background: #fef3c7; color: #d97706; }
        .priority-badge.bassa { background: #d1fae5; color: #059669; }
        
        .type-badge.chiamata { background: #dbeafe; color: #1d4ed8; }
        .type-badge.email { background: #ede9fe; color: #7c3aed; }
        .type-badge.meeting { background: #d1fae5; color: #059669; }
        .type-badge.documento { background: #fef3c7; color: #d97706; }
        
        .due-date {
          font-size: 12px;
          color: #64748b;
        }
        
        /* Pipeline View */
        .pipeline-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .pipeline-header {
          background: #fff;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .pipeline-stats {
          display: flex;
          gap: 32px;
        }
        
        .stage-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .stage-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .stage-count {
          font-size: 12px;
          color: #64748b;
        }
        
        .stage-value {
          font-size: 16px;
          font-weight: 700;
          color: #3b82f6;
        }
        
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          min-height: 600px;
        }
        
        .kanban-column {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }
        
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-top: 3px solid;
          padding-top: 12px;
          border-radius: 3px 3px 0 0;
        }
        
        .column-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .column-count {
          width: 24px;
          height: 24px;
          background: #f1f5f9;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }
        
        .column-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 200px;
        }
        
        .kanban-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          cursor: grab;
          transition: all 0.2s;
          position: relative;
        }
        
        .kanban-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .kanban-card:active {
          cursor: grabbing;
        }
        
        .card-drag-handle {
          position: absolute;
          top: 8px;
          left: 8px;
          color: #cbd5e1;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .kanban-card:hover .card-drag-handle {
          opacity: 1;
        }
        
        .kanban-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .card-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.3;
        }
        
        .card-menu {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        
        .card-menu:hover {
          background: #e2e8f0;
          color: #64748b;
        }
        
        .card-company {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 12px;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .card-value {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        
        .card-probability {
          font-size: 13px;
          font-weight: 600;
          color: #3b82f6;
          background: #dbeafe;
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94a3b8;
        }
        
        .add-card-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 2px dashed #e2e8f0;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: auto;
        }
        
        .add-card-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #f8fafc;
        }
        
        /* Data Table Views */
        .contacts-view, .opportunities-view, .tasks-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .view-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .filter-tags {
          display: flex;
          gap: 8px;
        }
        
        .filter-tag {
          padding: 6px 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-tag:hover, .filter-tag.active {
          background: #3b82f6;
          color: #fff;
        }
        
        .primary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .secondary-btn {
          padding: 10px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .secondary-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        
        /* Data Table */
        .data-table {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
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
          letter-spacing: 0.5px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .data-table td {
          padding: 16px 20px;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
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
          border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }
        
        .contact-name {
          font-weight: 600;
        }
        
        .company-cell, .email-cell, .phone-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
        }
        
        .company-cell svg, .email-cell svg, .phone-cell svg {
          color: #94a3b8;
        }
        
        .value-cell {
          font-weight: 600;
          color: #0f172a;
        }
        
        .opp-title {
          font-weight: 600;
        }
        
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
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 3px;
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
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .action-btn.delete:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }
        
        /* Tasks View */
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fff;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        
        .task-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .task-item.completed {
          opacity: 0.6;
        }
        
        .task-item.completed .task-title {
          text-decoration: line-through;
        }
        
        .task-checkbox input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #3b82f6;
        }
        
        .task-content {
          flex: 1;
        }
        
        .task-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .task-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .task-badges {
          display: flex;
          gap: 8px;
        }
        
        .task-meta {
          display: flex;
          gap: 20px;
        }
        
        .task-contact, .task-due {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }
        
        .task-actions {
          display: flex;
          gap: 8px;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        
        .modal {
          background: #fff;
          border-radius: 20px;
          width: 500px;
          max-width: 90vw;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: modalIn 0.3s ease;
        }
        
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
        }
        
        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }
        
        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-group.full {
          grid-column: span 2;
        }
        
        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }
        
        .form-group input, .form-group select {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
        }
        
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px 24px;
          border-top: 1px solid #f1f5f9;
        }
      `}</style>

      <Sidebar />

      <main className="main-content">
        <Header />
        <div className="content">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'pipeline' && <Pipeline />}
          {activeView === 'contacts' && <Contacts />}
          {activeView === 'opportunities' && <Opportunities />}

          {activeView === 'settings' && (
            <div className="chart-card">
              <h3>Impostazioni</h3>
              <p style={{ color: '#64748b', marginTop: '12px' }}>Configurazione del sistema...</p>
            </div>
          )}
        </div>
      </main>

      {showAddModal && <AddModal />}
    </div>
  );
}
