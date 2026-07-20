import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, MapPin, Calendar, DollarSign, Plus, Search, Trash2, ArrowLeft, Edit2, 
  Map, Camera, Heart, Clock, FileText, ChevronRight, Check, X, Plane, Sparkles,
  Award, Briefcase, Smile, Tent, Trees, Sunset, Bike, GraduationCap, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { financePlusService } from '../../services';

// Categories list
const CATEGORIES = [
  { id: 'Trips', label: 'Trips', icon: '✈️', desc: 'Track expenses, locations, photos and memories during your travels.', color: '#4F46E5' },
  { id: 'God Worship', label: 'God Worship / Pilgrimage', icon: '🛕', desc: 'Manage darshan times, offerings, donations, food, and stays.', color: '#D97706' },
  { id: 'Work', label: 'Work / Business Travel', icon: '💼', desc: 'Log meetings, hotels, taxi rides, meals, and generate expense reports.', color: '#1E40AF' },
  { id: 'Events', label: 'Events', icon: '🎉', desc: 'Budget ticket costs, food, shopping, guest lists, and event photo books.', color: '#DB2777' },
  { id: 'Family Outing', label: 'Family Outing', icon: '👨‍👩‍👧', desc: 'Coordinate day-out costs, family restaurants, park tickets, and fun memories.', color: '#059669' },
  { id: 'Road Trip', label: 'Road Trip', icon: '🚗', desc: 'Map out scenic fuel stops, toll fees, vehicle logs, and pitstop photos.', color: '#0284C7' },
  { id: 'Honeymoon', label: 'Honeymoon', icon: '❤️', desc: 'Cherish romantic dinner plans, resorts, flight costs, and memory journals.', color: '#E11D48' },
  { id: 'Camping', label: 'Camping', icon: '🏕️', desc: 'Check off gear checklists, trail stops, campfire photos, and outdoor blogs.', color: '#15803D' },
  { id: 'Adventure', label: 'Adventure', icon: '🏞️', desc: 'Trek routes, high-adrenaline sports logs, gear hire, and action snaps.', color: '#8B5CF6' },
  { id: 'Vacation', label: 'Vacation', icon: '🏖️', desc: 'Organize vacation hotel check-ins, local shopping, and relaxing beach days.', color: '#0D9488' },
  { id: 'Bike Ride', label: 'Bike Ride', icon: '🚴', desc: 'Track fuel, snacks, coordinates, stops, and road trip milestones.', color: '#4F46E5' },
  { id: 'College Tour', label: 'College Tour', icon: '🎓', desc: 'Log campus maps, travel tickets, hostels, group food bills, and photos.', color: '#7C3AED' },
  { id: 'Photography Tour', label: 'Photography Tour', icon: '📸', desc: 'Jot down sunrise shooting times, gear logs, portfolios, and scenic places.', color: '#059669' },
];

const MoneyTracker = () => {
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Navigation states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTracker, setActiveTracker] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  // Form states for creation
  const [creationData, setCreationData] = useState({
    name: '',
    place: '',
    date: '',
    budget: '',
    details: {}
  });

  // Log item form states
  const [expenseForm, setExpenseForm] = useState({ name: '', category: '', amount: '', date: '' });
  const [locationForm, setLocationForm] = useState({ name: '', notes: '' });
  const [timelineForm, setTimelineForm] = useState({ time: '', description: '' });
  const [photoForm, setPhotoForm] = useState({ url: '', caption: '' });
  const [memoryForm, setMemoryForm] = useState({ title: '', note: '' });

  // Custom Category State
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customFields, setCustomFields] = useState([{ key: '', value: '' }]);

  // Fetch trackers on load
  const loadTrackers = async () => {
    try {
      setLoading(true);
      const res = await financePlusService.getMoneyTrackers();
      setTrackers(res.data || []);
    } catch (err) {
      console.error('Error loading money trackers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackers();
  }, []);

  // Pre-seed demo trackers if the database is completely empty
  const handleSeedDemos = async () => {
    const demos = [
      {
        category: 'Trips',
        name: 'Goa Trip',
        place: 'Goa, India',
        date: '2026-11-12',
        budget: 45000,
        details: { hotel: 'Goa Beach Resort', flight: 'IndiGo 204' },
        expenses: [
          { name: 'Flight tickets', category: 'Travel', amount: 15000, date: '2026-11-12' },
          { name: 'Hotel booking', category: 'Stay', amount: 18000, date: '2026-11-12' },
          { name: 'Dinner at Shack', category: 'Food', amount: 3500, date: '2026-11-13' }
        ],
        locations: [
          { name: 'Baga Beach', notes: 'Sunset views and shacks' },
          { name: 'Aguada Fort', notes: 'Historical lighthouse' }
        ],
        timeline: [
          { time: '10:00 AM', description: 'Boarded flight from Mumbai' },
          { time: '02:00 PM', description: 'Checked into resort' }
        ],
        memories: [
          { title: 'Sunset at shacks', note: 'Beautiful calm sunset with nice music.', date: '2026-11-12' }
        ]
      },
      {
        category: 'God Worship',
        name: 'Tirupati Temple',
        place: 'Tirupati, AP',
        date: '2026-09-05',
        budget: 15000,
        details: { temple_name: 'Venkateswara Swamy', darshan_time: '08:00 AM', offerings: 'Laddus & Hair tonsure' },
        expenses: [
          { name: 'Special Entry Darshan ticket', category: 'Tickets', amount: 1200, date: '2026-09-05' },
          { name: 'Accommodation', category: 'Accommodation', amount: 5000, date: '2026-09-04' },
          { name: 'Laddu Prasad purchase', category: 'Offerings', amount: 800, date: '2026-09-05' }
        ],
        locations: [
          { name: 'Alipiri Footpath', notes: 'Start point of walkway' },
          { name: 'Tirumala Shrine', notes: 'Main deity location' }
        ],
        timeline: [
          { time: '07:30 AM', description: 'Stood in the Special Entry queue' },
          { time: '09:45 AM', description: 'Amazing darshan of Venkateswara Swamy' }
        ],
        memories: [
          { title: 'Divine vibes', note: 'Felt an immense peace standing inside the sanctum.', date: '2026-09-05' }
        ]
      },
      {
        category: 'Work',
        name: 'Bangalore Office Visit',
        place: 'Bangalore, India',
        date: '2026-08-10',
        budget: 20000,
        details: { company_name: 'TechCorp Solutions', client: 'RetailGroup Corp', hotel: 'Silicon Valley Suites' },
        expenses: [
          { name: 'Cab to Airport', category: 'Taxi', amount: 1500, date: '2026-08-10' },
          { name: 'Hotel stay 2 nights', category: 'Hotel', amount: 9000, date: '2026-08-10' },
          { name: 'Team lunch billing', category: 'Food', amount: 4800, date: '2026-08-11' }
        ],
        locations: [
          { name: 'Bangalore Airport', notes: 'Arrival' },
          { name: 'TechCorp HQ Office', notes: 'Main conference hall' }
        ],
        timeline: [
          { time: '09:00 AM', description: 'Kickoff meeting with RetailGroup stakeholders' },
          { time: '01:00 PM', description: 'Business working lunch' }
        ],
        memories: [
          { title: 'Deal closed', note: 'Clients loved the new dashboard demo, contract extension is likely.', date: '2026-08-11' }
        ]
      }
    ];

    try {
      setLoading(true);
      for (const d of demos) {
        await financePlusService.createMoneyTracker(d);
      }
      await loadTrackers();
    } catch (err) {
      console.error('Error seeding demos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create custom field inputs handler
  const handleCustomFieldChange = (index, keyOrValue, val) => {
    const updated = [...customFields];
    updated[index][keyOrValue] = val;
    setCustomFields(updated);
  };

  const addCustomFieldInput = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  // Submit new tracker creation
  const handleCreateTracker = async (e) => {
    e.preventDefault();
    if (!creationData.name) return;

    let finalCategory = selectedCategory;
    let finalDetails = { ...creationData.details };

    if (selectedCategory === 'Custom') {
      finalCategory = customCategoryName || 'Custom';
      customFields.forEach(f => {
        if (f.key) finalDetails[f.key] = f.value;
      });
    }

    const payload = {
      category: finalCategory,
      name: creationData.name,
      place: creationData.place,
      date: creationData.date,
      budget: parseFloat(creationData.budget) || 0,
      details: finalDetails,
      expenses: [],
      locations: [],
      photos: [],
      timeline: [],
      memories: []
    };

    try {
      const res = await financePlusService.createMoneyTracker(payload);
      setTrackers([res.data, ...trackers]);
      setActiveTracker(res.data);
      setSelectedCategory(null);
      // Reset form
      setCreationData({ name: '', place: '', date: '', budget: '', details: {} });
      setCustomCategoryName('');
      setCustomFields([{ key: '', value: '' }]);
    } catch (err) {
      console.error('Error creating tracker:', err);
    }
  };

  // Delete a tracker
  const handleDeleteTracker = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this money tracker? All log data will be permanently removed.')) return;
    try {
      await financePlusService.deleteMoneyTracker(id);
      setTrackers(trackers.filter(t => t.id !== id));
      if (activeTracker?.id === id) {
        setActiveTracker(null);
      }
    } catch (err) {
      console.error('Error deleting tracker:', err);
    }
  };

  // Dynamic values calculation for selected active tracker
  const trackerStats = useMemo(() => {
    if (!activeTracker) return { totalExpenses: 0, remainingBudget: 0, percentUsed: 0 };
    const expenses = activeTracker.expenses || [];
    const totalExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const budget = parseFloat(activeTracker.budget) || 0;
    const remainingBudget = Math.max(0, budget - totalExpenses);
    const percentUsed = budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;
    return { totalExpenses, remainingBudget, percentUsed };
  }, [activeTracker]);

  // Log item form states
  const addLogItem = async (type, payload) => {
    if (!activeTracker) return;
    const updatedTracker = { ...activeTracker };
    
    if (type === 'expenses') {
      updatedTracker.expenses = [...(updatedTracker.expenses || []), payload];
    } else if (type === 'locations') {
      updatedTracker.locations = [...(updatedTracker.locations || []), payload];
    } else if (type === 'timeline') {
      updatedTracker.timeline = [...(updatedTracker.timeline || []), payload];
    } else if (type === 'photos') {
      updatedTracker.photos = [...(updatedTracker.photos || []), payload];
    } else if (type === 'memories') {
      updatedTracker.memories = [...(updatedTracker.memories || []), { ...payload, date: new Date().toLocaleDateString() }];
    }

    try {
      const res = await financePlusService.updateMoneyTracker(activeTracker.id, updatedTracker);
      setActiveTracker(res.data);
      // Synchronize in list
      setTrackers(trackers.map(t => t.id === activeTracker.id ? res.data : t));
    } catch (err) {
      console.error(`Error logging ${type}:`, err);
    }
  };

  // Delete sub-item
  const deleteLogItem = async (type, index) => {
    if (!activeTracker) return;
    const updatedTracker = { ...activeTracker };
    
    if (type === 'expenses') {
      updatedTracker.expenses = updatedTracker.expenses.filter((_, i) => i !== index);
    } else if (type === 'locations') {
      updatedTracker.locations = updatedTracker.locations.filter((_, i) => i !== index);
    } else if (type === 'timeline') {
      updatedTracker.timeline = updatedTracker.timeline.filter((_, i) => i !== index);
    } else if (type === 'photos') {
      updatedTracker.photos = updatedTracker.photos.filter((_, i) => i !== index);
    } else if (type === 'memories') {
      updatedTracker.memories = updatedTracker.memories.filter((_, i) => i !== index);
    }

    try {
      const res = await financePlusService.updateMoneyTracker(activeTracker.id, updatedTracker);
      setActiveTracker(res.data);
      setTrackers(trackers.map(t => t.id === activeTracker.id ? res.data : t));
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
    }
  };

  // Filter trackers on search input
  const filteredTrackers = useMemo(() => {
    if (!searchTerm) return trackers;
    const term = searchTerm.toLowerCase();
    return trackers.filter(t => 
      (t.name || '').toLowerCase().includes(term) ||
      (t.category || '').toLowerCase().includes(term) ||
      (t.place || '').toLowerCase().includes(term) ||
      (t.date || '').toLowerCase().includes(term)
    );
  }, [trackers, searchTerm]);

  // Group trackers count per category
  const trackersCount = useMemo(() => {
    const counts = {};
    trackers.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [trackers]);

  // CSV Exporter for active tracker reports
  const handleExportCSV = () => {
    if (!activeTracker) return;
    const headers = ['Expense Item', 'Category', 'Date', 'Amount (₹)'];
    const rows = (activeTracker.expenses || []).map(e => [
      e.name,
      e.category,
      e.date,
      e.amount
    ]);
    
    const content = [
      [`Money Tracker Statement: ${activeTracker.name}`],
      [`Category: ${activeTracker.category}`],
      [`Destination/Place: ${activeTracker.place}`],
      [`Date: ${activeTracker.date}`],
      [`Total Budget: ₹${activeTracker.budget}`],
      [],
      headers,
      ...rows
    ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTracker.name.replace(/\s+/g, '_')}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1E293B' }}>
      
      {/* Visual background gradient accents */}
      <div style={{ position: 'fixed', top: '-10%', left: '50%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: -1, pointerEvents: 'none' }} />

      <AnimatePresence mode="wait">
        
        {/* ========================================================================= */}
        {/* 1. ACTIVE TRACKER STATE */}
        {/* ========================================================================= */}
        {activeTracker ? (
          <motion.div
            key="active-tracker"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back Nav Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <button 
                onClick={() => { setActiveTracker(null); setActiveTab('details'); }} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 700, color: '#4F46E5', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', fontSize: '0.9rem' }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              
              <button 
                onClick={(e) => handleDeleteTracker(activeTracker.id, e)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: '#FEE2E2', color: '#DC2626', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <Trash2 size={16} /> Delete Tracker
              </button>
            </div>

            {/* Header Detail Card */}
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)', borderRadius: '24px', padding: '2.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', boxShadow: '0 15px 30px rgba(49, 16, 66, 0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 80%)', pointerEvents: 'none' }} />
              
              <div>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)' }}>
                  <Sparkles size={12} color="#D97706" /> {activeTracker.category}
                </span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{activeTracker.name}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', color: '#94A3B8', fontSize: '0.95rem', fontWeight: 600 }}>
                  {activeTracker.place && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={15} /> {activeTracker.place}</span>}
                  {activeTracker.date && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={15} /> {activeTracker.date}</span>}
                </div>
              </div>

              {/* Budget Progress Box */}
              <div style={{ minWidth: '250px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>Spends: ₹{trackerStats.totalExpenses.toLocaleString('en-IN')}</span>
                  <span>Budget: ₹{(parseFloat(activeTracker.budget) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: `${trackerStats.percentUsed}%`, height: '100%', background: trackerStats.percentUsed > 90 ? '#EF4444' : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', borderRadius: '999px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8' }}>{trackerStats.percentUsed}% UTILISED</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: trackerStats.remainingBudget > 0 ? '#10B981' : '#EF4444' }}>
                    {trackerStats.remainingBudget > 0 ? `₹${trackerStats.remainingBudget.toLocaleString('en-IN')} Left` : 'Budget Limit Crossed!'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '0.35rem', borderRadius: '14px', marginBottom: '2rem', overflowX: 'auto', border: '1px solid #E2E8F0' }}>
              {[
                { id: 'details', label: 'Details', icon: <FileText size={16} /> },
                { id: 'expenses', label: 'Expenses', icon: <DollarSign size={16} /> },
                { id: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
                { id: 'locations', label: 'Locations & Maps', icon: <MapPin size={16} /> },
                { id: 'photos', label: 'Photos & Journal', icon: <Camera size={16} /> },
                { id: 'reports', label: 'Reports', icon: <FileText size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: '1',
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0.65rem 1rem',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === tab.id ? 'white' : 'transparent',
                    color: activeTab === tab.id ? '#4F46E5' : '#64748B',
                    boxShadow: activeTab === tab.id ? '0 4px 10px rgba(0,0,0,0.04)' : 'none',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Active Tab Panel */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '2rem', minHeight: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              
              {/* --- A. DETAILS TAB --- */}
              {activeTab === 'details' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#4F46E5" /> Tailored Category Summary
                  </h3>
                  
                  {/* Category Tailored Information Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    {Object.entries(activeTracker.details || {}).map(([key, val]) => (
                      <div key={key} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '16px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key.replace(/_/g, ' ')}</span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', wordBreak: 'break-all' }}>{String(val)}</h4>
                      </div>
                    ))}
                    
                    {/* Add fallback if no custom details exist */}
                    {Object.keys(activeTracker.details || {}).length === 0 && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                        No specific metadata fields set up for this tracker. You can add them as needed.
                      </div>
                    )}
                  </div>

                  {/* Quick stats panel */}
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#F0FDF4', borderRadius: '16px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>Spent Rate</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#166534', marginTop: '0.25rem' }}>{trackerStats.percentUsed}%</h4>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#EFF6FF', borderRadius: '16px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>Log Items Count</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E40AF', marginTop: '0.25rem' }}>
                        {(activeTracker.expenses || []).length + (activeTracker.locations || []).length + (activeTracker.photos || []).length}
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              {/* --- B. EXPENSES TAB --- */}
              {activeTab === 'expenses' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Left Form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!expenseForm.name || !expenseForm.amount) return;
                      addLogItem('expenses', {
                        name: expenseForm.name,
                        category: expenseForm.category || 'General',
                        amount: parseFloat(expenseForm.amount),
                        date: expenseForm.date || new Date().toISOString().split('T')[0]
                      });
                      setExpenseForm({ name: '', category: '', amount: '', date: '' });
                    }} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>Add Expense Entry</h4>
                      
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Expense Title</label>
                        <input type="text" placeholder="e.g. Flight ticket, taxi fare, lunch" value={expenseForm.name} onChange={e => setExpenseForm({...expenseForm, name: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Amount (₹)</label>
                          <input type="number" placeholder="500" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Category</label>
                          <input type="text" placeholder="e.g. Travel, Food" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Date</label>
                        <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#4F46E5', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Plus size={16} /> Log Expense
                      </button>
                    </form>

                    {/* Right Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Logged Expenses ({ (activeTracker.expenses || []).length })</h4>
                        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Total Spent: <strong style={{ color: '#0F172A' }}>₹{trackerStats.totalExpenses.toLocaleString('en-IN')}</strong></span>
                      </div>
                      
                      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 800 }}>
                              <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(activeTracker.expenses || []).map((exp, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1E293B' }}>{exp.name}</td>
                                <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: '#F1F5F9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>{exp.category}</span></td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{exp.date}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                  <button onClick={() => deleteLogItem('expenses', idx)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                </td>
                              </tr>
                            ))}
                            {(activeTracker.expenses || []).length === 0 && (
                              <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>No expenses recorded. Use the form to log your first cost!</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- C. TIMELINE TAB --- */}
              {activeTab === 'timeline' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Left Form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!timelineForm.description) return;
                      addLogItem('timeline', {
                        time: timelineForm.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        description: timelineForm.description
                      });
                      setTimelineForm({ time: '', description: '' });
                    }} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>Add Timeline Moment</h4>
                      
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Time / Title</label>
                        <input type="text" placeholder="e.g. 10:00 AM, Day 1, Evening" value={timelineForm.time} onChange={e => setTimelineForm({...timelineForm, time: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Activity Description</label>
                        <textarea placeholder="e.g. Boarded flight, checked into temple queue, had dinner" value={timelineForm.description} onChange={e => setTimelineForm({...timelineForm, description: e.target.value})} required rows="3" style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'none' }} />
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#7C3AED', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Plus size={16} /> Add Moment
                      </button>
                    </form>

                    {/* Right Timeline List */}
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem' }}>Chronological Activity Timeline</h4>
                      
                      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #E2E8F0', marginLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {(activeTracker.timeline || []).map((tl, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            {/* Dot */}
                            <span style={{ position: 'absolute', left: '-2.1rem', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#7C3AED', border: '3px solid white', boxShadow: '0 0 0 2px #7C3AED' }} />
                            
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>{tl.time}</span>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', fontWeight: 600, color: '#334155', lineHeight: '1.5' }}>{tl.description}</p>
                              </div>
                              <button onClick={() => deleteLogItem('timeline', idx)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }} onMouseOver={e => e.currentTarget.style.color = '#EF4444'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {(activeTracker.timeline || []).length === 0 && (
                          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8', fontSize: '0.85rem', marginLeft: '-1.5rem' }}>
                            Your timeline is empty. Record moments to map out your tracking sequence!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- D. LOCATIONS & MAP TAB --- */}
              {activeTab === 'locations' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Left Form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!locationForm.name) return;
                      addLogItem('locations', {
                        name: locationForm.name,
                        notes: locationForm.notes || 'Visited'
                      });
                      setLocationForm({ name: '', notes: '' });
                    }} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem' }}>Add Visited Place</h4>
                      
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Place Name</label>
                        <input type="text" placeholder="e.g. Baga Beach, Taj Mahal, Delhi HQ" value={locationForm.name} onChange={e => setLocationForm({...locationForm, name: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Quick Notes</label>
                        <input type="text" placeholder="e.g. Sunset view, meeting room A" value={locationForm.notes} onChange={e => setLocationForm({...locationForm, notes: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#059669', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Plus size={16} /> Log Location
                      </button>
                    </form>

                    {/* Right Locations & Simulated Map */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      
                      {/* Simulated Interactive Route Map */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Map size={16} /> Route Visualization</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Simulated Track</span>
                        </div>
                        
                        {/* Interactive SVG Canvas */}
                        <div style={{ width: '100%', height: '180px', background: '#E2E8F0', borderRadius: '14px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {/* Topography Grid Pattern */}
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.2 }} />
                          
                          {(activeTracker.locations || []).length > 0 ? (
                            <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
                              {/* Draw Route Line */}
                              {(activeTracker.locations || []).map((loc, idx) => {
                                if (idx === 0) return null;
                                const segmentCount = (activeTracker.locations || []).length;
                                const x1 = 50 + (idx - 1) * (300 / segmentCount);
                                const y1 = 90 + Math.sin(idx - 1) * 35;
                                const x2 = 50 + idx * (300 / segmentCount);
                                const y2 = 90 + Math.sin(idx) * 35;
                                return (
                                  <line key={`l-${idx}`} x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2} stroke="#059669" strokeWidth="3" strokeDasharray="6 4" />
                                );
                              })}
                              {/* Draw Nodes */}
                              {(activeTracker.locations || []).map((loc, idx) => {
                                const segmentCount = (activeTracker.locations || []).length;
                                const x = 50 + idx * (300 / segmentCount);
                                const y = 90 + Math.sin(idx) * 35;
                                return (
                                  <g key={`g-${idx}`}>
                                    <circle cx={`${x}%`} cy={y} r="10" fill="#059669" stroke="white" strokeWidth="2.5" />
                                    <text x={`${x}%`} y={y - 18} fill="#1E293B" fontSize="9" fontWeight="800" textAnchor="middle">{loc.name}</text>
                                  </g>
                                );
                              })}
                            </svg>
                          ) : (
                            <div style={{ color: '#94A3B8', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                              <MapPin size={24} /> Log locations to trace your route map automatically!
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Locations List */}
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Logged Locations ({ (activeTracker.locations || []).length })</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                          {(activeTracker.locations || []).map((loc, idx) => (
                            <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '14px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={13} color="#059669" /> {loc.name}
                                </span>
                                <button onClick={() => deleteLogItem('locations', idx)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }} onMouseOver={e => e.currentTarget.style.color = '#EF4444'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}><Trash2 size={13} /></button>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{loc.notes}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* --- E. PHOTOS & JOURNAL TAB --- */}
              {activeTab === 'photos' && (
                <div>
                  
                  {/* Photo Logs Section */}
                  <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '2.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Logged Gallery & Snapshots</h4>
                      
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!photoForm.url) return;
                        addLogItem('photos', {
                          url: photoForm.url,
                          caption: photoForm.caption || 'Moment'
                        });
                        setPhotoForm({ url: '', caption: '' });
                      }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="url" placeholder="Paste image URL..." value={photoForm.url} onChange={e => setPhotoForm({...photoForm, url: e.target.value})} required style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', minWidth: '220px' }} />
                        <input type="text" placeholder="Caption..." value={photoForm.caption} onChange={e => setPhotoForm({...photoForm, caption: e.target.value})} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }} />
                        <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#4F46E5', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14} /> Add Snap</button>
                      </form>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                      {(activeTracker.photos || []).map((ph, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                          <img src={ph.url} alt={ph.caption} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px' }} onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300';
                          }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{ph.caption}</span>
                            <button onClick={() => deleteLogItem('photos', idx)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                      {(activeTracker.photos || []).length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', border: '1px dashed #CBD5E1', borderRadius: '16px', color: '#94A3B8', fontSize: '0.85rem' }}>
                          No snapshots logged. Paste a public image URL to build your visual travel board!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Memory Journal Section */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem' }}>Memory Journal</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flexWrap: 'wrap' }}>
                      
                      {/* Left Journal Entry Form */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!memoryForm.title || !memoryForm.note) return;
                        addLogItem('memories', {
                          title: memoryForm.title,
                          note: memoryForm.note
                        });
                        setMemoryForm({ title: '', note: '' });
                      }} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>Write Journal Note</h5>
                        
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Memory Heading</label>
                          <input type="text" placeholder="e.g. The local street food feast" value={memoryForm.title} onChange={e => setMemoryForm({...memoryForm, title: e.target.value})} required style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Memory Note</label>
                          <textarea placeholder="Write detail notes on this experience..." value={memoryForm.note} onChange={e => setMemoryForm({...memoryForm, note: e.target.value})} required rows="4" style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'none' }} />
                        </div>

                        <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#DB2777', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Heart size={15} fill="white" /> Save Memory
                        </button>
                      </form>

                      {/* Right Journal Cards List */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', height: 'fit-content' }}>
                        {(activeTracker.memories || []).map((mem, idx) => (
                          <div key={idx} style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 10px rgba(251,191,36,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#78350F' }}>{mem.title}</h5>
                              <button onClick={() => deleteLogItem('memories', idx)} style={{ background: 'transparent', border: 'none', color: '#D97706', cursor: 'pointer', padding: 0 }}><Trash2 size={13} /></button>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 700 }}>{mem.date}</span>
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#451A03', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{mem.note}</p>
                          </div>
                        ))}
                        {(activeTracker.memories || []).length === 0 && (
                          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                            Your journal is empty. Log special moments to preserve them forever!
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* --- F. REPORTS TAB --- */}
              {activeTab === 'reports' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} color="#4F46E5" /> Expense Summary Report
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>Review allocations and download ledger entries.</p>
                    </div>

                    <button 
                      onClick={handleExportCSV} 
                      style={{ border: 'none', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileText size={16} /> Export ledger (CSV)
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Total Budget</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E293B', marginTop: '0.25rem' }}>₹{(parseFloat(activeTracker.budget) || 0).toLocaleString('en-IN')}</h4>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Total Expenses</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#EF4444', marginTop: '0.25rem' }}>₹{trackerStats.totalExpenses.toLocaleString('en-IN')}</h4>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '18px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Remaining Balance</span>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: trackerStats.remainingBudget > 0 ? '#059669' : '#DC2626', marginTop: '0.25rem' }}>
                        ₹{trackerStats.remainingBudget.toLocaleString('en-IN')}
                      </h4>
                    </div>
                  </div>

                  {/* Budget Progress Bar */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.75rem', borderRadius: '20px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', display: 'block', marginBottom: '0.75rem' }}>BUDGET CONSUMPTION MATRIX</span>
                    <div style={{ width: '100%', height: '14px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ width: `${trackerStats.percentUsed}%`, height: '100%', background: trackerStats.percentUsed > 90 ? '#EF4444' : 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)', borderRadius: '999px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                      <span>{trackerStats.percentUsed}% consumed</span>
                      <span>{trackerStats.percentUsed > 100 ? `Exceeded by ₹${(trackerStats.totalExpenses - parseFloat(activeTracker.budget)).toLocaleString('en-IN')}` : `₹${trackerStats.remainingBudget.toLocaleString('en-IN')} remaining`}</span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        ) : (
          
          // =========================================================================
          // 2. LANDING PAGE STATE
          // =========================================================================
          <motion.div
            key="landing-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Dashboard section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.75px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Compass size={36} color="#4F46E5" /> Money Tracker
                </h1>
                <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem' }}>Track customized budgets, travel expenses, photos, timelines, and locations.</p>
              </div>

            </div>

            {/* Dashboard Recent Activity & Search Row */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '1.75rem', borderRadius: '24px', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} color="#7C3AED" /> Recent Trackers</h3>
                
                {/* Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 1rem', borderRadius: '12px', minWidth: '280px' }}>
                  <Search size={16} color="#94A3B8" />
                  <input 
                    type="text" 
                    placeholder="Search by name, place, category, date..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.82rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Recent Activity List */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading money trackers...</div>
              ) : filteredTrackers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #E2E8F0', borderRadius: '18px', color: '#94A3B8' }}>
                  {searchTerm ? 'No trackers matched your search criteria.' : 'No active trackers. Select a category below to start tracking!'}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {filteredTrackers.map(t => {
                    const totalExpenses = (t.expenses || []).reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                    return (
                      <div 
                        key={t.id} 
                        onClick={() => setActiveTracker(t)}
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.25s ease-in-out', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(79,70,229,0.03)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>
                            {CATEGORIES.find(c => c.id === t.category)?.icon || '✈️'}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase' }}>{t.category}</span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>{t.name}</h4>
                          </div>
                        </div>

                        {t.place && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}><MapPin size={13} /> {t.place}</div>}

                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                          <span style={{ color: '#64748B', fontWeight: 650 }}>Spent: <strong style={{ color: '#0F172A' }}>₹{totalExpenses.toLocaleString('en-IN')}</strong></span>
                          <span style={{ color: '#64748B', fontWeight: 650 }}>Budget: <strong style={{ color: '#0F172A' }}>₹{(parseFloat(t.budget) || 0).toLocaleString('en-IN')}</strong></span>
                        </div>

                        {/* Quick Delete */}
                        <button 
                          onClick={(e) => handleDeleteTracker(t.id, e)} 
                          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                          onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
                          onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Money Tracker Categories Title */}
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} color="#4F46E5" /> Choose Category to Track</h3>

            {/* Money Tracker Categories Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {CATEGORIES.map(cat => {
                const count = trackersCount[cat.id] || 0;
                return (
                  <div 
                    key={cat.id} 
                    style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', transition: 'all 0.25s ease-in-out' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.02), 0 0 0 1px ${cat.color}`; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '2.5rem', background: '#F8FAFC', padding: '0.5rem', borderRadius: '12px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon}</div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>{cat.label}</h4>
                        <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 750 }}>{count} tracked previously</span>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5', minHeight: '45px', margin: 0 }}>{cat.desc}</p>
                    
                    <button 
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCreationData({
                          name: '',
                          place: '',
                          date: new Date().toISOString().split('T')[0],
                          budget: '',
                          details: cat.id === 'Trips' ? { hotel: '', flight: '' } 
                            : cat.id === 'God Worship' ? { temple_name: '', darshan_time: '', offerings: '' }
                            : cat.id === 'Work' ? { company_name: '', client: '', hotel: '' }
                            : cat.id === 'Events' ? { event_name: '', venue: '', ticket_price: '' }
                            : {}
                        });
                      }}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', background: cat.color, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                      onMouseOut={e => e.currentTarget.style.opacity = 1}
                    >
                      Start Tracking <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}

              {/* Create Custom Tracker Card */}
              <div 
                style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', border: '2px dashed #CBD5E1', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem', minHeight: '210px', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedCategory('Custom');
                  setCreationData({ name: '', place: '', date: new Date().toISOString().split('T')[0], budget: '', details: {} });
                  setCustomCategoryName('');
                  setCustomFields([{ key: '', value: '' }]);
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#4F46E5'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#CBD5E1'}
              >
                <div style={{ fontSize: '2rem', color: '#4F46E5', width: '50px', height: '50px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>➕</div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>Create Custom Tracker</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Configure tailored tracking parameters for any personalized category.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. CREATION MODAL VIEW */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedCategory && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{ width: '90%', maxWidth: '520px', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Setup Tracker: {selectedCategory === 'Custom' ? 'Custom Category' : selectedCategory}
                </h3>
                <button onClick={() => setSelectedCategory(null)} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
              </div>

              <form onSubmit={handleCreateTracker} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Custom Category Details */}
                {selectedCategory === 'Custom' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Category Name</label>
                    <input type="text" placeholder="e.g. Honeymoon, Trekking" value={customCategoryName} onChange={e => setCustomCategoryName(e.target.value)} required style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Tracker Title</label>
                  <input type="text" placeholder="e.g. Goa Holiday, Tirupati Pilgrimage" value={creationData.name} onChange={e => setCreationData({ ...creationData, name: e.target.value })} required style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Destination / Place</label>
                    <input type="text" placeholder="e.g. Delhi, London" value={creationData.place} onChange={e => setCreationData({ ...creationData, place: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Start Date</label>
                    <input type="date" value={creationData.date} onChange={e => setCreationData({ ...creationData, date: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Budget Limit (₹)</label>
                  <input type="number" placeholder="e.g. 50000" value={creationData.budget} onChange={e => setCreationData({ ...creationData, budget: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                </div>

                {/* TAILORED CATEGORY SPECIFIC FIELDS */}
                {selectedCategory === 'Trips' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Hotel</label>
                      <input type="text" placeholder="Hotel Name" value={creationData.details.hotel || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, hotel: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Flight / Transport</label>
                      <input type="text" placeholder="Flight / Train No." value={creationData.details.flight || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, flight: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                )}

                {selectedCategory === 'God Worship' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Temple Name</label>
                      <input type="text" placeholder="Temple Deity / Name" value={creationData.details.temple_name || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, temple_name: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Darshan Time</label>
                        <input type="text" placeholder="e.g. 08:00 AM" value={creationData.details.darshan_time || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, darshan_time: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Offerings</label>
                        <input type="text" placeholder="e.g. Laddu Prasad, Chader" value={creationData.details.offerings || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, offerings: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'Work' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Company Name</label>
                        <input type="text" placeholder="e.g. TechCorp" value={creationData.details.company_name || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, company_name: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client</label>
                        <input type="text" placeholder="e.g. retail Corp" value={creationData.details.client || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, client: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Hotel Stay</label>
                      <input type="text" placeholder="Hotel Name" value={creationData.details.hotel || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, hotel: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                )}

                {selectedCategory === 'Events' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Event Venue</label>
                      <input type="text" placeholder="Convention center, Arena" value={creationData.details.venue || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, venue: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Ticket Cost (₹)</label>
                      <input type="number" placeholder="Ticket Price" value={creationData.details.ticket_price || ''} onChange={e => setCreationData({ ...creationData, details: { ...creationData.details, ticket_price: e.target.value } })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                )}

                {/* Custom key-value pairs */}
                {selectedCategory === 'Custom' && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', display: 'block', marginBottom: '0.75rem' }}>ADD TAILORED FIELD PARAMETERS</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.50rem' }}>
                      {customFields.map((field, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="text" placeholder="Field Label (e.g. Accomodation)" value={field.key} onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} style={{ flex: '1', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                          <input type="text" placeholder="Field Value (e.g. Taj Hotel)" value={field.value} onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} style={{ flex: '1', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                        </div>
                      ))}
                      <button type="button" onClick={addCustomFieldInput} style={{ alignSelf: 'flex-start', border: 'none', background: 'transparent', color: '#4F46E5', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>+ Add Parameter Field</button>
                    </div>
                  </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#4F46E5', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Compass size={18} /> Initialize Tracker Ledger
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MoneyTracker;
