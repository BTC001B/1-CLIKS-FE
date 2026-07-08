import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DollarSign, ShoppingCart, Save, Trash2, Pencil, FileText, Briefcase, Plus, Search, Filter, X } from 'lucide-react';
import { useAuth } from '../../context';

/* ─── Storage key scoped per user ────────────────────────────── */
const incomeKey   = (uid) => `cliks_finance_income_v2_${uid}`;
const expensesKey = (uid) => `cliks_finance_expenses_${uid}`;

/* ─── Shared input style ─────────────────────────────────────── */
const inp = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1E293B',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
};
const lbl = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.35rem',
};
const saveBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.5rem',
    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(27,107,58,0.22)',
};

const BLANK_DETAILS = {
    fullName: '', email: '', phone: '',
    salary: '', bonus: '',
    rent: '', electricity: '', grocery: '',
};
const BLANK_EXPENSE = { name: '', amount: '' };

const FinancePage = () => {
    const { user } = useAuth();
    const uid = user?.id ?? user?.email ?? 'guest';

    const [incomeSources, setIncomeSources] = useState(() => {
        try { return JSON.parse(localStorage.getItem(incomeKey(uid))) || []; }
        catch { return []; }
    });
    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem(expensesKey(uid))) || []; }
        catch { return []; }
    });

    const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
    const [editingIncomeId, setEditingIncomeId] = useState(null);

    const [expense, setExpense]   = useState(BLANK_EXPENSE);
    const [editingId, setEditingId] = useState(null);
    const [saved,   setSaved]     = useState(false);
    const [expSaved, setExpSaved] = useState(false);
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    // Search and Filter State
    const [incomeSearch, setIncomeSearch] = useState('');
    const [incomeSort, setIncomeSort] = useState('newest'); // default newest
    const [showIncomeSort, setShowIncomeSort] = useState(false);
    const incomeSortRef = useRef(null);

    const [expenseSearch, setExpenseSearch] = useState('');
    const [expenseSort, setExpenseSort] = useState('newest'); // default newest
    const [showExpenseSort, setShowExpenseSort] = useState(false);
    const expenseSortRef = useRef(null);

    // Filtered and Sorted Data
    const filteredIncome = useMemo(() => {
        let result = incomeSources.filter(i => i.name.toLowerCase().includes(incomeSearch.toLowerCase()));

        switch (incomeSort) {
            case 'highest': result.sort((a, b) => b.amount - a.amount); break;
            case 'lowest':  result.sort((a, b) => a.amount - b.amount); break;
            case 'az':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'za':      result.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'newest':  result.sort((a, b) => b.id - a.id); break;
            case 'oldest':  result.sort((a, b) => a.id - b.id); break;
            default: break;
        }
        return result;
    }, [incomeSources, incomeSearch, incomeSort]);

    const filteredExpenses = useMemo(() => {
        let result = expenses.filter(e => e.name.toLowerCase().includes(expenseSearch.toLowerCase()));

        switch (expenseSort) {
            case 'highest': result.sort((a, b) => b.amount - a.amount); break;
            case 'lowest':  result.sort((a, b) => a.amount - b.amount); break;
            case 'az':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'za':      result.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'newest':  result.sort((a, b) => b.id - a.id); break;
            case 'oldest':  result.sort((a, b) => a.id - b.id); break;
            default: break;
        }
        return result;
    }, [expenses, expenseSearch, expenseSort]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (incomeSortRef.current && !incomeSortRef.current.contains(event.target)) setShowIncomeSort(false);
            if (expenseSortRef.current && !expenseSortRef.current.contains(event.target)) setShowExpenseSort(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Empty state logic
    const isIncomeEmpty = incomeSources.length === 0;
    const isExpenseEmpty = expenses.length === 0;

    /* Persist on change */
    useEffect(() => {
        localStorage.setItem(incomeKey(uid), JSON.stringify(incomeSources));
    }, [incomeSources, uid]);
    useEffect(() => {
        localStorage.setItem(expensesKey(uid), JSON.stringify(expenses));
    }, [expenses, uid]);

    /* Derived totals */
    const monthlyIncome   = incomeSources.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const fixedExpenses   = 0; // Legacy fields removed as per requirements
    const dailyExpenses   = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const remaining       = monthlyIncome - fixedExpenses - dailyExpenses;

    const handleAddIncomeSource = (e) => {
        e.preventDefault();
        if (!newIncome.name.trim() || !newIncome.amount) return;

        if (editingIncomeId) {
            setIncomeSources(prev => prev.map(i => i.id === editingIncomeId ? { ...i, name: newIncome.name.trim(), amount: parseFloat(newIncome.amount) || 0 } : i));
            setEditingIncomeId(null);
        } else {
            const entry = {
                id: Date.now(),
                name: newIncome.name.trim(),
                amount: parseFloat(newIncome.amount) || 0,
            };
            setIncomeSources(prev => [...prev, entry]);
        }
        setNewIncome({ name: '', amount: '' });
    };

    const handleDeleteIncomeSource = (id) => setIncomeSources(prev => prev.filter(i => i.id !== id));
    const handleEditIncomeSource = (i) => {
        setNewIncome({ name: i.name, amount: i.amount });
        setEditingIncomeId(i.id);
    };

    const handleSaveDetails = (ev) => {
        ev.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleSaveExpense = (ev) => {
        ev.preventDefault();
        if (!expense.name.trim() || !expense.amount) return;

        if (editingId) {
            setExpenses(prev => prev.map(e => e.id === editingId ? { ...e, name: expense.name.trim(), amount: parseFloat(expense.amount) || 0 } : e));
            setEditingId(null);
        } else {
            const entry = {
                id:     Date.now(),
                date:   new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                name:   expense.name.trim(),
                amount: parseFloat(expense.amount) || 0,
            };
            setExpenses(prev => [entry, ...prev]);
        }
        setExpense(BLANK_EXPENSE);
        setIsAddingExpense(false);
        setExpSaved(true);
        setTimeout(() => setExpSaved(false), 2500);
    };

    const handleDeleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));
    const handleEditExpense = (e) => {
        setExpense({ name: e.name, amount: e.amount });
        setEditingId(e.id);
    };

    const handleSaveToPDF = () => {
        window.print();
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .finance-premium-container {
                    display: flex;
                    border: 1.5px solid #E2E8F0;
                    border-radius: 16px;
                    background: #ffffff;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }
                .finance-premium-container:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    border-color: #D6E4F0;
                }
                .red-divider {
                    height: 1px;
                    background: #EF4444;
                    margin: 0 -1.5rem 1.5rem -1.5rem;
                    opacity: 0.8;
                }
                .finance-panel-left {
                    flex: 1;
                    padding: 1.5rem;
                    border-right: 1.5px solid #E2E8F0;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                .finance-panel-right {
                    flex: 1;
                    padding: 1.5rem;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                .search-filter-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    position: absolute;
                    right: 0;
                    top: -6px;
                }
                .search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .compact-search-input {
                    padding: 0.4rem 0.75rem 0.4rem 2rem;
                    border-radius: 999px;
                    border: 1px solid #E2E8F0;
                    font-size: 0.75rem;
                    outline: none;
                    width: 140px;
                    transition: all 0.2s ease;
                }
                .compact-search-input:focus {
                    width: 180px;
                    border-color: #1B6B3A;
                    box-shadow: 0 0 0 3px rgba(27, 107, 58, 0.1);
                }
                .filter-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    background: #ffffff;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 100;
                    min-width: 180px;
                    overflow: hidden;
                    padding: 4px;
                }
                .filter-option {
                    width: 100%;
                    padding: 0.6rem 1rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #475569;
                    text-align: left;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .filter-option:hover {
                    background: #F0FDF4;
                    color: #1B6B3A;
                }
                .filter-option.active {
                    background: #ECFDF5;
                    color: #064E3B;
                }
                @media print {
                    .finance-premium-container { border: none !important; box-shadow: none !important; overflow: visible !important; display: block !important; }
                    .finance-panel-left { border-right: none !important; padding: 0 !important; }
                    .finance-panel-right { padding: 0 !important; }
                    .red-divider { display: none !important; }
                    .no-print { display: none !important; }
                    .compact-search-input, .search-filter-container { display: none !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #E2E8F0 !important; padding: 8px !important; visibility: visible !important; }
                    body * { visibility: hidden; }
                    .finance-premium-container, .finance-premium-container * { visibility: visible; }
                }
            `}</style>

            {/* Page title */}
            <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg,#1B6B3A 0%,#064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <DollarSign size={20} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Finance</h1>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>Track your income, fixed costs, and daily spending in one place.</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
                {[
                    { label: 'Monthly Income',  value: monthlyIncome,  color: '#059669', bg: '#ECFDF5' },
                    { label: 'Fixed Expenses',  value: fixedExpenses,  color: '#D97706', bg: '#FFFBEB' },
                    { label: 'Daily Expenses',  value: dailyExpenses,  color: '#7C3AED', bg: '#F5F3FF' },
                    { label: 'Remaining Balance', value: remaining,    color: remaining >= 0 ? '#059669' : '#EF4444', bg: remaining >= 0 ? '#ECFDF5' : '#FEF2F2' },
                ].map(item => (
                    <div key={item.label} style={{ background: item.bg, borderRadius: '14px', padding: '1.1rem 1.25rem', border: `1px solid ${item.color}22` }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>{item.label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: item.color }}>
                            ₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Source Section Heading */}
            <div style={{
                marginBottom: '2rem',
                marginTop: '1rem',
                background: '#F0FDF4',
                padding: '1.5rem 2rem',
                borderRadius: '20px',
                border: '1px solid #DCF2E4',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.03)'
            }}>
                <div style={{ width: 54, height: 54, borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                    <Briefcase size={28} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>Fixed Source</h2>
                    <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: '0.2rem 0 0 0' }}>Manage your income sources and daily expenses here.</p>
                </div>
            </div>

            {/* Main Container Split into Two */}
            <div className="finance-premium-container">

                {/* LEFT SIDE: INCOME */}
                <div className="finance-panel-left">
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Income</h2>

                        <div className="search-filter-container">
                            <div className="search-input-wrapper">
                                <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search income..."
                                    className="compact-search-input"
                                    value={incomeSearch}
                                    onChange={(e) => setIncomeSearch(e.target.value)}
                                />
                            </div>
                            <div style={{ position: 'relative' }} ref={incomeSortRef}>
                                <button
                                    onClick={() => setShowIncomeSort(!showIncomeSort)}
                                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                                    title="Sort & Filter"
                                >
                                    <Filter size={16} />
                                </button>
                                {showIncomeSort && (
                                    <div className="filter-dropdown">
                                        {[
                                            { id: 'highest', label: 'Highest Amount' },
                                            { id: 'lowest',  label: 'Lowest Amount' },
                                            { id: 'az',      label: 'A–Z (Source Name)' },
                                            { id: 'za',      label: 'Z–A (Source Name)' },
                                            { id: 'newest',  label: 'Newest First' },
                                            { id: 'oldest',  label: 'Oldest First' },
                                            { id: 'clear',   label: 'Clear Filter' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                className={`filter-option ${incomeSort === opt.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (opt.id === 'clear') {
                                                        setIncomeSort('newest');
                                                        setIncomeSearch('');
                                                    } else {
                                                        setIncomeSort(opt.id);
                                                    }
                                                    setShowIncomeSort(false);
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="red-divider"></div>

                    {isIncomeEmpty && !isAddingIncome ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }} className="no-print">
                            <button
                                onClick={() => setIsAddingIncome(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 1.8rem', background: '#fff', color: '#1B6B3A',
                                    border: '2px dashed #1B6B3A', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                Add Income +
                            </button>
                        </div>
                    ) : (
                        <div style={{ paddingTop: '1rem' }}>
                            <form onSubmit={handleAddIncomeSource} className="no-print">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={lbl}>Income Source Name</label>
                                        <input
                                            type="text"
                                            style={inp}
                                            value={newIncome.name}
                                            placeholder="Examples: Salary, Business, Freelance, Rent, Other Income, etc."
                                            onChange={e => setNewIncome(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={lbl}>Amount (Monthly)</label>
                                        <input
                                            type="number"
                                            style={inp}
                                            value={newIncome.amount}
                                            placeholder="0"
                                            onChange={e => setNewIncome(prev => ({ ...prev, amount: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <button type="submit" style={{ ...saveBtn, background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)' }}>
                                            <Plus size={16} /> {editingIncomeId ? 'Update Income Source' : 'Add Income Source'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Added Income Sources Table */}
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Added Income Sources</div>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94A3B8' }}>SOURCE NAME</th>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94A3B8' }}>AMOUNT (MONTHLY)</th>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#94A3B8' }} className="no-print">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredIncome.length === 0 ? (
                                                <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8' }}>{incomeSearch ? 'No matching income source found.' : 'No income sources added yet'}</td></tr>
                                            ) : (
                                                filteredIncome.map(i => (
                                                    <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{i.name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: 700 }}>₹{i.amount.toLocaleString('en-IN')}</td>
                                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }} className="no-print">
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                <button onClick={() => handleEditIncomeSource(i)} style={{ background: '#EFF6FF', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#2563EB' }}>
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button onClick={() => handleDeleteIncomeSource(i.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#EF4444' }}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }} className="no-print">
                                <button onClick={handleSaveDetails} style={saveBtn}>
                                    <Save size={16} /> Save Details
                                </button>
                                {saved && <span style={{ marginLeft: '1rem', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>✓ Saved</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: MONTHLY EXPENSE */}
                <div className="finance-panel-right">
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Expense</h2>

                        <div className="search-filter-container">
                            <div className="search-input-wrapper">
                                <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search expense..."
                                    className="compact-search-input"
                                    value={expenseSearch}
                                    onChange={(e) => setExpenseSearch(e.target.value)}
                                />
                            </div>
                            <div style={{ position: 'relative' }} ref={expenseSortRef}>
                                <button
                                    onClick={() => setShowExpenseSort(!showExpenseSort)}
                                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                                    title="Sort & Filter"
                                >
                                    <Filter size={16} />
                                </button>
                                {showExpenseSort && (
                                    <div className="filter-dropdown">
                                        {[
                                            { id: 'highest', label: 'Highest Amount' },
                                            { id: 'lowest',  label: 'Lowest Amount' },
                                            { id: 'az',      label: 'A–Z (Purchase Name)' },
                                            { id: 'za',      label: 'Z–A (Purchase Name)' },
                                            { id: 'newest',  label: 'Newest First' },
                                            { id: 'oldest',  label: 'Oldest First' },
                                            { id: 'clear',   label: 'Clear Filter' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                className={`filter-option ${expenseSort === opt.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (opt.id === 'clear') {
                                                        setExpenseSort('newest');
                                                        setExpenseSearch('');
                                                    } else {
                                                        setExpenseSort(opt.id);
                                                    }
                                                    setShowExpenseSort(false);
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="red-divider"></div>

                    {isExpenseEmpty && !isAddingExpense ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }} className="no-print">
                            <button
                                onClick={() => setIsAddingExpense(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 1.8rem', background: '#fff', color: '#1B6B3A',
                                    border: '2px dashed #1B6B3A', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                Add Expense +
                            </button>
                        </div>
                    ) : (
                        <div style={{ paddingTop: '1rem' }}>
                            <form onSubmit={handleSaveExpense} className="no-print">
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={lbl}>Purchase Name</label>
                                    <input
                                        type="text"
                                        style={inp}
                                        value={expense.name}
                                        placeholder="Examples: Vegetables, Milk, Petrol, Ice Cream, Hotel Food, etc."
                                        onChange={e => setExpense(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'end', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={lbl}>Amount Spent</label>
                                        <input
                                            type="number"
                                            style={inp}
                                            value={expense.amount}
                                            placeholder="0"
                                            onChange={e => setExpense(prev => ({ ...prev, amount: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <button type="submit" style={saveBtn}>
                                        <ShoppingCart size={16} /> {editingId ? 'Update Expense' : 'Save Expense'}
                                    </button>
                                </div>
                            </form>

                            {/* Expense History Table */}
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Saved Expenses</div>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94A3B8' }}>DATE</th>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94A3B8' }}>PURCHASE NAME</th>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#94A3B8' }}>AMOUNT</th>
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#94A3B8' }} className="no-print"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExpenses.length === 0 ? (
                                                <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8' }}>{expenseSearch ? 'No matching expense found.' : 'No expenses yet'}</td></tr>
                                            ) : (
                                                filteredExpenses.map(e => (
                                                    <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', color: '#94A3B8' }}>{e.date}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{e.name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: 700 }}>₹{e.amount.toLocaleString('en-IN')}</td>
                                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }} className="no-print">
                                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                <button onClick={() => handleEditExpense(e)} style={{ background: '#EFF6FF', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#2563EB' }}>
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button onClick={() => handleDeleteExpense(e.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#EF4444' }}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {expenses.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button onClick={handleSaveToPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#1E293B' }}>
                                            <FileText size={14} /> Save to PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
