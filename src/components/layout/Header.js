import React from 'react';

const Header = ({ taskCount, onToggleAdd, isAddOpen }) => {
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
            fontSize: '0.9rem',
            opacity: 0.8,
            color: 'var(--muted-text)',
            margin: '0 auto'
        },
        addTaskToggle: {
            background: 'none',
            border: 'none',
            color: 'var(--text-color)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1
        }
    };

    return (
        <header style={styles.header}>
            <a href="https://www.123todo.com" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                <img
                    src="/123-logo-500px.jpg"
                    alt="123 ToDo logo"
                    style={{
                        width: '200px',
                        height: 'auto',
                        cursor: 'pointer',
                        display: 'block'
                    }}
                />
            </a>
            <div style={styles.taskCounter}>
                {taskCount} task{taskCount !== 1 ? 's' : ''}
            </div>
            <button
                onClick={onToggleAdd}
                style={styles.addTaskToggle}
                aria-label={isAddOpen ? "Close add task" : "Open add task"}
            >
                {isAddOpen ? '➖' : '➕'}
            </button>
        </header>
    );
};

export default Header;
