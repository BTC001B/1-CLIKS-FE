import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Calendar as CalendarIcon, Clock, StickyNote, Bell, ChevronLeft, ChevronRight, Loader2, CalendarDays } from 'lucide-react';

const CalendarPanel = ({ onClose }) => {
    const queryClient = useQueryClient();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [activeTab, setActiveTab] = useState('event'); // 'event', 'note', 'reminder'
    const [formData, setFormData] = useState({
        title: '',
        description: '', // Event, Reminder
        content: '',     // Note
        startTime: '',   // Event
        endTime: '',     // Event
        time: '',        // Reminder
        notificationEmail: '' // Reminder
    });

    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const baseUrl = import.meta.env.VITE_CALENDAR_API_BASE_URL || 'https://api.bit-tool.com/api/calendar';

    const { data: rawData = null, isLoading, isError } = useQuery({
        queryKey: ['calendar-data', currentMonth.toISOString()],
        queryFn: async () => {
            const token = localStorage.getItem('bnx_auth_token');
            const res = await fetch(`${baseUrl}/search?startDate=${startDate}&endDate=${endDate}&allApps=true`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error('Failed to fetch calendar data');
            const result = await res.json();
            return result.data || { events: [], notes: [], reminders: [] };
        }
    });

    const createMutation = useMutation({
        mutationFn: async ({ type, payload }) => {
            const token = localStorage.getItem('bnx_auth_token');
            let endpoint = '';
            if (type === 'event') endpoint = '/events';
            else if (type === 'note') endpoint = '/notes';
            else if (type === 'reminder') endpoint = '/reminders';

            const res = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`Failed to create ${type}`);
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-data'] });
            setIsFormOpen(false);
            setFormData({ title: '', description: '', content: '', startTime: '', endTime: '', time: '', notificationEmail: '' });
        }
    });

    const handleSave = (e) => {
        e.preventDefault();
        let payload = {};
        const baseDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        
        if (activeTab === 'event') {
            payload = {
                title: formData.title,
                description: formData.description,
                startTime: new Date(`${baseDateStr}T${formData.startTime}:00`).toISOString(),
                endTime: new Date(`${baseDateStr}T${formData.endTime}:00`).toISOString()
            };
        } else if (activeTab === 'note') {
            payload = {
                title: formData.title,
                content: formData.content,
                date: new Date(`${baseDateStr}T00:00:00`).toISOString()
            };
        } else if (activeTab === 'reminder') {
            payload = {
                title: formData.title,
                description: formData.description,
                time: formData.time,
                date: new Date(`${baseDateStr}T${formData.time}:00`).toISOString(),
            };
            if (formData.notificationEmail) payload.notificationEmail = formData.notificationEmail;
        }

        createMutation.mutate({ type: activeTab, payload });
    };

    // Calendar Grid Logic
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    // Mapping items to days
    const itemsByDay = useMemo(() => {
        if (!rawData) return {};
        const map = {};
        const add = (dateStr, item, type) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!map[key]) map[key] = [];
            map[key].push({ ...item, _type: type });
        };
        (rawData.events || []).forEach(e => add(e.startTime, e, 'event'));
        (rawData.notes || []).forEach(n => add(n.date, n, 'note'));
        (rawData.reminders || []).forEach(r => add(r.date, r, 'reminder'));
        return map;
    }, [rawData]);

    const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const selectedItems = itemsByDay[selectedKey] || [];

    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const formatTime = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="calendar-panel-container">
            <style>{`
                .calendar-panel-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background-color: #f8fafc;
                    position: relative;
                    width: 400px;
                    box-shadow: -10px 0 25px rgba(0,0,0,0.1);
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .cal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background-color: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    z-index: 10;
                }
                .cal-header-left { display: flex; align-items: center; gap: 12px; }
                .cal-icon-wrapper {
                    padding: 8px;
                    background-color: #e0e7ff;
                    color: #4f46e5;
                    border-radius: 8px;
                    display: flex;
                }
                .cal-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; line-height: 1.2; }
                .cal-subtitle { font-size: 12px; color: #64748b; margin: 0; }
                .cal-header-right { display: flex; align-items: center; gap: 8px; }
                .cal-btn-new { padding: 8px; background-color: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .cal-btn-new:hover { background-color: #4338ca; }
                .cal-btn-close { padding: 8px; background: transparent; color: #64748b; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .cal-btn-close:hover { background-color: #f1f5f9; }
                
                .cal-content { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 20px; }
                
                /* Month Navigator */
                .cal-month-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 4px; margin-bottom: 8px; }
                .cal-month-title { font-size: 16px; font-weight: 700; color: #1e293b; }
                .cal-month-btn { padding: 6px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #475569; display: flex; }
                .cal-month-btn:hover { background: #f1f5f9; }
                
                /* Grid */
                .cal-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
                .cal-day-cell {
                    aspect-ratio: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #334155;
                    cursor: pointer;
                    background: white;
                    border: 1px solid #f1f5f9;
                    position: relative;
                    transition: all 0.2s;
                }
                .cal-day-cell:hover:not(.empty) { background: #f8fafc; border-color: #e2e8f0; }
                .cal-day-cell.empty { background: transparent; border: none; cursor: default; }
                .cal-day-cell.selected { background: #4f46e5; color: white; border-color: #4f46e5; }
                .cal-day-cell.today:not(.selected) { color: #4f46e5; font-weight: 700; background: #e0e7ff; border-color: #c7d2fe; }
                
                .cal-dots { display: flex; gap: 2px; position: absolute; bottom: 4px; }
                .cal-dot { width: 4px; height: 4px; border-radius: 50%; }
                .cal-dot.event { background: #ef4444; }
                .cal-dot.note { background: #eab308; }
                .cal-dot.reminder { background: #3b82f6; }
                .cal-day-cell.selected .cal-dot { background: white !important; opacity: 0.8; }

                /* Schedule List */
                .cal-schedule { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
                .cal-schedule-header { font-size: 14px; font-weight: 700; color: #1e293b; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
                .cal-item { display: flex; gap: 12px; padding: 12px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
                .cal-item-icon { padding: 10px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .cal-item-icon.event { background: #fee2e2; color: #ef4444; }
                .cal-item-icon.note { background: #fef9c3; color: #eab308; }
                .cal-item-icon.reminder { background: #dbeafe; color: #3b82f6; }
                .cal-item-content { flex: 1; min-width: 0; }
                .cal-item-title { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .cal-item-desc { font-size: 12px; color: #64748b; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .cal-item-time { font-size: 11px; font-weight: 600; color: #94a3b8; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
                
                .cal-empty-state { text-align: center; padding: 32px 16px; color: #94a3b8; }

                /* Form Modal */
                .cal-modal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; flex-direction: column; background: white; }
                .cal-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e2e8f0; }
                .cal-tabs { display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
                .cal-tab { flex: 1; padding: 12px 0; font-size: 13px; font-weight: 600; color: #64748b; background: transparent; border: none; cursor: pointer; border-bottom: 2px solid transparent; }
                .cal-tab.active { color: #4f46e5; border-bottom-color: #4f46e5; background: white; }
                .cal-form { padding: 16px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
                .cal-input-group { display: flex; flex-direction: column; gap: 6px; }
                .cal-label { font-size: 12px; font-weight: 600; color: #475569; }
                .cal-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: 0.2s; font-family: inherit; }
                .cal-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .cal-textarea { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; resize: vertical; min-height: 80px; font-family: inherit; }
                .cal-textarea:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .cal-time-row { display: flex; gap: 12px; }
                .cal-submit { margin-top: auto; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; }
                .cal-submit:disabled { opacity: 0.7; }
                .cal-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>

            <div className="cal-header">
                <div className="cal-header-left">
                    <div className="cal-icon-wrapper"><CalendarIcon size={20} /></div>
                    <div>
                        <h2 className="cal-title">Global Calendar</h2>
                        <p className="cal-subtitle">Events, Notes & Reminders</p>
                    </div>
                </div>
                <div className="cal-header-right">
                    <button onClick={() => setIsFormOpen(true)} className="cal-btn-new"><Plus size={18} /></button>
                    <button onClick={onClose} className="cal-btn-close"><X size={18} /></button>
                </div>
            </div>

            <div className="cal-content">
                <div className="cal-month-nav">
                    <h3 className="cal-month-title">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handlePrevMonth} className="cal-month-btn"><ChevronLeft size={16} /></button>
                        <button onClick={handleNextMonth} className="cal-month-btn"><ChevronRight size={16} /></button>
                    </div>
                </div>

                <div>
                    <div className="cal-grid-header">
                        <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                    </div>
                    {isLoading ? (
                        <div className="cal-empty-state"><Loader2 className="cal-spin" size={24} style={{ margin: '0 auto 8px' }}/>Loading calendar...</div>
                    ) : (
                        <div className="cal-grid">
                            {days.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} className="cal-day-cell empty" />;
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const isSelected = isSameDay(date, selectedDate);
                                const isToday = isSameDay(date, today);
                                const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                                const items = itemsByDay[dayKey] || [];
                                
                                const hasEvents = items.some(it => it._type === 'event');
                                const hasNotes = items.some(it => it._type === 'note');
                                const hasReminders = items.some(it => it._type === 'reminder');

                                return (
                                    <div 
                                        key={day} 
                                        className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        {day}
                                        <div className="cal-dots">
                                            {hasEvents && <div className="cal-dot event" />}
                                            {hasNotes && <div className="cal-dot note" />}
                                            {hasReminders && <div className="cal-dot reminder" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="cal-schedule">
                    <div className="cal-schedule-header">
                        Schedule for {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    
                    {selectedItems.length === 0 ? (
                        <div className="cal-empty-state">
                            <CalendarDays size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ margin: 0 }}>No items scheduled for this day.</p>
                        </div>
                    ) : (
                        selectedItems.map((item, i) => (
                            <div key={i} className="cal-item">
                                <div className={`cal-item-icon ${item._type}`}>
                                    {item._type === 'event' && <CalendarIcon size={18} />}
                                    {item._type === 'note' && <StickyNote size={18} />}
                                    {item._type === 'reminder' && <Bell size={18} />}
                                </div>
                                <div className="cal-item-content">
                                    <h4 className="cal-item-title">{item.title}</h4>
                                    {item.description && <p className="cal-item-desc">{item.description}</p>}
                                    {item.content && <p className="cal-item-desc">{item.content}</p>}
                                    <div className="cal-item-time">
                                        <Clock size={12} />
                                        {item._type === 'event' ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}` : ''}
                                        {item._type === 'reminder' ? item.time : ''}
                                        {item._type === 'note' ? 'All day' : ''}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isFormOpen && (
                <div className="cal-modal-overlay">
                    <div className="cal-modal-header">
                        <h3 className="cal-title" style={{ fontSize: 16 }}>New Item</h3>
                        <button onClick={() => setIsFormOpen(false)} className="cal-btn-close" style={{ padding: 4 }}><X size={18} /></button>
                    </div>
                    <div className="cal-tabs">
                        <button className={`cal-tab ${activeTab === 'event' ? 'active' : ''}`} onClick={() => setActiveTab('event')}>Event</button>
                        <button className={`cal-tab ${activeTab === 'note' ? 'active' : ''}`} onClick={() => setActiveTab('note')}>Note</button>
                        <button className={`cal-tab ${activeTab === 'reminder' ? 'active' : ''}`} onClick={() => setActiveTab('reminder')}>Reminder</button>
                    </div>
                    <form onSubmit={handleSave} className="cal-form">
                        <div className="cal-input-group">
                            <label className="cal-label">Title</label>
                            <input required type="text" className="cal-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g. Team Meeting" />
                        </div>
                        
                        {(activeTab === 'event' || activeTab === 'reminder') && (
                            <div className="cal-input-group">
                                <label className="cal-label">Description (Optional)</label>
                                <textarea className="cal-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Add details..." />
                            </div>
                        )}

                        {activeTab === 'note' && (
                            <div className="cal-input-group">
                                <label className="cal-label">Note Content</label>
                                <textarea required className="cal-textarea" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write your note..." />
                            </div>
                        )}

                        {activeTab === 'event' && (
                            <div className="cal-time-row">
                                <div className="cal-input-group" style={{ flex: 1 }}>
                                    <label className="cal-label">Start Time</label>
                                    <input required type="time" className="cal-input" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                                </div>
                                <div className="cal-input-group" style={{ flex: 1 }}>
                                    <label className="cal-label">End Time</label>
                                    <input required type="time" className="cal-input" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'reminder' && (
                            <>
                                <div className="cal-input-group">
                                    <label className="cal-label">Time</label>
                                    <input required type="time" className="cal-input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                                </div>
                                <div className="cal-input-group">
                                    <label className="cal-label">Notification Email (Optional)</label>
                                    <input type="email" className="cal-input" value={formData.notificationEmail} onChange={e => setFormData({...formData, notificationEmail: e.target.value})} placeholder="user@example.com" />
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={createMutation.isPending} className="cal-submit">
                            {createMutation.isPending ? <Loader2 size={16} className="cal-spin" /> : 'Save Item'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CalendarPanel;
