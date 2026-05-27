import React, { useState, useEffect } from 'react';
import { User, Wallet, Home, BookOpen, Calculator, Users, Coins } from 'lucide-react';
import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/cliks.png'; // Final branding

import { ProfileDropdown } from './ProfileDropdown';
import { CalcPopover } from './common/CalcPopover';

const Topbar = ({ onToggleSidebar }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Reward points state synced with localStorage
    const [rewardPoints, setRewardPoints] = useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        return saved ? parseInt(saved, 10) : 1000; // default 1000 Pts
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('cliks_reward_points');
            setRewardPoints(saved ? parseInt(saved, 10) : 1000);
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

            {/* Right Group (Audit + Profile) */}
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
                {/* Clean Coin Icon & Points Pill Widget */}
                {(() => {
                    return (
                        <button
                            onClick={() => navigate('/payments/rewards-offers')}
                            title="Loyalty Points - View Rewards & Offers"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                fontWeight: '750',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(245, 158, 11, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            <Coins size={15} color="#F59E0B" style={{ filter: 'drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))' }} />
                            <span style={{ whiteSpace: 'nowrap' }}>
                                {rewardPoints.toLocaleString()} Pts
                            </span>
                        </button>
                    );
                })()}

                <CalcPopover />

                <ProfileDropdown
                    onAccount={() => navigate('/books/profile')}
                    onSettings={() => navigate('/books/settings')}
                    onFAQ={() => navigate('/books/faq')}
                    onLogout={handleLogout}
                />
            </div>
        </header>
    );
};

export default Topbar;
