import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import TaskItem from './TaskItem';

const ProjectColumn = ({
    project,
    tasks,
    projects,
    onComplete,
    onEdit,
    onUpdate,
    onQuickAdd,
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
    const projectTasks = tasks.filter(t => 
        (t.projectId || 'general').toLowerCase() === project.id.toLowerCase() ||
        (t.projectId || 'general').toLowerCase() === project.name.toLowerCase()
    );

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = (e) => {
        if (e) e.stopPropagation();
        setIsCollapsed(prev => !prev);
    };

    const isDragOverSection = dragOverId === `project-${project.id}`;
    const shouldShowList = !isCollapsed || isDragOverSection;

    return (
        <div 
            style={{ 
                marginBottom: 'var(--section-margin, 16px)', 
                flex: '1 0 280px', 
                minWidth: '280px',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}
            onDragOver={(e) => handleDragOver(e, `project-${project.id}`)}
            onDrop={(e) => handleDrop(e, `project-${project.id}`)}
        >
            <div
                onClick={toggleCollapse}
                title={isCollapsed ? `Expand ${project.name}` : `Collapse ${project.name}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'var(--item-bg)',
                    border: '1px solid var(--border-color)',
                    transition: 'background-color 0.15s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: project.color || 'var(--accent-color)',
                        flexShrink: 0
                    }} />
                    <h3 style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        margin: 0,
                        color: 'var(--text-color)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {project.name}
                    </h3>
                    <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: 'rgba(0, 0, 0, 0.06)',
                        color: 'var(--muted-text)',
                        flexShrink: 0
                    }}>
                        {projectTasks.length}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)' }}>
                    {onQuickAdd && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onQuickAdd(project.id);
                            }}
                            title={`Add task to ${project.name}`}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'var(--muted-text)',
                                borderRadius: '4px'
                            }}
                        >
                            <Plus size={15} />
                        </button>
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
                            color: 'var(--muted-text)'
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
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
                            onDragOver={(e) => handleDragOver(e, `project-${project.id}`)}
                            onDrop={(e) => handleDrop(e, `project-${project.id}`)}
                            style={{ 
                                listStyle: 'none', 
                                margin: 0, 
                                minHeight: (isDragOverSection || projectTasks.length === 0) ? '80px' : 'auto',
                                border: isDragOverSection ? '2px dashed var(--accent-color)' : (projectTasks.length === 0 ? '1px dashed var(--border-color)' : '2px dashed transparent'),
                                borderRadius: '6px',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box',
                                padding: isDragOverSection ? '4px 0' : '0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}
                        >
                            {projectTasks.length === 0 && !isDragOverSection && (
                                <div style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: 'var(--muted-text)',
                                    fontSize: '0.8rem',
                                    fontStyle: 'italic'
                                }}>
                                    No tasks in {project.name}
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {projectTasks.map(task => {
                                    const proj = projects.find(p => 
                                        p.id.toLowerCase() === (task.projectId || 'general').toLowerCase() || 
                                        p.name.toLowerCase() === (task.projectId || 'general').toLowerCase()
                                    );
                                    return (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            projectColor={proj?.color}
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
                                                    e.stopPropagation();
                                                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                                                    handleDragOver(e, task.id);
                                                },
                                                onDrop: (e) => {
                                                    e.preventDefault();
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectColumn;
