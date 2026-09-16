import React from 'react';
import { Trophy } from 'lucide-react';
import { APP_VERSION } from '../../utils/constants';
import { useTenant } from '../../context/TenantContext';

const Footer = ({ version = APP_VERSION, onInstallClick, isStandalone = false, onOpenAchievements }) => {
    const { tenantConfig, isCustomTenant } = useTenant();

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
        },
        partnerBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '4px 12px',
            marginBottom: '8px',
            borderRadius: '16px',
            backgroundColor: 'var(--accent-bg, rgba(99, 102, 241, 0.08))',
            border: '1px solid var(--accent-color, #2563eb)',
            color: 'var(--accent-color, #2563eb)',
            fontSize: '0.82rem',
            fontWeight: '600'
        }
    };

    const footerCfg = tenantConfig?.footer || {};
    const copyrightText = footerCfg.copyrightText || `Copyright © Unforgettable Management Ltd ${new Date().getFullYear()}`;
    const footerLinks = footerCfg.links || [
        { label: 'Terms of Service', url: 'https://www.123todo.com/terms' },
        { label: 'Privacy Policy', url: 'https://www.123todo.com/privacy' }
    ];
    const showInstall = !isStandalone && onInstallClick && footerCfg.showInstallButton !== false;
    const showVersion = footerCfg.showVersion !== false;
    const showAchievements = onOpenAchievements && footerCfg.showAchievements !== false;

    return (
        <footer style={styles.footer}>
            {showInstall && (
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

            {/* Branded Commercial Partner Badge / Logo */}
            {isCustomTenant && (footerCfg.partnerBadgeText || footerCfg.partnerLogo) && (
                <div style={{ marginBottom: '8px' }}>
                    <div style={styles.partnerBadge}>
                        {footerCfg.partnerLogo && (
                            <a
                                href={footerCfg.partnerLogo.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                                <img
                                    src={footerCfg.partnerLogo.src}
                                    alt={footerCfg.partnerLogo.alt || 'Partner logo'}
                                    style={{
                                        height: footerCfg.partnerLogo.height || '18px',
                                        width: 'auto',
                                        display: 'block'
                                    }}
                                />
                            </a>
                        )}
                        {footerCfg.partnerBadgeText && (
                            <span>{footerCfg.partnerBadgeText}</span>
                        )}
                    </div>
                </div>
            )}

            <div style={{
                fontSize: '0.88rem',
                margin: '6px 0',
                opacity: 0.9
            }}>
                <div style={{ marginBottom: '3px' }}>
                    {copyrightText}
                </div>
                {showVersion && (
                    <div style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}>
                        <span>v{version}</span>
                        {showAchievements && (
                            <button
                                type="button"
                                onClick={onOpenAchievements}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid #f59e0b',
                                    color: '#d97706',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(245, 158, 11, 0.2)'
                                }}
                                title="Productivity Achievements & Insights"
                                aria-label="Productivity Achievements & Insights"
                            >
                                <Trophy size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '6px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {footerLinks.map((link) => (
                    <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-color)', textDecoration: 'none' }}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
