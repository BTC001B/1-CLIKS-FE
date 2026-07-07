import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    Gift, X, Copy, Check, Share2, Twitter, Facebook, Linkedin,
    Coins, Users, CheckCircle2, Loader2, AlertCircle, RefreshCw,
    Bell, TrendingUp, UserCheck, LogIn, Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { referralService } from '../services/referralService';
import '../App.css';

/* ─── Fallback code ──────────────────────────────────────────── */
const generateFallbackCode = (userId) => {
    const seed = userId ? String(userId).slice(-6) : Math.random().toString(36).slice(2, 8);
    return `CLIK-${seed.slice(0, 4).toUpperCase()}-${seed.slice(4, 8).padEnd(4, '0').toUpperCase()}`;
};

/* ─── Notification bell panel ────────────────────────────────── */
const NotificationPanel = ({ notifications, onMarkAllRead }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
                position: 'absolute', top: '48px', left: 0,
                width: '300px', background: '#fff',
                borderRadius: '18px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                border: '1px solid #E2E8F0', zIndex: 10, overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
        >
            <div style={{ padding: '1rem 1.25rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>Referral Notifications</span>
                <button onClick={onMarkAllRead} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1B6B3A', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
            </div>
            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>
                        No notifications yet
                    </div>
                ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: n.read ? 'transparent' : '#F0FDF4', borderBottom: '1px solid #F8FAFC' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.type === 'signup' ? '#DCFCE7' : '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {n.type === 'signup' ? <UserCheck size={16} color="#059669" /> : <LogIn size={16} color="#3B82F6" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
                                {n.type === 'signup' ? 'Referral Signed Up!' : 'Referral Logged In!'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                                <span style={{ color: '#1B6B3A', fontWeight: 600 }}>{n.name}</span>{' '}
                                {n.type === 'signup' ? 'signed up. +500 pts pending.' : 'logged in. +500 pts credited!'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} />{n.time}
                            </div>
                        </div>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0, marginTop: 4 }} />}
                    </div>
                ))}
            </div>
        </Motion.div>
    );
};

/* ─── Tracking tab ───────────────────────────────────────────── */
const statusMeta = {
    logged_in: { label: 'Completed',  bg: '#DCFCE7', color: '#059669' },
    signed_up: { label: 'Pending',    bg: '#FEF9C3', color: '#CA8A04' },
};

const TrackingView = ({ stats, history, historyLoading }) => (
    <div style={{ padding: '1.5rem 2.5rem 2rem' }}>
        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
                { label: 'Total Referred', value: stats.referred,     color: '#1B6B3A' },
                { label: 'Converted',      value: stats.converted,    color: '#7C3AED' },
                { label: 'Pts Earned',     value: stats.pointsEarned, color: '#F59E0B' },
            ].map(s => (
                <div key={s.label} style={{ background: '#F8FAFC', borderRadius: '14px', padding: '0.875rem', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
            ))}
        </div>
        {/* History list */}
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Referral History</div>
        {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                <Loader2 size={22} color="#1B6B3A" className="animate-spin" />
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {(history || []).length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, padding: '1.5rem 0' }}>No referrals yet</div>
                ) : (history || []).map(h => {
                    const m = statusMeta[h.status] ?? statusMeta['signed_up'];
                    return (
                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Users size={15} color="#3B82F6" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{h.name || h.referredUserName}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{h.date || h.createdAt}</div>
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>{m.label}</span>
                            {(h.pts || h.pointsAwarded) > 0 && <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F59E0B', whiteSpace: 'nowrap' }}>+{h.pts || h.pointsAwarded} pts</span>}
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const ReferralModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [shareError, setShareError] = useState('');
    const [activeTab, setActiveTab] = useState('refer');
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    // Local notification state — merges API data with read/unread tracking
    const [notifications, setNotifications] = useState([]);
    const [bellRinging, setBellRinging] = useState(false);
    const prevNotifCountRef = React.useRef(0);
    // Toast for new real-time notification
    const [toast, setToast] = useState(null);

    // ── Live code + stats — always show fallback if API unavailable ──
    const { data: referralData, isLoading: codeLoading, refetch: retryFetch } = useQuery({
        queryKey: ['referral-my-code'],
        queryFn: async () => {
            try { return await referralService.getMyCode(); }
            catch { return null; } // silently fall back — never show an error
        },
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
        retry: 0, // no retries — fall back immediately
    });

    const referralCode = referralData?.code ?? generateFallbackCode();
    const referralLink = referralData?.link ?? `https://cliks.beta-softnet.com/join?ref=${referralCode}`;
    const stats = referralData?.stats ?? { referred: 0, converted: 0, pointsEarned: 0 };
    const codeError = false; // errors are swallowed — user always sees a valid link

    // ── Live notification history (poll every 15s) ────────────
    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['referral-history'],
        queryFn: referralService.getHistory,
        enabled: isOpen,
        staleTime: 0,
        refetchInterval: isOpen ? 15_000 : false,  // poll every 15 seconds
        retry: 2,
        onSuccess: (data) => {
            // Map history items to notification format, preserve read state
            const incoming = (data || []).map(h => ({
                id:   h.id,
                type: h.status === 'logged_in' ? 'login' : 'signup',
                name: h.name || h.referredUserName || 'Someone',
                time: h.date || h.createdAt || 'Just now',
                read: false,
            }));
            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                // Preserve read state for existing, mark new ones unread
                const merged = incoming.map(n => ({
                    ...n,
                    read: existingIds.has(n.id) ? (prev.find(p => p.id === n.id)?.read ?? false) : false,
                }));

                // Detect brand-new notifications → ring bell + show toast
                const newOnes = merged.filter(n => !existingIds.has(n.id));
                if (newOnes.length > 0 && prevNotifCountRef.current > 0) {
                    setBellRinging(true);
                    setTimeout(() => setBellRinging(false), 1000);
                    const latest = newOnes[0];
                    setToast({
                        type: latest.type,
                        name: latest.name,
                        msg: latest.type === 'signup'
                            ? `${latest.name} signed up using your link! 500 pts pending.`
                            : `${latest.name} logged in! 500 pts credited to your wallet.`,
                    });
                    setTimeout(() => setToast(null), 4500);
                }
                prevNotifCountRef.current = merged.length;
                return merged;
            });
        },
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = useCallback(() => {
        setNotifications(n => n.map(x => ({ ...x, read: true })));
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setCopied(false); setShareError(''); setShowNotifPanel(false);
            setActiveTab('refer'); setToast(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const copyToClipboard = useCallback(async () => {
        try { await navigator.clipboard.writeText(referralLink); }
        catch {
            const el = document.createElement('textarea');
            el.value = referralLink; el.style.position = 'fixed'; el.style.opacity = '0';
            document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
        }
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    }, [referralLink]);

    const nativeShare = useCallback(async () => {
        setShareError('');
        if (navigator.share) {
            try { await navigator.share({ title: 'Join Cliks', text: 'Join Cliks using my invite link!', url: referralLink }); }
            catch (err) { if (err.name !== 'AbortError') copyToClipboard(); }
        } else { copyToClipboard(); }
    }, [referralLink, copyToClipboard]);

    const shareUrl = useCallback((platform) => {
        setShareError('');
        const text = `Join Cliks — smart finance management! Use my invite: ${referralLink}`;
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
        };
        const popup = window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=500');
        if (!popup) setShareError('Pop-up blocked. Please allow pop-ups and try again.');
    }, [referralLink]);

    return (
        <AnimatePresence>
            {isOpen && (
                <Motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1.5rem', fontFamily: "'Inter', sans-serif" }}
                    onClick={onClose} role="dialog" aria-modal="true" aria-label="Refer & Earn"
                >
                    {/* ── Real-time toast ── */}
                    <AnimatePresence>
                        {toast && (
                            <Motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                style={{
                                    position: 'fixed', top: '1.25rem', right: '1.25rem',
                                    background: '#fff', borderRadius: '16px', padding: '1rem 1.25rem',
                                    boxShadow: '0 10px 32px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0',
                                    zIndex: 3000, maxWidth: '280px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                }}
                            >
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: toast.type === 'signup' ? '#DCFCE7' : '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {toast.type === 'signup' ? <UserCheck size={16} color="#059669" /> : <LogIn size={16} color="#3B82F6" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B', marginBottom: 3 }}>
                                        {toast.type === 'signup' ? 'Referral Successful!' : 'Referral Logged In!'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>{toast.msg}</div>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    <Motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{ background: '#FFFFFF', width: '100%', maxWidth: '500px', borderRadius: '32px', overflow: 'visible', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Top banner ── */}
                        <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)', padding: '1.75rem 2.5rem 2rem', borderRadius: '32px 32px 0 0', position: 'relative', color: '#fff', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '180px', height: '180px', background: 'rgba(20,184,166,0.3)', borderRadius: '50%', filter: 'blur(30px)' }} />

                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
                                {/* Bell with badge + ring animation */}
                                <div style={{ position: 'relative' }}>
                                    <Motion.button
                                        animate={bellRinging ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.5 }}
                                        onClick={() => { setShowNotifPanel(v => !v); if (showNotifPanel) markAllRead(); }}
                                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Bell size={17} />
                                    </Motion.button>
                                    {unreadCount > 0 && (
                                        <Motion.span
                                            animate={bellRinging ? { scale: [1, 1.4, 1] } : {}}
                                            transition={{ duration: 0.4 }}
                                            style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </Motion.span>
                                    )}
                                    <AnimatePresence>
                                        {showNotifPanel && (
                                            <NotificationPanel notifications={notifications} onMarkAllRead={markAllRead} />
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Tracking tab */}
                                <button onClick={() => setActiveTab(t => t === 'tracking' ? 'refer' : 'tracking')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', borderRadius: '999px', background: activeTab === 'tracking' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                                    <TrendingUp size={14} /> Tracking
                                </button>

                                {/* Close */}
                                <button onClick={onClose} aria-label="Close"
                                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Gift icon + title */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg,#FCD34D 0%,#F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 12px 24px rgba(245,158,11,0.3)' }}>
                                    <Gift size={30} />
                                </div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Refer &amp; Earn Premium</h2>
                                <p style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '450', lineHeight: 1.5, margin: 0 }}>
                                    Introduce associates to CLIKS. For every active initialization, collect{' '}
                                    <span style={{ color: '#FCD34D', fontWeight: '800' }}>500 Points</span> instantly!
                                </p>
                            </div>
                        </div>

                        {/* ── Tab content ── */}
                        <div style={{ borderRadius: '0 0 32px 32px', overflow: 'hidden' }}>
                            {activeTab === 'tracking' ? (
                                <TrackingView stats={stats} history={historyData} historyLoading={historyLoading} />
                            ) : (
                                <div style={{ padding: '2rem 2.5rem 2.25rem' }}>
                                    {shareError && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <AlertCircle size={16} style={{ flexShrink: 0 }} />{shareError}
                                        </div>
                                    )}
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Your Unique Referral Link</label>
                                    <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                                        {codeLoading ? (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}><Loader2 size={16} className="animate-spin" /><span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Generating your code…</span></div>
                                        ) : codeError ? (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 600 }}>Could not load your code.</span>
                                                <button onClick={() => retryFetch()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B6B3A', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.8rem' }}><RefreshCw size={14} /> Retry</button>
                                            </div>
                                        ) : (
                                            <input readOnly value={referralLink} aria-label="Your referral link" style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.9rem', fontWeight: '700', color: '#064E3B', outline: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} />
                                        )}
                                        <Motion.button whileTap={{ scale: 0.95 }} onClick={copyToClipboard} disabled={codeLoading || codeError}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', borderRadius: '12px', border: 'none', cursor: (codeLoading || codeError) ? 'not-allowed' : 'pointer', background: copied ? '#059669' : '#1F2937', color: 'white', fontWeight: '800', fontSize: '0.8rem', whiteSpace: 'nowrap', transition: 'background-color 0.2s', opacity: (codeLoading || codeError) ? 0.5 : 1 }}>
                                            {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy URL</>}
                                        </Motion.button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
                                        {[
                                            { icon: Users,        bg: '#ECFDF5', color: '#059669', text: 'Friends join using your exclusive gateway link' },
                                            { icon: Coins,        bg: '#FFFBEB', color: '#D97706', text: 'Earn 500 points credited directly to wallet after they complete sign-up' },
                                            { icon: CheckCircle2, bg: '#EFF6FF', color: '#3B82F6', text: 'Redeem points for premium subscription cycles' },
                                        ].map(({ icon: Icon, bg, color, text }, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}><Icon size={15} /></div>
                                                <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '550' }}>{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#64748B' }}>Share Instantly:</span>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {[
                                                { key: 'share',    icon: Share2,   bg: '#F1F5F9', color: '#334155' },
                                                { key: 'twitter',  icon: Twitter,  bg: '#E0F2FE', color: '#0EA5E9' },
                                                { key: 'facebook', icon: Facebook, bg: '#EEF2FF', color: '#4F46E5' },
                                                { key: 'linkedin', icon: Linkedin, bg: '#E0F2FE', color: '#0284C7' },
                                            ].map(sns => (
                                                <Motion.button key={sns.key} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} disabled={codeLoading}
                                                    onClick={() => sns.key === 'share' ? nativeShare() : shareUrl(sns.key)}
                                                    style={{ width: '42px', height: '42px', borderRadius: '14px', border: 'none', background: sns.bg, color: sns.color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: codeLoading ? 'not-allowed' : 'pointer', opacity: codeLoading ? 0.5 : 1 }}>
                                                    <sns.icon size={18} />
                                                </Motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Motion.div>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReferralModal;
