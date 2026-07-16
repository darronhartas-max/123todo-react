import React from 'react';
import { AnimatePresence } from 'framer-motion';
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
    dragOverId
}) => {
    const config = PRIORITIES[priority];
    const sectionTasks = tasks.filter(t => t.priority === priority);

    if (sectionTasks.length === 0 && priority === 4) return null; // Hide On Hold if empty

    return (
        <div 
            style={{ marginBottom: 'var(--section-margin, 16px)', flex: 1, minWidth: 0 }}
            onDragOver={(e) => handleDragOver(e, `priority-${priority}`)}
            onDrop={(e) => handleDrop(e, `priority-${priority}`)}
        >
            <h3 style={{
                fontSize: '0.85rem',
                fontWeight: '800',
                marginTop: '12px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: config.color,
                textAlign: 'left'
            }}>
                {config.label}
            </h3>
            <ul 
                style={{ 
                    listStyle: 'none', 
                    margin: 0, 
                    minHeight: (dragOverId === `priority-${priority}` || sectionTasks.length === 0) ? '60px' : 'auto',
                    border: dragOverId === `priority-${priority}` ? '2px dashed var(--accent-color)' : '2px dashed transparent',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    padding: dragOverId === `priority-${priority}` ? '4px 0' : '0'
                }}
            >
                <AnimatePresence mode="popLayout">
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
                                isDragging={draggedId === task.id}
                                isDragOver={dragOverId === task.id}
                                dragHandlers={{
                                    onDragStart: (e) => handleDragStart(e, task.id),
                                    onDragOver: (e) => {
                                        e.stopPropagation();
                                        handleDragOver(e, task.id);
                                    },
                                    onDrop: (e) => {
                                        e.stopPropagation();
                                        handleDrop(e, task.id);
                                    },
                                    onDragEnd: handleDragEnd
                                }}
                            />
                        );
                    })}
                </AnimatePresence>
            </ul>
        </div>
    );
};

export default PrioritySection;
