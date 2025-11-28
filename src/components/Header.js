import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, User, Briefcase, CheckSquare, Clock, AlertCircle, Check } from 'lucide-react';
import api from '../api/api';

export default function Header({ activeView, searchQuery, setSearchQuery, user, setActiveView }) {
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState({ contacts: [], opportunities: [], tasks: [] });
    const [searching, setSearching] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchRef = useRef(null);
    const notifRef = useRef(null);

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
            } catch (err) {}
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
        } catch (err) {}
    };

    const totalResults = searchResults.contacts.length + searchResults.opportunities.length + searchResults.tasks.length;

    const styles = `
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 32px;
            background: white;
            border-bottom: 1px solid #e2e8f0;
        }
        .header-left { }
        .page-title { font-size: 20px; font-weight: 700; color: #0f172a; }
        .header-center { flex: 1; max-width: 500px; margin: 0 32px; position: relative; }
        .search-box { display: flex; align-items: center; gap: 12px; background: #f1f5f9; border-radius: 12px; padding: 10px 16px; transition: all 0.2s; border: 2px solid transparent; }
        .search-box:focus-within { background: white; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .search-box input { border: none; background: transparent; outline: none; font-size: 14px; width: 100%; color: #1e293b; }
        .search-box input::placeholder { color: #94a3b8; }
        .search-box svg { color: #64748b; flex-shrink: 0; }
        .clear-search { cursor: pointer; padding: 2px; border-radius: 4px; }
        .clear-search:hover { background: #e2e8f0; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .icon-btn { position: relative; background: none; border: none; cursor: pointer; padding: 8px; border-radius: 10px; color: #64748b; transition: all 0.2s; }
        .icon-btn:hover { background: #f1f5f9; color: #1e293b; }
        .notification-badge { position: absolute; top: 2px; right: 2px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .user-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; cursor: pointer; }

        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            margin-top: 8px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
        }
        .search-section { padding: 8px 0; }
        .search-section:not(:last-child) { border-bottom: 1px solid #e2e8f0; }
        .search-section-title { padding: 8px 16px; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .search-result-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; transition: all 0.15s; }
        .search-result-item:hover { background: #f1f5f9; }
        .search-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .search-icon.contact { background: #dbeafe; color: #2563eb; }
        .search-icon.opportunity { background: #dcfce7; color: #16a34a; }
        .search-icon.task { background: #fef3c7; color: #d97706; }
        .search-result-info { flex: 1; min-width: 0; }
        .search-result-title { font-size: 14px; font-weight: 500; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .search-result-subtitle { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .no-results { padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .searching { padding: 24px; text-align: center; color: #64748b; font-size: 14px; }

        .notifications-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            width: 360px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            margin-top: 8px;
            z-index: 1000;
            overflow: hidden;
        }
        .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e2e8f0; }
        .notif-header h3 { font-size: 16px; font-weight: 600; color: #0f172a; }
        .notif-header button { background: none; border: none; color: #3b82f6; font-size: 13px; font-weight: 500; cursor: pointer; }
        .notif-header button:hover { text-decoration: underline; }
        .notif-list { max-height: 320px; overflow-y: auto; }
        .notif-item { display: flex; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; border-left: 3px solid transparent; }
        .notif-item:hover { background: #f8fafc; }
        .notif-item.unread { background: #eff6ff; border-left-color: #3b82f6; }
        .notif-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .notif-icon.warning { background: #fef3c7; color: #d97706; }
        .notif-icon.danger { background: #fee2e2; color: #dc2626; }
        .notif-icon.info { background: #dbeafe; color: #2563eb; }
        .notif-content { flex: 1; min-width: 0; }
        .notif-title { font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 2px; }
        .notif-message { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-time { font-size: 11px; color: #94a3b8; margin-top: 4px; }
        .no-notif { padding: 32px; text-align: center; color: #64748b; font-size: 14px; }
        .notif-container { position: relative; }
    `;

    return (
        <header className="header">
            <style>{styles}</style>
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

            <div className="header-center" ref={searchRef}>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Cerca contatti, opportunità, attività..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    />
                    {searchQuery && (
                        <X size={16} className="clear-search" onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} />
                    )}
                </div>

                {showSearchResults && (
                    <div className="search-results">
                        {searching ? (
                            <div className="searching">Ricerca in corso...</div>
                        ) : totalResults === 0 ? (
                            <div className="no-results">Nessun risultato per "{searchQuery}"</div>
                        ) : (
                            <>
                                {searchResults.contacts.length > 0 && (
                                    <div className="search-section">
                                        <div className="search-section-title">Contatti ({searchResults.contacts.length})</div>
                                        {searchResults.contacts.map(contact => (
                                            <div key={contact.id} className="search-result-item" onClick={() => handleResultClick('contact', contact)}>
                                                <div className="search-icon contact"><User size={18} /></div>
                                                <div className="search-result-info">
                                                    <div className="search-result-title">{contact.name}</div>
                                                    <div className="search-result-subtitle">{contact.company} • {contact.email}</div>
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
                                                <div className="search-icon opportunity"><Briefcase size={18} /></div>
                                                <div className="search-result-info">
                                                    <div className="search-result-title">{opp.title}</div>
                                                    <div className="search-result-subtitle">{opp.company} • €{(opp.value || 0).toLocaleString()}</div>
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
                                                <div className="search-icon task"><CheckSquare size={18} /></div>
                                                <div className="search-result-info">
                                                    <div className="search-result-title">{task.title}</div>
                                                    <div className="search-result-subtitle">{task.type} • {task.priority}</div>
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
                <div className="notif-container" ref={notifRef}>
                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <div className="notif-header">
                                <h3>Notifiche</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead}>Segna tutte come lette</button>
                                )}
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="no-notif">
                                        <Check size={24} style={{ marginBottom: 8, color: '#10b981' }} />
                                        <div>Nessuna notifica</div>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className={`notif-icon ${notif.type === 'overdue' ? 'danger' : notif.type === 'due_today' ? 'warning' : 'info'}`}>
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
                    {user?.avatar || 'U'}
                </div>
            </div>
        </header>
    );
}
