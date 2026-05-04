import React, { useState, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { splitExpenseService } from '../services/splitExpenseService';
import EmptyState from '../components/common/EmptyState';
import {
    Plus,
    Search,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
    RefreshCw,
    Users,
    Receipt,
    Calendar,
    ChevronRight,
    CheckCircle2,
    History,
    Percent,
    Hash,
    PieChart,
    ShoppingCart,
    Wallet,
    X
} from 'lucide-react';
import { PageHeader } from '../components/common';

const SplitExpense = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('ALL FRIENDS'); // ALL FRIENDS, RECENT EXPENSES
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [splitType, setSplitType] = useState('equal');
    
    const [formData, setFormData] = useState({ 
        title: '', 
        amount: '', 
        paidBy: 'You', 
        date: new Date().toISOString().split('T')[0],
        participants: [] 
    });
    
    const [items, setItems] = useState([{ id: 1, name: '', amount: '', assignedTo: [] }]);
    const [formError, setFormError] = useState('');

    // ── Queries ─────────────────────────────────────────────────────────────
    
    // Friends Summary
    const { 
        data: summaryResponse, 
        isLoading: isSummaryLoading
    } = useQuery({
        queryKey: ['split-summary'],
        queryFn: () => splitExpenseService.getSummary(),
    });

    // All Expenses List
    const {
        data: expensesResponse,
        isLoading: isExpensesLoading
    } = useQuery({
        queryKey: ['split-expenses-list'],
        queryFn: () => splitExpenseService.getSplits(),
        enabled: activeTab === 'RECENT EXPENSES'
    });

    const friends = useMemo(() => {
        const rawData = summaryResponse?.data !== undefined ? summaryResponse.data : summaryResponse;
        return Array.isArray(rawData) ? rawData : [];
    }, [summaryResponse]);

    const expenses = useMemo(() => {
        const rawData = expensesResponse?.data !== undefined ? expensesResponse.data : expensesResponse;
        return Array.isArray(rawData) ? rawData : [];
    }, [expensesResponse]);

    // ── Mutations ───────────────────────────────────────────────────────────
    
    const createMutation = useMutation({
        mutationFn: (newSplit) => splitExpenseService.createSplit(newSplit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['split-summary'] });
            queryClient.invalidateQueries({ queryKey: ['split-expenses-list'] });
            setIsModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            setFormError(error.message || 'Failed to create split');
        }
    });

    const settleMutation = useMutation({
        mutationFn: (name) => splitExpenseService.settleFriend(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['split-summary'] });
            queryClient.invalidateQueries({ queryKey: ['split-expenses-list'] });
        }
    });

    // ── Logic ──────────────────────────────────────────────────────────────

    const calculateSplits = React.useCallback(() => {
        const totalAmount = parseFloat(formData.amount) || 0;
        const participants = formData.participants;
        if (participants.length === 0) return [];

        let results = [];

        if (splitType === 'equal') {
            const count = participants.length + 1;
            const share = totalAmount / count;
            results = participants.map(p => ({ ...p, share_amount: share }));
            results.push({ name: 'You', share_amount: share, isSelf: true });
        } 
        else if (splitType === 'exact') {
            results = participants.map(p => ({ ...p, share_amount: parseFloat(p.value) || 0 }));
            const sumOthers = results.reduce((s, p) => s + p.share_amount, 0);
            results.push({ name: 'You', share_amount: Math.max(0, totalAmount - sumOthers), isSelf: true });
        } 
        else if (splitType === 'percentage') {
            results = participants.map(p => ({ ...p, share_amount: (parseFloat(p.value) / 100) * totalAmount }));
            const sumPctOthers = participants.reduce((s, p) => s + (parseFloat(p.value) || 0), 0);
            results.push({ name: 'You', share_amount: Math.max(0, ((100 - sumPctOthers) / 100) * totalAmount), isSelf: true });
        } 
        else if (splitType === 'shares') {
            const sumSharesOthers = participants.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
            const totalShares = sumSharesOthers + 1;
            results = participants.map(p => ({ ...p, share_amount: ((parseFloat(p.value) || 0) / totalShares) * totalAmount }));
            results.push({ name: 'You', share_amount: (1 / totalShares) * totalAmount, isSelf: true });
        }
        else if (splitType === 'items') {
            const participantMap = {};
            participants.forEach(p => participantMap[p.name] = 0);
            participantMap['You'] = 0;
            
            items.forEach(item => {
                const itemAmt = parseFloat(item.amount) || 0;
                const shareCount = item.assignedTo.length;
                if (shareCount > 0) {
                    const share = itemAmt / shareCount;
                    item.assignedTo.forEach(name => {
                        if (participantMap[name] !== undefined) participantMap[name] += share;
                    });
                }
            });
            results = participants.map(p => ({ ...p, share_amount: participantMap[p.name] || 0 }));
            results.push({ name: 'You', share_amount: participantMap['You'] || 0, isSelf: true });
        }

        return results;
    }, [formData, splitType, items]);

    const handleAddSplit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount || !formData.date) {
            setFormError('Basic details (Title, Amount, Date) are required');
            return;
        }

        const calculated = calculateSplits();
        const finalParticipants = calculated.filter(p => !p.isSelf);
        
        if (finalParticipants.length === 0) {
            setFormError('Add at least one participant to split with');
            return;
        }

        if (splitType === 'exact') {
            const sumOthers = finalParticipants.reduce((s, p) => s + p.share_amount, 0);
            if (sumOthers > parseFloat(formData.amount)) {
                setFormError('Exact amounts exceed total expense amount');
                return;
            }
        }

        if (splitType === 'percentage') {
            const sumPct = finalParticipants.reduce((s, p) => s + (parseFloat(p.value) || 0), 0);
            if (sumPct > 100) {
                setFormError('Total percentage exceeds 100%');
                return;
            }
        }

        const payload = {
            title: formData.title,
            total_amount: parseFloat(formData.amount),
            date: formData.date,
            split_type: splitType,
            paid_by: formData.paidBy,
            participants: finalParticipants.map(p => ({
                name: p.name,
                share_amount: p.share_amount
            }))
        };

        createMutation.mutate(payload);
    };

    const resetForm = () => {
        setFormData({ title: '', amount: '', paidBy: 'You', date: new Date().toISOString().split('T')[0], participants: [] });
        setItems([{ id: 1, name: '', amount: '', assignedTo: [] }]);
        setSplitType('equal');
        setFormError('');
    };

    const addParticipantField = () => {
        setFormData({ ...formData, participants: [...formData.participants, { name: '', value: '' }] });
    };

    const updateParticipant = (index, field, value) => {
        const newParticipants = [...formData.participants];
        newParticipants[index][field] = value;
        setFormData({ ...formData, participants: newParticipants });
    };

    const removeParticipant = (index) => {
        setFormData({ ...formData, participants: formData.participants.filter((_, i) => i !== index) });
    };

    const openExpenseDetail = async (expense) => {
        try {
            const detail = await splitExpenseService.getSplitById(expense.id);
            setSelectedExpense(detail.data || detail);
        } catch (err) {
            console.error('Failed to fetch expense details', err);
        }
    };

    const totalOwesYou = friends.reduce((sum, f) => sum + parseFloat(f.total_owed || 0), 0);
    const totalYouOwe = 0; 

    const filteredFriends = friends.filter(f => 
        (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredExpenses = expenses.filter(e =>
        (e.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const calculatedPreview = useMemo(() => calculateSplits(), [calculateSplits]);

    return (
        <div className="premium-container">
            <PageHeader 
                title={<>Split <span className="text-highlight">Expenses</span></>}
                subtitle="Track by People or by Trip Details"
                breadcrumb="EXPENSES"
                primaryAction={{
                    label: "New Expense",
                    onClick: () => setIsModalOpen(true)
                }}
            />

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                <div className="premium-card glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#DCFCE7', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowDownLeft size={20} />
                        </div>
                        <span className="label-caps">Total Receivable</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A' }}>₹{totalOwesYou.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="label-caps" style={{ marginTop: '1rem', color: '#10B981' }}>Across {friends.length} people</div>
                </div>

                <div className="premium-card glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="label-caps">Total Payable</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A' }}>₹{totalYouOwe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="label-caps" style={{ marginTop: '1rem', color: '#EF4444' }}>No pending debts</div>
                </div>

                <div className="premium-card glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span className="label-caps">Recent Activity</span>
                        <span style={{ fontWeight: 900, color: '#1B6B3A' }}>{expenses.length} Splits</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(expenses.length * 10, 100)}%`, height: '100%', background: '#1B6B3A', borderRadius: '4px' }}></div>
                    </div>
                    <div className="label-caps" style={{ marginTop: '1rem' }}>Active tracking enabled</div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', borderBottom: '1px solid #F0FDF4', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {['ALL FRIENDS', 'RECENT EXPENSES'].map(tab => (
                        <button
                            key={tab}
                            style={{ 
                                background: 'none', border: 'none', padding: '0 0 1rem 0', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 900, color: activeTab === tab ? '#1B6B3A' : '#94A3B8',
                                borderBottom: activeTab === tab ? '2px solid #1B6B3A' : 'none',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #F0FDF4', width: '320px' }}>
                    <Search size={18} color="#94A3B8" />
                    <input
                        style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontWeight: 600, fontSize: '0.9rem' }}
                        type="text"
                        placeholder={`Search ${activeTab === 'ALL FRIENDS' ? 'people' : 'expenses'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div style={{ marginTop: '2rem' }}>
                {activeTab === 'ALL FRIENDS' ? (
                    isSummaryLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
                            <Loader2 size={40} className="animate-spin" color="#1B6B3A" />
                            <p className="label-caps" style={{ marginTop: '1rem' }}>Fetching balances...</p>
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <EmptyState title="No Friends Found" description="Start a new split to see people listed here." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredFriends.map(friend => (
                                <div key={friend.name} className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${friend.name}`} alt="avatar" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>{friend.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="label-caps" style={{ color: '#1B6B3A' }}>{friend.split_count} Active Splits</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '140px' }}>
                                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10B981' }}>
                                            ₹{(friend.total_owed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                            Owed to You
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-premium secondary" style={{ padding: '8px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>Remind</button>
                                        <button className="btn-premium primary" style={{ padding: '8px 14px', fontSize: '0.8rem', background: '#1B6B3A', cursor: 'pointer' }} onClick={() => settleMutation.mutate(friend.name)}>Settle</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    isExpensesLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
                            <Loader2 size={40} className="animate-spin" color="#1B6B3A" />
                            <p className="label-caps" style={{ marginTop: '1rem' }}>Loading history...</p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <EmptyState title="No Recent Activity" description="Save your first expense to see it here." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredExpenses.map(expense => (
                                <div key={expense.id} className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }} onClick={() => openExpenseDetail(expense)}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                        <Receipt size={28} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>{expense.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Users size={14} /> {expense.participant_count} People
                                            </div>
                                            <div className="label-caps">Paid by {expense.paid_by}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '140px' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{expense.total_amount.toLocaleString('en-IN')}</div>
                                        <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                            <Calendar size={14} /> {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                    <div style={{ color: '#CBD5E1' }}>
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Expense Detail Modal */}
            <AnimatePresence>
                {selectedExpense && (
                    <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="premium-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }} onClick={e => e.stopPropagation()}
                        >
                            <div className="card-header">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Expense Details</h3>
                                <button className="icon-btn" onClick={() => setSelectedExpense(null)}><X size={24} /></button>
                            </div>
                            
                            <div style={{ padding: '2rem' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>{selectedExpense.title}</h3>
                                    <div className="label-caps">{new Date(selectedExpense.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
                                </div>

                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                                    <div>
                                        <label className="label-caps" style={{ fontSize: '9px' }}>Amount</label>
                                        <div style={{ fontWeight: 900, color: '#1B6B3A' }}>₹{selectedExpense.total_amount.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div>
                                        <label className="label-caps" style={{ fontSize: '9px' }}>Paid By</label>
                                        <div style={{ fontWeight: 900 }}>{selectedExpense.paid_by}</div>
                                    </div>
                                    <div>
                                        <label className="label-caps" style={{ fontSize: '9px' }}>Type</label>
                                        <div style={{ fontWeight: 900, textTransform: 'capitalize' }}>{selectedExpense.split_type}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h4 className="label-caps">Breakdown</h4>
                                    {selectedExpense.participants?.map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px', background: '#F8FAFC', borderRadius: '14px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #F0FDF4' }}>
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.name}</div>
                                                <div className="label-caps" style={{ fontSize: '8px', color: p.is_settled ? '#10B981' : '#94A3B8' }}>{p.is_settled ? 'Settle' : 'Pending'}</div>
                                            </div>
                                            <div style={{ fontWeight: 900 }}>₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                            {p.is_settled ? <CheckCircle2 size={18} color="#10B981" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0' }}></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card-header" style={{ border: 'none', borderTop: '1px solid #F0FDF4', padding: '1.5rem', justifyContent: 'flex-end' }}>
                                <button className="btn-premium primary">Edit Split</button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="premium-card" style={{ width: '100%', maxWidth: '720px', background: 'white', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '26px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                        >
                            <div className="card-header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>New Expense</h2>
                                <button className="icon-btn" onClick={() => setIsModalOpen(false)} style={{ background: '#F8FAFC', borderRadius: '50%' }}><X size={20} color="#64748B" /></button>
                            </div>
                            
                            <form onSubmit={handleAddSplit} style={{ overflowY: 'auto', flex: 1, background: '#FAFAFA' }}>
                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    
                                    {/* Description and amount row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label className="label-caps" style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.05em' }}>Description</label>
                                            <input 
                                                className="premium-input"
                                                style={{ padding: '12px 16px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.925rem', fontWeight: '500' }}
                                                type="text" value={formData.title} 
                                                onChange={e => setFormData({...formData, title: e.target.value})}
                                                placeholder="e.g. Food, Flight, Event"
                                            />
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label className="label-caps" style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.05em' }}>Total Amount (₹)</label>
                                            <input 
                                                className="premium-input"
                                                style={{ padding: '12px 16px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: 900, color: '#1B6B3A', fontSize: '1.1rem' }}
                                                type="number" value={formData.amount} 
                                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Who paid & Date row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label className="label-caps" style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.05em' }}>Who Paid?</label>
                                            <select 
                                                className="premium-input"
                                                style={{ padding: '12px 16px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.925rem', fontWeight: '600' }}
                                                value={formData.paidBy} 
                                                onChange={e => setFormData({...formData, paidBy: e.target.value})}
                                            >
                                                <option value="You">You</option>
                                                {formData.participants.map(p => p.name && (
                                                    <option key={p.name} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label className="label-caps" style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.05em' }}>Date</label>
                                            <input 
                                                className="premium-input" 
                                                style={{ padding: '12px 16px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.925rem', fontWeight: '600' }}
                                                type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    {/* Split method selectors */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label className="label-caps" style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.05em' }}>Split Method</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                                            {[
                                                { id: 'equal', label: 'Equally', icon: Users },
                                                { id: 'exact', label: 'Exact', icon: Hash },
                                                { id: 'percentage', label: 'Percent', icon: Percent },
                                                { id: 'shares', label: 'Shares', icon: PieChart },
                                                { id: 'items', label: 'Items', icon: ShoppingCart }
                                            ].map(type => (
                                                <button 
                                                    key={type.id} type="button" 
                                                    style={{ 
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 8px',
                                                        borderRadius: '18px', border: splitType === type.id ? '2px solid #1B6B3A' : '1px solid #E2E8F0',
                                                        background: splitType === type.id ? '#FFFFFF' : '#FAFAFA', cursor: 'pointer', transition: 'all 0.2s',
                                                        boxShadow: splitType === type.id ? '0 4px 12px -2px rgba(27,107,58,0.1)' : 'none'
                                                    }}
                                                    onClick={() => setSplitType(type.id)}
                                                >
                                                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: splitType === type.id ? '#1B6B3A' : '#F1F5F9', color: splitType === type.id ? 'white' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <type.icon size={18} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: splitType === type.id ? '#1B6B3A' : '#1E293B' }}>{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Split participants */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="label-caps" style={{ color: '#64748B', fontSize: '0.72rem', letterSpacing: '0.05em', margin: 0 }}>Split With</label>
                                            <button 
                                                type="button" onClick={addParticipantField} 
                                                style={{ 
                                                    padding: '6px 14px', fontSize: '0.75rem', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #E2E8F0', 
                                                    color: '#334155', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' 
                                                }}
                                            >
                                                <Plus size={14} /> Add Friend
                                            </button>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {formData.participants.map((p, index) => (
                                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 14px', background: 'white', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                                                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name || 'default'}`} alt="" />
                                                    </div>
                                                    <input 
                                                        className="premium-input" style={{ margin: 0, padding: '8px 12px', flex: 2, background: 'transparent', border: 'none', borderBottom: '1px solid #E2E8F0', borderRadius: 0, outline: 'none', fontSize: '0.9rem', fontWeight: '600' }}
                                                        type="text" placeholder="Name" 
                                                        value={p.name} 
                                                        onChange={e => updateParticipant(index, 'name', e.target.value)} 
                                                    />
                                                    {splitType !== 'equal' && (
                                                        <input 
                                                            className="premium-input" style={{ margin: 0, padding: '8px 12px', flex: 1, border: '1px solid #E2E8F0', borderRadius: '10px', background: '#FAFAFA', outline: 'none', fontWeight: '800', textAlign: 'right', fontSize: '0.9rem' }}
                                                            type="number" value={p.value} 
                                                            onChange={e => updateParticipant(index, 'value', e.target.value)} 
                                                            placeholder={splitType === 'percentage' ? '%' : 'Val'}
                                                        />
                                                    )}
                                                    <button type="button" onClick={() => removeParticipant(index)} className="icon-btn" style={{ color: '#94A3B8', border: 'none', background: 'transparent' }}><X size={18} /></button>
                                                </div>
                                            ))}
                                            {formData.participants.length === 0 && (
                                                <div style={{ border: '2px dashed #CBD5E1', borderRadius: '20px', padding: '24px', background: '#FFFFFF', textAlign: 'center', cursor: 'pointer', color: '#64748B' }} onClick={addParticipantField}>
                                                    <Users size={32} style={{ margin: '0 auto 10px', color: '#94A3B8' }} />
                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Start adding friends to split</div>
                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Click "Add Friend" to add the first person</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {calculatedPreview.length > 0 && formData.amount > 0 && (
                                        <div style={{ background: '#0F172A', borderRadius: '22px', padding: '1.25rem 1.5rem', color: 'white' }}>
                                            <div className="label-caps" style={{ color: '#64748B', fontSize: '0.7rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>Live Calculation Breakdown</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {calculatedPreview.map((p, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 750, color: p.isSelf ? '#34D399' : '#F1F5F9', fontSize: '0.9rem' }}>{p.name} {p.isSelf && '(You)'}</span>
                                                        <div style={{ flex: 1, borderBottom: '1px dotted rgba(255,255,255,0.15)', margin: '0 0.75rem' }}></div>
                                                        <span style={{ fontWeight: 900, color: p.isSelf ? '#34D399' : '#38BDF8', fontSize: '0.95rem' }}>₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ))}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                                    <span style={{ fontWeight: 850, color: 'white', fontSize: '0.95rem' }}>Total</span>
                                                    <div style={{ flex: 1, borderBottom: '1px dotted rgba(255,255,255,0.25)', margin: '0 0.75rem' }}></div>
                                                    <span style={{ fontWeight: 900, color: 'white', fontSize: '1.05rem' }}>₹{calculatedPreview.reduce((sum, p) => sum + p.share_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {formError && <div style={{ background: '#FFF1F2', color: '#E11D48', padding: '12px', borderRadius: '14px', margin: '0 2rem', fontWeight: 800, textAlign: 'center', border: '1px solid #FFE4E6', fontSize: '0.85rem' }}>{formError}</div>}
                                <div className="card-header" style={{ border: 'none', borderTop: '1px solid #F1F5F9', padding: '1.5rem 2rem', justifyContent: 'flex-end', gap: '1rem', background: 'white' }}>
                                    <button type="button" className="btn-premium secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: '14px', fontWeight: '750', fontSize: '0.9rem' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '14px', fontWeight: '800', background: 'linear-gradient(135deg, #1B6B3A 0%, #0D5C32 100%)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Saving...' : 'Save Expense'}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SplitExpense;
