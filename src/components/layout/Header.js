import React from 'react';
import { PlusCircle, MinusCircle, CheckSquare, Mic } from 'lucide-react';

const Header = ({ onToggleAdd, isAddOpen, isDark, appMode = 'tasks', onSwitchMode = () => {} }) => {
    const styles = {
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--header-bg)',
            border: '1px solid var(--border-color)',
            padding: '10px 16px',
            boxSizing: 'border-box',
            gap: '12px'
        },
        modeToggleContainer: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--item-bg, rgba(0,0,0,0.06))',
            borderRadius: '24px',
            padding: '4px',
            border: '1.5px solid var(--border-color, rgba(0,0,0,0.12))',
            margin: '0 auto',
            flexShrink: 0,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        },
        modeButton: (active) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 18px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: active ? '#2563eb' : 'transparent',
            color: active ? '#ffffff' : 'var(--text-color, #4b5563)',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            boxShadow: active ? '0 2px 6px rgba(37,99,235,0.3)' : 'none'
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
            flexShrink: 0,
            marginLeft: '8px'
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
                    title={isAddOpen ? "Close add task form" : "Add new task"}
                >
                    {isAddOpen ? <MinusCircle size={30} /> : <PlusCircle size={30} />}
                </button>
            )}
        </header>
    );
};

export default Header;
