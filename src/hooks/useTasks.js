import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_PROJECTS } from '../utils/constants';

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
            return { ...task, id };
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
                { id: 5, text: "💡 Drag and drop tasks to reorder them within each priority", priority: 3, isSample: true, projectId: 'general' },
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
    }, [tasks, archived, projects, counter, isLoaded]);

    const addTask = useCallback((text, priority, projectId = 'general', notes = '') => {
        if (!text.trim()) return;

        const newId = counter + 1;
        const newTask = {
            id: newId,
            text: text.trim(),
            priority,
            projectId: projectId || 'general',
            notes: (notes || '').trim(),
            isSample: false
        };

        setCounter(newId);
        setTasks(prev => [newTask, ...prev]);
        setTimestamp(Date.now());
    }, [counter]);

    const completeTask = useCallback((id) => {
        setTasks(prev => {
            const taskIndex = prev.findIndex(t => t.id === id);
            if (taskIndex === -1) return prev;

            const newTasks = [...prev];
            const [task] = newTasks.splice(taskIndex, 1);
            const completedTask = {
                ...task,
                completedAt: Date.now()
            };

            setArchived(arch => [completedTask, ...arch]);
            return newTasks;
        });
        setTimestamp(Date.now());
    }, []);

    const deleteArchivedTask = useCallback((id) => {
        setArchived(prev => prev.filter(t => t.id !== id));
        setTimestamp(Date.now());
    }, []);

    const restoreTask = useCallback((id, priority) => {
        setArchived(prev => {
            const taskIndex = prev.findIndex(t => t.id === id);
            if (taskIndex === -1) return prev;

            const newArchived = [...prev];
            const [task] = newArchived.splice(taskIndex, 1);
            const restoredTask = {
                ...task,
                priority
            };
            delete restoredTask.completedAt;

            setTasks(current => [restoredTask, ...current]);
            return newArchived;
        });
        setTimestamp(Date.now());
    }, []);

    const updateTask = useCallback((id, updates) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, ...updates, isSample: false } : task
        ));
        setTimestamp(Date.now());
    }, []);

    const reorderTasks = useCallback((draggedId, targetId) => {
        setTasks(prev => {
            const fromIndex = prev.findIndex(t => t.id === draggedId);
            if (fromIndex === -1) return prev;

            const newTasks = [...prev];
            const [movedTask] = newTasks.splice(fromIndex, 1);

            // Handle dropping directly onto a priority section header or background
            if (typeof targetId === 'string' && targetId.startsWith('priority-')) {
                const newPriority = parseInt(targetId.split('-')[1]);
                if ([1, 2, 3, 4].includes(newPriority)) {
                    movedTask.priority = newPriority;
                }
                const targetIdx = newTasks.findIndex(t => t.priority === movedTask.priority);
                if (targetIdx > -1) {
                    newTasks.splice(targetIdx, 0, movedTask);
                } else {
                    newTasks.unshift(movedTask);
                }
                return newTasks;
            }

            // Handle standard task-to-task sorting
            const toIndex = newTasks.findIndex(t => t.id === targetId);
            if (toIndex > -1) {
                const targetTask = newTasks[toIndex];
                // Update priority to match the target task's section
                movedTask.priority = targetTask.priority;
                newTasks.splice(toIndex, 0, movedTask);
                return newTasks;
            } else {
                // Fallback: put it back where it was
                newTasks.splice(fromIndex, 0, movedTask);
                return newTasks;
            }
        });
        setTimestamp(Date.now());
    }, []);

    const addProject = useCallback((name, color) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');
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
        // Reset tasks in this project to the target project (defaults to general)
        setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: targetProjectId } : t));
        setArchived(prev => prev.map(t => t.projectId === id ? { ...t, projectId: targetProjectId } : t));
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
        setCounter(sanitized.counter);
        if (data.timestamp) setTimestamp(data.timestamp);

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

    return {
        tasks,
        archived,
        projects,
        counter,
        timestamp,
        addTask,
        completeTask,
        deleteArchivedTask,
        restoreTask,
        updateTask,
        reorderTasks,
        addProject,
        updateProject,
        deleteProject,
        importData,
        bulkAddTasks,
        recoverFromShadow
    };
};
