import React, { useState, useMemo, useEffect } from 'react';
import { 
    ShoppingCart, Star, ExternalLink, RefreshCcw, History, ArrowRight, Package, 
    Receipt, IndianRupee, Clock, CheckCircle, AlertCircle, X, ChevronRight,
    MessageSquare, Send, Building2, Truck, CheckCircle2, XCircle, UserCheck, FileText, User
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { financePlusService } from '../../services';
import { useAuth } from '../../context';

const PurchaseDetails = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [viewingInvoiceId, setViewingInvoiceId] = useState(null);
    const [receiveData, setReceiveData] = useState(true);

    // Active Tab state: 'customer' (Customer Purchases) vs 'supplier' (Supplier Portal & Requests)
    const [activeMainTab, setActiveMainTab] = useState('customer');

    // Supplier Portal States
    const [selectedSupplierPO, setSelectedSupplierPO] = useState(null);
    const [isConfirmingPO, setIsConfirmingPO] = useState(null);
    const [chatSupplier, setChatSupplier] = useState(null); // Supplier object for chat drawer
    const [chatInputMessage, setChatInputMessage] = useState('');
    const [isSendingChat, setIsSendingChat] = useState(false);

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
    const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
        queryKey: ['customer-purchases'],
        queryFn: financePlusService.getPurchases,
        refetchInterval: 3000
    });

    const { data: integrations = [], isLoading: loadingIntegrations } = useQuery({
        queryKey: ['active-integrations'],
        queryFn: async () => {
            try {
                const res = await financePlusService.getIntegrations();
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (e) {
                console.error('Failed to load integrations:', e);
                return [];
            }
        },
        refetchInterval: 3000
    });

    // --- Queries for Supplier Portal Workflow ---
    const { data: supplierConnRequests = [], isLoading: loadingSupplierConnRequests } = useQuery({
        queryKey: ['supplier-connection-requests'],
        queryFn: async () => {
            try {
                const res = await financePlusService.getSupplierConnectionRequests();
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (e) {
                console.error('Failed to load supplier connection requests:', e);
                return [];
            }
        },
        refetchInterval: 3000
    });

    const { data: supplierPurchaseOrders = [], isLoading: loadingSupplierPOs } = useQuery({
        queryKey: ['supplier-purchase-requests'],
        queryFn: async () => {
            try {
                const res = await financePlusService.getSupplierPurchaseRequests();
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (e) {
                console.error('Failed to load supplier purchase requests:', e);
                return [];
            }
        },
        refetchInterval: 3000
    });

    const { data: chatData = { supplier: null, messages: [] }, isLoading: loadingChat } = useQuery({
        queryKey: ['supplier-chat', chatSupplier?.id],
        queryFn: async () => {
            if (!chatSupplier?.id) return { supplier: null, messages: [] };
            try {
                const res = await financePlusService.getSupplierChatMessages(chatSupplier.id);
                return res?.data || res || { supplier: null, messages: [] };
            } catch (e) {
                console.error('Failed to load chat history:', e);
                return { supplier: null, messages: [] };
            }
        },
        enabled: !!chatSupplier?.id,
        refetchInterval: 2000
    });

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

    const handleRespondSupplierConnection = async (id, action) => {
        try {
            setActionLoadingId(id);
            await financePlusService.respondSupplierConnectionRequest(id, action);
            queryClient.invalidateQueries(['supplier-connection-requests']);
            queryClient.invalidateQueries(['supplier-purchase-requests']);
        } catch (err) {
            console.error('Failed to respond to supplier connection request:', err);
            alert(err?.response?.data?.message || err.message || 'Failed to update connection request.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleConfirmPurchaseOrder = async (poId) => {
        try {
            setIsConfirmingPO(poId);
            await financePlusService.confirmSupplierPurchaseOrder(poId);
            queryClient.invalidateQueries(['supplier-purchase-requests']);
            setSelectedSupplierPO(prev => prev ? { ...prev, order_status: 'CONFIRMED' } : null);
            alert('Purchase Order confirmed successfully!');
        } catch (err) {
            console.error('Failed to confirm purchase order:', err);
            alert(err?.response?.data?.message || err.message || 'Failed to confirm purchase order.');
        } finally {
            setIsConfirmingPO(null);
        }
    };

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInputMessage.trim() || !chatSupplier?.id) return;

        try {
            setIsSendingChat(true);
            await financePlusService.sendSupplierChatMessage(chatSupplier.id, {
                message: chatInputMessage.trim(),
                purchase_order_id: selectedSupplierPO?.id
            });
            setChatInputMessage('');
            queryClient.invalidateQueries(['supplier-chat', chatSupplier.id]);
        } catch (err) {
            console.error('Failed to send chat message:', err);
            alert(err?.response?.data?.message || err.message || 'Failed to send message.');
        } finally {
            setIsSendingChat(false);
        }
    };

    const { data: loyalty = { available_points: 0, lifetime_earned: 0, total_redeemed: 0 }, isLoading: loadingLoyalty } = useQuery({
        queryKey: ['loyalty-stats'],
        queryFn: financePlusService.getLoyaltyStats
    });

    const { data: fullInvoice, isLoading: loadingInvoice, error: invoiceError } = useQuery({
        queryKey: ['full-invoice', viewingInvoiceId],
        queryFn: () => financePlusService.getInvoiceDetails(viewingInvoiceId),
        enabled: !!viewingInvoiceId,
        retry: false
    });

    const groupedPurchases = useMemo(() => {
        if (!receiveData) return [];
        const groups = {};
        if (!Array.isArray(purchases)) return [];

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
            const st = String(item.status).toLowerCase();
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
        return supplierConnRequests.filter(r => (r.connection_status || 'PENDING') === 'PENDING').length;
    }, [supplierConnRequests]);

    const handleSync = () => {
        queryClient.invalidateQueries(['customer-purchases']);
        queryClient.invalidateQueries(['loyalty-stats']);
        queryClient.invalidateQueries(['active-integrations']);
        queryClient.invalidateQueries(['supplier-connection-requests']);
        queryClient.invalidateQueries(['supplier-purchase-requests']);
    };

    const getStatusStyle = (status) => {
        const st = String(status || '').toUpperCase();
        if (st === 'PAID' || st === 'COMPLETED' || st === 'CONFIRMED' || st === 'CONNECTED') return { bg: '#ECFDF5', text: '#059669' };
        if (st === 'PENDING' || st === 'UNPAID' || st.includes('PENDING')) return { bg: '#FFF7ED', text: '#D97706' };
        if (st === 'REJECTED' || st === 'CANCELLED') return { bg: '#FEF2F2', text: '#DC2626' };
        return { bg: '#F8FAFC', text: '#64748B' };
    };

    return (
        <div className="content-wrapper">
            {/* Header */}
            <div style={{ padding: '2rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Purchase Details</h1>
                    <p style={{ color: '#64748B', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                        Connected commerce tracking, customer loyalty, and supplier purchase workflow.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={handleSync}
                        disabled={loadingPurchases || loadingSupplierPOs}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', fontWeight: '700', color: '#1B6B3A', cursor: 'pointer', opacity: (loadingPurchases || loadingSupplierPOs) ? 0.6 : 1 }}
                    >
                        <RefreshCcw size={18} className={(loadingPurchases || loadingSupplierPOs) ? 'animate-spin' : ''} /> {(loadingPurchases || loadingSupplierPOs) ? 'Syncing...' : 'Sync Data'}
                    </button>
                </div>
            </div>

            {/* Top Tab Bar: Customer Purchases vs Supplier Portal */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveMainTab('customer')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderBottom: activeMainTab === 'customer' ? '3px solid #1B6B3A' : '3px solid transparent',
                        background: 'transparent',
                        color: activeMainTab === 'customer' ? '#1B6B3A' : '#64748B',
                        fontWeight: activeMainTab === 'customer' ? '800' : '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <ShoppingCart size={18} /> Customer Purchase History
                </button>
                <button
                    onClick={() => setActiveMainTab('supplier')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderBottom: activeMainTab === 'supplier' ? '3px solid #1B6B3A' : '3px solid transparent',
                        background: 'transparent',
                        color: activeMainTab === 'supplier' ? '#1B6B3A' : '#64748B',
                        fontWeight: activeMainTab === 'supplier' ? '800' : '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                >
                    <Truck size={18} /> Supplier Portal & Purchase Requests
                    {pendingConnCount > 0 && (
                        <span style={{
                            background: '#EF4444',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '900',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '12px',
                            marginLeft: '0.25rem'
                        }}>
                            {pendingConnCount} PENDING
                        </span>
                    )}
                </button>
            </div>

            {/* TAB 1: CUSTOMER PURCHASES */}
            {activeMainTab === 'customer' && (
                <>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setIsShopModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,107,58,0.2)' }}
                        >
                            <ExternalLink size={16} /> LINK EXTERNAL STORE
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
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
                                            {selectedShopPurchases.map((inv, iIdx) => (
                                                <div key={inv?.id || iIdx} style={{ border: '1px solid #F1F5F9', borderRadius: '16px', padding: '1.25rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Receipt size={18} style={{ color: '#1B6B3A' }} />
                                                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{inv?.invoice_number || 'N/A'}</span>
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                                                                {inv?.timestamp ? new Date(inv.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1B6B3A' }}>₹{(inv?.grand_total || 0).toLocaleString()}</div>
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
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#7C3AED' }}>+{inv?.points_earned || 0} pts</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <button
                                                                onClick={() => {
                                                                    const targetId = inv.invoice_id || inv.id;
                                                                    setViewingInvoiceId(targetId);
                                                                }}
                                                                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}
                                                            >
                                                                View Items <ChevronRight size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <History size={20} style={{ color: '#1B6B3A' }} /> Recent Purchases
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
                                        ) : (loadingPurchases && groupedPurchases.length === 0) ? (
                                            <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                                <RefreshCcw size={32} className="animate-spin" style={{ color: '#1B6B3A', marginBottom: '0.75rem' }} />
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748B', margin: 0 }}>Loading purchase history...</h4>
                                            </div>
                                        ) : groupedPurchases.length === 0 ? (
                                            <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                                <ShoppingCart size={40} style={{ color: '#CBD5E1', marginBottom: '1rem' }} />
                                                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#64748B', margin: 0 }}>No Purchases Found</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem', maxWidth: '320px', margin: '0.5rem auto' }}>
                                                    Select a connected shop to view purchase history & loyalty points.
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                                {groupedPurchases.map((group, gIdx) => {
                                                    const matchingConn = connectedShops.find(c => c.business_id === group.id || String(c.business_name).toLowerCase() === String(group.merchant_name).toLowerCase());

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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Active Integrations</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {loadingIntegrations ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                                            Loading connection requests...
                                        </div>
                                    ) : integrations.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                                            No active business connection requests.
                                        </div>
                                    ) : (
                                        integrations.map((item) => {
                                            const isPending = item.status === 'PENDING' || item.status === 'pending';
                                            const isConnected = item.status === 'CONNECTED' || item.status === 'accepted';
                                            const isRejected = item.status === 'UNCONNECTED' || item.status === 'rejected';

                                            let statusColor = '#64748B';
                                            let statusBg = '#F1F5F9';
                                            if (isConnected) { statusColor = '#10B981'; statusBg = '#ECFDF5'; }
                                            else if (isPending) { statusColor = '#D97706'; statusBg = '#FFFBEB'; }
                                            else if (isRejected) { statusColor = '#EF4444'; statusBg = '#FEF2F2'; }

                                            return (
                                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
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

                            <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Loyalty & Rewards Overview</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Available Balance</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1B6B3A' }}>{loyalty?.available_points || 0} pts</div>
                                        </div>
                                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Star size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TAB 2: SUPPLIER PORTAL & PURCHASE REQUESTS */}
            {activeMainTab === 'supplier' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* SECTION 1: SUPPLIER CONNECTION REQUESTS */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Building2 size={22} style={{ color: '#1B6B3A' }} /> Dealer Connection Requests
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                            When a dealer adds you as a supplier in Cliks Business, connection requests appear here. Accept the request to enable purchase order receiving.
                        </p>

                        {loadingSupplierConnRequests ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                                <RefreshCcw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#1B6B3A' }} />
                                Loading connection requests...
                            </div>
                        ) : supplierConnRequests.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                <UserCheck size={36} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#64748B', margin: 0 }}>No Connection Requests Received</h4>
                                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                                    When a Cliks Business dealer adds your supplier profile, your connection request will appear here.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                                {supplierConnRequests.map((req) => {
                                    const st = (req.connection_status || 'PENDING').toUpperCase();
                                    const isPending = st === 'PENDING';
                                    const isConnected = st === 'CONNECTED';
                                    const isRejected = st === 'REJECTED';

                                    return (
                                        <div key={req.id} style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>{req.dealer_business_name || req.dealer_name || 'Cliks Business'}</h4>
                                                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>From: {req.dealer_email || req.dealer_name}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: '900', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase', ...getStatusStyle(st) }}>
                                                        {st}
                                                    </span>
                                                </div>
                                                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                                                    <div>Supplier Record: <strong>{req.supplier_name}</strong></div>
                                                    {req.company && <div>Company: {req.company}</div>}
                                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>Requested: {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}</div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                {isPending ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleRespondSupplierConnection(req.id, 'accept')}
                                                            disabled={actionLoadingId === req.id}
                                                            style={{ flex: 1, padding: '0.55rem 1rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                                                        >
                                                            <CheckCircle2 size={16} /> {actionLoadingId === req.id ? 'Processing...' : 'Accept'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespondSupplierConnection(req.id, 'reject')}
                                                            disabled={actionLoadingId === req.id}
                                                            style={{ padding: '0.55rem 1rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </>
                                                ) : isConnected ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            <CheckCircle2 size={16} /> Connected to Dealer
                                                        </span>
                                                        <button
                                                            onClick={() => setChatSupplier(req)}
                                                            style={{ padding: '0.45rem 0.85rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <MessageSquare size={14} /> Chat
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: '700' }}>Connection Rejected</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: SUPPLIER DASHBOARD – PURCHASE REQUESTS */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <FileText size={22} style={{ color: '#1B6B3A' }} /> Purchase Requests ({supplierPurchaseOrders.length})
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
                                    Purchase orders received from connected dealers. Review requested products, quantities, and click Confirm.
                                </p>
                            </div>
                        </div>

                        {loadingSupplierPOs ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                                <RefreshCcw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#1B6B3A' }} />
                                Loading purchase requests...
                            </div>
                        ) : supplierPurchaseOrders.length === 0 ? (
                            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                                <Package size={44} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#64748B', margin: 0 }}>No Purchase Requests Received Yet</h4>
                                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem', maxWidth: '420px', margin: '0.5rem auto' }}>
                                    Ensure your connection request is accepted by the dealer. Once a connected dealer creates a purchase order, it will appear here instantly.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {supplierPurchaseOrders.map((po) => {
                                    const poStatus = (po.order_status || 'PENDING CONFIRMATION').toUpperCase();

                                    return (
                                        <div key={po.id} style={{ border: '1px solid #E2E8F0', borderRadius: '18px', padding: '1.25rem 1.5rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Receipt size={20} style={{ color: '#1B6B3A' }} />
                                                        <span style={{ fontSize: '1.1rem', fontWeight: 850, color: '#1E293B' }}>{po.purchase_number || `#PUR-${po.id}`}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                                                        Dealer: <strong style={{ color: '#334155' }}>{po.dealer_name}</strong>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: '4px' }}>
                                                        Order Date: {po.purchase_date ? new Date(po.purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                    </div>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 850, padding: '0.25rem 0.65rem', borderRadius: '6px', textTransform: 'uppercase', ...getStatusStyle(poStatus) }}>
                                                        {poStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Product Summary */}
                                            <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Products Requested:</div>
                                                {po.items && po.items.length > 0 ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                        {po.items.map((it, iKey) => (
                                                            <div key={iKey} style={{ background: '#fff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.82rem', fontWeight: '700', color: '#1E293B' }}>
                                                                {it.product_name} &nbsp;<span style={{ color: '#1B6B3A', fontWeight: 850 }}>{it.quantity} {it.unit || 'KG'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Item breakdown in details viewer</div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '0.85rem' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Total Order Amount: </span>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1B6B3A' }}>₹{(po.grand_total || 0).toLocaleString()}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                    {poStatus !== 'CONFIRMED' && poStatus !== 'COMPLETED' && (
                                                        <button
                                                            onClick={() => handleConfirmPurchaseOrder(po.id)}
                                                            disabled={isConfirmingPO === po.id}
                                                            style={{ padding: '0.5rem 1rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                                        >
                                                            <CheckCircle2 size={16} /> {isConfirmingPO === po.id ? 'Confirming...' : 'Confirm Order'}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => setSelectedSupplierPO(po)}
                                                        style={{ padding: '0.5rem 1rem', background: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                                    >
                                                        <FileText size={16} /> View Order Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 3 & 8: SUPPLIER ORDER DETAILS MODAL */}
            <AnimatePresence>
                {selectedSupplierPO && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSupplierPO(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '720px', maxHeight: '90vh', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Modal Header */}
                            <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1B6B3A', textTransform: 'uppercase' }}>Supplier Purchase Order Details</div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#1E293B', margin: '4px 0 0 0' }}>{selectedSupplierPO.purchase_number || `#PUR-${selectedSupplierPO.id}`}</h3>
                                </div>
                                <button onClick={() => setSelectedSupplierPO(null)} style={{ width: 36, height: 36, borderRadius: '10px', background: '#fff', border: '1px solid #CBD5E1', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Order Metadata Summary */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#F1F5F9', padding: '1.25rem', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Dealer Name</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 850, color: '#1E293B', marginTop: '2px' }}>{selectedSupplierPO.dealer_name}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Order Date</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 850, color: '#1E293B', marginTop: '2px' }}>
                                            {selectedSupplierPO.purchase_date ? new Date(selectedSupplierPO.purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 850, padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px', ...getStatusStyle(selectedSupplierPO.order_status) }}>
                                            {selectedSupplierPO.order_status || 'PENDING CONFIRMATION'}
                                        </span>
                                    </div>
                                </div>

                                {/* Items Breakdown Table */}
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem' }}>Ordered Products & Quantities</h4>
                                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748B' }}>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Product</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Quantity</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Unit</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Price</th>
                                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedSupplierPO.items && selectedSupplierPO.items.length > 0 ? (
                                                    selectedSupplierPO.items.map((it, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                            <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1E293B' }}>{it.product_name}</td>
                                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 850, color: '#1B6B3A' }}>{it.quantity}</td>
                                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>{it.unit || 'KG'}</td>
                                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#475569' }}>₹{(it.price || 0).toLocaleString()}</td>
                                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 850, color: '#1E293B' }}>₹{(it.amount || (it.quantity * (it.price || 0))).toLocaleString()}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No line items recorded</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ background: '#F8FAFC', fontWeight: 900 }}>
                                                    <td colSpan="4" style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#1E293B' }}>Total Amount:</td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#1B6B3A', fontSize: '1.05rem' }}>₹{(selectedSupplierPO.grand_total || 0).toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    onClick={() => {
                                        setChatSupplier({
                                            id: selectedSupplierPO.supplier_id || selectedSupplierPO.dealer_id,
                                            dealer_business_name: selectedSupplierPO.dealer_name,
                                            dealer_name: selectedSupplierPO.dealer_name
                                        });
                                    }}
                                    style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', background: '#fff', border: '1px solid #CBD5E1', color: '#1E293B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <MessageSquare size={16} /> Chat with Dealer
                                </button>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {(selectedSupplierPO.order_status || '').toUpperCase() !== 'CONFIRMED' && (selectedSupplierPO.order_status || '').toUpperCase() !== 'COMPLETED' && (
                                        <button
                                            onClick={() => handleConfirmPurchaseOrder(selectedSupplierPO.id)}
                                            disabled={isConfirmingPO === selectedSupplierPO.id}
                                            style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: '#10B981', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <CheckCircle2 size={18} /> {isConfirmingPO === selectedSupplierPO.id ? 'Confirming...' : 'Confirm Order'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedSupplierPO(null)}
                                        style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: '#1E293B', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SECTION 5: DEALER ↔ SUPPLIER PRIVATE CHAT DRAWER */}
            <AnimatePresence>
                {chatSupplier && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', justifyContent: 'flex-end' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChatSupplier(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)' }} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '100%', background: '#fff', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
                            {/* Chat Header */}
                            <div style={{ padding: '1.25rem 1.5rem', background: '#1B6B3A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>Private Order Chat</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 850, margin: '2px 0 0 0' }}>{chatSupplier.dealer_business_name || chatSupplier.dealer_name || chatSupplier.supplier_name || 'Dealer'}</h3>
                                </div>
                                <button onClick={() => setChatSupplier(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                            </div>

                            {/* Chat Message List */}
                            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {loadingChat ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>Loading messages...</div>
                                ) : (!chatData?.messages || chatData.messages.length === 0) ? (
                                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
                                        <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                        <p style={{ fontSize: '0.85rem', margin: 0 }}>No messages yet. Send a message to start communicating with the dealer.</p>
                                    </div>
                                ) : (
                                    chatData.messages.map((msg) => {
                                        const isMe = msg.sender_id === user?.id || msg.sender_role === 'supplier';

                                        return (
                                            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                                                    {isMe ? 'You (Supplier)' : (msg.sender_name || 'Dealer')}
                                                </div>
                                                <div style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                                    background: isMe ? '#1B6B3A' : '#fff',
                                                    color: isMe ? '#fff' : '#1E293B',
                                                    border: isMe ? 'none' : '1px solid #E2E8F0',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                                                }}>
                                                    {msg.message}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '2px', textAlign: isMe ? 'right' : 'left' }}>
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendChatMessage} style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Type purchase message..."
                                    value={chatInputMessage}
                                    onChange={(e) => setChatInputMessage(e.target.value)}
                                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                                />
                                <button
                                    type="submit"
                                    disabled={isSendingChat || !chatInputMessage.trim()}
                                    style={{ padding: '0.75rem 1.25rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: (!chatInputMessage.trim() || isSendingChat) ? 0.6 : 1 }}
                                >
                                    <Send size={16} />
                                </button>
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
                                {connectedShops.length === 0 ? (
                                    <div style={{ padding: '3rem 1rem', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '16px', background: '#F8FAFC' }}>
                                        <ShoppingCart size={40} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
                                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#475569', margin: 0 }}>No Connected Shops Found</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.5rem' }}>
                                            Connect your customer profile with a CLIKS Business merchant to view purchases here.
                                        </p>
                                    </div>
                                ) : (
                                    connectedShops.map((shop) => (
                                        <div
                                            key={shop.id}
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
                                                justifyContent: 'space-between',
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
                                    ))
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
