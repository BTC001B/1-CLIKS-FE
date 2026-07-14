import React, { useState } from 'react';

import { Tooltip } from './common';
import {
    Home,
    LayoutDashboard,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    CalendarClock,
    PiggyBank,
    LineChart,
    Banknote,
    Settings,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    DollarSign,
    ShoppingCart,
    Calendar,
    Target,
    Plus,
    Bell,
    Users,
    Eye,
    ArrowLeftRight,
    Receipt,
    BookOpen,
    Layers,
    Split,
    HelpCircle,
    Crown,
    // Finance icons
    Building2,
    Gift,
    Send,
    Landmark,
    History,
    Smartphone,
    FileCheck,
    AlertCircle,
    Shield,
    Heart,
    Tag,
    UserPlus,
    // Social & Public icons
    Gamepad2,
    UsersRound,
    Handshake,
    Rocket,
    Bitcoin,
    Bot,
    Briefcase,
    Package
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import logoPng from '../assets/cliks.png'; // Final branding

const Sidebar = ({ isOpen, onReferralClick, onItemClick }) => {

    const location = useLocation();
    const navigate = useNavigate();

    // Determine active item based on path
    const getActiveItemFromPath = (path, search) => {
        if (path === '/payments/wallet' || path.includes('/payments/wallet/')) return 'Wallet';
        if (path === '/payments/planner' || path.includes('/payments/planner/')) return 'Planner';
        if (path.includes('/payments/segregation')) return 'Segregation';
        if (path.includes('/payments/split-expense')) return 'Split Expenses';
        if (path.includes('/payments/rewards-offers')) return 'Rewards & Offers';
        if (path === '/payments/transactions') return 'Transactions';

        if (path.includes('/books/dashboard')) return 'Books Dashboard';
        if (path.includes('/books/stock')) return 'Stock';
        if (path.includes('/books/people')) return 'People';
        if (path.includes('/books/finance')) return 'Finance';
        if (path === '/books' || path === '/books/') return 'Report';
        if (path.includes('/books/settings')) return 'Settings';
        if (path.includes('/books/faq')) return 'Help & Support';
        if (path.includes('/ca')) return 'FIN-PRO';
        if (path === '/auditor') return 'Audit';

        if (path.startsWith('/public') || path.startsWith('/social')) {
            const params = new URLSearchParams(search);
            const qpage = params.get('page');
            // Support /social/:page path-based routing
            if (path === '/social/beta-club') return 'Beta Club';
            if (path === '/social/meetup') return 'Meetup';
            if (path === '/social/trading') return 'Trading docs';
            // Legacy ?page= query param support
            if (qpage === 'investors') return 'Beta Club';
            if (qpage === 'meetup') return 'Meetup';
            if (qpage === 'trading') return 'Trading docs';
        }

        return 'Books Dashboard';
    };

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname, location.search));

    // Update active item when location changes
    React.useEffect(() => {
        const newItem = getActiveItemFromPath(location.pathname, location.search);
        setActiveItem(newItem);
    }, [location.pathname, location.search]);

    // Books Section State (from snippet)
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
    }

    const handleItemClick = (label, path) => {
        setActiveItem(label);
        if (path) navigate(path);
        if (onItemClick) onItemClick();
    };

    // Show Finance sidebar for root, home (redirect), and finance paths
    const showFinanceSidebar = (location.pathname === '/' || location.pathname.startsWith('/home') || location.pathname.startsWith('/finance') || location.pathname.startsWith('/payments')) && !location.pathname.startsWith('/payments/split-expense');
    const showBooksSidebar = (location.pathname.startsWith('/books') && location.pathname !== '/books/profile') || location.pathname === '/auditor' || location.pathname.startsWith('/ca') || location.pathname.startsWith('/payments/split-expense') || location.pathname === '/subscription';
    const showPublicSidebar = location.pathname.startsWith('/public') || location.pathname.startsWith('/social');


    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: '#f0fdf4', padding: '1px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h2 className="app-title">CLIKS</h2>
            </div>

            <nav className="sidebar-nav" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {showFinanceSidebar && (
                    <>
                        {/* High-visibility Glassmorphic "Add Money" Button */}
                        <button
                            onClick={() => handleItemClick('Wallet', '/payments/wallet?addMoney=true')}
                            style={{
                                width: 'calc(100% - 1.5rem)',
                                margin: '0 0.75rem 0.75rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.65rem 1rem',
                                background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)',
                                color: '#FFFFFF',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.82rem',
                                boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Plus size={15} strokeWidth={3} /> Add Money
                        </button>

                        {/* Planner */}
                        <button
                            className={`sidebar-item ${activeItem === 'Planner' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Planner', '/payments/planner')}
                        >
                            <div className="flex items-center gap-3">
                                <CalendarClock size={20} style={{ color: activeItem === 'Planner' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Planner</span>
                            </div>
                        </button>

                        {/* Wallet */}
                        <button
                            className={`sidebar-item ${activeItem === 'Wallet' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Wallet', '/payments/wallet')}
                        >
                            <div className="flex items-center gap-3">
                                <Wallet size={20} style={{ color: activeItem === 'Wallet' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Wallet</span>
                            </div>
                        </button>

                        {/* Transactions */}
                        <button
                            className={`sidebar-item ${activeItem === 'Transactions' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Transactions', '/payments/transactions')}
                        >
                            <div className="flex items-center gap-3">
                                <ArrowLeftRight size={20} style={{ color: activeItem === 'Transactions' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Transactions</span>
                            </div>
                        </button>

                        {/* Segregation */}
                        <button
                            className={`sidebar-item ${activeItem === 'Segregation' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Segregation', '/payments/segregation')}
                        >
                            <div className="flex items-center gap-3">
                                <Target size={20} style={{ color: activeItem === 'Segregation' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Segregation</span>
                            </div>
                        </button>

                        {/* Rewards & Offers */}
                        <button
                            className={`sidebar-item ${activeItem === 'Rewards & Offers' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Rewards & Offers', '/payments/rewards-offers')}
                        >
                            <div className="flex items-center gap-3">
                                <Gift size={20} style={{ color: activeItem === 'Rewards & Offers' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Rewards & Offers</span>
                            </div>
                        </button>
                    </>
                )}

                {showBooksSidebar && (
                    <>
                        {/* 1. Books Dashboard */}
                        <button
                            className={`sidebar-item ${activeItem === 'Books Dashboard' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Books Dashboard', '/books/dashboard')}
                        >
                            <div className="flex items-center gap-3">
                                <Home size={20} style={{ color: activeItem === 'Books Dashboard' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Dashboard</span>
                            </div>
                        </button>

                        {/* 2. Finance */}
                        <button
                            className={`sidebar-item ${activeItem === 'Finance' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Finance', '/books/finance')}
                        >
                            <div className="flex items-center gap-3">
                                <PiggyBank size={20} style={{ color: activeItem === 'Finance' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Finance</span>
                            </div>
                        </button>

                        {/* 3. Stock */}
                        <button
                            className={`sidebar-item ${activeItem === 'Stock' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Stock', '/books/stock')}
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} style={{ color: activeItem === 'Stock' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Stock</span>
                            </div>
                        </button>

                        {/* 4. People */}
                        <button
                            className={`sidebar-item ${activeItem === 'People' ? 'active' : ''}`}
                            onClick={() => handleItemClick('People', '/books/people')}
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} style={{ color: activeItem === 'People' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">People</span>
                            </div>
                        </button>

                        {/* 5. Split Expenses */}
                        <button
                            className={`sidebar-item ${activeItem === 'Split Expenses' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Split Expenses', '/payments/split-expense')}
                        >
                            <div className="flex items-center gap-3">
                                <Split size={20} style={{ color: activeItem === 'Split Expenses' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Split Expenses</span>
                            </div>
                        </button>

                        {/* 5. Report (Points to /books layout) */}
                        <button
                            className={`sidebar-item ${activeItem === 'Report' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Report', '/books')}
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} style={{ color: activeItem === 'Report' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Report</span>
                            </div>
                        </button>

                        <div style={{ height: '1px', background: '#E2E8F0', margin: '0.5rem 1rem' }} />

                        {/* 6. FIN-PRO */}
                        <button
                            className={`sidebar-item ${activeItem === 'FIN-PRO' ? 'active' : ''}`}
                            onClick={() => handleItemClick('FIN-PRO', '/ca')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem 0',
                                background: activeItem === 'FIN-PRO'
                                    ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)'
                                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                                color: '#1e293b',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                borderRadius: '12px',
                                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(148, 163, 184, 0.25)',
                                transition: 'all 0.3s ease',
                                minHeight: '52px',
                                justifyContent: 'center',
                                gap: isOpen ? '0.75rem' : '0',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 6px 16px rgba(148, 163, 184, 0.35)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(148, 163, 184, 0.25)';
                                e.currentTarget.style.background = activeItem === 'FIN-PRO'
                                    ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)'
                                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';
                            }}
                        >
                            {/* Subtle Metallic Reflection Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '50%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                transform: 'skewX(-25deg)',
                                transition: '0.5s',
                            }} />
                            <Gift size={20} style={{ color: '#1e293b', flexShrink: 0, filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.5))' }} />
                            <span className="sidebar-label" style={{ fontWeight: '800', margin: 0, color: '#1e293b', letterSpacing: '0.3px', textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}>FIN-PRO</span>
                        </button>
                    </>
                )}

                {showPublicSidebar && (
                    <>
                        {/* Meetup */}
                        <button
                            className={`sidebar-item ${activeItem === 'Meetup' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Meetup', '/social/meetup')}
                        >
                            <div className="flex items-center gap-3">
                                <Handshake size={20} style={{ color: activeItem === 'Meetup' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Meetup</span>
                            </div>
                        </button>

                        {/* Trading docs */}
                        <button
                            className={`sidebar-item ${activeItem === 'Trading docs' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Trading docs', '/social/trading')}
                        >
                            <div className="flex items-center gap-3">
                                <LineChart size={20} style={{ color: activeItem === 'Trading docs' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Trading docs</span>
                            </div>
                        </button>

                        {/* Custom divider/line between Trading Docs and Beta Club */}
                        <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '10px 0.75rem', opacity: 0.6 }} />

                        {/* Beta Club */}
                        <button
                            className={`sidebar-item ${activeItem === 'Beta Club' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Beta Club', '/social/beta-club')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem 0',
                                background: 'linear-gradient(135deg, #C0C0C0 0%, #F5F5F5 50%, #E5E5E5 100%)',
                                color: '#FFFFFF',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                fontWeight: '750',
                                fontSize: '0.85rem',
                                borderRadius: '12px',
                                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.12)',
                                transition: 'all 0.3s ease',
                                minHeight: '52px',
                                justifyContent: 'center',
                                gap: isOpen ? '0.75rem' : '0',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #E5E5E5 0%, #FFFFFF 50%, #E5E5E5 100%)';
                                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255, 255, 255, 1), 0 6px 16px rgba(0, 0, 0, 0.18)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #C0C0C0 0%, #F5F5F5 50%, #E5E5E5 100%)';
                                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.12)';
                            }}
                        >
                            {/* Metallic Reflective Highlight */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '60%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                transform: 'skewX(-20deg)',
                                pointerEvents: 'none'
                            }} />

                            <Rocket size={20} style={{ color: '#FFFFFF', flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
                            <span className="sidebar-label" style={{ fontWeight: '750', margin: 0, color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>Beta Club</span>
                        </button>
                    </>
                )}


            </nav>

            {/* Refer & Earn Block */}
            <div style={{ padding: '0rem 1rem', flexShrink: 0 }}>
                <button
                    onClick={() => {
                        if (onReferralClick) onReferralClick();
                    }}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.65rem',
                        padding: '0.60rem',
                        background: 'transparent',
                        color: '#6B7280',
                        borderRadius: '12px',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        outline: 'none',
                        marginTop: '1.2rem'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)';
                        e.currentTarget.style.color = '#7C3AED';
                        e.currentTarget.style.borderColor = '#DDD6FE';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6B7280';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Gift size={18} strokeWidth={2.5} style={{ color: '#8B5CF6', flexShrink: 0 }} />
                    <span>Refer &amp; Earn</span>
                </button>
            </div>

            {/* Fixed Sidebar Footer */}
            <div style={{ 
                padding: '1rem', 
                borderTop: '1px solid #F1F5F9', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.6rem',
                flexShrink: 0,
                background: '#FFFFFF'
            }}>
                {/* Unified Subscription Conversion Card rendered for all 3 modes */}
                {(showBooksSidebar || showFinanceSidebar || showPublicSidebar) && (
                    <button
                        onClick={() => handleItemClick('Subscription', '/subscription')}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.6rem 0.5rem 0.85rem',
                            background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '750',
                            fontSize: '0.85rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                            transition: 'all 0.2s ease',
                            minHeight: '52px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                <Crown size={18} strokeWidth={2.5} />
                            </div>
                            <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#FBBF24' }}>Get Subscription</span>
                        </div>

                        <div style={{
                            position: 'relative',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', position: 'absolute', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                                <circle cx="20" cy="20" r="18" fill="#FFFFFF" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                                <circle cx="20" cy="20" r="18" fill="none" stroke="#FBBF24" strokeWidth="3" strokeDasharray="113" strokeDashoffset={113 * (1 - 20 / 30)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
                            </svg>
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, marginTop: '1px' }}>
                                <span style={{ color: '#1E3A8A', fontSize: '0.72rem', fontWeight: '900', lineHeight: 1 }}>20</span>
                                <span style={{ color: '#1E3A8A', fontSize: '0.45rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.9 }}>Days</span>
                            </div>
                        </div>
                    </button>
                )}
                {/* Bottom Settings Block */}
                <button
                    onClick={() => handleItemClick('Settings', '/books/settings')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: location.pathname.includes('/books/settings') ? '#F0FDF4' : '#F8FAFC',
                        color: location.pathname.includes('/books/settings') ? '#1B6B3A' : '#334155',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: location.pathname.includes('/books/settings') ? '#BBF7D0' : '#E2E8F0',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = location.pathname.includes('/books/settings') ? '#F0FDF4' : '#F1F5F9'}
                    onMouseOut={(e) => e.currentTarget.style.background = location.pathname.includes('/books/settings') ? '#F0FDF4' : '#F8FAFC'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Settings size={18} style={{ opacity: 0.8 }} />
                        <span>Settings</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>

                {/* Help & Support Block */}
                <button
                    onClick={() => handleItemClick('Help & Support', '/books/faq')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: location.pathname.includes('/books/faq') ? '#F0FDF4' : '#F8FAFC',
                        color: location.pathname.includes('/books/faq') ? '#1B6B3A' : '#334155',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: location.pathname.includes('/books/faq') ? '#BBF7D0' : '#E2E8F0',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = location.pathname.includes('/books/faq') ? '#F0FDF4' : '#F1F5F9'}
                    onMouseOut={(e) => e.currentTarget.style.background = location.pathname.includes('/books/faq') ? '#F0FDF4' : '#F8FAFC'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <HelpCircle size={18} style={{ opacity: 0.8 }} />
                        <span>Help & Support</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;
