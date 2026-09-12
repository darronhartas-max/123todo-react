import React from 'react';
import { APP_VERSION } from '../../utils/constants';

const Footer = ({ version = APP_VERSION, onInstallClick, isStandalone = false }) => {
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

    return (
        <footer style={styles.footer}>
            {!isStandalone && onInstallClick && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
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
                </div>
            )}

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
