import React from 'react';
import { Calculator, FileText, PieChart, TrendingUp, Download, Plus } from 'lucide-react';

const Accounting = () => {
    return (
        <div className="content-wrapper">
            <div style={{ padding: '2rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Accounting</h1>
                    <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                        Professional ledger management and financial statements.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', color: '#1E293B', cursor: 'pointer' }}>
                        <Download size={18} /> Export
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#1B6B3A', border: 'none', borderRadius: '10px', fontWeight: '700', color: '#fff', cursor: 'pointer' }}>
                        <Plus size={18} /> New Entry
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Profit & Loss</h3>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#059669' }}>₹0.00</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>Net profit for current fiscal period</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={22} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Balance Sheet</h3>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1E293B' }}>₹0.00</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>Total assets vs liabilities summary</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PieChart size={22} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Tax Summary</h3>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1E293B' }}>₹0.00</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>Estimated tax liability for current period</p>
                </div>
            </div>

            <div style={{ marginTop: '2.5rem', background: '#fff', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>General Ledger</h3>
                </div>
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: '#F8FAFC', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Calculator size={32} />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#475569', margin: 0 }}>No Journal Entries</h4>
                    <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.5rem', maxWidth: '300px', margin: '0.5rem auto' }}>
                        Start by recording your first transaction or importing your bank statement.
                    </p>
                    <button style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        Create Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Accounting;
