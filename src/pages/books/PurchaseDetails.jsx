import React from 'react';
import { ShoppingCart, Star, ExternalLink, RefreshCcw, History, ArrowRight } from 'lucide-react';

const PurchaseDetails = () => {
    return (
        <div className="content-wrapper">
            <div style={{ padding: '2rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Purchase Details</h1>
                    <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                        Connected commerce tracking and customer loyalty insights.
                    </p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', fontWeight: '700', color: '#1B6B3A', cursor: 'pointer' }}>
                    <RefreshCcw size={18} /> Sync Data
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <History size={20} style={{ color: '#1B6B3A' }} /> Recent Purchases
                        </h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>Last 30 Days</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                            <ShoppingCart size={40} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#64748B', margin: 0 }}>Connect External Store</h4>
                            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem', maxWidth: '280px', margin: '0.5rem auto' }}>
                                Link your Shopify, Amazon, or local POS system to see all your purchase details here.
                            </p>
                            <button style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ExternalLink size={16} /> Link Store (Dummy)
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)', borderRadius: '24px', padding: '2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><Star size={120} fill="#fff" /></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, opacity: 0.9 }}>Loyalty Points</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0.5rem 0' }}>1,250</div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>You have enough points for a free upgrade!</p>
                        <button style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            Redeem Points <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '1rem' }}>Active Integrations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Amazon Business', 'Flipkart Corporate', 'Local Supermarket'].map(site => (
                                <div key={site} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>{site}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>Connected</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetails;
