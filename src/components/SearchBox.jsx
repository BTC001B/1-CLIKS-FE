import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, LayoutDashboard, TrendingUp, Users, DollarSign,
    ShoppingCart, ShoppingBag, Boxes, UserCheck, Briefcase,
    Settings, HelpCircle, CreditCard, Zap, Wallet, ArrowLeftRight,
    Target, Gift, BarChart3, Split, Calculator, Receipt,
    Landmark, PiggyBank, LineChart, FileCheck, Bell, User,
    Home, BookOpen, Globe, Star, Calendar
} from 'lucide-react';

// (default points are 1000 — set in Wallet.jsx and Rewards.jsx)

/* ─────────────────────────────────────────────────────────────────
   SEARCH INDEX
   Add entries here for every navigable destination.
   Keywords array allows partial matching on synonyms.
───────────────────────────────────────────────────────────────── */
const SEARCH_INDEX = [
    // ── Books / Dashboard ──────────────────────────────────────
    { label: 'Dashboard',        path: '/books/dashboard',           icon: LayoutDashboard, category: 'Books',    keywords: ['dashboard', 'home', 'overview', 'console', 'books'] },
    { label: 'Stock',            path: '/books/stock',               icon: TrendingUp,      category: 'Books',    keywords: ['stock', 'inventory', 'assets', 'items'] },
    { label: 'People',           path: '/books/people',              icon: Users,           category: 'Books',    keywords: ['people', 'contacts', 'customers', 'clients', 'persons'] },
    { label: 'Finance',          path: '/books/finance',             icon: PiggyBank,       category: 'Books',    keywords: ['finance', 'money', 'spending', 'details'] },
    { label: 'Split Expenses',   path: '/payments/split-expense',    icon: Split,           category: 'Books',    keywords: ['split', 'expense', 'share', 'bill'] },
    { label: 'Report',           path: '/books',                     icon: BarChart3,        category: 'Books',    keywords: ['report', 'analytics', 'summary'] },
    { label: 'FIN-PRO Audit',    path: '/ca',                        icon: Briefcase,       category: 'FIN-PRO',  keywords: ['finpro', 'fin-pro', 'audit', 'ca', 'chartered', 'auditor'] },

    // ── Payments ───────────────────────────────────────────────
    { label: 'Planner',          path: '/payments/planner',          icon: Calendar,        category: 'Payments', keywords: ['planner', 'financial plan', 'plan', 'payments'] },
    { label: 'Wallet',           path: '/payments/wallet',           icon: Wallet,          category: 'Payments', keywords: ['wallet', 'money', 'balance', 'add money'] },
    { label: 'Transactions',     path: '/payments/transactions',     icon: ArrowLeftRight,  category: 'Payments', keywords: ['transaction', 'history', 'transfer', 'payment'] },
    { label: 'Segregation',      path: '/payments/segregation',      icon: Target,          category: 'Payments', keywords: ['segregation', 'goal', 'target', 'funds'] },
    { label: 'Rewards & Offers', path: '/payments/rewards-offers',   icon: Gift,            category: 'Payments', keywords: ['reward', 'offer', 'points', 'loyalty', 'cashback'] },

    // ── Finance ────────────────────────────────────────────────
    { label: 'Payments Dashboard',path: '/finance/dashboard',        icon: DollarSign,      category: 'Finance',  keywords: ['finance', 'financial', 'money', 'dashboard'] },
    { label: 'Income',           path: '/finance/income',            icon: TrendingUp,      category: 'Finance',  keywords: ['income', 'revenue', 'earnings', 'salary'] },
    { label: 'Expenses',         path: '/finance/expenses',          icon: ShoppingCart,    category: 'Finance',  keywords: ['expense', 'spend', 'cost', 'expenditure'] },
    { label: 'Budgets',          path: '/finance/budgets',           icon: Target,          category: 'Finance',  keywords: ['budget', 'limit', 'plan', 'cap'] },
    { label: 'Accounts',         path: '/finance/accounts',          icon: Landmark,        category: 'Finance',  keywords: ['account', 'bank', 'ledger'] },
    { label: 'Savings',          path: '/finance/savings',           icon: PiggyBank,       category: 'Finance',  keywords: ['saving', 'savings', 'piggy', 'fund'] },
    { label: 'Investments',      path: '/finance/investments',       icon: LineChart,       category: 'Finance',  keywords: ['invest', 'investment', 'portfolio', 'stock', 'mutual'] },
    { label: 'Debts',            path: '/finance/debts',             icon: CreditCard,      category: 'Finance',  keywords: ['debt', 'loan', 'liability', 'emi', 'borrow'] },
    { label: 'Planned Payments', path: '/finance/planned-payments',  icon: FileCheck,       category: 'Finance',  keywords: ['planned', 'scheduled', 'upcoming', 'recurring'] },

    // ── Social ─────────────────────────────────────────────────
    { label: 'Meetup',           path: '/social/meetup',             icon: Users,           category: 'Social',   keywords: ['meetup', 'event', 'meet', 'social', 'network'] },
    { label: 'Trading Docs',     path: '/social/trading',            icon: LineChart,       category: 'Social',   keywords: ['trading', 'docs', 'market', 'trade'] },
    { label: 'Beta Club',        path: '/social/beta-club',          icon: Star,            category: 'Social',   keywords: ['beta', 'club', 'investor', 'founders'] },

    // ── Settings & Support ─────────────────────────────────────
    { label: 'Settings',         path: '/books/settings',            icon: Settings,        category: 'System',   keywords: ['setting', 'config', 'preference', 'appearance', 'dark mode', 'theme', 'notification'] },
    { label: 'Help & Support',   path: '/books/faq',                 icon: HelpCircle,      category: 'System',   keywords: ['help', 'faq', 'support', 'ticket', 'question', 'guide'] },
    { label: 'Subscription',     path: '/subscription',              icon: CreditCard,      category: 'System',   keywords: ['subscription', 'plan', 'billing', 'upgrade', 'premium'] },
    { label: 'Profile',          path: '/books/profile',             icon: User,            category: 'System',   keywords: ['profile', 'account', 'user', 'name', 'avatar'] },

    // ── Quick Actions ──────────────────────────────────────────
    { label: 'Calculator',       path: '__CALC__',                   icon: Calculator,      category: 'Tools',    keywords: ['calculator', 'calc', 'math', 'compute', 'tax', 'gst'] },
    { label: 'New Invoice',      path: '/books/dashboard',           icon: Receipt,         category: 'Actions',  keywords: ['invoice', 'bill', 'new invoice', 'generate', 'receipt'] },
    { label: 'Sales Orders',     path: '/books/stock',               icon: ShoppingCart,    category: 'Actions',  keywords: ['sales', 'order', 'sale'] },
    { label: 'Add Customer',     path: '/books/people',              icon: UserCheck,       category: 'Actions',  keywords: ['customer', 'add customer', 'client', 'new customer'] },
    { label: 'Add Supplier',     path: '/books/people',              icon: Users,           category: 'Actions',  keywords: ['supplier', 'vendor', 'add supplier'] },
    { label: 'Purchases',        path: '/books/stock',               icon: ShoppingBag,     category: 'Actions',  keywords: ['purchase', 'buy', 'procurement', 'po'] },
    { label: 'Inventory',        path: '/books/stock',               icon: Boxes,           category: 'Actions',  keywords: ['inventory', 'stock', 'warehouse', 'product'] },
    { label: 'HR',               path: '/books/people',              icon: UserCheck,       category: 'Actions',  keywords: ['hr', 'human resource', 'employee', 'staff', 'attendance', 'payroll'] },
    { label: 'Attendance',       path: '/books/people',              icon: UserCheck,       category: 'Actions',  keywords: ['attendance', 'check in', 'present', 'absent'] },
    { label: 'POS Billing',      path: '/books/stock',               icon: Receipt,         category: 'Actions',  keywords: ['pos', 'billing', 'point of sale', 'checkout'] },
    { label: 'Add Expense',      path: '/finance/expenses',          icon: DollarSign,      category: 'Actions',  keywords: ['add expense', 'expense', 'spend'] },
    { label: 'Staff Claim',      path: '/books/people',              icon: FileCheck,       category: 'Actions',  keywords: ['staff claim', 'reimbursement', 'claim'] },
    { label: 'New Purchase PO',  path: '/books/stock',               icon: ShoppingBag,     category: 'Actions',  keywords: ['purchase order', 'po', 'new po', 'procurement'] },
];

/* ─── Fuzzy / substring matching ────────────────────────────── */
const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

const scoreItem = (item, query) => {
    const q = normalize(query);
    if (!q) return -1;
    const labelN = normalize(item.label);
    const catN   = normalize(item.category);
    // Exact label match → highest
    if (labelN === q) return 100;
    // Label starts with query → high
    if (labelN.startsWith(q)) return 90;
    // Label contains query → good
    if (labelN.includes(q)) return 80;
    // Category match
    if (catN.includes(q)) return 60;
    // Any keyword match
    for (const kw of item.keywords) {
        const kwN = normalize(kw);
        if (kwN === q)          return 75;
        if (kwN.startsWith(q))  return 65;
        if (kwN.includes(q))    return 55;
        // individual words in keyword
        if (q.split(' ').some(word => word.length > 1 && kwN.includes(word))) return 45;
    }
    return -1;
};

const searchItems = (query, max = 8) => {
    if (!query || normalize(query).length < 1) return [];
    return SEARCH_INDEX
        .map(item => ({ item, score: scoreItem(item, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, max)
        .map(({ item }) => item);
};

/* ─── SearchBox component ─────────────────────────────────────── */
const SearchBox = ({ onOpenCalculator }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // collapsed by default
    const [activeIdx, setActiveIdx] = useState(0);
    const wrapperRef = useRef(null);
    const inputRef   = useRef(null);
    const debounceRef = useRef(null);

    /* Expand search and auto-focus */
    const expand = () => {
        setIsExpanded(true);
        // Focus after CSS transition starts
        requestAnimationFrame(() => {
            requestAnimationFrame(() => inputRef.current?.focus());
        });
    };

    /* Collapse search and reset state */
    const collapse = () => {
        setIsExpanded(false);
        setIsDropdownOpen(false);
        setQuery('');
        setResults([]);
        inputRef.current?.blur();
    };

    /* Debounced search */
    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setActiveIdx(0);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const found = searchItems(val);
            setResults(found);
            setIsDropdownOpen(val.trim().length > 0);
        }, 200);
    };

    const handleSelect = useCallback((item) => {
        if (item.path === '__CALC__') {
            if (onOpenCalculator) onOpenCalculator();
        } else {
            navigate(item.path);
        }
        collapse();
    }, [navigate, onOpenCalculator]);

    /* Keyboard navigation */
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            collapse();
            return;
        }
        if (!isDropdownOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[activeIdx]) handleSelect(results[activeIdx]);
            else if (!query.trim()) collapse(); // empty Enter collapses
        }
    };

    /* Close on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                collapse();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Cleanup on unmount */
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

            {/* ── Collapsed: icon-only button ── */}
            {!isExpanded && (
                <button
                    onClick={expand}
                    aria-label="Open search"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                    <Search size={15} color="rgba(255,255,255,0.75)" />
                </button>
            )}

            {/* ── Expanded: full search pill ── */}
            {isExpanded && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 14px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.14)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        width: '220px',
                        animation: 'searchExpand 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <Search size={15} color="rgba(255,255,255,0.65)" style={{ flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if (query.trim()) setIsDropdownOpen(true); }}
                        aria-label="Global search"
                        aria-autocomplete="list"
                        aria-expanded={isDropdownOpen}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 500,
                            width: '100%',
                            minWidth: 0,
                            padding: 0,
                        }}
                    />
                </div>
            )}

            {/* ── Dropdown results ── */}
            {isDropdownOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    minWidth: '280px',
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.16)',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    zIndex: 9999,
                }}>
                    {results.length === 0 ? (
                        <div style={{ padding: '1rem 1.25rem', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 500 }}>
                            No matching results found
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: '0.375rem 0', margin: 0 }}>
                            {results.map((item, i) => {
                                const Icon = item.icon;
                                const isActive = i === activeIdx;
                                return (
                                    <li key={`${item.path}-${i}`}>
                                        <button
                                            onMouseEnter={() => setActiveIdx(i)}
                                            onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.625rem 1rem',
                                                border: 'none',
                                                background: isActive ? '#F0FDF4' : 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background 0.1s',
                                            }}
                                        >
                                            <span style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: isActive ? '#DCFCE7' : '#F1F5F9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <Icon size={15} color={isActive ? '#1B6B3A' : '#64748B'} />
                                            </span>
                                            <span style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>
                                                    {item.label}
                                                </span>
                                                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>
                                                    {item.category}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* Expand animation keyframe */}
            <style>{`
                @keyframes searchExpand {
                    from { opacity: 0; transform: scaleX(0.6); transform-origin: left; }
                    to   { opacity: 1; transform: scaleX(1);   transform-origin: left; }
                }
            `}</style>
        </div>
    );
};

export default SearchBox;
