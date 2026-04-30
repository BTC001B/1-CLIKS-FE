import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { 
    Plus, 
    Bell, 
    Calendar, 
    Clock, 
    FileText, 
    CheckCircle2 
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const DEFAULT_PLAN_ID = 1;

const PlanReminders = () => {
    const { data: reminders = [], isLoading } = useQuery({
        queryKey: ['plan-reminders', DEFAULT_PLAN_ID],
        queryFn: async () => {
            const data = await financialPlanService.getPlanReminders(DEFAULT_PLAN_ID);
            return data.map(item => ({
                id: item.id,
                title: item.title,
                date: item.date,
                time: item.time,
                priority: item.priority || 'Medium',
                type: item.type || 'General',
                status: item.status || 'Pending'
            }));
        }
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#EA580C', borderRadius: '50%' }} />
            </div>
        );
    }

    const upcomingCount = reminders.filter(r => r.status !== 'Completed').length;
    const completedCount = reminders.filter(r => r.status === 'Completed').length;

    return (
        <div className="reminders-module">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Plan Reminders</h1>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.3rem' }}>Never miss a payment or review</p>
                </div>
                <button className="btn-premium primary">
                    <Plus size={18} />
                    <span>Set Reminder</span>
                </button>
            </div>

            <div className="content-grid" style={{ gridTemplateColumns: '260px 1fr' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="premium-card" style={{ padding: '1.25rem' }}>
                        <h3 className="label-caps" style={{ marginBottom: '1rem' }}>Filters</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', borderRadius: '12px', background: '#F0FDF4', color: '#1D4ED8', border: 'none', fontWeight: 700, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>All Reminders</span>
                                <span style={{ background: '#DBEAFE', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{reminders.length}</span>
                            </button>
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', borderRadius: '12px', background: 'transparent', color: '#64748B', border: 'none', fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span>Upcoming</span>
                                <span style={{ background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{upcomingCount}</span>
                            </button>
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', borderRadius: '12px', background: 'transparent', color: '#64748B', border: 'none', fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span>Completed</span>
                                <span style={{ background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{completedCount}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reminders.length === 0 ? (
                        <div className="premium-card" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed', color: '#94A3B8', fontWeight: 700 }}>
                            No reminders found for this plan.
                        </div>
                    ) : reminders.map((reminder) => (
                        <Motion.div 
                            key={reminder.id} 
                            className="premium-card" 
                            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', opacity: reminder.status === 'Completed' ? 0.6 : 1 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div style={{ 
                                width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                background: reminder.priority === 'Critical' ? '#FEF2F2' : reminder.priority === 'High' ? '#FFF7ED' : reminder.priority === 'Medium' ? '#F0FDF4' : '#F0FDF4',
                                color: reminder.priority === 'Critical' ? '#EF4444' : reminder.priority === 'High' ? '#F97316' : reminder.priority === 'Medium' ? '#22C55E' : '#10B981'
                            }}>
                                <Bell size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B', margin: 0, textDecoration: reminder.status === 'Completed' ? 'line-through' : 'none' }}>{reminder.title}</h4>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                                        <Calendar size={14} />
                                        <span>{reminder.date}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                                        <Clock size={14} />
                                        <span>{reminder.time}</span>
                                    </div>
                                    <span style={{ padding: '2px 8px', background: '#F8FAFC', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{reminder.type}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="icon-btn" title="Edit"><FileText size={18} /></button>
                                <button className="icon-btn" title="Mark Done" style={{ color: '#10B981' }}><CheckCircle2 size={18} /></button>
                            </div>
                            <div style={{ 
                                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase',
                                background: reminder.status === 'Completed' ? '#F0FDF4' : reminder.priority === 'Critical' ? '#FEF2F2' : '#F8FAFC',
                                color: reminder.status === 'Completed' ? '#10B981' : reminder.priority === 'Critical' ? '#EF4444' : '#64748B',
                                border: '1px solid currentColor'
                            }}>
                                {reminder.status === 'Completed' ? 'Done' : reminder.priority}
                            </div>
                        </Motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlanReminders;
