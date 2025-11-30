import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, User, Briefcase, CheckSquare, Clock, AlertCircle, Check, Menu } from 'lucide-react';
import api from '../api/api';

export default function Header({ activeView, searchQuery, setSearchQuery, user, setActiveView, onMenuClick }) {
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
                        <X size={16} style={{ cursor: 'pointer' }} onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} />
                    )}
                </div>

                {showSearchResults && (
                    <div className="search-results" style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        marginTop: '8px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        zIndex: 1000,
                    }}>
                        {searching ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Ricerca in corso...</div>
                        ) : totalResults === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Nessun risultato per "{searchQuery}"</div>
                        ) : (
                            <>
                                {searchResults.contacts.length > 0 && (
                                    <div style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Contatti ({searchResults.contacts.length})</div>
                                        {searchResults.contacts.map(contact => (
                                            <div key={contact.id} onClick={() => handleResultClick('contact', contact)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.company} • {contact.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchResults.opportunities.length > 0 && (
                                    <div style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Opportunità ({searchResults.opportunities.length})</div>
                                        {searchResults.opportunities.map(opp => (
                                            <div key={opp.id} onClick={() => handleResultClick('opportunity', opp)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={18} /></div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opp.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opp.company} • €{(opp.value || 0).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchResults.tasks.length > 0 && (
                                    <div style={{ padding: '8px 0' }}>
                                        <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Attività ({searchResults.tasks.length})</div>
                                        {searchResults.tasks.map(task => (
                                            <div key={task.id} onClick={() => handleResultClick('task', task)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckSquare size={18} /></div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.type} • {task.priority}</div>
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
                <div className="notif-container" ref={notifRef} style={{ position: 'relative' }}>
                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '340px',
                            maxWidth: 'calc(100vw - 32px)',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            marginTop: '8px',
                            zIndex: 1000,
                            overflow: 'hidden',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Notifiche</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Segna come lette</button>
                                )}
                            </div>
                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                        <Check size={24} style={{ marginBottom: 8, color: '#10b981' }} />
                                        <div>Nessuna notifica</div>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => handleNotificationClick(notif)}
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                                borderLeft: !notif.isRead ? '3px solid #6366f1' : '3px solid transparent',
                                                background: !notif.isRead ? '#eef2ff' : 'transparent',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = !notif.isRead ? '#eef2ff' : 'transparent'}
                                        >
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                background: notif.type === 'overdue' ? '#fee2e2' : notif.type === 'due_today' ? '#fef3c7' : '#dbeafe',
                                                color: notif.type === 'overdue' ? '#dc2626' : notif.type === 'due_today' ? '#d97706' : '#2563eb',
                                            }}>
                                                {notif.type === 'overdue' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', marginBottom: '2px' }}>{notif.title}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.message}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
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
                    {user?.avatar || (user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : 'U')}
                </div>
            </div>
        </header>
    );
}
