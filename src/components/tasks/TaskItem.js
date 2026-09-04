import React, { useState } from 'react';
import { Trash2, RotateCcw, Square, CheckSquare, Calendar, Repeat, Flag, PauseCircle, Edit2, Slash, FileText, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SWIPE_ACTIONS } from '../../utils/constants';
import { formatDisplayDate, getNextWeekDateString } from '../../utils/dateUtils';

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
    const [showQuickSchedule, setShowQuickSchedule] = useState(false);
    const [showNotesExpanded, setShowNotesExpanded] = useState(false);
    const [showSubtasksExpanded, setShowSubtasksExpanded] = useState(false);
    const [draggedSubtaskIndex, setDraggedSubtaskIndex] = useState(null);
    const [dragOverSubtaskIndex, setDragOverSubtaskIndex] = useState(null);
    const archiveTimeoutRef = React.useRef(null);

    // Swipe Gesture State & Visual Damping
    const [swipeOffset, setSwipeOffset] = useState(0);
    const touchStartRef = React.useRef({ x: 0, y: 0 });
    const isSwipingRef = React.useRef(false);
    const wasSwipingRef = React.useRef(false);
    const isScrollingVerticalRef = React.useRef(false);

    const THRESHOLD = 65;

    const applyDamping = (diffX) => {
        const absX = Math.abs(diffX);
        if (absX <= THRESHOLD) return diffX;
        const over = absX - THRESHOLD;
        const dampedOver = over * 0.55;
        return Math.sign(diffX) * (THRESHOLD + dampedOver);
    };

    const handleStart = (clientX, clientY) => {
        if (!swipeSettings?.enabled || isArchived) return;
        touchStartRef.current = { x: clientX, y: clientY };
        isSwipingRef.current = false;
        wasSwipingRef.current = false;
        isScrollingVerticalRef.current = false;
    };

    const handleMove = (clientX, clientY, e) => {
        if (!swipeSettings?.enabled || isArchived || isScrollingVerticalRef.current) return;
        const diffX = clientX - touchStartRef.current.x;
        const diffY = clientY - touchStartRef.current.y;

        // If vertical movement is detected (scrolling down/up the screen), immediately CANCEL and lock out swiping!
        if (Math.abs(diffY) > 14 || (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8)) {
            isScrollingVerticalRef.current = true;
            isSwipingRef.current = false;
            setSwipeOffset(0);
            return;
        }

        if (!isSwipingRef.current) {
            // Require clear horizontal intent (horizontal distance exceeds vertical by 2x and > 14px)
            if (Math.abs(diffX) > Math.abs(diffY) * 2 && Math.abs(diffX) > 14) {
                isSwipingRef.current = true;
                wasSwipingRef.current = true;
            }
        }

        if (isSwipingRef.current) {
            if (e && e.cancelable) e.preventDefault();
            const rawOffset = applyDamping(diffX);
            const clampedOffset = Math.max(-240, Math.min(240, rawOffset));
            setSwipeOffset(clampedOffset);
        }
    };

    const handleEnd = () => {
        if (!swipeSettings?.enabled || !isSwipingRef.current || isScrollingVerticalRef.current) {
            setSwipeOffset(0);
            isSwipingRef.current = false;
            isScrollingVerticalRef.current = false;
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
        isScrollingVerticalRef.current = false;
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
        if (e.pointerType === 'mouse') return;
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

    const onCompleteRef = React.useRef(onComplete);
    const lastCompleteTimeRef = React.useRef(0);
    const isCompletingRef = React.useRef(false);

    React.useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Reset local checked state whenever task ID or archive status changes
    React.useEffect(() => {
        setIsChecked(false);
        isCompletingRef.current = false;
        if (archiveTimeoutRef.current) {
            clearTimeout(archiveTimeoutRef.current);
            archiveTimeoutRef.current = null;
        }
    }, [task.id, isArchived]);

    const handleComplete = (e) => {
        if (e) {
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault && e.cancelable) e.preventDefault();
        }
        
        // Block completion click if user was swiping or vertical scrolling
        if (wasSwipingRef.current || isSwipingRef.current || isScrollingVerticalRef.current) return;

        // Prevent double trigger / mid-flight cancellation
        if (isCompletingRef.current) return;

        const now = Date.now();
        if (now - lastCompleteTimeRef.current < 250) return;
        lastCompleteTimeRef.current = now;

        isCompletingRef.current = true;
        setIsChecked(true);

        if (archiveTimeoutRef.current) {
            clearTimeout(archiveTimeoutRef.current);
        }

        archiveTimeoutRef.current = setTimeout(() => {
            archiveTimeoutRef.current = null;
            setIsChecked(false);
            isCompletingRef.current = false;
            if (onCompleteRef.current) {
                onCompleteRef.current(task.id);
            }
        }, 300);
    };

    React.useEffect(() => {
        return () => {
            if (archiveTimeoutRef.current) {
                clearTimeout(archiveTimeoutRef.current);
                archiveTimeoutRef.current = null;
                setIsChecked(false);
                isCompletingRef.current = false;
                if (onCompleteRef.current) {
                    onCompleteRef.current(task.id);
                }
            }
        };
    }, [task.id]);



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

    const subtasksCount = (task.subtasks || []).length;
    const completedCount = (task.subtasks || []).filter(s => s.completed).length;

    const hasExtraDetails = Boolean(
        (showFullDetails && ((task.scheduledDate && !isArchived) || task.isRecurring || task.deferCount > 0)) ||
        showQuickSchedule ||
        subtasksCount > 0 ||
        (showFullDetails && task.notes)
    );

    const styles = {
        taskItem: {
            display: 'flex',
            width: '100%',
            boxSizing: 'border-box',
            padding: 'var(--task-padding, 6px 10px)',
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
            alignItems: hasExtraDetails ? 'flex-start' : 'center',
            paddingTop: 'var(--task-padding-top, 6px)',
            paddingBottom: 'var(--task-padding-bottom, 6px)',
            opacity: isDragging ? 0.35 : 1,
            boxShadow: isDragging ? 'none' : 'none'
        },
        taskText: {
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: 'var(--task-font-size, 1.05rem)',
            color: 'var(--text-color)',
            cursor: isArchived ? 'default' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'normal',
            textAlign: 'left',
            fontWeight: '400',
            lineHeight: '1.35',
            margin: 0,
            minWidth: 0
        },
        actionBtn: {
            background: 'transparent',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            marginLeft: '2px',
            borderRadius: '50%',
            padding: '2px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            flexShrink: 0
        }
    };



    const rightSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeRight ? SWIPE_ACTIONS[swipeSettings.swipeRight] : null;
    const leftSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeLeft ? SWIPE_ACTIONS[swipeSettings.swipeLeft] : null;

    const RightIcon = rightSwipeAction ? ACTION_ICONS[rightSwipeAction.icon] || CheckSquare : null;
    const LeftIcon = leftSwipeAction ? ACTION_ICONS[leftSwipeAction.icon] || Trash2 : null;

    const isRightArmed = swipeOffset >= THRESHOLD && swipeSettings?.swipeRight !== 'none';
    const isLeftArmed = Math.abs(swipeOffset) >= THRESHOLD && swipeOffset < 0 && swipeSettings?.swipeLeft !== 'none';
    const rightProgress = Math.min(1, Math.max(0, swipeOffset / THRESHOLD));
    const leftProgress = Math.min(1, Math.max(0, Math.abs(swipeOffset) / THRESHOLD));

    // Haptic vibration feedback on threshold crossing
    const prevArmedRef = React.useRef(false);
    React.useEffect(() => {
        const armed = isRightArmed || isLeftArmed;
        if (armed && !prevArmedRef.current) {
            if (navigator.vibrate) {
                try { navigator.vibrate(12); } catch {}
            }
        }
        prevArmedRef.current = armed;
    }, [isRightArmed, isLeftArmed]);

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', marginBottom: 'var(--task-margin, 4px)' }}>
            {/* Background Swipe Reveal Layer - Right Swipe (Left Side) */}
            {swipeOffset > 0 && rightSwipeAction && swipeSettings?.swipeRight !== 'none' && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    background: isRightArmed 
                        ? (rightSwipeAction.activeBg || rightSwipeAction.color) 
                        : `linear-gradient(90deg, ${rightSwipeAction.color}e6 0%, ${rightSwipeAction.color}b3 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingLeft: `${Math.max(8, Math.min(16, swipeOffset * 0.2))}px`,
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontWeight: isRightArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '6px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'background 0.15s ease',
                    boxShadow: isRightArmed ? `inset 0 0 24px rgba(0,0,0,0.2)` : 'none'
                }}>
                    <motion.div
                        animate={{
                            scale: isRightArmed ? 1.25 : (0.85 + rightProgress * 0.25),
                            rotate: isRightArmed ? [0, -10, 0] : 0
                        }}
                        transition={{ type: "spring", stiffness: 550, damping: 18 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: isRightArmed ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                            boxShadow: isRightArmed ? '0 0 14px rgba(255, 255, 255, 0.6)' : 'none',
                            flexShrink: 0
                        }}
                    >
                        {RightIcon && <RightIcon size={18} color="#ffffff" />}
                    </motion.div>
                    <motion.span
                        animate={{
                            opacity: Math.min(1, Math.abs(swipeOffset) / 10),
                            x: isRightArmed ? 4 : 0,
                            scale: isRightArmed ? 1.05 : 1
                        }}
                        transition={{ duration: 0.12 }}
                        style={{
                            color: '#ffffff',
                            letterSpacing: '0.02em',
                            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {rightSwipeAction.actionHint || rightSwipeAction.label}
                    </motion.span>

                    {/* Threshold Snap Notch Marker line */}
                    {!isRightArmed && (
                        <div style={{
                            position: 'absolute',
                            left: `${THRESHOLD}px`,
                            top: '15%',
                            bottom: '15%',
                            width: '3px',
                            background: '#ffffff',
                            opacity: 0.65,
                            borderRadius: '1.5px',
                            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
                        }} />
                    )}
                </div>
            )}

            {/* Background Swipe Reveal Layer - Left Swipe (Right Side) */}
            {swipeOffset < 0 && leftSwipeAction && swipeSettings?.swipeLeft !== 'none' && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    background: isLeftArmed 
                        ? (leftSwipeAction.activeBg || `linear-gradient(270deg, ${leftSwipeAction.color} 0%, ${leftSwipeAction.color}ee 100%)`)
                        : `linear-gradient(270deg, ${leftSwipeAction.color}d9 0%, ${leftSwipeAction.color}80 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: `${Math.max(10, Math.min(24, Math.abs(swipeOffset) * 0.18))}px`,
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontWeight: isLeftArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '8px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isLeftArmed ? `inset 0 0 28px rgba(0,0,0,0.3)` : 'none'
                }}>
                    <motion.span
                        animate={{
                            opacity: Math.min(1, Math.abs(swipeOffset) / 12),
                            x: isLeftArmed ? -4 : 0,
                            scale: isLeftArmed ? 1.08 : 1
                        }}
                        transition={{ duration: 0.12 }}
                        style={{
                            color: '#ffffff',
                            letterSpacing: '0.02em',
                            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                            fontWeight: isLeftArmed ? '800' : '700',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {isLeftArmed ? `Release to ${leftSwipeAction.label}` : (leftSwipeAction.actionHint || leftSwipeAction.label)}
                    </motion.span>
                    <motion.div
                        animate={{
                            scale: isLeftArmed ? 1.35 : (0.85 + leftProgress * 0.3),
                            rotate: isLeftArmed ? [0, 8, 0] : 0
                        }}
                        transition={{ type: "spring", stiffness: 550, damping: 16 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isLeftArmed ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.22)',
                            boxShadow: isLeftArmed ? '0 0 16px rgba(255, 255, 255, 0.7)' : 'none',
                            flexShrink: 0
                        }}
                    >
                        {LeftIcon && <LeftIcon size={19} color="#ffffff" />}
                    </motion.div>

                    {/* Threshold Snap Notch Marker line */}
                    {!isLeftArmed && (
                        <div style={{
                            position: 'absolute',
                            right: `${THRESHOLD}px`,
                            top: '15%',
                            bottom: '15%',
                            width: '3px',
                            background: '#ffffff',
                            opacity: 0.75,
                            borderRadius: '1.5px',
                            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
                        }} />
                    )}
                </div>
            )}

            <motion.li
                layout={false}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, x: swipeOffset }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                    x: swipeOffset !== 0 ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 },
                    opacity: { duration: 0.15 },
                    y: { duration: 0.15 },
                    layout: { duration: 0.2 }
                }}
                style={{
                    ...styles.taskItem,
                    marginBottom: 0,
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
            {isArchived && (
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
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                    <span style={styles.taskText}>{task.text}</span>
                </div>

                {/* Compact Note Preview: first line only in smaller font, space-efficient */}
                {(() => {
                    const firstNoteLine = task.notes ? task.notes.trim().split('\n')[0].trim() : '';
                    if (!firstNoteLine) return null;
                    return (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                color: 'var(--muted-text)',
                                marginTop: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                                lineHeight: '1.25',
                                opacity: 0.85,
                                minWidth: 0
                            }}
                        >
                            <FileText size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {firstNoteLine}
                            </span>
                        </div>
                    );
                })()}

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
                                background: task.isRecurring ? 'rgba(16, 185, 129, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                                color: task.isRecurring ? '#10b981' : 'var(--accent-color)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                            }}>
                                {task.isRecurring ? <Repeat size={12} /> : <Calendar size={12} />} {formatDisplayDate(task.scheduledDate, dateFormat)}
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
                                <Repeat size={12} /> {getRecurrenceText(task.recurrence)}
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
                            type="button"
                            onClick={() => {
                                onUpdate(task.id, { scheduledDate: getNextWeekDateString() });
                                setShowQuickSchedule(false);
                            }}
                            style={{
                                border: '1px solid var(--accent-color)',
                                background: 'var(--accent-bg)',
                                color: 'var(--accent-color)',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                padding: '3px 7px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap'
                            }}
                            title="Defer task for 7 days"
                        >
                            📅 Next Week
                        </button>
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
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowSubtasksExpanded(!showSubtasksExpanded); }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'var(--muted-text)',
                                    padding: 0
                                }}
                            >
                                📋 Steps: {completedCount}/{subtasksCount} ({showSubtasksExpanded ? '▾' : '▸'})
                            </button>
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
                        {showSubtasksExpanded && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0' }}>
                                {(task.subtasks || []).map((st, index) => {
                                    const isDraggingThis = draggedSubtaskIndex === index;
                                    const isOverThis = dragOverSubtaskIndex === index;
                                    return (
                                        <li
                                            key={st.id}
                                            draggable={true}
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', index.toString());
                                                setDraggedSubtaskIndex(index);
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'move';
                                                if (dragOverSubtaskIndex !== index) {
                                                    setDragOverSubtaskIndex(index);
                                                }
                                            }}
                                            onDragEnd={() => {
                                                setDraggedSubtaskIndex(null);
                                                setDragOverSubtaskIndex(null);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const fromIndex = draggedSubtaskIndex ?? parseInt(e.dataTransfer.getData('text/plain'), 10);
                                                const toIndex = index;
                                                if (fromIndex === undefined || fromIndex === null || isNaN(fromIndex) || fromIndex === toIndex) {
                                                    setDraggedSubtaskIndex(null);
                                                    setDragOverSubtaskIndex(null);
                                                    return;
                                                }
                                                const reordered = [...(task.subtasks || [])];
                                                const [moved] = reordered.splice(fromIndex, 1);
                                                reordered.splice(toIndex, 0, moved);
                                                onUpdate && onUpdate(task.id, { subtasks: reordered });
                                                setDraggedSubtaskIndex(null);
                                                setDragOverSubtaskIndex(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '6px',
                                                padding: '3px 0',
                                                borderBottom: '1px dashed var(--border-color)',
                                                borderTop: isOverThis && draggedSubtaskIndex !== index ? '2px solid var(--accent-color)' : '2px solid transparent',
                                                opacity: isDraggingThis ? 0.4 : 1,
                                                transition: 'border-color 0.15s ease, opacity 0.15s ease'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'grab',
                                                    padding: '3px 0',
                                                    color: 'var(--muted-text)',
                                                    opacity: 0.6,
                                                    flexShrink: 0
                                                }}
                                                title="Drag to rearrange subtask"
                                            >
                                                <GripVertical size={14} />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={st.completed}
                                                onChange={() => {
                                                    const updated = (task.subtasks || []).map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                                                    onUpdate && onUpdate(task.id, { subtasks: updated });
                                                }}
                                                style={{ cursor: 'pointer', width: '14px', height: '14px', flexShrink: 0, marginTop: '3px' }}
                                            />
                                            <textarea
                                                ref={(el) => {
                                                    if (el) {
                                                        el.style.height = 'auto';
                                                        el.style.height = `${Math.max(el.scrollHeight, 24)}px`;
                                                    }
                                                }}
                                                value={st.text}
                                                rows={1}
                                                onChange={(e) => {
                                                    const updatedText = e.target.value;
                                                    const updated = (task.subtasks || []).map(s => s.id === st.id ? { ...s, text: updatedText } : s);
                                                    onUpdate && onUpdate(task.id, { subtasks: updated });
                                                }}
                                                onInput={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = `${Math.max(e.target.scrollHeight, 24)}px`;
                                                }}
                                                placeholder="Subtask step..."
                                                style={{
                                                    flex: 1,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    fontSize: '0.88rem',
                                                    color: st.completed ? 'var(--muted-text)' : 'var(--text-color)',
                                                    textDecoration: st.completed ? 'line-through' : 'none',
                                                    outline: 'none',
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    fontFamily: 'inherit',
                                                    resize: 'none',
                                                    overflowY: 'hidden',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: '1.4',
                                                    minHeight: '24px',
                                                    boxSizing: 'border-box'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.background = 'var(--bg-color)';
                                                    e.target.style.boxShadow = '0 0 0 1px var(--accent-color)';
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = `${Math.max(e.target.scrollHeight, 24)}px`;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.background = 'transparent';
                                                    e.target.style.boxShadow = 'none';
                                                    if (!st.text.trim()) {
                                                        const updated = (task.subtasks || []).filter(s => s.id !== st.id);
                                                        onUpdate && onUpdate(task.id, { subtasks: updated });
                                                    }
                                                }}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}

                {showFullDetails && task.notes && (
                    <div style={{ marginTop: '6px' }}>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setShowNotesExpanded(!showNotesExpanded); }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: showNotesExpanded ? 'var(--accent-bg)' : 'var(--item-bg)',
                                color: showNotesExpanded ? 'var(--accent-color)' : 'var(--muted-text)',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: '600'
                            }}
                        >
                            {showNotesExpanded ? '▾ Hide Notes' : '▸ Full Notes'}
                        </button>
                        <AnimatePresence>
                            {showNotesExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    style={{
                                        fontSize: '0.92rem',
                                        color: 'var(--muted-text)',
                                        marginTop: '6px',
                                        padding: '8px 12px',
                                        background: 'rgba(0,0,0,0.03)',
                                        borderRadius: '6px',
                                        borderLeft: '3px solid var(--accent-color)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        lineHeight: '1.4',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {task.notes}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: '8px', alignSelf: hasExtraDetails ? 'flex-start' : 'center', marginTop: hasExtraDetails ? '2px' : '0' }}>
                {isArchived ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRestore(task.id); }}
                        style={{
                            ...styles.actionBtn,
                            color: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.08)',
                            width: '32px',
                            height: '32px',
                            minWidth: '32px',
                            marginTop: '0px'
                        }}
                        title="Restore Task"
                    >
                        <RotateCcw size={17} />
                    </button>
                ) : (
                    <>
                        {task.scheduledDate && (
                            <motion.button
                                onClick={(e) => { e.stopPropagation(); setShowQuickSchedule(!showQuickSchedule); }}
                                style={{
                                    ...styles.actionBtn,
                                    color: task.isRecurring ? '#10b981' : 'var(--accent-color)',
                                    background: showQuickSchedule ? (task.isRecurring ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-bg)') : 'transparent',
                                    border: `1px solid ${task.isRecurring ? '#10b981' : 'var(--accent-color)'}`,
                                    marginRight: '6px',
                                    opacity: 1.0,
                                    width: '32px',
                                    height: '32px',
                                    minWidth: '32px'
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={task.isRecurring ? "Recurring schedule / Defer task" : "Change schedule / Defer task"}
                            >
                                {task.isRecurring ? <Repeat size={17} /> : <Calendar size={17} />}
                            </motion.button>
                        )}
                        <motion.button
                            onClick={handleComplete}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            style={{
                                ...styles.actionBtn,
                                minWidth: '32px',
                                minHeight: '32px',
                                width: '32px',
                                height: '32px',
                                touchAction: 'manipulation',
                                color: isChecked ? '#10b981' : 'var(--muted-text)',
                                background: isChecked ? 'rgba(16, 185, 129, 0.15)' : 'transparent'
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
