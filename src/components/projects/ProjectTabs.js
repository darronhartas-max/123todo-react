import React, { useState } from 'react';
import { X, ChevronDown, Search as SearchIcon, Settings } from 'lucide-react';
import { DEFAULT_PROJECTS } from '../../utils/constants';

const ProjectTabs = ({ projects, currentProjectId, onSelect, showSearch, onToggleSearch, onOpenSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredOptionId, setHoveredOptionId] = useState(null);

    const allProjects = [
        DEFAULT_PROJECTS.find(p => p.id === 'all'),
        ...projects
    ].filter(Boolean);

    const activeProject = allProjects.find(p => p.id === currentProjectId) || allProjects[0];
    const activeColor = activeProject?.color || '#6b7280';

    const styles = {
        mainWrapper: {
            padding: '4px 12px 4px 12px',
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
            padding: '4px 10px',
            borderRadius: '14px',
            fontSize: '0.95rem',
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
            padding: '5px',
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
            padding: '4px 8px',
            borderRadius: '12px',
            background: 'var(--bg-color)',
            border: '1.5px dashed var(--border-color)',
            color: 'var(--muted-text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.95rem',
            fontWeight: '600'
        },

        addForm: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px',
            marginTop: '6px',
            background: 'var(--bg-color)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
        },
        input: {
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--item-bg)',
            color: 'var(--text-color)',
            fontSize: '0.95rem',
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
        customSelectWrapper: {
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        customSelectTrigger: (color) => ({
            width: '100%',
            padding: '4px 10px',
            borderRadius: '6px',
            border: `1.5px solid ${color}`,
            background: 'var(--item-bg)',
            color: color,
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            outline: 'none',
            transition: 'all 0.2s ease',
            textAlign: 'left'
        }),
        customSelectDropdown: {
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            zIndex: 100,
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '2px 0'
        },
        customOption: (isActive, color) => ({
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: isActive ? color : 'var(--text-color)',
            transition: 'all 0.15s ease'
        }),
        customOptionBand: (color) => ({
            width: '4px',
            height: '14px',
            borderRadius: '2px',
            backgroundColor: color,
            flexShrink: 0
        }),
        colorBtn: (color, isSelected) => ({
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '2px solid var(--text-color)' : 'none',
            transition: 'transform 0.2s'
        })
    };

    // Threshold for dropdown: if more than 7 projects
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
                            <div style={styles.customSelectWrapper}>
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    style={styles.customSelectTrigger(activeColor)}
                                >
                                    <span>{activeProject?.name}</span>
                                    <ChevronDown size={16} style={{ color: activeColor, transition: 'color 0.2s ease' }} />
                                </button>
                                {isOpen && (
                                    <>
                                        <div 
                                            onClick={() => setIsOpen(false)}
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
                                        <div style={styles.customSelectDropdown}>
                                            {allProjects.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        onSelect(p.id);
                                                        setIsOpen(false);
                                                    }}
                                                    onMouseEnter={() => setHoveredOptionId(p.id)}
                                                    onMouseLeave={() => setHoveredOptionId(null)}
                                                    style={{
                                                        ...styles.customOption(p.id === currentProjectId, p.color),
                                                        background: p.id === currentProjectId
                                                            ? `${p.color}15`
                                                            : (hoveredOptionId === p.id ? 'var(--bg-color)' : 'transparent')
                                                    }}
                                                >
                                                    <div style={styles.customOptionBand(p.color)} />
                                                    <span>{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={onOpenSettings} style={styles.addBtn} title="Settings">
                                <Settings size={18} />
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
                                <span>{project.name}</span>
                            </div>
                        ))}
                        <button onClick={onOpenSettings} style={{ ...styles.addBtn, padding: '5px' }} title="Settings">
                            <Settings size={22} />
                        </button>
                    </>
                )}
            </div>




        </div>
    );
};

export default ProjectTabs;
