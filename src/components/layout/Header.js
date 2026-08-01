import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

const Header = ({ taskCount, onToggleAdd, isAddOpen, isDark }) => {
    const styles = {
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--header-bg)',
            border: '1px solid var(--border-color)',
            padding: '12px 20px',
            boxSizing: 'border-box'
        },
        taskCounter: {
            fontSize: '1.1rem',
            opacity: 0.8,
            color: 'var(--muted-text)',
            margin: '0 auto'
        },
        addTaskToggle: {
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
        }
    };

    return (
        <header style={styles.header}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
                filter: isAddOpen ? 'blur(5px)' : 'none',
                opacity: isAddOpen ? 0.5 : 1,
                transition: 'all 0.3s ease',
                pointerEvents: isAddOpen ? 'none' : 'auto'
            }}>
                <a href="https://www.123todo.com" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                    <img
                        src={isDark ? '/123-logo-500px-dark.png' : '/123-logo-500px-light.png'}
                        alt="123 ToDo logo"
                        style={{
                            width: '240px',
                            height: 'auto',
                            cursor: 'pointer',
                            display: 'block'
                        }}
                    />
                </a>
                <div style={styles.taskCounter}>
                    {taskCount} active
                </div>
            </div>
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
        </header>
    );
};

export default Header;
