import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { 
    Plus, 
    Search, 
    Trash2, 
    X,
    Trophy,
    Target,
    Calendar,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/formatCurrency';

const EMPTY_FORM = { name: '', target: '', current: '', deadline: new Date().toISOString().split('T')[0] };

const PlanGoals = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData]       = useState(EMPTY_FORM);
    const [formError, setFormError]     = useState('');

    // 1. Fetch available plans
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['financial-plans'],
        queryFn: async () => {
            const res = await financialPlanService.getPlans();
            return res.data || res;
        }
    });

    const activePlanId = plans.length > 0 ? plans[0].id : null;

    // Fetch Goals
    const { data: goals = [], isLoading: goalsLoading } = useQuery({
        queryKey: ['plan-goals', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return [];
            const data = await financialPlanService.getPlanGoals(activePlanId);
            return data.map(item => ({
                id: item.id,
                name: item.name || item.title,
                target: parseFloat(item.target_amount || item.target),
                current: parseFloat(item.current_amount || item.current),
                deadline: item.date || item.deadline
            }));
        },
        enabled: !!activePlanId
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (newGoal) => financialPlanService.createPlanGoal(activePlanId, newGoal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-goals', activePlanId] });
            closeModal();
        },
        onError: (err) => {
            setFormError(err.message || 'Failed to add goal.');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => financialPlanService.deletePlanGoal(activePlanId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-goals', activePlanId] });
        }
    });

    const isLoading = plansLoading || (activePlanId && goalsLoading);

    const openModal = () => {
        setFormData(EMPTY_FORM);
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.target || !formData.current || !formData.deadline) {
            setFormError('All fields are required.');
            return;
        }

        const newGoal = {
            name: formData.name,
            target_amount: parseFloat(formData.target),
            current_amount: parseFloat(formData.current),
            date: formData.deadline,
        };

        createMutation.mutate(newGoal);
    };

    const totalTarget = goals.reduce((sum, item) => sum + item.target, 0);
    const totalCurrent = goals.reduce((sum, item) => sum + item.current, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    const filteredGoals = goals;

    if (isLoading) {
        return (
            <div className="goals-loader">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="goals-module">
            <div className="premium-card glass" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', padding: '2.5rem', borderRadius: '32px', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <span className="label-caps" style={{ color: 'rgba(255,255,255,0.7)' }}>Combined Objectives</span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0', letterSpacing: '-1.5px' }}>{formatCurrency(totalCurrent)} / {formatCurrency(totalTarget)}</h1>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', border_radius: '10px', margin: '1.5rem 0 0.5rem' }}>
                        <div style={{ height: '100%', background: 'white', borderRadius: '10px', transition: 'width 1s ease-out', width: `${overallProgress}%` }}></div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
                        You've reached {overallProgress.toFixed(1)}% of your total financial targets!
                    </p>
                </div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15, transform: 'rotate(-10deg)' }}><Trophy size={180} /></div>
            </div>

            <div className="dashboard-grid">
                {filteredGoals.map(goal => {
                    const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
                    return (
                        <Motion.div 
                            key={goal.id} 
                            className="premium-card"
                            style={{ padding: '1.75rem' }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={22} /></div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>{goal.name}</span>
                                </div>
                                <button className="icon-btn" style={{ border: 'none', color: '#CBD5E1' }} onClick={() => deleteMutation.mutate(goal.id)}><Trash2 size={16} /></button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div>
                                    <span className="label-caps">Saved</span>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{formatCurrency(goal.current)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="label-caps">Target</span>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{formatCurrency(goal.target)}</div>
                                </div>
                            </div>

                            <div style={{ height: '10px', background: '#F0FDF4', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                                <div style={{ height: '100%', background: '#F59E0B', borderRadius: '10px', width: `${progress}%` }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F0FDF4' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                                    <Calendar size={14} />
                                    <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 900, color: '#F59E0B' }}>{progress.toFixed(0)}%</span>
                            </div>
                        </Motion.div>
                    );
                })}

                <button className="premium-card" style={{ background: '#F8FAFC', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#94A3B8', cursor: 'pointer', minHeight: '240px' }} onClick={openModal}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'white', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}><Plus size={24} /></div>
                    <span style={{ fontWeight: 800 }}>Create New Goal</span>
                </button>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>
                        <Motion.div 
                            className="premium-card" 
                            style={{ width: '420px', padding: '2.5rem', background: 'white' }}
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                        >
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '2rem' }}>Define Your Goal</h2>
                            <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="label-caps">Goal Name</label>
                                    <input 
                                        className="premium-input"
                                        type="text" 
                                        placeholder="e.g. Dream House" 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Financial Target</label>
                                    <input 
                                        className="premium-input"
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.target}
                                        onChange={e => setFormData({...formData, target: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Initial Deposit</label>
                                    <input 
                                        className="premium-input"
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.current}
                                        onChange={e => setFormData({...formData, current: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="label-caps">Target Achievement Date</label>
                                    <input 
                                        className="premium-input"
                                        type="date" 
                                        value={formData.deadline}
                                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                                    />
                                </div>

                                {formError && <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 700, margin: 0 }}>{formError}</p>}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-premium secondary" onClick={closeModal} style={{ justifyContent: 'center' }}>Cancel</button>
                                    <button type="submit" className="btn-premium primary" style={{ justifyContent: 'center' }}>Set Goal</button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlanGoals;
