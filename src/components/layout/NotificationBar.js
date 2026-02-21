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
