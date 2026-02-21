import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH } from '../../utils/constants';

const AddTask = ({ isOpen, onAdd, onClose }) => {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState(1);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        onAdd(text, priority);
        setText('');
        onClose();
    };

    const getPriorityButtonStyle = (p) => {
        const config = PRIORITIES[p];
        const isActive = priority === p;
        return {
            padding: '6px 8px',
            fontSize: '0.6rem',
            fontWeight: '600',
            border: '2px solid',
            borderRadius: '5px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase',
            letterSpacing: '0.2px',
            flex: '0 1 auto',
            whiteSpace: 'nowrap',
            color: isActive ? 'white' : config.color,
            backgroundColor: isActive ? config.color : 'var(--bg-color)',
            borderColor: config.color
        };
    };

    const styles = {
        addSection: {
            padding: isOpen ? '12px' : '0',
            background: 'var(--surface-color)',
            maxHeight: isOpen ? '280px' : '0',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            boxSizing: 'border-box'
        },
        taskInput: {
            width: '100%',
            padding: '10px 12px',
            fontSize: '1rem',
            border: '2px solid var(--border-color)',
            borderRadius: '6px',
            resize: 'none',
            height: '40px',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box'
        }
    };

    return (
        <div style={styles.addSection}>
            <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                placeholder="What needs to be done?"
                style={styles.taskInput}
                maxLength={MAX_TASK_LENGTH}
            />
            <div style={{
                fontSize: '0.75rem',
                textAlign: 'right',
                marginTop: '4px',
                color: '#6b7280',
                fontWeight: '500'
            }}>
                {text.length}/{MAX_TASK_LENGTH}
            </div>

            <div style={{
                display: 'flex',
                gap: '6px',
                margin: '10px 0',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {[1, 2, 3].map(p => (
                    <button
                        key={p}
                        onClick={() => setPriority(p)}
                        style={getPriorityButtonStyle(p)}
                    >
                        {PRIORITIES[p].label}
                    </button>
                ))}
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '7px 16px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        border: '2px solid #c7d2fe',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        flex: '0 1 auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    ADD
                </button>
            </div>
        </div>
    );
};

export default AddTask;
