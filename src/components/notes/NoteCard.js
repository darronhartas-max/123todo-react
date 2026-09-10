import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, Mic, ChevronDown, 
  Flag, Check, Clock, Camera, Copy,
  Square, CheckSquare, ListChecks
} from 'lucide-react';
import { PRIORITIES } from '../../utils/constants';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';
import PhotoAttachments from './PhotoAttachments';
import { renderActionableText, ActionableEntitiesBar } from '../../utils/textUtils';
import { formatEvidentiaryTimestamp } from '../../utils/dateUtils';

const NoteCard = ({
  note,
  projects = [],
  onUpdateNote,
  onConvertNoteToTask,
  onCompleteNote,
  onDeleteNote,
  onAssignProject,
  isSelected,
  onToggleSelect,
  notesFontSize = 18,
  notesAutosaveDelay = '60s'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(note.text || '');
  const [notesText, setNotesText] = useState(note.notes || '');
  const [subtasks, setSubtasks] = useState(note.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isDictatingTitle, setIsDictatingTitle] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedEvidence, setCopiedEvidence] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  const titleRecognitionRef = useRef(null);
  const noteTextareaRef = useRef(null);
  const titleTextareaRef = useRef(null);
  const editAutoSaveTimerRef = useRef(null);
  const archiveTimeoutRef = useRef(null);

  // Reset local checked state whenever note ID changes
  useEffect(() => {
    setIsChecked(false);
    if (archiveTimeoutRef.current) {
      clearTimeout(archiveTimeoutRef.current);
      archiveTimeoutRef.current = null;
    }
  }, [note.id]);

  // Clean up archive timeout on unmount
  useEffect(() => {
    return () => {
      if (archiveTimeoutRef.current) {
        clearTimeout(archiveTimeoutRef.current);
        archiveTimeoutRef.current = null;
      }
    };
  }, []);

  const handleComplete = (e) => {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault && e.cancelable) e.preventDefault();
    }
    if (isChecked) return;
    setIsChecked(true);

    if (archiveTimeoutRef.current) {
      clearTimeout(archiveTimeoutRef.current);
    }

    archiveTimeoutRef.current = setTimeout(() => {
      archiveTimeoutRef.current = null;
      setIsChecked(false);
      onCompleteNote(note.id);
    }, 300);
  };

  // Keep title textarea auto-expanded to fit content without truncation
  useEffect(() => {
    if (titleTextareaRef.current) {
      const el = titleTextareaRef.current;
      el.style.height = 'auto';
      const targetHeight = Math.max(el.scrollHeight, 46);
      el.style.height = `${targetHeight}px`;

      if (isDictatingTitle) {
        el.scrollTop = el.scrollHeight;
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
      }
    }
  }, [titleText, isEditing, isDictatingTitle]);

  // Keep note textarea auto-expanded
  useEffect(() => {
    if (noteTextareaRef.current) {
      const el = noteTextareaRef.current;
      el.style.height = 'auto';
      const targetHeight = Math.max(el.scrollHeight, 60);
      el.style.height = `${targetHeight}px`;
    }
  }, [notesText, isEditing]);

  useEffect(() => {
    setTitleText(note.text || '');
    setNotesText(note.notes || '');
    setSubtasks(note.subtasks || []);
  }, [note.text, note.notes, note.subtasks]);

  const hasAssociatedNote = Boolean((note.notes && note.notes.trim().length > 0) || (notesText && notesText.trim().length > 0));

  const currentProject = projects.find(p => p.id === note.projectId) || { id: 'general', name: 'Unassigned Inbox', color: '#6b7280' };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSt = {
      id: Date.now() + Math.random(),
      text: newSubtaskText.trim(),
      completed: false
    };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskText('');
    onUpdateNote(note.id, { subtasks: updated });
  };

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (titleRecognitionRef.current) {
        try { titleRecognitionRef.current.stop(); } catch (e) {}
        titleRecognitionRef.current = null;
      }
    };
  }, []);

  const handleSaveEdits = () => {
    if (editAutoSaveTimerRef.current) {
      clearTimeout(editAutoSaveTimerRef.current);
      editAutoSaveTimerRef.current = null;
    }
    if (titleRecognitionRef.current) {
      try { titleRecognitionRef.current.stop(); } catch (e) {}
      titleRecognitionRef.current = null;
    }
    setIsDictatingTitle(false);

    setIsEditing(false);
    onUpdateNote(note.id, {
      text: titleText.trim() || 'Untitled Task',
      notes: notesText.trim(),
      subtasks
    });
  };

  // Inactivity timeout in ms based on user preference ('30s' -> 30s, '60s' -> 1 min, '120s' -> 2 min, '300s' -> 5 min, 'off' -> 0)
  const autosaveDelayMs = useMemo(() => {
    switch (notesAutosaveDelay) {
      case '30s': return 30000;
      case '60s': return 60000;
      case '120s': return 120000;
      case '300s': return 300000;
      case 'off': return 0;
      default: return 60000; // 1 minute default
    }
  }, [notesAutosaveDelay]);

  // Auto-save existing note edits after configured idle period so user never loses edits on site
  useEffect(() => {
    if (!isEditing || isDictatingTitle || autosaveDelayMs === 0) return;

    const hasChanges =
      titleText !== (note.text || '') ||
      notesText !== (note.notes || '') ||
      JSON.stringify(subtasks) !== JSON.stringify(note.subtasks || []);

    if (hasChanges) {
      if (editAutoSaveTimerRef.current) {
        clearTimeout(editAutoSaveTimerRef.current);
      }
      editAutoSaveTimerRef.current = setTimeout(() => {
        onUpdateNote(note.id, {
          text: titleText.trim() || 'Untitled Task',
          notes: notesText.trim(),
          subtasks
        });
      }, autosaveDelayMs);
    }

    return () => {
      if (editAutoSaveTimerRef.current) {
        clearTimeout(editAutoSaveTimerRef.current);
      }
    };
  }, [isEditing, titleText, notesText, subtasks, isDictatingTitle, autosaveDelayMs, note, onUpdateNote]);

  // Auto-save edits on phone lock / app switch
  useEffect(() => {
    if (!isEditing) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const hasChanges =
          titleText !== (note.text || '') ||
          notesText !== (note.notes || '') ||
          JSON.stringify(subtasks) !== JSON.stringify(note.subtasks || []);
        if (hasChanges) {
          onUpdateNote(note.id, {
            text: titleText.trim() || 'Untitled Task',
            notes: notesText.trim(),
            subtasks
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEditing, titleText, notesText, subtasks, note, onUpdateNote]);

  const handleToggleTitleDictation = (e) => {
    if (e) e.stopPropagation();
    if (isDictatingTitle) {
      if (titleRecognitionRef.current) {
        try { titleRecognitionRef.current.stop(); } catch (e) {}
        titleRecognitionRef.current = null;
      }
      setIsDictatingTitle(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Voice input is not supported');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsDictatingTitle(true);
    const initialNoteTitle = titleText;

    titleRecognitionRef.current = startVoiceDictation({
      initialText: initialNoteTitle,
      onTranscript: (updatedText, isSubmitCommand) => {
        if (isSubmitCommand) {
          if (titleRecognitionRef.current) {
            try { titleRecognitionRef.current.stop(); } catch (e) {}
            titleRecognitionRef.current = null;
          }
          setIsDictatingTitle(false);
        } else {
          setTitleText(updatedText);
          onUpdateNote(note.id, { text: updatedText });
        }
      },
      onStatusChange: (msg) => setStatusMessage(msg),
      onEnd: () => {
        setIsDictatingTitle(false);
        titleRecognitionRef.current = null;
      }
    });

    // Move cursor to end of textarea
    setTimeout(() => {
      if (titleTextareaRef.current) {
        titleTextareaRef.current.focus();
        const len = titleTextareaRef.current.value.length;
        titleTextareaRef.current.setSelectionRange(len, len);
      }
    }, 100);
  };

  const handleCancelEdits = (e) => {
    if (e) e.stopPropagation();
    const hasChanges = 
      titleText !== (note.text || '') ||
      notesText !== (note.notes || '') ||
      JSON.stringify(subtasks) !== JSON.stringify(note.subtasks || []);

    if (hasChanges && window.confirm) {
      const confirmDiscard = window.confirm('Discard unsaved changes to this note?');
      if (!confirmDiscard) return;
    }

    if (editAutoSaveTimerRef.current) {
      clearTimeout(editAutoSaveTimerRef.current);
      editAutoSaveTimerRef.current = null;
    }

    if (titleRecognitionRef.current) {
      try { titleRecognitionRef.current.stop(); } catch (err) {}
      titleRecognitionRef.current = null;
    }
    setIsDictatingTitle(false);
    setTitleText(note.text || '');
    setNotesText(note.notes || '');
    setSubtasks(note.subtasks || []);
    setIsEditing(false);
  };

  const createdTs = note.createdAt || note.id;
  const createdFormatted = formatEvidentiaryTimestamp(createdTs);
  const updatedFormatted = note.updatedAt && (note.updatedAt - createdTs > 60000)
    ? formatEvidentiaryTimestamp(note.updatedAt)
    : null;

  const handleCopyEvidence = (e) => {
    if (e) e.stopPropagation();
    let textToCopy = `123 ToDo Entry Log | Created: ${createdFormatted}`;
    if (updatedFormatted) {
      textToCopy += ` | Edited: ${updatedFormatted}`;
    }
    textToCopy += ` | Task: "${note.text || ''}"`;
    if (note.notes) {
      textToCopy += ` | Notes: "${note.notes}"`;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedEvidence(true);
        setTimeout(() => setCopiedEvidence(false), 2500);
      }).catch(() => {});
    }
  };

  const formattedDate = note.updatedAt ? new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: isSelected ? '0 0 0 2px #2563eb, 0 8px 24px rgba(37, 99, 235, 0.15)' : '0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid var(--border-color, #e5e7eb)',
        position: 'relative',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Top Header Row: Project Badge & Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Project Tag Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProjectPicker(!showProjectPicker)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: `${currentProject.color || '#6b7280'}18`,
                color: currentProject.color || '#4b5563',
                border: `1px solid ${currentProject.color || '#6b7280'}40`,
                cursor: 'pointer'
              }}
            >
              <Folder size={12} color={currentProject.color || '#4b5563'} />
              <span>{currentProject.name}</span>
              <ChevronDown size={12} />
            </button>

            {/* Project Picker Dropdown */}
            <AnimatePresence>
              {showProjectPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    minWidth: '180px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', padding: '6px 8px' }}>
                    Assign to Project:
                  </div>
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onAssignProject(note.id, p.id);
                        setShowProjectPicker(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: p.id === note.projectId ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                        color: 'var(--text-color, #1f2937)',
                        fontSize: '13px',
                        fontWeight: p.id === note.projectId ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color || '#6b7280' }} />
                      <span style={{ flex: 1 }}>{p.name}</span>
                      {p.id === note.projectId && <Check size={14} color="#2563eb" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Priority indicator if it has priority */}
          {note.priority && note.priority < 4 && (
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: `${PRIORITIES[note.priority]?.color}20`,
              color: PRIORITIES[note.priority]?.color,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Flag size={11} fill={PRIORITIES[note.priority]?.color} color={PRIORITIES[note.priority]?.color} />
              <span>P{note.priority} {PRIORITIES[note.priority]?.label}</span>
            </span>
          )}

          {/* Photo indicator badge */}
          {note.photos && note.photos.length > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }} title={`${note.photos.length} photo${note.photos.length > 1 ? 's' : ''} attached`}>
              <Camera size={12} strokeWidth={2.2} /> {note.photos.length} {note.photos.length > 1 ? 'photos' : 'photo'}
            </span>
          )}
        </div>

        {/* Right side: formatted time & Archive Checkbox in exact same style as Task mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
          {formattedDate && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {formattedDate}
            </span>
          )}

          {/* Archive Checkbox - Same style as Task mode */}
          <motion.button
            onClick={handleComplete}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              background: isChecked ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              minWidth: '32px',
              minHeight: '32px',
              touchAction: 'manipulation',
              color: isChecked ? '#10b981' : 'var(--muted-text, #9ca3af)',
              padding: '2px',
              transition: 'all 0.15s ease'
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            title={isChecked ? "Cancel completion" : "Complete / Archive Note"}
            aria-label={isChecked ? "Cancel completion" : "Complete / Archive Note"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isChecked ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.1 }}
                >
                  <CheckSquare size={18} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="square"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <Square size={18} opacity={0.65} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Note Main Text Area (Large Builder Font) */}
      <div style={{ cursor: isEditing ? 'default' : 'pointer' }} onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Top Action Toolbar for Edit Mode: Large Save Button, Dictate Button, Cancel Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
              paddingBottom: '10px',
              borderBottom: '1.5px solid rgba(37, 99, 235, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ✏️ Edit Note
                </span>
                <button
                  type="button"
                  onClick={handleCancelEdits}
                  style={{
                    border: '1px solid var(--border-color, #d1d5db)',
                    background: 'transparent',
                    color: 'var(--text-secondary, #6b7280)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}
                  title="Discard unsaved changes"
                >
                  Cancel
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Prominent Dictate at End Record Button */}
                <button
                  type="button"
                  onClick={handleToggleTitleDictation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isDictatingTitle ? '#ef4444' : '#2563eb'}`,
                    backgroundColor: isDictatingTitle ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.1)',
                    color: isDictatingTitle ? '#ef4444' : '#2563eb',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '40px',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease'
                  }}
                  title={isDictatingTitle ? "Tap to stop listening" : "Begin dictating at the end of this note"}
                >
                  {isDictatingTitle ? (
                    <>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        boxShadow: '0 0 8px #ef4444',
                        display: 'inline-block',
                        animation: 'pulse 1s infinite'
                      }} />
                      <Mic size={15} color="#ef4444" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={15} color="#2563eb" />
                      <span>🎙️ Dictate at End</span>
                    </>
                  )}
                </button>

                {/* Large Prominent Save Note Button at the TOP */}
                <button
                  type="button"
                  onClick={handleSaveEdits}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    minHeight: '40px',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Save Note / Task changes"
                >
                  <Check size={18} strokeWidth={2.6} />
                  <span>Save Note</span>
                </button>
              </div>
            </div>

            <textarea
              ref={titleTextareaRef}
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveEdits();
                }
              }}
              placeholder="Note Title..."
              rows={2}
              spellCheck="true"
              autoCorrect="on"
              autoCapitalize="sentences"
              style={{
                fontSize: '17px',
                fontWeight: '700',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #2563eb',
                backgroundColor: 'var(--item-bg, #f9fafb)',
                color: 'var(--text-color, #111827)',
                outline: 'none',
                width: '100%',
                resize: 'none',
                lineHeight: 1.45,
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <ActionableEntitiesBar text={titleText} />
            {hasAssociatedNote && (
              <>
                <textarea
                  ref={noteTextareaRef}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveEdits();
                    }
                  }}
                  placeholder="Write note details or dictation..."
                  rows={3}
                  spellCheck="true"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  style={{
                    fontSize: '16px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #d1d5db)',
                    backgroundColor: 'var(--item-bg, #f9fafb)',
                    color: 'var(--text-color, #111827)',
                    outline: 'none',
                    width: '100%',
                    resize: 'none',
                    lineHeight: 1.5
                  }}
                />
                <ActionableEntitiesBar text={notesText} />
              </>
            )}
            <PhotoAttachments
              photos={note.photos || []}
              onChange={(newPhotos) => onUpdateNote(note.id, { photos: newPhotos })}
              readOnly={false}
            />
            {/* Subtasks Section in Edit Mode */}
            <div style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', background: 'var(--item-bg, #f9fafb)', border: '1px solid var(--border-color, #e5e7eb)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--text-color, #374151)', marginBottom: '8px' }}>
                <ListChecks size={14} />
                <span>Subtasks ({subtasks.length})</span>
              </div>
              {subtasks.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px 0' }}>
                  {subtasks.map((st) => (
                    <li key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', borderBottom: '1px solid var(--border-color, #f3f4f6)' }}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => {
                          const updated = subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                          setSubtasks(updated);
                          onUpdateNote(note.id, { subtasks: updated });
                        }}
                        style={{ cursor: 'pointer', width: '14px', height: '14px', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <textarea
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = `${Math.max(el.scrollHeight, 24)}px`;
                            }
                          }}
                          value={st.text}
                          rows={1}
                          onChange={(e) => {
                            const updatedText = e.target.value;
                            const updated = subtasks.map(s => s.id === st.id ? { ...s, text: updatedText } : s);
                            setSubtasks(updated);
                            onUpdateNote(note.id, { subtasks: updated });
                          }}
                          onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.max(e.target.scrollHeight, 24)}px`;
                          }}
                          placeholder="Subtask step..."
                          style={{
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            color: st.completed ? 'var(--text-secondary, #9ca3af)' : 'var(--text-color, #111827)',
                            textDecoration: st.completed ? 'line-through' : 'none',
                            outline: 'none',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            resize: 'none',
                            overflowY: 'hidden',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.4',
                            minHeight: '24px',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.background = 'var(--card-bg, #ffffff)';
                            e.target.style.boxShadow = '0 0 0 1px #2563eb';
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.max(e.target.scrollHeight, 24)}px`;
                          }}
                          onBlur={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.boxShadow = 'none';
                            if (!st.text.trim()) {
                              const updated = subtasks.filter(s => s.id !== st.id);
                              setSubtasks(updated);
                              onUpdateNote(note.id, { subtasks: updated });
                            }
                          }}
                        />
                        <ActionableEntitiesBar text={st.text} compact />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = subtasks.filter(s => s.id !== st.id);
                          setSubtasks(updated);
                          onUpdateNote(note.id, { subtasks: updated });
                        }}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px 4px', fontSize: '12px', fontWeight: '600' }}
                      >
                        ✕
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
                    padding: '4px 8px',
                    fontSize: '13px',
                    border: '1px solid var(--border-color, #d1d5db)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    color: 'var(--text-color, #111827)',
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
                  type="button"
                  onClick={handleAddSubtask}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <ActionableEntitiesBar text={newSubtaskText} compact />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleCancelEdits}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #d1d5db)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary, #6b7280)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdits}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  minHeight: '38px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Check size={16} strokeWidth={2.4} />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ 
              fontSize: `${notesFontSize}px`, 
              fontWeight: '700', 
              color: 'var(--text-color, #111827)', 
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}>
              {renderActionableText(note.text)}
            </h3>

            {note.notes && note.notes.trim().length > 0 ? (
              <p
                style={{ 
                  fontSize: `${Math.max(notesFontSize - 2, 12)}px`, 
                  color: 'var(--text-color, #374151)', 
                  margin: 0, 
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '280px',
                  overflowY: 'auto'
                }}
              >
                {renderActionableText(note.notes)}
              </p>
            ) : null}

            {note.photos && note.photos.length > 0 && (
              <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '8px' }}>
                <PhotoAttachments
                  photos={note.photos}
                  readOnly={true}
                />
              </div>
            )}

            {/* Subtasks in View Mode */}
            {subtasks.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-color, #e5e7eb)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', marginBottom: '4px' }}>
                  <ListChecks size={14} />
                  <span>Steps ({subtasks.filter(s => s.completed).length}/{subtasks.length}):</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {subtasks.map((st) => (
                    <li key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0' }}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => {
                          const updated = subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                          setSubtasks(updated);
                          onUpdateNote(note.id, { subtasks: updated });
                        }}
                        style={{ cursor: 'pointer', width: '13px', height: '13px', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <input
                          type="text"
                          value={st.text}
                          onChange={(e) => {
                            const updatedText = e.target.value;
                            const updated = subtasks.map(s => s.id === st.id ? { ...s, text: updatedText } : s);
                            setSubtasks(updated);
                            onUpdateNote(note.id, { subtasks: updated });
                          }}
                          placeholder="Subtask step..."
                          style={{
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            color: st.completed ? 'var(--text-secondary, #9ca3af)' : 'var(--text-color, #111827)',
                            textDecoration: st.completed ? 'line-through' : 'none',
                            outline: 'none',
                            padding: '2px 4px',
                            borderRadius: '4px'
                          }}
                          onFocus={(e) => {
                            e.target.style.background = 'var(--card-bg, #ffffff)';
                            e.target.style.boxShadow = '0 0 0 1px #2563eb';
                          }}
                          onBlur={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.boxShadow = 'none';
                            if (!st.text.trim()) {
                              const updated = subtasks.filter(s => s.id !== st.id);
                              setSubtasks(updated);
                              onUpdateNote(note.id, { subtasks: updated });
                            }
                          }}
                        />
                        <ActionableEntitiesBar text={st.text} compact />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dictation Status Bar if Active */}
      {(isDictatingTitle || statusMessage) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <Mic size={16} style={{ animation: 'pulse 1.2s infinite' }} />
          <span>{statusMessage || 'Listening...'}</span>
        </div>
      )}

      {/* Bottom Action Bar & Evidentiary Timestamp */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '10px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color, #f3f4f6)',
        flexWrap: 'wrap'
      }}>
        {/* Left: Evidentiary Timestamp Display with 1-Tap Copy Proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--item-bg, #f3f4f6)',
              border: '1px solid var(--border-color, #e5e7eb)',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
              fontFamily: 'monospace, sans-serif'
            }}
            title="Timestamp evidence: Created date & time of this note/task"
          >
            <Clock size={12} color="#6b7280" style={{ flexShrink: 0 }} />
            <span>
              {createdFormatted}
              {updatedFormatted && ` (Edit: ${updatedFormatted.split(',')[1] || updatedFormatted})`}
            </span>
            <button
              type="button"
              onClick={handleCopyEvidence}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                border: 'none',
                background: copiedEvidence ? '#10b981' : 'rgba(37, 99, 235, 0.1)',
                color: copiedEvidence ? '#ffffff' : '#2563eb',
                borderRadius: '5px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginLeft: '4px'
              }}
              title="Copy evidentiary timestamp & note to clipboard"
            >
              {copiedEvidence ? (
                <>
                  <Check size={10} strokeWidth={3} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={10} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Action Group: Make Task (Priority) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Turn into Task Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPriorityPicker(!showPriorityPicker)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Flag size={13} fill="#2563eb" color="#2563eb" />
              <span>Priority</span>
              <ChevronDown size={12} />
            </button>

            {showPriorityPicker && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '6px',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 100,
                minWidth: '160px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', padding: '4px 8px' }}>
                  Assign Task Priority:
                </div>
                {[1, 2, 3].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      onConvertNoteToTask(note.id, p);
                      setShowPriorityPicker(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: `${PRIORITIES[p].color}15`,
                      color: PRIORITIES[p].color,
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Flag size={13} fill={PRIORITIES[p].color} color={PRIORITIES[p].color} />
                    <span>P{p} ({PRIORITIES[p].label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
