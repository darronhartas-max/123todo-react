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

