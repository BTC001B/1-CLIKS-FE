import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuditPanel from '../components/AuditPanel';
import ReferralModal from '../components/ReferralModal';
import RightSidebar from '../components/RightSidebar';
import '../App.css';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isToolbarOpen, setIsToolbarOpen] = useState(false); // hidden by default

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const toggleAudit  = () => setIsAuditOpen(prev => !prev);
    const toggleToolbar = () => setIsToolbarOpen(prev => !prev);

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar
                onToggleSidebar={toggleSidebar}
                onToggleAudit={toggleAudit}
                onToggleToolbar={toggleToolbar}
                isToolbarOpen={isToolbarOpen}
            />
            <div className="app-body">
                <Sidebar isOpen={isSidebarOpen} onReferralClick={() => setIsReferralOpen(true)} />
                <div className="main-content-area">
                    <div className="content-scrollable">
                        {children}
                    </div>
                </div>
                <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
            </div>

            {/* Right floating toolbar — only visible when toggled on */}
            <RightSidebar isVisible={isToolbarOpen} />

            <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
        </div>
    );
};

export default MainLayout;
