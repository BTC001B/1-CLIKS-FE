import React from 'react';
import { ArrowLeftRight, Send, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Transfers = () => {
    const navigate = useNavigate();
    const features = [
        { label: "Bank & Self Transfer", icon: Send, path: "", description: "Transfer funds between accounts" },
        { label: "Split & Collect", icon: Users, path: "", description: "Split bills and track settlements" },
        { label: "Salary Funds", icon: Wallet, path: "", description: "Manage salary allocations" }
    ];

    return (
        <div className="page-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="dashboard-header">
                <div>

                    <p className="text-muted text-sm mt-1">Manage money movements and allocations</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <ArrowLeftRight size={24} />
                </div>
            </div>

            <div className="content-wrapper">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {features.map((item, index) => (
                        <div
                            key={index}
                            className="dashboard-tile"
                            onClick={() => item.path && navigate(item.path)}
                            style={{
                                cursor: 'pointer',
                                padding: '1.5rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = '#10B981';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: '#E0F2FE',
                                color: '#10B981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <item.icon size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.label}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .page-fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Transfers;
