import { useQuery } from '@tanstack/react-query';
import { investmentsService } from '../../services';
import { TrendingUp, ArrowUpRight, Shield, BarChart3, Wallet, Target } from 'lucide-react';

const SIPView = () => {
    // Fetch SIPs
    const { data: sips = [], isLoading } = useQuery({
        queryKey: ['investments-sip'],
        queryFn: async () => {
            const data = await investmentsService.getInvestments();
            return data.filter(i => i.type === 'SIP').map(i => ({
                id: i.id,
                name: i.name,
                returns: i.expected_returns || '12–15%',
                risk: i.risk_level || 'Medium',
                min: `₹${parseFloat(i.amount).toLocaleString()}`,
                amount: parseFloat(i.amount)
            }));
        }
    });

    const activeCount = sips.length;
    const monthlyTotal = sips.reduce((sum, s) => sum + s.amount, 0);

    const summaryCards = [
        { label: 'Active SIPs', value: activeCount.toString(), icon: Target, color: '#1B6B3A', bg: '#DBEAFE' },
        { label: 'Monthly Investment', value: `₹${(monthlyTotal / 1000).toFixed(1)}K`, icon: Wallet, color: '#7C3AED', bg: '#EDE9FE' },
        { label: 'Total Returns', value: '+18.5%', icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7' },
        { label: 'Portfolio Value', value: '₹8.2L', icon: BarChart3, color: '#EA580C', bg: '#FFF7ED' },
    ];

    const plans = sips.length > 0 ? sips : [
        { name: 'Conservative Plan', returns: '12–15%', risk: 'Low', riskColor: '#16A34A', riskBg: '#DCFCE7', min: '₹500', icon: Shield },
        { name: 'Balanced Plan', returns: '12–15%', risk: 'Medium', riskColor: '#CA8A04', riskBg: '#FEF9C3', min: '₹500', icon: BarChart3 },
        { name: 'Aggressive Plan', returns: '12–15%', risk: 'High', riskColor: '#DC2626', riskBg: '#FEE2E2', min: '₹500', icon: TrendingUp },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
                <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #DCF2E4', borderTopColor: '#1B6B3A', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="view-fade-in">
            <div className="inv-view-header">
                <h2 className="inv-view-title">SIP Investment</h2>
                <p className="inv-view-subtitle">Systematic Investment Plans for steady wealth building</p>
            </div>

            <div className="sip-summary-grid">
                {summaryCards.map((card, i) => (
                    <div key={i} className="sip-summary-card">
                        <div className="sip-summary-top">
                            <div>
                                <p className="sip-summary-label">{card.label}</p>
                                <h3 className="sip-summary-value">{card.value}</h3>
                            </div>
                            <div className="sip-summary-icon" style={{ background: card.bg, color: card.color }}>
                                <card.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="inv-section-title">Investment Plans</h3>
            <div className="sip-plans-grid">
                {plans.map((plan, i) => (
                    <div key={i} className="sip-plan-card">
                        <div className="sip-plan-icon-wrap">
                            <plan.icon size={24} />
                        </div>
                        <h4 className="sip-plan-name">{plan.name}</h4>
                        <div className="sip-plan-details">
                            <div className="sip-plan-row">
                                <span className="sip-plan-label">Expected Returns</span>
                                <span className="sip-plan-val">{plan.returns}</span>
                            </div>
                            <div className="sip-plan-row">
                                <span className="sip-plan-label">Risk Level</span>
                                <span className="sip-plan-risk" style={{ background: plan.riskBg, color: plan.riskColor }}>{plan.risk}</span>
                            </div>
                            <div className="sip-plan-row">
                                <span className="sip-plan-label">Min Investment</span>
                                <span className="sip-plan-val">{plan.min}</span>
                            </div>
                        </div>
                        <button className="sip-explore-btn">
                            Explore Plan <ArrowUpRight size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                .inv-view-header { margin-bottom: 1.5rem; }
                .inv-view-title { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .inv-view-subtitle { color: var(--text-muted); font-size: 0.9rem; }
                .inv-section-title { font-size: 1.15rem; font-weight: 600; color: var(--text-main); margin-bottom: 1rem; }

                .sip-summary-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem;
                }
                .sip-summary-card {
                    background: white; border-radius: 16px; padding: 1.25rem 1.5rem;
                    border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .sip-summary-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
                .sip-summary-top { display: flex; justify-content: space-between; align-items: flex-start; }
                .sip-summary-label { color: var(--text-muted); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem; }
                .sip-summary-value { font-size: 1.4rem; font-weight: 700; color: var(--text-main); }
                .sip-summary-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

                .sip-plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
                .sip-plan-card {
                    background: white; border-radius: 16px; padding: 1.5rem;
                    border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .sip-plan-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
                .sip-plan-icon-wrap {
                    width: 48px; height: 48px; border-radius: 14px; background: #F0FDF4; color: var(--primary);
                    display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
                }
                .sip-plan-name { font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 1rem; }
                .sip-plan-details { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }
                .sip-plan-row { display: flex; justify-content: space-between; align-items: center; }
                .sip-plan-label { color: var(--text-muted); font-size: 0.85rem; }
                .sip-plan-val { font-weight: 600; font-size: 0.85rem; color: var(--text-main); }
                .sip-plan-risk { padding: 0.15rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
                .sip-explore-btn {
                    width: 100%; padding: 0.65rem; background: var(--primary); color: white;
                    border: none; border-radius: 10px; font-weight: 600; font-size: 0.85rem;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
                    transition: background 0.2s;
                }
                .sip-explore-btn:hover { background: var(--primary-hover); }

                @media (max-width: 1100px) { .sip-summary-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 900px) { .sip-plans-grid { grid-template-columns: 1fr; } }
                @media (max-width: 600px) { .sip-summary-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default SIPView;
