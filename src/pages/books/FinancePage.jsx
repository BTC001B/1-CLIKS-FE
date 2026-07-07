import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Save, Trash2 } from 'lucide-react';
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
    background: '#ffffff',
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
const card = {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '1.75rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
const sectionH = {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#1E293B',
    marginBottom: '1.25rem',
    paddingBottom: '0.625rem',
    borderBottom: '1px solid #F1F5F9',
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
    const [saved,   setSaved]     = useState(false);
    const [expSaved, setExpSaved] = useState(false);

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
        setTimeout(() => setSaved(false), 2500);
    };

    const handleSaveExpense = (ev) => {
        ev.preventDefault();
        if (!expense.name.trim() || !expense.amount) return;
        const entry = {
            id:     Date.now(),
            date:   new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            name:   expense.name.trim(),
            amount: parseFloat(expense.amount) || 0,
        };
        setExpenses(prev => [entry, ...prev]);
        setExpense(BLANK_EXPENSE);
        setExpSaved(true);
        setTimeout(() => setExpSaved(false), 2500);
    };

    const handleDeleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: 1000, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

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

            {/* ── SECTION 1: Details ── */}
            <div style={card}>
                <div style={sectionH}>Update Your Details</div>
                {saved && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                        ✓ Details saved successfully.
                    </div>
                )}
                <form onSubmit={handleSaveDetails}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        {[
                            ['fullName',    'Full Name',              'text'  ],
                            ['email',       'Email Address',           'email' ],
                            ['phone',       'Phone Number',            'tel'   ],
                            ['salary',      'Monthly Salary',          'number'],
                            ['bonus',       'Bonus (This Month)',      'number'],
                            ['rent',        'Monthly House Rent',      'number'],
                            ['electricity', 'Monthly Electricity Bill','number'],
                            ['grocery',     'Monthly Grocery Budget',  'number'],
                        ].map(([key, label, type]) => (
                            <div key={key}>
                                <label style={lbl}>{label}</label>
                                <input
                                    type={type}
                                    style={inp}
                                    value={details[key]}
                                    min={type === 'number' ? 0 : undefined}
                                    placeholder={label}
                                    onChange={e => setDetails(prev => ({ ...prev, [key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                    <button type="submit" style={saveBtn}><Save size={15} /> Save Details</button>
                </form>
            </div>

            {/* ── SECTION 2: Daily Expense Entry ── */}
            <div style={card}>
                <div style={sectionH}>Update Your Daily Money Spent</div>
                {expSaved && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                        ✓ Expense saved.
                    </div>
                )}
                <form onSubmit={handleSaveExpense}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem', marginBottom: '1.25rem', alignItems: 'end' }}>
                        <div>
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
                        <div>
                            <label style={lbl}>Amount Spent</label>
                            <input
                                type="number"
                                min="0"
                                style={inp}
                                value={expense.amount}
                                placeholder="0"
                                onChange={e => setExpense(prev => ({ ...prev, amount: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" style={saveBtn}><ShoppingCart size={15} /> Save Expense</button>
                </form>

                {/* Expenses table */}
                {expenses.length > 0 && (
                    <div style={{ marginTop: '1.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>Saved Expenses</div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC' }}>
                                        {['Date', 'Purchase Name', 'Amount', ''].map(h => (
                                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(e => (
                                        <tr key={e.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>{e.date}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1E293B' }}>{e.name}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#064E3B' }}>₹{e.amount.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                <button onClick={() => handleDeleteExpense(e.id)}
                                                    style={{ background: '#FEF2F2', border: 'none', borderRadius: '8px', padding: '5px 8px', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Summary card */}
                <div style={{ marginTop: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
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
            </div>
        </div>
    );
};

export default FinancePage;
