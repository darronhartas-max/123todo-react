import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Folder, Search, Settings
} from 'lucide-react';
import NoteCard from './NoteCard';
import SearchBar from '../tasks/SearchBar';
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
  onSearchChange,
  onOpenSettings,
  notesFontSize = 18
}) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [newNotes, setNewNotes] = useState('');
  const [targetProjectId, setTargetProjectId] = useState(activeProjectFilter === 'all' ? 'general' : activeProjectFilter);
  const [isDictatingQuickAdd, setIsDictatingQuickAdd] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showBatchProjectPicker, setShowBatchProjectPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(Boolean(searchQuery && searchQuery.trim().length > 0));

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
    const list = tasks.filter(task => {
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

    // Sort descending so newly created or updated notes (highest timestamp or ID) appear at the top of the list
    return list.sort((a, b) => {
      const valA = Number(a.createdAt || a.updatedAt || a.id || 0);
      const valB = Number(b.createdAt || b.updatedAt || b.id || 0);
      return valB - valA;
    });
  }, [tasks, activeProjectFilter, searchQuery]);

  const handleCreateNote = (overrideBody) => {
    const rawContent = typeof overrideBody === 'string' ? overrideBody : newNotes;

    if (!rawContent.trim()) return;

    // Treat the note as a Task: add text directly to the Task text field, leaving note body empty for subsequent editing
    onAddNote(rawContent.trim(), '', targetProjectId || 'general');
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
    const initialText = newNotes;

    quickRecognitionRef.current = startVoiceDictation({
      initialText,
      onTranscript: (updatedText, isSubmitCommand) => {
        setNewNotes(updatedText);

        if (isSubmitCommand) {
          handleCreateNote(updatedText);
        }
      },
      onStatusChange: (msg) => setStatusMessage(msg),
      onEnd: () => setIsDictatingQuickAdd(false)
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
      {/* Header Bar: Search Icon, Projects Dropdown, Settings Icon (exact single-row order) */}
      <div className="notes-header-bar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%', paddingBottom: '4px' }}>
        {/* 1. Search Toggle Icon Button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            padding: '7px',
            borderRadius: '10px',
            backgroundColor: showSearch || searchQuery ? 'rgba(37, 99, 235, 0.1)' : 'var(--card-bg, #ffffff)',
            border: '1.5px solid var(--border-color, #d1d5db)',
            color: showSearch || searchQuery ? '#2563eb' : 'var(--text-color, #4b5563)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          title="Search notes"
        >
          <Search size={18} />
        </button>

        {/* 2. Projects Filter Dropdown */}
        <select
          value={activeProjectFilter}
          onChange={(e) => onSelectProjectFilter(e.target.value)}
          style={{
            padding: '7px 10px',
            borderRadius: '10px',
            border: '1.5px solid var(--border-color, #d1d5db)',
            backgroundColor: 'var(--card-bg, #ffffff)',
            color: 'var(--text-color, #111827)',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            outline: 'none',
            flex: 1,
            minWidth: 0,
            width: '100%'
          }}
        >
          <option value="all">All Notes ({tasks.length})</option>
          <option value="general">Unassigned Inbox ({unassignedCount})</option>
          {projects.filter(p => p.id !== 'all' && p.id !== 'general').map(p => {
            const count = tasks.filter(t => t.projectId === p.id).length;
            return (
              <option key={p.id} value={p.id}>{p.name} ({count})</option>
            );
          })}
        </select>

        {/* 3. Settings Cog Icon Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            style={{
              padding: '7px',
              borderRadius: '10px',
              backgroundColor: 'var(--card-bg, #ffffff)',
              border: '1.5px solid var(--border-color, #d1d5db)',
              color: 'var(--text-color, #4b5563)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        )}
      </div>

      {/* Expanding Search Bar (collapses back on X click) */}
      {(showSearch || searchQuery) && (
        <SearchBar
          value={searchQuery || ''}
          onChange={onSearchChange}
          onClear={() => {
            onSearchChange('');
            setShowSearch(false);
          }}
          placeholder="Search notes..."
        />
      )}

      {/* Quick Add Note Card (Single note field) */}
      <div className="quick-add-note-card">
        <textarea
          className="quick-add-body-textarea"
          rows={3}
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="Add New Note (Saved as a Task in your Unified Inbox)"
          style={{ fontSize: `${notesFontSize}px` }}
        />

        {statusMessage && (
          <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>
            {statusMessage}
          </div>
        )}

        <div className="quick-add-footer">
          {/* Target Project Dropdown for Quick Add */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #d1d5db)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-color, #111827)',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none'
              }}
            >
              <option value="general">Unassigned Inbox</option>
              {projects.filter(p => p.id !== 'all' && p.id !== 'general').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Red Tape Recorder 'Talk' / 'Stop' Button */}
            <button
              onClick={toggleQuickAddDictation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1.5px solid #ef4444',
                backgroundColor: isDictatingQuickAdd ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={isDictatingQuickAdd ? "Click to stop voice dictation" : "Click to speak and append to note"}
            >
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: isDictatingQuickAdd ? '2px' : '50%',
                backgroundColor: '#ef4444',
                display: 'inline-block',
                boxShadow: isDictatingQuickAdd ? '0 0 8px #ef4444' : 'none',
                animation: isDictatingQuickAdd ? 'pulse 1.2s infinite' : 'none'
              }} />
              <span>{isDictatingQuickAdd ? 'Stop' : 'Talk'}</span>
            </button>

            <button
              onClick={() => handleCreateNote()}
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span>Save</span>
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
            Tap the red 'Talk' button or header mic button to dictate your notes hands-free! Notes are saved directly into your task list.
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
              notesFontSize={notesFontSize}
            />
          ))}
        </div>
      )}

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
