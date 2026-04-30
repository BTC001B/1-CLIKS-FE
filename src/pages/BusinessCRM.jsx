import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    UserPlus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Mail, 
    Phone, 
    Building2,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
    Briefcase,
    Globe,
    IndianRupee,
    User,
    Plus,
    Edit2,
    Trash2
} from 'lucide-react';
import { crmService } from '../services';
import '../App.css';

const BusinessCRM = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });

    // Fetch Customers
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            return res.data || [];
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: crmService.createCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => crmService.updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: crmService.deleteCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            setActiveMenu(null);
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            company: customer.company || '',
            status: customer.status,
            notes: customer.notes || ''
        });
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        leads: customers.filter(c => c.status === 'lead').length,
        revenue: customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0)
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'active': return { bg: '#F0FDF4', color: '#15803D', icon: CheckCircle2 };
            case 'lead': return { bg: '#EFF6FF', color: '#1D4ED8', icon: Clock };
            case 'inactive': return { bg: '#F8FAFC', color: '#64748B', icon: AlertCircle };
            default: return { bg: '#F8FAFC', color: '#64748B', icon: AlertCircle };
        }
    };

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} onClick={() => setActiveMenu(null)}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <UserPlus size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Customer Relationship</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage your professional network and business leads.</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
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
                    Add Customer
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Base', value: stats.total, icon: User, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Active Clients', value: stats.active, icon: CheckCircle2, color: '#0D9488', bg: '#F0FDFA' },
                    { label: 'Pipeline Leads', value: stats.leads, icon: TrendingUp, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Total LTV', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: '#064E3B', bg: '#ECFDF5' }
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

            {/* Customers List */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email or company..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Customer</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Organization</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Value</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => {
                                    const statusStyle = getStatusStyle(customer.status);
                                    return (
                                        <tr key={customer.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '1rem', marginBottom: '0.1rem' }}>{customer.name}</p>
                                                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{customer.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    <Building2 size={16} />
                                                    {customer.company || 'Personal'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                    padding: '0.4rem 0.8rem', borderRadius: '10px',
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    fontSize: '0.8rem', fontWeight: '800'
                                                }}>
                                                    <statusStyle.icon size={12} />
                                                    {customer.status.toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ fontSize: '1.05rem', fontWeight: '850', color: '#064E3B' }}>₹{parseFloat(customer.total_spent || 0).toLocaleString()}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right', position: 'relative' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === customer.id ? null : customer.id); }}
                                                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {activeMenu === customer.id && (
                                                    <div style={{ position: 'absolute', right: '2rem', top: '3.5rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, width: '120px', overflow: 'hidden' }}>
                                                        <button 
                                                            onClick={() => handleEdit(customer)}
                                                            style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(customer.id)}
                                                            style={{ width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'white', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderTop: '1px solid #F1F5F9' }}
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                {filteredCustomers.length === 0 && !isLoading && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>No customers found. Click "Add Customer" to start building your database.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '560px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Full Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="lead">Lead</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Email Address</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Company</label>
                                <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer' }}>
                                {createMutation.isLoading || updateMutation.isLoading ? <Loader2 className="animate-spin" /> : (editingCustomer ? 'Update Customer' : 'Add Customer')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessCRM;
