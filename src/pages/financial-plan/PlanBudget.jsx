import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { 
    Home, 
    Coffee, 
    Car, 
    ShoppingBag, 
    Smartphone, 
    RotateCcw, 
    Save, 
    Plus, 
    DollarSign,
    Target,
    PieChart,
    ChevronRight,
    TrendingUp,
    Zap
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatCurrency';

const ICON_MAP = {
    'Home': Home,
    'Coffee': Coffee,
    'Car': Car,
    'ShoppingBag': ShoppingBag,
    'Smartphone': Smartphone
};

const PlanBudget = () => {
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

    // Fetch Plan Budgets
    const { data: categories = [], isLoading: budgetsLoading } = useQuery({
        queryKey: ['plan-budgets', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return [];
            const data = await financialPlanService.getPlanBudgets(activePlanId);
            return data.map(cat => ({
                id: cat.id,
                name: cat.name,
                allocated: parseFloat(cat.allocated_amount || cat.amount),
                icon: ICON_MAP[cat.icon_name] || Home,
                color: cat.color || 'blue'
            }));
        },
        enabled: !!activePlanId
    });

    const saveMutation = useMutation({
        mutationFn: (data) => financialPlanService.updatePlanBudget(activePlanId, data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-budgets', activePlanId] });
        }
    });

    // Fetch analysis for total income
    const { data: analysis } = useQuery({
        queryKey: ['plan-analysis', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return null;
            const res = await financialPlanService.getPlanAnalysis(activePlanId);
            return res.data || res;
        },
        enabled: !!activePlanId
    });

    const totalIncome = analysis?.total_expected_income || 0;
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
    const remaining = totalIncome - totalAllocated;
    const allocationPercent = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;

    const isLoading = plansLoading || (activePlanId && budgetsLoading);

    if (isLoading) {
        return (
            <div className="module-loader">
                <div className="spinner-wrap">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="budget-module">
            <div className="premium-card glass" style={{ background: '#0F172A', color: 'white', padding: '2rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <span className="label-caps" style={{ color: '#94A3B8' }}>Portfolio Allocation</span>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0 1.5rem' }}>How you're spending your money</h1>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #22C55E, #60A5FA)', borderRadius: '20px', transition: 'width 1s ease-out', width: `${Math.min(allocationPercent, 100)}%` }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span>Allocated: <span style={{ color: 'white' }}>{Math.round(allocationPercent)}%</span></span>
                            <span>Remaining: <span style={{ color: 'white' }}>{formatCurrency(remaining)}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <span className="label-caps">Monthly Income</span>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-1px', color: '#10B981' }}>{formatCurrency(totalIncome)}</h3>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <span className="label-caps">Total Allocated</span>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-1px', color: '#1B6B3A' }}>{formatCurrency(totalAllocated)}</h3>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <span className="label-caps">Unassigned</span>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-1px', color: remaining < 0 ? '#EF4444' : '#94A3B8' }}>{formatCurrency(remaining)}</h3>
                </div>
            </div>

            <div className="dashboard-grid">
                {categories.map((cat) => (
                    <div key={cat.id} className="premium-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${cat.color}15`, color: cat.color }}>
                                    <cat.icon size={22} />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '16px', color: '#1E293B' }}>{cat.name}</span>
                            </div>
                            <ChevronRight size={18} style={{ color: '#CBD5E1' }} />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <DollarSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={16} />
                            <input 
                                className="premium-input"
                                type="number" 
                                value={cat.allocated} 
                                readOnly 
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>

                        <div style={{ marginTop: '1rem', fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                            {totalAllocated > 0 ? ((cat.allocated / totalAllocated) * 100).toFixed(1) : 0}% of Total Budget
                        </div>
                    </div>
                ))}

                <button className="premium-card" style={{ background: '#F8FAFC', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#94A3B8', fontWeight: 800, fontSize: '14px', cursor: 'pointer', minHeight: '180px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'white', border: '1px solid #F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Plus size={24} />
                    </div>
                    <span>Add Category</span>
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #F0FDF4' }}>
                <button className="btn-premium primary" onClick={() => saveMutation.mutate({ id: 1, name: 'Sample' })}>
                    <Save size={18} />
                    Save Budget Plan
                </button>
            </div>
        </div>
    );
};

export default PlanBudget;
