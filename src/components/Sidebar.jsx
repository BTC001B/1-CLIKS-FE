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
import logoPng from '../assets/cliks.png'; // Final branding

const Sidebar = ({ isOpen }) => {

    const location = useLocation();
    const navigate = useNavigate();

    // Determine active item based on path
    const getActiveItemFromPath = (path) => {
        if (path.includes('/finance/financial-plan') || path.includes('/finance/plan/')) return 'Financial Plan';
        if (path.includes('/finance/goal-wallets') || path.includes('/finance/segregation')) return 'Goal Wallets';
        if (path.includes('/finance/split-expense')) return 'Split Expense';

        // Keep old ones in case they are visited
        if (path === '/' || path === '/finance') return 'Financial Plan';
        if (path === '/finance/dashboard') return 'Dashboard';
        if (path === '/finance/transactions') return 'Transactions';
        if (path === '/finance/budgets') return 'Budgets';
        if (path === '/finance/accounts') return 'Accounts';
        if (path === '/finance/planned-payments') return 'Planned payments';

        if (path.includes('/books/dashboard')) return 'Books Dashboard';
        if (path.includes('/books/stock')) return 'Stock';
        if (path.includes('/books/people')) return 'People';
        if (path === '/auditor') return 'Audit';

        return 'Books Dashboard';
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
    const showBooksSidebar = (location.pathname.startsWith('/books') && location.pathname !== '/books/profile') || location.pathname === '/auditor';
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
                        {/* Financial Plan */}
                        <button
                            className={`sidebar-item ${activeItem === 'Financial Plan' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Financial Plan', '/finance/financial-plan')}
                        >
                            <div className="flex items-center gap-3">
                                <Wallet size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Financial Plan</span>
                            </div>
                        </button>

                        {/* Goal Wallets */}
                        <button
                            className={`sidebar-item ${activeItem === 'Goal Wallets' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Goal Wallets', '/finance/goal-wallets')}
                        >
                            <div className="flex items-center gap-3">
                                <Target size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Goal Wallet</span>
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
                            onClick={() => handleItemClick('Investors', '/public?page=investors')}
                        >
                            <div className="flex items-center gap-3">
                                <UsersRound size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Investors</span>
                            </div>
                        </button>

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
                    </>
                )}


            </nav>


        </aside>
    );
};

export default Sidebar;
