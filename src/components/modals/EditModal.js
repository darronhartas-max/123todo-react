import React, { useState, useRef, useEffect } from 'react';
import { PRIORITIES, MAX_TASK_LENGTH } from '../../utils/constants';
import { COMMON_STYLES } from '../../utils/styles';
import { getTodayDateString, getTomorrowDateString, getNextWeekDateString, adjustStartDateForWeekdays, formatDisplayDate, formatEvidentiaryTimestamp } from '../../utils/dateUtils';
import { motion } from 'framer-motion';
import { Mic, X, Maximize2, FileText, Check, ChevronDown, Plus, Minus, GripVertical, Archive, FastForward, Clock } from 'lucide-react';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';
import PhotoAttachments from '../notes/PhotoAttachments';
import { ActionableEntitiesBar } from '../../utils/textUtils';

const EditModal = ({ task, onSave, onClose, onArchive, projects, dateFormat = 'UK', taskLengthLimit = '250' }) => {
    const isUnlimited = taskLengthLimit === 'unlimited';
    const [editingTask, setEditingTask] = useState({ ...task, photos: task.photos || [] });
    const createdTs = task?.createdAt || task?.id;
    const createdFormatted = formatEvidentiaryTimestamp(createdTs);
    
    // Voice, Dropdowns & Expanded Editor State
    const [listeningTarget, setListeningTarget] = useState(null); // 'title' | 'notes' | null
    const [voiceStatus, setVoiceStatus] = useState('');
    const [expandedOverlayField, setExpandedOverlayField] = useState(null); // 'title' | 'notes' | null
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [showNotes, setShowNotes] = useState(() => Boolean((task.notes && task.notes.trim().length > 0) || (task.photos && task.photos.length > 0)));

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
                    setVoiceStatus('Auto-saving task...');
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
    const [draggedSubtaskIndex, setDraggedSubtaskIndex] = useState(null);
    const [dragOverSubtaskIndex, setDragOverSubtaskIndex] = useState(null);

    // Scheduling and recurrence states
    const [showSchedule, setShowSchedule] = useState(!!task.scheduledDate);
    const [scheduledDate, setScheduledDate] = useState(task.scheduledDate || null);
    const [isRecurring, setIsRecurring] = useState(task.isRecurring || false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState(task.recurrence?.frequency || 1);
    const [recurrenceInterval, setRecurrenceInterval] = useState(task.recurrence?.interval || 'days');
    const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState(task.recurrence?.daysOfWeek || []);

    const handleInsertTimestamp = (targetField = 'notes') => {
        const d = new Date();
        const day = d.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const timestampTag = `[${day} ${month} ${year}, ${hours}:${minutes}] `;

        setEditingTask(prev => {
            const currentVal = prev[targetField] || '';
            let newVal = '';
            if (!currentVal.trim()) {
                newVal = timestampTag;
            } else {
                const separator = currentVal.endsWith('\n\n') ? '' : (currentVal.endsWith('\n') ? '\n' : '\n\n');
                newVal = `${currentVal}${separator}${timestampTag}`;
            }
            return {
                ...prev,
                [targetField]: newVal
            };
        });

        if (targetField === 'notes') {
            setShowNotes(true);
        }

        setTimeout(() => {
            const el = expandedOverlayField
                ? focusTextareaRef.current
                : (targetField === 'notes' ? notesRef.current : titleRef.current);
            if (el) {
                el.focus();
                el.setSelectionRange(el.value.length, el.value.length);
                el.scrollTop = el.scrollHeight;
            }
        }, 50);
    };

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
            photos: editingTask.photos || [],
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
        border: `1.5px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
        color: isActive ? '#ffffff' : 'var(--text-color)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        padding: '6px 13px',
        borderRadius: '8px',
        background: isActive ? 'var(--accent-color)' : 'var(--item-bg)',
        boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box'
    });

    const styles = {
        modalContent: {
            background: 'var(--surface-color)',
            borderRadius: '16px',
            padding: '18px 22px 20px 22px',
            width: '95%',
            maxWidth: '580px',
            maxHeight: '92vh',
            overflowY: (isProjectOpen || isPriorityOpen) ? 'visible' : 'auto',
            boxShadow: '0 24px 64px -8px rgba(0, 0, 0, 0.4)',
            color: 'var(--text-color)',
            boxSizing: 'border-box',
            position: 'relative',
            border: '1px solid var(--border-color)',
            transition: 'width 0.2s ease, max-height 0.2s ease'
        },
        sectionLabel: {
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--muted-text)'
        },
        cardSection: {
            marginBottom: '12px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--item-bg)',
            boxSizing: 'border-box'
        },
        textarea: {
            width: '100%',
            padding: '11px 13px',
            fontSize: '1.05rem',
            lineHeight: '1.55',
            border: '1.5px solid var(--border-color)',
            borderRadius: '8px',
            resize: 'none',
            overflowY: 'auto',
            marginBottom: '8px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        },
        select: {
            width: '100%',
            padding: '8px 12px',
            fontSize: '1rem',
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
                
                {/* MODAL HEADER: Title, Quick Archive Button, Close */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '1.08rem',
                            fontWeight: '700',
                            letterSpacing: '-0.01em',
                            color: 'var(--text-color)'
                        }}>
                            Edit Task
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {onArchive && (
                            <button
                                type="button"
                                onClick={() => onArchive(editingTask)}
                                title="Mark task completed and move to Archive"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--item-bg)',
                                    color: 'var(--text-color)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                    e.currentTarget.style.color = '#ef4444';
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.color = 'var(--text-color)';
                                    e.currentTarget.style.background = 'var(--item-bg)';
                                }}
                            >
                                <Archive size={15} />
                                <span>Archive</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            title="Close without saving"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                padding: 0,
                                borderRadius: '8px',
                                border: '1px solid transparent',
                                background: 'transparent',
                                color: 'var(--muted-text)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-color)';
                                e.currentTarget.style.background = 'var(--item-bg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--muted-text)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* 1. TOP ROW: Color-Coded Priority and Project Dropdowns */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', position: 'relative', zIndex: (isProjectOpen || isPriorityOpen) ? 120 : 1 }}>
                    {/* Priority Custom Dropdown */}
                    <div style={{ flex: 1, position: 'relative', zIndex: isPriorityOpen ? 121 : 1 }}>
                        <div style={{ ...styles.sectionLabel, marginBottom: '5px' }}>Priority</div>
                        <button
                            type="button"
                            onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsProjectOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: `1.5px solid ${activePriority.color}`,
                                background: 'var(--item-bg)',
                                color: activePriority.color,
                                fontSize: '1rem',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <span style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: activePriority.color,
                                    boxShadow: `0 0 6px ${activePriority.color}`,
                                    flexShrink: 0
                                }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {activePriority.label}
                                </span>
                            </div>
                            <ChevronDown size={16} style={{ color: activePriority.color, flexShrink: 0 }} />
                        </button>

                        {isPriorityOpen && (
                            <>
                                <div onClick={() => setIsPriorityOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 120, background: 'transparent' }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0, right: 0,
                                    background: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                                    zIndex: 125,
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
                                                    padding: '9px 12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    fontSize: '0.95rem',
                                                    fontWeight: isSel ? '700' : '600',
                                                    color: isSel ? conf.color : 'var(--text-color)',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s ease'
                                                }}
                                            >
                                                <span style={{
                                                    width: '10px',
                                                    height: '10px',
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
                    <div style={{ flex: 1, position: 'relative', zIndex: isProjectOpen ? 121 : 1 }}>
                        <div style={{ ...styles.sectionLabel, marginBottom: '4px' }}>Project</div>
                        <button
                            type="button"
                            onClick={() => { setIsProjectOpen(!isProjectOpen); setIsPriorityOpen(false); }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: `1.5px solid ${activeProject.color || '#6b7280'}`,
                                background: 'var(--item-bg)',
                                color: activeProject.color || 'var(--text-color)',
                                fontSize: '1rem',
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
                                <div onClick={() => setIsProjectOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 120, background: 'transparent' }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    minWidth: '100%',
                                    width: 'max-content',
                                    maxWidth: 'min(340px, calc(100vw - 32px))',
                                    background: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                                    zIndex: 125,
                                    maxHeight: 'calc(100vh - 140px)',
                                    overflowY: 'auto',
                                    padding: '4px 0',
                                    boxSizing: 'border-box'
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
                                                    padding: '9px 12px',
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
                </div>

                {/* Voice Status Alert */}
                {voiceStatus && (
                    <div style={{
                        fontSize: '0.82rem',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        background: listeningTarget ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.12)',
                        color: listeningTarget ? '#ef4444' : '#15803d',
                        border: `1px solid ${listeningTarget ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)'}`,
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    }}>
                        {listeningTarget && (
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 8px #ef4444',
                                animation: 'pulse 1s infinite'
                            }} />
                        )}
                        <span>{voiceStatus}</span>
                    </div>
                )}

                {/* 2. TASK TITLE / DESCRIPTION */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={styles.sectionLabel}>Task Description</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                                type="button"
                                onClick={() => setExpandedOverlayField('title')}
                                title="Open Full Screen Focus Editor for Task Title"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 9px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--item-bg)',
                                    color: 'var(--text-color)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}
                            >
                                <Maximize2 size={12} />
                                <span>Expand</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleVoiceInput('title')}
                                title={listeningTarget === 'title' ? "Listening - Tap to finish" : (speechSupported ? "Speak to append to title" : "Voice input not supported")}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 9px',
                                    borderRadius: '8px',
                                    border: `1px solid ${listeningTarget === 'title' ? '#ef4444' : 'var(--border-color)'}`,
                                    background: listeningTarget === 'title' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                                    color: listeningTarget === 'title' ? '#ef4444' : 'var(--text-color)',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    fontWeight: '600'
                                }}
                            >
                                {listeningTarget === 'title' ? (
                                    <>
                                        <span style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                            background: '#ef4444',
                                            boxShadow: '0 0 6px #ef4444',
                                            animation: 'pulse 1s infinite'
                                        }} />
                                        <Mic size={13} color="#ef4444" />
                                        <span>Listening...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mic size={13} color="var(--accent-color)" />
                                        <span>Voice Task</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <textarea
                        ref={titleRef}
                        autoFocus
                        value={editingTask.text}
                        onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                        onInput={handleInput}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent-color)';
                            e.target.style.boxShadow = '0 0 0 2px var(--accent-bg)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-color)';
                            e.target.style.boxShadow = 'none';
                        }}
                        style={{
                            ...styles.textarea,
                            minHeight: '56px',
                            maxHeight: '160px',
                            fontWeight: '500',
                            fontSize: '1.08rem'
                        }}
                        maxLength={isUnlimited ? undefined : Math.max(MAX_TASK_LENGTH * 4, (editingTask.text || '').length + 500)}
                    />
                    {/* SINGLE ACTIONABLE PANEL FOR ENTIRE TASK */}
                    <ActionableEntitiesBar texts={[
                        editingTask.text,
                        editingTask.notes,
                        ...(subtasks.map(s => s.text))
                    ]} />
                </div>

                {/* 3. UNIFIED ACTION BUTTONS ROW: Notes, Subtasks, and Schedule on the SAME line */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setShowNotes(!showNotes)}
                        style={toggleButtonStyle(showNotes)}
                    >
                        {showNotes ? <Minus size={14} /> : <Plus size={14} />}
                        <span>Notes{(editingTask.notes && editingTask.notes.trim().length > 0) || (editingTask.photos && editingTask.photos.length > 0) ? ' •' : ''}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        style={toggleButtonStyle(showSubtasks)}
                    >
                        {showSubtasks ? <Minus size={14} /> : <Plus size={14} />}
                        <span>Subtasks ({subtasks.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSchedule(!showSchedule)}
                        style={toggleButtonStyle(showSchedule)}
                    >
                        {showSchedule ? <Minus size={14} /> : <Plus size={14} />}
                        <span>{scheduledDate ? formatDisplayDate(scheduledDate, dateFormat) : 'Schedule'}</span>
                    </button>
                </div>

                {/* Notes Editor (Visible when Notes button is active) */}
                {showNotes && (
                    <div style={styles.cardSection}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={styles.sectionLabel}>Notes & Details</span>
                                <button
                                    type="button"
                                    onClick={() => setShowNotes(false)}
                                    title="Contract notes"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--muted-text)',
                                        padding: '2px 4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <Minus size={13} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => handleInsertTimestamp('notes')}
                                    title="Insert current date & time stamp into notes"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--surface-color)',
                                        color: 'var(--text-color)',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Clock size={12} color="var(--accent-color)" />
                                    <span>+ Timestamp</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExpandedOverlayField('notes')}
                                    title="Open Full Screen Focus Editor for Notes"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--surface-color)',
                                        color: 'var(--text-color)',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Maximize2 size={12} />
                                    <span>Expand</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleVoiceInput('notes')}
                                    title={listeningTarget === 'notes' ? "Listening - Tap to finish" : (speechSupported ? "Speak to append to notes" : "Voice input not supported")}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '3px 8px',
                                        borderRadius: '8px',
                                        border: `1px solid ${listeningTarget === 'notes' ? '#ef4444' : 'var(--border-color)'}`,
                                        background: listeningTarget === 'notes' ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-color)',
                                        color: listeningTarget === 'notes' ? '#ef4444' : 'var(--text-color)',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {listeningTarget === 'notes' ? (
                                        <>
                                            <span style={{
                                                width: '7px',
                                                height: '7px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                boxShadow: '0 0 6px #ef4444',
                                                animation: 'pulse 1s infinite'
                                            }} />
                                            <Mic size={13} color="#ef4444" />
                                            <span>Listening...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic size={13} color="var(--accent-color)" />
                                            <span>Voice Notes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <textarea
                            ref={notesRef}
                            value={editingTask.notes || ''}
                            onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                            onInput={handleInput}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-color)';
                                e.target.style.boxShadow = '0 0 0 2px var(--accent-bg)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-color)';
                                e.target.style.boxShadow = 'none';
                            }}
                            placeholder="Add notes or extra details..."
                            style={{
                                ...styles.textarea,
                                minHeight: '85px',
                                maxHeight: '180px',
                                fontSize: '1.05rem',
                                background: 'var(--surface-color)',
                                marginBottom: '8px'
                            }}
                        />
                        <PhotoAttachments
                            photos={editingTask.photos || []}
                            onChange={(newPhotos) => setEditingTask(prev => ({ ...prev, photos: newPhotos }))}
                            readOnly={false}
                        />
                    </div>
                )}

                {/* Defer Alert (if deferred >= 5) */}
                {task.deferCount >= 5 && (
                    <div style={{
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '0.85rem',
                        marginBottom: '10px',
                        lineHeight: '1.4',
                        textAlign: 'left'
                    }}>
                        💡 Deferred {task.deferCount}x. Consider breaking into <strong>Subtasks</strong> below.
                    </div>
                )}

                {/* Compact Subtask Editor */}
                {showSubtasks && (
                    <div style={styles.cardSection}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={styles.sectionLabel}>
                                Subtasks {subtasks.length > 0 ? `(${subtasks.filter(s => s.completed).length}/${subtasks.length})` : ''}
                            </span>
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
                                                borderBottom: '1px solid var(--border-color)',
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
                                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                                <textarea
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.style.height = 'auto';
                                                            el.style.height = `${Math.max(el.scrollHeight, 28)}px`;
                                                        }
                                                    }}
                                                    value={st.text}
                                                    rows={1}
                                                    onChange={(e) => {
                                                        const updatedText = e.target.value;
                                                        setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, text: updatedText } : s));
                                                    }}
                                                    onInput={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = `${Math.max(e.target.scrollHeight, 28)}px`;
                                                    }}
                                                    placeholder="Subtask description..."
                                                    style={{
                                                        width: '100%',
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
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4',
                                                        minHeight: '28px',
                                                        boxSizing: 'border-box',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.background = 'var(--bg-color)';
                                                        e.target.style.boxShadow = '0 0 0 1.5px var(--accent-color)';
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = `${Math.max(e.target.scrollHeight, 28)}px`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.background = 'transparent';
                                                        e.target.style.boxShadow = 'none';
                                                        if (!st.text.trim()) {
                                                            setSubtasks(subtasks.filter(s => s.id !== st.id));
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '4px 6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    marginTop: '2px'
                                                }}
                                                title="Delete step"
                                            >
                                                <X size={16} />
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
                                    e.target.style.height = `${Math.max(e.target.scrollHeight, 38)}px`;
                                }}
                                placeholder="Add step..."
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    fontSize: '1.05rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    background: 'var(--surface-color)',
                                    color: 'var(--text-color)',
                                    resize: 'none',
                                    overflowY: 'hidden',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.35',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    minHeight: '38px',
                                    boxSizing: 'border-box',
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
                                type="button"
                                onClick={handleAddSubtask}
                                style={{
                                    padding: '8px 16px',
                                    background: 'var(--accent-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    alignSelf: 'flex-start'
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Compact Schedule and Recurrence Editor */}
                {showSchedule && (
                    <div style={styles.cardSection}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={styles.sectionLabel}>Date & Recurrence</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px', flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: '0 0 104px', minWidth: '92px', maxWidth: '108px', flexShrink: 0 }}>
                                <input
                                    id="edit-scheduled-date"
                                    type="date"
                                    value={scheduledDate || ''}
                                    onChange={(e) => setScheduledDate(e.target.value || null)}
                                    style={{
                                        padding: '6px 4px',
                                        fontSize: '0.82rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        outline: 'none',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setScheduledDate(getTomorrowDateString())}
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    padding: '6px 8px',
                                    background: 'var(--accent-bg)',
                                    border: '1px solid var(--accent-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    color: 'var(--accent-color)',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    boxSizing: 'border-box'
                                }}
                                title="Schedule for tomorrow (Next Day)"
                            >
                                <FastForward size={13} style={{ flexShrink: 0 }} />
                                <span>Day</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setScheduledDate(getNextWeekDateString())}
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    padding: '6px 8px',
                                    background: 'var(--accent-bg)',
                                    border: '1px solid var(--accent-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    color: 'var(--accent-color)',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    boxSizing: 'border-box'
                                }}
                                title="Schedule for Monday of next week"
                            >
                                <FastForward size={13} style={{ flexShrink: 0 }} />
                                <span>Week</span>
                            </button>
                            {scheduledDate && (
                                <button
                                    type="button"
                                    onClick={() => { setScheduledDate(null); setIsRecurring(false); }}
                                    style={{
                                        padding: '6px 8px',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        color: '#ef4444',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' }}>
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => {
                                        setIsRecurring(e.target.checked);
                                        if (e.target.checked && !scheduledDate) {
                                            setScheduledDate(getTodayDateString());
                                        }
                                    }}
                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <span>Repeat this task</span>
                            </label>

                            {isRecurring && (
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--muted-text)' }}>Every</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={recurrenceFrequency}
                                            onChange={(e) => setRecurrenceFrequency(Math.max(1, parseInt(e.target.value) || 1))}
                                            style={{
                                                width: '55px',
                                                padding: '6px 10px',
                                                fontSize: '1rem',
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
                                                padding: '6px 10px',
                                                fontSize: '1rem',
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
                                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
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
                                                                padding: '6px 4px',
                                                                fontSize: '0.85rem',
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

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--muted-text)', flexWrap: 'wrap' }}>
                        {createdFormatted && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Initial creation date and time">
                                <Clock size={13} style={{ opacity: 0.75, flexShrink: 0 }} />
                                <span>Created: <strong>{createdFormatted}</strong></span>
                            </span>
                        )}
                        {!isUnlimited && (
                            <span style={{ opacity: 0.85 }}>
                                {createdFormatted ? '• ' : ''}{`${editingTask.text.length}/${MAX_TASK_LENGTH}`}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: 'transparent',
                                color: 'var(--text-color)',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--item-bg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            style={{
                                padding: '8px 22px',
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                letterSpacing: '0.3px',
                                border: '1.5px solid #059669',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: '#10b981',
                                color: '#ffffff',
                                boxShadow: '0 2px 5px rgba(16, 185, 129, 0.25)',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#059669';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#10b981';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 5px rgba(16, 185, 129, 0.25)';
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
                                    {expandedOverlayField === 'notes' && (
                                        <button
                                            type="button"
                                            onClick={() => handleInsertTimestamp('notes')}
                                            title="Insert current date & time stamp into notes"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--item-bg)',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <Clock size={13} color="var(--accent-color)" />
                                            <span>+ Timestamp</span>
                                        </button>
                                    )}
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
                                        {listeningTarget === expandedOverlayField ? (
                                            <>
                                                <span style={{
                                                    width: '7px',
                                                    height: '7px',
                                                    borderRadius: '50%',
                                                    background: '#ef4444',
                                                    boxShadow: '0 0 6px #ef4444',
                                                    animation: 'pulse 1s infinite'
                                                }} />
                                                <Mic size={14} color="#ef4444" />
                                                <span>Listening...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Mic size={14} color="var(--accent-color)" />
                                                <span>Voice Dictation</span>
                                            </>
                                        )}
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
                            <ActionableEntitiesBar text={expandedOverlayField === 'title' ? editingTask.text : (editingTask.notes || '')} />

                            {expandedOverlayField === 'notes' && (
                                <PhotoAttachments
                                    photos={editingTask.photos || []}
                                    onChange={(newPhotos) => setEditingTask(prev => ({ ...prev, photos: newPhotos }))}
                                    readOnly={false}
                                />
                            )}

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
