import React from 'react';

const Footer = ({ onExport, onImportClick, version = '1.1.0' }) => {
    const styles = {
        footer: {
            flexShrink: 0,
            padding: '16px',
            paddingBottom: window.innerWidth < 768 ? '60px' : '40px',
            background: 'var(--footer-bg)',
            textAlign: 'center',
            fontSize: '1.1rem',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--muted-text)'
        },
        footerButton: {
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-color)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            margin: '0 4px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
        }
    };

    return (
        <footer style={styles.footer}>
            <button onClick={onExport} style={styles.footerButton}>Export</button>
            <span> | </span>
            <button onClick={onImportClick} style={styles.footerButton}>Import</button>
            <br />
            Copyright © Darron Hartas {new Date().getFullYear()} | v{version}
            <br />
            <div style={{ marginTop: '12px', fontSize: '1rem' }}>
                <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none', marginRight: '24px' }}>
                    Terms of Service
                </a>
                <a href="https://www.123todo.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
                    Privacy Policy
                </a>
            </div>
        </footer>
    );
};

export default Footer;
