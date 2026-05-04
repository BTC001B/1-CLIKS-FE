import React, { useState } from 'react';
import { 
    Package, 
    ClipboardList, 
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
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services';
import { formatCurrency } from '../../lib/formatCurrency';
import '../../App.css';

const HoverableCard = ({ children, style = {}, linkTo }) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseStyle = {
        background: 'white',
        padding: '1.75rem',
        borderRadius: '24px',
        border: '1px solid #F1F5F9',
        boxShadow: isHovered ? '0 12px 24px -6px rgba(0,0,0,0.06)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        ...style
    };

    return linkTo ? (
        <Link 
            to={linkTo} 
            style={{ textDecoration: 'none', color: 'inherit' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={baseStyle}>{children}</div>
        </Link>
    ) : (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={baseStyle}
        >
            {children}
        </div>
    );
};

const BooksDashboard = () => {
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
            <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="animate-spin" color="#1B6B3A" />
            </div>
        );
    }

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Premium Metric Grid Data
    const metrics = [
        { 
            label: 'Asset Inventory Value', 
            value: formatCurrency(stats?.stock?.totalValue || 0), 
            sub: `${stats?.stock?.totalItems || 0} Products tracked`,
            icon: Package, 
            color: '#10B981', 
            bgColor: '#ECFDF5' 
        },
        { 
            label: 'Goal Wallets Total', 
            value: formatCurrency(stats?.wallets?.saved || 0), 
            sub: `${stats?.wallets?.total || 0} Active wealth goals`,
            icon: Wallet, 
            color: '#8B5CF6', 
            bgColor: '#F5F3FF' 
        },
        { 
            label: 'Split Shared Costs', 
            value: formatCurrency(stats?.splits?.totalAmount || 0), 
            sub: `${stats?.splits?.total || 0} Shared bills`,
            icon: SplitSquareVertical, 
            color: '#E11D48', 
            bgColor: '#FFF1F2' 
        }
    ];

    // Modules detail data
    const modules = [
        {
            id: 'stock',
            label: 'Inventory & Stocks',
            desc: 'Real-time overview of products, stock alerts, and individual restock thresholds.',
            icon: Package,
            link: '/books/stock'
        },
        {
            id: 'plans',
            label: 'Financial Planner',
            desc: 'Comprehensive personal budgeting, monthly expenses, and draft target planners.',
            icon: ClipboardList,
            link: '/books/financial-plan'
        },
        {
            id: 'people',
            label: 'People Hub',
            desc: 'Operational base for handling contacts, payables, receivables, and transactions.',
            icon: Users,
            link: '/books/people'
        }
    ];

    return (
        <div style={{ padding: '2rem 3rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            {/* Real Dashboard Header bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        <Activity size={16} color="#1B6B3A" /> Operations Intelligence Suite
                    </div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.75px', margin: 0, lineHeight: '1.2' }}>
                        Books <span style={{ color: '#1B6B3A' }}>Console</span>
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1rem', fontWeight: '500', marginTop: '0.25rem' }}>
                        Welcome back! Here is your business & personal finance intelligence breakdown for <strong style={{ color: '#1E293B' }}>{todayDate}</strong>.
                    </p>
                </div>

                {/* Right utility & actions hub */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Find modules, assets..." 
                            style={{ 
                                padding: '0.75rem 1.25rem 0.75rem 2.75rem', borderRadius: '14px', 
                                border: '1px solid #E2E8F0', outline: 'none', background: 'white', width: '250px',
                                fontSize: '0.875rem', color: '#1E293B', fontWeight: '500'
                            }}
                        />
                    </div>
                    <Link to="/books/stock" style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '14px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #0D5C32 100%)', 
                            color: 'white', border: 'none', fontWeight: '700', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(27,107,58,0.18)'
                        }}>
                            <Plus size={18} /> New Asset
                        </button>
                    </Link>
                </div>
            </div>

            {/* Metric Summary Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem', marginBottom: '3rem' }}>
                {metrics.map((metric, idx) => (
                    <HoverableCard key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {metric.label}
                            </span>
                            <div style={{ 
                                width: '46px', height: '46px', borderRadius: '14px', 
                                background: metric.bgColor, color: metric.color, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                            }}>
                                <metric.icon size={22} />
                            </div>
                        </div>
                        
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.75px', margin: '0 0 0.35rem 0' }}>
                                {metric.value}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#94A3B8', fontWeight: '600', margin: 0 }}>
                                {metric.sub}
                            </p>
                        </div>
                    </HoverableCard>
                ))}
            </div>

            {/* Visual Two-Column Hub Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2.5rem' }}>
                
                {/* Left Side: Linked Feature Suite */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Modules & Management Suite</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Quick Access</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {modules.map((mod, idx) => (
                            <HoverableCard key={mod.id} linkTo={mod.link} style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ 
                                            width: '52px', height: '52px', borderRadius: '16px', 
                                            background: '#F1F5F9', color: '#1B6B3A', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            <mod.icon size={26} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: '0 0 0.25rem 0' }}>{mod.label}</h4>
                                            <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '500', margin: 0, lineHeight: '1.4' }}>{mod.desc}</p>
                                        </div>
                                    </div>
                                    <div style={{ color: '#1B6B3A', background: '#DCF2E4', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </HoverableCard>
                        ))}
                    </div>
                </div>

                {/* Right Side: Operational Health & Metrics sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Goal Targets Widget */}
                    <div style={{ 
                        background: 'white', padding: '1.75rem', borderRadius: '24px', 
                        border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>Goal Tracking</h3>
                            <Link to="/books/goal-wallets" style={{ textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', color: '#1B6B3A' }}>
                                Manage Wallets
                            </Link>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '1rem', 
                            padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Active Goal Wallets</p>
                                <p style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B', margin: '0.1rem 0 0 0' }}>{stats?.wallets?.total || 0} Wallets Established</p>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '1rem', 
                            padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9'
                        }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Current Target Saved</p>
                                <p style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B', margin: '0.1rem 0 0 0' }}>{formatCurrency(stats?.wallets?.saved || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shared Cost & Bill Segregation */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)', 
                        color: 'white', padding: '1.75rem', borderRadius: '26px', 
                        boxShadow: '0 12px 32px rgba(6, 78, 59, 0.18)', position: 'relative', overflow: 'hidden' 
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '850', marginBottom: '0.5rem' }}>Personalized Bills & Splits</h3>
                            <p style={{ fontSize: '0.875rem', opacity: 0.85, marginBottom: '1.5rem', fontWeight: '500', lineHeight: '1.5' }}>
                                Manage complex bill cost splits among groups, monitor personal accounting logs, and reconcile joint ledger statements.
                            </p>
                            <Link to="/books/split-expense" style={{ textDecoration: 'none' }}>
                                <button style={{ 
                                    width: '100%', padding: '0.85rem', borderRadius: '14px', 
                                    background: 'white', color: '#064E3B', border: 'none', 
                                    fontWeight: '850', fontSize: '0.9rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}>
                                    View Joint Expenses <ArrowRight size={18} />
                                </button>
                            </Link>
                        </div>
                        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '130px', height: '130px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BooksDashboard;
