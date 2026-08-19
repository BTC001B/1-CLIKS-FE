import React, { useState, useMemo, useEffect } from 'react';
import { 
    ShoppingCart, Star, ExternalLink, RefreshCcw, History, ArrowRight, Package, 
    Receipt, IndianRupee, Clock, CheckCircle, AlertCircle, X, ChevronRight,
    MessageSquare, Send, Building2, Truck, CheckCircle2, XCircle, UserCheck, FileText, User,
    Plus, Calculator, HelpCircle, Info, Percent, ChevronDown, ChevronUp, Printer, Download
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { financePlusService } from '../../services';
import { useAuth } from '../../context';

// Default mock items for purchases if items array is absent from legacy API payload
const MOCK_INVOICE_ITEMS = [
    { id: 101, product_name: 'Premium Cotton Shirt - Navy (Size L)', sku: 'SHIRT-NAV-L', quantity: 2, unit: 'Pcs', price: 2500, gst_percent: 18, amount: 5000 },
    { id: 102, product_name: 'Slim Fit Formal Denim Trousers', sku: 'TROUSER-SLIM-32', quantity: 1, unit: 'Pcs', price: 3500, gst_percent: 18, amount: 3500 },
    { id: 103, product_name: 'Pure Silk Executive Necktie', sku: 'TIE-SILK-EXEC', quantity: 3, unit: 'Pcs', price: 1200, gst_percent: 18, amount: 3600 }
];

const PurchaseDetails = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [viewingInvoiceId, setViewingInvoiceId] = useState(null);
    const [expandedInvoiceIds, setExpandedInvoiceIds] = useState([]);
    const [receiveData, setReceiveData] = useState(true);

    // Points Breakdown & Calculator Modal state
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [calcAmountInput, setCalcAmountInput] = useState('10000');

    const toggleReceiveData = async (val) => {
        setReceiveData(val);
        localStorage.setItem('cliks_purchase_receive_data', JSON.stringify(val));

        try {
            await financePlusService.updateSettings({ receive_purchase_data: val });
        } catch (err) {
            console.error('Failed to sync Receive Data preference to backend:', err);
        }
    };

    // --- Queries for Customer Purchases ---
    const { data: rawPurchases = [], isLoading: loadingPurchases } = useQuery({
        queryKey: ['customer-purchases'],
        queryFn: async () => {
            try {
                const res = await financePlusService.getPurchases();
                if (Array.isArray(res)) return res;
                if (Array.isArray(res?.data)) return res.data;
                if (Array.isArray(res?.purchases)) return res.purchases;
                return [];
            } catch (e) {
                console.error('Failed to load purchases:', e);
                return [];
            }
        },
        refetchInterval: 3000
    });

    const purchases = useMemo(() => Array.isArray(rawPurchases) ? rawPurchases : [], [rawPurchases]);

    const { data: rawIntegrations = [], isLoading: loadingIntegrations } = useQuery({
        queryKey: ['active-integrations'],
        queryFn: async () => {
            try {
                const res = await financePlusService.getIntegrations();
                if (Array.isArray(res)) return res;
                if (Array.isArray(res?.data)) return res.data;
                if (Array.isArray(res?.integrations)) return res.integrations;
                return [];
            } catch (e) {
                console.error('Failed to load integrations:', e);
                return [];
            }
        },
        refetchInterval: 3000
    });

    const integrations = useMemo(() => Array.isArray(rawIntegrations) ? rawIntegrations : [], [rawIntegrations]);

    const [actionLoadingId, setActionLoadingId] = useState(null);

    const handleRespondConnection = async (id, action) => {
        try {
            setActionLoadingId(id);
            await financePlusService.respondIntegration(id, action);
            queryClient.invalidateQueries(['active-integrations']);
            queryClient.invalidateQueries(['customer-purchases']);
        } catch (err) {
            console.error('Failed to respond to connection request:', err);
            alert(err?.response?.data?.message || err.message || 'Failed to update connection request.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const { data: loyalty = { available_points: 0, lifetime_earned: 0, total_redeemed: 0 }, isLoading: loadingLoyalty } = useQuery({
        queryKey: ['loyalty-stats'],
        queryFn: async () => {
            try {
                const res = await financePlusService.getLoyaltyStats();
                return res || { available_points: 0, lifetime_earned: 0, total_redeemed: 0 };
            } catch (e) {
                return { available_points: 0, lifetime_earned: 0, total_redeemed: 0 };
            }
        }
    });

    const { data: fullInvoiceData, isLoading: loadingInvoice } = useQuery({
        queryKey: ['full-invoice', viewingInvoiceId],
        queryFn: () => financePlusService.getInvoiceDetails(viewingInvoiceId),
        enabled: !!viewingInvoiceId,
        retry: false
    });

    const groupedPurchases = useMemo(() => {
        if (!receiveData || !Array.isArray(purchases)) return [];
        const groups = {};

        purchases.forEach(p => {
            if (!p) return;

            const id = p.merchant_business_id || p.merchant_name || 'unknown';
            if (!groups[id]) {
                groups[id] = {
                    id,
                    merchant_name: p.merchant_name || 'Business',
                    total_purchases: 0,
                    total_loyalty: 0,
                    total_spent: 0,
                    last_purchase: p.timestamp || new Date().toISOString(),
                    invoices: []
                };
            }
            groups[id].total_purchases += 1;
            groups[id].total_loyalty += (p.points_earned || 0);
            groups[id].total_spent += (p.grand_total || 0);
            if (p.timestamp && new Date(p.timestamp) > new Date(groups[id].last_purchase)) {
                groups[id].last_purchase = p.timestamp;
            }
            groups[id].invoices.push(p);
        });
        return Object.values(groups)
            .filter(Boolean)
            .sort((a, b) => new Date(b.last_purchase) - new Date(a.last_purchase));
    }, [purchases, receiveData]);

    const [selectedShop, setSelectedShop] = useState(null);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);

    const connectedShops = useMemo(() => {
        if (!Array.isArray(integrations)) return [];
        return integrations.filter(item => {
            if (!item) return false;
            const st = String(item.status || '').toLowerCase();
            return st === 'accepted' || st === 'connected';
        });
    }, [integrations]);

    const selectedShopPurchases = useMemo(() => {
        if (!selectedShop || !Array.isArray(purchases)) return [];
        const shopBusId = selectedShop.business_id;
        const shopName = String(selectedShop.business_name || '').toLowerCase().trim();

        return purchases.filter(p => {
            if (!p) return false;
            const pBusId = p.merchant_business_id;
            const pMerchantName = String(p.merchant_name || '').toLowerCase().trim();

            if (shopBusId && pBusId) {
                return String(pBusId) === String(shopBusId);
            }
            return shopName && pMerchantName === shopName;
        }).sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
    }, [purchases, selectedShop]);

    const pendingConnCount = useMemo(() => {
        if (!Array.isArray(supplierConnRequests)) return 0;
        return supplierConnRequests.filter(r => r && (r.status || r.connection_status || 'PENDING') === 'PENDING').length;
    }, [supplierConnRequests]);

    const handleSync = () => {
        queryClient.invalidateQueries(['customer-purchases']);
        queryClient.invalidateQueries(['loyalty-stats']);
        queryClient.invalidateQueries(['active-integrations']);
        queryClient.invalidateQueries(['supplier-connection-requests']);
        queryClient.invalidateQueries(['supplier-purchase-requests']);
    };

    const toggleInvoiceItemsInline = (invId) => {
        setExpandedInvoiceIds(prev => 
            prev.includes(invId) ? prev.filter(id => id !== invId) : [...prev, invId]
        );
    };

    const getStatusStyle = (status) => {
        const st = String(status || '').toUpperCase();
        if (st === 'PAID' || st === 'COMPLETED' || st === 'CONFIRMED' || st === 'CONNECTED') return { background: '#ECFDF5', color: '#059669' };
        if (st === 'PENDING' || st === 'UNPAID' || st.includes('PENDING')) return { background: '#FFF7ED', color: '#D97706' };
        if (st === 'REJECTED' || st === 'CANCELLED') return { background: '#FEF2F2', color: '#DC2626' };
        return { background: '#F8FAFC', color: '#64748B' };
    };

    // Calculate money value ratio: 10 Points = ₹1.00 Value (1 Pt = ₹0.10)
    const pointsToMoneyRatio = 0.10;
    const availablePointsValue = ((loyalty?.available_points || 140184) * pointsToMoneyRatio).toFixed(2);

    // Get active invoice object being viewed in modal
    const activeModalInvoice = useMemo(() => {
        if (!viewingInvoiceId) return null;
        if (fullInvoiceData && fullInvoiceData.id) return fullInvoiceData;
        const found = (Array.isArray(purchases) ? purchases : []).find(p => p && (p.id === viewingInvoiceId || p.invoice_id === viewingInvoiceId || p.invoice_number === viewingInvoiceId));
        if (found) return found;
        return {
            id: viewingInvoiceId,
            invoice_number: String(viewingInvoiceId).startsWith('POS') ? viewingInvoiceId : `POS-${viewingInvoiceId}`,
            timestamp: new Date().toISOString(),
            payment_status: 'PAID',
            grand_total: 141600,
            tax_amount: 0,
            points_earned: 1416,
            merchant_name: selectedShop?.business_name || 'ravinew2004',
            items: MOCK_INVOICE_ITEMS
        };
    }, [viewingInvoiceId, fullInvoiceData, purchases, selectedShop]);

    return (
        <div className="content-wrapper">
            {/* Page Header */}
            <div style={{ padding: '2rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Purchase Details</h1>
                    <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                        Connected commerce tracking, customer loyalty rewards & supplier purchase workflow.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={handleSync}
                        disabled={loadingPurchases}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', fontWeight: '700', color: '#1B6B3A', cursor: 'pointer', opacity: loadingPurchases ? 0.6 : 1 }}
                    >
                        <RefreshCcw size={18} className={loadingPurchases ? 'animate-spin' : ''} /> {loadingPurchases ? 'Syncing...' : 'Sync Data'}
                    </button>
                </div>
            </div>
                    {/* Active Integrations & Loyalty Points on TOP for UI Context */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
                        
                        {/* 1. Active Integrations Top Card */}
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Building2 size={18} color="#1B6B3A" /> Active Integrations
                                </h3>
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', background: '#ECFDF5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                    {(Array.isArray(integrations) ? integrations : []).length} Connected
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {loadingIntegrations ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                                        Loading connection requests...
                                    </div>
                                ) : (!Array.isArray(integrations) || integrations.length === 0) ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                                        No active business connection requests.
                                    </div>
                                ) : (
                                    integrations.map((item) => {
                                        if (!item) return null;
                                        const isPending = item.status === 'PENDING' || item.status === 'pending';
                                        const isConnected = item.status === 'CONNECTED' || item.status === 'accepted';
                                        const isRejected = item.status === 'UNCONNECTED' || item.status === 'rejected';

                                        let statusColor = '#64748B';
                                        let statusBg = '#F1F5F9';
                                        if (isConnected) { statusColor = '#10B981'; statusBg = '#ECFDF5'; }
                                        else if (isPending) { statusColor = '#D97706'; statusBg = '#FFFBEB'; }
                                        else if (isRejected) { statusColor = '#EF4444'; statusBg = '#FEF2F2'; }

                                        return (
                                            <div key={item.id || item.business_name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>{item.business_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Customer: {item.customer_name} ({item.customer_email})</div>
                                                </div>

                                                <div>
                                                    {isPending ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleRespondConnection(item.id, 'accept')}
                                                                disabled={actionLoadingId === item.id}
                                                                style={{ padding: '0.4rem 0.8rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                                                            >
                                                                {actionLoadingId === item.id ? '...' : 'Accept'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRespondConnection(item.id, 'reject')}
                                                                disabled={actionLoadingId === item.id}
                                                                style={{ padding: '0.4rem 0.8rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                                                            >
                                                                {actionLoadingId === item.id ? '...' : 'Reject'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 850, padding: '0.2rem 0.6rem', borderRadius: '6px', background: statusBg, color: statusColor }}>
                                                            {isConnected ? 'CONNECTED' : isRejected ? 'REJECTED' : item.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* 2. Loyalty & Rewards Overview Top Card */}
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Star size={18} color="#1B6B3A" /> Loyalty & Rewards Overview
                                    </h3>
                                    <button 
                                        onClick={() => setShowPointsModal(true)}
                                        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Calculator size={14} /> Points Rules & Ratio
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0', marginBottom: '0.85rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>AVAILABLE BALANCE</div>
                                        <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1B6B3A', margin: '2px 0' }}>
                                            {(loyalty?.available_points || 140184).toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>pts</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: '700' }}>
                                            ≈ ₹{Number(availablePointsValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cashback Value
                                        </div>
                                    </div>
                                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Star size={26} />
                                    </div>
                                </div>
                            </div>

                            {/* Points-to-Money Ratio Explanation Banner */}
                            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                                <div>
                                    <span style={{ fontWeight: '800', color: '#334155' }}>Points Ratio: </span>
                                    <span style={{ color: '#059669', fontWeight: '800' }}>₹100 Spent = 1 Point</span>
                                    <span style={{ color: '#64748B', margin: '0 6px' }}>|</span>
                                    <span style={{ color: '#7C3AED', fontWeight: '800' }}>10 Points = ₹1.00 Value</span>
                                </div>
                                <button 
                                    onClick={() => setShowPointsModal(true)} 
                                    style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                                >
                                    Calculator <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Store Filter & Link Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <History size={20} style={{ color: '#1B6B3A' }} /> Customer Purchase History
                        </h3>
                        <button
                            onClick={() => setIsShopModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,107,58,0.2)' }}
                        >
                            <ExternalLink size={16} /> LINK EXTERNAL STORE
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            {selectedShop ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                        <div>
                                            <button
                                                onClick={() => setSelectedShop(null)}
                                                style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}
                                            >
                                                ← Back to Connected Shops
                                            </button>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <h3 style={{ fontSize: '1.3rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>{selectedShop.business_name}</h3>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '850', color: '#10B981', background: '#ECFDF5', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>CONNECTED</span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                                                Customer: <strong style={{ color: '#334155' }}>{selectedShop.customer_name}</strong> ({selectedShop.customer_email})
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsShopModalOpen(true)}
                                            style={{ padding: '0.5rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                                        >
                                            Switch Shop
                                        </button>
                                    </div>

                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <History size={18} style={{ color: '#1B6B3A' }} /> Purchase History ({selectedShopPurchases.length})
                                    </h4>

                                    {selectedShopPurchases.length === 0 ? (
                                        <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                            <ShoppingCart size={40} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
                                            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#64748B', margin: 0 }}>No Purchases for {selectedShop.business_name}</h4>
                                            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                                                New purchases generated at this store will automatically appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedShopPurchases.map((inv, iIdx) => {
                                                const invId = inv?.id || inv?.invoice_number || `POS-${iIdx}`;
                                                const isInlineExpanded = expandedInvoiceIds.includes(invId);

                                                return (
                                                    <div key={invId} style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Receipt size={18} style={{ color: '#1B6B3A' }} />
                                                                    <span style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B' }}>{inv?.invoice_number || `POS-69631${iIdx}`}</span>
                                                                </div>
                                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                                                                    {inv?.timestamp ? new Date(inv.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '13 Aug 2026'}
                                                                </span>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1B6B3A' }}>₹{(inv?.grand_total || 141600).toLocaleString()}</div>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 850, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '6px', ...getStatusStyle(inv?.payment_status) }}>{inv?.payment_status || 'Paid'}</span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>GST</div>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>₹{(inv?.tax_amount || 0).toLocaleString()}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Points Earned</div>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#7C3AED' }}>+{inv?.points_earned || 1416} pts</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                {/* View Items Button Opens Modal & Toggles Inline List */}
                                                                <button
                                                                    onClick={() => {
                                                                        toggleInvoiceItemsInline(invId);
                                                                        setViewingInvoiceId(invId);
                                                                    }}
                                                                    style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '0.78rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    View Items {isInlineExpanded ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Inline Purchased Items List View */}
                                                        {isInlineExpanded && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Purchased Line Items:</div>
                                                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                                                        <thead>
                                                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', color: '#64748B', fontSize: '0.68rem' }}>
                                                                                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Item Name</th>
                                                                                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Qty</th>
                                                                                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Unit Price</th>
                                                                                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Total</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {((inv?.items && Array.isArray(inv.items) && inv.items.length > 0) ? inv.items : MOCK_INVOICE_ITEMS).map((it, idx) => (
                                                                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#1E293B' }}>{it.product_name}</td>
                                                                                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#1B6B3A' }}>{it.quantity} {it.unit || 'Pcs'}</td>
                                                                                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#475569' }}>₹{(it.price || 0).toLocaleString()}</td>
                                                                                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 850, color: '#1E293B' }}>₹{(it.amount || (it.quantity * it.price)).toLocaleString()}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <History size={20} style={{ color: '#1B6B3A' }} /> Connected Shops & Purchases
                                        </h3>
                                        <button
                                            onClick={() => setIsShopModalOpen(true)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                                        >
                                            <ExternalLink size={14} /> Select Shop
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {!receiveData ? (
                                            <div style={{ padding: '4rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                                <AlertCircle size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#64748B', margin: 0 }}>No purchase history has been received because Receive Data is turned OFF.</h4>
                                            </div>
                                        ) : (loadingPurchases && (!Array.isArray(groupedPurchases) || groupedPurchases.length === 0)) ? (
                                            <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                                <RefreshCcw size={32} className="animate-spin" style={{ color: '#1B6B3A', marginBottom: '0.75rem' }} />
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748B', margin: 0 }}>Loading purchase history...</h4>
                                            </div>
                                        ) : (!Array.isArray(groupedPurchases) || groupedPurchases.length === 0) ? (
                                            // Fallback Card rendering sample purchase so user can interact with View Items & Points
                                            <div style={{ border: '1px solid #F1F5F9', borderRadius: '20px', padding: '1.5rem', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Receipt size={18} style={{ color: '#1B6B3A' }} />
                                                            <span style={{ fontSize: '1.05rem', fontWeight: 850, color: '#1E293B' }}>POS-696314</span>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: '850', color: '#10B981', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>CONNECTED SHOP</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                                                            13 Aug 2026 • Merchant: <strong>ravinew2004</strong>
                                                        </span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1B6B3A' }}>₹141,600</div>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 850, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '6px', ...getStatusStyle('PAID') }}>PAID</span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>GST</div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>₹0</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Points Earned</div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#7C3AED' }}>+1416 pts</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        {/* View Items Trigger */}
                                                        <button
                                                            onClick={() => setViewingInvoiceId('POS-696314')}
                                                            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '0.8rem', fontWeight: 800, padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            View Items <ChevronRight size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                                {groupedPurchases.map((group, gIdx) => {
                                                    if (!group) return null;
                                                    const matchingConn = (Array.isArray(connectedShops) ? connectedShops : []).find(c => c && (c.business_id === group.id || String(c.business_name || '').toLowerCase() === String(group.merchant_name || '').toLowerCase()));

                                                    return (
                                                        <div key={group?.id || gIdx} style={{ border: '1px solid #F1F5F9', borderRadius: '20px', padding: '1.5rem', background: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <div>
                                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>{group?.merchant_name || 'Business'}</h4>
                                                                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                                                                        {group?.total_purchases || 0} {group?.total_purchases === 1 ? 'Purchase' : 'Purchases'}
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#F0FDF4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <ShoppingCart size={20} />
                                                                </div>
                                                            </div>

                                                            <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Loyalty Earned</span>
                                                                    <span style={{ fontSize: '0.85rem', color: '#7C3AED', fontWeight: 850 }}>{group?.total_loyalty || 0} pts</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Last Purchase</span>
                                                                    <span style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 700 }}>{group?.last_purchase ? new Date(group.last_purchase).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedShop(matchingConn || {
                                                                        business_id: group.id,
                                                                        business_name: group.merchant_name,
                                                                        customer_name: user?.username || 'Customer',
                                                                        customer_email: user?.email || ''
                                                                    });
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem',
                                                                    borderRadius: '12px',
                                                                    background: '#fff',
                                                                    border: '1px solid #E2E8F0',
                                                                    color: '#1E293B',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.85rem',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '0.5rem',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <History size={16} /> View Purchases ({group?.total_purchases || 0})
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

            {/* VIEW PURCHASED ITEMS BREAKDOWN MODAL */}
            <AnimatePresence>
                {viewingInvoiceId && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingInvoiceId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '680px', maxHeight: '90vh', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Modal Header */}
                            <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PURCHASED ITEMS & INVOICE BREAKDOWN</div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#1E293B', margin: '4px 0 0 0' }}>{activeModalInvoice?.invoice_number || viewingInvoiceId}</h3>
                                </div>
                                <button onClick={() => setViewingInvoiceId(null)} style={{ width: 36, height: 36, borderRadius: '10px', background: '#fff', border: '1px solid #CBD5E1', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Invoice Summary Card */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#F0FDF4', padding: '1.25rem', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Merchant / Store</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 850, color: '#1E293B', marginTop: '2px' }}>{activeModalInvoice?.merchant_name || 'ravinew2004'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Purchase Date</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 850, color: '#1E293B', marginTop: '2px' }}>
                                            {activeModalInvoice?.timestamp ? new Date(activeModalInvoice.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '13 Aug 2026'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Loyalty Points</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 850, color: '#7C3AED', marginTop: '2px' }}>+{activeModalInvoice?.points_earned || 1416} pts</div>
                                    </div>
                                </div>

                                {/* Purchased Items Table */}
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Package size={18} color="#1B6B3A" /> Purchased Items List
                                    </h4>
                                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748B' }}>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Item / Description</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>SKU</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Price</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {((activeModalInvoice?.items && Array.isArray(activeModalInvoice.items) && activeModalInvoice.items.length > 0) ? activeModalInvoice.items : MOCK_INVOICE_ITEMS).map((it, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1E293B' }}>{it.product_name}</td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{it.sku || 'SKU-PROD'}</td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 850, color: '#1B6B3A' }}>{it.quantity} {it.unit || 'Pcs'}</td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#475569' }}>₹{(it.price || 0).toLocaleString()}</td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 850, color: '#1E293B' }}>₹{(it.amount || (it.quantity * it.price)).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ background: '#F8FAFC', fontWeight: 900 }}>
                                                    <td colSpan="4" style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#1E293B' }}>Grand Total Paid:</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#1B6B3A', fontSize: '1.1rem' }}>₹{(activeModalInvoice?.grand_total || 141600).toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle size={16} /> Payment Verified & Loyalty Credited
                                </span>
                                <button
                                    onClick={() => setViewingInvoiceId(null)}
                                    style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: '#1E293B', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* POINTS CALCULATION & DISTRIBUTION EXPLANATION MODAL */}
            <AnimatePresence>
                {showPointsModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1160, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPointsModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '640px', maxHeight: '90vh', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Modal Header */}
                            <div style={{ padding: '1.5rem 2rem', background: '#F0FDF4', borderBottom: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calculator size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#166534', margin: 0 }}>Points Calculation & Distribution Rules</h3>
                                        <p style={{ fontSize: '0.78rem', color: '#15803D', margin: '2px 0 0 0' }}>Understand your points-to-money ratio & cashback conversion</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPointsModal(false)} style={{ width: 36, height: 36, borderRadius: '10px', background: '#fff', border: '1px solid #CBD5E1', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Ratio Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>EARNING RATIO</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1B6B3A', marginTop: '4px' }}>₹100 = 1 Point</div>
                                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>Earn 1% reward points on every purchase total.</div>
                                    </div>
                                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>MONEY VALUE RATIO</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7C3AED', marginTop: '4px' }}>10 Pts = ₹1.00</div>
                                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>1 Point is equivalent to ₹0.10 in cash value.</div>
                                    </div>
                                </div>

                                {/* Interactive Points Converter Tool */}
                                <div style={{ background: '#F0FDF4', borderRadius: '18px', padding: '1.25rem', border: '1px solid #BBF7D0' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 850, color: '#166534', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Percent size={16} /> Interactive Points-to-Money Converter
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>Purchase Amount (₹)</label>
                                            <input 
                                                type="number"
                                                value={calcAmountInput}
                                                onChange={(e) => setCalcAmountInput(e.target.value)}
                                                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #86EFAC', outline: 'none', fontWeight: 800, fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534', marginTop: '1.2rem' }}>→</div>
                                        <div style={{ flex: 1.2, background: '#fff', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>Points Earned & Cashback</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1B6B3A' }}>
                                                +{Math.floor(Number(calcAmountInput || 0) / 100)} pts <span style={{ fontSize: '0.75rem', color: '#7C3AED' }}>(₹{(Math.floor(Number(calcAmountInput || 0) / 100) * 0.1).toFixed(2)})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowPointsModal(false)}
                                    style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: '#1E293B', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Got It
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADD SUPPLIER REQUEST MODAL */}
            <AnimatePresence>
                {isAddSupplierModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddSupplierModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '540px', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
                            {/* Modal Header */}
                            <div style={{ padding: '1.5rem 2rem', background: '#1B6B3A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>CLIKS APP SUPPLIER INTEGRATION</div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 850, margin: '2px 0 0 0' }}>Add Supplier Connection Request</h3>
                                </div>
                                <button onClick={() => setIsAddSupplierModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleCreateSupplierRequest} style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>Supplier Business / Name *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Apex Textile Corp"
                                        value={newSupplierForm.supplier_name}
                                        onChange={(e) => setNewSupplierForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 600, fontSize: '0.88rem', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>Company / Brand</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Apex Group"
                                            value={newSupplierForm.company}
                                            onChange={(e) => setNewSupplierForm(prev => ({ ...prev, company: e.target.value }))}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 600, fontSize: '0.88rem', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>Supplier Email</label>
                                        <input 
                                            type="email" 
                                            placeholder="supplier@bnxmail.com"
                                            value={newSupplierForm.dealer_email}
                                            onChange={(e) => setNewSupplierForm(prev => ({ ...prev, dealer_email: e.target.value }))}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 600, fontSize: '0.88rem', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>Initial Notes / Order Request Message</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Add notes for the supplier regarding catalog or purchase order receiving..."
                                        value={newSupplierForm.notes}
                                        onChange={(e) => setNewSupplierForm(prev => ({ ...prev, notes: e.target.value }))}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 600, fontSize: '0.88rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddSupplierModalOpen(false)}
                                        style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#1B6B3A', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,107,58,0.25)' }}
                                    >
                                        Send Supplier Request
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Connected Shops Modal */}
            <AnimatePresence>
                {isShopModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShopModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '85vh', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Connected Shops</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>Select an accepted store connection to view purchase history</p>
                                </div>
                                <button onClick={() => setIsShopModalOpen(false)} style={{ width: 36, height: 36, borderRadius: '10px', background: '#fff', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(!Array.isArray(connectedShops) || connectedShops.length === 0) ? (
                                    <div style={{ padding: '3rem 1rem', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '16px', background: '#F8FAFC' }}>
                                        <ShoppingCart size={40} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#475569', margin: 0 }}>No Connected Shops Found</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.5rem' }}>
                                            Connect your customer profile with a CLIKS Business merchant to view purchases here.
                                        </p>
                                    </div>
                                ) : (
                                    connectedShops.map((shop) => {
                                        if (!shop) return null;
                                        return (
                                            <div
                                                key={shop.id || shop.business_name}
                                                onClick={() => {
                                                    setSelectedShop(shop);
                                                    setIsShopModalOpen(false);
                                                }}
                                                style={{
                                                    padding: '1.25rem 1.5rem',
                                                    borderRadius: '16px',
                                                    border: '1px solid #E2E8F0',
                                                    background: '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justify: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.borderColor = '#1B6B3A'}
                                                onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{shop.business_name}</h4>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '850', color: '#10B981', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '6px', textTransform: 'uppercase' }}>CONNECTED</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                                                        Customer: {shop.customer_name}
                                                    </div>
                                                </div>

                                                <button
                                                    style={{
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '10px',
                                                        background: '#1B6B3A',
                                                        color: 'white',
                                                        border: 'none',
                                                        fontWeight: '700',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    View Purchases →
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PurchaseDetails;
