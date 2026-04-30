import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    FileText, 
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
    Download,
    Receipt,
    User,
    Mail,
    Calendar,
    IndianRupee,
    TrendingUp
} from 'lucide-react';
import { billingService } from '../services/billingService';
import '../App.css';

const BusinessBilling = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [formData, setFormData] = useState({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        client_name: '',
        client_email: '',
        amount: 0,
        status: 'Draft',
        due_date: new Date().toISOString().split('T')[0],
        items: []
    });

    // Queries
    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: billingService.getInvoices
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: billingService.createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => billingService.updateInvoice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: billingService.deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInvoice(null);
        setFormData({
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            client_name: '',
            client_email: '',
            amount: 0,
            status: 'Draft',
            due_date: new Date().toISOString().split('T')[0],
            items: []
        });
    };

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setFormData({
            invoice_number: invoice.invoice_number,
            client_name: invoice.client_name,
            client_email: invoice.client_email,
            amount: invoice.amount,
            status: invoice.status,
            due_date: invoice.due_date,
            items: invoice.items ? JSON.parse(invoice.items) : []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingInvoice) {
            updateMutation.mutate({ id: editingInvoice.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalInvoiced = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);
    const paidInvoiced = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);
    const pendingInvoiced = invoices.filter(inv => inv.status !== 'Paid').reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Receipt size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Billing Center</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage client invoices and accounts receivable.</p>
                </div>
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
                >
                    <Plus size={20} />
                    Generate Invoice
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Invoiced', value: `₹${totalInvoiced.toLocaleString()}`, icon: TrendingUp, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Paid Revenue', value: `₹${paidInvoiced.toLocaleString()}`, icon: CheckCircle2, color: '#0D9488', bg: '#F0FDFA' },
                    { label: 'Outstanding Balance', value: `₹${pendingInvoiced.toLocaleString()}`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active Clients', value: new Set(invoices.map(i => i.client_name)).size, icon: User, color: '#064E3B', bg: '#ECFDF5' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Invoices List */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search client or invoice #..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                        />
                    </div>
                    <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Filter size={20} />
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} color="#1B6B3A" /></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Client</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Due Date</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <span style={{ fontWeight: '750', color: '#1E293B' }}>{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{inv.client_name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{inv.client_email}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
                                                <Calendar size={14} />
                                                {inv.due_date}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '850', color: '#064E3B' }}>₹{inv.amount.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                padding: '0.4rem 0.8rem', borderRadius: '10px',
                                                background: inv.status === 'Paid' ? '#F0FDF4' : (inv.status === 'Unpaid' ? '#FEF2F2' : '#FFFBEB'),
                                                color: inv.status === 'Paid' ? '#15803D' : (inv.status === 'Unpaid' ? '#B91C1C' : '#B45309'),
                                                fontSize: '0.8rem', fontWeight: '800'
                                            }}>
                                                {inv.status === 'Paid' ? <CheckCircle2 size={12} /> : (inv.status === 'Overdue' ? <AlertTriangle size={12} /> : <Clock size={12} />)}
                                                {inv.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button onClick={() => handleEdit(inv)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(inv.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '560px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Invoice Number</label>
                                    <input readOnly type="text" value={formData.invoice_number} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Draft</option>
                                        <option>Unpaid</option>
                                        <option>Paid</option>
                                        <option>Overdue</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Client Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input required type="text" placeholder="e.g. Acme Corp" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Client Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input required type="email" placeholder="billing@acme.com" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Total Amount (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <IndianRupee size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input required type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Due Date</label>
                                    <input required type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer' }}>
                                {createMutation.isLoading || updateMutation.isLoading ? <Loader2 className="animate-spin" /> : (editingInvoice ? 'Update Invoice' : 'Generate Invoice')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessBilling;
