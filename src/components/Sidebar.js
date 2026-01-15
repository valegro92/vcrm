import React from 'react';
import { TrendingUp, Target, Users, Euro, CheckSquare, Calendar, Receipt, Settings, LogOut, X, FolderKanban } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, handleLogout, isOpen, onClose }) {
    const NavItem = ({ icon, label, view }) => (
        <button
            className={`nav-item ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div className="logo" style={{ marginBottom: 0 }}>
                        <div className="logo-icon">V</div>
                        <span className="logo-text">VAIB</span>
                    </div>
                    <button
                        className="mobile-close-btn"
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'none' // Hidden by default, shown in mobile CSS
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="nav-menu">
                    <NavItem icon={<TrendingUp size={20} />} label="Dashboard" view="dashboard" />
                    <NavItem icon={<Target size={20} />} label="Pipeline" view="pipeline" />
                    <NavItem icon={<Users size={20} />} label="Contatti" view="contacts" />
                    <NavItem icon={<Euro size={20} />} label="Opportunità" view="opportunities" />
                    <NavItem icon={<CheckSquare size={20} />} label="Attività" view="tasks" />
                    <NavItem icon={<FolderKanban size={20} />} label="Progetti" view="projects" />
                    <NavItem icon={<Receipt size={20} />} label="Fatture" view="invoices" />
                    <NavItem icon={<Calendar size={20} />} label="Calendario" view="calendar" />
                </nav>

                <div className="sidebar-footer">
                    <NavItem icon={<Settings size={20} />} label="Impostazioni" view="settings" />
                    <button className="nav-item" onClick={handleLogout} style={{ marginTop: '8px' }}>
                        <LogOut size={20} />
                        <span>Esci</span>
                    </button>
                </div>
            </div>
        </>
    );
}
