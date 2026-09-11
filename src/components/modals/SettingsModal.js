import React, { useState, useRef } from 'react';
import { X, Trash2, Edit2, Plus, Sliders, FolderOpen, Check, Keyboard, GripVertical, MoveHorizontal, Flag, PauseCircle, Slash, CheckSquare, RefreshCw, Cloud, Download, ExternalLink, Smartphone, Laptop, CheckCircle2, Mic, Info, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECT_COLORS, SWIPE_ACTIONS, APP_VERSION, DATE_FORMAT_OPTIONS, NOTES_AUTOSAVE_OPTIONS, DEFAULT_NOTES_AUTOSAVE_DELAY, migrateProjectColor } from '../../utils/constants';
import { EMAIL_CLIENT_OPTIONS, getEmailClientPreference, setEmailClientPreference as saveEmailClientPreference } from '../../utils/emailUtils';

const SHORTCUTS_LIST = [
    { keys: ['Q', 'A'], desc: 'Toggle Add Task Panel' },
    { keys: ['/'], desc: 'Focus Search Bar' },
    { keys: ['S'], desc: 'Open Settings' },
    { keys: ['Esc'], desc: 'Close Modal / Cancel / Unfocus' },
    { keys: ['Enter'], desc: 'Save task (when editing/adding)' },
    { keys: ['Shift + Enter'], desc: 'Insert line break in notes' }
];

const ACTION_ICONS = {
    CheckSquare,
    Trash2,
    Flag,
    PauseCircle,
    Edit2,
    Slash
};

const SwipeDemoCard = ({ swipeSettings }) => {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [demoMessage, setDemoMessage] = useState('Swipe this sample task card left or right!');
    const touchStartRef = React.useRef({ x: 0, y: 0 });
    const isSwipingRef = React.useRef(false);

    const THRESHOLD = 95;

    const applyDamping = (diffX) => {
        const absX = Math.abs(diffX);
        if (absX <= THRESHOLD) return diffX;
        const over = absX - THRESHOLD;
        return Math.sign(diffX) * (THRESHOLD + over * 0.45);
    };

    const rightSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeRight ? SWIPE_ACTIONS[swipeSettings.swipeRight] : null;
    const leftSwipeAction = swipeSettings?.enabled && swipeSettings?.swipeLeft ? SWIPE_ACTIONS[swipeSettings.swipeLeft] : null;

    const RightIcon = rightSwipeAction ? ACTION_ICONS[rightSwipeAction.icon] || CheckSquare : null;
    const LeftIcon = leftSwipeAction ? ACTION_ICONS[leftSwipeAction.icon] || Trash2 : null;

    const isRightArmed = swipeOffset >= THRESHOLD && swipeSettings?.swipeRight !== 'none';
    const isLeftArmed = Math.abs(swipeOffset) >= THRESHOLD && swipeOffset < 0 && swipeSettings?.swipeLeft !== 'none';
    const rightProgress = Math.min(1, Math.max(0, swipeOffset / THRESHOLD));
    const leftProgress = Math.min(1, Math.max(0, Math.abs(swipeOffset) / THRESHOLD));

    const handleTouchStart = (e) => {
        if (!swipeSettings?.enabled) return;
        const touch = e.touches ? e.touches[0] : e;
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        isSwipingRef.current = false;
    };

    const handleTouchMove = (e) => {
        if (!swipeSettings?.enabled) return;
        const touch = e.touches ? e.touches[0] : e;
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        if (!isSwipingRef.current) {
            if (absY > 7 && (absY * 1.15 >= absX || absY > 12)) {
                return;
            }
            if (absX >= 16 && absX > absY * 2.0) {
                isSwipingRef.current = true;
            } else {
                return;
            }
        }

        if (isSwipingRef.current) {
            if (e.cancelable) e.preventDefault();
            const rawOffset = applyDamping(diffX);
            const clampedOffset = Math.max(-260, Math.min(260, rawOffset));
            setSwipeOffset(clampedOffset);
        }
    };

    const handleTouchEnd = () => {
        if (!swipeSettings?.enabled || !isSwipingRef.current) {
            setSwipeOffset(0);
            return;
        }
        if (swipeOffset >= THRESHOLD && swipeSettings.swipeRight !== 'none') {
            setDemoMessage(`Triggered Right Swipe: ${rightSwipeAction?.label}! 🎉`);
        } else if (swipeOffset <= -THRESHOLD && swipeSettings.swipeLeft !== 'none') {
            setDemoMessage(`Triggered Left Swipe: ${leftSwipeAction?.label}! ⚡`);
        }
        setSwipeOffset(0);
        isSwipingRef.current = false;
    };

    const handlePointerDown = (e) => {
        if (!swipeSettings?.enabled) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'touch') return;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        handleTouchStart(e);
    };

    const handlePointerMove = (e) => {
        if (!swipeSettings?.enabled) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'touch') return;
        if (touchStartRef.current.x === 0 && touchStartRef.current.y === 0) return;
        handleTouchMove(e);
    };

    const handlePointerUp = () => {
        handleTouchEnd();
        touchStartRef.current = { x: 0, y: 0 };
    };

    if (!swipeSettings?.enabled) {
        return (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
                Swipe gestures are currently disabled. Enable them above to test.
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            {swipeOffset > 0 && rightSwipeAction && swipeSettings?.swipeRight !== 'none' && (
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                    background: isRightArmed 
                        ? (rightSwipeAction.activeBg || rightSwipeAction.color) 
                        : `linear-gradient(90deg, ${rightSwipeAction.color}e6 0%, ${rightSwipeAction.color}b3 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                    paddingLeft: `${Math.max(8, Math.min(20, swipeOffset * 0.2))}px`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: isRightArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '6px',
                    zIndex: 1,
                    transition: 'background 0.15s ease'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: isRightArmed ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                        transform: isRightArmed ? 'scale(1.25)' : `scale(${0.85 + rightProgress * 0.25})`,
                        transition: 'transform 0.15s ease',
                        flexShrink: 0
                    }}>
                        {RightIcon && <RightIcon size={18} color="#ffffff" />}
                    </div>
                    <span style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 10), fontWeight: '700', whiteSpace: 'nowrap' }}>
                        {isRightArmed ? `Release to ${rightSwipeAction.label}` : (rightSwipeAction.actionHint || rightSwipeAction.label)}
                    </span>
                    {!isRightArmed && (
                        <div style={{ position: 'absolute', left: `${THRESHOLD}px`, top: '15%', bottom: '15%', width: '3px', background: '#ffffff', opacity: 0.65, borderRadius: '1.5px' }} />
                    )}
                </div>
            )}
            {swipeOffset < 0 && leftSwipeAction && swipeSettings?.swipeLeft !== 'none' && (
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                    background: isLeftArmed 
                        ? (leftSwipeAction.activeBg || `linear-gradient(270deg, ${leftSwipeAction.color} 0%, ${leftSwipeAction.color}ee 100%)`) 
                        : `linear-gradient(270deg, ${leftSwipeAction.color}d9 0%, ${leftSwipeAction.color}80 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: `${Math.max(10, Math.min(24, Math.abs(swipeOffset) * 0.18))}px`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: isLeftArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '8px',
                    zIndex: 1,
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isLeftArmed ? `inset 0 0 28px rgba(0,0,0,0.3)` : 'none'
                }}>
                    <span style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 12), fontWeight: isLeftArmed ? '800' : '700', whiteSpace: 'nowrap' }}>
                        {isLeftArmed ? `Release to ${leftSwipeAction.label}` : (leftSwipeAction.actionHint || leftSwipeAction.label)}
                    </span>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: isLeftArmed ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.22)',
                        transform: isLeftArmed ? 'scale(1.35)' : `scale(${0.85 + leftProgress * 0.3})`,
                        boxShadow: isLeftArmed ? '0 0 16px rgba(255, 255, 255, 0.7)' : 'none',
                        transition: 'transform 0.15s ease',
                        flexShrink: 0
                    }}>
                        {LeftIcon && <LeftIcon size={19} color="#ffffff" />}
                    </div>
                    {!isLeftArmed && (
                        <div style={{ position: 'absolute', right: `${THRESHOLD}px`, top: '15%', bottom: '15%', width: '3px', background: '#ffffff', opacity: 0.75, borderRadius: '1.5px', boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)' }} />
                    )}
                </div>
            )}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                    padding: '12px 16px',
                    background: 'var(--item-bg)',
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                    touchAction: 'pan-y',
                    position: 'relative',
                    zIndex: 2,
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-color)' }}>{demoMessage}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Drag me ↔</span>
            </div>
        </div>
    );
};

const SettingsModal = ({
    isOpen,
    onClose,
    projects,
    onAddProject,
    onEditProject,
    onDeleteProject,
    onMoveProject,
    onReorderProjects,
    fontSize,
    setFontSize,
    notesFontSize = 18,
    setNotesFontSize,
    notesAutosaveDelay = '60s',
    setNotesAutosaveDelay,
    layoutWidth,
    setLayoutWidth,
    wideColumnView = 'priorities',
    setWideColumnView,
    syncSpeed = 'adaptive',
    setSyncSpeed,
    themeMode,
    setThemeMode,
    lightModeTone = 'soft',
    setLightModeTone,
    swipeSettings,
    onUpdateSwipeSettings,
    onCheckForUpdates,
    updateCheckStatus = 'idle',
    dateFormat = 'UK',
    setDateFormat,
    taskLengthLimit = '250',
    setTaskLengthLimit,
    isBoldFont = false,
    setIsBoldFont,
    onOpenAdminStats,
    syncProvider = 'cloudflare',
    setSyncProvider,
    onOpenSyncModal,
    appMode = 'tasks',
    onSwitchMode = () => {},
    taskViewMode = 'compact',
    setTaskViewMode,
    isStandalone = false,
    canNativeInstall = false,
    onNativeInstall,
    onOpenInstallGuide,
    emailClientPreference,
    setEmailClientPreference,
    initialTab = 'appearance'
}) => {
    const [localEmailPref, setLocalEmailPref] = useState(() => getEmailClientPreference() || 'default');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [projectName, setProjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleManualCheckForUpdates = (e) => {
        if (onCheckForUpdates) {
            onCheckForUpdates(e);
        }
    };

    // Inline project editing states
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    // Project drag and drop reordering state
    const [draggedProjectId, setDraggedProjectId] = useState(null);
    const [dragOverProjectId, setDragOverProjectId] = useState(null);
    const projectListRef = useRef(null);
    const autoScrollProjectRef = useRef(null);
    const scrollSpeedProjectRef = useRef(0);

    const startProjectAutoScroll = (speed) => {
        scrollSpeedProjectRef.current = speed;
        if (!autoScrollProjectRef.current && projectListRef.current) {
            const step = () => {
                if (scrollSpeedProjectRef.current !== 0 && projectListRef.current) {
                    projectListRef.current.scrollTop += scrollSpeedProjectRef.current;
                    autoScrollProjectRef.current = requestAnimationFrame(step);
                } else {
                    autoScrollProjectRef.current = null;
                }
            };
            autoScrollProjectRef.current = requestAnimationFrame(step);
        }
    };

    const stopProjectAutoScroll = () => {
        scrollSpeedProjectRef.current = 0;
        if (autoScrollProjectRef.current) {
            cancelAnimationFrame(autoScrollProjectRef.current);
            autoScrollProjectRef.current = null;
        }
    };

    const handleDragStartProject = (e, projectId) => {
        setDraggedProjectId(projectId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', projectId);
    };

    const handleDragOverProject = (e, projectId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (projectListRef.current) {
            const rect = projectListRef.current.getBoundingClientRect();
            const clientY = e.clientY;
            const threshold = 60; // 60px from top or bottom of container

            if (clientY < rect.top + threshold) {
                const proximity = (rect.top + threshold) - clientY;
                const speed = -Math.max(4, Math.min(20, Math.round((proximity / threshold) * 20)));
                startProjectAutoScroll(speed);
            } else if (clientY > rect.bottom - threshold) {
                const proximity = clientY - (rect.bottom - threshold);
                const speed = Math.max(4, Math.min(20, Math.round((proximity / threshold) * 20)));
                startProjectAutoScroll(speed);
            } else {
                stopProjectAutoScroll();
            }
        }

        if (dragOverProjectId !== projectId) {
            setDragOverProjectId(projectId);
        }
    };

    const handleDropProject = (e, targetProjectId) => {
        stopProjectAutoScroll();
        e.preventDefault();
        if (!draggedProjectId || draggedProjectId === targetProjectId) {
            setDraggedProjectId(null);
            setDragOverProjectId(null);
            return;
        }

        const fromIndex = projects.findIndex(p => p.id === draggedProjectId);
        const toIndex = projects.findIndex(p => p.id === targetProjectId);

        if (fromIndex > -1 && toIndex > -1) {
            const updated = [...projects];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);

            if (onReorderProjects) {
                onReorderProjects(updated);
            } else if (onMoveProject) {
                const direction = fromIndex < toIndex ? 'down' : 'up';
                onMoveProject(draggedProjectId, direction);
            }
        }

        setDraggedProjectId(null);
        setDragOverProjectId(null);
    };

    const handleDragEndProject = () => {
        stopProjectAutoScroll();
        setDraggedProjectId(null);
        setDragOverProjectId(null);
    };

    if (!isOpen) return null;

    const handleAddProject = (e) => {
        e.preventDefault();
        if (projectName.trim()) {
            onAddProject(projectName.trim(), selectedColor);
            setProjectName('');
            setSelectedColor(PROJECT_COLORS[0]);
            setShowAddForm(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            transition: 'background 0.3s ease'
        },
        modal: {
            background: 'var(--surface-color)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '720px',
            height: '82vh',
            maxHeight: '680px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
        },
        header: {
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-color)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        body: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            flexDirection: window.innerWidth < 600 ? 'column' : 'row'
        },
        sidebar: {
            width: window.innerWidth < 600 ? '100%' : '165px',
            borderRight: window.innerWidth < 600 ? 'none' : '1px solid var(--border-color)',
            borderBottom: window.innerWidth < 600 ? '1px solid var(--border-color)' : 'none',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: window.innerWidth < 600 ? 'row' : 'column',
            padding: window.innerWidth < 600 ? '8px' : '12px 6px',
            gap: '4px',
            flexShrink: 0,
            overflowX: window.innerWidth < 600 ? 'auto' : 'hidden',
            overflowY: window.innerWidth < 600 ? 'hidden' : 'auto',
            WebkitOverflowScrolling: 'touch'
        },
        tabBtn: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: window.innerWidth < 600 ? '6px 12px' : '8px 12px',
            borderRadius: window.innerWidth < 600 ? '16px' : '8px',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.88rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            justifyContent: window.innerWidth < 600 ? 'center' : 'flex-start',
            boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.04)' : 'none',
            transition: 'all 0.2s ease'
        }),
        content: {
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            background: 'var(--surface-color)'
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        projectItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginBottom: '4px',
            background: 'var(--item-bg)'
        },
        projectInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            fontSize: '0.95rem',
            color: 'var(--text-color)'
        },
        colorDot: (color) => ({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color
        }),
        actions: {
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
        },
        actionBtn: {
            padding: '4px 6px',
            borderRadius: '6px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-text)',
            transition: 'all 0.15s ease',
            minWidth: '28px',
            minHeight: '28px'
        },
        addSection: {
            marginTop: '20px',
            padding: '16px',
            background: 'var(--bg-color)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)'
        },
        input: {
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-color)',
            fontSize: '1rem',
            marginBottom: '12px',
            outline: 'none'
        },
        colorGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: '10px 4px',
            justifyItems: 'center',
            alignItems: 'center',
            marginBottom: '16px'
        },
        colorBtn: (color, isSelected) => ({
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '2.5px solid var(--text-color)' : '1.5px solid transparent',
            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.15s ease',
            boxShadow: isSelected ? '0 0 0 1px var(--text-color), 0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
        }),
        submitBtn: {
            width: '100%',
            padding: '10px',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
        },
        settingRow: {
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        settingLabel: {
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        segmentContainer: {
            display: 'flex',
            background: 'var(--bg-color)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        segmentBtn: (isActive) => ({
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
        }),
        sliderContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-color)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
        },
        slider: {
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            accentColor: 'var(--accent-color)',
            cursor: 'pointer'
        },
        shortcutItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '1rem',
            color: 'var(--text-color)'
        },
        kbdBadge: {
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 2px 0 var(--border-color)',
            color: 'var(--accent-color)'
        },
        voiceGuideTag: {
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '0.82rem',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px'
        },
        voiceGuideRow: {
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.84rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-color)'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={styles.modal}
                onClick={e => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <div style={styles.title}>Settings</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={styles.body}>
                    <div style={styles.sidebar}>
                        <button
                            style={styles.tabBtn(activeTab === 'appearance')}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <Sliders size={18} />
                            Appearance
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'tasks')}
                            onClick={() => setActiveTab('tasks')}
                        >
                            <ListChecks size={18} />
                            Tasks
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'projects')}
                            onClick={() => setActiveTab('projects')}
                        >
                            <FolderOpen size={18} />
                            Projects
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'swipe')}
                            onClick={() => setActiveTab('swipe')}
                        >
                            <MoveHorizontal size={18} />
                            Swipe
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'sync')}
                            onClick={() => setActiveTab('sync')}
                        >
                            <Cloud size={18} />
                            Cloud Sync
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'voice')}
                            onClick={() => setActiveTab('voice')}
                        >
                            <Mic size={18} />
                            Voice
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'shortcuts')}
                            onClick={() => setActiveTab('shortcuts')}
                        >
                            <Keyboard size={18} />
                            Shortcuts
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'about' || activeTab === 'install')}
                            onClick={() => setActiveTab('about')}
                        >
                            <Info size={18} />
                            App & Updates
                        </button>
                    </div>

                    <div style={styles.content}>
                        {activeTab === 'projects' && (
                            <div>
                                <div style={styles.sectionTitle}>Manage Projects</div>
                                <div ref={projectListRef} style={{ maxHeight: showAddForm ? '220px' : '440px', overflowY: 'auto', paddingRight: '4px', transition: 'max-height 0.3s ease' }}>
                                    {projects.map((project, idx) => (
                                        <div
                                            key={project.id}
                                            draggable={!editingProjectId}
                                            onDragStart={(e) => handleDragStartProject(e, project.id)}
                                            onDragOver={(e) => handleDragOverProject(e, project.id)}
                                            onDragLeave={() => setDragOverProjectId(null)}
                                            onDrop={(e) => handleDropProject(e, project.id)}
                                            onDragEnd={handleDragEndProject}
                                            style={{
                                                ...styles.projectItem,
                                                opacity: draggedProjectId === project.id ? 0.4 : 1,
                                                borderColor: dragOverProjectId === project.id ? 'var(--accent-color)' : 'var(--border-color)',
                                                background: dragOverProjectId === project.id ? 'var(--accent-bg)' : 'var(--item-bg)',
                                                cursor: editingProjectId ? 'default' : 'grab',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {editingProjectId === project.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                            style={{ ...styles.input, marginBottom: 0, padding: '6px 10px', flex: 1 }}
                                                            placeholder="Project name..."
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            style={{ ...styles.actionBtn, background: 'var(--accent-color)', color: 'white', borderColor: 'var(--accent-color)' }}
                                                            onClick={() => {
                                                                if (editName.trim()) {
                                                                    onEditProject(project.id, { name: editName.trim(), color: editColor });
                                                                    setEditingProjectId(null);
                                                                }
                                                            }}
                                                            title="Save changes"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            style={{ ...styles.actionBtn, color: 'var(--muted-text)' }}
                                                            onClick={() => setEditingProjectId(null)}
                                                            title="Cancel"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(10, 1fr)',
                                                        gap: '8px 4px',
                                                        justifyItems: 'center',
                                                        alignItems: 'center',
                                                        marginTop: '6px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {PROJECT_COLORS.map(c => (
                                                            <div
                                                                key={c}
                                                                onClick={() => setEditColor(c)}
                                                                style={{
                                                                    width: '22px',
                                                                    height: '22px',
                                                                    borderRadius: '50%',
                                                                    background: c,
                                                                    cursor: 'pointer',
                                                                    border: editColor === c ? '2.5px solid var(--text-color)' : '1.5px solid transparent',
                                                                    transform: editColor === c ? 'scale(1.15)' : 'scale(1)',
                                                                    transition: 'transform 0.15s ease',
                                                                    boxShadow: editColor === c ? '0 0 0 1px var(--text-color), 0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
                                                                }}
                                                                title={c}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={styles.projectInfo}>
                                                        <GripVertical size={16} style={{ color: 'var(--muted-text)', cursor: 'grab', flexShrink: 0 }} title="Drag to reorder" />
                                                        <div style={styles.colorDot(project.color)} />
                                                        {project.name}
                                                    </div>
                                                     <div style={{ ...styles.actions, gap: '10px' }}>
                                                         <button
                                                             style={styles.actionBtn}
                                                             onClick={() => {
                                                                 setEditingProjectId(project.id);
                                                                 setEditName(project.name);
                                                                 setEditColor(migrateProjectColor(project.color));
                                                             }}
                                                             title="Edit project name & color"
                                                         >
                                                             <Edit2 size={15} />
                                                         </button>
                                                         <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px', opacity: 0.7 }} />
                                                         <button
                                                             style={{
                                                                 ...styles.actionBtn,
                                                                 color: '#dc2626',
                                                                 borderColor: '#fee2e2',
                                                                 background: 'rgba(239, 68, 68, 0.05)',
                                                                 padding: '4px 8px'
                                                             }}
                                                             onClick={() => {
                                                                 if (projects.length === 1) {
                                                                     alert("You must have at least one project remaining.");
                                                                     return;
                                                                 }
                                                                 onDeleteProject(project.id);
                                                             }}
                                                             title="Delete project"
                                                         >
                                                             <Trash2 size={15} />
                                                         </button>
                                                     </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!showAddForm ? (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            background: 'var(--accent-bg)',
                                            border: '1.5px dashed var(--accent-color)',
                                            color: 'var(--accent-color)',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            marginTop: '12px',
                                            width: '100%',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Plus size={18} /> Create New Project
                                    </button>
                                ) : (
                                    <div style={{ ...styles.addSection, marginTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-color)' }}>
                                                <Plus size={18} /> Create New Project
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                                style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', display: 'flex' }}
                                                title="Close"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddProject}>
                                            <input
                                                value={projectName}
                                                onChange={e => setProjectName(e.target.value)}
                                                placeholder="Project name..."
                                                style={styles.input}
                                                autoFocus
                                                required
                                            />
                                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '8px', fontWeight: '500' }}>Project Color</div>
                                            <div style={styles.colorGrid}>
                                                {PROJECT_COLORS.map(c => (
                                                    <div
                                                        key={c}
                                                        style={styles.colorBtn(c, selectedColor === c)}
                                                        onClick={() => setSelectedColor(c)}
                                                        title={c}
                                                    />
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    type="submit"
                                                    style={{ ...styles.submitBtn, opacity: projectName.trim() ? 1 : 0.5, flex: 1 }}
                                                    disabled={!projectName.trim()}
                                                >
                                                    Add Project
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddForm(false)}
                                                    style={{
                                                        padding: '10px 16px',
                                                        background: 'var(--item-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '8px',
                                                        color: 'var(--text-color)',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <div style={styles.sectionTitle}>Appearance & Styling</div>

                                {/* App Skin / Mode */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Active App Skin</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 'normal' }}>
                                            {appMode === 'notes' ? 'Voice Notes' : 'Task Manager (P1-P4 Matrix)'}
                                        </span>
                                    </div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(appMode === 'tasks')}
                                            onClick={() => onSwitchMode('tasks')}
                                        >
                                            📋 Task Manager
                                        </button>
                                        <button
                                            style={styles.segmentBtn(appMode === 'notes')}
                                            onClick={() => onSwitchMode('notes')}
                                        >
                                            🎙️ Voice Notes
                                        </button>
                                    </div>
                                </div>

                                {/* Tasks View Text Size */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Tasks View Text Size</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                                            {(() => {
                                                const defaultFontSize = (typeof window !== 'undefined' && window.innerWidth > 768) ? 11 : 14;
                                                return `${fontSize}pt (${fontSize === defaultFontSize ? 'Default' : fontSize < defaultFontSize ? 'Smaller' : 'Larger'})`;
                                            })()}
                                        </span>
                                    </div>
                                    <div style={styles.sliderContainer}>
                                        <span style={{ fontSize: '8pt', color: 'var(--muted-text)' }}>A</span>
                                        <input
                                            type="range"
                                            min="8"
                                            max="24"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            style={styles.slider}
                                        />
                                        <span style={{ fontSize: '20pt', color: 'var(--muted-text)', fontWeight: 'bold' }}>A</span>
                                    </div>
                                </div>

                                {/* Notes View Text Size (Independent) */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Notes View Text Size</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                                            {notesFontSize}pt ({notesFontSize === 18 ? 'Default' : notesFontSize < 18 ? 'Smaller' : 'Larger'})
                                        </span>
                                    </div>
                                    <div style={styles.sliderContainer}>
                                        <span style={{ fontSize: '8pt', color: 'var(--muted-text)' }}>A</span>
                                        <input
                                            type="range"
                                            min="10"
                                            max="24"
                                            value={notesFontSize}
                                            onChange={(e) => setNotesFontSize && setNotesFontSize(parseInt(e.target.value))}
                                            style={styles.slider}
                                        />
                                        <span style={{ fontSize: '20pt', color: 'var(--muted-text)', fontWeight: 'bold' }}>A</span>
                                    </div>
                                </div>

                                {/* Theme Mode */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>Theme Mode</div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(themeMode === 'system')}
                                            onClick={() => setThemeMode('system')}
                                        >
                                            System
                                        </button>
                                        <button
                                            style={styles.segmentBtn(themeMode === 'light')}
                                            onClick={() => setThemeMode('light')}
                                        >
                                            Light
                                        </button>
                                        <button
                                            style={styles.segmentBtn(themeMode === 'dark')}
                                            onClick={() => setThemeMode('dark')}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>

                                {/* Light Mode Background Tone */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Light Mode Background Tone</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Adjust background tone in light mode to reduce glare and eye strain
                                        </span>
                                    </div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(lightModeTone === 'bright')}
                                            onClick={() => setLightModeTone && setLightModeTone('bright')}
                                            title="Bright (Pure White background)"
                                        >
                                            Bright
                                        </button>
                                        <button
                                            style={styles.segmentBtn(lightModeTone === 'soft')}
                                            onClick={() => setLightModeTone && setLightModeTone('soft')}
                                            title="Soft (Warm Light Grey - Low Eye Strain)"
                                        >
                                            Soft
                                        </button>
                                        <button
                                            style={styles.segmentBtn(lightModeTone === 'muted')}
                                            onClick={() => setLightModeTone && setLightModeTone('muted')}
                                            title="Muted (Cozy Low-Glare Grey)"
                                        >
                                            Muted
                                        </button>
                                    </div>
                                </div>

                                {/* Bold Font Option */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Bold Text Typography</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Increase font weight across tasks, menus, and notes for enhanced high contrast readability
                                        </span>
                                    </div>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        color: 'var(--text-color)',
                                        fontSize: '0.95rem'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={isBoldFont}
                                            onChange={(e) => setIsBoldFont && setIsBoldFont(e.target.checked)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                accentColor: 'var(--accent-color)',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span>Enable Bold Text</span>
                                    </label>
                                </div>

                                {/* Layout Width Constraint */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>Desktop Layout Width</div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(layoutWidth === '480px')}
                                            onClick={() => setLayoutWidth('480px')}
                                        >
                                            Single Column (480px)
                                        </button>
                                        <button
                                            style={styles.segmentBtn(layoutWidth === '1000px')}
                                            onClick={() => setLayoutWidth('1000px')}
                                        >
                                            Kanban Columns (1000px)
                                        </button>
                                    </div>
                                </div>

                                {/* Wide View Columns Mode */}
                                {layoutWidth !== '480px' && (
                                    <div style={styles.settingRow}>
                                        <div style={styles.settingLabel}>
                                            <span>Wide Mode Column View</span>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                                Group columns in wide mode by Priorities or by Projects
                                            </span>
                                        </div>
                                        <div style={styles.segmentContainer}>
                                            <button
                                                style={styles.segmentBtn(wideColumnView === 'priorities')}
                                                onClick={() => setWideColumnView && setWideColumnView('priorities')}
                                            >
                                                By Priorities
                                            </button>
                                            <button
                                                style={styles.segmentBtn(wideColumnView === 'projects')}
                                                onClick={() => setWideColumnView && setWideColumnView('projects')}
                                            >
                                                By Projects
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div>
                                <div style={styles.sectionTitle}>Tasks & Workflow</div>

                                {/* Tasks List View Mode */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Tasks List View Mode</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Choose between compact 2-line preview or full-length task titles in list views
                                        </span>
                                    </div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(taskViewMode === 'compact')}
                                            onClick={() => setTaskViewMode && setTaskViewMode('compact')}
                                        >
                                            Compact (2 Lines)
                                        </button>
                                        <button
                                            style={styles.segmentBtn(taskViewMode === 'full')}
                                            onClick={() => setTaskViewMode && setTaskViewMode('full')}
                                        >
                                            Full-Length
                                        </button>
                                    </div>
                                </div>

                                {/* Date Format Order Preference */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Date Format Order</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Choose UK, US, or ISO date order display
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                        {DATE_FORMAT_OPTIONS.map(fmt => {
                                            const isSelected = dateFormat === fmt.id;
                                            return (
                                                <div
                                                    key={fmt.id}
                                                    onClick={() => setDateFormat && setDateFormat(fmt.id)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: '8px',
                                                        border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                        background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: isSelected ? '700' : '600',
                                                        color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                                    }}>
                                                        {fmt.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontFamily: 'monospace' }}>
                                                        {fmt.example}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Task Description Character Limit */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Task Description Character Limit</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Set limit for task descriptions (250 chars default encourages concise tasks)
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                        {[
                                            { id: '250', label: '250 Characters (Default)', desc: 'Encourages concise task details' },
                                            { id: 'unlimited', label: 'Unlimited', desc: 'No length restriction' }
                                        ].map(opt => {
                                            const isSelected = (taskLengthLimit || '250') === opt.id;
                                            return (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => setTaskLengthLimit && setTaskLengthLimit(opt.id)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: '8px',
                                                        border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                        background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: isSelected ? '700' : '600',
                                                        color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                                    }}>
                                                        {opt.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                                                        {opt.desc}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Notes Mode Auto-Save Delay */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Notes Auto-Save Delay</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Inactivity delay before a drafted note, quote, or job estimate is automatically saved
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                        {NOTES_AUTOSAVE_OPTIONS.map(opt => {
                                            const isSelected = (notesAutosaveDelay || DEFAULT_NOTES_AUTOSAVE_DELAY) === opt.id;
                                            return (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => setNotesAutosaveDelay && setNotesAutosaveDelay(opt.id)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: '8px',
                                                        border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                        background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: isSelected ? '700' : '600',
                                                        color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                                    }}>
                                                        {opt.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                                                        {opt.desc}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Preferred Email Service */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Preferred Email Service</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                            Choose which email app or web service opens when clicking email links
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                        {EMAIL_CLIENT_OPTIONS.map(opt => {
                                            const currentPref = emailClientPreference || localEmailPref;
                                            const isSelected = currentPref === opt.id;
                                            return (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => {
                                                        setLocalEmailPref(opt.id);
                                                        saveEmailClientPreference(opt.id);
                                                        if (setEmailClientPreference) setEmailClientPreference(opt.id);
                                                    }}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: '8px',
                                                        border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                        background: isSelected ? 'var(--accent-bg)' : 'var(--item-bg)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: isSelected ? '700' : '600',
                                                        color: isSelected ? 'var(--accent-color)' : 'var(--text-color)'
                                                    }}>
                                                        {opt.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                                                        {opt.badge} • {opt.description}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'swipe' && (
                            <div>
                                <div style={styles.sectionTitle}>
                                    <MoveHorizontal size={20} /> Task Swipe Gestures
                                </div>

                                {/* Prominent Enable / Disable Status Card */}
                                <div style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: `2px solid ${swipeSettings?.enabled ? '#10b981' : 'var(--border-color)'}`,
                                    background: swipeSettings?.enabled ? 'rgba(16, 185, 129, 0.08)' : 'var(--item-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '20px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            background: swipeSettings?.enabled ? '#10b981' : '#9ca3af',
                                            boxShadow: swipeSettings?.enabled ? '0 0 10px #10b981' : 'none'
                                        }} />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-color)' }}>
                                                {swipeSettings?.enabled ? '🟢 Swipe Gestures Active' : '⚪ Swipe Gestures Disabled'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                                                {swipeSettings?.enabled ? 'Swipe task cards left or right on mobile & desktop to perform quick actions.' : 'Turn on to swipe task cards left or right for fast shortcuts.'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onUpdateSwipeSettings({ enabled: !swipeSettings?.enabled })}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            background: swipeSettings?.enabled ? '#10b981' : 'var(--border-color)',
                                            color: swipeSettings?.enabled ? '#ffffff' : 'var(--text-color)',
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {swipeSettings?.enabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>

                                <div style={{
                                    opacity: swipeSettings?.enabled ? 1 : 0.4,
                                    pointerEvents: swipeSettings?.enabled ? 'auto' : 'none',
                                    transition: 'opacity 0.2s ease'
                                }}>
                                    {/* Swipe Right Config */}
                                    <div style={styles.settingRow}>
                                        <div style={styles.settingLabel}>
                                            <span>➡️ Swipe Right Action (Left to Right)</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                            {Object.entries(SWIPE_ACTIONS).map(([key, action]) => {
                                                const isSelected = swipeSettings?.swipeRight === key;
                                                const IconComp = ACTION_ICONS[action.icon] || CheckSquare;
                                                return (
                                                    <div
                                                        key={key}
                                                        onClick={() => onUpdateSwipeSettings({ swipeRight: key })}
                                                        style={{
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: `1.5px solid ${isSelected ? action.color : 'var(--border-color)'}`,
                                                            background: isSelected ? `${action.color}15` : 'var(--item-bg)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: isSelected ? '700' : '500',
                                                            color: isSelected ? action.color : 'var(--text-color)',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <IconComp size={16} style={{ color: action.color, flexShrink: 0 }} />
                                                        <span>{action.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Swipe Left Config */}
                                    <div style={{ ...styles.settingRow, marginTop: '20px' }}>
                                        <div style={styles.settingLabel}>
                                            <span>⬅️ Swipe Left Action (Right to Left)</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                            {Object.entries(SWIPE_ACTIONS).map(([key, action]) => {
                                                const isSelected = swipeSettings?.swipeLeft === key;
                                                const IconComp = ACTION_ICONS[action.icon] || Trash2;
                                                return (
                                                    <div
                                                        key={key}
                                                        onClick={() => onUpdateSwipeSettings({ swipeLeft: key })}
                                                        style={{
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: `1.5px solid ${isSelected ? action.color : 'var(--border-color)'}`,
                                                            background: isSelected ? `${action.color}15` : 'var(--item-bg)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: isSelected ? '700' : '500',
                                                            color: isSelected ? action.color : 'var(--text-color)',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <IconComp size={16} style={{ color: action.color, flexShrink: 0 }} />
                                                        <span>{action.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Live Practice Card */}
                                    <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px dashed var(--border-color)' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-color)' }}>
                                            🧪 Test Your Swipe Gestures Live:
                                        </div>
                                        <SwipeDemoCard swipeSettings={swipeSettings} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'voice' && (
                            <div>
                                <div style={styles.sectionTitle}>
                                    <Mic size={20} /> Voice Input & Dictation Guide
                                </div>

                                <div style={{
                                    background: 'var(--bg-color)',
                                    padding: '14px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    marginBottom: '20px',
                                    fontSize: '0.88rem',
                                    lineHeight: '1.55'
                                }}>
                                    <div style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--accent-color)' }}>
                                        Optimized Device Dictation:
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-color)' }}>
                                        <li style={{ marginBottom: '6px' }}><strong>💻 Desktop Dictation (Mac / PC)</strong>: Hands-free continuous dictation across thinking pauses. Speaks directly into titles or notes with live spoken punctuation (<em>"comma"</em>, <em>"full stop"</em>) and editing commands (<em>"delete last 2 words"</em>, <em>"spell out..."</em>).</li>
                                        <li style={{ marginBottom: '6px' }}><strong>📱 Mobile Quick-Capture (Phones / Tablets)</strong>: Tap the in-app Voice button to dictate a quick thought or task. When you finish speaking, it captures cleanly without repetitive system bleep loops or dropped words. Tap again anytime to append more.</li>
                                        <li style={{ marginBottom: '6px' }}><strong>⚡ Continuous Long-Form Dictation on Mobile</strong>: For uninterrupted, multi-minute continuous dictation on your phone without pauses cutting off, tap into the text area and press the <strong>🎙️ microphone icon on your keyboard</strong> (Gboard on Android, or Apple Dictation on iPhone). It provides hardware-accelerated continuous voice capture with zero interruptions!</li>
                                        <li><strong>🚀 Spoken Auto-Submit</strong>: Say <em>"add task"</em> or <em>"save note"</em> at the end of speech to instantly save hands-free.</li>
                                    </ul>
                                </div>

                                <div style={{
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                                        ✍️ Spoken Punctuation:
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"full stop"</em> <strong style={{ color: 'var(--accent-color)' }}>.</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"comma"</em> <strong style={{ color: 'var(--accent-color)' }}>,</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"question mark"</em> <strong style={{ color: 'var(--accent-color)' }}>?</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"exclamation mark"</em> <strong style={{ color: 'var(--accent-color)' }}>!</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"colon"</em> <strong style={{ color: 'var(--accent-color)' }}>:</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"semi colon"</em> <strong style={{ color: 'var(--accent-color)' }}>;</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"new line"</em> <strong style={{ color: 'var(--accent-color)' }}>[↵]</strong></div>
                                        <div style={styles.voiceGuideTag}>🗣️ <em>"hyphen"</em> / <em>"dash"</em> <strong style={{ color: 'var(--accent-color)' }}>-</strong></div>
                                    </div>

                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                                        ✂️ Voice Editing Commands:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"delete last word"</kbd> or <kbd style={styles.kbdBadge}>"scratch that"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Removes the last spoken word</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"delete last 2 words"</kbd> (or 3, 4, 5)</div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Removes N words from input</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"delete last sentence"</kbd> or <kbd style={styles.kbdBadge}>"scratch last sentence"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Deletes the most recent sentence</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"change last word to [word]"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Replaces the previous word with your correction</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"change [wordA] to [wordB]"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Replaces any prior word with a new one</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"clear all"</kbd> or <kbd style={styles.kbdBadge}>"delete all"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Clears the entire text field</span>
                                        </div>
                                    </div>

                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                                        🔤 Spell Words Letter-by-Letter:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"spell S M Y T H E"</kbd> or <kbd style={styles.kbdBadge}>"spell out D A R R O N"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Spells unusual names or words letter-by-letter</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"Rice spelled R H Y S"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Corrects previous misheard word with your spelling</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"spell A double N A"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Supports "double [letter]" naturally</span>
                                        </div>
                                        <div style={styles.voiceGuideRow}>
                                            <div><kbd style={styles.kbdBadge}>"spell all caps N A S A"</kbd> or <kbd style={styles.kbdBadge}>"spell H T M L"</kbd></div>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>Constructs uppercase acronyms</span>
                                        </div>
                                    </div>

                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '8px' }}>
                                        🚀 Auto-Submit Command:
                                    </div>
                                    <div style={styles.voiceGuideRow}>
                                        <div><kbd style={styles.kbdBadge}>"add task"</kbd> or <kbd style={styles.kbdBadge}>"submit task"</kbd></div>
                                        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#10b981' }}>Strips command & automatically saves task!</span>
                                    </div>

                                    <p style={{ margin: '14px 0 0 0', fontSize: '0.82rem', color: 'var(--muted-text)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                        💡 <strong>Mobile Friendly:</strong> On phones and tablets, dictation captures your phrase cleanly and concludes without triggering repetitive system confirmation chimes. Simply tap the mic again anytime to append more thoughts seamlessly!
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shortcuts' && (
                            <div>
                                <div style={styles.sectionTitle}>
                                    <Keyboard size={20} /> Keyboard Shortcuts
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {SHORTCUTS_LIST.map((s, idx) => (
                                        <div key={idx} style={styles.shortcutItem}>
                                            <span style={{ color: 'var(--text-color)', fontWeight: '500' }}>{s.desc}</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {s.keys.map(k => (
                                                    <kbd key={k} style={styles.kbdBadge}>{k}</kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'sync' && (
                            <div>
                                <div style={styles.sectionTitle}>Cloud Sync & Backup Options</div>
                                <div style={{ fontSize: '0.86rem', color: 'var(--muted-text)', marginBottom: '16px', lineHeight: '1.4' }}>
                                    Choose your preferred cross-platform sync engine to keep your tasks seamlessly updated across mobile, laptop, and desktop devices.
                                </div>

                                <div style={{ marginBottom: '20px', background: 'var(--item-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-color)' }}>
                                        Active Sync Provider
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="syncProvider"
                                            value="cloudflare"
                                            checked={syncProvider === 'cloudflare'}
                                            onChange={() => setSyncProvider && setSyncProvider('cloudflare')}
                                            style={{ marginTop: '3px' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-color)' }}>
                                                123ToDo Cloud Sync (Recommended - Set & Forget)
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.35' }}>
                                                Zero 1-hour OAuth drops, 100% iPhone & Safari PWA ready, E2E Zero-Knowledge encrypted.
                                            </div>
                                        </div>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="syncProvider"
                                            value="gdrive"
                                            checked={syncProvider === 'gdrive'}
                                            onChange={() => setSyncProvider && setSyncProvider('gdrive')}
                                            style={{ marginTop: '3px' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-color)' }}>
                                                Google Drive AppData
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: '1.35' }}>
                                                Sync to your personal Google Drive account. (May require frequent Google re-authentication on iOS Safari).
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <button
                                    onClick={onOpenSyncModal}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'var(--accent-color)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Cloud size={18} /> Manage Sync Credentials & Device Pairing
                                </button>
                            </div>
                        )}

                        {(activeTab === 'about' || activeTab === 'install') && (
                            <div>
                                <div style={styles.sectionTitle}>
                                    <Info size={20} /> App Version & Updates
                                </div>

                                {/* App Version & Manual Update Check */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'var(--bg-color)',
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    marginBottom: '20px',
                                    gap: '12px',
                                    flexWrap: 'wrap'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-color)' }}>
                                                123 To Do
                                            </span>
                                            <span style={{
                                                background: 'var(--accent-color)',
                                                color: '#ffffff',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700'
                                            }}>
                                                v{APP_VERSION}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                                            {updateCheckStatus === 'checking' && (
                                                <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Checking for updates...</span>
                                            )}
                                            {updateCheckStatus === 'up-to-date' && (
                                                <span style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Check size={16} /> 123 To Do is up to date (v{APP_VERSION})
                                                </span>
                                            )}
                                            {updateCheckStatus === 'update-available' && (
                                                <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Check size={16} /> New version ready! Click 'Update Now' banner above to pull & reload.
                                                </span>
                                            )}
                                            {updateCheckStatus === 'idle' && (
                                                <span style={{ color: 'var(--muted-text)' }}>Check if a newer version is available. (Shift+click to test)</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleManualCheckForUpdates}
                                        disabled={updateCheckStatus === 'checking'}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--surface-color)',
                                            color: 'var(--accent-color)',
                                            fontWeight: '600',
                                            fontSize: '0.88rem',
                                            cursor: updateCheckStatus === 'checking' ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s ease',
                                            opacity: updateCheckStatus === 'checking' ? 0.6 : 1
                                        }}
                                    >
                                        <RefreshCw size={15} style={{ animation: updateCheckStatus === 'checking' ? 'spin 1s linear infinite' : 'none' }} />
                                        {updateCheckStatus === 'checking' ? 'Checking...' : 'Check for Updates'}
                                    </button>
                                </div>

                                <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Download size={18} /> App Installation & PWA Mode
                                </div>

                                {/* Status Card */}
                                <div style={{
                                    background: isStandalone ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                                    border: `1.5px solid ${isStandalone ? '#10b981' : 'var(--accent-color)'}`,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '18px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        {isStandalone ? <CheckCircle2 size={20} color="#10b981" /> : <Download size={20} color="var(--accent-color)" />}
                                        <div style={{ fontSize: '1rem', fontWeight: '700', color: isStandalone ? '#10b981' : 'var(--accent-color)' }}>
                                            {isStandalone ? 'Installed & Running in App Mode' : 'Currently in Web Browser Mode'}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                                        {isStandalone 
                                            ? 'You are currently using 123 To Do as an installed application with full-screen focus and offline database protection.' 
                                            : '123 To Do is a Progressive Web App (PWA). You can install it directly onto your phone, tablet, or computer right now without downloading from an app store.'}
                                    </p>
                                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {canNativeInstall && !isStandalone && (
                                            <button
                                                onClick={onNativeInstall}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '0.88rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Download size={15} /> 1-Click Install Now
                                            </button>
                                        )}
                                        {onOpenInstallGuide && (
                                            <button
                                                onClick={onOpenInstallGuide}
                                                style={{
                                                    padding: '8px 14px',
                                                    background: 'var(--surface-color)',
                                                    color: 'var(--accent-color)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.88rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                Open Interactive Device Guide
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Step-by-Step Instructions */}
                                <div style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-color)' }}>
                                    How to Install on Your Device:
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                                    <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Smartphone size={16} /> iPhone & iPad (Safari)
                                        </div>
                                        <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                                            1. Open <strong>123todo.com</strong> in Safari.<br />
                                            2. Tap the <strong>Share button</strong> (square with up arrow ⬆️) at the bottom.<br />
                                            3. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                                            4. Tap <strong>"Add"</strong> in the top-right corner.
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Smartphone size={16} /> Android (Chrome)
                                        </div>
                                        <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                                            1. Open <strong>123todo.com</strong> in Google Chrome.<br />
                                            2. Tap the <strong>three dots (⋮)</strong> menu in the top-right.<br />
                                            3. Tap <strong>"Install app"</strong> (or "Add to Home screen").<br />
                                            4. Tap <strong>"Install"</strong> to confirm.
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Laptop size={16} /> Mac & Windows PC (Chrome, Edge, Safari)
                                        </div>
                                        <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.45' }}>
                                            • <strong>Chrome / Edge:</strong> Click the <strong>Install icon</strong> on the right side of the address bar.<br />
                                            • <strong>Safari on macOS Sonoma+:</strong> Choose <strong>File ➔ Add to Dock...</strong> from the top menu bar.
                                        </div>
                                    </div>
                                </div>

                                {/* Full Blog Post Link */}
                                <div style={{
                                    background: 'var(--item-bg)',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Want to learn more?</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>
                                            Read our beginner-friendly article on what a PWA is and why to install it.
                                        </div>
                                    </div>
                                    <a
                                        href="/how-to-install-123todo-pwa.md"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            background: 'var(--accent-color)',
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            fontSize: '0.84rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Read PWA Article <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
