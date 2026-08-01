import React from 'react';
import { motion } from 'framer-motion';
import { Check, Rocket } from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';

const UpdatedModal = ({ oldVersion, newVersion, onClose }) => {
    const styles = {
        updatedModal: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            padding: '28px 24px',
            borderRadius: '16px',
            maxWidth: '90%',
            width: '460px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            maxHeight: '85vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            position: 'relative'
        },
        badgeContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            margin: '20px 0',
            background: 'var(--bg-color)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
        },
        versionBadge: {
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: '700',
            fontFamily: 'monospace',
            fontSize: '1.05rem'
        },
        arrow: {
            color: 'var(--muted-text)',
            fontWeight: '800',
            fontSize: '1.2rem'
        },
        newBadge: {
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: '700',
            fontFamily: 'monospace',
            fontSize: '1.05rem',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.15)'
        },
        iconCircle: {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        },
        button: {
            marginTop: '16px',
            width: '100%',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
                style={styles.updatedModal}
            >
                <div style={styles.iconCircle}>
                    <Rocket size={28} />
                </div>
                
                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.3px' }}>
                    123 To Do Updated!
                </h2>
                
                <p style={{ margin: '0 0 20px 0', color: 'var(--muted-text)', fontSize: '1.05rem', lineHeight: '1.4' }}>
                    The application has successfully updated to the latest version in the background.
                </p>

                <div style={styles.badgeContainer}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginBottom: '4px', fontWeight: '600' }}>PREVIOUS</div>
                        <div style={styles.versionBadge}>v{oldVersion}</div>
                    </div>
                    <div style={styles.arrow}>→</div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginBottom: '4px', fontWeight: '600' }}>CURRENT</div>
                        <div style={styles.newBadge}>v{newVersion}</div>
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    margin: '16px 0',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    color: 'var(--text-color)'
                }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--accent-color)' }}>
                        ✨ What's New in v{newVersion}:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                        <li><strong>👈 Task Swipe Gestures:</strong> Drag cards left or right to complete, delete, edit, or set On Hold.</li>
                        <li><strong>⚡ Ultra-Fast Google Drive Sync:</strong> Near real-time 300ms push & 4s polling across all devices.</li>
                        <li><strong>🚀 User-Controlled Updates:</strong> Tap "Update Now" when convenient — no unexpected reloads.</li>
                        <li><strong>📋 Compact Projects List:</strong> Fits 13+ projects into view in Settings without scrolling.</li>
                    </ul>
                </div>

                <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    margin: '12px 0',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-color)'
                }}>
                    <Check size={18} style={{ color: '#10b981', flexShrink: 0 }} strokeWidth={3} />
                    <span>All your settings, custom projects, and tasks were safely preserved.</span>
                </div>

                <button
                    onClick={onClose}
                    style={styles.button}
                >
                    Awesome, Let's Go!
                </button>
            </motion.div>
        </div>
    );
};

export default UpdatedModal;
