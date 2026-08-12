import React from 'react';
import { PlusCircle, MinusCircle, CheckSquare, Mic } from 'lucide-react';

const Header = ({ taskCount, onToggleAdd, isAddOpen, isDark, appMode = 'tasks', onSwitchMode = () => {} }) => {
    const styles = {
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--header-bg)',
            border: '1px solid var(--border-color)',
            padding: '12px 16px',
            boxSizing: 'border-box',
            gap: '12px'
        },
        taskCounter: {
            fontSize: '0.95rem',
            opacity: 0.8,
            color: 'var(--muted-text)',
            whiteSpace: 'nowrap'
        },
        modeToggleContainer: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--item-bg, rgba(0,0,0,0.05))',
            borderRadius: '20px',
            padding: '2px',
            border: '1px solid var(--border-color, rgba(0,0,0,0.1))',
            margin: '0 auto',
            flexShrink: 0
        },
        modeButton: (active) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: active ? '#2563eb' : 'transparent',
            color: active ? '#ffffff' : 'var(--text-color, #4b5563)',
            fontWeight: '700',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
        }),
        addTaskToggle: {
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
            flexShrink: 0
        }
    };

    return (
        <header style={styles.header}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
                gap: '12px',
                filter: isAddOpen ? 'blur(5px)' : 'none',
                opacity: isAddOpen ? 0.5 : 1,
                transition: 'all 0.3s ease',
                pointerEvents: isAddOpen ? 'none' : 'auto'
            }}>
                <a href="https://www.123todo.com" target="_blank" rel="noreferrer" style={{ display: 'block', flexShrink: 0 }}>
                    <img
                        src={isDark ? '/123-logo-500px-dark.png' : '/123-logo-500px-light.png'}
                        alt="123 ToDo logo"
                        style={{
                            width: '240px',
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
                        <CheckSquare size={13} />
                        <span>Tasks</span>
                    </button>
                    <button
                        style={styles.modeButton(appMode === 'notes')}
                        onClick={() => onSwitchMode('notes')}
                        title="Switch to Notes Mode"
                    >
                        <Mic size={13} />
                        <span>Notes</span>
                    </button>
                </div>

                <div style={styles.taskCounter}>
                    {taskCount} active
                </div>
            </div>

            {appMode === 'tasks' && (
                <button
                    onClick={onToggleAdd}
                    style={{
                        ...styles.addTaskToggle,
                        position: 'relative',
                        zIndex: 10,
                        filter: 'none',
                        opacity: 1,
                        pointerEvents: 'auto'
                    }}
                    aria-label={isAddOpen ? "Close add task" : "Open add task"}
                >
                    {isAddOpen ? <MinusCircle size={28} /> : <PlusCircle size={28} />}
                </button>
            )}
        </header>
    );
};

export default Header;
