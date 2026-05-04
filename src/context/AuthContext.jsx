import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('books_auth_token'));
    const [loading, setLoading] = useState(!!token);
    const queryClient = useQueryClient();

    const logout = React.useCallback(() => {
        localStorage.removeItem('books_auth_token');
        setToken(null);
        setUser(null);
        // Clear query cache to prevent User B from seeing User A's cached data
        queryClient.clear();
    }, [queryClient]);

    useEffect(() => {
        const initAuth = async () => {
            if (!token || user) {
                setLoading(false);
                return;
            }
            try {
                const userData = await authService.getProfile();
                setUser(userData);
            } catch (error) {
                console.error('[AuthContext] Failed to fetch profile:', error);
                // Only logout on 401 Unauthorized to prevent loops on other errors
                if (error.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [token, logout, user]);

    const ssoLogin = async (bnxToken) => {
        const data = await authService.ssoLogin(bnxToken);
        const { accessToken, user: newUser } = data;

        localStorage.setItem('books_auth_token', accessToken);
        setToken(accessToken);
        setUser(newUser);

        // Invalidate and refetch all queries to ensure new user data is loaded
        queryClient.invalidateQueries();

        return data;
    };

    const value = {
        user,
        token,
        loading,
        ssoLogin,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
