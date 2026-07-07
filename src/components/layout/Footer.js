import React from 'react';

const Footer = ({ onExport, onImportClick, onSyncClick, syncStatus, isAuthed, version = '2.1.2' }) => {
    const styles = {
        footer: {
            flexShrink: 0,
            padding: '30px 20px 40px 20px',
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
        if (syncStatus === 'error') return '⚠️ Sync Error';
        if (isAuthed) return '☁️ Google Drive Sync';
        return '❌ Sync Offline';
    };

    const getSyncButtonStyle = () => {
        if (syncStatus === 'error') return { ...styles.footerButton, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' };
        if (isAuthed) return { ...styles.footerButton, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' };
        return { ...styles.footerButton, background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' };
    };

    return (
        <footer style={styles.footer}>
            <div style={{ marginBottom: '16px' }}>
                <button onClick={onSyncClick} style={getSyncButtonStyle()}>
                    {getSyncStatusText()}
                </button>
            </div>
            <div>
                <button onClick={onExport} style={styles.footerButton}>Export</button>
                <button onClick={onImportClick} style={styles.footerButton}>Import</button>
            </div>

            <br />

            <div style={{ fontSize: '0.9rem', margin: '8px 0', opacity: 0.8 }}>
                Copyright © Darron Hartas {new Date().getFullYear()} | v{version}
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
