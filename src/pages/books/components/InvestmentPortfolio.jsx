import React, { useState } from 'react';
import { PieChart, Plus, TrendingUp, TrendingDown, ArrowUpRight, BarChart3, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InvestmentPortfolio = ({ investments = [], onAddInvestment, onDeleteInvestment, currencySymbol }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Stocks', amount: '', purchase_date: '', current_value: '' });

  const totalInvested = investments.reduce((sum, i) => sum + Number(i.amount_invested || 0), 0);
  const totalCurrent = investments.reduce((sum, i) => sum + Number(i.current_value || 0), 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalReturn = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const categories = ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Gold', 'Bonds', 'NPS', 'PPF', 'Real Estate', 'Crypto', 'Other'];

  const handleSave = () => {
    onAddInvestment({
      name: formData.name,
      type: formData.category,
      amount_invested: formData.amount,
      current_value: formData.current_value || formData.amount,
      purchase_date: formData.purchase_date
    });
    setShowModal(false);
    setFormData({ name: '', category: 'Stocks', amount: '', purchase_date: '', current_value: '' });
  };

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PieChart size={22} /></div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Investment Portfolio</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Real-time asset allocation & performance</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#4F46E5', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          + Add Investment
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Market Value</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', margin: '4px 0' }}>{currencySymbol}{totalCurrent.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: totalProfit >= 0 ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {totalProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {totalReturn.toFixed(2)}% ({totalProfit >= 0 ? '+' : ''}{currencySymbol}{Math.abs(totalProfit).toLocaleString()})
          </div>
        </div>
        <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Cost Basis</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#64748B', margin: '4px 0' }}>{currencySymbol}{totalInvested.toLocaleString()}</div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Total Principal Invested</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {investments.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', border: '1px dashed #CBD5E1', borderRadius: '20px', color: '#94A3B8' }}>
            Your portfolio is empty. Add your first asset!
          </div>
        ) : investments.map(inv => {
          const profit = Number(inv.current_value) - Number(inv.amount_invested);
          const ret = (profit / Number(inv.amount_invested)) * 100;
          return (
            <div key={inv.id} style={{ padding: '1.25rem', border: '1px solid #F1F5F9', borderRadius: '20px', background: '#fff', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#EFF6FF', color: '#1D4ED8', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{inv.type}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: profit >= 0 ? '#059669' : '#DC2626' }}>{ret.toFixed(1)}%</span>
                    <button onClick={() => onDeleteInvestment(inv.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}><Trash2 size={14} /></button>
                </div>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: '0 0 1rem 0' }}>{inv.name}</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Current Value</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E293B' }}>{currencySymbol}{Number(inv.current_value).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Invested</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>{currencySymbol}{Number(inv.amount_invested).toLocaleString()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: '95%', maxWidth: '450px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', marginBottom: '1.5rem' }}>Add Asset to Portfolio</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>ASSET NAME</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} placeholder="e.g. HDFC Bank Ltd" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>ASSET CATEGORY</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>INVESTED AMOUNT</label>
                    <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>CURRENT VALUE</label>
                    <input type="number" value={formData.current_value} onChange={e => setFormData({...formData, current_value: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>PURCHASE DATE</label>
                  <input type="date" value={formData.purchase_date} onChange={e => setFormData({...formData, purchase_date: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                </div>
                <button onClick={handleSave} style={{ marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '12px', background: '#4F46E5', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  Confirm Asset Addition
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestmentPortfolio;
