import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Pin, PinOff, Trash2, Edit2, Loader2, StickyNote } from 'lucide-react';

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
        <div className="flex flex-col h-full bg-slate-50 relative shadow-2xl rounded-l-2xl overflow-hidden w-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <StickyNote size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">Global Notes</h2>
                        <p className="text-xs text-slate-500">Cross-app thoughts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ title: '', content: '', color: '#ffffff', isPinned: false });
                            setIsFormOpen(true);
                        }}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        title="New Note"
                    >
                        <Plus size={18} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <p>Loading notes...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center p-4 bg-red-50 text-red-600 rounded-xl">
                        <p className="mb-2">Failed to load notes.</p>
                        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['globalNotes'] })} className="text-sm font-semibold underline">Retry</button>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <StickyNote size={32} className="mb-3 opacity-50" />
                        <p>No notes found.</p>
                    </div>
                ) : (
                    <>
                        {/* Pinned Notes */}
                        {pinnedNotes.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Pinned</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {pinnedNotes.map(note => <NoteCard key={note.id} note={note} onEdit={handleEdit} onTogglePin={togglePinMutation} onDelete={deleteMutation} getBadgeStyle={getBadgeStyle} />)}
                                </div>
                            </div>
                        )}
                        
                        {/* Unpinned Notes */}
                        {unpinnedNotes.length > 0 && (
                            <div>
                                {pinnedNotes.length > 0 && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 mt-6">Others</h3>}
                                <div className="grid grid-cols-1 gap-3">
                                    {unpinnedNotes.map(note => <NoteCard key={note.id} note={note} onEdit={handleEdit} onTogglePin={togglePinMutation} onDelete={deleteMutation} getBadgeStyle={getBadgeStyle} />)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Modal (contained within the panel) */}
            {isFormOpen && (
                <div className="absolute inset-0 z-20 flex flex-col bg-white">
                    <div className="flex justify-between items-center px-4 py-3 border-b">
                        <h3 className="font-bold text-slate-800">{editingId ? 'Edit Note' : 'New Note'}</h3>
                        <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-100 rounded-md"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSave} className="flex flex-col flex-1 p-4 overflow-y-auto" style={{ backgroundColor: formData.color }}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="text-lg font-bold bg-transparent border-none outline-none mb-3 placeholder:text-black/30 text-slate-900"
                        />
                        <textarea
                            placeholder="Take a note..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="flex-1 bg-transparent border-none outline-none resize-none placeholder:text-black/30 text-slate-800 leading-relaxed"
                        />
                        
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`w-6 h-6 rounded-full border shadow-sm transition-transform ${formData.color === color ? 'scale-125 border-slate-400' : 'border-black/10 hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.isPinned}
                                        onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Pin note
                                </label>
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-md transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
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
            className="group relative p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer overflow-hidden"
            style={{ backgroundColor: note.color || '#ffffff' }}
            onClick={() => onEdit(note)}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-800 truncate pr-6">{note.title}</h4>
                {note.applicationName && (
                    <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap absolute top-3 right-3 opacity-80"
                        style={getBadgeStyle(note.applicationName)}
                    >
                        {note.applicationName}
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap">{note.content}</p>
            
            {/* Quick Actions Hover Overlay */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-lg p-1 shadow-sm" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => onTogglePin.mutate({ id: note.id, isPinned: !note.isPinned })}
                    className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
                    title={note.isPinned ? "Unpin" : "Pin"}
                >
                    {note.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button 
                    onClick={() => onDelete.mutate(note.id)}
                    className="p-1.5 hover:bg-white rounded-md text-red-500 transition-colors"
                    title="Delete note"
                >
                    {onDelete.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
            </div>
            
            {/* Pin indicator on the card */}
            {note.isPinned && (
                <div className="absolute -top-1 -left-1 text-slate-800 drop-shadow-md">
                    <Pin size={16} className="rotate-45" fill="currentColor" />
                </div>
            )}
        </div>
    );
};

export default NotesPanel;
