import React, { useState } from 'react';
import { Target, Edit3, Check, X } from 'lucide-react';

const BudgetPlanner = ({ budget = 0, currentMonthExpenses = 0, onUpdateBudget, currencySymbol = '₹' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const handleSaveBudget = () => {
        const parsed = parseFloat(editValue);
        if (isNaN(parsed) || parsed < 0) return;
        onUpdateBudget(parsed);
        setIsEditing(false);
    };

    const remainingBudget = Math.max(0, budget - currentMonthExpenses);
    const usagePercentage = budget > 0 ? Math.min(100, Math.round((currentMonthExpenses / budget) * 100)) : 0;

    // ProgressBar color
    let progressColor = '#10B981'; // Green
    if (usagePercentage > 89) {
        progressColor = '#EF4444'; // Red
    } else if (usagePercentage > 70) {
        progressColor = '#F59E0B'; // Yellow/Amber
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem'
        }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} style={{ color: '#7C3AED' }} /> Budget Planner
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                {/* Monthly Limit Setup */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Monthly Budget Limit</span>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currencySymbol}</span>
                            <input 
                                type="number"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                style={{
                                    width: '100px',
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid #CBD5E1',
                                    fontSize: '0.95rem',
                                    fontWeight: 700
                                }}
                            />
                            <button onClick={handleSaveBudget} style={{ border: 'none', background: '#10B981', color: 'white', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer', display: 'flex' }}><Check size={14} /></button>
                            <button onClick={() => setIsEditing(false)} style={{ border: 'none', background: '#EF4444', color: 'white', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0F172A' }}>
                                {currencySymbol}{budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <button 
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditValue(budget.toString());
                                }}
                                style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', display: 'flex' }}
                            >
                                <Edit3 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Expenses and Remaining */}
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Expenses</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                            {currencySymbol}{currentMonthExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Remaining</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: remainingBudget <= 0 ? '#EF4444' : '#10B981' }}>
                            {currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                        <span>Usage</span>
                        <span>{usagePercentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${usagePercentage}%`, height: '100%', background: progressColor, borderRadius: '999px', transition: 'width 0.3s ease' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetPlanner;
