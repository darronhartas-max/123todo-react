import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Smartphone, 
    Laptop, 
    Download, 
    Share, 
    PlusSquare, 
    MoreVertical, 
    ExternalLink, 
    Zap, 
    WifiOff, 
    ShieldCheck, 
    CheckCircle2,
    Monitor
} from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';

const getInitialPlatform = () => {
    if (typeof window === 'undefined') return 'ios';
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
};

const InstallGuideModal = ({ isOpen, onClose, onNativeInstall, canNativeInstall = false, isStandalone = false }) => {
    const [selectedTab, setSelectedTab] = useState(getInitialPlatform);

    if (!isOpen) return null;

    const styles = {
        modal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '24px 20px',
            borderRadius: '16px',
            maxWidth: '92%',
            width: '580px',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            position: 'relative',
            boxSizing: 'border-box'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '14px',
            marginBottom: '16px'
        },
        titleContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        iconBox: {
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        tabBar: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '18px'
        },
        tabBtn: (id) => ({
            padding: '10px 8px',
            borderRadius: '8px',
            border: selectedTab === id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
            background: selectedTab === id ? 'var(--accent-bg, rgba(99, 102, 241, 0.1))' : 'var(--bg-color)',
            color: selectedTab === id ? 'var(--accent-color)' : 'var(--text-color)',
            fontWeight: selectedTab === id ? '700' : '500',
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
        }),
        stepCard: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        },
        stepNumber: {
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.85rem',
            flexShrink: 0
        },
        benefitGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginTop: '16px',
            marginBottom: '18px'
        },
        benefitCard: {
            background: 'var(--item-bg, rgba(0,0,0,0.03))',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                style={styles.modal}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.titleContainer}>
                        <div style={styles.iconBox}>
                            <Download size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                Install 123 To Do as an App
                            </h3>
                            <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                                No App Store required • Installs in seconds • 100% Free
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--muted-text)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Status Notice if already standalone */}
                {isStandalone && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#10b981',
                        fontSize: '0.88rem',
                        fontWeight: '600'
                    }}>
                        <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                        <span>You are already using 123 To Do in installed app mode! Enjoy your full-screen offline experience.</span>
                    </div>
                )}

                {/* Plain-English Introduction */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '18px',
                    fontSize: '0.88rem',
                    lineHeight: '1.5'
                }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent-color)', marginBottom: '4px' }}>
                        💡 What is a Progressive Web App (PWA)?
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-color)' }}>
                        Instead of searching an app store, 123 To Do installs <strong>directly from your browser</strong>. 
                        It adds an app icon to your Home Screen or Dock and opens in full-screen without any browser address bar clutter—just like a regular store app!
                    </p>
                </div>

                {/* 1-Click Native Install Button (Chrome / Edge / Android) */}
                {canNativeInstall && !isStandalone && (
                    <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                        <button
                            onClick={() => {
                                onNativeInstall();
                                onClose();
                            }}
                            style={{
                                width: '100%',
                                padding: '13px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Download size={20} />
                            <span>1-Click Install 123 To Do Now</span>
                        </button>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '6px' }}>
                            Or follow the step-by-step instructions below for your device.
                        </div>
                    </div>
                )}

                {/* Platform Selector Tabs */}
                <div style={styles.tabBar}>
                    <button
                        style={styles.tabBtn('ios')}
                        onClick={() => setSelectedTab('ios')}
                    >
                        <Smartphone size={16} />
                        <span>iPhone & iPad</span>
                    </button>
                    <button
                        style={styles.tabBtn('android')}
                        onClick={() => setSelectedTab('android')}
                    >
                        <Smartphone size={16} />
                        <span>Android</span>
                    </button>
                    <button
                        style={styles.tabBtn('desktop')}
                        onClick={() => setSelectedTab('desktop')}
                    >
                        <Laptop size={16} />
                        <span>Mac & PC</span>
                    </button>
                </div>

                {/* Instructions per Platform */}
                <AnimatePresence mode="wait">
                    {selectedTab === 'ios' && (
                        <motion.div
                            key="ios"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>1</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Open in Safari</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Make sure you are viewing <strong>123todo.com</strong> in Apple Safari (Apple requires Safari to install apps to your home screen).
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>2</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Tap the Share Button</strong>
                                        <Share size={16} color="var(--accent-color)" />
                                    </div>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Tap the square icon with an arrow pointing upward at the bottom bar of Safari (or top bar on iPad).
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>3</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Select "Add to Home Screen"</strong>
                                        <PlusSquare size={16} color="var(--accent-color)" />
                                    </div>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Scroll down through the share options and tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top-right corner.
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>4</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Launch from your Home Screen!</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Done! Tap the 123 To Do app icon on your iPhone or iPad home screen for instant full-screen access.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedTab === 'android' && (
                        <motion.div
                            key="android"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>1</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Open in Google Chrome</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Visit <strong>123todo.com</strong> in Google Chrome on your phone or tablet.
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>2</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Tap the 3-Dots Menu</strong>
                                        <MoreVertical size={16} color="var(--accent-color)" />
                                    </div>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Tap the menu button (three vertical dots) in the top-right corner of Chrome.
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>3</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Tap "Install app" or "Add to Home screen"</strong>
                                        <Download size={16} color="var(--accent-color)" />
                                    </div>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Select <strong>"Install app"</strong> (or "Add to Home screen"), then tap <strong>Install</strong> to confirm.
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>4</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Open from your App Drawer or Home Screen!</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        123 To Do is now installed as a standalone app on your Android device with offline support.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedTab === 'desktop' && (
                        <motion.div
                            key="desktop"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>1</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Chrome or Edge (Mac, Windows, Linux, Chromebook)</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Look at the right edge of your browser's address bar for the <Download size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>Install icon</strong> (small monitor or plus symbol). Click it and select <strong>"Install"</strong>.
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>2</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Safari on Mac (macOS Sonoma or newer)</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        Click <strong>File</strong> in the top Mac menu bar ➔ choose <strong>"Add to Dock..."</strong> ➔ click <strong>Add</strong>.
                                    </div>
                                </div>
                            </div>

                            <div style={styles.stepCard}>
                                <div style={styles.stepNumber}>3</div>
                                <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
                                    <strong>Pin to Dock or Taskbar</strong>
                                    <div style={{ color: 'var(--muted-text)', marginTop: '2px' }}>
                                        123 To Do opens in its own window. Pin it to your Windows Taskbar or Mac Dock for instant 1-click launching!
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Why Install Perks Grid */}
                <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Why install instead of keeping a tab open?
                    </div>
                    <div style={styles.benefitGrid}>
                        <div style={styles.benefitCard}>
                            <Zap size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                            <span><strong>1-Tap Launch</strong> from Home Screen or Dock</span>
                        </div>
                        <div style={styles.benefitCard}>
                            <WifiOff size={18} color="#10b981" style={{ flexShrink: 0 }} />
                            <span><strong>100% Offline</strong> works on planes & subways</span>
                        </div>
                        <div style={styles.benefitCard}>
                            <Monitor size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
                            <span><strong>Full Screen</strong> no browser tab/URL clutter</span>
                        </div>
                        <div style={styles.benefitCard}>
                            <ShieldCheck size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />
                            <span><strong>Safe & Persistent</strong> tasks stay protected</span>
                        </div>
                    </div>
                </div>

                {/* Footer Blog Link & Close Button */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '18px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-color)',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <a
                        href="/how-to-install-123todo-pwa.md"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            fontSize: '0.85rem',
                            color: 'var(--accent-color)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '600'
                        }}
                    >
                        <span>Read full PWA guide & article</span>
                        <ExternalLink size={14} />
                    </a>

                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 20px',
                            background: 'var(--item-bg)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Got It
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default InstallGuideModal;
