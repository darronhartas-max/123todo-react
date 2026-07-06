import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SyncModal = ({
    isOpen,
    onClose,
    isAuthed,
    syncStatus,
    passphrase,
    setPassphrase,
    signIn,
    signOut,
    performSync
}) => {
    const [localPassphrase, setLocalPassphrase] = useState(passphrase);
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Auto-close when sync completes
    useEffect(() => {
        if (isSaving && syncStatus === 'synced') {
            setIsSaving(false);
            onClose();
        }
    }, [syncStatus, isSaving, onClose]);

    if (!isOpen) return null;

    const handleSavePassphrase = () => {
        setPassphrase(localPassphrase);
        if (isAuthed) {
            setIsSaving(true);
            performSync(true); // Attempt initial sync when passphrase is saved
        }
    };

    const handleSignOut = () => {
        signOut();
        onClose();
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
        },
        modal: {
            background: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            color: 'var(--text-color)'
        },
        header: {
            margin: '0 0 16px 0',
            fontSize: '1.2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        input: {
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            boxSizing: 'border-box'
        },
        button: {
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%',
            marginBottom: '8px'
        },
        primaryBtn: {
            background: 'var(--accent-color)',
            color: 'white'
        },
        dangerBtn: {
            background: '#ef4444',
            color: 'white'
        },
        secondaryBtn: {
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
        },
        statusBadge: {
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            background: syncStatus === 'synced' ? 'rgba(16, 185, 129, 0.1)' : 'var(--item-bg)',
            color: syncStatus === 'synced' ? '#10b981' : 'var(--text-color)'
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.modal}
            >
                <div style={styles.header}>
                    <h3 style={{ margin: 0 }}>Google Drive Sync</h3>
                    <span style={styles.statusBadge}>{syncStatus.toUpperCase()}</span>
                </div>

                <div style={{ marginBottom: '20px', fontSize: '0.95rem', color: 'var(--muted-text)' }}>
                    Sync your tasks securely across all your devices using your own Google Drive.
                </div>

                {!isAuthed ? (
                    <div>
                        <button
                            style={{ ...styles.button, ...styles.primaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={signIn}
                        >
                            Sign in with Google
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Encryption Passphrase
                            </label>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '8px' }}>
                                Your data is encrypted before it leaves this device. Enter a passphrase to secure it. You must use the same passphrase on all devices.
                            </div>
                            <input
                                type={showPassphrase ? "text" : "password"}
                                style={styles.input}
                                value={localPassphrase}
                                onChange={(e) => setLocalPassphrase(e.target.value)}
                                placeholder="Enter a secure passphrase"
                            />
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="checkbox" checked={showPassphrase} onChange={(e) => setShowPassphrase(e.target.checked)} />
                                    Show
                                </label>
                            </div>
                            <button
                                style={{ ...styles.button, ...styles.primaryBtn }}
                                onClick={handleSavePassphrase}
                                disabled={!localPassphrase}
                            >
                                Save & Sync
                            </button>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

                        <div style={{ marginBottom: '16px', marginTop: '24px' }}>
                            <button
                                style={{ ...styles.button, ...styles.dangerBtn }}
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
                <button style={{ ...styles.button, ...styles.secondaryBtn }} onClick={onClose}>
                    Close
                </button>
            </motion.div>
        </div>
    );
};

export default SyncModal;
