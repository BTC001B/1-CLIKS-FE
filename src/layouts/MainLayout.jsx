import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AuditPanel from '../components/AuditPanel';
import ReferralModal from '../components/ReferralModal';
import '../App.css';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isReferralOpen, setIsReferralOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleAudit = () => {
        setIsAuditOpen(!isAuditOpen);
    };

    return (
        <div className={`app-root select-none ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Topbar onToggleSidebar={toggleSidebar} onToggleAudit={toggleAudit} />
            <div className="app-body">
                <Sidebar isOpen={isSidebarOpen} onReferralClick={() => setIsReferralOpen(true)} />
                <div className="main-content-area">
                    <div className="content-scrollable">
                        {children}
                    </div>
                </div>
                {/* Audit Side Panel */}
                <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
            </div>

            {/* Referral Modal */}
            <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
        </div>
    );
};

export default MainLayout;
