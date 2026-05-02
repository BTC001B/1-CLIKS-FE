import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, User, ArrowRight, CheckCircle2, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context';
import logoPng from '../assets/cliks.png';

const Auth = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '', // Frontend input for email
        password: '',
        fullName: '', // Frontend input for full name
        role: 'user', // Default role
        businessName: '',
        industry: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const response = await login(formData.username, formData.password);
                const role = response.user?.role || 'user';
                if (role === 'business') {
                    navigate('/business/dashboard');
                } else {
                    navigate('/books/dashboard');
                }
            } else {
                const generatedUsername = formData.username.split('@')[0].toLowerCase();
                await register({
                    username: generatedUsername,
                    email: formData.username,
                    password: formData.password,
                    role: formData.role,
                    business_name: formData.businessName,
                    industry: formData.industry
                });
                
                if (formData.role === 'business') {
                    navigate('/business/dashboard');
                } else {
                    navigate('/books/dashboard');
                }
            }
        } catch (err) {
            console.error('[Auth] error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to authenticate. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            background: "#F0FDF4",
            fontFamily: "Inter, sans-serif"
        }}>
            {/* Left Side - Form */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                position: "relative",
                background: "#FFFFFF",
                boxShadow: "20px 0 50px rgba(27, 107, 58, 0.05)"
            }}>

                <div style={{
                    position: "absolute",
                    top: "40px",
                    left: "40px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer"
                }} onClick={() => navigate('/')}>
                    <div style={{ padding: '4px', background: '#E8F5E9', borderRadius: '50%' }}>
                        <img src={logoPng} alt="CLIKS Logo" style={{ width: '48px', height: '48px' }} />
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "#1B6B3A" }}>CLIKS</span>
                </div>

                <div style={{ maxWidth: "400px", width: "100%" }}>
                    <div style={{ marginBottom: "40px" }}>
                        <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#064E3B", marginBottom: "12px" }}>
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h1>
                        <p style={{ fontSize: "16px", color: "#546E7A" }}>
                            {isLogin
                                ? "Enter your details to access your account."
                                : "Start managing your finances beautifully."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {!isLogin && (
                            <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', marginBottom: '8px' }}>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, role: 'user'})}
                                    style={{ 
                                        flex: 1, padding: '8px', borderRadius: '10px', border: 'none', 
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                        background: formData.role === 'user' ? 'white' : 'transparent',
                                        color: formData.role === 'user' ? '#1B6B3A' : '#64748B',
                                        boxShadow: formData.role === 'user' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    Personal
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, role: 'business'})}
                                    style={{ 
                                        flex: 1, padding: '8px', borderRadius: '10px', border: 'none', 
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                        background: formData.role === 'business' ? 'white' : 'transparent',
                                        color: formData.role === 'business' ? '#1B6B3A' : '#64748B',
                                        boxShadow: formData.role === 'business' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    Business
                                </button>
                            </div>
                        )}

                        {error && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '12px', background: '#FFEBEE', color: '#B71C1C', 
                                borderRadius: '8px', fontSize: '14px', fontWeight: '500' 
                            }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}
                        
                        {!isLogin && (
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#546E7A", marginBottom: "8px", letterSpacing: "0.5px" }}>FULL NAME</label>
                                <div style={{ position: "relative" }}>
                                    <User size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                        className="auth-input"
                                        style={{
                                            width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px",
                                            border: "2px solid #DCF2E4", fontSize: "15px", outline: "none",
                                            transition: "border-color 0.3s", boxSizing: "border-box"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#1B6B3A"}
                                        onBlur={(e) => e.target.style.borderColor = "#DCF2E4"}
                                    />
                                </div>
                            </div>
                        )}

                        {!isLogin && formData.role === 'business' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#546E7A", marginBottom: "8px", letterSpacing: "0.5px" }}>BUSINESS NAME</label>
                                    <div style={{ position: "relative" }}>
                                        <Briefcase size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
                                        <input
                                            type="text"
                                            placeholder="Acme Corp"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            required
                                            className="auth-input"
                                            style={{
                                                width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px",
                                                border: "2px solid #DCF2E4", fontSize: "15px", outline: "none",
                                                transition: "border-color 0.3s", boxSizing: "border-box"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "#1B6B3A"}
                                            onBlur={(e) => e.target.style.borderColor = "#DCF2E4"}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#546E7A", marginBottom: "8px", letterSpacing: "0.5px" }}>INDUSTRY</label>
                                    <select
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        required
                                        style={{
                                            width: "100%", padding: "14px 16px", borderRadius: "12px",
                                            border: "2px solid #DCF2E4", fontSize: "15px", outline: "none",
                                            background: "white", transition: "border-color 0.3s", boxSizing: "border-box"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#1B6B3A"}
                                        onBlur={(e) => e.target.style.borderColor = "#DCF2E4"}
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#546E7A", marginBottom: "8px", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
                                <input
                                    type="text" // Changed from email to text because backend expects username
                                    placeholder="you@email.com"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    className="auth-input"
                                    style={{
                                        width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px",
                                        border: "2px solid #DCF2E4", fontSize: "15px", outline: "none",
                                        transition: "border-color 0.3s", boxSizing: "border-box"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1B6B3A"}
                                    onBlur={(e) => e.target.style.borderColor = "#DCF2E4"}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", fontWeight: "600", color: "#546E7A", marginBottom: "8px", letterSpacing: "0.5px" }}>
                                <span>PASSWORD</span>
                                {isLogin && <span style={{ color: "#1B6B3A", cursor: "pointer", textTransform: "none" }}>Forgot password?</span>}
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#90A4AE" }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="auth-input"
                                    style={{
                                        width: "100%", padding: "14px 16px 14px 44px", borderRadius: "12px",
                                        border: "2px solid #DCF2E4", fontSize: "15px", outline: "none",
                                        transition: "border-color 0.3s", boxSizing: "border-box"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1B6B3A"}
                                    onBlur={(e) => e.target.style.borderColor = "#DCF2E4"}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{
                                width: "100%", padding: "16px", background: isLoading ? "#90A4AE" : "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)",
                                color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700",
                                cursor: isLoading ? "not-allowed" : "pointer", marginTop: "10px", boxShadow: isLoading ? "none" : "0 8px 25px rgba(27, 107, 58, 0.3)",
                                display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "transform 0.2s"
                            }}
                            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
                            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = "translateY(0)")}>
                            {isLoading ? (
                                <><Loader2 className="animate-spin" size={20} /> Signing In...</>
                            ) : (
                                <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: "30px", textAlign: "center", fontSize: "15px", color: "#546E7A" }}>
                        {isLogin ? "Don't have an account? " : "Already a user? "}
                        <span
                            onClick={toggleMode}
                            style={{ color: "#1B6B3A", fontWeight: "700", cursor: "pointer" }}
                        >
                            {isLogin ? "Create a new one" : "Sign in"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div style={{
                flex: 1.2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "60px",
                background: "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)",
                position: "relative",
                overflow: "hidden"
            }} className="desktop-visual">
                <style>{`
                    @media (max-width: 900px) {
                        .desktop-visual { display: none !important; }
                    }
                `}</style>

                {/* Decorative circles */}
                <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
                <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "500px", height: "500px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", filter: "blur(80px)" }} />

                <div style={{ position: "relative", zIndex: 10, color: "#FFFFFF", maxWidth: "500px" }}>
                    <div style={{ marginBottom: "40px", display: "flex", gap: "10px" }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.3)" }} />
                        ))}
                    </div>
                    <h2 style={{ fontSize: "48px", fontWeight: "800", lineHeight: "1.2", marginBottom: "24px" }}>
                        Master your <br />financial future.
                    </h2>
                    <p style={{ fontSize: "18px", opacity: 0.9, lineHeight: "1.6", marginBottom: "40px" }}>
                        Join thousands of users who are taking control of their money with our intelligent dashboard.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {[
                            "Smart budget recommendations",
                            "Real-time expense tracking",
                            "Bank-level security & encryption"
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.1)", padding: "16px 24px", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
                                <CheckCircle2 size={24} color="#4CAF50" />
                                <span style={{ fontSize: "16px", fontWeight: "500" }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
