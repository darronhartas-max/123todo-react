import React from 'react';
import { APP_VERSION } from '../../utils/constants';

const Footer = ({ onSyncClick, syncStatus, isAuthed, isOffline, version = APP_VERSION, onInstallClick, isStandalone = false }) => {
    const styles = {
        footer: {
            flexShrink: 0,
            padding: '16px 16px 14px 16px',
            background: 'var(--footer-bg)',
            textAlign: 'center',
            fontSize: '1rem',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--muted-text)'
        },
        footerButton: {
            background: 'var(--item-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '700',
            padding: '7px 16px',
            borderRadius: '6px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }
    };

    const getSyncStatusText = () => {
        if (isOffline || !navigator.onLine) return '📡 Offline';
        if (syncStatus === 'error') return 'Sync Error';
        if (isAuthed) return 'Synced';
        return 'Sync';
    };

    const getSyncButtonStyle = () => {
        if (isOffline || !navigator.onLine) return { ...styles.footerButton, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.3)' };
        if (syncStatus === 'error') return { ...styles.footerButton, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' };
        if (isAuthed) return { ...styles.footerButton, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.25)' };
        return { ...styles.footerButton, background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)' };
    };

    return (
        <footer style={styles.footer}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <button onClick={onSyncClick} style={getSyncButtonStyle()} title={syncStatus === 'syncing' ? "Syncing in background..." : (isAuthed ? "Cloud Sync Active" : "Click to setup sync")}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {(!isOffline && navigator.onLine) && (
                            <span
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isAuthed ? (syncStatus === 'error' ? '#ef4444' : '#10b981') : '#ef4444',
                                    boxShadow: `0 0 6px ${isAuthed ? (syncStatus === 'error' ? '#ef4444' : '#10b981') : '#ef4444'}`,
                                    display: 'inline-block',
                                    flexShrink: 0,
                                    animation: syncStatus === 'syncing' ? 'pulseDot 1.2s infinite ease-in-out' : 'none'
                                }}
                            />
                        )}
                        <span>{getSyncStatusText()}</span>
                    </div>
                </button>
                {!isStandalone && onInstallClick && (
                    <button
                        onClick={onInstallClick}
                        style={{
                            ...styles.footerButton,
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                            borderColor: 'var(--accent-color)',
                            color: 'var(--accent-color)'
                        }}
                        title="Download & Install 123 To Do on your device"
                    >
                        📲 Install App
                    </button>
                )}
            </div>

            <div style={{
                fontSize: '0.88rem',
                margin: '6px 0',
                opacity: 0.9
            }}>
                <div style={{ marginBottom: '3px' }}>
                    Copyright © Unforgettable Management Ltd {new Date().getFullYear()}
                </div>
                <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                    v{version}
                </div>
            </div>

            <div style={{ marginTop: '6px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                    Terms of Service
                </a>
                <a href="https://www.123todo.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                    Privacy Policy
                </a>
            </div>
        </footer>
    );
};

export default Footer;
