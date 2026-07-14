import React from 'react';
import { Settings, Save } from 'lucide-react';

const FinanceSettings = ({ settings = {}, onUpdateSettings }) => {
    const handleSettingChange = (key, val) => {
        onUpdateSettings({
            ...settings,
            [key]: val
        });
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem'
        }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} style={{ color: '#7C3AED' }} /> Finance Preferences
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem'
            }}>
                {/* 1. Currency Config */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Preferential Currency</label>
                    <select 
                        value={settings.currency || 'INR'}
                        onChange={e => handleSettingChange('currency', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                    </select>
                </div>

                {/* 2. Date Format */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Preferred Date Format</label>
                    <select 
                        value={settings.dateFormat || 'DD MMM YYYY'}
                        onChange={e => handleSettingChange('dateFormat', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="DD MMM YYYY">DD MMM YYYY (e.g. 24 Jun 2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-06-24)</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 24-06-2026)</option>
                    </select>
                </div>

                {/* 3. Visual Theme */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Theme Mode</label>
                    <select 
                        value={settings.theme || 'Default Slate'}
                        onChange={e => handleSettingChange('theme', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="Default Slate">Default Slate</option>
                        <option value="Premium Emerald">Premium Emerald</option>
                        <option value="Executive Violet">Executive Violet</option>
                    </select>
                </div>

                {/* 4. Export Preferences */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Preferred Export Type</label>
                    <select 
                        value={settings.exportFormat || 'CSV'}
                        onChange={e => handleSettingChange('exportFormat', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="CSV">Comma Separated Values (.csv)</option>
                        <option value="XLS">Excel Sheet (.xls)</option>
                    </select>
                </div>
            </div>
            
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Save size={13} /> Settings saved dynamically
                </span>
            </div>
        </div>
    );
};

export default FinanceSettings;
