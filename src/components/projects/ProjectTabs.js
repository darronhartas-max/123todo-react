import React, { useState } from 'react';
import { X, Check, ChevronDown, Search as SearchIcon, Settings } from 'lucide-react';
import { PROJECT_COLORS, DEFAULT_PROJECTS } from '../../utils/constants';
import ManageCategoriesModal from '../modals/ManageCategoriesModal';

const ProjectTabs = ({ projects, currentProjectId, onSelect, onAdd, onUpdate, onDelete, showSearch, onToggleSearch }) => {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [showManage, setShowManage] = useState(false);
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

    const allProjects = [
        DEFAULT_PROJECTS.find(p => p.id === 'all'),
        ...projects
    ].filter(Boolean);



    const startEdit = (e, project) => {
        e.stopPropagation();
        setEditingId(project.id);
        setEditName(project.name);
        setSelectedColor(project.color);
    };

    const handleUpdate = (e) => {
        if (e) e.stopPropagation();
        if (editName.trim()) {
            onUpdate(editingId, { name: editName.trim(), color: selectedColor });
            setEditingId(null);
        }
    };

    const styles = {
        mainWrapper: {
            padding: '4px 12px 8px 12px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--accent-bg)'
        },
        tabContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center'
        },
        tab: (isActive, color) => ({
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '1.1rem',
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
        actionBtn: {
            padding: '6px',
            borderRadius: '50%',
            background: 'var(--bg-color)',
            border: '1.5px solid var(--border-color)',
            color: 'var(--accent-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        },
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
            fontSize: '1.1rem',
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
            fontSize: '1.1rem',
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
            fontSize: '1.1rem',
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
                <button
                    onClick={onToggleSearch}
                    style={{
                        ...styles.actionBtn,
                        borderColor: showSearch ? 'var(--accent-color)' : 'var(--border-color)',
                        background: showSearch ? 'var(--accent-bg)' : 'var(--bg-color)'
                    }}
                    title={showSearch ? "Hide Search" : "Show Search"}
                >
                    {showSearch ? <X size={16} /> : <SearchIcon size={16} />}
                </button>

                {useDropdown ? (
                    <>
                        <div style={styles.dropdownContainer}>
                            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--muted-text)', whiteSpace: 'nowrap' }}>CATEGORY:</span>
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
                            <button onClick={() => setShowManage(true)} style={styles.addBtn} title="Manage Categories">
                                <Settings size={16} />
                            </button>
                        </div>
                    </>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ ...styles.input, padding: '2px 4px', width: '80px' }}
                                        />
                                        <Check size={14} onClick={handleUpdate} style={{ color: '#10b981', cursor: 'pointer' }} />
                                    </div>
                                ) : (
                                    <span>{project.name}</span>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setShowManage(true)} style={{ ...styles.addBtn, padding: '5px' }} title="Manage Categories">
                            <Settings size={18} />
                        </button>
                    </>
                )}
            </div>

            {showManage && (
                <ManageCategoriesModal
                    projects={projects}
                    onAdd={onAdd}
                    onEdit={(p) => {
                        setShowManage(false);
                        startEdit({ stopPropagation: () => { } }, p);
                    }}
                    onDelete={(id) => {
                        setShowManage(false);
                        onDelete(id);
                    }}
                    onClose={() => setShowManage(false)}
                />
            )}

            {editingId && (
                <div style={styles.addForm}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            autoFocus
                            placeholder="Edit name..."
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                            style={styles.input}
                        />
                        <button
                            onClick={handleUpdate}
                            style={{ ...styles.addBtn, background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px' }}
                        >
                            Update
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ ...styles.addBtn, padding: '8px' }}>
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
