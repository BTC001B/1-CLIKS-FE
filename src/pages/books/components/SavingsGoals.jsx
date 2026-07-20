import React, { useState } from 'react';
import { Target, Plus, Trash2, ArrowUpRight, Check, X } from 'lucide-react';

const SavingsGoals = ({ goals = [], onUpdateGoals, currencySymbol = '₹' }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', deadline: '' });
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [addContribution, setAddContribution] = useState('');

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoal.name.trim() || !newGoal.target || !newGoal.deadline) return;

        const goal = {
            id: Date.now(),
            name: newGoal.name,
            target: parseFloat(newGoal.target) || 0,
            current: parseFloat(newGoal.current) || 0,
            deadline: newGoal.deadline
        };

        onUpdateGoals([...goals, goal]);
        setNewGoal({ name: '', target: '', current: '', deadline: '' });
        setShowAddForm(false);
    };

    const handleDeleteGoal = (id) => {
        onUpdateGoals(goals.filter(g => g.id !== id));
    };

    const handleAddContribution = (id) => {
        const amount = parseFloat(addContribution);
        if (isNaN(amount) || amount <= 0) return;

        const updated = goals.map(g => {
            if (g.id === id) {
                const newCurrent = Math.min(g.target, g.current + amount);
                return { ...g, current: newCurrent };
            }
            return g;
        });

        onUpdateGoals(updated);
        setEditingGoalId(null);
        setAddContribution('');
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Target size={20} style={{ color: '#7C3AED' }} /> Savings Goals
                </h3>
                
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    <Plus size={14} /> New Goal
                </button>
            </div>

            {/* Add Goal Form */}
            {showAddForm && (
                <form onSubmit={handleAddGoal} style={{
                    background: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Goal Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. New Office Equipment"
                                value={newGoal.name}
                                onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Target Amount</label>
                            <input 
                                type="number"
                                required
                                placeholder="e.g. 50000"
                                value={newGoal.target}
                                onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Initial Savings</label>
                            <input 
                                type="number"
                                placeholder="e.g. 10000"
                                value={newGoal.current}
                                onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Target Deadline</label>
                            <input 
                                type="date"
                                required
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Cancel</button>
                        <button type="submit" style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Create Goal</button>
                    </div>
                </form>
            )}

            {/* Goals Display Grid */}
            {goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                    No savings goals created. Start planning your milestones today!
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                }}>
                    {goals.map((goal) => {
                        const progress = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                        const remaining = Math.max(0, goal.target - goal.current);
                        return (
                            <div key={goal.id} style={{
                                border: '1px solid #F1F5F9',
                                borderRadius: '14px',
                                padding: '1.25rem',
                                background: '#F8FAFC',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.85rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1F2937' }}>{goal.name}</h4>
                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Target: {goal.deadline}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                                        onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
                                        onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 850, color: '#0F172A' }}>
                                        {currencySymbol}{goal.current.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>/ {currencySymbol}{goal.target.toLocaleString('en-IN')}</span>
                                    </span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7C3AED' }}>{progress}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)', borderRadius: '999px' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                                    <span>Remaining: {currencySymbol}{remaining.toLocaleString('en-IN')}</span>
                                    
                                    {editingGoalId === goal.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            <input 
                                                type="number"
                                                placeholder="+ Add"
                                                value={addContribution}
                                                onChange={e => setAddContribution(e.target.value)}
                                                style={{ width: '60px', padding: '0.25rem 0.4rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }}
                                            />
                                            <button onClick={() => handleAddContribution(goal.id)} style={{ border: 'none', background: '#10B981', color: 'white', borderRadius: '4px', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}><Check size={11} /></button>
                                            <button onClick={() => setEditingGoalId(null)} style={{ border: 'none', background: '#EF4444', color: 'white', borderRadius: '4px', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}><X size={11} /></button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setEditingGoalId(goal.id)}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                color: '#7C3AED',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '2px'
                                            }}
                                        >
                                            Add Savings <ArrowUpRight size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavingsGoals;
