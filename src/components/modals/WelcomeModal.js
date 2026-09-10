import React, { useState } from 'react';
import { 
    Download, 
    ChevronDown, 
    ChevronUp, 
    CheckCircle2, 
    Shield, 
    Sparkles, 
    Smartphone, 
    ExternalLink,
    Zap
} from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';

const getPlatform = () => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
};

const WelcomeModal = ({ 
    onAccept, 
    canNativeInstall = false, 
    onInstall = null, 
    isStandalone = false 
}) => {
    const [openSection, setOpenSection] = useState(null);
    const platform = getPlatform();

    const toggleSection = (sectionId) => {
        setOpenSection(prev => prev === sectionId ? null : sectionId);
    };

    const styles = {
        welcomeModal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '24px 20px',
            borderRadius: '16px',
            maxWidth: '92%',
            width: '480px',
            boxShadow: '0 16px 45px rgba(0,0,0,0.35)',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            boxSizing: 'border-box'
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            background: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--accent-color)',
            marginBottom: '10px'
        },
        installCard: {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
            border: '1.5px solid var(--accent-color)',
            borderRadius: '12px',
            padding: '16px',
            margin: '16px 0',
            textAlign: 'left'
        },
        installButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            marginTop: '10px',
            transition: 'transform 0.1s ease'
        },
        accordionButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-color)',
            fontSize: '0.92rem',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left'
        },
        accordionContent: {
            background: 'var(--item-bg)',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '12px 14px',
            fontSize: '0.88rem',
            color: 'var(--muted-text)',
            lineHeight: '1.45',
            marginTop: '-2px'
        },
        primaryButton: {
            width: '100%',
            padding: '14px 20px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.05rem',
            fontWeight: '600',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
            transition: 'transform 0.1s ease'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
            <div style={styles.welcomeModal}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <div style={styles.badge}>
                        <Zap size={13} /> Free App • Works Offline
                    </div>
                    <h2 id="welcome-modal-title" style={{ margin: '0 0 6px 0', color: 'var(--text-color)', fontSize: '1.45rem', fontWeight: '700' }}>
                        Welcome to 123 To Do
                    </h2>
                    <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.92rem' }}>
                        A lightning-fast, privacy-first task & notes app.
                    </p>
                </div>

                {/* App Installation Promotion Card */}
                <div style={styles.installCard}>
                    {isStandalone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600', fontSize: '0.92rem' }}>
                            <CheckCircle2 size={18} />
                            <span>App Mode Active • Running from Home Screen</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Smartphone size={18} style={{ color: 'var(--accent-color)' }} />
                                <strong style={{ color: 'var(--accent-color)', fontSize: '0.98rem' }}>
                                    Install on Your Device
                                </strong>
                            </div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.4' }}>
                                No app store required! Install directly to your home screen for full-screen mode and instant offline launch.
                            </p>

                            {canNativeInstall && onInstall ? (
                                <button
                                    onClick={onInstall}
                                    style={styles.installButton}
                                    aria-label="Install App"
                                >
                                    <Download size={18} />
                                    <span>Install 123 To Do App</span>
                                </button>
                            ) : (
                                <div style={{
                                    background: 'var(--bg-color)',
                                    borderRadius: '8px',
                                    padding: '8px 10px',
                                    fontSize: '0.84rem',
                                    color: 'var(--muted-text)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {platform === 'ios' && (
                                        <span>
                                            💡 <strong>iPhone / iPad:</strong> Tap <strong>Share (⬆️)</strong> ➔ <strong>"Add to Home Screen"</strong>
                                        </span>
                                    )}
                                    {platform === 'android' && (
                                        <span>
                                            💡 <strong>Android:</strong> Tap <strong>Menu (⋮)</strong> ➔ <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                                        </span>
                                    )}
                                    {platform === 'desktop' && (
                                        <span>
                                            💡 <strong>Desktop:</strong> Click the <strong>Install icon (⬇️)</strong> in your browser address bar
                                        </span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Collapsible Accordion Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
                    {/* Accordion 1: Install Instructions */}
                    <div>
                        <button
                            onClick={() => toggleSection('install')}
                            style={styles.accordionButton}
                            aria-expanded={openSection === 'install'}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Smartphone size={16} style={{ color: 'var(--accent-color)' }} />
                                How to Install (iOS, Android, PC)
                            </span>
                            {openSection === 'install' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {openSection === 'install' && (
                            <div style={styles.accordionContent}>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: 'var(--text-color)' }}>📱 iPhone & iPad (Safari):</strong>
                                    <div>Tap Share (⬆️) ➔ scroll down to <strong>"Add to Home Screen"</strong> ➔ tap Add.</div>
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: 'var(--text-color)' }}>🤖 Android (Chrome):</strong>
                                    <div>Tap Menu (⋮) ➔ select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: 'var(--text-color)' }}>💻 Mac & Windows (Chrome/Edge/Safari):</strong>
                                    <div>Click the Install icon in the browser address bar (or Safari ➔ File ➔ Add to Dock).</div>
                                </div>
                                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                    <a
                                        href="/how-to-install-123todo-pwa.md"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        Full beginner guide <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Accordion 2: Features */}
                    <div>
                        <button
                            onClick={() => toggleSection('features')}
                            style={styles.accordionButton}
                            aria-expanded={openSection === 'features'}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
                                What You Can Do
                            </span>
                            {openSection === 'features' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {openSection === 'features' && (
                            <div style={styles.accordionContent}>
                                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <li><strong>📝 Rich Task & Note Mode:</strong> Unlimited task notes, photos, and timestamps.</li>
                                    <li><strong>👈 Swipe Gestures:</strong> Complete, delete, or edit tasks with intuitive swipes.</li>
                                    <li><strong>🔒 Encrypted Google Drive Sync:</strong> Zero-knowledge sync across all your devices.</li>
                                    <li><strong>📁 Projects & Reordering:</strong> Drag and drop projects to organize your work.</li>
                                    <li><strong>🎙️ Voice Dictation:</strong> Native browser-based speech-to-text with zero server storage.</li>
                                    <li><strong>⚡ Full Offline Support:</strong> Instant loading anytime, even without an internet connection.</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Accordion 3: Privacy & Legal */}
                    <div>
                        <button
                            onClick={() => toggleSection('legal')}
                            style={styles.accordionButton}
                            aria-expanded={openSection === 'legal'}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={16} style={{ color: 'var(--accent-color)' }} />
                                Privacy, Security & Terms
                            </span>
                            {openSection === 'legal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {openSection === 'legal' && (
                            <div style={styles.accordionContent}>
                                <p style={{ margin: '0 0 6px 0' }}>
                                    <strong>100% Private:</strong> Your tasks are stored locally on your device. We do not track or sell your data.
                                </p>
                                <p style={{ margin: '0 0 6px 0' }}>
                                    <strong>Cloud Sync:</strong> Cloud sync is optional and end-to-end encrypted directly with your personal Google Drive.
                                </p>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    <strong>Terms:</strong> Provided "as is" without warranty. Backups are recommended via JSON export or Drive sync.
                                </p>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem' }}>
                                    <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                                        Terms of Service ➔
                                    </a>
                                    <a href="https://www.123todo.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                                        Privacy Policy ➔
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={onAccept}
                        style={styles.primaryButton}
                    >
                        Start Using 123 To Do ➔
                    </button>
                    <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                        Free to use • No credit card or account required
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;

