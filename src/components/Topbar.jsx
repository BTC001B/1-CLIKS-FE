import React, { useState, useEffect, useRef } from 'react';
import { User, Wallet, Home, BookOpen, Calculator, Users, ShieldCheck, Coins } from 'lucide-react';
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
    const [isTrustOpen, setIsTrustOpen] = useState(false);
    const trustRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (trustRef.current && !trustRef.current.contains(event.target)) {
                setIsTrustOpen(false);
            }
        };

        if (isTrustOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTrustOpen]);

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
        { name: 'Payments', url: '/payments/wallet', icon: Wallet, activeBase: '/payments' },
        { name: 'Social', url: '/social/meetup', icon: Users, activeBase: '/social' },
    ];

    const getBetaTrustScore = () => {
        if (!user) return { total: 85, base: 70, sub: 15, profile: 0, activity: 0 };
        const baseScore = 70;
        const subBonus = user.tier ? 15 : 0;
        const profileBonus = user.name && user.email ? 10 : 0;
        const todayStr = new Date().toDateString();
        const dailyActivity = Array.from(todayStr).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
        return {
            total: Math.min(100, baseScore + subBonus + profileBonus + dailyActivity),
            base: baseScore,
            sub: subBonus,
            profile: profileBonus,
            activity: dailyActivity
        };
    };
    const trustData = getBetaTrustScore();

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
                            ? (location.pathname.startsWith('/finance') || location.pathname.startsWith('/payments') || location.pathname === '/')
                            : (item.activeBase
                                ? (location.pathname.startsWith(item.activeBase) || (item.name === 'Social' && location.pathname.startsWith('/public')))
                                : (item.url ? (location.pathname === item.url || (item.url !== '/home' && location.pathname.startsWith(item.url))) : false));

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
                <div ref={trustRef} style={{ position: 'relative' }}>
                    <div 
                        onClick={() => setIsTrustOpen(!isTrustOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                            border: '1px solid #86EFAC',
                            padding: '4px 12px',
                            borderRadius: '99px',
                            cursor: 'pointer',
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
                        <ShieldCheck size={16} color="#15803D" style={{ flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                            <span style={{ fontWeight: '900', fontSize: '13px', color: '#14532D', letterSpacing: '-0.01em', lineHeight: '1' }}>
                                {trustData.total}%
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1' }}>
                                Beta Trust
                            </span>
                        </div>
                    </div>

                    {isTrustOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '120%',
                            right: '0',
                            width: '240px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0',
                            padding: '1.25rem',
                            zIndex: 100,
                            color: '#1E293B',
                            cursor: 'default'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Beta Trust Breakdown</h4>
                            </div>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4' }}>
                                Your score decreases if you lack subscription tiers, profile details, or regular daily activity.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#475569', fontWeight: '500' }}>Base Score</span>
                                    <span style={{ fontWeight: '700', color: '#16A34A' }}>{trustData.base}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#475569', fontWeight: '500' }}>Subscription Bonus</span>
                                    <span style={{ fontWeight: '700', color: trustData.sub > 0 ? '#16A34A' : '#94A3B8' }}>+{trustData.sub}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#475569', fontWeight: '500' }}>Profile Completeness</span>
                                    <span style={{ fontWeight: '700', color: trustData.profile > 0 ? '#16A34A' : '#94A3B8' }}>+{trustData.profile}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#475569', fontWeight: '500' }}>Daily Activity Bonus</span>
                                    <span style={{ fontWeight: '700', color: trustData.activity > 0 ? '#16A34A' : '#94A3B8' }}>+{trustData.activity}%</span>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', color: '#0F172A' }}>Total Trust</span>
                                <span style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1B6B3A' }}>{trustData.total}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Premium Glassmorphic & Dual-tone Golden Points Widget */}
                {(() => {
                    const maxPts = 10000;
                    const pct = Math.min(rewardPoints / maxPts, 1);
                    const r = 17;
                    const circ = 2 * Math.PI * r;
                    const dash = circ * pct;
                    return (
                        <div 
                            style={{ 
                                position: 'relative', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                width: '40px',
                                height: '40px',
                                flexShrink: 0
                            }} 
                            onClick={() => navigate('/payments/rewards-offers')} 
                            title="Loyalty Rewards"
                        >
                            <svg width="40" height="40" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)', pointerEvents: 'none', zIndex: 1 }}>
                                <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                                <circle
                                    cx="20" cy="20" r={r}
                                    fill="none"
                                    stroke="#F59E0B"
                                    strokeWidth="2"
                                    strokeDasharray={`${dash} ${circ}`}
                                    strokeLinecap="round"
                                    style={{ 
                                        transition: 'stroke-dasharray 0.5s ease',
                                        filter: 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.4))'
                                    }}
                                />
                            </svg>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate('/payments/rewards-offers'); }}
                                title="Loyalty Points - View Rewards & Offers"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    outline: 'none',
                                    padding: 0,
                                    margin: 0,
                                    lineHeight: 1.0,
                                    gap: '0px',
                                    zIndex: 2
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.08)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(245, 158, 11, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(245, 158, 11, 0.1)';
                                }}
                            >
                                <span style={{ fontSize: '11px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                    {rewardPoints >= 1000 ? `${(rewardPoints/1000).toFixed(1)}K` : rewardPoints}
                                </span>
                                <span style={{ fontSize: '6.5px', fontWeight: '900', color: '#F59E0B', letterSpacing: '0.04em', marginTop: '0.5px' }}>
                                    PTS
                                </span>
                            </button>
                        </div>
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
