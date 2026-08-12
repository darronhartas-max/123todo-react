import React from 'react';
import { CheckSquare, Mic } from 'lucide-react';

const Header = ({ isDark, appMode = 'tasks', onSwitchMode = () => {} }) => {
    const styles = {
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--header-bg)',
            border: '1px solid var(--border-color)',
            padding: '10px 16px',
            boxSizing: 'border-box',
            gap: '8px',
            width: '100%',
            overflow: 'hidden'
        },
        modeToggleContainer: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--item-bg, rgba(0,0,0,0.06))',
            borderRadius: '24px',
            padding: '3px',
            border: '1.5px solid var(--border-color, rgba(0,0,0,0.12))',
            margin: 0,
            flexShrink: 0,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        },
        modeButton: (active) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: active ? '#2563eb' : 'transparent',
            color: active ? '#ffffff' : 'var(--text-color, #4b5563)',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            boxShadow: active ? '0 2px 6px rgba(37,99,235,0.3)' : 'none'
        })
    };

    return (
        <header style={styles.header}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '8px'
            }}>
                <a href="https://www.123todo.com" target="_blank" rel="noreferrer" style={{ display: 'block', flexShrink: 1, minWidth: 0, marginLeft: '-4px' }}>
                    <img
                        src={isDark ? '/123-logo-500px-dark.png' : '/123-logo-500px-light.png'}
                        alt="123 ToDo logo"
                        style={{
                            width: '190px',
                            maxWidth: '100%',
                            height: 'auto',
                            cursor: 'pointer',
                            display: 'block'
                        }}
                    />
                </a>

                {/* Dual Skin Mode Switcher Toggle Pill */}
                <div style={styles.modeToggleContainer}>
                    <button
                        style={styles.modeButton(appMode === 'tasks')}
                        onClick={() => onSwitchMode('tasks')}
                        title="Switch to Task Manager Mode"
                    >
                        <CheckSquare size={16} />
                        <span>Tasks</span>
                    </button>
                    <button
                        style={styles.modeButton(appMode === 'notes')}
                        onClick={() => onSwitchMode('notes')}
                        title="Switch to Notes Mode"
                    >
                        <Mic size={16} />
                        <span>Notes</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
