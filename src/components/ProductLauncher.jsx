import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services';
import { 
    X, 
    Mail, 
    KeyRound, 
    Wrench, 
    DollarSign, 
    Briefcase,
    Sparkles,
    Edit2,
    Star,
    Check
} from 'lucide-react';

// Extensible products definition
const ALL_PRODUCTS = [
    {
        name: 'Cliks',
        category: 'Public',
        description: 'Make your Money',
        icon: DollarSign,
        color: '#6366F1' // Indigo
    },
    {
        name: 'BNXmail',
        category: 'Public',
        description: 'Real-time mail, always in sync.',
        icon: Mail,
        color: '#3B82F6' // Blue
    },
    {
        name: 'Bit-Tool',
        category: 'Public',
        description: 'User\'s daily utility assistant',
        icon: Wrench,
        color: '#F59E0B' // Amber
    },
    {
        name: 'B2Auth',
        category: 'Public',
        description: 'MFA & SSO Gateway',
        icon: KeyRound,
        color: '#10B981' // Emerald
    },
    {
        name: 'CliksBusiness',
        category: 'Business',
        description: 'Work together, faster',
        icon: Briefcase,
        color: '#EC4899' // Pink
    }
];

const ProductLauncher = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('PUBLIC'); // 'PUBLIC' or 'BUSINESS'

    // Fetch user profile to retrieve favorite products configuration
    const { data: user = {} } = useQuery({
        queryKey: ['profile'],
        queryFn: profileService.getProfile,
    });

    // Parse favorites list, default to a pre-defined set if null/undefined
    const getFavorites = () => {
        if (user.favorite_products === undefined || user.favorite_products === null) {
            return ['Cliks', 'BNXmail', 'Bit-Tool', 'B2Auth'];
        }
        try {
            return JSON.parse(user.favorite_products);
        } catch (e) {
            console.error('Error parsing favorite products:', e);
            return ['Cliks', 'BNXmail', 'Bit-Tool', 'B2Auth'];
        }
    };

    const favorites = getFavorites();

    // Mutation to persist user's favorite products configuration in the database
    const mutation = useMutation({
        mutationFn: async (newFavorites) => {
            return await profileService.updateProfile({ 
                favorite_products: JSON.stringify(newFavorites) 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });

    // Toggle product favorite status
    const toggleFavorite = (name) => {
        let updatedFavorites;
        if (favorites.includes(name)) {
            updatedFavorites = favorites.filter(fav => fav !== name);
        } else {
            updatedFavorites = [...favorites, name];
        }
        mutation.mutate(updatedFavorites);
    };

    // Handle card clicks depending on mode
    const handleProductClick = (name) => {
        if (isEditMode) {
            toggleFavorite(name);
        } else {
            console.log(`Opening ${name}`);
        }
    };

    return (
        <div className="launcher-panel-content" role="dialog" aria-labelledby="launcher-title">
            {/* Header */}
            <div className="launcher-header-wrapper">
                <div className="launcher-header-left">
                    <h2 id="launcher-title" className="launcher-title">
                        <Sparkles size={18} className="launcher-title-icon" />
                        Beta Products
                    </h2>
                    <p className="launcher-subtitle">Quick access to all Beta applications</p>
                </div>
                <div className="launcher-actions">
                    <button 
                        className={`launcher-edit-btn ${isEditMode ? 'active' : ''}`}
                        onClick={() => setIsEditMode(prev => !prev)}
                        aria-label={isEditMode ? "Exit edit mode" : "Enter edit favorites mode"}
                    >
                        {isEditMode ? <Check size={14} /> : <Edit2 size={14} />}
                        {isEditMode ? 'Done' : 'Edit'}
                    </button>
                    <button 
                        className="launcher-close-btn" 
                        onClick={onClose}
                        aria-label="Close launcher panel"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="launcher-scrollable">
                {/* Favorites Section */}
                <div className="launcher-section">
                    <h3 className="launcher-section-title">
                        Your Favorites
                    </h3>
                    
                    {favorites.length === 0 ? (
                        <div className="launcher-no-favorites">
                            <p>No favorite products yet.</p>
                            <p className="no-fav-sub">Click Edit to add your favorite applications.</p>
                        </div>
                    ) : (
                        <div className="launcher-favorites-grid">
                            {favorites.map(favName => {
                                const prod = ALL_PRODUCTS.find(p => p.name === favName);
                                if (!prod) return null;
                                const IconComponent = prod.icon;
                                return (
                                    <div 
                                        key={prod.name} 
                                        className={`launcher-fav-card ${isEditMode ? 'edit-mode' : ''}`}
                                        onClick={() => handleProductClick(prod.name)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Open favorite ${prod.name}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleProductClick(prod.name);
                                            }
                                        }}
                                    >
                                        {isEditMode && (
                                            <button 
                                                className="launcher-fav-remove-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(prod.name);
                                                }}
                                                aria-label={`Remove ${prod.name} from favorites`}
                                            >
                                                <X size={10} strokeWidth={3} />
                                            </button>
                                        )}
                                        <div 
                                            className="launcher-fav-icon-container"
                                            style={{ color: prod.color }}
                                        >
                                            <IconComponent size={22} strokeWidth={2.5} />
                                        </div>
                                        <span className="launcher-fav-name">{prod.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="launcher-divider" />

                {/* Categories Tabs below Favorites */}
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

                {/* Main Product Grid showing only large app icons */}
                <div className="launcher-section" style={{ gap: '1rem' }}>
                    <div className="launcher-main-grid">
                        {ALL_PRODUCTS.filter(p => p.category.toUpperCase() === activeTab).map(prod => {
                            const IconComponent = prod.icon;
                            const isFav = favorites.includes(prod.name);
                            return (
                                <div
                                    key={prod.name}
                                    className={`launcher-all-card ${isEditMode ? 'edit-mode' : ''}`}
                                    style={{ backgroundColor: `${prod.color}12`, color: prod.color }}
                                    onClick={() => handleProductClick(prod.name)}
                                    role="button"
                                    tabIndex={0}
                                    data-tooltip={prod.name}
                                    title={prod.name} /* Browser tooltip fallback */
                                    aria-label={`Open ${prod.name}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleProductClick(prod.name);
                                        }
                                    }}
                                >
                                    <IconComponent size={28} strokeWidth={2.2} />

                                    {/* Star Toggle shown in Edit Mode */}
                                    {isEditMode && (
                                        <button 
                                            className="launcher-grid-star-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(prod.name);
                                            }}
                                            aria-label={isFav ? `Remove ${prod.name} from favorites` : `Add ${prod.name} to favorites`}
                                        >
                                            <Star 
                                                size={12} 
                                                fill={isFav ? "#F59E0B" : "none"} 
                                                stroke={isFav ? "#F59E0B" : "#94a3b8"} 
                                                strokeWidth={2} 
                                            />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="launcher-footer">
                <span>Powered by CLIKS Platform</span>
                <span className="launcher-footer-divider">•</span>
                <span>Future Ready</span>
            </div>

            {/* Premium Styles */}
            <style>{`
                .calc-panel {
                    overflow-x: hidden !important;
                }

                .launcher-panel-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    max-width: 100%;
                    background: #ffffff;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    overflow-x: hidden;
                    box-sizing: border-box;
                }

                .launcher-panel-content,
                .launcher-panel-content * {
                    box-sizing: border-box;
                }

                /* Header Styling */
                .launcher-header-wrapper {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    width: 100%;
                    flex-wrap: nowrap;
                }
                .launcher-header-left {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
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
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }
                .launcher-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .launcher-edit-btn {
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #475569;
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .launcher-edit-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #0f172a;
                }
                .launcher-edit-btn.active {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #166534;
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

                /* Scrollable Container */
                .launcher-scrollable {
                    padding: 1.25rem 1.5rem;
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    width: 100%;
                }
                
                /* Custom Scrollbar for modern feel */
                .launcher-scrollable::-webkit-scrollbar {
                    width: 6px;
                }
                .launcher-scrollable::-webkit-scrollbar-track {
                    background: transparent;
                }
                .launcher-scrollable::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .launcher-scrollable::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Sections */
                .launcher-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    width: 100%;
                }
                .launcher-section-title {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.75px;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .launcher-category-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    margin: 0.5rem 0 0.25rem 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Favorites Grid (4 columns) */
                /* Favorites Horizontal Grid */
                .launcher-favorites-grid {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    gap: 0.75rem;
                    width: 100%;
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding: 0.25rem 0.25rem 0.5rem 0.25rem;
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .launcher-favorites-grid::-webkit-scrollbar {
                    display: none; /* Hide scrollbar for Chrome, Safari, Opera */
                }
                .launcher-fav-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    padding: 0.5rem;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    background: #f8fafc;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    user-select: none;
                    width: 76px;
                    height: 76px;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .launcher-fav-card:hover {
                    transform: translateY(-2px);
                    background: #ffffff;
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .launcher-fav-card:active {
                    transform: scale(0.95);
                }
                .launcher-fav-card.edit-mode {
                    animation: launcher-shake 0.3s ease-in-out infinite alternate;
                }

                @keyframes launcher-shake {
                    0% { transform: rotate(-0.5deg) translateY(0px); }
                    100% { transform: rotate(0.5deg) translateY(-0.5px); }
                }

                .launcher-fav-icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                }
                .launcher-fav-card:hover .launcher-fav-icon-container {
                    transform: scale(1.08);
                }
                .launcher-fav-name {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #475569;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                    padding: 0 2px;
                }
                .launcher-fav-remove-btn {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ef4444;
                    color: #ffffff;
                    border: none;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
                    transition: transform 0.1s ease;
                    z-index: 10;
                }
                .launcher-fav-remove-btn:hover {
                    transform: scale(1.15);
                }

                /* Empty State Favorites */
                .launcher-no-favorites {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    text-align: center;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: #f8fafc;
                    width: 100%;
                }
                .launcher-no-favorites p {
                    margin: 0;
                }
                .no-fav-sub {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    margin-top: 0.25rem !important;
                    font-weight: 500;
                }

                /* Tabs Styling */
                .launcher-tabs-wrapper {
                    padding: 0.25rem 0;
                    display: flex;
                    justify-content: center;
                    width: 100%;
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

                /* Main Launcher App Grid */
                .launcher-main-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem 0.75rem;
                    width: 100%;
                    justify-items: center;
                    align-items: center;
                }
                
                @media (max-width: 480px) {
                    .launcher-main-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .launcher-all-card {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 68px;
                    height: 68px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                    user-select: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                    border: 1px solid #f1f5f9;
                }
                .launcher-all-card:hover {
                    transform: scale(1.08);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);
                    border-color: #e2e8f0;
                }
                .launcher-all-card:active {
                    transform: scale(0.97);
                }
                .launcher-all-card.edit-mode {
                    animation: launcher-shake 0.3s ease-in-out infinite alternate;
                }
                .launcher-grid-star-btn {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.1s ease;
                    z-index: 10;
                    padding: 0;
                }
                .launcher-grid-star-btn:hover {
                    transform: scale(1.15);
                }

                /* Premium Tooltips */
                [data-tooltip] {
                    position: relative;
                }
                [data-tooltip]::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: 115%;
                    left: 50%;
                    transform: translateX(-50%) scale(0.95);
                    background: #0f172a;
                    color: #ffffff;
                    padding: 0.35rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    z-index: 100;
                }
                [data-tooltip]:hover::after {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) scale(1);
                }

                /* Divider */
                .launcher-divider {
                    height: 1px;
                    background: #f1f5f9;
                    width: 100%;
                }

                /* Footer */
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
                    width: 100%;
                    flex-shrink: 0;
                }
                .launcher-footer-divider {
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default ProductLauncher;
