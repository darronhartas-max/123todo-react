import React from 'react';
import { APP_VERSION } from '../../utils/constants';

const Footer = ({ onExport, onImportClick, onSyncClick, syncStatus, isAuthed, isOffline, version = APP_VERSION, onCheckForUpdates, updateCheckStatus }) => {
    const styles = {
        footer: {
            flexShrink: 0,
            padding: '24px 20px 18px 20px',
            background: 'var(--footer-bg)',
            textAlign: 'center',
            fontSize: '1.1rem',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--muted-text)'
        },
        footerButton: {
            background: 'var(--item-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            cursor: 'pointer',
            fontSize: '1rem',
            margin: '0 8px',
            fontWeight: '700',
            padding: '8px 16px',
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
            <div style={{ marginBottom: '16px' }}>
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
            </div>
            <div>
                <button onClick={onExport} style={styles.footerButton}>Export</button>
                <button onClick={onImportClick} style={styles.footerButton}>Import</button>
            </div>

            <br />

            <div style={{
                fontSize: '0.9rem',
                margin: '8px 0',
                opacity: 0.9
            }}>
                <div style={{ marginBottom: '4px' }}>
                    Copyright © Unforgettable Management Ltd {new Date().getFullYear()}
                </div>
                <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                    v{version}
                </div>
            </div>

            <div style={{ marginTop: '8px', fontSize: '1rem' }}>
                <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', marginRight: '20px' }}>
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
