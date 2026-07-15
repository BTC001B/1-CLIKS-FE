import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, Smartphone, Edit2, Check, X } from 'lucide-react';

const MyWallet = ({ wallets = [], onUpdateBalance, currencySymbol = '₹' }) => {
    const [editingId, setEditingId] = useState(null);
    const [editBalance, setEditBalance] = useState('');

    const walletIcons = {
        'Cash': <Wallet size={18} style={{ color: '#0F766E' }} />,
        'Bank Account': <Landmark size={18} style={{ color: '#1E3A8A' }} />,
        'UPI': <Smartphone size={18} style={{ color: '#7C3AED' }} />,
        'Credit Card': <CreditCard size={18} style={{ color: '#BE123C' }} />,
    };

    const handleSaveBalance = (id) => {
        const parsed = parseFloat(editBalance);
        if (isNaN(parsed)) return;
        onUpdateBalance(id, parsed);
        setEditingId(null);
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={20} style={{ color: '#7C3AED' }} /> My Wallet
            </h3>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem'
            }}>
                {wallets.map((wallet) => (
                    <div key={wallet.id} style={{
                        border: '1px solid #F1F5F9',
                        borderRadius: '12px',
                        padding: '1rem',
                        background: '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {walletIcons[wallet.type] || <Wallet size={18} />}
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{wallet.name}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                            {editingId === wallet.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>{currencySymbol}</span>
                                    <input 
                                        type="number"
                                        value={editBalance}
                                        onChange={e => setEditBalance(e.target.value)}
                                        style={{
                                            width: '80px',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid #CBD5E1',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                    <button 
                                        onClick={() => handleSaveBalance(wallet.id)}
                                        style={{ border: 'none', background: '#10B981', color: 'white', borderRadius: '4px', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        style={{ border: 'none', background: '#EF4444', color: 'white', borderRadius: '4px', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 850, color: wallet.balance < 0 ? '#EF4444' : '#0F172A' }}>
                                        {currencySymbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            setEditingId(wallet.id);
                                            setEditBalance(wallet.balance.toString());
                                        }}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            color: '#64748B',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
                                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <Edit2 size={13} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyWallet;
