import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    MoreVertical, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Box,
    Layers,
    TrendingUp,
    ChevronRight,
    Download
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import '../App.css';

const BusinessInventory = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
    const [adjustAmount, setAdjustAmount] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'General',
        quantity: 0,
        price: 0,
        supplier: '',
        status: 'In Stock'
    });

    // Queries
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryService.getInventory
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: inventoryService.addItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory']);
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => inventoryService.updateItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory']);
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: inventoryService.deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory']);
        }
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, amount }) => inventoryService.adjustStock(id, amount),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventory']);
            closeAdjustModal();
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            name: '',
            sku: '',
            category: 'General',
            quantity: 0,
            price: 0,
            supplier: '',
            status: 'In Stock'
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            price: item.price,
            supplier: item.supplier,
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleAdjust = (item, type) => {
        setSelectedItem(item);
        setAdjustType(type);
        setAdjustAmount(1);
        setIsAdjustModalOpen(true);
    };

    const closeAdjustModal = () => {
        setIsAdjustModalOpen(false);
        setSelectedItem(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            addMutation.mutate(formData);
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const lowStockCount = items.filter(i => i.quantity < 10).length;

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navigation / Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Box size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Inventory Suite</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Precision stock management for enterprise growth.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Download size={18} />
                        Export Report
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.6rem', 
                            padding: '0.85rem 1.75rem', borderRadius: '14px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                            fontWeight: '700', cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={20} />
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Inventory Value', value: `₹${totalValue.toLocaleString()}`, icon: TrendingUp, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active SKUs', value: items.length, icon: Layers, color: '#064E3B', bg: '#ECFDF5' },
                    { label: 'Total Units', value: items.reduce((acc, i) => acc + i.quantity, 0), icon: Package, color: '#0D9488', bg: '#F0FDFA' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div style={{ background: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>+2.4%</div>
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {/* Custom Toolbar */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by product name, SKU or category..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', 
                                border: '1px solid #E2E8F0', outline: 'none', background: 'white',
                                fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1B6B3A';
                                e.target.style.boxShadow = '0 0 0 4px rgba(27, 107, 58, 0.05)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#E2E8F0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '14px' }}>
                            <button style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', background: 'white', color: '#064E3B', fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>All Stock</button>
                            <button style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', background: 'transparent', color: '#64748B', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Low Stock</button>
                        </div>
                        <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <Loader2 className="animate-spin" size={40} color="#1B6B3A" />
                            <p style={{ color: '#64748B', fontWeight: '600' }}>Synchronizing inventory data...</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Level</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Price</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }} className="inventory-row">
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#F0FDF4', border: '1px solid #DCF2E4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</p>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#F1F5F9' }}>SKU</span> {item.sku}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1B6B3A' }}></div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>{item.category}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
                                                <span style={{ fontSize: '1.15rem', fontWeight: '850', color: item.quantity < 10 ? '#EF4444' : '#1E293B' }}>{item.quantity}</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94A3B8', marginBottom: '2px' }}>Units</span>
                                            </div>
                                            {item.quantity < 10 && (
                                                <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', fontWeight: '800', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <AlertTriangle size={12} /> CRITICAL LEVEL
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#064E3B' }}>₹{item.price.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                                                padding: '0.5rem 1rem', borderRadius: '12px',
                                                background: item.status === 'In Stock' ? '#F0FDF4' : (item.status === 'Low Stock' ? '#FFFBEB' : '#FEF2F2'),
                                                color: item.status === 'In Stock' ? '#15803D' : (item.status === 'Low Stock' ? '#B45309' : '#B91C1C'),
                                                fontSize: '0.85rem', fontWeight: '800'
                                            }}>
                                                {item.status === 'In Stock' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                {item.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ display: 'flex', background: '#F8FAFC', padding: '4px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                                    <button 
                                                        onClick={() => handleAdjust(item, 'in')}
                                                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Stock In"
                                                    >
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAdjust(item, 'out')}
                                                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}
                                                        title="Stock Out"
                                                    >
                                                        <ArrowDownRight size={18} />
                                                    </button>
                                                </div>
                                                <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 0.5rem' }}></div>
                                                <button onClick={() => handleEdit(item)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => deleteMutation.mutate(item.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal - Add/Edit Item */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '560px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>{editingItem ? 'Edit Product' : 'Register Product'}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>Enter product specifications and initial stock levels.</p>
                            </div>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer', color: '#64748B' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Identity</label>
                                    <input required placeholder="e.g. MacBook Pro M3" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU Number</label>
                                    <input required placeholder="MBP-2024-M3" type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classification</label>
                                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '1rem', fontWeight: '600' }}>
                                        <option>General</option>
                                        <option>Electronics</option>
                                        <option>Furniture</option>
                                        <option>Apparel</option>
                                        <option>Software</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '1rem', fontWeight: '600' }}>
                                        <option>In Stock</option>
                                        <option>Low Stock</option>
                                        <option>Out of Stock</option>
                                        <option>On Order</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Quantity</label>
                                    <input required type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Valuation (₹)</label>
                                    <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            <button type="submit" style={{ 
                                width: '100%', padding: '1.25rem', borderRadius: '18px', 
                                background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                                fontWeight: '750', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)'
                            }}>
                                {editingItem ? 'Update Product Catalog' : 'Initialize Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Stock Adjust Modal */}
            {isAdjustModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: 'white', width: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>
                                    {adjustType === 'in' ? 'Stock Induction' : 'Stock Depletion'}
                                </h2>
                                <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '600' }}>Adjust real-time inventory levels.</p>
                            </div>
                            <button onClick={closeAdjustModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        
                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid #F1F5F9' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <Package size={28} />
                            </div>
                            <div>
                                <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '1.1rem' }}>{selectedItem?.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B' }}>Available Base:</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#064E3B' }}>{selectedItem?.quantity}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adjustment Volume</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <button 
                                    onClick={() => setAdjustAmount(Math.max(1, adjustAmount - 1))}
                                    style={{ width: '52px', height: '52px', borderRadius: '16px', border: '2px solid #E2E8F0', background: 'white', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', color: '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1B6B3A'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                >-</button>
                                <input 
                                    type="number" 
                                    value={adjustAmount} 
                                    onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                    style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: '2px solid #1B6B3A', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', outline: 'none', color: '#1E293B', background: '#F0FDF4' }}
                                />
                                <button 
                                    onClick={() => setAdjustAmount(adjustAmount + 1)}
                                    style={{ width: '52px', height: '52px', borderRadius: '16px', border: '2px solid #E2E8F0', background: 'white', fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', color: '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1B6B3A'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                >+</button>
                            </div>
                        </div>

                        <button 
                            onClick={() => adjustMutation.mutate({ 
                                id: selectedItem.id, 
                                amount: adjustType === 'in' ? adjustAmount : -adjustAmount 
                            })}
                            disabled={adjustMutation.isLoading}
                            style={{ 
                                width: '100%', padding: '1.25rem', borderRadius: '20px', 
                                background: adjustType === 'in' ? 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', 
                                color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                boxShadow: adjustType === 'in' ? '0 10px 20px rgba(27, 107, 58, 0.25)' : '0 10px 20px rgba(239, 68, 68, 0.25)'
                            }}
                        >
                            {adjustMutation.isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                                <>
                                    {adjustType === 'in' ? <TrendingUp size={22} /> : <ArrowDownRight size={22} />}
                                    Commit {adjustType === 'in' ? 'Induction' : 'Depletion'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .inventory-row:hover {
                    background-color: #F8FAFC !important;
                    transform: scale(1.002);
                }
                .inventory-row:hover td {
                    color: #1B6B3A;
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default BusinessInventory;
