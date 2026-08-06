import React, { useState } from 'react';
import { X, ChevronDown, Search as SearchIcon, Settings } from 'lucide-react';
import { DEFAULT_PROJECTS } from '../../utils/constants';

const ProjectTabs = ({ projects = [], currentProjectId, onSelect, showSearch, onToggleSearch, onOpenSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredOptionId, setHoveredOptionId] = useState(null);

    const allProjects = [
        DEFAULT_PROJECTS.find(p => p.id === 'all'),
        ...projects
    ].filter(Boolean);

    const activeProject = allProjects.find(p => p.id === currentProjectId) || allProjects[0];
    const activeColor = activeProject?.color || '#6b7280';

    // Calculate widest project text length to dynamically size the dropdown button
    const maxProjectNameLength = Math.max(...allProjects.map(p => (p?.name || '').length), 8);
    const dropdownMinWidth = Math.min(Math.max(maxProjectNameLength * 9 + 42, 130), 280);

    const styles = {
        mainWrapper: {
            padding: '6px 12px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--accent-bg)'
        },
        tabContainer: {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: '10px'
        },
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
            transition: 'all 0.2s ease',
            flexShrink: 0
        },
        customSelectWrapper: {
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'column',
            flexShrink: 0
        },
        customSelectTrigger: (color) => ({
            width: `${dropdownMinWidth}px`,
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
            textAlign: 'left',
            whiteSpace: 'nowrap'
        }),
        customSelectDropdown: {
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            width: 'max-content',
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
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: isActive ? color : 'var(--text-color)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
        }),
        customOptionBand: (color) => ({
            width: '4px',
            height: '14px',
            borderRadius: '2px',
            backgroundColor: color,
            flexShrink: 0
        })
    };

    return (
        <div style={styles.mainWrapper}>
            <div style={styles.tabContainer}>
                {/* 1. Search magnifying glass icon at start of line */}
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

                {/* 2. Projects drop-down, width determined by widest project text length */}
                <div style={styles.customSelectWrapper}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={styles.customSelectTrigger(activeColor)}
                    >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activeProject?.name}
                        </span>
                        <ChevronDown size={16} style={{ color: activeColor, flexShrink: 0, marginLeft: '6px' }} />
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

                {/* 3. Settings cog icon on the far right-hand side */}
                <button 
                    onClick={onOpenSettings} 
                    style={{ ...styles.actionBtn, marginLeft: 'auto' }} 
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProjectTabs;
