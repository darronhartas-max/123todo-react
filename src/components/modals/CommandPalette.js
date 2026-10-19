import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Settings,
    Archive,
    Cloud,
    Trophy,
    Download,
    Upload,
    Moon,
    Sun,
    Layers,
    Folder,
    CheckSquare,
    ListTodo,
    NotebookPen,
    Mic,
    X,
    ArrowRight
} from 'lucide-react';

const CommandPalette = ({
    isOpen,
    onClose,
    projects = [],
    currentProjectId = 'all',
    onSelectProject,
    onAddTask,
    onAddNote,
    onOpenSearch,
    onOpenSettings,
    onOpenArchive,
    onOpenSync,
    onOpenAchievements,
    onOpenExport,
    onOpenImport,
    isDark = false,
    onToggleTheme,
    appMode = 'tasks',
    onSwitchMode,
    viewProfile = 'pro',
    onToggleViewProfile,
    tasks = [],
    onSelectTask
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Reset query and selection index on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Build standard commands list
    const baseCommands = useMemo(() => {
        const cmds = [
            {
                id: 'add-task',
                section: 'Actions',
                label: 'Create New Task',
                icon: <Plus size={16} color="var(--accent-color)" />,
                shortcut: 'A',
                action: () => { onClose(); onAddTask?.(); }
            },
            {
                id: 'add-note',
                section: 'Actions',
                label: 'Capture Voice Note',
                icon: <Mic size={16} color="#10b981" />,
                action: () => { onClose(); onAddNote?.(); }
            },
            {
                id: 'search-tasks',
                section: 'Actions',
                label: 'Search Tasks & Notes',
                icon: <Search size={16} color="#6366f1" />,
                shortcut: '/',
                action: () => { onClose(); onOpenSearch?.(); }
            },
            {
                id: 'sync-cloud',
                section: 'Actions',
                label: 'Sync Data (Cloudflare / Google Drive)',
                icon: <Cloud size={16} color="#0284c7" />,
                action: () => { onClose(); onOpenSync?.(); }
            },
            {
                id: 'view-archive',
                section: 'Navigation',
                label: 'Open Task Archive',
                icon: <Archive size={16} color="#f59e0b" />,
                action: () => { onClose(); onOpenArchive?.(); }
            },
            {
                id: 'view-achievements',
                section: 'Navigation',
                label: 'View Productivity & Milestones',
                icon: <Trophy size={16} color="#eab308" />,
                action: () => { onClose(); onOpenAchievements?.(); }
            },
            {
                id: 'open-settings',
                section: 'Navigation',
                label: 'Open App Settings',
                icon: <Settings size={16} color="#6b7280" />,
                shortcut: 'S',
                action: () => { onClose(); onOpenSettings?.(); }
            },
            {
                id: 'switch-mode',
                section: 'Mode & Layout',
                label: appMode === 'tasks' ? 'Switch to Voice Notes Mode' : 'Switch to Tasks Mode',
                icon: appMode === 'tasks' ? <NotebookPen size={16} /> : <ListTodo size={16} />,
                action: () => { onClose(); onSwitchMode?.(appMode === 'tasks' ? 'notes' : 'tasks'); }
            },
            {
                id: 'toggle-theme',
                section: 'Mode & Layout',
                label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                icon: isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />,
                action: () => { onClose(); onToggleTheme?.(); }
            },
            {
                id: 'toggle-view-profile',
                section: 'Mode & Layout',
                label: viewProfile === 'pro' ? 'Switch to Lite View' : 'Switch to Pro View',
                icon: <Layers size={16} />,
                action: () => { onClose(); onToggleViewProfile?.(); }
            },
            {
                id: 'export-data',
                section: 'Data & Backup',
                label: 'Export Backup & Photos ZIP',
                icon: <Download size={16} />,
                action: () => { onClose(); onOpenExport?.(); }
            },
            {
                id: 'import-data',
                section: 'Data & Backup',
                label: 'Import from Competitor / JSON',
                icon: <Upload size={16} />,
                action: () => { onClose(); onOpenImport?.(); }
            }
        ];

        // Add Project Jump commands
        if (projects && projects.length > 0) {
            projects.forEach(p => {
                cmds.push({
                    id: `project-${p.id}`,
                    section: 'Jump to Project',
                    label: `View #${p.name}`,
                    icon: <Folder size={16} color={p.color || 'var(--accent-color)'} />,
                    action: () => { onClose(); onSelectProject?.(p.id); }
                });
            });
            if (currentProjectId !== 'all') {
                cmds.push({
                    id: 'project-all',
                    section: 'Jump to Project',
                    label: 'View All Projects',
                    icon: <Folder size={16} color="#6b7280" />,
                    action: () => { onClose(); onSelectProject?.('all'); }
                });
            }
        }

        return cmds;
    }, [
        appMode,
        isDark,
        viewProfile,
        projects,
        currentProjectId,
        onClose,
        onAddTask,
        onAddNote,
        onOpenSearch,
        onOpenSync,
        onOpenArchive,
        onOpenAchievements,
        onOpenSettings,
        onSwitchMode,
        onToggleTheme,
        onToggleViewProfile,
        onOpenExport,
        onOpenImport,
        onSelectProject
    ]);

    // Live search results combining commands and matching tasks
    const filteredItems = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        if (!q) {
            return baseCommands;
        }

        const matchedCmds = baseCommands.filter(c =>
            c.label.toLowerCase().includes(q) ||
            c.section.toLowerCase().includes(q)
        );

        const matchedTasks = tasks
            .filter(t => {
                const textMatch = (t.text || '').toLowerCase().includes(q);
                const notesMatch = (t.notes || '').toLowerCase().includes(q);
                return textMatch || notesMatch;
            })
            .slice(0, 8)
            .map(t => ({
                id: `task-${t.id}`,
                section: 'Matching Tasks',
                label: t.text || 'Untitled Task',
                subtitle: t.notes ? t.notes.slice(0, 40) : undefined,
                icon: <CheckSquare size={16} color="var(--accent-color)" />,
                action: () => {
                    onClose();
                    onSelectTask?.(t);
                }
            }));

        return [...matchedCmds, ...matchedTasks];
    }, [query, baseCommands, tasks, onClose, onSelectTask]);

    // Ensure selectedIndex stays in bounds
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredItems.length]);

    // Keyboard navigation (ArrowUp, ArrowDown, Enter, Esc)
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + Math.max(1, filteredItems.length)) % Math.max(1, filteredItems.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                filteredItems[selectedIndex].action();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                data-testid="command-palette-backdrop"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: 'clamp(40px, 12vh, 120px)',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    boxSizing: 'border-box'
                }}
            >
                <motion.div
                    data-testid="command-palette-modal"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.96, y: -16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -16 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                        width: '100%',
                        maxWidth: '560px',
                        background: 'var(--surface-color, #ffffff)',
                        color: 'var(--text-color, #111827)',
                        borderRadius: '14px',
                        border: '1.5px solid var(--border-color, rgba(0,0,0,0.12))',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'min(75vh, 520px)'
                    }}
                >
                    {/* Search Input Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border-color, rgba(0,0,0,0.1))',
                        background: 'var(--header-bg, transparent)'
                    }}>
                        <Search size={18} color="var(--accent-color, #2563eb)" />
                        <input
                            ref={inputRef}
                            type="text"
                            data-testid="command-palette-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a command or search tasks..."
                            style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '1.05rem',
                                color: 'var(--text-color, #111827)',
                                outline: 'none',
                                fontWeight: '500'
                            }}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--muted-text, #9ca3af)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex'
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                        <kbd style={{
                            padding: '2px 6px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            borderRadius: '4px',
                            background: 'var(--item-bg, rgba(0,0,0,0.06))',
                            color: 'var(--muted-text, #6b7280)',
                            border: '1px solid var(--border-color, rgba(0,0,0,0.1))'
                        }}>
                            ESC
                        </kbd>
                    </div>

                    {/* Results List */}
                    <div
                        ref={listRef}
                        style={{
                            overflowY: 'auto',
                            padding: '8px',
                            flex: '1 1 auto'
                        }}
                    >
                        {filteredItems.length === 0 ? (
                            <div style={{
                                padding: '32px 16px',
                                textAlign: 'center',
                                color: 'var(--muted-text, #6b7280)',
                                fontSize: '0.92rem'
                            }}>
                                No matching commands or tasks found for "{query}"
                            </div>
                        ) : (
                            filteredItems.map((item, index) => {
                                const isSelected = index === selectedIndex;
                                const isFirstInSection = index === 0 || filteredItems[index - 1].section !== item.section;

                                return (
                                    <React.Fragment key={item.id}>
                                        {isFirstInSection && (
                                            <div style={{
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: 'var(--muted-text, #6b7280)',
                                                padding: '8px 10px 4px 10px'
                                            }}>
                                                {item.section}
                                            </div>
                                        )}
                                        <div
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => item.action()}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '9px 12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                background: isSelected ? 'var(--accent-color, #2563eb)' : 'transparent',
                                                color: isSelected ? '#ffffff' : 'var(--text-color, #111827)',
                                                transition: 'background 0.12s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: isSelected ? '#ffffff' : 'inherit'
                                                }}>
                                                    {item.icon}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <span style={{
                                                        fontSize: '0.92rem',
                                                        fontWeight: '600',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {item.label}
                                                    </span>
                                                    {item.subtitle && (
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--muted-text, #6b7280)',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {item.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {item.shortcut && (
                                                    <kbd style={{
                                                        padding: '2px 6px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '700',
                                                        borderRadius: '4px',
                                                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--item-bg, rgba(0,0,0,0.06))',
                                                        color: isSelected ? '#ffffff' : 'var(--muted-text, #6b7280)',
                                                        border: isSelected ? 'none' : '1px solid var(--border-color)'
                                                    }}>
                                                        {item.shortcut}
                                                    </kbd>
                                                )}
                                                {isSelected && <ArrowRight size={14} color="#ffffff" />}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div style={{
                        padding: '8px 14px',
                        borderTop: '1px solid var(--border-color, rgba(0,0,0,0.08))',
                        background: 'var(--item-bg, rgba(0,0,0,0.02))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--muted-text, #6b7280)'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span>↑↓ to navigate</span>
                            <span>↵ to select</span>
                            <span>esc to close</span>
                        </div>
                        <span>Cmd + K</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CommandPalette;
