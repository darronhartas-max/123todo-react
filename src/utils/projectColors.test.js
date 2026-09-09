import {
    PROJECT_COLORS,
    PROJECT_COLOR_MIGRATION,
    migrateProjectColor,
    PRIORITIES
} from './constants';
import { mergeSyncDatasets } from './syncUtils';
import { renderHook } from '@testing-library/react';
import { useTasks } from '../hooks/useTasks';

describe('Project Colors Palette and Migration', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('PROJECT_COLORS has exactly 20 colors', () => {
        expect(PROJECT_COLORS).toHaveLength(20);
    });

    test('PROJECT_COLORS has no duplicate entries', () => {
        const unique = new Set(PROJECT_COLORS.map(c => c.toLowerCase()));
        expect(unique.size).toBe(20);
    });

    test('None of the 20 PROJECT_COLORS match any of the 4 master priority colors', () => {
        const masterPriorityColors = Object.values(PRIORITIES).map(p => p.color.toLowerCase());
        expect(masterPriorityColors).toEqual(['#dc2626', '#f59e0b', '#6b7280', '#9333ea']);

        PROJECT_COLORS.forEach(color => {
            expect(masterPriorityColors).not.toContain(color.toLowerCase());
        });
    });

    test('PROJECT_COLORS are valid hex colors and ordered in continuous spectrum order', () => {
        const hexRegex = /^#[0-9a-f]{6}$/i;
        PROJECT_COLORS.forEach(c => {
            expect(c).toMatch(hexRegex);
        });

        // 2 lines of 10
        const line1 = PROJECT_COLORS.slice(0, 10);
        const line2 = PROJECT_COLORS.slice(10, 20);

        expect(line1).toHaveLength(10);
        expect(line2).toHaveLength(10);

        // Line 1 should start with red/warm and end with teal
        expect(line1[0]).toBe('#b91c1c'); // Crimson
        expect(line1[9]).toBe('#14b8a6'); // Teal Green

        // Line 2 should continue with cyan and finish with pink/rose
        expect(line2[0]).toBe('#06b6d4'); // Bright Cyan
        expect(line2[9]).toBe('#f43f5e'); // Ruby Rose
    });

    test('migrateProjectColor translates old or conflicting colors correctly', () => {
        // Old Amber (was P2)
        expect(migrateProjectColor('#f59e0b')).toBe('#d97706');
        expect(migrateProjectColor('#F59E0B')).toBe('#d97706');

        // Old Slate Gray (removed)
        expect(migrateProjectColor('#78716c')).toBe('#285a82');
        expect(migrateProjectColor('#78716C')).toBe('#285a82');

        // Master priority colors if previously assigned to a project
        expect(migrateProjectColor('#dc2626')).toBe('#b91c1c'); // P1 -> Crimson
        expect(migrateProjectColor('#6b7280')).toBe('#285a82'); // P3 -> Ocean Blue
        expect(migrateProjectColor('#9333ea')).toBe('#a855f7'); // P4 -> Amethyst

        // Safe existing colors in palette are unaffected
        expect(migrateProjectColor('#285a82')).toBe('#285a82');
        expect(migrateProjectColor('#10b981')).toBe('#10b981');
        expect(migrateProjectColor('#06b6d4')).toBe('#06b6d4');
        expect(migrateProjectColor('#3b82f6')).toBe('#3b82f6');

        // Handles falsy or non-string input safely
        expect(migrateProjectColor(null)).toBe(null);
        expect(migrateProjectColor(undefined)).toBe(undefined);
        expect(migrateProjectColor('')).toBe('');
    });

    test('useTasks automatically migrates project colors on load from localStorage', () => {
        const storedProjects = [
            { id: 'work', name: 'Work', color: '#f59e0b' }, // Old amber
            { id: 'personal', name: 'Personal', color: '#78716c' }, // Old slate gray
            { id: 'hobby', name: 'Hobby', color: '#10b981' } // Untouched emerald
        ];
        localStorage.setItem('123TodoProjects', JSON.stringify(storedProjects));

        const { result } = renderHook(() => useTasks());

        const workProj = result.current.projects.find(p => p.id === 'work');
        const personalProj = result.current.projects.find(p => p.id === 'personal');
        const hobbyProj = result.current.projects.find(p => p.id === 'hobby');

        expect(workProj.color).toBe('#d97706');
        expect(personalProj.color).toBe('#285a82');
        expect(hobbyProj.color).toBe('#10b981');
    });

    test('mergeSyncDatasets migrates project colors during 2-way sync merge', () => {
        const localData = {
            timestamp: 1000,
            projects: [
                { id: 'proj1', name: 'Project 1', color: '#f59e0b' }
            ]
        };
        const remoteData = {
            timestamp: 2000,
            projects: [
                { id: 'proj2', name: 'Project 2', color: '#78716c' },
                { id: 'proj3', name: 'Project 3', color: '#9333ea' }
            ]
        };

        const merged = mergeSyncDatasets(localData, remoteData);
        const p1 = merged.projects.find(p => p.id === 'proj1');
        const p2 = merged.projects.find(p => p.id === 'proj2');
        const p3 = merged.projects.find(p => p.id === 'proj3');

        expect(p1.color).toBe('#d97706');
        expect(p2.color).toBe('#285a82');
        expect(p3.color).toBe('#a855f7');
    });
});
