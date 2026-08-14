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
        const baseUrl = import.meta.env.VITE_CONTACT_API_BASE_URL || 'https://api.bit-tool.com/api/contacts';
        console.log(`[ContactPanel] Fetching contacts from ${baseUrl}/get-all with token:`, token ? 'Present' : 'Missing');
        try {
            const res = await fetch(`${baseUrl}/get-all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[ContactPanel] Fetch response status:`, res.status, res.statusText);
            if (!res.ok) {
                const errText = await res.text();
                console.error(`[ContactPanel] Fetch failed with:`, errText);
                throw new Error(`Network response was not ok: ${res.status}`);
            }
            const result = await res.json();
            return result.data?.rows || [];
        } catch (err) {
            console.error('[ContactPanel] Fetch exception:', err);
            throw err;
        }
    };

    const addContact = async (newContact) => {
        const token = localStorage.getItem('bnx_auth_token');
        const baseUrl = import.meta.env.VITE_CONTACT_API_BASE_URL || 'https://api.bit-tool.com/api/contacts';
        try {
            const res = await fetch(`${baseUrl}/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newContact)
            });
            console.log(`[ContactPanel] Add response status:`, res.status, res.statusText);
            if (!res.ok) {
                const errText = await res.text();
                console.error(`[ContactPanel] Add failed with:`, errText);
                throw new Error(`Network response was not ok: ${res.status}`);
            }
            return await res.json();
        } catch (err) {
            console.error('[ContactPanel] Add exception:', err);
            throw err;
        }
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

    const getBadgeStyle = (appName) => {
        if (!appName) return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#e5e7eb' };
        const lowerName = appName.toLowerCase();
        if (lowerName.includes('cliks')) return { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
        if (lowerName.includes('bit')) return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' };
        if (lowerName.includes('bnx')) return { backgroundColor: '#f3e8ff', color: '#6b21a8', borderColor: '#e9d5ff' };
        return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#e5e7eb' };
    };

    return (
        <div className="contact-panel-root">
            {/* Header */}
            <div className="contact-header">
                <div className="contact-header-left">
                    <div className="contact-header-icon-bg">
                        <User size={20} className="contact-header-icon" />
                    </div>
                    <div>
                        <h2 className="contact-header-title">Global Contacts</h2>
                        <p className="contact-header-subtitle">Cross-app directory</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="contact-close-btn"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Search & Action Bar */}
            <div className="contact-search-bar">
                <div className="contact-search-input-wrapper">
                    <Search size={16} className="contact-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="contact-search-input"
                    />
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="contact-add-btn"
                    title="Add Contact"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Content List */}
            <div className="contact-content-list">
                {isLoading ? (
                    <div className="contact-state-message">
                        <Loader2 className="contact-spin" size={24} />
                        <p>Loading contacts...</p>
                    </div>
                ) : isError ? (
                    <div className="contact-state-message error">
                        <p>Failed to load contacts.</p>
                        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['globalContacts'] })} className="contact-retry-btn">Retry</button>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="contact-state-message empty">
                        <User size={32} className="contact-empty-icon" />
                        <p>{searchTerm ? "No contacts match your search." : "No contacts found."}</p>
                    </div>
                ) : (
                    filteredContacts.map(contact => (
                        <div key={contact.id || contact.email} className="contact-card">
                            <div className="contact-card-header">
                                <h3 className="contact-card-name">{contact.name}</h3>
                                {contact.applicationName && (
                                    <span className="contact-app-badge" style={getBadgeStyle(contact.applicationName)}>
                                        {contact.applicationName}
                                    </span>
                                )}
                            </div>
                            {contact.role && (
                                <div className="contact-card-detail">
                                    <Briefcase size={12} className="contact-detail-icon" />
                                    <span>{contact.role}</span>
                                </div>
                            )}
                            <div className="contact-card-body">
                                {contact.email && (
                                    <div className="contact-card-detail link">
                                        <Mail size={12} className="contact-detail-icon" />
                                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                                    </div>
                                )}
                                {contact.phonenumber && (
                                    <div className="contact-card-detail link">
                                        <Phone size={12} className="contact-detail-icon" />
                                        <a href={`tel:${contact.phonenumber}`}>{contact.phonenumber}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Contact Modal overlay */}
            {isAddModalOpen && (
                <div className="contact-modal-overlay">
                    <div className="contact-modal-content">
                        <div className="contact-modal-header">
                            <h3 className="contact-modal-title">Add New Contact</h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="contact-modal-close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="contact-modal-body">
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="contact-form-group">
                                    <label>Full Name *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputChange}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="contact-form-group">
                                    <label>Email Address *</label>
                                    <input 
                                        required 
                                        type="email" 
                                        name="email"
                                        value={formData.email} 
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="contact-form-group">
                                    <label>Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="phonenumber"
                                        value={formData.phonenumber} 
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="contact-form-group">
                                    <label>Role / Job Title</label>
                                    <input 
                                        type="text" 
                                        name="role"
                                        value={formData.role} 
                                        onChange={handleInputChange}
                                        placeholder="e.g. Supplier, Consultant"
                                    />
                                </div>
                                
                                <div className="contact-form-actions">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="contact-btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={addMutation.isPending}
                                        className="contact-btn-primary"
                                    >
                                        {addMutation.isPending && <Loader2 size={16} className="contact-spin" />}
                                        {addMutation.isPending ? 'Saving...' : 'Save Contact'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .contact-panel-root {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #ffffff;
                    position: relative;
                    width: 400px;
                    border-left: 1px solid #e2e8f0;
                    box-shadow: -4px 0 25px rgba(0,0,0,0.05);
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }
                
                .contact-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    background: #ffffff;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    flex-shrink: 0;
                }
                .contact-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .contact-header-icon-bg {
                    padding: 8px;
                    background: #eef2ff;
                    border-radius: 8px;
                    display: flex;
                }
                .contact-header-icon {
                    color: #4f46e5;
                }
                .contact-header-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                    line-height: 1.2;
                }
                .contact-header-subtitle {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin: 0;
                }
                .contact-close-btn {
                    padding: 8px;
                    color: #9ca3af;
                    background: transparent;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    transition: all 0.2s;
                }
                .contact-close-btn:hover {
                    color: #4b5563;
                    background: #f9fafb;
                }

                .contact-search-bar {
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    background: #f8fafc;
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;
                }
                .contact-search-input-wrapper {
                    position: relative;
                    flex: 1;
                    display: flex;
                }
                .contact-search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }
                .contact-search-input {
                    width: 100%;
                    padding: 8px 16px 8px 36px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    color: #111827;
                }
                .contact-search-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
                }
                .contact-add-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    background: #4f46e5;
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .contact-add-btn:hover {
                    background: #4338ca;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }

                .contact-content-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    background: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .contact-state-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 12rem;
                    gap: 12px;
                    color: #9ca3af;
                    font-size: 0.875rem;
                }
                .contact-state-message.error {
                    color: #ef4444;
                }
                .contact-state-message.empty {
                    background: #ffffff;
                    border: 1px dashed #cbd5e1;
                    border-radius: 12px;
                }
                .contact-retry-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    text-decoration: underline;
                    font-weight: 500;
                    font-size: 0.75rem;
                    cursor: pointer;
                }
                .contact-retry-btn:hover {
                    color: #b91c1c;
                }
                .contact-spin {
                    animation: contact-spin 1s linear infinite;
                }
                @keyframes contact-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .contact-card {
                    background: #ffffff;
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 2px 10px -4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .contact-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .contact-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }
                .contact-card-name {
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                    font-size: 1rem;
                    transition: color 0.2s;
                }
                .contact-card:hover .contact-card-name {
                    color: #4f46e5;
                }
                .contact-app-badge {
                    font-size: 0.625rem;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .contact-card-detail {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    color: #4b5563;
                }
                .contact-detail-icon {
                    color: #9ca3af;
                    flex-shrink: 0;
                }
                .contact-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-top: 12px;
                }
                .contact-card-detail.link a {
                    color: #6b7280;
                    text-decoration: none;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .contact-card-detail.link a:hover {
                    color: #4f46e5;
                }

                .contact-modal-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(17,24,39,0.4);
                    backdrop-filter: blur(4px);
                    z-index: 20;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    animation: contact-fadeIn 0.2s ease-out;
                }
                @keyframes contact-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .contact-modal-content {
                    background: #ffffff;
                    width: 100%;
                    height: 85%;
                    border-top: 1px solid #e2e8f0;
                    border-radius: 24px 24px 0 0;
                    box-shadow: 0 -10px 25px -5px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    animation: contact-slideUp 0.3s ease-out;
                }
                @keyframes contact-slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .contact-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    flex-shrink: 0;
                }
                .contact-modal-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }
                .contact-modal-close {
                    padding: 6px;
                    background: #f3f4f6;
                    color: #6b7280;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    transition: all 0.2s;
                }
                .contact-modal-close:hover {
                    color: #374151;
                    background: #e5e7eb;
                }
                .contact-modal-body {
                    padding: 1.5rem;
                    flex: 1;
                    overflow-y: auto;
                }
                .contact-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .contact-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .contact-form-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                }
                .contact-form-group input {
                    width: 100%;
                    padding: 10px 16px;
                    background: #f9fafb;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    color: #111827;
                }
                .contact-form-group input:focus {
                    background: #ffffff;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
                }
                .contact-form-actions {
                    padding-top: 1rem;
                    margin-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    gap: 12px;
                }
                .contact-btn-secondary, .contact-btn-primary {
                    flex: 1;
                    padding: 10px 16px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .contact-btn-secondary {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    color: #374151;
                }
                .contact-btn-secondary:hover {
                    background: #f9fafb;
                }
                .contact-btn-primary {
                    background: #4f46e5;
                    border: none;
                    color: #ffffff;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .contact-btn-primary:hover:not(:disabled) {
                    background: #4338ca;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .contact-btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ContactPanel;
