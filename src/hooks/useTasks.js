import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_PROJECTS } from '../utils/constants';
import { calculateNextRecurrenceDate, getTodayDateString } from '../utils/dateUtils';

// Sanitizes task lists to resolve any duplicate task IDs or missing IDs,
// ensuring every task has a unique integer ID and the counter is correct.
const sanitizeTaskIds = (tasksList, archivedList, startCounter) => {
    const usedIds = new Set();
    let maxId = startCounter;

    // Find the maximum ID used in either list to ensure auto-generated IDs do not collide
    const findMaxId = (list) => {
        (list || []).forEach(t => {
            if (t && typeof t.id === 'number' && t.id > maxId) {
                maxId = t.id;
            }
        });
    };
    findMaxId(tasksList);
    findMaxId(archivedList);

    let currentCounter = maxId;

    const sanitizeList = (list) => {
        return (list || []).map(task => {
            if (!task) return null;
            let id = task.id;
            if (id === undefined || id === null || usedIds.has(id)) {
                currentCounter++;
                id = currentCounter;
            } else {
                usedIds.add(id);
            }
            return {
                ...task,
                id,
                projectId: task.projectId || task.categoryId || 'general',
                scheduledDate: task.scheduledDate || null,
                deferCount: task.deferCount || 0,
                subtasks: task.subtasks || [],
                isRecurring: task.isRecurring || false,
                recurrence: task.recurrence || null
            };
        }).filter(Boolean);
    };

    const sanitizedTasks = sanitizeList(tasksList);
    const sanitizedArchived = sanitizeList(archivedList);

    return {
        tasks: sanitizedTasks,
        archived: sanitizedArchived,
        counter: currentCounter
    };
};

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [archived, setArchived] = useState([]);
    const [projects, setProjects] = useState([]);
    const [deletedProjects, setDeletedProjects] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.DELETED_PROJECTS);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [deletedTaskKeys, setDeletedTaskKeys] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.DELETED_TASKS);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [counter, setCounter] = useState(0);
    const [timestamp, setTimestamp] = useState(Date.now());
    const [isLoaded, setIsLoaded] = useState(false);

    const initializeSampleTasks = useCallback(() => {
        const userDataKeys = Object.keys(localStorage).filter(key =>
            key.startsWith('123Todo') &&
            !key.includes('Milestones') &&
            !key.includes('InstallDismissed') &&
            !key.includes('LastInstallPrompt')
        );

        if (userDataKeys.length === 0) {
            const sampleTasks = [
                { id: 1, text: "🎯 Complete this task to mark it as done! (Tap the ✓ button)", priority: 1, isSample: true, projectId: 'general' },
                { id: 2, text: "📝 Click on any task to edit its text and priority level", priority: 1, isSample: true, projectId: 'general' },
                { id: 3, text: "📝 Try the + button to add your own tasks", priority: 2, isSample: true, projectId: 'general' },
                { id: 4, text: "🏆 Complete 5 tasks to unlock your first achievement!", priority: 2, isSample: true, projectId: 'general' },
                { id: 5, text: "💡 Drag and drop tasks to reorder them or move them between priorities", priority: 3, isSample: true, projectId: 'general' },
                { id: 6, text: "📱 Install this app on your home screen for quick access", priority: 3, isSample: true, projectId: 'general' },
                { id: 7, text: "📊 Check the Archive section to see completed tasks", priority: 3, isSample: true, projectId: 'general' }
            ];
            setTasks(sampleTasks);
            setCounter(7);
        }
    }, []);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
            const savedArchived = localStorage.getItem(STORAGE_KEYS.ARCHIVE);
            let savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
            const savedCounter = localStorage.getItem(STORAGE_KEYS.COUNTER);

            // Legacy migration: support reading from 123TodoCategories if 123TodoProjects doesn't exist yet
            if (!savedProjects) {
                const legacyCategories = localStorage.getItem('123TodoCategories');
                if (legacyCategories) {
                    savedProjects = legacyCategories;
                    localStorage.setItem(STORAGE_KEYS.PROJECTS, legacyCategories);
                    localStorage.removeItem('123TodoCategories');
                    console.log('🔄 Migrated legacy categories to projects in LocalStorage');
                }
            }

            let loadedTasks = [];
            if (savedTasks) {
                const parsed = JSON.parse(savedTasks);
                // MIGRATION: Ensure every task has a projectId, support fallback from legacy categoryId
                loadedTasks = parsed.map(t => ({ ...t, projectId: t.projectId || t.categoryId || 'general' }));
            }

            let loadedArchived = [];
            if (savedArchived) {
                const parsed = JSON.parse(savedArchived);
                // MIGRATION: Ensure every archived task has a projectId, support fallback from legacy categoryId
                loadedArchived = parsed.map(t => ({ ...t, projectId: t.projectId || t.categoryId || 'general' }));
            }

            if (savedProjects) {
                let parsed = JSON.parse(savedProjects);
                // Ensure 'all' is excluded from storage state
                parsed = parsed.filter(p => p.id !== 'all');
                
                // MIGRATION: Ensure General project exists dynamically so it can be edited/renamed by user
                if (!parsed.some(p => p.id === 'general')) {
                    parsed.unshift({ id: 'general', name: 'General', color: '#285a82' });
                }
                setProjects(parsed);
            } else {
                setProjects([{ id: 'general', name: 'General', color: '#285a82' }]);
            }

            let startCounter = 0;
            if (savedCounter) startCounter = parseInt(savedCounter, 10);
            
            const savedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
            if (savedTimestamp) setTimestamp(parseInt(savedTimestamp));

            // Sanitize loaded tasks and assign unique IDs to resolve collisions
            const sanitized = sanitizeTaskIds(loadedTasks, loadedArchived, startCounter);
            setTasks(sanitized.tasks);
            setArchived(sanitized.archived);
            setCounter(sanitized.counter);

            // Add sample tasks if new user
            if (!savedTasks && !savedArchived) {
                initializeSampleTasks();
            }
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            initializeSampleTasks();
            setProjects(DEFAULT_PROJECTS.filter(p => p.id !== 'all'));
            setIsLoaded(true);
        }
    }, [initializeSampleTasks]);

    // Save data to localStorage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(archived));
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        localStorage.setItem(STORAGE_KEYS.DELETED_PROJECTS, JSON.stringify(deletedProjects));
        localStorage.setItem(STORAGE_KEYS.DELETED_TASKS, JSON.stringify(deletedTaskKeys));
        localStorage.setItem(STORAGE_KEYS.COUNTER, counter.toString());
        localStorage.setItem(STORAGE_KEYS.TIMESTAMP, timestamp.toString());

        // SHADOW BACKUP STRATEGY: 
        // Automatically create an internal snapshot every 24 hours
        // This acts as a 'last known good state' internal to the browser.
        const lastShadow = localStorage.getItem(STORAGE_KEYS.LAST_SHADOW_TIME);
        const oneDay = 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (!lastShadow || (now - parseInt(lastShadow)) > oneDay) {
            const snapshot = {
                tasks,
                archived,
                projects,
                counter,
                timestamp: now
            };
            try {
                localStorage.setItem(STORAGE_KEYS.SHADOW_BACKUP, JSON.stringify(snapshot));
                localStorage.setItem(STORAGE_KEYS.LAST_SHADOW_TIME, now.toString());
                console.log('📦 Shadow backup created successfully.');
            } catch (err) {
                console.warn('⚠️ Could not save shadow backup (likely storage quota):', err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, archived, projects, deletedProjects, deletedTaskKeys, counter, timestamp, isLoaded]);

    const addTask = useCallback((text, priority, projectId = 'general', notes = '', extraFields = {}) => {
        const newId = counter + 1;
        const now = Date.now();
        const newTask = {
            id: newId,
            text: text.trim(),
            priority,
            projectId: projectId || 'general',
            notes: (notes || '').trim(),
            isSample: false,
            scheduledDate: extraFields.scheduledDate || null,
            deferCount: 0,
            subtasks: extraFields.subtasks || [],
            isRecurring: extraFields.isRecurring || false,
            recurrence: extraFields.recurrence || null,
            completedAt: null,
            updatedAt: now
        };

        setCounter(newId);
        setTasks(prev => [newTask, ...prev]);
        setTimestamp(now);
    }, [counter]);

    const completeTask = useCallback((id) => {
        const targetIdStr = String(id);
        const now = Date.now();

        setTasks(prevTasks => {
            const taskIndex = prevTasks.findIndex(t => String(t.id) === targetIdStr);
            if (taskIndex === -1) return prevTasks;

            const taskToComplete = prevTasks[taskIndex];
            const completedTask = {
                ...taskToComplete,
                isRecurring: false,
                recurrence: null,
                completedAt: now,
                updatedAt: now
            };

            setArchived(prevArchived => [
                completedTask,
                ...prevArchived.filter(a => String(a.id) !== targetIdStr)
            ]);

            const newTasks = [...prevTasks];
            newTasks.splice(taskIndex, 1);

            if (taskToComplete.isRecurring && taskToComplete.recurrence) {
                const baseDate = taskToComplete.scheduledDate || new Date().toISOString().split('T')[0];
                const nextDate = calculateNextRecurrenceDate(baseDate, taskToComplete.recurrence);

                if (nextDate) {
                    const resetSubtasks = (taskToComplete.subtasks || []).map(st => ({
                        ...st,
                        completed: false
                    }));

                    const spawnedTask = {
                        ...taskToComplete,
                        scheduledDate: nextDate,
                        deferCount: 0,
                        subtasks: resetSubtasks,
                        completedAt: null,
                        updatedAt: now
                    };

                    setCounter(curr => {
                        const newId = curr + 1;
                        spawnedTask.id = newId;
                        return newId;
                    });
                    newTasks.unshift(spawnedTask);
                }
            }

            return newTasks;
        });

        setTimestamp(now);
    }, []);

    const deleteArchivedTask = useCallback((id) => {
        setArchived(prevArchived => {
            const taskToDelete = prevArchived.find(t => String(t.id) === String(id));
            if (taskToDelete) {
                const keysToAdd = [`id_${id}`];
                const cleanText = (taskToDelete.text || '').trim().toLowerCase();
                const projId = taskToDelete.projectId || taskToDelete.categoryId || 'general';
                if (cleanText) keysToAdd.push(`${cleanText}::${projId}`);
                setDeletedTaskKeys(prev => Array.from(new Set([...prev, ...keysToAdd])));
            } else {
                setDeletedTaskKeys(prev => Array.from(new Set([...prev, `id_${id}`])));
            }
            return prevArchived.filter(t => String(t.id) !== String(id));
        });
        setTasks(prevTasks => prevTasks.filter(t => String(t.id) !== String(id)));
        setTimestamp(Date.now());
    }, []);

    const restoreTask = useCallback((id, priority) => {
        setArchived(prev => {
            const taskIndex = prev.findIndex(t => String(t.id) === String(id));
            if (taskIndex === -1) return prev;

            const newArchived = [...prev];
            const [task] = newArchived.splice(taskIndex, 1);
            const now = Date.now();
            const restoredTask = {
                ...task,
                priority: (priority !== undefined && [1, 2, 3, 4].includes(priority)) ? priority : (task.priority || 1),
                restoredAt: now,
                updatedAt: now
            };
            delete restoredTask.completedAt;

            setDeletedTaskKeys(prev => prev.filter(k => k !== `id_${id}`));
            setTasks(current => [restoredTask, ...current]);
            return newArchived;
        });
        setTimestamp(Date.now());
    }, []);

    const updateTask = useCallback((id, updates) => {
        const today = getTodayDateString();
        const now = Date.now();
        setTasks(prev => prev.map(task => {
            if (String(task.id) === String(id)) {
                const finalUpdates = { ...updates };
                const oldIsActive = !task.scheduledDate || task.scheduledDate <= today;
                const newIsFuture = updates.scheduledDate && updates.scheduledDate > today;
                
                if (oldIsActive && newIsFuture) {
                    finalUpdates.deferCount = (task.deferCount || 0) + 1;
                }
                
                return { ...task, ...finalUpdates, updatedAt: now, isSample: false };
            }
            return task;
        }));
        setTimestamp(now);
    }, []);

    const reorderTasks = useCallback((draggedId, targetId) => {
        if (!draggedId || !targetId) return;
        const now = Date.now();
        setTasks(prev => {
            const dragStr = String(draggedId);
            const targetStr = String(targetId);

            const fromIndex = prev.findIndex(t => String(t.id) === dragStr);
            if (fromIndex === -1) return prev;

            // Handle dropping directly onto a priority section header or background (e.g. priority-1)
            if (targetStr.startsWith('priority-')) {
                const newPriority = parseInt(targetStr.split('-')[1], 10);
                if (![1, 2, 3, 4].includes(newPriority)) return prev;

                const newTasks = [...prev];
                const [movedTask] = newTasks.splice(fromIndex, 1);
                movedTask.priority = newPriority;
                movedTask.updatedAt = now;

                // Append at the bottom of the target priority section for natural dropping
                let lastPriorityIdx = -1;
                for (let i = newTasks.length - 1; i >= 0; i--) {
                    if (newTasks[i].priority === newPriority) {
                        lastPriorityIdx = i;
                        break;
                    }
                }

                if (lastPriorityIdx > -1) {
                    newTasks.splice(lastPriorityIdx + 1, 0, movedTask);
                } else {
                    let insertIdx = newTasks.findIndex(t => t.priority > newPriority);
                    if (insertIdx === -1) insertIdx = newTasks.length;
                    newTasks.splice(insertIdx, 0, movedTask);
                }
                return newTasks;
            }

            // Handle dropping directly onto a project section header or container (e.g. project-work)
            if (targetStr.startsWith('project-')) {
                const targetProjId = targetStr.replace('project-', '');
                if (!targetProjId) return prev;

                const newTasks = [...prev];
                const [movedTask] = newTasks.splice(fromIndex, 1);
                movedTask.projectId = targetProjId;
                movedTask.updatedAt = now;

                let lastProjIdx = -1;
                for (let i = newTasks.length - 1; i >= 0; i--) {
                    if ((newTasks[i].projectId || 'general').toLowerCase() === targetProjId.toLowerCase()) {
                        lastProjIdx = i;
                        break;
                    }
                }

                if (lastProjIdx > -1) {
                    newTasks.splice(lastProjIdx + 1, 0, movedTask);
                } else {
                    newTasks.push(movedTask);
                }
                return newTasks;
            }

            // Handle standard task-to-task reordering
            const targetIndex = prev.findIndex(t => String(t.id) === targetStr);
            if (targetIndex === -1 || fromIndex === targetIndex) return prev;

            const targetTask = prev[targetIndex];
            const newTasks = [...prev];
            const [movedTask] = newTasks.splice(fromIndex, 1);
            movedTask.priority = targetTask.priority;
            movedTask.updatedAt = now;

            const newTargetIndex = newTasks.findIndex(t => String(t.id) === targetStr);
            if (newTargetIndex === -1) {
                newTasks.splice(fromIndex, 0, movedTask);
                return newTasks;
            }

            // Always insert at newTargetIndex (before target task), aligning precisely with the top drop indicator line
            newTasks.splice(newTargetIndex, 0, movedTask);
            return newTasks;
        });
        setTimestamp(now);
    }, []);

    const addProject = useCallback((name, color) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        setDeletedProjects(prev => prev.filter(dpId => dpId !== id));
        if (projects.some(p => p.id === id)) return id;

        const newProject = { id, name, color };
        setProjects(prev => [...prev, newProject]);
        setTimestamp(Date.now());
        return id;
    }, [projects]);

    const updateProject = useCallback((id, updates) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        setTimestamp(Date.now());
    }, []);

    const deleteProject = useCallback((id, targetProjectId = 'general') => {
        if (id === 'all') return; // Only 'all' is protected now
        setProjects(prev => prev.filter(p => p.id !== id));
        setDeletedProjects(prev => Array.from(new Set([...prev, id])));
        // Reset tasks in this project to the target project (defaults to general)
        setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: targetProjectId } : t));
        setArchived(prev => prev.map(t => t.projectId === id ? { ...t, projectId: targetProjectId } : t));
        setTimestamp(Date.now());
    }, []);

    const moveProject = useCallback((id, direction) => {
        setProjects(prev => {
            const index = prev.findIndex(p => p.id === id);
            if (index === -1) return prev;
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;

            const updated = [...prev];
            const [moved] = updated.splice(index, 1);
            updated.splice(targetIndex, 0, moved);
            return updated;
        });
        setTimestamp(Date.now());
    }, []);

    const reorderProjects = useCallback((reorderedList) => {
        setProjects(reorderedList);
        setTimestamp(Date.now());
    }, []);

    const importData = useCallback((data) => {
        // Map tasks and fallback legacy categoryId to projectId
        const mappedTasks = (data.tasks || []).map(t => ({ ...t, projectId: t.projectId || t.categoryId || 'general' }));
        const mappedArchived = (data.archived || []).map(t => ({ ...t, projectId: t.projectId || t.categoryId || 'general' }));
        let mappedProjects = data.projects || data.categories || [{ id: 'general', name: 'General', color: '#285a82' }];
        
        // MIGRATION: Ensure General project exists dynamically in imported projects
        if (!mappedProjects.some(p => p.id === 'general')) {
            mappedProjects.unshift({ id: 'general', name: 'General', color: '#285a82' });
        }

        // Sanitize imported tasks to resolve duplicate ID collisions
        const sanitized = sanitizeTaskIds(mappedTasks, mappedArchived, data.counter || 0);

        setTasks(sanitized.tasks);
        setArchived(sanitized.archived);
        setProjects(mappedProjects);
        if (Array.isArray(data.deletedProjects)) {
            setDeletedProjects(data.deletedProjects);
        }
        if (Array.isArray(data.deletedTaskKeys)) {
            setDeletedTaskKeys(data.deletedTaskKeys);
        }
        setCounter(sanitized.counter);
        if (data.timestamp) setTimestamp(data.timestamp);

        if (data.dateFormat) {
            try {
                localStorage.setItem(STORAGE_KEYS.DATE_FORMAT, data.dateFormat);
            } catch (e) {}
        }
        if (data.taskLengthLimit) {
            try {
                localStorage.setItem(STORAGE_KEYS.TASK_LENGTH_LIMIT, data.taskLengthLimit);
            } catch (e) {}
        }

        if (data.adminPasswordHash) {
            try {
                localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH || '123TodoAdminPassHash', data.adminPasswordHash);
            } catch (e) {}
        }

        // Also update shadow backup upon successful manual import
        try {
            const now = Date.now();
            const snapshot = {
                tasks: sanitized.tasks,
                archived: sanitized.archived,
                projects: mappedProjects,
                counter: sanitized.counter,
                timestamp: now
            };
            localStorage.setItem(STORAGE_KEYS.SHADOW_BACKUP, JSON.stringify(snapshot));
            localStorage.setItem(STORAGE_KEYS.LAST_SHADOW_TIME, now.toString());
        } catch (e) {
            console.error('Shadow update on import failed:', e);
        }
    }, []);

    const recoverFromShadow = useCallback(() => {
        const shadowRaw = localStorage.getItem(STORAGE_KEYS.SHADOW_BACKUP);
        if (!shadowRaw) return false;
        try {
            const data = JSON.parse(shadowRaw);
            importData(data);
            return true;
        } catch (e) {
            console.error('Failed to recover from shadow backup:', e);
            return false;
        }
    }, [importData]);

    const bulkAddTasks = useCallback((tasksToAdd) => {
        if (tasksToAdd.length === 0) return;

        let currentId = counter;
        const tasksWithIds = tasksToAdd.map(t => {
            currentId++;
            return {
                ...t,
                id: currentId,
                isSample: false
            };
        });

        setCounter(currentId);
        setTasks(prev => [...tasksWithIds, ...prev]);
        setTimestamp(Date.now());
    }, [counter]);

    const addNote = useCallback((text, notes = '', projectId = 'general') => {
        const newId = counter + 1;
        const now = Date.now();
        let finalTitle = (text || '').trim();
        let finalNotes = (notes || '').trim();

        if (!finalTitle && finalNotes) {
            finalTitle = finalNotes;
            finalNotes = '';
        }
        if (!finalTitle) finalTitle = 'Untitled Task';

        const newNote = {
            id: newId,
            text: finalTitle,
            priority: 1, // Auto set to Must Do (Priority 1)
            projectId: projectId || 'general',
            notes: finalNotes,
            isSample: false,
            scheduledDate: null,
            deferCount: 0,
            subtasks: [],
            isRecurring: false,
            recurrence: null,
            completedAt: null,
            createdAt: now,
            updatedAt: now
        };

        setCounter(newId);
        setTasks(prev => [newNote, ...prev]);
        setTimestamp(now);
        return newId;
    }, [counter]);

    const convertNoteToTask = useCallback((id, priority = 1, scheduledDate = null, projectId = null) => {
        const now = Date.now();
        setTasks(prev => prev.map(task => {
            if (String(task.id) === String(id)) {
                return {
                    ...task,
                    priority: priority || 1,
                    scheduledDate: scheduledDate !== undefined ? scheduledDate : task.scheduledDate,
                    projectId: projectId || task.projectId || 'general',
                    updatedAt: now
                };
            }
            return task;
        }));
        setTimestamp(now);
    }, []);

    const bulkAssignProject = useCallback((taskIds, targetProjectId) => {
        if (!taskIds || taskIds.length === 0 || !targetProjectId) return;
        const idStrs = new Set(taskIds.map(id => String(id)));
        const now = Date.now();
        setTasks(prev => prev.map(task => {
            if (idStrs.has(String(task.id))) {
                return {
                    ...task,
                    projectId: targetProjectId,
                    updatedAt: now
                };
            }
            return task;
        }));
        setTimestamp(now);
    }, []);

    return {
        tasks,
        archived,
        projects,
        deletedProjects,
        deletedTaskKeys,
        counter,
        timestamp,
        addTask,
        addNote,
        convertNoteToTask,
        bulkAssignProject,
        completeTask,
        deleteArchivedTask,
        restoreTask,
        updateTask,
        reorderTasks,
        addProject,
        updateProject,
        deleteProject,
        moveProject,
        reorderProjects,
        importData,
        bulkAddTasks,
        recoverFromShadow
    };
};
