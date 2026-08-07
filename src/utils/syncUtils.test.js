import { mergeSyncDatasets } from './syncUtils';

test('preserves restored tasks and removes them from archived during sync merge', () => {
    const localData = {
        tasks: [
            { id: 1, text: 'Buy Groceries', priority: 1, projectId: 'general', restoredAt: 1700000500000 }
        ],
        archived: [],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        counter: 1,
        timestamp: 1700000500000
    };

    const remoteData = {
        tasks: [],
        archived: [
            { id: 1, text: 'Buy Groceries', priority: 1, projectId: 'general', completedAt: 1700000000000 }
        ],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        counter: 1,
        timestamp: 1700000000000
    };

    const merged = mergeSyncDatasets(localData, remoteData);

    expect(merged.tasks).toHaveLength(1);
    expect(merged.tasks[0].text).toBe('Buy Groceries');
    expect(merged.archived).toHaveLength(0);
});

test('filters out deleted projects during 2-way sync merge', () => {
    const localData = {
        tasks: [],
        archived: [],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        deletedProjects: ['work'],
        counter: 0,
        timestamp: 1700000500000
    };

    const remoteData = {
        tasks: [],
        archived: [],
        projects: [
            { id: 'general', name: 'General', color: '#285a82' },
            { id: 'work', name: 'Work', color: '#10b981' }
        ],
        deletedProjects: [],
        counter: 0,
        timestamp: 1700000000000
    };

    const merged = mergeSyncDatasets(localData, remoteData);

    expect(merged.projects.some(p => p.id === 'work')).toBe(false);
    expect(merged.deletedProjects).toContain('work');
});

test('filters out deleted archived tasks during 2-way sync merge', () => {
    const localData = {
        tasks: [],
        archived: [],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        deletedTaskKeys: ['id_101'],
        counter: 101,
        timestamp: 1700000500000
    };

    const remoteData = {
        tasks: [],
        archived: [
            { id: 101, text: 'Fix navigation bar bug', priority: 1, projectId: 'general', completedAt: 1700000000000 }
        ],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        deletedTaskKeys: [],
        counter: 101,
        timestamp: 1700000000000
    };

    const merged = mergeSyncDatasets(localData, remoteData);

    expect(merged.archived).toHaveLength(0);
    expect(merged.deletedTaskKeys).toContain('id_101');
});

test('preserves user reordered task sequence when local timestamp is newer', () => {
    const localData = {
        tasks: [
            { id: 2, text: 'Task B', priority: 1, projectId: 'general' },
            { id: 1, text: 'Task A', priority: 1, projectId: 'general' }
        ],
        archived: [],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        counter: 2,
        timestamp: 1700000500000
    };

    const remoteData = {
        tasks: [
            { id: 1, text: 'Task A', priority: 1, projectId: 'general' },
            { id: 2, text: 'Task B', priority: 1, projectId: 'general' }
        ],
        archived: [],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        counter: 2,
        timestamp: 1700000000000
    };

    const merged = mergeSyncDatasets(localData, remoteData);

    expect(merged.tasks[0].id).toBe(2);
    expect(merged.tasks[1].id).toBe(1);
});

test('keeps task in archived when local task is completed and remote still contains active task', () => {
    const localData = {
        tasks: [],
        archived: [
            { id: 5, text: 'Clean Office', priority: 2, projectId: 'general', completedAt: 1700000500000, updatedAt: 1700000500000 }
        ],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        counter: 5,
        timestamp: 1700000500000
    };

    const remoteData = {
        tasks: [
            { id: 5, text: 'Clean Office', priority: 2, projectId: 'general', updatedAt: 1700000100000 }
        ],
        archived: [],
        projects: [{ id: 'general', name: 'General', color: '#285a82' }],
        counter: 5,
        timestamp: 1700000100000
    };

    const merged = mergeSyncDatasets(localData, remoteData);

    expect(merged.tasks).toHaveLength(0);
    expect(merged.archived).toHaveLength(1);
    expect(merged.archived[0].id).toBe(5);
});



