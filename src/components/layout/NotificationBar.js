import React from 'react';

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
    <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
        gap: '12px'
    }}>
        <div style={{ flex: 1, fontWeight: '600', lineHeight: '1.4' }}>
            🚀 A new version of 123 To Do is ready!
            <div style={{ fontSize: '0.8rem', fontWeight: '400', opacity: 0.9, marginTop: '2px' }}>
                Tap Update Now to get the latest features and performance improvements.
            </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
                onClick={onUpdate}
                style={{
                    background: '#ffffff',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                Update Now
            </button>
            <button
                onClick={onDismiss}
                style={{
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                }}
            >
                Not Now
            </button>
        </div>
    </div>
);

export const SyncOfflinePrompt = ({ onDismiss, isAuthed }) => (
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
                {isAuthed ? 'Tasks are saved locally and will auto-sync to Google Drive when back online.' : 'Tasks are saved locally on your device.'}
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
