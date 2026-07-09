import React, { useState, useEffect, useRef } from 'react';
import { Wallet, BookOpen, Users, SlidersHorizontal, Bell } from 'lucide-react';
import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/logo_new.png'; // Final branding

import { ProfileDropdown } from './ProfileDropdown';
import SearchBox from './SearchBox';

const Topbar = ({ onToggleSidebar, onToggleToolbar, isToolbarOpen, onOpenCalculator }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Books', url: '/books/dashboard', icon: BookOpen, activeBase: '/books' },
        { name: 'Payments', url: '/payments/planner', icon: Wallet, activeBase: '/payments' },
        { name: 'Social', url: '/social/meetup', icon: Users, activeBase: '/social' },
    ];

    return (
        <header className="topbar">
            {/* Left: Branding / App Switcher */}
            <div className="topbar-left">
                {/* ... existing logo code ... */}
                <div
                    className="logo-area"
                    onClick={onToggleSidebar}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle Sidebar"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onToggleSidebar();
                        }
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    title="Toggle Sidebar"
                >
                    <div className="brand-logo-small" style={{ backgroundColor: 'transparent', borderRadius: '50%', width: 'auto', height: 'auto' }}>
                        <img src={logoPng} alt="CLIKS Logo" style={{ height: '38px', width: 'auto' }} />
                    </div>
                    <span style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                        CLIKS
                    </span>
                </div>
            </div>

            {/* Hamburger Button (Mobile) */}
            <button
                className={`hamburger ${isOpen ? 'active' : ''}`}
                onClick={toggleMenu}
                aria-label="Menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Center: Navigation (New Lamp Style) */}
            <div className={`top-nav-links ${isOpen ? 'active' : ''}`} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.name === 'Payments'
                            ? ((location.pathname.startsWith('/finance') || location.pathname.startsWith('/payments') || location.pathname === '/') && !location.pathname.startsWith('/payments/split-expense'))
                            : (item.name === 'Books'
                                ? (location.pathname.startsWith('/books') || location.pathname.startsWith('/ca') || location.pathname.startsWith('/payments/split-expense'))
                                : (item.activeBase
                                    ? (location.pathname.startsWith(item.activeBase) || (item.name === 'Social' && location.pathname.startsWith('/public')))
                                    : (item.url ? (location.pathname === item.url || (item.url !== '/home' && location.pathname.startsWith(item.url))) : false)));

                        return (
                            <button
                                key={item.name}
                                onClick={() => item.action ? item.action() : handleNavigation(item.url)}
                                aria-label={item.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 20px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }}
                            >
                                <span className="hidden md:inline">{item.name}</span>
                                <span className="md:hidden">
                                    <Icon size={18} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Group */}
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingRight: '14px' }}>

                {/* Search bar — global search */}
                <SearchBox onOpenCalculator={onOpenCalculator} />

                {/* Notification Bell */}
                <button
                    onClick={() => {
                        // Logic to open notification dropdown or navigate
                        console.log("Notifications clicked");
                    }}
                    title="Notifications"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                >
                    <Bell size={18} />
                    {/* Notification Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#EF4444',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#ffffff',
                        border: '2px solid #135029', // Matches Topbar background color
                    }}>
                        3
                    </div>
                </button>

                {/* Profile dropdown */}
                <ProfileDropdown
                    onAccount={() => navigate('/books/profile')}
                    onSettings={() => navigate('/books/settings')}
                    onFAQ={() => navigate('/books/faq')}
                    onLogout={handleLogout}
                />

                {/* Vertical divider */}
                <div style={{
                    width: '1px',
                    height: '28px',
                    background: 'rgba(255,255,255,0.18)',
                    flexShrink: 0,
                    marginRight: '8px'
                }} />

                {/* Sliders / filter icon — far right, toggles the quick-access toolbar */}
                <button
                    onClick={onToggleToolbar}
                    title={isToolbarOpen ? 'Hide toolbar' : 'Show toolbar'}
                    aria-pressed={isToolbarOpen}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isToolbarOpen
                            ? 'rgba(255,255,255,0.22)'
                            : 'rgba(255,255,255,0.08)',
                        border: isToolbarOpen
                            ? '1px solid rgba(255,255,255,0.35)'
                            : '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (!isToolbarOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = isToolbarOpen
                            ? 'rgba(255,255,255,0.22)'
                            : 'rgba(255,255,255,0.08)';
                    }}
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
