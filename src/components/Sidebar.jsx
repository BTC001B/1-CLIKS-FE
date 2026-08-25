import React, { useState } from 'react';

import { Tooltip } from './common';
import {
    Home,
    Compass,
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
    Calculator,
    Calendar,
    CalendarDays,
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
    Package,
    Grid3X3,
    Cloud,
    X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import logoPng from '../assets/cliks.png'; // Final branding

const SHOW_BETA_CLUB_UI = true;

const CrownIcon = () => {
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        const img = new Image();
        img.src = '/crown_icon.png';
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            try {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;
                const targetColor = { r: 27, g: 107, b: 58 };
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    if (r > 150 && g > 150 && b > 150) {
                        data[i + 3] = 0;
                    } else {
                        data[i] = targetColor.r;
                        data[i + 1] = targetColor.g;
                        data[i + 2] = targetColor.b;
                    }
                }
                ctx.putImageData(imgData, 0, 0);
            } catch (e) {
                console.error(e);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '23px',
                height: '23px',
                objectFit: 'contain',
                display: 'block'
            }}
        />
    );
};

const Sidebar = ({ isOpen, onReferralClick, onItemClick, onLogoClick }) => {

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
        if (path.includes('/books/money-tracker')) return 'Track';
        if (path.includes('/books/accounting')) return 'Accounting';
        if (path.includes('/books/purchase-details')) return 'Purchase details';
        if (path.includes('/books/settings')) return 'Settings';
        if (path.includes('/books/faq')) return 'Help & Support';
        if (path.includes('/ca')) return 'FIN-PRO';
        if (path === '/auditor') return 'Audit';

        if (path.startsWith('/public') || path.startsWith('/social')) {
            const params = new URLSearchParams(search);
            const qpage = params.get('page');
            // Support /social/:page path-based routing
            if (path === '/social/beta-club') return 'Beta Club';
            if (path === '/social/meetup') return SHOW_BETA_CLUB_UI ? 'Beta Club Page' : 'Meetup';
            if (path === '/social/trading') return 'Trading docs';
            // Legacy ?page= query param support
            if (qpage === 'investors') return 'Beta Club';
            if (qpage === 'meetup') return SHOW_BETA_CLUB_UI ? 'Beta Club Page' : 'Meetup';
            if (qpage === 'trading') return 'Trading docs';
        }

        return 'Books Dashboard';
    };

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname, location.search));
    const [isFinanceOpen, setIsFinanceOpen] = useState(location.pathname.includes('/books/finance') || location.pathname.includes('/books/accounting') || location.pathname.includes('/books/purchase-details'));
    const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

    // Update active item when location changes
    React.useEffect(() => {
        const newItem = getActiveItemFromPath(location.pathname, location.search);
        setActiveItem(newItem);
        if (location.pathname.includes('/books/finance') || location.pathname.includes('/books/accounting') || location.pathname.includes('/books/purchase-details')) {
            setIsFinanceOpen(true);
        }
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
                <div 
                    className="brand-logo" 
                    onClick={onLogoClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Open Product Launcher"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (onLogoClick) onLogoClick();
                        }
                    }}
                    style={{ 
                        background: '#f0fdf4', 
                        padding: '1px', 
                        borderRadius: '6px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '28px', 
                        height: '28px', 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Grid3X3 size={18} style={{ color: '#1B6B3A' }} />
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

                        {/* 2. Finance (Collapsible) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <button
                                className={`sidebar-item ${isFinanceOpen || activeItem === 'Finance' || activeItem === 'Accounting' || activeItem === 'Purchase details' ? 'active' : ''}`}
                                onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                            >
                                <div className="flex items-center gap-3">
                                    <PiggyBank size={20} style={{ color: (isFinanceOpen || activeItem === 'Finance' || activeItem === 'Accounting' || activeItem === 'Purchase details') ? '#ffffff' : '#1B6B3A' }} />
                                    <span className="sidebar-label">Finance</span>
                                </div>
                                <div style={{ color: (isFinanceOpen || activeItem === 'Finance' || activeItem === 'Accounting' || activeItem === 'Purchase details') ? '#ffffff' : '#1B6B3A', opacity: 0.7, paddingRight: '4px' }}>
                                    {isFinanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>

                            {isFinanceOpen && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.75rem', marginTop: '0.1rem' }}>
                                    {/* Accounting */}
                                    <button
                                        className={`sidebar-item ${activeItem === 'Accounting' ? 'active' : ''}`}
                                        onClick={() => handleItemClick('Accounting', '/books/accounting')}
                                        style={{ height: '36px' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Calculator size={18} style={{ color: activeItem === 'Accounting' ? '#ffffff' : '#1B6B3A' }} />
                                            <span className="sidebar-label" style={{ fontSize: '0.82rem' }}>Accounting</span>
                                        </div>
                                    </button>

                                    {/* Purchase details */}
                                    <button
                                        className={`sidebar-item ${activeItem === 'Purchase details' ? 'active' : ''}`}
                                        onClick={() => handleItemClick('Purchase details', '/books/purchase-details')}
                                        style={{ height: '36px' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShoppingCart size={18} style={{ color: activeItem === 'Purchase details' ? '#ffffff' : '#1B6B3A' }} />
                                            <span className="sidebar-label" style={{ fontSize: '0.82rem' }}>Purchase details</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

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

                        {/* 5b. Track */}
                        <button
                            className={`sidebar-item ${activeItem === 'Track' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Track', '/books/money-tracker')}
                        >
                            <div className="flex items-center gap-3">
                                <Compass size={20} style={{ color: activeItem === 'Track' ? '#ffffff' : '#1B6B3A' }} />
                                <span className="sidebar-label">Track</span>
                            </div>
                        </button>

                        <div style={{ height: '1px', background: '#E2E8F0', margin: '0.5rem 1rem' }} />

                        {/* 6. FIN-PRO */}
                        <button
                            className="sidebar-custom-yellow-btn"
                            onClick={() => handleItemClick('FIN-PRO', '/ca')}
                            style={{
                                width: '136px',
                                height: '38px',
                                margin: '0.5rem auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 12px',
                                background: '#FFCC00',
                                border: activeItem === 'FIN-PRO' ? '2.5px solid #E5B800' : 'none',
                                cursor: 'pointer',
                                borderRadius: '50px',
                                boxShadow: activeItem === 'FIN-PRO' 
                                    ? '0 0 0 1px rgba(229, 184, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)' 
                                    : '0 3px 8px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                gap: '10px',
                                outline: 'none'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                                e.currentTarget.style.background = '#FFD300';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = activeItem === 'FIN-PRO' 
                                    ? '0 0 0 1px rgba(229, 184, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)' 
                                    : '0 3px 8px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.background = '#FFCC00';
                            }}
                        >
                            <Briefcase size={18} strokeWidth={2.5} style={{ color: '#000000', flexShrink: 0 }} />
                            <div style={{ width: '1.5px', height: '18px', backgroundColor: '#000000', opacity: 0.8 }} />
                            <span style={{ 
                                fontWeight: '900', 
                                color: '#000000', 
                                letterSpacing: '0.3px',
                                textTransform: 'uppercase',
                                fontSize: '0.82rem'
                            }}>FIN-PRO</span>
                        </button>
                    </>
                )}

                {showPublicSidebar && (
                    <>
                        {/* Meetup */}
                        <button
                            className={`sidebar-item ${(activeItem === (SHOW_BETA_CLUB_UI ? 'Beta Club Page' : 'Meetup')) ? 'active' : ''}`}
                            onClick={() => handleItemClick(SHOW_BETA_CLUB_UI ? 'Beta Club Page' : 'Meetup', '/social/meetup')}
                        >
                            <div className="flex items-center gap-3">
                                {SHOW_BETA_CLUB_UI ? (
                                    <CrownIcon />
                                ) : (
                                    <Handshake size={20} style={{ color: activeItem === 'Meetup' ? '#ffffff' : '#1B6B3A' }} />
                                )}
                                <span className="sidebar-label sidebar-item-beta-club-text">{SHOW_BETA_CLUB_UI ? 'Beta Club' : 'Meetup'}</span>
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
                {/* Storage Card - Relocated with exact matching design and modal popup */}
                <div 
                    onClick={() => setIsStorageModalOpen(true)}
                    title="Click to view Storage Allocation & Breakdown"
                    style={{
                        width: '100%',
                        backgroundColor: '#EFF6FF',
                        borderRadius: '12px',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #DBEAFE',
                        boxSizing: 'border-box',
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E0F2FE';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#EFF6FF';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {/* Left Info Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Cloud size={18} color="#2563EB" strokeWidth={2.2} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1E293B' }}>
                                Storage
                            </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569' }}>
                            0 KB of 1 GB used
                        </div>
                    </div>

                    {/* Right Neat Circular Progress Ring with % Inside */}
                    {(() => {
                        const storagePercent = 0;
                        const radius = 15;
                        const circ = 2 * Math.PI * radius;
                        const strokeDashoffset = circ * (1 - storagePercent / 100);

                        return (
                            <div style={{
                                position: 'relative',
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <svg width="38" height="38" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r={radius}
                                        fill="none"
                                        stroke="#DBEAFE"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r={radius}
                                        fill="none"
                                        stroke="#2563EB"
                                        strokeWidth="3"
                                        strokeDasharray={circ}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                                    />
                                </svg>
                                <span style={{
                                    position: 'absolute',
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    color: '#2563EB'
                                }}>
                                    {Math.round(storagePercent)}%
                                </span>
                            </div>
                        );
                    })()}
                </div>
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

            {/* Storage Allocation Breakdown Modal */}
            {isStorageModalOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                    onClick={() => setIsStorageModalOpen(false)}
                >
                    <div 
                        style={{
                            width: '90%',
                            maxWidth: '620px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            animation: 'fadeInScale 0.2s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid #F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#F8FAFC'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: '#EFF6FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Cloud size={20} color="#2563EB" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                                        Storage Allocation & Breakdown
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                        Real-time storage usage across CLIKS modules
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsStorageModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: '8px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
                            {/* Summary Stat Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Capacity</span>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>1.00 GB</div>
                                </div>
                                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>Used Storage</span>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E40AF', marginTop: '2px' }}>0 KB (0%)</div>
                                </div>
                                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase' }}>Free Available</span>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803D', marginTop: '2px' }}>1.00 GB</div>
                                </div>
                            </div>

                            {/* Multi-Color Segmented Storage Quota Distribution Bar */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>
                                    <span>Module Storage Quota Distribution</span>
                                    <span>100% Allocated</span>
                                </div>
                                <div style={{ display: 'flex', height: '10px', width: '100%', borderRadius: '999px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                                    <div style={{ width: '40%', backgroundColor: '#2563EB' }} title="Audit & Tax (FIN-PRO): 40%" />
                                    <div style={{ width: '25%', backgroundColor: '#10B981' }} title="Sales & Purchases: 25%" />
                                    <div style={{ width: '15%', backgroundColor: '#8B5CF6' }} title="Expenses: 15%" />
                                    <div style={{ width: '10%', backgroundColor: '#F59E0B' }} title="HR & Payroll: 10%" />
                                    <div style={{ width: '10%', backgroundColor: '#06B6D4' }} title="Inventory & Media: 10%" />
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '750', color: '#475569' }}>Module</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '750', color: '#475569', textAlign: 'center' }}>Typical Storage Share</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '750', color: '#475569' }}>Main File Types</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { module: 'Audit & Tax (FIN-PRO)', share: '40%', files: 'PDFs, XLS, Signed Certificates', color: '#2563EB', badgeBg: '#EFF6FF' },
                                            { module: 'Sales & Purchases', share: '25%', files: 'PDF Invoices, Vendor Bills', color: '#10B981', badgeBg: '#ECFDF5' },
                                            { module: 'Expenses', share: '15%', files: 'Receipt Scans, Images', color: '#8B5CF6', badgeBg: '#F5F3FF' },
                                            { module: 'HR & Payroll', share: '10%', files: 'ID Documents, Payslip PDFs', color: '#F59E0B', badgeBg: '#FFFBEB' },
                                            { module: 'Inventory & Media', share: '10%', files: 'Product Photos, Barcodes', color: '#06B6D4', badgeBg: '#ECFEFF' }
                                        ].map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid #F1F5F9' : 'none' }}>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                                                    {item.module}
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                    <span style={{ backgroundColor: item.badgeBg, color: item.color, padding: '2px 8px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800', border: `1px solid ${item.color}33` }}>
                                                        {item.share}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '500' }}>
                                                    {item.files}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid #F1F5F9',
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setIsStorageModalOpen(false)}
                                style={{
                                    padding: '0.55rem 1.25rem',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: '750',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                                }}
                            >
                                Close Breakdown
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </aside>
    );
};

export default Sidebar;
