import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Calculator,
    Contact,
    Shield,
    Plus,
    Edit3,
    SlidersHorizontal,
    X,
    Palette,
    Bell,
    User,
    Lock,
    Sliders,
    Info,
    ChevronRight,
    RotateCcw,
    Delete,
    Share2,
    Trash2,
    Hash,
    Tag,
    Globe,
    ArrowUpDown,
    History,
    Percent,
} from 'lucide-react';
import { CalcPopover } from './common/CalcPopover';

/* ─── Settings Drawer ─────────────────────────────────────────────── */
const SettingsDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const sections = [
        { icon: <Sliders size={18} />,  label: 'General',       description: 'App preferences & defaults',    action: () => { navigate('/books/settings'); onClose(); } },
        { icon: <Palette size={18} />,  label: 'Appearance',    description: 'Theme, colors, display',         action: () => { navigate('/books/settings'); onClose(); } },
        { icon: <Bell size={18} />,     label: 'Notifications', description: 'Alerts, reminders, push',        action: () => { navigate('/books/settings'); onClose(); } },
        { icon: <User size={18} />,     label: 'Account',       description: 'Profile & personal info',        action: () => { navigate('/books/profile');  onClose(); } },
        { icon: <Lock size={18} />,     label: 'Security',      description: 'Password, 2FA, sessions',        action: () => { navigate('/books/settings'); onClose(); } },
        { icon: <Sliders size={18} />,  label: 'Preferences',   description: 'Language, currency, region',     action: () => { navigate('/books/settings'); onClose(); } },
        { icon: <Info size={18} />,     label: 'About',         description: 'Version, licenses, updates',     action: () => { navigate('/books/faq');      onClose(); } },
    ];

    return (
        <>
            <div className={`rs-drawer-overlay ${isOpen ? 'rs-drawer-overlay--open' : ''}`} onClick={onClose} aria-hidden="true" />
            <div ref={drawerRef} className={`rs-drawer ${isOpen ? 'rs-drawer--open' : ''}`} role="dialog" aria-modal="true" aria-label="Settings">
                <div className="rs-drawer-header">
                    <div className="rs-drawer-header-title">
                        <SlidersHorizontal size={18} style={{ color: '#0E4F2E' }} />
                        <span>Settings</span>
                    </div>
                    <button className="rs-drawer-close" onClick={onClose} aria-label="Close settings"><X size={18} /></button>
                </div>
                <div className="rs-drawer-body">
                    <ul className="rs-drawer-list">
                        {sections.map((s) => (
                            <li key={s.label}>
                                <button className="rs-drawer-item" onClick={s.action}>
                                    <span className="rs-drawer-item-icon">{s.icon}</span>
                                    <span className="rs-drawer-item-text">
                                        <span className="rs-drawer-item-label">{s.label}</span>
                                        <span className="rs-drawer-item-desc">{s.description}</span>
                                    </span>
                                    <ChevronRight size={15} className="rs-drawer-item-arrow" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

/* ─── Inline Calculator Panel ─────────────────────────────────────── */
const CalcPanel = ({ onClose }) => {
    return (
        <div className="calc-panel">
            <CalcPopover autoOpen onPanelClose={onClose} />
        </div>
    );
};

/* ─── Right Sidebar ───────────────────────────────────────────────── */
const RightSidebar = ({ isVisible = false, isCalcOpen = false, onCalcToggle, onCalcClose, onToolbarClose }) => {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Close panels when toolbar is hidden
    useEffect(() => {
        if (!isVisible) {
            if (onCalcClose) onCalcClose();
            setIsSettingsOpen(false);
        }
    }, [isVisible]);

    // Escape key closes calc panel
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape' && isCalcOpen && onCalcClose) onCalcClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isCalcOpen, onCalcClose]);

    const topIcons = [
        {
            id: 'close_toolbar',
            title: 'Close Toolbar',
            iconClass: 'icon-edit', // generic gray circle
            icon: <X size={20} />,
            action: onToolbarClose,
            mobileOnly: true
        },
        {
            id: 'calendar',
            title: 'Dashboard',
            iconClass: 'icon-calendar',
            icon: <Calendar size={20} />,
            action: () => { if (onCalcClose) onCalcClose(); navigate('/books/dashboard'); },
        },
        {
            id: 'calculator',
            title: 'Calculator',
            iconClass: 'icon-calculator',
            icon: <Calculator size={20} />,
            action: () => { if (onCalcToggle) onCalcToggle(); },
            active: isCalcOpen,
        },
        {
            id: 'contact',
            title: 'People',
            iconClass: 'icon-contact',
            icon: <Contact size={20} />,
            action: () => { if (onCalcClose) onCalcClose(); navigate('/books/people'); },
        },
        {
            id: 'shield',
            title: 'Business CA',
            iconClass: 'icon-shield',
            icon: <Shield size={20} />,
            action: () => { if (onCalcClose) onCalcClose(); navigate('/ca'); },
        },
        {
            id: 'add',
            title: 'Add',
            iconClass: 'icon-add',
            icon: <Plus size={20} strokeWidth={2.5} />,
            action: () => { if (onCalcClose) onCalcClose(); navigate('/books/dashboard'); },
        },
    ];

    const bottomIcons = [
        {
            id: 'edit',
            title: 'Stock',
            iconClass: 'icon-edit',
            icon: <Edit3 size={20} />,
            action: () => { if (onCalcClose) onCalcClose(); navigate('/books/stock'); },
        },
        {
            id: 'settings',
            title: 'Settings',
            iconClass: 'icon-filter',
            icon: <SlidersHorizontal size={20} />,
            action: () => setIsSettingsOpen(prev => !prev),
            active: isSettingsOpen,
        },
    ];

    return (
        <>
            {/* Full-height fixed toolbar on the right edge */}
            <aside
                className={`rightpanel${isVisible ? '' : ' rightpanel--hidden'}`}
                aria-label="Quick actions"
                aria-hidden={!isVisible}
                style={{ top: '116px', height: 'calc(100vh - 116px)' }}
            >
                {/* Top icons */}
                <div className="rightpanel-section">
                    {topIcons.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`rightpanel-btn${item.active ? ' rightpanel-btn--active' : ''}${item.mobileOnly ? ' md:hidden' : ''}`}
                            onClick={item.action}
                            title={item.title}
                            aria-label={item.title}
                        >
                            <span className={`rightpanel-icon ${item.iconClass}`}>
                                {item.icon}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="rightpanel-spacer" />
                <div className="rightpanel-divider" />
                <div style={{ height: 8 }} />

                {/* Bottom icons */}
                <div className="rightpanel-section">
                    {bottomIcons.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`rightpanel-btn${item.active ? ' rightpanel-btn--active' : ''}`}
                            onClick={item.action}
                            title={item.title}
                            aria-label={item.title}
                        >
                            <span className={`rightpanel-icon ${item.iconClass}`}>
                                {item.icon}
                            </span>
                        </button>
                    ))}
                </div>

                <div style={{ height: 8 }} />
            </aside>

            {/* Calculator panel — slides in to the left of the toolbar */}
            {isVisible && isCalcOpen && (
                <>
                    {/* Dark overlay: covers main content + left sidebar, NOT the header/toolbar */}
                    <div
                        className="calc-overlay"
                        onClick={onCalcClose}
                        aria-hidden="true"
                    />
                    <CalcPanel onClose={onCalcClose} />
                </>
            )}

            {/* Settings drawer */}
            <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};

export default RightSidebar;
