import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calculator, FileText, IndianRupee, PieChart, Plus, Trash2, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financePlusService } from '../../services';

const TaxDeductions = () => {
  const queryClient = useQueryClient();
  const [taxYear, setTaxYear] = useState('2024-25');
  const [taxData, setTaxData] = useState({
    income_tax: 0, tds_paid: 0, epf: 0, esi: 0, prof_tax: 0, advance_tax: 0, tax_savings: 0, notes: ''
  });

  const { data: records = [] } = useQuery({
    queryKey: ['tax-records'],
    queryFn: financePlusService.getTaxRecords
  });

  useEffect(() => {
    const current = records.find(r => r.tax_year === taxYear);
    if (current) {
      setTaxData({
        income_tax: current.income_tax || 0,
        tds_paid: current.tds_paid || 0,
        epf: current.epf || 0,
        esi: current.esi || 0,
        prof_tax: current.prof_tax || 0,
        advance_tax: current.advance_tax || 0,
        tax_savings: current.tax_savings || 0,
        notes: current.notes || ''
      });
    } else {
      setTaxData({ income_tax: 0, tds_paid: 0, epf: 0, esi: 0, prof_tax: 0, advance_tax: 0, tax_savings: 0, notes: '' });
    }
  }, [records, taxYear]);

  const taxMutation = useMutation({
    mutationFn: (data) => financePlusService.saveTaxRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-records']);
      queryClient.invalidateQueries(['finance-dashboard-enhanced']);
      alert('Tax records successfully updated!');
    }
  });

  const totalDeductions = Number(taxData.epf) + Number(taxData.esi) + Number(taxData.prof_tax) + Number(taxData.tax_savings);
  const totalTaxPaid = Number(taxData.tds_paid) + Number(taxData.advance_tax);
  const remainingTax = Math.max(0, Number(taxData.income_tax) - totalTaxPaid);
  const refund = Math.max(0, totalTaxPaid - Number(taxData.income_tax));

  const handleSave = () => {
    taxMutation.mutate({ ...taxData, tax_year: taxYear });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={24} /></div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Tax & Deductions</h1>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>Calculate and manage your annual tax liability</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <select value={taxYear} onChange={e => setTaxYear(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 700, outline: 'none' }}>
                <option value="2023-24">FY 2023-24</option>
                <option value="2024-25">FY 2024-25</option>
            </select>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                <Download size={18} /> Export Summary
            </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Estimated Tax', val: taxData.income_tax, color: '#1E293B' },
          { label: 'Total Paid', val: totalTaxPaid, color: '#059669' },
          { label: 'Due Amount', val: remainingTax, color: '#EF4444' },
          { label: 'Potential Refund', val: refund, color: '#2563EB' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{card.label}</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: card.color, marginTop: '4px' }}>₹{Number(card.val).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem' }}>Annual Tax Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>GROSS ANNUAL INCOME</label>
                <input type="number" value={taxData.income_tax} onChange={e => setTaxData({...taxData, income_tax: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>TDS ALREADY PAID</label>
                <input type="number" value={taxData.tds_paid} onChange={e => setTaxData({...taxData, tds_paid: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Standard Deductions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>EPF</label>
                <input type="number" value={taxData.epf} onChange={e => setTaxData({...taxData, epf: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>ESI</label>
                <input type="number" value={taxData.esi} onChange={e => setTaxData({...taxData, esi: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '0.4rem' }}>PROF TAX</label>
                <input type="number" value={taxData.prof_tax} onChange={e => setTaxData({...taxData, prof_tax: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>ADDITIONAL TAX SAVINGS (80C, 80D, etc.)</label>
              <input type="number" value={taxData.tax_savings} onChange={e => setTaxData({...taxData, tax_savings: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
            </div>

            <button onClick={handleSave} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', marginTop: '1rem' }}>
              Update Tax Records
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.25rem' }}>Quick Calculator</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Taxable Base</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>₹{(Number(taxData.income_tax) - totalDeductions).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>
                    <PieChart size={18} />
                    View Detailed Projection
                </div>
            </div>
          </div>

          <div style={{ background: '#1E293B', borderRadius: '24px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Tax Compliance</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5 }}>
              Ensure all your TDS certificates (Form 16/16A) are collected and verified against Form 26AS for smooth filing.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }}>ITR-1</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }}>AY 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxDeductions;
