import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, LogIn } from 'lucide-react';

const SyncDroppedModal = ({ isOpen, onSignIn, onClose }) => {
    if (!isOpen) return null;

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
            zIndex: 10000,
            backdropFilter: 'blur(2px)'
        },
        modal: {
            background: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            color: 'var(--text-color)',
            textAlign: 'center'
        },
        iconContainer: {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
        },
        title: {
            margin: '0 0 8px 0',
            fontSize: '1.25rem',
            fontWeight: '700'
        },
        text: {
            fontSize: '0.95rem',
            color: 'var(--muted-text)',
            lineHeight: '1.5',
            margin: '0 0 20px 0'
        },
        button: {
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
        },
        primaryBtn: {
            background: 'var(--accent-color)',
            color: 'white',
            marginBottom: '10px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
        },
        secondaryBtn: {
            background: 'var(--item-bg)',
            color: 'var(--muted-text)',
            border: '1px solid var(--border-color)'
        }
    };

    const handleSignInClick = () => {
        onSignIn();
        onClose();
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                style={styles.modal}
            >
                <div style={styles.iconContainer}>
                    <AlertTriangle size={30} />
                </div>

                <h3 style={styles.title}>Google Sync Disconnected</h3>

                <p style={styles.text}>
                    Your Google session has expired or disconnected. Sign in again to keep your tasks synced automatically across your devices.
                </p>

                <button
                    style={{ ...styles.button, ...styles.primaryBtn }}
                    onClick={handleSignInClick}
                >
                    <LogIn size={18} />
                    Sign In with Google
                </button>

                <button
                    style={{ ...styles.button, ...styles.secondaryBtn }}
                    onClick={onClose}
                >
                    Remind Me Later
                </button>
            </motion.div>
        </div>
    );
};

export default SyncDroppedModal;
