import React, { useState, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalWalletService } from '../services/goalWalletService';
import EmptyState from '../components/common/EmptyState';
import {
    Wallet,
    Target,
    TrendingUp,
    Plus,
    Coins,
    CheckCircle2,
    History,
    Lock,
    ArrowUpRight,
    ChevronRight,
    X,
    Loader2,
    Trash2,
    LayoutGrid
} from 'lucide-react';
import { PageHeader } from '../components/common';

const Segregation = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    
    const [formData, setFormData] = useState({ 
        name: '', 
        target_amount: '', 
        description: '' 
    });
    
    const [formError, setFormError] = useState('');

    // ── Queries ─────────────────────────────────────────────────────────────
    
    const { 
        data: walletsResponse, 
        isLoading, 
    } = useQuery({
        queryKey: ['goal-wallets'],
        queryFn: () => goalWalletService.getWallets(),
    });
    
    const { 
        data: walletDetailsResponse, 
        isLoading: isLoadingDetails 
    } = useQuery({
        queryKey: ['goal-wallet', selectedId],
        queryFn: () => goalWalletService.getWalletById(selectedId),
        enabled: !!selectedId && isHistoryModalOpen
    });

    const walletDetails = useMemo(() => {
        return walletDetailsResponse?.data || walletDetailsResponse;
    }, [walletDetailsResponse]);

    const wallets = useMemo(() => {
        const rawData = walletsResponse?.data !== undefined ? walletsResponse.data : walletsResponse;
        return Array.isArray(rawData) ? rawData : [];
    }, [walletsResponse]);

    // ── Mutations ───────────────────────────────────────────────────────────
    
    const createMutation = useMutation({
        mutationFn: (data) => goalWalletService.createWallet(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal-wallets'] });
            setIsCreateModalOpen(false);
            setFormData({ name: '', target_amount: '', description: '' });
        },
        onError: (err) => setFormError(err.response?.data?.error?.message || 'Failed to create wallet')
    });

    const addMoneyMutation = useMutation({
        mutationFn: ({ id, amount }) => goalWalletService.addMoney(id, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal-wallets'] });
            setIsAddMoneyModalOpen(false);
            setAddAmount('');
            setSelectedWallet(null);
        },
        onError: (err) => setFormError(err.response?.data?.error?.message || 'Failed to add money')
    });

    const claimMutation = useMutation({
        mutationFn: (id) => goalWalletService.claimWallet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal-wallets'] });
        },
        onError: (err) => alert(err.response?.data?.error?.message || 'Failed to claim wallet')
    });
    
    const deleteMutation = useMutation({
        mutationFn: (id) => goalWalletService.deleteWallet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal-wallets'] });
        },
        onError: (err) => alert(err.response?.data?.error?.message || 'Failed to delete wallet')
    });

    // ── Logic ──────────────────────────────────────────────────────────────

    const activeWallets = wallets.filter(w => w.status === 'active');
    const completedWallets = wallets.filter(w => w.status === 'completed');

    const totalSaved = wallets.reduce((sum, w) => sum + Number(w.current_amount || 0), 0);
    const totalTarget = activeWallets.reduce((sum, w) => sum + Number(w.target_amount || 0), 0);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.target_amount) {
            setFormError('Name and Target Amount are required');
            return;
        }
        createMutation.mutate({
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            description: formData.description
        });
    };

    const handleAddMoneySubmit = (e) => {
        e.preventDefault();
        const amt = parseFloat(addAmount);
        if (!amt || amt <= 0) {
            setFormError('Please enter a valid amount');
            return;
        }
        addMoneyMutation.mutate({ id: selectedWallet.id, amount: amt });
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader2 size={40} className="animate-spin text-primary mb-4" />
            <p className="text-muted font-medium">Loading your Goal Wallets...</p>
        </div>
    );

    return (
        <div className="premium-container">
            <PageHeader 
                title={<>Goal <span className="text-highlight">Wallets</span></>}
                subtitle="Save for specific purposes, track progress, and claim when ready."
                breadcrumb="WALLETS"
                primaryAction={{
                    label: "Create Wallet",
                    onClick: () => setIsCreateModalOpen(true)
                }}
            />

            {/* Top Stats Overview */}
            <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0FDF4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={28} />
                    </div>
                    <div>
                        <div className="label-caps">Total Saved</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>₹{totalSaved.toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0F9FF', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={28} />
                    </div>
                    <div>
                        <div className="label-caps">Active Targets</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>₹{totalTarget.toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F8FAFC', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <History size={28} />
                    </div>
                    <div>
                        <div className="label-caps">Completed Goals</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>{completedWallets.length}</div>
                    </div>
                </div>
            </div>

            {/* Active Wallets Grid */}
            <section style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Active Goals</h3>
                    <div style={{ flex: 1, height: '1px', background: '#F0FDF4' }}></div>
                </div>
                
                {activeWallets.length === 0 ? (
                    <EmptyState 
                        title="No Active Wallets" 
                        description="Start saving for a goal by creating your first wallet." 
                    />
                ) : (
                    <div className="dashboard-grid">
                        {activeWallets.map(wallet => (
                            <WalletCard 
                                key={wallet.id} 
                                wallet={wallet} 
                                onAddMoney={() => {
                                    setSelectedWallet(wallet);
                                    setIsAddMoneyModalOpen(true);
                                }}
                                onClaim={() => claimMutation.mutate(wallet.id)}
                                onDelete={() => deleteMutation.mutate(wallet.id)}
                                onViewHistory={() => {
                                    setSelectedId(wallet.id);
                                    setIsHistoryModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* History Section */}
            {completedWallets.length > 0 && (
                <section style={{ marginTop: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>History (Completed)</h3>
                        <div style={{ flex: 1, height: '1px', background: '#F0FDF4' }}></div>
                    </div>
                    
                    <div className="dashboard-grid">
                        {completedWallets.map(wallet => (
                            <WalletCard 
                                key={wallet.id} 
                                wallet={wallet} 
                                isHistory 
                                onDelete={() => deleteMutation.mutate(wallet.id)}
                                onViewHistory={() => {
                                    setSelectedId(wallet.id);
                                    setIsHistoryModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Modals */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <Modal 
                        title="Create New Goal Wallet" 
                        onClose={() => setIsCreateModalOpen(false)}
                    >
                        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="label-caps">Wallet Name</label>
                                <input 
                                    className="premium-input"
                                    type="text" value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Buy New Phone"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label-caps">Target Amount (₹)</label>
                                <input 
                                    className="premium-input"
                                    type="number" value={formData.target_amount} 
                                    onChange={e => setFormData({...formData, target_amount: e.target.value})}
                                    placeholder="10000"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label-caps">Description (Optional)</label>
                                <textarea 
                                    className="premium-input"
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Why are you saving for this?"
                                />
                            </div>
                            {formError && <p className="error-msg" style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>{formError}</p>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-premium secondary" style={{ justifyContent: 'center' }} onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-premium primary" style={{ justifyContent: 'center' }} disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {isAddMoneyModalOpen && (
                    <Modal 
                        title={`Add Money to ${selectedWallet?.name}`} 
                        onClose={() => setIsAddMoneyModalOpen(false)}
                    >
                        <form onSubmit={handleAddMoneySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="label-caps">Amount to Add (₹)</label>
                                <input 
                                    className="premium-input"
                                    style={{ fontSize: '1.75rem', fontWeight: 900, textAlign: 'center' }}
                                    type="number" value={addAmount} 
                                    onChange={e => setAddAmount(e.target.value)}
                                    placeholder="500"
                                    autoFocus
                                />
                            </div>
                            {formError && <p className="error-msg" style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>{formError}</p>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-premium secondary" style={{ justifyContent: 'center' }} onClick={() => setIsAddMoneyModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-premium primary" style={{ justifyContent: 'center' }} disabled={addMoneyMutation.isPending}>
                                    {addMoneyMutation.isPending ? 'Adding...' : 'Add Money'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {isHistoryModalOpen && (
                    <Modal 
                        title={`History: ${walletDetails?.name || 'Loading...'}`} 
                        onClose={() => {
                            setIsHistoryModalOpen(false);
                            setSelectedId(null);
                        }}
                    >
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {isLoadingDetails ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : walletDetails?.transactions?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {walletDetails.transactions.map(t => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F0FDF4' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <ArrowUpRight size={14} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Money Added</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 800, color: '#16A34A' }}>+₹{Number(t.amount).toLocaleString('en-IN')}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>No transactions found for this goal.</p>
                            )}
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

const WalletCard = ({ wallet, onAddMoney, onClaim, onDelete, onViewHistory, isHistory }) => {
    const progress = Math.min((Number(wallet.current_amount || 0) / Number(wallet.target_amount || 1)) * 100, 100);
    const isTargetReached = Number(wallet.current_amount || 0) >= Number(wallet.target_amount || 0);
    const remaining = Math.max(Number(wallet.target_amount || 0) - Number(wallet.current_amount || 0), 0);

    return (
        <Motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`premium-card glass ${isHistory ? 'completed' : ''}`}
            style={{ 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem',
                opacity: isHistory ? 0.8 : 1,
                borderStyle: isHistory ? 'dashed' : 'solid',
                borderColor: isTargetReached && !isHistory ? '#22C55E' : '#F0FDF4'
            }}
        >
            <div className="card-header" style={{ padding: 0, border: 'none' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isTargetReached && !isHistory ? '#DCFCE7' : '#F0FDF4', color: isTargetReached && !isHistory ? '#16A34A' : '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isHistory ? <CheckCircle2 size={24} /> : <Coins size={24} />}
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>{wallet.name}</h4>
                        {isHistory && <span className="label-caps" style={{ background: '#E2E8F0', padding: '2px 8px', borderRadius: '99px' }}>Completed</span>}
                    </div>
                </div>
                <button 
                    className="icon-btn"
                    style={{ color: '#94A3B8' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this goal?')) onDelete();
                    }}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div>
                <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{wallet.description || 'No description'}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹{Number(wallet.current_amount || 0).toLocaleString('en-IN')}</span>
                    <span className="label-caps">Target: ₹{Number(wallet.target_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '8px', background: '#F0FDF4', borderRadius: '4px', overflow: 'hidden' }}>
                    <Motion.div 
                        style={{ height: '100%', background: isTargetReached && !isHistory ? '#22C55E' : '#1B6B3A' }} 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ color: '#64748B' }}>{progress.toFixed(0)}% reached</span>
                    {!isHistory && !isTargetReached && (
                        <span style={{ color: '#1B6B3A' }}>₹{remaining.toLocaleString('en-IN')} more to go</span>
                    )}
                    {isTargetReached && !isHistory && (
                        <span style={{ color: '#16A34A' }}>Goal achieved! 🎉</span>
                    )}
                </div>
            </div>

            {!isHistory && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                    <button className="btn-premium secondary" style={{ justifyContent: 'center', padding: '10px' }} onClick={onAddMoney}>
                        <Plus size={16} /> Add Money
                    </button>
                    <button 
                        className="btn-premium primary"
                        style={{ justifyContent: 'center', padding: '10px', background: isTargetReached ? '#22C55E' : '#F0FDF4', color: isTargetReached ? 'white' : '#94A3B8' }}
                        disabled={!isTargetReached}
                        onClick={onClaim}
                    >
                        {isTargetReached ? <CheckCircle2 size={16} /> : <Lock size={16} />}
                        Claim
                    </button>
                </div>
            )}

            {!isHistory && (
                <button 
                    className="btn-premium secondary" 
                    style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: '1px solid #F0FDF4' }} 
                    onClick={onViewHistory}
                >
                    <History size={16} /> View History
                </button>
            )}
        </Motion.div>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="modal-overlay" onClick={onClose}>
        <Motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="premium-card" 
            style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: 'white' }}
            onClick={e => e.stopPropagation()}
        >
            <div className="card-header" style={{ border: 'none', padding: '0 0 2rem 0' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{title}</h3>
                <button className="icon-btn" onClick={onClose}><X size={24} /></button>
            </div>
            {children}
        </Motion.div>
    </div>
);

export default Segregation;
