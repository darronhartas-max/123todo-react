import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH } from '../../utils/constants';
import { Plus, Minus } from 'lucide-react';

const AddTask = ({ isOpen, onAdd, onClose, projects, defaultProjectId }) => {
    const fallbackProjectId = projects[0]?.id || 'general';
    const [projectId, setProjectId] = useState(defaultProjectId === 'all' ? fallbackProjectId : (defaultProjectId || fallbackProjectId));
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [priority, setPriority] = useState(1);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            const currentFallback = projects[0]?.id || 'general';
            if (defaultProjectId && defaultProjectId !== 'all') {
                setProjectId(defaultProjectId);
            } else if (defaultProjectId === 'all') {
                setProjectId(currentFallback);
            }
        }
    }, [isOpen, defaultProjectId, projects]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        const finalProjectId = projectId === 'all' ? (projects[0]?.id || 'general') : projectId;
        onAdd(text, priority, finalProjectId, notes.trim());
        setText('');
        setNotes('');
        setShowNotes(false);
        onClose();
    };

    const getPriorityButtonStyle = (p) => {
        const config = PRIORITIES[p];
        const isActive = priority === p;
        return {
            padding: '8px 4px',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: '2px solid',
            borderRadius: '5px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase',
            letterSpacing: '0.2px',
            flex: '1',
            minWidth: '0',
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
            maxHeight: isOpen ? '600px' : '0',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            boxSizing: 'border-box'
        },
        taskInput: {
            width: '100%',
            padding: '10px 12px',
            fontSize: '1.1rem',
            border: '1px solid var(--accent-color)',
            borderRadius: '6px',
            resize: 'none',
            height: '40px',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            outline: 'none'
        },
        projectSelect: {
            padding: '6px 8px',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            outline: 'none',
            marginBottom: '8px'
        }
    };

    return (
        <div style={styles.addSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    style={styles.projectSelect}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {text.length > 0 && (
                        <button
                            onClick={() => setShowNotes(!showNotes)}
                            style={{
                                border: 'none',
                                color: 'var(--accent-color)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: 'rgba(37, 99, 235, 0.05)'
                            }}
                        >
                            {showNotes ? <Minus size={14} /> : <Plus size={14} />}
                            {showNotes ? 'Hide Notes' : 'Add Notes'}
                        </button>
                    )}
                    <div style={{
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        fontWeight: '500'
                    }}>
                        {text.length}/{MAX_TASK_LENGTH}
                    </div>
                </div>
            </div>

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

            {showNotes && (
                <div style={{ marginTop: '10px' }}>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add details/notes..."
                        style={{
                            ...styles.taskInput,
                            height: '80px',
                            fontSize: '1.1rem',
                            borderColor: 'var(--border-color)',
                            overflowY: 'auto'
                        }}
                    />
                    <div style={{
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        textAlign: 'right',
                        marginTop: '2px'
                    }}>
                        {notes.length} chars
                    </div>
                </div>
            )}

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
                        padding: '7px 4px',
                        background: '#10b981',
                        color: 'white',
                        border: '2px solid #059669',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        flex: '1',
                        minWidth: '0',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                    }}
                >
                    ADD
                </button>
            </div>
        </div>
    );
};

export default AddTask;
