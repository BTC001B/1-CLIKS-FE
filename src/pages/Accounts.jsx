import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services';
import '../App.css';
import '../styles/modals.css';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Plus, Wallet, TrendingUp, TrendingDown, ShieldCheck, Smartphone, Globe } from 'lucide-react';

const ACCOUNT_TYPES = ['Checking', 'Savings', 'Credit Card', 'Investment'];

const THEMES = {
    Checking:    'dark-blue',
    Savings:     'emerald',
    'Credit Card': 'purple',
    Investment:  'orange',
};

const EMPTY_FORM = { bank: '', type: 'Checking', number: '', balance: '' };

const AccountStat = (props) => {
    const { label, value, subtext, icon: Icon, colorClass } = props;
    return (
    <div className="account-stat-card">
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

const Accounts = () => {
    const queryClient = useQueryClient();
    const [showBalances, setShowBalances] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');

    // Fetch account data
    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const data = await accountsService.getAccounts();
            // Map backend fields to frontend expectations if necessary
            return data.map(acc => ({
                id: acc.id,
                name: acc.name || `${acc.bank} ${acc.type}`,
                type: acc.type,
                bank: acc.bank,
                balance: parseFloat(acc.balance),
                accountNumber: acc.account_number || acc.accountNumber,
                theme: acc.theme || THEMES[acc.type] || 'dark-blue',
                network: acc.network || (acc.type === 'Investment' ? 'Invest' : acc.type === 'Credit Card' ? 'Card' : 'Bank'),
            }));
        }
    });

    // Create Account Mutation
    const createMutation = useMutation({
        mutationFn: (newAccount) => accountsService.createAccount(newAccount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            closeModal();
        },
        onError: (err) => {
            setFormError(err.message || 'Failed to link account. Please try again.');
        }
    });

    const openModal = () => {
        setFormData(EMPTY_FORM);
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.bank || !formData.type || !formData.balance) {
            setFormError('Bank name, account type, and balance are required.');
            return;
        }

        const rawNum = formData.number.replace(/\D/g, '');
        const masked = rawNum.length >= 4 ? `**** ${rawNum.slice(-4)}` : `**** ${Math.floor(1000 + Math.random() * 9000)}`;

        const newAccount = {
            name: `${formData.bank} ${formData.type}`,
            type: formData.type,
            bank: formData.bank,
            balance: parseFloat(formData.balance),
            account_number: masked, // Using backend naming convention
            theme: THEMES[formData.type] || 'dark-blue',
            network: formData.type === 'Investment' ? 'Invest' : formData.type === 'Credit Card' ? 'Card' : 'Bank',
        };

        createMutation.mutate(newAccount);
    };

    const totalBalance  = accounts.reduce((s, a) => s + a.balance, 0);
    const totalAssets   = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
    const totalLiab     = Math.abs(accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0));

    return (
        <div className="page-fade-in">
            <div className="dashboard-header">
                <div>
                    <p className="text-muted text-sm mt-1">Manage your banking &amp; investment portfolios</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowBalances(!showBalances)} className="btn-secondary">
                        {showBalances ? <EyeOff size={18} /> : <Eye size={18} />}
                        <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
                    </button>
                    <button className="btn-primary" onClick={openModal}>
                        <Plus size={18} />
                        <span>Link Account</span>
                    </button>
                </div>
            </div>

            <div className="content-wrapper">
                {/* Stats */}
                <div className="account-stats-grid">
                    <AccountStat label="Net Worth"     value={showBalances ? `$${totalBalance.toLocaleString()}` : '••••••••'} subtext="Total cumulative value"  icon={Wallet}      colorClass="icon-blue"  />
                    <AccountStat label="Total Assets"  value={showBalances ? `$${totalAssets.toLocaleString()}`  : '••••••••'} subtext="Liquid & fixed assets"   icon={TrendingUp}  colorClass="icon-green" />
                    <AccountStat label="Liabilities"   value={showBalances ? `$${totalLiab.toLocaleString()}`   : '••••••••'} subtext="Outstanding debt"         icon={TrendingDown} colorClass="icon-red"   />
                </div>

                {/* Cards */}
                <div className="cards-grid">
                    {accounts.map((account) => (
                        <div key={account.id} className={`bank-card theme-${account.theme}`}>
                            <div className="card-top">
                                <div className="card-chip" />
                                <div className="card-contactless"><ShieldCheck size={18} /></div>
                            </div>
                            <div className="card-balance-section">
                                <span className="card-label">Current Balance</span>
                                <h3 className="card-balance">
                                    {showBalances ? `$${Math.abs(account.balance).toLocaleString()}` : '•••• •••• ••••'}
                                </h3>
                            </div>
                            <div className="card-details">
                                <div className="card-info">
                                    <div className="card-holder">{account.name}</div>
                                    <div className="card-number">{account.accountNumber}</div>
                                </div>
                                <div className="card-brand">{account.bank}</div>
                            </div>
                            <div className="card-actions-overlay">
                                <button className="overlay-btn"><Smartphone size={16} /> Pay</button>
                                <button className="overlay-btn"><Globe size={16} /> Details</button>
                            </div>
                        </div>
                    ))}

                    {/* Add placeholder */}
                    <div className="add-card-placeholder" onClick={openModal}>
                        <div className="placeholder-content">
                            <div className="plus-circle"><Plus size={24} /></div>
                            <span className="font-medium">Add New Account</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Link Account Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">Link Account</h2>
                                <button className="modal-close-btn" onClick={closeModal}><X size={16} /></button>
                            </div>

                            <form className="modal-form" onSubmit={handleSubmit}>
                                <div className="modal-field">
                                    <label className="modal-label">Bank Name</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="e.g. Chase Bank"
                                        value={formData.bank}
                                        onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                                    />
                                </div>

                                <div className="modal-field">
                                    <label className="modal-label">Account Type</label>
                                    <select
                                        className="modal-select"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {ACCOUNT_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="modal-field">
                                    <label className="modal-label">Account Number (last 4 digits)</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="e.g. 4521"
                                        maxLength={16}
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    />
                                </div>

                                <div className="modal-field">
                                    <label className="modal-label">Current Balance ($)</label>
                                    <input
                                        type="number"
                                        className="modal-input"
                                        placeholder="0.00"
                                        value={formData.balance}
                                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    />
                                </div>

                                {formError && <p className="modal-error">{formError}</p>}

                                <div className="modal-footer">
                                    <button type="button" className="modal-btn-cancel" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="modal-btn-submit">Link Account</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .page-fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .btn-secondary {
                    background: white; border: 1px solid var(--border-color); color: var(--text-muted);
                    padding: 0.5rem 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; font-size: 0.875rem;
                }
                .btn-secondary:hover { background: #F8FAFC; color: var(--text-main); }

                .account-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .account-stat-card {
                    background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .stat-label { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
                .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
                .stat-subtext { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }
                
                .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .icon-blue { background: #DBEAFE; color: #1B6B3A; }
                .icon-green { background: #DCFCE7; color: #16A34A; }
                .icon-red { background: #FEE2E2; color: #EF4444; }

                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 2rem;
                }

                .bank-card {
                    height: 220px; border-radius: 20px; padding: 1.5rem; color: white;
                    display: flex; flex-direction: column; justify-content: space-between;
                    position: relative; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
                    transition: transform 0.3s; overflow: hidden; cursor: pointer;
                }

                .bank-card:hover { transform: translateY(-5px); }
                .bank-card:hover .card-actions-overlay { opacity: 1; }

                .theme-dark-blue { background: linear-gradient(135deg, #064E3B 0%, #22C55E 100%); }
                .theme-emerald { background: linear-gradient(135deg, #065F46 0%, #10B981 100%); }
                .theme-purple { background: linear-gradient(135deg, #581C87 0%, #8B5CF6 100%); }
                .theme-orange { background: linear-gradient(135deg, #9A3412 0%, #F97316 100%); }

                .card-top { display: flex; justify-content: space-between; align-items: center; }
                .card-chip { width: 40px; height: 30px; background: rgba(255,255,255,0.2); border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); }
                .card-contactless { opacity: 0.8; }

                .card-balance-section { margin-top: 1rem; }
                .card-label { font-size: 0.75rem; opacity: 0.8; letter-spacing: 0.05em; text-transform: uppercase; }
                .card-balance { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }

                .card-details { display: flex; justify-content: space-between; align-items: flex-end; }
                .card-holder { font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
                .card-number { font-family: monospace; font-size: 1rem; opacity: 0.9; }
                .card-brand { font-size: 1rem; font-weight: 700; font-style: italic; opacity: 0.9; }

                .card-actions-overlay {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; gap: 1rem;
                    opacity: 0; transition: opacity 0.2s;
                }

                .overlay-btn {
                    background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);
                    padding: 0.5rem 1rem; border-radius: 8px; color: white; display: flex; align-items: center; gap: 0.5rem;
                    font-weight: 500; font-size: 0.9rem; transition: background 0.2s;
                }
                .overlay-btn:hover { background: white; color: var(--text-main); }

                .add-card-placeholder {
                    height: 220px; border: 2px dashed var(--border-color); border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; background: #F8FAFC; transition: all 0.2s; color: var(--text-muted);
                }
                .add-card-placeholder:hover { border-color: var(--primary); color: var(--primary); background: #F0FDF4; }
                .placeholder-content { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
                .plus-circle { width: 48px; height: 48px; border-radius: 50%; background: white; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; }
            `}</style>
        </div>
    );
};

export default Accounts;
