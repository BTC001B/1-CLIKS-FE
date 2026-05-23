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

const Sidebar = ({ isOpen, onReferralClick }) => {

    const location = useLocation();
    const navigate = useNavigate();

    // Determine active item based on path
    const getActiveItemFromPath = (path, search) => {
        if (path === '/finance/plan' || path.includes('/finance/plan/')) return 'Wallet';
        if (path === '/finance/planner' || path.includes('/finance/planner/')) return 'Planner';
        if (path.includes('/finance/segregation')) return 'Segregation';
        if (path.includes('/finance/split-expense')) return 'Split Expense';
        if (path.includes('/finance/rewards')) return 'Rewards & Offers';

        // Keep old ones in case they are visited
        if (path === '/' || path === '/finance') return 'Wallet';
        if (path === '/finance/dashboard') return 'Dashboard';
        if (path === '/finance/transactions') return 'Transactions';
        if (path === '/finance/budgets') return 'Budgets';
        if (path === '/finance/accounts') return 'Accounts';
        if (path === '/finance/planned-payments') return 'Planned payments';

        if (path.includes('/books/dashboard')) return 'Books Dashboard';
        if (path.includes('/books/stock')) return 'Stock';
        if (path.includes('/books/people')) return 'People';
        if (path.includes('/books/reports')) return 'Reports';
        if (path.includes('/books/settings')) return 'Settings';
        if (path.includes('/books/faq')) return 'Help & Support';
        if (path.includes('/ca')) return 'FIN-PRO';
        if (path === '/auditor') return 'Audit';

        if (path.includes('/public')) {
            const params = new URLSearchParams(search);
            const page = params.get('page');
            if (page === 'investors') return 'Beta Club';
            if (page === 'meetup') return 'Meetup';
            if (page === 'trading') return 'Trading docs';
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
    const [openDropdown, setOpenDropdown] = useState(null);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (!isOpen) {
            setOpenDropdown(null);
        }
    }

    const _toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const handleItemClick = (label, path) => {
        setActiveItem(label);
        if (path) navigate(path);
    };

    const _handleKeyDown = (e, callback) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    };

    // Show Finance sidebar for root, home (redirect), and finance paths
    const showFinanceSidebar = location.pathname === '/' || location.pathname.startsWith('/home') || location.pathname.startsWith('/finance');
    const showBooksSidebar = (location.pathname.startsWith('/books') && location.pathname !== '/books/profile') || location.pathname === '/auditor' || location.pathname.startsWith('/ca');
    const showPublicSidebar = location.pathname.startsWith('/public');


    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: 'transparent' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '24px', height: '24px' }} />
                </div>
                <h2 className="app-title">CLIKS</h2>
            </div>

            <nav className="sidebar-nav">
                {showFinanceSidebar && (
                    <>
                        {/* Wallet */}
                        <button
                            className={`sidebar-item ${activeItem === 'Wallet' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Wallet', '/finance/plan')}
                        >
                            <div className="flex items-center gap-3">
                                <Wallet size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Wallet</span>
                            </div>
                        </button>

                        {/* Transactions */}
                        <button
                            className={`sidebar-item ${activeItem === 'Transactions' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Transactions', '/finance/transactions')}
                        >
                            <div className="flex items-center gap-3">
                                <ArrowLeftRight size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Transactions</span>
                            </div>
                        </button>

                        {/* Planner */}
                        <button
                            className={`sidebar-item ${activeItem === 'Planner' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Planner', '/finance/planner')}
                        >
                            <div className="flex items-center gap-3">
                                <CalendarClock size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Planner</span>
                            </div>
                        </button>

                        {/* Segregation */}
                        <button
                            className={`sidebar-item ${activeItem === 'Segregation' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Segregation', '/finance/segregation')}
                        >
                            <div className="flex items-center gap-3">
                                <Target size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Segregation</span>
                            </div>
                        </button>

                        {/* Split Expense */}
                        <button
                            className={`sidebar-item ${activeItem === 'Split Expense' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Split Expense', '/finance/split-expense')}
                        >
                            <div className="flex items-center gap-3">
                                <Split size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Split Expense</span>
                            </div>
                        </button>

                        {/* Rewards & Offers */}
                        <button
                            className={`sidebar-item ${activeItem === 'Rewards & Offers' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Rewards & Offers', '/finance/rewards')}
                        >
                            <div className="flex items-center gap-3">
                                <Gift size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Rewards & Offers</span>
                            </div>
                        </button>
                    </>
                )}

                {showBooksSidebar && (
                    <>
                        {/* Books Dashboard */}
                        <button
                            className={`sidebar-item ${activeItem === 'Books Dashboard' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Books Dashboard', '/books/dashboard')}
                        >
                            <div className="flex items-center gap-3">
                                <Home size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Dashboard</span>
                            </div>
                        </button>

                        {/* Stock */}
                        <button
                            className={`sidebar-item ${activeItem === 'Stock' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Stock', '/books/stock')}
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Stock</span>
                            </div>
                        </button>

                        {/* People Button (Converted from Dropdown) */}
                        <button
                            className={`sidebar-item ${activeItem === 'People' ? 'active' : ''}`}
                            onClick={() => handleItemClick('People', '/books/people')}
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">People</span>
                            </div>
                        </button>

                        {/* Reports */}
                        <button
                            className={`sidebar-item ${activeItem === 'Reports' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Reports', '/books/reports')}
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Reports</span>
                            </div>
                        </button>

                        {/* FIN-PRO */}
                        <button
                            className={`sidebar-item ${activeItem === 'FIN-PRO' ? 'active' : ''}`}
                            onClick={() => handleItemClick('FIN-PRO', '/ca')}
                        >
                            <div className="flex items-center gap-3">
                                <Briefcase size={20} style={{ color: activeItem === 'FIN-PRO' ? '#064E3B' : '#D4AF37' }} />
                                <span className="sidebar-label">FIN-PRO</span>
                            </div>
                        </button>
                    </>
                )}
                        {/* Audit
                        <div style={{ marginTop: '6rem' }}>
                            <Tooltip
                                onClick={() => handleItemClick('Audit', '/auditor')}
                                text="Audit"
                                tooltipText="Auditor"
                            />
                        </div>
                        */}

                {showPublicSidebar && (
                    <>
                        {/* Meetup */}
                        <button
                            className={`sidebar-item ${activeItem === 'Meetup' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Meetup', '/public?page=meetup')}
                        >
                            <div className="flex items-center gap-3">
                                <Handshake size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Meetup</span>
                            </div>
                        </button>

                        {/* Trading docs */}
                        <button
                            className={`sidebar-item ${activeItem === 'Trading docs' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Trading docs', '/public?page=trading')}
                        >
                            <div className="flex items-center gap-3">
                                <LineChart size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Trading docs</span>
                            </div>
                        </button>

                        {/* Beta Club */}
                        <button
                            className={`sidebar-item ${activeItem === 'Beta Club' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Beta Club', '/public?page=investors')}
                        >
                            <div className="flex items-center gap-3">
                                <Rocket size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Beta Club</span>
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
                {/* Unified Subscription Conversion Card */}
                {showBooksSidebar && (
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
