import { useQuery } from '@tanstack/react-query';
import { investmentsService } from '../../services';
import { Globe, BarChart3, Bitcoin, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CryptoView = () => {
    // Fetch Crypto investments
    const { data: cryptos = [], isLoading } = useQuery({
        queryKey: ['investments-crypto'],
        queryFn: async () => {
            const data = await investmentsService.getInvestments();
            return data.filter(i => i.type === 'Crypto').map((c, idx) => ({
                rank: idx + 1,
                name: c.name,
                symbol: c.symbol || 'COIN',
                price: `$${parseFloat(c.amount).toLocaleString()}`,
                change: c.day_change || '+0.0%',
                positive: !c.day_change || !c.day_change.startsWith('-'),
                mcap: c.market_cap || 'N/A',
                color: c.color || '#F7931A'
            }));
        }
    });

    const overviewCards = [
        { label: 'Market Cap', value: '$2.1T', icon: Globe, color: '#1B6B3A', bg: '#DBEAFE' },
        { label: '24h Volume', value: '$98.5B', icon: BarChart3, color: '#7C3AED', bg: '#EDE9FE' },
        { label: 'Bitcoin Dominance', value: '48.2%', icon: Bitcoin, color: '#EA580C', bg: '#FFF7ED' },
        { label: 'Active Coins', value: cryptos.length.toString(), icon: Activity, color: '#16A34A', bg: '#DCFCE7' },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
                <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #DCF2E4', borderTopColor: '#F7931A', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="view-fade-in">
            <div className="inv-view-header">
                <h2 className="inv-view-title">Cryptocurrency</h2>
                <p className="inv-view-subtitle">Trade popular cryptocurrencies with real-time insights</p>
            </div>

            <div className="crypto-overview-grid">
                {overviewCards.map((card, i) => (
                    <div key={i} className="crypto-ov-card">
                        <div className="crypto-ov-icon" style={{ background: card.bg, color: card.color }}>
                            <card.icon size={20} />
                        </div>
                        <div>
                            <p className="crypto-ov-label">{card.label}</p>
                            <h3 className="crypto-ov-value">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="crypto-table-container">
                <h3 className="inv-section-title" style={{ padding: '1.25rem 1.5rem 0' }}>Top Cryptocurrencies</h3>
                <table className="crypto-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>24h Change</th>
                            <th>Market Cap</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cryptos.map(c => (
                            <tr key={c.rank}>
                                <td className="crypto-rank">{c.rank}</td>
                                <td>
                                    <div className="crypto-name-cell">
                                        <div className="crypto-coin-icon" style={{ background: c.color }}>
                                            {c.symbol.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="crypto-coin-name">{c.name}</div>
                                            <div className="crypto-coin-sym">{c.symbol}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="crypto-price">{c.price}</td>
                                <td>
                                    <span className={`crypto-change ${c.positive ? 'up' : 'down'}`}>
                                        {c.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {c.change}
                                    </span>
                                </td>
                                <td className="crypto-mcap">{c.mcap}</td>
                                <td>
                                    <button className="crypto-trade-btn">Trade</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .crypto-overview-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem;
                }
                .crypto-ov-card {
                    background: white; border-radius: 16px; padding: 1.25rem;
                    border: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s;
                }
                .crypto-ov-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
                .crypto-ov-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .crypto-ov-label { color: var(--text-muted); font-size: 0.8rem; font-weight: 500; margin-bottom: 0.25rem; }
                .crypto-ov-value { font-size: 1.3rem; font-weight: 700; color: var(--text-main); }

                .crypto-table-container {
                    background: white; border-radius: 16px; border: 1px solid var(--border-color);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;
                }
                .crypto-table { width: 100%; border-collapse: collapse; }
                .crypto-table thead tr { border-bottom: 1px solid var(--border-color); }
                .crypto-table th {
                    text-align: left; padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 500;
                    font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em;
                }
                .crypto-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
                .crypto-table tr:last-child td { border-bottom: none; }
                .crypto-table tr:hover { background: #F8FAFC; }

                .crypto-rank { font-weight: 600; color: var(--text-muted); width: 40px; }
                .crypto-name-cell { display: flex; align-items: center; gap: 0.75rem; }
                .crypto-coin-icon {
                    width: 36px; height: 36px; border-radius: 50%; color: white; font-weight: 700;
                    display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
                }
                .crypto-coin-name { font-weight: 600; color: var(--text-main); font-size: 0.9rem; }
                .crypto-coin-sym { font-size: 0.75rem; color: var(--text-muted); }
                .crypto-price { font-weight: 700; color: var(--text-main); font-family: 'Inter', monospace; }
                .crypto-change { display: flex; align-items: center; gap: 0.2rem; font-weight: 600; font-size: 0.85rem; }
                .crypto-change.up { color: #16A34A; }
                .crypto-change.down { color: #DC2626; }
                .crypto-mcap { font-weight: 500; color: var(--text-muted); }
                .crypto-trade-btn {
                    padding: 0.4rem 1rem; background: var(--primary); color: white; border: none;
                    border-radius: 8px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: background 0.2s;
                }
                .crypto-trade-btn:hover { background: var(--primary-hover); }

                @media (max-width: 1100px) { .crypto-overview-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 768px) {
                    .crypto-overview-grid { grid-template-columns: 1fr; }
                    .crypto-table th:nth-child(5), .crypto-table td:nth-child(5) { display: none; }
                }
            `}</style>
        </div>
    );
};

export default CryptoView;
