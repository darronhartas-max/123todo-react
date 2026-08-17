import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH } from '../../utils/constants';
import { COMMON_STYLES } from '../../utils/styles';
import { getTodayDateString, getNextWeekDateString, adjustStartDateForWeekdays, formatDisplayDate } from '../../utils/dateUtils';
import { motion } from 'framer-motion';
import { Mic, MicOff, X, Maximize2, FileText, Check, ChevronDown, Plus, Minus } from 'lucide-react';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';

const EditModal = ({ task, onSave, onClose, projects, dateFormat = 'UK', taskLengthLimit = '250' }) => {
    const isUnlimited = taskLengthLimit === 'unlimited';
    const [editingTask, setEditingTask] = useState({ ...task });
    
    // Voice, Dropdowns & Expanded Editor State
    const [listeningTarget, setListeningTarget] = useState(null); // 'title' | 'notes' | null
    const [voiceStatus, setVoiceStatus] = useState('');
    const [expandedOverlayField, setExpandedOverlayField] = useState(null); // 'title' | 'notes' | null
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [showNotes, setShowNotes] = useState(() => Boolean(task.notes && task.notes.trim().length > 0));

    const titleRef = useRef(null);
    const notesRef = useRef(null);
    const focusTextareaRef = useRef(null);

    // Auto-expand and scroll to bottom so newly spoken/typed text is always clearly visible
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            const targetH = Math.max(titleRef.current.scrollHeight, 48);
            titleRef.current.style.height = `${targetH}px`;
            titleRef.current.scrollTop = titleRef.current.scrollHeight;
        }
    }, [editingTask.text]);

    useEffect(() => {
        if (notesRef.current) {
            notesRef.current.style.height = 'auto';
            const targetH = Math.max(notesRef.current.scrollHeight, 85);
            notesRef.current.style.height = `${targetH}px`;
            notesRef.current.scrollTop = notesRef.current.scrollHeight;
        }
    }, [editingTask.notes]);

    useEffect(() => {
        if (focusTextareaRef.current) {
            focusTextareaRef.current.scrollTop = focusTextareaRef.current.scrollHeight;
        }
    }, [editingTask.text, editingTask.notes, expandedOverlayField]);

    const activePriority = PRIORITIES[editingTask.priority] || PRIORITIES[3];
    const activeProject = (projects || []).find(p => p.id === (editingTask.projectId || 'general')) || { id: 'general', name: 'General', color: '#6b7280' };
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
            setVoiceStatus('Voice input not supported in browser.');
            setTimeout(() => setVoiceStatus(''), 4000);
            return;
        }

        if (listeningTarget === targetField) {
            stopVoice();
            setVoiceStatus('');
            return;
        }

        if (targetField === 'notes') {
            setShowNotes(true);
        }

        const initialVal = targetField === 'title' ? (editingTask.text || '') : (editingTask.notes || '');

        const rec = startVoiceDictation({
            initialText: initialVal,
            onTranscript: (updatedText, isSubmitCommand) => {
                setEditingTask(prev => ({
                    ...prev,
                    [targetField === 'title' ? 'text' : 'notes']: updatedText
                }));
                if (isSubmitCommand && updatedText.trim().length > 0) {
                    stopVoice();
                    setVoiceStatus('🚀 Auto-saving task...');
                    setTimeout(() => {
                        handleSave();
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
        border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
        color: isActive ? 'white' : 'var(--muted-text)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.82rem',
        fontWeight: '600',
        padding: '5px 10px',
        borderRadius: '6px',
        background: isActive ? 'var(--accent-color)' : 'var(--item-bg)',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box'
    });

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            padding: '16px 18px',
            borderRadius: '10px',
            maxWidth: '94%',
            width: '440px',
            maxHeight: '88vh',
            overflowY: 'auto',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
            color: 'var(--text-color)',
            boxSizing: 'border-box',
            border: '1px solid var(--border-color)',
            transition: 'width 0.2s ease, max-height 0.2s ease'
        },
        sectionLabel: {
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--muted-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        textarea: {
            width: '100%',
            padding: '8px 10px',
            fontSize: '0.95rem',
            lineHeight: '1.45',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            resize: 'none',
            overflowY: 'auto',
            marginBottom: '10px',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            outline: 'none',
            transition: 'border-color 0.15s ease'
        },
        select: {
            width: '100%',
            padding: '5px 8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            outline: 'none',
            cursor: 'pointer'
        }
    };

    return (
        <div style={COMMON_STYLES.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                
                {/* 1. TOP ROW: Color-Coded Priority and Project Dropdowns */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    {/* Priority Custom Dropdown */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ ...styles.sectionLabel, marginBottom: '4px' }}>Priority</div>
                        <button
                            type="button"
                            onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsProjectOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: `1.5px solid ${activePriority.color}`,
                                background: 'var(--item-bg)',
                                color: activePriority.color,
                                fontSize: '0.88rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: activePriority.color,
                                    boxShadow: `0 0 6px ${activePriority.color}`,
                                    flexShrink: 0
                                }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {activePriority.label}
                                </span>
                            </div>
                            <ChevronDown size={14} style={{ color: activePriority.color, flexShrink: 0 }} />
                        </button>

                        {isPriorityOpen && (
                            <>
                                <div onClick={() => setIsPriorityOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0, right: 0,
                                    background: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                    padding: '4px 0'
                                }}>
                                    {Object.entries(PRIORITIES).map(([val, conf]) => {
                                        const isSel = parseInt(val) === editingTask.priority;
                                        return (
                                            <div
                                                key={val}
                                                onClick={() => {
                                                    setEditingTask({ ...editingTask, priority: parseInt(val) });
                                                    setIsPriorityOpen(false);
                                                }}
                                                style={{
                                                    padding: '7px 10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: isSel ? '700' : '600',
                                                    color: isSel ? conf.color : 'var(--text-color)',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s ease'
                                                }}
                                            >
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: conf.color,
                                                    boxShadow: `0 0 4px ${conf.color}`,
                                                    flexShrink: 0
                                                }} />
                                                <span>{conf.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Project Custom Dropdown */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ ...styles.sectionLabel, marginBottom: '4px' }}>Project</div>
                        <button
                            type="button"
                            onClick={() => { setIsProjectOpen(!isProjectOpen); setIsPriorityOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: `1.5px solid ${activeProject.color || '#6b7280'}`,
                                background: 'var(--item-bg)',
                                color: activeProject.color || 'var(--text-color)',
                                fontSize: '0.88rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                <span style={{
                                    width: '4px',
                                    height: '12px',
                                    borderRadius: '2px',
                                    background: activeProject.color || '#6b7280',
                                    flexShrink: 0
                                }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {activeProject.name}
                                </span>
                            </div>
                            <ChevronDown size={14} style={{ color: activeProject.color || 'var(--muted-text)', flexShrink: 0 }} />
                        </button>

                        {isProjectOpen && (
                            <>
                                <div onClick={() => setIsProjectOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0, right: 0,
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
                                        const isSel = p.id === (editingTask.projectId || 'general');
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setEditingTask({ ...editingTask, projectId: p.id });
                                                    setIsProjectOpen(false);
                                                }}
                                                style={{
                                                    padding: '7px 10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: isSel ? '700' : '600',
                                                    color: isSel ? (p.color || 'var(--text-color)') : 'var(--text-color)',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s ease'
                                                }}
                                            >
                                                <span style={{
                                                    width: '4px',
                                                    height: '12px',
                                                    borderRadius: '2px',
                                                    background: p.color || '#6b7280',
                                                    flexShrink: 0
                                                }} />
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Voice Status Alert */}
                {voiceStatus && (
                    <div style={{
                        fontSize: '0.78rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        background: listeningTarget ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-bg)',
                        color: listeningTarget ? '#ef4444' : 'var(--accent-color)',
                        fontWeight: '600'
                    }}>
                        {voiceStatus}
                    </div>
                )}

                {/* 2. TASK TITLE */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={styles.sectionLabel}>Task Title / Description</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                                type="button"
                                onClick={() => setExpandedOverlayField('title')}
                                title="Open Full Screen Focus Editor for Task Title"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--accent-color)',
                                    background: 'var(--accent-bg)',
                                    color: 'var(--accent-color)',
                                    cursor: 'pointer',
                                    fontSize: '0.72rem',
                                    fontWeight: '600'
                                }}
                            >
                                <Maximize2 size={10} />
                                <span>Expand</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleVoiceInput('title')}
                                title={listeningTarget === 'title' ? "Stop Listening" : (speechSupported ? "Speak to append to title" : "Voice input not supported")}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    border: `1px solid ${listeningTarget === 'title' ? '#ef4444' : 'var(--border-color)'}`,
                                    background: listeningTarget === 'title' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                                    color: listeningTarget === 'title' ? '#ef4444' : 'var(--muted-text)',
                                    cursor: 'pointer',
                                    fontSize: '0.72rem',
                                    fontWeight: '700'
                                }}
                            >
                                {listeningTarget === 'title' ? <MicOff size={10} style={{ animation: 'pulse 1.2s infinite' }} /> : <Mic size={10} color="var(--accent-color)" />}
                                <span><strong>{listeningTarget === 'title' ? 'Listening...' : 'Voice'}</strong></span>
                            </button>
                        </div>
                    </div>

                    <textarea
                        ref={titleRef}
                        autoFocus
                        value={editingTask.text}
                        onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                        onInput={handleInput}
                        style={{
                            ...styles.textarea,
                            minHeight: '48px',
                            maxHeight: '150px',
                            fontWeight: '400',
                            fontSize: '0.98rem'
                        }}
                        maxLength={isUnlimited ? undefined : Math.max(MAX_TASK_LENGTH * 4, (editingTask.text || '').length + 500)}
                    />
                </div>

                {/* 3. UNIFIED ACTION BUTTONS ROW: Notes, Subtasks, and Schedule on the SAME line */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <button
                        type="button"
                        onClick={() => setShowNotes(!showNotes)}
                        style={toggleButtonStyle(showNotes || Boolean(editingTask.notes && editingTask.notes.trim().length > 0))}
                    >
                        {(showNotes || Boolean(editingTask.notes && editingTask.notes.trim().length > 0)) ? <Minus size={13} /> : <Plus size={13} />}
                        <span>Notes</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        style={toggleButtonStyle(showSubtasks || subtasks.length > 0)}
                    >
                        {showSubtasks ? <Minus size={13} /> : <Plus size={13} />}
                        <span>Subtasks ({subtasks.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSchedule(!showSchedule)}
                        style={toggleButtonStyle(showSchedule || Boolean(scheduledDate))}
                    >
                        {showSchedule ? <Minus size={13} /> : <Plus size={13} />}
                        <span>{scheduledDate ? formatDisplayDate(scheduledDate, dateFormat) : 'Schedule'}</span>
                    </button>
                </div>

                {/* Notes Editor (Visible when Notes button is active or notes exist) */}
                {(showNotes || Boolean(editingTask.notes && editingTask.notes.trim().length > 0)) && (
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={styles.sectionLabel}>Notes</span>
                                {(!editingTask.notes || editingTask.notes.trim().length === 0) && (
                                    <button
                                        type="button"
                                        onClick={() => setShowNotes(false)}
                                        title="Hide notes input"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--muted-text)',
                                            padding: 0,
                                            display: 'flex'
                                        }}
                                    >
                                        <Minus size={12} />
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => setExpandedOverlayField('notes')}
                                    title="Open Full Screen Focus Editor for Notes"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--accent-color)',
                                        background: 'var(--accent-bg)',
                                        color: 'var(--accent-color)',
                                        cursor: 'pointer',
                                        fontSize: '0.72rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Maximize2 size={10} />
                                    <span>Expand</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleVoiceInput('notes')}
                                    title={listeningTarget === 'notes' ? "Stop Listening" : (speechSupported ? "Speak to append to notes" : "Voice input not supported")}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        border: `1px solid ${listeningTarget === 'notes' ? '#ef4444' : 'var(--border-color)'}`,
                                        background: listeningTarget === 'notes' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                                        color: listeningTarget === 'notes' ? '#ef4444' : 'var(--muted-text)',
                                        cursor: 'pointer',
                                        fontSize: '0.72rem',
                                        fontWeight: '700'
                                    }}
                                >
                                    {listeningTarget === 'notes' ? <MicOff size={10} style={{ animation: 'pulse 1.2s infinite' }} /> : <Mic size={10} color="var(--accent-color)" />}
                                    <span><strong>{listeningTarget === 'notes' ? 'Listening...' : 'Voice'}</strong></span>
                                </button>
                            </div>
                        </div>
                        <textarea
                            ref={notesRef}
                            value={editingTask.notes || ''}
                            onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                            onInput={handleInput}
                            placeholder="Add notes or extra details..."
                            style={{
                                ...styles.textarea,
                                minHeight: '85px',
                                maxHeight: '180px'
                            }}
                        />
                    </div>
                )}

                {/* Defer Alert (if deferred >= 2) */}
                {task.deferCount >= 2 && (
                    <div style={{
                        padding: '6px 10px',
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '0.78rem',
                        marginBottom: '10px',
                        lineHeight: '1.35',
                        textAlign: 'left'
                    }}>
                        💡 Deferred {task.deferCount}x. Consider breaking into <strong>Subtasks</strong> below.
                    </div>
                )}

                {/* Compact Subtask Editor */}
                {showSubtasks && (
                    <div style={{
                        marginBottom: '10px',
                        padding: '8px 10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--item-bg)'
                    }}>
                        <div style={{ ...styles.sectionLabel, marginBottom: '6px' }}>
                            Subtasks Checklist
                        </div>
                        {subtasks.length > 0 && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px 0' }}>
                                {subtasks.map((st) => (
                                    <li key={st.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '3px 0',
                                        borderBottom: '1px solid var(--border-color)',
                                        gap: '6px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={() => {
                                                setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s));
                                            }}
                                            style={{ cursor: 'pointer', width: '13px', height: '13px', flexShrink: 0 }}
                                        />
                                        <input
                                            type="text"
                                            value={st.text}
                                            onChange={(e) => {
                                                const updatedText = e.target.value;
                                                setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, text: updatedText } : s));
                                            }}
                                            placeholder="Subtask description..."
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: st.completed ? 'var(--muted-text)' : 'var(--text-color)',
                                                textDecoration: st.completed ? 'line-through' : 'none',
                                                outline: 'none',
                                                padding: '2px 4px',
                                                borderRadius: '4px',
                                                fontFamily: 'inherit',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.background = 'var(--bg-color)';
                                                e.target.style.boxShadow = '0 0 0 1px var(--accent-color)';
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
                                                padding: '2px 4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                            title="Delete step"
                                        >
                                            <X size={13} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                                type="text"
                                value={newSubtaskText}
                                onChange={(e) => setNewSubtaskText(e.target.value)}
                                placeholder="Add step..."
                                style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '0.85rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    outline: 'none'
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
                                    padding: '4px 10px',
                                    background: 'var(--accent-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    fontWeight: '600'
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Compact Schedule and Recurrence Editor */}
                {showSchedule && (
                    <div style={{
                        marginBottom: '10px',
                        padding: '8px 10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--item-bg)'
                    }}>
                        <div style={{ ...styles.sectionLabel, marginBottom: '6px' }}>
                            Date & Recurrence
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <input
                                type="date"
                                value={scheduledDate || ''}
                                onChange={(e) => setScheduledDate(e.target.value || null)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.85rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    outline: 'none',
                                    flex: 1,
                                    minWidth: '120px'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setScheduledDate(getNextWeekDateString())}
                                style={{
                                    padding: '4px 8px',
                                    background: 'var(--accent-bg)',
                                    border: '1px solid var(--accent-color)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
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
                                        padding: '4px 8px',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.78rem',
                                        color: '#ef4444',
                                        fontWeight: '600'
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => {
                                        setIsRecurring(e.target.checked);
                                        if (e.target.checked && !scheduledDate) {
                                            setScheduledDate(getTodayDateString());
                                        }
                                    }}
                                    style={{ cursor: 'pointer', width: '13px', height: '13px' }}
                                />
                                <span>Repeat this task</span>
                            </label>

                            {isRecurring && (
                                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Every</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={recurrenceFrequency}
                                            onChange={(e) => setRecurrenceFrequency(Math.max(1, parseInt(e.target.value) || 1))}
                                            style={{
                                                width: '45px',
                                                padding: '3px 6px',
                                                fontSize: '0.82rem',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '4px',
                                                background: 'var(--bg-color)',
                                                color: 'var(--text-color)',
                                                textAlign: 'center'
                                            }}
                                        />
                                        <select
                                            value={recurrenceInterval}
                                            onChange={(e) => setRecurrenceInterval(e.target.value)}
                                            style={{
                                                padding: '3px 6px',
                                                fontSize: '0.82rem',
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
                                        <div>
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
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
                                                                
                                                                const baseDate = scheduledDate || getTodayDateString();
                                                                const snappedDate = adjustStartDateForWeekdays(baseDate, updatedDays);
                                                                setScheduledDate(snappedDate);
                                                            }}
                                                            style={{
                                                                flex: 1,
                                                                padding: '4px 2px',
                                                                fontSize: '0.78rem',
                                                                fontWeight: '700',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                border: '1px solid',
                                                                borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                                                                background: isSelected ? 'var(--accent-color)' : 'var(--bg-color)',
                                                                color: isSelected ? 'white' : 'var(--text-color)',
                                                                transition: 'all 0.15s ease'
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div>
                        {!isUnlimited && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                                {`${editingTask.text.length}/${MAX_TASK_LENGTH}`}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '5px 12px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: 'transparent',
                                color: 'var(--text-color)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            style={{
                                padding: '5px 14px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: 'var(--accent-color)',
                                color: '#ffffff'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </div>

                {/* 6. EXPANDED FOCUS CANVAS OVERLAY FOR LARGE NOTES / DESCRIPTIONS */}
                {expandedOverlayField && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10000,
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{
                                background: 'var(--surface-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '14px',
                                width: 'calc(100vw - 24px)',
                                maxWidth: '98vw',
                                height: 'calc(100vh - 24px)',
                                maxHeight: '98vh',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '20px 22px',
                                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
                                color: 'var(--text-color)',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} color="var(--accent-color)" />
                                    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-color)' }}>
                                        Focus Editor — {expandedOverlayField === 'title' ? 'Task Description' : 'Notes'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleVoiceInput(expandedOverlayField)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            border: `1px solid ${listeningTarget === expandedOverlayField ? '#ef4444' : 'var(--border-color)'}`,
                                            background: listeningTarget === expandedOverlayField ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                                            color: listeningTarget === expandedOverlayField ? '#ef4444' : 'var(--muted-text)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {listeningTarget === expandedOverlayField ? <MicOff size={14} style={{ animation: 'pulse 1.2s infinite' }} /> : <Mic size={14} color="var(--accent-color)" />}
                                        <span>{listeningTarget === expandedOverlayField ? 'Listening...' : 'Voice Dictation'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedOverlayField(null)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--muted-text)',
                                            display: 'flex',
                                            padding: '4px'
                                        }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <textarea
                                ref={focusTextareaRef}
                                autoFocus
                                value={expandedOverlayField === 'title' ? editingTask.text : (editingTask.notes || '')}
                                onChange={(e) => setEditingTask({
                                    ...editingTask,
                                    [expandedOverlayField === 'title' ? 'text' : 'notes']: e.target.value
                                })}
                                placeholder={expandedOverlayField === 'title' ? 'Enter full task description...' : 'Add rich notes, bullet points, or extra details...'}
                                style={{
                                    width: '100%',
                                    flex: 1,
                                    minHeight: '200px',
                                    maxHeight: 'none',
                                    padding: '14px 16px',
                                    fontSize: '1.05rem',
                                    lineHeight: '1.6',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    resize: 'none',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    outline: 'none',
                                    fontFamily: 'Inter, sans-serif',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                                <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)', display: 'flex', gap: '14px' }}>
                                    {!isUnlimited && (
                                        <span>
                                            Chars: <strong>{(expandedOverlayField === 'title' ? editingTask.text : (editingTask.notes || '')).length}/{MAX_TASK_LENGTH}</strong>
                                        </span>
                                    )}
                                    <span>
                                        Words: <strong>{(expandedOverlayField === 'title' ? editingTask.text : (editingTask.notes || '')).trim().split(/\s+/).filter(Boolean).length}</strong>
                                    </span>
                                    <span>
                                        Lines: <strong>{(expandedOverlayField === 'title' ? editingTask.text : (editingTask.notes || '')).split('\n').length}</strong>
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setExpandedOverlayField(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 18px',
                                        background: 'var(--accent-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <Check size={16} />
                                    <span>Done Editing</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditModal;
