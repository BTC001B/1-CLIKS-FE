import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Users,
    BarChart2,
    Bitcoin,
    Newspaper,
    Calendar,
    Heart,
    MessageCircle,
    Share2,
    Image,
    MoreHorizontal,
    Flame,
    Send,
    Rss,
    Star,
} from 'lucide-react';
import '../../styles/social.css';
import '../../App.css';

// ─────────────────────────────────────────────
//  Static seed data
// ─────────────────────────────────────────────
const SEED_POSTS = [
    {
        id: 1,
        user: 'Michael Chen',
        initials: 'MC',
        role: 'Crypto Trader',
        roleClass: 'role-crypto',
        avatarClass: 'sf-avatar-orange',
        time: '2 min ago',
        content: 'Bitcoin is showing strong resistance at $45k. Expecting a breakout in the next 48 hours — volume is accumulating on the lower timeframes. This is a classic Wyckoff spring setup. 🚀',
        tags: ['#Bitcoin', '#BTC', '#CryptoTrading'],
        likes: 42,
        comments: 9,
        hasChart: true,
        chartLabel: 'BTC / USD',
        chartPrice: '$44,890',
        chartChange: '+3.42%',
        chartBars: [30, 45, 28, 60, 42, 54, 38, 72, 55, 80, 65, 90],
        liked: false,
    },
    {
        id: 2,
        user: 'Sarah Jennings',
        initials: 'SJ',
        role: 'Investor',
        roleClass: 'role-investor',
        avatarClass: 'sf-avatar-blue',
        time: '15 min ago',
        content: 'Tech stocks looking undeniably bullish this week. NVDA just broke through its previous ATH with conviction. Holding my position and adding more on dips. Long-term the AI computing demand thesis remains intact.',
        tags: ['#Stocks', '#NVDA', '#TechStocks'],
        likes: 118,
        comments: 23,
        hasChart: false,
        liked: false,
    },
    {
        id: 3,
        user: 'Rahul Kapoor',
        initials: 'RK',
        role: 'Analyst',
        roleClass: 'role-analyst',
        avatarClass: 'sf-avatar-purple',
        time: '1 hr ago',
        content: 'Just published my macro analysis for Q2 2026. Key thesis: Fed will cut rates by July as labor data softens. This creates a tailwind for small-cap growth stocks that have been crushed under high rates. My top picks: see thread below 👇',
        tags: ['#MacroAnalysis', '#FedPolicy', '#SmallCap'],
        likes: 230,
        comments: 47,
        hasChart: false,
        liked: false,
    },
    {
        id: 4,
        user: 'Elena Ross',
        initials: 'ER',
        role: 'Trader',
        roleClass: 'role-trader',
        avatarClass: 'sf-avatar-green',
        time: '2 hrs ago',
        content: 'Closed out my oil futures position today with a 22% gain. Geopolitical tension in the Middle East was the catalyst. Now rotating into gold — it\'s the classic flight to safety and we\'re seeing momentum build in XAU/USD.',
        tags: ['#Commodities', '#Oil', '#Gold'],
        likes: 88,
        comments: 14,
        hasChart: true,
        chartLabel: 'XAUUSD',
        chartPrice: '$2,341',
        chartChange: '+1.8%',
        chartBars: [45, 50, 38, 55, 62, 48, 70, 65, 75, 68, 82, 90],
        liked: false,
    },
    {
        id: 5,
        user: 'James Patel',
        initials: 'JP',
        role: 'Advisor',
        roleClass: 'role-advisor',
        avatarClass: 'sf-avatar-teal',
        time: '3 hrs ago',
        content: 'Reminder: Dollar-cost averaging (DCA) is not glamorous — but it\'s the strategy that quietly builds wealth over decades. Stop trying to time the market and start time IN the market. Your future self will thank you.',
        tags: ['#Investing101', '#DCA', '#LongTerm'],
        likes: 305,
        comments: 62,
        hasChart: false,
        liked: false,
    },
];

const NAV_ITEMS = [
    { id: 'trending',    label: 'Trending',      Icon: Flame   },
    { id: 'investors',   label: 'Investors',      Icon: Users   },
    { id: 'trading',     label: 'Trading Ideas',  Icon: BarChart2 },
    { id: 'crypto',      label: 'Crypto',         Icon: Bitcoin },
    { id: 'news',        label: 'Market News',    Icon: Newspaper },
    { id: 'meetups',     label: 'Meetups',        Icon: Calendar },
];

const TRENDING_STOCKS = [
    { ticker: 'AAPL', name: 'Apple Inc.',      change: '+2.34%', pos: true  },
    { ticker: 'TSLA', name: 'Tesla Inc.',      change: '-1.12%', pos: false },
    { ticker: 'NVDA', name: 'NVIDIA Corp.',    change: '+5.67%', pos: true  },
    { ticker: 'MSFT', name: 'Microsoft Corp.', change: '+1.89%', pos: true  },
];

const CRYPTO_DATA = [
    { symbol: '₿', name: 'Bitcoin',  ticker: 'BTC', price: '$44,890', change: '+3.42%', pos: true  },
    { symbol: 'Ξ', name: 'Ethereum', ticker: 'ETH', price: '$2,810',  change: '+1.95%', pos: true  },
    { symbol: 'S', name: 'Solana',   ticker: 'SOL', price: '$142',    change: '-0.84%', pos: false },
];

const EVENTS = [
    { name: 'Fed Rate Decision',    date: 'Mar 20, 2026 · 2:00 PM', dotColor: '#EF4444', badge: 'soon',     badgeLabel: 'Soon'     },
    { name: 'NVDA Earnings Call',   date: 'Mar 25, 2026 · 5:00 PM', dotColor: '#F59E0B', badge: 'upcoming', badgeLabel: 'Coming'   },
    { name: 'Bitcoin ETF Summit',   date: 'Apr 02, 2026 · All Day',  dotColor: '#195BAC', badge: 'upcoming', badgeLabel: 'Upcoming' },
    { name: 'CPI Data Release',     date: 'Apr 10, 2026 · 8:30 AM',  dotColor: '#10B981', badge: 'upcoming', badgeLabel: 'Upcoming' },
];

// ─────────────────────────────────────────────
//  Post Chart Mockup
// ─────────────────────────────────────────────
const ChartMockup = ({ label, price, change, bars }) => {
    const max = Math.max(...bars);
    return (
        <div className="sf-chart-mockup">
            <span className="sf-chart-label">{label}</span>
            <div className="sf-chart-bars-row">
                {bars.map((h, i) => (
                    <div
                        key={i}
                        className={`sf-chart-bar ${i === bars.length - 1 ? 'highlight' : ''}`}
                        style={{ height: `${(h / max) * 50}px` }}
                    />
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span className="sf-chart-price">{price}</span>
                <span className="sf-chart-change">{change}</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
//  Main SocialFeed Component
// ─────────────────────────────────────────────
export default function SocialFeed() {
    const [posts, setPosts] = useState(SEED_POSTS);
    const [activeNav, setActiveNav] = useState('trending');
    const [activeFilter, setActiveFilter] = useState('For You');
    const [draft, setDraft] = useState('');

    const handleLike = (id) => {
        setPosts(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
                    : p
            )
        );
    };

    const handlePost = () => {
        if (!draft.trim()) return;
        const newPost = {
            id: Date.now(),
            user: 'You',
            initials: 'Y',
            role: 'Trader',
            roleClass: 'role-trader',
            avatarClass: 'sf-avatar-blue',
            time: 'Just now',
            content: draft.trim(),
            tags: [],
            likes: 0,
            comments: 0,
            hasChart: false,
            liked: false,
        };
        setPosts(prev => [newPost, ...prev]);
        setDraft('');
    };

    const getRoleLabel = (role) => {
        const map = {
            'Crypto Trader': 'Crypto Trader',
            'Investor':      'Investor',
            'Analyst':       'Analyst',
            'Trader':        'Trader',
            'Advisor':       'Advisor',
        };
        return map[role] || role;
    };

    return (
        <div className="sf-layout">
            {/* ═══════════════════════════════
                LEFT SIDEBAR
                ═══════════════════════════════ */}
            <aside className="sf-sidebar-left">
                {/* Mini profile */}
                <div className="sf-community-card" style={{ marginBottom: '1rem' }}>
                    <div className="sf-profile-mini">
                        <div className="sf-profile-avatar">You</div>
                        <div>
                            <div className="sf-profile-name">Your Profile</div>
                            <div className="sf-profile-role">Trader · Community Member</div>
                        </div>
                    </div>
                    <div className="sf-sidebar-divider" />
                </div>

                {/* Community navigation */}
                <div className="sf-community-card">
                    <div className="sf-community-title">Community</div>
                    {NAV_ITEMS.map((item) => {
                        const { id, label, Icon } = item;
                        return (
                            <button
                                key={id}
                                className={`sf-nav-item ${activeNav === id ? 'active' : ''}`}
                                onClick={() => setActiveNav(id)}
                            >
                                <div className="sf-nav-icon">
                                    <Icon size={15} />
                                </div>
                                {label}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* ═══════════════════════════════
                CENTER FEED
                ═══════════════════════════════ */}
            <main className="sf-feed-col">
                {/* Compose Card */}
                <div className="sf-compose-card">
                    <div className="sf-compose-top">
                        <div className="sf-compose-avatar">Y</div>
                        <textarea
                            className="sf-compose-textarea"
                            placeholder="Write something about markets, insights, or trading ideas…"
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost();
                            }}
                            rows={3}
                        />
                    </div>
                    <div className="sf-compose-actions">
                        <div className="sf-compose-tools">
                            <button className="sf-tool-btn">
                                <Image size={14} />
                                <span>Add Image</span>
                            </button>
                            <button className="sf-tool-btn">
                                <BarChart2 size={14} />
                                <span>Add Chart</span>
                            </button>
                        </div>
                        <button className="sf-post-btn" onClick={handlePost}>
                            <Send size={13} style={{ marginRight: '0.35rem', display: 'inline' }} />
                            Post
                        </button>
                    </div>
                </div>

                {/* Feed filter tabs */}
                <div className="sf-feed-section-header">
                    <span className="sf-feed-section-title">Feed</span>
                    <div className="sf-feed-filter-tabs">
                        {['For You', 'Following', 'Trending'].map(tab => (
                            <button
                                key={tab}
                                className={`sf-filter-tab ${activeFilter === tab ? 'active' : ''}`}
                                onClick={() => setActiveFilter(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts */}
                <AnimatePresence initial={false}>
                    {posts.length === 0 ? (
                        <div className="sf-empty">
                            <div className="sf-empty-icon">
                                <Rss size={24} />
                            </div>
                            <div className="sf-empty-title">No posts yet</div>
                            <div className="sf-empty-desc">Start the conversation about markets</div>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <Motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                                <div className="sf-post-card">
                                    {/* Header */}
                                    <div className="sf-post-header">
                                        <div className={`sf-post-avatar ${post.avatarClass}`}>
                                            {post.initials}
                                        </div>
                                        <div className="sf-post-meta">
                                            <div className="sf-post-username">{post.user}</div>
                                            <span className={`sf-role-badge ${post.roleClass}`}>
                                                {getRoleLabel(post.role)}
                                            </span>
                                            <div className="sf-post-time">{post.time}</div>
                                        </div>
                                        <button className="sf-post-menu">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <p className="sf-post-content">{post.content}</p>

                                    {/* Chart mockup (if any) */}
                                    {post.hasChart && (
                                        <ChartMockup
                                            label={post.chartLabel}
                                            price={post.chartPrice}
                                            change={post.chartChange}
                                            bars={post.chartBars}
                                        />
                                    )}

                                    {/* Tags */}
                                    {post.tags.length > 0 && (
                                        <div className="sf-post-tags">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="sf-tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Interaction bar */}
                                    <div className="sf-interact-bar">
                                        <button
                                            className={`sf-interact-btn ${post.liked ? 'liked' : ''}`}
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <Heart size={15} fill={post.liked ? 'currentColor' : 'none'} />
                                            <span>{post.likes}</span>
                                        </button>
                                        <button className="sf-interact-btn">
                                            <MessageCircle size={15} />
                                            <span>{post.comments}</span>
                                        </button>
                                        <div className="sf-interact-spacer" />
                                        <button className="sf-interact-btn">
                                            <Share2 size={15} />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            </Motion.div>
                        ))
                    )}
                </AnimatePresence>
            </main>

            {/* ═══════════════════════════════
                RIGHT SIDEBAR
                ═══════════════════════════════ */}
            <aside className="sf-sidebar-right">
                {/* Trending Stocks */}
                <div className="sf-widget">
                    <div className="sf-widget-title">
                        <TrendingUp size={12} style={{ marginRight: '0.4rem', display: 'inline', verticalAlign: 'middle' }} />
                        Trending Stocks
                    </div>
                    {TRENDING_STOCKS.map(stock => (
                        <div key={stock.ticker} className="sf-stock-row">
                            <div className="sf-stock-icon">{stock.ticker}</div>
                            <div style={{ flex: 1 }}>
                                <div className="sf-stock-name">{stock.name}</div>
                                <div className="sf-stock-ticker">{stock.ticker}</div>
                            </div>
                            <span className={`sf-stock-change ${stock.pos ? 'sf-change-pos' : 'sf-change-neg'}`}>
                                {stock.change}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Crypto Market */}
                <div className="sf-widget">
                    <div className="sf-widget-title">
                        <Bitcoin size={12} style={{ marginRight: '0.4rem', display: 'inline', verticalAlign: 'middle' }} />
                        Crypto Market
                    </div>
                    {CRYPTO_DATA.map(coin => (
                        <div key={coin.ticker} className="sf-crypto-row">
                            <div className="sf-crypto-icon" style={{ background: '#FEF3C7', fontSize: '1.2rem' }}>
                                {coin.symbol}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="sf-crypto-name">{coin.name}</div>
                                <div className={`sf-crypto-chg ${coin.pos ? 'pos' : 'neg'}`}>
                                    {coin.change} (24h)
                                </div>
                            </div>
                            <div className="sf-crypto-price">{coin.price}</div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Events */}
                <div className="sf-widget">
                    <div className="sf-widget-title">
                        <Calendar size={12} style={{ marginRight: '0.4rem', display: 'inline', verticalAlign: 'middle' }} />
                        Upcoming Events
                    </div>
                    {EVENTS.map(ev => (
                        <div key={ev.name} className="sf-event-row">
                            <div className="sf-event-dot" style={{ background: ev.dotColor }} />
                            <div className="sf-event-info">
                                <div className="sf-event-name">{ev.name}</div>
                                <div className="sf-event-date">{ev.date}</div>
                            </div>
                            <span className={`sf-event-badge ${ev.badge}`}>{ev.badgeLabel}</span>
                        </div>
                    ))}
                </div>

                {/* Community Stats mini card */}
                <div className="sf-widget" style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }}>
                    <div className="sf-widget-title" style={{ color: '#1D4ED8' }}>
                        <Star size={12} style={{ marginRight: '0.4rem', display: 'inline', verticalAlign: 'middle' }} />
                        Community
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                        {[
                            { val: '12.4K', label: 'Members' },
                            { val: '3.2K', label: 'Posts'   },
                            { val: '840',  label: 'Online'  },
                        ].map(stat => (
                            <div key={stat.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{stat.val}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}
