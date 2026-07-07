import React, { useState } from 'react';
import { Trash2, RotateCcw, Plus, Minus, Square, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITIES } from '../../utils/constants';

const TaskItem = ({ task, isArchived, onComplete, onDelete, onRestore, onEdit, dragHandlers, projectColor, isDragging, isDragOver }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const archiveTimeoutRef = React.useRef(null);

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
            }, 2000);
        }
    };

    React.useEffect(() => {
        return () => {
            if (archiveTimeoutRef.current) {
                clearTimeout(archiveTimeoutRef.current);
            }
        };
    }, []);

    const styles = {
        taskItem: {
            display: 'flex',
            padding: 'var(--task-padding, 10px 12px)',
            border: isDragging ? '1px solid var(--accent-color)' : '1px solid transparent',
            borderBottom: '1px solid var(--border-color)',
            borderLeft: projectColor ? `6px solid ${projectColor}` : (task.isSample ? '6px solid #0ea5e9' : 'none'),
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
            backgroundColor: PRIORITIES[task.priority]?.dotColor || 'var(--muted-text)'
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
            textAlign: 'left'
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



    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={styles.taskItem}
            draggable={!isArchived}
            {...(dragHandlers || {})}
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
                )}
            </div>
        </motion.li>
    );
};

export default TaskItem;
