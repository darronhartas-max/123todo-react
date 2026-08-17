import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, CheckCircle, Mic, MicOff, ChevronDown, 
  ArrowUpRight, Check, Clock
} from 'lucide-react';
import { PRIORITIES } from '../../utils/constants';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';

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
  notesFontSize = 18
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(note.text || '');
  const [notesText, setNotesText] = useState(note.notes || '');
  const [subtasks, setSubtasks] = useState(note.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const recognitionRef = useRef(null);
  const noteTextareaRef = useRef(null);
  const noteViewBodyRef = useRef(null);

  // Keep latest spoken lines visible at all times during dictation / editing
  useEffect(() => {
    if (noteTextareaRef.current) {
      const el = noteTextareaRef.current;
      el.style.height = 'auto';
      const targetHeight = Math.max(el.scrollHeight, 60);
      el.style.height = `${targetHeight}px`;
      el.scrollTop = el.scrollHeight;

      if (isDictating) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
      }
    }
  }, [notesText, isEditing, isDictating]);

  useEffect(() => {
    if (isDictating && noteViewBodyRef.current) {
      try {
        noteViewBodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (e) {}
    }
  }, [note.notes, isDictating]);

  useEffect(() => {
    setTitleText(note.text || '');
    setNotesText(note.notes || '');
    setSubtasks(note.subtasks || []);
  }, [note.text, note.notes, note.subtasks]);

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

  const handleSaveEdits = () => {
    setIsEditing(false);
    onUpdateNote(note.id, {
      text: titleText.trim() || 'Untitled Task',
      notes: notesText.trim(),
      subtasks
    });
  };

  const handleToggleDictation = (e) => {
    e.stopPropagation();
    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Voice input is not supported');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsDictating(true);
    const initialNoteBody = notesText;

    recognitionRef.current = startVoiceDictation({
      initialText: initialNoteBody,
      onTranscript: (updatedText, isSubmitCommand) => {
        setNotesText(updatedText);
        onUpdateNote(note.id, { notes: updatedText });

        if (isSubmitCommand) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsDictating(false);
        }
      },
      onStatusChange: (msg) => setStatusMessage(msg),
      onEnd: () => setIsDictating(false)
    });
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
              P{note.priority} {PRIORITIES[note.priority]?.label}
            </span>
          )}
        </div>

        {formattedDate && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {formattedDate}
          </span>
        )}
      </div>

      {/* Note Main Text Area (Large Builder Font) */}
      <div style={{ cursor: isEditing ? 'default' : 'pointer' }} onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Note Title..."
              style={{
                fontSize: '18px',
                fontWeight: '700',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #2563eb',
                backgroundColor: 'var(--item-bg, #f9fafb)',
                color: 'var(--text-color, #111827)',
                outline: 'none',
                width: '100%'
              }}
              autoFocus
            />
            <textarea
              ref={noteTextareaRef}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Write note details or dictation..."
              rows={3}
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
            {/* Subtasks Section in Edit Mode */}
            <div style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', background: 'var(--item-bg, #f9fafb)', border: '1px solid var(--border-color, #e5e7eb)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-color, #374151)', marginBottom: '6px' }}>
                📋 Subtasks ({subtasks.length})
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
                          flex: 1,
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={handleSaveEdits}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Done
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
              {note.text}
            </h3>

            {note.notes ? (
              <p
                ref={noteViewBodyRef}
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
                {note.notes}
              </p>
            ) : (
              <p style={{ fontSize: `${Math.max(notesFontSize - 4, 12)}px`, color: 'var(--text-secondary, #9ca3af)', italic: 'true', margin: 0 }}>
                Tap to add details or record voice...
              </p>
            )}

            {/* Subtasks in View Mode */}
            {subtasks.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-color, #e5e7eb)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary, #6b7280)', marginBottom: '4px' }}>
                  📋 Steps ({subtasks.filter(s => s.completed).length}/{subtasks.length}):
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
                          flex: 1,
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
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dictation Status Bar if Active */}
      {(isDictating || statusMessage) && (
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

      {/* Bottom Action Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '8px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color, #f3f4f6)',
        flexWrap: 'wrap'
      }}>
        {/* Append Voice Button */}
        <button
          onClick={handleToggleDictation}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '10px',
            border: `1px solid ${isDictating ? '#ef4444' : 'var(--border-color, #d1d5db)'}`,
            backgroundColor: isDictating ? 'rgba(239, 68, 68, 0.15)' : 'var(--item-bg, #f3f4f6)',
            color: isDictating ? '#ef4444' : 'var(--text-color, #374151)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {isDictating ? <MicOff size={14} /> : <Mic size={14} color="#2563eb" />}
          <span>{isDictating ? 'Stop Voice' : '+ Voice'}</span>
        </button>

        {/* Action Group: Make Task & Complete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Turn into Task Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPriorityPicker(!showPriorityPicker)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
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
              <ArrowUpRight size={14} />
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
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PRIORITIES[p].color }} />
                    <span>P{p} ({PRIORITIES[p].label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Complete Button */}
          <button
            onClick={() => onCompleteNote(note.id)}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Complete / Archive Note"
          >
            <CheckCircle size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
