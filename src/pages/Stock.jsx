import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/common';
import { 
    Plus, Search, Package, Loader2, 
    AlertCircle, X, CheckCircle2, Minus, 
    History, Trash2, Edit3, 
    TrendingUp, Box, MoreVertical
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    fetchStockItems, 
    fetchStockStats, 
    addStockItem, 
    updateStockItem,
    adjustStockQuantity, 
    deleteStockItem, 
    fetchStockHistory 
} from '../services/stockService';
import { formatCurrency } from '../lib/formatCurrency';

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

const StockItem = ({ item, onAdjust, onDelete, onEdit, onViewHistory }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const isLowStock = Number(item.quantity) < 5;
    const isOutOfStock = Number(item.quantity) === 0;

    return (
        <Motion.div 
            className={`premium-card ${isOutOfStock ? 'opacity-75' : ''}`} 
            style={{ padding: '1.5rem', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <AnimatePresence>
                {isDeleting && (
                    <Motion.div 
                        style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', borderRadius: '32px' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Trash2 size={24} />
                        </div>
                        <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Remove Item?</div>
                        <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>This action cannot be undone. All transaction history will be purged.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                            <button className="btn-premium secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsDeleting(false)}>Cancel</button>
                            <button className="btn-premium primary" style={{ flex: 1, justifyContent: 'center', background: '#EF4444' }} onClick={() => { onDelete(item.id); setIsDeleting(false); }}>Delete</button>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isLowStock ? '#FEF2F2' : '#F0FDF4', color: isLowStock ? '#EF4444' : '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor' }}>
                        <Box size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1E293B' }}>{item.name}</div>
                        <div className="label-caps" style={{ color: '#64748B' }}>{item.category}</div>
                    </div>
                </div>
                {isLowStock && (
                    <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #FEE2E2' }}>
                        <AlertCircle size={12} /> LOW STOCK
                    </div>
                )}
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F0FDF4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="icon-btn" style={{ background: 'white', width: '36px', height: '36px' }} onClick={() => onAdjust(item.id, -1)} disabled={isOutOfStock}>
                        <Minus size={18} />
                    </button>
                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{item.quantity}</div>
                        <div className="label-caps" style={{ fontSize: '9px', marginTop: '4px' }}>{item.unit || 'pcs'}</div>
                    </div>
                    <button className="icon-btn" style={{ background: 'white', width: '36px', height: '36px' }} onClick={() => onAdjust(item.id, 1)}>
                        <Plus size={18} />
                    </button>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="label-caps" style={{ fontSize: '9px' }}>Inventory Value</div>
                    <div style={{ fontWeight: 900, color: '#1B6B3A', fontSize: '1.1rem' }}>{formatCurrency(item.value || 0)}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn" onClick={() => onViewHistory(item)} title="Activity History"><History size={18} /></button>
                    <button className="icon-btn" onClick={() => onEdit(item)} title="Edit Item"><Edit3 size={18} /></button>
                </div>
                <button className="icon-btn" style={{ color: '#EF4444', background: '#FEF2F2' }} onClick={() => setIsDeleting(true)} title="Remove Item"><Trash2 size={18} /></button>
            </div>
        </Motion.div>
    );
};

const AddItemModal = ({ isOpen, onClose, onSave, editingItem }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Stationery',
        quantity: 1,
        unit: 'pcs',
        unit_price: ''
    });

    React.useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name,
                category: editingItem.category,
                quantity: editingItem.quantity,
                unit: editingItem.unit || 'pcs',
                unit_price: editingItem.unit_price || ''
            });
        } else {
            setFormData({
                name: '',
                category: 'Stationery',
                quantity: 1,
                unit: 'pcs',
                unit_price: ''
            });
        }
    }, [editingItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <Motion.div 
                className="premium-card" 
                style={{ width: '100%', maxWidth: '500px', background: 'white', padding: '2.5rem' }} 
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="card-header" style={{ padding: '0 0 2rem 0', border: 'none' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{editingItem ? 'Edit Asset' : 'New Asset'}</h2>
                    <button onClick={onClose} className="icon-btn"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="label-caps">Item Name</label>
                        <input 
                            className="premium-input"
                            required type="text" placeholder="e.g. MacBook Pro M3" 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label-caps">Category</label>
                            <select className="premium-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="Stationery">Stationery</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Supplies">Supplies</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label-caps">Unit</label>
                            <input className="premium-input" type="text" placeholder="pcs / units" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label-caps">Initial Qty</label>
                            <input className="premium-input" required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} disabled={!!editingItem} />
                        </div>
                        <div className="form-group">
                            <label className="label-caps">Unit Cost (₹)</label>
                            <input className="premium-input" required type="number" step="0.01" placeholder="0.00" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button type="button" className="btn-premium secondary" style={{ justifyContent: 'center' }} onClick={onClose}>Discard</button>
                        <button type="submit" className="btn-premium primary" style={{ justifyContent: 'center' }}>
                            {editingItem ? 'Save Changes' : 'Confirm Entry'}
                        </button>
                    </div>
                </form>
            </Motion.div>
        </div>
    );
};

const HistoryPanel = ({ item, isOpen, onClose }) => {
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['stock-history', item?.id],
        queryFn: () => fetchStockHistory(item.id),
        enabled: !!item && isOpen
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <Motion.div 
                className="premium-card" 
                style={{ width: '100%', maxWidth: '480px', background: 'white', height: '80vh', display: 'flex', flexDirection: 'column', padding: '2rem' }} 
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="card-header" style={{ padding: '0 0 1.5rem 0', border: 'none' }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem' }}>Asset Flow Log</h3>
                        <div className="label-caps" style={{ color: '#1B6B3A', marginTop: '4px' }}>{item?.name}</div>
                    </div>
                    <button onClick={onClose} className="icon-btn"><X size={24} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="hide-scrollbar">
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={32} className="animate-spin" color="#1B6B3A" /></div>
                    ) : history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
                            <History size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <div className="label-caps">No transaction record found</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {history.map(tx => (
                                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F0FDF4' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: tx.type === 'in' ? '#DCFCE7' : '#FEE2E2', color: tx.type === 'in' ? '#16A34A' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor' }}>
                                        {tx.type === 'in' ? <Plus size={16} /> : <Minus size={16} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B' }}>{tx.type === 'in' ? 'Procured' : 'Consumed'}</div>
                                        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{new Date(tx.created_at).toLocaleString()}</div>
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: tx.type === 'in' ? '#16A34A' : '#EF4444' }}>
                                        {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Motion.div>
        </div>
    );
};

const Stock = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [historyItem, setHistoryItem] = useState(null);

    // Queries
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['stock', searchQuery, selectedCategory],
        queryFn: () => fetchStockItems({ 
            search: searchQuery, 
            category: selectedCategory === 'All' ? undefined : selectedCategory 
        })
    });

    const { data: stats } = useQuery({
        queryKey: ['stock-stats'],
        queryFn: fetchStockStats
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: addStockItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
            setIsAddModalOpen(false);
        }
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, delta }) => adjustStockQuantity(id, delta),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStockItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
        },
        onError: (err) => {
            console.error('Delete failed:', err);
            alert('Failed to delete item. Please try again.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateStockItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
            setIsAddModalOpen(false);
            setEditingItem(null);
        }
    });

    const handleSave = (data) => {
        const payload = {
            ...data,
            quantity: Number(data.quantity),
            unit_price: Number(data.unit_price)
        };

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: payload });
        } else {
            addMutation.mutate(payload);
        }
    };

    const handleAdjust = (id, delta) => {
        adjustMutation.mutate({ id, delta });
    };

    const handleDelete = (id) => {
        if (!id) return;
        deleteMutation.mutate(id);
    };

    return (
        <div className="premium-container">
            <PageHeader 
                title={<>Inventory <span className="text-highlight">Control</span></>}
                subtitle="Central management for assets, supplies, and real-time stock tracking."
                breadcrumb="INVENTORY"
                primaryAction={{
                    label: "Add New Asset",
                    onClick: () => setIsAddModalOpen(true)
                }}
            />

            <section className="stats-grid" style={{ marginTop: '2.5rem' }}>
                <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0FDF4', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={28} />
                    </div>
                    <div>
                        <div className="label-caps">Managed Assets</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>{stats?.totalItems || 0}</div>
                    </div>
                </div>
                <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <div className="label-caps">Inventory Valuation</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>{formatCurrency(stats?.totalValue || 0)}</div>
                    </div>
                </div>
                <div className="premium-card glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <div className="label-caps">Low Inventory</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#EF4444' }}>{stats?.lowStockCount || 0}</div>
                    </div>
                </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', borderBottom: '1px solid #F0FDF4', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {['All', 'Stationery', 'Electronics', 'Furniture', 'Supplies'].map(cat => (
                        <button 
                            key={cat} 
                            style={{ 
                                background: 'none', border: 'none', padding: '0 0 1rem 0', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 900, color: selectedCategory === cat ? '#1B6B3A' : '#94A3B8',
                                borderBottom: selectedCategory === cat ? '2px solid #1B6B3A' : 'none',
                                textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s'
                            }}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #F0FDF4', width: '300px' }}>
                    <Search size={18} color="#94A3B8" />
                    <input 
                        style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontWeight: 600, fontSize: '0.9rem' }}
                        type="text" placeholder="Search inventory..." 
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem' }}>
                    <Loader2 size={48} className="animate-spin" color="#1B6B3A" />
                    <p className="label-caps" style={{ marginTop: '1rem', color: '#94A3B8' }}>Syncing Inventory...</p>
                </div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem', background: '#F8FAFC', borderRadius: '32px', border: '2px dashed #E2E8F0', marginTop: '2rem' }}>
                    <Package size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
                    <h3 style={{ fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>No Items Found</h3>
                    <p style={{ color: '#64748B', fontWeight: 600 }}>Try adjusting your search or category filters.</p>
                </div>
            ) : (
                <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                    {items.map(item => (
                        <StockItem 
                            key={item.id} 
                            item={item} 
                            onAdjust={handleAdjust}
                            onDelete={handleDelete}
                            onEdit={(item) => { setEditingItem(item); setIsAddModalOpen(true); }}
                            onViewHistory={setHistoryItem}
                        />
                    ))}
                </div>
            )}

            <AddItemModal 
                isOpen={isAddModalOpen} 
                onClose={() => {setIsAddModalOpen(false); setEditingItem(null);}} 
                onSave={handleSave} 
                editingItem={editingItem}
            />

            <HistoryPanel 
                item={historyItem} 
                isOpen={!!historyItem} 
                onClose={() => setHistoryItem(null)} 
            />
        </div>
    );
};

export default Stock;
;
