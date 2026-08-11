import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, CheckCircle, Trash2, Mic, MicOff, ChevronDown, 
  ArrowUpRight, Check, Clock
} from 'lucide-react';
import { PRIORITIES } from '../../utils/constants';
import { isSpeechRecognitionSupported, startVoiceDictation, processVoiceCommands } from '../../utils/voiceUtils';

const NoteCard = ({
  note,
  projects = [],
  onUpdateNote,
  onConvertNoteToTask,
  onCompleteNote,
  onDeleteNote,
  onAssignProject,
  isSelected,
  onToggleSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(note.text || '');
  const [notesText, setNotesText] = useState(note.notes || '');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    setTitleText(note.text || '');
    setNotesText(note.notes || '');
  }, [note.text, note.notes]);

  const currentProject = projects.find(p => p.id === note.projectId) || { id: 'general', name: 'Unassigned Inbox', color: '#6b7280' };

  const handleSaveEdits = () => {
    setIsEditing(false);
    if (titleText.trim() !== note.text || notesText.trim() !== note.notes) {
      onUpdateNote(note.id, {
        text: titleText.trim() || 'Untitled Note',
        notes: notesText.trim()
      });
    }
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
      onTranscript: (updatedText, isFinalChunk) => {
        const { text: processedText, isSubmitCommand } = processVoiceCommands(updatedText);
        setNotesText(processedText);
        onUpdateNote(note.id, { notes: processedText });

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
      {/* Top Header Row: Project Badge & Timestamp & Selection Checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleSelect && (
            <input 
              type="checkbox" 
              checked={isSelected || false}
              onChange={() => onToggleSelect(note.id)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
            />
          )}

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
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
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
              fontSize: '18px', 
              fontWeight: '700', 
              color: 'var(--text-color, #111827)', 
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}>
              {note.text}
            </h3>

            {note.notes ? (
              <p style={{ 
                fontSize: '16px', 
                color: 'var(--text-color, #374151)', 
                margin: 0, 
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {note.notes}
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary, #9ca3af)', italic: 'true', margin: 0 }}>
                Tap to add details or record voice...
              </p>
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
          <span>{statusMessage || 'Listening... Dictate text to append'}</span>
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
              <span>Make Task</span>
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

          {/* Delete Button */}
          <button
            onClick={() => onDeleteNote(note.id)}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete Note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
