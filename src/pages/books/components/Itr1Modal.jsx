import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Download, Printer, Save, RefreshCw, AlertCircle, Info, CheckCircle } from 'lucide-react';

const Itr1Modal = ({ isOpen, onClose, currentYear, initialNotes, onSaveCalculation }) => {
  const [regime, setRegime] = useState('new'); // 'new' or 'old'
  const [activeTab, setActiveTab] = useState('income'); // 'income', 'deductions', 'taxes', 'summary'
  
  // Form states
  const [salary, setSalary] = useState('');
  const [houseRent, setHouseRent] = useState('');
  const [houseTaxes, setHouseTaxes] = useState('');
  const [houseInterest, setHouseInterest] = useState('');
  const [otherInterest, setOtherInterest] = useState('');
  const [otherDividend, setOtherDividend] = useState('');
  const [exemptAgri, setExemptAgri] = useState('');
  
  // Deductions (Chapter VI-A)
  const [sec80C, setSec80C] = useState('');
  const [sec80D, setSec80D] = useState('');
  const [sec80TTA, setSec80TTA] = useState('');
  const [sec80CCD, setSec80CCD] = useState('');
  
  // Tax credits
  const [tdsPaid, setTdsPaid] = useState('');
  const [advanceTax, setAdvanceTax] = useState('');

  // Load from initial notes if they are populated
  useEffect(() => {
    if (initialNotes) {
      try {
        const parsed = JSON.parse(initialNotes);
        if (parsed && parsed.isItr1) {
          setRegime(parsed.regime || 'new');
          setSalary(parsed.salary || '');
          setHouseRent(parsed.houseRent || '');
          setHouseTaxes(parsed.houseTaxes || '');
          setHouseInterest(parsed.houseInterest || '');
          setOtherInterest(parsed.otherInterest || '');
          setOtherDividend(parsed.otherDividend || '');
          setExemptAgri(parsed.exemptAgri || '');
          setSec80C(parsed.sec80C || '');
          setSec80D(parsed.sec80D || '');
          setSec80TTA(parsed.sec80TTA || '');
          setSec80CCD(parsed.sec80CCD || '');
          setTdsPaid(parsed.tdsPaid || '');
          setAdvanceTax(parsed.advanceTax || '');
        }
      } catch (e) {
        // Not a JSON or not ITR-1 details, ignore
      }
    }
  }, [initialNotes, isOpen]);

  // Calculations
  const calculations = useMemo(() => {
    const s = Number(salary) || 0;
    const hr = Number(houseRent) || 0;
    const ht = Number(houseTaxes) || 0;
    const hi = Number(houseInterest) || 0;
    const oi = Number(otherInterest) || 0;
    const od = Number(otherDividend) || 0;
    const ea = Math.min(5000, Number(exemptAgri) || 0); // Cap at 5000 for ITR-1

    // Standard Deductions
    let salaryStdDeduction = 0;
    if (regime === 'new') {
      salaryStdDeduction = currentYear === '2024-25' ? 75000 : 50000;
    } else {
      salaryStdDeduction = 50000; // Old regime always has 50000
    }
    const netSalary = Math.max(0, s - salaryStdDeduction);

    // House Property Income
    const netAnnualValue = Math.max(0, hr - ht);
    const houseStdDeduction = netAnnualValue * 0.3;
    // Section 24 interest deduction not allowed in New regime for self-occupied
    const allowedInterest = regime === 'new' ? 0 : Math.min(200000, hi);
    const netHouseProperty = netAnnualValue - houseStdDeduction - allowedInterest;

    // Other Sources
    const netOtherSources = oi + od;

    // Gross Total Income (GTI)
    const grossTotalIncome = netSalary + netHouseProperty + netOtherSources;

    // Deductions Chapter VI-A (Disabled in New Regime except standard ones)
    let d80C = 0;
    let d80D = 0;
    let d80TTA = 0;
    let d80CCD = 0;

    if (regime === 'old') {
      d80C = Math.min(150000, Number(sec80C) || 0);
      d80D = Math.min(25000, Number(sec80D) || 0); // Cap at 25k for self/family
      d80TTA = Math.min(10000, Number(sec80TTA) || 0);
      d80CCD = Math.min(50000, Number(sec80CCD) || 0);
    }
    const totalDeductions = d80C + d80D + d80TTA + d80CCD;
    const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

    // Tax calculation slabs
    let baseTax = 0;
    let slabDetails = [];

    if (regime === 'old') {
      // Old Regime Slabs (FY 2023-24 & 2024-25 are same)
      if (taxableIncome <= 250000) {
        baseTax = 0;
        slabDetails.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
      } else if (taxableIncome <= 500000) {
        const diff = taxableIncome - 250000;
        baseTax = diff * 0.05;
        slabDetails.push({ slab: '₹2,50,001 to ₹5,00,000', rate: '5%', tax: baseTax });
      } else if (taxableIncome <= 1000000) {
        const diff = taxableIncome - 500000;
        baseTax = 12500 + diff * 0.20;
        slabDetails.push({ slab: '₹2,50,001 to ₹5,00,000', rate: '5%', tax: 12500 });
        slabDetails.push({ slab: '₹5,00,001 to ₹10,00,000', rate: '20%', tax: diff * 0.20 });
      } else {
        const diff = taxableIncome - 1000000;
        baseTax = 112500 + diff * 0.30;
        slabDetails.push({ slab: '₹2,50,001 to ₹5,00,000', rate: '5%', tax: 12500 });
        slabDetails.push({ slab: '₹5,00,001 to ₹10,00,000', rate: '20%', tax: 100000 });
        slabDetails.push({ slab: 'Above ₹10,00,000', rate: '30%', tax: diff * 0.30 });
      }
    } else {
      // New Regime Slabs
      if (currentYear === '2024-25') {
        // FY 2024-25 New Regime Slabs
        if (taxableIncome <= 300000) {
          baseTax = 0;
          slabDetails.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
        } else if (taxableIncome <= 700000) {
          const diff = taxableIncome - 300000;
          baseTax = diff * 0.05;
          slabDetails.push({ slab: '₹3,00,001 to ₹7,00,000', rate: '5%', tax: baseTax });
        } else if (taxableIncome <= 1000000) {
          const diff = taxableIncome - 700000;
          baseTax = 20000 + diff * 0.10;
          slabDetails.push({ slab: '₹3,00,001 to ₹7,00,000', rate: '5%', tax: 20000 });
          slabDetails.push({ slab: '₹7,00,001 to ₹10,00,000', rate: '10%', tax: diff * 0.10 });
        } else if (taxableIncome <= 1200000) {
          const diff = taxableIncome - 1000000;
          baseTax = 50000 + diff * 0.15;
          slabDetails.push({ slab: '₹3,00,001 to ₹7,00,000', rate: '5%', tax: 20000 });
          slabDetails.push({ slab: '₹7,00,001 to ₹10,00,000', rate: '10%', tax: 30000 });
          slabDetails.push({ slab: '₹10,00,001 to ₹12,00,000', rate: '15%', tax: diff * 0.15 });
        } else if (taxableIncome <= 1500000) {
          const diff = taxableIncome - 1200000;
          baseTax = 80000 + diff * 0.20;
          slabDetails.push({ slab: '₹3,00,001 to ₹7,00,000', rate: '5%', tax: 20000 });
          slabDetails.push({ slab: '₹7,00,001 to ₹10,00,000', rate: '10%', tax: 30000 });
          slabDetails.push({ slab: '₹10,00,001 to ₹12,00,000', rate: '15%', tax: 30000 });
          slabDetails.push({ slab: '₹12,00,001 to ₹15,00,000', rate: '20%', tax: diff * 0.20 });
        } else {
          const diff = taxableIncome - 1500000;
          baseTax = 140000 + diff * 0.30;
          slabDetails.push({ slab: '₹3,00,001 to ₹7,00,000', rate: '5%', tax: 20000 });
          slabDetails.push({ slab: '₹7,00,001 to ₹10,00,000', rate: '10%', tax: 30000 });
          slabDetails.push({ slab: '₹10,00,001 to ₹12,00,000', rate: '15%', tax: 30000 });
          slabDetails.push({ slab: '₹12,00,001 to ₹15,00,000', rate: '20%', tax: 60000 });
          slabDetails.push({ slab: 'Above ₹15,00,000', rate: '30%', tax: diff * 0.30 });
        }
      } else {
        // FY 2023-24 New Regime Slabs
        if (taxableIncome <= 300000) {
          baseTax = 0;
          slabDetails.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
        } else if (taxableIncome <= 600000) {
          const diff = taxableIncome - 300000;
          baseTax = diff * 0.05;
          slabDetails.push({ slab: '₹3,00,001 to ₹6,00,000', rate: '5%', tax: baseTax });
        } else if (taxableIncome <= 900000) {
          const diff = taxableIncome - 600000;
          baseTax = 15000 + diff * 0.10;
          slabDetails.push({ slab: '₹3,00,001 to ₹6,00,000', rate: '5%', tax: 15000 });
          slabDetails.push({ slab: '₹6,00,001 to ₹9,00,000', rate: '10%', tax: diff * 0.10 });
        } else if (taxableIncome <= 1200000) {
          const diff = taxableIncome - 900000;
          baseTax = 45000 + diff * 0.15;
          slabDetails.push({ slab: '₹3,00,001 to ₹6,00,000', rate: '5%', tax: 15000 });
          slabDetails.push({ slab: '₹6,00,001 to ₹9,00,000', rate: '10%', tax: 30000 });
          slabDetails.push({ slab: '₹9,00,001 to ₹12,00,000', rate: '15%', tax: diff * 0.15 });
        } else if (taxableIncome <= 1500000) {
          const diff = taxableIncome - 1200000;
          baseTax = 90000 + diff * 0.20;
          slabDetails.push({ slab: '₹3,00,001 to ₹6,00,000', rate: '5%', tax: 15000 });
          slabDetails.push({ slab: '₹6,00,001 to ₹9,00,000', rate: '10%', tax: 30000 });
          slabDetails.push({ slab: '₹9,00,001 to ₹12,00,000', rate: '15%', tax: 45000 });
          slabDetails.push({ slab: '₹12,00,001 to ₹15,00,000', rate: '20%', tax: diff * 0.20 });
        } else {
          const diff = taxableIncome - 1500000;
          baseTax = 150000 + diff * 0.30;
          slabDetails.push({ slab: '₹3,00,001 to ₹6,00,000', rate: '5%', tax: 15000 });
          slabDetails.push({ slab: '₹6,00,001 to ₹9,00,000', rate: '10%', tax: 30000 });
          slabDetails.push({ slab: '₹9,00,001 to ₹12,00,000', rate: '15%', tax: 45000 });
          slabDetails.push({ slab: '₹12,00,001 to ₹15,00,000', rate: '20%', tax: 60000 });
          slabDetails.push({ slab: 'Above ₹15,00,000', rate: '30%', tax: diff * 0.30 });
        }
      }
    }

    // Rebate u/s 87A
    let rebate = 0;
    if (regime === 'old') {
      if (taxableIncome <= 500000) {
        rebate = baseTax; // 100% rebate up to 12500
      }
    } else {
      if (taxableIncome <= 700000) {
        rebate = baseTax; // 100% rebate up to 25k (2023-24) or 20k (2024-25)
      }
    }

    const taxAfterRebate = Math.max(0, baseTax - rebate);
    const cess = taxAfterRebate * 0.04;
    const totalTax = taxAfterRebate + cess;

    const tds = Number(tdsPaid) || 0;
    const adv = Number(advanceTax) || 0;
    const totalPaid = tds + adv;

    const remainingPayable = Math.max(0, totalTax - totalPaid);
    const refund = Math.max(0, totalPaid - totalTax);

    return {
      salaryStdDeduction,
      netSalary,
      netAnnualValue,
      houseStdDeduction,
      allowedInterest,
      netHouseProperty,
      netOtherSources,
      grossTotalIncome,
      totalDeductions,
      taxableIncome,
      baseTax,
      slabDetails,
      rebate,
      taxAfterRebate,
      cess,
      totalTax,
      totalPaid,
      remainingPayable,
      refund,
      ea
    };
  }, [salary, houseRent, houseTaxes, houseInterest, otherInterest, otherDividend, exemptAgri, sec80C, sec80D, sec80TTA, sec80CCD, tdsPaid, advanceTax, regime, currentYear]);

  const handleReset = () => {
    setSalary('');
    setHouseRent('');
    setHouseTaxes('');
    setHouseInterest('');
    setOtherInterest('');
    setOtherDividend('');
    setExemptAgri('');
    setSec80C('');
    setSec80D('');
    setSec80TTA('');
    setSec80CCD('');
    setTdsPaid('');
    setAdvanceTax('');
  };

  const handleSave = () => {
    // Construct serialized details string for notes column
    const notesJson = JSON.stringify({
      isItr1: true,
      regime,
      salary,
      houseRent,
      houseTaxes,
      houseInterest,
      otherInterest,
      otherDividend,
      exemptAgri,
      sec80C,
      sec80D,
      sec80TTA,
      sec80CCD,
      tdsPaid,
      advanceTax,
      taxableIncome: calculations.taxableIncome,
      calculatedTax: calculations.totalTax,
      taxPayableOrRefund: calculations.remainingPayable > 0 ? calculations.remainingPayable : -calculations.refund
    });

    onSaveCalculation({
      income_tax: calculations.totalTax,
      tds_paid: Number(tdsPaid) || 0,
      epf: regime === 'old' ? (Number(sec80C) || 0) : 0,
      esi: 0,
      prof_tax: 0,
      advance_tax: Number(advanceTax) || 0,
      tax_savings: calculations.totalDeductions,
      notes: notesJson
    });
    
    onClose();
  };

  const handleExportCSV = () => {
    const rows = [
      ["Parameter", "Value (INR)"],
      ["Financial Year", currentYear],
      ["Tax Regime", regime.toUpperCase() + " REGIME"],
      ["Gross Salary Income", salary || 0],
      ["Salary Standard Deduction", calculations.salaryStdDeduction],
      ["Net Salary Income", calculations.netSalary],
      ["Rental Income", houseRent || 0],
      ["Municipal Taxes Paid", houseTaxes || 0],
      ["House Standard Deduction (30%)", calculations.houseStdDeduction],
      ["Interest on Home Loan", calculations.allowedInterest],
      ["Net House Property Income", calculations.netHouseProperty],
      ["Other Interest Income", otherInterest || 0],
      ["Other Dividend Income", otherDividend || 0],
      ["Exempt Agricultural Income", calculations.ea],
      ["Gross Total Income", calculations.grossTotalIncome],
      ["Section 80C Deductions", sec80C || 0],
      ["Section 80D Deductions", sec80D || 0],
      ["Section 80TTA Deductions", sec80TTA || 0],
      ["Section 80CCD Deductions", sec80CCD || 0],
      ["Total Chapter VI-A Deductions", calculations.totalDeductions],
      ["Net Taxable Income", calculations.taxableIncome],
      ["Base Tax Liability", calculations.baseTax],
      ["Rebate under Section 87A", calculations.rebate],
      ["Health & Education Cess (4%)", calculations.cess],
      ["Total Tax Liability", calculations.totalTax],
      ["TDS Deducted", tdsPaid || 0],
      ["Advance Tax Paid", advanceTax || 0],
      ["Total Tax Paid", calculations.totalPaid],
      ["Net Tax Payable", calculations.remainingPayable],
      ["Net Refund Claimable", calculations.refund]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ITR1_Calculation_FY_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>ITR-1 Tax Calculation Sheet - FY ${currentYear}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e293b; line-height: 1.5; }
            h2 { color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
            th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 2rem; font-weight: bold; }
            .highlight { background-color: #ecfdf5; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>ITR-1 Tax Estimation Summary Sheet</h2>
          <div class="header-info">
            <div>Financial Year: FY ${currentYear}</div>
            <div>Tax Regime: ${regime.toUpperCase() + " REGIME"}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Gross Salary / Pension</td><td>₹${Number(salary || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Less: Standard Deduction</td><td>- ₹${calculations.salaryStdDeduction.toLocaleString('en-IN')}</td></tr>
              <tr class="highlight"><td>Net Income from Salary</td><td>₹${calculations.netSalary.toLocaleString('en-IN')}</td></tr>
              <tr><td>Net Income from House Property</td><td>₹${calculations.netHouseProperty.toLocaleString('en-IN')}</td></tr>
              <tr><td>Other Interest & Dividends</td><td>₹${calculations.netOtherSources.toLocaleString('en-IN')}</td></tr>
              <tr class="highlight"><td>Gross Total Income (GTI)</td><td>₹${calculations.grossTotalIncome.toLocaleString('en-IN')}</td></tr>
              <tr><td>Chapter VI-A Deductions</td><td>- ₹${calculations.totalDeductions.toLocaleString('en-IN')}</td></tr>
              <tr class="highlight" style="background-color:#eff6ff;"><td>Net Taxable Income</td><td>₹${calculations.taxableIncome.toLocaleString('en-IN')}</td></tr>
              <tr><td>Tax Calculated at Slabs</td><td>₹${calculations.baseTax.toLocaleString('en-IN')}</td></tr>
              <tr><td>Less: Rebate under Section 87A</td><td>- ₹${calculations.rebate.toLocaleString('en-IN')}</td></tr>
              <tr><td>Add: Health & Education Cess (4%)</td><td>₹${calculations.cess.toLocaleString('en-IN')}</td></tr>
              <tr class="highlight"><td>Total Annual Tax Liability</td><td>₹${calculations.totalTax.toLocaleString('en-IN')}</td></tr>
              <tr><td>Total Taxes Deducted/Paid (TDS + Advance Tax)</td><td>₹${calculations.totalPaid.toLocaleString('en-IN')}</td></tr>
              \${calculations.remainingPayable > 0 ? \`<tr class="highlight" style="background-color:#fef2f2; color:#b91c1c;"><td>Net Tax Due</td><td>₹\${calculations.remainingPayable.toLocaleString('en-IN')}</td></tr>\` : ''}
              \${calculations.refund > 0 ? \`<tr class="highlight" style="background-color:#f0fdf4; color:#15803d;"><td>Net Refund Claimable</td><td>₹\${calculations.refund.toLocaleString('en-IN')}</td></tr>\` : ''}
            </tbody>
          </table>
          <p style="margin-top: 3rem; font-size: 0.8rem; text-align: center; color: #94a3b8;">Generated via CLIKSSS Tax Engine on ${new Date().toLocaleDateString('en-IN')}</p>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '850px', height: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', background: '#0F172A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Calculator size={20} /></div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 850, margin: 0 }}>ITR-1 Sahaj Tax Calculator</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>Estimate personal tax for salaried individuals | FY {currentYear}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>

        {/* Configurations Subheader */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem 2rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Tax Regime</span>
            <div style={{ display: 'flex', background: '#E2E8F0', borderRadius: '12px', padding: '3px' }}>
              <button 
                onClick={() => setRegime('new')} 
                style={{ border: 'none', padding: '0.5rem 1.25rem', borderRadius: '9px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', background: regime === 'new' ? '#10B981' : 'transparent', color: regime === 'new' ? 'white' : '#475569', transition: 'all 0.2s' }}
              >
                New Regime
              </button>
              <button 
                onClick={() => setRegime('old')} 
                style={{ border: 'none', padding: '0.5rem 1.25rem', borderRadius: '9px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', background: regime === 'old' ? '#10B981' : 'transparent', color: regime === 'old' ? 'white' : '#475569', transition: 'all 0.2s' }}
              >
                Old Regime
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
            <CheckCircle size={14} /> Active Year: FY {currentYear}
          </div>
        </div>

        {/* Main Content Pane */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          
          {/* Left Navigation Tabs */}
          <div style={{ width: '200px', background: '#F8FAFC', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px', padding: '1.5rem 1rem' }}>
            {[
              { id: 'income', label: '1. Income Details' },
              { id: 'deductions', label: '2. VI-A Deductions', disabled: regime === 'new' },
              { id: 'taxes', label: '3. Credits & TDS' },
              { id: 'summary', label: '4. Summary Report' }
            ].map(tab => (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  textAlign: 'left',
                  border: 'none',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 750,
                  fontSize: '0.82rem',
                  cursor: tab.disabled ? 'not-allowed' : 'pointer',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  color: tab.disabled ? '#94A3B8' : (activeTab === tab.id ? '#10B981' : '#475569'),
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.01)' : 'none',
                  borderLeft: activeTab === tab.id ? '4px solid #10B981' : '4px solid transparent',
                  opacity: tab.disabled ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Forms Pane */}
          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            
            {activeTab === 'income' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Salary & General Receipts</h4>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Gross Salary / Pension Income (Annual)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 850, color: '#64748B' }}>₹</span>
                    <input type="number" placeholder="e.g. 850000" value={salary} onChange={e => setSalary(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Standard Deduction of ₹{calculations.salaryStdDeduction.toLocaleString('en-IN')} will be deducted automatically.
                  </span>
                </div>

                <div style={{ height: '1px', background: '#E2E8F0', margin: '0.5rem 0' }} />

                <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Income from One House Property</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Gross Rent Received (Annual)</label>
                    <input type="number" placeholder="0" value={houseRent} onChange={e => setHouseRent(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Municipal Taxes Paid</label>
                    <input type="number" placeholder="0" value={houseTaxes} onChange={e => setHouseTaxes(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Interest on Home Loan (Section 24b)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    disabled={regime === 'new'} 
                    value={houseInterest} 
                    onChange={e => setHouseInterest(e.target.value)} 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700, background: regime === 'new' ? '#F1F5F9' : 'white' }} 
                  />
                  {regime === 'new' && (
                    <span style={{ fontSize: '0.7rem', color: '#EF4444', display: 'block', marginTop: '4px' }}>
                      Interest deduction u/s 24b on self-occupied property is not allowed in the New Regime.
                    </span>
                  )}
                </div>

                <div style={{ height: '1px', background: '#E2E8F0', margin: '0.5rem 0' }} />

                <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Other Income & Exemptions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Interest Income (Savings/FD)</label>
                    <input type="number" placeholder="0" value={otherInterest} onChange={e => setOtherInterest(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Dividend Income</label>
                    <input type="number" placeholder="0" value={otherDividend} onChange={e => setOtherDividend(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Exempt Agricultural Income (Capped at ₹5,000)</label>
                  <input type="number" placeholder="Max 5000" value={exemptAgri} onChange={e => setExemptAgri(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  {Number(exemptAgri) > 5000 && (
                    <span style={{ fontSize: '0.7rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} /> Agricultural Income above ₹5,000 disqualifies you from using ITR-1. Placed at limit.
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'deductions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#EFF6FF', color: '#1E40AF', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Chapter VI-A Deductions</strong> are only applicable under the <strong>Old Tax Regime</strong>. Under the New Regime, these deductions are disallowed.
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Eligible Deductions (Old Regime)</h4>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Section 80C (EPF, PPF, ELSS, Insurance premiums) - Capped at ₹1.5L</label>
                  <input type="number" placeholder="Max 150000" value={sec80C} onChange={e => setSec80C(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Section 80D (Health Insurance Premium) - Capped at ₹25k / ₹50k</label>
                  <input type="number" placeholder="Max 25000" value={sec80D} onChange={e => setSec80D(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Section 80TTA (Interest on Savings Accounts) - Capped at ₹10k</label>
                  <input type="number" placeholder="Max 10000" value={sec80TTA} onChange={e => setSec80TTA(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Section 80CCD(1B) (National Pension Scheme) - Capped at ₹50k</label>
                  <input type="number" placeholder="Max 50000" value={sec80CCD} onChange={e => setSec80CCD(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                </div>
              </div>
            )}

            {activeTab === 'taxes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Taxes Already Paid / Deducted</h4>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>TDS Deducted as per Form 16 / 26AS</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 850, color: '#64748B' }}>₹</span>
                    <input type="number" placeholder="0" value={tdsPaid} onChange={e => setTdsPaid(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Compare this with your Form 26AS to make sure it matches database records.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Advance Tax / Self-Assessment Tax Paid</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 850, color: '#64748B' }}>₹</span>
                    <input type="number" placeholder="0" value={advanceTax} onChange={e => setAdvanceTax(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: 700 }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#1E293B', margin: 0 }}>Calculation Breakdown Sheet</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Net Taxable Income</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>₹{calculations.taxableIncome.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: calculations.remainingPayable > 0 ? '#FEF2F2' : '#ECFDF5', padding: '1rem', borderRadius: '16px', border: '1px solid ' + (calculations.remainingPayable > 0 ? '#FEE2E2' : '#D1FAE5') }}>
                    <span style={{ fontSize: '0.7rem', color: calculations.remainingPayable > 0 ? '#EF4444' : '#059669', fontWeight: 800, textTransform: 'uppercase' }}>
                      {calculations.remainingPayable > 0 ? 'Net Tax Payable' : 'Refund Claimable'}
                    </span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: calculations.remainingPayable > 0 ? '#DC2626' : '#059669', marginTop: '4px' }}>
                      ₹{calculations.remainingPayable > 0 ? calculations.remainingPayable.toLocaleString('en-IN') : calculations.refund.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>Gross Total Receipts</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{calculations.grossTotalIncome.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>Chapter VI-A Deductions</span>
                    <span style={{ fontWeight: 800, color: '#DC2626' }}>- ₹{calculations.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: 800 }}>Net taxable Income</span>
                    <span style={{ fontWeight: 900, color: '#0F172A' }}>₹{calculations.taxableIncome.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>Computed Slab Tax</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{calculations.baseTax.toLocaleString('en-IN')}</span>
                  </div>
                  {calculations.rebate > 0 && (
                    <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>Rebate under Section 87A</span>
                      <span style={{ fontWeight: 800, color: '#059669' }}>- ₹{calculations.rebate.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>Health & Education Cess (4%)</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{calculations.cess.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ color: '#475569', fontWeight: 800 }}>Total Annual Tax Liability</span>
                    <span style={{ fontWeight: 900, color: '#0F172A' }}>₹{calculations.totalTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>TDS & Advance Taxes Deposited</span>
                    <span style={{ fontWeight: 800, color: '#059669' }}>- ₹{calculations.totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Slabs breakdown details */}
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', margin: '0.5rem 0 0 0', textTransform: 'uppercase' }}>Slab Distribution Details</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {calculations.slabDetails.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifycontent: 'space-between', padding: '0.5rem 1rem', background: '#F8FAFC', borderRadius: '10px', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748B', fontWeight: 700 }}>{item.slab} ({item.rate})</span>
                      <span style={{ fontWeight: 800, color: '#1E293B' }}>₹{item.tax.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem 2rem', borderTop: '1px solid #E2E8F0' }}>
          <button 
            onClick={handleReset} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <RefreshCw size={16} /> Reset
          </button>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleExportCSV} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #CBD5E1', color: '#475569', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'white'}
            >
              <Download size={16} /> Export CSV
            </button>
            <button 
              onClick={handlePrint} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #CBD5E1', color: '#475569', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'white'}
            >
              <Printer size={16} /> Print Sheet
            </button>
            <button 
              onClick={handleSave} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 850, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}
            >
              <Save size={16} /> Save Calculation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Itr1Modal;
