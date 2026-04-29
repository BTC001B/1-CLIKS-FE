import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsService } from '../services';
import '../App.css';
import '../styles/modals.css';
import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Budget icon options the user can pick
const ICON_OPTIONS = [
    { label: 'Shopping',       value: 'shopping',  Icon: ShoppingBag },
    { label: 'Transport',      value: 'car',       Icon: Car        },
    { label: 'Entertainment',  value: 'coffee',    Icon: Coffee      },
    { label: 'Utilities',      value: 'zap',       Icon: Zap        },
    { label: 'Healthcare',     value: 'health',    Icon: HeartPulse  },
    { label: 'Housing',        value: 'home',      Icon: Home        },
    { label: 'Work',           value: 'work',      Icon: Briefcase   },
    { label: 'Other',          value: 'other',     Icon: Globe       },
];

import {
    ShoppingBag,
    Car,
    Coffee,
    Zap,
    HeartPulse,
    Home,
    Briefcase,
    Globe,
    Plus,
    Wallet,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Edit2,
    X
} from 'lucide-react';

const COLOR_POOL = ['orange', 'blue', 'purple', 'green', 'red', 'indigo'];

const EMPTY_FORM = { category: '', limit: '', spent: '', iconValue: 'shopping' };

const BudgetStat = (props) => {
    const { label, value, subtext, icon: Icon, colorClass } = props;
    return (
    <div className="budget-stat-card">
        <div className="flex justify-between items-start">
            <div>
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className={`stat-icon-wrapper ${colorClass}`}>
                <Icon size={20} />
            </div>
        </div>
        <p className={`stat-subtext ${subtext.includes('Over') || subtext.includes('utilized') ? 'text-blue' : 'text-green'}`}>{subtext}</p>
    </div>
    );
};

const Budgets = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');

    // Fetch budgets
    const { data: budgets = [], isLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            const data = await budgetsService.getBudgets();
            return data.map((b, idx) => ({
                id: b.id,
                category: b.category,
                limit: parseFloat(b.limit),
                spent: parseFloat(b.spent || 0),
                color: b.color || COLOR_POOL[idx % COLOR_POOL.length],
                iconValue: b.icon_value || b.iconValue || 'shopping'
            }));
        }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (newBudget) => budgetsService.createBudget(newBudget),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            closeModal();
        },
        onError: (err) => {
            setFormError(err.message || 'Failed to create budget.');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => budgetsService.deleteBudget(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }
    });

    const openModal = () => {
        setFormData(EMPTY_FORM);
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.category || !formData.limit) {
            setFormError('Category and monthly limit are required.');
            return;
        }

        const colorIndex = budgets.length % COLOR_POOL.length;
        const newBudget = {
            category: formData.category,
            limit: parseFloat(formData.limit),
            spent: formData.spent ? parseFloat(formData.spent) : 0,
            color: COLOR_POOL[colorIndex],
            icon_value: formData.iconValue,
        };

        createMutation.mutate(newBudget);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            deleteMutation.mutate(id);
        }
    };

    const totalAllocated = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent     = budgets.reduce((s, b) => s + b.spent, 0);
    const remaining      = totalAllocated - totalSpent;

    const getIcon = (iconValue) => {
        const match = ICON_OPTIONS.find((o) => o.value === iconValue);
        return match ? match.Icon : Globe;
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #E3F2FD', borderTopColor: '#3B82F6', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="page-fade-in">
            <div className="dashboard-header">
                <div>
                    <p className="text-muted text-sm mt-1">Plan and track your monthly spending limits</p>
                </div>
                <button className="btn-primary" onClick={openModal}>
                    <Plus size={18} />
                    <span>Create Budget</span>
                </button>
            </div>

            <div className="content-wrapper">
                {/* Stats Grid */}
                <div className="budget-stats-grid">
                    <BudgetStat label="Total Budget" value={`$${totalAllocated.toLocaleString()}`} subtext="Monthly Cap"                                          icon={Wallet}        colorClass="icon-blue"   />
                    <BudgetStat label="Total Spent"  value={`$${totalSpent.toLocaleString()}`}     subtext={`${((totalSpent / (totalAllocated || 1)) * 100).toFixed(1)}% utilized`} icon={TrendingUp}    colorClass="icon-orange" />
                    <BudgetStat label="Remaining"    value={`$${Math.abs(remaining).toLocaleString()}`} subtext={remaining >= 0 ? 'Safe margin' : 'Over budget'} icon={remaining >= 0 ? CheckCircle : AlertCircle} colorClass={remaining >= 0 ? 'icon-green' : 'icon-red'} />
                </div>

                {/* Budget Cards */}
                <div className="budget-cards-container">
                    {budgets.map((budget) => {
                        const BudgetIcon = getIcon(budget.iconValue);
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        const isOver = budget.spent > budget.limit;

                        return (
                            <div key={budget.id} className="budget-card">
                                <div className="budget-card-header">
                                    <div className="flex items-center gap-3">
                                        <div className={`category-icon bg-${budget.color}`}>
                                            <BudgetIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-main">{budget.category}</h3>
                                            <p className="text-xs text-muted">Monthly limit</p>
                                        </div>
                                    </div>
                                    <button className="icon-btn-ghost" onClick={() => handleDelete(budget.id)} title="Delete">
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                <div className="budget-values">
                                    <div>
                                        <span className="text-xl font-bold text-main">${budget.spent}</span>
                                        <span className="text-sm text-muted"> / ${budget.limit}</span>
                                    </div>
                                    <div className={`text-percentage ${isOver ? 'text-red' : ''}`}>
                                        {Math.round((budget.spent / budget.limit) * 100)}%
                                    </div>
                                </div>

                                <div className="progress-bar-bg">
                                    <div
                                        className={`progress-bar-fill ${isOver ? 'bg-red' : `bg-${budget.color}`}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <div className="budget-footer text-sm">
                                    {isOver ? (
                                        <span className="text-red flex items-center gap-1 font-medium">
                                            <AlertCircle size={14} /> Over by ${budget.spent - budget.limit}
                                        </span>
                                    ) : (
                                        <span className="text-muted">${budget.limit - budget.spent} left</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Create Budget Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <Motion.div
                            className="modal-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Create Budget</h2>
                                <button className="modal-close-btn" onClick={closeModal}><X size={16} /></button>
                            </div>

                            <form className="modal-form" onSubmit={handleSubmit}>
                                <div className="modal-field">
                                    <label className="modal-label">Category Name</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="e.g. Groceries"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>

                                <div className="modal-row">
                                    <div className="modal-field">
                                        <label className="modal-label">Monthly Limit ($)</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            placeholder="0"
                                            min="0"
                                            value={formData.limit}
                                            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-field">
                                        <label className="modal-label">Current Spending ($)</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            placeholder="0 (optional)"
                                            min="0"
                                            value={formData.spent}
                                            onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="modal-field">
                                    <label className="modal-label">Icon</label>
                                    <select
                                        className="modal-select"
                                        value={formData.iconValue}
                                        onChange={(e) => setFormData({ ...formData, iconValue: e.target.value })}
                                    >
                                        {ICON_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {formError && <p className="modal-error">{formError}</p>}

                                <div className="modal-footer">
                                    <button type="button" className="modal-btn-cancel" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="modal-btn-submit">Create Budget</button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .page-fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .budget-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .budget-stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .stat-label { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .stat-subtext { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }
                .text-green { color: #16A34A; }
                .text-red { color: #DC2626; }

                .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .icon-blue { background: #DBEAFE; color: #2563EB; }
                .icon-orange { background: #FFEDD5; color: #F97316; }
                .icon-green { background: #DCFCE7; color: #16A34A; }
                .icon-red { background: #FEE2E2; color: #EF4444; }

                .budget-cards-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                .budget-card {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .budget-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

                .budget-card-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
                
                .category-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
                .bg-orange { background: #F97316; }
                .bg-blue { background: #3B82F6; }
                .bg-purple { background: #A855F7; }
                .bg-green { background: #22C55E; }
                .bg-red { background: #EF4444; }
                .bg-indigo { background: #6366F1; }

                .icon-btn-ghost { color: var(--text-muted); padding: 0.5rem; border-radius: 6px; transition: background 0.2s; }
                .icon-btn-ghost:hover { background: #F1F5F9; color: var(--text-main); }

                .budget-values { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.75rem; }
                .text-percentage { font-weight: 700; color: var(--text-main); }
                
                .progress-bar-bg { width: 100%; height: 8px; background: #F1F5F9; border-radius: 99px; overflow: hidden; margin-bottom: 1rem; }
                .progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease-out; }

                .budget-footer { display: flex; justify-content: flex-end; font-weight: 500; }
            `}</style>
        </div>
    );
};

export default Budgets;
