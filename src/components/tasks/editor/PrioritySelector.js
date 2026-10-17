import React, { useState } from 'react';
import { PRIORITIES } from '../../../utils/constants';
import { ChevronDown } from 'lucide-react';

const PrioritySelector = ({
    priority = 1,
    onChangePriority,
    mode = 'buttons', // 'buttons' | 'dropdown'
    label,
    sectionLabelStyle,
    containerStyle = {},
    actionButton,
    isOpen: controlledIsOpen,
    onToggleOpen
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = typeof controlledIsOpen === 'boolean';
    const isPriorityOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const setOpen = (val) => {
        if (!isControlled) {
            setInternalIsOpen(val);
        }
        if (onToggleOpen) {
            onToggleOpen(val);
        }
    };

    const activePriority = PRIORITIES[priority] || PRIORITIES[1];

    if (mode === 'dropdown') {
        return (
            <div style={{
                flex: 1,
                position: 'relative',
                zIndex: isPriorityOpen ? 121 : 1,
                ...containerStyle
            }}>
                {label && (
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: 'var(--muted-text)',
                        marginBottom: '5px',
                        ...sectionLabelStyle
                    }}>
                        {label}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setOpen(!isPriorityOpen)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1.5px solid ${activePriority.color}`,
                        background: 'var(--item-bg)',
                        color: activePriority.color,
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: activePriority.color,
                            boxShadow: `0 0 6px ${activePriority.color}`,
                            flexShrink: 0
                        }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activePriority.label}
                        </span>
                    </div>
                    <ChevronDown size={16} style={{ color: activePriority.color, flexShrink: 0 }} />
                </button>

                {isPriorityOpen && (
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
                            right: 0,
                            background: 'var(--surface-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                            zIndex: 125,
                            overflow: 'hidden',
                            padding: '4px 0'
                        }}>
                            {Object.entries(PRIORITIES).map(([val, conf]) => {
                                const isSel = parseInt(val, 10) === priority;
                                return (
                                    <div
                                        key={val}
                                        onClick={() => {
                                            onChangePriority(parseInt(val, 10));
                                            setOpen(false);
                                        }}
                                        style={{
                                            padding: '9px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '0.95rem',
                                            fontWeight: isSel ? '700' : '600',
                                            color: isSel ? conf.color : 'var(--text-color)',
                                            background: isSel ? `${conf.color}15` : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease'
                                        }}
                                    >
                                        <span style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: conf.color,
                                            boxShadow: `0 0 4px ${conf.color}`,
                                            flexShrink: 0
                                        }} />
                                        <span>{conf.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Default 'buttons' mode
    const flexMap = { 1: '1', 2: '1.25', 3: '1.5' };

    return (
        <div style={{
            display: 'flex',
            gap: '6px',
            margin: '10px 0',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            ...containerStyle
        }}>
            {[1, 2, 3].map(p => {
                const isSelected = priority === p;
                const conf = PRIORITIES[p];
                return (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChangePriority(p)}
                        style={{
                            padding: '7px 6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            border: `2px solid ${conf.color}`,
                            borderRadius: '5px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1px',
                            flex: `${flexMap[p] || '1'} 1 auto`,
                            minWidth: '0',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            boxSizing: 'border-box',
                            color: isSelected ? 'white' : conf.color,
                            backgroundColor: isSelected ? conf.color : 'var(--bg-color)',
                            borderColor: conf.color
                        }}
                    >
                        {conf.label}
                    </button>
                );
            })}
            {actionButton}
        </div>
    );
};

export default PrioritySelector;
