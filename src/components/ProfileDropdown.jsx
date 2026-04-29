import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User as UserIcon } from "lucide-react";
import { useAuth } from "../context";

export function ProfileDropdown({
    onAccount,
    onSettings,
    onFAQ,
    onLogout,
}) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    
    // Fallback if user is not loaded yet
    const displayEmail = user?.email || "Guest";
    const displayName = user?.username || user?.name || "User";

    // Inline styles to replicate the visual design without relying on Tailwind
    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
            textAlign: 'left',
        },
        triggerButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            outline: 'none',
        },
        dropdownMenu: {
            position: 'absolute',
            right: 0,
            zIndex: 50,
            marginTop: '8px',
            width: '240px',
            transformOrigin: 'top right',
            borderRadius: '8px',
            backgroundColor: '#ffffff', // The "Tile" background
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
        },
        header: {
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
        },
        signedInText: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px',
        },
        emailText: {
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        menuGroup: {
            padding: '4px 0',
        },
        menuItem: {
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '8px 16px',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease',
        },
        divider: {
            borderTop: '1px solid #f3f4f6',
            margin: '0',
        }
    };

    return (
        <div style={styles.container}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={styles.triggerButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
                <UserIcon size={16} color="#195BAC" />
                <span style={{ textTransform: 'uppercase' }}>{displayName}</span>
                <ChevronDown
                    size={16}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: '#6b7280'
                    }}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {open && (
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        style={styles.dropdownMenu}
                        onMouseLeave={() => setOpen(false)}
                    >
                        <div style={styles.header}>
                            <p style={styles.signedInText}>Signed in as</p>
                            <p style={styles.emailText} title={displayEmail}>{displayEmail}</p>
                        </div>

                        <div style={styles.menuGroup}>
                            <button
                                onClick={() => {
                                    onAccount?.();
                                    setOpen(false);
                                }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Account
                            </button>
                            <button
                                onClick={() => {
                                    onSettings?.();
                                    setOpen(false);
                                }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => {
                                    onFAQ?.();
                                    setOpen(false);
                                }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                FAQ
                            </button>
                        </div>

                        <div style={styles.divider}></div>

                        <div style={styles.menuGroup}>
                            <button
                                onClick={() => {
                                    onLogout?.();
                                    setOpen(false);
                                }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Sign out
                            </button>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
