import React, { useState, useMemo } from 'react';
import { ShoppingCart, Star, ExternalLink, RefreshCcw, History, ArrowRight, Package, Receipt, IndianRupee, Clock, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { financePlusService } from '../../services';

const PurchaseDetails = () => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
        queryKey: ['customer-purchases'],
        queryFn: financePlusService.getPurchases
    });

    const { data: loyalty = { available_points: 0, lifetime_earned: 0, total_redeemed: 0 }, isLoading: loadingLoyalty } = useQuery({
        queryKey: ['loyalty-stats'],
        queryFn: financePlusService.getLoyaltyStats
    });

    const groupedPurchases = useMemo(() => {
        const groups = {};
        purchases.forEach(p => {
            const id = p.merchant_business_id || p.merchant_name; // Fallback if ID missing
            if (!groups[id]) {
                groups[id] = {
                    id,
                    merchant_name: p.merchant_name,
                    total_purchases: 0,
                    total_loyalty: 0,
                    total_spent: 0,
                    last_purchase: p.timestamp,
                    invoices: []
                };
            }
            groups[id].total_purchases += 1;
            groups[id].total_loyalty += (p.points_earned || 0);
            groups[id].total_spent += (p.grand_total || 0);
            if (new Date(p.timestamp) > new Date(groups[id].last_purchase)) {
                groups[id].last_purchase = p.timestamp;
            }
            groups[id].invoices.push(p);
        });
        return Object.values(groups).sort((a, b) => new Date(b.last_purchase) - new Date(a.last_purchase));
    }, [purchases]);

    const handleSync = () => {
        queryClient.invalidateQueries(['customer-purchases']);
        queryClient.invalidateQueries(['loyalty-stats']);
    };

    const getStatusStyle = (status) => {
        if (status === 'Paid' || status === 'Completed') return { bg: '#ECFDF5', text: '#059669' };
        if (status === 'Pending' || status === 'Unpaid') return { bg: '#FFF7ED', text: '#D97706' };
        return { bg: '#F8FAFC', text: '#64748B' };
    };

    return (
        <div className="content-wrapper">
            <div style={{ padding: '2rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Purchase Details</h1>
                    <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                        Connected commerce tracking and customer loyalty insights.
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={loadingPurchases}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', fontWeight: '700', color: '#1B6B3A', cursor: 'pointer', opacity: loadingPurchases ? 0.6 : 1 }}
                >
                    <RefreshCcw size={18} className={loadingPurchases ? 'animate-spin' : ''} /> {loadingPurchases ? 'Syncing...' : 'Sync Data'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <History size={20} style={{ color: '#1B6B3A' }} /> Recent Purchases
                            </h3>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>By Merchant</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {groupedPurchases.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                    <ShoppingCart size={40} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#64748B', margin: 0 }}>No Purchases Found</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem', maxWidth: '280px', margin: '0.5rem auto' }}>
                                        Make a purchase at any CLIKS Business merchant to see your history and loyalty points here.
                                    </p>
                                    <button style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ExternalLink size={16} /> Link External Store (Dummy)
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                    {groupedPurchases.map(group => (
                                        <div key={group.id} style={{ border: '1px solid #F1F5F9', borderRadius: '20px', padding: '1.5rem', background: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>{group.merchant_name}</h4>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                                                        {group.total_purchases} {group.total_purchases === 1 ? 'Purchase' : 'Purchases'}
                                                    </div>
                                                </div>
                                                <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#F0FDF4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <ShoppingCart size={20} />
                                                </div>
                                            </div>

                                            <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Loyalty Earned</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#7C3AED', fontWeight: 850 }}>{group.total_loyalty} pts</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Last Purchase</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 700 }}>{new Date(group.last_purchase).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedBusiness(group)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '12px',
                                                    background: '#fff',
                                                    border: '1px solid #E2E8F0',
                                                    color: '#1E293B',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                                                onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                            >
                                                <History size={16} /> History
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)', borderRadius: '24px', padding: '2rem', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Star size={120} fill="#fff" /></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, opacity: 0.9 }}>Loyalty Points</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0.5rem 0' }}>{(loyalty?.available_points || 0).toLocaleString()}</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 }}>Lifetime Earned</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{(loyalty?.lifetime_earned || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 }}>Total Redeemed</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{(loyalty?.total_redeemed || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <button style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                            Redeem Points <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Active Integrations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Amazon Business', 'Flipkart Corporate', 'Local Supermarket'].map(site => (
                                <div key={site} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>{site}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>Connected</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: '#F0FDF4', borderRadius: '20px', padding: '1.25rem', border: '1px solid #DCFCE7', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', margin: 0 }}>Auto-Sync Active</h4>
                            <p style={{ fontSize: '0.75rem', color: '#15803D', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                                Every purchase you make at a CLIKS Business partner is automatically synced to your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {selectedBusiness && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBusiness(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '80vh', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>{selectedBusiness.merchant_name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>Purchase History & Invoices</p>
                                </div>
                                <button onClick={() => setSelectedBusiness(null)} style={{ width: 36, height: 36, borderRadius: '10px', background: '#F8FAFC', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {selectedBusiness.invoices.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(inv => (
                                    <div key={inv.id} style={{ border: '1px solid #F1F5F9', borderRadius: '16px', padding: '1.25rem', background: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Receipt size={16} style={{ color: '#64748B' }} />
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>{inv.invoice_number}</span>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginTop: '4px' }}>{new Date(inv.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1B6B3A' }}>₹{(inv.grand_total || 0).toLocaleString()}</div>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 850, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '6px', ...getStatusStyle(inv.payment_status) }}>{inv.payment_status}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>GST</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>₹{(inv.tax_amount || 0).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Points</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#7C3AED' }}>+{inv.points_earned || 0}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
                                                    View Items <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseDetails;

