import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DollarSign, ShoppingCart, Save, Trash2, Pencil, FileText, Briefcase, Plus, Search, Filter, X, ArrowUpDown, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { useAuth } from '../../context';
import { transactionsService } from '../../services';
import { useQueryClient } from '@tanstack/react-query';

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

const BLANK_INCOME = { name: '', description: '', date: '', time: '', schedule: 'Monthly', amount: '' };
const BLANK_EXPENSE = { name: '', description: '', date: '', time: '', schedule: 'Monthly', amount: '' };

const getOrdinal = (d) => {
    const day = parseInt(d);
    if (isNaN(day)) return "";
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
};

const FinancePage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const uid = user?.id ?? user?.email ?? 'guest';

    const [incomeSources, setIncomeSources] = useState(() => {
        try { return JSON.parse(localStorage.getItem(incomeKey(uid))) || []; }
        catch { return []; }
    });
    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem(expensesKey(uid))) || []; }
        catch { return []; }
    });

    const [newIncome, setNewIncome] = useState(BLANK_INCOME);
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

    // Column-level Filter States
    const [incomeFilters, setIncomeFilters] = useState({
        name: { search: '', sort: '' },
        description: { search: '', sort: '' },
        amount: { search: '', sort: '' },
        salaryCreditDate: { search: '', sort: '' },
    });
    const [expenseFilters, setExpenseFilters] = useState({
        date: { search: '', sort: '' },
        name: { search: '', sort: '' },
        description: { search: '', sort: '' },
        amount: { search: '', sort: '' },
    });
    const [activeFilter, setActiveFilter] = useState({ type: null, column: null });
    const filterDropdownRef = useRef(null);

    // Filtered and Sorted Data
    const filteredIncome = useMemo(() => {
        let result = [...incomeSources];

        // Global search
        if (incomeSearch) {
            result = result.filter(i => i.name.toLowerCase().includes(incomeSearch.toLowerCase()));
        }

        // Column-level search
        Object.keys(incomeFilters).forEach(key => {
            if (incomeFilters[key].search) {
                const searchVal = incomeFilters[key].search.toLowerCase();
                result = result.filter(item => String(item[key] || '').toLowerCase().includes(searchVal));
            }
        });

        // Column-level sort (only one active at a time)
        const activeSortCol = Object.keys(incomeFilters).find(key => incomeFilters[key].sort);
        if (activeSortCol) {
            const sortDir = incomeFilters[activeSortCol].sort;
            result.sort((a, b) => {
                let valA = a[activeSortCol];
                let valB = b[activeSortCol];

                if (activeSortCol === 'amount' || activeSortCol === 'salaryCreditDate') {
                    return sortDir === 'asc' ? valA - valB : valB - valA;
                }

                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
                return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        } else {
            // Default global sort
            switch (incomeSort) {
                case 'highest': result.sort((a, b) => b.amount - a.amount); break;
                case 'lowest':  result.sort((a, b) => a.amount - b.amount); break;
                case 'az':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
                case 'za':      result.sort((a, b) => b.name.localeCompare(a.name)); break;
                case 'newest':  result.sort((a, b) => b.id - a.id); break;
                case 'oldest':  result.sort((a, b) => a.id - b.id); break;
                default: break;
            }
        }
        return result;
    }, [incomeSources, incomeSearch, incomeSort, incomeFilters]);

    const filteredExpenses = useMemo(() => {
        let result = [...expenses];

        // Global search
        if (expenseSearch) {
            result = result.filter(e => e.name.toLowerCase().includes(expenseSearch.toLowerCase()));
        }

        // Column-level search
        Object.keys(expenseFilters).forEach(key => {
            if (expenseFilters[key].search) {
                const searchVal = expenseFilters[key].search.toLowerCase();
                result = result.filter(item => String(item[key] || '').toLowerCase().includes(searchVal));
            }
        });

        // Column-level sort
        const activeSortCol = Object.keys(expenseFilters).find(key => expenseFilters[key].sort);
        if (activeSortCol) {
            const sortDir = expenseFilters[activeSortCol].sort;
            result.sort((a, b) => {
                let valA = a[activeSortCol];
                let valB = b[activeSortCol];

                if (activeSortCol === 'amount' || activeSortCol === 'salaryCreditDate') {
                    return sortDir === 'asc' ? valA - valB : valB - valA;
                }

                if (activeSortCol === 'date') {
                    // Dates are in DD MMM YYYY format
                    const parseDate = (dStr) => {
                        if (!dStr) return 0;
                        const [d, m, y] = dStr.split(' ');
                        return new Date(`${m} ${d}, ${y}`).getTime();
                    };
                    return sortDir === 'asc' ? parseDate(valA) - parseDate(valB) : parseDate(valB) - parseDate(valA);
                }

                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
                return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        } else {
            // Default global sort
            switch (expenseSort) {
                case 'highest': result.sort((a, b) => b.amount - a.amount); break;
                case 'lowest':  result.sort((a, b) => a.amount - b.amount); break;
                case 'az':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
                case 'za':      result.sort((a, b) => b.name.localeCompare(a.name)); break;
                case 'newest':  result.sort((a, b) => b.id - a.id); break;
                case 'oldest':  result.sort((a, b) => a.id - b.id); break;
                default: break;
            }
        }
        return result;
    }, [expenses, expenseSearch, expenseSort, expenseFilters]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (incomeSortRef.current && !incomeSortRef.current.contains(event.target)) setShowIncomeSort(false);
            if (expenseSortRef.current && !expenseSortRef.current.contains(event.target)) setShowExpenseSort(false);
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setActiveFilter({ type: null, column: null });
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

    // Helper for syncing with Transactions
    const mapCategory = (name) => {
        const n = name.toLowerCase();
        if (n.includes('salary') || n.includes('employment')) return 'Employment';
        if (n.includes('business')) return 'Business';
        if (n.includes('freelance')) return 'Freelance';
        if (n.includes('rent') || n.includes('rental')) return 'Rental';
        if (n.includes('invest')) return 'Investment';
        if (n.includes('food') || n.includes('grocery')) return 'Food';
        if (n.includes('utility') || n.includes('bill') || n.includes('electricity')) return 'Utilities';
        if (n.includes('petrol') || n.includes('transport') || n.includes('fuel')) return 'Transport';
        return 'Other';
    };

    const formatAPIDate = (dStr) => {
        if (!dStr) return new Date().toISOString().split('T')[0];
        try {
            const parts = dStr.split(' ');
            if (parts.length !== 3) return new Date().toISOString().split('T')[0];
            const [d, m, y] = parts;
            const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
            const date = new Date(y, monthMap[m], d);
            return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
        } catch { return new Date().toISOString().split('T')[0]; }
    };

    const handleAddIncomeSource = (e) => {
        e.preventDefault();
        if (!newIncome.name.trim() || !newIncome.amount) return;

        if (editingIncomeId) {
            setIncomeSources(prev => prev.map(i => i.id === editingIncomeId ? {
                ...i,
                ...newIncome,
                name: newIncome.name.trim(),
                amount: parseFloat(newIncome.amount) || 0,
                description: newIncome.description.trim(),
            } : i));
            setEditingIncomeId(null);
        } else {
            const entry = {
                ...newIncome,
                id: Date.now(),
                name: newIncome.name.trim(),
                amount: parseFloat(newIncome.amount) || 0,
                description: newIncome.description.trim(),
            };
            setIncomeSources(prev => [...prev, entry]);
        }
        setNewIncome(BLANK_INCOME);
    };

    const handleDeleteIncomeSource = async (id) => {
        const item = incomeSources.find(i => i.id === id);
        if (item?.transactionId) {
            try {
                await transactionsService.deleteTransaction(item.transactionId);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }
            catch (err) { console.error("Sync error deleting transaction:", err); }
        }
        setIncomeSources(prev => prev.filter(i => i.id !== id));
    };
    const handleEditIncomeSource = (i) => {
        setNewIncome({
            name: i.name,
            amount: i.amount,
            description: i.description || '',
            date: i.date || '',
            time: i.time || '',
            schedule: i.schedule || 'Monthly'
        });
        setEditingIncomeId(i.id);
    };

    const handleSaveDetails = async () => {
        let errorMessages = [];
        // Sync all income sources to transactions
        const updatedSources = await Promise.all(incomeSources.map(async (source) => {
            const data = {
                type: 'Income',
                title: source.name,
                category: mapCategory(source.name),
                amount: source.amount,
                date: new Date().toISOString().split('T')[0],
                notes: `${source.description || ''}${source.salaryCreditDate ? ` (Monthly Credit Date: ${source.salaryCreditDate}${getOrdinal(source.salaryCreditDate)})` : ''}`.trim(),
                status: 'Completed'
            };

            console.log("FinancePage: Syncing Income Source", { id: source.id, transactionId: source.transactionId, payload: data });

            try {
                let res;
                if (source.transactionId) {
                    console.log(`FinancePage: Updating Transaction ${source.transactionId}`, data);
                    res = await transactionsService.updateTransaction(source.transactionId, data);
                    console.log("FinancePage: Update Income Success", res);
                    // If the service returns the data, it's res. Otherwise source.
                    return { ...source, ...res };
                } else {
                    console.log("FinancePage: Creating New Transaction", data);
                    res = await transactionsService.createTransaction(data);
                    console.log("FinancePage: Create Income Success", res);
                    // Capturing the ID from the response.
                    // Based on transactionsService.js, res should be the 'data' part of the response.
                    const transactionId = res?.id || res?.data?.id || res?._id;
                    if (!transactionId) {
                        console.warn("FinancePage: No ID returned from createTransaction", res);
                    }
                    return { ...source, transactionId };
                }
            } catch (err) {
                console.error("FinancePage: Sync Income Error Detail", {
                    source: source.name,
                    status: err.status,
                    code: err.code,
                    details: err.details,
                    message: err.message
                });
                const statusInfo = err.status ? `(Status: ${err.status})` : "";
                errorMessages.push(`${source.name}: ${err.message} ${statusInfo}`);
                return source;
            }
        }));

        setIncomeSources(updatedSources);
        queryClient.invalidateQueries({ queryKey: ['transactions'] });

        if (errorMessages.length === 0) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } else {
            alert("Synchronization Failed:\n" + errorMessages.join("\n"));
        }
    };

    const handleSaveExpense = async (ev) => {
        ev.preventDefault();
        if (!expense.name.trim() || !expense.amount) return;

        let entry;
        try {
            if (editingId) {
                const existing = expenses.find(e => e.id === editingId);
                entry = {
                    ...existing,
                    ...expense,
                    name: expense.name.trim(),
                    amount: parseFloat(expense.amount) || 0,
                    description: expense.description.trim()
                };

                const data = {
                    type: 'Expense',
                    title: entry.name,
                    category: mapCategory(entry.name),
                    amount: entry.amount,
                    date: formatAPIDate(entry.date),
                    notes: entry.description || '',
                    status: 'Completed'
                };

                console.log("FinancePage: Syncing Expense (Update)", { id: entry.id, transactionId: entry.transactionId, payload: data });

                if (entry.transactionId) {
                    const res = await transactionsService.updateTransaction(entry.transactionId, data);
                    console.log("FinancePage: Update Expense Success", res);
                } else {
                    const res = await transactionsService.createTransaction(data);
                    console.log("FinancePage: Create Expense Success", res);
                    entry.transactionId = res?.id || res?.data?.id;
                }

                setExpenses(prev => prev.map(e => e.id === editingId ? entry : e));
                setEditingId(null);
            } else {
                entry = {
                    ...expense,
                    id:     Date.now(),
                    date:   expense.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                    name:   expense.name.trim(),
                    amount: parseFloat(expense.amount) || 0,
                    description: expense.description.trim(),
                };

                const data = {
                    type: 'Expense',
                    title: entry.name,
                    category: mapCategory(entry.name),
                    amount: entry.amount,
                    date: formatAPIDate(entry.date),
                    notes: entry.description || '',
                    status: 'Completed'
                };

                console.log("FinancePage: Syncing Expense (Create)", { payload: data });

                const res = await transactionsService.createTransaction(data);
                console.log("FinancePage: Create Expense Success", res);
                entry.transactionId = res?.id || res?.data?.id;

                setExpenses(prev => [entry, ...prev]);
            }

            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setExpense(BLANK_EXPENSE);
            setIsAddingExpense(false);
            setExpSaved(true);
            setTimeout(() => setExpSaved(false), 2500);
        } catch (err) {
            console.error("FinancePage: Sync Expense Error Detail", {
                status: err.status,
                code: err.code,
                details: err.details,
                message: err.message
            });
            const statusInfo = err.status ? `(Status: ${err.status})` : "";
            alert(`Synchronization Failed: ${err.message} ${statusInfo}`);
        }
    };

    const handleDeleteExpense = async (id) => {
        const item = expenses.find(e => e.id === id);
        if (item?.transactionId) {
            try {
                await transactionsService.deleteTransaction(item.transactionId);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }
            catch (err) { console.error("Sync error deleting transaction:", err); }
        }
        setExpenses(prev => prev.filter(e => e.id !== id));
    };
    const handleEditExpense = (e) => {
        setExpense({
            name: e.name,
            amount: e.amount,
            description: e.description || '',
            date: e.date || '',
            time: e.time || '',
            schedule: e.schedule || 'Monthly'
        });
        setEditingId(e.id);
    };

    const ColumnFilterDropdown = ({ type, column, label, filterState, setFilterState }) => {
        const isActive = activeFilter.type === type && activeFilter.column === column;
        const currentFilter = filterState[column];

        const handleSort = (dir) => {
            setFilterState(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(key => {
                    newState[key] = { ...newState[key], sort: key === column ? dir : '' };
                });
                return newState;
            });
            setActiveFilter({ type: null, column: null });
        };

        const handleSearch = (val) => {
            setFilterState(prev => ({
                ...prev,
                [column]: { ...prev[column], search: val }
            }));
        };

        const clearFilter = () => {
            setFilterState(prev => ({
                ...prev,
                [column]: { search: '', sort: '' }
            }));
            setActiveFilter({ type: null, column: null });
        };

        return (
            <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }} className="no-print">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveFilter(isActive ? { type: null, column: null } : { type, column });
                    }}
                    style={{
                        background: currentFilter.search || currentFilter.sort ? '#F0FDF4' : 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px',
                        cursor: 'pointer',
                        color: currentFilter.search || currentFilter.sort ? '#1B6B3A' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Filter & Sort"
                >
                    <ArrowUpDown size={12} />
                </button>

                {isActive && (
                    <div
                        ref={filterDropdownRef}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: column === 'amount' || column === 'actions' ? 'auto' : 0,
                            right: column === 'amount' || column === 'actions' ? 0 : 'auto',
                            background: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            padding: '12px',
                            minWidth: '200px',
                            marginTop: '8px'
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            Filter {label}
                        </div>

                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder={`Search ${label}...`}
                                value={currentFilter.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px 6px 28px',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.75rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    fontWeight: 500
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {column === 'amount' || column === 'salaryCreditDate' ? (
                                <>
                                    <button onClick={() => handleSort('desc')} className="column-filter-option">
                                        <SortDesc size={14} /> Highest → Lowest
                                    </button>
                                    <button onClick={() => handleSort('asc')} className="column-filter-option">
                                        <SortAsc size={14} /> Lowest → Highest
                                    </button>
                                </>
                            ) : column === 'date' ? (
                                <>
                                    <button onClick={() => handleSort('desc')} className="column-filter-option">
                                        <SortDesc size={14} /> Newest First
                                    </button>
                                    <button onClick={() => handleSort('asc')} className="column-filter-option">
                                        <SortAsc size={14} /> Oldest First
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleSort('asc')} className="column-filter-option">
                                        <SortAsc size={14} /> Sort A → Z
                                    </button>
                                    <button onClick={() => handleSort('desc')} className="column-filter-option">
                                        <SortDesc size={14} /> Sort Z → A
                                    </button>
                                </>
                            )}
                            <button
                                onClick={clearFilter}
                                style={{ marginTop: '6px', borderTop: '1px solid #F1F5F9', borderRadius: 0, paddingTop: '8px', color: '#EF4444' }}
                                className="column-filter-option"
                            >
                                <X size={14} /> Clear Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
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
                    height: 1.5px;
                    background: #E2E8F0;
                    margin: 0 -1.5rem 1.5rem -1.5rem;
                    position: relative;
                }
                .red-divider::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 120px;
                    height: 2px;
                    background: linear-gradient(90deg, #1B6B3A 0%, #064E3B 100%);
                    border-radius: 4px;
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
                .column-filter-option {
                    width: 100%;
                    padding: 6px 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #475569;
                    text-align: left;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .column-filter-option:hover {
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
                marginBottom: '2.5rem',
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
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
            <div className="finance-premium-container" style={{ border: 'none', boxShadow: 'none', background: 'transparent', gap: '2rem' }}>

                {/* LEFT SIDE: INCOME */}
                <div className="finance-panel-left" style={{ border: '1px solid #E2E8F0', borderRadius: '16px', background: '#fff', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Income</h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Added Income</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                style={{ ...inp, background: '#fff' }}
                                placeholder="Enter income name"
                                value={newIncome.name}
                                onChange={e => setNewIncome(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <button
                                onClick={handleAddIncomeSource}
                                style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleAddIncomeSource} style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>NAME</label>
                                <input
                                    type="text"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={newIncome.name}
                                    placeholder="Name"
                                    onChange={e => setNewIncome(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
                                <textarea
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem', height: '32px', resize: 'none' }}
                                    value={newIncome.description}
                                    placeholder="Description"
                                    onChange={e => setNewIncome(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>DATE</label>
                                <input
                                    type="date"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={newIncome.date}
                                    onChange={e => setNewIncome(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>TIME</label>
                                <input
                                    type="time"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={newIncome.time}
                                    onChange={e => setNewIncome(prev => ({ ...prev, time: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>SCHEDULE</label>
                                <select
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={newIncome.schedule}
                                    onChange={e => setNewIncome(prev => ({ ...prev, schedule: e.target.value }))}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="One Time">One Time</option>
                                    <option value="Weekly">Weekly</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>AMOUNT</label>
                                <input
                                    type="number"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={newIncome.amount}
                                    placeholder="Amount"
                                    onChange={e => setNewIncome(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', height: '32px' }}
                            >
                                Add
                            </button>
                        </div>
                    </form>

                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Income List</div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>NAME</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>DESCRIPTION</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>DATE</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>TIME</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>SCHEDULE</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>AMOUNT</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900 }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIncome.length === 0 ? (
                                        <tr><td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No income sources added yet</td></tr>
                                    ) : (
                                        filteredIncome.map(i => (
                                            <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#10B981' }}>{i.name}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#64748B' }}>{i.description || '—'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500 }}>{i.date || '—'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500 }}>{i.time || '—'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#64748B' }}>{i.schedule || 'Monthly'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: '#10B981' }}>₹{(parseFloat(i.amount) || 0).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                        <button onClick={() => handleEditIncomeSource(i)} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#2563EB' }}>
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => handleDeleteIncomeSource(i.id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#EF4444' }}>
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
                </div>

                {/* RIGHT SIDE: MONTHLY EXPENSE */}
                <div className="finance-panel-right" style={{ border: '1px solid #E2E8F0', borderRadius: '16px', background: '#fff', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expense</h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Added Expense</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                style={{ ...inp, background: '#fff' }}
                                placeholder="Enter expense name"
                                value={expense.name}
                                onChange={e => setExpense(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <button
                                onClick={handleSaveExpense}
                                style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSaveExpense} style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr auto', gap: '0.5rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>NAME</label>
                                <input
                                    type="text"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={expense.name}
                                    placeholder="Name"
                                    onChange={e => setExpense(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
                                <textarea
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem', height: '32px', resize: 'none' }}
                                    value={expense.description}
                                    placeholder="Description"
                                    onChange={e => setExpense(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>DATE</label>
                                <input
                                    type="date"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={expense.date}
                                    onChange={e => setExpense(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>TIME</label>
                                <input
                                    type="time"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={expense.time}
                                    onChange={e => setExpense(prev => ({ ...prev, time: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>SCHEDULE</label>
                                <select
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={expense.schedule}
                                    onChange={e => setExpense(prev => ({ ...prev, schedule: e.target.value }))}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="One Time">One Time</option>
                                    <option value="Weekly">Weekly</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', display: 'block', marginBottom: '0.3rem' }}>AMOUNT</label>
                                <input
                                    type="number"
                                    style={{ ...inp, background: '#fff', padding: '0.4rem 0.6rem' }}
                                    value={expense.amount}
                                    placeholder="Amount"
                                    onChange={e => setExpense(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', height: '32px' }}
                            >
                                Add
                            </button>
                        </div>
                    </form>

                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Expense List</div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>NAME</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>DESCRIPTION</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>DATE</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>TIME</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>SCHEDULE</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#1E40AF', fontWeight: 900 }}>AMOUNT</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900 }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length === 0 ? (
                                        <tr><td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No expenses yet</td></tr>
                                    ) : (
                                        filteredExpenses.map(e => (
                                            <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#EF4444' }}>{e.name}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#64748B' }}>{e.description || '—'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500 }}>{e.date || '—'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500 }}>{e.time || '—'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', color: '#64748B' }}>{e.schedule || 'Monthly'}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: '#EF4444' }}>₹{(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                        <button onClick={() => handleEditExpense(e)} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#2563EB' }}>
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => handleDeleteExpense(e.id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#EF4444' }}>
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
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
