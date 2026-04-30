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
        isLoading: isSummaryLoading, 
        refetch: refetchSummary 
    } = useQuery({
        queryKey: ['split-summary'],
        queryFn: () => splitExpenseService.getSummary(),
    });

    // All Expenses List
    const {
        data: expensesResponse,
        isLoading: isExpensesLoading,
        refetch: refetchExpenses
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
            results.push({ name: 'You', share_amount: totalAmount - sumOthers, isSelf: true });
        } 
        else if (splitType === 'percentage') {
            results = participants.map(p => ({ ...p, share_amount: (parseFloat(p.value) / 100) * totalAmount }));
            const sumPctOthers = participants.reduce((s, p) => s + (parseFloat(p.value) || 0), 0);
            results.push({ name: 'You', share_amount: ((100 - sumPctOthers) / 100) * totalAmount, isSelf: true });
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

    const totalOwesYou = friends.reduce((sum, f) => sum + (f.total_owed || 0), 0);
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
                        <div className="dashboard-grid">
                            {filteredFriends.map(friend => (
                                <div key={friend.name} className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F0FDF4' }}>
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${friend.name}`} alt="avatar" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{friend.name}</div>
                                            <div className="label-caps" style={{ color: '#1B6B3A' }}>{friend.split_count} Active Splits</div>
                                        </div>
                                    </div>
                                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                                        <div className="label-caps" style={{ marginBottom: '4px' }}>Owed to You</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>
                                            ₹{(friend.total_owed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <button className="btn-premium secondary" style={{ justifyContent: 'center' }}>Remind</button>
                                        <button className="btn-premium primary" style={{ justifyContent: 'center' }} onClick={() => settleMutation.mutate(friend.name)}>Settle</button>
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
                            className="premium-card" style={{ width: '100%', maxWidth: '700px', background: 'white', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="card-header">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>New Expense</h2>
                                <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                            </div>
                            
                            <form onSubmit={handleAddSplit} style={{ overflowY: 'auto', flex: 1 }}>
                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                                            <div className="form-group">
                                                <label className="label-caps">Description</label>
                                                <input 
                                                    className="premium-input"
                                                    type="text" value={formData.title} 
                                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                                    placeholder="e.g. Dinner, Trip"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="label-caps">Total Amount (₹)</label>
                                                <input 
                                                    className="premium-input"
                                                    style={{ fontWeight: 900, color: '#1B6B3A' }}
                                                    type="number" value={formData.amount} 
                                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="form-group">
                                                <label className="label-caps">Who Paid?</label>
                                                <select 
                                                    className="premium-input"
                                                    value={formData.paidBy} 
                                                    onChange={e => setFormData({...formData, paidBy: e.target.value})}
                                                >
                                                    <option value="You">You</option>
                                                    {formData.participants.map(p => p.name && (
                                                        <option key={p.name} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="label-caps">Date</label>
                                                <input className="premium-input" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <label className="label-caps">Split Method</label>
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
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px',
                                                        borderRadius: '16px', border: splitType === type.id ? '2px solid #1B6B3A' : '1px solid #F0FDF4',
                                                        background: splitType === type.id ? '#F0FDF4' : '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => setSplitType(type.id)}
                                                >
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: splitType === type.id ? '#1B6B3A' : 'white', color: splitType === type.id ? 'white' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <type.icon size={20} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: splitType === type.id ? '#1B6B3A' : '#64748B' }}>{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                                            <label className="label-caps">Split With</label>
                                            <button type="button" onClick={addParticipantField} className="btn-premium secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                <Plus size={14} /> Add Friend
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {formData.participants.map((p, index) => (
                                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '8px 12px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F0FDF4' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', border: '1px solid #F0FDF4', overflow: 'hidden' }}>
                                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name || 'default'}`} alt="" />
                                                    </div>
                                                    <input 
                                                        className="premium-input" style={{ margin: 0, padding: '8px 12px', flex: 2 }}
                                                        type="text" placeholder="Name" 
                                                        value={p.name} 
                                                        onChange={e => updateParticipant(index, 'name', e.target.value)} 
                                                    />
                                                    {splitType !== 'equal' && (
                                                        <input 
                                                            className="premium-input" style={{ margin: 0, padding: '8px 12px', flex: 1 }}
                                                            type="number" value={p.value} 
                                                            onChange={e => updateParticipant(index, 'value', e.target.value)} 
                                                            placeholder={splitType === 'percentage' ? '%' : 'Val'}
                                                        />
                                                    )}
                                                    <button type="button" onClick={() => removeParticipant(index)} className="icon-btn" style={{ color: '#94A3B8' }}><X size={18} /></button>
                                                </div>
                                            ))}
                                            {formData.participants.length === 0 && (
                                                <div style={{ border: '2px dashed #F0FDF4', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', color: '#94A3B8' }} onClick={addParticipantField}>
                                                    <Users size={32} style={{ margin: '0 auto 12px' }} />
                                                    <div style={{ fontWeight: 800 }}>Start adding friends to split</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {calculatedPreview.length > 0 && formData.amount > 0 && (
                                        <div style={{ background: '#0F172A', borderRadius: '24px', padding: '1.5rem', color: 'white' }}>
                                            <div className="label-caps" style={{ color: '#64748B', marginBottom: '1rem' }}>Live Preview</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {calculatedPreview.map((p, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 800, color: p.isSelf ? 'white' : '#94A3B8' }}>{p.name}</span>
                                                        <div style={{ flex: 1, borderBottom: '1px dotted rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>
                                                        <span style={{ fontWeight: 900, color: p.isSelf ? '#22C55E' : '#38BDF8' }}>₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {formError && <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '12px', borderRadius: '12px', margin: '0 2rem', fontWeight: 800, textAlign: 'center', border: '1px solid #FECACA' }}>{formError}</div>}
                                <div className="card-header" style={{ border: 'none', borderTop: '1px solid #F0FDF4', padding: '1.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-premium secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-premium primary" disabled={createMutation.isPending}>
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
