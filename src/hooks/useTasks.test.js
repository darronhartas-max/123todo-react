import { renderHook, act } from '@testing-library/react';
import { useTasks } from './useTasks';

describe('useTasks - reorderTasks drag and drop', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('reorders tasks within the same priority section when dragged down', () => {
        const initialTasks = [
            { id: 1, text: 'Task 1', priority: 1, projectId: 'general' },
            { id: 2, text: 'Task 2', priority: 1, projectId: 'general' },
            { id: 3, text: 'Task 3', priority: 1, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        // Drag Task 1 down onto Task 2 -> Task 1 should end up after Task 2
        act(() => {
            result.current.reorderTasks(1, 2);
        });

        expect(result.current.tasks.map(t => t.id)).toEqual([2, 1, 3]);
    });

    test('reorders tasks within the same priority section when dragged up', () => {
        const initialTasks = [
            { id: 1, text: 'Task 1', priority: 1, projectId: 'general' },
            { id: 2, text: 'Task 2', priority: 1, projectId: 'general' },
            { id: 3, text: 'Task 3', priority: 1, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        // Drag Task 3 up onto Task 1 -> Task 3 should end up before Task 1
        act(() => {
            result.current.reorderTasks(3, 1);
        });

        expect(result.current.tasks.map(t => t.id)).toEqual([3, 1, 2]);
    });

    test('changes priority when dragging task onto a different priority container', () => {
        const initialTasks = [
            { id: 1, text: 'Task 1', priority: 1, projectId: 'general' },
            { id: 2, text: 'Task 2', priority: 2, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        // Drag Task 1 onto priority-2 container
        act(() => {
            result.current.reorderTasks(1, 'priority-2');
        });

        const moved = result.current.tasks.find(t => t.id === 1);
        expect(moved.priority).toBe(2);
    });

    test('adds new tasks at the top of the item list', () => {
        const initialTasks = [
            { id: 1, text: 'Existing Task 1', priority: 1, projectId: 'general' },
            { id: 2, text: 'Existing Task 2', priority: 1, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        act(() => {
            result.current.addTask('Brand New Top Task', 1, 'general');
        });

        expect(result.current.tasks[0].text).toBe('Brand New Top Task');
    });

    test('reorders On Hold (priority 4) tasks via drag and drop', () => {
        const initialTasks = [
            { id: 401, text: 'On Hold A', priority: 4, projectId: 'general' },
            { id: 402, text: 'On Hold B', priority: 4, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        // Drag On Hold B up onto On Hold A
        act(() => {
            result.current.reorderTasks(402, 401);
        });

        const onHoldTasks = result.current.tasks.filter(t => t.priority === 4);
        expect(onHoldTasks.map(t => t.id)).toEqual([402, 401]);
    });

    test('handles string and number ID mismatch gracefully during drag and drop', () => {
        const initialTasks = [
            { id: 10, text: 'Task A', priority: 1, projectId: 'general' },
            { id: 20, text: 'Task B', priority: 3, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        // Drag Task B (id 20) with string ID '20' onto Task A (id 10) with number ID 10
        act(() => {
            result.current.reorderTasks('20', 10);
        });

        const moved = result.current.tasks.find(t => String(t.id) === '20');
        expect(moved.priority).toBe(1);
    });

    test('updates task details and handles string ID mismatch gracefully', () => {
        const initialTasks = [
            { id: 1, text: 'Old Task Title', priority: 1, projectId: 'general', notes: 'Old Notes' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        act(() => {
            result.current.updateTask('1', { text: 'New Task Title', notes: 'Updated Notes', priority: 2 });
        });

        const updated = result.current.tasks.find(t => t.id === 1);
        expect(updated.text).toBe('New Task Title');
        expect(updated.notes).toBe('Updated Notes');
        expect(updated.priority).toBe(2);
        expect(updated.updatedAt).toBeDefined();

        // Verify localStorage persistence
        const saved = JSON.parse(localStorage.getItem('123TodoTasks'));
        expect(saved[0].text).toBe('New Task Title');
    });

    test('completes task and moves it to archived array', () => {
        const initialTasks = [
            { id: 1, text: 'Task to Complete', priority: 1, projectId: 'general' }
        ];
        localStorage.setItem('123TodoTasks', JSON.stringify(initialTasks));

        const { result } = renderHook(() => useTasks());

        act(() => {
            result.current.completeTask(1);
        });

        expect(result.current.tasks.length).toBe(0);
        expect(result.current.archived.length).toBe(1);
        expect(result.current.archived[0].text).toBe('Task to Complete');
        expect(result.current.archived[0].completedAt).toBeDefined();
    });

    test('addNote creates task with text in Task text field, empty notes, and priority 1 (Must Do)', () => {
        const { result } = renderHook(() => useTasks());

        act(() => {
            result.current.addNote('Buy fresh organic sourdough bread', '', 'general');
        });

        const createdTask = result.current.tasks[0];
        expect(createdTask.text).toBe('Buy fresh organic sourdough bread');
        expect(createdTask.notes).toBe('');
        expect(createdTask.priority).toBe(1); // Must Do
    });
});

