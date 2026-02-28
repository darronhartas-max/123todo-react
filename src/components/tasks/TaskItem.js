import React, { useState } from 'react';
import { Trash2, RotateCcw, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITIES } from '../../utils/constants';

const TaskItem = ({ task, isArchived, onComplete, onDelete, onRestore, onEdit, dragHandlers, projectColor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleComplete = (e) => {
        e.stopPropagation();
        if (isClicked) return;
        setIsClicked(true);
        // Small delay to let the user see the "completed" state before it disappears
        setTimeout(() => {
            onComplete(task.id);
        }, 250);
    };

    const styles = {
        taskItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color)',
            background: task.isSample ? 'rgba(14, 165, 233, 0.1)' : 'var(--item-bg)',
            borderLeft: projectColor ? `4px solid ${projectColor}` : (task.isSample ? '4px solid #0ea5e9' : 'none'),
            cursor: isArchived ? 'default' : 'move',
            borderRadius: '6px',
            marginBottom: '2px',
            transition: 'background 0.2s ease, border-color 0.2s ease',
            position: 'relative'
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

    const showCheck = isHovered || isClicked;

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
            <div style={styles.taskPriorityDot}></div>
            <span style={styles.taskText}>{task.text}</span>

            <div style={{ display: 'flex' }}>
                {isArchived ? (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRestore(task.id); }}
                            style={{ ...styles.actionBtn, color: '#3b82f6' }}
                            title="Restore Task"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                            style={{ ...styles.actionBtn, color: '#dc2626' }}
                            title="Delete Task"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                ) : (
                    <motion.button
                        onClick={handleComplete}
                        style={{
                            ...styles.actionBtn,
                            color: showCheck ? '#10b981' : 'var(--muted-text)',
                            background: showCheck ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                        title="Complete Task"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {showCheck ? (
                                <motion.div
                                    key="check"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    <Check size={18} strokeWidth={3} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="circle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    <Circle size={18} opacity={0.5} />
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
