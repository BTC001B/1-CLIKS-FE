import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Save, Trash2, Pencil, FileText } from 'lucide-react';
import { useAuth } from '../../context';

/* ─── Storage key scoped per user ────────────────────────────── */
const detailsKey  = (uid) => `cliks_finance_details_${uid}`;
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

    const [details, setDetails]   = useState(() => {
        try { return JSON.parse(localStorage.getItem(detailsKey(uid))) || BLANK_DETAILS; }
        catch { return BLANK_DETAILS; }
    });
    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem(expensesKey(uid))) || []; }
        catch { return []; }
    });
    const [expense, setExpense]   = useState(BLANK_EXPENSE);
    const [editingId, setEditingId] = useState(null);
    const [saved,   setSaved]     = useState(false);
    const [expSaved, setExpSaved] = useState(false);
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    const isIncomeEmpty = !details.salary && !details.electricity && !details.rent && !details.grocery;
    const isExpenseEmpty = expenses.length === 0;

    /* Persist on change */
    useEffect(() => {
        localStorage.setItem(detailsKey(uid), JSON.stringify(details));
    }, [details, uid]);
    useEffect(() => {
        localStorage.setItem(expensesKey(uid), JSON.stringify(expenses));
    }, [expenses, uid]);

    /* Derived totals */
    const monthlyIncome   = (parseFloat(details.salary) || 0) + (parseFloat(details.bonus) || 0);
    const fixedExpenses   = (parseFloat(details.rent) || 0) + (parseFloat(details.electricity) || 0) + (parseFloat(details.grocery) || 0);
    const dailyExpenses   = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const remaining       = monthlyIncome - fixedExpenses - dailyExpenses;

    const handleSaveDetails = (ev) => {
        ev.preventDefault();
        setSaved(true);
        setIsAddingIncome(false);
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
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
            <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Fixed Source</h2>
            </div>

            {/* Main Container Split into Two */}
            <div style={{ display: 'flex', border: '2px solid #2563EB', borderRadius: '12px', background: '#fff', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>

                {/* LEFT SIDE: INCOME */}
                <div style={{ flex: 1, padding: '1.5rem', borderRight: '2px solid #2563EB', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Income</h2>
                        <div style={{ position: 'absolute', right: 0, top: -5, background: '#3B82F6', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                            <Pencil size={16} />
                        </div>
                    </div>
                    <div style={{ height: '2px', background: '#EF4444', margin: '0 -1.5rem 1.5rem -1.5rem' }}></div>

                    {isIncomeEmpty && !isAddingIncome ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                            <button
                                onClick={() => setIsAddingIncome(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem', background: '#fff', color: '#1B6B3A',
                                    border: '2px dashed #1B6B3A', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#F0FDF4'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                                Add Income +
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1E3A8A', margin: 0, textTransform: 'uppercase' }}>Standard Income</h3>
                            </div>

                            <form onSubmit={handleSaveDetails}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {[
                                        ['salary',      'Monthly Salary'],
                                        ['electricity', 'Monthly Electricity Bill'],
                                        ['rent',        'Monthly House Rent'],
                                        ['grocery',     'Monthly Grocery Budget'],
                                    ].map(([key, label]) => (
                                        <div key={key}>
                                            <label style={lbl}>{label}</label>
                                            <input
                                                type="number"
                                                style={inp}
                                                value={details[key]}
                                                placeholder="0"
                                                onChange={e => setDetails(prev => ({ ...prev, [key]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '1rem' }}>
                                        <button type="submit" style={saveBtn}>
                                            <Save size={16} /> Save Details
                                        </button>
                                        {saved && <span style={{ marginLeft: '1rem', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>✓ Saved</span>}
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                {/* RIGHT SIDE: MONTHLY EXPENSE */}
                <div style={{ flex: 1, padding: '1.5rem', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1E40AF', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Expense</h2>
                        <div style={{ position: 'absolute', right: 0, top: -5, background: '#3B82F6', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                            <Pencil size={16} />
                        </div>
                    </div>
                    <div style={{ height: '2px', background: '#EF4444', margin: '0 -1.5rem 1.5rem -1.5rem' }}></div>

                    {isExpenseEmpty && !isAddingExpense ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                            <button
                                onClick={() => setIsAddingExpense(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem', background: '#fff', color: '#1B6B3A',
                                    border: '2px dashed #1B6B3A', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#F0FDF4'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                                Add Expense +
                            </button>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSaveExpense}>
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
                                                <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#94A3B8' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.length === 0 ? (
                                                <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8' }}>No expenses yet</td></tr>
                                            ) : (
                                                expenses.map(e => (
                                                    <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', color: '#94A3B8' }}>{e.date}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{e.name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: 700 }}>₹{e.amount.toLocaleString('en-IN')}</td>
                                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
