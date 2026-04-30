import React, { useState } from 'react';
import { useAuth } from '../context';
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
    Bitcoin,
    Bot,
    Briefcase,
    Package
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import logoSvg from '../assets/logo.svg';

const Sidebar = ({ isOpen }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active item based on path
    const getActiveItemFromPath = (path) => {
        if (path === '/' || path === '/finance') return 'Dashboard';
        if (path === '/finance/transactions') return 'Transactions';
        if (path === '/finance/budgets') return 'Budgets';
        if (path === '/finance/accounts') return 'Accounts';
        if (path === '/finance/planned-payments') return 'Planned payments';

        if (path.includes('/books/dashboard')) return 'Books Dashboard';
        if (path.includes('/books/stock')) return 'Stock';
        if (path.includes('/books/financial-plan') || path.includes('/books/plan/')) return 'Financial Plan';
        if (path.includes('/books/people')) return 'People';
        if (path.includes('/books/segregation')) return 'Goal Wallets';
        if (path.includes('/books/split-expense')) return 'Split Expense';
        if (path === '/auditor') return 'Audit';

        // Business paths
        if (path.includes('/business/dashboard')) return 'Dashboard';
        if (path.includes('/business/inventory')) return 'Inventory';
        if (path.includes('/business/billing')) return 'Billing';
        if (path.includes('/business/crm')) return 'CRM';
        if (path.includes('/business/plan')) return 'Financial Plan';
        if (path.includes('/business/compare')) return 'Compare';
        if (path.includes('/business/staffing')) return 'Staffing';
        if (path.includes('/business/segregation')) return 'Segregation';

        return 'Dashboard';
    };

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));

    // Update active item when location changes
    React.useEffect(() => {
        const newItem = getActiveItemFromPath(location.pathname);
        setActiveItem(newItem);
    }, [location.pathname]);

    // Books Section State (from snippet)
    const [openDropdown, setOpenDropdown] = useState(null);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (!isOpen) {
            setOpenDropdown(null);
        }
    }

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const handleItemClick = (label, path) => {
        setActiveItem(label);
        if (path) navigate(path);
    };

    const handleKeyDown = (e, callback) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    };

    // Show Finance sidebar for root, home (redirect), and finance paths
    const showFinanceSidebar = location.pathname === '/' || location.pathname.startsWith('/home') || location.pathname.startsWith('/finance');
    const showBooksSidebar = (location.pathname.startsWith('/books') && location.pathname !== '/books/profile') || location.pathname === '/auditor';
    const showPublicSidebar = location.pathname.startsWith('/public');
    const showBusinessSidebar = location.pathname.startsWith('/business');
    const isBusinessUser = user?.role === 'business';

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: 'transparent' }}>
                    <img src={logoSvg} alt="CLIKS Logo" style={{ width: '24px', height: '24px' }} />
                </div>
                <h2 className="app-title">CLIKS</h2>
            </div>

            <nav className="sidebar-nav">
                {showFinanceSidebar && !isBusinessUser && (
                    <>
                        {/* Dashboard (Main Finance Page) */}
                        <button
                            className={`sidebar-item ${activeItem === 'Dashboard' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Dashboard', '/finance')}
                        >
                            <div className="flex items-center gap-3">
                                <Home size={20} />
                                <span className="sidebar-label">Dashboard</span>
                            </div>
                        </button>

                        {/* Merged Home Items */}
                        {[
                            { icon: Receipt, label: 'Transactions', path: '/finance/transactions' },
                            { icon: Wallet, label: 'Budgets', path: '/finance/budgets' },
                            { icon: CreditCard, label: 'Accounts', path: '/finance/accounts' },
                            { icon: CalendarClock, label: 'Planned payments', path: '/finance/planned-payments' }
                        ].map(item => (
                            <button
                                key={item.label}
                                className={`sidebar-item ${activeItem === item.label ? 'active' : ''}`}
                                onClick={() => handleItemClick(item.label, item.path)}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} />
                                    <span className="sidebar-label">{item.label}</span>
                                </div>
                            </button>
                        ))}
                    </>
                )}

                {showBooksSidebar && !isBusinessUser && (
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

                        {/* Financial Plan Button (Converted from Dropdown) */}
                        <button
                            className={`sidebar-item ${activeItem === 'Financial Plan' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Financial Plan', '/books/financial-plan')}
                        >
                            <div className="flex items-center gap-3">
                                <Wallet size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Financial Plan</span>
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


                        <button
                            className={`sidebar-item ${activeItem === 'Goal Wallets' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Goal Wallets', '/books/goal-wallets')}
                        >
                            <div className="flex items-center gap-3">
                                <Target size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Goal Wallets</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Split Expense' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Split Expense', '/books/split-expense')}
                        >
                            <div className="flex items-center gap-3">
                                <Split size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Split Expense</span>
                            </div>
                        </button>

                        {/* Audit */}
                        <div style={{ marginTop: '6rem' }}>
                            <Tooltip
                                onClick={() => handleItemClick('Audit', '/auditor')}
                                text="Audit"
                                tooltipText="Auditor"
                            />
                        </div>
                    </>
                )}

                {showPublicSidebar && (
                    <>
                        {/* Trading Dropdown (Commented Out)
                        <div className="mb-1">
                            <div
                                role="button"
                                tabIndex={0}
                                aria-expanded={openDropdown === 'trading'}
                                onClick={() => toggleDropdown('trading')}
                                onKeyDown={(e) => handleKeyDown(e, () => toggleDropdown('trading'))}
                                className="sidebar-item"
                                style={{ cursor: 'pointer', backgroundColor: openDropdown === 'trading' ? '#F8FAFC' : 'transparent' }}
                            >
                                <div className="flex items-center gap-3">
                                    <Bitcoin size={20} style={{ color: '#F59E0B' }} />
                                    <span className="sidebar-label">Trading</span>
                                </div>
                                {openDropdown === 'trading' ? (
                                    <ChevronUp size={16} className="text-gray-500" />
                                ) : (
                                    <ChevronDown size={16} className="text-gray-500" />
                                )}
                            </div>

                            <div
                                style={{
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
                                    maxHeight: openDropdown === 'trading' ? '250px' : '0',
                                    opacity: openDropdown === 'trading' ? 1 : 0
                                }}
                            >
                                <div className="ml-4 mt-1 space-y-1">
                                    <button className={`sidebar-item ${activeItem === 'SIP' ? 'active' : ''}`} onClick={() => handleItemClick('SIP', '/public?page=trading-sip')}>
                                        <div className="flex items-center gap-3"><TrendingUp size={16} style={{ color: '#F59E0B' }} /><span className="sidebar-label">SIP</span></div>
                                    </button>
                                    <button className={`sidebar-item ${activeItem === 'Mutual Funds' ? 'active' : ''}`} onClick={() => handleItemClick('Mutual Funds', '/public?page=trading-mutual-funds')}>
                                        <div className="flex items-center gap-3"><PiggyBank size={16} style={{ color: '#F59E0B' }} /><span className="sidebar-label">Mutual Funds</span></div>
                                    </button>
                                    <button className={`sidebar-item ${activeItem === 'Crypto' ? 'active' : ''}`} onClick={() => handleItemClick('Crypto', '/public?page=trading-crypto')}>
                                        <div className="flex items-center gap-3"><Bitcoin size={16} style={{ color: '#F59E0B' }} /><span className="sidebar-label">Crypto</span></div>
                                    </button>
                                    <button className={`sidebar-item ${activeItem === 'Bitcoin' ? 'active' : ''}`} onClick={() => handleItemClick('Bitcoin', '/public?page=trading-bitcoin')}>
                                        <div className="flex items-center gap-3"><Bitcoin size={16} style={{ color: '#F59E0B' }} /><span className="sidebar-label">Bitcoin</span></div>
                                    </button>
                                    <button className={`sidebar-item ${activeItem === 'Overall Trading' ? 'active' : ''}`} onClick={() => handleItemClick('Overall Trading', '/public?page=trading-overall')}>
                                        <div className="flex items-center gap-3"><LineChart size={16} style={{ color: '#F59E0B' }} /><span className="sidebar-label">Overall Trading</span></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        */}

                        {/* Investors */}
                        <button
                            className={`sidebar-item ${activeItem === 'Investors' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Investors', isBusinessUser ? '/business/investors' : '/public?page=investors')}
                        >
                            <div className="flex items-center gap-3">
                                <UsersRound size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">{isBusinessUser ? 'Business Investors' : 'Investors'}</span>
                            </div>
                        </button>

                        {/* Meetup */}
                        <button
                            className={`sidebar-item ${activeItem === 'Meetup' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Meetup', isBusinessUser ? '/business/meetup' : '/public?page=meetup')}
                        >
                            <div className="flex items-center gap-3">
                                <Handshake size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">{isBusinessUser ? 'Business Meetup' : 'Meetup'}</span>
                            </div>
                        </button>
                    </>
                )}

                {(showBooksSidebar || showBusinessSidebar) && isBusinessUser && (
                    <>
                        <button
                            className={`sidebar-item ${activeItem === 'Dashboard' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Dashboard', '/business/dashboard')}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Dashboard</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Inventory' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Inventory', '/business/inventory')}
                        >
                            <div className="flex items-center gap-3">
                                <Package size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Inventory</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Billing' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Billing', '/business/billing')}
                        >
                            <div className="flex items-center gap-3">
                                <Banknote size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Billing</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Financial Plan' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Financial Plan', '/business/plan')}
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Financial Plan</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Compare' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Compare', '/business/compare')}
                        >
                            <div className="flex items-center gap-3">
                                <Layers size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Compare</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Staffing' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Staffing', '/business/staffing')}
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Staffing</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Segregation' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Segregation', '/business/segregation')}
                        >
                            <div className="flex items-center gap-3">
                                <Split size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Segregation</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'CRM' ? 'active' : ''}`}
                            onClick={() => handleItemClick('CRM', '/business/crm')}
                        >
                            <div className="flex items-center gap-3">
                                <UserPlus size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">CRM</span>
                            </div>
                        </button>
                    </>
                )}
            </nav>


        </aside>
    );
};

export default Sidebar;
