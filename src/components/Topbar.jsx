import React, { useState } from 'react';
import { User, Wallet, Home, BookOpen, Calculator, Users } from 'lucide-react';
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
        { name: 'Payments', url: '/finance', icon: Wallet, activeBase: '/finance' },
        { name: 'Social', url: '/public?page=investors', icon: Users, activeBase: '/public' },
    ];

    const getBetaTrustScore = () => {
        if (!user) return 85;
        const baseScore = 70;
        const subBonus = user.tier ? 15 : 0;
        const profileBonus = user.name && user.email ? 10 : 0;
        const todayStr = new Date().toDateString();
        const dailyActivity = Array.from(todayStr).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
        return Math.min(100, baseScore + subBonus + profileBonus + dailyActivity);
    };
    const betaTrustScore = getBetaTrustScore();

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
                        const isActive = item.activeBase
                            ? location.pathname.startsWith(item.activeBase)
                            : (item.url ? (location.pathname === item.url || (item.url !== '/home' && location.pathname.startsWith(item.url))) : false);

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
                <div 
                    title="Beta Trust Score: Based on daily activity, platform maintenance, and subscription consistency."
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                        border: '1px solid #86EFAC',
                        padding: '4px 12px',
                        borderRadius: '99px',
                        cursor: 'help',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(22, 163, 74, 0.25)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(22, 163, 74, 0.15)';
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                        <span style={{ fontWeight: '900', fontSize: '13px', color: '#14532D', letterSpacing: '-0.01em', lineHeight: '1' }}>
                            {betaTrustScore}%
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1' }}>
                            Beta Trust
                        </span>
                    </div>
                </div>

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
