import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import api from './api/api';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Contacts from './components/Contacts';
import Opportunities from './components/Opportunities';
import Tasks from './components/Tasks';
import AddModal from './components/AddModal';
import Settings from './components/Settings';
import Calendar from './components/Calendar';

export default function YdeaCRM() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [contactsData, opportunitiesData, tasksData] = await Promise.all([
        api.getContacts(),
        api.getOpportunities(),
        api.getTasks()
      ]);
      setContacts(contactsData);
      setOpportunities(opportunitiesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setContacts([]);
    setOpportunities([]);
    setTasks([]);
  };

  // CRUD Operations
  const handleAddItem = async () => {
    try {
      if (modalType === 'contact') {
        const contactData = {
          ...newItem,
          value: Number(newItem.value) || 0,
          avatar: newItem.name ? newItem.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??',
          lastContact: newItem.lastContact || new Date().toISOString().split('T')[0]
        };

        if (isEditing) {
          const updated = await api.updateContact(newItem.id, contactData);
          setContacts(contacts.map(c => c.id === updated.id ? updated : c));
        } else {
          const created = await api.createContact(contactData);
          setContacts([...contacts, created]);
        }
      } else if (modalType === 'opportunity') {
        const oppData = {
          ...newItem,
          value: Number(newItem.value) || 0,
          owner: newItem.owner || user.fullName || user.username
        };

        if (isEditing) {
          const updated = await api.updateOpportunity(newItem.id, oppData);
          setOpportunities(opportunities.map(o => o.id === updated.id ? updated : o));
        } else {
          const created = await api.createOpportunity(oppData);
          setOpportunities([...opportunities, created]);
        }
      } else if (modalType === 'task') {
        const taskData = {
          ...newItem,
          contactName: contacts.find(c => c.id === newItem.contactId)?.name
        };

        if (isEditing) {
          const updated = await api.updateTask(newItem.id, taskData);
          setTasks(tasks.map(t => t.id === updated.id ? updated : t));
        } else {
          const created = await api.createTask(taskData);
          setTasks([...tasks, created]);
        }
      }

      setShowAddModal(false);
      setNewItem({});
      setIsEditing(false);
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo contatto?')) {
      try {
        await api.deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
      } catch (error) {
        alert('Errore: ' + error.message);
      }
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa opportunità?')) {
      try {
        await api.deleteOpportunity(id);
        setOpportunities(opportunities.filter(o => o.id !== id));
      } catch (error) {
        alert('Errore: ' + error.message);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
      try {
        await api.deleteTask(id);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        alert('Errore: ' + error.message);
      }
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updated = await api.toggleTask(id);
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };

  const openAddModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setNewItem(item);
      setIsEditing(true);
    } else {
      setNewItem({});
      setIsEditing(false);
    }
    setShowAddModal(true);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="crm-app">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <Header
          activeView={activeView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          setActiveView={setActiveView}
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
              setActiveView={setActiveView}
            />
          )}

          {!loading && activeView === 'pipeline' && (
            <Pipeline
              opportunities={opportunities}
              tasks={tasks}
              setOpportunities={setOpportunities}
              openAddModal={openAddModal}
              setNewItem={setNewItem}
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
              openAddModal={openAddModal}
              handleDeleteTask={handleDeleteTask}
              handleToggleTask={handleToggleTask}
            />
          )}

          {!loading && activeView === 'settings' && (
            <Settings 
              user={user} 
              contacts={contacts}
              opportunities={opportunities}
              tasks={tasks}
              onUserUpdate={setUser}
            />
          )}

          {!loading && activeView === 'calendar' && (
            <Calendar
              tasks={tasks}
              openAddModal={openAddModal}
              handleToggleTask={handleToggleTask}
            />
          )}
        </div>
      </main>

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
    </div>
  );
}
