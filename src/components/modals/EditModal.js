import React, { useState, useRef } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH } from '../../utils/constants';
import { COMMON_STYLES } from '../../utils/styles';
import { getTodayDateString, adjustStartDateForWeekdays, formatDisplayDate } from '../../utils/dateUtils';
import { Mic, MicOff } from 'lucide-react';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';

const EditModal = ({ task, onSave, onClose, projects, dateFormat = 'UK', taskLengthLimit = '250' }) => {
    const isUnlimited = taskLengthLimit === 'unlimited';
    const [editingTask, setEditingTask] = useState({ ...task });
    
    // Voice Input State
    const [listeningTarget, setListeningTarget] = useState(null); // 'title' | 'notes' | null
    const [voiceStatus, setVoiceStatus] = useState('');
    const recognitionRef = useRef(null);
    const speechSupported = isSpeechRecognitionSupported();

    const stopVoice = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }
        recognitionRef.current = null;
        setListeningTarget(null);
    };

    const toggleVoiceInput = (targetField = 'notes') => {
        if (!speechSupported) {
            setVoiceStatus('Voice input is not supported in this browser.');
            setTimeout(() => setVoiceStatus(''), 4000);
            return;
        }

        if (listeningTarget === targetField) {
            stopVoice();
            setVoiceStatus('');
            return;
        }

        stopVoice();

        const initialVal = targetField === 'title' ? (editingTask.text || '') : (editingTask.notes || '');

        const rec = startVoiceDictation({
            initialText: initialVal,
            onTranscript: (updatedText) => {
                setEditingTask(prev => ({
                    ...prev,
                    [targetField === 'title' ? 'text' : 'notes']: updatedText
                }));
            },
            onStatusChange: (statusMsg) => {
                setVoiceStatus(statusMsg);
            },
            onEnd: () => {
                setListeningTarget(null);
                recognitionRef.current = null;
            }
        });

        if (rec) {
            recognitionRef.current = rec;
            setListeningTarget(targetField);
        }
    };

    // Subtask states
    const [showSubtasks, setShowSubtasks] = useState(!!task.subtasks && task.subtasks.length > 0);
    const [subtasks, setSubtasks] = useState(task.subtasks || []);
    const [newSubtaskText, setNewSubtaskText] = useState('');

    // Scheduling and recurrence states
    const [showSchedule, setShowSchedule] = useState(!!task.scheduledDate);
    const [scheduledDate, setScheduledDate] = useState(task.scheduledDate || null);
    const [isRecurring, setIsRecurring] = useState(task.isRecurring || false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState(task.recurrence?.frequency || 1);
    const [recurrenceInterval, setRecurrenceInterval] = useState(task.recurrence?.interval || 'days');
    const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState(task.recurrence?.daysOfWeek || []);

    const handleInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const handleSave = () => {
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

        onSave(editingTask.id, {
            text: editingTask.text,
            priority: editingTask.priority,
            projectId: editingTask.projectId,
            notes: editingTask.notes,
            scheduledDate: finalScheduledDate,
            subtasks,
            isRecurring: isRecurring && !!finalScheduledDate,
            recurrence
        });
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

    const toggleButtonStyle = (isActive) => ({
        border: '1px solid var(--accent-color)',
        color: isActive ? 'white' : 'var(--accent-color)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '1.05rem',
        fontWeight: '600',
        padding: '8px 12px',
        borderRadius: '4px',
        background: isActive ? 'var(--accent-color)' : 'transparent',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    });

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '95%',
            width: '500px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            color: 'var(--text-color)',
            boxSizing: 'border-box'
        },
        textarea: {
            width: '100%',
            padding: '8px',
            fontSize: '1.1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            resize: 'none',
            overflowY: 'auto',
            marginBottom: '12px',
            minHeight: '60px',
            maxHeight: '150px',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            outline: 'none'
        },
        select: {
            width: '100%',
            padding: '8px',
            fontSize: '1.1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            marginBottom: '12px',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            outline: 'none'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)' }}>Task Title</label>
                    <button
                        type="button"
                        onClick={() => toggleVoiceInput('title')}
                        title={listeningTarget === 'title' ? "Stop Listening" : (speechSupported ? "Speak to append to title" : "Voice input not supported")}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: `1px solid ${listeningTarget === 'title' ? '#ef4444' : 'var(--border-color)'}`,
                            background: listeningTarget === 'title' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                            color: listeningTarget === 'title' ? '#ef4444' : 'var(--text-color)',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: '600'
                        }}
                    >
                        {listeningTarget === 'title' ? <MicOff size={12} style={{ animation: 'pulse 1.2s infinite' }} /> : <Mic size={12} color="var(--accent-color)" />}
                        <span>{listeningTarget === 'title' ? 'Listening...' : 'Voice Title'}</span>
                    </button>
                </div>

                {voiceStatus && (
                    <div style={{
                        fontSize: '0.8rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        background: listeningTarget ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-bg)',
                        color: listeningTarget ? '#ef4444' : 'var(--accent-color)',
                        fontWeight: '600'
                    }}>
                        {voiceStatus}
                    </div>
                )}

                <textarea
                    autoFocus
                    value={editingTask.text}
                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                    onInput={handleInput}
                    style={styles.textarea}
                    maxLength={isUnlimited ? undefined : Math.max(MAX_TASK_LENGTH, (editingTask.text || '').length)}
                    ref={(textarea) => {
                        if (textarea) {
                            textarea.style.height = 'auto';
                            textarea.style.height = textarea.scrollHeight + 'px';
                        }
                    }}
                />

                {task.deferCount >= 2 && (
                    <div style={{
                        padding: '10px 12px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        marginBottom: '12px',
                        fontWeight: '500',
                        lineHeight: '1.4',
                        textAlign: 'left'
                    }}>
                        💡 <strong>Is this task too large?</strong> You have deferred this task {task.deferCount} times. Try breaking it down into smaller, bite-sized steps using the <strong>Subtasks</strong> checklist below to make it easier to start!
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Priority</label>
                        <select
                            value={editingTask.priority}
                            onChange={(e) => setEditingTask({ ...editingTask, priority: parseInt(e.target.value) })}
                            style={styles.select}
                        >
                            {Object.entries(PRIORITIES).map(([value, config]) => (
                                <option key={value} value={value}>{config.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Project</label>
                        <select
                            value={editingTask.projectId || 'general'}
                            onChange={(e) => setEditingTask({ ...editingTask, projectId: e.target.value })}
                            style={styles.select}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--muted-text)' }}>Notes</label>
                        <button
                            type="button"
                            onClick={() => toggleVoiceInput('notes')}
                            title={listeningTarget === 'notes' ? "Stop Listening" : (speechSupported ? "Speak to append to notes" : "Voice input not supported")}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                border: `1px solid ${listeningTarget === 'notes' ? '#ef4444' : 'var(--border-color)'}`,
                                background: listeningTarget === 'notes' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                                color: listeningTarget === 'notes' ? '#ef4444' : 'var(--text-color)',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: '600'
                            }}
                        >
                            {listeningTarget === 'notes' ? <MicOff size={12} style={{ animation: 'pulse 1.2s infinite' }} /> : <Mic size={12} color="var(--accent-color)" />}
                            <span>{listeningTarget === 'notes' ? 'Listening...' : 'Voice Notes'}</span>
                        </button>
                    </div>
                    <textarea
                        value={editingTask.notes || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                        onInput={handleInput}
                        placeholder="Add unlimited text..."
                        style={{ ...styles.textarea, minHeight: '60px', fontSize: '1.1rem' }}
                        ref={(textarea) => {
                            if (textarea) {
                                textarea.style.height = 'auto';
                                textarea.style.height = textarea.scrollHeight + 'px';
                            }
                        }}
                    />
                </div>

                {/* Subtask and Scheduling triggers */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        style={toggleButtonStyle(showSubtasks)}
                    >
                        📋 Subtasks ({subtasks.length})
                    </button>
                    <button
                        onClick={() => setShowSchedule(!showSchedule)}
                        style={toggleButtonStyle(showSchedule)}
                    >
                        📅 {scheduledDate ? `Scheduled: ${formatDisplayDate(scheduledDate, dateFormat)}` : 'Schedule'}
                    </button>
                </div>

                {/* Subtask Editor */}
                {showSubtasks && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--item-bg)'
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
                                placeholder="Add step..."
                                style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    fontSize: '1.05rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    background: 'var(--bg-color)',
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

                {/* Scheduling and Recurrence Editor */}
                {showSchedule && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--item-bg)'
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
                                        background: 'var(--bg-color)',
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
                                        background: 'var(--border-color)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1.05rem',
                                        fontWeight: '600',
                                        marginTop: '22px',
                                        color: 'var(--text-color)'
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
                                                    background: 'var(--bg-color)',
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
                                                background: 'var(--bg-color)',
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
                                                                background: isSelected ? 'var(--accent-color)' : 'var(--bg-color)',
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

                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px' }}>
                    {isUnlimited ? `${editingTask.text.length} chars` : `${editingTask.text.length}/${MAX_TASK_LENGTH}`}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            fontSize: '1.1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: '#e5e7eb',
                            color: '#333'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '8px 16px',
                            fontSize: '1.1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: '#2563eb',
                            color: '#fff'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
