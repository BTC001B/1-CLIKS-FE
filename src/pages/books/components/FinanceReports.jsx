import React, { useState } from 'react';
import { FileText, Download, Printer, Calendar } from 'lucide-react';

const FinanceReports = ({ transactions = [], budget = 0, currencySymbol = '₹' }) => {
    const [reportType, setReportType] = useState('Monthly');
    const [selectedMonth, setSelectedMonth] = useState('Jun');
    const [selectedYear, setSelectedYear] = useState('2026');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Filter matching transactions
    const filteredReportTransactions = transactions.filter(t => {
        if (!t.date) return false;
        
        let monthName = '';
        let yearName = '';
        
        if (t.date.includes('-')) {
            // YYYY-MM-DD
            const parts = t.date.split('-');
            const monthIdx = parseInt(parts[1]) - 1;
            monthName = months[monthIdx] || '';
            yearName = parts[0];
        } else {
            // "24 Jun 2026"
            const parts = t.date.split(' ');
            if (parts.length === 3) {
                monthName = parts[1];
                yearName = parts[2];
            }
        }

        if (reportType === 'Monthly') {
            return monthName === selectedMonth && yearName === selectedYear;
        }
        return yearName === selectedYear;
    });

    const incomeSum = filteredReportTransactions
        .filter(t => (t.type || '').toLowerCase() === 'income')
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

    const expenseSum = filteredReportTransactions
        .filter(t => (t.type || '').toLowerCase() === 'expense')
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

    const netSavings = incomeSum - expenseSum;

    // Export Handler
    const exportCSV = (fileExtension = 'csv') => {
        if (filteredReportTransactions.length === 0) return alert("No records available to export.");
        
        const headers = ['Date', 'Type', 'Title', 'Description', 'Category', 'Amount'];
        const rows = filteredReportTransactions.map(t => [
            t.date,
            t.type,
            t.name,
            t.description || '',
            t.category || '',
            t.amount
        ]);

        const content = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Finance_Report_${reportType}_${selectedMonth}_${selectedYear}.${fileExtension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
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
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <FileText size={20} style={{ color: '#7C3AED' }} /> Reports Engine
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <select 
                        value={reportType} 
                        onChange={e => setReportType(e.target.value)}
                        style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 700, outline: 'none' }}
                    >
                        <option value="Monthly">Monthly Report</option>
                        <option value="Yearly">Yearly Report</option>
                    </select>

                    {reportType === 'Monthly' && (
                        <select 
                            value={selectedMonth} 
                            onChange={e => setSelectedMonth(e.target.value)}
                            style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 700, outline: 'none' }}
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    )}

                    <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(e.target.value)}
                        style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 700, outline: 'none' }}
                    >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
            </div>

            {/* Print Section Container */}
            <div id="finance-report-sheet" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                            {reportType} Statement Summary
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Calendar size={12} /> {reportType === 'Monthly' ? `${selectedMonth} ${selectedYear}` : selectedYear}
                        </span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                        Generated dynamically via CLIKS Books
                    </div>
                </div>

                {/* Metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 750, textTransform: 'uppercase' }}>Income Summary</span>
                        <h5 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: 850, color: '#10B981' }}>{currencySymbol}{incomeSum.toLocaleString()}</h5>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 750, textTransform: 'uppercase' }}>Expense Summary</span>
                        <h5 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: 850, color: '#EF4444' }}>{currencySymbol}{expenseSum.toLocaleString()}</h5>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 750, textTransform: 'uppercase' }}>Savings Summary</span>
                        <h5 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: 850, color: '#7C3AED' }}>{currencySymbol}{netSavings.toLocaleString()}</h5>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 750, textTransform: 'uppercase' }}>Budget Summary</span>
                        <h5 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: 850, color: '#475569' }}>
                            {reportType === 'Monthly' ? `${currencySymbol}${budget.toLocaleString()}` : 'N/A'}
                        </h5>
                    </div>
                </div>

                {/* Table list */}
                {filteredReportTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94A3B8', fontSize: '0.8rem' }}>No transaction history found for selected timeframe.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 750 }}>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem' }}>Type</th>
                                    <th style={{ padding: '0.5rem' }}>Title</th>
                                    <th style={{ padding: '0.5rem' }}>Category</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReportTransactions.map((t, idx) => (
                                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #F1F5F9', color: '#334155', fontWeight: 600 }}>
                                        <td style={{ padding: '0.5rem' }}>{t.date}</td>
                                        <td style={{ padding: '0.5rem', color: (t.type || '').toLowerCase() === 'income' ? '#10B981' : '#EF4444' }}>{t.type}</td>
                                        <td style={{ padding: '0.5rem', color: '#0F172A', fontWeight: 700 }}>{t.name}</td>
                                        <td style={{ padding: '0.5rem' }}>{t.category || 'Other'}</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 750 }}>{currencySymbol}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Export Toolbar */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button 
                    onClick={() => exportCSV('csv')} 
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <Download size={14} /> Export CSV
                </button>
                <button 
                    onClick={() => exportCSV('xls')} 
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <Download size={14} /> Export Excel
                </button>
                <button 
                    onClick={handlePrintPDF} 
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <Printer size={14} /> Export PDF / Print
                </button>
            </div>
        </div>
    );
};

export default FinanceReports;
