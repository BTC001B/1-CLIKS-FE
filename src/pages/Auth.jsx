import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context';
import { referralService } from '../services/referralService';
import logoPng from '../assets/cliks.png';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { ssoLogin } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const CLIENT_ID = 'cliks-app';
    const REDIRECT_URI = 'https://cliks.beta-softnet.com/auth';
    const BNX_AUTH_URL = 'https://www.b2auth.com';
    const BNX_API_URL = 'https://api.bnxmail.com';

    const handledRef = React.useRef(false);

    const handleOAuthCallback = React.useCallback(async (code) => {
        if (handledRef.current) return;   // strict-mode / double-invoke guard
        handledRef.current = true;

        setIsLoading(true);
        setError('');

        try {
            // 1. Exchange code for BNX token
            const tokenRes = await fetch(`${BNX_API_URL}/api/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grantType: 'authorization_code',
                    code,
                    clientId: CLIENT_ID,
                    clientSecret: 'secure-cliks-secret-2026'
                })
            });
            console.log(tokenRes)
            const tokenData = await tokenRes.json();
            console.log(tokenData);

            if (!tokenData.success) {
                throw new Error('Failed to get BNX token');
            }

            const bnxToken = tokenData.data.access_token;

            // 2. Check if this user arrived via a referral link
            //    The ref code is stored in sessionStorage when Landing redirects to B2Auth
            const pendingRefCode = sessionStorage.getItem('cliks_pending_ref');

            // 3. Perform SSO Login with backend
            await ssoLogin(bnxToken);

            // 4. Apply referral code if present — fire-and-forget (don't block navigation)
            if (pendingRefCode) {
                sessionStorage.removeItem('cliks_pending_ref');
                referralService.apply(pendingRefCode).catch((err) => {
                    // Silently log — referral failure must never block login
                    console.warn('[Auth] Referral apply failed (non-blocking):', err?.message);
                });
            }

            navigate('/books/dashboard', { replace: true });


        } catch (err) {
            console.error('[Auth] SSO error:', err);
            setError('Authentication failed. Please try again.');
            handledRef.current = false;  // allow retry
        } finally {
            setIsLoading(false);
        }
    }, [ssoLogin, navigate]);

   useEffect(() => {
    // Read the code ONCE from the URL at mount time
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Clean the URL without triggering another React Router navigation
        window.history.replaceState({}, '', window.location.pathname);

        // Exchange the OAuth code for a token
        handleOAuthCallback(code);
    } else {
        // No code → redirect user to BNX login
        const state = 'cliks-auth-state';

        window.location.href =
            `${BNX_AUTH_URL}/?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // run once on mount only — do NOT add location/navigate as deps

    const handleLoginWithBNX = () => {
        const state = 'cliks-auth-state';

        window.location.href =
            `${BNX_AUTH_URL}/?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            background: "#F0FDF4",
            fontFamily: "Inter, sans-serif"
        }}>
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
                <div
                    style={{
                        position: "absolute",
                        top: "40px",
                        left: "40px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer"
                    }}
                    onClick={() => navigate('/')}
                >
                    <div style={{
                        padding: '6px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        width: '56px',
                        height: '56px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <img
                            src={logoPng}
                            alt="CLIKS Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <span style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#1B6B3A"
                    }}>
                        CLIKS
                    </span>
                </div>

                <div style={{
                    maxWidth: "400px",
                    width: "100%",
                    textAlign: "center"
                }}>
                    <div style={{ marginBottom: "40px" }}>
                        <h1 style={{
                            fontSize: "36px",
                            fontWeight: "800",
                            color: "#064E3B",
                            marginBottom: "12px"
                        }}>
                            Welcome to Cliks
                        </h1>

                        <p style={{
                            fontSize: "16px",
                            color: "#546E7A"
                        }}>
                            Sign in with your BNX Account to access your financial dashboard securely.
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#FFEBEE',
                            color: '#B71C1C',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleLoginWithBNX}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: isLoading
                                ? "#90A4AE"
                                : "linear-gradient(135deg, #1B6B3A 0%, #228B4C 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            boxShadow: isLoading
                                ? "none"
                                : "0 8px 25px rgba(27, 107, 58, 0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            <>
                                Login with BNX
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;