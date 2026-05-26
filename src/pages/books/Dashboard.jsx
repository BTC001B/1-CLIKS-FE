import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../../context';
import {
    Package,
    Users,
    Wallet,
    SplitSquareVertical,
    ArrowRight,
    ArrowUpRight,
    Search,
    Bell,
    Settings,
    Activity,
    Plus,
    Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services';
import '../../App.css';

const BooksDashboard = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch live dashboard summary for books
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['books-dashboard-data'],
        queryFn: homeService.getBooksDashboardData,
        select: (res) => res?.data || res,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true
    });

    React.useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="animate-spin" color="#1B6B3A" />
            </div>
        );
    }

    // Premium Metric Grid Data
    const metrics = [
        { 
            label: 'Asset Inventory Value', 
            value: formatCurrency(stats?.stock?.totalValue || 0), 
            change: 'Live',
            icon: Package, 
            color: '#1B6B3A'
        },
        { 
            label: 'Segregated Funds Total', 
            value: formatCurrency(stats?.wallets?.saved || 0), 
            change: 'Live',
            icon: Wallet, 
            color: '#064E3B'
        },
        { 
            label: 'Split Shared Costs', 
            value: formatCurrency(stats?.splits?.totalAmount || 0), 
            change: 'Live',
            icon: SplitSquareVertical, 
            color: '#059669'
        }
    ];

    return (
        <div className="premium-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', background: '#ffffff' }}>
            {/* Header */}
            <div className="dashboard-header" style={{ flexShrink: 0 }}>
                <div className="dashboard-header-title">
                    <h1>Books Console</h1>
                    <p>Monitor your personal finance & operational intelligence suite.</p>
                </div>
                <div className="dashboard-header-actions">
                    <div className="dashboard-search-wrapper">
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Find modules, assets..."
                            className="dashboard-search-input"
                        />
                    </div>

                    <button
                        onClick={() => navigate('/books/stock')}
                        style={{
                            padding: '0.65rem 1.5rem',
                            borderRadius: '12px',
                            background: '#1B6B3A',
                            color: 'white',
                            border: 'none',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.15)'
                        }}
                    >
                        <Plus size={16} /> New Asset
                    </button>
                </div>
            </div>

            {/* Scrollable Dashboard Content */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>
                {/* Stats Grid */}
                <div className="dashboard-stats-grid">
                    {metrics.map((stat, idx) => (
                        <div key={idx} className="dashboard-stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                    <stat.icon size={20} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', background: '#F0FDF4', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{stat.change}</span>
                            </div>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</h3>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>{stat.value}</h2>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {/* Left Panel: Modules Suite */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Modules & Management Suite</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Inventory Module */}
                            <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/books/stock')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'white', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.25rem 0' }}>Inventory & Stocks</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', margin: 0, lineHeight: '1.4' }}>Real-time overview of products, stock alerts, and individual restock thresholds.</p>
                                    </div>
                                </div>
                                <div style={{ color: '#1B6B3A', background: '#DCF2E4', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRight size={16} />
                                </div>
                            </div>

                            {/* People Module */}
                            <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/books/people')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'white', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.25rem 0' }}>People Hub</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', margin: 0, lineHeight: '1.4' }}>Operational base for handling contacts, payables, receivables, and transactions.</p>
                                    </div>
                                </div>
                                <div style={{ color: '#1B6B3A', background: '#DCF2E4', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Operational Health & Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Goal Targets Widget */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>Fund Segregation</h3>
                                <Link to="/finance/segregation" style={{ textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700', color: '#1B6B3A' }}>
                                    Manage
                                </Link>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', marginBottom: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Wallet size={18} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Active Wallets</p>
                                    <p style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: '0.1rem 0 0 0' }}>{stats?.wallets?.total || 0} Established</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={18} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Target Saved</p>
                                    <p style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: '0.1rem 0 0 0' }}>{formatCurrency(stats?.wallets?.saved || 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shared Cost & Bill Segregation */}
                        <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)', color: 'white', padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(6, 78, 59, 0.15)' }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Personalized Bills & Splits</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '1.25rem', fontWeight: '500', lineHeight: '1.5' }}>
                                    Manage complex bill cost splits among groups, monitor personal accounting logs, and reconcile joint statements.
                                </p>
                                <Link to="/finance/split-expense" style={{ textDecoration: 'none' }}>
                                    <button style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'white', color: '#064E3B', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                                        View Joint Expenses <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </div>
                            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BooksDashboard;
