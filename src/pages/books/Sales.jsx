import React from 'react';
import { ShoppingCart, TrendingUp, Receipt, Users } from 'lucide-react';

const Sales = () => {
    return (
        <div className="content-wrapper">
            <div style={{ padding: '2rem 0 1rem 0' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Sales</h1>
                <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                    Manage your sales orders, invoices, and customer transactions.
                </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                {[
                    { icon: <Receipt size={24} />, label: 'Sales Orders', color: '#ECFDF5', iconColor: '#10B981', count: '0' },
                    { icon: <ShoppingCart size={24} />, label: 'Invoices', color: '#EFF6FF', iconColor: '#3B82F6', count: '0' },
                    { icon: <Users size={24} />, label: 'Customers', color: '#FEF3C7', iconColor: '#F59E0B', count: '0' },
                    { icon: <TrendingUp size={24} />, label: 'Revenue', color: '#F0FDFA', iconColor: '#14B8A6', count: '₹0' },
                ].map((item) => (
                    <div key={item.label} style={{
                        background: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.color, color: item.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', marginTop: '0.2rem' }}>{item.count}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#64748B' }}>No sales data yet</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.4rem' }}>Create your first sales order to get started.</p>
            </div>
        </div>
    );
};

export default Sales;
