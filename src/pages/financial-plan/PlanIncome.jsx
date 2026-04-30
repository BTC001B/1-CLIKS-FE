import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { 
    Plus, 
    TrendingUp, 
    Search, 
    Edit, 
    Trash2, 
    X,
    ArrowUpRight,
    PieChart,
    Calendar,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/formatCurrency';

const EMPTY_FORM = { source: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] };

const PlanIncome = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Fetch available plans
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['financial-plans'],
        queryFn: async () => {
            const res = await financialPlanService.getPlans();
            return res.data || res;
        }
    });

    const activePlanId = plans.length > 0 ? plans[0].id : null;

    // Fetch Income Sources
    const { data: incomeSources = [], isLoading: incomeLoading } = useQuery({
        queryKey: ['plan-income', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return [];
            const data = await financialPlanService.getPlanIncome(activePlanId);
            return data.map(item => ({
                id: item.id,
                source: item.source,
                category: item.category,
                amount: parseFloat(item.actual_amount || item.amount || item.expected_amount || 0),
                date: item.date
            }));
        },
        enabled: !!activePlanId
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (newIncome) => financialPlanService.createPlanIncome(activePlanId, newIncome),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-income', activePlanId] });
            queryClient.invalidateQueries({ queryKey: ['plan-analysis', activePlanId] });
            closeModal();
        },
        onError: (err) => {
            setFormError(err.message || 'Failed to add income.');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => financialPlanService.deletePlanIncome(activePlanId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-income', activePlanId] });
            queryClient.invalidateQueries({ queryKey: ['plan-analysis', activePlanId] });
        }
    });

    const isLoading = plansLoading || (activePlanId && incomeLoading);

    const openModal = () => {
        setFormData(EMPTY_FORM);
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const handleAddIncome = (e) => {
        e.preventDefault();
        if (!formData.source || !formData.category || !formData.amount || !formData.date) {
            setFormError('All fields are required.');
            return;
        }

        const newIncome = {
            source: formData.source,
            category: formData.category,
            expected_amount: parseFloat(formData.amount),
            actual_amount: parseFloat(formData.amount),
            date: formData.date,
        };

        createMutation.mutate(newIncome);
    };

    const totalIncome = incomeSources.reduce((sum, item) => sum + item.amount, 0);
    const filteredSources = incomeSources.filter(
        (item) =>
            item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="income-loader">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="income-module">
            <div className="premium-card glass" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', padding: '2.5rem', borderRadius: '32px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <span className="label-caps" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Volume</span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0', letterSpacing: '-1.5px' }}>{formatCurrency(totalIncome)}</h1>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Combined earnings from {incomeSources.length} sources</p>
                </div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }}><TrendingUp size={160} /></div>
            </div>

            <div className="stats-grid">
                <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0FDF4', color: '#10B981' }}><PieChart size={20} /></div>
                    <div>
                        <span className="label-caps">Efficiency</span>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0' }}>Active</h4>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0FDF4', color: '#10B981' }}><Calendar size={20} /></div>
                    <div>
                        <span className="label-caps">Frequency</span>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0' }}>Monthly</h4>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #F0FDF4', display: 'flex', alignItems: 'center', padding: '0 1rem', height: '48px', gap: '0.75rem' }}>
                    <Search size={18} style={{ color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Search sources..." 
                        style={{ border: 'none', outline: 'none', flex: 1, font_weight: 600, fontSize: '14px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn-premium primary" style={{ height: '48px', background: '#0F172A' }} onClick={openModal}>
                    <Plus size={20} />
                    Add Source
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredSources.map(item => (
                    <Motion.div 
                        key={item.id} 
                        className="premium-card"
                        style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#F8FAFC', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowUpRight size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: '#1E293B' }}>{item.source}</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ padding: '2px 8px', background: '#F0FDF4', borderRadius: '6px', fontSize: '10px', textTransform: 'uppercase' }}>{item.category}</span>
                                    <span>•</span>
                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>{formatCurrency(item.amount)}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                <button className="icon-btn" style={{ width: '28px', height: '28px' }}><Edit size={14} /></button>
                                <button className="icon-btn" style={{ width: '28px', height: '28px', color: '#EF4444' }} onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </Motion.div>
                ))}
                
                {filteredSources.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#F8FAFC', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                        <p className="label-caps">No income sources found.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>
                        <Motion.div 
                            className="premium-card" 
                            style={{ width: '400px', padding: '2.5rem', background: 'white' }}
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '2rem' }}>New Income Source</h2>
                            <form onSubmit={handleAddIncome} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="label-caps">Income Source</label>
                                    <input 
                                        className="premium-input"
                                        type="text" 
                                        placeholder="e.g. Salary" 
                                        value={formData.source}
                                        onChange={e => setFormData({...formData, source: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Category</label>
                                    <input 
                                        className="premium-input"
                                        type="text" 
                                        placeholder="e.g. Employment" 
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Amount</label>
                                    <input 
                                        className="premium-input"
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Received Date</label>
                                    <input 
                                        className="premium-input"
                                        type="date" 
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                
                                {formError && <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 700, margin: 0 }}>{formError}</p>}
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-premium secondary" onClick={closeModal} style={{ justifyContent: 'center' }}>Back</button>
                                    <button type="submit" className="btn-premium primary" style={{ justifyContent: 'center' }}>Add Source</button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlanIncome;
