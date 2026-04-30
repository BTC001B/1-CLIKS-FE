import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    User,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Target,
    History,
    TrendingUp,
    TrendingDown,
    Building2,
    FileText,
    PiggyBank,
    Gift,
    X,
    Trash2,
    AlertTriangle,
    LayoutGrid,
    LineChart,
    Loader2
} from 'lucide-react';
import { PageHeader } from '../../components/common';
import '../../App.css';
import { formatCurrency } from '../../lib/formatCurrency';
import AnalyticsSection from '../../components/AnalyticsSection';
import BudgetMixTile from '../../components/dashboard/BudgetMixTile';
import SplitBillsTile from '../../components/dashboard/SplitBillsTile';

import MarketPulseTile from '../../components/dashboard/MarketPulseTile';
import MoneyGoalsTile from '../../components/dashboard/MoneyGoalsTile';

import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services';

// Fix for potential ReferenceError in stale builds or cached components
const StatsCard = () => null;

const AccountCard = (props) => {
    const { name, amount, color, icon: Icon } = props;
    return (
        <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', minHeight: '120px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: color || '#1B6B3A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icon ? <Icon size={28} /> : <Building2 size={28} />}
            </div>
            <div>
                <div className="label-caps" style={{ marginBottom: '4px' }}>{name}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>{formatCurrency(amount)}</div>
            </div>
        </div>
    );
};

const DonutChart = (props) => {
    const { label, value, colorClass, percent = 75, icon: Icon } = props;
    const strokeColor = colorClass === 'chart-success' ? '#10B981' : colorClass === 'chart-warning' ? '#F59E0B' : '#EF4444';
    
    return (
        <div className="circular-chart-container" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1rem' }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F0FDF4"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeDasharray={`${percent}, 100`}
                        strokeLinecap="round"
                    />
                </svg>
                {Icon && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94A3B8' }}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
            <div className="label-caps" style={{ fontSize: '9px' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{value}</div>
        </div>
    );
};

const DashboardTile = (props) => {
    const { title, icon: Icon, children, className = '', onRemove, style } = props;
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    return (
        <div className={`premium-card ${expanded ? 'expanded' : ''} ${className}`} style={{ ...style, display: 'flex', flexDirection: 'column' }}>
            {title && (
                <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
                    <div className="card-title" style={{ fontSize: '1.1rem' }}>
                        {Icon && <Icon size={18} color="#1B6B3A" />}
                        <span>{title}</span>
                    </div>
                    <div style={{ position: 'relative' }} ref={menuRef}>
                        <button className="icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => setMenuOpen(!menuOpen)}>
                            <MoreVertical size={16} />
                        </button>

                        {menuOpen && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #F0FDF4', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '160px', padding: '0.5rem' }}>
                                <button style={{ width: '100%', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontWeight: 900, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => { onRemove(); setMenuOpen(false); }}>
                                    <Trash2 size={14} /> Remove tile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div style={{ flex: 1, padding: title ? '1.5rem' : '0' }}>
                {children}
            </div>
            <div
                style={{ height: '6px', background: '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onClick={() => setExpanded(!expanded)}
            >
                <div style={{ width: '24px', height: '3px', background: '#E2E8F0', borderRadius: '2px' }}></div>
            </div>
        </div>
    );
};

const AddWidgetModal = ({ isOpen, onClose, widgets, activeWidgets, onAddWidget }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="premium-card" style={{ width: '100%', maxWidth: '500px', background: 'white' }} onClick={e => e.stopPropagation()}>
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <LayoutGrid size={24} color="#1B6B3A" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Add Widget</h2>
                    </div>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    {widgets.map(widget => {
                        const isActive = activeWidgets.includes(widget.id);
                        const WidgetIcon = widget.icon || LayoutGrid;

                        return (
                            <div
                                key={widget.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '16px',
                                    background: isActive ? '#F8FAFC' : 'white', border: '1px solid #F0FDF4',
                                    opacity: isActive ? 0.6 : 1, cursor: isActive ? 'default' : 'pointer', transition: 'all 0.2s'
                                }}
                                onClick={() => !isActive && onAddWidget(widget.id)}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                    <WidgetIcon size={22} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{widget.title || widget.id}</div>
                                    <div className="label-caps" style={{ fontSize: '8px' }}>{isActive ? 'Already added' : 'Available'}</div>
                                </div>
                                {isActive ? (
                                    <CheckCircle2 size={20} color="#10B981" />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0FDF4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={16} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ConfirmRemoveModal = ({ isOpen, onClose, onConfirm, widgetName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="premium-card" style={{ width: '100%', maxWidth: '400px', background: 'white' }} onClick={e => e.stopPropagation()}>
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444' }}>
                        <AlertTriangle size={24} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Remove Tile</h2>
                    </div>
                </div>
                <div style={{ padding: '2rem' }}>
                    <p style={{ color: '#64748B', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>
                        Remove <strong>{widgetName}</strong> from your dashboard?
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-premium secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>No, Keep</button>
                        <button className="btn-premium primary" style={{ flex: 1, justifyContent: 'center', background: '#EF4444' }} onClick={onConfirm}>Yes, Remove</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BooksDashboard = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['home-stats'],
        queryFn: homeService.getHomeStats,
        select: (res) => res.data
    });

    const [activeWidgets, setActiveWidgets] = useState(['market', 'budget', 'goals', 'split']);
    const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
    const [widgetToRemove, setWidgetToRemove] = useState(null);

    const ALL_WIDGETS = [
        {
            id: 'market',
            title: null,
            icon: LineChart,
            className: '',
            style: { gridColumn: 'span 2', gridRow: 'span 1', minHeight: '190px' }
        },
        {
            id: 'budget',
            title: 'Budget Mix',
            icon: PiggyBank,
            className: '',
            style: { gridColumn: 'span 1', gridRow: 'span 1' }
        },
        {
            id: 'goals',
            title: null,
            icon: Target,
            className: '',
            style: { gridColumn: 'span 1', gridRow: 'span 1' }
        },
        {
            id: 'split',
            title: 'Expense Splits',
            icon: User,
            className: '',
            style: { gridColumn: 'span 1', gridRow: 'span 1' }
        },
        {
            id: 'overview',
            title: 'Financial Health',
            icon: Target,
            className: '',
            style: { gridColumn: 'span 1', gridRow: 'span 1' }
        },
        {
            id: 'transactions',
            title: 'Recent Activity',
            icon: History,
            className: '',
            style: { gridColumn: 'span 2', gridRow: 'span 1' }
        },
    ];

    const addWidget = (id) => {
        if (!activeWidgets.includes(id)) {
            setActiveWidgets([...activeWidgets, id]);
            setIsAddWidgetOpen(false);
        }
    };

    const initiateRemoveWidget = (id) => {
        setWidgetToRemove(id);
    };

    const confirmRemoveWidget = () => {
        if (widgetToRemove) {
            setActiveWidgets(activeWidgets.filter(w => w !== widgetToRemove));
            setWidgetToRemove(null);
        }
    };

    const renderWidget = (id) => {
        switch (id) {
            case 'market': 
                return (
                    <MarketPulseTile 
                        totalValue={stats?.totalInvestments || 0} 
                        totalInvested={stats?.totalInvestedAmount || 0} 
                    />
                );
            case 'goals': return <MoneyGoalsTile />;
            case 'overview': {
                const balance = stats?.totalBalance || 0;
                const income = stats?.monthlyIncome || 0;
                const expenses = stats?.monthlyExpenses || 0;
                const total = income || 1;
                
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <DonutChart 
                            label="Balance" 
                            value={formatCurrency(balance)} 
                            colorClass="chart-success" 
                            percent={75} 
                        />
                        <DonutChart 
                            label="Income" 
                            value={formatCurrency(income)} 
                            colorClass="chart-warning" 
                            percent={100} 
                        />
                        <DonutChart 
                            label="Expenses" 
                            value={formatCurrency(expenses)} 
                            colorClass="chart-danger" 
                            percent={Math.min((expenses / total) * 100, 100)} 
                        />
                    </div>
                );
            }
            case 'transactions': {
                const transactions = stats?.recentTransactions || [];
                return (
                    <div className="hide-scrollbar" style={{ overflowX: 'auto', width: '100%' }}>
                        {transactions.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }} className="label-caps">No recent transactions</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #F0FDF4' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 16px' }} className="label-caps">Log</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px' }} className="label-caps">Description</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px' }} className="label-caps">Date</th>
                                        <th style={{ textAlign: 'right', padding: '12px 16px' }} className="label-caps">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((item, index) => (
                                        <tr key={item.id || index} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: item.type === 'income' ? '#DCFCE7' : '#FEE2E2', color: item.type === 'income' ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {item.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{item.description}</td>
                                            <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>{new Date(item.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#0F172A' }}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            }
            case 'budget': return <BudgetMixTile />;
            case 'split': return <SplitBillsTile />;
            default: return null;
        }
    };

    if (isLoading) return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="#1B6B3A" /></div>;
    
    return (
        <div className="premium-container">
            <PageHeader 
                title={<>Books <span className="text-highlight">Dashboard</span></>}
                subtitle="Central command for your inventory, financial plans, and personal accounting."
                breadcrumb="DASHBOARD"
                primaryAction={{
                    label: "Add Widget",
                    onClick: () => setIsAddWidgetOpen(true)
                }}
            />

            <div style={{ marginTop: '2.5rem' }}>
                <div className="stats-grid">
                    {(stats?.accounts || []).map(account => (
                        <AccountCard key={account.id} name={account.name} amount={account.balance} color={account.color} />
                    ))}
                    <div className="premium-card glass" style={{ border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', background: 'transparent' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F0FDF4', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={20} />
                        </div>
                        <span className="label-caps" style={{ color: '#64748B' }}>Add Account</span>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {activeWidgets.map(widgetId => {
                        const widgetDef = ALL_WIDGETS.find(w => w.id === widgetId);
                        if (!widgetDef) return null;
                        return (
                            <DashboardTile
                                key={widgetDef.id}
                                title={widgetDef.title}
                                icon={widgetDef.icon}
                                className={widgetDef.className}
                                onRemove={() => initiateRemoveWidget(widgetDef.id)}
                                style={widgetDef.style}
                            >
                                {renderWidget(widgetDef.id)}
                            </DashboardTile>
                        );
                    })}
                </div>
            </div>

            <AddWidgetModal
                isOpen={isAddWidgetOpen}
                onClose={() => setIsAddWidgetOpen(false)}
                widgets={ALL_WIDGETS}
                activeWidgets={activeWidgets}
                onAddWidget={addWidget}
            />

            <ConfirmRemoveModal
                isOpen={!!widgetToRemove}
                onClose={() => setWidgetToRemove(null)}
                onConfirm={confirmRemoveWidget}
                widgetName={ALL_WIDGETS.find(w => w.id === widgetToRemove)?.title || widgetToRemove}
            />
        </div>
    );
};


export default BooksDashboard;
