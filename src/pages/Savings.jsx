import { useQuery } from '@tanstack/react-query';
import { savingsService } from '../services';
import {
    PiggyBank,
    Plus,
    Target,
    TrendingUp,
    Calendar,
    DollarSign,
    Edit2,
    Trash2,
    Plane,
    Home,
    Car,
    Shield,
    Globe
} from 'lucide-react';
import '../App.css';

const ICON_MAP = {
    Shield: Shield,
    Plane: Plane,
    Car: Car,
    Home: Home,
    Default: Globe
};

const SavingsStat = (props) => {
    const { label, value, subtext, icon: Icon, colorClass } = props;
    return (
    <div className="savings-stat-card">
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

const Savings = () => {
    // Fetch savings goals
    const { data: savingsGoals = [], isLoading } = useQuery({
        queryKey: ['savings-goals'],
        queryFn: async () => {
            const data = await savingsService.getSavings();
            return data.map(goal => ({
                id: goal.id,
                name: goal.name,
                target: parseFloat(goal.target_amount),
                current: parseFloat(goal.current_amount),
                deadline: goal.deadline,
                color: goal.color || 'blue',
                priority: goal.priority || 'Medium',
                icon: ICON_MAP[goal.icon] || ICON_MAP.Default
            }));
        }
    });

    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #DCF2E4', borderTopColor: '#10B981', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="page-fade-in">
            <div className="dashboard-header">
                <div>

                    <p className="text-muted text-sm mt-1">Track your financial goals and progress</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>New Goal</span>
                </button>
            </div>

            <div className="content-wrapper">
                {/* Stats */}
                <div className="savings-stats-grid">
                    <SavingsStat
                        label="Total Saved"
                        value={`$${totalSaved.toLocaleString()}`}
                        subtext="+12% vs last month"
                        icon={PiggyBank}
                        colorClass="icon-green"
                    />
                    <SavingsStat
                        label="Total Target"
                        value={`$${totalTarget.toLocaleString()}`}
                        subtext={`${savingsGoals.length} active goals`}
                        icon={Target}
                        colorClass="icon-blue"
                    />
                    <SavingsStat
                        label="Overall Progress"
                        value={`${overallProgress.toFixed(1)}%`}
                        subtext="On track to completion"
                        icon={TrendingUp}
                        colorClass="icon-purple"
                    />
                </div>

                {/* Goals Grid */}
                <div className="goals-grid">
                    {savingsGoals.map((goal) => {
                        const progress = (goal.current / goal.target) * 100;
                        return (
                            <div key={goal.id} className="goal-card">
                                <div className="goal-header">
                                    <div className={`goal-icon-box bg-${goal.color}`}>
                                        <goal.icon size={24} />
                                    </div>
                                    <span className={`priority-badge priority-${goal.priority}`}>
                                        {goal.priority} Priority
                                    </span>
                                </div>

                                <div className="goal-body">
                                    <h3 className="goal-title">{goal.name}</h3>
                                    <div className="goal-dates">
                                        <Calendar size={14} />
                                        Target: {new Date(goal.deadline).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="goal-footer">
                                    <div className="progress-info">
                                        <span className="current-amt">${goal.current.toLocaleString()}</span>
                                        <span className="target-amt">of ${goal.target.toLocaleString()}</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className={`progress-bar-fill bg-${goal.color}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="pct-text">{progress.toFixed(0)}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .page-fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .savings-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .savings-stat-card {
                    background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .stat-label { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .stat-subtext { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }
                
                .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .icon-blue { background: #DBEAFE; color: #1B6B3A; }
                .icon-green { background: #DCFCE7; color: #16A34A; }
                .icon-purple { background: #F3E8FF; color: #9333EA; }

                /* Goals Grid */
                .goals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .goal-card {
                    background: white; border-radius: 16px; border: 1px solid var(--border-color);
                    padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; flex-direction: column; gap: 1rem;
                }
                .goal-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

                .goal-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .goal-icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
                
                .priority-badge { font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 99px; border: 1px solid; font-weight: 500; }
                .priority-High { background: #FEE2E2; color: #DC2626; border-color: #FECACA; }
                .priority-Medium { background: #FEF3C7; color: #D97706; border-color: #FDE68A; }
                .priority-Low { background: #F0FDF4; color: #64748B; border-color: #E2E8F0; }

                .bg-blue { background: #22C55E; }
                .bg-purple { background: #A855F7; }
                .bg-green { background: #22C55E; }
                .bg-orange { background: #F97316; }

                .goal-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; }
                .goal-dates { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }

                /* Progress Section */
                .progress-info { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.5rem; }
                .current-amt { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
                .target-amt { font-size: 0.9rem; color: var(--text-muted); }

                .progress-bar-bg { width: 100%; height: 8px; background: #F0FDF4; border-radius: 99px; overflow: hidden; margin-bottom: 0.5rem; }
                .progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease-out; }
                
                .pct-text { text-align: right; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default Savings;
