import React from 'react';
import { TrendingUp, Target, Users, Euro, CheckSquare, Calendar, Receipt, Settings, LogOut, X } from 'lucide-react';

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
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Mobile Close Button */}
            {/* Mobile Close Button */}
            <button
                className="mobile-close-btn"
                onClick={onClose}
            >
                <X size={20} />
            </button>

            <div className="logo">
                <div className="logo-icon">V</div>
                <span className="logo-text">vCRM Suite</span>
            </div>

            <nav className="nav-menu">
                <NavItem icon={<TrendingUp size={20} />} label="Dashboard" view="dashboard" />
                <NavItem icon={<Target size={20} />} label="Pipeline" view="pipeline" />
                <NavItem icon={<Users size={20} />} label="Contatti" view="contacts" />
                <NavItem icon={<Euro size={20} />} label="Opportunità" view="opportunities" />
                <NavItem icon={<CheckSquare size={20} />} label="Attività" view="tasks" />
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
    );
}
