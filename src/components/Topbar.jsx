import React, { useState, useEffect, useRef } from 'react';
import { Wallet, BookOpen, Users, Coins, SlidersHorizontal } from 'lucide-react';
import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/cliks.png'; // Final branding

import { ProfileDropdown } from './ProfileDropdown';
import SearchBox from './SearchBox';

const Topbar = ({ onToggleSidebar, onToggleToolbar, isToolbarOpen, onOpenCalculator }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Reward points — default 1000, synced with localStorage
    const [rewardPoints, setRewardPoints] = useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        const parsed = parseInt(saved, 10);
        return saved && !isNaN(parsed) ? parsed : 1000;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('cliks_reward_points');
            const parsed = parseInt(saved, 10);
            setRewardPoints(saved && !isNaN(parsed) ? parsed : 1000);
        };
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(handleStorageChange, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

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
                    <div className="brand-logo-small" style={{ backgroundColor: 'transparent', borderRadius: '50%' }}>
                        <img src={logoPng} alt="CLIKS Logo" style={{ width: '28px', height: '28px' }} />
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
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingRight: '17px' }}>

                {/* Search bar — global search */}
                <SearchBox onOpenCalculator={onOpenCalculator} />

                {/* Points pill */}
                <button
                    onClick={() => navigate('/payments/rewards-offers')}
                    title="Loyalty Points - View Rewards & Offers"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 13px',
                        borderRadius: '999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                >
                    <Coins size={15} color="#F59E0B" style={{ filter: 'drop-shadow(0 0 2px rgba(245,158,11,0.5))' }} />
                    <span>{rewardPoints.toLocaleString()} Pts</span>
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
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isToolbarOpen
                            ? 'rgba(255,255,255,0.22)'
                            : 'rgba(255,255,255,0.08)',
                        border: isToolbarOpen
                            ? '1px solid rgba(255,255,255,0.35)'
                            : '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background 0.2s, border-color 0.2s',
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
                    <SlidersHorizontal size={17} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
