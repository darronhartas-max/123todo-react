import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH, STORAGE_KEYS } from '../../utils/constants';
import { Plus, Minus, Mic, MicOff, ChevronDown, GripVertical } from 'lucide-react';
import { getTodayDateString, getNextWeekDateString, adjustStartDateForWeekdays, formatDisplayDate } from '../../utils/dateUtils';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';

const AddTask = ({ isOpen, onAdd, onClose, projects, defaultProjectId, dateFormat = 'UK', taskLengthLimit = '250' }) => {
    const isUnlimited = taskLengthLimit === 'unlimited';
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
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [priority, setPriority] = useState(1);
    
    // New scheduling and subtask states
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [draggedSubtaskIndex, setDraggedSubtaskIndex] = useState(null);
    const [dragOverSubtaskIndex, setDragOverSubtaskIndex] = useState(null);
    
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState(1);
    const [recurrenceInterval, setRecurrenceInterval] = useState('days');
    const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState([]);
    
    const inputRef = useRef(null);
    const notesRef = useRef(null);
    const hasOpenedRef = useRef(false);

    // Voice Input State
    const [listeningTarget, setListeningTarget] = useState(null); // 'title' | 'notes' | null
    const [voiceStatus, setVoiceStatus] = useState('');
    const recognitionRef = useRef(null);
    const speechSupported = isSpeechRecognitionSupported();

    // Auto-expand and scroll to bottom so newly spoken/typed text is always clearly visible
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.max(inputRef.current.scrollHeight, 48) + 'px';
            inputRef.current.scrollTop = inputRef.current.scrollHeight;
            if (listeningTarget === 'title') {
                try { inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
            }
        }
    }, [text, listeningTarget]);

    useEffect(() => {
        if (notesRef.current) {
            notesRef.current.style.height = 'auto';
            notesRef.current.style.height = Math.max(notesRef.current.scrollHeight, 80) + 'px';
            notesRef.current.scrollTop = notesRef.current.scrollHeight;
            if (listeningTarget === 'notes') {
                try { notesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
            }
        }
    }, [notes, listeningTarget]);

    const stopVoice = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }
        recognitionRef.current = null;
        setListeningTarget(null);
    };

    const toggleVoiceInput = (targetField = 'title') => {
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

        // Voice task input defaults to Top Priority (Priority 1 / Must Do)
        if (targetField === 'title') {
            setPriority(1);
        }

        const initialVal = targetField === 'title' ? text : notes;

        const rec = startVoiceDictation({
            initialText: initialVal,
            onTranscript: (updatedText, isSubmitCommand) => {
                if (targetField === 'title') {
                    setText(updatedText);
                } else {
                    setNotes(updatedText);
                }

                if (isSubmitCommand) {
                    stopVoice();
                    setVoiceStatus('🚀 Auto-submitting task...');
                    setTimeout(() => {
                        if (targetField === 'title') {
                            if (updatedText.trim().length > 0) handleSubmit(updatedText);
                        } else {
                            handleSubmit(text, updatedText);
                        }
                        setVoiceStatus('');
                    }, 200);
                }
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

    const handleSubmit = (overrideText, overrideNotes) => {
        const taskTitle = typeof overrideText === 'string' ? overrideText : text;
        const taskNotes = typeof overrideNotes === 'string' ? overrideNotes : notes;
        if (!taskTitle.trim() && !taskNotes.trim()) return;

        stopVoice();

        let finalTitle = taskTitle.trim();
        const finalNotes = taskNotes.trim();

        // If title is empty but notes were added by voice/typing, derive title from first line/sentence of notes
        if (!finalTitle && finalNotes) {
            const lines = finalNotes.split('\n');
            const firstLine = lines[0].trim();
            if (firstLine.length <= 60) {
                finalTitle = firstLine;
            } else {
                const sentenceMatch = firstLine.match(/^[^.!?]+[.!?]/);
                if (sentenceMatch && sentenceMatch[0].length <= 80) {
                    finalTitle = sentenceMatch[0].trim();
                } else {
                    finalTitle = firstLine.substring(0, 57).trim() + '...';
                }
            }
        }

        if (!finalTitle) finalTitle = 'Untitled Task';
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

        onAdd(finalTitle, priority, finalProjectId, taskNotes.trim(), {
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
        const flexMap = { 1: '1', 2: '1.25', 3: '1.5' };
        return {
            padding: '7px 6px',
            fontSize: '0.85rem',
            fontWeight: '700',
            border: '2px solid',
            borderRadius: '5px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase',
            letterSpacing: '0.1px',
            flex: `${flexMap[p] || '1'} 1 auto`,
            minWidth: '0',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            boxSizing: 'border-box',
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
        fontSize: '0.9rem',
        fontWeight: '600',
        padding: '6px 10px',
        borderRadius: '4px',
        background: isActive ? 'var(--accent-color)' : 'transparent',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 50 }}>
                {/* Project Custom Dropdown */}
                {(() => {
                    const activeProject = (projects || []).find(p => p.id === projectId) || projects?.[0] || { id: 'general', name: 'General', color: '#6b7280' };
                    return (
                        <div style={{ position: 'relative', minWidth: '150px', maxWidth: '240px' }}>
                            <button
                                type="button"
                                onClick={() => setIsProjectOpen(!isProjectOpen)}
                                style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${activeProject.color || '#6b7280'}`,
                                    background: 'var(--item-bg)',
                                    color: activeProject.color || 'var(--text-color)',
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <span style={{
                                        width: '5px',
                                        height: '14px',
                                        borderRadius: '2px',
                                        background: activeProject.color || '#6b7280',
                                        flexShrink: 0
                                    }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {activeProject.name}
                                    </span>
                                </div>
                                <ChevronDown size={16} style={{ color: activeProject.color || 'var(--muted-text)', flexShrink: 0 }} />
                            </button>

                            {isProjectOpen && (
                                <>
                                    <div onClick={() => setIsProjectOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        minWidth: '180px',
                                        background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        zIndex: 100,
                                        maxHeight: '220px',
                                        overflowY: 'auto',
                                        padding: '4px 0'
                                    }}>
                                        {(projects || []).map(p => {
                                            const isSel = p.id === projectId;
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        setProjectId(p.id);
                                                        setIsProjectOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '8px 12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        fontSize: '0.95rem',
                                                        fontWeight: isSel ? '700' : '600',
                                                        color: isSel ? (p.color || 'var(--text-color)') : 'var(--text-color)',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.15s ease'
                                                    }}
                                                >
                                                    <span style={{
                                                        width: '5px',
                                                        height: '14px',
                                                        borderRadius: '2px',
                                                        background: p.color || '#6b7280',
                                                        flexShrink: 0
                                                    }} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })()}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <button
                        type="button"
                        onClick={() => toggleVoiceInput('title')}
                        title={listeningTarget === 'title' ? "Stop Listening" : (speechSupported ? "Speak to add or append to task title" : "Voice input not supported")}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            border: `1.5px solid ${listeningTarget === 'title' ? '#ef4444' : 'var(--border-color)'}`,
                            background: listeningTarget === 'title' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                            color: listeningTarget === 'title' ? '#ef4444' : 'var(--text-color)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: listeningTarget === 'title' ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none'
                        }}
                    >
                        {listeningTarget === 'title' ? (
                            <>
                                <MicOff size={14} style={{ animation: 'pulse 1.2s infinite' }} />
                                <span>Listening...</span>
                            </>
                        ) : (
                            <>
                                <Mic size={14} color="var(--accent-color)" />
                                <span>Voice Task</span>
                            </>
                        )}
                    </button>
                    {!isUnlimited && (
                        <div style={{
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            {`${text.length}/${MAX_TASK_LENGTH}`}
                        </div>
                    )}
                </div>
            </div>

            {voiceStatus && (
                <div style={{
                    fontSize: '0.82rem',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    marginTop: '6px',
                    marginBottom: '4px',
                    background: listeningTarget ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-bg)',
                    color: listeningTarget ? '#ef4444' : 'var(--accent-color)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    {voiceStatus}
                </div>
            )}

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
                maxLength={isUnlimited ? undefined : Math.max(MAX_TASK_LENGTH * 4, (text || '').length + 500)}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)' }}>Notes</label>
                        <button
                            type="button"
                            onClick={() => toggleVoiceInput('notes')}
                            title={listeningTarget === 'notes' ? "Stop Listening" : (speechSupported ? "Speak to add/append notes" : "Voice input not supported")}
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
                        ref={notesRef}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onInput={handleInput}
                        placeholder="Add notes..."
                        style={{ ...styles.taskInput, minHeight: '60px', marginTop: '0' }}
                    />
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
                            {subtasks.map((st, index) => {
                                const isDraggingThis = draggedSubtaskIndex === index;
                                const isOverThis = dragOverSubtaskIndex === index;
                                return (
                                    <li
                                        key={st.id}
                                        draggable={true}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('text/plain', index.toString());
                                            setDraggedSubtaskIndex(index);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverSubtaskIndex !== index) {
                                                setDragOverSubtaskIndex(index);
                                            }
                                        }}
                                        onDragEnd={() => {
                                            setDraggedSubtaskIndex(null);
                                            setDragOverSubtaskIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const fromIndex = draggedSubtaskIndex ?? parseInt(e.dataTransfer.getData('text/plain'), 10);
                                            const toIndex = index;
                                            if (fromIndex === undefined || fromIndex === null || isNaN(fromIndex) || fromIndex === toIndex) {
                                                setDraggedSubtaskIndex(null);
                                                setDragOverSubtaskIndex(null);
                                                return;
                                            }
                                            const reordered = [...subtasks];
                                            const [moved] = reordered.splice(fromIndex, 1);
                                            reordered.splice(toIndex, 0, moved);
                                            setSubtasks(reordered);
                                            setDraggedSubtaskIndex(null);
                                            setDragOverSubtaskIndex(null);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            padding: '4px 0',
                                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                                            borderTop: isOverThis && draggedSubtaskIndex !== index ? '2px solid var(--accent-color)' : '2px solid transparent',
                                            opacity: isDraggingThis ? 0.4 : 1,
                                            gap: '8px',
                                            transition: 'border-color 0.15s ease, opacity 0.15s ease'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'grab',
                                                padding: '4px 0',
                                                color: 'var(--muted-text)',
                                                opacity: 0.6,
                                                flexShrink: 0
                                            }}
                                            title="Drag to rearrange subtask"
                                        >
                                            <GripVertical size={16} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={() => {
                                                setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s));
                                            }}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px', flexShrink: 0, marginTop: '5px' }}
                                        />
                                        <textarea
                                            value={st.text}
                                            rows={1}
                                            onChange={(e) => {
                                                const updatedText = e.target.value;
                                                setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, text: updatedText } : s));
                                            }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            placeholder="Subtask step..."
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '1.05rem',
                                                fontWeight: '500',
                                                color: st.completed ? 'var(--muted-text)' : 'var(--text-color)',
                                                textDecoration: st.completed ? 'line-through' : 'none',
                                                outline: 'none',
                                                padding: '3px 6px',
                                                borderRadius: '4px',
                                                fontFamily: 'inherit',
                                                resize: 'none',
                                                overflowY: 'hidden',
                                                wordBreak: 'break-word',
                                                lineHeight: '1.35',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.background = 'var(--surface-color)';
                                                e.target.style.boxShadow = '0 0 0 1.5px var(--accent-color)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.background = 'transparent';
                                                e.target.style.boxShadow = 'none';
                                                if (!st.text.trim()) {
                                                    setSubtasks(subtasks.filter(s => s.id !== st.id));
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                fontWeight: '600',
                                                padding: '2px 6px',
                                                flexShrink: 0,
                                                marginTop: '2px'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <textarea
                            rows={1}
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            placeholder="Add subtask step..."
                            style={{
                                flex: 1,
                                padding: '8px 10px',
                                fontSize: '1.05rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--item-bg)',
                                color: 'var(--text-color)',
                                resize: 'none',
                                overflowY: 'hidden',
                                fontFamily: 'inherit',
                                lineHeight: '1.35',
                                wordBreak: 'break-word',
                                outline: 'none'
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
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
                                fontWeight: '600',
                                alignSelf: 'flex-start'
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end', marginBottom: '10px' }}>
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
                        <button
                            type="button"
                            onClick={() => setScheduledDate(getNextWeekDateString())}
                            style={{
                                padding: '8px 14px',
                                background: 'var(--accent-bg)',
                                border: '1px solid var(--accent-color)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: 'var(--accent-color)',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                            }}
                            title="Schedule for 7 days from today"
                        >
                            📅 Next Week
                        </button>
                        {scheduledDate && (
                            <button
                                type="button"
                                onClick={() => { setScheduledDate(null); setIsRecurring(false); }}
                                style={{
                                    padding: '8px 16px',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    color: '#333'
                                }}
                            >
                                Clear
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
                alignItems: 'center',
                flexWrap: 'wrap'
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
                        background: '#10b981',
                        color: 'white',
                        border: '2px solid #059669',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        flex: '0 0 auto',
                        minWidth: '60px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
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
