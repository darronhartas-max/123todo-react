import React, { useState } from 'react';
import { GripVertical, Minus } from 'lucide-react';
import { reorderList, toggleSubtaskStatus } from '../../../utils/reorderUtils';
import { useSubtaskReorder } from '../../../hooks/useSubtaskReorder';

const SubtasksEditor = ({
    subtasks = [],
    onChangeSubtasks,
    onContract,
    itemPlaceholder = 'Subtask step...',
    addPlaceholder = 'Add subtask step...',
    titleText,
    containerStyle = {}
}) => {
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const {
        draggedSubtaskIndex,
        dragOverSubtaskInfo,
        handleSubtaskTouchStart,
        setDraggedSubtaskIndex,
        setDragOverSubtaskInfo
    } = useSubtaskReorder(subtasks, (reordered) => {
        onChangeSubtasks(reordered);
    });

    const handleAddSubtask = () => {
        if (!newSubtaskText.trim()) return;
        const newSubtask = {
            id: Date.now(),
            text: newSubtaskText.trim(),
            completed: false
        };
        // New subtasks are added to the top of the list
        onChangeSubtasks([newSubtask, ...subtasks]);
        setNewSubtaskText('');
    };

    const completedCount = subtasks.filter(s => s.completed).length;
    const defaultTitle = `Subtasks ${subtasks.length > 0 ? `(${completedCount}/${subtasks.length})` : ''}`;

    return (
        <div style={{
            marginTop: '10px',
            padding: '12px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            background: 'var(--bg-color)',
            boxSizing: 'border-box',
            ...containerStyle
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: 'var(--muted-text)',
                        letterSpacing: '-0.01em'
                    }}>
                        {titleText || defaultTitle}
                    </span>
                    {onContract && (
                        <button
                            type="button"
                            onClick={onContract}
                            title="Contract subtasks"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--muted-text)',
                                padding: '2px 4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '4px'
                            }}
                        >
                            <Minus size={13} />
                        </button>
                    )}
                </div>
            </div>

            {subtasks.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0' }}>
                    {subtasks.map((st, index) => {
                        const isDraggingThis = draggedSubtaskIndex === index;
                        const isTargetThis = dragOverSubtaskInfo?.index === index;
                        const targetPosition = dragOverSubtaskInfo?.position;

                        const showTopIndicator = isTargetThis && targetPosition === 'before' && (
                            draggedSubtaskIndex !== index && draggedSubtaskIndex !== index - 1
                        );
                        const showBottomIndicator = isTargetThis && targetPosition === 'after' && (
                            draggedSubtaskIndex !== index && draggedSubtaskIndex !== index + 1
                        );

                        return (
                            <li
                                key={st.id}
                                data-subtask-index={index}
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', String(index));
                                    e.dataTransfer.effectAllowed = 'move';
                                    setDraggedSubtaskIndex(index);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = e.clientY < (rect.top + rect.height / 2) ? 'before' : 'after';
                                    if (!dragOverSubtaskInfo || dragOverSubtaskInfo.index !== index || dragOverSubtaskInfo.position !== pos) {
                                        setDragOverSubtaskInfo({ index, position: pos });
                                    }
                                }}
                                onDragLeave={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setDragOverSubtaskInfo(prev => prev?.index === index ? null : prev);
                                    }
                                }}
                                onDragEnd={() => {
                                    setDraggedSubtaskIndex(null);
                                    setDragOverSubtaskInfo(null);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const fromIndex = draggedSubtaskIndex ?? parseInt(e.dataTransfer.getData('text/plain'), 10);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = dragOverSubtaskInfo?.position || (e.clientY < (rect.top + rect.height / 2) ? 'before' : 'after');
                                    if (typeof fromIndex === 'number' && !isNaN(fromIndex)) {
                                        onChangeSubtasks(reorderList(subtasks, fromIndex, index, pos));
                                    }
                                    setDraggedSubtaskIndex(null);
                                    setDragOverSubtaskInfo(null);
                                }}
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    padding: '4px 2px',
                                    borderBottom: '1px solid var(--border-color)',
                                    opacity: isDraggingThis ? 0.35 : 1,
                                    background: isDraggingThis ? 'var(--accent-bg, rgba(59, 130, 246, 0.05))' : 'transparent',
                                    borderRadius: '4px',
                                    gap: '8px',
                                    transition: 'opacity 0.15s ease, background 0.15s ease'
                                }}
                            >
                                {/* Insertion drop line indicator */}
                                {(showTopIndicator || showBottomIndicator) && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: showTopIndicator ? '-2px' : 'auto',
                                            bottom: showBottomIndicator ? '-2px' : 'auto',
                                            left: '0px',
                                            right: '0px',
                                            height: '3px',
                                            background: 'var(--accent-color)',
                                            borderRadius: '1.5px',
                                            boxShadow: '0 0 8px var(--accent-color)',
                                            zIndex: 100,
                                            pointerEvents: 'none',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '7px',
                                                height: '7px',
                                                borderRadius: '50%',
                                                background: 'var(--accent-color)',
                                                marginLeft: '-3px',
                                                boxShadow: '0 0 6px var(--accent-color)'
                                            }}
                                        />
                                    </div>
                                )}
                                <div
                                    className="subtask-drag-handle"
                                    onTouchStart={(e) => handleSubtaskTouchStart(e, index)}
                                    onMouseDown={() => {
                                        if (window.getSelection) {
                                            window.getSelection().removeAllRanges();
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isDraggingThis ? 'grabbing' : 'grab',
                                        padding: '6px 8px',
                                        minWidth: '32px',
                                        minHeight: '32px',
                                        color: isDraggingThis ? 'var(--accent-color)' : 'var(--muted-text)',
                                        opacity: isDraggingThis ? 1 : 0.7,
                                        flexShrink: 0,
                                        touchAction: 'none',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        borderRadius: '6px',
                                        background: 'var(--border-color, rgba(0,0,0,0.05))'
                                    }}
                                    title="Drag to rearrange subtask (or use Alt+Up / Alt+Down)"
                                    aria-label="Drag to rearrange subtask"
                                >
                                    <GripVertical size={16} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', margin: '0 6px' }}>
                                    <textarea
                                        ref={(el) => {
                                            if (el) {
                                                el.style.height = 'auto';
                                                el.style.height = `${Math.max(el.scrollHeight, 28)}px`;
                                            }
                                        }}
                                        value={st.text}
                                        rows={1}
                                        draggable={false}
                                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onKeyDown={(e) => {
                                            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                                                e.preventDefault();
                                                if (e.key === 'ArrowUp' && index > 0) {
                                                    onChangeSubtasks(reorderList(subtasks, index, index - 1, 'before'));
                                                } else if (e.key === 'ArrowDown' && index < subtasks.length - 1) {
                                                    onChangeSubtasks(reorderList(subtasks, index, index + 1, 'after'));
                                                }
                                            }
                                        }}
                                        onChange={(e) => {
                                            const updatedText = e.target.value;
                                            onChangeSubtasks(subtasks.map(s => s.id === st.id ? { ...s, text: updatedText } : s));
                                        }}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${Math.max(e.target.scrollHeight, 28)}px`;
                                        }}
                                        placeholder={itemPlaceholder}
                                        style={{
                                            width: '100%',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '1.05rem',
                                            fontWeight: '500',
                                            color: st.completed ? 'var(--muted-text)' : 'var(--text-color)',
                                            textDecoration: st.completed ? 'line-through' : 'none',
                                            outline: 'none',
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            fontFamily: 'inherit',
                                            resize: 'none',
                                            overflowY: 'hidden',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: '1.4',
                                            minHeight: '28px',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.background = 'var(--bg-color)';
                                            e.target.style.boxShadow = '0 0 0 1.5px var(--accent-color)';
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${Math.max(e.target.scrollHeight, 28)}px`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.background = 'transparent';
                                            e.target.style.boxShadow = 'none';
                                            if (!st.text.trim()) {
                                                onChangeSubtasks(subtasks.filter(s => s.id !== st.id));
                                            }
                                        }}
                                    />
                                </div>
                                <input
                                    type="checkbox"
                                    draggable={false}
                                    onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    checked={st.completed}
                                    onChange={() => {
                                        onChangeSubtasks(toggleSubtaskStatus(subtasks, st.id));
                                    }}
                                    aria-label={st.completed ? "Mark subtask incomplete" : "Mark subtask completed"}
                                    title={st.completed ? "Mark incomplete" : "Mark completed"}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px', flexShrink: 0, marginTop: '6px', marginRight: '4px' }}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}

            <div style={{ display: 'flex', gap: '6px' }}>
                <textarea
                    rows={1}
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.max(e.target.scrollHeight, 38)}px`;
                    }}
                    placeholder={addPlaceholder}
                    style={{
                        flex: 1,
                        padding: '8px 10px',
                        fontSize: '1.05rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'var(--item-bg)',
                        color: 'var(--text-color)',
                        resize: 'none',
                        overflowY: 'hidden',
                        fontFamily: 'inherit',
                        lineHeight: '1.35',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        minHeight: '38px',
                        boxSizing: 'border-box',
                        outline: 'none'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddSubtask();
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={handleAddSubtask}
                    style={{
                        padding: '8px 16px',
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        alignSelf: 'flex-start'
                    }}
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default SubtasksEditor;
