import React from 'react';
import { Info, Check, Sparkles, RefreshCw, Building2, Download, CheckCircle2, Smartphone, Laptop, BookOpen, ExternalLink } from 'lucide-react';
import { APP_VERSION } from '../../../utils/constants';
import { useTenant } from '../../../context/TenantContext';

const SettingsAboutTab = ({
    updateCheckStatus = 'idle',
    onCheckForUpdates,
    onOpenLatestUpdates,
    isStandalone = false,
    canNativeInstall = false,
    onNativeInstall,
    onOpenInstallGuide,
    styles
}) => {
    const { tenantConfig, isCustomTenant, resetTenant } = useTenant();

    const handleManualCheckForUpdates = (e) => {
        if (onCheckForUpdates) {
            onCheckForUpdates(e);
        }
    };

    return (
        <div>
            <div style={styles.sectionTitle}>
                <Info size={20} /> App Version & Updates
            </div>

            {/* App Version & Manual Update Check */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-color)',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-color)' }}>
                            123 To Do
                        </span>
                        <span style={{
                            background: 'var(--accent-color)',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                        }}>
                            v{APP_VERSION}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                        {updateCheckStatus === 'checking' && (
                            <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Checking for updates...</span>
                        )}
                        {updateCheckStatus === 'up-to-date' && (
                            <span style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={16} /> 123 To Do is up to date (v{APP_VERSION})
                            </span>
                        )}
                        {updateCheckStatus === 'update-available' && (
                            <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={16} /> New version updating in background...
                            </span>
                        )}
                        {updateCheckStatus === 'idle' && (
                            <span style={{ color: 'var(--muted-text)' }}>Updates install automatically in the background</span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {onOpenLatestUpdates && (
                        <button
                            onClick={onOpenLatestUpdates}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--accent-color)',
                                background: 'var(--accent-bg, rgba(99, 102, 241, 0.1))',
                                color: 'var(--accent-color)',
                                fontWeight: '600',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease'
                            }}
                            title="View what's new in recent releases"
                        >
                            <Sparkles size={15} />
                            Latest Update Info
                        </button>
                    )}
                    <button
                        onClick={handleManualCheckForUpdates}
                        disabled={updateCheckStatus === 'checking'}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--surface-color)',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            fontSize: '0.88rem',
                            cursor: updateCheckStatus === 'checking' ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            opacity: updateCheckStatus === 'checking' ? 0.6 : 1
                        }}
                    >
                        <RefreshCw size={15} style={{ animation: updateCheckStatus === 'checking' ? 'spin 1s linear infinite' : 'none' }} />
                        {updateCheckStatus === 'checking' ? 'Checking...' : 'Check for Updates'}
                    </button>
                </div>
            </div>

            {isCustomTenant && (
                <div style={{
                    marginTop: '12px',
                    marginBottom: '18px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-bg, rgba(99, 102, 241, 0.08))',
                    border: '1.5px solid var(--accent-color, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={16} color="var(--accent-color)" /> Custom Client Edition: {tenantConfig?.brandName}
                        </div>
                        {tenantConfig?.tagline && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                                {tenantConfig.tagline}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => resetTenant()}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--surface-color)',
                            color: 'var(--text-color)',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        title="Reset to standard 123 To Do"
                    >
                        Reset to Standard
                    </button>
                </div>
            )}

            <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={18} /> App Installation & PWA Mode
            </div>

            {/* Status Card */}
            <div style={{
                background: isStandalone ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                border: `1.5px solid ${isStandalone ? '#10b981' : 'var(--accent-color)'}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {isStandalone ? <CheckCircle2 size={20} color="#10b981" /> : <Download size={20} color="var(--accent-color)" />}
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: isStandalone ? '#10b981' : 'var(--accent-color)' }}>
                        {isStandalone ? 'Installed & Running in App Mode' : 'Currently in Web Browser Mode'}
                    </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                    {isStandalone 
                        ? 'You are currently using 123 To Do as an installed application with full-screen focus and offline database protection.' 
                        : '123 To Do is a Progressive Web App (PWA). You can install it directly onto your phone, tablet, or computer right now without downloading from an app store.'}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {canNativeInstall && !isStandalone && (
                        <button
                            onClick={onNativeInstall}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.88rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Download size={15} /> 1-Click Install Now
                        </button>
                    )}
                    {onOpenInstallGuide && (
                        <button
                            onClick={onOpenInstallGuide}
                            style={{
                                padding: '8px 14px',
                                background: 'var(--surface-color)',
                                color: 'var(--accent-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '0.88rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            Open Interactive Device Guide
                        </button>
                    )}
                </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-color)' }}>
                How to Install on Your Device:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Smartphone size={16} /> iPhone & iPad (Safari)
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                        1. Open <strong>123todo.com</strong> in Safari.<br />
                        2. Tap the <strong>Share button</strong> (square with up arrow ⬆️) at the bottom.<br />
                        3. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                        4. Tap <strong>"Add"</strong> in the top-right corner.
                    </div>
                </div>

                <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Smartphone size={16} /> Android (Chrome)
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                        1. Open <strong>123todo.com</strong> in Google Chrome.<br />
                        2. Tap the <strong>three dots (⋮)</strong> menu in the top-right.<br />
                        3. Tap <strong>"Install app"</strong> (or "Add to Home screen").<br />
                        4. Tap <strong>"Install"</strong> to confirm.
                    </div>
                </div>

                <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Laptop size={16} /> Mac & Windows PC (Chrome, Edge, Safari)
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                        • <strong>Chrome / Edge:</strong> Click the <strong>Install icon</strong> on the right side of the address bar.<br />
                        • <strong>Safari on macOS Sonoma+:</strong> Choose <strong>File ➔ Add to Dock...</strong> from the top menu bar.
                    </div>
                </div>
            </div>

            {/* Official Guides & Tutorials */}
            <div style={{ fontSize: '1rem', fontWeight: '700', marginTop: '16px', marginBottom: '10px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={18} /> Official Guides & Tutorials
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                <a
                    href="https://www.123todo.com/getting-started-with-123-todo"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        background: 'var(--bg-color)',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}
                >
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Getting Started: 3-Minute Beginner's Guide
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.4' }}>
                            The absolute basics to get organized today—1-2-3 rule, offline safety, and home screen install.
                        </div>
                    </div>
                    <ExternalLink size={15} color="var(--accent-color)" style={{ flexShrink: 0 }} />
                </a>

                <a
                    href="https://www.123todo.com/123-todo-feature-mastery-guide"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        background: 'var(--bg-color)',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}
                >
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            The Complete Feature Guide: Power User Walkthrough
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.4' }}>
                            Master midnight rollovers, analog clock face scheduling, subtask checklists, and encrypted sync.
                        </div>
                    </div>
                    <ExternalLink size={15} color="var(--accent-color)" style={{ flexShrink: 0 }} />
                </a>

                <a
                    href="https://www.123todo.com/user-guide"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        background: 'var(--bg-color)',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}
                >
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Full User Guide & Documentation
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.4' }}>
                            Complete guide to all keyboard shortcuts, gestural controls, and power workflows.
                        </div>
                    </div>
                    <ExternalLink size={15} color="var(--accent-color)" style={{ flexShrink: 0 }} />
                </a>
            </div>

            {/* Full PWA Guide Link */}
            <div style={{
                background: 'var(--item-bg)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>What is a PWA?</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>
                        Read our beginner-friendly article on what a Progressive Web App is and why to install it.
                    </div>
                </div>
                <a
                    href="https://www.123todo.com/how-to-install-123todo-pwa"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'var(--accent-color)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '0.84rem',
                        fontWeight: '600'
                    }}
                >
                    Read PWA Article <ExternalLink size={13} />
                </a>
            </div>
        </div>
    );
};

export default SettingsAboutTab;
