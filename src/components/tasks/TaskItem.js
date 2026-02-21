import React from 'react';
import { Trash2, RotateCcw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PRIORITIES } from '../../utils/constants';

const TaskItem = ({ task, isArchived, onComplete, onDelete, onRestore, onEdit, dragHandlers }) => {
    const styles = {
        taskItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color)',
            background: task.isSample ? 'rgba(14, 165, 233, 0.1)' : 'var(--item-bg)',
            borderLeft: task.isSample ? '4px solid #0ea5e9' : 'none',
            cursor: isArchived ? 'default' : 'move',
            borderRadius: '6px',
            marginBottom: '2px',
            transition: 'background 0.2s ease, border-color 0.2s ease'
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
            fontSize: '1rem',
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
            borderRadius: '4px',
            padding: '4px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
                    <button
                        onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
                        style={{ ...styles.actionBtn, color: '#10b981' }}
                        title="Complete Task"
                    >
                        <Check size={16} />
                    </button>
                )}
            </div>
        </motion.li>
    );
};

export default TaskItem;
