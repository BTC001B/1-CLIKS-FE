import React, { useState } from 'react';
import { Home, Plus, Users, IndianRupee, MapPin, Receipt, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyManager = ({ properties = [], onAddProperty, onRecordRent, wallets = [], currencySymbol }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    property_name: '', address: '', tenant_name: '', monthly_rent: '',
    security_deposit: '', due_date: '', wallet_id: ''
  });

  const handleSave = () => {
    onAddProperty(formData);
    setShowModal(false);
    setFormData({ property_name: '', address: '', tenant_name: '', monthly_rent: '', security_deposit: '', due_date: '', wallet_id: '' });
  };

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={22} /></div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Property Manager</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Manage rental units and tenant cycles</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#D97706', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          + Add Property
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {properties.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1', color: '#94A3B8' }}>
            No properties managed yet.
          </div>
        ) : properties.map(p => (
          <div key={p.id} style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#D1FAE5', color: '#065F46' }}>{p.occupancy_status}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Due: {p.due_date}{p.due_date > 3 ? 'th' : 'st'}</span>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>{p.property_name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B', marginBottom: '1rem' }}>
              <MapPin size={12} /> {p.address}
            </div>

            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Users size={14} color="#64748B" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{p.tenant_name}</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669' }}>{currencySymbol}{Number(p.monthly_rent).toLocaleString()} /mo</div>
            </div>

            <button
              onClick={() => onRecordRent(p.id, p.monthly_rent)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'white', border: '1.5px solid #D97706', color: '#D97706', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Record Rent Received
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: '95%', maxWidth: '450px', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', marginBottom: '1.5rem' }}>Add New Rental Property</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>PROPERTY NAME</label>
                  <input type="text" value={formData.property_name} onChange={e => setFormData({...formData, property_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>ADDRESS</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>MONTHLY RENT</label>
                    <input type="number" value={formData.monthly_rent} onChange={e => setFormData({...formData, monthly_rent: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>DUE DAY</label>
                    <input type="number" placeholder="1-31" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>TENANT NAME</label>
                  <input type="text" value={formData.tenant_name} onChange={e => setFormData({...formData, tenant_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                </div>
                <button onClick={handleSave} style={{ marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '12px', background: '#D97706', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  Save Property
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyManager;
