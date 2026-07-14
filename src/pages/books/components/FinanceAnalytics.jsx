import React from 'react';
import { TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';

const FinanceAnalytics = ({ transactions = [], currencySymbol = '₹' }) => {
    // Process Data
    const incomeTotal = transactions
        .filter(t => (t.type || '').toLowerCase() === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expenseTotal = transactions
        .filter(t => (t.type || '').toLowerCase() === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // Group by Category
    const categoryGroup = {};
    transactions
        .filter(t => (t.type || '').toLowerCase() === 'expense')
        .forEach(t => {
            const cat = t.category || 'Other';
            categoryGroup[cat] = (categoryGroup[cat] || 0) + (parseFloat(t.amount) || 0);
        });

    const categoryData = Object.keys(categoryGroup).map(cat => ({
        name: cat,
        value: categoryGroup[cat]
    })).sort((a, b) => b.value - a.value);

    // Group by Month (simplified grouping by date parsing)
    const monthGroup = {};
    transactions.forEach(t => {
        if (!t.date) return;
        // Assume date is in format YYYY-MM-DD or readable text containing Month name
        let monthName = 'Other';
        if (t.date.includes('-')) {
            const parts = t.date.split('-');
            const monthIndex = parseInt(parts[1]) - 1;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthName = months[monthIndex] || 'Other';
        } else {
            // E.g. "24 Jun 2026"
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const found = months.find(m => t.date.includes(m));
            if (found) monthName = found;
        }

        if (!monthGroup[monthName]) monthGroup[monthName] = { income: 0, expense: 0 };
        if ((t.type || '').toLowerCase() === 'income') {
            monthGroup[monthName].income += (parseFloat(t.amount) || 0);
        } else {
            monthGroup[monthName].expense += (parseFloat(t.amount) || 0);
        }
    });

    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthsOrder
        .filter(m => monthGroup[m])
        .map(m => ({
            month: m,
            income: monthGroup[m].income,
            expense: monthGroup[m].expense,
            savings: monthGroup[m].income - monthGroup[m].expense
        }));

    // SVG parameters
    const maxVal = Math.max(incomeTotal, expenseTotal, 100);
    const scaleY = 120 / maxVal;

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem'
        }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: '#7C3AED' }} /> Interactive Analytics
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* 1. Income vs Expense Bar Chart */}
                <div style={{ border: '1px solid #F1F5F9', borderRadius: '12px', padding: '1rem', background: '#F8FAFC' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#475569', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BarChart2 size={15} /> Income vs Expense
                    </h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px', padding: '10px 0', borderBottom: '2px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                                width: '40px', 
                                height: `${incomeTotal * scaleY}px`, 
                                background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)', 
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.3s ease'
                            }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Income</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>{currencySymbol}{incomeTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                                width: '40px', 
                                height: `${expenseTotal * scaleY}px`, 
                                background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)', 
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.3s ease'
                            }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Expense</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>{currencySymbol}{expenseTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Category-wise Expense Breakdown */}
                <div style={{ border: '1px solid #F1F5F9', borderRadius: '12px', padding: '1rem', background: '#F8FAFC' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#475569', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PieChart size={15} /> Category Breakdown
                    </h4>

                    {categoryData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8', fontSize: '0.8rem' }}>No expense records available</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {categoryData.slice(0, 5).map((item, idx) => {
                                const pct = expenseTotal > 0 ? Math.round((item.value / expenseTotal) * 100) : 0;
                                const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                                return (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                                                {item.name}
                                            </span>
                                            <span>{currencySymbol}{item.value.toLocaleString()} ({pct}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: colors[idx % colors.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. Monthly Savings Trend Line */}
                <div style={{ border: '1px solid #F1F5F9', borderRadius: '12px', padding: '1rem', background: '#F8FAFC', gridColumn: 'span 2' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#475569', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={15} /> Monthly Savings Growth
                    </h4>

                    {monthlyData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8', fontSize: '0.8rem' }}>No historical trend data found</div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {monthlyData.map((d, i) => (
                                <div key={i} style={{
                                    flex: '1',
                                    minWidth: '70px',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.55rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{d.month}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: d.savings < 0 ? '#EF4444' : '#10B981' }}>
                                        {d.savings >= 0 ? '+' : ''}{currencySymbol}{d.savings.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceAnalytics;
