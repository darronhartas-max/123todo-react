import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check, ChevronDown } from 'lucide-react';
import { PROJECT_COLORS, DEFAULT_PROJECTS } from '../../utils/constants';

const ProjectTabs = ({ projects, currentProjectId, onSelect, onAdd, onUpdate, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allProjects = [...DEFAULT_PROJECTS, ...projects].filter((p, i, self) =>
        self.findIndex(t => t.id === p.id) === i
    );

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
        mainWrapper: {
            padding: '4px 12px 8px 12px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--surface-color)'
        },
        tabContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center'
        },
        tab: (isActive, color) => ({
            padding: '5px 10px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease',
            border: `1.5px solid ${isActive ? color : 'transparent'}`,
            background: isActive ? `${color}15` : 'var(--bg-color)',
            color: isActive ? color : 'var(--muted-text)',
            boxShadow: isActive ? `0 2px 6px ${color}22` : 'none'
        }),
        addBtn: {
            padding: '5px 10px',
            borderRadius: '16px',
            background: 'var(--bg-color)',
            border: '1.5px dashed var(--border-color)',
            color: 'var(--muted-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        addForm: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            marginTop: '8px',
            background: 'var(--bg-color)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        input: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            fontSize: '0.9rem',
            outline: 'none',
            flex: 1
        },
        dropdownContainer: {
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        select: {
            flex: 1,
            padding: '8px 36px 8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontSize: '0.9rem',
            fontWeight: '600',
            appearance: 'none',
            cursor: 'pointer',
            outline: 'none'
        },
        colorBtn: (color, isSelected) => ({
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '2px solid var(--text-color)' : 'none',
            transition: 'transform 0.2s'
        })
    };

    // Threshold for dropdown: if more than 7 categories
    const useDropdown = allProjects.length > 7;

    return (
        <div style={styles.mainWrapper}>
            <div style={styles.tabContainer}>
                {useDropdown ? (
                    <div style={styles.dropdownContainer}>
                        <select
                            style={styles.select}
                            value={currentProjectId}
                            onChange={(e) => onSelect(e.target.value)}
                        >
                            {allProjects.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', right: '55px', pointerEvents: 'none', color: 'var(--muted-text)' }} />
                        <button onClick={() => setIsAdding(!isAdding)} style={styles.addBtn}>
                            {isAdding ? <X size={16} /> : <Plus size={16} />}
                        </button>
                    </div>
                ) : (
                    <>
                        {allProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => onSelect(project.id)}
                                style={styles.tab(currentProjectId === project.id, project.color)}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: project.color }}></div>
                                {editingId === project.id ? (
                                    <input
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={handleUpdate}
                                        onKeyPress={(e) => e.key === 'Enter' && handleUpdate(e)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ ...styles.input, padding: '2px 4px', width: '80px' }}
                                    />
                                ) : (
                                    <span>{project.name}</span>
                                )}

                                {currentProjectId === project.id && project.id !== 'all' && project.id !== 'general' && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <Edit2 size={12} onClick={(e) => startEdit(e, project)} style={{ opacity: 0.7 }} />
                                        <X size={12} onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} style={{ opacity: 0.7 }} />
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setIsAdding(!isAdding)} style={styles.addBtn}>
                            <Plus size={14} /> Add
                        </button>
                    </>
                )}
            </div>

            {isAdding && (
                <div style={styles.addForm}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            autoFocus
                            placeholder="Category name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            style={styles.input}
                        />
                        <button onClick={handleAdd} style={{ ...styles.addBtn, background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px' }}>
                            Save
                        </button>
                        <button onClick={() => setIsAdding(false)} style={{ ...styles.addBtn, padding: '8px' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', padding: '4px 0', overflowX: 'auto' }}>
                        {PROJECT_COLORS.map(c => (
                            <div
                                key={c}
                                style={styles.colorBtn(c, selectedColor === c)}
                                onClick={() => setSelectedColor(c)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTabs;
