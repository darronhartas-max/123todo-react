import React, { useState } from 'react';
import { X, Trash2, Edit2, Plus, Sliders, FolderOpen, Check, Keyboard, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECT_COLORS } from '../../utils/constants';

const SHORTCUTS_LIST = [
    { keys: ['Q', 'A'], desc: 'Toggle Add Task Panel' },
    { keys: ['/'], desc: 'Focus Search Bar' },
    { keys: ['S'], desc: 'Open Settings' },
    { keys: ['Esc'], desc: 'Close Modal / Cancel / Unfocus' },
    { keys: ['Enter'], desc: 'Save task (when editing/adding)' },
    { keys: ['Shift + Enter'], desc: 'Insert line break in notes' }
];

const SettingsModal = ({
    isOpen,
    onClose,
    projects,
    onAddProject,
    onEditProject,
    onDeleteProject,
    onMoveProject,
    fontSize,
    setFontSize,
    density,
    setDensity,
    layoutWidth,
    setLayoutWidth,
    themeMode,
    setThemeMode
}) => {
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'appearance'
    const [projectName, setProjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Inline project editing states
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    if (!isOpen) return null;

    const handleAddProject = (e) => {
        e.preventDefault();
        if (projectName.trim()) {
            onAddProject(projectName.trim(), selectedColor);
            setProjectName('');
            setSelectedColor(PROJECT_COLORS[0]);
            setShowAddForm(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            transition: 'background 0.3s ease'
        },
        modal: {
            background: 'var(--surface-color)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '680px',
            height: '80vh',
            maxHeight: '650px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
        },
        header: {
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-color)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        body: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            flexDirection: window.innerWidth < 600 ? 'column' : 'row'
        },
        sidebar: {
            width: window.innerWidth < 600 ? '100%' : '200px',
            borderRight: window.innerWidth < 600 ? 'none' : '1px solid var(--border-color)',
            borderBottom: window.innerWidth < 600 ? '1px solid var(--border-color)' : 'none',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: window.innerWidth < 600 ? 'row' : 'column',
            padding: '12px',
            gap: '6px',
            flexShrink: 0
        },
        tabBtn: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: isActive ? '700' : '500',
            fontSize: '1rem',
            textAlign: 'left',
            flex: window.innerWidth < 600 ? 1 : 'none',
            justifyContent: window.innerWidth < 600 ? 'center' : 'flex-start',
            boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.02)' : 'none',
            transition: 'all 0.2s ease'
        }),
        content: {
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            background: 'var(--surface-color)'
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        projectItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '8px',
            background: 'var(--item-bg)'
        },
        projectInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: '600',
            fontSize: '1.05rem',
            color: 'var(--text-color)'
        },
        colorDot: (color) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color
        }),
        actions: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
        },
        actionBtn: {
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-text)',
            transition: 'all 0.15s ease',
            minWidth: '36px',
            minHeight: '36px'
        },
        addSection: {
            marginTop: '20px',
            padding: '16px',
            background: 'var(--bg-color)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)'
        },
        input: {
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            fontSize: '1rem',
            marginBottom: '12px',
            outline: 'none'
        },
        colorGrid: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
        },
        colorBtn: (color, isSelected) => ({
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '3px solid var(--text-color)' : 'none',
            transition: 'transform 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }),
        submitBtn: {
            width: '100%',
            padding: '10px',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
        },
        settingRow: {
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        settingLabel: {
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        segmentContainer: {
            display: 'flex',
            background: 'var(--bg-color)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        segmentBtn: (isActive) => ({
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
        }),
        sliderContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-color)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        slider: {
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            accentColor: 'var(--accent-color)',
            cursor: 'pointer'
        },
        shortcutItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '1rem',
            color: 'var(--text-color)'
        },
        kbdBadge: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 2px 0 var(--border-color)',
            color: 'var(--accent-color)'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={styles.modal}
                onClick={e => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <div style={styles.title}>Settings</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={styles.body}>
                    <div style={styles.sidebar}>
                        <button
                            style={styles.tabBtn(activeTab === 'projects')}
                            onClick={() => setActiveTab('projects')}
                        >
                            <FolderOpen size={18} />
                            Projects
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'appearance')}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <Sliders size={18} />
                            Appearance
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'shortcuts')}
                            onClick={() => setActiveTab('shortcuts')}
                        >
                            <Keyboard size={18} />
                            Shortcuts
                        </button>
                    </div>

                    <div style={styles.content}>
                        {activeTab === 'projects' && (
                            <div>
                                <div style={styles.sectionTitle}>Manage Projects</div>
                                <div style={{ maxHeight: showAddForm ? '220px' : '440px', overflowY: 'auto', paddingRight: '4px', transition: 'max-height 0.3s ease' }}>
                                    {projects.map((project, idx) => (
                                        <div key={project.id} style={styles.projectItem}>
                                            {editingProjectId === project.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                            style={{ ...styles.input, marginBottom: 0, padding: '6px 10px', flex: 1 }}
                                                            placeholder="Project name..."
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            style={{ ...styles.actionBtn, background: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' }}
                                                            onClick={() => {
                                                                if (editName.trim()) {
                                                                    onEditProject(project.id, { name: editName.trim(), color: editColor });
                                                                    setEditingProjectId(null);
                                                                }
                                                            }}
                                                            title="Save changes"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            style={{ ...styles.actionBtn, color: 'var(--muted-text)' }}
                                                            onClick={() => setEditingProjectId(null)}
                                                            title="Cancel"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                        {PROJECT_COLORS.map(c => (
                                                            <div
                                                                key={c}
                                                                onClick={() => setEditColor(c)}
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    background: c,
                                                                    cursor: 'pointer',
                                                                    border: editColor === c ? '2px solid var(--text-color)' : 'none',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={styles.projectInfo}>
                                                        <div style={styles.colorDot(project.color)} />
                                                        {project.name}
                                                    </div>
                                                     <div style={styles.actions}>
                                                         <button
                                                             style={{
                                                                 ...styles.actionBtn,
                                                                 opacity: idx === 0 ? 0.3 : 1,
                                                                 cursor: idx === 0 ? 'default' : 'pointer'
                                                             }}
                                                             disabled={idx === 0}
                                                             onClick={() => onMoveProject && onMoveProject(project.id, 'up')}
                                                             title="Move project up"
                                                         >
                                                             <ChevronUp size={18} />
                                                         </button>
                                                         <button
                                                             style={{
                                                                 ...styles.actionBtn,
                                                                 opacity: idx === projects.length - 1 ? 0.3 : 1,
                                                                 cursor: idx === projects.length - 1 ? 'default' : 'pointer'
                                                             }}
                                                             disabled={idx === projects.length - 1}
                                                             onClick={() => onMoveProject && onMoveProject(project.id, 'down')}
                                                             title="Move project down"
                                                         >
                                                             <ChevronDown size={18} />
                                                         </button>
                                                         <button
                                                             style={styles.actionBtn}
                                                             onClick={() => {
                                                                 setEditingProjectId(project.id);
                                                                 setEditName(project.name);
                                                                 setEditColor(project.color);
                                                             }}
                                                             title="Edit project"
                                                         >
                                                             <Edit2 size={18} />
                                                         </button>
                                                         <button
                                                             style={{ ...styles.actionBtn, color: '#dc2626', borderColor: '#fee2e2' }}
                                                             onClick={() => {
                                                                 if (projects.length === 1) {
                                                                     alert("You must have at least one project remaining.");
                                                                     return;
                                                                 }
                                                                 onDeleteProject(project.id);
                                                             }}
                                                             title="Delete project"
                                                         >
                                                             <Trash2 size={18} />
                                                         </button>
                                                     </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!showAddForm ? (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            background: 'var(--accent-bg)',
                                            border: '1.5px dashed var(--accent-color)',
                                            color: 'var(--accent-color)',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            marginTop: '12px',
                                            width: '100%',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Plus size={18} /> Create New Project
                                    </button>
                                ) : (
                                    <div style={{ ...styles.addSection, marginTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-color)' }}>
                                                <Plus size={18} /> Create New Project
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                                style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}
                                                title="Close"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddProject}>
                                            <input
                                                value={projectName}
                                                onChange={e => setProjectName(e.target.value)}
                                                placeholder="Project name..."
                                                style={styles.input}
                                                autoFocus
                                                required
                                            />
                                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '8px', fontWeight: '500' }}>Project Color</div>
                                            <div style={styles.colorGrid}>
                                                {PROJECT_COLORS.map(c => (
                                                    <div
                                                        key={c}
                                                        style={styles.colorBtn(c, selectedColor === c)}
                                                        onClick={() => setSelectedColor(c)}
                                                    />
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="submit"
                                                    style={{ ...styles.submitBtn, opacity: projectName.trim() ? 1 : 0.5, flex: 1 }}
                                                    disabled={!projectName.trim()}
                                                >
                                                    Add Project
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddForm(false)}
                                                    style={{
                                                        padding: '10px 16px',
                                                        background: 'var(--item-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '8px',
                                                        color: 'var(--text-color)',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <div style={styles.sectionTitle}>Appearance & Styling</div>

                                {/* Text Size */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Text Size</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                                            {fontSize}pt ({fontSize === 12 ? 'Default' : fontSize < 12 ? 'Smaller' : 'Larger'})
                                        </span>
                                    </div>
                                    <div style={styles.sliderContainer}>
                                        <span style={{ fontSize: '8pt', color: 'var(--muted-text)' }}>A</span>
                                        <input
                                            type="range"
                                            min="8"
                                            max="20"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            style={styles.slider}
                                        />
                                        <span style={{ fontSize: '20pt', color: 'var(--muted-text)', fontWeight: 'bold' }}>A</span>
                                    </div>
                                </div>

                                {/* Theme Mode */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>Theme Mode</div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(themeMode === 'system')}
                                            onClick={() => setThemeMode('system')}
                                        >
                                            System
                                        </button>
                                        <button
                                            style={styles.segmentBtn(themeMode === 'light')}
                                            onClick={() => setThemeMode('light')}
                                        >
                                            Light
                                        </button>
                                        <button
                                            style={styles.segmentBtn(themeMode === 'dark')}
                                            onClick={() => setThemeMode('dark')}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>

                                {/* Density Selection */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>Spacing Density</div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(density === 'cozy')}
                                            onClick={() => setDensity('cozy')}
                                        >
                                            Cozy
                                        </button>
                                        <button
                                            style={styles.segmentBtn(density === 'compact')}
                                            onClick={() => setDensity('compact')}
                                        >
                                            Compact
                                        </button>
                                    </div>
                                </div>

                                {/* Layout Width Constraint */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>Desktop Layout Width</div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(layoutWidth === '480px')}
                                            onClick={() => setLayoutWidth('480px')}
                                        >
                                            Single Column (480px)
                                        </button>
                                        <button
                                            style={styles.segmentBtn(layoutWidth === '1000px')}
                                            onClick={() => setLayoutWidth('1000px')}
                                        >
                                            Kanban Columns (1000px)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shortcuts' && (
                            <div>
                                <div style={styles.sectionTitle}>Keyboard Shortcuts</div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {SHORTCUTS_LIST.map((s, idx) => (
                                        <div key={idx} style={styles.shortcutItem}>
                                            <span style={{ color: 'var(--text-color)', fontWeight: '500' }}>{s.desc}</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {s.keys.map(k => (
                                                    <kbd key={k} style={styles.kbdBadge}>{k}</kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
