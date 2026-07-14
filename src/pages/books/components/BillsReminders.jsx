import React, { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Bell, Plus, Trash2, Repeat } from 'lucide-react';

const BillsReminders = ({ bills = [], onUpdateBills, currencySymbol = '₹' }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '', repeat: 'Monthly' });

    const handleAddBill = (e) => {
        e.preventDefault();
        if (!newBill.name.trim() || !newBill.amount || !newBill.dueDate) return;

        const bill = {
            id: Date.now(),
            name: newBill.name,
            amount: parseFloat(newBill.amount) || 0,
            dueDate: newBill.dueDate,
            repeat: newBill.repeat,
            status: 'Pending'
        };

        onUpdateBills([...bills, bill]);
        setNewBill({ name: '', amount: '', dueDate: '', repeat: 'Monthly' });
        setShowAddForm(false);
    };

    const handleDeleteBill = (id) => {
        onUpdateBills(bills.filter(b => b.id !== id));
    };

    const handleToggleStatus = (id) => {
        const updated = bills.map(b => {
            if (b.id === id) {
                return { ...b, status: b.status === 'Paid' ? 'Pending' : 'Paid' };
            }
            return b;
        });
        onUpdateBills(updated);
    };

    // Calculate dynamic status
    const getBillStatus = (bill) => {
        if (bill.status === 'Paid') return 'Paid';
        const today = new Date().toISOString().split('T')[0];
        if (bill.dueDate < today) return 'Overdue';
        return 'Pending';
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid':
                return { background: '#D1FAE5', color: '#065F46' };
            case 'Overdue':
                return { background: '#FEE2E2', color: '#991B1B' };
            default:
                return { background: '#FEF3C7', color: '#92400E' };
        }
    };

    const overdueBills = bills.filter(b => getBillStatus(b) === 'Overdue');

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Bell size={20} style={{ color: '#7C3AED' }} /> Bills & Reminders
                </h3>
                
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    <Plus size={14} /> Add Bill
                </button>
            </div>

            {/* Overdue Alert Notification */}
            {overdueBills.length > 0 && (
                <div style={{
                    background: '#FEF2F2',
                    borderLeft: '4px solid #EF4444',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#991B1B',
                    fontSize: '0.85rem',
                    fontWeight: 600
                }}>
                    <AlertTriangle size={18} style={{ color: '#EF4444' }} />
                    <span>You have {overdueBills.length} outstanding overdue bill(s) that require immediate payment!</span>
                </div>
            )}

            {/* Add Bill Form Overlay/Panel */}
            {showAddForm && (
                <form onSubmit={handleAddBill} style={{
                    background: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Bill Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. Server Hosting"
                                value={newBill.name}
                                onChange={e => setNewBill({ ...newBill, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Amount</label>
                            <input 
                                type="number"
                                required
                                placeholder="e.g. 5000"
                                value={newBill.amount}
                                onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Due Date</label>
                            <input 
                                type="date"
                                required
                                value={newBill.dueDate}
                                onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Repeat Cycle</label>
                            <select
                                value={newBill.repeat}
                                onChange={e => setNewBill({ ...newBill, repeat: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Cancel</button>
                        <button type="submit" style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Create Bill</button>
                    </div>
                </form>
            )}

            {/* List */}
            {bills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                    No recurring bills set up. Add your first bill reminder!
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>
                                <th style={{ padding: '0.75rem 1rem' }}>Bill Details</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Due Date</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Repeat</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => {
                                const currentStatus = getBillStatus(bill);
                                const badgeStyle = getStatusStyle(currentStatus);
                                return (
                                    <tr key={bill.id} style={{ borderBottom: '1px solid #F8FAFC', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>{bill.name}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#0F172A', fontWeight: 750 }}>{currencySymbol}{bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: currentStatus === 'Overdue' ? '#EF4444' : '#475569' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={13} /> {bill.dueDate}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#64748B', fontSize: '0.78rem' }}>
                                                <Repeat size={12} /> {bill.repeat}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                ...badgeStyle
                                            }}>{currentStatus}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleToggleStatus(bill.id)}
                                                    style={{
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${bill.status === 'Paid' ? '#CBD5E1' : '#10B981'}`,
                                                        background: 'white',
                                                        color: bill.status === 'Paid' ? '#64748B' : '#10B981',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {bill.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBill(bill.id)}
                                                    style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                                                    onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
                                                    onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BillsReminders;
