import React, { useState } from 'react';
import {
    TrendingUp,
    PiggyBank,
    Bitcoin,
    Coins,
    Activity
} from 'lucide-react';

import SIPView from './investments/SIPView';
import MutualFundsView from './investments/MutualFundsView';
import CryptoView from './investments/CryptoView';
import BitcoinView from './investments/BitcoinView';
import OverallTradingView from './investments/OverallTradingView';

import '../App.css';

const Investments = () => {
    const [activeTab, setActiveTab] = useState('sip');

    const menuItems = [
        { id: 'sip', label: 'SIP', icon: TrendingUp },
        { id: 'mutual_funds', label: 'Mutual Funds', icon: PiggyBank },
        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
        { id: 'bitcoin', label: 'Bitcoin', icon: Coins },
        { id: 'overall', label: 'Overall Trading', icon: Activity }
    ];

    const renderView = () => {
        switch (activeTab) {
            case 'sip': return <SIPView />;
            case 'mutual_funds': return <MutualFundsView />;
            case 'crypto': return <CryptoView />;
            case 'bitcoin': return <BitcoinView />;
            case 'overall': return <OverallTradingView />;
            default: return <SIPView />;
        }
    };

    return (
        <div className="investments-page-root">
            <div className="dashboard-header mb-6"></div>

            <div className="investments-layout-container">
                {/* Sidebar Navigation */}
                <div className="investments-sidebar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`inv-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <div className="inv-nav-icon">
                                <item.icon size={20} />
                            </div>
                            <span className="inv-nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="investments-content-area">
                    {renderView()}
                </div>
            </div>

            <style>{`
                .investments-page-root {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .investments-layout-container {
                    display: flex;
                    gap: 2rem;
                    align-items: flex-start;
                    flex: 1;
                }

                .investments-sidebar {
                    width: 260px;
                    background: white;
                    border-radius: 16px;
                    padding: 1rem;
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex-shrink: 0;
                    position: sticky;
                    top: 80px;
                }

                .inv-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    width: 100%;
                    border: none;
                    background: transparent;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .inv-nav-item:hover {
                    background: #F8FAFC;
                    color: var(--text-main);
                }

                .inv-nav-item.active {
                    background: #F0FDF4;
                    color: var(--primary);
                    font-weight: 600;
                }

                .inv-nav-item .inv-nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .investments-content-area {
                    flex: 1;
                    min-width: 0;
                }

                /* Shared view styles */
                .view-fade-in { animation: viewFadeIn 0.35s ease-out; }
                @keyframes viewFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .inv-view-header { margin-bottom: 1.5rem; }
                .inv-view-title { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .inv-view-subtitle { color: var(--text-muted); font-size: 0.9rem; }
                .inv-section-title { font-size: 1.15rem; font-weight: 600; color: var(--text-main); margin-bottom: 1rem; }

                @media (max-width: 1024px) {
                    .investments-layout-container { flex-direction: column; gap: 1rem; }
                    .investments-sidebar { width: 100%; flex-direction: row; overflow-x: auto; position: static; }
                    .inv-nav-item { width: auto; white-space: nowrap; }
                }
            `}</style>
        </div>
    );
};

export default Investments;
