import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    Clock, 
    MoreHorizontal 
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { formatCurrency } from '../../lib/formatCurrency';

const FinancialCalendar = () => {
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['financial-calendar'],
        queryFn: async () => {
            const data = await financialPlanService.getCalendar();
            return data.map(e => ({
                id: e.id,
                date: new Date(e.date).getDate(),
                monthName: new Date(e.date).toLocaleString('default', { month: 'short' }),
                title: e.title,
                amount: parseFloat(e.amount),
                type: e.type,
                color: e.color || (e.type === 'Income' ? 'green' : e.type === 'Investment' ? 'blue' : 'red')
            }));
        }
    });

    const [currentMonth] = useState('February 2026');
    const days = Array.from({ length: 28 }, (_, i) => i + 1);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#1B6B3A', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="calendar-module">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Financial Calendar</h1>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.3rem' }}>Timeline of your financial activities</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="premium-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px' }}>
                        <button className="icon-btn" style={{ padding: '4px' }}><ChevronLeft size={18} /></button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>
                            <Calendar size={16} style={{ color: '#22C55E' }} />
                            <span>{currentMonth}</span>
                        </div>
                        <button className="icon-btn" style={{ padding: '4px' }}><ChevronRight size={18} /></button>
                    </div>
                    <button className="btn-premium primary">
                        <span>Sync Calendar</span>
                    </button>
                </div>
            </div>

            <div className="content-grid" style={{ gridTemplateColumns: '1fr 340px' }}>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="label-caps" style={{ fontSize: '10px', color: '#94A3B8' }}>{day}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
                        {[null, null, null].map((_, i) => <div key={`empty-${i}`}></div>)}
                        {days.map(day => {
                            const dayEvents = events.filter(e => e.date === day);
                            return (
                                <div key={day} style={{ 
                                    minHeight: '90px', borderRadius: '16px', padding: '0.6rem', border: '1px solid #F0FDF4', position: 'relative',
                                    background: dayEvents.length > 0 ? '#F8FAFC' : 'transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: dayEvents.length > 0 ? '#1E293B' : '#CBD5E1' }}>{day}</span>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {dayEvents.map(event => (
                                            <div key={event.id} style={{ 
                                                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                background: event.color === 'green' ? '#DCFCE7' : event.color === 'red' ? '#FEE2E2' : event.color === 'blue' ? '#DBEAFE' : '#F3E8FF',
                                                color: event.color === 'green' ? '#15803D' : event.color === 'red' ? '#B91C1C' : event.color === 'blue' ? '#1D4ED8' : '#7E22CE'
                                            }}>
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock size={20} style={{ color: '#22C55E' }} />
                        Upcoming Activities
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {events.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontWeight: 600 }}>No events scheduled.</p>
                        ) : events.map(event => (
                            <Motion.div 
                                key={event.id} 
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #F0FDF4', cursor: 'pointer' }}
                                whileHover={{ scale: 1.02, background: 'white', borderColor: '#22C55E' }}
                            >
                                <div style={{ 
                                    width: '44px', height: '44px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    background: 'white', border: '1px solid #F0FDF4', fontWeight: 900
                                }}>
                                    <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94A3B8' }}>{event.monthName || 'Feb'}</span>
                                    <span style={{ fontSize: '16px', color: '#1E293B', lineHeight: 1 }}>{event.date}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', margin: 0 }}>{event.title}</h4>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', margin: 0 }}>{event.type}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 900, color: event.type === 'Income' ? '#10B981' : '#1E293B' }}>
                                        {event.type === 'Income' ? '+' : '-'}{formatCurrency(event.amount)}
                                    </div>
                                    <button className="icon-btn" style={{ marginLeft: 'auto', marginTop: '4px' }}><MoreHorizontal size={14} /></button>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialCalendar;

