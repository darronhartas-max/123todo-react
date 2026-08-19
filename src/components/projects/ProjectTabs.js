import React, { useState } from 'react';
import { X, ChevronDown, Search as SearchIcon, Settings, PlusCircle, MinusCircle, Trophy } from 'lucide-react';
import { DEFAULT_PROJECTS } from '../../utils/constants';

const ProjectTabs = ({ projects = [], tasks = [], currentProjectId, onSelect, showSearch, onToggleSearch, onOpenSettings, onOpenAchievements, onToggleAdd, isAddOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredOptionId, setHoveredOptionId] = useState(null);

    const allProjects = [
        DEFAULT_PROJECTS.find(p => p.id === 'all'),
        ...projects
    ].filter(Boolean);

    const activeProject = allProjects.find(p => p.id === currentProjectId) || allProjects[0];
    const activeColor = activeProject?.color || '#6b7280';

    const getProjectTaskCount = (projectId) => {
        if (!tasks || tasks.length === 0) return 0;
        if (projectId === 'all') {
            return tasks.length;
        }
        return tasks.filter(t => (t.projectId || 'general').toLowerCase() === projectId.toLowerCase()).length;
    };

    const activeCount = getProjectTaskCount(activeProject?.id);

    // Calculate widest project text length including task count badge to dynamically size the dropdown button
    const getProjectLabelLength = (p) => {
        const count = getProjectTaskCount(p.id);
        return (p?.name || '').length + String(count).length + 4;
    };

    const maxProjectNameLength = Math.max(...allProjects.map(getProjectLabelLength), 10);
    const dropdownMinWidth = Math.min(Math.max(maxProjectNameLength * 9 + 48, 140), 320);

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
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            padding: '4px 0'
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
                            {activeProject?.name} ({activeCount})
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
                                {allProjects.map(p => {
                                    const count = getProjectTaskCount(p.id);
                                    const isSelected = p.id === currentProjectId;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                onSelect(p.id);
                                                setIsOpen(false);
                                            }}
                                            onMouseEnter={() => setHoveredOptionId(p.id)}
                                            onMouseLeave={() => setHoveredOptionId(null)}
                                            style={{
                                                ...styles.customOption(isSelected, p.color),
                                                background: isSelected
                                                    ? `${p.color}15`
                                                    : (hoveredOptionId === p.id ? 'var(--bg-color)' : 'transparent')
                                            }}
                                        >
                                            <div style={styles.customOptionBand(p.color)} />
                                            <span style={{ flex: 1 }}>{p.name}</span>
                                            <span style={{
                                                fontSize: '0.78rem',
                                                fontWeight: '700',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: isSelected ? `${p.color}25` : 'var(--bg-color)',
                                                color: isSelected ? p.color : 'var(--muted-text)',
                                                border: '1px solid var(--border-color)',
                                                marginLeft: '10px'
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

                {/* 3. Achievements Badge icon button */}
                {onOpenAchievements && (
                    <button
                        onClick={onOpenAchievements}
                        style={{
                            ...styles.actionBtn,
                            marginLeft: 'auto',
                            borderColor: '#f59e0b',
                            color: '#d97706',
                            background: 'rgba(245, 158, 11, 0.12)',
                            boxShadow: '0 1px 4px rgba(245, 158, 11, 0.2)'
                        }}
                        title="Productivity Achievements & Insights"
                    >
                        <Trophy size={17} />
                    </button>
                )}

                {/* 4. Settings cog icon on the right-hand side */}
                <button 
                    onClick={onOpenSettings} 
                    style={{ ...styles.actionBtn, marginLeft: onOpenAchievements ? '8px' : 'auto' }} 
                    title="Settings"
                >
                    <Settings size={18} />
                </button>

                {/* 4. Add Task + / - toggle button to the right of Settings with generous margin */}
                {onToggleAdd && (
                    <button
                        onClick={onToggleAdd}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '14px',
                            flexShrink: 0,
                            transition: 'transform 0.2s ease'
                        }}
                        aria-label={isAddOpen ? "Close add task" : "Open add task"}
                        title={isAddOpen ? "Close add task form" : "Add new task"}
                    >
                        {isAddOpen ? <MinusCircle size={28} /> : <PlusCircle size={28} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectTabs;
