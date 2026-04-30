import React from 'react';
import { 
    LayoutDashboard, 
    Briefcase, 
    BarChart3, 
    Users, 
    TrendingUp, 
    DollarSign, 
    Package, 
    ShoppingCart,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Bell
} from 'lucide-react';
import '../App.css';

const BusinessDashboard = () => {
    // Mock data for Business Dashboard
    const stats = [
        { label: 'Monthly Revenue', value: '₹4,52,000', change: '+12.5%', icon: DollarSign, color: '#1B6B3A' },
        { label: 'Active Projects', value: '24', change: '+2', icon: Briefcase, color: '#064E3B' },
        { label: 'Business Growth', value: '18%', change: '+3.1%', icon: TrendingUp, color: '#059669' },
        { label: 'New Clients', value: '12', change: '+4', icon: Users, color: '#10B981' }
    ];

    return (
        <div style={{ padding: '2rem', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', marginBottom: '0.25rem' }}>Business Overview</h1>
                    <p style={{ color: '#64748B' }}>Monitor your enterprise performance and operations.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search analytics..." 
                            style={{ padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', width: '260px' }}
                        />
                    </div>
                    <button style={{ padding: '0.65rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B' }}>
                        <Bell size={20} />
                    </button>
                    <button style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '600' }}>
                        Create Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', background: '#F0FDF4', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{stat.change}</span>
                        </div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B' }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Revenue Chart Placeholder */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E293B' }}>Revenue Streams</h2>
                        <select style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
                        {[40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} style={{ flex: 1, background: i === 11 ? '#1B6B3A' : '#DCF2E4', height: `${h}%`, borderRadius: '6px 6px 0 0', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#94A3B8' }}>
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: '#064E3B', padding: '1.5rem', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Business Plan</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>You are on the Pro Enterprise plan. Renew in 12 days.</p>
                            <button style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'white', color: '#064E3B', border: 'none', fontWeight: '700' }}>Manage Subscription</button>
                        </div>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', marginBottom: '1.25rem' }}>Recent Operations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { title: 'Inventory Restock', time: '2h ago', status: 'Completed' },
                                { title: 'New Client Onboarding', time: '5h ago', status: 'Pending' },
                                { title: 'Payroll Processed', time: 'Yesterday', status: 'Completed' }
                            ].map((op, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{op.title}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{op.time}</span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: op.status === 'Completed' ? '#15803D' : '#B45309' }}>{op.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;
