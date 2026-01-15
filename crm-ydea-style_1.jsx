import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Target, CheckSquare, Calendar, Settings, Bell, Search, Plus, MoreHorizontal, Phone, Mail, Building2, Euro, Clock, ArrowUpRight, ArrowDownRight, Filter, ChevronDown, GripVertical, X, Edit2, Trash2, Eye } from 'lucide-react';

// Dati di esempio
const initialContacts = [
  { id: 1, name: 'Marco Rossi', company: 'Tech Solutions Srl', email: 'marco.rossi@techsol.it', phone: '+39 02 1234567', value: 45000, status: 'Cliente', lastContact: '2024-01-15', avatar: 'MR' },
  { id: 2, name: 'Laura Bianchi', company: 'Digital Agency SpA', email: 'l.bianchi@digitalagency.it', phone: '+39 06 7654321', value: 32000, status: 'Lead', lastContact: '2024-01-18', avatar: 'LB' },
  { id: 3, name: 'Giuseppe Verdi', company: 'Innovate Corp', email: 'g.verdi@innovate.it', phone: '+39 011 9876543', value: 78000, status: 'Prospect', lastContact: '2024-01-20', avatar: 'GV' },
  { id: 4, name: 'Anna Ferrari', company: 'Smart Systems', email: 'anna.ferrari@smartsys.it', phone: '+39 055 1472583', value: 25000, status: 'Cliente', lastContact: '2024-01-22', avatar: 'AF' },
  { id: 5, name: 'Paolo Colombo', company: 'Future Tech', email: 'p.colombo@futuretech.it', phone: '+39 041 3698521', value: 55000, status: 'Lead', lastContact: '2024-01-23', avatar: 'PC' },
];

const initialOpportunities = [
  { id: 1, title: 'Implementazione ERP', company: 'Tech Solutions Srl', value: 85000, stage: 'Qualificazione', probability: 30, closeDate: '2024-03-15', owner: 'Mario Neri' },
  { id: 2, title: 'Migrazione Cloud', company: 'Digital Agency SpA', value: 42000, stage: 'Proposta', probability: 60, closeDate: '2024-02-28', owner: 'Sara Blu' },
  { id: 3, title: 'Consulenza AI', company: 'Innovate Corp', value: 65000, stage: 'Negoziazione', probability: 80, closeDate: '2024-02-15', owner: 'Mario Neri' },
  { id: 4, title: 'Sistema CRM', company: 'Smart Systems', value: 38000, stage: 'Chiusura', probability: 90, closeDate: '2024-02-10', owner: 'Sara Blu' },
  { id: 5, title: 'Automazione Marketing', company: 'Future Tech', value: 28000, stage: 'Qualificazione', probability: 25, closeDate: '2024-04-01', owner: 'Mario Neri' },
  { id: 6, title: 'Sviluppo App Mobile', company: 'Tech Solutions Srl', value: 55000, stage: 'Proposta', probability: 50, closeDate: '2024-03-20', owner: 'Sara Blu' },
];

const initialTasks = [
  { id: 1, title: 'Follow-up chiamata Tech Solutions', type: 'Chiamata', priority: 'Alta', dueDate: '2024-01-25', status: 'Da fare', contact: 'Marco Rossi' },
  { id: 2, title: 'Preparare proposta Digital Agency', type: 'Documento', priority: 'Alta', dueDate: '2024-01-26', status: 'In corso', contact: 'Laura Bianchi' },
  { id: 3, title: 'Demo prodotto Innovate Corp', type: 'Meeting', priority: 'Media', dueDate: '2024-01-28', status: 'Da fare', contact: 'Giuseppe Verdi' },
  { id: 4, title: 'Inviare contratto Smart Systems', type: 'Email', priority: 'Alta', dueDate: '2024-01-24', status: 'Completata', contact: 'Anna Ferrari' },
  { id: 5, title: 'Revisione offerta Future Tech', type: 'Documento', priority: 'Bassa', dueDate: '2024-01-30', status: 'Da fare', contact: 'Paolo Colombo' },
];

const salesData = [
  { month: 'Ago', vendite: 45000, obiettivo: 50000 },
  { month: 'Set', vendite: 52000, obiettivo: 50000 },
  { month: 'Ott', vendite: 48000, obiettivo: 55000 },
  { month: 'Nov', vendite: 61000, obiettivo: 55000 },
  { month: 'Dic', vendite: 58000, obiettivo: 60000 },
  { month: 'Gen', vendite: 72000, obiettivo: 65000 },
];

const pipelineStages = ['Qualificazione', 'Proposta', 'Negoziazione', 'Chiusura'];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function VAIBApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [contacts, setContacts] = useState(initialContacts);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  // Calcoli KPI
  const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedPipeline = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const wonDeals = opportunities.filter(o => o.stage === 'Chiusura').length;
  const conversionRate = ((wonDeals / opportunities.length) * 100).toFixed(1);

  const pipelineData = pipelineStages.map(stage => ({
    name: stage,
    value: opportunities.filter(o => o.stage === stage).reduce((sum, o) => sum + o.value, 0)
  }));

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
      const newProbabilities = { 'Qualificazione': 30, 'Proposta': 50, 'Negoziazione': 75, 'Chiusura': 95 };
      setOpportunities(opportunities.map(opp => 
        opp.id === draggedItem.id 
          ? { ...opp, stage: newStage, probability: newProbabilities[newStage] }
          : opp
      ));
      setDraggedItem(null);
    }
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
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
        <NavItem icon={<CheckSquare size={20} />} label="Attività" view="tasks" />
        <NavItem icon={<Calendar size={20} />} label="Calendario" view="calendar" />
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
          {activeView === 'tasks' && 'Attività'}
          {activeView === 'calendar' && 'Calendario'}
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
          title="Pipeline Totale" 
          value={`€${(totalRevenue / 1000).toFixed(0)}K`}
          change="+12.5% vs mese scorso"
          changeType="positive"
          icon={<Euro size={24} />}
          color="blue"
        />
        <KPICard 
          title="Pipeline Ponderata" 
          value={`€${(weightedPipeline / 1000).toFixed(0)}K`}
          change="+8.3% vs mese scorso"
          changeType="positive"
          icon={<Target size={24} />}
          color="green"
        />
        <KPICard 
          title="Tasso Conversione" 
          value={`${conversionRate}%`}
          change="+2.1% vs mese scorso"
          changeType="positive"
          icon={<TrendingUp size={24} />}
          color="purple"
        />
        <KPICard 
          title="Attività Aperte" 
          value={tasks.filter(t => t.status !== 'Completata').length}
          change="3 in scadenza oggi"
          changeType="neutral"
          icon={<CheckSquare size={24} />}
          color="orange"
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
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `€${v/1000}K`} />
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

        <div className="recent-card">
          <div className="card-header">
            <h3>Attività in Scadenza</h3>
            <button className="text-btn" onClick={() => setActiveView('tasks')}>Vedi tutte</button>
          </div>
          <div className="recent-list">
            {tasks.filter(t => t.status !== 'Completata').slice(0, 4).map(task => (
              <div key={task.id} className="recent-item">
                <div className="recent-info">
                  <span className="recent-title">{task.title}</span>
                  <span className="recent-subtitle">{task.contact}</span>
                </div>
                <div className="recent-meta">
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className="due-date">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Pipeline = () => (
    <div className="pipeline-view">
      <div className="pipeline-header">
        <div className="pipeline-stats">
          {pipelineStages.map((stage, idx) => {
            const stageOpps = opportunities.filter(o => o.stage === stage);
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
        {pipelineStages.map((stage, idx) => (
          <div 
            key={stage} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="column-header" style={{ borderTopColor: COLORS[idx] }}>
              <h3>{stage}</h3>
              <span className="column-count">{opportunities.filter(o => o.stage === stage).length}</span>
            </div>
            <div className="column-content">
              {opportunities.filter(o => o.stage === stage).map(opp => (
                <div 
                  key={opp.id} 
                  className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, opp)}
                >
                  <div className="card-drag-handle"><GripVertical size={16} /></div>
                  <div className="kanban-card-header">
                    <span className="card-title">{opp.title}</span>
                    <button className="card-menu"><MoreHorizontal size={16} /></button>
                  </div>
                  <div className="card-company">{opp.company}</div>
                  <div className="card-footer">
                    <span className="card-value">€{opp.value.toLocaleString()}</span>
                    <span className="card-probability">{opp.probability}%</span>
                  </div>
                  <div className="card-meta">
                    <Clock size={14} />
                    <span>Chiusura: {opp.closeDate}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-card-btn" onClick={() => openAddModal('opportunity')}>
              <Plus size={16} />
              <span>Aggiungi opportunità</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

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
                    <button className="action-btn"><Edit2 size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
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
                    <button className="action-btn"><Edit2 size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Tasks = () => (
    <div className="tasks-view">
      <div className="view-toolbar">
        <div className="toolbar-left">
          <button className="filter-btn">
            <Filter size={18} />
            <span>Filtri</span>
            <ChevronDown size={16} />
          </button>
          <div className="filter-tags">
            <button className="filter-tag active">Tutte</button>
            <button className="filter-tag">Da fare</button>
            <button className="filter-tag">In corso</button>
            <button className="filter-tag">Completate</button>
          </div>
        </div>
        <button className="primary-btn" onClick={() => openAddModal('task')}>
          <Plus size={18} />
          <span>Nuova Attività</span>
        </button>
      </div>

      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${task.status === 'Completata' ? 'completed' : ''}`}>
            <div className="task-checkbox">
              <input 
                type="checkbox" 
                checked={task.status === 'Completata'}
                onChange={() => {
                  setTasks(tasks.map(t => 
                    t.id === task.id 
                      ? { ...t, status: t.status === 'Completata' ? 'Da fare' : 'Completata' }
                      : t
                  ));
                }}
              />
            </div>
            <div className="task-content">
              <div className="task-header">
                <span className="task-title">{task.title}</span>
                <div className="task-badges">
                  <span className={`type-badge ${task.type.toLowerCase()}`}>{task.type}</span>
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
              </div>
              <div className="task-meta">
                <span className="task-contact">
                  <Users size={14} />
                  {task.contact}
                </span>
                <span className="task-due">
                  <Calendar size={14} />
                  {task.dueDate}
                </span>
              </div>
            </div>
            <div className="task-actions">
              <button className="action-btn"><Edit2 size={16} /></button>
              <button className="action-btn delete"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AddModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {modalType === 'contact' && 'Nuovo Contatto'}
            {modalType === 'opportunity' && 'Nuova Opportunità'}
            {modalType === 'task' && 'Nuova Attività'}
          </h2>
          <button className="close-btn" onClick={() => setShowAddModal(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {modalType === 'contact' && (
            <form className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome</label>
                  <input type="text" placeholder="Nome completo" />
                </div>
                <div className="form-group">
                  <label>Azienda</label>
                  <input type="text" placeholder="Nome azienda" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="email@esempio.it" />
                </div>
                <div className="form-group">
                  <label>Telefono</label>
                  <input type="tel" placeholder="+39 ..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valore Stimato</label>
                  <input type="number" placeholder="€" />
                </div>
                <div className="form-group">
                  <label>Stato</label>
                  <select>
                    <option>Lead</option>
                    <option>Prospect</option>
                    <option>Cliente</option>
                  </select>
                </div>
              </div>
            </form>
          )}
          {modalType === 'opportunity' && (
            <form className="modal-form">
              <div className="form-group full">
                <label>Titolo Opportunità</label>
                <input type="text" placeholder="Es. Implementazione ERP" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Azienda</label>
                  <select>
                    {contacts.map(c => <option key={c.id}>{c.company}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Valore</label>
                  <input type="number" placeholder="€" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fase</label>
                  <select>
                    {pipelineStages.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Data Chiusura Prevista</label>
                  <input type="date" />
                </div>
              </div>
            </form>
          )}
          {modalType === 'task' && (
            <form className="modal-form">
              <div className="form-group full">
                <label>Titolo Attività</label>
                <input type="text" placeholder="Es. Follow-up chiamata" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select>
                    <option>Chiamata</option>
                    <option>Email</option>
                    <option>Meeting</option>
                    <option>Documento</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priorità</label>
                  <select>
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Bassa</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contatto</label>
                  <select>
                    {contacts.map(c => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Scadenza</label>
                  <input type="date" />
                </div>
              </div>
            </form>
          )}
        </div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={() => setShowAddModal(false)}>Annulla</button>
          <button className="primary-btn" onClick={() => setShowAddModal(false)}>Salva</button>
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
          {activeView === 'tasks' && <Tasks />}
          {activeView === 'calendar' && (
            <div className="chart-card">
              <h3>Calendario</h3>
              <p style={{ color: '#64748b', marginTop: '12px' }}>Funzionalità calendario in arrivo...</p>
            </div>
          )}
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
