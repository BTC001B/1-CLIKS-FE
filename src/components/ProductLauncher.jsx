import React, { useState } from 'react';
import { 
    X, 
    Mail, 
    KeyRound, 
    Wrench, 
    DollarSign, 
    Briefcase,
    Sparkles 
} from 'lucide-react';

const ProductLauncher = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('PUBLIC'); // 'PUBLIC' or 'BUSINESS'

    const publicProducts = [
        {
            name: 'BNXmail',
            description: 'Real-time mail, always in sync.',
            icon: Mail,
            color: '#3B82F6' // Blue
        },
        {
            name: 'B2Auth',
            description: 'MFA & SSO Gateway',
            icon: KeyRound,
            color: '#10B981' // Emerald
        },
        {
            name: 'Bit-Tool',
            description: 'User\'s daily utility assistant',
            icon: Wrench,
            color: '#F59E0B' // Amber
        },
        {
            name: 'Cliks',
            description: 'Make your Money',
            icon: DollarSign,
            color: '#6366F1' // Indigo
        }
    ];

    const businessProducts = [
        {
            name: 'CliksBusiness',
            description: 'Work together, faster',
            icon: Briefcase,
            color: '#EC4899' // Pink
        }
    ];

    const handleProductClick = (name) => {
        console.log(name);
    };

    const currentProducts = activeTab === 'PUBLIC' ? publicProducts : businessProducts;

    return (
        <div className="launcher-panel-content" role="dialog" aria-labelledby="launcher-title">
            {/* Header */}
            <div className="launcher-header">
                <div>
                    <h2 id="launcher-title" className="launcher-title">
                        <Sparkles size={18} className="launcher-title-icon" />
                        Products
                    </h2>
                    <p className="launcher-subtitle">Quick access to all CLIKS products</p>
                </div>
                <button 
                    className="launcher-close-btn" 
                    onClick={onClose}
                    aria-label="Close launcher panel"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Tabs */}
            <div className="launcher-tabs-wrapper">
                <div className="launcher-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'PUBLIC'}
                        className={`launcher-tab ${activeTab === 'PUBLIC' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PUBLIC')}
                    >
                        PUBLIC
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'BUSINESS'}
                        className={`launcher-tab ${activeTab === 'BUSINESS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('BUSINESS')}
                    >
                        BUSINESS
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="launcher-grid-wrapper">
                <div className="launcher-grid">
                    {currentProducts.map((prod) => {
                        const IconComponent = prod.icon;
                        return (
                            <div
                                key={prod.name}
                                className="launcher-card"
                                onClick={() => handleProductClick(prod.name)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Open ${prod.name}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleProductClick(prod.name);
                                    }
                                }}
                            >
                                <div 
                                    className="launcher-card-icon-container"
                                    style={{ backgroundColor: `${prod.color}12`, color: prod.color }}
                                >
                                    <IconComponent size={22} strokeWidth={2} />
                                </div>
                                <div className="launcher-card-content">
                                    <h4 className="launcher-card-name">{prod.name}</h4>
                                    <p className="launcher-card-desc">{prod.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="launcher-footer">
                <span>Powered by CLIKS Platform</span>
                <span className="launcher-footer-divider">•</span>
                <span>Future Ready</span>
            </div>

            {/* Embedded styles updated for calc-panel alignment */}
            <style>{`
                .launcher-panel-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #ffffff;
                }

                .launcher-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .launcher-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.5px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .launcher-title-icon {
                    color: #6366F1;
                }

                .launcher-subtitle {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0.2rem 0 0 0;
                    font-weight: 500;
                }

                .launcher-close-btn {
                    border: none;
                    background: #f8fafc;
                    color: #64748b;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .launcher-close-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    transform: rotate(90deg);
                }

                .launcher-tabs-wrapper {
                    padding: 0.75rem 1.5rem 0.5rem;
                    display: flex;
                    justify-content: center;
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                }

                .launcher-tabs {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    gap: 4px;
                    width: 100%;
                }

                .launcher-tab {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    border-radius: 9px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: center;
                }

                .launcher-tab.active {
                    background: #ffffff;
                    color: #0f172a;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 
                                0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }

                .launcher-grid-wrapper {
                    padding: 1.25rem 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                    background: #ffffff;
                }

                .launcher-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .launcher-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.85rem;
                    padding: 1rem;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    background: #ffffff;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .launcher-card:hover, .launcher-card:focus-visible {
                    transform: translateY(-2px);
                    border-color: rgba(99, 102, 241, 0.3);
                    box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.15),
                                0 0 0 2px rgba(99, 102, 241, 0.05);
                }

                .launcher-card:active {
                    transform: translateY(0);
                }

                .launcher-card-icon-container {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }

                .launcher-card:hover .launcher-card-icon-container {
                    transform: scale(1.05);
                }

                .launcher-card-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }

                .launcher-card-name {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .launcher-card-desc {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.3;
                    font-weight: 500;
                }

                .launcher-footer {
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.68rem;
                    color: #94a3b8;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .launcher-footer-divider {
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default ProductLauncher;
