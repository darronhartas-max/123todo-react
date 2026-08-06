import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Search, X, RotateCcw, Trash2, Calendar, Filter, ArrowUpDown, Check, AlertCircle, Plus, Minus } from 'lucide-react';
import { COMMON_STYLES } from '../../utils/styles';
import { DEFAULT_PROJECTS } from '../../utils/constants';
import { formatDisplayDate } from '../../utils/dateUtils';
import TaskItem from '../tasks/TaskItem';

const ArchiveModal = ({ archived = [], projects = [], onRestore, onDelete, onUpdate, onClose, dateFormat = 'UK' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState('all');
    const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest' | 'priority' | 'name'
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // All available projects including default
    const allProjectsList = useMemo(() => {
        return [...DEFAULT_PROJECTS, ...projects];
    }, [projects]);

    // Filter and Sort Archived Tasks
    const filteredArchivedTasks = useMemo(() => {
        return archived
            .filter(task => {
                // Search filter (task text, notes, subtasks)
                const query = searchQuery.trim().toLowerCase();
                const matchesSearch = !query || 
                    task.text.toLowerCase().includes(query) ||
                    (task.notes && task.notes.toLowerCase().includes(query)) ||
                    (task.subtasks && task.subtasks.some(st => st.text.toLowerCase().includes(query)));

                // Project filter
                const taskProj = (task.projectId || 'general').toLowerCase();
                const matchesProject = selectedProject === 'all' || taskProj === selectedProject.toLowerCase();

                return matchesSearch && matchesProject;
            })
            .sort((a, b) => {
                if (sortBy === 'recent') {
                    // Default: Most recently completed first
                    const timeA = a.completedAt || a.id || 0;
                    const timeB = b.completedAt || b.id || 0;
                    return timeB - timeA;
                } else if (sortBy === 'oldest') {
                    const timeA = a.completedAt || a.id || 0;
                    const timeB = b.completedAt || b.id || 0;
                    return timeA - timeB;
                } else if (sortBy === 'priority') {
                    return (a.priority || 4) - (b.priority || 4);
                } else if (sortBy === 'name') {
                    return a.text.localeCompare(b.text);
                }
                return 0;
            });
    }, [archived, searchQuery, selectedProject, sortBy]);

    const handleClearAll = () => {
        filteredArchivedTasks.forEach(task => onDelete(task.id));
        setConfirmClearAll(false);
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
        },
        modalContainer: {
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            height: '88vh',
            maxHeight: '900px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            position: 'relative'
        },
        header: {
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--header-bg)'
        },
        headerTitleGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        iconCircle: {
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
            color: '#667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        title: {
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: '800',
            letterSpacing: '-0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        badge: {
            background: 'rgba(102, 126, 234, 0.12)',
            color: '#667eea',
            fontSize: '0.85rem',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '12px'
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-text)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        },
        toolbar: {
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        searchBox: {
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
        },
        searchInput: {
            width: '100%',
            padding: '12px 40px 12px 42px',
            fontSize: '1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        },
        controlsRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
        },
        filterGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
        },
        select: {
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            fontSize: '0.88rem',
            fontWeight: '600',
            outline: 'none',
            cursor: 'pointer'
        },
        listArea: {
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        emptyState: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            color: 'var(--muted-text)',
            textAlign: 'center'
        },
        footer: {
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--header-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: 'var(--muted-text)'
        },
        clearBtn: {
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
        }
    };

    return (
        <div style={styles.overlay}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={styles.modalContainer}
            >
                {/* Header Bar */}
                <div style={styles.header}>
                    <div style={styles.headerTitleGroup}>
                        <div style={styles.iconCircle}>
                            <Archive size={22} />
                        </div>
                        <div>
                            <h2 style={styles.title}>
                                Archive Search
                                <span style={styles.badge}>
                                    {filteredArchivedTasks.length} {filteredArchivedTasks.length === 1 ? 'task' : 'tasks'}
                                </span>
                            </h2>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                                View, search, restore, or manage your completed tasks
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={styles.closeBtn}
                        title="Close Archive (Esc)"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Toolbar: Search Input + Filters */}
                <div style={styles.toolbar}>
                    <div style={styles.searchBox}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '14px',
                                color: 'var(--muted-text)',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search archived tasks by title, notes, or steps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted-text)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px'
                                }}
                                title="Clear Search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div style={styles.controlsRow}>
                        <div style={styles.filterGroup}>
                            {/* Project Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Filter size={15} style={{ color: 'var(--muted-text)' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)' }}>Project:</span>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="all">All Projects</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ArrowUpDown size={15} style={{ color: 'var(--muted-text)' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)' }}>Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="recent">Recently Completed First</option>
                                    <option value="oldest">Oldest Completed First</option>
                                    <option value="priority">Priority (P1 → P4)</option>
                                    <option value="name">Alphabetical (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        {archived.length > 0 && filteredArchivedTasks.length > 0 && (
                            <div>
                                {confirmClearAll ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '600' }}>
                                            Delete {filteredArchivedTasks.length} items?
                                        </span>
                                        <button
                                            onClick={handleClearAll}
                                            style={{ ...styles.clearBtn, background: '#ef4444', color: 'white' }}
                                        >
                                            <Check size={14} /> Yes, Delete
                                        </button>
                                        <button
                                            onClick={() => setConfirmClearAll(false)}
                                            style={{ ...styles.clearBtn, color: 'var(--text-color)', background: 'transparent', border: '1px solid var(--border-color)' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmClearAll(true)}
                                        style={styles.clearBtn}
                                        title="Delete filtered tasks permanently"
                                    >
                                        <Trash2 size={14} /> Clear {searchQuery || selectedProject !== 'all' ? 'Filtered' : 'Archive'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Scrollable Task List */}
                <div style={styles.listArea}>
                    {filteredArchivedTasks.length === 0 ? (
                        <div style={styles.emptyState}>
                            <Archive size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700' }}>
                                {searchQuery || selectedProject !== 'all' ? 'No Matching Archived Tasks' : 'Archive is Empty'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.95rem', maxWidth: '360px', lineHeight: '1.4' }}>
                                {searchQuery || selectedProject !== 'all'
                                    ? 'Try adjusting your search terms or project filter.'
                                    : 'Completed tasks will automatically appear here for easy reference and retrieval.'}
                            </p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            <AnimatePresence mode="popLayout">
                                {filteredArchivedTasks.map(task => {
                                    const project = allProjectsList.find(p => 
                                        p.id.toLowerCase() === task.projectId?.toLowerCase() || 
                                        p.name.toLowerCase() === task.projectId?.toLowerCase()
                                    );

                                    // Format completion timestamp
                                    const completedDateStr = task.completedAt 
                                        ? formatDisplayDate(new Date(task.completedAt).toISOString().split('T')[0], dateFormat)
                                        : null;

                                    return (
                                        <div key={task.id} style={{ marginBottom: '8px' }}>
                                            {completedDateStr && (
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    color: 'var(--muted-text)',
                                                    marginBottom: '2px',
                                                    marginLeft: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Calendar size={12} />
                                                    Completed {completedDateStr}
                                                </div>
                                            )}
                                            <TaskItem
                                                task={task}
                                                projectColor={project?.color}
                                                isArchived={true}
                                                onRestore={onRestore}
                                                onDelete={onDelete}
                                                onUpdate={onUpdate}
                                                showFullDetails={true}
                                                dateFormat={dateFormat}
                                            />
                                        </div>
                                    );
                                })}
                            </AnimatePresence>
                        </ul>
                    )}
                </div>

                {/* Footer Stats Bar */}
                <div style={styles.footer}>
                    <div>
                        Showing <strong>{filteredArchivedTasks.length}</strong> of <strong>{archived.length}</strong> total archived items
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                        Press <kbd style={{ background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>Esc</kbd> to close
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ArchiveModal;
