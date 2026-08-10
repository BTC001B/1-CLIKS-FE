import React from 'react';
import { PiggyBank, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinancePage = () => {
    const navigate = useNavigate();

    return (
        <div className="content-wrapper">
            <div style={{ padding: '2rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Finance</h1>
                    <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                        Track your income, fixed costs, and daily spending in one place.
                    </p>
                </div>
            </div>

            <div style={{
                marginTop: '2rem',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '22px',
                    background: '#F0FDF4',
                    color: '#1B6B3A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.12)'
                }}>
                    <PiggyBank size={36} />
                </div>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.85rem',
                    background: '#FEF3C7',
                    color: '#D97706',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '1rem'
                }}>
                    <Clock size={14} /> Under Construction
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                    Finance Section Maintenance
                </h2>

                <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.75rem', maxWidth: '440px', lineHeight: 1.6 }}>
                    This section has been reorganized. Please visit the Accounting module from the left menu to view your financial tools and dashboards.
                </p>

                <button
                    onClick={() => navigate('/books/accounting')}
                    style={{
                        marginTop: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.75rem',
                        background: '#1B6B3A',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    Go to Accounting
                </button>
            </div>
        </div>
    );
};

export default FinancePage;
