import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_PROJECTS } from '../utils/constants';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [archived, setArchived] = useState([]);
    const [projects, setProjects] = useState([]);
    const [counter, setCounter] = useState(0);

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
            const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
            const savedCounter = localStorage.getItem(STORAGE_KEYS.COUNTER);

            if (savedTasks) {
                const parsed = JSON.parse(savedTasks);
                // MIGRATION: Ensure every task has a projectId
                setTasks(parsed.map(t => ({ ...t, projectId: t.projectId || 'general' })));
            }

            if (savedArchived) {
                const parsed = JSON.parse(savedArchived);
                // MIGRATION: Ensure every archived task has a projectId
                setArchived(parsed.map(t => ({ ...t, projectId: t.projectId || 'general' })));
            }

            if (savedProjects) {
                let parsed = JSON.parse(savedProjects);
                // Ensure 'all' is excluded from storage state
                parsed = parsed.filter(p => p.id !== 'all');
                setProjects(parsed);
            } else {
                setProjects(DEFAULT_PROJECTS.filter(p => p.id !== 'all'));
            }

            if (savedCounter) setCounter(parseInt(savedCounter));

            // Add sample tasks if new user
            if (!savedTasks && !savedArchived) {
                initializeSampleTasks();
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            initializeSampleTasks();
            setProjects(DEFAULT_PROJECTS.filter(p => p.id !== 'all'));
        }
    }, [initializeSampleTasks]);

    // Save data to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(archived));
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        localStorage.setItem(STORAGE_KEYS.COUNTER, counter.toString());

        // SHADOW BACKUP STRATEGY: 
        // Automatically create an internal snapshot every 24 hours
        // This acts as a 'last known good state' internal to the browser.
        const lastShadow = localStorage.getItem(STORAGE_KEYS.LAST_SHADOW_TIME);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

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
    }, [tasks, archived, projects, counter]);

    const addTask = useCallback((text, priority, projectId = 'general', notes = '') => {
        if (!text.trim()) return;

        setCounter(prevCounter => {
            const newId = prevCounter + 1;
            const newTask = {
                id: newId,
                text: text.trim(),
                priority,
                projectId: projectId || 'general',
                notes: (notes || '').trim(),
                isSample: false
            };

            setTasks(prev => [newTask, ...prev]);
            return newId;
        });
    }, []);

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
    }, []);

    const deleteArchivedTask = useCallback((id) => {
        setArchived(prev => prev.filter(t => t.id !== id));
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
    }, []);

    const updateTask = useCallback((id, updates) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, ...updates, isSample: false } : task
        ));
    }, []);

    const reorderTasks = useCallback((draggedId, targetId) => {
        setTasks(prev => {
            const fromIndex = prev.findIndex(t => t.id === draggedId);
            const toIndex = prev.findIndex(t => t.id === targetId);

            if (fromIndex > -1 && toIndex > -1) {
                const newTasks = [...prev];
                const [movedTask] = newTasks.splice(fromIndex, 1);
                newTasks.splice(toIndex, 0, movedTask);
                return newTasks;
            }
            return prev;
        });
    }, []);

    const addProject = useCallback((name, color) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        if (projects.some(p => p.id === id)) return;

        const newProject = { id, name, color };
        setProjects(prev => [...prev, newProject]);
        return id;
    }, [projects]);

    const updateProject = useCallback((id, updates) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const deleteProject = useCallback((id, targetProjectId = 'general') => {
        if (id === 'all') return; // Only 'all' is protected now
        setProjects(prev => prev.filter(p => p.id !== id));
        // Reset tasks in this project to the target project (defaults to general)
        setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: targetProjectId } : t));
        setArchived(prev => prev.map(t => t.projectId === id ? { ...t, projectId: targetProjectId } : t));
    }, []);

    const importData = useCallback((data) => {
        setTasks(data.tasks || []);
        setArchived(data.archived || []);
        setProjects(data.projects || DEFAULT_PROJECTS.filter(p => p.id !== 'all'));
        setCounter(data.counter || 0);

        // Also update shadow backup upon successful manual import
        try {
            const now = Date.now();
            const snapshot = {
                tasks: data.tasks || [],
                archived: data.archived || [],
                projects: data.projects || [],
                counter: data.counter || 0,
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

        setCounter(prevCounter => {
            let currentId = prevCounter;
            const tasksWithIds = tasksToAdd.map(t => {
                currentId++;
                return {
                    ...t,
                    id: currentId,
                    isSample: false
                };
            });

            setTasks(prev => [...tasksWithIds, ...prev]);
            return currentId;
        });
    }, []);

    return {
        tasks,
        archived,
        projects,
        counter,
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
