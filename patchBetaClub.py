import re
import os

path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE/src/pages/public/BetaClub.jsx'

with open(path, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { \n    TrendingUp,", "import { \n    TrendingUp,\n    MapPin,\n    Search,")

# 2. State & Hooks
hook_str = """
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'studio'
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedConnectPitch, setSelectedConnectPitch] = useState(null);

    // Location State
    const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
    const [gpsState, setGpsState] = useState(null);
    const [cityName, setCityName] = useState(null);
    const [pincode, setPincode] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationPermissionDenied(false);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                        .then(res => res.json())
                        .then(data => {
                            const state = data.principalSubdivision;
                            const city = data.city || data.locality || data.village;
                            if (state) setGpsState(state);
                            if (city) setCityName(city);
                            if (data.postcode) setPincode(data.postcode);
                        })
                        .catch(err => console.warn('Geolocation error:', err));
                },
                (error) => {
                    setLocationPermissionDenied(true);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationPermissionDenied(true);
        }
    };

    React.useEffect(() => {
        requestLocation();
    }, []);
"""
content = re.sub(
    r"    const \[activeTab, setActiveTab\] = useState\('directory'\);.*?    const \[selectedConnectPitch, setSelectedConnectPitch\] = useState\(null\);",
    hook_str.strip(),
    content,
    flags=re.DOTALL
)

# 3. FormData location field
content = content.replace("founder_email: ''\n    });", "founder_email: '',\n        location: ''\n    });")

# 4. Handle Submit
submit_str = """
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.business_name || !formData.headline || !formData.funding_target || !formData.founder_email || !formData.founder_phone) {
            alert("Please supply active founder contact details so investors can reach you.");
            return;
        }
        const payload = {
            ...formData,
            location: formData.location || (cityName ? `${cityName}, ${gpsState}` : 'Chennai, Tamil Nadu')
        };
        createMutation.mutate(payload);
    };
"""
content = re.sub(
    r"    const handleSubmit = \(e\) => \{.*?\n        createMutation\.mutate\(formData\);\n    \};",
    submit_str.strip(),
    content,
    flags=re.DOTALL
)

# 5. Recommendation Score
score_str = """
    const industryOptions = [
        'Technology', 'Retail & Commerce', 'Healthcare', 'Finance & FinTech', 
        'Manufacturing', 'Food & Beverage', 'Real Estate', 'Other'
    ];

    // ── Personalization & Location Recommendation Engine ──
    const getRecommendationScore = (pitch) => {
        let score = 0;
        const profileState = gpsState || 'Tamil Nadu';
        const profileCity = cityName || '';
        if (pitch.location && profileState) {
            const pitchLoc = pitch.location.toLowerCase();
            const uState = profileState.toLowerCase();
            const uCity = profileCity.toLowerCase();
            if (uCity && pitchLoc.includes(uCity)) score += 150;
            else if (pitchLoc.includes(uState)) score += 100;
        }
        if (pitch.is_verified) score += 50;
        return score;
    };
"""
content = content.replace("""    const industryOptions = [
        'Technology', 'Retail & Commerce', 'Healthcare', 'Finance & FinTech', 
        'Manufacturing', 'Food & Beverage', 'Real Estate', 'Other'
    ];""", score_str.strip())

# 6. Header Dropdown UI
header_p = """<p style={{ fontSize: '0.9rem', color: '#A7F3D0', maxWidth: '500px', margin: 0, opacity: 0.85 }}>
                        Connect directly with verified personal ventures, review pitches, and contact owners instantly.
                    </p>"""

dropdown_ui = """<p style={{ fontSize: '0.9rem', color: '#A7F3D0', maxWidth: '500px', margin: 0, opacity: 0.85 }}>
                        Connect directly with verified personal ventures, review pitches, and contact owners instantly.
                    </p>
                    
                    <div style={{ position: 'relative', marginTop: '0.55rem', display: 'inline-block' }}>
                        <button 
                            onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.12)',
                                border: '1px solid rgba(255, 255, 255, 0.22)',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: 'white',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <MapPin size={13} color="#34D399" />
                            <span>
                                {gpsState ? (
                                    `${cityName ? `${cityName}, ` : ''}${gpsState}${pincode ? `, Pincode: ${pincode}` : ''}`
                                ) : (
                                    'Select Region / Lock GPS'
                                )}
                            </span>
                            <span style={{ fontSize: '0.55rem', opacity: 0.8, marginLeft: '2px' }}>▼</span>
                        </button>

                        {isLocationMenuOpen && (
                            <>
                                <div 
                                    onClick={() => setIsLocationMenuOpen(false)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'transparent' }} 
                                />
                                
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    left: 0,
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.4rem',
                                    minWidth: '220px',
                                    zIndex: 999,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}>
                                    <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', padding: '0.3rem 0.5rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.2rem' }}>
                                        Select Matching Region
                                    </div>
                                    
                                    {[
                                        { label: '⚡ Detect GPS Location', city: null, state: 'GPS', plusCode: 'Auto', pincode: null },
                                        { label: '📍 Chennai, Tamil Nadu', city: 'Chennai', state: 'Tamil Nadu', plusCode: '7J5X4W66+F9', pincode: '600001' },
                                        { label: '📍 Trichy, Tamil Nadu', city: 'Trichy', state: 'Tamil Nadu', plusCode: '7J4VQ456+7W', pincode: '620001' },
                                        { label: '📍 Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra', plusCode: '8FVC9G8F+6W', pincode: '400001' },
                                        { label: '📍 Bengaluru, Karnataka', city: 'Bengaluru', state: 'Karnataka', plusCode: '7J4VXH8R+5P', pincode: '560001' },
                                        { label: '📍 Delhi NCR', city: 'Delhi NCR', state: 'Delhi', plusCode: '8F3C4R2V+8Q', pincode: '110001' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() => {
                                                if (opt.state === 'GPS') {
                                                    requestLocation();
                                                } else {
                                                    setCityName(opt.city);
                                                    setGpsState(opt.state);
                                                    setPincode(opt.pincode);
                                                    setLocationPermissionDenied(false);
                                                }
                                                setIsLocationMenuOpen(false);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                textAlign: 'left',
                                                padding: '0.5rem 0.6rem',
                                                fontSize: '0.78rem',
                                                fontWeight: '750',
                                                color: '#334155',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1px',
                                                transition: 'all 0.15s ease',
                                                width: '100%'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.background = '#F1F5F9';
                                                e.currentTarget.style.color = '#064E3B';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#334155';
                                            }}
                                        >
                                            <span style={{ fontSize: '0.75rem' }}>{opt.label}</span>
                                            <span style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: '500' }}>
                                                {opt.pincode ? `Pincode: ${opt.pincode}` : `Plus Code: ${opt.plusCode}`}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>"""
content = content.replace(header_p, dropdown_ui)

# 7. Add search bar & clear state on tab switch
sub_nav_str = """
                <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    background: '#e2e8f0',
                    padding: '0.25rem',
                    borderRadius: '12px'
                }}>
                    <button 
                        onClick={() => {
                            setActiveTab('directory');
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9px',
                            background: activeTab === 'directory' ? '#ffffff' : 'transparent',
                            boxShadow: activeTab === 'directory' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            color: activeTab === 'directory' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Active Deals
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('studio');
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9px',
                            background: activeTab === 'studio' ? '#ffffff' : 'transparent',
                            boxShadow: activeTab === 'studio' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            color: activeTab === 'studio' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        My Studio
                    </button>
                </div>

                {activeTab === 'directory' && (
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search deals..."
                            style={{
                                width: '100%',
                                padding: '0.55rem 1rem 0.55rem 2.3rem',
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                outline: 'none',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                color: '#1E293B',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                            }}
                        />
                    </div>
                )}
"""
content = re.sub(
    r"<div style=\{\{\s*display: 'flex',\s*gap: '0\.25rem',\s*background: '#e2e8f0'.*?Active Deals.*?My Studio.*?</button>\s*</div>",
    sub_nav_str.strip(),
    content,
    flags=re.DOTALL
)

# 8. Directory mapping logic & warning
directory_start = """
            {/* Main Content Switcher */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#64748b' }}>Aggregating corporate data...</p>
                </div>
            ) : activeTab === 'directory' ? ("""

directory_new = """
            {locationPermissionDenied && (
                <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    fontWeight: '750',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="#DC2626" />
                        <span>Location services are disabled or blocked. Enable location permissions in your browser to unlock real-time location-based matchmaking.</span>
                    </div>
                    <button 
                        onClick={() => {
                            setLocationPermissionDenied(false);
                            requestLocation();
                        }}
                        style={{
                            background: '#DC2626',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#B91C1C'}
                        onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
                    >
                        Enable Location
                    </button>
                </div>
            )}

            {/* Main Content Switcher */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#64748b' }}>Aggregating corporate data...</p>
                </div>
            ) : activeTab === 'directory' ? (
                /* PITICHES DIRECTORY */
                (() => {
                    const activePitches = pitches.filter(p => p.listing_status === 'ACTIVE' || p.is_verified);
                    const filteredPitches = activePitches.filter(pitch => {
                        if (!searchTerm.trim()) return true;
                        const term = searchTerm.toLowerCase();
                        return (
                            pitch.business_name?.toLowerCase().includes(term) ||
                            pitch.headline?.toLowerCase().includes(term) ||
                            pitch.industry?.toLowerCase().includes(term) ||
                            pitch.use_of_funds?.toLowerCase().includes(term) ||
                            pitch.location?.toLowerCase().includes(term)
                        );
                    });
                    const sortedPitches = [...filteredPitches].sort((a, b) => {
                        const scoreA = getRecommendationScore(a);
                        const scoreB = getRecommendationScore(b);
                        return scoreB - scoreA;
                    });

                    return (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1rem'
                        }}>
                            {sortedPitches.length === 0 ? (
                                <div style={{
                                    gridColumn: '1/-1',
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: '1px dashed #cbd5e1'
                                }}>
                                    <Building size={40} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155' }}>
                                        {searchTerm ? "No matching deals found" : "No active deal listings"}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        {searchTerm ? "Try adjusting your search terms or filters." : "Submit your roadmap on My Studio to see it here instantly!"}
                                    </p>
                                </div>
                            ) : (
                                sortedPitches.map(pitch => {
                                    const profileState = gpsState || 'Tamil Nadu';
                                    const profileCity = cityName || '';
                                    const isCityMatch = profileCity && pitch.location && pitch.location.toLowerCase().includes(profileCity.toLowerCase());
                                    const isStateMatch = profileState && pitch.location && pitch.location.toLowerCase().includes(profileState.toLowerCase());

                                    return ("""

content = re.sub(
    r"\{\/\* Main Content Switcher \*\/\}.*?Active Deals.*?<div style=\{\{\s*display: 'grid',.*?pitches\.filter\(p => p\.listing_status === 'ACTIVE' \|\| p\.is_verified\)\.length === 0 \? \(.*?No active deal listings</h3>.*?Submit your roadmap on My Studio to see it here instantly!</p>\s*</div>\s*\) : \(\s*pitches\.map\(pitch => \(",
    directory_new.strip(),
    content,
    flags=re.DOTALL
)

# 9. Top Info Badging update for Match labels & pitch Location Label
badge_old = """                                {/* Top Info Badging */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '6px',
                                        background: '#ecfdf5',
                                        color: '#065f46',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {pitch.industry}
                                    </span>
                                    
                                    {pitch.is_verified && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            color: '#10b981',
                                            fontSize: '0.7rem',
                                            fontWeight: '800'
                                        }}>
                                            <ShieldCheck size={12} />
                                            <span>VERIFIED</span>
                                        </div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
                                    {pitch.business_name}
                                </h3>
                                <p style={{ 
                                    color: '#64748b', 
                                    fontSize: '0.85rem', 
                                    lineHeight: 1.4, 
                                    flexGrow: 1, 
                                    marginBottom: '1rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {pitch.headline}
                                </p>"""

badge_new = """                                {/* Top Info Badging */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            background: '#ecfdf5',
                                            color: '#065f46',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.02em'
                                        }}>
                                            {pitch.industry}
                                        </span>
                                        
                                        {isCityMatch && (
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px',
                                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                letterSpacing: '0.02em',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                🔥 PERFECT MATCH
                                            </span>
                                        )}
                                        {!isCityMatch && isStateMatch && (
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '6px',
                                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                letterSpacing: '0.02em',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                📍 NEAR YOU
                                            </span>
                                        )}
                                    </div>
                                    
                                    {pitch.is_verified && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            color: '#10b981',
                                            fontSize: '0.7rem',
                                            fontWeight: '800'
                                        }}>
                                            <ShieldCheck size={12} />
                                            <span>VERIFIED</span>
                                        </div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
                                    {pitch.business_name}
                                </h3>
                                
                                <p style={{ 
                                    color: '#64748b', 
                                    fontSize: '0.85rem', 
                                    lineHeight: 1.4, 
                                    flexGrow: 1, 
                                    marginBottom: '0.75rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {pitch.headline}
                                </p>

                                {/* Location Label */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem', fontWeight: '600', marginBottom: '1rem' }}>
                                    <MapPin size={13} style={{ color: '#94a3b8' }} />
                                    <span>{pitch.location || 'Chennai, Tamil Nadu'}</span>
                                </div>"""

content = content.replace(badge_old, badge_new)

# 10. Close IIFE for directory map
content = content.replace("                        ))\n                    )}\n                </div>", "                                        );\n                                })\n                            )}\n                        </div>\n                    );\n                })()")

with open(path, 'w') as f:
    f.write(content)
