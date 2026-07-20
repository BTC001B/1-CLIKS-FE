import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IndianRupee, Trash2, Pencil, Briefcase, Plus, Search, Filter, X, ArrowUpDown, ChevronDown, SortAsc, SortDesc, TrendingUp, TrendingDown, PieChart, ShieldCheck, Bell, Home, Heart, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context';
import { transactionsService, homeService, financePlusService, investmentsService, accountsService } from '../../services';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import MyWallet from './components/MyWallet';
import BudgetPlanner from './components/BudgetPlanner';
import BillsReminders from './components/BillsReminders';
import SalaryManager from './components/SalaryManager';
import PropertyManager from './components/PropertyManager';
import PensionManager from './components/PensionManager';
import InvestmentPortfolio from './components/InvestmentPortfolio';

/* ─── Storage keys scoped per user ────────────────────────────── */
const incomeKey = (uid) => `cliks_finance_income_v2_${uid}`;
const expensesKey = (uid) => `cliks_finance_expenses_${uid}`;
const additionalIncomeKey = (uid) => `cliks_finance_add_income_${uid}`;
const additionalExpensesKey = (uid) => `cliks_finance_add_expenses_${uid}`;

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

const BLANK_INCOME = { 
    name: '', 
    description: '', 
    date: '', 
    time: '', 
    schedule: 'Monthly', 
    amount: '',
    category: 'Other',
    walletId: ''
};
const BLANK_EXPENSE = { 
    name: '', 
    description: '', 
    date: '', 
    time: '', 
    schedule: 'Monthly', 
    amount: '',
    category: 'Other',
    walletId: ''
};

const getOrdinal = (d) => {
    const day = parseInt(d);
    if (isNaN(day)) return "";
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};

const mapCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes('salary') || n.includes('dividend') || n.includes('interest')) return 'Income';
    if (n.includes('rent') || n.includes('lease')) return 'Rent';
    if (n.includes('loan') || n.includes('debt') || n.includes('emi')) return 'Debt & Loan';
    if (n.includes('tax') || n.includes('gst')) return 'Tax';
    if (n.includes('invest') || n.includes('stock') || n.includes('mutual')) return 'Investment';
    return 'Other';
};

const formatAPIDate = (dStr) => {
    try {
        if (!dStr) return new Date().toISOString().split('T')[0];
        if (dStr.includes('-')) return dStr; // YYYY-MM-DD
        const parts = dStr.split(' ');
        if (parts.length !== 3) return new Date().toISOString().split('T')[0];
        const [d, m, y] = parts;
        const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const date = new Date(y, monthMap[m], d);
        return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
    } catch { return new Date().toISOString().split('T')[0]; }
};

const FinancePage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const uid = user?.id ?? user?.email ?? 'guest';

    // ── Queries ─────────────────────────────────────────────────────────────

    // 1. Enhanced Dashboard Data
    const { data: dashboardData } = useQuery({
        queryKey: ['finance-dashboard-enhanced'],
        queryFn: () => homeService.getHomeStats(),
        enabled: !!uid && uid !== 'guest',
    });

    // 2. New Modules Data
    const { data: salaryRecords = [] } = useQuery({ queryKey: ['salary-records'], queryFn: financePlusService.getSalaryRecords, enabled: !!uid && uid !== 'guest' });
    const { data: properties = [] } = useQuery({ queryKey: ['property-records'], queryFn: financePlusService.getPropertyRecords, enabled: !!uid && uid !== 'guest' });
    const { data: pensionRecords = [] } = useQuery({ queryKey: ['pension-records'], queryFn: financePlusService.getPensionRecords, enabled: !!uid && uid !== 'guest' });
    const { data: notifications = [] } = useQuery({ queryKey: ['finance-notifications'], queryFn: financePlusService.getNotifications, enabled: !!uid && uid !== 'guest' });

    // 3. Existing Transactions query
    const { data: dbTransactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionsService.getTransactions(),
        enabled: !!uid && uid !== 'guest',
    });

    // ── Mutations ───────────────────────────────────────────────────────────

    const salaryMutation = useMutation({ mutationFn: (data) => financePlusService.createSalaryRecord(data), onSuccess: () => { queryClient.invalidateQueries(['salary-records']); queryClient.invalidateQueries(['finance-dashboard-enhanced']); queryClient.invalidateQueries(['transactions']); } });
    const propertyMutation = useMutation({ mutationFn: (data) => financePlusService.createProperty(data), onSuccess: () => queryClient.invalidateQueries(['property-records']) });
    const rentMutation = useMutation({ mutationFn: ({ id, ...data }) => financePlusService.recordRent(id, data), onSuccess: () => { queryClient.invalidateQueries(['property-records']); queryClient.invalidateQueries(['finance-dashboard-enhanced']); queryClient.invalidateQueries(['transactions']); } });
    const pensionMutation = useMutation({ mutationFn: (data) => financePlusService.recordPension(data), onSuccess: () => { queryClient.invalidateQueries(['pension-records']); queryClient.invalidateQueries(['finance-dashboard-enhanced']); queryClient.invalidateQueries(['transactions']); } });

    const investmentCreateMutation = useMutation({ mutationFn: (data) => investmentsService.createInvestment(data), onSuccess: () => queryClient.invalidateQueries(['finance-dashboard-enhanced']) });
    const investmentDeleteMutation = useMutation({ mutationFn: (id) => investmentsService.deleteInvestment(id), onSuccess: () => queryClient.invalidateQueries(['finance-dashboard-enhanced']) });

    const accountUpdateMutation = useMutation({ mutationFn: ({ id, data }) => accountsService.updateAccount(id, data), onSuccess: () => { queryClient.invalidateQueries(['finance-dashboard-enhanced']); queryClient.invalidateQueries(['transactions']); } });

    const budgetMutation = useMutation({ mutationFn: (val) => financePlusService.updateSettings({ global_budget: val }), onSuccess: () => queryClient.invalidateQueries(['finance-dashboard-enhanced']) });

    const [isSynced, setIsSynced] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (dashboardData && !dashboardData.primaryIncomeSource && uid !== 'guest') {
            setShowOnboarding(true);
        }
    }, [dashboardData, uid]);

    // Data states for legacy/local sync
    const [incomeSources, setIncomeSources] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [additionalIncomeSources, setAdditionalIncomeSources] = useState([]);
    const [additionalExpenses, setAdditionalExpenses] = useState([]);

    /* ─── NEW EXTENDED STATE & HELPERS ───────────────────────── */
    const [wallets, setWallets] = useState([]);
    const [budget, setBudget] = useState(20000);

    useEffect(() => {
        if (dashboardData) {
            if (dashboardData.accounts) setWallets(dashboardData.accounts);
            if (dashboardData.globalBudget !== undefined) setBudget(dashboardData.globalBudget);
        }
    }, [dashboardData]);

    const handleUpdateBalance = async (id, newBalance) => {
        const wallet = wallets.find(w => w.id === id);
        if (!wallet) return;
        accountUpdateMutation.mutate({ id, data: { ...wallet, balance: newBalance } });
    };

    const handleUpdateBudget = (value) => {
        budgetMutation.mutate(value);
    };

    const settingsKey = (uid) => `cliks_finance_settings_${uid}`;
    const [settings, setSettings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(settingsKey(uid))) || {
                currency: 'INR',
                dateFormat: 'DD MMM YYYY',
                theme: 'Default Slate',
                exportFormat: 'CSV'
            };
        } catch {
            return {
                currency: 'INR',
                dateFormat: 'DD MMM YYYY',
                theme: 'Default Slate',
                exportFormat: 'CSV'
            };
        }
    });

    const handleUpdateSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem(settingsKey(uid), JSON.stringify(newSettings));
    };

    const currencySymbols = { INR: '₹', USD: '₹', EUR: '€', GBP: '£' };
    const currencySymbol = currencySymbols[settings.currency] || '₹';

    const billsKey = (uid) => `cliks_finance_bills_${uid}`;
    const [bills, setBills] = useState(() => {
        try { return JSON.parse(localStorage.getItem(billsKey(uid))) || []; }
        catch { return []; }
    });
    const handleUpdateBills = (updated) => {
        setBills(updated);
        localStorage.setItem(billsKey(uid), JSON.stringify(updated));
    };

    // Wallet adjustment helpers (Local Rollbacks / Optimistic UI can be added here if needed)
    const adjustWalletBalance = (walletId, amount, isIncome) => {
        // Now handled by backend automation
        queryClient.invalidateQueries(['finance-dashboard-enhanced']);
    };

    const handleUpdateWalletOnEdit = (oldWalletId, oldAmount, newWalletId, newAmount, isIncome) => {
        // Now handled by backend automation
        queryClient.invalidateQueries(['finance-dashboard-enhanced']);
    };

    const handleUpdateWalletOnDelete = (walletId, amount, isIncome) => {
        // Now handled by backend automation
        queryClient.invalidateQueries(['finance-dashboard-enhanced']);
    };

    // Form states
    const [newIncome, setNewIncome] = useState(BLANK_INCOME);
    const [editingIncomeId, setEditingIncomeId] = useState(null);

    const [newAdditionalIncome, setNewAdditionalIncome] = useState(BLANK_INCOME);
    const [editingAdditionalIncomeId, setEditingAdditionalIncomeId] = useState(null);

    const [expense, setExpense] = useState(BLANK_EXPENSE);
    const [editingId, setEditingId] = useState(null);

    const [additionalExpense, setAdditionalExpense] = useState(BLANK_EXPENSE);
    const [editingAdditionalId, setEditingAdditionalId] = useState(null);

    const [saved, setSaved] = useState(false);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showAddIncomeForm, setShowAddIncomeForm] = useState(false);
    const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);

    // Search and Sort State
    const [incomeSearch, setIncomeSearch] = useState('');
    const [incomeSort, setIncomeSort] = useState('newest');
    const [incomeSortRef] = [useRef(null)];

    const [expenseSearch, setExpenseSearch] = useState('');
    const [expenseSort, setExpenseSort] = useState('newest');
    const [expenseSortRef] = [useRef(null)];

    const [addIncomeSearch, setAddIncomeSearch] = useState('');
    const [addIncomeSort, setAddIncomeSort] = useState('newest');
    const [addIncomeSortRef] = [useRef(null)];

    const [addExpenseSearch, setAddExpenseSearch] = useState('');
    const [addExpenseSort, setAddExpenseSort] = useState('newest');
    const [addExpenseSortRef] = [useRef(null)];

    // Filter states
    const [incomeFilters, setIncomeFilters] = useState({ name: { search: '', sort: '' }, description: { search: '', sort: '' }, amount: { search: '', sort: '' }, date: { search: '', sort: '' } });
    const [expenseFilters, setExpenseFilters] = useState({ name: { search: '', sort: '' }, description: { search: '', sort: '' }, amount: { search: '', sort: '' }, date: { search: '', sort: '' } });
    const [addIncomeFilters, setAddIncomeFilters] = useState({ name: { search: '', sort: '' }, description: { search: '', sort: '' }, amount: { search: '', sort: '' }, date: { search: '', sort: '' } });
    const [addExpenseFilters, setAddExpenseFilters] = useState({ name: { search: '', sort: '' }, description: { search: '', sort: '' }, amount: { search: '', sort: '' }, date: { search: '', sort: '' } });

    const [activeFilter, setActiveFilter] = useState({ type: null, column: null });
    const filterDropdownRef = useRef(null);



    // Filter Logic
    const filteredIncome = useMemo(() => {
        let result = [...incomeSources];
        if (incomeSearch) {
            const q = incomeSearch.toLowerCase();
            result = result.filter(i =>
                i.name.toLowerCase().includes(q) ||
                (i.description || '').toLowerCase().includes(q) ||
                (i.schedule || '').toLowerCase().includes(q) ||
                (i.amount || '').toString().toLowerCase().includes(q)
            );
        }
        Object.keys(incomeFilters).forEach(key => { if (incomeFilters[key].search) result = result.filter(item => String(item[key] || '').toLowerCase().includes(incomeFilters[key].search.toLowerCase())); });
        const activeSort = Object.keys(incomeFilters).find(k => incomeFilters[k].sort);
        if (activeSort) {
            const dir = incomeFilters[activeSort].sort;
            result.sort((a, b) => {
                let vA = a[activeSort], vB = b[activeSort];
                if (activeSort === 'amount') return dir === 'asc' ? vA - vB : vB - vA;
                return dir === 'asc' ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
            });
        }
        return result;
    }, [incomeSources, incomeSearch, incomeFilters]);

    const filteredExpenses = useMemo(() => {
        let result = [...expenses];
        if (expenseSearch) {
            const q = expenseSearch.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(q) ||
                (e.description || '').toLowerCase().includes(q) ||
                (e.schedule || '').toLowerCase().includes(q) ||
                (e.amount || '').toString().toLowerCase().includes(q)
            );
        }
        Object.keys(expenseFilters).forEach(key => { if (expenseFilters[key].search) result = result.filter(item => String(item[key] || '').toLowerCase().includes(expenseFilters[key].search.toLowerCase())); });
        return result;
    }, [expenses, expenseSearch, expenseFilters]);

    const filteredAdditionalIncome = useMemo(() => {
        let result = [...additionalIncomeSources];
        if (addIncomeSearch) {
            const q = addIncomeSearch.toLowerCase();
            result = result.filter(i =>
                i.name.toLowerCase().includes(q) ||
                (i.description || '').toLowerCase().includes(q) ||
                (i.schedule || '').toLowerCase().includes(q) ||
                (i.amount || '').toString().toLowerCase().includes(q)
            );
        }
        Object.keys(addIncomeFilters).forEach(key => { if (addIncomeFilters[key].search) result = result.filter(item => String(item[key] || '').toLowerCase().includes(addIncomeFilters[key].search.toLowerCase())); });
        return result;
    }, [additionalIncomeSources, addIncomeSearch, addIncomeFilters]);

    const filteredAdditionalExpenses = useMemo(() => {
        let result = [...additionalExpenses];
        if (addExpenseSearch) {
            const q = addExpenseSearch.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(q) ||
                (e.description || '').toLowerCase().includes(q) ||
                (e.schedule || '').toLowerCase().includes(q) ||
                (e.amount || '').toString().toLowerCase().includes(q)
            );
        }
        Object.keys(addExpenseFilters).forEach(key => { if (addExpenseFilters[key].search) result = result.filter(item => String(item[key] || '').toLowerCase().includes(addExpenseFilters[key].search.toLowerCase())); });
        return result;
    }, [additionalExpenses, addExpenseSearch, addExpenseFilters]);

    // Persist local storage only if guest
    useEffect(() => { localStorage.setItem(incomeKey(uid), JSON.stringify(incomeSources)); }, [incomeSources, uid]);
    useEffect(() => { localStorage.setItem(expensesKey(uid), JSON.stringify(expenses)); }, [expenses, uid]);
    useEffect(() => { localStorage.setItem(additionalIncomeKey(uid), JSON.stringify(additionalIncomeSources)); }, [additionalIncomeSources, uid]);
    useEffect(() => { localStorage.setItem(additionalExpensesKey(uid), JSON.stringify(additionalExpenses)); }, [additionalExpenses, uid]);

    // Auto-sync local storage items that do not have a transactionId (e.g. historical data)
    useEffect(() => {
        if (!uid || uid === 'guest') {
            setIsSynced(true);
            return;
        }

        let needsUpdate = false;
        
        const syncItems = async () => {
            const updatedIncome = [...incomeSources];
            for (let i = 0; i < updatedIncome.length; i++) {
                const entry = updatedIncome[i];
                if (!entry.transactionId && entry.name && entry.amount) {
                    try {
                        const data = { 
                            type: 'income', 
                            title: entry.name, 
                            name: entry.name,
                            description: entry.description || '',
                            category: mapCategory(entry.name), 
                            amount: entry.amount, 
                            date: formatAPIDate(entry.date), 
                            time: entry.time || '',
                            schedule: entry.schedule || 'Monthly',
                            notes: entry.schedule || 'Monthly',
                            status: 'Completed' 
                        };
                        const res = await transactionsService.createTransaction(data);
                        entry.transactionId = res?.id || res?.data?.id;
                        needsUpdate = true;
                    } catch (err) { console.error('Auto-sync error:', err); }
                }
            }

            const updatedExpenses = [...expenses];
            for (let i = 0; i < updatedExpenses.length; i++) {
                const entry = updatedExpenses[i];
                if (!entry.transactionId && entry.name && entry.amount) {
                    try {
                        const data = { 
                            type: 'expense', 
                            title: entry.name, 
                            name: entry.name,
                            description: entry.description || '',
                            category: mapCategory(entry.name), 
                            amount: entry.amount, 
                            date: formatAPIDate(entry.date), 
                            time: entry.time || '',
                            schedule: entry.schedule || 'Monthly',
                            notes: entry.schedule || 'Monthly',
                            status: 'Completed' 
                        };
                        const res = await transactionsService.createTransaction(data);
                        entry.transactionId = res?.id || res?.data?.id;
                        needsUpdate = true;
                    } catch (err) { console.error('Auto-sync error:', err); }
                }
            }

            const updatedAddIncome = [...additionalIncomeSources];
            for (let i = 0; i < updatedAddIncome.length; i++) {
                const entry = updatedAddIncome[i];
                if (!entry.transactionId && entry.name && entry.amount) {
                    try {
                        const data = { 
                            type: 'income', 
                            title: `[Add] ${entry.name}`, 
                            name: `[Add] ${entry.name}`,
                            description: entry.description || '',
                            category: mapCategory(entry.name), 
                            amount: entry.amount, 
                            date: formatAPIDate(entry.date), 
                            time: entry.time || '',
                            schedule: entry.schedule || 'Monthly',
                            notes: entry.schedule || 'Monthly',
                            status: 'Completed' 
                        };
                        const res = await transactionsService.createTransaction(data);
                        entry.transactionId = res?.id || res?.data?.id;
                        needsUpdate = true;
                    } catch (err) { console.error('Auto-sync error:', err); }
                }
            }

            const updatedAddExpenses = [...additionalExpenses];
            for (let i = 0; i < updatedAddExpenses.length; i++) {
                const entry = updatedAddExpenses[i];
                if (!entry.transactionId && entry.name && entry.amount) {
                    try {
                        const data = { 
                            type: 'expense', 
                            title: `[Add] ${entry.name}`, 
                            name: `[Add] ${entry.name}`,
                            description: entry.description || '',
                            category: mapCategory(entry.name), 
                            amount: entry.amount, 
                            date: formatAPIDate(entry.date), 
                            time: entry.time || '',
                            schedule: entry.schedule || 'Monthly',
                            notes: entry.schedule || 'Monthly',
                            status: 'Completed' 
                        };
                        const res = await transactionsService.createTransaction(data);
                        entry.transactionId = res?.id || res?.data?.id;
                        needsUpdate = true;
                    } catch (err) { console.error('Auto-sync error:', err); }
                }
            }

            if (needsUpdate) {
                setIncomeSources(updatedIncome);
                setExpenses(updatedExpenses);
                setAdditionalIncomeSources(updatedAddIncome);
                setAdditionalExpenses(updatedAddExpenses);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }
            setIsSynced(true);
        };

        syncItems();
    }, [uid]);

    // Sync React states with query data once auto-sync is done
    useEffect(() => {
        if (!isSynced || !uid || uid === 'guest' || !dbTransactions) return;

        const mapTransactionToEntry = (tx) => {
            const isAdd = tx.title ? tx.title.startsWith('[Add] ') : false;
            let name = tx.name || tx.incomeName || tx.expenseName || tx.sourceName || tx.title || '';
            if (name.startsWith('[Add] ')) {
                name = name.slice(6);
            }
            let description = tx.description || tx.desc || '';
            // Only clear description if it's identical to the name and no explicit name property was present.
            if (description === name && !tx.name && !tx.incomeName && !tx.expenseName && !tx.sourceName) {
                description = '';
            }
            return {
                id: tx.id,
                transactionId: tx.id,
                name: name,
                description: description,
                amount: parseFloat(tx.amount) || 0,
                date: tx.date || '',
                time: tx.time || tx.scheduledTime || '',
                schedule: tx.schedule || 'Monthly',
                category: tx.category || 'Other',
                walletId: tx.notes && tx.notes.startsWith('wallet-') ? tx.notes : '',
            };
        };

        const syncedIncome = dbTransactions
            .filter(tx => (tx.type || '').toLowerCase() === 'income' && !(tx.title || '').startsWith('[Add] ') && !(tx.name || '').startsWith('[Add] '))
            .map(mapTransactionToEntry);

        const syncedExpenses = dbTransactions
            .filter(tx => (tx.type || '').toLowerCase() === 'expense' && !(tx.title || '').startsWith('[Add] ') && !(tx.name || '').startsWith('[Add] '))
            .map(mapTransactionToEntry);

        const syncedAddIncome = dbTransactions
            .filter(tx => (tx.type || '').toLowerCase() === 'income' && ((tx.title || '').startsWith('[Add] ') || (tx.name || '').startsWith('[Add] ')))
            .map(mapTransactionToEntry);

        const syncedAddExpenses = dbTransactions
            .filter(tx => (tx.type || '').toLowerCase() === 'expense' && ((tx.title || '').startsWith('[Add] ') || (tx.name || '').startsWith('[Add] ')))
            .map(mapTransactionToEntry);

        setIncomeSources(syncedIncome);
        setExpenses(syncedExpenses);
        setAdditionalIncomeSources(syncedAddIncome);
        setAdditionalExpenses(syncedAddExpenses);
    }, [dbTransactions, isSynced, uid]);

    // Derived
    const fixedSourceIncome = incomeSources.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const additionalSourceIncome = additionalIncomeSources.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const monthlyIncome = fixedSourceIncome + additionalSourceIncome;

    const fixedExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const dailyExpenses = additionalExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    const remaining = monthlyIncome - (fixedExpenses + dailyExpenses);

    const currentMonthExpenses = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthIdx = today.getMonth(); // 0-11
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthName = months[currentMonthIdx];

        const allExpenses = [...expenses, ...additionalExpenses];
        return allExpenses.reduce((sum, e) => {
            if (!e.date) return sum;
            let match = false;
            if (e.date.includes('-')) {
                const parts = e.date.split('-'); // YYYY-MM-DD
                const yr = parseInt(parts[0]);
                const mo = parseInt(parts[1]);
                match = (yr === currentYear && mo === (currentMonthIdx + 1));
            } else {
                const parts = e.date.split(' ');
                if (parts.length === 3) {
                    match = (parts[1] === currentMonthName && parts[2] === String(currentYear));
                }
            }
            return match ? sum + (parseFloat(e.amount) || 0) : sum;
        }, 0);
    }, [expenses, additionalExpenses]);

    const budgetRemaining = Math.max(0, budget - currentMonthExpenses);

    const allTransactions = useMemo(() => {
        const list = [];
        incomeSources.forEach(i => list.push({ ...i, type: 'Income' }));
        expenses.forEach(e => list.push({ ...e, type: 'Expense' }));
        additionalIncomeSources.forEach(i => list.push({ ...i, type: 'Income' }));
        additionalExpenses.forEach(e => list.push({ ...e, type: 'Expense' }));
        return list;
    }, [incomeSources, expenses, additionalIncomeSources, additionalExpenses]);

    // Handlers
    // Handlers
    const handleAddIncomeSource = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newIncome.name.trim() || !newIncome.amount) return;
        let entry;
        const now = new Date();
        const defaultDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (editingIncomeId) {
            const oldEntry = incomeSources.find(i => i.id === editingIncomeId);
            entry = {
                ...oldEntry,
                ...newIncome,
                amount: parseFloat(newIncome.amount) || 0
            };
            handleUpdateWalletOnEdit(oldEntry.walletId, oldEntry.amount, entry.walletId, entry.amount, true);
            setIncomeSources(prev => prev.map(i => i.id === editingIncomeId ? entry : i));
            setEditingIncomeId(null);
        } else {
            entry = {
                ...newIncome,
                id: Date.now(),
                date: newIncome.date || defaultDate,
                time: newIncome.time || defaultTime,
                amount: parseFloat(newIncome.amount) || 0
            };
            adjustWalletBalance(entry.walletId, entry.amount, true);
            setIncomeSources(prev => [...prev, entry]);
        }
        setNewIncome(BLANK_INCOME);

        try {
            const data = { 
                type: 'income', 
                title: entry.name, 
                name: entry.name,
                description: entry.description || '',
                category: entry.category || mapCategory(entry.name), 
                amount: entry.amount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.walletId || entry.schedule || 'Monthly', 
                status: 'Completed'
            };
            if (entry.transactionId) {
                await transactionsService.updateTransaction(entry.transactionId, data);
            } else {
                const res = await transactionsService.createTransaction(data);
                const txId = res?.id || res?.data?.id;
                entry.transactionId = txId;
                setIncomeSources(prev => prev.map(i => i.id === entry.id ? { ...i, transactionId: txId } : i));
            }
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
        } catch (err) { console.error(err); }
    };

    const handleDeleteIncomeSource = async (id) => {
        const entry = incomeSources.find(i => i.id === id);
        if (entry) {
            handleUpdateWalletOnDelete(entry.walletId, entry.amount, true);
            if (entry.transactionId) {
                try {
                    await transactionsService.deleteTransaction(entry.transactionId);
                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                    queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
                } catch (err) { console.error(err); }
            }
        }
        setIncomeSources(prev => prev.filter(i => i.id !== id));
    };

    const handleEditIncomeSource = (i) => {
        setNewIncome({
            ...BLANK_INCOME,
            ...i
        });
        setEditingIncomeId(i.id);
        setShowIncomeForm(true);
    };

    const handleSaveExpense = async (ev) => {
        ev.preventDefault();
        if (!expense.name.trim() || !expense.amount) return;
        let entry;
        const now = new Date();
        const defaultDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (editingId) {
            const oldEntry = expenses.find(e => e.id === editingId);
            entry = { 
                ...oldEntry, 
                ...expense, 
                amount: parseFloat(expense.amount) || 0
            };
            handleUpdateWalletOnEdit(oldEntry.walletId, oldEntry.amount, entry.walletId, entry.amount, false);
            setExpenses(prev => prev.map(e => e.id === editingId ? entry : e));
            setEditingId(null);
        } else {
            entry = { 
                ...expense, 
                id: Date.now(), 
                date: expense.date || defaultDate, 
                time: expense.time || defaultTime, 
                amount: parseFloat(expense.amount) || 0
            };
            adjustWalletBalance(entry.walletId, entry.amount, false);
            setExpenses(prev => [entry, ...prev]);
        }
        setExpense(BLANK_EXPENSE);

        try {
            const data = { 
                type: 'expense', 
                title: entry.name, 
                name: entry.name,
                description: entry.description || '',
                category: entry.category || mapCategory(entry.name), 
                amount: entry.amount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.walletId || entry.schedule || 'Monthly', 
                status: 'Completed'
            };
            if (entry.transactionId) {
                await transactionsService.updateTransaction(entry.transactionId, data);
            } else {
                const res = await transactionsService.createTransaction(data);
                const txId = res?.id || res?.data?.id;
                entry.transactionId = txId;
                setExpenses(prev => prev.map(e => e.id === entry.id ? { ...e, transactionId: txId } : e));
            }
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
        } catch (err) { console.error(err); }
    };

    const handleDeleteExpense = async (id) => {
        const entry = expenses.find(e => e.id === id);
        if (entry) {
            handleUpdateWalletOnDelete(entry.walletId, entry.amount, false);
            if (entry.transactionId) {
                try {
                    await transactionsService.deleteTransaction(entry.transactionId);
                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                    queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
                } catch (err) { console.error(err); }
            }
        }
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const handleEditExpense = (e) => {
        setExpense({
            ...BLANK_EXPENSE,
            ...e
        });
        setEditingId(e.id);
        setShowExpenseForm(true);
    };

    const handleAddAddIncomeSource = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newAdditionalIncome.name.trim() || !newAdditionalIncome.amount) return;
        let entry;
        const now = new Date();
        const defaultDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (editingAdditionalIncomeId) {
            const oldEntry = additionalIncomeSources.find(i => i.id === editingAdditionalIncomeId);
            entry = {
                ...oldEntry,
                ...newAdditionalIncome,
                amount: parseFloat(newAdditionalIncome.amount) || 0
            };
            handleUpdateWalletOnEdit(oldEntry.walletId, oldEntry.amount, entry.walletId, entry.amount, true);
            setAdditionalIncomeSources(prev => prev.map(i => i.id === editingAdditionalIncomeId ? entry : i));
            setEditingAdditionalIncomeId(null);
        } else {
            entry = {
                ...newAdditionalIncome,
                id: Date.now(),
                date: newAdditionalIncome.date || defaultDate,
                time: newAdditionalIncome.time || defaultTime,
                amount: parseFloat(newAdditionalIncome.amount) || 0
            };
            adjustWalletBalance(entry.walletId, entry.amount, true);
            setAdditionalIncomeSources(prev => [...prev, entry]);
        }
        setNewAdditionalIncome(BLANK_INCOME);

        try {
            const data = { 
                type: 'income', 
                title: `[Add] ${entry.name}`, 
                name: `[Add] ${entry.name}`, 
                description: entry.description || '',
                category: entry.category || mapCategory(entry.name), 
                amount: entry.amount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.walletId || entry.schedule || 'Monthly', 
                status: 'Completed'
            };
            if (entry.transactionId) {
                await transactionsService.updateTransaction(entry.transactionId, data);
            } else {
                const res = await transactionsService.createTransaction(data);
                const txId = res?.id || res?.data?.id;
                entry.transactionId = txId;
                setAdditionalIncomeSources(prev => prev.map(i => i.id === entry.id ? { ...i, transactionId: txId } : i));
            }
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
        } catch (err) { console.error(err); }
    };

    const handleDeleteAddIncomeSource = async (id) => {
        const entry = additionalIncomeSources.find(i => i.id === id);
        if (entry) {
            handleUpdateWalletOnDelete(entry.walletId, entry.amount, true);
            if (entry.transactionId) {
                try {
                    await transactionsService.deleteTransaction(entry.transactionId);
                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                    queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
                } catch (err) { console.error(err); }
            }
        }
        setAdditionalIncomeSources(prev => prev.filter(i => i.id !== id));
    };

    const handleEditAddIncomeSource = (i) => {
        setNewAdditionalIncome({
            ...BLANK_INCOME,
            ...i
        });
        setEditingAdditionalIncomeId(i.id);
        setShowAddIncomeForm(true);
    };

    const handleSaveAddExpense = async (ev) => {
        ev.preventDefault();
        if (!additionalExpense.name.trim() || !additionalExpense.amount) return;
        let entry;
        const now = new Date();
        const defaultDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (editingAdditionalId) {
            const oldEntry = additionalExpenses.find(e => e.id === editingAdditionalId);
            entry = { 
                ...oldEntry, 
                ...additionalExpense, 
                amount: parseFloat(additionalExpense.amount) || 0
            };
            handleUpdateWalletOnEdit(oldEntry.walletId, oldEntry.amount, entry.walletId, entry.amount, false);
            setAdditionalExpenses(prev => prev.map(e => e.id === editingAdditionalId ? entry : e));
            setEditingAdditionalId(null);
        } else {
            entry = { 
                ...additionalExpense, 
                id: Date.now(), 
                date: additionalExpense.date || defaultDate, 
                time: additionalExpense.time || defaultTime, 
                amount: parseFloat(additionalExpense.amount) || 0
            };
            adjustWalletBalance(entry.walletId, entry.amount, false);
            setAdditionalExpenses(prev => [entry, ...prev]);
        }
        setAdditionalExpense(BLANK_EXPENSE);

        try {
            const data = { 
                type: 'expense', 
                title: `[Add] ${entry.name}`, 
                name: `[Add] ${entry.name}`, 
                description: entry.description || '',
                category: entry.category || mapCategory(entry.name), 
                amount: entry.amount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.walletId || entry.schedule || 'Monthly', 
                status: 'Completed'
            };
            if (entry.transactionId) {
                await transactionsService.updateTransaction(entry.transactionId, data);
            } else {
                const res = await transactionsService.createTransaction(data);
                const txId = res?.id || res?.data?.id;
                entry.transactionId = txId;
                setAdditionalExpenses(prev => prev.map(e => e.id === entry.id ? { ...e, transactionId: txId } : e));
            }
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
        } catch (err) { console.error(err); }
    };

    const handleDeleteAddExpense = async (id) => {
        const entry = additionalExpenses.find(e => e.id === id);
        if (entry) {
            handleUpdateWalletOnDelete(entry.walletId, entry.amount, false);
            if (entry.transactionId) {
                try {
                    await transactionsService.deleteTransaction(entry.transactionId);
                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                    queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
                } catch (err) { console.error(err); }
            }
        }
        setAdditionalExpenses(prev => prev.filter(e => e.id !== id));
    };

    const handleEditAddExpense = (e) => {
        setAdditionalExpense({
            ...BLANK_EXPENSE,
            ...e
        });
        setEditingAdditionalId(e.id);
        setShowAddExpenseForm(true);
    };

    const handleSaveAddDetails = async () => {
        try {
            await Promise.all(additionalIncomeSources.map(async (s) => {
                const data = { 
                    type: 'Income', 
                    title: `[Add] ${s.name}`, 
                    name: `[Add] ${s.name}`, 
                    description: s.description || '',
                    category: mapCategory(s.name), 
                    amount: s.amount, 
                    date: formatAPIDate(s.date), 
                    time: s.time || '',
                    schedule: s.schedule || 'Monthly',
                    notes: s.schedule || 'Monthly',
                    status: 'Completed' 
                };
                if (s.transactionId) await transactionsService.updateTransaction(s.transactionId, data);
                else {
                    const res = await transactionsService.createTransaction(data);
                    s.transactionId = res?.id || res?.data?.id;
                }
            }));
            setSaved(true); setTimeout(() => setSaved(false), 2000);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance-dashboard-enhanced'] });
        } catch (err) { alert(err.message); }
    };

    const handleSaveToPDF = () => window.print();

    const ColumnFilterDropdown = ({ type, column, label, filterState, setFilterState }) => {
        const isActive = activeFilter.type === type && activeFilter.column === column;
        const currentFilter = filterState[column];
        const handleSort = (dir) => { setFilterState(prev => ({ ...prev, [column]: { ...prev[column], sort: dir } })); setActiveFilter({ type: null, column: null }); };
        const handleSearch = (val) => { setFilterState(prev => ({ ...prev, [column]: { ...prev[column], search: val } })); };
        const clearFilter = () => { setFilterState(prev => ({ ...prev, [column]: { search: '', sort: '' } })); setActiveFilter({ type: null, column: null }); };

        return (
            <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }} className="no-print">
                <button onClick={(e) => { e.stopPropagation(); setActiveFilter(isActive ? { type: null, column: null } : { type, column }); }} style={{ background: currentFilter.search || currentFilter.sort ? '#F0FDF4' : 'transparent', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', color: currentFilter.search || currentFilter.sort ? '#1B6B3A' : '#94A3B8' }}>
                    <ArrowUpDown size={12} />
                </button>
                {isActive && (
                    <div ref={filterDropdownRef} style={{ position: 'absolute', top: '100%', left: column === 'amount' ? 'auto' : 0, right: column === 'amount' ? 0 : 'auto', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, padding: '12px', minWidth: '200px', marginTop: '8px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Filter {label}</div>
                        <input type="text" placeholder={`Search ${label}...`} value={currentFilter.search} onChange={(e) => handleSearch(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem', outline: 'none', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button onClick={() => handleSort('asc')} className="column-filter-option"><SortAsc size={14} /> Sort Asc</button>
                            <button onClick={() => handleSort('desc')} className="column-filter-option"><SortDesc size={14} /> Sort Desc</button>
                            <button onClick={clearFilter} style={{ marginTop: '6px', borderTop: '1px solid #F1F5F9', color: '#EF4444' }} className="column-filter-option"><X size={14} /> Clear</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                body:not([data-theme='dark']), 
                .app-root:not([data-theme='dark']), 
                .app-body:not([data-theme='dark']), 
                .main-content-area:not([data-theme='dark']), 
                .content-scrollable:not([data-theme='dark']) {
                    background-color: #ffffff !important;
                }
                .finance-premium-container { display: flex; gap: 2rem; }
                .finance-panel-left, .finance-panel-right {
                    width: 450px;
                    border: 1px solid #E2E8F0;
                    border-radius: 16px;
                    background: #fff;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    height: 380px;
                    box-sizing: border-box;
                }
                .finance-table-wrapper {
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    overflow-y: auto;
                    flex: 1;
                }
                .finance-table-wrapper th {
                    position: sticky;
                    top: 0;
                    background: #F8FAFC;
                    z-index: 10;
                    box-shadow: inset 0 -1px 0 #E2E8F0;
                }
                .search-filter-container { display: flex; align-items: center; gap: 0.5rem; position: absolute; right: 1.5rem; top: 1.5rem; }
                .compact-search-input { padding: 0.4rem 0.75rem 0.4rem 2rem; border-radius: 999px; border: 1px solid #E2E8F0; font-size: 0.75rem; outline: none; width: 140px; }
                .column-filter-option { width: 100%; padding: 6px 8px; font-size: 0.75rem; font-weight: 600; color: #475569; text-align: left; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; border-radius: 6px; }
                .column-filter-option:hover { background: #F0FDF4; color: #1B6B3A; }
                @media print {
                    .no-print { display: none !important; }
                    .finance-panel-left, .finance-panel-right {
                        height: auto !important;
                        overflow: visible !important;
                    }
                    .finance-table-wrapper {
                        overflow: visible !important;
                        max-height: none !important;
                    }
                }
            `}</style>

            {/* ONBOARDING OVERLAY */}
            <AnimatePresence>
                {showOnboarding && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: '90%', maxWidth: '480px', background: '#fff', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '20px', background: '#F0FDF4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Briefcase size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Personalize Your Experience</h2>
                            <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>To provide you with the most relevant tools, what is your primary source of income?</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { label: 'Salaried Employee', icon: Briefcase },
                                    { label: 'Rental Income', icon: Home },
                                    { label: 'Pension Income', icon: Heart },
                                    { label: 'Business Owner', icon: TrendingUp },
                                    { label: 'Freelancer', icon: Pencil },
                                    { label: 'Multiple Sources', icon: Plus },
                                ].map(opt => (
                                    <button
                                        key={opt.label}
                                        onClick={() => {
                                            incomeSourceMutation.mutate(opt.label);
                                            setShowOnboarding(false);
                                        }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#1B6B3A'; e.currentTarget.style.background = '#F0FDF4'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#f8fafc'; }}
                                    >
                                        <opt.icon size={20} color="#1B6B3A" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowOnboarding(false)} style={{ color: '#94A3B8', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Skip for now</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg,#1B6B3A 0%,#064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IndianRupee size={20} /></div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Finance</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>Track your income, fixed costs, and daily spending in one place.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <button style={{ width: 42, height: 42, borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}>
                            <Bell size={20} />
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                                    {notifications.filter(n => !n.is_read).length}
                                </span>
                            )}
                        </button>
                    </div>
                    <button onClick={() => navigate('/books/tax-deductions')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                        <ShieldCheck size={18} /> Tax &amp; Deductions
                    </button>
                </div>
            </div>

            <>
                    {/* Primary Dashboard Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Total Income', value: monthlyIncome, color: '#059669', bg: '#ECFDF5' },
                            { label: 'Total Expenses', value: fixedExpenses + dailyExpenses, color: '#D97706', bg: '#FFFBEB' },
                            { label: 'Monthly Savings', value: remaining, color: remaining >= 0 ? '#7C3AED' : '#EF4444', bg: remaining >= 0 ? '#F5F3FF' : '#FEF2F2' },
                            { label: 'Net Worth', value: dashboardData?.netWorth || 0, color: '#0F172A', bg: '#F8FAFC', isNetWorth: true },
                        ].map(item => (
                            <div key={item.label} style={{ background: item.bg, borderRadius: '14px', padding: '1.1rem 1.25rem', border: `1px solid ${item.color}22` }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>{item.label}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: item.color }}>
                                    {currencySymbol}{item.value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Secondary Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#EEF2FF', borderRadius: '18px', padding: '1.25rem', border: '1px solid #4F46E522' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5' }}>INVESTMENT PORTFOLIO</span>
                                <ArrowUpRight size={16} color="#4F46E5" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E293B' }}>{currencySymbol}{(dashboardData?.investmentStats?.total || 0).toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>+{dashboardData?.investmentStats?.returnPct?.toFixed(1)}% All-time</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Monthly P/L</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>+{currencySymbol}{(dashboardData?.investmentStats?.profit / 12 || 0).toLocaleString('en-IN')}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#FEF2F2', borderRadius: '18px', padding: '1.25rem', border: '1px solid #EF444422' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B91C1C' }}>ESTIMATED TAX DUE</span>
                                <ShieldCheck size={16} color="#B91C1C" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E293B' }}>{currencySymbol}{(dashboardData?.taxSummary?.remaining || 0).toLocaleString('en-IN')}</div>
                                    <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700 }}>Due by July 31st</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>TDS Paid</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>{currencySymbol}{(dashboardData?.taxSummary?.paid || 0).toLocaleString('en-IN')}</div>
                                </div>
                            </div>
                        </div>
                    </div>



            {/* NEW SECTIONS: WALLET AND BUDGET */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <MyWallet
                    wallets={wallets}
                    onUpdateBalance={handleUpdateBalance}
                    currencySymbol={currencySymbol}
                />
                <BudgetPlanner
                    budget={budget}
                    onUpdateBudget={handleUpdateBudget}
                    currentSpent={currentMonthExpenses}
                    currencySymbol={currencySymbol}
                />
            </div>


            {/* SECTION: ADDITIONAL SOURCE */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 54, height: 54, borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}><Briefcase size={28} /></div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#064E3B', margin: 0 }}>Additional Source</h2>
                    <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: '0.2rem 0 0 0' }}>Manage your additional income sources and additional expenses here.</p>
                </div>
            </div>

            <div className="finance-premium-container" style={{ marginBottom: '4rem' }}>
                {/* Income panel */}
                <div className="finance-panel-left">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Additional Source</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDITIONAL INCOME</h3>
                        </div>

                        <div style={{ position: 'relative', width: '130px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={addIncomeSearch}
                                onChange={(e) => setAddIncomeSearch(e.target.value)}
                                placeholder="Search income..."
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                                    borderRadius: '999px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    background: '#fff',
                                }}
                            />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => {
                                    setShowAddIncomeForm(true);
                                    setEditingAdditionalIncomeId(null);
                                    setNewAdditionalIncome(BLANK_INCOME);
                                }}
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {showAddIncomeForm && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                            <div style={{ width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                                <button onClick={() => { setShowAddIncomeForm(false); setEditingAdditionalIncomeId(null); setNewAdditionalIncome(BLANK_INCOME); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>{editingAdditionalIncomeId ? 'Edit Additional Income' : 'Add Additional Income'}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>Enter the details of your additional income source below.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={lbl}>Income Name</label>
                                        <input type="text" style={inp} placeholder="e.g. Freelance project" value={newAdditionalIncome.name} onChange={e => setNewAdditionalIncome(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Description</label>
                                        <input type="text" style={inp} placeholder="Optional details..." value={newAdditionalIncome.description} onChange={e => setNewAdditionalIncome(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Date</label>
                                            <input type="date" style={inp} value={newAdditionalIncome.date} onChange={e => setNewAdditionalIncome(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={lbl}>Time</label>
                                            <input type="time" style={inp} value={newAdditionalIncome.time} onChange={e => setNewAdditionalIncome(p => ({ ...p, time: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Category</label>
                                            <select style={inp} value={newAdditionalIncome.category || 'Other'} onChange={e => setNewAdditionalIncome(p => ({ ...p, category: e.target.value }))}>
                                                {['Freelance', 'Interest', 'Stocks', 'Mutual Funds', 'Cashback', 'Bonus', 'Referral Earnings', 'Other'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={lbl}>Associated Wallet</label>
                                            <select style={inp} value={newAdditionalIncome.walletId || ''} onChange={e => setNewAdditionalIncome(p => ({ ...p, walletId: e.target.value }))}>
                                                <option value="">No Wallet</option>
                                                {wallets.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name} ({currencySymbol}{w.balance.toLocaleString('en-IN')})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={lbl}>Amount ({currencySymbol})</label>
                                        <input type="number" style={inp} placeholder="0.00" value={newAdditionalIncome.amount} onChange={e => setNewAdditionalIncome(p => ({ ...p, amount: e.target.value }))} />
                                    </div>
                                </div>

                                    <button onClick={(e) => { handleAddAddIncomeSource(e); setShowAddIncomeForm(false); }} style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                                        {editingAdditionalIncomeId ? 'Update Income' : 'Save Income'}
                                    </button>
                            </div>
                        </div>
                    )}

                    <div className="finance-table-wrapper">
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            NAME <ColumnFilterDropdown type="addIncome" column="name" label="Name" filterState={addIncomeFilters} setFilterState={setAddIncomeFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            DESCRIPTION <ColumnFilterDropdown type="addIncome" column="description" label="Description" filterState={addIncomeFilters} setFilterState={setAddIncomeFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>DATE</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>TIME</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>AMOUNT</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdditionalIncome.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No income sources added yet</td></tr>
                                ) : (
                                    filteredAdditionalIncome.map(i => (
                                        <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#10B981', textAlign: 'center' }}>{i.name}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748B', textAlign: 'center' }}>{i.description || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{i.date}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{i.time || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, textAlign: 'center' }}>{currencySymbol}{parseFloat(i.amount).toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                    <button onClick={() => handleEditAddIncomeSource(i)} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#2563EB' }}>
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteAddIncomeSource(i.id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#EF4444' }}>
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
                {/* Expense panel */}
                <div className="finance-panel-right">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Additional Source</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDITIONAL EXPENSE</h3>
                        </div>

                        <div style={{ position: 'relative', width: '130px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={addExpenseSearch}
                                onChange={(e) => setAddExpenseSearch(e.target.value)}
                                placeholder="Search additional expenses..."
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                                    borderRadius: '999px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    background: '#fff',
                                }}
                            />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button
                                title="Add Additional Expense"
                                onClick={() => {
                                    setShowAddExpenseForm(true);
                                    setEditingAdditionalId(null);
                                    setAdditionalExpense(BLANK_EXPENSE);
                                }}
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {showAddExpenseForm && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                            <div style={{ width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                                <button onClick={() => { setShowAddExpenseForm(false); setEditingAdditionalId(null); setAdditionalExpense(BLANK_EXPENSE); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>{editingAdditionalId ? 'Edit Additional Expense' : 'Add Additional Expense'}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>Enter the details of your additional expense below.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={lbl}>Expense Name</label>
                                        <input type="text" style={inp} placeholder="e.g. Office supplies" value={additionalExpense.name} onChange={e => setAdditionalExpense(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Description</label>
                                        <input type="text" style={inp} placeholder="Optional details..." value={additionalExpense.description} onChange={e => setAdditionalExpense(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Date</label>
                                            <input type="date" style={inp} value={additionalExpense.date} onChange={e => setAdditionalExpense(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={lbl}>Time</label>
                                            <input type="time" style={inp} value={additionalExpense.time} onChange={e => setAdditionalExpense(p => ({ ...p, time: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Category</label>
                                            <select style={inp} value={additionalExpense.category || 'Other'} onChange={e => setAdditionalExpense(p => ({ ...p, category: e.target.value }))}>
                                                {['Emergency', 'Medical', 'Office Supplies', 'Maintenance', 'Unexpected Expenses', 'Other'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={lbl}>Associated Wallet</label>
                                            <select style={inp} value={additionalExpense.walletId || ''} onChange={e => setAdditionalExpense(p => ({ ...p, walletId: e.target.value }))}>
                                                <option value="">No Wallet</option>
                                                {wallets.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name} ({currencySymbol}{w.balance.toLocaleString('en-IN')})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={lbl}>Amount ({currencySymbol})</label>
                                        <input type="number" style={inp} placeholder="0.00" value={additionalExpense.amount} onChange={e => setAdditionalExpense(p => ({ ...p, amount: e.target.value }))} />
                                    </div>
                                </div>

                                    <button onClick={(e) => { handleSaveAddExpense(e); setShowAddExpenseForm(false); }} style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                                        {editingAdditionalId ? 'Update Expense' : 'Save Expense'}
                                    </button>
                            </div>
                        </div>
                    )}

                    <div className="finance-table-wrapper">
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            NAME <ColumnFilterDropdown type="addExpense" column="name" label="Name" filterState={addExpenseFilters} setFilterState={setAddExpenseFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            DESCRIPTION <ColumnFilterDropdown type="addExpense" column="description" label="Description" filterState={addExpenseFilters} setFilterState={setAddExpenseFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>DATE</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>TIME</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>AMOUNT</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdditionalExpenses.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No additional expenses added yet.</td></tr>
                                ) : (
                                    filteredAdditionalExpenses.map(e => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#EF4444', textAlign: 'center' }}>{e.name}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748B', textAlign: 'center' }}>{e.description || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{e.date}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{e.time || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, textAlign: 'center' }}>{currencySymbol}{parseFloat(e.amount).toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                    <button onClick={() => handleEditAddExpense(e)} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#2563EB' }}>
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteAddExpense(e.id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#EF4444' }}>
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

            {/* BILLS & REMINDERS SECTION */}
            <div style={{ marginBottom: '2.5rem' }}>
                <BillsReminders 
                    bills={bills} 
                    onUpdateBills={handleUpdateBills} 
                    currencySymbol={currencySymbol}
                />
            </div>

            {/* SECTION: FIXED SOURCE */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 54, height: 54, borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}><Briefcase size={28} /></div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#064E3B', margin: 0 }}>Fixed Source</h2>
                    <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: '0.2rem 0 0 0' }}>Manage your income sources and daily expenses here.</p>
                </div>
            </div>

            <div className="finance-premium-container">
                {/* Income panel */}
                <div className="finance-panel-left">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Fixed Source</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>FIXED INCOME</h3>
                        </div>

                        <div style={{ position: 'relative', width: '130px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={incomeSearch}
                                onChange={(e) => setIncomeSearch(e.target.value)}
                                placeholder="Search income..."
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                                    borderRadius: '999px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    background: '#fff',
                                }}
                            />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => {
                                    setShowIncomeForm(true);
                                    setEditingIncomeId(null);
                                    setNewIncome(BLANK_INCOME);
                                }}
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {showIncomeForm && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                            <div style={{ width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                                <button onClick={() => { setShowIncomeForm(false); setEditingIncomeId(null); setNewIncome(BLANK_INCOME); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>

                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>{editingIncomeId ? 'Edit Income Source' : 'Add Income Source'}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>Enter the details of your income source below.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={lbl}>Income Name</label>
                                        <input type="text" style={inp} placeholder="e.g. Monthly Salary" value={newIncome.name} onChange={e => setNewIncome(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Description</label>
                                        <input type="text" style={inp} placeholder="Optional details..." value={newIncome.description} onChange={e => setNewIncome(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Amount ({currencySymbol})</label>
                                            <input type="number" style={inp} placeholder="0.00" value={newIncome.amount} onChange={e => setNewIncome(p => ({ ...p, amount: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={lbl}>Schedule</label>
                                            <select style={inp} value={newIncome.schedule} onChange={e => setNewIncome(p => ({ ...p, schedule: e.target.value }))}>
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Category</label>
                                            <select style={inp} value={newIncome.category || 'Other'} onChange={e => setNewIncome(p => ({ ...p, category: e.target.value }))}>
                                                {['Salary', 'Business', 'Freelance', 'Investment', 'Rental', 'Bonus', 'Scholarship', 'Other'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={lbl}>Associated Wallet</label>
                                            <select style={inp} value={newIncome.walletId || ''} onChange={e => setNewIncome(p => ({ ...p, walletId: e.target.value }))}>
                                                <option value="">No Wallet</option>
                                                {wallets.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name} ({currencySymbol}{w.balance.toLocaleString('en-IN')})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Date</label>
                                            <input type="date" style={inp} value={newIncome.date} onChange={e => setNewIncome(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={lbl}>Time</label>
                                            <input type="time" style={inp} value={newIncome.time} onChange={e => setNewIncome(p => ({ ...p, time: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                    <button
                                        onClick={async (e) => {
                                            await handleAddIncomeSource(e);
                                            setShowIncomeForm(false);
                                        }}
                                        style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}
                                    >
                                        {editingIncomeId ? 'Update Income' : 'Save Income'}
                                    </button>
                            </div>
                        </div>
                    )}
                    <div className="finance-table-wrapper">
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            Name <ColumnFilterDropdown type="income" column="name" label="Name" filterState={incomeFilters} setFilterState={setIncomeFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            Description <ColumnFilterDropdown type="income" column="description" label="Description" filterState={incomeFilters} setFilterState={setIncomeFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            Date <ColumnFilterDropdown type="income" column="date" label="Date" filterState={incomeFilters} setFilterState={setIncomeFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Time</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>Schedule</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            Amount <ColumnFilterDropdown type="income" column="amount" label="Amount" filterState={incomeFilters} setFilterState={setIncomeFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncome.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No income sources added yet</td></tr>
                                ) : (
                                    filteredIncome.map(i => (
                                        <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#10B981', textAlign: 'center' }}>{i.name}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748B', textAlign: 'center' }}>{i.description || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500, textAlign: 'center' }}>{i.date || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500, textAlign: 'center' }}>{i.time || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748B', textAlign: 'center' }}>{i.schedule || 'Monthly'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: '#10B981', textAlign: 'center' }}>{currencySymbol}{(parseFloat(i.amount) || 0).toLocaleString('en-IN')}</td>
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
                {/* Expense panel */}
                <div className="finance-panel-right">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Additional Source</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDITIONAL EXPENSE</h3>
                        </div>

                        <div style={{ position: 'relative', width: '130px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={expenseSearch}
                                onChange={(e) => setExpenseSearch(e.target.value)}
                                placeholder="Search expense..."
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                                    borderRadius: '999px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    background: '#fff',
                                }}
                            />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => {
                                    setShowExpenseForm(true);
                                    setEditingId(null);
                                    setExpense(BLANK_EXPENSE);
                                }}
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {showExpenseForm && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                            <div style={{ width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                                <button onClick={() => { setShowExpenseForm(false); setEditingId(null); setExpense(BLANK_EXPENSE); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>{editingId ? 'Edit Expense Source' : 'Add Expense Source'}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>Enter the details of your expense source below.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={lbl}>Expense Name</label>
                                        <input type="text" style={inp} placeholder="e.g. Rent" value={expense.name} onChange={e => setExpense(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Description</label>
                                        <input type="text" style={inp} placeholder="Optional details..." value={expense.description} onChange={e => setExpense(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Amount ({currencySymbol})</label>
                                            <input type="number" style={inp} placeholder="0.00" value={expense.amount} onChange={e => setExpense(p => ({ ...p, amount: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={lbl}>Schedule</label>
                                            <select style={inp} value={expense.schedule} onChange={e => setExpense(p => ({ ...p, schedule: e.target.value }))}>
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Category</label>
                                            <select style={inp} value={expense.category || 'Other'} onChange={e => setExpense(p => ({ ...p, category: e.target.value }))}>
                                                {['Food', 'Travel', 'Shopping', 'Rent', 'Education', 'Medical', 'Entertainment', 'Fuel', 'Bills', 'Other'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={lbl}>Associated Wallet</label>
                                            <select style={inp} value={expense.walletId || ''} onChange={e => setExpense(p => ({ ...p, walletId: e.target.value }))}>
                                                <option value="">No Wallet</option>
                                                {wallets.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name} ({currencySymbol}{w.balance.toLocaleString('en-IN')})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={lbl}>Date</label>
                                            <input type="date" style={inp} value={expense.date} onChange={e => setExpense(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={lbl}>Time</label>
                                            <input type="time" style={inp} value={expense.time} onChange={e => setExpense(p => ({ ...p, time: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                    <button onClick={async (e) => { await handleSaveExpense(e); setShowExpenseForm(false); }} style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                                        {editingId ? 'Update Expense' : 'Save Expense'}
                                    </button>
                            </div>
                        </div>
                    )}

                    <div className="finance-table-wrapper">
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            NAME <ColumnFilterDropdown type="expense" column="name" label="Name" filterState={expenseFilters} setFilterState={setExpenseFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            DESCRIPTION <ColumnFilterDropdown type="expense" column="description" label="Description" filterState={expenseFilters} setFilterState={setExpenseFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            DATE <ColumnFilterDropdown type="expense" column="date" label="Date" filterState={expenseFilters} setFilterState={setExpenseFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>TIME</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>SCHEDULE</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            AMOUNT <ColumnFilterDropdown type="expense" column="amount" label="Amount" filterState={expenseFilters} setFilterState={setExpenseFilters} />
                                        </div>
                                    </th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No expenses added yet</td></tr>
                                ) : (
                                    filteredExpenses.map(e => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#EF4444', textAlign: 'center' }}>{e.name}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748B', textAlign: 'center' }}>{e.description || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500, textAlign: 'center' }}>{e.date || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#1E293B', fontWeight: 500, textAlign: 'center' }}>{e.time || '—'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748B', textAlign: 'center' }}>{e.schedule || 'Monthly'}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: '#EF4444', textAlign: 'center' }}>{currencySymbol}{(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</td>
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

            {/* INCOME MANAGERS SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '4rem' }}>
                {dashboardData?.primaryIncomeSource === 'Salaried Employee' && (
                    <SalaryManager
                        records={salaryRecords}
                        onAddRecord={data => salaryMutation.mutate(data)}
                        wallets={wallets}
                        currencySymbol={currencySymbol}
                    />
                )}
                {dashboardData?.primaryIncomeSource === 'Rental Income' && (
                    <PropertyManager
                        properties={properties}
                        onAddProperty={data => propertyMutation.mutate(data)}
                        onRecordRent={(id, amount) => rentMutation.mutate({ id, amount })}
                        wallets={wallets}
                        currencySymbol={currencySymbol}
                    />
                )}
                {dashboardData?.primaryIncomeSource === 'Pension Income' && (
                    <PensionManager
                        records={pensionRecords}
                        onAddPension={data => pensionMutation.mutate(data)}
                        wallets={wallets}
                        currencySymbol={currencySymbol}
                    />
                )}
            </div>

            {/* INVESTMENT PORTFOLIO SECTION */}
            <div style={{ marginBottom: '4rem' }}>
                <InvestmentPortfolio
                    investments={dashboardData?.investmentStats?.list || []}
                    onAddInvestment={data => investmentCreateMutation.mutate(data)}
                    onDeleteInvestment={id => investmentDeleteMutation.mutate(id)}
                    currencySymbol={currencySymbol}
                />
            </div>

            </>
        </div>
    );
};

export default FinancePage;
