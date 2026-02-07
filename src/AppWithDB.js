import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Onboarding from './components/Onboarding';
import GuidedTour from './components/GuidedTour';
import api from './api/api';
import { getAllDemoData } from './services/demoData';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Contacts from './components/Contacts';
import Opportunities from './components/Opportunities';
import Tasks from './components/Tasks';
import Projects from './components/Projects';
import Invoices from './components/Invoices';
import AddModal from './components/AddModal';
import InvoiceModal from './components/InvoiceModal';
import Settings from './components/Settings';
import Calendar from './components/Calendar';
import AiChat from './components/AiChat';

// Utils
import { calculateForfettarioStats } from './utils/invoiceCalculations';
import { CURRENT_YEAR } from './constants/business';

// UI Configuration Context
import { UIConfigProvider, useUIConfig } from './context/UIConfigContext';
import { ToastProvider, useToast } from './context/ToastContext';

// Icons for Bottom Navigation
import { TrendingUp, Target, Users, Euro, CheckSquare } from 'lucide-react';

// Main App wrapper with UIConfigProvider
export default function VAIBApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password'
  const [isNewUser, setIsNewUser] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check authentication and URL params on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    // Check for reset-password token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetTokenParam = urlParams.get('reset-token');
    if (resetTokenParam) {
      setResetToken(resetTokenParam);
      setAuthView('reset-password');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLoginSuccess = (userData, newUser = false) => {
    setUser(userData);
    setIsNewUser(newUser);
    setIsAuthenticated(true);
    setIsDemoMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setAuthView('landing');
    setIsNewUser(false);
    setIsDemoMode(false);
    setShowTour(false);
  };

  const handleStartDemo = () => {
    const demoData = getAllDemoData();
    setUser(demoData.user);
    setIsDemoMode(true);
    setIsAuthenticated(true);
    setShowTour(true);
  };

  // Not authenticated - show landing or login/register/forgot/reset
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return (
        <Landing
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
          onDemo={handleStartDemo}
        />
      );
    }

    if (authView === 'forgot-password') {
      return (
        <ForgotPassword
          onBack={() => setAuthView('login')}
        />
      );
    }

    if (authView === 'reset-password' && resetToken) {
      return (
        <ResetPassword
          token={resetToken}
          onSuccess={() => {
            setResetToken(null);
            setAuthView('login');
          }}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        mode={authView}
        onBack={() => setAuthView('landing')}
        onSwitchMode={(mode) => setAuthView(mode)}
        onForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  return (
    <ToastProvider>
      <UIConfigProvider isAuthenticated={isAuthenticated} isDemoMode={isDemoMode}>
        <VAIBContent
          user={user}
          isNewUser={isNewUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          isDemoMode={isDemoMode}
          showTour={showTour}
          onCloseTour={() => setShowTour(false)}
        />
      </UIConfigProvider>
    </ToastProvider>
  );
}

// Inner component with all VAIB functionality
function VAIBContent({ user, isNewUser, onLoginSuccess, onLogout, isDemoMode, showTour, onCloseTour }) {
  // Toast notifications
  const toast = useToast();

  // Initialize with demo data if in demo mode
  const initialDemoData = isDemoMode ? getAllDemoData() : null;

  const [activeView, setActiveView] = useState('dashboard');
  const [contacts, setContacts] = useState(initialDemoData?.contacts || []);
  const [opportunities, setOpportunities] = useState(initialDemoData?.opportunities || []);
  const [tasks, setTasks] = useState(initialDemoData?.tasks || []);
  const [invoices, setInvoices] = useState(initialDemoData?.invoices || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePrefilledData, setInvoicePrefilledData] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Check if onboarding is needed (only for NEW users who just registered)
  useEffect(() => {
    if (!dataLoaded) return;

    const onboardingComplete = localStorage.getItem('vaib_onboarding_complete');
    const hasExistingData = contacts.length > 0 || opportunities.length > 0 || tasks.length > 0 || invoices.length > 0;

    // Show onboarding for new registrations (isNewUser flag) or new users without data
    if (isNewUser && !onboardingComplete) {
      setShowOnboarding(true);
    } else if (!onboardingComplete && !hasExistingData) {
      // Fallback: also show for users without data who haven't completed onboarding
      setShowOnboarding(true);
    } else if (hasExistingData && !onboardingComplete) {
      // Existing user with data - mark as complete automatically
      localStorage.setItem('vaib_onboarding_complete', 'true');
    }
  }, [dataLoaded, isNewUser, contacts.length, opportunities.length, tasks.length, invoices.length]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Get UI config - theme is already applied by UIConfigProvider
  const { config, updateTheme } = useUIConfig();

  // Local theme state for backward compatibility (synced with UIConfig)
  const [theme, setTheme] = useState(config?.theme?.mode || localStorage.getItem('theme') || 'light');

  // Sync local theme with config theme when it changes
  useEffect(() => {
    if (config?.theme?.mode) {
      setTheme(config.theme.mode);
    }
  }, [config?.theme?.mode]);

  // Toggle theme - updates both local state and UIConfig
  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Also update in UIConfig (non-blocking)
    updateTheme({ mode: newTheme }).catch(err => {
      console.warn('[Theme] Failed to persist theme to config:', err);
    });
  };

  // Load data on mount (already authenticated at this point)
  // Demo data is loaded in useState initialization, so skip for demo mode
  useEffect(() => {
    if (isDemoMode) {
      // Data already loaded from initialization
      setDataLoaded(true);
    } else {
      loadAllData();
    }
  }, [isDemoMode]);

  // Close sidebar when view changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeView]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [contactsData, opportunitiesData, tasksData, invoicesData] = await Promise.all([
        api.getContacts(),
        api.getOpportunities(),
        api.getTasks(),
        api.getInvoices()
      ]);
      setContacts(contactsData);
      setOpportunities(opportunitiesData);
      setTasks(tasksData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  };

  // Wrap onLogout to also clear local data
  const handleLogout = () => {
    setContacts([]);
    setOpportunities([]);
    setTasks([]);
    setInvoices([]);
    onLogout();
  };

  // Mobile navigation handler
  const handleMobileNavigation = (view) => {
    setActiveView(view);
  };

  // CRUD Operations - In demo mode, only update local state
  const handleAddItem = async () => {
    try {
      if (modalType === 'contact') {
        const contactData = {
          ...newItem,
          value: Number(newItem.value) || 0,
          avatar: newItem.name ? newItem.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??',
          lastContact: newItem.lastContact || new Date().toISOString().split('T')[0]
        };

        if (isDemoMode) {
          // Demo mode: update local state only
          if (isEditing) {
            setContacts(contacts.map(c => c.id === newItem.id ? { ...c, ...contactData } : c));
          } else {
            setContacts([...contacts, { id: `demo-new-${Date.now()}`, ...contactData }]);
          }
        } else {
          if (isEditing) {
            const updated = await api.updateContact(newItem.id, contactData);
            setContacts(contacts.map(c => c.id === updated.id ? updated : c));
          } else {
            const created = await api.createContact(contactData);
            setContacts([...contacts, created]);
          }
        }
      } else if (modalType === 'opportunity') {
        const oppData = {
          ...newItem,
          value: Number(newItem.value) || 0,
          owner: newItem.owner || user.fullName || user.username
        };

        if (isDemoMode) {
          if (isEditing) {
            setOpportunities(opportunities.map(o => o.id === newItem.id ? { ...o, ...oppData } : o));
          } else {
            setOpportunities([...opportunities, { id: `demo-new-${Date.now()}`, ...oppData }]);
          }
        } else {
          if (isEditing) {
            const updated = await api.updateOpportunity(newItem.id, oppData);
            setOpportunities(opportunities.map(o => o.id === updated.id ? updated : o));
          } else {
            const created = await api.createOpportunity(oppData);
            setOpportunities([...opportunities, created]);
          }
        }
      } else if (modalType === 'task') {
        const taskData = {
          ...newItem,
          contactName: contacts.find(c => c.id === newItem.contactId)?.name
        };

        if (isDemoMode) {
          if (isEditing) {
            setTasks(tasks.map(t => t.id === newItem.id ? { ...t, ...taskData } : t));
          } else {
            setTasks([...tasks, { id: `demo-new-${Date.now()}`, ...taskData }]);
          }
        } else {
          if (isEditing) {
            const updated = await api.updateTask(newItem.id, taskData);
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
          } else {
            const created = await api.createTask(taskData);
            setTasks([...tasks, created]);
          }
        }
      }

      setShowAddModal(false);
      setNewItem({});
      setIsEditing(false);

      // Success toast
      const typeLabels = { contact: 'Contatto', opportunity: 'Opportunità', task: 'Attività' };
      toast.success(`${typeLabels[modalType] || 'Elemento'} ${isEditing ? 'aggiornato' : 'creato'} con successo`);
    } catch (error) {
      toast.error(error.message || 'Si è verificato un errore');
    }
  };

  // Chat-based CRUD operations (no modal needed)
  const handleChatAddContact = async (contactData) => {
    try {
      const data = {
        ...contactData,
        value: Number(contactData.value) || 0,
        avatar: contactData.name ? contactData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??',
        lastContact: contactData.lastContact || new Date().toISOString().split('T')[0]
      };

      if (isDemoMode) {
        setContacts(prev => [...prev, { id: `demo-chat-${Date.now()}`, ...data }]);
      } else {
        const created = await api.createContact(data);
        setContacts(prev => [...prev, created]);
      }
      return true;
    } catch (error) {
      console.error('Error creating contact from chat:', error);
      return false;
    }
  };

  const handleChatAddOpportunity = async (oppData) => {
    try {
      const data = {
        ...oppData,
        value: Number(oppData.value) || 0,
        owner: oppData.owner || user.fullName || user.username
      };

      if (isDemoMode) {
        setOpportunities(prev => [...prev, { id: `demo-chat-${Date.now()}`, ...data }]);
      } else {
        const created = await api.createOpportunity(data);
        setOpportunities(prev => [...prev, created]);
      }
      return true;
    } catch (error) {
      console.error('Error creating opportunity from chat:', error);
      return false;
    }
  };

  const handleChatAddTask = async (taskData) => {
    try {
      const data = {
        ...taskData,
        completed: false
      };

      if (isDemoMode) {
        setTasks(prev => [...prev, { id: `demo-chat-${Date.now()}`, ...data }]);
      } else {
        const created = await api.createTask(data);
        setTasks(prev => [...prev, created]);
      }
      return true;
    } catch (error) {
      console.error('Error creating task from chat:', error);
      return false;
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo contatto?')) {
      if (isDemoMode) {
        setContacts(contacts.filter(c => c.id !== id));
        toast.success('Contatto eliminato');
        return;
      }
      try {
        await api.deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
        toast.success('Contatto eliminato');
      } catch (error) {
        toast.error(error.message || 'Errore durante l\'eliminazione');
      }
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa opportunità?')) {
      if (isDemoMode) {
        setOpportunities(opportunities.filter(o => o.id !== id));
        toast.success('Opportunità eliminata');
        return;
      }
      try {
        await api.deleteOpportunity(id);
        setOpportunities(opportunities.filter(o => o.id !== id));
        toast.success('Opportunità eliminata');
      } catch (error) {
        toast.error(error.message || 'Errore durante l\'eliminazione');
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
      if (isDemoMode) {
        setTasks(tasks.filter(t => t.id !== id));
        toast.success('Attività eliminata');
        return;
      }
      try {
        await api.deleteTask(id);
        setTasks(tasks.filter(t => t.id !== id));
        toast.success('Attività eliminata');
      } catch (error) {
        toast.error(error.message || 'Errore durante l\'eliminazione');
      }
    }
  };

  const handleToggleTask = async (id) => {
    if (isDemoMode) {
      const task = tasks.find(t => t.id === id);
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      toast.success(task?.completed ? 'Attività riaperta' : 'Attività completata');
      return;
    }
    try {
      const updated = await api.toggleTask(id);
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      toast.success(updated.completed ? 'Attività completata' : 'Attività riaperta');
    } catch (error) {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    }
  };

  const openAddModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setNewItem(item);
      // Only set isEditing to true if the item has an ID (meaning it exists in DB)
      // This allows passing "pre-filled" data for new items (like linking a task to an opportunity)
      setIsEditing(!!item.id);
    } else {
      setNewItem({});
      setIsEditing(false);
    }
    setShowAddModal(true);
  };

  // Open invoice modal with optional prefilled data from opportunity
  const handleCreateInvoice = (opportunity = null) => {
    if (opportunity) {
      setInvoicePrefilledData({
        opportunityId: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        value: opportunity.value,
        expectedInvoiceDate: opportunity.expectedInvoiceDate,
        expectedPaymentDate: opportunity.expectedPaymentDate
      });
    } else {
      setInvoicePrefilledData(null);
    }
    setEditingInvoice(null);
    setShowInvoiceModal(true);
  };

  // Save invoice (create or update)
  const handleSaveInvoice = async (invoiceData, invoiceId = null) => {
    try {
      if (isDemoMode) {
        // Demo mode: update local state only
        if (invoiceId) {
          setInvoices(invoices.map(inv => inv.id === invoiceId ? { id: invoiceId, ...invoiceData } : inv));
        } else {
          setInvoices([...invoices, { id: `demo-invoice-${Date.now()}`, ...invoiceData }]);
        }
      } else {
        if (invoiceId) {
          const updated = await api.updateInvoice(invoiceId, invoiceData);
          setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
        } else {
          const created = await api.createInvoice(invoiceData);
          setInvoices([...invoices, created]);
        }
      }
      setShowInvoiceModal(false);
      setInvoicePrefilledData(null);
      setEditingInvoice(null);
    } catch (error) {
      throw error; // Let InvoiceModal handle the error display
    }
  };

  // Bottom navigation items (mobile only)
  const bottomNavItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Home' },
    { id: 'pipeline', icon: Target, label: 'Pipeline' },
    { id: 'contacts', icon: Users, label: 'Contatti' },
    { id: 'opportunities', icon: Euro, label: 'Opportunità' },
    { id: 'tasks', icon: CheckSquare, label: 'Attività' },
  ];

  return (
    <div className="crm-app">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <span>Modalita Demo - Dati fittizi</span>
          <button onClick={onLogout}>Esci dalla demo</button>
        </div>
      )}

      {/* Guided Tour */}
      <GuidedTour
        isActive={showTour}
        onClose={onCloseTour}
        onNavigate={setActiveView}
      />

      {/* Onboarding Wizard */}
      {showOnboarding && !isDemoMode && (
        <Onboarding
          user={currentUser}
          onComplete={handleOnboardingComplete}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="main-content">
        <Header
          activeView={activeView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          setActiveView={setActiveView}
          onMenuClick={() => setSidebarOpen(true)}
          openAddModal={openAddModal}
        />

        <div className="content">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Caricamento dati...</p>
            </div>
          )}

          {!loading && activeView === 'dashboard' && (
            <Dashboard
              opportunities={opportunities}
              tasks={tasks}
              contacts={contacts}
              invoices={invoices}
              setActiveView={setActiveView}
            />
          )}

          {!loading && activeView === 'pipeline' && (
            <Pipeline
              opportunities={opportunities}
              tasks={tasks}
              invoices={invoices}
              setOpportunities={setOpportunities}
              openAddModal={openAddModal}
              setNewItem={setNewItem}
              onCreateInvoice={handleCreateInvoice}
            />
          )}

          {!loading && activeView === 'contacts' && (
            <Contacts
              contacts={contacts}
              openAddModal={openAddModal}
              handleDeleteContact={handleDeleteContact}
            />
          )}

          {!loading && activeView === 'opportunities' && (
            <Opportunities
              opportunities={opportunities}
              openAddModal={openAddModal}
              handleDeleteOpportunity={handleDeleteOpportunity}
            />
          )}

          {!loading && activeView === 'tasks' && (
            <Tasks
              tasks={tasks}
              contacts={contacts}
              opportunities={opportunities}
              openAddModal={openAddModal}
              handleDeleteTask={handleDeleteTask}
              handleToggleTask={handleToggleTask}
            />
          )}

          {!loading && activeView === 'projects' && (
            <Projects
              opportunities={opportunities}
              tasks={tasks}
              invoices={invoices}
              contacts={contacts}
              openAddModal={openAddModal}
              handleToggleTask={handleToggleTask}
              refreshData={loadAllData}
              onCreateInvoice={handleCreateInvoice}
            />
          )}

          {!loading && activeView === 'settings' && (
            <Settings
              user={user}
              contacts={contacts}
              opportunities={opportunities}
              tasks={tasks}
              onUserUpdate={onLoginSuccess}
              currentTheme={theme}
              onThemeChange={toggleTheme}
            />
          )}

          {!loading && activeView === 'calendar' && (
            <Calendar
              tasks={tasks}
              openAddModal={openAddModal}
              handleToggleTask={handleToggleTask}
            />
          )}

          {!loading && activeView === 'invoices' && (
            <Invoices
              opportunities={opportunities}
              invoices={invoices}
              setInvoices={setInvoices}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {bottomNavItems.map(item => (
            <button
              key={item.id}
              className={`bottom-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleMobileNavigation(item.id)}
            >
              <item.icon size={24} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Add/Edit Modal */}
      <AddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        modalType={modalType}
        isEditing={isEditing}
        newItem={newItem}
        setNewItem={setNewItem}
        handleAddItem={handleAddItem}
        contacts={contacts}
        opportunities={opportunities}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setInvoicePrefilledData(null);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        editingInvoice={editingInvoice}
        opportunities={opportunities}
        prefilledData={invoicePrefilledData}
        forfettarioStats={calculateForfettarioStats(invoices, CURRENT_YEAR)}
      />

      {/* AI Chatbot */}
      <AiChat
        isDemoMode={isDemoMode}
        onCreateContact={handleChatAddContact}
        onCreateOpportunity={handleChatAddOpportunity}
        onCreateTask={handleChatAddTask}
      />
    </div>
  );
}
