import React, { useState } from 'react';
import { Trash2, RotateCcw, Plus, Minus, Square, CheckSquare, Calendar, Flag, PauseCircle, Edit2, Slash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITIES, SWIPE_ACTIONS } from '../../utils/constants';

const ACTION_ICONS = {
    CheckSquare,
    Trash2,
    Flag,
    PauseCircle,
    Edit2,
    Slash
};

const TaskItem = ({ task, isArchived, onComplete, onDelete, onRestore, onEdit, onUpdate, dragHandlers, projectColor, isDragging, isDragOver, showFullDetails, swipeSettings, onSwipeAction }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showQuickSchedule, setShowQuickSchedule] = useState(false);
    const archiveTimeoutRef = React.useRef(null);

    // Swipe Gesture State
    const [swipeOffset, setSwipeOffset] = useState(0);
    const touchStartRef = React.useRef({ x: 0, y: 0 });
    const isSwipingRef = React.useRef(false);

    const handleTouchStart = (e) => {
        if (!swipeSettings?.enabled || isArchived) return;
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        isSwipingRef.current = false;
    };

    const handleTouchMove = (e) => {
        if (!swipeSettings?.enabled || isArchived) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;

        if (!isSwipingRef.current) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                isSwipingRef.current = true;
            } else if (Math.abs(diffY) > 10) {
                return;
            }
        }

        if (isSwipingRef.current) {
            if (e.cancelable) e.preventDefault();
            const clampedOffset = Math.max(-140, Math.min(140, diffX));
            setSwipeOffset(clampedOffset);
        }
    };

    const handleTouchEnd = () => {
        if (!swipeSettings?.enabled || !isSwipingRef.current) {
            setSwipeOffset(0);
            return;
        }
        const THRESHOLD = 75;
        if (swipeOffset > THRESHOLD && swipeSettings.swipeRight !== 'none') {
            onSwipeAction && onSwipeAction(task, swipeSettings.swipeRight);
        } else if (swipeOffset < -THRESHOLD && swipeSettings.swipeLeft !== 'none') {
            onSwipeAction && onSwipeAction(task, swipeSettings.swipeLeft);
        }
        setSwipeOffset(0);
        isSwipingRef.current = false;
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
            fontSize: '1.1rem',
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

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', marginBottom: 'var(--task-margin, 4px)' }}>
            {/* Background Swipe Reveal Layer - Right Swipe (Left Side) */}
            {swipeOffset > 0 && rightSwipeAction && swipeSettings?.swipeRight !== 'none' && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    background: rightSwipeAction.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: '16px',
                    borderRadius: '6px',
                    color: rightSwipeAction.color,
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    gap: '8px',
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    {RightIcon && <RightIcon size={22} style={{ transform: swipeOffset > 75 ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.15s ease' }} />}
                    <span style={{ opacity: swipeOffset > 30 ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                        {rightSwipeAction.label}
                    </span>
                </div>
            )}

            {/* Background Swipe Reveal Layer - Left Swipe (Right Side) */}
            {swipeOffset < 0 && leftSwipeAction && swipeSettings?.swipeLeft !== 'none' && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    background: leftSwipeAction.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '16px',
                    borderRadius: '6px',
                    color: leftSwipeAction.color,
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    gap: '8px',
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    <span style={{ opacity: Math.abs(swipeOffset) > 30 ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                        {leftSwipeAction.label}
                    </span>
                    {LeftIcon && <LeftIcon size={22} style={{ transform: Math.abs(swipeOffset) > 75 ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.15s ease' }} />}
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
                    position: 'relative',
                    zIndex: 2
                }}
                draggable={!isArchived}
                {...(dragHandlers || {})}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onClick={() => !isArchived && onEdit && onEdit(task)}
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
            <div style={styles.taskPriorityDot}></div>
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
                                📅 {task.scheduledDate}
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
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRestore(task.id); }}
                            style={{ ...styles.actionBtn, color: '#3b82f6' }}
                            title="Restore Task"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                            style={{ ...styles.actionBtn, color: '#dc2626' }}
                            title="Delete Task"
                        >
                            <Trash2 size={20} />
                        </button>
                    </>
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
