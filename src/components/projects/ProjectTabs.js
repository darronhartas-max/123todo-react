import React, { useState } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { PROJECT_COLORS, DEFAULT_PROJECTS } from '../../utils/constants';

const ProjectTabs = ({ projects, currentProjectId, onSelect, onAdd, onUpdate, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const allProjects = [DEFAULT_PROJECTS[0], ...projects];

    const handleAdd = () => {
        if (newName.trim()) {
            onAdd(newName.trim(), selectedColor);
            setNewName('');
            setIsAdding(false);
        }
    };

    const startEdit = (e, project) => {
        e.stopPropagation();
        setEditingId(project.id);
        setEditName(project.name);
    };

    const handleUpdate = (e) => {
        e.stopPropagation();
        if (editName.trim()) {
            onUpdate(editingId, { name: editName.trim() });
            setEditingId(null);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            margin: '8px 0',
            overflowX: 'auto',
            gap: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        },
        tab: (isActive, color) => ({
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            border: `2px solid ${isActive ? color : 'transparent'}`,
            background: isActive ? `${color}15` : 'var(--item-bg)',
            color: isActive ? color : 'var(--muted-text)',
            boxShadow: isActive ? `0 2px 8px ${color}33` : 'none'
        }),
        addBtn: {
            padding: '6px',
            borderRadius: '50%',
            background: 'var(--item-bg)',
            border: '1px dashed var(--border-color)',
            color: 'var(--muted-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        input: {
            padding: '4px 8px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontSize: '0.8rem',
            outline: 'none',
            width: '100px'
        },
        colorDot: (color, isSelected) => ({
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '2px solid white' : 'none',
            boxShadow: isSelected ? '0 0 0 1px #ccc' : 'none'
        })
    };

    return (
        <div style={styles.container}>
            {allProjects.map(project => (
                <div
                    key={project.id}
                    onClick={() => onSelect(project.id)}
                    style={styles.tab(currentProjectId === project.id, project.color)}
                >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: project.color }}></div>
                    {editingId === project.id ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleUpdate}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdate(e)}
                            onClick={(e) => e.stopPropagation()}
                            style={styles.input}
                        />
                    ) : (
                        <span>{project.name}</span>
                    )}

                    {currentProjectId === project.id && project.id !== 'all' && project.id !== 'general' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Edit2 size={12} onClick={(e) => startEdit(e, project)} />
                            <X size={12} onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} />
                        </div>
                    )}
                </div>
            ))}

            {isAdding ? (
                <div style={{ ...styles.tab(false), border: '1px solid var(--border-color)' }}>
                    <input
                        autoFocus
                        placeholder="Name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                        style={styles.input}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {PROJECT_COLORS.slice(0, 4).map(c => (
                            <div
                                key={c}
                                style={styles.colorDot(c, selectedColor === c)}
                                onClick={() => setSelectedColor(c)}
                            />
                        ))}
                    </div>
                    <Check size={14} onClick={handleAdd} style={{ cursor: 'pointer', color: '#10b981' }} />
                    <X size={14} onClick={() => setIsAdding(false)} style={{ cursor: 'pointer', color: '#dc2626' }} />
                </div>
            ) : (
                <button onClick={() => setIsAdding(true)} style={styles.addBtn} title="Add Project">
                    <Plus size={16} />
                </button>
            )}
        </div>
    );
};

export default ProjectTabs;
