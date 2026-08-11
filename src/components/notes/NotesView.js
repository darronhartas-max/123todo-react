import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, MicOff, Plus, Folder, Search, Inbox
} from 'lucide-react';
import NoteCard from './NoteCard';
import './NotesView.css';
import { isSpeechRecognitionSupported, startVoiceDictation, processVoiceCommands } from '../../utils/voiceUtils';

const NotesView = ({
  tasks = [],
  projects = [],
  onAddNote,
  onUpdateTask,
  onConvertNoteToTask,
  onCompleteTask,
  onDeleteTask,
  onAssignProject,
  onBulkAssignProject,
  activeProjectFilter,
  onSelectProjectFilter,
  searchQuery,
  onSearchChange
}) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [targetProjectId, setTargetProjectId] = useState(activeProjectFilter === 'all' ? 'general' : activeProjectFilter);
  const [isDictatingQuickAdd, setIsDictatingQuickAdd] = useState(false);
  const [isDictatingFloating, setIsDictatingFloating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showBatchProjectPicker, setShowBatchProjectPicker] = useState(false);

  const floatingRecognitionRef = useRef(null);
  const quickRecognitionRef = useRef(null);

  // Sync target project ID with active project filter when user changes filter tab
  useEffect(() => {
    if (activeProjectFilter && activeProjectFilter !== 'all') {
      setTargetProjectId(activeProjectFilter);
    } else {
      setTargetProjectId('general');
    }
  }, [activeProjectFilter]);

  // Filter tasks to show all items (since every task can act as a note or has notes)
  const filteredNotes = useMemo(() => {
    return tasks.filter(task => {
      // Filter by project
      if (activeProjectFilter && activeProjectFilter !== 'all') {
        if (task.projectId !== activeProjectFilter) return false;
      }
      // Filter by search query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = (task.text || '').toLowerCase().includes(query);
        const notesMatch = (task.notes || '').toLowerCase().includes(query);
        if (!textMatch && !notesMatch) return false;
      }
      return true;
    });
  }, [tasks, activeProjectFilter, searchQuery]);

  const handleCreateNote = (overrideTitle, overrideBody) => {
    const titleToUse = typeof overrideTitle === 'string' ? overrideTitle : newTitle;
    const bodyToUse = typeof overrideBody === 'string' ? overrideBody : newNotes;

    if (!titleToUse.trim() && !bodyToUse.trim()) return;

    onAddNote(titleToUse, bodyToUse, targetProjectId || 'general');
    setNewTitle('');
    setNewNotes('');
    if (isDictatingQuickAdd) {
      if (quickRecognitionRef.current) quickRecognitionRef.current.stop();
      setIsDictatingQuickAdd(false);
    }
  };

  // Toggle Dictation for Quick Add Card
  const toggleQuickAddDictation = () => {
    if (isDictatingQuickAdd) {
      if (quickRecognitionRef.current) quickRecognitionRef.current.stop();
      setIsDictatingQuickAdd(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Voice input is not supported');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsDictatingQuickAdd(true);
    const initialText = newNotes || newTitle;

    quickRecognitionRef.current = startVoiceDictation({
      initialText,
      onTranscript: (updatedText, isFinalChunk) => {
        const { text: processedText, isSubmitCommand } = processVoiceCommands(updatedText);
        
        if (!newTitle && processedText) {
          const lines = processedText.split('\n');
          const firstLine = lines[0].trim();
          if (firstLine.length <= 60) {
            setNewTitle(firstLine);
            setNewNotes(lines.slice(1).join('\n').trim());
          } else {
            setNewNotes(processedText);
          }
        } else {
          setNewNotes(processedText);
        }

        if (isSubmitCommand) {
          handleCreateNote(undefined, processedText);
        }
      },
      onStatusChange: (msg) => setStatusMessage(msg),
      onEnd: () => setIsDictatingQuickAdd(false)
    });
  };

  // Toggle Dictation for Floating Mic Button (Builder Hands-free Mode)
  const toggleFloatingDictation = () => {
    if (isDictatingFloating) {
      if (floatingRecognitionRef.current) floatingRecognitionRef.current.stop();
      setIsDictatingFloating(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Voice input is not supported');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsDictatingFloating(true);
    let capturedTranscript = '';

    floatingRecognitionRef.current = startVoiceDictation({
      initialText: '',
      onTranscript: (updatedText, isFinalChunk) => {
        const { text: processedText, isSubmitCommand } = processVoiceCommands(updatedText);
        capturedTranscript = processedText;

        if (isSubmitCommand && capturedTranscript.trim()) {
          onAddNote('', capturedTranscript, targetProjectId || 'general');
          capturedTranscript = '';
          setStatusMessage('🎙️ Note saved! Continue speaking for next note...');
          setTimeout(() => setStatusMessage(''), 2500);
        }
      },
      onStatusChange: (msg) => setStatusMessage(msg),
      onEnd: () => {
        if (capturedTranscript.trim()) {
          onAddNote('', capturedTranscript, targetProjectId || 'general');
        }
        setIsDictatingFloating(false);
      }
    });
  };

  const handleToggleSelectNote = (id) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = (projId) => {
    if (onBulkAssignProject && selectedNoteIds.length > 0) {
      onBulkAssignProject(selectedNoteIds, projId);
      setSelectedNoteIds([]);
      setShowBatchProjectPicker(false);
    }
  };

  const unassignedCount = useMemo(() => {
    return tasks.filter(t => t.projectId === 'general').length;
  }, [tasks]);

  return (
    <div className="notes-container">
      {/* Header Bar */}
      <div className="notes-header-bar">
        <div className="notes-title-row">
          <h1 className="notes-main-title">
            <span>🎙️ Simple Voice Notes</span>
          </h1>

          {/* Search bar input inside header */}
          <div style={{ position: 'relative', maxWidth: '240px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes..."
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '20px',
                border: '1px solid var(--border-color, #e5e7eb)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-color, #1f2937)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Project Filter Pills */}
        <div className="notes-filter-pills">
          <button
            className={`notes-filter-pill ${activeProjectFilter === 'all' ? 'active' : ''}`}
            onClick={() => onSelectProjectFilter('all')}
          >
            All Notes ({tasks.length})
          </button>

          <button
            className={`notes-filter-pill ${activeProjectFilter === 'general' ? 'active' : ''}`}
            onClick={() => onSelectProjectFilter('general')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Inbox size={14} />
            <span>Unassigned Inbox ({unassignedCount})</span>
          </button>

          {projects.filter(p => p.id !== 'all' && p.id !== 'general').map(p => {
            const count = tasks.filter(t => t.projectId === p.id).length;
            return (
              <button
                key={p.id}
                className={`notes-filter-pill ${activeProjectFilter === p.id ? 'active' : ''}`}
                onClick={() => onSelectProjectFilter(p.id)}
                style={{
                  borderColor: activeProjectFilter === p.id ? p.color : undefined,
                  backgroundColor: activeProjectFilter === p.id ? p.color : undefined
                }}
              >
                {p.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Note Card (Large builder text area) */}
      <div className="quick-add-note-card">
        <input
          type="text"
          className="quick-add-title-input"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Note Title or Subject (optional)..."
        />

        <textarea
          className="quick-add-body-textarea"
          rows={3}
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="Dictate or type your note details (e.g. wall measurements, site materials needed)..."
        />

        {statusMessage && (
          <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>
            {statusMessage}
          </div>
        )}

        <div className="quick-add-footer">
          {/* Target Project Dropdown for Quick Add */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary, #6b7280)' }}>
              Target Project:
            </span>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #d1d5db)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-color, #111827)',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <option value="general">Unassigned Inbox</option>
              {projects.filter(p => p.id !== 'all' && p.id !== 'general').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleQuickAddDictation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: `1px solid ${isDictatingQuickAdd ? '#ef4444' : '#2563eb'}`,
                backgroundColor: isDictatingQuickAdd ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                color: isDictatingQuickAdd ? '#ef4444' : '#2563eb',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {isDictatingQuickAdd ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isDictatingQuickAdd ? 'Stop Voice' : 'Voice Dictate'}</span>
            </button>

            <button
              onClick={() => handleCreateNote()}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Stream Grid */}
      {filteredNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '18px',
          border: '1px dashed var(--border-color, #d1d5db)',
          color: 'var(--text-secondary, #6b7280)'
        }}>
          <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>No notes found</p>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Tap the giant blue mic button at the bottom right to dictate your first note hands-free!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              projects={projects}
              onUpdateNote={(id, updates) => onUpdateTask(id, updates)}
              onConvertNoteToTask={(id, p) => onConvertNoteToTask(id, p)}
              onCompleteNote={(id) => onCompleteTask(id)}
              onDeleteNote={(id) => onDeleteTask(id)}
              onAssignProject={(id, projId) => onAssignProject(id, projId)}
              isSelected={selectedNoteIds.includes(note.id)}
              onToggleSelect={handleToggleSelectNote}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button (Giant Builder Voice Mic) */}
      <button
        className={`big-mic-fab ${isDictatingFloating ? 'recording' : ''}`}
        onClick={toggleFloatingDictation}
        title={isDictatingFloating ? "Stop Voice Dictation" : "Tap to speak hands-free notes"}
      >
        {isDictatingFloating ? <MicOff size={28} /> : <Mic size={28} />}
      </button>

      {/* Batch Selection Action Bar */}
      {selectedNoteIds.length > 0 && (
        <div className="batch-action-bar">
          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-color, #111827)' }}>
            {selectedNoteIds.length} notes selected
          </span>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowBatchProjectPicker(!showBatchProjectPicker)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Folder size={14} />
              <span>Assign to Project</span>
            </button>

            {showBatchProjectPicker && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '8px',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                padding: '6px',
                minWidth: '180px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  onClick={() => handleBulkAssign('general')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Unassigned Inbox
                </button>
                {projects.filter(p => p.id !== 'all' && p.id !== 'general').map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleBulkAssign(p.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedNoteIds([])}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #d1d5db)',
              backgroundColor: 'transparent',
              color: 'var(--text-color, #4b5563)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesView;
