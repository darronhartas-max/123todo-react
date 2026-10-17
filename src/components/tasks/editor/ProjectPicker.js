import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ProjectPicker = ({
    projects = [],
    selectedProjectId,
    onSelectProject,
    label,
    sectionLabelStyle,
    buttonPadding = '6px 12px',
    fontSize = '0.95rem',
    containerStyle = {},
    isOpen: controlledIsOpen,
    onToggleOpen
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = typeof controlledIsOpen === 'boolean';
    const isProjectOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const setOpen = (val) => {
        if (!isControlled) {
            setInternalIsOpen(val);
        }
        if (onToggleOpen) {
            onToggleOpen(val);
        }
    };

    const activeProject = (projects || []).find(p => p.id === selectedProjectId)
        || projects?.[0]
        || { id: 'general', name: 'General', color: '#6b7280' };

    const maxProjectNameLength = Math.max(...(projects || []).map(p => (p?.name || '').length), 10);
    const dropdownMinWidth = Math.min(Math.max(maxProjectNameLength * 9 + 48, 140), 320);

    return (
        <div style={{
            position: 'relative',
            minWidth: `min(${dropdownMinWidth}px, 100%)`,
            maxWidth: '340px',
            zIndex: isProjectOpen ? 121 : 1,
            ...containerStyle
        }}>
            {label && (
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: 'var(--muted-text)',
                    marginBottom: '4px',
                    ...sectionLabelStyle
                }}>
                    {label}
                </div>
            )}
            <button
                type="button"
                onClick={() => setOpen(!isProjectOpen)}
                style={{
                    width: '100%',
                    padding: buttonPadding,
                    borderRadius: '6px',
                    border: `1.5px solid ${activeProject.color || '#6b7280'}`,
                    background: 'var(--item-bg)',
                    color: activeProject.color || 'var(--text-color)',
                    fontSize: fontSize,
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span style={{
                        width: '5px',
                        height: '14px',
                        borderRadius: '2px',
                        background: activeProject.color || '#6b7280',
                        flexShrink: 0
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeProject.name}
                    </span>
                </div>
                <ChevronDown size={16} style={{ color: activeProject.color || 'var(--muted-text)', flexShrink: 0 }} />
            </button>

            {isProjectOpen && (
                <>
                    <div
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 120,
                            background: 'transparent'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        minWidth: '100%',
                        width: 'max-content',
                        maxWidth: 'min(340px, calc(100vw - 32px))',
                        background: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                        zIndex: 125,
                        maxHeight: 'calc(100vh - 120px)',
                        overflowY: 'auto',
                        padding: '4px 0',
                        boxSizing: 'border-box'
                    }}>
                        {(projects || []).map(p => {
                            const isSel = p.id === (selectedProjectId || activeProject.id);
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => {
                                        onSelectProject(p.id);
                                        setOpen(false);
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '0.95rem',
                                        fontWeight: isSel ? '700' : '600',
                                        color: isSel ? (p.color || 'var(--text-color)') : 'var(--text-color)',
                                        background: isSel ? `${p.color || 'var(--accent-color)'}15` : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease'
                                    }}
                                >
                                    <span style={{
                                        width: '5px',
                                        height: '14px',
                                        borderRadius: '2px',
                                        background: p.color || '#6b7280',
                                        flexShrink: 0
                                    }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectPicker;
