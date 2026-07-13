import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DollarSign, ShoppingCart, Save, Trash2, Pencil, FileText, Briefcase, Plus, Search, Filter, X, ArrowUpDown, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { useAuth } from '../../context';
import { transactionsService } from '../../services';
import { useQueryClient, useQuery } from '@tanstack/react-query';

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
    gstApplicable: false,
    gstType: 'CGST + SGST',
    gstRate: '18',
    customGstRate: '0',
    invoiceNumber: '',
    gstNumber: '',
    customerVendorName: '',
    gstAmount: 0,
    totalAmount: 0
};
const BLANK_EXPENSE = { 
    name: '', 
    description: '', 
    date: '', 
    time: '', 
    schedule: 'Monthly', 
    amount: '',
    gstApplicable: false,
    gstType: 'CGST + SGST',
    gstRate: '18',
    customGstRate: '0',
    invoiceNumber: '',
    gstNumber: '',
    customerVendorName: '',
    gstAmount: 0,
    totalAmount: 0
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
    const uid = user?.id ?? user?.email ?? 'guest';

    // Transactions query (shared source of truth with Payments module)
    const { data: dbTransactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionsService.getTransactions(),
        enabled: !!uid && uid !== 'guest',
    });

    const [isSynced, setIsSynced] = useState(false);

    // Data states
    const [incomeSources, setIncomeSources] = useState(() => {
        try { return JSON.parse(localStorage.getItem(incomeKey(uid))) || []; }
        catch { return []; }
    });
    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem(expensesKey(uid))) || []; }
        catch { return []; }
    });
    const [additionalIncomeSources, setAdditionalIncomeSources] = useState(() => {
        try { return JSON.parse(localStorage.getItem(additionalIncomeKey(uid))) || []; }
        catch { return []; }
    });
    const [additionalExpenses, setAdditionalExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem(additionalExpensesKey(uid))) || []; }
        catch { return []; }
    });

    // GST Navigation and Settings States
    const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'gst'
    const [activeGstTab, setActiveGstTab] = useState('dashboard'); // 'dashboard' | 'sales' | 'purchase' | 'reports' | 'settings'
    const [gstReportType, setGstReportType] = useState('monthly'); // 'monthly' | 'quarterly' | 'yearly' | 'sales_register' | 'purchase_register' | 'gst_summary'
    const [gstSettings, setGstSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(`cliks_gst_settings_${uid}`);
            return saved ? JSON.parse(saved) : {
                businessName: '',
                businessGstNumber: '',
                state: '',
                country: '',
                defaultGstRate: '18',
                invoicePrefix: 'INV-',
                invoiceStartingNumber: '1001',
                taxCalculationMethod: 'Exclusive',
                currency: 'INR'
            };
        } catch {
            return {
                businessName: '',
                businessGstNumber: '',
                state: '',
                country: '',
                defaultGstRate: '18',
                invoicePrefix: 'INV-',
                invoiceStartingNumber: '1001',
                taxCalculationMethod: 'Exclusive',
                currency: 'INR'
            };
        }
    });

    // Helper to calculate GST Amount and Grand Total based on current settings
    const calculateGstDetails = (amountVal, isGst, rateStr, customRateStr, method) => {
        const amount = parseFloat(amountVal) || 0;
        if (!isGst) {
            return { gstAmount: 0, totalAmount: amount };
        }
        
        let rate = 18;
        if (rateStr === 'custom' || rateStr === 'Custom') {
            rate = parseFloat(customRateStr) || 0;
        } else {
            rate = parseFloat(rateStr) || 0;
        }

        if (method === 'Inclusive') {
            // Inclusive GST formula
            const gstAmount = amount - (amount / (1 + rate / 100));
            return {
                gstAmount: parseFloat(gstAmount.toFixed(2)),
                totalAmount: parseFloat(amount.toFixed(2))
            };
        } else {
            // Exclusive GST formula (default)
            const gstAmount = amount * (rate / 100);
            const totalAmount = amount + gstAmount;
            return {
                gstAmount: parseFloat(gstAmount.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2))
            };
        }
    };

    // Export utility for reports
    const exportCSV = (dataList, filename, headers) => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\n";
        
        dataList.forEach(row => {
            csvContent += row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sales / Purchase Register states
    const [salesSearch, setSalesSearch] = useState('');
    const [salesSortKey, setSalesSortKey] = useState('date');
    const [salesSortDirection, setSalesSortDirection] = useState('desc');
    const [salesFilterRate, setSalesFilterRate] = useState('all');
    const [salesCurrentPage, setSalesCurrentPage] = useState(1);

    const [purchaseSearch, setPurchaseSearch] = useState('');
    const [purchaseSortKey, setPurchaseSortKey] = useState('date');
    const [purchaseSortDirection, setPurchaseSortDirection] = useState('desc');
    const [purchaseFilterRate, setPurchaseFilterRate] = useState('all');
    const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1);
    
    // Selected transaction for details modal
    const [selectedGstTx, setSelectedGstTx] = useState(null);

    // Derived GST Transactions from all sources (local + db fallback)
    const gstTransactions = useMemo(() => {
        const list = [];
        
        incomeSources.forEach(x => {
            if (x.gstApplicable) {
                list.push({ ...x, categoryType: 'income' });
            }
        });
        additionalIncomeSources.forEach(x => {
            if (x.gstApplicable) {
                list.push({ ...x, categoryType: 'income' });
            }
        });
        expenses.forEach(x => {
            if (x.gstApplicable) {
                list.push({ ...x, categoryType: 'expense' });
            }
        });
        additionalExpenses.forEach(x => {
            if (x.gstApplicable) {
                list.push({ ...x, categoryType: 'expense' });
            }
        });

        const localTxIds = new Set(list.map(x => x.transactionId).filter(Boolean));
        dbTransactions.forEach(tx => {
            if (tx.gstApplicable && !localTxIds.has(tx.id)) {
                list.push({
                    id: tx.id,
                    name: tx.name || tx.title || '',
                    description: tx.description || '',
                    amount: tx.amount,
                    date: tx.date,
                    time: tx.time,
                    gstApplicable: true,
                    gstType: tx.gstType,
                    gstRate: tx.gstRate,
                    customGstRate: tx.customGstRate,
                    invoiceNumber: tx.invoiceNumber,
                    gstNumber: tx.gstNumber,
                    customerVendorName: tx.customerVendorName,
                    gstAmount: tx.gstAmount,
                    totalAmount: tx.totalAmount,
                    categoryType: (tx.type || '').toLowerCase() === 'income' ? 'income' : 'expense',
                    transactionId: tx.id
                });
            }
        });

        return list.sort((a, b) => new Date(formatAPIDate(b.date)) - new Date(formatAPIDate(a.date)));
    }, [incomeSources, expenses, additionalIncomeSources, additionalExpenses, dbTransactions]);

    const gstStats = useMemo(() => {
        let collected = 0;
        let paid = 0;
        let salesCount = 0;
        let purchaseCount = 0;
        const monthlyMap = {};

        gstTransactions.forEach(tx => {
            const amt = parseFloat(tx.gstAmount) || 0;
            const isIncome = tx.categoryType === 'income';
            
            if (isIncome) {
                collected += amt;
                salesCount++;
            } else {
                paid += amt;
                purchaseCount++;
            }

            try {
                const dateObj = new Date(formatAPIDate(tx.date));
                if (!isNaN(dateObj.getTime())) {
                    const monthKey = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                    if (!monthlyMap[monthKey]) {
                        monthlyMap[monthKey] = { month: monthKey, collected: 0, paid: 0, net: 0 };
                    }
                    if (isIncome) {
                        monthlyMap[monthKey].collected += amt;
                    } else {
                        monthlyMap[monthKey].paid += amt;
                    }
                    monthlyMap[monthKey].net = monthlyMap[monthKey].collected - monthlyMap[monthKey].paid;
                }
            } catch (e) {
                console.error(e);
            }
        });

        return {
            collected: parseFloat(collected.toFixed(2)),
            paid: parseFloat(paid.toFixed(2)),
            net: parseFloat((collected - paid).toFixed(2)),
            salesCount,
            purchaseCount,
            monthlySummary: Object.values(monthlyMap)
        };
    }, [gstTransactions]);

    const salesTransactions = useMemo(() => {
        let result = gstTransactions.filter(tx => tx.categoryType === 'income');
        
        if (salesSearch) {
            const q = salesSearch.toLowerCase();
            result = result.filter(tx => 
                (tx.invoiceNumber || '').toLowerCase().includes(q) ||
                (tx.customerVendorName || '').toLowerCase().includes(q) ||
                (tx.gstNumber || '').toLowerCase().includes(q) ||
                (tx.name || '').toLowerCase().includes(q)
            );
        }

        if (salesFilterRate !== 'all') {
            result = result.filter(tx => String(tx.gstRate) === salesFilterRate);
        }

        result.sort((a, b) => {
            let vA = a[salesSortKey];
            let vB = b[salesSortKey];

            if (salesSortKey === 'date') {
                vA = new Date(formatAPIDate(a.date));
                vB = new Date(formatAPIDate(b.date));
            } else if (salesSortKey === 'amount' || salesSortKey === 'gstAmount' || salesSortKey === 'totalAmount') {
                vA = parseFloat(vA) || 0;
                vB = parseFloat(vB) || 0;
            } else {
                vA = String(vA || '').toLowerCase();
                vB = String(vB || '').toLowerCase();
            }

            if (vA < vB) return salesSortDirection === 'asc' ? -1 : 1;
            if (vA > vB) return salesSortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [gstTransactions, salesSearch, salesFilterRate, salesSortKey, salesSortDirection]);

    const salesPageCount = Math.ceil(salesTransactions.length / 5) || 1;
    const paginatedSales = useMemo(() => {
        const start = (salesCurrentPage - 1) * 5;
        return salesTransactions.slice(start, start + 5);
    }, [salesTransactions, salesCurrentPage]);

    const purchaseTransactions = useMemo(() => {
        let result = gstTransactions.filter(tx => tx.categoryType === 'expense');
        
        if (purchaseSearch) {
            const q = purchaseSearch.toLowerCase();
            result = result.filter(tx => 
                (tx.invoiceNumber || '').toLowerCase().includes(q) ||
                (tx.customerVendorName || '').toLowerCase().includes(q) ||
                (tx.gstNumber || '').toLowerCase().includes(q) ||
                (tx.name || '').toLowerCase().includes(q)
            );
        }

        if (purchaseFilterRate !== 'all') {
            result = result.filter(tx => String(tx.gstRate) === purchaseFilterRate);
        }

        result.sort((a, b) => {
            let vA = a[purchaseSortKey];
            let vB = b[purchaseSortKey];

            if (purchaseSortKey === 'date') {
                vA = new Date(formatAPIDate(a.date));
                vB = new Date(formatAPIDate(b.date));
            } else if (purchaseSortKey === 'amount' || purchaseSortKey === 'gstAmount' || purchaseSortKey === 'totalAmount') {
                vA = parseFloat(vA) || 0;
                vB = parseFloat(vB) || 0;
            } else {
                vA = String(vA || '').toLowerCase();
                vB = String(vB || '').toLowerCase();
            }

            if (vA < vB) return purchaseSortDirection === 'asc' ? -1 : 1;
            if (vA > vB) return purchaseSortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [gstTransactions, purchaseSearch, purchaseFilterRate, purchaseSortKey, purchaseSortDirection]);

    const purchasePageCount = Math.ceil(purchaseTransactions.length / 5) || 1;
    const paginatedPurchases = useMemo(() => {
        const start = (purchaseCurrentPage - 1) * 5;
        return purchaseTransactions.slice(start, start + 5);
    }, [purchaseTransactions, purchaseCurrentPage]);

    const getNextInvoiceNumber = (isIncome) => {
        const prefix = gstSettings.invoicePrefix || (isIncome ? 'INV-' : 'BILL-');
        const startNo = parseInt(gstSettings.invoiceStartingNumber) || 1001;
        const list = gstTransactions.filter(tx => isIncome ? tx.categoryType === 'income' : tx.categoryType === 'expense');
        const count = list.length;
        return `${prefix}${startNo + count}`;
    };

    const handleIncomeFieldChange = (field, value) => {
        setNewIncome(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'amount' || field === 'gstApplicable' || field === 'gstRate' || field === 'customGstRate') {
                const { gstAmount, totalAmount } = calculateGstDetails(
                    field === 'amount' ? value : updated.amount,
                    field === 'gstApplicable' ? value : updated.gstApplicable,
                    field === 'gstRate' ? value : updated.gstRate,
                    field === 'customGstRate' ? value : updated.customGstRate,
                    gstSettings.taxCalculationMethod
                );
                updated.gstAmount = gstAmount;
                updated.totalAmount = totalAmount;
            }
            return updated;
        });
    };

    const handleExpenseFieldChange = (field, value) => {
        setExpense(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'amount' || field === 'gstApplicable' || field === 'gstRate' || field === 'customGstRate') {
                const { gstAmount, totalAmount } = calculateGstDetails(
                    field === 'amount' ? value : updated.amount,
                    field === 'gstApplicable' ? value : updated.gstApplicable,
                    field === 'gstRate' ? value : updated.gstRate,
                    field === 'customGstRate' ? value : updated.customGstRate,
                    gstSettings.taxCalculationMethod
                );
                updated.gstAmount = gstAmount;
                updated.totalAmount = totalAmount;
            }
            return updated;
        });
    };

    const handleAdditionalIncomeFieldChange = (field, value) => {
        setNewAdditionalIncome(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'amount' || field === 'gstApplicable' || field === 'gstRate' || field === 'customGstRate') {
                const { gstAmount, totalAmount } = calculateGstDetails(
                    field === 'amount' ? value : updated.amount,
                    field === 'gstApplicable' ? value : updated.gstApplicable,
                    field === 'gstRate' ? value : updated.gstRate,
                    field === 'customGstRate' ? value : updated.customGstRate,
                    gstSettings.taxCalculationMethod
                );
                updated.gstAmount = gstAmount;
                updated.totalAmount = totalAmount;
            }
            return updated;
        });
    };

    const handleAdditionalExpenseFieldChange = (field, value) => {
        setAdditionalExpense(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'amount' || field === 'gstApplicable' || field === 'gstRate' || field === 'customGstRate') {
                const { gstAmount, totalAmount } = calculateGstDetails(
                    field === 'amount' ? value : updated.amount,
                    field === 'gstApplicable' ? value : updated.gstApplicable,
                    field === 'gstRate' ? value : updated.gstRate,
                    field === 'customGstRate' ? value : updated.customGstRate,
                    gstSettings.taxCalculationMethod
                );
                updated.gstAmount = gstAmount;
                updated.totalAmount = totalAmount;
            }
            return updated;
        });
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
                schedule: tx.schedule || tx.notes || 'Monthly',
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

    // Handlers
    const handleAddIncomeSource = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newIncome.name.trim() || !newIncome.amount) return;
        let entry;
        const now = new Date();
        const defaultDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const defaultTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (editingIncomeId) {
            entry = {
                ...incomeSources.find(i => i.id === editingIncomeId),
                ...newIncome,
                amount: parseFloat(newIncome.amount) || 0,
                gstAmount: parseFloat(newIncome.gstAmount) || 0,
                totalAmount: parseFloat(newIncome.totalAmount) || 0
            };
            setIncomeSources(prev => prev.map(i => i.id === editingIncomeId ? entry : i));
            setEditingIncomeId(null);
        } else {
            entry = {
                ...newIncome,
                id: Date.now(),
                date: newIncome.date || defaultDate,
                time: newIncome.time || defaultTime,
                amount: parseFloat(newIncome.amount) || 0,
                gstAmount: parseFloat(newIncome.gstAmount) || 0,
                totalAmount: parseFloat(newIncome.totalAmount) || 0
            };
            setIncomeSources(prev => [...prev, entry]);
        }
        setNewIncome(BLANK_INCOME);

        try {
            const taxableAmount = (entry.gstApplicable && gstSettings.taxCalculationMethod === 'Inclusive')
                ? (entry.amount - entry.gstAmount)
                : entry.amount;

            const data = { 
                type: 'income', 
                title: entry.name, 
                name: entry.name,
                description: entry.description || '',
                category: mapCategory(entry.name), 
                amount: taxableAmount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.schedule || 'Monthly', 
                status: 'Completed',
                gstApplicable: entry.gstApplicable || false,
                gstType: entry.gstType || 'CGST + SGST',
                gstRate: entry.gstRate || '18',
                customGstRate: entry.customGstRate || '0',
                invoiceNumber: entry.invoiceNumber || '',
                gstNumber: entry.gstNumber || '',
                customerVendorName: entry.customerVendorName || '',
                gstAmount: entry.gstAmount || 0,
                totalAmount: entry.totalAmount || entry.amount
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
        } catch (err) { console.error(err); }
    };

    const handleDeleteIncomeSource = async (id) => {
        const entry = incomeSources.find(i => i.id === id);
        if (entry && entry.transactionId) {
            try {
                await transactionsService.deleteTransaction(entry.transactionId);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            } catch (err) { console.error(err); }
        }
        setIncomeSources(prev => prev.filter(i => i.id !== id));
    };

    const handleEditIncomeSource = (i) => {
        setNewIncome({
            ...BLANK_INCOME,
            ...i,
            gstApplicable: i.gstApplicable || false,
            gstType: i.gstType || 'CGST + SGST',
            gstRate: i.gstRate || '18',
            customGstRate: i.customGstRate || '0',
            invoiceNumber: i.invoiceNumber || '',
            gstNumber: i.gstNumber || '',
            customerVendorName: i.customerVendorName || '',
            gstAmount: i.gstAmount || 0,
            totalAmount: i.totalAmount || i.amount || 0
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
            entry = { 
                ...expenses.find(e => e.id === editingId), 
                ...expense, 
                amount: parseFloat(expense.amount) || 0,
                gstAmount: parseFloat(expense.gstAmount) || 0,
                totalAmount: parseFloat(expense.totalAmount) || 0
            };
            setExpenses(prev => prev.map(e => e.id === editingId ? entry : e));
            setEditingId(null);
        } else {
            entry = { 
                ...expense, 
                id: Date.now(), 
                date: expense.date || defaultDate, 
                time: expense.time || defaultTime, 
                amount: parseFloat(expense.amount) || 0,
                gstAmount: parseFloat(expense.gstAmount) || 0,
                totalAmount: parseFloat(expense.totalAmount) || 0
            };
            setExpenses(prev => [entry, ...prev]);
        }
        setExpense(BLANK_EXPENSE);

        try {
            const taxableAmount = (entry.gstApplicable && gstSettings.taxCalculationMethod === 'Inclusive')
                ? (entry.amount - entry.gstAmount)
                : entry.amount;

            const data = { 
                type: 'expense', 
                title: entry.name, 
                name: entry.name,
                description: entry.description || '',
                category: mapCategory(entry.name), 
                amount: taxableAmount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.schedule || 'Monthly', 
                status: 'Completed',
                gstApplicable: entry.gstApplicable || false,
                gstType: entry.gstType || 'CGST + SGST',
                gstRate: entry.gstRate || '18',
                customGstRate: entry.customGstRate || '0',
                invoiceNumber: entry.invoiceNumber || '',
                gstNumber: entry.gstNumber || '',
                customerVendorName: entry.customerVendorName || '',
                gstAmount: entry.gstAmount || 0,
                totalAmount: entry.totalAmount || entry.amount
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
        } catch (err) { console.error(err); }
    };

    const handleDeleteExpense = async (id) => {
        const entry = expenses.find(e => e.id === id);
        if (entry && entry.transactionId) {
            try {
                await transactionsService.deleteTransaction(entry.transactionId);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            } catch (err) { console.error(err); }
        }
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const handleEditExpense = (e) => {
        setExpense({
            ...BLANK_EXPENSE,
            ...e,
            gstApplicable: e.gstApplicable || false,
            gstType: e.gstType || 'CGST + SGST',
            gstRate: e.gstRate || '18',
            customGstRate: e.customGstRate || '0',
            invoiceNumber: e.invoiceNumber || '',
            gstNumber: e.gstNumber || '',
            customerVendorName: e.customerVendorName || '',
            gstAmount: e.gstAmount || 0,
            totalAmount: e.totalAmount || e.amount || 0
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
            entry = {
                ...additionalIncomeSources.find(i => i.id === editingAdditionalIncomeId),
                ...newAdditionalIncome,
                amount: parseFloat(newAdditionalIncome.amount) || 0,
                gstAmount: parseFloat(newAdditionalIncome.gstAmount) || 0,
                totalAmount: parseFloat(newAdditionalIncome.totalAmount) || 0
            };
            setAdditionalIncomeSources(prev => prev.map(i => i.id === editingAdditionalIncomeId ? entry : i));
            setEditingAdditionalIncomeId(null);
        } else {
            entry = {
                ...newAdditionalIncome,
                id: Date.now(),
                date: newAdditionalIncome.date || defaultDate,
                time: newAdditionalIncome.time || defaultTime,
                amount: parseFloat(newAdditionalIncome.amount) || 0,
                gstAmount: parseFloat(newAdditionalIncome.gstAmount) || 0,
                totalAmount: parseFloat(newAdditionalIncome.totalAmount) || 0
            };
            setAdditionalIncomeSources(prev => [...prev, entry]);
        }
        setNewAdditionalIncome(BLANK_INCOME);

        try {
            const taxableAmount = (entry.gstApplicable && gstSettings.taxCalculationMethod === 'Inclusive')
                ? (entry.amount - entry.gstAmount)
                : entry.amount;

            const data = { 
                type: 'income', 
                title: `[Add] ${entry.name}`, 
                name: `[Add] ${entry.name}`, 
                description: entry.description || '',
                category: mapCategory(entry.name), 
                amount: taxableAmount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.schedule || 'Monthly', 
                status: 'Completed',
                gstApplicable: entry.gstApplicable || false,
                gstType: entry.gstType || 'CGST + SGST',
                gstRate: entry.gstRate || '18',
                customGstRate: entry.customGstRate || '0',
                invoiceNumber: entry.invoiceNumber || '',
                gstNumber: entry.gstNumber || '',
                customerVendorName: entry.customerVendorName || '',
                gstAmount: entry.gstAmount || 0,
                totalAmount: entry.totalAmount || entry.amount
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
        } catch (err) { console.error(err); }
    };

    const handleDeleteAddIncomeSource = async (id) => {
        const entry = additionalIncomeSources.find(i => i.id === id);
        if (entry && entry.transactionId) {
            try {
                await transactionsService.deleteTransaction(entry.transactionId);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            } catch (err) { console.error(err); }
        }
        setAdditionalIncomeSources(prev => prev.filter(i => i.id !== id));
    };

    const handleEditAddIncomeSource = (i) => {
        setNewAdditionalIncome({
            ...BLANK_INCOME,
            ...i,
            gstApplicable: i.gstApplicable || false,
            gstType: i.gstType || 'CGST + SGST',
            gstRate: i.gstRate || '18',
            customGstRate: i.customGstRate || '0',
            invoiceNumber: i.invoiceNumber || '',
            gstNumber: i.gstNumber || '',
            customerVendorName: i.customerVendorName || '',
            gstAmount: i.gstAmount || 0,
            totalAmount: i.totalAmount || i.amount || 0
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
            entry = { 
                ...additionalExpenses.find(e => e.id === editingAdditionalId), 
                ...additionalExpense, 
                amount: parseFloat(additionalExpense.amount) || 0,
                gstAmount: parseFloat(additionalExpense.gstAmount) || 0,
                totalAmount: parseFloat(additionalExpense.totalAmount) || 0
            };
            setAdditionalExpenses(prev => prev.map(e => e.id === editingAdditionalId ? entry : e));
            setEditingAdditionalId(null);
        } else {
            entry = { 
                ...additionalExpense, 
                id: Date.now(), 
                date: additionalExpense.date || defaultDate, 
                time: additionalExpense.time || defaultTime, 
                amount: parseFloat(additionalExpense.amount) || 0,
                gstAmount: parseFloat(additionalExpense.gstAmount) || 0,
                totalAmount: parseFloat(additionalExpense.totalAmount) || 0
            };
            setAdditionalExpenses(prev => [entry, ...prev]);
        }
        setAdditionalExpense(BLANK_EXPENSE);

        try {
            const taxableAmount = (entry.gstApplicable && gstSettings.taxCalculationMethod === 'Inclusive')
                ? (entry.amount - entry.gstAmount)
                : entry.amount;

            const data = { 
                type: 'expense', 
                title: `[Add] ${entry.name}`, 
                name: `[Add] ${entry.name}`, 
                description: entry.description || '',
                category: mapCategory(entry.name), 
                amount: taxableAmount, 
                date: formatAPIDate(entry.date), 
                time: entry.time || '',
                schedule: entry.schedule || 'Monthly',
                notes: entry.schedule || 'Monthly', 
                status: 'Completed',
                gstApplicable: entry.gstApplicable || false,
                gstType: entry.gstType || 'CGST + SGST',
                gstRate: entry.gstRate || '18',
                customGstRate: entry.customGstRate || '0',
                invoiceNumber: entry.invoiceNumber || '',
                gstNumber: entry.gstNumber || '',
                customerVendorName: entry.customerVendorName || '',
                gstAmount: entry.gstAmount || 0,
                totalAmount: entry.totalAmount || entry.amount
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
        } catch (err) { console.error(err); }
    };

    const handleDeleteAddExpense = async (id) => {
        const entry = additionalExpenses.find(e => e.id === id);
        if (entry && entry.transactionId) {
            try {
                await transactionsService.deleteTransaction(entry.transactionId);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            } catch (err) { console.error(err); }
        }
        setAdditionalExpenses(prev => prev.filter(e => e.id !== id));
    };

    const handleEditAddExpense = (e) => {
        setAdditionalExpense({
            ...BLANK_EXPENSE,
            ...e,
            gstApplicable: e.gstApplicable || false,
            gstType: e.gstType || 'CGST + SGST',
            gstRate: e.gstRate || '18',
            customGstRate: e.customGstRate || '0',
            invoiceNumber: e.invoiceNumber || '',
            gstNumber: e.gstNumber || '',
            customerVendorName: e.customerVendorName || '',
            gstAmount: e.gstAmount || 0,
            totalAmount: e.totalAmount || e.amount || 0
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
                .gst-row:hover { background: #F8FAFC !important; }
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

            <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg,#1B6B3A 0%,#064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><DollarSign size={20} /></div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Finance</h1>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>Track your income, fixed costs, and daily spending in one place.</p>
            </div>

            {/* Top tab switcher */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('tracker')}
                    style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: activeTab === 'tracker' ? '#ECFDF5' : 'transparent',
                        color: activeTab === 'tracker' ? '#1B6B3A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <DollarSign size={18} />
                    General Finance
                </button>
                <button
                    onClick={() => setActiveTab('gst')}
                    style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: activeTab === 'gst' ? '#ECFDF5' : 'transparent',
                        color: activeTab === 'gst' ? '#1B6B3A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Save size={18} />
                    GST Center (Read-only)
                </button>
            </div>

            {activeTab === 'tracker' ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Monthly Income', value: monthlyIncome, color: '#059669', bg: '#ECFDF5' },
                            { label: 'Fixed Expenses', value: fixedExpenses, color: '#D97706', bg: '#FFFBEB' },
                            { label: 'Daily Expenses', value: dailyExpenses, color: '#7C3AED', bg: '#F5F3FF' },
                            { label: 'Remaining Balance', value: remaining, color: remaining >= 0 ? '#059669' : '#EF4444', bg: remaining >= 0 ? '#ECFDF5' : '#FEF2F2' },
                        ].map(item => (
                            <div key={item.label} style={{ background: item.bg, borderRadius: '14px', padding: '1.1rem 1.25rem', border: `1px solid ${item.color}22` }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>{item.label}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: item.color }}>₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        ))}
                    </div>

                    {/* Integrated GST Summary Card */}
                    <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 850, color: '#064E3B', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GST Quick Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', marginBottom: '4px' }}>GST Collected</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857' }}>₹{gstStats.collected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: '4px' }}>GST Paid</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B91C1C' }}>₹{gstStats.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div style={{ background: gstStats.net >= 0 ? '#EFF6FF' : '#FFF7ED', padding: '1rem', borderRadius: '12px', border: gstStats.net >= 0 ? '#BFDBFE' : '#FED7AA' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: gstStats.net >= 0 ? '#1E40AF' : '#C2410C', textTransform: 'uppercase', marginBottom: '4px' }}>Net GST</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: gstStats.net >= 0 ? '#1D4ED8' : '#EA580C' }}>₹{gstStats.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '2rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginTop: 0, marginBottom: '0.75rem', textTransform: 'uppercase' }}>Recent GST Activities</h4>
                            {gstTransactions.slice(0, 3).length === 0 ? (
                                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', paddingTop: '10px' }}>No recent GST transactions logged.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {gstTransactions.slice(0, 3).map(tx => (
                                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                            <div>
                                                <span style={{ fontWeight: 700, color: '#1E293B' }}>{tx.name}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#64748B', marginLeft: '6px' }}>({tx.invoiceNumber || 'No Ref'})</span>
                                            </div>
                                            <span style={{ fontWeight: 800, color: tx.categoryType === 'income' ? '#10B981' : '#EF4444' }}>
                                                {tx.categoryType === 'income' ? '+' : '-'}₹{tx.gstAmount.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Income</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDED INCOME</h3>
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
                                    setNewAdditionalIncome({
                                        ...BLANK_INCOME,
                                        gstRate: gstSettings.defaultGstRate || '18',
                                        invoiceNumber: getNextInvoiceNumber(true)
                                    });
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.6rem',
                                    background: '#1B6B3A',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(27,107,58,0.2)'
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
                                    <div>
                                        <label style={lbl}>Amount (₹)</label>
                                        <input type="number" style={inp} placeholder="0.00" value={newAdditionalIncome.amount} onChange={e => handleAdditionalIncomeFieldChange('amount', e.target.value)} />
                                    </div>

                                    {/* GST Fields */}
                                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>GST APPLICABLE</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdditionalIncomeFieldChange('gstApplicable', true)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: newAdditionalIncome.gstApplicable ? '#1B6B3A' : '#CBD5E1',
                                                        background: newAdditionalIncome.gstApplicable ? '#ECFDF5' : '#fff',
                                                        color: newAdditionalIncome.gstApplicable ? '#1B6B3A' : '#64748B'
                                                    }}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdditionalIncomeFieldChange('gstApplicable', false)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: !newAdditionalIncome.gstApplicable ? '#EF4444' : '#CBD5E1',
                                                        background: !newAdditionalIncome.gstApplicable ? '#FEF2F2' : '#fff',
                                                        color: !newAdditionalIncome.gstApplicable ? '#EF4444' : '#64748B'
                                                    }}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>

                                        {newAdditionalIncome.gstApplicable && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>GST Type</label>
                                                        <select
                                                            style={inp}
                                                            value={newAdditionalIncome.gstType}
                                                            onChange={e => handleAdditionalIncomeFieldChange('gstType', e.target.value)}
                                                        >
                                                            <option value="CGST + SGST">CGST + SGST</option>
                                                            <option value="IGST">IGST</option>
                                                            <option value="Exempt">Exempt</option>
                                                            <option value="Nil Rated">Nil Rated</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Rate</label>
                                                        <select
                                                            style={inp}
                                                            value={newAdditionalIncome.gstRate}
                                                            onChange={e => handleAdditionalIncomeFieldChange('gstRate', e.target.value)}
                                                        >
                                                            <option value="5">5%</option>
                                                            <option value="12">12%</option>
                                                            <option value="18">18%</option>
                                                            <option value="28">28%</option>
                                                            <option value="custom">Custom</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {newAdditionalIncome.gstRate === 'custom' && (
                                                    <div>
                                                        <label style={lbl}>Custom GST Rate (%)</label>
                                                        <input
                                                            type="number"
                                                            style={inp}
                                                            placeholder="e.g. 15"
                                                            value={newAdditionalIncome.customGstRate}
                                                            onChange={e => handleAdditionalIncomeFieldChange('customGstRate', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>Invoice Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="INV-XXXX"
                                                            value={newAdditionalIncome.invoiceNumber}
                                                            onChange={e => handleAdditionalIncomeFieldChange('invoiceNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="GSTIN"
                                                            value={newAdditionalIncome.gstNumber}
                                                            onChange={e => handleAdditionalIncomeFieldChange('gstNumber', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={lbl}>Customer Name</label>
                                                    <input
                                                        type="text"
                                                        style={inp}
                                                        placeholder="Customer Name"
                                                        value={newAdditionalIncome.customerVendorName}
                                                        onChange={e => handleAdditionalIncomeFieldChange('customerVendorName', e.target.value)}
                                                    />
                                                </div>

                                                {/* Calculations displays */}
                                                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                                                        <span>GST Amount:</span>
                                                        <span style={{ fontWeight: 700 }}>₹{newAdditionalIncome.gstAmount}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>
                                                        <span>Grand Total:</span>
                                                        <span style={{ color: '#1B6B3A' }}>₹{newAdditionalIncome.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={(e) => { handleAddAddIncomeSource(e); setShowAddIncomeForm(false); }} style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                                        {editingAdditionalIncomeId ? 'Update Income' : 'Save Income'}
                                    </button>
                                </div>
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
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>DATE</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>AMOUNT</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdditionalIncome.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No income sources added yet</td></tr>
                                ) : (
                                    filteredAdditionalIncome.map(i => (
                                        <tr key={i.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#10B981', textAlign: 'center' }}>{i.name}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{i.date}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, textAlign: 'center' }}>₹{parseFloat(i.amount).toLocaleString('en-IN')}</td>
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Expense</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDED EXPENSE</h3>
                        </div>

                        <div style={{ position: 'relative', width: '130px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                value={addExpenseSearch}
                                onChange={(e) => setAddExpenseSearch(e.target.value)}
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
                                    setShowAddExpenseForm(true);
                                    setEditingAdditionalId(null);
                                    setAdditionalExpense({
                                        ...BLANK_EXPENSE,
                                        gstRate: gstSettings.defaultGstRate || '18',
                                        invoiceNumber: getNextInvoiceNumber(false)
                                    });
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.6rem',
                                    background: '#1B6B3A',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(27,107,58,0.2)'
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
                                    <div>
                                        <label style={lbl}>Amount (₹)</label>
                                        <input type="number" style={inp} placeholder="0.00" value={additionalExpense.amount} onChange={e => handleAdditionalExpenseFieldChange('amount', e.target.value)} />
                                    </div>

                                    {/* GST Fields */}
                                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>GST APPLICABLE</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdditionalExpenseFieldChange('gstApplicable', true)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: additionalExpense.gstApplicable ? '#1B6B3A' : '#CBD5E1',
                                                        background: additionalExpense.gstApplicable ? '#ECFDF5' : '#fff',
                                                        color: additionalExpense.gstApplicable ? '#1B6B3A' : '#64748B'
                                                    }}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdditionalExpenseFieldChange('gstApplicable', false)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: !additionalExpense.gstApplicable ? '#EF4444' : '#CBD5E1',
                                                        background: !additionalExpense.gstApplicable ? '#FEF2F2' : '#fff',
                                                        color: !additionalExpense.gstApplicable ? '#EF4444' : '#64748B'
                                                    }}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>

                                        {additionalExpense.gstApplicable && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>GST Type</label>
                                                        <select
                                                            style={inp}
                                                            value={additionalExpense.gstType}
                                                            onChange={e => handleAdditionalExpenseFieldChange('gstType', e.target.value)}
                                                        >
                                                            <option value="CGST + SGST">CGST + SGST</option>
                                                            <option value="IGST">IGST</option>
                                                            <option value="Exempt">Exempt</option>
                                                            <option value="Nil Rated">Nil Rated</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Rate</label>
                                                        <select
                                                            style={inp}
                                                            value={additionalExpense.gstRate}
                                                            onChange={e => handleAdditionalExpenseFieldChange('gstRate', e.target.value)}
                                                        >
                                                            <option value="5">5%</option>
                                                            <option value="12">12%</option>
                                                            <option value="18">18%</option>
                                                            <option value="28">28%</option>
                                                            <option value="custom">Custom</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {additionalExpense.gstRate === 'custom' && (
                                                    <div>
                                                        <label style={lbl}>Custom GST Rate (%)</label>
                                                        <input
                                                            type="number"
                                                            style={inp}
                                                            placeholder="e.g. 15"
                                                            value={additionalExpense.customGstRate}
                                                            onChange={e => handleAdditionalExpenseFieldChange('customGstRate', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>Bill Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="BILL-XXXX"
                                                            value={additionalExpense.invoiceNumber}
                                                            onChange={e => handleAdditionalExpenseFieldChange('invoiceNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="GSTIN"
                                                            value={additionalExpense.gstNumber}
                                                            onChange={e => handleAdditionalExpenseFieldChange('gstNumber', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={lbl}>Vendor Name</label>
                                                    <input
                                                        type="text"
                                                        style={inp}
                                                        placeholder="Vendor Name"
                                                        value={additionalExpense.customerVendorName}
                                                        onChange={e => handleAdditionalExpenseFieldChange('customerVendorName', e.target.value)}
                                                    />
                                                </div>

                                                {/* Calculations displays */}
                                                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                                                        <span>GST Amount:</span>
                                                        <span style={{ fontWeight: 700 }}>₹{additionalExpense.gstAmount}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>
                                                        <span>Grand Total:</span>
                                                        <span style={{ color: '#1B6B3A' }}>₹{additionalExpense.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={(e) => { handleSaveAddExpense(e); setShowAddExpenseForm(false); }} style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                                        {editingAdditionalId ? 'Update Expense' : 'Save Expense'}
                                    </button>
                                </div>
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
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>DATE</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>AMOUNT</th>
                                    <th style={{ padding: '0.8rem 0.75rem', textAlign: 'center', color: '#1E40AF', fontWeight: 900, whiteSpace: 'nowrap', verticalAlign: 'middle', minWidth: '100px' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdditionalExpenses.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>No expenses added yet</td></tr>
                                ) : (
                                    filteredAdditionalExpenses.map(e => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#EF4444', textAlign: 'center' }}>{e.name}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{e.date}</td>
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, textAlign: 'center' }}>₹{parseFloat(e.amount).toLocaleString('en-IN')}</td>
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Income</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDED INCOME</h3>
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
                                    setNewIncome({
                                        ...BLANK_INCOME,
                                        gstRate: gstSettings.defaultGstRate || '18',
                                        invoiceNumber: getNextInvoiceNumber(true)
                                    });
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.6rem',
                                    background: '#1B6B3A',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(27,107,58,0.2)'
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
                                            <label style={lbl}>Amount (₹)</label>
                                            <input type="number" style={inp} placeholder="0.00" value={newIncome.amount} onChange={e => handleIncomeFieldChange('amount', e.target.value)} />
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

                                    {/* GST Fields */}
                                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>GST APPLICABLE</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleIncomeFieldChange('gstApplicable', true)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: newIncome.gstApplicable ? '#1B6B3A' : '#CBD5E1',
                                                        background: newIncome.gstApplicable ? '#ECFDF5' : '#fff',
                                                        color: newIncome.gstApplicable ? '#1B6B3A' : '#64748B'
                                                    }}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleIncomeFieldChange('gstApplicable', false)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: !newIncome.gstApplicable ? '#EF4444' : '#CBD5E1',
                                                        background: !newIncome.gstApplicable ? '#FEF2F2' : '#fff',
                                                        color: !newIncome.gstApplicable ? '#EF4444' : '#64748B'
                                                    }}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>

                                        {newIncome.gstApplicable && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>GST Type</label>
                                                        <select
                                                            style={inp}
                                                            value={newIncome.gstType}
                                                            onChange={e => handleIncomeFieldChange('gstType', e.target.value)}
                                                        >
                                                            <option value="CGST + SGST">CGST + SGST</option>
                                                            <option value="IGST">IGST</option>
                                                            <option value="Exempt">Exempt</option>
                                                            <option value="Nil Rated">Nil Rated</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Rate</label>
                                                        <select
                                                            style={inp}
                                                            value={newIncome.gstRate}
                                                            onChange={e => handleIncomeFieldChange('gstRate', e.target.value)}
                                                        >
                                                            <option value="5">5%</option>
                                                            <option value="12">12%</option>
                                                            <option value="18">18%</option>
                                                            <option value="28">28%</option>
                                                            <option value="custom">Custom</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {newIncome.gstRate === 'custom' && (
                                                    <div>
                                                        <label style={lbl}>Custom GST Rate (%)</label>
                                                        <input
                                                            type="number"
                                                            style={inp}
                                                            placeholder="e.g. 15"
                                                            value={newIncome.customGstRate}
                                                            onChange={e => handleIncomeFieldChange('customGstRate', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>Invoice Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="INV-XXXX"
                                                            value={newIncome.invoiceNumber}
                                                            onChange={e => handleIncomeFieldChange('invoiceNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="GSTIN"
                                                            value={newIncome.gstNumber}
                                                            onChange={e => handleIncomeFieldChange('gstNumber', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={lbl}>Customer Name</label>
                                                    <input
                                                        type="text"
                                                        style={inp}
                                                        placeholder="Customer Name"
                                                        value={newIncome.customerVendorName}
                                                        onChange={e => handleIncomeFieldChange('customerVendorName', e.target.value)}
                                                    />
                                                </div>

                                                {/* Calculations displays */}
                                                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                                                        <span>GST Amount:</span>
                                                        <span style={{ fontWeight: 700 }}>₹{newIncome.gstAmount}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>
                                                        <span>Grand Total:</span>
                                                        <span style={{ color: '#1B6B3A' }}>₹{newIncome.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: '#10B981', textAlign: 'center' }}>₹{(parseFloat(i.amount) || 0).toLocaleString('en-IN')}</td>
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase' }}>Expense</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF', margin: 0, whiteSpace: 'nowrap' }}>ADDED EXPENSE</h3>
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
                                    setExpense({
                                        ...BLANK_EXPENSE,
                                        gstRate: gstSettings.defaultGstRate || '18',
                                        invoiceNumber: getNextInvoiceNumber(false)
                                    });
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.6rem',
                                    background: '#1B6B3A',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(27,107,58,0.2)'
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
                                            <label style={lbl}>Amount (₹)</label>
                                            <input type="number" style={inp} placeholder="0.00" value={expense.amount} onChange={e => handleExpenseFieldChange('amount', e.target.value)} />
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

                                    {/* GST Fields */}
                                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>GST APPLICABLE</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleExpenseFieldChange('gstApplicable', true)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: expense.gstApplicable ? '#1B6B3A' : '#CBD5E1',
                                                        background: expense.gstApplicable ? '#ECFDF5' : '#fff',
                                                        color: expense.gstApplicable ? '#1B6B3A' : '#64748B'
                                                    }}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleExpenseFieldChange('gstApplicable', false)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: !expense.gstApplicable ? '#EF4444' : '#CBD5E1',
                                                        background: !expense.gstApplicable ? '#FEF2F2' : '#fff',
                                                        color: !expense.gstApplicable ? '#EF4444' : '#64748B'
                                                    }}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>

                                        {expense.gstApplicable && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>GST Type</label>
                                                        <select
                                                            style={inp}
                                                            value={expense.gstType}
                                                            onChange={e => handleExpenseFieldChange('gstType', e.target.value)}
                                                        >
                                                            <option value="CGST + SGST">CGST + SGST</option>
                                                            <option value="IGST">IGST</option>
                                                            <option value="Exempt">Exempt</option>
                                                            <option value="Nil Rated">Nil Rated</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Rate</label>
                                                        <select
                                                            style={inp}
                                                            value={expense.gstRate}
                                                            onChange={e => handleExpenseFieldChange('gstRate', e.target.value)}
                                                        >
                                                            <option value="5">5%</option>
                                                            <option value="12">12%</option>
                                                            <option value="18">18%</option>
                                                            <option value="28">28%</option>
                                                            <option value="custom">Custom</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {expense.gstRate === 'custom' && (
                                                    <div>
                                                        <label style={lbl}>Custom GST Rate (%)</label>
                                                        <input
                                                            type="number"
                                                            style={inp}
                                                            placeholder="e.g. 15"
                                                            value={expense.customGstRate}
                                                            onChange={e => handleExpenseFieldChange('customGstRate', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={lbl}>Bill Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="BILL-XXXX"
                                                            value={expense.invoiceNumber}
                                                            onChange={e => handleExpenseFieldChange('invoiceNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={lbl}>GST Number</label>
                                                        <input
                                                            type="text"
                                                            style={inp}
                                                            placeholder="GSTIN"
                                                            value={expense.gstNumber}
                                                            onChange={e => handleExpenseFieldChange('gstNumber', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={lbl}>Vendor Name</label>
                                                    <input
                                                        type="text"
                                                        style={inp}
                                                        placeholder="Vendor Name"
                                                        value={expense.customerVendorName}
                                                        onChange={e => handleExpenseFieldChange('customerVendorName', e.target.value)}
                                                    />
                                                </div>

                                                {/* Calculations displays */}
                                                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                                                        <span>GST Amount:</span>
                                                        <span style={{ fontWeight: 700 }}>₹{expense.gstAmount}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>
                                                        <span>Grand Total:</span>
                                                        <span style={{ color: '#1B6B3A' }}>₹{expense.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={async (e) => { await handleSaveExpense(e); setShowExpenseForm(false); }} style={{ ...saveBtn, width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                                        {editingId ? 'Update Expense' : 'Save Expense'}
                                    </button>
                                </div>
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
                                            <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800, color: '#EF4444', textAlign: 'center' }}>₹{(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</td>
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
            </>
            ) : (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    {/* GST Center Sub-Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '12px', marginBottom: '2rem', width: 'fit-content' }}>
                        {[
                            { id: 'dashboard', label: 'GST Dashboard' },
                            { id: 'sales', label: 'Sales GST' },
                            { id: 'purchase', label: 'Purchase GST' },
                            { id: 'reports', label: 'GST Reports' },
                            { id: 'settings', label: 'GST Settings' }
                        ].map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setActiveGstTab(sub.id)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontSize: '0.825rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: activeGstTab === sub.id ? '#ffffff' : 'transparent',
                                    color: activeGstTab === sub.id ? '#1B6B3A' : '#64748B',
                                    boxShadow: activeGstTab === sub.id ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>

                    {/* View 1: GST Dashboard */}
                    {activeGstTab === 'dashboard' && (
                        <div>
                            {/* KPI Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #BFDBFE' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '6px' }}>Total GST Collected</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1D4ED8' }}>₹{gstStats.collected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#60A5FA', marginTop: '4px', fontWeight: 650 }}>{gstStats.salesCount} Invoices</div>
                                </div>
                                <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '1.25rem', border: '1px solid #FCA5A5' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: '6px' }}>Total GST Paid</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#B91C1C' }}>₹{gstStats.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#F87171', marginTop: '4px', fontWeight: 650 }}>{gstStats.purchaseCount} Bills</div>
                                </div>
                                <div style={{ background: gstStats.net >= 0 ? '#ECFDF5' : '#FFF7ED', borderRadius: '12px', padding: '1.25rem', border: gstStats.net >= 0 ? '#A7F3D0' : '#FED7AA' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: gstStats.net >= 0 ? '#065F46' : '#C2410C', textTransform: 'uppercase', marginBottom: '6px' }}>Net GST Liability</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: gstStats.net >= 0 ? '#047857' : '#EA580C' }}>₹{gstStats.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    <div style={{ fontSize: '0.7rem', color: gstStats.net >= 0 ? '#34D399' : '#FDBA74', marginTop: '4px', fontWeight: 650 }}>{gstStats.net >= 0 ? 'Payable to Government' : 'Credit Claimable'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
                                {/* Left Side: Chart (HTML/CSS Bar Chart) */}
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0F172A', marginTop: 0, marginBottom: '1.5rem' }}>Monthly GST Trend</h3>
                                    {gstStats.monthlySummary.length === 0 ? (
                                        <div style={{ border: '1px dashed #E2E8F0', borderRadius: '12px', padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                                            No transaction trend data available.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            {gstStats.monthlySummary.map(m => {
                                                const maxAmt = Math.max(...gstStats.monthlySummary.map(x => Math.max(x.collected, x.paid))) || 1;
                                                const colPct = Math.min(100, Math.max(5, (m.collected / maxAmt) * 100));
                                                const paidPct = Math.min(100, Math.max(5, (m.paid / maxAmt) * 100));

                                                return (
                                                    <div key={m.month} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{m.month}</span>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: `${colPct}%`, height: '8px', background: '#3B82F6', borderRadius: '4px' }} />
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1D4ED8' }}>₹{m.collected.toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: `${paidPct}%`, height: '8px', background: '#EF4444', borderRadius: '4px' }} />
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#B91C1C' }}>₹{m.paid.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 650, color: '#64748B' }}>
                                                    <div style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: '3px' }} />
                                                    Collected (Sales)
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 650, color: '#64748B' }}>
                                                    <div style={{ width: 12, height: 12, background: '#EF4444', borderRadius: '3px' }} />
                                                    Paid (Purchases)
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Recent Transactions */}
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0F172A', marginTop: 0, marginBottom: '1.5rem' }}>Recent GST Activities</h3>
                                    {gstTransactions.length === 0 ? (
                                        <div style={{ border: '1px dashed #E2E8F0', borderRadius: '12px', padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                                            No recent activity logged.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {gstTransactions.slice(0, 5).map(tx => (
                                                <div
                                                    key={tx.id}
                                                    onClick={() => setSelectedGstTx(tx)}
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                    className="gst-row"
                                                >
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#1E293B' }}>{tx.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                                                            {tx.invoiceNumber || 'No Ref'} | {tx.customerVendorName || '—'}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: tx.categoryType === 'income' ? '#059669' : '#EF4444' }}>
                                                            {tx.categoryType === 'income' ? '+' : '-'}₹{tx.gstAmount.toLocaleString('en-IN')}
                                                        </div>
                                                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: tx.categoryType === 'income' ? '#E1F5FE' : '#FFEBEE', color: tx.categoryType === 'income' ? '#0288D1' : '#C62828', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>
                                                            {tx.gstType} ({tx.gstRate}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View 2: Sales GST (Income transactions with GST) */}
                    {activeGstTab === 'sales' && (
                        <div>
                            {/* Actions bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input
                                            type="text"
                                            value={salesSearch}
                                            onChange={e => { setSalesSearch(e.target.value); setSalesCurrentPage(1); }}
                                            placeholder="Search sales invoices..."
                                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', background: '#fff' }}
                                        />
                                    </div>
                                    <select
                                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', background: '#fff', color: '#475569' }}
                                        value={salesFilterRate}
                                        onChange={e => { setSalesFilterRate(e.target.value); setSalesCurrentPage(1); }}
                                    >
                                        <option value="all">All Rates</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setSalesSortKey('invoiceNumber'); setSalesSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Invoice Ref</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setSalesSortKey('customerVendorName'); setSalesSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Customer</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSalesSortKey('amount'); setSalesSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Taxable Amt</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>GST Rate</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSalesSortKey('gstAmount'); setSalesSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>GST Amt</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSalesSortKey('totalAmount'); setSalesSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Grand Total</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setSalesSortKey('date'); setSalesSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedSales.length === 0 ? (
                                            <tr><td colSpan="8" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>No sales invoice data matched your search</td></tr>
                                        ) : (
                                            paginatedSales.map(tx => (
                                                <tr
                                                    key={tx.id}
                                                    onClick={() => setSelectedGstTx(tx)}
                                                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                                                    className="gst-row"
                                                >
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1E293B' }}>{tx.invoiceNumber || 'No Ref'}</td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{tx.customerVendorName || '—'}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>{tx.gstType} ({tx.gstRate}%)</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#1B6B3A', fontWeight: 700 }}>₹{tx.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#064E3B', fontWeight: 800 }}>₹{tx.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748B' }}>{tx.date}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: '#ECFDF5', color: '#065F46', borderRadius: '99px', fontWeight: 700 }}>Completed</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {salesTransactions.length > 5 && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
                                    <button
                                        onClick={() => setSalesCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={salesCurrentPage === 1}
                                        style={{ padding: '4px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', opacity: salesCurrentPage === 1 ? 0.5 : 1 }}
                                    >
                                        Prev
                                    </button>
                                    <span style={{ fontSize: '0.75rem', alignSelf: 'center', color: '#64748B' }}>Page {salesCurrentPage} of {salesPageCount}</span>
                                    <button
                                        onClick={() => setSalesCurrentPage(p => Math.min(salesPageCount, p + 1))}
                                        disabled={salesCurrentPage === salesPageCount}
                                        style={{ padding: '4px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', opacity: salesCurrentPage === salesPageCount ? 0.5 : 1 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* View 3: Purchase GST (Expense transactions with GST) */}
                    {activeGstTab === 'purchase' && (
                        <div>
                            {/* Actions bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input
                                            type="text"
                                            value={purchaseSearch}
                                            onChange={e => { setPurchaseSearch(e.target.value); setPurchaseCurrentPage(1); }}
                                            placeholder="Search purchase bills..."
                                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', background: '#fff' }}
                                        />
                                    </div>
                                    <select
                                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', background: '#fff', color: '#475569' }}
                                        value={purchaseFilterRate}
                                        onChange={e => { setPurchaseFilterRate(e.target.value); setPurchaseCurrentPage(1); }}
                                    >
                                        <option value="all">All Rates</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setPurchaseSortKey('invoiceNumber'); setPurchaseSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Bill Ref</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setPurchaseSortKey('customerVendorName'); setPurchaseSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Vendor</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setPurchaseSortKey('amount'); setPurchaseSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Taxable Amt</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>GST Rate</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setPurchaseSortKey('gstAmount'); setPurchaseSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>GST Amt</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setPurchaseSortKey('totalAmount'); setPurchaseSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Grand Total</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setPurchaseSortKey('date'); setPurchaseSortDirection(p => p === 'asc' ? 'desc' : 'asc'); }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPurchases.length === 0 ? (
                                            <tr><td colSpan="8" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>No purchase bill data matched your search</td></tr>
                                        ) : (
                                            paginatedPurchases.map(tx => (
                                                <tr
                                                    key={tx.id}
                                                    onClick={() => setSelectedGstTx(tx)}
                                                    style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                                                    className="gst-row"
                                                >
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1E293B' }}>{tx.invoiceNumber || 'No Ref'}</td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{tx.customerVendorName || '—'}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>{tx.gstType} ({tx.gstRate}%)</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#EF4444', fontWeight: 700 }}>₹{tx.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#B91C1C', fontWeight: 800 }}>₹{tx.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748B' }}>{tx.date}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: '#ECFDF5', color: '#065F46', borderRadius: '99px', fontWeight: 700 }}>Completed</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {purchaseTransactions.length > 5 && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.25rem' }}>
                                    <button
                                        onClick={() => setPurchaseCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={purchaseCurrentPage === 1}
                                        style={{ padding: '4px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', opacity: purchaseCurrentPage === 1 ? 0.5 : 1 }}
                                    >
                                        Prev
                                    </button>
                                    <span style={{ fontSize: '0.75rem', alignSelf: 'center', color: '#64748B' }}>Page {purchaseCurrentPage} of {purchasePageCount}</span>
                                    <button
                                        onClick={() => setPurchaseCurrentPage(p => Math.min(purchasePageCount, p + 1))}
                                        disabled={purchaseCurrentPage === purchasePageCount}
                                        style={{ padding: '4px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', opacity: purchaseCurrentPage === purchasePageCount ? 0.5 : 1 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* View 4: GST Reports */}
                    {activeGstTab === 'reports' && (
                        <div>
                            {/* Report Selector & Export buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'monthly', label: 'Monthly' },
                                        { id: 'quarterly', label: 'Quarterly' },
                                        { id: 'yearly', label: 'Yearly' },
                                        { id: 'sales_register', label: 'Sales Reg' },
                                        { id: 'purchase_register', label: 'Purchase Reg' },
                                        { id: 'gst_summary', label: 'GST Summary' }
                                    ].map(rep => (
                                        <button
                                            key={rep.id}
                                            onClick={() => setGstReportType(rep.id)}
                                            style={{
                                                padding: '6px 12px',
                                                border: '1px solid',
                                                borderColor: gstReportType === rep.id ? '#1B6B3A' : '#CBD5E1',
                                                background: gstReportType === rep.id ? '#ECFDF5' : '#fff',
                                                color: gstReportType === rep.id ? '#1B6B3A' : '#64748B',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {rep.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            const headers = ["Invoice Ref", "Entity", "Taxable Amount", "GST Rate %", "GST Amount", "Grand Total", "Date"];
                                            const rows = gstTransactions.map(tx => [
                                                tx.invoiceNumber || 'No Ref',
                                                tx.customerVendorName || '—',
                                                tx.amount,
                                                tx.gstRate,
                                                tx.gstAmount,
                                                tx.totalAmount,
                                                tx.date
                                            ]);
                                            exportCSV(rows, `cliks_gst_report_${gstReportType}.csv`, headers);
                                        }}
                                        style={{ ...saveBtn, background: '#1B6B3A', boxShadow: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}
                                    >
                                        Excel/CSV
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        style={{ ...saveBtn, background: '#1B6B3A', boxShadow: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}
                                    >
                                        PDF Print
                                    </button>
                                </div>
                            </div>

                            {/* Reports Table rendering */}
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
                                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>{gstSettings.businessName || 'CLIKS Business'}</h2>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>GSTIN: {gstSettings.businessGstNumber || 'NOT CONFIGURED'} | {gstSettings.state}, {gstSettings.country}</div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1B6B3A', textTransform: 'uppercase', marginTop: '1rem', letterSpacing: '0.05em' }}>
                                        {gstReportType.replace('_', ' ')} Report
                                    </h3>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Ref No / Title</th>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Particulars</th>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Taxable Base</th>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>GST Rate</th>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>GST Amount</th>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Grand Total</th>
                                            <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gstTransactions.length === 0 ? (
                                            <tr><td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>No GST transaction records loaded.</td></tr>
                                        ) : (
                                            gstTransactions.map(tx => (
                                                <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{tx.invoiceNumber || '—'}</td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                                                        {tx.customerVendorName || tx.name} 
                                                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginLeft: '6px' }}>({tx.categoryType === 'income' ? 'Sales' : 'Purchase'})</span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>{tx.gstRate}%</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: tx.categoryType === 'income' ? '#059669' : '#EF4444' }}>
                                                        ₹{tx.gstAmount.toLocaleString('en-IN')}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800 }}>₹{tx.totalAmount.toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748B' }}>{tx.date}</td>
                                                </tr>
                                            ))
                                        )}
                                        {gstTransactions.length > 0 && (
                                            <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0', fontWeight: 900, color: '#0F172A' }}>
                                                <td colSpan="2" style={{ padding: '1rem', textAlign: 'left' }}>TOTALS</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>₹{gstTransactions.reduce((acc, x) => acc + x.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', color: '#1B6B3A' }}>₹{gstTransactions.reduce((acc, x) => acc + x.gstAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>₹{gstTransactions.reduce((acc, x) => acc + x.totalAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td style={{ padding: '1rem' }}></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* View 5: GST Settings */}
                    {activeGstTab === 'settings' && (
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0F172A', marginTop: 0, marginBottom: '1.5rem' }}>GST & Tax Settings</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '800px' }}>
                                <div>
                                    <label style={lbl}>Business / Legal Name</label>
                                    <input
                                        type="text"
                                        style={inp}
                                        value={gstSettings.businessName}
                                        onChange={e => setGstSettings(p => ({ ...p, businessName: e.target.value }))}
                                        placeholder="e.g. CLIKS Enterprises"
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>Business GST Number</label>
                                    <input
                                        type="text"
                                        style={inp}
                                        value={gstSettings.businessGstNumber}
                                        onChange={e => setGstSettings(p => ({ ...p, businessGstNumber: e.target.value }))}
                                        placeholder="GSTIN"
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>State</label>
                                    <input
                                        type="text"
                                        style={inp}
                                        value={gstSettings.state}
                                        onChange={e => setGstSettings(p => ({ ...p, state: e.target.value }))}
                                        placeholder="e.g. Karnataka"
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>Country</label>
                                    <input
                                        type="text"
                                        style={inp}
                                        value={gstSettings.country}
                                        onChange={e => setGstSettings(p => ({ ...p, country: e.target.value }))}
                                        placeholder="e.g. India"
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>Default GST Rate (%)</label>
                                    <select
                                        style={inp}
                                        value={gstSettings.defaultGstRate}
                                        onChange={e => setGstSettings(p => ({ ...p, defaultGstRate: e.target.value }))}
                                    >
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>Tax Calculation Method</label>
                                    <select
                                        style={inp}
                                        value={gstSettings.taxCalculationMethod}
                                        onChange={e => setGstSettings(p => ({ ...p, taxCalculationMethod: e.target.value }))}
                                    >
                                        <option value="Exclusive">Exclusive (Tax added on top of base amount)</option>
                                        <option value="Inclusive">Inclusive (Tax is built into total amount)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>Invoice Prefix</label>
                                    <input
                                        type="text"
                                        style={inp}
                                        value={gstSettings.invoicePrefix}
                                        onChange={e => setGstSettings(p => ({ ...p, invoicePrefix: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>Invoice Starting Number</label>
                                    <input
                                        type="number"
                                        style={inp}
                                        value={gstSettings.invoiceStartingNumber}
                                        onChange={e => setGstSettings(p => ({ ...p, invoiceStartingNumber: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.setItem(`cliks_gst_settings_${uid}`, JSON.stringify(gstSettings));
                                    alert('Settings saved successfully!');
                                }}
                                style={{ ...saveBtn, marginTop: '2rem' }}
                            >
                                Save Settings
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* GST Transaction Detail Modal */}
            {selectedGstTx && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: '95%', maxWidth: '500px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                        <button onClick={() => setSelectedGstTx(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
                        
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#064E3B', marginBottom: '0.5rem' }}>Transaction Details</h2>
                        <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>Full invoice/bill tax breakdown.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Name</span>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{selectedGstTx.name}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Reference</span>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{selectedGstTx.invoiceNumber || 'No Ref'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Entity (Customer/Vendor)</span>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>{selectedGstTx.customerVendorName || '—'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Entity GSTIN</span>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>{selectedGstTx.gstNumber || '—'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</span>
                                    <span style={{ color: '#475569' }}>{selectedGstTx.date} at {selectedGstTx.time || '—'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>GST Category</span>
                                    <span style={{ color: '#475569' }}>{selectedGstTx.gstType} ({selectedGstTx.gstRate}%)</span>
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#475569' }}>
                                    <span>Taxable Amount (Base):</span>
                                    <span style={{ fontWeight: 600 }}>₹{selectedGstTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#475569' }}>
                                    <span>GST amount ({selectedGstTx.gstRate}%):</span>
                                    <span style={{ fontWeight: 700, color: selectedGstTx.categoryType === 'income' ? '#059669' : '#EF4444' }}>
                                        ₹{selectedGstTx.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '6px', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                                    <span>Grand Total:</span>
                                    <span style={{ color: '#064E3B' }}>₹{selectedGstTx.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
