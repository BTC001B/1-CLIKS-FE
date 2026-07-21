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
    Edit2,
    Star,
    Check,
    Users,
    Database,
    UserCheck,
    Landmark,
    Rocket,
    History,
    Activity,
    Bot
} from 'lucide-react';

// Extensible products definition
const ALL_PRODUCTS = [
    // Public Apps
    {
        name: 'Cliks',
        category: 'Public',
        icon: DollarSign,
        color: '#6366F1' // Indigo
    },
    {
        name: 'BNXmail',
        category: 'Public',
        icon: Mail,
        color: '#3B82F6' // Blue
    },
    {
        name: 'Bit-Tool',
        category: 'Public',
        icon: Wrench,
        color: '#F59E0B' // Amber
    },
    {
        name: 'B2Auth',
        category: 'Public',
        icon: KeyRound,
        color: '#10B981' // Emerald
    },
    // Business Apps
    {
        name: 'CliksBusiness',
        category: 'Business',
        icon: Briefcase,
        color: '#EC4899' // Pink
    },
    {
        name: 'CRM',
        category: 'Business',
        icon: Users,
        color: '#8B5CF6' // Purple
    },
    {
        name: 'ERP',
        category: 'Business',
        icon: Database,
        color: '#EF4444' // Red
    },
    {
        name: 'HRMS',
        category: 'Business',
        icon: UserCheck,
        color: '#06B6D4' // Cyan
    }
];

// Coming Soon Products definition
const COMING_SOON_PRODUCTS = [
    { name: 'FIN-PRO', icon: Landmark, color: '#10B981' },
    { name: 'Beta Club', icon: Rocket, color: '#F59E0B' },
    { name: 'Payroll', icon: History, color: '#EF4444' },
    { name: 'Analytics', icon: Activity, color: '#3B82F6' },
    { name: 'AI Assistant', icon: Bot, color: '#8B5CF6' }
];

const ProductLauncher = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('PUBLIC'); // 'BASE', 'PUBLIC' or 'BUSINESS'

    // Fetch recents from localStorage, default to empty array
    const [recents, setRecents] = useState(() => {
        try {
            const saved = localStorage.getItem('launcher_recents');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading recents:', e);
            return [];
        }
    });

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

    // Append to recents list
    const recordRecent = (name) => {
        setRecents(prev => {
            const filtered = prev.filter(r => r !== name);
            const updated = [name, ...filtered].slice(0, 4);
            try {
                localStorage.setItem('launcher_recents', JSON.stringify(updated));
            } catch (e) {
                console.error('Error saving recents:', e);
            }
            return updated;
        });
    };

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
            recordRecent(name);
        }
    };

    return (
        <div className="launcher-panel-content" role="dialog" aria-labelledby="launcher-title">
            {/* Header */}
            <div className="launcher-header-wrapper">
                <div className="launcher-header-left">
                    <div className="launcher-beta-logo">
                        <Rocket size={18} strokeWidth={2.5} />
                    </div>
                    <h2 id="launcher-title" className="launcher-title">
                        Beta
                    </h2>
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
                
                {/* Favorites & Recent View Split Container */}
                <div className="launcher-split-container">
                    {/* Left Section: Favorites */}
                    <div className="launcher-split-pane">
                        <span className="launcher-split-subtitle">Favorites</span>
                        {favorites.length === 0 ? (
                            <div className="launcher-split-empty">
                                No favorites
                            </div>
                        ) : (
                            <div className="launcher-split-grid">
                                {favorites.slice(0, 4).map(favName => {
                                    const prod = ALL_PRODUCTS.find(p => p.name === favName);
                                    if (!prod) return null;
                                    const IconComponent = prod.icon;
                                    return (
                                        <div 
                                            key={prod.name} 
                                            className={`launcher-mini-card ${isEditMode ? 'edit-mode' : ''}`}
                                            onClick={() => handleProductClick(prod.name)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleProductClick(prod.name);
                                                }
                                            }}
                                        >
                                            {isEditMode && (
                                                <button 
                                                    className="launcher-mini-remove-btn" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(prod.name);
                                                    }}
                                                    aria-label={`Remove ${prod.name} from favorites`}
                                                >
                                                    <X size={8} strokeWidth={3} />
                                                </button>
                                            )}
                                            <div style={{ color: prod.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconComponent size={20} strokeWidth={2.5} />
                                            </div>
                                            <span className="launcher-mini-name">{prod.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="launcher-split-divider" />

                    {/* Right Section: Recent View */}
                    <div className="launcher-split-pane">
                        <span className="launcher-split-subtitle">Recent View</span>
                        {recents.length === 0 ? (
                            <div className="launcher-split-empty">
                                No recents
                            </div>
                        ) : (
                            <div className="launcher-split-grid">
                                {recents.map(recentName => {
                                    const prod = ALL_PRODUCTS.find(p => p.name === recentName);
                                    if (!prod) return null;
                                    const IconComponent = prod.icon;
                                    return (
                                        <div 
                                            key={prod.name} 
                                            className="launcher-mini-card"
                                            onClick={() => handleProductClick(prod.name)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleProductClick(prod.name);
                                                }
                                            }}
                                        >
                                            <div style={{ color: prod.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconComponent size={20} strokeWidth={2.5} />
                                            </div>
                                            <span className="launcher-mini-name">{prod.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Base Section Header & Tabs */}
                <div className="launcher-base-header">
                    <span className="launcher-base-title">BASE</span>
                    <div className="launcher-base-nav">
                        <button
                            className={`launcher-base-link ${activeTab === 'PUBLIC' ? 'active' : ''}`}
                            onClick={() => setActiveTab('PUBLIC')}
                        >
                            Public
                        </button>
                        <span className="launcher-nav-divider">|</span>
                        <button
                            className={`launcher-base-link ${activeTab === 'BUSINESS' ? 'active' : ''}`}
                            onClick={() => setActiveTab('BUSINESS')}
                        >
                            Business
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
                                    title={prod.name}
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

                <div className="launcher-divider" />

                {/* Coming Soon Section */}
                <div className="launcher-section" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 className="launcher-section-title">Coming Soon</h3>
                    <div className="launcher-main-grid">
                        {COMING_SOON_PRODUCTS.map(prod => {
                            const IconComponent = prod.icon;
                            return (
                                <div
                                    key={prod.name}
                                    className="launcher-all-card coming-soon"
                                    style={{ backgroundColor: `${prod.color}12`, color: prod.color }}
                                    data-tooltip={`${prod.name}`}
                                    title={`${prod.name}`}
                                >
                                    <IconComponent size={28} strokeWidth={2.2} />
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
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
                }
                .launcher-beta-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e0e7ff;
                    color: #6366f1;
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                }
                .launcher-title {
                    font-size: 1.2rem;
                    font-weight: 850;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.5px;
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

                /* Favorites & Recent Split Container */
                .launcher-split-container {
                    display: flex;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 0.85rem;
                    width: 100%;
                    gap: 0.85rem;
                    align-items: stretch;
                }
                .launcher-split-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    min-width: 0;
                }
                .launcher-split-subtitle {
                    font-size: 0.72rem;
                    font-weight: 850;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.2rem;
                }
                .launcher-split-divider {
                    width: 1px;
                    background: #e2e8f0;
                    align-self: stretch;
                }
                .launcher-split-empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    border: 1px dashed #cbd5e1;
                    border-radius: 10px;
                    font-size: 0.68rem;
                    color: #94a3b8;
                    font-weight: 600;
                    padding: 1rem;
                    text-align: center;
                }
                .launcher-split-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                }
                .launcher-mini-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 0.5rem 0.25rem;
                    border-radius: 10px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    cursor: pointer;
                    width: 100%;
                    min-height: 58px;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                .launcher-mini-card:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
                    border-color: #cbd5e1;
                }
                .launcher-mini-card:active {
                    transform: scale(0.96);
                }
                .launcher-mini-card.edit-mode {
                    animation: launcher-shake 0.3s ease-in-out infinite alternate;
                }
                .launcher-mini-name {
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: #64748b;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                    padding: 0 2px;
                }
                .launcher-mini-remove-btn {
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    background: #ef4444;
                    color: #ffffff;
                    border: none;
                    border-radius: 50%;
                    width: 14px;
                    height: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
                    transition: transform 0.1s ease;
                    z-index: 10;
                    padding: 0;
                }
                .launcher-mini-remove-btn:hover {
                    transform: scale(1.15);
                }

                @keyframes launcher-shake {
                    0% { transform: rotate(-0.5deg) translateY(0px); }
                    100% { transform: rotate(0.5deg) translateY(-0.5px); }
                }

                /* Base Header with tab alignments */
                .launcher-base-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding-top: 0.25rem;
                }
                .launcher-base-title {
                    font-size: 0.8rem;
                    font-weight: 850;
                    color: #475569;
                    letter-spacing: 0.75px;
                }
                .launcher-base-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .launcher-base-link {
                    border: none;
                    background: transparent;
                    padding: 2px 4px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .launcher-base-link:hover {
                    color: #475569;
                }
                .launcher-base-link.active {
                    color: #6366F1;
                    border-bottom: 2px solid #6366F1;
                }
                .launcher-nav-divider {
                    color: #cbd5e1;
                    font-size: 0.7rem;
                    user-select: none;
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

                /* Coming soon translucent styles */
                .launcher-all-card.coming-soon {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
                .launcher-all-card.coming-soon:hover {
                    transform: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                    border-color: #f1f5f9;
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
