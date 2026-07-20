import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Mail, 
    KeyRound, 
    Wrench, 
    DollarSign, 
    Briefcase,
    Sparkles 
} from 'lucide-react';

const ProductLauncher = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('PUBLIC'); // 'PUBLIC' or 'BUSINESS'
    const modalRef = useRef(null);

    // Keyboard accessibility: ESC key closes launcher
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent background scroll when launcher is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

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
        <div 
            className="launcher-overlay" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-labelledby="launcher-title"
        >
            <div 
                className="launcher-container" 
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
            >
                {/* Header */}
                <div className="launcher-header">
                    <div>
                        <h2 id="launcher-title" className="launcher-title">
                            <Sparkles size={20} className="launcher-title-icon" />
                            Products
                        </h2>
                        <p className="launcher-subtitle">Quick access to all CLIKS products</p>
                    </div>
                    <button 
                        className="launcher-close-btn" 
                        onClick={onClose}
                        aria-label="Close launcher panel"
                    >
                        <X size={20} />
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
                                        style={{ backgroundColor: `${prod.color}15`, color: prod.color }}
                                    >
                                        <IconComponent size={24} strokeWidth={2} />
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
            </div>

            {/* Embedded styles to maintain self-containment */}
            <style>{`
                .launcher-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    z-index: 9999;
                    animation: launcherFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .launcher-container {
                    background: #ffffff;
                    width: 90%;
                    max-width: 580px;
                    border-radius: 24px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15), 
                                0 0 0 1px rgba(15, 23, 42, 0.02);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: launcherScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    max-height: 85vh;
                }

                @keyframes launcherFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes launcherScaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.95) translateY(10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0); 
                    }
                }

                .launcher-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.75rem 2rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .launcher-title {
                    font-size: 1.35rem;
                    fontWeight: 900;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .launcher-title-icon {
                    color: #4f46e5;
                }

                .launcher-subtitle {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin: 0.25rem 0 0 0;
                    fontWeight: 500;
                }

                .launcher-close-btn {
                    border: none;
                    background: #f8fafc;
                    color: #64748b;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .launcher-close-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    transform: rotate(90deg);
                }

                .launcher-tabs-wrapper {
                    padding: 1rem 2rem 0;
                    display: flex;
                    justify-content: center;
                    background: #fafafa;
                    border-bottom: 1px solid #f1f5f9;
                }

                .launcher-tabs {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    gap: 4px;
                    width: 100%;
                    max-width: 320px;
                    margin-bottom: 1rem;
                }

                .launcher-tab {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 0.5rem 1rem;
                    font-size: 0.78rem;
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
                    padding: 2rem;
                    overflow-y: auto;
                    flex: 1;
                    background: #ffffff;
                }

                .launcher-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                @media (max-width: 640px) {
                    .launcher-grid {
                        grid-template-columns: 1fr;
                    }
                    .launcher-container {
                        width: 95%;
                    }
                    .launcher-header, .launcher-grid-wrapper {
                        padding: 1.5rem;
                    }
                    .launcher-tabs-wrapper {
                        padding: 0.75rem 1.5rem 0;
                    }
                }

                .launcher-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1.15rem;
                    border-radius: 18px;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    background: #ffffff;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .launcher-card:hover, .launcher-card:focus-visible {
                    transform: translateY(-2px);
                    border-color: rgba(79, 70, 229, 0.3);
                    box-shadow: 0 10px 20px -10px rgba(79, 70, 229, 0.15),
                                0 0 0 2px rgba(79, 70, 229, 0.05);
                }

                .launcher-card:active {
                    transform: translateY(0);
                }

                .launcher-card-icon-container {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    flex-shrink: 0;
                    transition: transform 0.25s ease;
                }

                .launcher-card:hover .launcher-card-icon-container {
                    transform: scale(1.05);
                }

                .launcher-card-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .launcher-card-name {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .launcher-card-desc {
                    font-size: 0.78rem;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.35;
                    font-weight: 500;
                }

                .launcher-footer {
                    padding: 1.25rem 2rem;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.72rem;
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
