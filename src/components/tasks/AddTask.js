import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH, STORAGE_KEYS } from '../../utils/constants';
import { Plus, Minus } from 'lucide-react';
import { getTodayDateString, adjustStartDateForWeekdays, formatDisplayDate } from '../../utils/dateUtils';

const AddTask = ({ isOpen, onAdd, onClose, projects, defaultProjectId, dateFormat = 'UK' }) => {
    const getInitialProjectId = () => {
        const savedLastProject = localStorage.getItem(STORAGE_KEYS.LAST_PROJECT);
        const isValid = (id) => projects.some(p => p.id === id);
        if (defaultProjectId && defaultProjectId !== 'all' && isValid(defaultProjectId)) {
            return defaultProjectId;
        }
        if (savedLastProject && isValid(savedLastProject)) {
            return savedLastProject;
        }
        return projects[0]?.id || 'general';
    };

    const [projectId, setProjectId] = useState(getInitialProjectId);
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [priority, setPriority] = useState(1);
    
    // New scheduling and subtask states
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState(1);
    const [recurrenceInterval, setRecurrenceInterval] = useState('days');
    const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState([]);
    
    const inputRef = useRef(null);
    const hasOpenedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            if (!hasOpenedRef.current) {
                hasOpenedRef.current = true;
                setTimeout(() => inputRef.current?.focus(), 100);

                const savedLastProject = localStorage.getItem(STORAGE_KEYS.LAST_PROJECT);
                const isValid = (id) => projects.some(p => p.id === id);

                if (defaultProjectId && defaultProjectId !== 'all' && isValid(defaultProjectId)) {
                    setProjectId(defaultProjectId);
                } else if (savedLastProject && isValid(savedLastProject)) {
                    setProjectId(savedLastProject);
                } else if (projects.length > 0) {
                    setProjectId(projects[0]?.id || 'general');
                }
            }
        } else {
            hasOpenedRef.current = false;
        }
    }, [isOpen, defaultProjectId, projects]);

    const handleSubmit = () => {
        if (!text.trim()) return;
        const finalProjectId = projectId === 'all' ? (projects[0]?.id || 'general') : projectId;
        
        // Build recurrence rule if recurring is selected
        let recurrence = null;
        let finalScheduledDate = scheduledDate;
        if (isRecurring) {
            if (!finalScheduledDate) {
                finalScheduledDate = getTodayDateString();
            }
            if (recurrenceInterval === 'weeks' && recurrenceDaysOfWeek.length > 0) {
                finalScheduledDate = adjustStartDateForWeekdays(finalScheduledDate, recurrenceDaysOfWeek);
            }
            recurrence = {
                frequency: recurrenceFrequency,
                interval: recurrenceInterval,
                daysOfWeek: recurrenceInterval === 'weeks' && recurrenceDaysOfWeek.length > 0 ? recurrenceDaysOfWeek : []
            };
        }

        onAdd(text, priority, finalProjectId, notes.trim(), {
            scheduledDate: finalScheduledDate,
            subtasks,
            isRecurring: isRecurring && !!finalScheduledDate,
            recurrence
        });

        try {
            localStorage.setItem(STORAGE_KEYS.LAST_PROJECT, finalProjectId);
        } catch (e) {
            console.warn('Could not save last project preference:', e);
        }

        // Reset all states
        setText('');
        setNotes('');
        setShowNotes(false);
        setSubtasks([]);
        setNewSubtaskText('');
        setScheduledDate(null);
        setIsRecurring(false);
        setRecurrenceFrequency(1);
        setRecurrenceInterval('days');
        setRecurrenceDaysOfWeek([]);
        setShowSubtasks(false);
        setShowSchedule(false);
        setProjectId(finalProjectId);
        onClose();
    };

    const handleAddSubtask = () => {
        if (!newSubtaskText.trim()) return;
        const newSubtask = {
            id: Date.now() + Math.random(),
            text: newSubtaskText.trim(),
            completed: false
        };
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskText('');
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

    const toggleButtonStyle = (isActive) => ({
        border: '1px solid var(--accent-color)',
        color: isActive ? 'white' : 'var(--accent-color)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '1.05rem',
        fontWeight: '600',
        padding: '6px 12px',
        borderRadius: '4px',
        background: isActive ? 'var(--accent-color)' : 'transparent',
        transition: 'all 0.2s ease'
    });

    const handleInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
    };

    const styles = {
        addSection: {
            padding: isOpen ? '12px' : '0',
            background: 'var(--surface-color)',
            maxHeight: isOpen ? '900px' : '0',
            overflowY: 'auto',
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
            resize: 'vertical',
            minHeight: '48px',
            maxHeight: '140px',
            overflowY: 'auto',
            fontFamily: 'Inter, sans-serif',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            transition: 'border-color 0.3s ease',
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
                onInput={handleInput}
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

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '6px' }}>
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    style={toggleButtonStyle(showNotes)}
                >
                    {showNotes ? <Minus size={14} /> : <Plus size={14} />}
                    Notes
                </button>
                <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    style={toggleButtonStyle(showSubtasks)}
                >
                    {showSubtasks ? <Minus size={14} /> : <Plus size={14} />}
                    Subtasks ({subtasks.length})
                </button>
                <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    style={toggleButtonStyle(showSchedule)}
                >
                    {showSchedule ? <Minus size={14} /> : <Plus size={14} />}
                    {scheduledDate ? `Scheduled: ${formatDisplayDate(scheduledDate, dateFormat)}` : 'Schedule'}
                </button>
            </div>

            {showNotes && (
                <div style={{ marginTop: '10px' }}>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onInput={handleInput}
                        placeholder="Add unlimited text..."
                        style={{
                            ...styles.taskInput,
                            minHeight: '80px',
                            maxHeight: '200px',
                            fontSize: '1.1rem',
                            borderColor: 'var(--border-color)',
                            overflowY: 'auto'
                        }}
                    />
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--muted-text)',
                        textAlign: 'right',
                        marginTop: '2px',
                        fontWeight: '500'
                    }}>
                        📝 {notes.length} chars
                    </div>
                </div>
            )}

            {showSubtasks && (
                <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'var(--bg-color)'
                }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px', color: 'var(--muted-text)' }}>
                        📋 Subtasks / Checklist
                    </div>
                    {subtasks.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0' }}>
                            {subtasks.map((st) => (
                                <li key={st.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 0',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={() => {
                                                setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s));
                                            }}
                                            style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                                        />
                                        <span style={{
                                            textDecoration: st.completed ? 'line-through' : 'none',
                                            color: st.completed ? 'var(--muted-text)' : 'var(--text-color)',
                                            fontSize: '1.05rem'
                                        }}>
                                            {st.text}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                            type="text"
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            placeholder="Add subtask step..."
                            style={{
                                flex: 1,
                                padding: '8px 10px',
                                fontSize: '1.05rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--item-bg)',
                                color: 'var(--text-color)'
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubtask();
                                }
                            }}
                        />
                        <button
                            onClick={handleAddSubtask}
                            style={{
                                padding: '8px 16px',
                                background: 'var(--accent-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1.05rem',
                                fontWeight: '600'
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {showSchedule && (
                <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'var(--bg-color)'
                }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px', color: 'var(--muted-text)' }}>
                        📅 Date & Recurrence Scheduling
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
                            <label style={{ fontSize: '0.95rem', color: 'var(--muted-text)', fontWeight: '500' }}>Start/Scheduled Date</label>
                            <input
                                type="date"
                                value={scheduledDate || ''}
                                onChange={(e) => setScheduledDate(e.target.value || null)}
                                style={{
                                    padding: '8px 10px',
                                    fontSize: '1.05rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    background: 'var(--item-bg)',
                                    color: 'var(--text-color)',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        {scheduledDate && (
                            <button
                                onClick={() => { setScheduledDate(null); setIsRecurring(false); }}
                                style={{
                                    padding: '8px 16px',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    marginTop: '22px',
                                    color: '#333'
                                }}
                            >
                                Clear Date
                            </button>
                        )}
                    </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '500' }}>
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => {
                                        setIsRecurring(e.target.checked);
                                        if (e.target.checked && !scheduledDate) {
                                            setScheduledDate(getTodayDateString());
                                        }
                                    }}
                                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                                />
                                🔁 Repeat this task
                            </label>

                            {isRecurring && (
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.05rem' }}>
                                            <span>Every</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={recurrenceFrequency}
                                                onChange={(e) => setRecurrenceFrequency(Math.max(1, parseInt(e.target.value) || 1))}
                                                style={{
                                                    width: '60px',
                                                    padding: '6px 8px',
                                                    fontSize: '1.05rem',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '4px',
                                                    background: 'var(--item-bg)',
                                                    color: 'var(--text-color)',
                                                    textAlign: 'center'
                                                }}
                                            />
                                        </div>
                                        <select
                                            value={recurrenceInterval}
                                            onChange={(e) => setRecurrenceInterval(e.target.value)}
                                            style={{
                                                padding: '6px 10px',
                                                fontSize: '1.05rem',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '4px',
                                                background: 'var(--item-bg)',
                                                color: 'var(--text-color)'
                                            }}
                                        >
                                            <option value="days">Day(s)</option>
                                            <option value="weeks">Week(s)</option>
                                            <option value="months">Month(s)</option>
                                            <option value="years">Year(s)</option>
                                        </select>
                                    </div>

                                    {recurrenceInterval === 'weeks' && (
                                        <div style={{ marginTop: '6px' }}>
                                            <span style={{ fontSize: '0.95rem', color: 'var(--muted-text)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                                Repeat on specific days:
                                            </span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                                                    const isSelected = recurrenceDaysOfWeek.includes(idx);
                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => {
                                                                let updatedDays;
                                                                if (isSelected) {
                                                                    updatedDays = recurrenceDaysOfWeek.filter(d => d !== idx);
                                                                } else {
                                                                    updatedDays = [...recurrenceDaysOfWeek, idx];
                                                                }
                                                                setRecurrenceDaysOfWeek(updatedDays);
                                                                
                                                                // Auto-snap start date to next weekday
                                                                const baseDate = scheduledDate || getTodayDateString();
                                                                const snappedDate = adjustStartDateForWeekdays(baseDate, updatedDays);
                                                                setScheduledDate(snappedDate);
                                                            }}
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px 4px',
                                                                fontSize: '0.95rem',
                                                                fontWeight: '700',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                border: '1px solid',
                                                                borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                                                                background: isSelected ? 'var(--accent-color)' : 'var(--item-bg)',
                                                                color: isSelected ? 'white' : 'var(--text-color)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {day[0]}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
