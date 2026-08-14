import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Pin, PinOff, Trash2, Loader2, StickyNote } from 'lucide-react';

const COLORS = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#e6c9a8'];

const NotesPanel = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', color: '#ffffff', isPinned: false });

    // Fetch Notes
    const fetchNotes = async () => {
        const token = localStorage.getItem('bnx_auth_token');
        const baseUrl = import.meta.env.VITE_NOTES_API_BASE_URL || 'https://api.bit-tool.com/api/notes';
        const res = await fetch(`${baseUrl}/?allApps=true`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Failed to fetch notes');
        const result = await res.json();
        return result.data || [];
    };

    const { data: notes = [], isLoading, isError } = useQuery({
        queryKey: ['globalNotes'],
        queryFn: fetchNotes,
    });

    // Mutations
    const baseUrl = import.meta.env.VITE_NOTES_API_BASE_URL || 'https://api.bit-tool.com/api/notes';
    
    const saveMutation = useMutation({
        mutationFn: async (notePayload) => {
            const token = localStorage.getItem('bnx_auth_token');
            const url = editingId ? `${baseUrl}/update/${editingId}` : `${baseUrl}/create`;
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notePayload)
            });
            if (!res.ok) throw new Error('Failed to save note');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalNotes'] });
            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ title: '', content: '', color: '#ffffff', isPinned: false });
        }
    });

    const togglePinMutation = useMutation({
        mutationFn: async ({ id, isPinned }) => {
            const token = localStorage.getItem('bnx_auth_token');
            const res = await fetch(`${baseUrl}/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isPinned })
            });
            if (!res.ok) throw new Error('Failed to pin note');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalNotes'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const token = localStorage.getItem('bnx_auth_token');
            const res = await fetch(`${baseUrl}/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete note');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globalNotes'] });
        }
    });

    const handleEdit = (note) => {
        setEditingId(note.id);
        setFormData({
            title: note.title || '',
            content: note.content || '',
            color: note.color || '#ffffff',
            isPinned: note.isPinned || false
        });
        setIsFormOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const pinnedNotes = notes.filter(n => n.isPinned);
    const unpinnedNotes = notes.filter(n => !n.isPinned);

    const getBadgeStyle = (appName) => {
        if (!appName) return { background: '#f1f5f9', color: '#475569' };
        if (appName.toLowerCase().includes('cliks')) return { background: '#dcfce7', color: '#166534' };
        return { background: '#dbeafe', color: '#1e40af' };
    };

    return (
        <div className="notes-panel-container">
            <style>{`
                .notes-panel-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background-color: #f8fafc;
                    position: relative;
                    width: 400px;
                    box-shadow: -10px 0 25px rgba(0,0,0,0.1);
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .notes-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background-color: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    z-index: 10;
                }
                .notes-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .notes-icon-wrapper {
                    padding: 8px;
                    background-color: #fef3c7;
                    color: #d97706;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .notes-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    line-height: 1.2;
                }
                .notes-subtitle {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                }
                .notes-header-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .notes-btn-new {
                    padding: 8px;
                    background-color: #059669;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                .notes-btn-new:hover {
                    background-color: #047857;
                }
                .notes-btn-close {
                    padding: 8px;
                    background-color: transparent;
                    color: #64748b;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                .notes-btn-close:hover {
                    background-color: #f1f5f9;
                }
                .notes-content-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .notes-state-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 160px;
                    color: #94a3b8;
                }
                .notes-spin {
                    animation: notes-spin 1s linear infinite;
                    margin-bottom: 8px;
                }
                @keyframes notes-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .notes-error-box {
                    text-align: center;
                    padding: 16px;
                    background-color: #fef2f2;
                    color: #dc2626;
                    border-radius: 12px;
                }
                .notes-retry-btn {
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: underline;
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    margin-top: 8px;
                }
                .notes-section-title {
                    font-size: 12px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 12px 4px;
                }
                .notes-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .note-card {
                    position: relative;
                    padding: 16px;
                    border-radius: 12px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: all 0.2s;
                    overflow: hidden;
                }
                .note-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                }
                .note-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }
                .note-card-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding-right: 24px;
                }
                .note-app-badge {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 999px;
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    opacity: 0.9;
                }
                .note-card-content {
                    font-size: 14px;
                    color: #334155;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    white-space: pre-wrap;
                }
                .note-actions {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    opacity: 0;
                    background-color: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(4px);
                    border-radius: 8px;
                    padding: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: opacity 0.2s;
                }
                .note-card:hover .note-actions {
                    opacity: 1;
                }
                .note-action-btn {
                    padding: 6px;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }
                .note-action-btn:hover {
                    background-color: rgba(255,255,255,0.9);
                }
                .note-action-btn.delete {
                    color: #ef4444;
                }
                .note-pin-indicator {
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    color: #1e293b;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }
                .notes-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 20;
                    display: flex;
                    flex-direction: column;
                    background-color: #ffffff;
                }
                .notes-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    background-color: rgba(255,255,255,0.5);
                }
                .notes-modal-title {
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    font-size: 16px;
                }
                .notes-form {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }
                .notes-input-title {
                    font-size: 18px;
                    font-weight: 700;
                    background: transparent;
                    border: none;
                    outline: none;
                    margin-bottom: 12px;
                    color: #0f172a;
                    font-family: inherit;
                }
                .notes-input-title::placeholder {
                    color: rgba(0,0,0,0.3);
                }
                .notes-input-content {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    resize: none;
                    color: #1e293b;
                    font-size: 15px;
                    line-height: 1.6;
                    font-family: inherit;
                }
                .notes-input-content::placeholder {
                    color: rgba(0,0,0,0.3);
                }
                .notes-form-footer {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .notes-color-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .notes-color-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.1);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: transform 0.1s, border-color 0.1s;
                }
                .notes-color-btn:hover {
                    transform: scale(1.1);
                }
                .notes-color-btn.active {
                    transform: scale(1.25);
                    border-color: #94a3b8;
                }
                .notes-form-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 8px;
                }
                .notes-pin-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #334155;
                    cursor: pointer;
                }
                .notes-pin-checkbox {
                    border-radius: 4px;
                    border: 1px solid #cbd5e1;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                .notes-submit-btn {
                    padding: 8px 16px;
                    background-color: #0f172a;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    transition: background-color 0.2s;
                }
                .notes-submit-btn:hover {
                    background-color: #1e293b;
                }
                .notes-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>

            {/* Header */}
            <div className="notes-header">
                <div className="notes-header-left">
                    <div className="notes-icon-wrapper">
                        <StickyNote size={20} />
                    </div>
                    <div>
                        <h2 className="notes-title">Global Notes</h2>
                        <p className="notes-subtitle">Cross-app thoughts</p>
                    </div>
                </div>
                <div className="notes-header-right">
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ title: '', content: '', color: '#ffffff', isPinned: false });
                            setIsFormOpen(true);
                        }}
                        className="notes-btn-new"
                        title="New Note"
                    >
                        <Plus size={18} />
                    </button>
                    <button onClick={onClose} className="notes-btn-close">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="notes-content-list">
                {isLoading ? (
                    <div className="notes-state-message">
                        <Loader2 className="notes-spin" size={24} />
                        <p>Loading notes...</p>
                    </div>
                ) : isError ? (
                    <div className="notes-error-box">
                        <p>Failed to load notes.</p>
                        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['globalNotes'] })} className="notes-retry-btn">Retry</button>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="notes-state-message">
                        <StickyNote size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p>No notes found.</p>
                    </div>
                ) : (
                    <>
                        {/* Pinned Notes */}
                        {pinnedNotes.length > 0 && (
                            <div>
                                <h3 className="notes-section-title">Pinned</h3>
                                <div className="notes-grid">
                                    {pinnedNotes.map(note => <NoteCard key={note.id} note={note} onEdit={handleEdit} onTogglePin={togglePinMutation} onDelete={deleteMutation} getBadgeStyle={getBadgeStyle} />)}
                                </div>
                            </div>
                        )}
                        
                        {/* Unpinned Notes */}
                        {unpinnedNotes.length > 0 && (
                            <div>
                                {pinnedNotes.length > 0 && <h3 className="notes-section-title" style={{ marginTop: 24 }}>Others</h3>}
                                <div className="notes-grid">
                                    {unpinnedNotes.map(note => <NoteCard key={note.id} note={note} onEdit={handleEdit} onTogglePin={togglePinMutation} onDelete={deleteMutation} getBadgeStyle={getBadgeStyle} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isFormOpen && (
                <div className="notes-modal-overlay">
                    <div className="notes-modal-header">
                        <h3 className="notes-modal-title">{editingId ? 'Edit Note' : 'New Note'}</h3>
                        <button onClick={() => setIsFormOpen(false)} className="notes-btn-close" style={{ padding: 4 }}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSave} className="notes-form" style={{ backgroundColor: formData.color }}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="notes-input-title"
                        />
                        <textarea
                            placeholder="Take a note..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="notes-input-content"
                        />
                        
                        <div className="notes-form-footer">
                            <div className="notes-color-picker">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`notes-color-btn ${formData.color === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="notes-form-actions">
                                <label className="notes-pin-label">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.isPinned}
                                        onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                                        className="notes-pin-checkbox"
                                    />
                                    Pin note
                                </label>
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="notes-submit-btn"
                                >
                                    {saveMutation.isPending && <Loader2 size={14} className="notes-spin" style={{ marginBottom: 0 }} />}
                                    {editingId ? 'Save' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

// Extracted NoteCard Component
const NoteCard = ({ note, onEdit, onTogglePin, onDelete, getBadgeStyle }) => {
    return (
        <div 
            className="note-card"
            style={{ backgroundColor: note.color || '#ffffff' }}
            onClick={() => onEdit(note)}
        >
            <div className="note-card-header">
                <h4 className="note-card-title">{note.title}</h4>
                {note.applicationName && (
                    <span 
                        className="note-app-badge"
                        style={getBadgeStyle(note.applicationName)}
                    >
                        {note.applicationName}
                    </span>
                )}
            </div>
            <p className="note-card-content">{note.content}</p>
            
            {/* Quick Actions Hover Overlay */}
            <div className="note-actions" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => onTogglePin.mutate({ id: note.id, isPinned: !note.isPinned })}
                    className="note-action-btn"
                    title={note.isPinned ? "Unpin" : "Pin"}
                >
                    {note.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button 
                    onClick={() => onDelete.mutate(note.id)}
                    className="note-action-btn delete"
                    title="Delete note"
                >
                    {onDelete.isPending ? <Loader2 size={16} className="notes-spin" style={{ marginBottom: 0 }} /> : <Trash2 size={16} />}
                </button>
            </div>
            
            {/* Pin indicator on the card */}
            {note.isPinned && (
                <div className="note-pin-indicator">
                    <Pin size={16} className="rotate-45" fill="currentColor" />
                </div>
            )}
        </div>
    );
};

export default NotesPanel;

