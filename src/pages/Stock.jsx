import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
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
    Download,
    History
} from 'lucide-react';
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
import * as XLSX from 'xlsx';
import '../App.css';

const Stock = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
    const [adjustAmount, setAdjustAmount] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyItem, setHistoryItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sub_name: '',
        category: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: '',
        status: 'In Stock',
        low_stock_threshold: 5
    });

    // Queries
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['stock', searchTerm],
        queryFn: () => fetchStockItems({ search: searchTerm })
    });

    const { data: stats } = useQuery({
        queryKey: ['stock-stats'],
        queryFn: fetchStockStats
    });

    const { data: historyData = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['stock-history', historyItem?.id],
        queryFn: () => fetchStockHistory(historyItem.id),
        enabled: !!historyItem
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: addStockItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateStockItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStockItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
        }
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, delta }) => adjustStockQuantity(id, delta),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
            closeAdjustModal();
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            name: '',
            sub_name: '',
            category: '',
            quantity: 1,
            unit: 'pcs',
            unit_price: '',
            status: 'In Stock',
            low_stock_threshold: 5
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            sub_name: item.sub_name || '',
            category: item.category || '',
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            unit_price: item.unit_price || '',
            status: item.status || 'In Stock',
            low_stock_threshold: item.low_stock_threshold ?? item.lowstockthreshold ?? item.lowStockThreshold ?? item.low_stock_threshold ?? 5
        });
        setIsModalOpen(true);
    };

    const handleAdjustClick = (item, type) => {
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
        const payload = {
            ...formData,
            quantity: Number(formData.quantity || 0),
            unit_price: Number(formData.unit_price || 0),
            low_stock_threshold: Number(formData.low_stock_threshold || 5)
        };
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: payload });
        } else {
            addMutation.mutate(payload);
        }
    };

    const [filterStatus, setFilterStatus] = useState('all'); // 'all' or 'low'

    const filteredItems = items.filter(item => {
        const matchesFilter = filterStatus === 'all' || item.quantity < (item.low_stock_threshold || 5);
        return matchesFilter;
    });

    const handleExportReport = () => {
        if (!filteredItems || filteredItems.length === 0) {
            alert('No data to export.');
            return;
        }

        const worksheetData = filteredItems.map(item => ({
            'Product Name': item.name || '',
            'Sub Name': item.sub_name || '',
            'Category': item.category || '',
            'Quantity': item.quantity || 0,
            'Unit': item.unit || '',
            'Unit Price (₹)': item.unit_price || 0,
            'Total Value (₹)': (item.quantity || 0) * (item.unit_price || 0),
            'Low Stock Level': item.low_stock_threshold || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');

        const fileName = `stock_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const totalValue = stats?.totalValue || 0;
    const lowStockCount = stats?.lowStockCount || 0;
    const totalUnits = items.reduce((acc, i) => acc + parseInt(i.quantity || 0), 0);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navigation / Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
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
                    <button onClick={handleExportReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
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
                        Add New Product
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Inventory Value', value: formatCurrency(totalValue), icon: TrendingUp, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active Items', value: items.length, icon: Layers, color: '#064E3B', bg: '#ECFDF5' },
                    { label: 'Total Units', value: totalUnits, icon: Package, color: '#0D9488', bg: '#F0FDFA' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', transition: 'transform 0.2s, box-shadow 0.2s' }} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div style={{ background: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>+2.4%</div>
                        </div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', marginBottom: '0.25rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {/* Custom Toolbar */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by product name or category..." 
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
                            <button 
                                onClick={() => setFilterStatus('all')}
                                style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', background: filterStatus === 'all' ? 'white' : 'transparent', color: filterStatus === 'all' ? '#064E3B' : '#64748B', fontWeight: '700', fontSize: '0.85rem', boxShadow: filterStatus === 'all' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                            >All Stock</button>
                            <button 
                                onClick={() => setFilterStatus('low')}
                                style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', background: filterStatus === 'low' ? 'white' : 'transparent', color: filterStatus === 'low' ? '#064E3B' : '#64748B', fontWeight: '700', fontSize: '0.85rem', boxShadow: filterStatus === 'low' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                            >Low Stock</button>
                        </div>
                        <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <Loader2 className="animate-spin" size={40} color="#1B6B3A" />
                            <p style={{ color: '#64748B', fontWeight: '600' }}>Synchronizing inventory data...</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Level</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Price</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => {
                                    const thresh = item.low_stock_threshold ?? item.lowstockthreshold ?? item.lowStockThreshold ?? item.low_stock_threshold ?? 5;
                                    const isLowStock = Number(item.quantity) < thresh;
                                    const isOutOfStock = Number(item.quantity) === 0;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.2s' }} className="inventory-row">
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F0FDF4', border: '1px solid #DCF2E4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.1rem' }}>{item.name}</p>
                                                        {item.sub_name && <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>{item.sub_name}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1B6B3A' }}></div>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>{item.category}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: '850', color: isLowStock ? '#EF4444' : '#1E293B' }}>{item.quantity}</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94A3B8', marginBottom: '2px' }}>{item.unit || 'pcs'}</span>
                                                </div>
                                                {isLowStock && (
                                                    <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', fontWeight: '800', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <AlertTriangle size={12} /> CRITICAL LEVEL
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#064E3B' }}>{formatCurrency(item.unit_price || 0)}</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                                                    padding: '0.5rem 1rem', borderRadius: '12px',
                                                    background: isOutOfStock ? '#FEF2F2' : (isLowStock ? '#FFFBEB' : '#F0FDF4'),
                                                    color: isOutOfStock ? '#B91C1C' : (isLowStock ? '#B45309' : '#15803D'),
                                                    fontSize: '0.85rem', fontWeight: '800'
                                                }}>
                                                    {isOutOfStock ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                                                    {isOutOfStock ? 'OUT OF STOCK' : (isLowStock ? 'LOW STOCK' : 'IN STOCK')}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', background: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                                                        <button 
                                                            onClick={() => handleAdjustClick(item, 'in')}
                                                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Stock In"
                                                        >
                                                            <ArrowUpRight size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAdjustClick(item, 'out')}
                                                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}
                                                            title="Stock Out"
                                                            disabled={isOutOfStock}
                                                        >
                                                            <ArrowDownRight size={18} />
                                                        </button>
                                                    </div>
                                                    <div style={{ width: '1px', height: '20px', background: '#E2E8F0', margin: '0 0.25rem' }}></div>
                                                    <button onClick={() => handleEdit(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDelete(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                    <button onClick={() => { setHistoryItem(item); setIsHistoryModalOpen(true); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #EFF6FF', background: 'white', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px' }} title="View History"><History size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                {filteredItems.length === 0 && !isLoading && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>No inventory items found. Click "Add New Product" to initialize your stock.</div>
                )}
            </div>

            {/* Modal - Add/Edit Product */}
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
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name</label>
                                    <input required placeholder="e.g. MacBook Pro M3" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sub Name</label>
                                    <input placeholder="Optional subtitle" type="text" value={formData.sub_name} onChange={(e) => setFormData({...formData, sub_name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                                    <input required placeholder="e.g. Electronics" type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Label</label>
                                    <input required placeholder="pcs / Units" type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Initial Quantity</label>
                                    <input required type="number" value={formData.quantity === 0 ? '' : formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value) || 0})} disabled={!!editingItem} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Valuation (₹)</label>
                                    <input required type="number" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Level</label>
                                    <input required type="number" value={formData.low_stock_threshold === 0 ? '' : formData.low_stock_threshold} onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value === '' ? '' : parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            <button type="submit" disabled={addMutation.isPending || addMutation.isLoading || updateMutation.isPending || updateMutation.isLoading} style={{ 
                                width: '100%', padding: '1.25rem', borderRadius: '18px', 
                                background: (addMutation.isPending || addMutation.isLoading || updateMutation.isPending || updateMutation.isLoading) ? '#CBD5E1' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                                fontWeight: '750', fontSize: '1.1rem', marginTop: '1rem', cursor: (addMutation.isPending || addMutation.isLoading || updateMutation.isPending || updateMutation.isLoading) ? 'not-allowed' : 'pointer',
                                boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}>
                                {(addMutation.isPending || addMutation.isLoading || updateMutation.isPending || updateMutation.isLoading) ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> {editingItem ? 'Updating...' : 'Initializing...'}
                                    </>
                                ) : (
                                    editingItem ? 'Update Product Catalog' : 'Initialize Product'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '560px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Stock History</h2>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>{historyItem?.name}</p>
                            </div>
                            <button onClick={() => { setIsHistoryModalOpen(false); setHistoryItem(null); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer', color: '#64748B' }}><X size={22} /></button>
                        </div>
                        
                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                            {isHistoryLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={32} color="#1B6B3A" /></div>
                            ) : historyData.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem', fontWeight: '600' }}>No history available for this item.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {historyData.map((record, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: record.type === 'in' ? '#DCFCE7' : '#FEE2E2', color: record.type === 'in' ? '#16A34A' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {record.type === 'in' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.95rem', textTransform: 'capitalize' }}>Stock {record.type}</p>
                                                    <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>{new Date(record.created_at || record.date).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: record.type === 'in' ? '#16A34A' : '#EF4444' }}>
                                                {record.type === 'in' ? '+' : '-'}{record.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                delta: adjustType === 'in' ? adjustAmount : -adjustAmount 
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
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025) !important;
                }
                .inventory-row:hover {
                    background-color: #F8FAFC !important;
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

export default Stock;
