import { useQuery } from '@tanstack/react-query';
import { debtsService } from '../services';
import {
    Banknote,
    Plus,
    AlertCircle,
    Calendar,
    TrendingDown,
    IndianRupee,
    Edit2,
    Trash2,
    Percent,
    ArrowRight,
    Landmark,
    CreditCard,
    GraduationCap,
    Car,
    Globe
} from 'lucide-react';
import '../App.css';
import { formatCurrency } from '../lib/formatCurrency';

const ICON_MAP = {
    GraduationCap: GraduationCap,
    CreditCard: CreditCard,
    Car: Car,
    Landmark: Landmark,
    Default: Globe
};

const DebtStat = (props) => {
    const { label, value, subtext, icon: Icon, colorClass } = props;
    return (
    <div className="debt-stat-card">
        <div className="flex justify-between items-start">
            <div>
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className={`stat-icon-wrapper ${colorClass}`}>
                <Icon size={20} />
            </div>
        </div>
        <p className="stat-subtext">{subtext}</p>
    </div>
    );
};

const Debts = () => {
    // Fetch debts
    const { data: debts = [], isLoading } = useQuery({
        queryKey: ['debts'],
        queryFn: async () => {
            const data = await debtsService.getDebts();
            return data.map(d => ({
                id: d.id,
                name: d.name,
                totalAmount: parseFloat(d.total_amount),
                remaining: parseFloat(d.remaining_amount),
                interestRate: parseFloat(d.interest_rate),
                monthlyPayment: parseFloat(d.monthly_payment),
                dueDate: d.due_date,
                type: d.type,
                icon: ICON_MAP[d.icon] || ICON_MAP.Default
            }));
        }
    });

    const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
    const totalMonthlyPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
    const totalPaid = debts.reduce((sum, d) => sum + (d.totalAmount - d.remaining), 0);
    const totalOriginal = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const overallProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#EF4444', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="page-fade-in">
            <div className="dashboard-header">
                <div>

                    <p className="text-muted text-sm mt-1">Manage liabilities and track payoff progress</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Add Debt</span>
                </button>
            </div>

            <div className="content-wrapper">
                {/* Stats */}
                <div className="debt-stats-grid">
                    <DebtStat
                        label="Total Outstanding"
                        value={formatCurrency(totalDebt)}
                        subtext="Principal remaining"
                        icon={Banknote}
                        colorClass="icon-red"
                    />
                    <DebtStat
                        label="Monthly Liability"
                        value={formatCurrency(totalMonthlyPayment)}
                        subtext="Required minimums"
                        icon={Calendar}
                        colorClass="icon-orange"
                    />
                    <DebtStat
                        label="Debt Paid Off"
                        value={`${overallProgress.toFixed(1)}%`}
                        subtext={`${formatCurrency(totalPaid)} cleared`}
                        icon={TrendingDown}
                        colorClass="icon-green"
                    />
                </div>

                {/* Main Content: Two Columns */}
                <div className="debt-layout">
                    {/* Left: Debt List */}
                    <div className="debt-list-section">
                        <h2 className="section-title">Active Liabilities</h2>
                        <div className="debt-cards-list">
                            {debts.map((debt) => {
                                const progress = ((debt.totalAmount - debt.remaining) / debt.totalAmount) * 100;
                                return (
                                    <div key={debt.id} className="debt-card-row">
                                        <div className="row-header">
                                            <div className="flex items-center gap-3">
                                                <div className="debt-icon-box">
                                                    <debt.icon size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-main">{debt.name}</h3>
                                                    <div className="text-xs text-muted">APR: <span className="text-orange">{debt.interestRate}%</span></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-main">{formatCurrency(debt.remaining)}</div>
                                                <div className="text-xs text-muted">of {formatCurrency(debt.totalAmount)}</div>
                                            </div>
                                        </div>

                                        <div className="progress-section">
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill bg-green"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="progress-labels">
                                                <span>{progress.toFixed(0)}% Paid</span>
                                                <span className="text-muted">{formatCurrency(debt.totalAmount - debt.remaining)} paid</span>
                                            </div>
                                        </div>

                                        <div className="row-footer">
                                            <div className="flex gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-muted">
                                                    <Calendar size={14} /> Due {new Date(debt.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1 text-main font-medium">
                                                    <IndianRupee size={14} /> {formatCurrency(debt.monthlyPayment)}/mo
                                                </div>
                                            </div>
                                            <button className="text-btn">Details <ArrowRight size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Strategy / Payoff (Simplified Visual) */}
                    <div className="strategy-section">
                        <div className="strategy-card bg-payoff">
                            <h3>Debt Free Countdown</h3>
                            <div className="countdown-circle">
                                <span className="months-left">18</span>
                                <span className="label">Months</span>
                            </div>
                            <p>Estimated debt-free date: <strong>July 2027</strong> based on current payments.</p>
                            <button className="btn-white-outline">Adjust Strategy</button>
                        </div>

                        <div className="snowball-card">
                            <h4><Percent size={18} /> Highest Interest</h4>
                            <p>Focusing on <strong>{debts.reduce((prev, current) => (prev.interestRate > current.interestRate) ? prev : current).name}</strong> could save you {formatCurrency(4500)} in interest.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .page-fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .debt-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .debt-stat-card {
                    background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .stat-label { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .stat-subtext { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }

                .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .icon-red { background: #FEE2E2; color: #EF4444; }
                .icon-orange { background: #FFEDD5; color: #F97316; }
                .icon-green { background: #DCFCE7; color: #16A34A; }

                .debt-layout {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .debt-list-section {
                    display: flex; flex-direction: column; gap: 1rem;
                }

                .section-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem; }

                .debt-cards-list { display: flex; flex-direction: column; gap: 1rem; }

                .debt-card-row {
                    background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.25rem;
                    transition: all 0.2s;
                }
                .debt-card-row:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-color: #CBD5E1; }

                .row-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
                .debt-icon-box { width: 40px; height: 40px; background: #F8FAFC; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
                .text-orange { color: #F97316; font-weight: 600; }

                .progress-section { margin-bottom: 1rem; }
                .progress-bar-bg { width: 100%; height: 8px; background: #F0FDF4; border-radius: 99px; overflow: hidden; margin-bottom: 0.5rem; }
                .progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease-out; }
                .bg-green { background: #16A34A; }

                .progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 500; color: #16A34A; }

                .row-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-color); }
                .text-btn { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: var(--primary); display: flex; items-center; gap: 0.25rem; letter-spacing: 0.05em; }

                /* Strategy Section */
                .strategy-section { display: flex; flex-direction: column; gap: 1.5rem; }

                .strategy-card {
                    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                    color: white; padding: 1.5rem; border-radius: 20px; text-align: center;
                    display: flex; flex-direction: column; align-items: center; gap: 1rem;
                    box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.3);
                }
                .countdown-circle {
                    width: 100px; height: 100px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    margin: 0.5rem 0;
                }
                .months-left { font-size: 2.5rem; font-weight: 800; line-height: 1; }
                .label { font-size: 0.8rem; opacity: 0.9; text-transform: uppercase; }
                
                .btn-white-outline {
                    border: 1px solid rgba(255,255,255,0.5); padding: 0.5rem 1rem; border-radius: 8px;
                    font-size: 0.9rem; font-weight: 500; width: 100%; transition: background 0.2s;
                }
                .btn-white-outline:hover { background: rgba(255,255,255,0.1); }

                .snowball-card {
                    background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.25rem;
                }
                .snowball-card h4 { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem; }
                .snowball-card p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

                @media (max-width: 900px) {
                    .debt-layout { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Debts;
