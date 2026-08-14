import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuditPanel from '../components/AuditPanel';
import ReferralModal from '../components/ReferralModal';
import RightSidebar from '../components/RightSidebar';
import '../App.css';

// Width constants — must match App.css
const TOOLBAR_W = 72;   // .rightpanel width
const CALC_W    = 400;  // .calc-panel width

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuditOpen,   setIsAuditOpen]   = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isToolbarOpen, setIsToolbarOpen] = useState(false);
    const [isCalcOpen,    setIsCalcOpen]    = useState(false); // lifted here
    const [isLauncherOpen, setIsLauncherOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const toggleSidebar  = () => setIsSidebarOpen(prev => !prev);
    const toggleAudit    = () => setIsAuditOpen(prev => !prev);
    const toggleToolbar  = () => setIsToolbarOpen(prev => !prev);

    // Right margin grows as panels open, making every page shrink automatically
    const rightOffset =
        (isToolbarOpen ? TOOLBAR_W : 0) +
        (isToolbarOpen && (isCalcOpen || isLauncherOpen || isContactOpen || isNotesOpen || isCalendarOpen) ? CALC_W : 0);

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar
                onToggleSidebar={toggleSidebar}
                onToggleAudit={toggleAudit}
                onToggleToolbar={toggleToolbar}
                isToolbarOpen={isToolbarOpen}
                onOpenCalculator={() => {
                    // Open the toolbar if closed, then open calc
                    if (!isToolbarOpen) setIsToolbarOpen(true);
                    setIsCalcOpen(true);
                }}
            />
            <div className="app-body">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onReferralClick={() => setIsReferralOpen(true)} 
                    onLogoClick={() => {
                        if (!isToolbarOpen) setIsToolbarOpen(true);
                        setIsLauncherOpen(prev => !prev);
                        setIsCalcOpen(false);
                        setIsContactOpen(false);
                        setIsNotesOpen(false);
                        setIsCalendarOpen(false);
                    }}
                    onItemClick={() => {
                        if (window.innerWidth <= 768) {
                            setIsSidebarOpen(false);
                        }
                    }}
                />
                {isSidebarOpen && (
                    <div 
                        className="sidebar-backdrop" 
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ── Every page renders here — margin-right shrinks automatically ── */}
                <div
                    className="main-content-area"
                    style={{
                        marginRight: rightOffset,
                        transition: 'margin-right 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <div className="content-scrollable">
                        {children}
                    </div>
                </div>

                <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
            </div>

            {/* Right toolbar + calculator — toolbar visibility + calc state managed here */}
            <RightSidebar
                isVisible={isToolbarOpen}
                isCalcOpen={isCalcOpen}
                onCalcToggle={() => {
                    setIsCalcOpen(prev => !prev);
                    setIsLauncherOpen(false);
                }}
                onCalcClose={() => setIsCalcOpen(false)}
                onToolbarClose={() => {
                    setIsToolbarOpen(false);
                    setIsCalcOpen(false);
                    setIsLauncherOpen(false);
                    setIsContactOpen(false);
                    setIsNotesOpen(false);
                    setIsCalendarOpen(false);
                }}
                onLauncherToggle={() => {
                    setIsLauncherOpen(prev => !prev);
                    setIsCalcOpen(false);
                    setIsContactOpen(false);
                    setIsNotesOpen(false);
                    setIsCalendarOpen(false);
                }}
                isLauncherOpen={isLauncherOpen}
                onLauncherClose={() => setIsLauncherOpen(false)}
                isContactOpen={isContactOpen}
                onContactToggle={() => {
                    setIsContactOpen(prev => !prev);
                    setIsCalcOpen(false);
                    setIsLauncherOpen(false);
                    setIsNotesOpen(false);
                    setIsCalendarOpen(false);
                }}
                onContactClose={() => setIsContactOpen(false)}
                isNotesOpen={isNotesOpen}
                onNotesToggle={() => {
                    setIsNotesOpen(prev => !prev);
                    setIsCalcOpen(false);
                    setIsLauncherOpen(false);
                    setIsContactOpen(false);
                    setIsCalendarOpen(false);
                }}
                onNotesClose={() => setIsNotesOpen(false)}
                isCalendarOpen={isCalendarOpen}
                onCalendarToggle={() => {
                    setIsCalendarOpen(prev => !prev);
                    setIsCalcOpen(false);
                    setIsLauncherOpen(false);
                    setIsContactOpen(false);
                    setIsNotesOpen(false);
                }}
                onCalendarClose={() => setIsCalendarOpen(false)}
            />

            <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
        </div>
    );
};

export default MainLayout;
