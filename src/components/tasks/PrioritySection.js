import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TaskItem from './TaskItem';
import { PRIORITIES } from '../../utils/constants';

const PrioritySection = ({
    priority,
    tasks,
    projects,
    onComplete,
    onEdit,
    onUpdate,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedId,
    dragOverId,
    swipeSettings,
    onSwipeAction,
    dateFormat
}) => {
    const config = PRIORITIES[priority];
    const sectionTasks = tasks.filter(t => t.priority === priority);

    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const stored = localStorage.getItem('123Todo_Collapsed_Priorities');
            if (stored) {
                const list = JSON.parse(stored);
                return Array.isArray(list) && list.includes(priority);
            }
        } catch (e) {}
        return false;
    });

    const toggleCollapse = (e) => {
        if (e) e.stopPropagation();
        setIsCollapsed(prev => {
            const nextState = !prev;
            try {
                const stored = localStorage.getItem('123Todo_Collapsed_Priorities');
                let list = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(list)) list = [];
                if (nextState) {
                    if (!list.includes(priority)) list.push(priority);
                } else {
                    list = list.filter(id => id !== priority);
                }
                localStorage.setItem('123Todo_Collapsed_Priorities', JSON.stringify(list));
            } catch (err) {}
            return nextState;
        });
    };

    if (sectionTasks.length === 0 && priority === 4) return null; // Hide On Hold if empty

    const isDragOverSection = dragOverId === `priority-${priority}`;
    const shouldShowList = !isCollapsed || isDragOverSection;

    return (
        <div 
            style={{ marginBottom: 'var(--section-margin, 16px)', flex: 1, minWidth: 0 }}
            onDragOver={(e) => handleDragOver(e, `priority-${priority}`)}
            onDrop={(e) => handleDrop(e, `priority-${priority}`)}
        >
            <div
                onClick={toggleCollapse}
                title={isCollapsed ? `Expand ${config.label}` : `Collapse ${config.label}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.15s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: config.color,
                        textAlign: 'left'
                    }}>
                        {config.label}
                    </h3>
                    <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: isCollapsed ? 'var(--accent-bg)' : 'rgba(0, 0, 0, 0.05)',
                        color: isCollapsed ? 'var(--accent-color)' : 'var(--muted-text)'
                    }}>
                        {sectionTasks.length}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted-text)', fontSize: '0.75rem', fontWeight: '600' }}>
                    {isCollapsed && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                            Collapsed
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={toggleCollapse}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: config.color
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={16} color={config.color} /> : <ChevronDown size={16} color={config.color} />}
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {shouldShowList && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <ul 
                            onDragOver={(e) => handleDragOver(e, `priority-${priority}`)}
                            onDrop={(e) => handleDrop(e, `priority-${priority}`)}
                            style={{ 
                                listStyle: 'none', 
                                margin: 0, 
                                minHeight: (isDragOverSection || sectionTasks.length === 0) ? '60px' : 'auto',
                                border: isDragOverSection ? '2px dashed var(--accent-color)' : '2px dashed transparent',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box',
                                padding: isDragOverSection ? '4px 0' : '0'
                            }}
                        >
                            <AnimatePresence initial={false}>
                                {sectionTasks.map(task => {
                                    const project = projects.find(p => 
                                        p.id.toLowerCase() === task.projectId?.toLowerCase() || 
                                        p.name.toLowerCase() === task.projectId?.toLowerCase()
                                    );
                                    return (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            projectColor={project?.color}
                                            onComplete={onComplete}
                                            onEdit={onEdit}
                                            onUpdate={onUpdate}
                                            swipeSettings={swipeSettings}
                                            onSwipeAction={onSwipeAction}
                                            dateFormat={dateFormat}
                                            isDragging={draggedId === task.id}
                                            isDragOver={dragOverId === task.id}
                                            dragHandlers={{
                                                onDragStart: (e) => handleDragStart(e, task.id),
                                                onDragOver: (e) => {
                                                    e.preventDefault();
                                                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                                                    handleDragOver(e, task.id);
                                                },
                                                onDrop: (e) => {
                                                    e.preventDefault();
                                                    handleDrop(e, task.id);
                                                },
                                                onDragEnd: handleDragEnd
                                            }}
                                        />
                                    );
                                })}
                            </AnimatePresence>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrioritySection;
