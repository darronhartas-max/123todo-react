import React, { useState } from 'react';
import { Trash2, RotateCcw, Plus, Minus, Square, CheckSquare, Calendar, Flag, PauseCircle, Edit2, Slash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITIES, SWIPE_ACTIONS } from '../../utils/constants';
import { formatDisplayDate } from '../../utils/dateUtils';

const ACTION_ICONS = {
    CheckSquare,
    Trash2,
    Flag,
    PauseCircle,
    Edit2,
    Slash
};

const TaskItem = ({ task, isArchived, onComplete, onDelete, onRestore, onEdit, onUpdate, dragHandlers, projectColor, isDragging, isDragOver, showFullDetails, swipeSettings, onSwipeAction, dateFormat = 'UK' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showQuickSchedule, setShowQuickSchedule] = useState(false);
    const archiveTimeoutRef = React.useRef(null);

    // Swipe Gesture State & Visual Damping
    const [swipeOffset, setSwipeOffset] = useState(0);
    const touchStartRef = React.useRef({ x: 0, y: 0 });
    const isSwipingRef = React.useRef(false);
    const wasSwipingRef = React.useRef(false);

    const THRESHOLD = 75;

    const applyDamping = (diffX) => {
        const absX = Math.abs(diffX);
        if (absX <= THRESHOLD) return diffX;
        const over = absX - THRESHOLD;
        const dampedOver = over * 0.35;
        return Math.sign(diffX) * (THRESHOLD + dampedOver);
    };

    const handleStart = (clientX, clientY) => {
        if (!swipeSettings?.enabled || isArchived) return;
        touchStartRef.current = { x: clientX, y: clientY };
        isSwipingRef.current = false;
        wasSwipingRef.current = false;
    };

    const handleMove = (clientX, clientY, e) => {
        if (!swipeSettings?.enabled || isArchived) return;
        const diffX = clientX - touchStartRef.current.x;
        const diffY = clientY - touchStartRef.current.y;

        if (!isSwipingRef.current) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 6) {
                isSwipingRef.current = true;
                wasSwipingRef.current = true;
            } else if (Math.abs(diffY) > 6) {
                return;
            }
        }

        if (isSwipingRef.current) {
            if (e && e.cancelable) e.preventDefault();
            const rawOffset = applyDamping(diffX);
            const clampedOffset = Math.max(-160, Math.min(160, rawOffset));
            setSwipeOffset(clampedOffset);
        }
    };

    const handleEnd = () => {
        if (!swipeSettings?.enabled || !isSwipingRef.current) {
            setSwipeOffset(0);
            isSwipingRef.current = false;
            setTimeout(() => { wasSwipingRef.current = false; }, 100);
            return;
        }
        if (swipeOffset >= THRESHOLD && swipeSettings.swipeRight !== 'none') {
            onSwipeAction && onSwipeAction(task, swipeSettings.swipeRight);
        } else if (swipeOffset <= -THRESHOLD && swipeSettings.swipeLeft !== 'none') {
            onSwipeAction && onSwipeAction(task, swipeSettings.swipeLeft);
        }
        setSwipeOffset(0);
        isSwipingRef.current = false;
        setTimeout(() => { wasSwipingRef.current = false; }, 100);
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY, e);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    const handlePointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        handleStart(e.clientX, e.clientY);
    };

    const handlePointerMove = (e) => {
        if (touchStartRef.current.x === 0 && touchStartRef.current.y === 0) return;
        handleMove(e.clientX, e.clientY, e);
    };

    const handlePointerUp = () => {
        handleEnd();
        touchStartRef.current = { x: 0, y: 0 };
    };

    const handleComplete = (e) => {
        e.stopPropagation();
        if (isChecked) {
            setIsChecked(false);
            if (archiveTimeoutRef.current) {
                clearTimeout(archiveTimeoutRef.current);
                archiveTimeoutRef.current = null;
            }
        } else {
            setIsChecked(true);
            archiveTimeoutRef.current = setTimeout(() => {
                onComplete(task.id);
            }, 600);
        }
    };

    React.useEffect(() => {
        return () => {
            if (archiveTimeoutRef.current) {
                clearTimeout(archiveTimeoutRef.current);
            }
        };
    }, []);



    const getRecurrenceText = (rec) => {
        if (!rec) return '';
        const { frequency = 1, interval = 'days', daysOfWeek = [] } = rec;
        const intervalLabel = frequency === 1 
            ? (interval === 'days' ? 'day' : interval === 'weeks' ? 'week' : interval === 'months' ? 'month' : 'year')
            : (interval === 'days' ? 'days' : interval === 'weeks' ? 'weeks' : interval === 'months' ? 'months' : 'years');
            
        const freqText = frequency === 1 ? 'Every' : `Every ${frequency}`;
        
        if (interval === 'weeks' && daysOfWeek && daysOfWeek.length > 0) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const selectedDays = daysOfWeek.map(d => dayNames[d]).join(', ');
            return `${freqText} week on ${selectedDays}`;
        }
        
        return `${freqText} ${intervalLabel}`;
    };

    const styles = {
        taskItem: {
            display: 'flex',
            padding: 'var(--task-padding, 10px 12px)',
            borderTop: isDragging ? '1px solid var(--accent-color)' : '1px solid transparent',
            borderRight: isDragging ? '1px solid var(--accent-color)' : '1px solid transparent',
            borderBottom: isDragging ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
            borderLeft: projectColor ? `6px solid ${projectColor}` : (task.isSample ? '6px solid #0ea5e9' : (isDragging ? '1px solid var(--accent-color)' : 'none')),
            background: task.isSample ? 'rgba(14, 165, 233, 0.1)' : 'var(--item-bg)',
            cursor: isArchived ? 'default' : 'move',
            borderRadius: '6px',
            marginBottom: 'var(--task-margin, 4px)',
            transition: 'background 0.2s ease, border-color 0.2s ease, opacity 0.15s ease',
            position: 'relative',
            alignItems: 'flex-start',
            paddingTop: 'var(--task-padding-top, 12px)',
            opacity: isDragging ? 0.35 : 1,
            boxShadow: isDragging ? 'none' : 'none'
        },
        taskPriorityDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            marginRight: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: PRIORITIES[task.priority]?.dotColor || 'var(--muted-text)',
            marginTop: '6px'
        },
        taskText: {
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: 'var(--task-font-size, 1.1rem)',
            color: 'var(--text-color)',
            cursor: isArchived ? 'default' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            textAlign: 'left',
            fontWeight: '500'
        },
        actionBtn: {
            background: 'transparent',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            marginLeft: '8px',
            borderRadius: '50%',
            padding: '6px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
        }
    };

    const subtasksCount = (task.subtasks || []).length;
    const completedCount = (task.subtasks || []).filter(s => s.completed).length;

    const rightSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeRight ? SWIPE_ACTIONS[swipeSettings.swipeRight] : null;
    const leftSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeLeft ? SWIPE_ACTIONS[swipeSettings.swipeLeft] : null;

    const RightIcon = rightSwipeAction ? ACTION_ICONS[rightSwipeAction.icon] || CheckSquare : null;
    const LeftIcon = leftSwipeAction ? ACTION_ICONS[leftSwipeAction.icon] || Trash2 : null;

    const isRightArmed = swipeOffset >= THRESHOLD && swipeSettings?.swipeRight !== 'none';
    const isLeftArmed = Math.abs(swipeOffset) >= THRESHOLD && swipeOffset < 0 && swipeSettings?.swipeLeft !== 'none';
    const rightProgress = Math.min(1, Math.max(0, swipeOffset / THRESHOLD));
    const leftProgress = Math.min(1, Math.max(0, Math.abs(swipeOffset) / THRESHOLD));

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', marginBottom: 'var(--task-margin, 4px)' }}>
            {/* Background Swipe Reveal Layer - Right Swipe (Left Side) */}
            {swipeOffset > 0 && rightSwipeAction && swipeSettings?.swipeRight !== 'none' && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    background: isRightArmed ? (rightSwipeAction.activeBg || rightSwipeAction.color) : rightSwipeAction.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: `${Math.min(32, Math.max(16, swipeOffset * 0.25))}px`,
                    borderRadius: '6px',
                    color: isRightArmed ? (rightSwipeAction.activeColor || '#ffffff') : rightSwipeAction.color,
                    fontWeight: isRightArmed ? '800' : '600',
                    fontSize: '0.95rem',
                    gap: '10px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'background 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease',
                    boxShadow: isRightArmed ? `inset 0 0 20px rgba(0,0,0,0.1)` : 'none'
                }}>
                    <motion.div
                        animate={{
                            scale: isRightArmed ? 1.25 : (0.8 + rightProgress * 0.2),
                            rotate: isRightArmed ? [0, -8, 0] : 0
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isRightArmed ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                            backdropFilter: isRightArmed ? 'blur(4px)' : 'none',
                            boxShadow: isRightArmed ? '0 0 12px rgba(255, 255, 255, 0.4)' : 'none'
                        }}
                    >
                        {RightIcon && <RightIcon size={22} color={isRightArmed ? '#ffffff' : rightSwipeAction.color} />}
                    </motion.div>
                    <motion.span
                        animate={{
                            opacity: rightProgress > 0.2 ? 1 : 0,
                            x: isRightArmed ? 2 : 0,
                            scale: isRightArmed ? 1.05 : 1
                        }}
                        transition={{ duration: 0.15 }}
                        style={{
                            letterSpacing: isRightArmed ? '0.02em' : 'normal',
                            textShadow: isRightArmed ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        {isRightArmed ? (rightSwipeAction.actionHint || rightSwipeAction.label) : rightSwipeAction.label}
                    </motion.span>

                    {/* Threshold Snap Notch Marker when swiping below threshold */}
                    {!isRightArmed && (
                        <div style={{
                            position: 'absolute',
                            left: `${THRESHOLD}px`,
                            top: '20%',
                            bottom: '20%',
                            width: '2px',
                            background: rightSwipeAction.color,
                            opacity: 0.35,
                            borderRadius: '1px'
                        }} />
                    )}
                </div>
            )}

            {/* Background Swipe Reveal Layer - Left Swipe (Right Side) */}
            {swipeOffset < 0 && leftSwipeAction && swipeSettings?.swipeLeft !== 'none' && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    background: isLeftArmed ? (leftSwipeAction.activeBg || leftSwipeAction.color) : leftSwipeAction.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: `${Math.min(32, Math.max(16, Math.abs(swipeOffset) * 0.25))}px`,
                    borderRadius: '6px',
                    color: isLeftArmed ? (leftSwipeAction.activeColor || '#ffffff') : leftSwipeAction.color,
                    fontWeight: isLeftArmed ? '800' : '600',
                    fontSize: '0.95rem',
                    gap: '10px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'background 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease',
                    boxShadow: isLeftArmed ? `inset 0 0 20px rgba(0,0,0,0.1)` : 'none'
                }}>
                    <motion.span
                        animate={{
                            opacity: leftProgress > 0.2 ? 1 : 0,
                            x: isLeftArmed ? -2 : 0,
                            scale: isLeftArmed ? 1.05 : 1
                        }}
                        transition={{ duration: 0.15 }}
                        style={{
                            letterSpacing: isLeftArmed ? '0.02em' : 'normal',
                            textShadow: isLeftArmed ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        {isLeftArmed ? (leftSwipeAction.actionHint || leftSwipeAction.label) : leftSwipeAction.label}
                    </motion.span>
                    <motion.div
                        animate={{
                            scale: isLeftArmed ? 1.25 : (0.8 + leftProgress * 0.2),
                            rotate: isLeftArmed ? [0, 8, 0] : 0
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isLeftArmed ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                            backdropFilter: isLeftArmed ? 'blur(4px)' : 'none',
                            boxShadow: isLeftArmed ? '0 0 12px rgba(255, 255, 255, 0.4)' : 'none'
                        }}
                    >
                        {LeftIcon && <LeftIcon size={22} color={isLeftArmed ? '#ffffff' : leftSwipeAction.color} />}
                    </motion.div>

                    {/* Threshold Snap Notch Marker when swiping below threshold */}
                    {!isLeftArmed && (
                        <div style={{
                            position: 'absolute',
                            right: `${THRESHOLD}px`,
                            top: '20%',
                            bottom: '20%',
                            width: '2px',
                            background: leftSwipeAction.color,
                            opacity: 0.35,
                            borderRadius: '1px'
                        }} />
                    )}
                </div>
            )}

            <motion.li
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    ...styles.taskItem,
                    marginBottom: 0,
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s ease, border-color 0.2s ease, opacity 0.15s ease' : 'background 0.2s ease, border-color 0.2s ease, opacity 0.15s ease',
                    touchAction: 'pan-y',
                    userSelect: swipeOffset !== 0 ? 'none' : 'auto',
                    WebkitUserSelect: swipeOffset !== 0 ? 'none' : 'auto',
                    position: 'relative',
                    zIndex: 2
                }}
                draggable={!isArchived}
                {...(dragHandlers ? {
                    ...dragHandlers,
                    onDragStart: (e) => {
                        if (isSwipingRef.current || Math.abs(swipeOffset) > 5) {
                            e.preventDefault();
                            return;
                        }
                        if (dragHandlers.onDragStart) dragHandlers.onDragStart(e);
                    }
                } : {})}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={(e) => {
                    if (wasSwipingRef.current || isSwipingRef.current || Math.abs(swipeOffset) > 5) {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    if (!isArchived && onEdit) onEdit(task);
                }}
                onMouseEnter={() => !isArchived && setIsHovered(true)}
                onMouseLeave={() => !isArchived && setIsHovered(false)}
            >
            {isDragOver && (
                <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '8px',
                    right: '8px',
                    height: '3px',
                    background: 'var(--accent-color)',
                    borderRadius: '1.5px',
                    boxShadow: '0 0 8px var(--accent-color)',
                    zIndex: 100,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                        marginLeft: '-4px',
                        boxShadow: '0 0 6px var(--accent-color)'
                    }} />
                </div>
            )}
            {isArchived ? (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                    style={{
                        ...styles.actionBtn,
                        color: '#ef4444',
                        marginLeft: '0',
                        marginRight: '8px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        width: '34px',
                        height: '34px',
                        minWidth: '34px',
                        marginTop: '2px',
                        flexShrink: 0
                    }}
                    title="Permanently Delete Task"
                >
                    <Trash2 size={18} />
                </button>
            ) : (
                <div style={styles.taskPriorityDot}></div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {task.notes && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
                            style={{
                                ...styles.actionBtn,
                                marginLeft: '0',
                                marginRight: '4px',
                                color: 'var(--accent-color)',
                                width: '36px',
                                height: '36px',
                                minWidth: '36px',
                                background: 'rgba(37, 99, 235, 0.05)'
                            }}
                            title={showNotes ? "Hide Notes" : "Show Notes"}
                        >
                            {showNotes ? <Minus size={21} /> : <Plus size={21} />}
                        </button>
                    )}
                    <span style={styles.taskText}>{task.text}</span>
                </div>

                {/* Scheduled / Recurrence details */}
                {showFullDetails && ((task.scheduledDate && !isArchived) || task.isRecurring || task.deferCount > 0) && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--muted-text)',
                        marginTop: '4px',
                        flexWrap: 'wrap'
                    }}>
                        {task.scheduledDate && !isArchived && (
                            <span style={{
                                background: 'rgba(37, 99, 235, 0.08)',
                                color: 'var(--accent-color)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                            }}>
                                📅 {formatDisplayDate(task.scheduledDate, dateFormat)}
                            </span>
                        )}
                        {task.isRecurring && task.recurrence && (
                            <span style={{
                                background: 'rgba(16, 185, 129, 0.08)',
                                color: '#10b981',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                            }}>
                                🔁 {getRecurrenceText(task.recurrence)}
                            </span>
                        )}
                        {task.deferCount > 0 && !isArchived && (
                            <span style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#ef4444',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }} title={`This task has been deferred ${task.deferCount} times`}>
                                ⚠️ Deferred {task.deferCount}x
                            </span>
                        )}
                    </div>
                )}

                {/* Quick Defer Inline Calendar */}
                {showQuickSchedule && (
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--surface-color)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            width: 'fit-content',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--muted-text)' }}>Defer:</span>
                        <input
                            type="date"
                            value={task.scheduledDate || ''}
                            onChange={(e) => {
                                const newDate = e.target.value || null;
                                onUpdate(task.id, { scheduledDate: newDate });
                                setShowQuickSchedule(false);
                            }}
                            style={{
                                padding: '3px 6px',
                                fontSize: '0.85rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--item-bg)',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={() => setShowQuickSchedule(false)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                marginLeft: '4px'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Subtask indicator and checklist */}
                {subtasksCount > 0 && (
                    <div style={{ marginTop: '8px', width: '100%', paddingRight: '8px', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--muted-text)' }}>
                                📋 Steps: {completedCount}/{subtasksCount}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-color)' }}>
                                {Math.round((completedCount / subtasksCount) * 100)}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '4px',
                            background: 'var(--border-color)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginBottom: '6px'
                        }}>
                            <div style={{
                                width: `${(completedCount / subtasksCount) * 100}%`,
                                height: '100%',
                                background: 'var(--accent-color)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                )}

                {showNotes && task.notes && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                            fontSize: '1.1rem',
                            color: 'var(--muted-text)',
                            marginTop: '8px',
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '6px',
                            borderLeft: '3px solid var(--accent-color)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: '1.4',
                            overflow: 'visible'
                        }}
                    >
                        {task.notes}
                    </motion.div>
                )}
            </div>

            <div style={{ display: 'flex' }}>
                {isArchived ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRestore(task.id); }}
                        style={{
                            ...styles.actionBtn,
                            color: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.08)',
                            width: '34px',
                            height: '34px',
                            minWidth: '34px',
                            marginTop: '2px'
                        }}
                        title="Restore Task"
                    >
                        <RotateCcw size={18} />
                    </button>
                ) : (
                    <>
                        {task.scheduledDate && (
                            <motion.button
                                onClick={(e) => { e.stopPropagation(); setShowQuickSchedule(!showQuickSchedule); }}
                                style={{
                                    ...styles.actionBtn,
                                    color: 'var(--accent-color)',
                                    background: showQuickSchedule ? 'var(--accent-bg)' : 'transparent',
                                    border: '1px solid var(--accent-color)',
                                    marginRight: '6px',
                                    opacity: 1.0
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Change schedule / Defer task"
                            >
                                <Calendar size={18} />
                            </motion.button>
                        )}
                        <motion.button
                            onClick={handleComplete}
                            style={{
                                ...styles.actionBtn,
                                color: isChecked ? '#10b981' : 'var(--muted-text)',
                                background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                            title={isChecked ? "Cancel completion" : "Complete Task"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isChecked ? (
                                    <motion.div
                                        key="check"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        <CheckSquare size={18} strokeWidth={2.5} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="square"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        <Square size={18} opacity={isHovered ? 1.0 : 0.6} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </>
                )}
            </div>
        </motion.li>
        </div>
    );
};

export default TaskItem;
