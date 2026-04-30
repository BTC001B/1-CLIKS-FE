import React from 'react';
import {
    TrendingUp,
    CalendarClock,
    User,
    BookUser,
    Split,
    Banknote,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import AnalyticsSection from '../components/AnalyticsSection';

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

                    {/* Financial Plan Overview */}
                    <OverviewCard
                        title="Financial Plan"
                        icon={CalendarClock}
                        color="#8B5CF6"
                        path="/books/plan/budget"
                        stats={[
                            { label: 'Active Budgets', value: '4' },
                            { label: 'Pending Goals', value: '2' },
                            { label: 'Next Reminder', value: 'Today' }
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

                    {/* Segregation */}
                    <OverviewCard
                        title="Segregation"
                        icon={Split}
                        color="#EC4899"
                        // path="/books/segregation" // Placeholder
                        stats={[
                            { label: 'Categories', value: '8' },
                            { label: 'Uncategorized', value: '3 Items' },
                            { label: 'Tagged', value: '45 Transactions' }
                        ]}
                    />

                    {/* Split Expenses */}
                    <OverviewCard
                        title="Split Expenses"
                        icon={Banknote}
                        color="#6366F1"
                        // path="/books/split" // Placeholder
                        stats={[
                            { label: 'Active Splits', value: '2' },
                            { label: 'Settled', value: '5' },
                            { label: 'You Owe', value: '₹150' }
                        ]}
                    />

                </div>
            </div>

            <style>{`
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
