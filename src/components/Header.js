import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, User, Briefcase, CheckSquare, Clock, AlertCircle, Check, Menu, Plus } from 'lucide-react';
import api from '../api/api';

export default function Header({ activeView, searchQuery, setSearchQuery, user, setActiveView, onMenuClick, openAddModal }) {
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState({ contacts: [], opportunities: [], tasks: [] });
    const [searching, setSearching] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const searchRef = useRef(null);
    const notifRef = useRef(null);
    const quickAddRef = useRef(null);

    // Load notifications
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchResults(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
            if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
                setShowQuickAdd(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search debounce
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timer = setTimeout(() => {
                performSearch(searchQuery);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults({ contacts: [], opportunities: [], tasks: [] });
            setShowSearchResults(false);
        }
    }, [searchQuery]);

    const loadNotifications = async () => {
        try {
            const data = await api.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Error loading notifications:', err);
        }
    };

    const performSearch = async (query) => {
        setSearching(true);
        try {
            const results = await api.globalSearch(query);
            setSearchResults(results);
            setShowSearchResults(true);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setSearching(false);
        }
    };

    const handleResultClick = (type, item) => {
        setShowSearchResults(false);
        setSearchQuery('');
        if (type === 'contact') {
            setActiveView('contacts');
        } else if (type === 'opportunity') {
            setActiveView('opportunities');
        } else if (type === 'task') {
            setActiveView('tasks');
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead && !String(notif.id).startsWith('task-')) {
            try {
                await api.markNotificationRead(notif.id);
                loadNotifications();
            } catch (err) { }
        }
        if (notif.entityType === 'task') {
            setActiveView('tasks');
        }
        setShowNotifications(false);
    };

    const markAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            loadNotifications();
        } catch (err) { }
    };

    const totalResults = searchResults.contacts.length + searchResults.opportunities.length + searchResults.tasks.length;

    const getPageTitle = () => {
        switch (activeView) {
            case 'dashboard': return 'Dashboard';
            case 'pipeline': return 'Pipeline';
            case 'contacts': return 'Contatti';
            case 'opportunities': return 'Opportunità';
            case 'tasks': return 'Attività';
            case 'invoices': return 'Scadenziario Fatture';
            case 'calendar': return 'Calendario';
            case 'settings': return 'Impostazioni';
            default: return 'Dashboard';
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                {/* Mobile Menu Button */}
                <button className="mobile-menu-toggle" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <h1 className="page-title">{getPageTitle()}</h1>
            </div>

            <div className="header-center" ref={searchRef}>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Cerca contatti, opportunità..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    />
                    {searchQuery && (
                        <X size={16} className="search-clear" onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} />
                    )}
                </div>

                {showSearchResults && (
                    <div className="header-dropdown search-dropdown header-dropdown-scroll">
                        {searching ? (
                            <div className="search-message">Ricerca in corso...</div>
                        ) : totalResults === 0 ? (
                            <div className="search-message">Nessun risultato per "{searchQuery}"</div>
                        ) : (
                            <>
                                {searchResults.contacts.length > 0 && (
                                    <div className="search-section">
                                        <div className="search-section-title">Contatti ({searchResults.contacts.length})</div>
                                        {searchResults.contacts.map(contact => (
                                            <div key={contact.id} className="search-result-item" onClick={() => handleResultClick('contact', contact)}>
                                                <div className="search-result-icon contact"><User size={18} /></div>
                                                <div className="search-result-content">
                                                    <div className="search-result-title">{contact.name}</div>
                                                    <div className="search-result-meta">{contact.company} • {contact.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchResults.opportunities.length > 0 && (
                                    <div className="search-section">
                                        <div className="search-section-title">Opportunità ({searchResults.opportunities.length})</div>
                                        {searchResults.opportunities.map(opp => (
                                            <div key={opp.id} className="search-result-item" onClick={() => handleResultClick('opportunity', opp)}>
                                                <div className="search-result-icon opportunity"><Briefcase size={18} /></div>
                                                <div className="search-result-content">
                                                    <div className="search-result-title">{opp.title}</div>
                                                    <div className="search-result-meta">{opp.company} • €{(opp.value || 0).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchResults.tasks.length > 0 && (
                                    <div className="search-section">
                                        <div className="search-section-title">Attività ({searchResults.tasks.length})</div>
                                        {searchResults.tasks.map(task => (
                                            <div key={task.id} className="search-result-item" onClick={() => handleResultClick('task', task)}>
                                                <div className="search-result-icon task"><CheckSquare size={18} /></div>
                                                <div className="search-result-content">
                                                    <div className="search-result-title">{task.title}</div>
                                                    <div className="search-result-meta">{task.type} • {task.priority}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="header-right">
                {/* Quick Add Button */}
                <div className="quick-add-container" ref={quickAddRef}>
                    <button className="primary-btn quick-add-btn" onClick={() => setShowQuickAdd(!showQuickAdd)}>
                        <Plus size={20} />
                        <span className="hide-mobile">Nuovo</span>
                    </button>

                    {showQuickAdd && (
                        <div className="header-dropdown quick-add-dropdown">
                            <button className="quick-add-item" onClick={() => { openAddModal('opportunity'); setShowQuickAdd(false); }}>
                                <Briefcase size={16} className="icon-primary" />
                                Opportunità
                            </button>
                            <button className="quick-add-item" onClick={() => { openAddModal('contact'); setShowQuickAdd(false); }}>
                                <User size={16} className="icon-info" />
                                Contatto
                            </button>
                            <button className="quick-add-item" onClick={() => { openAddModal('task'); setShowQuickAdd(false); }}>
                                <CheckSquare size={16} className="icon-warning" />
                                Attività
                            </button>
                        </div>
                    )}
                </div>

                <div className="notif-container" ref={notifRef}>
                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="header-dropdown notif-dropdown">
                            <div className="notif-header">
                                <h3>Notifiche</h3>
                                {unreadCount > 0 && (
                                    <button className="notif-mark-read" onClick={markAllRead}>Segna come lette</button>
                                )}
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <Check size={24} />
                                        <div>Nessuna notifica</div>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className={`notif-icon ${notif.type === 'overdue' ? 'overdue' : notif.type === 'due_today' ? 'due-today' : 'default'}`}>
                                                {notif.type === 'overdue' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div className="notif-content">
                                                <div className="notif-title">{notif.title}</div>
                                                <div className="notif-message">{notif.message}</div>
                                                <div className="notif-time">
                                                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('it-IT') : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="user-avatar" title={user?.fullName || user?.username}>
                    {user?.avatar || (user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U')}
                </div>
            </div>
        </header>
    );
}
