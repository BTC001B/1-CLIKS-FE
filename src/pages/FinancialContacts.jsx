import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/common/EmptyState';
import {
    MoreHorizontal,
    Phone,
    Mail,
    Globe,
    Plus,
    Search,
    Filter,
    Trash2
} from 'lucide-react';
import '../App.css';

const FinancialContacts = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [letterRange, setLetterRange] = useState("All");
    const [hasPhone, setHasPhone] = useState(false);
    const [hasEmail, setHasEmail] = useState(false);

    const resetFilters = () => {
        setSearchQuery("");
        setLetterRange("All");
        setHasPhone(false);
        setHasEmail(false);
    };

    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [formError, setFormError] = useState('');

    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('books_contacts');
        return saved ? JSON.parse(saved) : [];
    });

    const handleAddContact = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email) {
            setFormError('All fields are required');
            return;
        }

        const nameParts = formData.name.trim().split(' ');
        const initials = nameParts.length > 1 
            ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
            : nameParts[0][0];

        const newContact = {
            id: Date.now(),
            initials: initials.toUpperCase(),
            avatarBg: '#10B981',
            name: formData.name,
            time: 'Just now',
            phone: formData.phone,
            email: formData.email,
            website: '-',
            tag: 'New Contact',
            tagBg: '#DBEAFE',
            tagColor: '#1D4ED8'
        };

        setContacts(prev => {
            const updated = [newContact, ...prev];
            localStorage.setItem('books_contacts', JSON.stringify(updated));
            return updated;
        });

        setIsModalOpen(false);
        setFormData({ name: '', phone: '', email: '' });
        setFormError('');
    };

    const handleDeleteContact = (id) => {
        setContacts(prev => {
            const updated = prev.filter(c => c.id !== id);
            localStorage.setItem('books_contacts', JSON.stringify(updated));
            return updated;
        });
    };

    const handleDeleteAllContacts = () => {
        if (window.confirm("Are you sure you want to delete all contacts?")) {
            setContacts([]);
            localStorage.removeItem('books_contacts');
        }
    };

    return (
        <div className="contacts-page">
            <div className="dashboard-header">
                <div>
                    <p className="subtitle">Manage your professional network</p>
                </div>
                <div className="controls filter-wrapper">
                    {contacts.length > 0 && (
                        <button className="btn-danger" onClick={handleDeleteAllContacts}>
                            <Trash2 size={18} />
                            Clear All
                        </button>
                    )}
                    <button className="btn-secondary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <Filter size={18} />
                        Filter
                    </button>
                    
                    <AnimatePresence>
                        {isFilterOpen && (
                            <Motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="filter-panel"
                            >
                                <div className="filter-body">
                                    <div className="filter-group">
                                        <label className="filter-label">Search by Name</label>
                                        <div className="filter-search-input-wrapper">
                                            <Search size={16} className="filter-search-icon" />
                                            <input 
                                                type="text" 
                                                className="filter-input-text"
                                                placeholder="Search contacts..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="filter-group">
                                        <label className="filter-label">Filter by Initial Letter</label>
                                        <select 
                                            className="filter-select"
                                            value={letterRange}
                                            onChange={(e) => setLetterRange(e.target.value)}
                                        >
                                            <option value="All">All</option>
                                            <option value="A-F">A–F</option>
                                            <option value="G-L">G–L</option>
                                            <option value="M-R">M–R</option>
                                            <option value="S-Z">S–Z</option>
                                        </select>
                                    </div>
                                    
                                    <div className="filter-group-checkboxes">
                                        <label className="filter-checkbox-label">
                                            <input 
                                                type="checkbox"
                                                checked={hasPhone}
                                                onChange={(e) => setHasPhone(e.target.checked)}
                                                className="filter-checkbox"
                                            />
                                            <span>Has Phone Number</span>
                                        </label>
                                    </div>
                                    
                                    <div className="filter-group-checkboxes">
                                        <label className="filter-checkbox-label">
                                            <input 
                                                type="checkbox"
                                                checked={hasEmail}
                                                onChange={(e) => setHasEmail(e.target.checked)}
                                                className="filter-checkbox"
                                            />
                                            <span>Has Email</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="filter-footer">
                                    <button className="btn-reset" onClick={resetFilters}>Reset Filters</button>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Contact
                    </button>
                </div>
            </div>

            {contacts.length === 0 ? (
                <EmptyState 
                    title="No Contacts Found" 
                    description="Click 'Add Contact' to create your first contact." 
                />
            ) : (
                <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '0 32px' }}>
                    {(() => {
                        const filteredContacts = contacts.filter(contact => {
                            const nameMatch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
                            const phoneMatch = !hasPhone || (contact.phone && contact.phone !== '-');
                            const emailMatch = !hasEmail || (contact.email && contact.email !== '-');
                            
                            const letterMatch = (() => {
                                const first = contact.name[0].toUpperCase();
                                if (letterRange === "A-F") return first >= "A" && first <= "F";
                                if (letterRange === "G-L") return first >= "G" && first <= "L";
                                if (letterRange === "M-R") return first >= "M" && first <= "R";
                                if (letterRange === "S-Z") return first >= "S" && first <= "Z";
                                return true;
                            })();

                            return nameMatch && phoneMatch && emailMatch && letterMatch;
                        });

                        return filteredContacts.map(item => (
                            <div key={item.id} className="contact-card">
                                <button className="btn-icon-danger" onClick={() => handleDeleteContact(item.id)}>
                                    <Trash2 size={16} />
                                </button>
                                <div className="avatar-large" style={{ background: item.avatarBg, color: 'white' }}>
                                    <span>{item.initials}</span>
                                </div>
                                <h4 className="contact-name">{item.name}</h4>
                                <div className="contact-details">
                                    <div className="detail-row">
                                        <Phone className="detail-icon" />
                                        <span>{item.phone}</span>
                                    </div>
                                    <div className="detail-row">
                                        <Mail className="detail-icon" />
                                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.email}</span>
                                    </div>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="modal-content"
                        >
                            <h2 className="modal-title">Add New Contact</h2>
                            <form onSubmit={handleAddContact} className="modal-form">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="form-input"
                                        placeholder="e.g. John Carter"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="form-input"
                                        placeholder="(210) 555-2312"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="form-input"
                                        placeholder="john@email.com"
                                    />
                                </div>
                                
                                {formError && <p className="form-error">{formError}</p>}
                                
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Add Contact
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0 0 1rem 0;
                    color: var(--text-main);
                }
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .form-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-muted);
                }
                .form-input {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 0.875rem;
                    outline: none;
                }
                .form-input:focus {
                    border-color: #22C55E;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }
                .form-error {
                    color: #EF4444;
                    font-size: 0.875rem;
                    margin: 0;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 1rem;
                }

                .contacts-page {
                    display: flex;
                    flex-direction: column;
                    background-color: #F8FAFC;
                    min-height: 100vh;
                    padding-bottom: 20px;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 32px;
                    background: white;
                    border-bottom: 1px solid var(--border-color);
                    flex-shrink: 0;
                    margin-bottom: 20px;
                }

                .page-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-main);
                }

                .subtitle {
                    margin: 4px 0 0;
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .controls {
                    display: flex;
                    gap: 12px;
                }

                .filter-wrapper {
                    position: relative;
                }

                .filter-panel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    width: 280px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--border-color);
                    z-index: 50;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .filter-body {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .filter-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .filter-search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .filter-search-icon {
                    position: absolute;
                    left: 10px;
                    color: #94A3B8;
                }
                .filter-input-text {
                    width: 100%;
                    padding: 0.5rem 0.5rem 0.5rem 32px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 0.85rem;
                    outline: none;
                }
                .filter-input-text:focus {
                    border-color: #22C55E;
                }
                .filter-select {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    font-size: 0.85rem;
                    outline: none;
                    background: white;
                }
                .filter-group-checkboxes {
                    display: flex;
                    align-items: center;
                }
                .filter-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: var(--text-main);
                    cursor: pointer;
                }
                .filter-checkbox {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: #22C55E;
                }
                .filter-footer {
                    padding: 0.75rem 1rem;
                    background: #F8FAFC;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: center;
                }
                .btn-reset {
                    background: none;
                    border: none;
                    color: #EF4444;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-reset:hover {
                    text-decoration: underline;
                }

                .btn-secondary {
                    background: white;
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    padding: 8px 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 13px;
                }

                .btn-primary {
                    background: #1B6B3A;
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 13px;
                }

                .contact-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center; /* Center content */
                    text-align: center;
                    position: relative;
                }

                .contact-card:hover {
                    box-shadow: 0 8px 12px -3px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                    border-color: #E2E8F0;
                }
                
                .contact-card:hover .btn-icon-danger {
                    opacity: 1;
                }

                .avatar-large {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .contact-name {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: #1E293B;
                }

                .contact-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    align-items: center;
                }

                .detail-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #475569;
                    min-width: 0;
                }

                .detail-icon {
                    color: #94A3B8;
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }

                .btn-danger {
                    background: white;
                    border: 1px solid #EF4444;
                    color: #EF4444;
                    padding: 8px 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s ease;
                }

                .btn-danger:hover {
                    background: #FEF2F2;
                }

                .btn-icon-danger {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: transparent;
                    border: none;
                    color: #EF4444;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    opacity: 0;
                }

                .btn-icon-danger:hover {
                    background: #FEF2F2;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default FinancialContacts;
