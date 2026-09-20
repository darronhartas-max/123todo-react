import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Folder, Search, X, Check, PlusCircle, MinusCircle, ChevronDown
} from 'lucide-react';
import NoteCard from './NoteCard';
import PhotoAttachments from './PhotoAttachments';
import SearchBar from '../tasks/SearchBar';
import './NotesView.css';
import { isSpeechRecognitionSupported, startVoiceDictation } from '../../utils/voiceUtils';
import { ActionableEntitiesBar } from '../../utils/textUtils';
import { DEFAULT_PROJECTS } from '../../utils/constants';

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
  activeProjectFilter = 'all',
  onSelectProjectFilter,
  searchQuery = '',
  onSearchChange,
  notesFontSize = 18,
  notesAutosaveDelay = '60s',
  viewProfile = 'lite'
}) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [newNotes, setNewNotes] = useState('');
  const [newPhotos, setNewPhotos] = useState([]);
  const [targetProjectId, setTargetProjectId] = useState(activeProjectFilter === 'all' ? 'general' : activeProjectFilter);
  const [isDictatingQuickAdd, setIsDictatingQuickAdd] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showBatchProjectPicker, setShowBatchProjectPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(Boolean(searchQuery && searchQuery.trim().length > 0));

  const quickRecognitionRef = useRef(null);
  const quickAddTextareaRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

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

  // Auto-expand textarea height & keep the latest spoken/typed lines visible in viewport at all times
  useEffect(() => {
    if (quickAddTextareaRef.current) {
      const el = quickAddTextareaRef.current;
      el.style.height = 'auto';
      const targetHeight = Math.max(el.scrollHeight, 80);
      el.style.height = `${targetHeight}px`;
      el.scrollTop = el.scrollHeight;

      if (isDictatingQuickAdd) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
      }
    }
  }, [newNotes, isDictatingQuickAdd]);

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

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (quickRecognitionRef.current) {
        try { quickRecognitionRef.current.stop(); } catch (e) {}
        quickRecognitionRef.current = null;
      }
    };
  }, []);

  // Restore uncommitted draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('123Todo_Draft_Note');
      const savedPhotos = localStorage.getItem('123Todo_Draft_Photos');
      if (savedDraft) setNewNotes(savedDraft);
      if (savedPhotos) setNewPhotos(JSON.parse(savedPhotos));
    } catch (e) {}
  }, []);

  // Sync draft to localStorage in real-time
  useEffect(() => {
    try {
      if (newNotes.trim() || newPhotos.length > 0) {
        localStorage.setItem('123Todo_Draft_Note', newNotes);
        localStorage.setItem('123Todo_Draft_Photos', JSON.stringify(newPhotos));
      } else {
        localStorage.removeItem('123Todo_Draft_Note');
        localStorage.removeItem('123Todo_Draft_Photos');
      }
    } catch (e) {}
  }, [newNotes, newPhotos]);

  const handleCreateNote = useCallback((overrideBody, overridePhotos) => {
    const rawContent = typeof overrideBody === 'string' ? overrideBody : newNotes;
    const photosToSave = overridePhotos || newPhotos;

    if (!rawContent.trim() && (!photosToSave || photosToSave.length === 0)) return;

    // Unconditionally stop voice dictation if running
    if (quickRecognitionRef.current) {
      try { quickRecognitionRef.current.stop(); } catch (e) {}
      quickRecognitionRef.current = null;
    }
    setIsDictatingQuickAdd(false);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const title = rawContent.trim() || (photosToSave && photosToSave.length > 0 ? `Photo Note (${photosToSave.length})` : 'Untitled Note');

    onAddNote(title, '', targetProjectId || 'general', { photos: photosToSave });
    setNewNotes('');
    setNewPhotos([]);
    setShowAddNote(false);

    try {
      localStorage.removeItem('123Todo_Draft_Note');
      localStorage.removeItem('123Todo_Draft_Photos');
    } catch (e) {}

    setStatusMessage('✓ Note saved');
    setTimeout(() => setStatusMessage(''), 2500);
  }, [newNotes, newPhotos, targetProjectId, onAddNote]);

  // Auto-save: automatically saves note after configured idle period so taking notes, inspecting jobs, or walking away never loses data
  useEffect(() => {
    if (autosaveDelayMs === 0) return;

    if ((newNotes.trim().length > 0 || newPhotos.length > 0) && !isDictatingQuickAdd) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleCreateNote();
      }, autosaveDelayMs);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [newNotes, newPhotos, isDictatingQuickAdd, autosaveDelayMs, handleCreateNote]);

  // Also auto-save on visibility change (switching apps or locking phone on site)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (newNotes.trim() || newPhotos.length > 0) {
          handleCreateNote();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [newNotes, newPhotos, handleCreateNote]);

  // Toggle Dictation for Quick Add Card
  const toggleQuickAddDictation = () => {
    if (isDictatingQuickAdd) {
      if (quickRecognitionRef.current) {
        try { quickRecognitionRef.current.stop(); } catch (e) {}
        quickRecognitionRef.current = null;
      }
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
        if (isSubmitCommand) {
          if (quickRecognitionRef.current) {
            try { quickRecognitionRef.current.stop(); } catch (e) {}
            quickRecognitionRef.current = null;
          }
          setIsDictatingQuickAdd(false);
          handleCreateNote(updatedText);
        } else {
          setNewNotes(updatedText);
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

  const allProjects = useMemo(() => {
    return [
      DEFAULT_PROJECTS.find(p => p.id === 'all') || { id: 'all', name: 'All Notes', color: '#6b7280' },
      { id: 'general', name: 'Unassigned Inbox', color: '#6b7280' },
      ...projects.filter(p => p.id !== 'all' && p.id !== 'general')
    ];
  }, [projects]);

  const activeProject = useMemo(() => {
    return allProjects.find(p => p.id === activeProjectFilter) || allProjects[0];
  }, [allProjects, activeProjectFilter]);

  const activeColor = activeProject?.color || '#6b7280';

  const getProjectNoteCount = useCallback((projectId) => {
    if (!tasks || tasks.length === 0) return 0;
    if (projectId === 'all') {
      return tasks.length;
    }
    return tasks.filter(t => (t.projectId || 'general').toLowerCase() === projectId.toLowerCase()).length;
  }, [tasks]);

  const activeCount = getProjectNoteCount(activeProject?.id);

  const getProjectLabelLength = useCallback((p) => {
    const count = getProjectNoteCount(p.id);
    return (p?.name || '').length + String(count).length + 4;
  }, [getProjectNoteCount]);

  const maxProjectNameLength = Math.max(...allProjects.map(getProjectLabelLength), 10);
  const dropdownMinWidth = Math.min(Math.max(maxProjectNameLength * 9 + 48, 140), 320);

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [hoveredProjectOptionId, setHoveredProjectOptionId] = useState(null);

  return (
    <div className="notes-container">
      {/* Header Bar: Search Icon, Projects Dropdown, Add Note Icon (clean single-row order) */}
      <div className="notes-header-bar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', width: '100%', paddingBottom: '4px' }}>
        {/* 1. Search Toggle Icon Button (identical circular style as Task mode) */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: showSearch || searchQuery ? 'var(--accent-bg, rgba(37, 99, 235, 0.1))' : 'var(--bg-color, #ffffff)',
            border: `1.5px solid ${showSearch || searchQuery ? 'var(--accent-color, #2563eb)' : 'var(--border-color, #d1d5db)'}`,
            color: showSearch || searchQuery ? 'var(--accent-color, #2563eb)' : 'var(--muted-text, #4b5563)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          title={showSearch ? "Hide Search" : "Show Search"}
        >
          {showSearch ? <X size={16} /> : <Search size={16} />}
        </button>

        {/* 2. Projects Filter Dropdown (matching Task mode styling with brand colors) */}
        <div style={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          flex: '0 1 auto',
          minWidth: 0,
          maxWidth: `${dropdownMinWidth}px`
        }}>
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1.5px solid ${activeColor}`,
              background: 'var(--item-bg, #ffffff)',
              color: activeColor,
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              outline: 'none',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: '1.25',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ 
              flex: '1 1 auto',
              minWidth: 0,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.25'
            }}>
              {activeProject?.name === 'All' ? 'All Notes' : activeProject?.name} ({activeCount})
            </span>
            <ChevronDown size={16} style={{ color: activeColor, flexShrink: 0, marginLeft: '4px' }} />
          </button>
          {isProjectDropdownOpen && (
            <>
              <div 
                onClick={() => setIsProjectDropdownOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99,
                  background: 'transparent'
                }}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                minWidth: '100%',
                maxWidth: 'min(320px, calc(100vw - 32px))',
                width: 'max-content',
                background: 'var(--surface-color, #ffffff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '6px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                zIndex: 100,
                maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
                padding: '4px 0',
                boxSizing: 'border-box'
              }}>
                {allProjects.map(p => {
                  const count = getProjectNoteCount(p.id);
                  const isSelected = p.id === activeProjectFilter;
                  const displayName = p.name === 'All' ? 'All Notes' : p.name;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProjectFilter(p.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      onMouseEnter={() => setHoveredProjectOptionId(p.id)}
                      onMouseLeave={() => setHoveredProjectOptionId(null)}
                      style={{
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: isSelected ? p.color : 'var(--text-color, #374151)',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        background: isSelected
                          ? `${p.color}15`
                          : (hoveredProjectOptionId === p.id ? 'var(--bg-color, rgba(0,0,0,0.04))' : 'transparent')
                      }}
                    >
                      <div style={{
                        width: '4px',
                        height: '14px',
                        borderRadius: '2px',
                        backgroundColor: p.color,
                        flexShrink: 0
                      }} />
                      <span style={{ flex: 1, minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{displayName}</span>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: isSelected ? `${p.color}25` : 'var(--bg-color, #f3f4f6)',
                        color: isSelected ? p.color : 'var(--muted-text, #6b7280)',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        marginLeft: '8px',
                        flexShrink: 0
                      }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 3. Add Note + / - toggle button */}
        <button
          type="button"
          onClick={() => setShowAddNote(!showAddNote)}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            padding: 0,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.2s ease'
          }}
          aria-label={showAddNote ? "Close add note" : "Add new note"}
          title={showAddNote ? "Close add note form" : "Add new note"}
        >
          {showAddNote ? <MinusCircle size={28} /> : <PlusCircle size={28} />}
        </button>
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

      {/* Quick Add Note Card */}
      {showAddNote && (
        <div className="quick-add-note-card">
          {/* Prominent Top Action Toolbar: Project Selector on Left, Talk + Large Save Note Button on Right */}
          <div className="quick-add-top-bar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border-color, #e5e7eb)'
        }}>
          {/* Target Project Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Folder size={16} color="#6b7280" style={{ flexShrink: 0 }} />
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              aria-label="Target Project"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #d1d5db)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-color, #111827)',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                maxWidth: '200px'
              }}
            >
              <option value="general">Unassigned Inbox</option>
              {projects.filter(p => p.id !== 'all' && p.id !== 'general').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Primary Quick-Action Buttons at Top: Save on Left, Talk at Top Right with reasonable space */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => {
                setShowAddNote(false);
                setNewNotes('');
                setNewPhotos([]);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #d1d5db)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary, #6b7280)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
                minHeight: '42px',
                boxSizing: 'border-box'
              }}
              title="Cancel"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>

            {/* Large Prominent Save Button to the left of Talk */}
            <button
              type="button"
              onClick={() => handleCreateNote()}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.15s ease',
                minHeight: '42px',
                boxSizing: 'border-box'
              }}
              title="Save Note / Task (Cmd+Enter)"
            >
              <Check size={18} strokeWidth={2.6} />
              <span>Save</span>
            </button>

            {/* Red Tape Recorder 'Talk' / 'Stop' Button at top right */}
            <button
              type="button"
              onClick={toggleQuickAddDictation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1.5px solid #ef4444',
                backgroundColor: isDictatingQuickAdd ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '42px',
                boxSizing: 'border-box'
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
          </div>
        </div>

        {/* Textarea for note text */}
        <textarea
          ref={quickAddTextareaRef}
          className="quick-add-body-textarea"
          rows={3}
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleCreateNote();
            }
          }}
          placeholder="Add New Note..."
          style={{ fontSize: `${notesFontSize}px` }}
        />

        {newNotes && <ActionableEntitiesBar text={newNotes} />}

        {/* Photos at the Note Taking Stage */}
        <div style={{ marginTop: '6px' }}>
          <PhotoAttachments
            photos={newPhotos}
            onChange={setNewPhotos}
            readOnly={false}
          />
        </div>

        {statusMessage && (
          <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Subtle helper footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-secondary, #9ca3af)',
          paddingTop: '6px',
          borderTop: '1px dashed var(--border-color, #f3f4f6)',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span>💡 {notesAutosaveDelay !== 'off' ? `Auto-saves after ${notesAutosaveDelay === '30s' ? '30s' : notesAutosaveDelay === '60s' ? '1 min' : notesAutosaveDelay === '120s' ? '2 mins' : '5 mins'} idle • ` : ''}Say <em>"add note"</em> or press <strong>Cmd+Enter</strong> to save</span>
          {(newNotes.trim() || newPhotos.length > 0) && (
            <button
              type="button"
              onClick={() => handleCreateNote()}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              ✓ Save Now
            </button>
          )}
        </div>
      </div>
      )}

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
              notesAutosaveDelay={notesAutosaveDelay}
              viewProfile={viewProfile}
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
