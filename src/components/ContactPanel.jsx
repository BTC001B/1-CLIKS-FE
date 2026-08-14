import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, X, Phone, Mail, Briefcase, User, Loader2 } from 'lucide-react';

const ContactPanel = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phonenumber: '', role: '' });

    const fetchContacts = async () => {
        const token = localStorage.getItem('bnx_auth_token');
        const baseUrl = import.meta.env.VITE_CONTACT_API_BASE_URL;
        const res = await fetch(`${baseUrl}/get-all`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Network response was not ok');
        const result = await res.json();
        return result.data?.rows || [];
    };

    const addContact = async (newContact) => {
        const token = localStorage.getItem('bnx_auth_token');
        const baseUrl = import.meta.env.VITE_CONTACT_API_BASE_URL;
        const res = await fetch(`${baseUrl}/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newContact)
        });
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    };

    const { data: contacts = [], isLoading, isError } = useQuery({
        queryKey: ['globalContacts'],
        queryFn: fetchContacts,
    });

    const addMutation = useMutation({
        mutationFn: addContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalContacts'] });
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', phonenumber: '', role: '' });
        }
    });

    const filteredContacts = contacts.filter(contact => {
        const term = searchTerm.toLowerCase();
        return (
            contact.name?.toLowerCase().includes(term) ||
            contact.email?.toLowerCase().includes(term) ||
            contact.phonenumber?.toLowerCase().includes(term)
        );
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addMutation.mutate(formData);
    };

    const getAppBadgeColor = (appName) => {
        if (!appName) return 'bg-gray-100 text-gray-800 border-gray-200';
        const lowerName = appName.toLowerCase();
        if (lowerName.includes('cliks')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (lowerName.includes('bit')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (lowerName.includes('bnx')) return 'bg-purple-100 text-purple-800 border-purple-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="flex flex-col h-full bg-white relative w-full border-l border-gray-200 shadow-xl overflow-hidden" style={{ width: '400px' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <User size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 leading-tight">Global Contacts</h2>
                        <p className="text-xs text-gray-500">Cross-app directory</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Search & Action Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-2 shrink-0">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shrink-0 shadow-sm hover:shadow"
                    title="Add Contact"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                        <Loader2 className="animate-spin" size={24} />
                        <p className="text-sm">Loading contacts...</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-500">
                        <p className="text-sm">Failed to load contacts.</p>
                        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['globalContacts'] })} className="text-xs font-medium underline hover:text-red-700">Retry</button>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <User size={32} className="text-gray-300" />
                        <p className="text-sm">{searchTerm ? "No contacts match your search." : "No contacts found."}</p>
                    </div>
                ) : (
                    filteredContacts.map(contact => (
                        <div key={contact.id || contact.email} className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{contact.name}</h3>
                                {contact.applicationName && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${getAppBadgeColor(contact.applicationName)}`}>
                                        {contact.applicationName}
                                    </span>
                                )}
                            </div>
                            {contact.role && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                    <Briefcase size={12} className="text-gray-400" />
                                    <span>{contact.role}</span>
                                </div>
                            )}
                            <div className="space-y-1.5 mt-3">
                                {contact.email && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Mail size={12} className="text-gray-400 shrink-0" />
                                        <a href={`mailto:${contact.email}`} className="hover:text-indigo-600 truncate">{contact.email}</a>
                                    </div>
                                )}
                                {contact.phonenumber && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone size={12} className="text-gray-400 shrink-0" />
                                        <a href={`tel:${contact.phonenumber}`} className="hover:text-indigo-600 truncate">{contact.phonenumber}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Contact Modal overlay (Positioned Absolute inside the panel) */}
            {isAddModalOpen && (
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-20 flex flex-col items-center justify-end animate-in fade-in duration-200">
                    <div className="bg-white w-full h-[85%] border-t border-gray-200 rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Contact</h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1.5 bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                    <input 
                                        required 
                                        type="email" 
                                        name="email"
                                        value={formData.email} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="phonenumber"
                                        value={formData.phonenumber} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Job Title</label>
                                    <input 
                                        type="text" 
                                        name="role"
                                        value={formData.role} 
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="e.g. Supplier, Consultant"
                                    />
                                </div>
                                
                                <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={addMutation.isPending}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                                    >
                                        {addMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                                        {addMutation.isPending ? 'Saving...' : 'Save Contact'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactPanel;
