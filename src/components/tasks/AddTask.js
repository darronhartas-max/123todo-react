import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MAX_TASK_LENGTH, STORAGE_KEYS } from '../../utils/constants';
import { Plus, Minus, Mic, Calendar, FileText, ListChecks, X, Clock, AlertCircle, Folder, Repeat, Sparkles } from 'lucide-react';
import { getTodayDateString, adjustStartDateForWeekdays, formatDisplayDate, formatDisplayTime } from '../../utils/dateUtils';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';
import PhotoAttachments from '../notes/PhotoAttachments';
import { ActionableEntitiesBar, ensureCursorVisible, ensureElementInViewport } from '../../utils/textUtils';
import { ProjectPicker, PrioritySelector, SchedulePicker, SubtasksEditor } from './editor';
import { parseQuickAdd, removeTokenFromText } from '../../utils/nlpParser';

const AddTask = ({ isOpen, onAdd, onClose, projects, defaultProjectId, dateFormat = 'UK', taskLengthLimit = '250', timeSchedulingEnabled = true, buttonDisplayMode = 'icons', priorityColors }) => {
    const showBtnIcons = buttonDisplayMode === 'icons' || buttonDisplayMode === 'both';
    const showBtnText = buttonDisplayMode === 'text' || buttonDisplayMode === 'both';
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
    const [photos, setPhotos] = useState([]);
    const [showNotes, setShowNotes] = useState(false);
    const [isNotesFocused, setIsNotesFocused] = useState(false);
    const [priority, setPriority] = useState(1);
    
    // Scheduling and subtask states
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(null);
    const [scheduledTime, setScheduledTime] = useState(null);
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
    const cursorPositionsRef = useRef({ title: null, notes: null });

    // Real-time Natural Language Quick Add entity parsing
    const parsedNLP = useMemo(() => {
        return parseQuickAdd(text, projects, { dateFormat });
    }, [text, projects, dateFormat]);

    // Auto-expand and scroll so newly spoken/typed text is always clearly visible in the viewing pane
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.max(inputRef.current.scrollHeight, 48) + 'px';
            ensureCursorVisible(inputRef.current, cursorPositionsRef.current.title);
            ensureElementInViewport(inputRef.current, { preferBottom: true });
        }
    }, [text, listeningTarget]);

    useEffect(() => {
        if (notesRef.current) {
            notesRef.current.style.height = 'auto';
            notesRef.current.style.height = Math.max(notesRef.current.scrollHeight, 80) + 'px';
            ensureCursorVisible(notesRef.current, cursorPositionsRef.current.notes);
            ensureElementInViewport(notesRef.current, { preferBottom: true });
        }
    }, [notes, listeningTarget]);

    const stopVoice = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }
        recognitionRef.current = null;
        setListeningTarget(null);
    };

    const handleCancel = () => {
        stopVoice();
        setText('');
        setNotes('');
        setPhotos([]);
        setSubtasks([]);
        setScheduledDate(null);
        setScheduledTime(null);
        setIsRecurring(false);
        setRecurrenceFrequency(1);
        setRecurrenceInterval('days');
        setRecurrenceDaysOfWeek([]);
        setShowSchedule(false);
        setShowNotes(false);
        setShowSubtasks(false);
        cursorPositionsRef.current = { title: null, notes: null };
        if (onClose) onClose();
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

        const currentVal = targetField === 'title' ? text : notes;
        const cursorPos = cursorPositionsRef.current[targetField];
        const userPlacedCursorElsewhere = typeof cursorPos === 'number' && cursorPos < currentVal.length;

        let prefix = '';
        let suffix = '';

        if (currentVal && currentVal.trim().length > 0) {
            if (userPlacedCursorElsewhere) {
                prefix = currentVal.slice(0, cursorPos);
                suffix = currentVal.slice(cursorPos);
            } else {
                const separator = currentVal.endsWith('\n') ? '' : '\n';
                prefix = currentVal + separator;
                suffix = '';
            }
        }

        const rec = startVoiceDictation({
            initialText: prefix,
            prefix,
            suffix,
            onTranscript: (updatedText, isSubmitCommand) => {
                const insertionPos = userPlacedCursorElsewhere
                    ? Math.max(0, updatedText.length - suffix.length)
                    : updatedText.length;
                cursorPositionsRef.current[targetField] = insertionPos;

                if (targetField === 'title') {
                    setText(updatedText);
                } else {
                    setNotes(updatedText);
                }

                const el = targetField === 'title' ? inputRef.current : notesRef.current;
                if (el) {
                    try {
                        el.setSelectionRange(insertionPos, insertionPos);
                        ensureCursorVisible(el, insertionPos);
                        ensureElementInViewport(el, { preferBottom: true });
                    } catch (e) {}
                }

                if (isSubmitCommand) {
                    stopVoice();
                    setVoiceStatus('Auto-submitting task...');
                    if (targetField === 'title') {
                        if (updatedText.trim().length > 0) handleSubmit(updatedText);
                    } else {
                        handleSubmit(text, updatedText);
                    }
                    setTimeout(() => setVoiceStatus(''), 200);
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
        const rawTitle = typeof overrideText === 'string' ? overrideText : text;
        const taskNotes = typeof overrideNotes === 'string' ? overrideNotes : notes;
        if (!rawTitle.trim() && !taskNotes.trim()) return;

        stopVoice();

        // Run NLP quick add parser on input text
        const nlp = parseQuickAdd(rawTitle, projects, { dateFormat });
        let finalTitle = (nlp.tokens.length > 0 && nlp.cleanText) ? nlp.cleanText : rawTitle.trim();
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

        // Priority: NLP parsed priority takes precedence if present
        const finalPriority = nlp.priority !== null ? nlp.priority : priority;

        // Project: NLP parsed project takes precedence if present
        let finalProjectId = projectId;
        if (nlp.projectId !== null) {
            finalProjectId = nlp.projectId;
        } else if (projectId === 'all') {
            finalProjectId = projects[0]?.id || 'general';
        }

        // Schedule & Recurrence: NLP parsed date/time/recurrence takes precedence
        let finalScheduledDate = nlp.scheduledDate || scheduledDate;
        let finalScheduledTime = nlp.scheduledTime !== null ? nlp.scheduledTime : scheduledTime;
        let finalIsRecurring = isRecurring || !!nlp.recurrence;
        let recurrence = null;

        if (nlp.recurrence) {
            if (!finalScheduledDate) {
                finalScheduledDate = getTodayDateString();
            }
            recurrence = nlp.recurrence;
        } else if (isRecurring) {
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

        onAdd(finalTitle, finalPriority, finalProjectId, taskNotes.trim(), {
            scheduledDate: finalScheduledDate,
            scheduledTime: (finalScheduledDate && timeSchedulingEnabled) ? finalScheduledTime : null,
            subtasks,
            isRecurring: finalIsRecurring && !!finalScheduledDate,
            recurrence,
            photos
        });

        try {
            localStorage.setItem(STORAGE_KEYS.LAST_PROJECT, finalProjectId);
        } catch (e) {
            console.warn('Could not save last project preference:', e);
        }

        // Reset all states
        setText('');
        setNotes('');
        setPhotos([]);
        setShowNotes(false);
        setSubtasks([]);
        setScheduledDate(null);
        setScheduledTime(null);
        setIsRecurring(false);
        setRecurrenceFrequency(1);
        setRecurrenceInterval('days');
        setRecurrenceDaysOfWeek([]);
        setShowSubtasks(false);
        setShowSchedule(false);
        setProjectId(finalProjectId);
        onClose();
    };



    const toggleButtonStyle = (isActive) => ({
        border: '1px solid var(--accent-color)',
        color: isActive ? 'white' : 'var(--accent-color)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        padding: showBtnText ? '6px 11px' : '6px 14px',
        minWidth: showBtnText ? 'auto' : '38px',
        minHeight: '34px',
        borderRadius: '6px',
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
            position: 'relative',
            zIndex: isProjectOpen ? 120 : 60,
            padding: isOpen ? 'clamp(8px, 2.5vw, 12px)' : '0',
            background: 'var(--surface-color)',
            maxHeight: isOpen ? 'none' : '0',
            overflow: isOpen ? 'visible' : 'hidden',
            transition: isOpen ? 'padding 0.3s ease, box-shadow 0.3s ease' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 121 }}>
                <ProjectPicker
                    projects={projects}
                    selectedProjectId={projectId}
                    onSelectProject={setProjectId}
                    isOpen={isProjectOpen}
                    onToggleOpen={setIsProjectOpen}
                />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <button
                        type="button"
                        onClick={() => toggleVoiceInput('title')}
                        aria-label={listeningTarget === 'title' ? "Listening" : "Talk"}
                        title={listeningTarget === 'title' ? "Listening - Tap to finish" : (speechSupported ? "Speak to add or append to task title" : "Voice input not supported")}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: showBtnText ? '4px 10px' : '5px 12px',
                            minWidth: showBtnText ? 'auto' : '36px',
                            minHeight: '32px',
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
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    boxShadow: '0 0 8px #ef4444',
                                    animation: 'pulse 1s infinite'
                                }} />
                                <Mic size={14} color="#ef4444" />
                                <span>Listening...</span>
                            </>
                        ) : (
                            <>
                                {showBtnIcons && <Mic size={14} color="var(--accent-color)" />}
                                {showBtnText && <span>Talk</span>}
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
                    {onClose && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            aria-label="Cancel and close"
                            title="Cancel (Esc)"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--muted-text)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                padding: 0
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.borderColor = '#ef4444';
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--muted-text)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {voiceStatus && (
                <div style={{
                    fontSize: '0.82rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    marginTop: '6px',
                    marginBottom: '6px',
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

            <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    cursorPositionsRef.current.title = e.target.selectionStart;
                    ensureCursorVisible(e.target, e.target.selectionStart);
                    ensureElementInViewport(e.target, { preferBottom: true });
                }}
                onInput={(e) => {
                    handleInput(e);
                    cursorPositionsRef.current.title = e.target.selectionStart;
                    ensureCursorVisible(e.target, e.target.selectionStart);
                    ensureElementInViewport(e.target, { preferBottom: true });
                }}
                onClick={(e) => {
                    cursorPositionsRef.current.title = e.target.selectionStart;
                    ensureCursorVisible(e.target, e.target.selectionStart);
                    ensureElementInViewport(e.target, { preferBottom: true });
                }}
                onKeyUp={(e) => {
                    cursorPositionsRef.current.title = e.target.selectionStart;
                    ensureCursorVisible(e.target, e.target.selectionStart);
                }}
                onSelect={(e) => {
                    cursorPositionsRef.current.title = e.target.selectionStart;
                    ensureCursorVisible(e.target, e.target.selectionStart);
                }}
                onFocus={(e) => {
                    cursorPositionsRef.current.title = e.target.selectionStart;
                    ensureCursorVisible(e.target, e.target.selectionStart);
                    ensureElementInViewport(e.target, { preferBottom: true });
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancel();
                    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                placeholder="What needs to be done?"
                style={styles.taskInput}
                maxLength={isUnlimited ? undefined : Math.max(MAX_TASK_LENGTH * 4, (text || '').length + 500)}
            />

            {parsedNLP.tokens.length > 0 && (
                <div data-testid="quick-add-preview" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    alignItems: 'center',
                    padding: '6px 10px',
                    marginTop: '6px',
                    marginBottom: '4px',
                    background: 'var(--item-bg, rgba(0,0,0,0.03))',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: '700' }}>
                        <Sparkles size={13} />
                        <span>Quick Add:</span>
                    </div>
                    {parsedNLP.tokens.map((tok, idx) => (
                        <span
                            key={idx}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                background: 'var(--surface-color)',
                                color: tok.color || (tok.type === 'priority' ? '#ef4444' : 'var(--text-color)'),
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            {tok.type === 'date' && <Calendar size={12} />}
                            {tok.type === 'time' && <Clock size={12} />}
                            {tok.type === 'priority' && <AlertCircle size={12} />}
                            {tok.type === 'project' && <Folder size={12} />}
                            {tok.type === 'recurrence' && <Repeat size={12} />}
                            <span>{tok.label}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    const newText = removeTokenFromText(text, tok.raw);
                                    setText(newText);
                                }}
                                aria-label={`Remove ${tok.label}`}
                                title="Remove from quick add"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    marginLeft: '2px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    color: 'var(--muted-text)'
                                }}
                            >
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <ActionableEntitiesBar texts={[text, notes, ...(subtasks.map(s => s.text))]} />

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '6px' }}>
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    style={toggleButtonStyle(showNotes)}
                    aria-label="Notes"
                    title={showNotes ? "Hide Notes" : "Show Notes"}
                >
                    {showBtnIcons && (buttonDisplayMode === 'both' ? (showNotes ? <Minus size={14} /> : <Plus size={14} />) : <FileText size={15} />)}
                    {showBtnText && <span>Notes{(notes && notes.trim().length > 0) || photos.length > 0 ? ' •' : ''}</span>}
                    {!showBtnText && ((notes && notes.trim().length > 0) || photos.length > 0) && (
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>•</span>
                    )}
                </button>
                <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    style={toggleButtonStyle(showSubtasks)}
                    aria-label={`Subtasks (${subtasks.length})`}
                    title={showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
                >
                    {showBtnIcons && (buttonDisplayMode === 'both' ? (showSubtasks ? <Minus size={14} /> : <Plus size={14} />) : <ListChecks size={15} />)}
                    {showBtnText && <span>Subtasks ({subtasks.length})</span>}
                    {!showBtnText && (
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{subtasks.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    style={toggleButtonStyle(showSchedule)}
                    aria-label={scheduledDate
                        ? `Scheduled: ${formatDisplayDate(scheduledDate, dateFormat)}`
                        : 'Schedule'}
                    title={showSchedule ? "Hide Schedule" : "Show Schedule"}
                >
                    {showBtnIcons && (buttonDisplayMode === 'both' ? (showSchedule ? <Minus size={14} /> : <Plus size={14} />) : <Calendar size={15} />)}
                    {showBtnText && <span>{scheduledDate
                        ? `Scheduled: ${formatDisplayDate(scheduledDate, dateFormat)}${timeSchedulingEnabled && scheduledTime ? ` • ${formatDisplayTime(scheduledTime, dateFormat)}` : ''}`
                        : 'Schedule'}</span>}
                    {!showBtnText && scheduledDate && (
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {formatDisplayDate(scheduledDate, dateFormat)}
                        </span>
                    )}
                </button>
            </div>

            {showNotes && (
                <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)' }}>Notes</label>
                        <button
                            type="button"
                            onClick={() => toggleVoiceInput('notes')}
                            aria-label={listeningTarget === 'notes' ? "Listening" : "Talk"}
                            title={listeningTarget === 'notes' ? "Listening - Tap to finish" : (speechSupported ? "Speak to add/append notes" : "Voice input not supported")}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: showBtnText ? '2px 8px' : '4px 8px',
                                minWidth: showBtnText ? 'auto' : '30px',
                                minHeight: '28px',
                                borderRadius: '12px',
                                border: `1px solid ${listeningTarget === 'notes' ? '#ef4444' : 'var(--border-color)'}`,
                                background: listeningTarget === 'notes' ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg)',
                                color: listeningTarget === 'notes' ? '#ef4444' : 'var(--text-color)',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: '600'
                            }}
                        >
                            {listeningTarget === 'notes' ? (
                                <>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#ef4444',
                                        boxShadow: '0 0 6px #ef4444',
                                        animation: 'pulse 1s infinite'
                                    }} />
                                    <Mic size={12} color="#ef4444" />
                                    <span>Listening...</span>
                                </>
                            ) : (
                                <>
                                    {showBtnIcons && <Mic size={12} color="var(--accent-color)" />}
                                    {showBtnText && <span>Talk</span>}
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        ref={notesRef}
                        value={notes}
                        onChange={(e) => {
                            setNotes(e.target.value);
                            cursorPositionsRef.current.notes = e.target.selectionStart;
                            ensureCursorVisible(e.target, e.target.selectionStart);
                            ensureElementInViewport(e.target, { preferBottom: true });
                        }}
                        onInput={(e) => {
                            handleInput(e);
                            cursorPositionsRef.current.notes = e.target.selectionStart;
                            ensureCursorVisible(e.target, e.target.selectionStart);
                            ensureElementInViewport(e.target, { preferBottom: true });
                        }}
                        onClick={(e) => {
                            cursorPositionsRef.current.notes = e.target.selectionStart;
                            ensureCursorVisible(e.target, e.target.selectionStart);
                            ensureElementInViewport(e.target, { preferBottom: true });
                        }}
                        onKeyUp={(e) => {
                            cursorPositionsRef.current.notes = e.target.selectionStart;
                            ensureCursorVisible(e.target, e.target.selectionStart);
                        }}
                        onSelect={(e) => {
                            cursorPositionsRef.current.notes = e.target.selectionStart;
                            ensureCursorVisible(e.target, e.target.selectionStart);
                        }}
                        onFocus={(e) => {
                            setIsNotesFocused(true);
                            cursorPositionsRef.current.notes = e.target.selectionStart;
                            ensureCursorVisible(e.target, e.target.selectionStart);
                            ensureElementInViewport(e.target, { preferBottom: true });
                        }}
                        onBlur={() => {
                            setIsNotesFocused(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancel();
                            }
                        }}
                        placeholder={isNotesFocused ? '' : 'Add notes...'}
                        style={{ ...styles.taskInput, minHeight: '60px', marginTop: '0' }}
                    />
                    <PhotoAttachments
                        photos={photos}
                        onChange={setPhotos}
                        readOnly={false}
                    />
                </div>
            )}

            {showSubtasks && (
                <SubtasksEditor
                    subtasks={subtasks}
                    onChangeSubtasks={setSubtasks}
                    titleText="📋 Subtasks / Checklist"
                />
            )}

            {showSchedule && (
                <SchedulePicker
                    scheduledDate={scheduledDate}
                    onChangeScheduledDate={setScheduledDate}
                    scheduledTime={scheduledTime}
                    onChangeScheduledTime={setScheduledTime}
                    timeSchedulingEnabled={timeSchedulingEnabled}
                    dateFormat={dateFormat}
                    buttonDisplayMode={buttonDisplayMode}
                    isRecurring={isRecurring}
                    onToggleRecurring={setIsRecurring}
                    recurrenceFrequency={recurrenceFrequency}
                    onChangeRecurrenceFrequency={setRecurrenceFrequency}
                    recurrenceInterval={recurrenceInterval}
                    onChangeRecurrenceInterval={setRecurrenceInterval}
                    recurrenceDaysOfWeek={recurrenceDaysOfWeek}
                    onChangeRecurrenceDaysOfWeek={setRecurrenceDaysOfWeek}
                    taskTitle={text}
                    taskNotes={notes}
                    dateInputId="start-scheduled-date"
                />
            )}

            <PrioritySelector
                priority={priority}
                onChangePriority={setPriority}
                priorityColors={priorityColors}
                actionButton={
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
                }
            />
        </div>
    );
};

export default AddTask;
