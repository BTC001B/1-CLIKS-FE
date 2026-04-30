import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetupsService } from '../services';
import {
    TrendingUp,
    Users,
    Gamepad2,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    Clock,
    Eye,
    MessageCircle,
    Share2,
    Heart,
    Bookmark,
    Search,
    Filter,
    PiggyBank,
    Briefcase,
    Bitcoin,
    LineChart,
    UserPlus,
    Trophy,
    MapPin,
    Video,
    Sparkles,
    Plus,
    Globe,
    Target,
    X,
    Loader2
} from 'lucide-react';
import '../App.css';
import SIPView from './investments/SIPView.jsx';
import MutualFundsView from './investments/MutualFundsView.jsx';
import CryptoView from './investments/CryptoView.jsx';
import BitcoinView from './investments/BitcoinView.jsx';
import OverallTradingView from './investments/OverallTradingView.jsx';
import SocialFeed from './public/SocialFeed.jsx';

export default function Public() {
    const [searchParams] = useSearchParams();
    const page = searchParams.get('page') || 'news-feed';

    // News Feed Component -- redesigned Social Feed
    const NewsFeed = () => <SocialFeed />;

        // Trading Pages
    const TradingSIP = () => <SIPView />;
    const TradingMutualFunds = () => <MutualFundsView />;
    const TradingCrypto = () => <CryptoView />;
    const TradingBitcoin = () => <BitcoinView />;
    const TradingOverall = () => <OverallTradingView />;

    // Investors Page
    const InvestorsPage = () => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '600px',
            textAlign: 'center',
            gap: '2rem',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            marginTop: '1rem'
        }}>
            <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #1B6B3A 0%, #22C55E 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 25px -5px rgba(27, 107, 58, 0.3)',
                marginBottom: '1rem'
            }}>
                <Briefcase size={48} color="white" strokeWidth={1.5} />
            </div>

            <div style={{ maxWidth: '640px' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#1E293B',
                    marginBottom: '1.25rem',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2'
                }}>
                    Do you want to become a Investor?
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#64748B',
                    lineHeight: '1.6',
                    marginBottom: '2rem'
                }}>
                    Unlock exclusive access to premium high-growth investment opportunities, connect with industry leaders in our private network, and grow your portfolio with expert-led insights.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '3rem',
                width: '100%',
                maxWidth: '800px',
                margin: '1rem 0 3rem 0'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: '#F0FDF4',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1B6B3A'
                    }}>
                        <TrendingUp size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: '700', color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.25rem' }}>High Returns</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748B' }}>Access vetted deals with potential for exponential growth.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: '#F0FDF4',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16A34A'
                    }}>
                        <Users size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: '700', color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Elite Network</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748B' }}>Connect with successful founders and fellow investors.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: '#FAF5FF',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9333EA'
                    }}>
                        <Sparkles size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: '700', color: '#1E293B', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Early Access</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748B' }}>Get in on the ground floor of the next big thing.</p>
                    </div>
                </div>
            </div>

            <button style={{
                background: '#1B6B3A',
                color: 'white',
                padding: '1.25rem 3.5rem',
                borderRadius: '99px',
                fontSize: '1.25rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(27, 107, 58, 0.3), 0 4px 6px -2px rgba(27, 107, 58, 0.1)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(27, 107, 58, 0.4), 0 10px 10px -5px rgba(27, 107, 58, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(27, 107, 58, 0.3), 0 4px 6px -2px rgba(27, 107, 58, 0.1)';
                }}
            >
                Start Investing Now
                <ArrowUpRight size={24} />
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#94A3B8' }}>
                No hidden fees. Cancel anytime.
            </p>
        </div>
    );

    // Games Page
    const GamesPage = () => (
        <div style={{ padding: '0 0 2rem 0', fontFamily: "'Inter', sans-serif" }}>
            {/* Unique Header Banner */}
            <div style={{
                background: 'linear-gradient(120deg, #1B6B3A 0%, #064E3B 100%)',
                borderRadius: '24px',
                padding: '3rem 2rem',
                color: 'white',
                marginBottom: '2.5rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(30, 58, 138, 0.3)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
                    <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '99px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)',
                        marginBottom: '1rem',
                        display: 'inline-block'
                    }}>
                        Level 5 â€¢ Pro Gamer
                    </span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' }}>
                        Ready to level up your <br /> Financial Skills?
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: '0.9', marginBottom: '2rem', maxWidth: '500px' }}>
                        Compete in real-time trading battles, solve complex puzzles, and climb the global leaderboards to win exclusive rewards.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{
                            background: 'white',
                            color: '#1B6B3A',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            Daily Challenge
                        </button>
                        <button style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}>
                            View Rewards
                        </button>
                    </div>
                </div>

                {/* Abstract Decorative elements */}
                <div style={{ position: 'relative', height: '200px', width: '300px' }}>
                    <Gamepad2 size={180} color="white" style={{ opacity: 0.1, position: 'absolute', right: '-20px', top: '-20px', transform: 'rotate(15deg)' }} />
                    <Trophy size={120} color="#fbbf24" style={{ position: 'absolute', right: '40px', bottom: '0', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Main Game Grid */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>Featured Games</h2>
                        <a href="#" style={{ color: '#1B6B3A', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>View All</a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* Large Featured Card */}
                        <div style={{
                            gridColumn: 'span 2',
                            background: 'white',
                            borderRadius: '20px',
                            padding: '2rem',
                            display: 'flex',
                            gap: '2rem',
                            alignItems: 'center',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(109, 40, 217, 0.25)'
                            }}>
                                <TrendingUp size={60} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ color: '#7c3aed', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trending Now</span>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: '0.5rem 0' }}>Ultimate Trading Simulator</h3>
                                <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.5' }}>Experience the thrill of the stock market without the risk. Trade with virtual currency and compete.</p>
                                <button style={{
                                    background: '#1B6B3A',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    Play Now <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {[
                            { title: 'Crypto Quiz', color: '#10b981', icon: Bitcoin, level: 'Beginner', bg: '#ecfdf5', text: '#059669' },
                            { title: 'Budget Master', color: '#f59e0b', icon: PiggyBank, level: 'Intermediate', bg: '#fffbeb', text: '#d97706' },
                            { title: 'Risk Analyst', color: '#ef4444', icon: LineChart, level: 'Advanced', bg: '#fef2f2', text: '#dc2626' },
                            { title: 'Market Puzzle', color: '#3b82f6', icon: Gamepad2, level: 'Fun', bg: '#eff6ff', text: '#2563eb' }
                        ].map((game, i) => (
                            <div key={i} style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: game.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <game.icon size={28} color={game.text} />
                                    </div>
                                    <span style={{
                                        background: '#f3f4f6',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '99px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#4b5563'
                                    }}>
                                        {game.level}
                                    </span>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>{game.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>2.5k Players Online</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Leaderboard */}
                <div style={{ width: '340px' }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        position: 'sticky',
                        top: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>Top Players</h3>
                            <button style={{ background: 'none', border: 'none', color: '#1B6B3A', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                                This Week
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'Aditya S', score: '9,850', rank: 1, avatar: 'AV' },
                                { name: 'Rahul K', score: '8,400', rank: 2, avatar: 'RK' },
                                { name: 'Sneha M', score: '7,200', rank: 3, avatar: 'SM' },
                                { name: 'Amit J', score: '6,900', rank: 4, avatar: 'AJ' },
                                { name: 'Priya R', score: '5,540', rank: 5, avatar: 'PR' }
                            ].map((player, index) => (
                                <div key={player.rank} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '12px', background: index === 0 ? '#f0f9ff' : 'transparent' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        color: index < 3 ? '#eab308' : '#9ca3af',
                                        fontSize: '0.9rem'
                                    }}>
                                        {player.rank}
                                    </div>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#e0e7ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#3730a3',
                                        fontWeight: '700',
                                        fontSize: '0.9rem'
                                    }}>
                                        {player.avatar}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>{player.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{player.score} XP</p>
                                    </div>
                                    {index === 0 && <Trophy size={16} color="#eab308" />}
                                </div>
                            ))}
                        </div>

                        <button style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            background: 'white',
                            color: '#4b5563',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}>
                            View Global Rankings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Meetup Page
    const MeetupPage = () => {
        const [filter, setFilter] = useState('All Events');
        const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
        const [newEvent, setNewEvent] = useState({ 
            title: '', 
            type: 'Offline', 
            date: '', 
            time: '', 
            location: '', 
            price: 'Free',
            description: '',
            category: 'Networking',
            image_url: ''
        });
        const queryClient = useQueryClient();

        const { data: events = [], isLoading } = useQuery({
            queryKey: ['meetups'],
            queryFn: meetupsService.getMeetups,
            retry: 1,
            refetchOnWindowFocus: false
        });

        const createMutation = useMutation({
            mutationFn: meetupsService.createMeetup,
            onSuccess: () => {
                queryClient.invalidateQueries(['meetups']);
                setIsCreateModalOpen(false);
                setNewEvent({ 
                    title: '', 
                    type: 'Offline', 
                    date: '', 
                    time: '', 
                    location: '', 
                    price: 'Free',
                    description: '',
                    category: 'Networking',
                    image_url: ''
                });
            }
        });

        const joinMutation = useMutation({
            mutationFn: meetupsService.joinMeetup,
            onSuccess: () => {
                queryClient.invalidateQueries(['meetups']);
            }
        });

        const handleCreateSubmit = (e) => {
            e.preventDefault();
            createMutation.mutate(newEvent);
        };

        // Helper to render icon from string
        const renderIcon = (iconName) => {
            switch (iconName) {
                case 'Briefcase': return <Briefcase size={32} />;
                case 'Target': return <Target size={32} />;
                case 'Globe': return <Globe size={32} />;
                case 'TrendingUp': return <TrendingUp size={32} />;
                case 'Bitcoin': return <Bitcoin size={32} />;
                case 'PiggyBank': return <PiggyBank size={32} />;
                case 'MapPin': return <MapPin size={32} />;
                default: return <Users size={32} />;
            }
        };

        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                    borderRadius: '24px',
                    padding: '3rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 20px 25px -5px rgba(27, 107, 58, 0.25)'
                }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '999px',
                            backdropFilter: 'blur(10px)',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            <Briefcase size={16} />
                            <span>Business & Startups</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
                            Founders Meetup <br /> & Event Scheduler
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#93c5fd',
                            maxWidth: '480px',
                            lineHeight: 1.6
                        }}>
                            Connect with fellow founders, schedule business events, and scale your startup through powerful networking.
                        </p>
                    </div>

                    {/* Decorative Circle */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '500px',
                        height: '500px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(30, 58, 138, 0) 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }} />

                    <button 
                        className="transition" 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: '1rem 2rem',
                        background: 'white',
                        color: '#1e3a8a',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                    >
                        <Plus size={20} />
                        Create Event
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', overflowX: 'auto' }}>
                    {['All Events', 'Upcoming', 'Workshops', 'Webinars', 'My Events'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className="transition"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '999px',
                                border: filter === tab ? 'none' : '1px solid #E5E7EB',
                                background: filter === tab ? '#1B6B3A' : 'white',
                                color: filter === tab ? 'white' : '#6B7280',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px dashed #CBD5E1',
                        textAlign: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#F0FDF4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8'
                        }}>
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>No Events Found</h3>
                            <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>There are no upcoming meetups scheduled right now. Click "Create Event" to schedule the first one!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {events.map((event, idx) => (
                        <div
                            key={idx}
                            className="transition"
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                border: '1px solid #F3F4F6',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Graphic Header */}
                            <div style={{
                                height: '160px',
                                background: event.image_url ? `url(${event.image_url})` : (event.gradient || 'linear-gradient(135deg, #1B6B3A 0%, #22C55E 100%)'),
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {!event.image_url && (
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        background: 'rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }}>
                                        {renderIcon(event.icon)}
                                    </div>
                                )}

                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    left: '1rem',
                                    padding: '0.25rem 0.75rem',
                                    background: 'rgba(27, 107, 58, 0.9)',
                                    color: 'white',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    {event.category || 'Networking'}
                                </div>

                                <span style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.25rem 0.75rem',
                                    background: 'white',
                                    color: '#1B6B3A',
                                    borderRadius: '999px',
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}>
                                    {event.price}
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: event.type === 'Online' ? '#9333EA' : '#1B6B3A',
                                        background: event.type === 'Online' ? '#F3E8FF' : '#F0FDF4',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '6px',
                                        border: `1px solid ${event.type === 'Online' ? '#E9D5FF' : '#DCF2E4'}`
                                    }}>
                                        {event.type}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>
                                        {event.date}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                                    {event.title}
                                </h3>

                                {event.description && (
                                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                        {event.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B635A', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    <MapPin size={14} />
                                    <span style={{ fontWeight: '500' }}>{event.location}</span>
                                    <span style={{ margin: '0 0.25rem', opacity: 0.5 }}>•</span>
                                    <Clock size={14} />
                                    <span style={{ fontWeight: '500' }}>{event.time}</span>
                                </div>

                                {/* Footer: Attendees & Button */}
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', paddingLeft: '8px' }}>
                                        {Array.from({ length: Math.min(event.attendees || 1, 4) }).map((_, i) => (
                                            <div key={i} style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: '#E5E7EB',
                                                border: '2px solid white',
                                                marginLeft: '-8px'
                                            }} />
                                        ))}
                                        {(event.attendees || 1) > 4 && (
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: '#F3F4F6',
                                                border: '2px solid white',
                                                marginLeft: '-8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                color: '#6B7280',
                                                fontWeight: '600'
                                            }}>
                                                +{(event.attendees || 1) - 4}
                                            </div>
                                        )}
                                    </div>

                                    <button className="transition" style={{
                                        padding: '0.5rem 1.25rem',
                                        border: '1px solid #1B6B3A',
                                        borderRadius: '8px',
                                        color: '#1B6B3A',
                                        background: 'transparent',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#1B6B3A';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#1B6B3A';
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            joinMutation.mutate(event.id);
                                            // Optional: Add a localized visual feedback
                                            e.currentTarget.style.transform = 'scale(0.95)';
                                            setTimeout(() => {
                                                if (e.currentTarget) e.currentTarget.style.transform = 'scale(1)';
                                            }, 150);
                                        }}
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Create Event Modal */}
                {isCreateModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '500px',
                            padding: '2rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    background: '#F0FDF4',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748B'
                                }}
                            >
                                <X size={18} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', marginBottom: '1.5rem' }}>
                                Create New Event
                            </h2>

                            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Event Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                        placeholder="e.g. SaaS Founders Meetup"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Description</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                        placeholder="Tell people about your event..."
                                        rows={3}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Type</label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                        >
                                            <option value="Offline">Offline</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Price</label>
                                        <input
                                            type="text"
                                            value={newEvent.price}
                                            onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                                            placeholder="e.g. Free or $20"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Category</label>
                                        <select
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                        >
                                            <option value="Networking">Networking</option>
                                            <option value="Workshop">Workshop</option>
                                            <option value="Webinar">Webinar</option>
                                            <option value="Social">Social</option>
                                            <option value="Masterclass">Masterclass</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Image URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={newEvent.image_url}
                                            onChange={(e) => setNewEvent({...newEvent, image_url: e.target.value})}
                                            placeholder="https://..."
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Location (or Link)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                        placeholder="Downtown Tech Hub"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    style={{
                                        marginTop: '1rem',
                                        width: '100%',
                                        padding: '1rem',
                                        background: '#1B6B3A',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {createMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Publish Event'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render the appropriate page based on page URL param
    const renderPage = () => {
        if (page === 'news-feed') return <NewsFeed />;
        if (page === 'trading-sip') return <TradingSIP />;
        if (page === 'trading-mutual-funds') return <TradingMutualFunds />;
        if (page === 'trading-crypto') return <TradingCrypto />;
        if (page === 'trading-bitcoin') return <TradingBitcoin />;
        if (page === 'trading-overall') return <TradingOverall />;
        if (page === 'investors') return <InvestorsPage />;
        if (page === 'games') return <GamesPage />;
        if (page === 'meetup') return <MeetupPage />;
        return <NewsFeed />;
    };

    return (
        <>
            <div className="content-wrapper">
                {renderPage()}
            </div>
        </>
    );
}
