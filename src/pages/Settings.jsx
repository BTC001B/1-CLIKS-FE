import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services';
import { Toggle } from '../components/ui/toggle';
import {
    Save, User, Settings2, Shield, Bell, Palette,
    CreditCard, Zap, Terminal, ChevronLeft, Upload,
    Check, RefreshCw, Download, UploadCloud, Code2,
    Globe, Lock, Smartphone, Mail, AlertCircle
} from 'lucide-react';

/* ─── Dark mode helper ─────────────────────────────────────────── */
const applyDarkMode = (isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('cliks_dark_mode', isDark ? 'true' : 'false');
};

/* ─── Shared style helpers ─────────────────────────────────────── */
const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.875rem',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1E293B',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.4rem',
};

const sectionTitle = {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#1E293B',
    marginBottom: '1.25rem',
    paddingBottom: '0.625rem',
    borderBottom: '1px solid #F1F5F9',
};

const card = {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '1.75rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const ToggleRow = ({ label, description, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #F8FAFC' }}>
        <div>
            <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{label}</div>
            {description && <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>{description}</div>}
        </div>
        <Toggle checked={checked} onChange={onChange} size="md" />
    </div>
);

const Field = ({ label, children }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
);

/* ─── Tab definitions ──────────────────────────────────────────── */
const TABS = [
    { id: 'profile',       label: 'Profile',       icon: User },
    { id: 'general',       label: 'General',       icon: Settings2 },
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
    { id: 'billing',       label: 'Billing',       icon: CreditCard },
    { id: 'integrations',  label: 'Integrations',  icon: Zap },
    { id: 'advanced',      label: 'Advanced',      icon: Terminal },
];

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const Settings = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('profile');
    const [successMsg, setSuccessMsg] = useState('');
    const avatarInputRef = useRef(null);

    /* ── Toggles / booleans ── */
    const [toggles, setToggles] = useState({
        darkMode:       localStorage.getItem('cliks_dark_mode') === 'true',
        twoFactor:      true,
        notifications:  true,
        emailDigest:    false,
        pushNotif:      true,
        smsNotif:       false,
        weeklyReports:  true,
        compactMode:    false,
        developerMode:  false,
        emailNotif:     true,
    });

    /* ── Text / select fields ── */
    const [profile, setProfile] = useState({
        fullName: '', businessName: '', email: '', phone: '',
        gstNumber: '', website: '', address: '', city: '',
        state: '', country: 'India', postalCode: '',
        businessCategory: '', businessType: '',
    });
    const [general, setGeneral] = useState({
        appName: 'CLIKS Business', currency: 'INR', timezone: 'Asia/Kolkata',
        language: 'English (US)', dateFormat: 'DD/MM/YYYY', numberFormat: '1,00,000.00',
    });
    const [security, setSecurity] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '', sessionTimeout: '30',
    });
    const [accentColor, setAccentColor] = useState('#1B6B3A');
    const [fontSize, setFontSize] = useState('medium');
    const [apiKey, setApiKey] = useState('sk-••••••••••••••••••••••••••••');
    const [avatarPreview, setAvatarPreview] = useState(null);

    /* ── API query / mutation ── */
    const { isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        onSuccess: (data) => {
            if (data?.settings) {
                const s = data.settings;
                setToggles(prev => ({ ...prev, ...s }));
                if (s.darkMode !== undefined) applyDarkMode(s.darkMode);
            }
        },
    });

    const mutation = useMutation({
        mutationFn: (data) => settingsService.updateSettings({ settings: data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setSuccessMsg('Settings saved successfully.');
            setTimeout(() => setSuccessMsg(''), 3500);
        },
    });

    const handleToggle = (key) => {
        setToggles(prev => {
            const next = { ...prev, [key]: !prev[key] };
            if (key === 'darkMode') applyDarkMode(next.darkMode);
            return next;
        });
    };

    const handleSave = () => {
        applyDarkMode(toggles.darkMode);
        mutation.mutate({ ...toggles, ...general });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#1B6B3A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    /* ══════════ TAB CONTENT ══════════ */

    const renderProfile = () => (
        <>
            {/* Avatar upload */}
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        onClick={() => avatarInputRef.current?.click()}
                        style={{
                            width: 96, height: 96, borderRadius: '50%',
                            border: '2px dashed #CBD5E1',
                            background: avatarPreview ? `url(${avatarPreview}) center/cover` : '#F8FAFC',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', overflow: 'hidden',
                        }}
                    >
                        {!avatarPreview && <><Upload size={20} color="#94A3B8" /><span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: 4 }}>Upload</span></>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Profile Image</span>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>
                <div>
                    <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '1rem' }}>Upload Profile Image</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 4 }}>JPG, PNG or GIF · Max 2MB</div>
                </div>
            </div>

            {/* Profile fields */}
            <div style={card}>
                <div style={sectionTitle}>Profile Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {[
                        ['fullName', 'Full Name', 'text'],
                        ['businessName', 'Business Name', 'text'],
                        ['email', 'Email Address', 'email'],
                        ['phone', 'Phone Number', 'tel'],
                        ['gstNumber', 'GST Number', 'text'],
                        ['website', 'Website', 'url'],
                        ['address', 'Company Address', 'text'],
                        ['city', 'City', 'text'],
                        ['state', 'State', 'text'],
                        ['country', 'Country', 'text'],
                        ['postalCode', 'Postal Code', 'text'],
                        ['businessCategory', 'Business Category', 'text'],
                        ['businessType', 'Business Type', 'text'],
                    ].map(([key, lbl, type]) => (
                        <Field key={key} label={lbl}>
                            <input
                                type={type}
                                style={inputStyle}
                                value={profile[key]}
                                onChange={e => setProfile(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={lbl}
                            />
                        </Field>
                    ))}
                </div>
            </div>
        </>
    );

    const renderGeneral = () => (
        <div style={card}>
            <div style={sectionTitle}>Application Settings</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <Field label="Application Name">
                    <input style={inputStyle} value={general.appName} onChange={e => setGeneral(p => ({ ...p, appName: e.target.value }))} />
                </Field>
                <Field label="Default Currency">
                    <select style={selectStyle} value={general.currency} onChange={e => setGeneral(p => ({ ...p, currency: e.target.value }))}>
                        <option value="INR">INR — Indian Rupee</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                    </select>
                </Field>
                <Field label="Timezone">
                    <select style={selectStyle} value={general.timezone} onChange={e => setGeneral(p => ({ ...p, timezone: e.target.value }))}>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                </Field>
                <Field label="Language">
                    <select style={selectStyle} value={general.language} onChange={e => setGeneral(p => ({ ...p, language: e.target.value }))}>
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Hindi</option>
                        <option>Tamil</option>
                    </select>
                </Field>
                <Field label="Date Format">
                    <select style={selectStyle} value={general.dateFormat} onChange={e => setGeneral(p => ({ ...p, dateFormat: e.target.value }))}>
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                    </select>
                </Field>
                <Field label="Number Format">
                    <select style={selectStyle} value={general.numberFormat} onChange={e => setGeneral(p => ({ ...p, numberFormat: e.target.value }))}>
                        <option>1,00,000.00</option>
                        <option>100,000.00</option>
                        <option>1.00.000,00</option>
                    </select>
                </Field>
            </div>
        </div>
    );

    const renderSecurity = () => (
        <div style={card}>
            <div style={sectionTitle}>Security Settings</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <Field label="Current Password">
                    <input type="password" style={inputStyle} value={security.currentPassword}
                        onChange={e => setSecurity(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" />
                </Field>
                <Field label="New Password">
                    <input type="password" style={inputStyle} value={security.newPassword}
                        onChange={e => setSecurity(p => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" />
                </Field>
                <Field label="Confirm Password">
                    <input type="password" style={inputStyle} value={security.confirmPassword}
                        onChange={e => setSecurity(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
                </Field>
                <Field label="Session Timeout (minutes)">
                    <select style={selectStyle} value={security.sessionTimeout}
                        onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))}>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                    </select>
                </Field>
            </div>
            <ToggleRow label="Enable Two-Factor Authentication" description="Require a verification code on each login." checked={toggles.twoFactor} onChange={() => handleToggle('twoFactor')} />
        </div>
    );

    const renderNotifications = () => (
        <div style={card}>
            <div style={sectionTitle}>Notification Preferences</div>
            <ToggleRow label="Email Notifications" description="Receive important updates via email." checked={toggles.emailNotif} onChange={() => handleToggle('emailNotif')} />
            <ToggleRow label="Push Notifications" description="Receive real-time alerts in the browser." checked={toggles.pushNotif} onChange={() => handleToggle('pushNotif')} />
            <ToggleRow label="SMS Notifications" description="Receive critical alerts via SMS." checked={toggles.smsNotif} onChange={() => handleToggle('smsNotif')} />
            <ToggleRow label="Weekly Reports" description="Receive a weekly summary of your activity." checked={toggles.weeklyReports} onChange={() => handleToggle('weeklyReports')} />
            <ToggleRow label="Email Digest" description="Receive a daily digest of key metrics." checked={toggles.emailDigest} onChange={() => handleToggle('emailDigest')} />
        </div>
    );

    const renderAppearance = () => (
        <div style={card}>
            <div style={sectionTitle}>Appearance & Theme</div>
            <ToggleRow label="Dark Mode" description="Switch the application to a dark theme." checked={toggles.darkMode} onChange={() => handleToggle('darkMode')} />
            <ToggleRow label="Compact Mode" description="Reduce padding for a denser layout." checked={toggles.compactMode} onChange={() => handleToggle('compactMode')} />
            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <Field label="Accent Color">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                            style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', padding: 2 }} />
                        <input style={{ ...inputStyle, flex: 1 }} value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                    </div>
                </Field>
                <Field label="Font Size">
                    <select style={selectStyle} value={fontSize} onChange={e => setFontSize(e.target.value)}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </Field>
            </div>
        </div>
    );

    const renderBilling = () => (
        <div style={card}>
            <div style={sectionTitle}>Billing & Subscription</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    ['Current Plan', 'FIN-PRO Standard'],
                    ['Renewal Date', '01 May, 2027'],
                    ['Subscription Status', 'Active'],
                ].map(([lbl, val]) => (
                    <div key={lbl} style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{lbl}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{val}</div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => window.location.href = '/subscription'}
                style={{ padding: '0.7rem 1.75rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                Upgrade Plan
            </button>
        </div>
    );

    const renderIntegrations = () => (
        <div style={card}>
            <div style={sectionTitle}>Connected Integrations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { name: 'Google', desc: 'Sync with Google Workspace', connected: true },
                    { name: 'Microsoft', desc: 'Sync with Microsoft 365', connected: false },
                    { name: 'Slack', desc: 'Send notifications to Slack', connected: false },
                    { name: 'WhatsApp', desc: 'Send alerts via WhatsApp', connected: false },
                ].map(item => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{item.desc}</div>
                        </div>
                        <button style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: item.connected ? 'none' : '1px solid #E2E8F0', background: item.connected ? '#ECFDF5' : 'white', color: item.connected ? '#059669' : '#64748B', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                            {item.connected ? '✓ Connected' : 'Connect'}
                        </button>
                    </div>
                ))}
            </div>
            <Field label="API Key">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }} value={apiKey} readOnly />
                    <button onClick={() => navigator.clipboard?.writeText(apiKey)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Copy
                    </button>
                </div>
            </Field>
        </div>
    );

    const renderAdvanced = () => (
        <div style={card}>
            <div style={sectionTitle}>Advanced Configuration</div>
            <ToggleRow label="Developer Mode" description="Enable detailed error logs and debug tools." checked={toggles.developerMode} onChange={() => handleToggle('developerMode')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                {[
                    { icon: Download, label: 'Backup Settings', desc: 'Download a backup of your configuration.' },
                    { icon: UploadCloud, label: 'Restore Data', desc: 'Restore from a previous backup file.' },
                    { icon: Download, label: 'Export Settings', desc: 'Export settings as a JSON file.' },
                    { icon: UploadCloud, label: 'Import Settings', desc: 'Import settings from a JSON file.' },
                ].map(item => (
                    <button key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', cursor: 'pointer', textAlign: 'left' }}>
                        <item.icon size={18} color="#64748B" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.875rem' }}>{item.label}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{item.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const tabContent = {
        profile:       renderProfile(),
        general:       renderGeneral(),
        security:      renderSecurity(),
        notifications: renderNotifications(),
        appearance:    renderAppearance(),
        billing:       renderBilling(),
        integrations:  renderIntegrations(),
        advanced:      renderAdvanced(),
    };

    /* ══════════════ RENDER ══════════════ */
    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: 1100, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            {/* ── Page header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Settings</h1>
                    <p style={{ color: '#64748B', marginTop: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>
                        Manage your application preferences and system configuration.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.75rem',
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        fontWeight: 700, cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem', opacity: mutation.isPending ? 0.7 : 1,
                        boxShadow: '0 4px 12px rgba(27,107,58,0.25)',
                    }}
                >
                    <Save size={16} />
                    {mutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {/* ── Success banner ── */}
            {successMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.875rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    <Check size={16} style={{ flexShrink: 0 }} />
                    {successMsg}
                </div>
            )}

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', background: '#F1F5F9', borderRadius: '14px', padding: '0.35rem', marginBottom: '1.75rem' }}>
                {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.45rem',
                                padding: '0.55rem 1rem',
                                borderRadius: '10px', border: 'none',
                                background: active ? '#ffffff' : 'transparent',
                                color: active ? '#1B6B3A' : '#64748B',
                                fontWeight: active ? 700 : 600,
                                fontSize: '0.825rem',
                                cursor: 'pointer',
                                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab content ── */}
            {tabContent[activeTab]}
        </div>
    );
};

export default Settings;
