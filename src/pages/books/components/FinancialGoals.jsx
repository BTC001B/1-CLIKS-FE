import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit2, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FinancialGoals = ({ goals = [], onCreate, onUpdate, onDelete, currencySymbol }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', current_savings: '', target_date: '', category: 'Emergency Fund' });
  const [editingId, setEditingId] = useState(null);

  const categories = ['Emergency Fund', 'Retirement', "Children's Education", 'Vacation', 'House Purchase', 'Vehicle Purchase', 'Other'];

  const handleSave = () => {
    if (!newGoal.name || !newGoal.target_amount) return;

    if (editingId) {
      onUpdate(editingId, newGoal);
      setEditingId(null);
    } else {
      onCreate(newGoal);
    }
    setNewGoal({ name: '', target_amount: '', current_savings: '', target_date: '', category: 'Emergency Fund' });
    setShowAddGoal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this goal?')) {
      onDelete(id);
    }
  };

  const handleEdit = (g) => {
    setNewGoal({
        name: g.name,
        target_amount: g.target_amount,
        current_savings: g.current_savings,
        target_date: g.target_date,
        category: g.category
    });
    setEditingId(g.id);
    setShowAddGoal(true);
  };

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={22} /></div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Financial Goals</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Track your long-term milestones</p>
          </div>
        </div>
        <button
          onClick={() => { setShowAddGoal(true); setEditingId(null); setNewGoal({ name: '', target_amount: '', current_savings: '', target_date: '', category: 'Emergency Fund' }); }}
          style={{ background: '#F5F3FF', border: 'none', color: '#7C3AED', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}
        >
          <Plus size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#94A3B8', fontSize: '0.875rem' }}>
            No goals defined. Start planning today!
          </div>
        ) : goals.map(g => {
          const progress = Math.min(100, (g.current_savings / g.target_amount) * 100);
          return (
            <div key={g.id} style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0' }}>{g.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: '#7C3AED', fontWeight: 700, textTransform: 'uppercase' }}>{g.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(g)} style={{ border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(g.id)} style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                <span>{currencySymbol}{Number(g.current_savings).toLocaleString('en-IN')} <span style={{ fontWeight: 500, color: '#94A3B8' }}>saved</span></span>
                <span>{currencySymbol}{Number(g.target_amount).toLocaleString('en-IN')} <span style={{ fontWeight: 500, color: '#94A3B8' }}>goal</span></span>
              </div>

              <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)', borderRadius: '999px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>{progress.toFixed(1)}% Complete</span>
                {g.target_date && <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Target: {g.target_date}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAddGoal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: '90%', maxWidth: '400px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button onClick={() => setShowAddGoal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem' }}>{editingId ? 'Edit Goal' : 'New Goal'}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>GOAL NAME</label>
                  <input type="text" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. New Car" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>CATEGORY</label>
                  <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>TARGET ({currencySymbol})</label>
                    <input type="number" value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>SAVED ({currencySymbol})</label>
                    <input type="number" value={newGoal.current_savings} onChange={e => setNewGoal({...newGoal, current_savings: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="0" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>TARGET DATE</label>
                  <input type="date" value={newGoal.target_date} onChange={e => setNewGoal({...newGoal, target_date: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }} />
                </div>
                <button onClick={handleSave} style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: '#7C3AED', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  {editingId ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialGoals;
