import React, { useState } from 'react';
import { X, Trash2, Edit2, Plus, Sliders, FolderOpen, Check, Keyboard, GripVertical, MoveHorizontal, Flag, PauseCircle, Slash, CheckSquare, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECT_COLORS, SWIPE_ACTIONS, APP_VERSION, DATE_FORMAT_OPTIONS } from '../../utils/constants';

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

    const THRESHOLD = 75;

    const applyDamping = (diffX) => {
        const absX = Math.abs(diffX);
        if (absX <= THRESHOLD) return diffX;
        const over = absX - THRESHOLD;
        return Math.sign(diffX) * (THRESHOLD + over * 0.35);
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

        if (!isSwipingRef.current) {
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
                isSwipingRef.current = true;
            } else if (Math.abs(diffY) > 8) {
                return;
            }
        }

        if (isSwipingRef.current) {
            if (e.cancelable) e.preventDefault();
            const rawOffset = applyDamping(diffX);
            const clampedOffset = Math.max(-140, Math.min(140, rawOffset));
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
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        handleTouchStart(e);
    };

    const handlePointerMove = (e) => {
        if (!swipeSettings?.enabled) return;
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
                    paddingLeft: `${Math.max(8, Math.min(16, swipeOffset * 0.2))}px`,
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
                        {rightSwipeAction.actionHint || rightSwipeAction.label}
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
                        ? (leftSwipeAction.activeBg || leftSwipeAction.color) 
                        : `linear-gradient(270deg, ${leftSwipeAction.color}e6 0%, ${leftSwipeAction.color}b3 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: `${Math.max(8, Math.min(16, Math.abs(swipeOffset) * 0.2))}px`,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: isLeftArmed ? '800' : '700',
                    fontSize: '0.88rem',
                    gap: '6px',
                    zIndex: 1,
                    transition: 'background 0.15s ease'
                }}>
                    <span style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 10), fontWeight: '700', whiteSpace: 'nowrap' }}>
                        {leftSwipeAction.actionHint || leftSwipeAction.label}
                    </span>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: isLeftArmed ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.2)',
                        transform: isLeftArmed ? 'scale(1.25)' : `scale(${0.85 + leftProgress * 0.25})`,
                        transition: 'transform 0.15s ease',
                        flexShrink: 0
                    }}>
                        {LeftIcon && <LeftIcon size={18} color="#ffffff" />}
                    </div>
                    {!isLeftArmed && (
                        <div style={{ position: 'absolute', right: `${THRESHOLD}px`, top: '15%', bottom: '15%', width: '3px', background: '#ffffff', opacity: 0.65, borderRadius: '1.5px' }} />
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
    density,
    setDensity,
    layoutWidth,
    setLayoutWidth,
    themeMode,
    setThemeMode,
    swipeSettings,
    onUpdateSwipeSettings,
    onCheckForUpdates,
    updateCheckStatus = 'idle',
    dateFormat = 'UK',
    setDateFormat,
    taskLengthLimit = '250',
    setTaskLengthLimit
}) => {
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'appearance'
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

    const handleDragStartProject = (e, projectId) => {
        setDraggedProjectId(projectId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', projectId);
    };

    const handleDragOverProject = (e, projectId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverProjectId !== projectId) {
            setDragOverProjectId(projectId);
        }
    };

    const handleDropProject = (e, targetProjectId) => {
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
            maxWidth: '680px',
            height: '80vh',
            maxHeight: '650px',
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
            width: window.innerWidth < 600 ? '100%' : '150px',
            borderRight: window.innerWidth < 600 ? 'none' : '1px solid var(--border-color)',
            borderBottom: window.innerWidth < 600 ? '1px solid var(--border-color)' : 'none',
            background: 'var(--bg-color)',
            display: 'flex',
            flexDirection: window.innerWidth < 600 ? 'row' : 'column',
            padding: window.innerWidth < 600 ? '8px' : '12px 6px',
            gap: '6px',
            flexShrink: 0,
            overflowX: window.innerWidth < 600 ? 'auto' : 'hidden',
            overflowY: window.innerWidth < 600 ? 'hidden' : 'auto',
            WebkitOverflowScrolling: 'touch'
        },
        tabBtn: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: window.innerWidth < 600 ? '6px 12px' : '7px 10px',
            borderRadius: window.innerWidth < 600 ? '16px' : '8px',
            background: isActive ? 'var(--surface-color)' : 'transparent',
            color: isActive ? 'var(--accent-color)' : 'var(--muted-text)',
            border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
            cursor: 'pointer',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.9rem',
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
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
        },
        colorBtn: (color, isSelected) => ({
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: color,
            cursor: 'pointer',
            border: isSelected ? '3px solid var(--text-color)' : 'none',
            transition: 'transform 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                            style={styles.tabBtn(activeTab === 'projects')}
                            onClick={() => setActiveTab('projects')}
                        >
                            <FolderOpen size={18} />
                            Projects
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'appearance')}
                            onClick={() => setActiveTab('appearance')}
                        >
                            <Sliders size={18} />
                            Appearance
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'swipe')}
                            onClick={() => setActiveTab('swipe')}
                        >
                            <MoveHorizontal size={18} />
                            Swipe
                        </button>
                        <button
                            style={styles.tabBtn(activeTab === 'shortcuts')}
                            onClick={() => setActiveTab('shortcuts')}
                        >
                            <Keyboard size={18} />
                            Shortcuts
                        </button>
                    </div>

                    <div style={styles.content}>
                        {activeTab === 'projects' && (
                            <div>
                                <div style={styles.sectionTitle}>Manage Projects</div>
                                <div style={{ maxHeight: showAddForm ? '220px' : '440px', overflowY: 'auto', paddingRight: '4px', transition: 'max-height 0.3s ease' }}>
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
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                        {PROJECT_COLORS.map(c => (
                                                            <div
                                                                key={c}
                                                                onClick={() => setEditColor(c)}
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    background: c,
                                                                    cursor: 'pointer',
                                                                    border: editColor === c ? '2px solid var(--text-color)' : 'none',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                                }}
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
                                                     <div style={styles.actions}>
                                                         <button
                                                             style={styles.actionBtn}
                                                             onClick={() => {
                                                                 setEditingProjectId(project.id);
                                                                 setEditName(project.name);
                                                                 setEditColor(project.color);
                                                             }}
                                                             title="Edit project"
                                                         >
                                                             <Edit2 size={15} />
                                                         </button>
                                                         <button
                                                             style={{ ...styles.actionBtn, color: '#dc2626', borderColor: '#fee2e2' }}
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

                                {/* Text Size */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>Text Size</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                                            {fontSize}pt ({fontSize === 12 ? 'Default' : fontSize < 12 ? 'Smaller' : 'Larger'})
                                        </span>
                                    </div>
                                    <div style={styles.sliderContainer}>
                                        <span style={{ fontSize: '8pt', color: 'var(--muted-text)' }}>A</span>
                                        <input
                                            type="range"
                                            min="8"
                                            max="20"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
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

                                {/* Density Selection */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>Spacing Density</div>
                                    <div style={styles.segmentContainer}>
                                        <button
                                            style={styles.segmentBtn(density === 'cozy')}
                                            onClick={() => setDensity('cozy')}
                                        >
                                            Cozy
                                        </button>
                                        <button
                                            style={styles.segmentBtn(density === 'compact')}
                                            onClick={() => setDensity('compact')}
                                        >
                                            Compact
                                        </button>
                                    </div>
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

                                 {/* Voice Input & Voice Notes */}
                                 <div style={styles.settingRow}>
                                     <div style={styles.settingLabel}>
                                         <span>🎙️ Voice Input & Voice Notes</span>
                                         <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                                             Tap the Voice buttons when adding or editing tasks to speak naturally. Speech automatically appends to existing text so you can pause or think freely without losing progress.
                                         </span>
                                     </div>
                                     <div style={{
                                         background: 'var(--bg-color)',
                                         padding: '12px 14px',
                                         borderRadius: '10px',
                                         border: '1px solid var(--border-color)',
                                         marginTop: '6px',
                                         fontSize: '0.84rem',
                                         lineHeight: '1.5'
                                     }}>
                                         <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--accent-color)' }}>
                                             Voice Input Features:
                                         </div>
                                         <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-color)' }}>
                                             <li><strong>Voice Task Input</strong>: Speaks new tasks directly into the title field. New voice tasks automatically default to <strong>Top Priority (Priority 1)</strong> and the selected project.</li>
                                             <li><strong>Voice Notes Input</strong>: Tap <strong>Voice Notes</strong> on any task to dictate long descriptions, links, or detailed instructions.</li>
                                             <li><strong>Continuous Dictation & Appending</strong>: Stalling or pausing while thinking won't erase your words—new speech seamlessly appends to your existing text.</li>
                                         </ul>
                                     </div>
                                 </div>

                                {/* App Version & Manual Update Check */}
                                <div style={styles.settingRow}>
                                    <div style={styles.settingLabel}>
                                        <span>App Version & Updates</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                                            v{APP_VERSION}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'var(--bg-color)',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        gap: '12px'
                                    }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
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
                                        <button
                                            onClick={handleManualCheckForUpdates}
                                            disabled={updateCheckStatus === 'checking'}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--surface-color)',
                                                color: 'var(--accent-color)',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                cursor: updateCheckStatus === 'checking' ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.2s ease',
                                                opacity: updateCheckStatus === 'checking' ? 0.6 : 1
                                            }}
                                        >
                                            <RefreshCw size={14} style={{ animation: updateCheckStatus === 'checking' ? 'spin 1s linear infinite' : 'none' }} />
                                            {updateCheckStatus === 'checking' ? 'Checking...' : 'Check for Updates'}
                                        </button>
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

                        {activeTab === 'shortcuts' && (
                            <div>
                                <div style={styles.sectionTitle}>Keyboard Shortcuts</div>
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
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
