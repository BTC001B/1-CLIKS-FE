import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    CalendarDays,
    Calculator,
    Contact,
    StickyNote,
    CloudSun,
    X
} from 'lucide-react';
import { CalcPopover } from './common/CalcPopover';
import ContactPanel from './ContactPanel';
import NotesPanel from './NotesPanel';
import CalendarPanel from './CalendarPanel';
import WeatherPanel from './WeatherPanel';

/* ─── Inline Calculator Panel ─────────────────────────────────────── */
const CalcPanel = ({ onClose }) => {
    return (
        <div className="calc-panel">
            <CalcPopover autoOpen onPanelClose={onClose} />
        </div>
    );
};

/* ─── Right Sidebar ───────────────────────────────────────────────── */
const RightSidebar = ({
    isVisible = false,
    isCalcOpen = false,
    onCalcToggle,
    onCalcClose,
    onToolbarClose,
    isContactOpen = false,
    onContactToggle,
    onContactClose,
    isNotesOpen = false,
    onNotesToggle,
    onNotesClose,
    isCalendarOpen = false,
    onCalendarToggle,
    onCalendarClose,
    isWeatherOpen = false,
    onWeatherToggle,
    onWeatherClose
}) => {
    const navigate = useNavigate();

    // Close panels when toolbar is hidden
    useEffect(() => {
        if (!isVisible) {
            if (onCalcClose) onCalcClose();
            if (onContactClose) onContactClose();
            if (onNotesClose) onNotesClose();
            if (onCalendarClose) onCalendarClose();
            if (onWeatherClose) onWeatherClose();
        }
    }, [isVisible, onCalcClose, onContactClose, onNotesClose, onCalendarClose, onWeatherClose]);

    // Escape key closes calc or contact panel
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                if (isCalcOpen && onCalcClose) onCalcClose();
                if (isContactOpen && onContactClose) onContactClose();
                if (isNotesOpen && onNotesClose) onNotesClose();
                if (isCalendarOpen && onCalendarClose) onCalendarClose();
                if (isWeatherOpen && onWeatherClose) onWeatherClose();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isCalcOpen, onCalcClose, isContactOpen, onContactClose, isNotesOpen, onNotesClose, isCalendarOpen, onCalendarClose, isWeatherOpen, onWeatherClose]);

    const topIcons = [
        {
            id: 'close_toolbar',
            title: 'Close Toolbar',
            iconClass: 'icon-edit',
            icon: <X size={20} />,
            action: onToolbarClose,
            mobileOnly: true
        },
        {
            id: 'contact',
            title: 'Contacts',
            iconClass: 'icon-contact',
            icon: <Contact size={20} />,
            action: () => { if (onContactToggle) onContactToggle(); },
            active: isContactOpen,
        },
        {
            id: 'calendar',
            title: 'Calendar',
            iconClass: 'icon-calendar',
            icon: <CalendarDays size={20} />,
            action: () => { if (onCalendarToggle) onCalendarToggle(); },
            active: isCalendarOpen,
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
            id: 'notes',
            title: 'Notes',
            iconClass: 'icon-edit',
            icon: <StickyNote size={20} />,
            action: () => { if (onNotesToggle) onNotesToggle(); },
            active: isNotesOpen,
        },
        {
            id: 'weather',
            title: 'Weather',
            iconClass: 'icon-launcher',
            icon: <CloudSun size={20} />,
            action: () => { if (onWeatherToggle) onWeatherToggle(); },
            active: isWeatherOpen,
        },
    ];

    return (
        <>
            <aside
                className={`rightpanel${isVisible ? '' : ' rightpanel--hidden'}`}
                aria-label="Quick actions"
                aria-hidden={!isVisible}
            >
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
                
                <div className="rightpanel-spacer" />
                <div style={{ height: 8 }} />
            </aside>

            {/* Calculator panel */}
            {isVisible && isCalcOpen && (
                <>
                    <div
                        className="calc-overlay"
                        onClick={onCalcClose}
                        aria-hidden="true"
                    />
                    <CalcPanel onClose={onCalcClose} />
                </>
            )}

            {/* Contact Panel */}
            {isVisible && isContactOpen && (
                <>
                    <div
                        className="launcher-overlay"
                        onClick={onContactClose}
                        aria-hidden="true"
                    />
                    <div className="calc-panel contact-panel" style={{ width: '400px' }}>
                        <ContactPanel onClose={onContactClose} />
                    </div>
                </>
            )}

            {/* Notes Panel */}
            {isVisible && isNotesOpen && (
                <>
                    <div
                        className="launcher-overlay"
                        onClick={onNotesClose}
                        aria-hidden="true"
                    />
                    <div className="calc-panel" style={{ width: '400px' }}>
                        <NotesPanel onClose={onNotesClose} />
                    </div>
                </>
            )}

            {/* Calendar Panel */}
            {isVisible && isCalendarOpen && (
                <>
                    <div
                        className="launcher-overlay"
                        onClick={onCalendarClose}
                        aria-hidden="true"
                    />
                    <div className="calc-panel" style={{ width: '400px' }}>
                        <CalendarPanel onClose={onCalendarClose} />
                    </div>
                </>
            )}

            {/* Weather Panel */}
            {isVisible && isWeatherOpen && (
                <>
                    <div
                        className="launcher-overlay"
                        onClick={onWeatherClose}
                        aria-hidden="true"
                    />
                    <div className="calc-panel" style={{ width: '400px' }}>
                        <WeatherPanel onClose={onWeatherClose} />
                    </div>
                </>
            )}
        </>
    );
};

export default RightSidebar;

