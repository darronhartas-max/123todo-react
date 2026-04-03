import React from 'react';

const Footer = ({ onExport, onImportClick, onTodoistImport, version = '1.3.0' }) => {
    const styles = {
        footer: {
            flexShrink: 0,
            padding: '60px 20px 100px 20px',
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

    return (
        <footer style={styles.footer}>
            <div>
                <button onClick={onExport} style={styles.footerButton}>Export</button>
                <button onClick={onImportClick} style={styles.footerButton}>Import</button>
            </div>

            <div style={{ fontSize: '0.9rem', margin: '24px 0', opacity: 0.8 }}>
                Copyright © Darron Hartas {new Date().getFullYear()} | v{version}
            </div>

            <div style={{ marginTop: '20px', fontSize: '1rem' }}>
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
