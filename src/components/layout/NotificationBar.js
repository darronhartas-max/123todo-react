import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const InstallPrompt = ({ onInstall, onDismiss }) => (
    <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 12px',
        margin: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    }}>
        <div style={{ flex: 1, fontWeight: '600' }}>
            Add 123 To Do to your home screen for easy access!
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                onClick={onInstall}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                }}
            >
                Install
            </button>
            <button
                onClick={onDismiss}
                style={{
                    background: 'transparent',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                }}
            >
                Not Now
            </button>
        </div>
    </div>
);

export const BackupReminder = ({ onBackup, onDismiss }) => (
    <div style={{
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        padding: '10px 12px',
        margin: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#92400e'
    }}>
        <div style={{ flex: 1, fontWeight: '600' }}>
            📝 It's been a week! Don't forget to backup your tasks.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                onClick={onBackup}
                style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                }}
            >
                Backup Now
            </button>
            <button
                onClick={onDismiss}
                style={{
                    background: 'transparent',
                    color: '#92400e',
                    border: '1px solid #f59e0b',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                }}
            >
                Dismiss
            </button>
        </div>
    </div>
);
export const UpdateReadyPrompt = ({ onUpdate, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px 16px',
            margin: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
            gap: '14px',
            backdropFilter: 'blur(12px)'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--accent-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--border-color)'
            }}>
                <Sparkles size={20} color="var(--accent-color)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    New Version Available
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.35' }}>
                    An update for 123 To Do is ready to install with fresh enhancements.
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button
                onClick={onUpdate}
                style={{
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 15px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.15s ease'
                }}
            >
                Update Now
            </button>
            <button
                onClick={onDismiss}
                style={{
                    background: 'transparent',
                    color: 'var(--muted-text)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '7px 11px',
                    fontSize: '0.82rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                }}
            >
                Not Now
            </button>
        </div>
    </motion.div>
);

export const SyncOfflinePrompt = ({ onDismiss, isAuthed, syncProvider = 'cloudflare' }) => {
    const providerLabel = syncProvider === 'gdrive' ? 'Google Drive' : 'Cloud Sync';
    return (
        <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            gap: '12px'
        }}>
            <div style={{ flex: 1, fontWeight: '600', lineHeight: '1.4' }}>
                📡 Internet Connection Offline
                <div style={{ fontSize: '0.8rem', fontWeight: '400', opacity: 0.95, marginTop: '2px' }}>
                    {isAuthed ? `Tasks are saved locally and will auto-sync to ${providerLabel} when back online.` : 'Tasks are saved locally on your device.'}
                </div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Dismiss
                </button>
            )}
        </div>
    );
};
