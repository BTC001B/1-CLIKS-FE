import React from 'react';
import {
    Users,
    ArrowLeftRight,
    Bell,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { peopleService } from '../services/peopleService';
import '../App.css';
import { formatCurrency } from '../lib/formatCurrency';
import { PageHeader } from '../components/common';

const FeatureCard = (props) => {
    const { title, icon: Icon, color, path, stats, loading } = props;
    const navigate = useNavigate();

    return (
        <div
            className="premium-card glass"
            onClick={() => navigate(path)}
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative'
            }}
        >
            {loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <div className="loader-small" />
                </div>
            )}
            
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${color}15`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>{title}</h3>
                </div>
                <button 
                    className="icon-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(path); }}
                >
                    <ArrowRight size={20} />
                </button>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.map((stat, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '10px',
                        borderBottom: index === stats.length - 1 ? 'none' : '1px solid #F0FDF4'
                    }}>
                        <span className="label-caps">{stat.label}</span>
                        <span style={{ color: '#0F172A', fontWeight: 800 }}>{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const People = () => {
    // Queries
    const { data: peopleRes, isLoading: loadingPeople } = useQuery({ 
        queryKey: ['people-summary'], 
        queryFn: () => peopleService.getPeople() 
    });
    
    const { data: transRes, isLoading: loadingTrans } = useQuery({ 
        queryKey: ['people-transactions-global'], 
        queryFn: () => peopleService.getAllTransactions() 
    });
    
    const { data: remindRes, isLoading: loadingRemind } = useQuery({ 
        queryKey: ['people-reminders-global'], 
        queryFn: () => peopleService.getAllReminders() 
    });
    
    const { data: recordsRes, isLoading: loadingRecords } = useQuery({ 
        queryKey: ['people-records-global'], 
        queryFn: () => peopleService.getAllRecords() 
    });

    const contactSummary = peopleRes?.meta?.summary || { total_contacts: 0, total_receivables: 0, total_payables: 0 };
    const reminderStats = remindRes?.meta?.stats || { upcoming: 0, overdue: 0, due_today: 0 };
    const recordStats = recordsRes?.meta?.stats || { total_records: 0 };
    const transactionMeta = transRes?.meta || { totalItems: 0 };

    const sections = [
        {
            title: "People & Network",
            icon: Users,
            color: "#1B6B3A",
            path: "/books/people/overview",
            loading: loadingPeople,
            stats: [
                { label: "Total Contacts", value: `${contactSummary.total_contacts} People` },
                { label: "Receivables", value: formatCurrency(contactSummary.total_receivables) },
                { label: "Payables", value: formatCurrency(contactSummary.total_payables) }
            ]
        },
        {
            title: "Friend Transactions",
            icon: ArrowLeftRight,
            color: "#9333EA",
            path: "/books/people/transactions",
            loading: loadingTrans,
            stats: [
                { label: "Total Volume", value: formatCurrency(Number(contactSummary.total_receivables) + Number(contactSummary.total_payables)) },
                { label: "Total Actions", value: `${transactionMeta.totalItems || 0} Records` },
                { label: "Last Sync", value: "Real-time" }
            ]
        },
        {
            title: "Payment Reminders",
            icon: Bell,
            color: "#F59E0B",
            path: "/books/people/reminders",
            loading: loadingRemind,
            stats: [
                { label: "Upcoming", value: `${reminderStats.upcoming} Due` },
                { label: "Overdue", value: `${reminderStats.overdue} Alert` },
                { label: "Due Today", value: `${reminderStats.due_today} Tasks` }
            ]
        },
        {
            title: "Documents & Records",
            icon: FileText,
            color: "#10B981",
            path: "/books/people/records",
            loading: loadingRecords,
            stats: [
                { label: "Total Files", value: `${recordStats.total_records} Docs` },
                { label: "Category", value: "Personal" },
                { label: "Cloud Sync", value: "Active" }
            ]
        }
    ];

    return (
        <div className="premium-container">
            <PageHeader 
                title={<>People & <span className="text-highlight">Network</span></>}
                subtitle="Manage your network, track shared expenses, and organize records."
                breadcrumb="PEOPLE"
            />

            <div style={{ marginTop: '3rem' }}>
                <div className="dashboard-grid">
                    {sections.map((section, index) => (
                        <FeatureCard
                            key={index}
                            title={section.title}
                            icon={section.icon}
                            color={section.color}
                            path={section.path}
                            stats={section.stats}
                            loading={section.loading}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default People;
