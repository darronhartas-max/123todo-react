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
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
}) => {
    const config = PRIORITIES[priority];
    const sectionTasks = tasks.filter(t => t.priority === priority);

    if (sectionTasks.length === 0 && priority === 4) return null; // Hide On Hold if empty

    return (
        <div style={{ marginBottom: '16px' }}>
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
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <AnimatePresence mode="popLayout">
                    {sectionTasks.map(task => {
                        const project = projects.find(p => p.id === task.projectId);
                        return (
                            <TaskItem
                                key={task.id}
                                task={task}
                                projectColor={project?.color}
                                onComplete={onComplete}
                                onEdit={onEdit}
                                dragHandlers={{
                                    onDragStart: (e) => handleDragStart(e, task.id),
                                    onDragOver: handleDragOver,
                                    onDrop: (e) => handleDrop(e, task.id),
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
