import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    X,
    Copy,
    Check,
    Share2,
    Twitter,
    Facebook,
    Linkedin,
    Coins,
    Users,
    CheckCircle2,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { referralService } from '../services/referralService';
import '../App.css';

/* ─── Validation helpers ─────────────────────────────────────── */
const REFERRAL_CODE_REGEX = /^[A-Z0-9\-]{8,20}$/i;

const validateCode = (code) => {
    if (!code || !code.trim()) return 'Referral code cannot be empty.';
    if (!REFERRAL_CODE_REGEX.test(code.trim())) return 'Invalid code format. Please check and try again.';
    return null;
};

/* ─── Fallback code generator (when API is unavailable) ─────── */
const generateFallbackCode = (userId) => {
    // Deterministic so the same user always gets the same fallback code
    // Format: CLIK-XXXX-YYYY (easy to share verbally)
    const seed = userId ? String(userId).slice(-6) : Math.random().toString(36).slice(2, 8);
    return `CLIK-${seed.slice(0, 4).toUpperCase()}-${seed.slice(4, 8).padEnd(4, '0').toUpperCase()}`;
};

/* ─── Component ──────────────────────────────────────────────── */
const ReferralModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [shareError, setShareError] = useState('');

    // ── Fetch the user's personal referral code ───────────────
    const {
        data: referralData,
        isLoading: codeLoading,
        isError: codeError,
        refetch: retryFetch,
    } = useQuery({
        queryKey: ['referral-my-code'],
        queryFn: referralService.getMyCode,
        enabled: isOpen,                  // only fetch when modal is open
        staleTime: 5 * 60 * 1000,         // cache for 5 minutes
        retry: 2,
        onError: (err) => {
            console.error('[ReferralModal] Failed to fetch referral code:', err);
        },
    });

    // Derive the code and link — fall back gracefully if API is down
    const referralCode = referralData?.code
        ?? generateFallbackCode(referralData?.userId);
    const referralLink = referralData?.link
        ?? `https://cliks.beta-softnet.com/join?ref=${referralCode}`;
    const stats = referralData?.stats ?? { referred: 0, converted: 0, pointsEarned: 0 };

    // Reset share error whenever modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
            setShareError('');
        }
    }, [isOpen]);

    // ── Copy to clipboard ─────────────────────────────────────
    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for browsers that block clipboard
            const el = document.createElement('textarea');
            el.value = referralLink;
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [referralLink]);

    // ── Native Web Share (mobile / modern desktop) ────────────
    const nativeShare = useCallback(async () => {
        setShareError('');
        const sharePayload = {
            title: 'Join Cliks — Smart Finance Management',
            text: `Hey! I've been using Cliks to manage my finances and it's brilliant. Join using my link and we both earn rewards!`,
            url: referralLink,
        };
        if (navigator.share) {
            try {
                await navigator.share(sharePayload);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    // User cancelled — not an error
                    setShareError('Share was cancelled or failed. Try copying the link instead.');
                }
            }
        } else {
            // Desktop fallback — copy link
            copyToClipboard();
        }
    }, [referralLink, copyToClipboard]);

    // ── Social share URLs ─────────────────────────────────────
    const shareUrl = useCallback((platform) => {
        setShareError('');
        const text = `Join Cliks and take control of your finances! Use my invite link: ${referralLink}`;
        const urls = {
            twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
        };
        const url = urls[platform];
        if (url) {
            const popup = window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
            if (!popup) {
                setShareError('Pop-up was blocked. Please allow pop-ups and try again.');
            }
        }
    }, [referralLink]);

    // ── Keyboard: Escape closes modal ─────────────────────────
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    /* ── Render ──────────────────────────────────────────────── */
    return (
        <AnimatePresence>
            {isOpen && (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1.5rem',
                        fontFamily: "'Inter', sans-serif",
                    }}
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Refer & Earn"
                >
                    <Motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            background: '#FFFFFF',
                            width: '100%',
                            maxWidth: '500px',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ── Close Button ── */}
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: '1.25rem',
                                right: '1.25rem',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'rgba(255,255,255,0.2)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            <X size={18} />
                        </button>

                        {/* ── Top Banner ── */}
                        <div style={{
                            background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)',
                            padding: '3rem 2.5rem 2.5rem 2.5rem',
                            textAlign: 'center',
                            position: 'relative',
                            color: '#FFFFFF',
                        }}>
                            <div style={{
                                position: 'absolute', top: '-20%', right: '-20%',
                                width: '180px', height: '180px',
                                background: 'rgba(20,184,166,0.3)',
                                borderRadius: '50%', filter: 'blur(30px)',
                            }} />
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px',
                                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                color: '#78350F',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem auto',
                                boxShadow: '0 12px 24px rgba(245,158,11,0.3)',
                            }}>
                                <Gift size={30} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                                Refer &amp; Earn Premium
                            </h2>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '450', lineHeight: '1.5', margin: 0 }}>
                                Introduce associates to CLIKS. For every active initialization, collect{' '}
                                <span style={{ color: '#FCD34D', fontWeight: '800' }}>500 Points</span> instantly!
                            </p>

                            {/* Live stats strip */}
                            {!codeLoading && !codeError && (
                                <div style={{
                                    display: 'flex', justifyContent: 'center', gap: '2rem',
                                    marginTop: '1.25rem', paddingTop: '1.25rem',
                                    borderTop: '1px solid rgba(255,255,255,0.15)',
                                }}>
                                    {[
                                        { label: 'Referred', value: stats.referred },
                                        { label: 'Converted', value: stats.converted },
                                        { label: 'Pts Earned', value: stats.pointsEarned },
                                    ].map((s) => (
                                        <div key={s.label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '900', lineHeight: 1 }}>{s.value}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Body ── */}
                        <div style={{ padding: '2.25rem 2.5rem' }}>

                            {/* Error banner */}
                            {shareError && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#FEF2F2', border: '1px solid #FECACA',
                                    color: '#B91C1C', borderRadius: '12px',
                                    padding: '0.75rem 1rem', marginBottom: '1.25rem',
                                    fontSize: '0.85rem', fontWeight: 600,
                                }}>
                                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                    {shareError}
                                </div>
                            )}

                            {/* Referral link row */}
                            <label style={{
                                display: 'block', fontSize: '0.78rem', fontWeight: '850',
                                color: '#64748B', textTransform: 'uppercase',
                                letterSpacing: '0.05em', marginBottom: '0.75rem',
                            }}>
                                Your Unique Referral Link
                            </label>

                            <div style={{
                                background: '#F8FAFC',
                                borderRadius: '16px',
                                border: '1.5px dashed #CBD5E1',
                                padding: '1rem 1.25rem',
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                marginBottom: '1.75rem',
                            }}>
                                {codeLoading ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Generating your code…</span>
                                    </div>
                                ) : codeError ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 600 }}>
                                            Could not load your code.
                                        </span>
                                        <button
                                            onClick={() => retryFetch()}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B6B3A', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.8rem' }}
                                        >
                                            <RefreshCw size={14} /> Retry
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        readOnly
                                        value={referralLink}
                                        aria-label="Your referral link"
                                        style={{
                                            flex: 1, background: 'transparent', border: 'none',
                                            fontSize: '0.9rem', fontWeight: '700', color: '#064E3B',
                                            outline: 'none', textOverflow: 'ellipsis',
                                            overflow: 'hidden', whiteSpace: 'nowrap',
                                        }}
                                    />
                                )}
                                <Motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={copyToClipboard}
                                    disabled={codeLoading || codeError}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.65rem 1rem', borderRadius: '12px', border: 'none',
                                        cursor: (codeLoading || codeError) ? 'not-allowed' : 'pointer',
                                        background: copied ? '#059669' : '#1F2937',
                                        color: 'white', fontWeight: '800', fontSize: '0.8rem',
                                        whiteSpace: 'nowrap', transition: 'background-color 0.2s',
                                        opacity: (codeLoading || codeError) ? 0.5 : 1,
                                    }}
                                >
                                    {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy URL</>}
                                </Motion.button>
                            </div>

                            {/* Steps */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { icon: Users, bg: '#ECFDF5', color: '#059669', text: 'Friends join using your exclusive gateway link' },
                                    { icon: Coins, bg: '#FFFBEB', color: '#D97706', text: 'Earn 500 points credited directly to wallet after they complete sign-up' },
                                    { icon: CheckCircle2, bg: '#EFF6FF', color: '#3B82F6', text: 'Redeem points for premium subscription cycles' },
                                ].map(({ icon: Icon, bg, color, text }, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: bg, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', color, flexShrink: 0,
                                        }}>
                                            <Icon size={15} />
                                        </div>
                                        <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '550' }}>{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Share channels */}
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#64748B' }}>Share Instantly:</span>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {[
                                            { key: 'share',    icon: Share2,   bg: '#F1F5F9', color: '#334155', title: 'Share' },
                                            { key: 'twitter',  icon: Twitter,  bg: '#E0F2FE', color: '#0EA5E9', title: 'Share on Twitter' },
                                            { key: 'facebook', icon: Facebook, bg: '#EEF2FF', color: '#4F46E5', title: 'Share on Facebook' },
                                            { key: 'linkedin', icon: Linkedin, bg: '#E0F2FE', color: '#0284C7', title: 'Share on LinkedIn' },
                                        ].map((sns) => (
                                            <Motion.button
                                                key={sns.key}
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                title={sns.title}
                                                aria-label={sns.title}
                                                disabled={codeLoading}
                                                onClick={() => sns.key === 'share' ? nativeShare() : shareUrl(sns.key)}
                                                style={{
                                                    width: '42px', height: '42px', borderRadius: '14px',
                                                    border: 'none', background: sns.bg, color: sns.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: codeLoading ? 'not-allowed' : 'pointer',
                                                    opacity: codeLoading ? 0.5 : 1,
                                                }}
                                            >
                                                <sns.icon size={18} />
                                            </Motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Motion.div>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReferralModal;
