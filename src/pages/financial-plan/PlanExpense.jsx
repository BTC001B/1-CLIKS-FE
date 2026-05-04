import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../../lib/formatCurrency';
import { financialPlanService } from '../../services';
import { 
    Plus, 
    DollarSign, 
    TrendingUp, 
    Wallet, 
    Search, 
    Filter, 
    ChevronDown, 
    Edit, 
    Trash2, 
    X 
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../../components/common';
import './financial-plan.css';

const EMPTY_FORM = { item: '', category: '', estimatedCost: '', plannedMonth: '' };
const PlanExpense = () => {
    const queryClient = useQueryClient();

    // 1. Fetch available plans
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['financial-plans'],
        queryFn: async () => {
            const res = await financialPlanService.getPlans();
            return res.data || res;
        }
    });

    const activePlanId = plans.length > 0 ? plans[0].id : null;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData]       = useState(EMPTY_FORM);
    const [formError, setFormError]     = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Expenses
    const { data: plannedExpenses = [], isLoading: expensesLoading } = useQuery({
        queryKey: ['plan-expenses', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return [];
            const data = await financialPlanService.getPlanExpenses(activePlanId);
            return data.map(item => ({
                id: item.id,
                item: item.item || item.title,
                category: item.category,
                estimatedCost: parseFloat(item.amount || item.estimated_cost),
                plannedMonth: item.date || item.planned_month
            }));
        },
        enabled: !!activePlanId
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (newExpense) => financialPlanService.createPlanExpense(activePlanId, newExpense),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-expenses', activePlanId] });
            closeModal();
        },
        onError: (err) => {
            setFormError(err.message || 'Failed to add expense.');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => financialPlanService.deletePlanExpense(activePlanId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-expenses', activePlanId] });
        }
    });

    const isLoading = plansLoading || (activePlanId && expensesLoading);


    const openModal = () => {
        setFormData(EMPTY_FORM);
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!formData.item || !formData.category || !formData.estimatedCost || !formData.plannedMonth) {
            setFormError('All fields are required.');
            return;
        }

        const newExpense = {
            item: formData.item,
            category: formData.category,
            amount: parseFloat(formData.estimatedCost),
            date: formData.plannedMonth,
        };

        createMutation.mutate(newExpense);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this planned expense?')) {
            deleteMutation.mutate(id);
        }
    };

    const totalProjected = plannedExpenses.reduce((sum, item) => sum + item.estimatedCost, 0);
    const monthlyAverage =
        plannedExpenses.length > 0 ? totalProjected / plannedExpenses.length : 0;

    const filteredExpenses = plannedExpenses.filter(
        (item) =>
            item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#DC2626', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="expense-module">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>Expense</h1>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.3rem' }}>Track and prepare for upcoming large expenses</p>
                </div>
                <button className="btn-premium primary" onClick={openModal}>
                    <Plus size={16} />
                    <span>Add Expense</span>
                </button>
            </div>

            <div className="stats-grid">
                <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEE2E2', color: '#B91C1C' }}>
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <span className="label-caps">Total Planned</span>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{formatCurrency(totalProjected)}</h3>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFEDD5', color: '#C2410C' }}>
                        <TrendingUp size={22} />
                    </div>
                    <div>
                        <span className="label-caps">Monthly Average</span>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{formatCurrency(monthlyAverage)}</h3>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E0E7FF', color: '#4338CA' }}>
                        <Wallet size={22} />
                    </div>
                    <div>
                        <span className="label-caps">Upcoming Items</span>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{plannedExpenses.length}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #F0FDF4', padding: '0.6rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #F0FDF4', borderRadius: '8px', padding: '0.45rem 0.75rem', width: '260px' }}>
                    <Search size={15} style={{ color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', color: '#1E293B', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn-premium secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.845rem' }}>
                        <Filter size={14} />
                        Filter
                    </button>
                    <button className="btn-premium secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.845rem' }}>
                        Sort By
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {filteredExpenses.length === 0 ? (
                <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <EmptyState
                        title="No expenses planned yet"
                        description="Add your first planned expense to start preparing your budget."
                    />
                </div>
            ) : (
                <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #F0FDF4' }}>
                            <tr>
                                <th style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expense Name</th>
                                <th style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</th>
                                <th style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</th>
                                <th style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} style={{ borderBottom: '1px solid #F0FDF4' }}>
                                    <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{expense.item}</td>
                                    <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.875rem' }}>
                                        <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#F0FDF4', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>{expense.category}</span>
                                    </td>
                                    <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: 700, color: '#1E293B' }}>{formatCurrency(expense.estimatedCost)}</td>
                                    <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.875rem', color: '#64748B' }}>{expense.plannedMonth}</td>
                                    <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                                            <button className="icon-btn" title="Edit"><Edit size={15} /></button>
                                            <button className="icon-btn" style={{ color: '#EF4444' }} title="Delete" onClick={() => handleDelete(expense.id)}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <Motion.div
                            className="premium-card"
                            style={{ background: 'white', padding: '2rem', width: '100%', maxWidth: '460px' }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Add Planned Expense</h2>
                                <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
                            </div>

                            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleAddExpense}>
                                <div>
                                    <label className="label-caps">Expense Name</label>
                                    <input
                                        className="premium-input"
                                        type="text"
                                        placeholder="e.g. New Laptop"
                                        value={formData.item}
                                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Category</label>
                                    <input
                                        className="premium-input"
                                        type="text"
                                        placeholder="e.g. Electronics"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Amount</label>
                                    <input
                                        className="premium-input"
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.estimatedCost}
                                        onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Date</label>
                                    <input
                                        className="premium-input"
                                        type="date"
                                        value={formData.plannedMonth}
                                        onChange={(e) => setFormData({ ...formData, plannedMonth: e.target.value })}
                                    />
                                </div>

                                {formError && <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 700, margin: 0 }}>{formError}</p>}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-premium secondary" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn-premium primary">Save Expense</button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlanExpense;
