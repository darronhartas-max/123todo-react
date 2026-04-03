import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

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
            fontSize: '1.1rem',
            opacity: 0.8,
            color: 'var(--muted-text)',
            margin: '0 auto'
        },
        addTaskToggle: {
            background: 'none',
            border: 'none',
            color: 'var(--accent-color)',
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
            <a href="https://www.123todo.com" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                <img
                    src="/123-logo-500px.jpg"
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
                {taskCount} task{taskCount !== 1 ? 's' : ''}
            </div>
            <button
                onClick={onToggleAdd}
                style={styles.addTaskToggle}
                aria-label={isAddOpen ? "Close add task" : "Open add task"}
            >
                {isAddOpen ? <MinusCircle size={24} /> : <PlusCircle size={24} />}
            </button>
        </header>
    );
};

export default Header;
