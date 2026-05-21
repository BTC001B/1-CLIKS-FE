import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { formatCurrency } from '../../lib/formatCurrency';
import { PageHeader } from '../../components/common';
import {
    DollarSign,
    ShoppingCart,
    Calendar,
    Target,
    Bell,
    BarChart3,
    ArrowRight,
    Plus,
    CreditCard,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Search,
    Filter,
    ArrowLeftRight,
    Zap,
    LayoutGrid,
    PieChart,
    ChevronRight,
    Activity,
    X
} from 'lucide-react';

// Import sub-modules for modal display
import PlanBudget from './PlanBudget';
import PlanIncome from './PlanIncome';
import PlanAnalysis from './PlanAnalysis';
import PlanGoals from './PlanGoals';

const FinancialPlan = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModule, setActiveModule] = useState(null); // 'budget' | 'income' | 'analysis' | 'goals'
    const [formData, setFormData] = useState({
        type: 'expense',
        item: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });

    // Categories based on type
    const expenseCategories = ['Food', 'Travel', 'Lifestyle', 'Rent', 'Utilities', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    // 1. Fetch available plans
    const { data: plans = [], isLoading: plansLoading, error: plansError } = useQuery({
        queryKey: ['financial-plans'],
        queryFn: async () => {
            const res = await financialPlanService.getPlans();
            const data = res.data || res;
            return Array.isArray(data) ? data : [];
        }
    });

    // Auto-create plan mutation
    const createPlanMutation = useMutation({
        mutationFn: (data) => financialPlanService.createPlan(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financial-plans'] })
    });

    // Handle auto-provisioning
    React.useEffect(() => {
        if (!plansLoading && plans.length === 0 && !plansError) {
            createPlanMutation.mutate({ title: 'Main Financial Plan', status: 'active' });
        }
    }, [plansLoading, plans.length, plansError, createPlanMutation]);

    const activePlanId = plans.length > 0 ? plans[0].id : null;
    const activePlanTitle = plans.length > 0 ? plans[0].title : 'Loading Plan...';

    // 2. Fetch Plan Analysis
    const { data: analysis } = useQuery({
        queryKey: ['plan-analysis', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return null;
            const res = await financialPlanService.getPlanAnalysis(activePlanId);
            return res.data || res;
        },
        enabled: !!activePlanId
    });

    // 3. Fetch Recent Expenses
    const { data: expenses = [] } = useQuery({
        queryKey: ['plan-expenses', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return [];
            const data = await financialPlanService.getPlanExpenses(activePlanId);
            return data.slice(0, 10); 
        },
        enabled: !!activePlanId
    });

    // 4. Fetch Recent Incomes
    const { data: incomes = [] } = useQuery({
        queryKey: ['plan-incomes', activePlanId],
        queryFn: async () => {
            if (!activePlanId) return [];
            const data = await financialPlanService.getPlanIncome(activePlanId);
            return data.slice(0, 10);
        },
        enabled: !!activePlanId
    });

    const combinedActivity = [...expenses.map(e => ({...e, type: 'expense'})), ...incomes.map(i => ({...i, type: 'income'}))]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const createExpenseMutation = useMutation({
        mutationFn: (data) => financialPlanService.createPlanExpense(activePlanId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-analysis', activePlanId] });
            queryClient.invalidateQueries({ queryKey: ['plan-expenses', activePlanId] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const createIncomeMutation = useMutation({
        mutationFn: (data) => financialPlanService.createPlanIncome(activePlanId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-analysis', activePlanId] });
            queryClient.invalidateQueries({ queryKey: ['plan-incomes', activePlanId] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setFormData({ 
            type: 'expense', 
            item: '', 
            amount: '', 
            category: 'Food', 
            date: new Date().toISOString().split('T')[0] 
        });
    };

    const isLoading = plansLoading || createPlanMutation.isPending;
    const isFullLoading = isLoading && plans.length === 0;

    const handleAddEntry = (e) => {
        e.preventDefault();
        const payload = {
            category: formData.category,
            actual_amount: parseFloat(formData.amount),
            expected_amount: parseFloat(formData.amount),
            date: formData.date,
            notes: ''
        };

        if (formData.type === 'expense') {
            createExpenseMutation.mutate({ ...payload, item: formData.item });
        } else {
            createIncomeMutation.mutate({ ...payload, source: formData.item });
        }
    };

    const incomeTotal = analysis?.total_expected_income || 0;
    const expenseTotal = analysis?.total_actual_expenses || analysis?.total_expected_expenses || 0;
    const savings = incomeTotal - expenseTotal;
    const savingsRate = incomeTotal > 0 ? (savings / incomeTotal) * 100 : 0;

    // We render the styles first so they apply to ALL states (Loading, Empty, and Dashboard)
    const renderStyles = () => (
        <style>{`
            .dashboard-container {
                padding: 2rem;
                max-width: 1400px;
                margin: 0 auto;
                font-family: 'Inter', -apple-system, sans-serif;
                background-color: #F8FAFC;
                min-height: 100vh;
                color: #1E293B;
            }

            /* Modal Styles */
            .modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.4);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                width: 100%;
                max-width: 500px;
                padding: 2.5rem;
                border-radius: 40px;
                box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1);
                position: relative;
                animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .modal-content.glass { background: rgba(255, 255, 255, 0.95); border: 1px solid white; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
            .modal-header h3 { font-size: 1.5rem; font-weight: 900; margin: 0; letter-spacing: -0.5px; color: #0F172A; }
            .close-btn { background: #F0FDF4; border: none; color: #64748B; cursor: pointer; padding: 8px; border-radius: 12px; transition: all 0.2s; }
            .close-btn:hover { background: #E2E8F0; color: #0F172A; }
            
            /* Large Module Modal */
            .module-modal-content {
                width: 95%;
                max-width: 1200px;
                height: 90vh;
                padding: 0;
                border-radius: 40px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                background: white;
                animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .module-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 2rem;
                background: #F8FAFC;
            }
            .module-modal-header {
                padding: 1.5rem 2.5rem;
                background: white;
                border-bottom: 1px solid #F0FDF4;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .module-modal-header h3 {
                font-size: 1.25rem;
                font-weight: 900;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            /* Type Toggle */
            .type-toggle-container {
                display: flex;
                background: #F0FDF4;
                padding: 6px;
                border-radius: 18px;
                margin-bottom: 2rem;
            }
            .type-btn {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 14px;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s;
                background: transparent;
                color: #64748B;
            }
            .type-btn.active.expense { background: #0F172A; color: white; }
            .type-btn.active.income { background: #22C55E; color: white; }

            .modal-form { display: flex; flex-direction: column; gap: 1.5rem; }
            .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .form-group label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748B; letter-spacing: 1px; }
            .form-group input, .form-group select {
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 14px;
                padding: 12px 16px;
                color: #0F172A;
                font-size: 14px;
                font-weight: 600;
                outline: none;
            }
            .form-group input:focus { border-color: #22C55E; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
            .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .input-with-icon { position: relative; }
            .input-with-icon svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748B; }
            .input-with-icon input { padding-left: 40px; width: 100%; box-sizing: border-box; }

            @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

            /* Header */
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 3rem;
            }
            .breadcrumb { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
            .badge-pro { background: #1B6B3A; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 900; letter-spacing: 1px; }
            .sep { color: #CBD5E1; }
            .current-loc { color: #94A3B8; font-size: 10px; font-weight: 700; letter-spacing: 2px; }
            .dashboard-header h1 { font-size: 3rem; font-weight: 900; letter-spacing: -2px; margin: 0; line-height: 1; }
            .text-highlight { color: #1B6B3A; }
            .plan-status { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; color: #64748B; font-size: 14px; }
            .pulse-dot { width: 8px; height: 8px; background: #22C55E; border-radius: 50%; box-shadow: 0 0 0 rgba(34, 197, 94, 0.4); animation: pulse 2s infinite; }
            @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }

            .header-actions { display: flex; align-items: center; gap: 1rem; background: white; padding: 0.5rem; border-radius: 20px; border: 1px solid #F0FDF4; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            .action-btn-primary { 
                background: linear-gradient(135deg, #1B6B3A, #22C55E); 
                color: white; 
                border: none; 
                padding: 12px 24px; 
                border-radius: 14px; 
                font-weight: 700; 
                display: flex; 
                align-items: center; 
                gap: 0.5rem; 
                cursor: pointer; 
                transition: all 0.2s; 
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            }
            .action-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }
            .v-sep { width: 1px; height: 24px; background: #F0FDF4; }
            .icon-btn { background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 8px; position: relative; border-radius: 8px; transition: background 0.2s; }
            .icon-btn:hover { background: #F8FAFC; color: #475569; }
            .icon-btn.notify .dot { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; background: #EF4444; border: 2px solid white; border-radius: 50%; }

            /* Stats Grid */
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
            .stat-card { padding: 2rem; border-radius: 32px; position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .stat-card.glass { background: white; border: 1px solid #F0FDF4; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
            .stat-card.glass:hover { transform: translateY(-8px); border-color: #22C55E; box-shadow: 0 20px 40px -15px rgba(59,130,246,0.15); }
            
            .stat-card.blue-theme { background: #F0FDF4; border: 1px solid #DBEAFE; }
            .stat-card.blue-theme .icon-wrap { background: #22C55E; color: white; }
            .stat-card.blue-theme .efficiency { color: #1B6B3A; }

            .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative; z-index: 2; }
            .icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .stat-card.green .icon-wrap { background: #F0FDF4; color: #16A34A; }
            .stat-card.red .icon-wrap { background: #FEF2F2; color: #DC2626; }

            .trend { font-size: 12px; font-weight: 800; padding: 4px 8px; border-radius: 6px; }
            .trend.positive { background: #F0FDF4; color: #16A34A; }
            .trend.negative { background: #FEF2F2; color: #DC2626; }
            .efficiency { font-size: 14px; font-weight: 800; color: #60A5FA; }

            .label { display: block; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; position: relative; z-index: 2; }
            .text-dim { color: #64748B; }
            .value { font-size: 2.5rem; font-weight: 900; letter-spacing: -1.5px; margin: 0; position: relative; z-index: 2; color: #0F172A; }
            
            .progress-container { width: 100%; height: 6px; background: rgba(0,0,0,0.05); border-radius: 10px; margin-top: 1.5rem; position: relative; z-index: 2; overflow: hidden; }
            .progress-bar { height: 100%; background: #22C55E; box-shadow: 0 0 15px rgba(59,130,246,0.3); border-radius: 10px; transition: width 1s ease-out; }

            .card-bg-icon { position: absolute; bottom: -30px; right: -20px; opacity: 0.03; z-index: 1; transform: rotate(-15deg); }
            .glow-orb { position: absolute; bottom: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%); z-index: 1; }

            /* Main Content Layout */
            .main-content-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
            .content-left { display: flex; flex-direction: column; gap: 2rem; }
            .content-right { display: flex; flex-direction: column; gap: 2rem; }

            /* Panel Styles */
            .transactions-panel { background: white; border-radius: 32px; border: 1px solid #F0FDF4; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
            .panel-header { padding: 2rem; border-bottom: 1px solid #F8FAFC; display: flex; justify-content: space-between; align-items: center; }
            .panel-header h3 { font-size: 1.25rem; font-weight: 900; margin: 0; }
            .subtitle { font-size: 13px; color: #94A3B8; margin-top: 2px; }

            .search-bar { background: #F8FAFC; border-radius: 12px; padding: 8px 16px; display: flex; align-items: center; gap: 0.75rem; color: #94A3B8; }
            .search-bar input { border: none; background: transparent; outline: none; font-size: 14px; font-weight: 600; width: 150px; }

            .transactions-list { padding: 1rem; }
            .transaction-row { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-radius: 20px; transition: background 0.2s; cursor: pointer; }
            .transaction-row:hover { background: #F8FAFC; }
            .row-left { display: flex; align-items: center; gap: 1rem; }
            .row-icon { width: 44px; height: 44px; background: white; border: 1px solid #F0FDF4; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94A3B8; transition: all 0.2s; }
            .transaction-row:hover .row-icon { color: #22C55E; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

            .item-name { display: block; font-weight: 800; font-size: 15px; color: #334155; }
            .item-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 2px; }
            .cat-tag { font-size: 10px; font-weight: 900; color: #64748B; background: #F0FDF4; padding: 1px 6px; border-radius: 4px; text-transform: uppercase; }
            .row-left .dot { width: 3px; height: 3px; background: #CBD5E1; border-radius: 50%; }
            .item-meta span { font-size: 12px; color: #94A3B8; font-weight: 500; }

            .row-right { text-align: right; }
            .amount { display: block; font-size: 18px; font-weight: 900; color: #1E293B; }
            .status-label { font-size: 10px; font-weight: 800; color: #10B981; text-transform: uppercase; margin-top: 2px; }

            .panel-footer { padding: 1.5rem; background: #FAFAFA; border-top: 1px solid #F8FAFC; text-align: center; border-radius: 0 0 32px 32px; }
            .panel-footer button { background: transparent; border: none; color: #1B6B3A; font-weight: 800; font-size: 13px; display: flex; align-items: center; gap: 0.5rem; margin: 0 auto; cursor: pointer; transition: gap 0.2s; }
            .panel-footer button:hover { gap: 0.75rem; }

            /* Quick Access Grid */
            .quick-access-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
            .access-card { background: white; padding: 1.5rem; border-radius: 28px; border: 1px solid #F0FDF4; text-align: center; cursor: pointer; transition: all 0.2s; }
            .access-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-color: #22C55E; }
            .access-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; transition: transform 0.2s; }
            .access-card:hover .access-icon { transform: scale(1.1) rotate(5deg); }
            .access-title { display: block; font-weight: 900; font-size: 14px; margin-bottom: 2px; }
            .access-sub { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; }

            /* Pulse Widget */
            .insights-card { background: white; border-radius: 32px; padding: 2rem; border: 1px solid #F0FDF4; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .insights-card h3 { font-size: 1.25rem; font-weight: 900; margin-bottom: 2rem; color: #0F172A; }
            .pulse-items { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
            .pulse-item { }
            .pulse-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; color: #64748B; text-transform: uppercase; margin-bottom: 0.5rem; }
            .pulse-label span:last-child { color: #0F172A; }
            .pulse-track { height: 4px; background: #F0FDF4; border-radius: 10px; overflow: hidden; }
            .pulse-fill { height: 100%; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); transition: width 1s; }
            .pulse-fill.blue { background: #22C55E; }
            .pulse-fill.purple { background: #A855F7; }
            .pulse-fill.amber { background: #F59E0B; }
            .primary-btn-mini { background: #F0FDF4; color: #0F172A; border: none; padding: 10px 0; width: 100%; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; transition: background 0.2s; }
            .primary-btn-mini:hover { background: #E2E8F0; }

            /* Alert Card */
            .alert-card { background: white; border-radius: 32px; padding: 2rem; border: 1px solid #F0FDF4; }
            .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .alert-header h4 { font-size: 14px; font-weight: 900; color: #EF4444; text-transform: uppercase; margin: 0; }
            .alert-body { display: flex; align-items: center; gap: 1rem; background: #F8FAFC; padding: 1rem; border-radius: 18px; margin-bottom: 1.5rem; }
            .day-box { width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #0F172A; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .alert-info h5 { font-size: 15px; font-weight: 800; margin: 0; }
            .alert-info p { font-size: 12px; color: #EF4444; font-weight: 800; margin-top: 2px; text-transform: uppercase; }
            .alert-footer { display: flex; justify-content: space-between; align-items: center; }
            .price { font-size: 22px; font-weight: 900; }
            .pay-btn { background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; cursor: pointer; transition: transform 0.2s; }
            .pay-btn:hover { transform: scale(1.05); }

            /* Animations */
            .pulse { animation: bell-shake 2s infinite; }
            @keyframes bell-shake { 0% { transform: rotate(0); } 10% { transform: rotate(10deg); } 20% { transform: rotate(-10deg); } 30% { transform: rotate(10deg); } 40% { transform: rotate(-10deg); } 50% { transform: rotate(0); } 100% { transform: rotate(0); } }

            .no-data { text-align: center; padding: 4rem 2rem; color: #CBD5E1; }
            .no-data p { margin-top: 1rem; font-weight: 700; color: #94A3B8; }

            /* Loader & Empty States */
            .loader-container { 
                height: 80vh; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                gap: 2rem; 
            }
            .spinner-wrap { position: relative; width: 80px; height: 80px; }
            .spinner { 
                position: absolute;
                inset: 0;
                border: 4px solid #F0FDF4; 
                border-top-color: #1B6B3A; 
                border-radius: 50%; 
                animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite; 
            }
            .spinner-inner {
                position: absolute;
                inset: 15px;
                border: 4px solid #F0FDF4;
                border-bottom-color: #6366F1;
                border-radius: 50%;
                animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            
            .empty-plan-wrapper { 
                height: 85vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                position: relative;
                overflow: hidden;
                background-color: #F8FAFC;
            }
            .empty-blob {
                position: absolute;
                width: 500px;
                height: 500px;
                background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
                filter: blur(60px);
                z-index: 1;
            }
            .empty-blob.one { top: -100px; left: -100px; }
            .empty-blob.two { bottom: -100px; right: -100px; background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%); }

            .empty-card { 
                background: white; 
                padding: 5rem 4rem; 
                border-radius: 48px; 
                text-align: center; 
                max-width: 500px; 
                box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08); 
                border: 1px solid #F0FDF4;
                position: relative;
                z-index: 2;
                animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .empty-icon-box { 
                width: 100px; 
                height: 100px; 
                background: linear-gradient(135deg, #22C55E, #6366F1); 
                color: white; 
                border-radius: 32px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin: 0 auto 2.5rem; 
                box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.4);
                transform: rotate(-5deg);
                animation: float 4s ease-in-out infinite;
            }
            @keyframes float { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
            
            .empty-card h2 { 
                font-size: 2.5rem; 
                font-weight: 900; 
                margin-bottom: 1.25rem; 
                letter-spacing: -1.5px;
                color: #0F172A;
            }
            .empty-card p { 
                color: #64748B; 
                line-height: 1.7; 
                margin-bottom: 3rem; 
                font-weight: 500; 
                font-size: 1.1rem;
            }
            .primary-btn-large { 
                background: #0F172A; 
                color: white; 
                border: none; 
                padding: 20px 0; 
                width: 100%; 
                border-radius: 20px; 
                font-weight: 800; 
                font-size: 18px; 
                cursor: pointer; 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.2);
            }
            .primary-btn-large:hover { 
                background: #1B6B3A; 
                transform: translateY(-4px); 
                box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.4); 
            }
            .primary-btn-large:active { transform: translateY(-1px); }
        `}</style>
    );

    if (isFullLoading) {
        return (
            <>
                {renderStyles()}
                <div className="loader-container">
                    <div className="spinner-wrap">
                        <div className="spinner"></div>
                        <div className="spinner-inner"></div>
                    </div>
                    <p style={{ fontWeight: 800, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '12px' }}>
                        Synchronizing your financial universe...
                    </p>
                </div>
            </>
        );
    }

    if (plansError) {
        return (
            <div className="empty-plan-wrapper">
                {renderStyles()}
                <div className="empty-card">
                    <h2>Connection Lost</h2>
                    <p>We couldn't reach your financial data. Please check your connection and try again.</p>
                    <button className="primary-btn-large" onClick={() => queryClient.invalidateQueries(['financial-plans'])}>
                        Retry Sync
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-container">
            {/* New Entry Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <Motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="premium-card glass" 
                        style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="card-header" style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Quick Add Entry</h3>
                            <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '6px', background: '#F0FDF4', borderRadius: '18px' }}>
                            <button 
                                className={`btn-premium ${formData.type === 'expense' ? 'primary' : 'secondary'}`}
                                style={{ justifyContent: 'center', padding: '10px' }}
                                onClick={() => setFormData({...formData, type: 'expense', category: expenseCategories[0]})}
                            >
                                Expense
                            </button>
                            <button 
                                className={`btn-premium ${formData.type === 'income' ? 'primary' : 'secondary'}`}
                                style={{ justifyContent: 'center', padding: '10px' }}
                                onClick={() => setFormData({...formData, type: 'income', category: incomeCategories[0]})}
                            >
                                Income
                            </button>
                        </div>

                        <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="label-caps">{formData.type === 'expense' ? 'Item Name' : 'Income Source'}</label>
                                <input 
                                    className="premium-input"
                                    type="text" 
                                    placeholder={formData.type === 'expense' ? 'What did you buy?' : 'e.g. Monthly Salary'} 
                                    value={formData.item}
                                    onChange={e => setFormData({...formData, item: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="label-caps">Amount</label>
                                    <input 
                                        className="premium-input"
                                        style={{ fontWeight: 900, color: '#1B6B3A' }}
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label-caps">Category</label>
                                    <select 
                                        className="premium-input"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                            <option key={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label-caps">Date</label>
                                <input 
                                    className="premium-input"
                                    type="date" 
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-premium primary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} disabled={createExpenseMutation.isPending || createIncomeMutation.isPending}>
                                {createExpenseMutation.isPending || createIncomeMutation.isPending ? 'Processing...' : `Record ${formData.type}`}
                            </button>
                        </form>
                    </Motion.div>
                </div>
            )}

            {/* Module Modal */}
            {activeModule && (
                <div className="modal-overlay" onClick={() => setActiveModule(null)}>
                    <Motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="premium-card" 
                        style={{ width: '95%', maxWidth: '1200px', height: '90vh', padding: 0, display: 'flex', flexDirection: 'column', background: 'white' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="card-header" style={{ padding: '1.5rem 2.5rem' }}>
                            <h3 className="card-title" style={{ fontSize: '1.25rem' }}>
                                {activeModule === 'budget' && <><PieChart size={24} color="#22C55E" /> Budget Management</>}
                                {activeModule === 'income' && <><ArrowLeftRight size={24} color="#10B981" /> Income Streams</>}
                                {activeModule === 'analysis' && <><Activity size={24} color="#6366F1" /> Financial Analysis</>}
                                {activeModule === 'goals' && <><Target size={24} color="#F43F5E" /> Saving Goals</>}
                            </h3>
                            <button className="icon-btn" onClick={() => setActiveModule(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', background: '#F8FAFC' }}>
                            {activeModule === 'budget' && <PlanBudget />}
                            {activeModule === 'income' && <PlanIncome />}
                            {activeModule === 'analysis' && <PlanAnalysis />}
                            {activeModule === 'goals' && <PlanGoals />}
                        </div>
                    </Motion.div>
                </div>
            )}

            <PageHeader 
                title={<>Financial <span className="text-highlight">Overview</span></>}
                subtitle={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <div className="pulse-dot"></div>
                        <span className="label-caps" style={{ color: '#64748B' }}>Active Plan: </span>
                        <strong style={{ fontWeight: 900, color: '#0F172A' }}>{activePlanTitle}</strong>
                    </div>
                }
                breadcrumb="PLAN"
                primaryAction={{
                    label: "Quick Entry",
                    onClick: () => setIsModalOpen(true)
                }}
            />

            {/* KPI Cards Section */}
            <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                <div className="premium-card glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className="label-caps" style={{ color: '#16A34A', fontWeight: 900 }}>+12.5%</div>
                    </div>
                    <span className="label-caps">Total Income</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: '0.5rem 0', color: '#0F172A' }}>{formatCurrency(incomeTotal)}</h2>
                    <div className="label-caps" style={{ color: '#94A3B8' }}>Current Period</div>
                </div>

                <div className="premium-card glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={24} />
                        </div>
                        <div className="label-caps" style={{ color: '#DC2626', fontWeight: 900 }}>Live</div>
                    </div>
                    <span className="label-caps">Total Expenses</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: '0.5rem 0', color: '#0F172A' }}>{formatCurrency(expenseTotal)}</h2>
                    <div className="label-caps" style={{ color: '#94A3B8' }}>Across all categories</div>
                </div>

                <div className="premium-card glass" style={{ padding: '2rem', background: '#F0FDF4', borderColor: '#DBEAFE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#22C55E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={24} />
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#1B6B3A' }}>{Math.round(savingsRate)}% Saved</div>
                    </div>
                    <span className="label-caps" style={{ color: '#64748B' }}>Current Savings</span>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', margin: '0.5rem 0', color: '#064E3B' }}>{formatCurrency(savings)}</h2>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', marginTop: '1rem', overflow: 'hidden' }}>
                        <Motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(savingsRate, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ height: '100%', background: '#22C55E', borderRadius: '10px' }}
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '2.5rem', alignItems: 'start' }}>
                {/* Left Column: Activity & Quick Access */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card">
                        <div className="card-header">
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 900 }}>Recent Activity</h3>
                                <div className="label-caps" style={{ marginTop: '4px' }}>Real-time financial movement</div>
                            </div>
                            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #F0FDF4' }}>
                                <Search size={18} color="#94A3B8" />
                                <input type="text" placeholder="Search activity..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', fontWeight: 600, width: '180px' }} />
                            </div>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            {combinedActivity.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#F8FAFC', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <Activity size={32} />
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#94A3B8' }}>No activity recorded yet.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {combinedActivity.map(item => (
                                        <Motion.div 
                                            whileHover={{ x: 5 }}
                                            key={`${item.type}-${item.id}`} 
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '20px', cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{ 
                                                    width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: item.type === 'income' ? '#DCFCE7' : '#F0FDF4',
                                                    color: item.type === 'income' ? '#16A34A' : '#64748B'
                                                }}>
                                                    {item.type === 'income' ? <ArrowUpRight size={22} /> : <ShoppingCart size={22} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>{item.description || item.source || item.item || 'Transaction'}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '4px' }}>
                                                        <span className="label-caps" style={{ background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px' }}>{item.category}</span>
                                                        <span className="label-caps" style={{ color: '#94A3B8' }}>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: item.type === 'income' ? '#16A34A' : '#0F172A' }}>
                                                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount || item.actual_amount)}
                                                </div>
                                                <div className="label-caps" style={{ color: '#10B981', marginTop: '2px' }}>Verified</div>
                                            </div>
                                        </Motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid #F0FDF4' }}>
                            <button className="btn-premium secondary" style={{ margin: '0 auto', fontSize: '0.85rem' }}>View All Transactions <ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        {[
                            { id: 'budget', title: 'Budget', sub: 'Limits', icon: PieChart, color: '#22C55E' },
                            { id: 'income', title: 'Income', sub: 'Streams', icon: ArrowLeftRight, color: '#10B981' },
                            { id: 'analysis', title: 'Analysis', sub: 'Trends', icon: Activity, color: '#6366F1' },
                            { id: 'goals', title: 'Goals', sub: 'Savings', icon: Target, color: '#F43F5E' }
                        ].map(item => (
                            <Motion.div 
                                whileHover={{ y: -5 }}
                                key={item.id} 
                                className="premium-card" 
                                style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}
                                onClick={() => setActiveModule(item.id)}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <item.icon size={26} />
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0F172A' }}>{item.title}</div>
                                <div className="label-caps" style={{ fontSize: '9px', marginTop: '2px' }}>{item.sub}</div>
                            </Motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Insights & Reminders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card" style={{ padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 2rem 0', fontWeight: 900 }}>Health Pulse</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {[
                                { label: 'Monthly Burn', value: '64%', color: '#22C55E' },
                                { label: 'Savings Velocity', value: '42%', color: '#A855F7' },
                                { label: 'Budget Adherence', value: '88%', color: '#F59E0B' }
                            ].map((p, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span className="label-caps" style={{ fontSize: '11px' }}>{p.label}</span>
                                        <span style={{ fontWeight: 900, fontSize: '13px' }}>{p.value}</span>
                                    </div>
                                    <div style={{ height: '4px', background: '#F0FDF4', borderRadius: '10px', overflow: 'hidden' }}>
                                        <Motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: p.value }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            style={{ height: '100%', background: p.color, borderRadius: '10px' }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-premium secondary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', fontSize: '0.85rem' }}>Full Diagnostic Report</button>
                    </div>

                    <div className="premium-card" style={{ padding: '2rem', border: '1px solid #FEE2E2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 className="label-caps" style={{ color: '#EF4444', margin: 0 }}>Upcoming Due</h4>
                            <Bell size={18} className="pulse" color="#EF4444" />
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>02</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Cloud Infrastructure</div>
                                <div className="label-caps" style={{ color: '#EF4444', marginTop: '2px' }}>Due in 2 days</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹2,499</div>
                            <button className="btn-premium primary" style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#EF4444' }}>Pay Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialPlan;
