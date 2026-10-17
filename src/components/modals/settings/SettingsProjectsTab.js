import React, { useState, useRef } from 'react';
import { Check, X, GripVertical, Edit2, Trash2, Plus } from 'lucide-react';
import { PROJECT_COLORS, migrateProjectColor } from '../../../utils/constants';

const SettingsProjectsTab = ({
    projects = [],
    onAddProject,
    onEditProject,
    onDeleteProject,
    onMoveProject,
    onReorderProjects,
    styles
}) => {
    const [projectName, setProjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Inline project editing states
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    // Project drag and drop reordering state
    const [draggedProjectId, setDraggedProjectId] = useState(null);
    const [dragOverProjectId, setDragOverProjectId] = useState(null);
    const projectListRef = useRef(null);
    const autoScrollProjectRef = useRef(null);
    const scrollSpeedProjectRef = useRef(0);

    const startProjectAutoScroll = (speed) => {
        scrollSpeedProjectRef.current = speed;
        if (!autoScrollProjectRef.current && projectListRef.current) {
            const step = () => {
                if (scrollSpeedProjectRef.current !== 0 && projectListRef.current) {
                    projectListRef.current.scrollTop += scrollSpeedProjectRef.current;
                    autoScrollProjectRef.current = requestAnimationFrame(step);
                } else {
                    autoScrollProjectRef.current = null;
                }
            };
            autoScrollProjectRef.current = requestAnimationFrame(step);
        }
    };

    const stopProjectAutoScroll = () => {
        scrollSpeedProjectRef.current = 0;
        if (autoScrollProjectRef.current) {
            cancelAnimationFrame(autoScrollProjectRef.current);
            autoScrollProjectRef.current = null;
        }
    };

    const handleDragStartProject = (e, projectId) => {
        setDraggedProjectId(projectId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', projectId);
    };

    const handleDragOverProject = (e, projectId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (projectListRef.current) {
            const rect = projectListRef.current.getBoundingClientRect();
            const clientY = e.clientY;
            const threshold = 60; // 60px from top or bottom of container

            if (clientY < rect.top + threshold) {
                const proximity = (rect.top + threshold) - clientY;
                const speed = -Math.max(4, Math.min(20, Math.round((proximity / threshold) * 20)));
                startProjectAutoScroll(speed);
            } else if (clientY > rect.bottom - threshold) {
                const proximity = clientY - (rect.bottom - threshold);
                const speed = Math.max(4, Math.min(20, Math.round((proximity / threshold) * 20)));
                startProjectAutoScroll(speed);
            } else {
                stopProjectAutoScroll();
            }
        }

        if (dragOverProjectId !== projectId) {
            setDragOverProjectId(projectId);
        }
    };

    const handleDropProject = (e, targetProjectId) => {
        stopProjectAutoScroll();
        e.preventDefault();
        if (!draggedProjectId || draggedProjectId === targetProjectId) {
            setDraggedProjectId(null);
            setDragOverProjectId(null);
            return;
        }

        const fromIndex = projects.findIndex(p => p.id === draggedProjectId);
        const toIndex = projects.findIndex(p => p.id === targetProjectId);

        if (fromIndex > -1 && toIndex > -1) {
            const updated = [...projects];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);

            if (onReorderProjects) {
                onReorderProjects(updated);
            } else if (onMoveProject) {
                const direction = fromIndex < toIndex ? 'down' : 'up';
                onMoveProject(draggedProjectId, direction);
            }
        }

        setDraggedProjectId(null);
        setDragOverProjectId(null);
    };

    const handleDragEndProject = () => {
        stopProjectAutoScroll();
        setDraggedProjectId(null);
        setDragOverProjectId(null);
    };

    const handleAddProject = (e) => {
        e.preventDefault();
        if (projectName.trim()) {
            onAddProject(projectName.trim(), selectedColor);
            setProjectName('');
            setSelectedColor(PROJECT_COLORS[0]);
            setShowAddForm(false);
        }
    };

    return (
        <div>
            <div style={styles.sectionTitle}>Manage Projects</div>
            <div ref={projectListRef} style={{ maxHeight: showAddForm ? '220px' : '440px', overflowY: 'auto', paddingRight: '4px', transition: 'max-height 0.3s ease' }}>
                {projects.map((project) => (
                    <div
                        key={project.id}
                        draggable={!editingProjectId}
                        onDragStart={(e) => handleDragStartProject(e, project.id)}
                        onDragOver={(e) => handleDragOverProject(e, project.id)}
                        onDragLeave={() => setDragOverProjectId(null)}
                        onDrop={(e) => handleDropProject(e, project.id)}
                        onDragEnd={handleDragEndProject}
                        style={{
                            ...styles.projectItem,
                            opacity: draggedProjectId === project.id ? 0.4 : 1,
                            borderColor: dragOverProjectId === project.id ? 'var(--accent-color)' : 'var(--border-color)',
                            background: dragOverProjectId === project.id ? 'var(--accent-bg)' : 'var(--item-bg)',
                            cursor: editingProjectId ? 'default' : 'grab',
                            transition: 'all 0.15s ease'
                        }}
                    >
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
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(10, 1fr)',
                                    gap: '8px 4px',
                                    justifyItems: 'center',
                                    alignItems: 'center',
                                    marginTop: '6px',
                                    marginBottom: '4px'
                                }}>
                                    {PROJECT_COLORS.map(c => (
                                        <div
                                            key={c}
                                            onClick={() => setEditColor(c)}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: c,
                                                cursor: 'pointer',
                                                border: editColor === c ? '2.5px solid var(--text-color)' : '1.5px solid transparent',
                                                transform: editColor === c ? 'scale(1.15)' : 'scale(1)',
                                                transition: 'transform 0.15s ease',
                                                boxShadow: editColor === c ? '0 0 0 1px var(--text-color), 0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
                                            }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={styles.projectInfo}>
                                    <GripVertical size={16} style={{ color: 'var(--muted-text)', cursor: 'grab', flexShrink: 0 }} title="Drag to reorder" />
                                    <div style={styles.colorDot(project.color)} />
                                    {project.name}
                                </div>
                                <div style={{ ...styles.actions, gap: '10px' }}>
                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => {
                                            setEditingProjectId(project.id);
                                            setEditName(project.name);
                                            setEditColor(migrateProjectColor(project.color));
                                        }}
                                        title="Edit project name & color"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px', opacity: 0.7 }} />
                                    <button
                                        style={{
                                            ...styles.actionBtn,
                                            color: '#dc2626',
                                            borderColor: '#fee2e2',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            padding: '4px 8px'
                                        }}
                                        onClick={() => {
                                            if (projects.length === 1) {
                                                alert("You must have at least one project remaining.");
                                                return;
                                            }
                                            onDeleteProject(project.id);
                                        }}
                                        title="Delete project"
                                    >
                                        <Trash2 size={15} />
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
                                    title={c}
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
    );
};

export default SettingsProjectsTab;
