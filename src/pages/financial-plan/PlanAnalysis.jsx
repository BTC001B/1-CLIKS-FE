import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import {
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatCurrency';
import { motion as Motion } from 'framer-motion';

const PlanAnalysis = () => {
    // 1. Fetch available plans
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['financial-plans'],
        queryFn: async () => {
            const res = await financialPlanService.getPlans();
            return res.data || res;
        }
    });

    const activePlanId = plans.length > 0 ? plans[0].id : null;

    const { data: analysis, isLoading: analysisLoading } = useQuery({
        queryKey: ['plan-analysis', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return null;
            const data = await financialPlanService.getPlanAnalysis(activePlanId);
            return data;
        },
        enabled: !!activePlanId
    });

    const isLoading = plansLoading || (activePlanId && analysisLoading);

    if (isLoading) {
        return (
            <div className="analysis-loader">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!activePlanId || !analysis) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <Activity size={48} color="#94A3B8" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontWeight: 900, color: '#1E293B' }}>Insufficient Data</h2>
                <p style={{ color: '#64748B', fontWeight: 600 }}>Create transactions to see your financial pulse.</p>
            </div>
        );
    }

    const savings = analysis.total_actual_income - analysis.total_actual_expenses;
    const savingsRate = analysis.total_actual_income > 0 
        ? (savings / analysis.total_actual_income) * 100 
        : 0;
    
    const budgetAdherence = analysis.total_allocated_budget > 0 
        ? (analysis.total_spent_budget / analysis.total_allocated_budget) * 100 
        : 0;

    return (
        <div className="analysis-module">
            <Motion.div 
                className="premium-card glass"
                style={{ background: '#0F172A', color: 'white', padding: '2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}></div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#6366F1', marginBottom: '1rem' }}>
                    <ShieldCheck size={14} /> 
                    Financial Integrity Score: 85
                </div>
                <h1 style={{ fontSize: '3.5rem', fontStyle: 'normal', fontWeight: 900, letterSpacing: '-2px', margin: 0 }}>{savingsRate.toFixed(1)}%</h1>
                <p className="text-muted" style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8', marginTop: '0.5rem' }}>Your current savings rate is {savingsRate > 20 ? 'Optimal' : 'Needs attention'}</p>
            </Motion.div>

            <div className="stats-grid">
                <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '52px', height: '52px', border: '1px solid #F0FDF4', borderRadius: '16px', background: '#F8FAFC', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24} /></div>
                    <div>
                        <span className="label-caps">Actual Income</span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>{formatCurrency(analysis.total_actual_income)}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '52px', height: '52px', border: '1px solid #F0FDF4', borderRadius: '16px', background: '#F8FAFC', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDownRight size={24} /></div>
                    <div>
                        <span className="label-caps">Actual Spending</span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>{formatCurrency(analysis.total_actual_expenses)}</h3>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                <div className="premium-card" style={{ padding: '2rem' }}>
                    <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={20} color="#6366F1" /> Performance Analysis</h3>
                        <button className="icon-btn" style={{ border: 'none', background: 'none', color: '#6366F1', fontWeight: 800, fontSize: '12px', cursor: 'pointer', width: 'auto', height: 'auto', padding: '8px' }}>View Details</button>
                    </div>
                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #F0FDF4' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <div style={{ width: '40px', borderRadius: '12px 12px 4px 4px', background: '#F0FDF4', height: '100%', position: 'relative' }}></div>
                            <span className="label-caps" style={{ textAlign: 'center', fontSize: '9px' }}>Income Plan</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <div style={{ width: '40px', borderRadius: '12px 12px 4px 4px', background: '#6366F1', height: `${(analysis.total_actual_income / (analysis.total_expected_income || 1)) * 100}%`, position: 'relative' }}></div>
                            <span className="label-caps" style={{ textAlign: 'center', fontSize: '9px' }}>Income Actual</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <div style={{ width: '40px', borderRadius: '12px 12px 4px 4px', background: '#FEE2E2', height: '100%', position: 'relative' }}></div>
                            <span className="label-caps" style={{ textAlign: 'center', fontSize: '9px' }}>Spend Plan</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <div style={{ width: '40px', borderRadius: '12px 12px 4px 4px', background: '#EF4444', height: `${(analysis.total_actual_expenses / (analysis.total_expected_expenses || 1)) * 100}%`, position: 'relative' }}></div>
                            <span className="label-caps" style={{ textAlign: 'center', fontSize: '9px' }}>Spend Actual</span>
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '2rem' }}>
                    <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={20} color="#6366F1" /> Budget Load</h3>
                    </div>
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 2rem' }}>
                        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="90" cy="90" r="75" fill="none" stroke="#F0FDF4" strokeWidth="14" />
                            <circle 
                                cx="90" cy="90" r="75" fill="none" stroke="#6366F1" strokeWidth="14" strokeLinecap="round"
                                strokeDasharray={`${(budgetAdherence / 100) * 471} 471`}
                                style={{ transition: 'stroke-dasharray 1s ease-out' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 900 }}>{budgetAdherence.toFixed(0)}%</span>
                            <span className="label-caps" style={{ fontSize: '9px' }}>Utilized</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }}></div>
                                Allocated
                            </div>
                            <span>{formatCurrency(analysis.total_allocated_budget)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F0FDF4' }}></div>
                                Spent
                            </div>
                            <span>{formatCurrency(analysis.total_spent_budget)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PlanAnalysis;
