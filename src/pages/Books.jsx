import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    User,
    BookUser,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import AnalyticsSection from '../components/AnalyticsSection';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context';
import { transactionsService, homeService } from '../services';
import FinanceReports from './books/components/FinanceReports';
import FinanceAnalytics from './books/components/FinanceAnalytics';

const OverviewCard = (props) => {
    const { title, icon: Icon, color, path, stats, children } = props;
    const navigate = useNavigate();

    return (
        <div
            className="dashboard-tile overview-card-wrapper"
            onClick={() => path && navigate(path)}
        >
            <div className="tile-header overview-card-header">
                <div className="overview-card-header-inner">
                    <div 
                        className="overview-card-icon-wrapper"
                        style={{ background: `${color}15`, color: color }}
                    >
                        {/* Icon component is properly capitalized as dictated by the prop mapping */}
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="overview-card-title">{title}</h3>
                        <span className="overview-card-view-details">
                            View Details <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            </div>

            <div className="tile-content overview-card-content">
                <div className="overview-card-stats-container">
                    {stats ? stats.map((stat, index) => (
                        <div key={index} className="overview-card-stat-row">
                            <span className="overview-card-stat-label">{stat.label}</span>
                            <span className="overview-card-stat-value">{stat.value}</span>
                        </div>
                    )) : children}
                </div>
            </div>
        </div>
    );
};

const Books = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const uid = user?.id ?? user?.email ?? 'guest';

    // Queries
    const { data: dbTransactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionsService.getTransactions(),
        enabled: !!uid && uid !== 'guest',
    });

    const { data: dashboardData } = useQuery({
        queryKey: ['finance-dashboard-enhanced'],
        queryFn: () => homeService.getHomeStats(),
        enabled: !!uid && uid !== 'guest',
    });

    // Settings
    const settingsKey = (uid) => `cliks_finance_settings_${uid}`;
    const [settings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(settingsKey(uid))) || {
                currency: 'INR',
                dateFormat: 'DD MMM YYYY',
                theme: 'Default Slate',
                exportFormat: 'CSV'
            };
        } catch {
            return {
                currency: 'INR',
                dateFormat: 'DD MMM YYYY',
                theme: 'Default Slate',
                exportFormat: 'CSV'
            };
        }
    });

    const currencySymbols = { INR: '₹', USD: '₹', EUR: '€', GBP: '£' };
    const currencySymbol = currencySymbols[settings.currency] || '₹';

    const [budget, setBudget] = useState(20000);
    useEffect(() => {
        if (dashboardData) {
            if (dashboardData.globalBudget !== undefined) setBudget(dashboardData.globalBudget);
        }
    }, [dashboardData]);

    const allTransactions = useMemo(() => {
        return dbTransactions.map(tx => {
            let type = tx.type || '';
            if (type.toLowerCase() === 'income') type = 'Income';
            if (type.toLowerCase() === 'expense') type = 'Expense';
            
            let name = tx.name || tx.incomeName || tx.expenseName || tx.sourceName || tx.title || '';
            if (name.startsWith('[Add] ')) {
                name = name.slice(6);
            }

            return {
                ...tx,
                type,
                name,
                amount: parseFloat(tx.amount) || 0
            };
        });
    }, [dbTransactions]);

    return (
        <>
            <div className="dashboard-header">

            </div>

            <div className="content-wrapper">
                <div className="analytics-section-wrapper">
                    <AnalyticsSection />
                </div>
                <div className="dashboard-grid books-dashboard-grid">

                    {/* Stock Overview */}
                    <OverviewCard
                        title="Stock"
                        icon={TrendingUp}
                        color="#10B981"
                        path="/books/stock"
                        stats={[
                            { label: 'Total Items', value: '26' },
                            { label: 'Total Value', value: '₹2,60,500' },
                            { label: 'Low Stock', value: '1 Item' }
                        ]}
                    />

                    {/* People Overview */}
                    <OverviewCard
                        title="People"
                        icon={User}
                        color="#F59E0B"
                        path="/books/people/overview"
                        stats={[
                            { label: 'Total Contacts', value: '12' },
                            { label: 'To Receive', value: '₹500' },
                            { label: 'To Pay', value: '₹200' }
                        ]}
                    />

                    {/* Finance Overview */}
                    <OverviewCard
                        title="Finance"
                        icon={TrendingUp}
                        color="#1B6B3A"
                        path="/books/finance"
                        stats={[
                            { label: 'Tracking', value: 'Active' },
                            { label: 'Updates', value: 'Real-time' }
                        ]}
                    />

                    {/* Financial Contacts */}
                    <OverviewCard
                        title="Financial Contacts"
                        icon={BookUser}
                        color="#10B981"
                        // path="/books/contacts" // Placeholder
                        stats={[
                            { label: 'Bankers', value: '2' },
                            { label: 'Advisors', value: '1' },
                            { label: 'Auditors', value: '1' }
                        ]}
                    />

                </div>
                {/* Interactive Analytics Section */}
                <div style={{ marginTop: '3rem' }}>
                    <FinanceAnalytics 
                        transactions={allTransactions} 
                        currencySymbol={currencySymbol} 
                    />
                </div>

                {/* Reports Engine Section */}
                <div style={{ marginTop: '3rem', paddingBottom: '3rem' }}>
                    <FinanceReports 
                        transactions={allTransactions} 
                        budget={budget} 
                        currencySymbol={currencySymbol} 
                    />
                </div>
            </div>

            <style>{`
                body:not([data-theme='dark']), 
                .app-root:not([data-theme='dark']), 
                .app-body:not([data-theme='dark']), 
                .main-content-area:not([data-theme='dark']), 
                .content-scrollable:not([data-theme='dark']) {
                    background-color: #ffffff !important;
                }
                .overview-card-wrapper {
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                }
                .overview-card-wrapper:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .overview-card-header {
                    border-bottom: none;
                    padding: 1.5rem 1.5rem 0.5rem;
                }
                .overview-card-header-inner {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .overview-card-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .overview-card-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0;
                }
                .overview-card-view-details {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .overview-card-content {
                    padding: 0 1.5rem 1.5rem;
                    flex: 1;
                }
                .overview-card-stats-container {
                    margin-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .overview-card-stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                }
                .overview-card-stat-label {
                    color: var(--text-muted);
                }
                .overview-card-stat-value {
                    font-weight: 600;
                    color: var(--text-main);
                }
                .analytics-section-wrapper {
                    margin-bottom: 24px;
                }
                .books-dashboard-grid {
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
            `}</style>
        </>
    );
};

export default Books;
